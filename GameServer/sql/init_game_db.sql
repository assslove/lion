# 初始化用户信息表
drop table if exists t_user;
create table t_user (
	`uid` int unsigned NOT NULL COMMENT '用户id',
	`name` varchar(32) NOT NULL COMMENT '昵称',
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
	`expire` int unsigned NOT NULL COMMENT '到期时间',
	primary key(`uid`, `itemid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;;

#初始化宠物表
drop table if exists t_pet;
create table t_pet (
	`uid` int unsigned NOT NULL COMMENT '用户id',
	`pet_list` varbinary(1000) COMMENT '宠物列表',
	`pet_equip` varbinary(48) COMMENT '已上阵宠物列表',
	`pet_suit` varbinary(256) COMMENT '宠物套装激活情况'
	`invite_cnt` smallint unsigned COMMENT '派对总人数',
	`party_flag` tinyint unsigned COMMENT '已领取奖励标志',
	primary key(`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;;

#初始化离线消息表
drop table if exists t_msg;
create table t_msg (
	`uid` int unsigned NOT NULL COMMENT '用户id',
	`msg_list` varbinary(2000) COMMENT '离线消息'
	primary key(`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;;


