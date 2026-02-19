import app from "./app";
const PORT = process.env.PORT;

if (!PORT) {
  console.error("PORT environment variable is not set");
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
