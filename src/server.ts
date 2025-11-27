import createApp from "./app";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT || 8000;
const app = createApp();

app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
