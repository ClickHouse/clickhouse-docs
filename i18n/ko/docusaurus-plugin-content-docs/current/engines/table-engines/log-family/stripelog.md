---
'description': 'StripeLog 테이블 엔진에 대한 문서'
'slug': '/engines/table-engines/log-family/stripelog'
'toc_priority': 32
'toc_title': 'StripeLog'
'title': 'StripeLog 테이블 엔진'
'doc_type': 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# StripeLog 테이블 엔진

<CloudNotSupportedBadge/>

이 엔진은 로그 엔진군에 속합니다. 로그 엔진의 공통 속성과 차이점에 대해서는 [로그 엔진 군](../../../engines/table-engines/log-family/index.md) 문서를 참조하십시오.

이 엔진은 소량의 데이터(1백만 행 미만)를 가진 많은 테이블을 작성해야 하는 시나리오에서 사용됩니다. 예를 들어, 이 테이블은 원자 처리가 필요한 변환을 위한 수신 데이터 배치를 저장하는 데 사용될 수 있습니다. ClickHouse 서버에서는 이 테이블 유형의 10만 인스턴스가 사용 가능합니다. 많은 수의 테이블이 필요한 경우 [Log](./log.md) 대신 이 테이블 엔진을 선호해야 합니다. 이는 읽기 효율성을 희생하며 이루어집니다.

## 테이블 생성하기 {#table_engines-stripelog-creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    column1_name [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    column2_name [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = StripeLog
```

[CREATE TABLE](/sql-reference/statements/create/table) 쿼리에 대한 자세한 설명을 참조하십시오.

## 데이터 쓰기 {#table_engines-stripelog-writing-the-data}

`StripeLog` 엔진은 모든 컬럼을 하나의 파일에 저장합니다. 각 `INSERT` 쿼리에 대해 ClickHouse는 데이터 블록을 테이블 파일의 끝에 추가하며, 컬럼을 하나씩 작성합니다.

ClickHouse는 각 테이블에 대해 다음과 같은 파일을 작성합니다:

- `data.bin` — 데이터 파일.
- `index.mrk` — 마크 파일. 마크는 삽입된 각 데이터 블록의 각 컬럼에 대한 오프셋을 포함합니다.

`StripeLog` 엔진은 `ALTER UPDATE` 및 `ALTER DELETE` 작업을 지원하지 않습니다.

## 데이터 읽기 {#table_engines-stripelog-reading-the-data}

마크 파일은 ClickHouse가 데이터 읽기를 병렬화할 수 있도록 합니다. 즉, `SELECT` 쿼리는 예측할 수 없는 순서로 행을 반환합니다. 행을 정렬하려면 `ORDER BY` 절을 사용하십시오.

## 사용 예시 {#table_engines-stripelog-example-of-use}

테이블 생성하기:

```sql
CREATE TABLE stripe_log_table
(
    timestamp DateTime,
    message_type String,
    message String
)
ENGINE = StripeLog
```

데이터 삽입하기:

```sql
INSERT INTO stripe_log_table VALUES (now(),'REGULAR','The first regular message')
INSERT INTO stripe_log_table VALUES (now(),'REGULAR','The second regular message'),(now(),'WARNING','The first warning message')
```

우리는 `data.bin` 파일 내에 두 개의 데이터 블록을 생성하기 위해 두 개의 `INSERT` 쿼리를 사용했습니다.

ClickHouse는 데이터를 선택할 때 여러 스레드를 사용합니다. 각 스레드는 독립적으로 작업이 끝날 때마다 결과 행을 반환하며, 이는 각기 다른 데이터 블록을 읽습니다. 결과적으로 출력의 행 블록 순서는 대부분 입력의 동일한 블록 순서와 일치하지 않습니다. 예를 들어:

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

결과 정렬 (기본값은 오름차순):

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
