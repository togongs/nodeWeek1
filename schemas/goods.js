// 데이터 모델링 하기 위한 schema 객체 만들기

const mongoose = require("mongoose");

const { Schema } = mongoose;
const goodsSchema = new Schema({
  goodsId: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  thumbnailUrl: {
    type: String
  },
  category: {
    type: String
  },
  price: {
    type: Number
  }
});
console.log(price)

module.exports = mongoose.model("Goods", goodsSchema);