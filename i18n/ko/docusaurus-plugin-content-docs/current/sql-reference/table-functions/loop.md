---
description: 'ClickHouse의 loop 테이블 함수는 쿼리 결과를 무한 루프로 반환하는 데 사용됩니다.'
slug: /sql-reference/table-functions/loop
title: 'loop'
doc_type: 'reference'
---



# loop 테이블 함수(Table Function) \{#loop-table-function\}



## 구문 \{#syntax\}

```sql
SELECT ... FROM loop(database, table);
SELECT ... FROM loop(database.table);
SELECT ... FROM loop(table);
SELECT ... FROM loop(other_table_function(...));
```


## Arguments \{#arguments\}

| Argument                    | Description                                                                                                          |
|-----------------------------|----------------------------------------------------------------------------------------------------------------------|
| `database`                  | 데이터베이스 이름입니다.                                                                                             |
| `table`                     | 테이블 이름입니다.                                                                                                   |
| `other_table_function(...)` | 다른 테이블 함수입니다. 예시: `SELECT * FROM loop(numbers(10));`에서 `other_table_function(...)`는 `numbers(10)`입니다. |



## 반환 값 \{#returned_values\}

쿼리 결과를 반환하기 위한 무한 루프입니다.



## 예제 \{#examples\}

ClickHouse에서 데이터 조회:

```sql
SELECT * FROM loop(test_database, test_table);
SELECT * FROM loop(test_database.test_table);
SELECT * FROM loop(test_table);
```

또는 다른 테이블 함수 사용:

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
