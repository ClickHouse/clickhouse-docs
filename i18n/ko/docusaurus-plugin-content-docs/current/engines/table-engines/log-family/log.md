---
description: 'Log 테이블 엔진에 대한 문서'
slug: /engines/table-engines/log-family/log
toc_priority: 33
toc_title: 'Log'
title: 'Log 테이블 엔진'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Log 테이블 엔진 \{#log-table-engine\}

<CloudNotSupportedBadge/>

이 엔진은 `Log` 엔진 계열에 속합니다. `Log` 엔진의 공통 속성과 서로 간의 차이점은 [Log Engine Family](../../../engines/table-engines/log-family/index.md) 문서를 참조하십시오.

`Log`는 컬럼 파일과 함께 작은 크기의 「마크(marks)」 파일이 존재한다는 점에서 [TinyLog](../../../engines/table-engines/log-family/tinylog.md)와 다릅니다. 이 마크는 모든 데이터 블록에 기록되며, 지정된 행 수를 건너뛰기 위해 파일을 어디서부터 읽기 시작해야 하는지 나타내는 오프셋을 포함합니다. 이를 통해 여러 스레드에서 테이블 데이터를 읽을 수 있습니다.
동시 데이터 접근 시 읽기 작업은 동시에 수행될 수 있지만, 쓰기 작업은 읽기 작업과 다른 쓰기 작업을 모두 차단합니다.
`Log` 엔진은 인덱스를 지원하지 않습니다. 또한 테이블에 대한 쓰기가 실패하면 테이블이 손상된 상태가 되며, 이 테이블을 읽으려고 하면 오류가 반환됩니다. `Log` 엔진은 임시 데이터, 한 번만 쓰는 테이블, 테스트 또는 데모용 목적에 적합합니다.



## 테이블 생성 \{#table_engines-log-creating-a-table\}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    column1_name [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    column2_name [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = Log
```

[CREATE TABLE](/sql-reference/statements/create/table) 쿼리에 대한 자세한 내용은 참조하십시오.


## 데이터 쓰기 \{#table_engines-log-writing-the-data\}

`Log` 엔진은 각 컬럼을 개별 파일에 기록하여 데이터를 효율적으로 저장합니다. `Log` 엔진은 각 테이블에 대해 지정된 스토리지 경로에 다음 파일들을 기록합니다:

- `<column>.bin`: 각 컬럼에 대한 데이터 파일로, 직렬화되고 압축된 데이터를 포함합니다.
`__marks.mrk`: 마크 파일로, 삽입된 각 데이터 블록의 오프셋과 행 수를 저장합니다. 마크는 읽기 시 엔진이 관련 없는 데이터 블록을 건너뛰어 쿼리를 효율적으로 실행할 수 있도록 사용됩니다.

### 쓰기 과정 \{#writing-process\}

데이터를 `Log` 테이블에 쓸 때:

1.    데이터가 블록 단위로 직렬화되고 압축됩니다.
2.    각 컬럼에 대해 압축된 데이터가 해당 `<column>.bin` 파일에 이어서 기록됩니다.
3.    새로 삽입된 데이터의 오프셋과 행 수를 기록하기 위해 대응하는 항목이 `__marks.mrk` 파일에 추가됩니다.



## 데이터 읽기 \{#table_engines-log-reading-the-data\}

마크 파일을 사용하면 ClickHouse가 데이터를 병렬로 읽을 수 있습니다. 따라서 `SELECT` 쿼리는 예측할 수 없는 순서로 행을 반환합니다. 행을 정렬하려면 `ORDER BY` 절을 사용하십시오.



## 사용 예 \{#table_engines-log-example-of-use\}

테이블 생성:

```sql
CREATE TABLE log_table
(
    timestamp DateTime,
    message_type String,
    message String
)
ENGINE = Log
```

데이터 삽입:

```sql
INSERT INTO log_table VALUES (now(),'REGULAR','The first regular message')
INSERT INTO log_table VALUES (now(),'REGULAR','The second regular message'),(now(),'WARNING','The first warning message')
```

`<column>.bin` 파일에 두 개의 데이터 블록을 생성하기 위해 두 개의 `INSERT` 쿼리를 사용했습니다.

ClickHouse는 데이터를 조회할 때 여러 스레드를 사용합니다. 각 스레드는 개별 데이터 블록을 읽고, 처리가 끝나는 대로 결과 행을 독립적으로 반환합니다. 그 결과, 출력에서 행 블록의 순서는 입력에서 동일한 블록의 순서와 일치하지 않을 수 있습니다. 예를 들어 다음과 같습니다.

```sql
SELECT * FROM log_table
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

결과 정렬(기본은 오름차순):

```sql
SELECT * FROM log_table ORDER BY timestamp
```

```text
┌───────────timestamp─┬─message_type─┬─message────────────────────┐
│ 2019-01-18 14:23:43 │ REGULAR      │ The first regular message  │
│ 2019-01-18 14:27:32 │ REGULAR      │ The second regular message │
│ 2019-01-18 14:34:53 │ WARNING      │ The first warning message  │
└─────────────────────┴──────────────┴────────────────────────────┘
```
