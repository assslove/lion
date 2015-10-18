# 初始化区服列表数据库
drop table if exists Zone;
create table Zone (
	`serv_id` int unsigned NOT NULL COMMENT '服务器编号',
	`serv_name` varchar(128) NOT NULL COMMENT '区服名字',
	`remote_ip` varchar(16)  NOT NULL COMMENT '服务器ip',
	`port` smallint unsigned NOT NULL COMMENT '服务器端口号',
	`state` tinyint unsigned NOT NULL COMMENT '1-流畅 2-拥挤 3-维护',
	`recommend_flag` tinyint unsigned DEFAULT 0 COMMENT '是否推荐 0-不推荐 1-推荐',
	`publish_time` int unsigned NOT NULL COMMENT '服务器发布时间',
	primary key(`serv_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

#初始化区角色表
drop table if exists ZoneRole;
create table ZoneRole (
	`mobage_id` bigint unsigned NOT NULL COMMENT '梦宝谷id',
	`serv_id` int unsigned NOT NULL COMMENT '服务器id',
	`serv_name` varchar(128) NOT NULL COMMENT '服务器名称',
	primary key(`mobage_id`,`serv_id`),
	index(`mobage_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
#初始化邮件历史
drop table if exists MailHistory;
create table MailHistory (
    `mail_id`   int unsigned NOT NULL COMMENT '邮件id',
    `role_id`   varchar(21) NOT NULL COMMENT '角色id, 为0表示群发',
    `serv_id`   int unsigned NOT NULL COMMENT '服务器id',
    `valid_day`  int unsigned NOT NULL COMMENT '有效期',
    `title`     varchar(256) NOT NULL COMMENT '标题',
    `content`   varchar(1024) NOT NULL COMMENT '内容',
    `sender`    varchar(64) NOT NULL COMMENT '发件人',
    `items`     varbinary(256)  COMMENT '附件',
    `flag`     tinyint unsigned NOT NULL default 0 COMMENT '是否发送成功 1表示成功',
    `send_type` tinyint unsigned NOT　NULL default 0 COMMENT '发送类型 0-全部用户 1-注册用户',
    primary key(`mail_id`, `role_id`, `serv_id`)
);

#礼品配置表
drop table if exists `GiftConfig`;
create table `GiftConfig`(
    `id` int(10) unsigned not null default '0' COMMENT '礼品表配置id',
    `name` varchar(33) not null default '' COMMENT '礼品名称',
    `type` tinyint(3) unsigned not null default '0' COMMENT '礼包类型',
    `group` int(10) unsigned not null default '0' COMMENT '礼包组别',
    `limit_num` int(10) unsigned not null default '0' COMMENT '限领次数',
    `start_time` int(10) unsigned not null default '0' COMMENT '有效开始时间',
    `end_time` int(10) unsigned not null default '0' COMMENT '有效结束时间',
    `binary_ver` tinyint unsigned not null default '0' COMMENT '后台版本 0-测试 1-正式',
    `rewards` blob COMMENT '奖励',
    primary key(`id`)
)ENGINE=InnoDB default CHARSET=utf8;

#码表
drop table if exists `GiftCode`;
create table `GiftCode`(
    `code` varchar(14) not null default '' COMMENT '码',
    `configid` int(10) unsigned not null default '0' COMMENT '礼品配置表id',
    `use_count` int(10) unsigned not null default '0' COMMENT '礼品码使用数量',
    primary key(`code`)
)ENGINE=InnoDB default CHARSET=utf8;

#生成码表批次
drop table if exists `GiftCodeIndex`;
create table `GiftCodeIndex`(
    `code_index` int(10) unsigned  not null default '0' COMMENT '礼品码生成唯一性序号'
)ENGINE=InnoDB default CHARSET=utf8;

insert into GiftCodeIndex values(0);

DROP PROCEDURE IF EXISTS `P_GET_GIFT_CODE_INDEX`;
create PROCEDURE P_GET_GIFT_CODE_INDEX()
BEGIN
	update GiftCodeIndex set code_index = code_index + 1;
	select code_index from GiftCodeIndex;
END
;;
DELIMITER ;

#用户管理
drop table if exists `User`;
create table `User`(
	`username` varchar(16) COMMENT '用户名',
	`password` varchar(64) COMMENT '密码',
	`type` tinyint COMMENT '类型',
	primary key(username)
) ENGINE=InnoDB default CHARSET=utf8;

#服务器状态
drop table if exists `ServerState`;
create table `ServerState`(
	`zone` smallint unsigned COMMENT '区号',
	`id` tinyint unsigned COMMENT '编号',
	`type` tinyint unsigned COMMENT '类型',
	`state` tinyint unsigned COMMENT '类型 0-正常 1-异常',
	`chksum` varchar(128) COMMENT '校验信息',
	`last_time` int unsigned COMMENT '最后一次更新时间',
	primary key(`zone`,`id`,`type`)
) ENGINE=InnoDB default CHARSET=utf8;

#角色管理
drop table if exists `RoleConfig`;
create table `RoleConfig` (
    `id` tinyint unsigned NOT NULL COMMENT '角色类型id',
    `name` varchar(32) NOT NULL COMMENT '角色名称',
    `perm` varchar(128) NOT NULL COMMENT '权限标志位 blob数据',
    primary key(`id`)
) ENGINE=InnoDB default CHARSET=utf8;

#公告管理
drop table if exists `Notice`;
create table `Notice` (
    `filename` char(40) NOT NULL COMMENT '文件名',
    `title` varchar(64) NOT NULL COMMENT '标题',
    `order` tinyint NOT NULL COMMENT '显示顺序',
    `begin_time` int unsigned NOT NULL COMMENT '开始时间',
    `end_time` int unsigned NOT NULL COMMENT '结束时间',
    primary key(`filename`)
) ENGINE=InnoDB default CHARSET=utf8;

#活动配置表
drop table if exists `ActivityConfig`;
create table `ActivityConfig` (
    `id` int unsigned NOT NULL COMMENT '活动id' auto_increment,
    `type` tinyint NOT NULL default 0 COMMENT '类型',
    `sub_type` tinyint NOT NULL default 0 COMMENT '子类型',
    `server_list` varbinary(1000) NOT NULL default 0 COMMENT '服务器列表',
    `show_time` int unsigned NOT NULL COMMENT '展示开始时间',
    `begin_time` int unsigned NOT NULL COMMENT '开始时间',
    `end_time` int unsigned NOT NULL COMMENT '结束时间',
    `close_time` int unsigned NOT NULL COMMENT '关闭时间',
    `title` varchar(32) NOT NULL COMMENT '标题',
    `ad_pic` varchar(32) NOT NULL COMMENT '广告图名称',
    `description` varchar(1000) NOT NULL COMMENT '规则文本',
    `max_id` int unsigned NOT NULL COMMENT '领奖条件ID自增值',
    `info` varbinary(4096) NOT NULL COMMENT '活动',
    primary key(`id`)
) ENGINE=InnoDB default CHARSET=utf8;

#服务器区服配置表
drop table if exists `ZoneConfig`;
create table `ZoneConfig` (
    `id` int unsigned NOT NULL COMMENT '区号',
    `name` varchar(64) NOT NULL COMMENT '服务器名字',
    `interface` varchar(10) NOT NULL COMMENT '网络接口',
    `mysql_db`  varchar(32) NOT NULL COMMENT '数据库名',
    `mysql_host` char(16) NOT NULL COMMENT '数据库ip',
    `mysql_port` smallint unsigned NOT NULL COMMENT '端口号',
    `mysql_user` varchar(32) NOT NULL COMMENT 'mysql用户名',
    `mysql_passwd` varchar(256) NOT NULL COMMENT 'mysql密码',
    `code_src` varchar(32) NOT NULL COMMENT '代码目录',
    `state` tinyint unsigned NOT NULL COMMENT  '1-流畅 2-拥挤 3-维护',
	`recommend_flag` tinyint unsigned DEFAULT 0 COMMENT '是否推荐 0-不推荐 1-推荐',
    `publish_time` int unsigned NOT NULL COMMENT '发布时间',
    `step` tinyint unsigned NOT NULL COMMENT '步数',
    primary key(`id`)
) ENGINE=InnoDB default CHARSET=utf8;

#服务器ssh认证列表
drop table if exists `ZoneServer`;
create table `ZoneServer` (
    `id` int unsigned NOT NULL COMMENT '区号',
    `host` varchar(16) NOT NULL COMMENT '主机ip',
    `port` tinyint unsigned NOT NULL COMMENT '主机port',
    `username` varchar(32) NOT NULL COMMENT '主机用户名',
    `passwd` varchar(256) NOT NULL COMMENT '主机密码',
    `ext_ip` varchar(16) NOT NULL COMMENT '外网ip',
    primary key(`id`, `host`)
) ENGINE=InnoDB default CHARSET=utf8;

drop table if exists `ZoneGameServer`;
create table `ZoneGameServer` (
    `zone_id` int unsigned NOT NULL COMMENT '区号',
    `serv_id` int unsigned NOT NULL COMMENT '服号',
    `type` smallint unsigned NOT NULL COMMENT '服务器类型',
    `name` varchar(32) not null default '',                         # 服务器名称
    `ip` varchar(15) not null default '127.0.0.1',                  # 服务器IP
    `port` smallint(5) unsigned not null default '0',               # 服务器端口
    `ext_ip` varchar(15) not null default '127.0.0.1',              # 服务器外网地址
    `ext_port` smallint(5) unsigned not null default '0',           # 服务器外网端口
    `net_type` tinyint(3) unsigned not null default '0',                # 网络类型
    `state` tinyint(3) unsigned not null default '1',               # 服务器是否正常使用
    primary key(`zone_id`, `serv_id`, `type`)                                       # 编号和类型对应唯一的服务器
) ENGINE=InnoDB default CHARSET=utf8;

#内网服务器配置
drop table if exists `ZoneInnerServer`;
create table `ZoneInnerServer` (
    `id` int unsigned NOT NULL COMMENT '服务器号' auto_increment,
    `name` varchar(32) NOT NULL COMMENT '服务器名称',
    `host` varchar(16) NOT NULL COMMENT '主机ip',
    `port` tinyint NOT NULL COMMENT '端口',
    `username` varchar(32) NOT NULL COMMENT '主机用户名',
    `passwd` varchar(256) NOT NULL COMMENT '主机密码',
    `code_src` varchar(64) NOT NULL COMMENT '内网代码存放地址',
    primary key(`id`)
);
