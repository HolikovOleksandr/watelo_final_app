import { Role } from 'src/modules/user/entities/role.enum';

export interface IJwtPayload {
  email: string;
  id: string;
  role: Role;
  iat?: number;
  exp?: number;
}
