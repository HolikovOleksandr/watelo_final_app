import { Role } from 'src/modules/user/entities/role.enum';

export interface JwtPayload {
  email: string;
  id: string;
  role: Role;
  iat?: number;
  exp?: number;
}
