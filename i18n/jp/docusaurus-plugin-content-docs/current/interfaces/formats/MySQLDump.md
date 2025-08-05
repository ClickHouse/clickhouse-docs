---
alias: []
description: 'MySQLDump形式のドキュメント'
input_format: true
keywords:
- 'MySQLDump'
output_format: false
slug: '/interfaces/formats/MySQLDump'
title: 'MySQLDump'
---



| Input | Output  | Alias |
|-------|---------|-------|
| ✔     | ✗       |       |

## 説明 {#description}

ClickHouse は MySQL の [ダンプ](https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html) を読み込むことをサポートしています。

ダンプ内の単一テーブルに属する `INSERT` クエリからすべてのデータを読み込みます。 
複数のテーブルが存在する場合、デフォルトでは最初のテーブルからデータを読み込みます。

:::note
このフォーマットはスキーマ推論をサポートします：ダンプに指定されたテーブルに対する `CREATE` クエリが含まれている場合、その構造がそこから推論されます。それ以外の場合、`INSERT` クエリのデータからスキーマが推論されます。
:::

## 使用例 {#example-usage}

以下の SQL ダンプファイルが与えられた場合：

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

次のクエリを実行できます：

```sql title="Query"
DESCRIBE TABLE file(dump.sql, MySQLDump) 
SETTINGS input_format_mysql_dump_table_name = 'test2'
```

```response title="Response"
┌─name─┬─type────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ x    │ Nullable(Int32) │              │                    │         │                  │                │
└──────┴─────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

```sql title="Query"
SELECT *
FROM file(dump.sql, MySQLDump)
SETTINGS input_format_mysql_dump_table_name = 'test2'
```

```response title="Response"
┌─x─┐
│ 1 │
│ 2 │
│ 3 │
└───┘
```

## フォーマット設定 {#format-settings}

データを読み込むテーブルの名前を [`input_format_mysql_dump_table_name`](/operations/settings/settings-formats.md/#input_format_mysql_dump_table_name) 設定を使用して指定できます。
設定 `input_format_mysql_dump_map_columns` が `1` に設定されていて、ダンプに指定されたテーブルに対する `CREATE` クエリまたは `INSERT` クエリ内のカラム名が含まれている場合、入力データのカラムがテーブルのカラムに名前でマッピングされます。
未知の名前のカラムは、設定 [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が `1` に設定されている場合はスキップされます。
