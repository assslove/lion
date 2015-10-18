#!/bin/bash

#NODE_ENV 环境 development | production
#第3个参数端口号
#NODE_ENV=production node app.js -p 8001 & >/dev/null 2>1&
#NODE_ENV=development node app.js -p 8001 & >/dev/null 2>1&
#auto reboot forever
NODE_ENV=production forever app.js -p 8001 > /dev/null 2>&1 &
