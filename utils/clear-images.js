const path = require("path");
const fs = require("fs");

module.exports = (images) => {
  images.forEach((imagePath) => {
    imagePath = path.join(__dirname, "..", imagePath);
    fs.unlink(imagePath, (err) => console.log(err));
  });
};
