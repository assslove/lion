# 初始化用户信息表
drop table if exists t_user;
create table t_user (
	`uid` int unsigned NOT NULL COMMENT '用户id',
	`name` varchar(128) NOT NULL COMMENT '昵称',
	`qq` int unsigned NOT NULL COMMENT 'qq号',
	`wchat` varchar(32) NOT NULL COMMENT 'wchat号',
	`head_icon` tinyint unsigned NOT NULL COMMENT '头像',
	`max_copy` int unsigned NOT NULL COMMENT '通关数',
	`cash` int unsigned NOT NULL COMMENT '钻石',
	`gold` int unsigned NOT NULL COMMENT '金币',
	`hp` int unsigned NOT NULL COMMENT '体力',
	`last_login` int unsigned NOT NULL COMMENT '最后登录时间',
	`reg_time` int unsigned NOT NULL COMMENT '注册时间',
	primary key(`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

#初始化区关卡表
drop table if exists t_copy;
create table  t_copy(
	`uid` int unsigned NOT NULL COMMENT '用户id',
	`copy_id` int unsigned NOT NULL COMMENT '关卡id',
	`max_score` int unsigned NOT NULL COMMENT '最高积分',
	`star` tinyint unsigned NOT NULL COMMENT '星数',
	primary key(`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

#初始化道具表
drop table if exists t_item;
create table t_item (
	`uid` int unsigned NOT NULL COMMENT '用户id',
	`itemid` int unsigned NOT NULL COMMENT '道具id',
	`count` int unsigned NOT NULL COMMENT '数量',
	primary key(`uid`, `item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;;
#初始化用户id生成表
drop table if exists t_uid;
create table t_uid (
	`uid` int unsigned NOT NULL COMMENT '用户id',
	`flag` tinyint unsigned NOT NULL COMMENT '标志 0-未用 1-已用',
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

#初始化限时道具表
drop table if exists t_limit_item;
create table t_item (
	`uid` int unsigned NOT NULL COMMENT '用户id',
	`itemid` int unsigned NOT NULL COMMENT '道具id',
	`get_time` int unsigned NOT NULL COMMENT '获得时间',
	`expire` int unsigned NOT NULL COMMENT '到期时间',
	primary key(`uid`, `item_id`, `get_time`),
	index(`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

