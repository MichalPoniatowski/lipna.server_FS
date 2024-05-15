const axios = require("axios");

const { serpApiKey, serpPlaceID } = require("../config");
const { Reviews } = require("./reviews.model");
const { relativeDateToAbsolute } = require("./reviews.validate-date");

const params = {
  api_key: serpApiKey,
  search_type: "place_reviews",
  data_id: serpPlaceID,
  sort_by: "date",
  output: "json",
  hl: "pl",
  max_page: "1",
};

const getReviewsData = async (params) => {
  try {
    const response = await axios.get("https://api.scaleserp.com/search", {
      params,
    });
    const serpApiCredits = response.data.request_info.credits_remaining;
    if (serpApiCredits < 1) {
      throw new Error("No credits left in serpApi");
    }
    console.log("CREDITS LEFT:", serpApiCredits);
    return response.data;
  } catch (error) {
    console.error("Error in getting data from serpApi" + error.message);
    throw error;
  }
};

const checkForUniqueReviews = async (arrayToCheck) => {
  let reviewsToUpload = [];

  try {
    const uniqueIndexCheck = arrayToCheck.map(async (review) => {
      const exists = await Reviews.findOne({
        source_id: review.source_id,
      }).lean();
      return exists ? null : review;
    });
    reviewsToUpload = (await Promise.all(uniqueIndexCheck)).filter(
      (review) => review !== null
    );
  } catch (error) {
    console.error("Could not check in dataBase" + error.message);
    return;
  }

  return reviewsToUpload;
};

const updateReviews = async (maxPages = Infinity) => {
  let nextPageToken = null;
  let currentPage = 0;
  let allReviews = [];

  do {
    currentPage++;
    const currentParams = { ...params, next_page_token: nextPageToken };
    const reviewsData = await getReviewsData(currentParams);
    const reviewsToCheck = reviewsData.place_reviews_results;
    if (reviewsToCheck.length < 1) {
      console.log("No more reviews from API");
      return;
    }
    const reviews = await checkForUniqueReviews(reviewsToCheck);

    if (reviewsData && reviews.length > 0) {
      try {
        const formatedReviews = await reviews.map((review) => ({
          ...review,
          date: relativeDateToAbsolute(review.date),
        }));
        await Reviews.insertMany(formatedReviews);
        console.log(`Saved reviews for page ${currentPage} to the database.`);
        allReviews.push(...formatedReviews);
        nextPageToken = reviewsData.pagination?.pages[0]?.next_page_token;
      } catch (error) {
        console.error(`Failed to save reviews: ${error.message}`);
        break;
      }
    } else {
      console.log("Reviews allready in database, no reviews to upload");
      break;
    }
  } while (nextPageToken && currentPage < maxPages);

  console.log("Finished updating reviews.");
  return allReviews;
};

const getMonthlyReviews = async () => {
  const reviews = await updateReviews();
  return reviews;
};

const getDailyReviews = async () => {
  const reviews = await updateReviews(1);
  return reviews;
};

module.exports = { getMonthlyReviews, getDailyReviews };
