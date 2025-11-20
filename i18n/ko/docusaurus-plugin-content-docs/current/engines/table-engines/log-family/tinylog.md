---
'description': 'TinyLog 테이블 엔진에 대한 문서'
'slug': '/engines/table-engines/log-family/tinylog'
'toc_priority': 34
'toc_title': 'TinyLog'
'title': 'TinyLog 테이블 엔진'
'doc_type': 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# TinyLog 테이블 엔진

<CloudNotSupportedBadge/>

이 엔진은 로그 엔진 패밀리에 속합니다. 로그 엔진의 공통 속성과 차이점에 대한 내용은 [로그 엔진 패밀리](../../../engines/table-engines/log-family/index.md)를 참고하시기 바랍니다.

이 테이블 엔진은 일반적으로 한 번 쓰기(write-once) 방법과 함께 사용됩니다: 데이터를 한 번 쓰고, 그 이후에 필요한 만큼 읽습니다. 예를 들어, `TinyLog` 유형의 테이블을 사용하여 소규모 배치에서 처리되는 중간 데이터를 저장할 수 있습니다. 많은 수의 작은 테이블에 데이터를 저장하는 것은 비효율적이라는 점에 유의해야 합니다.

쿼리는 단일 스트림으로 실행됩니다. 즉, 이 엔진은 상대적으로 작은 테이블(약 1,000,000행까지)에 적합합니다. 많은 작은 테이블이 있는 경우 이 테이블 엔진을 사용하는 것이 바람직하며, 이는 [로그](../../../engines/table-engines/log-family/log.md) 엔진보다 파일 열기가 더 적기 때문에 간단합니다.

## 특성 {#characteristics}

- **더 단순한 구조**: 로그 엔진과 달리 TinyLog는 마크 파일을 사용하지 않습니다. 이로 인해 복잡성이 줄어들지만 대량 데이터셋에 대한 성능 최적화를 제한하기도 합니다.
- **단일 스트림 쿼리**: TinyLog 테이블의 쿼리는 단일 스트림으로 실행되므로, 일반적으로 1,000,000행까지의 상대적으로 작은 테이블에 적합합니다.
- **작은 테이블에 효율적**: TinyLog 엔진의 단순성 덕분에 많은 작은 테이블을 관리할 때 유리하며, 로그 엔진에 비해 파일 작업이 적습니다.

로그 엔진과 달리 TinyLog는 마크 파일을 사용하지 않습니다. 이로 인해 복잡성이 줄어들지만 대량 데이터셋에 대한 성능 최적화를 제한하기도 합니다.

## 테이블 생성 {#table_engines-tinylog-creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    column1_name [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    column2_name [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = TinyLog
```

[CREATE TABLE](/sql-reference/statements/create/table) 쿼리에 대한 자세한 설명을 참조하세요.

## 데이터 쓰기 {#table_engines-tinylog-writing-the-data}

`TinyLog` 엔진은 모든 컬럼을 하나의 파일에 저장합니다. 각 `INSERT` 쿼리에 대해 ClickHouse는 테이블 파일 끝에 데이터 블록을 추가하며, 컬럼을 하나씩 씁니다.

각 테이블에 대해 ClickHouse는 다음과 같은 파일을 생성합니다:

- `<column>.bin`: 직렬화되고 압축된 데이터를 포함하는 각 컬럼의 데이터 파일입니다.

`TinyLog` 엔진은 `ALTER UPDATE` 및 `ALTER DELETE` 작업을 지원하지 않습니다.

## 사용 사례 예시 {#table_engines-tinylog-example-of-use}

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

우리는 두 개의 `INSERT` 쿼리를 사용하여 두 개의 데이터 블록을 `<column>.bin` 파일 내부에 생성했습니다.

ClickHouse는 데이터를 선택할 때 단일 스트림을 사용합니다. 결과적으로 출력의 행 블록 순서는 입력의 동일한 블록 순서와 일치합니다. 예를 들어:

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
