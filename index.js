const express = require('express')
const app = express()
const port = 3000

// 스키마와 굿즈로 분리한 파일 연결시키기
const connect = require('./schemas')
connect()

//미들웨어 쓸 준비
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(express.static('public'));

// const goodsRouter = require('./routes/goods')
// const userRouter = require('./routes/user')

// goods api 서버 만들기
const goodsRouter = require("./routers/goods");
app.use("/api", [goodsRouter]);

// app.use('/goods', goodsRouter)
// app.use('/user', userRouter)

// ejs파일을 작동시킨다.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use((req, res, next) => {
    console.log(req);
    next();
  });
  
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/test', (req, res) => {
    let name = req.query.name;
    res.render('test', {name}); // test.ejs 파일을 그리라는 뜻이고 그 ejs 파일에 name 값을 객체로 넘겨준다는 의미
})

app.get('/', (req, res) => {
  res.send('<!DOCTYPE html>\
  <html lang="en">\
  <head>\
      <meta charset="UTF-8">\
      <meta http-equiv="X-UA-Compatible" content="IE=edge">\
      <meta name="viewport" content="width=device-width, initial-scale=1.0">\
      <title>Document</title>\
  </head>\
  <body>\
      Hi. I am with html<br>\
      <a href="/hi">Say Hi!</a>\
  </body>\
  </html>')
})

app.get('/home', (req, res) => {
    res.render('index')
})

// 앞부분은 /브라우저주소
// 뒷부분은 ejs파일명
app.get('/detail', (req, res) => {
    res.render('detail')
})

// 장바구니 페이지 연결
app.get('/cart', (req, res) => {
    res.render('cart')
})

// 구매 페이지 연결
app.get('/order', (req, res) => {
    res.render('order')
})

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`)
})