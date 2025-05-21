---
'description': '数据库引擎文档'
'slug': '/engines/database-engines/'
'toc_folder_title': 'Database Engines'
'toc_priority': 27
'toc_title': 'Introduction'
'title': '数据库引擎'
---




# 数据库引擎

数据库引擎使您能够使用表。默认情况下，ClickHouse 使用 [Atomic](../../engines/database-engines/atomic.md) 数据库引擎，它提供可配置的 [表引擎](../../engines/table-engines/index.md) 和 [SQL 方言](../../sql-reference/syntax.md)。

以下是可用数据库引擎的完整列表。请访问链接以获取更多详细信息：

<!-- 此页面的目录表由 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh 自动生成
来自 YAML 前置字段: slug, description, title。

如果您发现错误，请编辑页面本身的 YML 前置信息。
--> | 页面 | 描述 |
|-----|-----|
| [Replicated](/engines/database-engines/replicated) | 此引擎基于 Atomic 引擎。它支持通过 DDL 日志（写入 ZooKeeper 并在给定数据库的所有副本上执行）进行元数据复制。 |
| [MySQL](/engines/database-engines/mysql) | 允许连接到远程 MySQL 服务器上的数据库，并执行 `INSERT` 和 `SELECT` 查询以在 ClickHouse 和 MySQL 之间交换数据。 |
| [MaterializedPostgreSQL](/engines/database-engines/materialized-postgresql) | 创建一个包含 PostgreSQL 数据库中表的 ClickHouse 数据库。 |
| [Atomic](/engines/database-engines/atomic) | `Atomic` 引擎支持非阻塞的 `DROP TABLE` 和 `RENAME TABLE` 查询，以及原子 `EXCHANGE TABLES` 查询。默认情况下使用 `Atomic` 数据库引擎。 |
| [Lazy](/engines/database-engines/lazy) | 仅在上次访问后 `expiration_time_in_seconds` 秒内将表保留在 RAM 中。仅可与 Log 类型的表一起使用。 |
| [PostgreSQL](/engines/database-engines/postgresql) | 允许连接到远程 PostgreSQL 服务器上的数据库。 |
| [Backup](/engines/database-engines/backup) | 允许以只读模式立即附加来自备份的表/数据库。 |
| [SQLite](/engines/database-engines/sqlite) | 允许连接到 SQLite 数据库，并执行 `INSERT` 和 `SELECT` 查询以在 ClickHouse 和 SQLite 之间交换数据。 |
