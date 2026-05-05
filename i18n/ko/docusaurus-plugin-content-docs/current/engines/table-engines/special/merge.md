---
description: '`Merge` 엔진( `MergeTree`와 혼동하지 마십시오)은 자체적으로 데이터를 저장하지 않지만, 여러 다른 테이블에서 동시에 데이터를 읽을 수 있게 합니다.'
sidebar_label: 'Merge'
sidebar_position: 30
slug: /engines/table-engines/special/merge
title: 'Merge 테이블 엔진'
doc_type: 'reference'
---



# Merge 테이블 엔진 \{#merge-table-engine\}

`Merge` 엔진은 (`MergeTree`와 혼동하지 말아야 하며) 자체적으로 데이터를 저장하지 않고,任任任任任任任任任任任任任任任任任任任任任任任任여러 개의 다른 테이블에서 동시에 데이터를 읽을 수 있도록 합니다.

읽기 작업은 자동으로 병렬 처리됩니다. 테이블로의 쓰기 작업은 지원되지 않습니다. 읽기 시에는, 존재하는 경우 실제로 읽는 테이블의 인덱스가 사용됩니다.



## 테이블 생성 \{#creating-a-table\}

```sql
CREATE TABLE ... Engine=Merge(db_name, tables_regexp)
```


## 엔진 파라미터 \{#engine-parameters\}

### `db_name` \{#db_name\}

`db_name` — 가능한 값:
    - 데이터베이스 이름,
    - 예를 들어 `currentDatabase()`와 같이 데이터베이스 이름 문자열을 반환하는 상수 표현식,
    - `REGEXP(expression)`, 여기서 `expression`은 DB 이름과 일치시키기 위한 정규식입니다.

### `tables_regexp` \{#tables_regexp\}

`tables_regexp` — 지정된 하나 이상의 DB에서 테이블 이름과 일치시키기 위한 정규식입니다.

정규식 — [re2](https://github.com/google/re2) (PCRE의 부분 집합을 지원), 대소문자를 구분합니다.
정규식에서 이스케이프 기호에 대한 내용은 「match」 섹션을 참조하십시오.



## 사용법 \{#usage\}

읽을 테이블을 선택할 때 정규식에 일치하더라도 `Merge` 테이블 자체는 선택되지 않습니다. 이는 루프가 발생하는 것을 방지하기 위한 것입니다.
서로의 데이터를 끝없이 읽으려고 시도하는 두 개의 `Merge` 테이블을 만드는 것도 가능하지만, 이는 권장되는 방법이 아닙니다.

`Merge` 엔진의 일반적인 사용 방식은 다수의 `TinyLog` 테이블을 마치 하나의 테이블처럼 다루는 것입니다.



## 예시 \{#examples\}

**예시 1**

두 데이터베이스 `ABC_corporate_site`와 `ABC_store`가 있다고 가정합니다. `all_visitors` 테이블에는 두 데이터베이스의 `visitors` 테이블에 있는 ID 값이 모두 포함됩니다.

```sql
CREATE TABLE all_visitors (id UInt32) ENGINE=Merge(REGEXP('ABC_*'), 'visitors');
```

**예시 2**

기존 테이블 `WatchLog_old`가 있고, 데이터를 새 테이블 `WatchLog_new`로 옮기지 않은 상태에서 파티셔닝을 변경하기로 했다고 가정합니다. 이때 두 테이블의 데이터를 모두 조회해야 합니다.

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


## 가상 컬럼 \{#virtual-columns\}

- `_table` — 데이터를 읽은 테이블의 이름입니다. 형식: [String](../../../sql-reference/data-types/string.md).

    `_table`에 대해 필터링하는 경우(예: `WHERE _table='xyz'`) 필터 조건을 만족하는 테이블만에서 데이터가 읽힙니다.

- `_database` — 데이터를 읽은 데이터베이스의 이름을 포함합니다. 형식: [String](../../../sql-reference/data-types/string.md).

**관련 문서**

- [가상 컬럼](../../../engines/table-engines/index.md#table_engines-virtual_columns)
- [merge](../../../sql-reference/table-functions/merge.md) 테이블 함수입니다.
