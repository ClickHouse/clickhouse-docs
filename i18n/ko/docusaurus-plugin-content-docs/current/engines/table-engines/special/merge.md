---
'description': '`Merge` 엔진은 ( `MergeTree`와 혼동하지 마세요) 데이터를 본체로 저장하지 않지만, 여러 다른 테이블에서
  동시에 읽는 것을 허용합니다.'
'sidebar_label': 'Merge'
'sidebar_position': 30
'slug': '/engines/table-engines/special/merge'
'title': 'Merge 테이블 엔진'
'doc_type': 'reference'
---


# Merge 테이블 엔진

`Merge` 엔진( `MergeTree`와 혼동하지 마세요) 은 데이터를 직접 저장하지 않지만, 동시에 다른 여러 테이블에서 읽을 수 있도록 합니다.

읽기는 자동으로 병렬화됩니다. 테이블에 대한 쓰기는 지원되지 않습니다. 읽을 때, 실제로 읽고 있는 테이블의 인덱스가 존재하는 경우 사용됩니다.

## 테이블 생성 {#creating-a-table}

```sql
CREATE TABLE ... Engine=Merge(db_name, tables_regexp)
```

## 엔진 매개변수 {#engine-parameters}

### `db_name` {#db_name}

`db_name` — 가능한 값:
- 데이터베이스 이름,
- 데이터베이스 이름을 반환하는 상수 표현식, 예를 들어, `currentDatabase()`,
- `REGEXP(expression)` 형식, 여기서 `expression`은 DB 이름과 일치하는 정규 표현식입니다.

### `tables_regexp` {#tables_regexp}

`tables_regexp` — 지정된 DB 또는 DB의 테이블 이름과 일치하는 정규 표현식.

정규 표현식 — [re2](https://github.com/google/re2)(PCRE의 하위 집합 지원), 대소문자 구분.
정규 표현식에서 기호 이스케이프에 대한 설명은 "match" 섹션을 참조하십시오.

## 사용법 {#usage}

읽을 테이블을 선택할 때, `Merge` 테이블 자체는 선택되지 않으며, 정규 표현식과 일치하더라도 선택되지 않습니다. 이는 루프를 피하기 위한 것입니다.
서로의 데이터를 무한히 읽으려고 하는 두 개의 `Merge` 테이블을 만드는 것은 가능하지만, 좋은 아이디어는 아닙니다.

`Merge` 엔진을 사용하는 일반적인 방법은 많은 수의 `TinyLog` 테이블을 하나의 테이블처럼 작업하는 것입니다.

## 예제 {#examples}

**예제 1**

두 데이터베이스 `ABC_corporate_site`와 `ABC_store`를 고려하십시오. `all_visitors` 테이블은 두 데이터베이스의 `visitors` 테이블에서 ID를 포함할 것입니다.

```sql
CREATE TABLE all_visitors (id UInt32) ENGINE=Merge(REGEXP('ABC_*'), 'visitors');
```

**예제 2**

오래된 테이블 `WatchLog_old`가 있고, 데이터를 새 테이블 `WatchLog_new`로 이동하지 않고 파티셔닝을 변경하기로 결정했으며, 두 테이블의 데이터를 모두 보아야 합니다.

```sql
CREATE TABLE WatchLog_old(
    date Date,
    UserId Int64,
    EventType String,
    Cnt UInt64
)
ENGINE=MergeTree
ORDER BY (date, UserId, EventType);

INSERT INTO WatchLog_old VALUES ('2018-01-01', 1, 'hit', 3);

CREATE TABLE WatchLog_new(
    date Date,
    UserId Int64,
    EventType String,
    Cnt UInt64
)
ENGINE=MergeTree
PARTITION BY date
ORDER BY (UserId, EventType)
SETTINGS index_granularity=8192;

INSERT INTO WatchLog_new VALUES ('2018-01-02', 2, 'hit', 3);

CREATE TABLE WatchLog AS WatchLog_old ENGINE=Merge(currentDatabase(), '^WatchLog');

SELECT * FROM WatchLog;
```

```text
┌───────date─┬─UserId─┬─EventType─┬─Cnt─┐
│ 2018-01-01 │      1 │ hit       │   3 │
└────────────┴────────┴───────────┴─────┘
┌───────date─┬─UserId─┬─EventType─┬─Cnt─┐
│ 2018-01-02 │      2 │ hit       │   3 │
└────────────┴────────┴───────────┴─────┘
```

## 가상 컬럼 {#virtual-columns}

- `_table` — 데이터가 읽힌 테이블의 이름. 유형: [String](../../../sql-reference/data-types/string.md).

    `_table`로 필터링하는 경우(예: `WHERE _table='xyz'`), 필터 조건을 만족하는 테이블만 읽힙니다.

- `_database` — 데이터가 읽힌 데이터베이스의 이름을 포함합니다. 유형: [String](../../../sql-reference/data-types/string.md).

**참고**

- [가상 컬럼](../../../engines/table-engines/index.md#table_engines-virtual_columns)
- [merge](../../../sql-reference/table-functions/merge.md) 테이블 함수
