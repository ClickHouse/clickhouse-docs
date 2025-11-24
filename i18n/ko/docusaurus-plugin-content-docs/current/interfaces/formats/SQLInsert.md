---
'alias': []
'description': 'SQLInsert 형식에 대한 문서'
'input_format': false
'keywords':
- 'SQLInsert'
'output_format': true
'slug': '/interfaces/formats/SQLInsert'
'title': 'SQLInsert'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✗     | ✔      |       |

## 설명 {#description}

데이터를 `INSERT INTO table (columns...) VALUES (...), (...) ...;` 문장의 시퀀스로 출력합니다.

## 예제 사용법 {#example-usage}

예제:

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

이 형식으로 출력된 데이터를 읽으려면 [MySQLDump](../formats/MySQLDump.md) 입력 형식을 사용할 수 있습니다.

## 형식 설정 {#format-settings}

| 설정                                                                                                                                 | 설명                                           | 기본값    |
|--------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------|-----------|
| [`output_format_sql_insert_max_batch_size`](../../operations/settings/settings-formats.md/#output_format_sql_insert_max_batch_size)   | 하나의 INSERT 문에서 최대 행 수.                  | `65505`   |
| [`output_format_sql_insert_table_name`](../../operations/settings/settings-formats.md/#output_format_sql_insert_table_name)           | 출력 INSERT 쿼리의 테이블 이름.                   | `'table'` |
| [`output_format_sql_insert_include_column_names`](../../operations/settings/settings-formats.md/#output_format_sql_insert_include_column_names) | INSERT 쿼리에 컬럼 이름 포함.                    | `true`    |
| [`output_format_sql_insert_use_replace`](../../operations/settings/settings-formats.md/#output_format_sql_insert_use_replace)         | INSERT 대신 REPLACE 문 사용.                     | `false`   |
| [`output_format_sql_insert_quote_names`](../../operations/settings/settings-formats.md/#output_format_sql_insert_quote_names)         | 컬럼 이름을 "\`" 문자로 인용.                    | `true`    |
