const { getReviews } = require("./reviews.services");
// const {
//   updateReviewsDaily,
//   updateReviewsMonthly,
// } = require("./reviews.update");

const getReviewsHandler = async (req, res) => {
  try {
    // CHECKING WORKING OF UPATING REVIWS DAILY:
    // const reviews = await updateReviewsDaily();
    //  res.status(200).send({ daily_reviews: reviews });

    // CODE FOR CUSTOM PAGINATION
    // res.status(200).json(res.pagination);
    const options = req.query;
    reviewsFromDB = await getReviews(options);

    res.status(200).send({ reviews: reviewsFromDB });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Error during getting reviews from database:" + error.message,
    });
  }
};

module.exports = { getReviewsHandler };
