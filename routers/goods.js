const express = require("express");
const Goods = require("../schemas/Goods");
const Cart = require("../schemas/cart");

const router = express.Router();

router.get("/goods", async (req, res, next) => {
  try {
    const { category } = req.query;
    const goods = await Goods.find({ category }).sort("-goodsId");
    res.json({ goods: goods });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

const cheerio = require("cheerio");
const axios = require("axios");
const iconv = require("iconv-lite");
const url =
  "http://www.yes24.com/24/Category/BestSeller";


router.get("/goods/add/crawling", async (req, res) => {
  try {
    //크롤링 대상 웹사이트 HTML 가져오기
    await axios({
      url: url,
      method: "GET",
      responseType: "arraybuffer",
    }).then(async (html) => {
        //크롤링 코드
      const content = iconv.decode(html.data, "EUC-KR").toString();
      const $ = cheerio.load(content);
      const list = $("ol li");

      await list.each( async (i, tag) => {
        let desc = $(tag).find("p.copy a").text() 
        let image = $(tag).find("p.image a img").attr("src")
        let title = $(tag).find("p.image a img").attr("alt")
        let price = $(tag).find("p.price strong").text()
      
        if(desc && image && title && price){
          price = price.slice(0,-1).replace(/(,)/g, "")
          let date = new Date()
          let goodsId = date.getTime()
          await Goods.create({
            goodsId:goodsId,
            name:title,
            thumbnailUrl:image,
            category:"도서",
            price:price
          })
        }
  
      });
    })
    res.send({ result: "success", message: "크롤링이 완료 되었습니다." });

  } catch (error) {
    //실패 할 경우 코드
    res.send({ result: "fail", message: "크롤링에 문제가 발생했습니다", error:error });
  }
});

// 상품 상세페이지 api
router.get("/goods/:goodsId", async (req, res) => {
  const { goodsId } = req.params;
  goods = await Goods.findOne({ goodsId: goodsId });
  res.json({ detail: goods });
});

// 상품 메인페이지 api
router.post('/goods', async (req, res) => {
  const { goodsId, name, thumbnailUrl, category, price } = req.body;

  isExist = await Goods.find({ goodsId });
  if (isExist.length == 0) {
    await Goods.create({ goodsId, name, thumbnailUrl, category, price });
  }
  res.send({ result: "success" });
});


// 카트 api
// 해당 goods 에 대한 장바구니를 추가하기 때문에 cart router 를 따로 만들지 않는다
router.post("/goods/:goodsId/cart", async (req, res) => {
  const { goodsId } = req.params;
  const { quantity } = req.body;

  isCart = await Cart.find({ goodsId });
  console.log(isCart, quantity);
  if (isCart.length) {
    await Cart.updateOne({ goodsId }, { $set: { quantity } });
  } else {
    await Cart.create({ goodsId: goodsId, quantity: quantity });
  }
  res.send({ result: "success" });
});

// 장바구니 상품 삭제 api
router.delete("/goods/:goodsId/cart", async (req, res) => {
  const { goodsId } = req.params; // 상품ID를 받아옴

  const isGoodsInCart = await Cart.find({ goodsId }); // 상품이 있는지 체크
  if (isGoodsInCart.length > 0) {
    await Cart.deleteOne({ goodsId });
  }

  res.send({ result: "success" });
});

router.patch('/goods/:goodsId/cart', async (req, res) => {
  const { goodsId } = req.params;
  const { quantity } = req.body;

  const isGoodsInCart = await Cart.find({ goodsId });
  if (isGoodsInCart.length > 0) {
    await Cart.updateOne({ goodsId }, { $set: { quantity} }); // 무엇을 바꿀지는 $set으로 시작
  }

  res.send({ result: "success" });
});  

router.get("/cart", async (req, res) => {
  const cart = await Cart.find({});
  const goodsId = cart.map(cart => cart.goodsId);

  goodsInCart = await Goods.find()
    .where("goodsId")
    .in(goodsId);

  concatCart = cart.map(c => {
    for (let i = 0; i < goodsInCart.length; i++) {
      if (goodsInCart[i].goodsId == c.goodsId) {
        return { quantity: c.quantity, goods: goodsInCart[i] };
      }
    }
  });

  res.json({
    cart: concatCart
  });
});

module.exports = router;
