---
'description': 'SQLite 데이터베이스에 저장된 데이터에 대한 쿼리를 수행할 수 있습니다.'
'sidebar_label': 'sqlite'
'sidebar_position': 185
'slug': '/sql-reference/table-functions/sqlite'
'title': 'sqlite'
'doc_type': 'reference'
---


# sqlite 테이블 함수

SQLite 데이터베이스에 저장된 데이터에 대해 쿼리를 수행할 수 있습니다. [SQLite](../../engines/database-engines/sqlite.md) 데이터베이스.

## 구문 {#syntax}

```sql
sqlite('db_path', 'table_name')
```

## 인수 {#arguments}

- `db_path` — SQLite 데이터베이스가 있는 파일의 경로. [문자열](../../sql-reference/data-types/string.md).
- `table_name` — SQLite 데이터베이스의 테이블 이름. [문자열](../../sql-reference/data-types/string.md).

## 반환 값 {#returned_value}

- 원래 `SQLite` 테이블과 동일한 컬럼을 가진 테이블 객체.

## 예제 {#example}

쿼리:

```sql
SELECT * FROM sqlite('sqlite.db', 'table1') ORDER BY col2;
```

결과:

```text
┌─col1──┬─col2─┐
│ line1 │    1 │
│ line2 │    2 │
│ line3 │    3 │
└───────┴──────┘
```

## 관련 {#related}

- [SQLite](../../engines/table-engines/integrations/sqlite.md) 테이블 엔진
