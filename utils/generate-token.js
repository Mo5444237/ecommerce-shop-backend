const jwt = require("jsonwebtoken");

const generateAccessToken = (payload) => {
  const token = jwt.sign({ userId: payload }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });

  return token;
};

const generateRefreshToken = (payload) => {
  const token = jwt.sign(
    { userId: payload },
    process.env.JWT_SECRET_REFRESH_KEY,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRE_TIME,
    }
  );

  return token;
};


module.exports = {
    generateAccessToken,
    generateRefreshToken
}