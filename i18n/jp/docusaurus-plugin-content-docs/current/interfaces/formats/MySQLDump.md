---
alias: []
description: 'MySQLDump 形式に関するドキュメント'
input_format: true
keywords: ['MySQLDump']
output_format: false
slug: /interfaces/formats/MySQLDump
title: 'MySQLDump'
---
```

| 入力 | 出力  | エイリアス |
|-------|---------|-------|
| ✔     | ✗       |       |

## 説明 {#description}

ClickHouse は MySQL の [ダンプ](https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html) を読み取ることをサポートしています。

ダンプ内の単一のテーブルに属する `INSERT` クエリからすべてのデータを読み取ります。 
複数のテーブルがある場合、デフォルトでは最初のテーブルからデータを読み取ります。

:::note
この形式はスキーマ推論をサポートしています：ダンプに指定されたテーブルの `CREATE` クエリが含まれている場合、そこから構造が推論されます。そうでない場合、スキーマは `INSERT` クエリのデータから推論されます。
:::

## 使用例 {#example-usage}

次の SQL ダンプファイルがあるとします：

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

## 形式設定 {#format-settings}

データを読み取るテーブルの名前を指定するには、[`input_format_mysql_dump_table_name`](/operations/settings/settings-formats.md/#input_format_mysql_dump_table_name) 設定を使用します。
設定 `input_format_mysql_dump_map_columns` が `1` に設定され、ダンプに指定されたテーブルまたはカラム名の `CREATE` クエリや `INSERT` クエリが含まれている場合、入力データのカラムはテーブルのカラムに名前でマッピングされます。
未知の名前のカラムは、設定 [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が `1` に設定されている場合、スキップされます。
