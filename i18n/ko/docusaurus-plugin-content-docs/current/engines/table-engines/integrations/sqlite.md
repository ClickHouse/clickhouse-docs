---
'description': '이 엔진은 SQLite로 데이터를 가져오고 내보낼 수 있으며 ClickHouse에서 SQLite 테이블에 직접 쿼리를
  지원합니다.'
'sidebar_label': 'SQLite'
'sidebar_position': 185
'slug': '/engines/table-engines/integrations/sqlite'
'title': 'SQLite 테이블 엔진'
'doc_type': 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# SQLite 테이블 엔진

<CloudNotSupportedBadge/>

이 엔진은 SQLite로 데이터를 가져오고 내보낼 수 있으며, ClickHouse에서 SQLite 테이블에 대한 쿼리를 직접 지원합니다.

## 테이블 생성 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name
(
    name1 [type1],
    name2 [type2], ...
) ENGINE = SQLite('db_path', 'table')
```

**엔진 매개변수**

- `db_path` — 데이터베이스와 함께 사용할 SQLite 파일의 경로.
- `table` — SQLite 데이터베이스 내의 테이블 이름.

## 사용 예제 {#usage-example}

SQLite 테이블을 만드는 쿼리를 보여줍니다:

```sql
SHOW CREATE TABLE sqlite_db.table2;
```

```text
CREATE TABLE SQLite.table2
(
    `col1` Nullable(Int32),
    `col2` Nullable(String)
)
ENGINE = SQLite('sqlite.db','table2');
```

테이블에서 데이터를 반환합니다:

```sql
SELECT * FROM sqlite_db.table2 ORDER BY col1;
```

```text
┌─col1─┬─col2──┐
│    1 │ text1 │
│    2 │ text2 │
│    3 │ text3 │
└──────┴───────┘
```

**참고**

- [SQLite](../../../engines/database-engines/sqlite.md) 엔진
- [sqlite](../../../sql-reference/table-functions/sqlite.md) 테이블 함수
