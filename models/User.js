const mongoose = require('mongoose'); // Mongoose 모듈을 가져옴

// 사용자 스키마 정의
const UserSchema = new mongoose.Schema({
  // 이메일 필드
  email: {
    type: String,
    required: true, // 이메일 필수
    unique: true, // 이메일은 유일해야 함
  },
  // 사용자 이름 필드
  username: {
    type: String,
    required: true, // 사용자 이름 필수
    unique: true, // 사용자 이름은 유일해야 함
  },
  // 비밀번호 필드
  password: {
    type: String,
    required: true, // 비밀번호 필수
  },
  // 친구 목록 필드
  friends: [{
    type: mongoose.Schema.Types.ObjectId, // 친구 목록은 MongoDB ObjectId 타입
    ref: 'User', // 친구 목록은 User 모델을 참조
  }],
  // 생성 날짜 필드
  createdAt: {
    type: Date,
    default: Date.now, // 생성 날짜 기본값은 현재 시간
  },
});

// User 모델을 mongoose에 등록하여 모듈로 내보냄
module.exports = mongoose.model('User', UserSchema);
