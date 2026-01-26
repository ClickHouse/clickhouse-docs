---
slug: /integrations/mysql
sidebar_label: 'MySQL'
title: 'MySQL'
hide_title: true
description: '介绍 MySQL 集成的页面'
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
  - website: 'https://github.com/ClickHouse/clickhouse'
keywords: ['mysql', '数据库集成', '外部表', '数据源', 'SQL 数据库']
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

# 在 ClickHouse 中集成 MySQL \{#integrating-mysql-with-clickhouse\}

本页介绍如何使用 `MySQL` 表引擎从 MySQL 表中读取数据。

:::note
在 ClickHouse Cloud 中，也可以使用 [MySQL ClickPipe](/integrations/clickpipes/mysql)（目前处于公开测试阶段），便捷地将 MySQL 表中的数据迁移到 ClickHouse。
:::

## 使用 MySQL 表引擎将 ClickHouse 连接到 MySQL \{#connecting-clickhouse-to-mysql-using-the-mysql-table-engine\}

`MySQL` 表引擎允许将 ClickHouse 连接到 MySQL。可以在 ClickHouse 或 MySQL 表中执行 **SELECT** 和 **INSERT** 语句。本文介绍 `MySQL` 表引擎的基本用法。

### 1. 配置 MySQL \{#1-configure-mysql\}

1. 在 MySQL 中创建一个数据库：

```sql
CREATE DATABASE db1;
```

2. 创建一个表：

```sql
CREATE TABLE db1.table1 (
  id INT,
  column1 VARCHAR(255)
);
```

3. 插入示例数据行：

```sql
INSERT INTO db1.table1
  (id, column1)
VALUES
  (1, 'abc'),
  (2, 'def'),
  (3, 'ghi');
```

4. 创建一个用于连接到 ClickHouse 的用户：

```sql
CREATE USER 'mysql_clickhouse'@'%' IDENTIFIED BY 'Password123!';
```

5. 根据需要授予权限。（在本示例中，为 `mysql_clickhouse` 用户授予了管理员权限。）

```sql
GRANT ALL PRIVILEGES ON *.* TO 'mysql_clickhouse'@'%';
```

:::note
如果您在 ClickHouse Cloud 中使用此功能，可能需要允许 ClickHouse Cloud 的 IP 地址访问您的 MySQL 实例。
有关出站流量的详细信息，请参阅 ClickHouse [Cloud Endpoints API](//cloud/get-started/query-endpoints.md)。
:::

### 2. 在 ClickHouse 中定义一张表 \{#2-define-a-table-in-clickhouse\}

1. 现在让我们创建一个使用 `MySQL` 表引擎的 ClickHouse 表：

```sql
CREATE TABLE mysql_table1 (
  id UInt64,
  column1 String
)
ENGINE = MySQL('mysql-host.domain.com','db1','table1','mysql_clickhouse','Password123!')
```

最少需要的参数为：

| parameter | Description    | example               |
| --------- | -------------- | --------------------- |
| host      | 主机名或 IP        | mysql-host.domain.com |
| database  | MySQL 数据库名称    | db1                   |
| table     | MySQL 表名       | table1                |
| user      | 连接到 MySQL 的用户名 | mysql&#95;clickhouse  |
| password  | 连接到 MySQL 的密码  | Password123!          |

:::note
请参阅 [MySQL table engine](/engines/table-engines/integrations/mysql.md) 文档页面以获取完整的参数列表。
:::

### 3. 测试集成 \{#3-test-the-integration\}

1. 在 MySQL 中插入一行示例数据：

```sql
INSERT INTO db1.table1
  (id, column1)
VALUES
  (4, 'jkl');
```

2. 请注意，来自 MySQL 表的现有行已经出现在 ClickHouse 表中，同时还有您刚刚添加的新行：

```sql
SELECT
    id,
    column1
FROM mysql_table1
```

此时应能看到 4 行：

```response
Query id: 6d590083-841e-4e95-8715-ef37d3e95197

┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ def     │
│  3 │ ghi     │
│  4 │ jkl     │
└────┴─────────┘

返回 4 行。耗时: 0.044 秒。
```

3. 现在向 ClickHouse 表中插入一行数据：

```sql
INSERT INTO mysql_table1
  (id, column1)
VALUES
  (5,'mno')
```

4. 注意 MySQL 中已出现一条新记录：

```bash
mysql> select id,column1 from db1.table1;
```

此时应能看到新行：

```response
+------+---------+
| id   | column1 |
+------+---------+
|    1 | abc     |
|    2 | def     |
|    3 | ghi     |
|    4 | jkl     |
|    5 | mno     |
+------+---------+
5 rows in set (0.01 sec)
```

### 总结 \{#summary\}

`MySQL` 表引擎允许你连接 ClickHouse 与 MySQL，以实现数据的双向交换。有关更多详细信息，请务必查看 [MySQL 表引擎](/sql-reference/table-functions/mysql.md) 的文档页面。
