import prisma from "../prisma";
import { AppError } from "../utils/app_error";
import { generateHashPassword, verifyPassword } from "../utils/hash_password";
import { generateAccessToken } from "../utils/jwt";

interface ISignUpService {
  name: string;
  email: string;
  password: string;
}

interface ISignInService {
  email: string;
  password: string;
}

export const signUpService = async ({
  name,
  email,
  password,
}: ISignUpService) => {
  const normalizedEmail = email.toLowerCase();
  const hashedPassword = await generateHashPassword(password);

  try {
    return await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
      },
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new AppError("User already exists", 400);
    }
    throw error;
  }
};

export const signInService = async ({ email, password }: ISignInService) => {
  const normalizedEmail = email.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      role: true,
    },
  });

  if (!user) {
    throw new AppError("Invalid Credential", 400);
  }

  const isValid = await verifyPassword(password, user.password);

  if (!isValid) {
    throw new AppError("Invalid Credential", 400);
  }

  const accessToken = generateAccessToken(user.id, user.role);

  return {
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};
