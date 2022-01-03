const validation = require("./validation");
const userModel = require("../models/user");
const tokenManager = require("../helpers/token_manager");
const emailSender = require("../helpers/email_sender");

/**
 * Created a new account and initiates sending of verification email
 * @param {Request Body} req Contains new-user registration info
 * @returns Success/Failure response along with associated message
 */
const registerUser = async (req) => {
  const validationRes = await validation.signup(req);
  if (validationRes.success === false) {
    return validationRes;
  }
  const user = new userModel({
    username: req.username,
    hash: req.password,
    email: req.email,
  });
  try {
    user.save();
    const verificationToken = tokenManager.newToken(
      { username: req.username },
      process.env.JWT_TOKEN_SECRET,
      "1h"
    );
    const mail = {
      address: req.email,
      subject: "Verify your account - Social-Media-App",
      body: `Hey ${req.username}!<br><br>
            Thank you for creating an account at Social Media App.<br>
            Click on the link to verify your account: 
            http://localhost:3000/users/email_verify?token=${verificationToken}<br><br>
            Team Social-Media-App`,
    };
    emailSender.send(mail);
  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
  return {
    success: true,
    message: `Account created for '${req.username}'. Verification e-mail sent...`,
  };
};

/**
 * Verifies email associated with a user account
 * @param {string} token JWT token for verifying email
 * @returns Success/Failure response along with associated message
 */
const emailVerify = (token) => {
  const decoded = tokenManager.verify(token, process.env.JWT_TOKEN_SECRET);
  if (decoded.verified === false) {
    return {
      status: 401,
      message: `Email verification failed - ${decoded.content}`,
    };
  }
  try {
    userModel.findOneAndUpdate(
      { username: decoded.content.username },
      { email_verified: true },
      null,
      (err, docs) => {
        if (err) {
          throw new Error(err);
        }
      }
    );
    userModel.findOne({ username: decoded.content.username }, (err, res) => {
      userModel.deleteMany(
        { email: res.email, email_verified: false },
        (err) => {
          if (err) {
            throw new Error(err);
          }
        }
      );
    });
  } catch (err) {
    return {
      status: 500,
      message: `Verification failed - ${err.message}`,
    };
  }
  return {
    status: 200,
    message: "Email verification successful!",
  };
};

module.exports = { registerUser, emailVerify };
