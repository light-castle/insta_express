const mongoose = require('mongoose');

// 게시물 스키마 정의
const PostSchema = new mongoose.Schema({
  // 캡션 필드
  caption: {
    type: String,
    required: true, // 캡션 필수
  },
  // 이미지 URL 필드
  imageUrl: {
    type: String,
    required: true, // 이미지 URL 필수
  },
  // 작성자 필드
  user: {
    type: mongoose.Schema.Types.ObjectId, // MongoDB ObjectId 타입
    ref: 'User', // 작성자 필드는 User 모델을 참조
    required: true,
  },
  // 생성 날짜 필드
  createdAt: {
    type: Date,
    default: Date.now, // 생성 날짜 기본값은 현재 시간
  },
});

// Post 모델을 mongoose에 등록하여 모듈로 내보냄
module.exports = mongoose.model('Post', PostSchema);
