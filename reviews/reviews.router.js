const { Router } = require("express");

const { getReviewsHandler } = require("./reviews.controllers");

const reviewsRouter = Router();

reviewsRouter.get("/", getReviewsHandler);

// TEST ENDPOINT

// const { checkForUniqueReviews } = require("./reviews.update-controllers");

// const checkHandler = async (req, res) => {
//   try {
//     const uniqueReviews = await checkForUniqueReviews(testArray);
//     res.status(200).send({ respons: uniqueReviews });
//   } catch (error) {
//     console.error("TEST FAIL" + error.message);
//   }
// };

// reviewsRouter.get("/test", checkHandler);

module.exports = { reviewsRouter };
