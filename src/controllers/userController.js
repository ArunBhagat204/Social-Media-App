const accountServices = require("../services/account");
const profileServices = require("../services/profile");

const userSearch = async (req, res) => {
  const result = await profileServices.userSearch(req.body);
  res.status(result.success === false ? 403 : 200).json(result.users);
};

const getProfile = async (req, res) => {
  const result = await profileServices.getProfile(req);
  return res.status(res.success === false ? 403 : 200).json(result);
};

const editProfile = async (req, res) => {
  const result = await userController.editProfile(req);
  return res.status(res.success === false ? 403 : 200).json(result);
};

const deleteAccount = async (req, res) => {
  const result = await accountServices.deleteAccount(req);
  if (result.success === false) {
    return res.status(403).json(result);
  } else {
    return res.clearCookie("login_token").status(200).json(result);
  }
};

module.exports = { deleteAccount, getProfile, editProfile, userSearch };
