#!/bin/bash

#NODE_ENV 环境 development | production
#auto reboot forever
NODE_ENV=production forever app.js -p 8000 > /dev/null 2>&1 &
