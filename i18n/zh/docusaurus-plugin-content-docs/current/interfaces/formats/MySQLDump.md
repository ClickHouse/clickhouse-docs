---
alias: []
description: 'MySQLDump 格式文档'
input_format: true
keywords: ['MySQLDump']
output_format: false
slug: /interfaces/formats/MySQLDump
title: 'MySQLDump'
doc_type: 'reference'
---

| 输入 | 输出  | 别名 |
|-------|---------|-------|
| ✔     | ✗       |       |



## Description {#description}

ClickHouse 支持读取 MySQL [转储文件](https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html)。

它会读取转储文件中属于单个表的所有 `INSERT` 查询的数据。
如果转储文件中包含多个表,默认情况下会读取第一个表的数据。

:::note
此格式支持模式推断:如果转储文件中包含指定表的 `CREATE` 查询,则从该查询推断表结构;否则,将从 `INSERT` 查询的数据中推断模式。
:::


## 使用示例 {#example-usage}

给定以下 SQL 转储文件:

```sql title="dump.sql"
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `test` (
  `x` int DEFAULT NULL,
  `y` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `test` VALUES (1,NULL),(2,NULL),(3,NULL),(3,NULL),(4,NULL),(5,NULL),(6,7);
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `test 3` (
  `y` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `test 3` VALUES (1);
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `test2` (
  `x` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `test2` VALUES (1),(2),(3);
```

可以运行以下查询:

```sql title="查询"
DESCRIBE TABLE file(dump.sql, MySQLDump)
SETTINGS input_format_mysql_dump_table_name = 'test2'
```

```response title="响应"
┌─name─┬─type────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ x    │ Nullable(Int32) │              │                    │         │                  │                │
└──────┴─────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

```sql title="查询"
SELECT *
FROM file(dump.sql, MySQLDump)
SETTINGS input_format_mysql_dump_table_name = 'test2'
```

```response title="响应"
┌─x─┐
│ 1 │
│ 2 │
│ 3 │
└───┘
```


## 格式设置 {#format-settings}

您可以使用 [`input_format_mysql_dump_table_name`](/operations/settings/settings-formats.md/#input_format_mysql_dump_table_name) 设置指定要读取数据的表名。
如果将 `input_format_mysql_dump_map_columns` 设置为 `1`,且转储文件包含指定表的 `CREATE` 查询或 `INSERT` 查询中的列名,则输入数据中的列将按名称映射到表中的列。
如果将 [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 设置为 `1`,则会跳过未知名称的列。
