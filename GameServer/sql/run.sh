#!/bin/bash

# 管理数据库信息配置
# ===========================================

DB_IP='10.96.29.36'		# 管理数据库IP
DB_PORT=3306			# 管理数据库端口
DB_USER=houbin			# 管理数据库用户名
DB_PSWD=123456			# 管理数据库用户密码
DB_NAME=bleach_global			# 管理数据库名
EXT_IP='119.15.139.149'	# 网关对外IP
SERVER_IP='10.96.29.36'	# 游戏服务器IP

# ===========================================


create_db_sql="create database if not exists ${DB_NAME}"
mysql -h${DB_IP} -P${DB_PORT} -u${DB_USER} -p${DB_PSWD} -e "$create_db_sql"
mysql -h${DB_IP} -P${DB_PORT} -u${DB_USER} -p${DB_PSWD} ${DB_NAME} < init_global_db.sql

echo "初始化区服列表 ..."
echo $sql
echo "初始化区服列表成功"
