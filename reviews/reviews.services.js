const { Reviews } = require("./reviews.model");
const { paginate } = require("mongoose-paginate-v2");

// const getReviews = async (options) => {
//   try {
//     const { page, limit, rating } = options;

//     const paginationOptions = {
//       limit: limit || 20,
//       page: page || 1,
//       sort: { date: -1 },
//     };

//     const queryFilters = {};
//     if (rating) {
//       queryFilters.rating = { $gte: Number(rating) };
//     }

//     const reviews = await Reviews.paginate(queryFilters, paginationOptions);
//     console.log("Quantity of reviews:", reviews.totalDocs);
//     return reviews;
//   } catch (error) {
//     console.error("Could not get reviews from database" + error.message);
//   }
// };

// module.exports = {
//   getReviews,
// };

const getReviews = async (options) => {
  try {
    const { page, limit, rating } = options;

    const paginationOptions = {
      limit: limit || 20,
      page: page || 1,
      sort: { date: -1 },
    };

    const queryFilters = {};
    if (rating) {
      queryFilters.rating = { $gte: Number(rating) };
    }

    const reviews = await Reviews.paginate(queryFilters, paginationOptions);

    const aggregateQuery = [
      {
        $group: {
          _id: null,
          totalRating: { $avg: "$rating" },
        },
      },
    ];

    const averageResult = await Reviews.aggregate(aggregateQuery);

    const averageRating =
      averageResult.length > 0 ? averageResult[0].totalRating.toFixed(2) : null;

    console.log("Quantity of reviews:", reviews.totalDocs);

    return {
      ...reviews,
      averageRating,
    };
  } catch (error) {
    console.error("Could not get reviews from database" + error.message);
  }
};

module.exports = {
  getReviews,
};
