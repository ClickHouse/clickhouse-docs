---
description: 'ClickHouse の loop テーブル関数は、クエリ結果を無限ループで繰り返し返すために使用されます。'
slug: /sql-reference/table-functions/loop
title: 'loop'
doc_type: 'reference'
---

# loop テーブル関数 \{#loop-table-function\}

## 構文 \{#syntax\}

```sql
SELECT ... FROM loop(database, table);
SELECT ... FROM loop(database.table);
SELECT ... FROM loop(table);
SELECT ... FROM loop(other_table_function(...));
```

## 引数 \{#arguments\}

| 引数                        | 説明                                                                                                                 |
|-----------------------------|----------------------------------------------------------------------------------------------------------------------|
| `database`                  | データベース名。                                                                                                     |
| `table`                     | テーブル名。                                                                                                         |
| `other_table_function(...)` | 他のテーブル関数。この場合の例: `SELECT * FROM loop(numbers(10));` において、`other_table_function(...)` は `numbers(10)`。 |

## 戻り値 \{#returned_values\}

クエリ結果を返し続ける無限ループ。

## 例 \{#examples\}

ClickHouse からデータを取得する：

```sql
SELECT * FROM loop(test_database, test_table);
SELECT * FROM loop(test_database.test_table);
SELECT * FROM loop(test_table);
```

または、他のテーブル関数を使用する場合:

```sql
SELECT * FROM loop(numbers(3)) LIMIT 7;
   ┌─number─┐
1. │      0 │
2. │      1 │
3. │      2 │
   └────────┘
   ┌─number─┐
4. │      0 │
5. │      1 │
6. │      2 │
   └────────┘
   ┌─number─┐
7. │      0 │
   └────────┘
```

```sql
SELECT * FROM loop(mysql('localhost:3306', 'test', 'test', 'user', 'password'));
...
```
