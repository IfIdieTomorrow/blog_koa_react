import Post from './models/Post';

export default function createFakeData() {
  // 0, 1, ... 39로 이루어진 배열을 생성 한 후 포스트 데이터로 변환
  const posts = [...Array(40).keys()].map(i => ({
    title: `포스트 #${i}`,
    body: `가짜 데이터 #${i}`,
    tags: ['가짜', '태그'],
  }));
  Post.insertMany(posts, (err, docs) => {
    console.log(docs);
  });
}
