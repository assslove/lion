#!/bin/bash
pkill -9 node
sleep 1
for i in `seq 8001 8003`
do
	mkdir -p log/$i
	NODE_ENV=production forever app.js -p $i > /dev/null 2>&1 &
done

