import { Context, Next } from "koa";
import axios from "axios";

export default (config: any, { strapi }: { strapi: any }) => {
  return async (ctx: Context, next: Next) => {
    console.log("SSO Middleware is running...");

    const authHeader = ctx.request.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Missing or invalid credentials");
      return ctx.unauthorized("Missing or invalid credentials");
    }

    const token = authHeader.split(" ")[1];

    try {
      console.log("Validating token with SSO...");
      const response = await axios.get("http://localhost:3000/authn/validate-token", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("SSO Response:", response.data);

      if (!response.data.valid) {
        console.log("Token invalid:", token);
        return ctx.unauthorized("Invalid token");
      }

      const ssoUser = response.data.user;

      // Lấy role mặc định (Authenticated)
      const defaultRole = await strapi.query("plugin::users-permissions.role").findOne({
        where: { type: "authenticated" },
      });

      if (!defaultRole) {
        console.error("Role 'authenticated' not found");
        return ctx.internalServerError("Default role not found");
      }

      // Tìm user trong Strapi
      let user = await strapi.query("plugin::users-permissions.user").findOne({
        where: { email: ssoUser.email },
      });

      // Nếu user không tồn tại, tạo mới
      if (!user) {
        user = await strapi.query("plugin::users-permissions.user").create({
          data: {
            username: ssoUser.email.split("@")[0],
            email: ssoUser.email,
            password: Math.random().toString(36).slice(-8),
            confirmed: true,
            blocked: false,
            role: defaultRole.id, // Gán role cho user
          },
        });
        console.log("User created:", user);
      }

      ctx.state.user = user; // Gán user cho Strapi
      console.log("User authenticated:", ctx.state.user);

      await next();
    } catch (error) {
      console.error("SSO Validation Error:", error.response?.data || error.message);
      return ctx.internalServerError("SSO validation failed");
    }
  };
};
