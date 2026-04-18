import { UserModel } from "./user.model.js";

export class AuthRepository {
  async findByUsername(username) {
    return UserModel.findOne({ username }).exec();
  }

  async findByRefreshToken(refreshToken) {
    return UserModel.findOne({ refreshToken }).exec();
  }

  async save(user) {
    return user.save();
  }

  async rotateRefreshToken(userId, oldToken, newToken) {
    return UserModel.findOneAndUpdate(
      { _id: userId, refreshToken: oldToken },
      { $set: { "refreshToken.$": newToken } },
      { returnDocument: "after" },
    ).exec();
  }

  async removeRefreshToken(userId, token) {
    return UserModel.updateOne(
      { _id: userId },
      { $pull: { refreshToken: token } },
    ).exec();
  }

  async clearRefreshTokens(userId) {
    return UserModel.updateOne(
      { _id: userId },
      { $set: { refreshToken: [] } },
    ).exec();
  }
}
