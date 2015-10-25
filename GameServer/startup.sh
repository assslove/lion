#!/bin/bah

NODE_ENV=production forever app.js -p 8001 > /dev/null 2>&1 &
