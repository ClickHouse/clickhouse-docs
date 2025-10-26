---
'description': 'ClickHouseのループテーブル関数は、クエリ結果を無限ループで返すために使用されます。'
'slug': '/sql-reference/table-functions/loop'
'title': 'ループ'
'doc_type': 'reference'
---


# loop Table Function

## Syntax {#syntax}

```sql
SELECT ... FROM loop(database, table);
SELECT ... FROM loop(database.table);
SELECT ... FROM loop(table);
SELECT ... FROM loop(other_table_function(...));
```

## Arguments {#arguments}

| 引数                          | 説明                                                                                                                |
|-------------------------------|----------------------------------------------------------------------------------------------------------------------|
| `database`                    | データベース名。                                                                                                   |
| `table`                       | テーブル名。                                                                                                      |
| `other_table_function(...)`   | 他のテーブル関数。例: `SELECT * FROM loop(numbers(10));` ここで `other_table_function(...)` は `numbers(10)` です。 |

## Returned values {#returned_values}

クエリ結果を返す無限ループ。

## Examples {#examples}

ClickHouseからのデータ選択:

```sql
SELECT * FROM loop(test_database, test_table);
SELECT * FROM loop(test_database.test_table);
SELECT * FROM loop(test_table);
```

または他のテーブル関数を使用:

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
