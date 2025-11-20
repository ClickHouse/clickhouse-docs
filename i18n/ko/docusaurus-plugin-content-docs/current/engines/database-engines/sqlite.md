---
'description': 'SQLite 데이터베이스에 연결하고 ClickHouse와 SQLite 간에 데이터를 교환하기 위해 `INSERT` 및
  `SELECT` 쿼리를 수행할 수 있습니다.'
'sidebar_label': 'SQLite'
'sidebar_position': 55
'slug': '/engines/database-engines/sqlite'
'title': 'SQLite'
'doc_type': 'reference'
---


# SQLite

ClickHouse와 SQLite 간에 데이터를 교환하기 위해 `INSERT` 및 `SELECT` 쿼리를 수행할 수 있는 [SQLite](https://www.sqlite.org/index.html) 데이터베이스에 연결할 수 있습니다.

## 데이터베이스 생성 {#creating-a-database}

```sql
CREATE DATABASE sqlite_database
ENGINE = SQLite('db_path')
```

**엔진 매개변수**

- `db_path` — SQLite 데이터베이스 파일 경로.

## 데이터 유형 지원 {#data_types-support}

|  SQLite   | ClickHouse                                              |
|---------------|---------------------------------------------------------|
| INTEGER       | [Int32](../../sql-reference/data-types/int-uint.md)     |
| REAL          | [Float32](../../sql-reference/data-types/float.md)      |
| TEXT          | [String](../../sql-reference/data-types/string.md)      |
| BLOB          | [String](../../sql-reference/data-types/string.md)      |

## 구체적인 사항 및 권장 사항 {#specifics-and-recommendations}

SQLite는 전체 데이터베이스(정의, 테이블, 인덱스 및 데이터 자체)를 호스트 머신의 단일 크로스 플랫폼 파일로 저장합니다. 작성 중에 SQLite는 전체 데이터베이스 파일을 잠궈서 쓰기 작업이 순차적으로 수행됩니다. 읽기 작업은 다중 작업이 가능합니다.  
SQLite는 서비스 관리(예: 시작 스크립트)나 `GRANT` 및 비밀번호 기반의 접근 제어를 요구하지 않습니다. 접근 제어는 데이터베이스 파일 자체에 부여된 파일 시스템 권한을 통해 처리됩니다.

## 사용 예제 {#usage-example}

SQLite에 연결된 ClickHouse의 데이터베이스:

```sql
CREATE DATABASE sqlite_db ENGINE = SQLite('sqlite.db');
SHOW TABLES FROM sqlite_db;
```

```text
┌──name───┐
│ table1  │
│ table2  │
└─────────┘
```

테이블을 표시합니다:

```sql
SELECT * FROM sqlite_db.table1;
```

```text
┌─col1──┬─col2─┐
│ line1 │    1 │
│ line2 │    2 │
│ line3 │    3 │
└───────┴──────┘
```
ClickHouse 테이블에서 SQLite 테이블로 데이터 삽입:

```sql
CREATE TABLE clickhouse_table(`col1` String,`col2` Int16) ENGINE = MergeTree() ORDER BY col2;
INSERT INTO clickhouse_table VALUES ('text',10);
INSERT INTO sqlite_db.table1 SELECT * FROM clickhouse_table;
SELECT * FROM sqlite_db.table1;
```

```text
┌─col1──┬─col2─┐
│ line1 │    1 │
│ line2 │    2 │
│ line3 │    3 │
│ text  │   10 │
└───────┴──────┘
```
