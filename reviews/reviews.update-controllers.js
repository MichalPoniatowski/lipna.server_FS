const cron = require("node-cron");
const mongoose = require("mongoose");

const {
  getMonthlyReviews,
  getDailyReviews,
} = require("./reviews.update-functions");

const makeBackupReviews = async () => {
  try {
    await mongoose.connection
      .collection("lipna.reviews")
      .aggregate([{ $out: "lipna.reviews-backup" }])
      .toArray();
    console.log("Backup completed successfully.");
  } catch (error) {
    console.error("Error during backup:" + error.message);
    return;
  }
};

const deleteOldReviews = async () => {
  try {
    await mongoose.connection.collection("lipna.reviews").drop();
    console.log("Collection 'lipna.reviews' deleted");
  } catch (error) {
    if (error.message.includes("ns not found")) {
      console.error(
        "Collection 'lipna.reviews' does not exists" + error.message
      );
    } else {
      console.error(
        "Error during deleting collection 'lipna.reviews'" + error.message
      );
    }
    return;
  }
};

// cron.schedule("30 23 * * *", async () => {
//   try {
//     const uploadedReviewsDaily = await getDailyReviews();
//     console.log("Daily schedule ran");
//     console.log("5 . UPLOADED REVIEWS DAILY:", uploadedReviewsDaily);
//   } catch (error) {
//     console.error(
//       "Running daily schedule failed or some other error with uploading reviews" +
//         error.message
//     );
//   }
// });

cron.schedule("30 0 15 * *", async () => {
  try {
    await makeBackupReviews();
    await deleteOldReviews();
    await getMonthlyReviews();
    console.log("Monthly schedule ran");
  } catch (error) {
    console.error(
      "Running monthly schedule failed or some other error with uploading or getting reviews;",
      error.message
    );
  }
});
