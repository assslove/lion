#!/bin/bash
#备份mysql

host=127.0.0.1
port=3306
user=root
passwd=8459328

src=/data/mysql
dest=ubuntu@127.0.0.1:/data/mysql
mkdir -p $src && cd $src
dir=`date +"%Y%m%d"`
mkdir -p $dir
tbs=`mysql -h$host -P$port -u$user -p$passwd -A -e 'use game_db_new;show tables' | tail -n+2`
for i in $tbs
do
	#echo $i;
	mysqldump -h$host -P$port -u$user -p$passwd game_db_new $i > $src/$dir/$i.sql
done

echo "back mysql success"
