import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { IJwtPayload } from './interfases/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validates the user credentials.
   * @param email - The user's email.
   * @param pass - The user's password.
   * @returns The user object without the password if validation is successful.
   * @throws UnauthorizedException if the email or password is invalid.
   */
  async validate(email: string, pass: string): Promise<any> {
    // Find the user by email
    const user = await this.userService.findUserByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid email');

    // Compare the provided password with the stored hashed password
    const validPass = await bcrypt.compare(pass, user.password);
    if (!validPass) throw new UnauthorizedException('Invalid password');

    // Return the user object without the password
    const { password, ...result } = user;
    return result;
  }

  /**
   * Signs in the user by creating a JWT token.
   * @param user - The validated user object.
   * @returns An object containing the JWT payload and the access token.
   */
  async signIn(user: any): Promise<{}> {
    // Create the JWT payload
    const payload: IJwtPayload = {
      email: user.email,
      role: user.role,
      id: user.id,
    };

    // Return the payload and the signed JWT token
    return { payload, access_token: this.jwtService.sign(payload) };
  }

  /**
   * Signs up a new user.
   * @param dto - The DTO containing the user's sign-up details.
   * @returns The created user object without the password.
   * @throws BadRequestException if user creation fails.
   */
  async signUp(dto: CreateUserDto): Promise<{}> {
    try {
      // Create a new user using the provided DTO
      const createdUser = await this.userService.create(dto);

      // Return the created user object without the password
      const { password, ...result } = createdUser;
      return result;
    } catch (error) {
      // Throw an exception if user creation fails
      throw new BadRequestException('Failed to create user');
    }
  }
}
