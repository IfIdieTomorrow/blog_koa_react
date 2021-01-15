import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const UserSchema = new Schema({
  username: String,
  hashedPassword: String,
});

// 인스턴스 메서드란?
// 모델을 통해 만든 문서 인스턴스에서 사용할 수 있는 함수를 의미함
// ex) const user = new User({username: 'lee'});
// user.setPassword('myPassword123');

// 스태틱 메서드란?
// 모델에서 바로 사용할 수 있는 메서드
// ex) const user = User.findByUsername('lee');

// 인스턴스 메서드
UserSchema.methods.setPassword = async function (password) {
  const hash = await bcrypt.hash(password, 10);
  this.hashedPassword = hash;
};
UserSchema.methods.checkPassword = async function (password) {
  const result = await bcrypt.compare(password, this.hashedPassword);
  return result; // true / false
};
UserSchema.methods.serialize = async function () {
  const data = this.toJSON();
  delete data.hashedPassword;
  return data;
};
/* 토큰 발급과정 */
UserSchema.methods.generateToken = function () {
  const token = jwt.sign(
    //첫번째 파라미터에는 토큰 안에 집어넣고 싶은 데이터를 넣습니다.
    {
      _id: this.id,
      username: this.username,
    },
    process.env.JWT_SECRET, // 두번째 파라미터에는 JWT암호를 넣습니다.
    {
      expiresIn: '3d', // 7일동안 유효함
    },
  );
  return token;
};

// 스태틱 메서드
UserSchema.statics.findByUsername = function (username) {
  return this.findOne({ username });
};

const User = mongoose.model('User', UserSchema);
export default User;
