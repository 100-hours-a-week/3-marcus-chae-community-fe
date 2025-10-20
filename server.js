import express from "express";
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

// public 폴더 전체를 정적 파일로 제공
app.use(express.static("public"));

app.use(
  '/api',
  createProxyMiddleware({
    target: 'http://localhost:8080/api'
  })
);

app.listen(3000, () => console.log("http://localhost:3000"));