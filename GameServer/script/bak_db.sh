#!/bin/bash
# db备份 从本地拷贝到服务器某地
src="~/redis/dump.rdb"
dest="/data/backup"
host="test@10.10.1.5"
dir=`date +"%Y%m%d"`
ssh $host "mkdir -p $dest/$dir"
scp $src $host:$dest/$dir/
