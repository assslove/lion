#!/bin/bash
pkill -9 node
sleep 1
NODE_ENV=production forever app.js -p 8001 > /dev/null 2>&1 &

