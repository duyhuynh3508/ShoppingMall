import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AdminRequest {
    @IsEmail({}, { message: 'Email invalid' })
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}
