import prisma from "../prisma";
import { AppError } from "../utils/app_error";
import { generateHashPassword } from "../utils/hash_password";

interface ISignUpService {
  name: string;
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
