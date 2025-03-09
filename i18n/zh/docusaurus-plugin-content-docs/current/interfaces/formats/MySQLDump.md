---
title: MySQLDump
slug: /interfaces/formats/MySQLDump
keywords: ['MySQLDump']
input_format: true
output_format: false
alias: []
---

| 输入  | 输出  | 别名 |
|-------|-------|-------|
| ✔     | ✗     |       |

## 描述 {#description}

ClickHouse 支持读取 MySQL [转储](https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html)。

它会读取转储中属于单个表的 `INSERT` 查询的所有数据。
如果有多个表，默认情况下，它会读取第一个表的数据。

:::note
此格式支持模式推断：如果转储中包含指定表的 `CREATE` 查询，则从中推断结构，否则从 `INSERT` 查询的数据中推断模式。
:::

## 示例用法 {#example-usage}

给定以下 SQL 转储文件：

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

我们可以运行以下查询：

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
如果设置 `input_format_mysql_dump_map_columns` 为 `1` 并且转储中包含指定表或列名的 `CREATE` 查询，则输入数据中的列将按名称映射到表中的列。
如果设置 [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 为 `1`，则未知名称的列将被跳过。
