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
}
