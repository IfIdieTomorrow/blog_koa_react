import Router from 'koa-router';
import auth from './auth';
import posts from './posts';

const api = new Router();

// 라우팅
api.use('/posts', posts.routes());
api.use('/auth', auth.routes());

// 라우터를 내보냅니다.
export default api;
