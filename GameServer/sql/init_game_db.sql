# 初始化用户信息表
drop table if exists t_user;
create table t_user (
	`uid` int unsigned NOT NULL COMMENT '用户id',
	`name` varchar(32) NOT NULL COMMENT '昵称',
	`head_icon` tinyint unsigned NOT NULL default 0 COMMENT '头像',
	`max_copy` int unsigned NOT NULL default 0 COMMENT '通关数',
	`copy_stars` int unsigned NOT NULL COMMENT '通关总星数',
	`party_lv` tinyint unsigned NOT NULL COMMENT '宠物派对等级',
	`cash` int unsigned NOT NULL default 0 COMMENT '钻石',
	`gold` int unsigned NOT NULL default 0 COMMENT '金币',
	`hp` int unsigned NOT NULL default 0 COMMENT '体力',
	`use_pet` int unsigned NOT NULL default 0 COMMENT '出战宠物',
	`last_login` int unsigned NOT NULL COMMENT '最后登录时间',
	`reg_time` int unsigned NOT NULL COMMENT '注册时间',
	primary key(`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

#初始化区关卡表
drop table if exists t_copy;
create table  t_copy(
	`uid` int unsigned NOT NULL COMMENT '用户id',
	`info` varbinary(2048) NOT NULL COMMENT '副本信息',
	primary key(`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

#初始化道具表
drop table if exists t_item;
create table t_item (
	`uid` int unsigned NOT NULL COMMENT '用户id',
	`info` varbinary(2048) NOT NULL COMMENT '道具信息',
	primary key(`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;;

#初始化宠物表
drop table if exists t_pet;
create table t_pet (
	`uid` int unsigned NOT NULL COMMENT '用户id',
	`pet` varbinary(2048) COMMENT '宠物信息',
	primary key(`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

#初始化好友邮件表
drop table if exists t_friend_mail;
create table t_friend_mail (
	`uid` int unsigned NOT NULL COMMENT '用户id',
	`mails` varbinary(2000) NOT NULL COMMENT '邮件信息',
	`get_hp_times` tinyint unsigned NOT NULL COMMENT '领取体力的次数',
	`get_gold_times` tinyint unsigned NOT NULL COMMENT '领取金币的次数',
	`friendid` varbinary(64) default '' '领取体力成功的好友列表',
	primary key(`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

#初始化好友信息表
drop table if exists t_friend;
create table t_friend (
	`uid` int unsigned NOT NULL COMMENT '用户id',
	`friendlist` varbinary(2000) NOT NULL COMMENT '好友列表',
	primary key(`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

#初始化宠物派对
drop table if exists t_pet_party;
create table t_pet_party (
	`uid` int unsigned NOT NULL COMMENT '用户id',
	`info` varbinary(2000) NOT NULL COMMENT '宏物派对信息',
	primary key(`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

#初始化充值记录表
drop table if exists t_recharge;
create table t_recharge (
	`uid` int unsigned NOT NULL COMMENT '用户id',
	`log_t` int unsigned NOT NULL  COMMENT '发生时间',
	`product_id` varchar(64) NOT NULL COMMENT '商品id',
	`cost` int unsigned NOT NULL COMMENT '花费',
	`cash` int unsigned NOT NULL COMMENT '获得钻石',
	`order_id` varchar(128) NOT NULL COMMENT '订单号',
	primary key(`log_t`, `uid`),
	index(`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
#初始化签到表
drop table if exists t_sign;
create table t_sign (
	`uid` int unsigned NOT NULL COMMENT '用户id',
	`sign_day` tinyint unsigned NOT NULL default 0 COMMENT '已经签到天数',
	`sign_flag` tinyint unsigned NOT NULL default 0 COMMENT '今天是否已经签到 0-未签 1-已签',
	`fill_check` tinyint unsigned NOT NULL default 0 COMMENT '补签天数',
	primary key(`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
# 邮件表
drop table if exists t_mail;
create table t_mail(
	`uid` int unsigned NOT NULL COMMENT '用户id',
	`check_tm` int unsigned NOT NULL COMMENT '检查时间',
	`info` varbinary(4096) NOT NULL COMMENT '邮件内容',
	primary key(`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

# limit信息
drop table if exists t_limit;
create table t_limit (
	`uid` int unsigned NOT NULL COMMENT '用户id',
	`info` varbinary(4096) NOT NULL COMMENT '邮件内容',
	primary key(`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
