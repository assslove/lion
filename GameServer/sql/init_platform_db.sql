# 总统计表
drop table if exists t_stat;
create table t_stat (
	`type` int unsigned NOT NULL COMMENT '三网',
	`sum` int unsigned NOT NULL COMMENT '总数',
	primary key(`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
