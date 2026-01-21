---
slug: /cloud/managed-postgres/extensions
sidebar_label: '扩展'
title: 'PostgreSQL 扩展'
description: 'ClickHouse Managed Postgres 中可用的 PostgreSQL 扩展'
keywords: ['Postgres 扩展', 'postgis', 'pgvector', 'pg_cron', 'PostgreSQL 扩展']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

<PrivatePreviewBadge />

托管 Postgres 包含一组精心挑选的扩展，用于增强数据库的功能。下面是可用扩展及其版本的列表。


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

| Extension | Version | Description |
|-----------|---------|-------------|
| `h3` | 4.2.3 | PostgreSQL 的 H3 绑定 |
| `h3_postgis` | 4.2.3 | H3 与 PostGIS 集成 |
| `hll` | 2.19 | 用于存储 HyperLogLog 数据的类型 |
| `hypopg` | 1.4.2 | PostgreSQL 的假设索引 |
| `ip4r` | 2.4 | IPv4 和 IPv6 范围索引类型 |
| `mysql_fdw` | 1.2 | 用于查询 MySQL 服务器的外部数据封装器 |
| `orafce` | 4.16 | 模拟 Oracle RDBMS 部分函数和包的函数与运算符 |
| `pg_clickhouse` | 0.1 | 用于从 PostgreSQL 查询 ClickHouse 数据库的接口 |
| `pg_cron` | 1.6 | PostgreSQL 的作业调度器 |
| `pg_hint_plan` | 1.8.0 | PostgreSQL 的优化器提示 |
| `pg_ivm` | 1.13 | PostgreSQL 上的增量视图维护 |
| `pg_partman` | 5.3.1 | 用于按时间或 ID 管理分区表的扩展 |
| `pg_repack` | 1.5.3 | 在 PostgreSQL 数据库中以最小锁定重组表 |
| `pg_similarity` | 1.0 | 支持相似度查询 |
| `pgaudit` | 18.0 | 提供审计功能 |
| `pglogical` | 2.4.6 | PostgreSQL 逻辑复制 |
| `pgrouting` | 4.0.0 | pgRouting 扩展 |
| `pgtap` | 1.3.4 | PostgreSQL 的单元测试扩展 |
| `plpgsql_check` | 2.8 | 针对 plpgsql 函数的增强检查 |
| `postgis` | 3.6.1 | PostGIS 几何和地理空间类型及函数 |
| `postgis_raster` | 3.6.1 | PostGIS 栅格类型及函数 |
| `postgis_sfcgal` | 3.6.1 | PostGIS SFCGAL 函数 |
| `postgis_tiger_geocoder` | 3.6.1 | PostGIS tiger 地理编码和反向地理编码器 |
| `postgis_topology` | 3.6.1 | PostGIS 拓扑空间类型及函数 |
| `address_standardizer` | 3.6.1 | 用于将地址解析为各个组成元素，通常用于支持地理编码中的地址规范化步骤。 |
| `address_standardizer_data_us` | 3.6.1 | Address Standardizer 美国数据集示例 |
| `prefix` | 1.2.0 | PostgreSQL 的前缀范围模块 |
| `semver` | 0.41.0 | 语义版本数据类型 |
| `unit` | 7 | SI 单位扩展 |
| `vector` | 0.8.1 | 向量数据类型以及 ivfflat 和 hnsw 访问方法 |

## pg_clickhouse extension \{#pg-clickhouse\}

在每个托管的 Postgres 实例中都预装了 `pg_clickhouse` 扩展。它允许在 PostgreSQL 中直接查询 ClickHouse 数据库，从而为事务和分析提供统一的查询层。

有关安装配置和使用方法的详细信息，请参阅 [pg_clickhouse 文档](/integrations/pg_clickhouse)。