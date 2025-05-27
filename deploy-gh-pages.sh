#!/bin/bash

# 进入 build 目录
cd build

git init

git remote add origin https://github.com/JackyCaptainZhang/weir-project-tracker-frontend.git
git checkout -b gh-pages

git add .
git commit -m "Deploy"
git push -f origin gh-pages 