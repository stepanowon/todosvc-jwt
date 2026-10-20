// .env 로드를 위해 다른 모듈보다 먼저 import 한다
import './config';
import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import * as rfs from 'rotating-file-stream';
import swaggerUi from 'swagger-ui-express';
import routes from './routes';
import { swaggerSpec } from './swagger';

const app = express();

app.use(
  cors({
    origin: ['http://localhost:5173', 'https://testapp.com', 'http://react.test.com:5173'],
    credentials: true
  })
);

app.use(cookieParser());

// Cache-Control 헤더 설정 (중복 제거)
app.use(function (req: Request, res: Response, next: NextFunction) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next()
});

//-- 로깅
const baseDir = path.resolve('.');

// Vercel 등 서버리스 환경은 파일시스템이 읽기 전용이라 로그 파일을 만들 수 없다.
// 이런 환경에서는 stdout으로 로그를 보내고(플랫폼이 수집), 그 외에는 기존처럼 파일로 로테이션한다.
let accessLogStream: NodeJS.WritableStream = process.stdout;
if (!process.env.VERCEL) {
  const logDirectory = path.join(baseDir, '/log')
  fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)
  accessLogStream = rfs.createStream("access.log", {
    size: "10M",
    interval: "1d",
    path: logDirectory
  });
}

app.use(morgan('combined', { stream: accessLogStream }))

app.set('port', (process.env.PORT || 3000));

app.use(express.static(baseDir + '/public'));
console.log(baseDir + '/views');
app.set('views', baseDir + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

routes(app);

app.listen(app.get('port'), function () {
    console.log("할일 목록 서비스가 " + app.get('port') + "번 포트에서 시작되었습니다!");
});
