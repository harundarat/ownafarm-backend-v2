import type {
  PrismaClient,
  User,
  UserRole,
} from "../../generated/prisma/client.js";

export class AuthRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  createUser(data: {
    email: string;
    passwordHash: string;
    role: UserRole;
  }): Promise<User> {
    return this.prisma.user.create({ data });
  }
}
