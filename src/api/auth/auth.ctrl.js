import Joi from '@hapi/joi';
import User from '../../models/User';

/*
POST /api/auth/register
{
  username: 'admin',
  password: 'admin123'
}
*/
export const register = async ctx => {
  // RequestBody 검증하기
  const schema = Joi.object().keys({
    username: Joi.string().alphanum().min(3).max(20).required(),
    password: Joi.string().required(),
  });
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  const { username, password } = ctx.request.body;
  try {
    // username이 이미 존재하는지 확인
    const exist = await User.findByUsername(username);
    if (exist) {
      ctx.status = 409; // Conflict
      return;
    }

    const user = new User({
      username,
    });
    await user.setPassword(password); // 비밀번호 설정
    await user.save(); // DB에 저장
    // 암호화된 hashedPassword를 유저 정보에서 삭제하는
    // 인스턴스 메서드 정의
    ctx.body = await user.serialize();
  } catch (error) {
    ctx.throw(500, error);
  }
};

/*
POST /api/auth/login
{
  username: 'admin',
  password: 'admin123'
}
*/
export const login = async ctx => {
  const { username, password } = ctx.request.body;
  if (!username || !password) {
    ctx.status = 401;
    return;
  }

  try {
    const user = await User.findByUsername(username);
    //계정이 존재하지 않으면 에러처리
    if (!user) {
      ctx.status = 401;
      return;
    }
    const valid = await user.checkPassword(password);
    //잘못된 비밀번호
    if (!valid) {
      ctx.status = 401;
      return;
    }
    ctx.body = await user.serialize();
  } catch (error) {
    ctx.throw(500, error);
  }
};

export const check = async ctx => {
  // 인증
};

export const logout = async ctx => {
  // 로그아웃
};
