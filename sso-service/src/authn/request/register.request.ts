import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ValidPassword } from 'src/annotations/validate.password';

export class RegisterRequest {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @IsString()
    @ValidPassword()
    password: string;

    @IsNotEmpty()
    @IsString()
    firstName: string;

    @IsNotEmpty()
    @IsString()
    lastName: string;
}
