---
alias: []
description: 'MySQLDump フォーマットに関するドキュメント'
input_format: true
keywords: ['MySQLDump']
output_format: false
slug: /interfaces/formats/MySQLDump
title: 'MySQLDump'
doc_type: 'reference'
---

| 入力 | 出力 | エイリアス |
|-------|---------|-------|
| ✔     | ✗       |       |



## 説明 {#description}

ClickHouse は MySQL の [ダンプ](https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html) の読み取りをサポートしています。

ダンプ内で、1 つのテーブルに対応する `INSERT` クエリからすべてのデータを読み取ります。
テーブルが複数ある場合、既定では最初のテーブルからデータを読み取ります。

:::note
この形式はスキーマ推論をサポートします。ダンプに指定されたテーブルに対する `CREATE` クエリが含まれている場合は、そのクエリからテーブル構造を推論し、含まれていない場合は `INSERT` クエリのデータからスキーマを推論します。
:::



## 使用例

次の SQL ダンプファイルがあるとします。

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

次のクエリを実行します。

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

[`input_format_mysql_dump_table_name`](/operations/settings/settings-formats.md/#input_format_mysql_dump_table_name) 設定を使用して、データの読み取り元となるテーブル名を指定できます。
`input_format_mysql_dump_map_columns` 設定が `1` に設定されており、ダンプに指定したテーブルの `CREATE` クエリ、または `INSERT` クエリ内でカラム名が指定されている場合、入力データのカラムは名前に基づいてテーブルのカラムにマッピングされます。
[`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 設定が `1` に設定されている場合、不明な名前のカラムはスキップされます。