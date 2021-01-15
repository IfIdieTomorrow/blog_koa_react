let postId = 1; // id의 초깃값

// posts배열 초기 데이터
const posts = [
  {
    id: 1,
    title: '제목',
    body: '내용',
  },
];

/*
포스트 작성
POST /api/posts
{title, body}
*/
exports.write = ctx => {
  // REST API의 Request Body는 ctx.request.body에서 조회할 수 있음
  const { title, body } = ctx.request.body;
  postId += 1; // 기존 postId 값에 1을 더함
  const post = { id: postId, title, body };
  posts.push(post);
  ctx.body = post;
};

/*
포스트 목록 조회
GET /api/posts
*/
exports.list = ctx => {
  ctx.body = posts;
};

/*
특정 포스트 조회
GET /api/posts/:id
*/
exports.read = ctx => {
  const { id } = ctx.params;
  const post = posts.find(p => p.id.toString() === id);
  // 포스트가 없으면 오류 반환
  if (!post) {
    ctx.status = 404;
    ctx.body = {
      message: '포스트가 존재하지 않습니다.',
    };
    return;
  }
  ctx.body = post;
};

/*
특정 포스트 제거
DELETE /api/posts/:id
*/
exports.remove = ctx => {
  const { id } = ctx.params;
  const index = posts.findIndex(p => p.id.toString() === id);
  if (index === -1) {
    ctx.status = 404;
    ctx.body = {
      message: '포스트가 존재하지 않습니다.',
    };
    return;
  }
  posts.splice(index, 1);
  ctx.status = 204;
};

/*
포스트 수정(교체)
POST /api/posts/:id
{title, body}
*/
exports.replace = ctx => {
  // PUT 메서드는 전체 포스트 정보를 입력하여 데이터를 통째로 교체할 때 사용
  const { id } = ctx.params;
  const index = posts.findIndex(p => p.id.toString() === id);
  if (index === -1) {
    ctx.status = 404;
    ctx.body = {
      message: '포스트가 존재하지 않습니다.',
    };
    return;
  }
  // 전체 객체를 덮어 씌웁니다
  posts[index] = {
    id,
    ...ctx.request.body,
  };
  ctx.body = posts[index];
};

/*
포스트 수정(특정 필드 변경)
PATCH /api/posts/:id
{title, body}
*/
exports.update = ctx => {
  // PATCH 메서드는 주어진 필드만교체
  const { id } = ctx.params;
  const index = posts.findIndex(p => p.id.toString() === id);
  if (index === -1) {
    ctx.status = 404;
    ctx.body = {
      message: '포스트가 존재하지 않습니다.',
    };
    return;
  }
  // 기존 값에 정보를 덮어 씌움
  posts[index] = {
    ...posts[index],
    ...ctx.request.body,
  };
  ctx.body = posts[index];
};
