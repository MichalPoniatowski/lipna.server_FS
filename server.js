const { app } = require("./app");
const { disconnect, connect } = require("./db");
const { serverPort, mongoConnectionString } = require("./config");

(async () => {
  try {
    await connect(mongoConnectionString);
    console.log("Database connection established");

    app.listen(serverPort, async () => {
      console.log(`Server running on port ${serverPort}`);
    });
  } catch (error) {
    console.error(e.message);
    process.exit(1);
  }
})();

process.on("SIGINT", async () => {
  await disconnect(mongoConnectionString);
  console.log("Database connection closed");
  process.exit(0);
});
