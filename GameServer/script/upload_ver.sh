#!/bin/bash
#上传版本

cd ../
cp -r app.js  bin  package.json  public  routes  script  service  sql  utils ~/tmp/server/
cd ~/tmp/server 
git commit -a -m "general commit"
git push origin master
