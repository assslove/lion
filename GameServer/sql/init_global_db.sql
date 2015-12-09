# 初始化全局表
#初始化用户id生成表
drop table if exists t_uid;
create table t_uid (
	`uid` int unsigned NOT NULL COMMENT '用户id',
	`flag` tinyint unsigned NOT NULL COMMENT '标志 0-未用 1-已用'
	primary key(`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

#初始化账号表 与其它账号绑定关系
drop table if exists t_account;
create table t_account (
	`uid` int unsigned NOT NULL COMMENT '用户id',
	`channel` int unsigned NOT NULL COMMENt '渠道id',
	`channel_uid` varchar(64) NOT NULL COMMENT '渠道用户id',
	primary key(`uid`),
	index(`channel`, `channel_uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
