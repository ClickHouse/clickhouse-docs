---
slug: /cloud/managed-postgres/extensions
sidebar_label: '扩展'
title: 'PostgreSQL 扩展'
description: 'ClickHouse Managed Postgres 中可用的 PostgreSQL 扩展'
keywords: ['Postgres 扩展', 'postgis', 'pgvector', 'pg_cron', 'PostgreSQL 扩展']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="extensions" />

托管 Postgres 包含一组精心挑选的扩展，用于增强数据库的功能。下面是可用扩展的列表。


## 安装扩展 \{#installing-extensions\}

要安装扩展，请连接到您的数据库并执行：

```sql
CREATE EXTENSION extension_name;
```

若要查看当前安装了哪些扩展：

```sql
SELECT * FROM pg_extension;
```

要查看所有可用扩展及其版本：

```sql
SELECT * FROM pg_available_extensions;
```


## 可用扩展 \{#available-extensions\}

| 扩展                               | 版本     | 说明                                                  |
| -------------------------------- | ------ | --------------------------------------------------- |
| `address_standardizer`           | 3.6.1  | 用于将地址解析为各个组成部分                                      |
| `address_standardizer-3`         | 3.6.1  | address&#95;standardizer 的别名                        |
| `address_standardizer_data_us`   | 3.6.1  | Address Standardizer 美国地址数据集示例                      |
| `address_standardizer_data_us-3` | 3.6.1  | address&#95;standardizer&#95;data&#95;us 的别名        |
| `adminpack`                      | 2.1    | 用于 PostgreSQL 的管理函数（*仅限 PG16*）                      |
| `amcheck`                        |        | 用于校验关系完整性的函数                                        |
| `autoinc`                        | 1.0    | 用于字段自增的函数                                           |
| `bloom`                          | 1.0    | Bloom 访问方法——基于签名文件的索引                               |
| `bool_plperl`                    | 1.0    | 在 bool 与 plperl 之间进行转换                              |
| `bool_plperlu`                   | 1.0    | 实现 bool 与 plperlu 之间的转换                             |
| `btree_gin`                      | 1.3    | 支持在 GIN 中为常见数据类型建立索引                                |
| `btree_gist`                     | 1.8    | 支持在 GiST 中为常见数据类型建立索引                               |
| `citext`                         | 1.8    | 用于大小写不敏感字符串的数据类型                                    |
| `cube`                           | 1.5    | 多维立方体数据类型                                           |
| `dblink`                         | 1.2    | 从当前数据库连接到其他 PostgreSQL 数据库                          |
| `dict_int`                       | 1.0    | 整数型文本搜索字典模板                                         |
| `dict_xsyn`                      | 1.0    | 用于扩展同义词处理的文本搜索字典模板                                  |
| `earthdistance`                  | 1.2    | 计算地球表面的大圆距离                                         |
| `file_fdw`                       | 1.0    | 用于访问平面文件的外部数据封装器                                    |
| `fuzzystrmatch`                  | 1.2    | 计算字符串之间的相似度和距离                                      |
| `h3`                             | 4.2.3  | 适用于 PostgreSQL 的 H3 绑定                              |
| `h3_postgis`                     | 4.2.3  | H3 与 PostGIS 集成                                     |
| `hll`                            | 2.19   | 用于存储 HyperLogLog 数据的数据类型                            |
| `hstore`                         | 1.8    | 用于存储键值对集合的数据类型                                      |
| `hstore_plperl`                  | 1.0    | 在 hstore 和 plperl 之间进行转换                            |
| `hstore_plperlu`                 | 1.0    | 在 hstore 与 plperlu 之间转换                             |
| `hypopg`                         | 1.4.2  | PostgreSQL 的假设索引                                    |
| `intagg`                         | 1.1    | 整数聚合与枚举（已弃用）                                        |
| `insert_username`                | 1.0    | 用于记录是谁修改了表的函数                                       |
| `intarray`                       | 1.5    | 为一维整数数组提供的函数、运算符和索引支持                               |
| `ip4r`                           | 2.4    | IPv4 和 IPv6 范围索引类型                                  |
| `isn`                            | 1.3    | 国际商品编号标准的数据类型                                       |
| `jsonb_plperl`                   | 1.0    | 在 jsonb 与 plperl 之间进行转换                             |
| `jsonb_plperlu`                  | 1.0    | jsonb 与 plperlu 之间的转换                               |
| `lo`                             | 1.2    | 大对象维护                                               |
| `ltree`                          | 1.3    | 用于层级树形结构的数据类型                                       |
| `moddatetime`                    | 1.0    | 用于记录最近修改时间的函数                                       |
| `mysql_fdw`                      | 1.2    | 用于查询 MySQL 服务器的外部数据包装器                              |
| `old_snapshot`                   | 1.0    | 用于支持 old&#95;snapshot&#95;threshold 的工具 *(仅限 PG16)* |
| `orafce`                         | 4.16   | 用于仿真 Oracle RDBMS 中部分函数和包的函数和运算符                    |
| `pageinspect`                    | 1.13   | 在底层检查数据库页面内容                                        |
| `pg_buffercache`                 |        | 检查共享缓冲区缓存内容                                         |
| `pg_clickhouse`                  | 0.1    | 用于从 PostgreSQL 查询 ClickHouse 数据库的接口                 |
| `pg_cron`                        | 1.6    | PostgreSQL 的任务调度器                                   |
| `pg_freespacemap`                | 1.3    | 查看空闲空间映射 (FSM)                                      |
| `pg_hint_plan`                   |        | 为 PostgreSQL 提供优化器提示                                |
| `pg_ivm`                         | 1.13   | 在 PostgreSQL 上实现增量 VIEW 维护                          |
| `pg_logicalinspect`              | 1.0    | 检查逻辑解码组件的函数 *(PG18+)*                               |
| `pg_partman`                     | 5.4.0  | 用于基于时间或 ID 管理分区表的扩展                                 |
| `pg_prewarm`                     | 1.2    | 预热表和索引数据                                            |
| `pg_repack`                      | 1.5.3  | 在 PostgreSQL 数据库中以尽量少的锁重组表                          |
| `pg_similarity`                  | 1.0    | 支持相似性查询                                             |
| `pg_stat_statements`             |        | 跟踪所有已执行 SQL 语句的计划和执行统计信息                            |
| `pg_surgery`                     | 1.0    | 用于修复损坏关系的扩展                                         |
| `pg_trgm`                        | 1.6    | 基于三元组的文本相似度计算和索引搜索                                  |
| `pg_visibility`                  | 1.2    | 查看可见性映射（VM）和页面级可见性信息                                |
| `pg_walinspect`                  | 1.1    | 用于检查 PostgreSQL 预写日志（WAL）内容的函数                      |
| `pgaudit`                        |        | 提供审计功能                                              |
| `pgcrypto`                       | 1.4    | 密码学函数                                               |
| `pglogical`                      | 2.4.6  | PostgreSQL 逻辑复制功能                                   |
| `pglogical_origin`               | 1.0.0  | 用于从 Postgres 9.4 升级时保持兼容性的占位扩展                      |
| `pgrouting`                      | 4.0.0  | pgRouting 扩展                                        |
| `pgrowlocks`                     | 1.2    | 显示行级锁信息                                             |
| `pgstattuple`                    | 1.5    | 显示元组级统计信息                                           |
| `pgtap`                          | 1.3.4  | PostgreSQL 的单元测试框架                                  |
| `plperl`                         | 1.0    | PL/Perl 过程语言                                        |
| `plperlu`                        | 1.0    | PL/PerlU 不受信任的过程式语言                                 |
| `plpgsql`                        | 1.0    | PL/pgSQL 过程语言                                       |
| `plpgsql_check`                  | 2.8    | 用于对 plpgsql 函数进行增强检查                                |
| `postgis`                        | 3.6.1  | PostGIS geometry 与 geography 空间类型和函数                |
| `postgis-3`                      | 3.6.1  | PostGIS 的别名                                         |
| `postgis_raster`                 | 3.6.1  | PostGIS 栅格类型和函数                                     |
| `postgis_raster-3`               | 3.6.1  | postgis&#95;raster 的别名                              |
| `postgis_sfcgal`                 | 3.6.1  | PostGIS SFCGAL 函数                                   |
| `postgis_sfcgal-3`               | 3.6.1  | postgis&#95;sfcgal 的别名                              |
| `postgis_tiger_geocoder`         | 3.6.1  | PostGIS Tiger 正向和反向地理编码器                            |
| `postgis_tiger_geocoder-3`       | 3.6.1  | postgis&#95;tiger&#95;geocoder 的别名                  |
| `postgis_topology`               | 3.6.1  | PostGIS 拓扑空间类型及函数                                   |
| `postgis_topology-3`             | 3.6.1  | postgis&#95;topology 的别名                            |
| `postgres_fdw`                   | 1.2    | 用于访问远程 PostgreSQL 服务器的外部数据封装器                       |
| `prefix`                         | 1.2.0  | PostgreSQL 的前缀范围（Prefix Range）模块                    |
| `refint`                         | 1.0    | 用于实现参照完整性的函数（已弃用）                                   |
| `seg`                            | 1.4    | 用于表示线段或浮点数区间的数据类型                                   |
| `semver`                         | 0.41.0 | 语义化版本号数据类型                                          |
| `sslinfo`                        | 1.2    | SSL 证书相关信息                                          |
| `tablefunc`                      | 1.0    | 用于操作整张表的函数，包括交叉表（crosstab）                          |
| `tcn`                            | 1.0    | 基于触发器的变更通知                                          |
| `tsm_system_rows`                | 1.0    | 以行数为限制条件的 TABLESAMPLE 方法                            |
| `tsm_system_time`                | 1.0    | 以毫秒为单位指定时间上限的 TABLESAMPLE 方法                        |
| `unaccent`                       | 1.1    | 去除重音符号的文本搜索字典                                       |
| `unit`                           | 7      | 提供 SI 单位支持的扩展                                       |
| `uuid-ossp`                      | 1.1    | 生成通用唯一标识符 (UUID)                                    |
| `vector`                         | 0.8.1  | 向量数据类型以及 ivfflat 和 hnsw 访问方法                        |
| `xml2`                           | 1.2    | XPath 查询和 XSLT                                      |

## pg_clickhouse extension \{#pg-clickhouse\}

在每个托管的 Postgres 实例中都预装了 `pg_clickhouse` 扩展。它允许在 PostgreSQL 中直接查询 ClickHouse 数据库，从而为事务和分析提供统一的查询层。

有关安装配置和使用方法的详细信息，请参阅 [pg_clickhouse 文档](/integrations/pg_clickhouse)。