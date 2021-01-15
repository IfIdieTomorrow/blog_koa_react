const Router = require('koa-router');
const api = new Router();
const posts = require('./posts');

// 라우팅
api.use('/posts', posts.routes());

api.get('/about/:name?', ctx => {
  const { name } = ctx.params;
  // name의 존재 유무에 따라 다른 결과 출력
  ctx.body = name ? `${name}의 소개` : '소개';
});

// 라우터를 내보냅니다.
module.exports = api;
