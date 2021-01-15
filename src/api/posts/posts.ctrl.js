import Post from '../../models/Post';
import mongoose from 'mongoose';
import Joi from '@hapi/joi';

// ObjectId의 형식을 검사하는 미들웨어 작성
const { ObjectId } = mongoose.Types;

export const getPostById = async (ctx, next) => {
  const { id } = ctx.params;
  if (!ObjectId.isValid(id)) {
    ctx.status = 400; // Bad Request
    return;
  }
  try {
    const post = await Post.findById(id);
    // 포스트가 존재하지 않을 때
    if (!post) {
      ctx.status = 404;
      return;
    }
    ctx.state.post = post;
    return next();
  } catch (error) {
    ctx.throw(500, error);
  }
};

/*
POST /api/posts
{
  title: '제목',
  body: '내용',
  tags: ['태그1','태그2']
}
 */
export const write = async ctx => {
  //---------------------------------------------------------------------------
  const schema = Joi.object().keys({
    // 객체가 다음 필드를 가지고 있는지 검증
    title: Joi.string().required(), // required()가 있으면 필수 항목
    body: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).required(), // 문자로 이루어진 배열
  });
  // 검증하고 나서 실패인 경우 에러처리
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }
  //--------------------------------------------------------------------------
  const { title, body, tags } = ctx.request.body;
  const post = new Post({
    title,
    body,
    tags,
    user: ctx.state.user,
  });
  try {
    await post.save();
    ctx.body = post;
  } catch (error) {
    ctx.throw(500, error);
  }
};

/*
GET /api/posts
*/
export const list = async ctx => {
  // query는 문자열이기 때문에 숫자로 변환해 주어야 함
  // 값이 주어지지 않으면 1을 기본으로 사용

  /* 페이징을 위한 페이지 번호 설정 1페이지당 10개씩, 페이지 번호가 없을시에는 디폴트로 1페이지 */
  const page = parseInt(ctx.query.page || '1', 10);
  if (page < 1) {
    ctx.status = 400;
    return;
  }

  try {
    const posts = await Post.find()
      .sort({ _id: -1 })
      .limit(10)
      .skip((page - 1) * 10)
      .lean() // 데이터를 처음부터 JSON형식으로 조회
      .exec();
    /* 클라이언트에게 페이지 개수를 알려주기 위한 커스텀 header를 설정 */
    const postCount = await Post.countDocuments().exec();
    ctx.set('Last-Page', Math.ceil(postCount / 10));
    /* 글 내용이 200자가 넘어가면 뒤에 ...을붙이고 문자열을 자르는 기능 설정 */
    // 방법 1
    // ctx.body = posts
    //   .map(post => post.toJSON)
    //   .map(post => ({
    //     ...post,
    //     body: post.body.length < 200 ? post.body : `${post.body.slice(0, 200)}...`,
    //   }));
    // 방법 2
    ctx.body = posts.map(post => ({
      ...posts,
      body: post.body.length < 200 ? post.body : `${post.body.slice(0, 200)}...`,
    })); // 대신 Post모델에서 글을 가져올 때 .lean() 함수를 사용해야 함
  } catch (error) {
    ctx.throw(500, error);
  }
};

export const read = async ctx => {
  ctx.body = ctx.state.post;
};

/*
  DELETE /api/posts/:id
*/
export const remove = async ctx => {
  const { id } = ctx.params;
  try {
    await Post.findByIdAndRemove(id).exec();
    ctx.status = 204; // No Content (성공하기는 했지만 응답할 데이터는 없음)
  } catch (error) {
    ctx.throw(500, error);
  }
};

/*
PATCH /api/posts/:id
{
  title: '수정',
  body: '수정내용',
  tags: ['수정', '태그']
}
*/
export const update = async ctx => {
  const { id } = ctx.params;
  // --------------------------------------------------------------------
  const schema = Joi.object().keys({
    title: Joi.string(),
    body: Joi.string(),
    tags: Joi.array().items(Joi.string()),
  });
  // 검증하고 나서 에러처리
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }
  // --------------------------------------------------------------------
  try {
    const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
      new: true, // 이 값을 설정하면 업데이트된 데이터를 반환합니다.
      // false일때는 업데이트 되기 전의 데이터를 반환합니다.
    }).exec();
    if (!post) {
      ctx.status = 404;
      return;
    }
    ctx.body = post;
  } catch (error) {
    ctx.throw(500, error);
  }
};

export const checkOwnPost = async (ctx, next) => {
  const { user, post } = ctx.state;
  if (post.user._id.toString() !== user._id) {
    ctx.status = 403;
    return;
  }
  return next();
};
