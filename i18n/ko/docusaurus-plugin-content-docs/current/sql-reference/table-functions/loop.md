---
'description': 'ClickHouse의 loop 테이블 함수는 쿼리 결과를 무한 루프에서 반환하는 데 사용됩니다.'
'slug': '/sql-reference/table-functions/loop'
'title': 'loop'
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

| Argument                    | Description                                                                                                          |
|-----------------------------|----------------------------------------------------------------------------------------------------------------------|
| `database`                  | 데이터베이스 이름.                                                                                                   |
| `table`                     | 테이블 이름.                                                                                                        |
| `other_table_function(...)` | 다른 테이블 함수. 예: `SELECT * FROM loop(numbers(10));` 여기서 `other_table_function(...)`은 `numbers(10)`입니다. |

## Returned values {#returned_values}

쿼리 결과를 반환하는 무한 루프.

## Examples {#examples}

ClickHouse에서 데이터 선택:

```sql
SELECT * FROM loop(test_database, test_table);
SELECT * FROM loop(test_database.test_table);
SELECT * FROM loop(test_table);
```

또는 다른 테이블 함수를 사용하여:

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
