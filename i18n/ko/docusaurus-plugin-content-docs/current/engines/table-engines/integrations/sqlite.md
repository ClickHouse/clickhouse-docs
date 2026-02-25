---
description: '이 엔진은 데이터의 SQLite 가져오기 및 내보내기를 지원하며, ClickHouse에서 SQLite 테이블을 직접 조회하는 쿼리를 실행할 수 있습니다.'
sidebar_label: 'SQLite'
sidebar_position: 185
slug: /engines/table-engines/integrations/sqlite
title: 'SQLite 테이블 엔진'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# SQLite 테이블 엔진 \{#sqlite-table-engine\}

<CloudNotSupportedBadge/>

이 엔진은 SQLite로의 데이터 가져오기 및 내보내기를 지원하며, ClickHouse에서 SQLite 테이블을 직접 조회할 수 있습니다.

## 테이블 생성 \{#creating-a-table\}

```sql
    CREATE TABLE [IF NOT EXISTS] [db.]table_name
    (
        name1 [type1],
        name2 [type2], ...
    ) ENGINE = SQLite('db_path', 'table')
```

**엔진 매개변수**

* `db_path` — 데이터베이스를 담고 있는 SQLite 파일의 경로입니다.
* `table` — SQLite 데이터베이스의 테이블 이름입니다.


## 지원되는 데이터 타입 \{#data-types-support\}

테이블 정의에서 ClickHouse 컬럼 타입을 명시적으로 지정하면, 다음 ClickHouse 타입이 SQLite TEXT 컬럼에서 파싱됩니다:

- [Date](../../../sql-reference/data-types/date.md), [Date32](../../../sql-reference/data-types/date32.md)
- [DateTime](../../../sql-reference/data-types/datetime.md), [DateTime64](../../../sql-reference/data-types/datetime64.md)
- [UUID](../../../sql-reference/data-types/uuid.md)
- [Enum8, Enum16](../../../sql-reference/data-types/enum.md)
- [Decimal32, Decimal64, Decimal128, Decimal256](../../../sql-reference/data-types/decimal.md)
- [FixedString](../../../sql-reference/data-types/fixedstring.md)
- 모든 정수 타입([UInt8, UInt16, UInt32, UInt64, Int8, Int16, Int32, Int64](../../../sql-reference/data-types/int-uint.md))
- [Float32, Float64](../../../sql-reference/data-types/float.md)

기본 타입 매핑은 [SQLite database engine](../../../engines/database-engines/sqlite.md#data_types-support) 문서를 참조하십시오.

## 사용 예시 \{#usage-example\}

다음은 SQLite 테이블을 생성하는 쿼리입니다:

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

테이블의 데이터를 반환합니다.

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

**함께 보기**

* [SQLite](../../../engines/database-engines/sqlite.md) 엔진
* [sqlite](../../../sql-reference/table-functions/sqlite.md) 테이블 함수
