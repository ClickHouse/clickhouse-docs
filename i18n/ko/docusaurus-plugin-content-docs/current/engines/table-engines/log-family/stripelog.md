---
description: 'StripeLog 테이블 엔진에 대한 문서'
slug: /engines/table-engines/log-family/stripelog
toc_priority: 32
toc_title: 'StripeLog'
title: 'StripeLog 테이블 엔진'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# StripeLog 테이블 엔진 \{#stripelog-table-engine\}

<CloudNotSupportedBadge/>

이 엔진은 로그 엔진 계열에 속합니다. 로그 엔진의 공통 속성과 차이점은 [Log Engine Family](../../../engines/table-engines/log-family/index.md) 문서를 참고하십시오.

이 엔진은 적은 양의 데이터(100만 개 행 미만)를 담는 테이블을 매우 많이 생성해야 하는 시나리오에서 사용합니다. 예를 들어, 원자적 처리가 필요한 변환 작업을 위해 수신된 데이터 배치를 저장하는 데 이 테이블을 사용할 수 있습니다. ClickHouse 서버에서는 이 테이블 유형의 인스턴스를 최대 10만 개까지 사용하는 것이 가능합니다. 매우 많은 수의 테이블이 필요한 경우, 이 테이블 엔진을 [Log](./log.md) 엔진보다 우선적으로 사용하는 것이 좋습니다. 그 대신 읽기 효율성은 다소 희생됩니다.



## 테이블 생성 \{#table_engines-stripelog-creating-a-table\}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    column1_name [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    column2_name [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = StripeLog
```

[CREATE TABLE](/sql-reference/statements/create/table) 쿼리에 대한 자세한 내용은 해당 문서를 참조하십시오.


## 데이터 쓰기 \{#table_engines-stripelog-writing-the-data\}

`StripeLog` 엔진은 모든 컬럼을 하나의 파일에 저장합니다. 각 `INSERT` 쿼리가 실행될 때마다 ClickHouse는 데이터 블록을 테이블 파일 끝에 추가하면서 컬럼을 하나씩 순서대로 기록합니다.

각 테이블에 대해 ClickHouse는 다음과 같은 파일을 생성합니다.

- `data.bin` — 데이터 파일.
- `index.mrk` — 마크가 포함된 파일. 마크에는 삽입된 각 데이터 블록의 각 컬럼에 대한 오프셋이 저장됩니다.

`StripeLog` 엔진은 `ALTER UPDATE` 및 `ALTER DELETE` 연산을 지원하지 않습니다.



## 데이터 읽기 \{#table_engines-stripelog-reading-the-data\}

마크 파일을 사용하면 ClickHouse에서 데이터 읽기를 병렬화할 수 있습니다. 이는 `SELECT` 쿼리가 예측 불가능한 순서로 행을 반환함을 의미합니다. 행을 정렬하려면 `ORDER BY` 절을 사용하십시오.



## 사용 예 \{#table_engines-stripelog-example-of-use\}

테이블 생성:

```sql
CREATE TABLE stripe_log_table
(
    timestamp DateTime,
    message_type String,
    message String
)
ENGINE = StripeLog
```

데이터 삽입:

```sql
INSERT INTO stripe_log_table VALUES (now(),'REGULAR','The first regular message')
INSERT INTO stripe_log_table VALUES (now(),'REGULAR','The second regular message'),(now(),'WARNING','The first warning message')
```

`data.bin` 파일에 두 개의 데이터 블록을 생성하기 위해 두 개의 `INSERT` 쿼리를 사용했습니다.

ClickHouse는 데이터를 조회할 때 여러 스레드를 사용합니다. 각 스레드는 서로 다른 데이터 블록을 읽고, 처리가 끝나는 대로 결과 행을 독립적으로 반환합니다. 그 결과, 대부분의 경우 출력에서의 행 블록 순서는 입력에서의 동일한 블록 순서와 일치하지 않습니다. 예를 들어:

```sql
SELECT * FROM stripe_log_table
```

```text
┌───────────timestamp─┬─message_type─┬─message────────────────────┐
│ 2019-01-18 14:27:32 │ REGULAR      │ The second regular message │
│ 2019-01-18 14:34:53 │ WARNING      │ The first warning message  │
└─────────────────────┴──────────────┴────────────────────────────┘
┌───────────timestamp─┬─message_type─┬─message───────────────────┐
│ 2019-01-18 14:23:43 │ REGULAR      │ The first regular message │
└─────────────────────┴──────────────┴───────────────────────────┘
```

결과 정렬(기본값은 오름차순입니다):

```sql
SELECT * FROM stripe_log_table ORDER BY timestamp
```

```text
┌───────────timestamp─┬─message_type─┬─message────────────────────┐
│ 2019-01-18 14:23:43 │ REGULAR      │ The first regular message  │
│ 2019-01-18 14:27:32 │ REGULAR      │ The second regular message │
│ 2019-01-18 14:34:53 │ WARNING      │ The first warning message  │
└─────────────────────┴──────────────┴────────────────────────────┘
```
