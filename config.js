const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  serverPort: process.env.PORT || 3000,
  mongoConnectionString: process.env.MONGO_CONNECTION_STRING,
  jwtSecret: process.env.JWT_SECRET,
  jwtLifetime: process.env.JWT_LIFE_TIME,
  jwtPasswordLifetime: process.env.JWT_NEW_PASSWORD_LIFE_TIME,
  // googleKey: process.env.API_GOOGLE_KEY,
  placeID: process.env.PLACE_ID,
  serpApiKey: process.env.SERP_API_KEY,
  serpPlaceID: process.env.SERP_API_PLACE_ID,
  gmailMailer: process.env.GMAIL_ADDRESS,
  gmailPassword: process.env.GMAIL_PASSWORD,

  cloudURL: process.env.S3_API,
  cloudKeyID: process.env.ACCESS_KEY_ID,
  cloudSecretKey: process.env.SECRET_ACCESS_KEY,
  // user: process.env.GMAIL_ADDRESS,
  // clientId: process.env.CLIENT_ID,
  // clientSecret: process.env.CLIENT_SECRET,
  // refreshToken: process.env.REFRESH_TOKEN,
  // accessToken: process.env.ACCESS_TOKEN,
};
