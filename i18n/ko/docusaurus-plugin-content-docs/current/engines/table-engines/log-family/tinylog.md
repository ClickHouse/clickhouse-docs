---
description: 'TinyLog 테이블 엔진에 대한 문서'
slug: /engines/table-engines/log-family/tinylog
toc_priority: 34
toc_title: 'TinyLog'
title: 'TinyLog 테이블 엔진'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# TinyLog 테이블 엔진 \{#tinylog-table-engine\}

<CloudNotSupportedBadge/>

이 엔진은 Log 엔진 계열에 속합니다. Log 엔진의 공통 속성과 차이점은 [Log Engine Family](../../../engines/table-engines/log-family/index.md)를 참조하십시오.

이 테이블 엔진은 일반적으로 일회성 쓰기 방식(write-once method)에 사용합니다. 데이터를 한 번만 기록하고, 필요에 따라 여러 번 읽습니다. 예를 들어, `TinyLog` 타입 테이블은 작은 배치 단위로 처리되는 중간 단계 데이터(intermediary data) 저장에 사용할 수 있습니다. 작은 테이블을 매우 많이 생성해 데이터를 저장하는 것은 비효율적이라는 점에 유의하십시오.

쿼리는 단일 스트림으로 실행됩니다. 다시 말해, 이 엔진은 상대적으로 작은 테이블(약 1,000,000개의 행까지)을 대상으로 합니다. 많은 수의 작은 테이블이 있는 경우, 이 테이블 엔진을 사용하는 것이 합리적입니다. 이는 [Log](../../../engines/table-engines/log-family/log.md) 엔진보다 구조가 더 단순하여 열어야 하는 파일 수가 더 적기 때문입니다.



## 특성 \{#characteristics\}

- **더 단순한 구조**: Log 엔진과 달리 TinyLog는 마크 파일을 사용하지 않습니다. 이는 구조를 단순화하지만, 대규모 데이터 세트에 대한 성능 최적화에는 한계를 줍니다.
- **단일 스트림 쿼리**: TinyLog 테이블에 대한 쿼리는 단일 스트림으로 실행되며, 일반적으로 최대 1,000,000행 정도의 비교적 작은 테이블에 적합합니다.
- **작은 테이블에 효율적**: TinyLog 엔진의 단순성 덕분에 많은 수의 작은 테이블을 관리할 때 Log 엔진에 비해 필요한 파일 작업이 적어 유리합니다.

Log 엔진과 달리 TinyLog는 마크 파일을 사용하지 않습니다. 이는 구조를 단순화하지만, 더 큰 데이터 세트에 대한 성능 최적화에는 한계를 줍니다.



## 테이블 생성 \{#table_engines-tinylog-creating-a-table\}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    column1_name [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    column2_name [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = TinyLog
```

자세한 내용은 [CREATE TABLE](/sql-reference/statements/create/table) 쿼리 설명을 참조하십시오.


## 데이터 기록 \{#table_engines-tinylog-writing-the-data\}

`TinyLog` 엔진은 모든 컬럼을 하나의 테이블 파일에 저장합니다. 각 `INSERT` 쿼리가 실행될 때마다 ClickHouse는 데이터 블록을 테이블 파일 끝에 추가하면서 컬럼을 하나씩 순차적으로 기록합니다.

각 테이블에 대해 ClickHouse는 다음 파일을 생성합니다:

- `<column>.bin`: 각 컬럼에 대한 데이터 파일로, 직렬화되고 압축된 데이터를 포함합니다.

`TinyLog` 엔진은 `ALTER UPDATE` 및 `ALTER DELETE` 연산을 지원하지 않습니다.



## 사용 예 \{#table_engines-tinylog-example-of-use\}

테이블 생성:

```sql
CREATE TABLE tiny_log_table
(
    timestamp DateTime,
    message_type String,
    message String
)
ENGINE = TinyLog
```

데이터 삽입:

```sql
INSERT INTO tiny_log_table VALUES (now(),'REGULAR','The first regular message')
INSERT INTO tiny_log_table VALUES (now(),'REGULAR','The second regular message'),(now(),'WARNING','The first warning message')
```

`<column>.bin` 파일 안에 두 개의 데이터 블록을 생성하기 위해 두 개의 `INSERT` 쿼리를 사용했습니다.

ClickHouse는 데이터를 조회할 때 단일 스트림을 사용합니다. 그 결과, 출력에서 행 블록들의 순서는 입력에 있던 동일한 블록들의 순서와 일치합니다. 예를 들면 다음과 같습니다.

```sql
SELECT * FROM tiny_log_table
```

```text
┌───────────timestamp─┬─message_type─┬─message────────────────────┐
│ 2024-12-10 13:11:58 │ REGULAR      │ The first regular message  │
│ 2024-12-10 13:12:12 │ REGULAR      │ The second regular message │
│ 2024-12-10 13:12:12 │ WARNING      │ The first warning message  │
└─────────────────────┴──────────────┴────────────────────────────┘
```
