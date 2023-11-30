const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  addresses: {
    address1: String,
    address2: String,
    city: String,
    postalCode: String,
  },
  
  role: {
    type: String,
    default: "user",
  },

  refreshTokens: [{ token: { type: String } }],
  
  passwordResetToken: String,
  resetTokenExpiration: String,
});


module.exports = mongoose.model('User', userSchema);