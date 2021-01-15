require('dotenv').config();
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import mongoose from 'mongoose';

// 라우팅
import api from './api';

// process.env 에서 설정 정보 가져오기
const { PORT, MONGO_URI } = process.env;

// mongoDB 연결
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useFindAndModify: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB is Connected!');
  })
  .catch(err => console.error(err));

const app = new Koa();
const router = new Router();

router.use('/api', api.routes()); // api 라우터 적용

// 라우터 적용 전에 bodyParser 적용
app.use(bodyParser());

// app 인스턴스에 라우터 적용
app.use(router.routes()).use(router.allowedMethods());

const port = PORT || 4000;
app.listen(port, () => {
  console.log(port, 'Koa Server is Running...');
});
