import bcrypt from "bcrypt";
const SALT_ROUND = process.env.SALT_ROUND;
const saltRounds = Number(SALT_ROUND);

if (!saltRounds || isNaN(saltRounds)) {
  console.error("Invalid SALT_ROUND");
  process.exit(1);
}

export const generateHashPassword = async (password: string) => {
  return await bcrypt.hash(password, Number(SALT_ROUND));
};
