#!/bin/bash
#备份mysql

host=127.0.0.1
port=3306
user=root
passwd=8459328

src=/data/mysql
dest=houbin@192.168.1.105:/data/mysql/backup
mkdir -p $src && cd $src
dir=`date +"%Y%m%d"`
mkdir -p $dir
tbs=`mysql -h$host -P$port -u$user -p$passwd -A -e 'use game_db_new;show tables' | tail -n+2`
for i in $tbs
do
	#echo $i;
	mysqldump -h$host -P$port -u$user -p$passwd game_db_new $i > $src/$dir/$i.sql
done

tar -zcvf $dir.tar.gz $dir
scp $src/$dir.tar.gz $dest
rm -f $src/$dir.tar.gz

echo "back mysql success"
