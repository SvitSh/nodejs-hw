import createHttpError from "http-errors";
import { saveFileToCloudinary } from "../utils/saveFileToCloudinary.js";
import { User } from "../models/user.js";

export async function updateUserAvatar(req, res, next) {
  try {
    const { file, user } = req;

    if (!file) {
      return next(createHttpError(400, "No file"));
    }

    const uploaded = await saveFileToCloudinary(file.buffer);
    user.avatar = uploaded.secure_url;
    await user.save();

    res.status(200).json({ url: user.avatar });
  } catch (err) {
    next(err);
  }
}
