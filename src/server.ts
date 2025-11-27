import createApp from "./app";

console.log("Booting Application...");
const port = process.env.PORT || 8000;
const app = createApp();

const start = async () => {
  app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
  });
};

export default start;
