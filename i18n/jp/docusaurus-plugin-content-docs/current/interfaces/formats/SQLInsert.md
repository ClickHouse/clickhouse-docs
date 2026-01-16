---
alias: []
description: 'SQLInsert フォーマットに関するドキュメント'
input_format: false
keywords: ['SQLInsert']
output_format: true
slug: /interfaces/formats/SQLInsert
title: 'SQLInsert'
doc_type: 'reference'
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✗     | ✔      |       |

## 説明 \\{#description\\}

データを `INSERT INTO table (columns...) VALUES (...), (...) ...;` 文の連続として出力します。

## 使用例 \\{#example-usage\\}

例：

```sql
SELECT number AS x, number + 1 AS y, 'Hello' AS z FROM numbers(10) FORMAT SQLInsert SETTINGS output_format_sql_insert_max_batch_size = 2
```

```sql
INSERT INTO table (x, y, z) VALUES (0, 1, 'Hello'), (1, 2, 'Hello');
INSERT INTO table (x, y, z) VALUES (2, 3, 'Hello'), (3, 4, 'Hello');
INSERT INTO table (x, y, z) VALUES (4, 5, 'Hello'), (5, 6, 'Hello');
INSERT INTO table (x, y, z) VALUES (6, 7, 'Hello'), (7, 8, 'Hello');
INSERT INTO table (x, y, z) VALUES (8, 9, 'Hello'), (9, 10, 'Hello');
```

このフォーマットで出力されたデータを読み取るには、[MySQLDump](../formats/MySQLDump.md) 入力フォーマットを使用できます。

## フォーマット設定 \\{#format-settings\\}

| 設定                                                                                                                                | 説明                                              | デフォルト |
|-------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------|-----------|
| [`output_format_sql_insert_max_batch_size`](../../operations/settings/settings-formats.md/#output_format_sql_insert_max_batch_size) | 1つの INSERT 文内の最大行数。                     | `65505`   |
| [`output_format_sql_insert_table_name`](../../operations/settings/settings-formats.md/#output_format_sql_insert_table_name)         | 出力される INSERT クエリ内のテーブル名。          | `'table'` |
| [`output_format_sql_insert_include_column_names`](../../operations/settings/settings-formats.md/#output_format_sql_insert_include_column_names) | INSERT クエリにカラム名を含めるかどうか。         | `true`    |
| [`output_format_sql_insert_use_replace`](../../operations/settings/settings-formats.md/#output_format_sql_insert_use_replace)       | INSERT の代わりに REPLACE 文を使用するかどうか。 | `false`   |
| [`output_format_sql_insert_quote_names`](../../operations/settings/settings-formats.md/#output_format_sql_insert_quote_names)       | カラム名を "\`"（バッククォート）で囲むかどうか。 | `true`    |
