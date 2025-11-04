---
'slug': '/integrations/mysql'
'sidebar_label': 'MySQL'
'title': 'MySQL'
'hide_title': true
'description': '页面描述 MySQL 集成'
'doc_type': 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# 将 MySQL 与 ClickHouse 集成

本页介绍了使用 `MySQL` 表引擎从 MySQL 表读取数据。

:::note
对于 ClickHouse Cloud，您还可以使用 [MySQL ClickPipe](/integrations/clickpipes/mysql)（目前处于公开测试阶段）轻松将数据从您的 MySQL 表移动到 ClickHouse。
:::

## 使用 MySQL 表引擎将 ClickHouse 连接到 MySQL {#connecting-clickhouse-to-mysql-using-the-mysql-table-engine}

`MySQL` 表引擎允许您将 ClickHouse 连接到 MySQL。**SELECT** 和 **INSERT** 语句可以在 ClickHouse 或 MySQL 表中执行。本文描述了如何使用 `MySQL` 表引擎的基本方法。

### 1. 配置 MySQL {#1-configure-mysql}

1.  在 MySQL 中创建一个数据库：
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

3. 插入示例行：
```sql
INSERT INTO db1.table1
  (id, column1)
VALUES
  (1, 'abc'),
  (2, 'def'),
  (3, 'ghi');
```

4. 创建一个连接 ClickHouse 的用户：
```sql
CREATE USER 'mysql_clickhouse'@'%' IDENTIFIED BY 'Password123!';
```

5. 根据需要授予权限。（出于演示目的，`mysql_clickhouse` 用户被授予管理员权限。）
```sql
GRANT ALL PRIVILEGES ON *.* TO 'mysql_clickhouse'@'%';
```

:::note
如果您在 ClickHouse Cloud 中使用此功能，您可能需要允许 ClickHouse Cloud 的 IP 地址访问您的 MySQL 实例。
请查看 ClickHouse [Cloud Endpoints API](//cloud/get-started/query-endpoints.md) 以获取出站流量的详细信息。
:::

### 2. 在 ClickHouse 中定义一个表 {#2-define-a-table-in-clickhouse}

1. 现在让我们创建一个使用 `MySQL` 表引擎的 ClickHouse 表：
```sql
CREATE TABLE mysql_table1 (
  id UInt64,
  column1 String
)
ENGINE = MySQL('mysql-host.domain.com','db1','table1','mysql_clickhouse','Password123!')
```

最低参数要求如下：

|参数      |描述                         |示例                        |
|---------|----------------------------|----------------------------|
|host     |主机名或 IP                |mysql-host.domain.com      |
|database |mysql 数据库名称           |db1                        |
|table    |mysql 表名称                |table1                     |
|user     |用于连接 MySQL 的用户名    |mysql_clickhouse           |
|password |用于连接 MySQL 的密码      |Password123!               |

:::note
查看 [MySQL 表引擎](/engines/table-engines/integrations/mysql.md) 文档页面以获取完整的参数列表。
:::

### 3. 测试集成 {#3-test-the-integration}

1. 在 MySQL 中插入一行示例数据：
```sql
INSERT INTO db1.table1
  (id, column1)
VALUES
  (4, 'jkl');
```

2. 注意 ClickHouse 表中存在来自 MySQL 表的行，以及您刚刚添加的新行：
```sql
SELECT
    id,
    column1
FROM mysql_table1
```

您应该会看到 4 行：
```response
Query id: 6d590083-841e-4e95-8715-ef37d3e95197

┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ def     │
│  3 │ ghi     │
│  4 │ jkl     │
└────┴─────────┘

4 rows in set. Elapsed: 0.044 sec.
```

3. 让我们在 ClickHouse 表中添加一行：
```sql
INSERT INTO mysql_table1
  (id, column1)
VALUES
  (5,'mno')
```

4. 注意新行出现在 MySQL 中：
```bash
mysql> select id,column1 from db1.table1;
```

您应该会看到新行：
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

### 总结 {#summary}

`MySQL` 表引擎允许您将 ClickHouse 连接到 MySQL，双向交换数据。有关更多详细信息，请务必查看 [MySQL 表引擎](/sql-reference/table-functions/mysql.md) 的文档页面。
