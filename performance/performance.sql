drop table if exists t_log;
create table t_log (
	`id` int unsigned not null default 0, 
	`tm` int unsigned not null default 0
) ENGINE=InnoDB default charset=utf8;
