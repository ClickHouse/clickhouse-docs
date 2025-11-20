---
'description': 'Log에 대한 문서'
'slug': '/engines/table-engines/log-family/log'
'toc_priority': 33
'toc_title': 'Log'
'title': '로그 테이블 엔진'
'doc_type': 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 로그 테이블 엔진

<CloudNotSupportedBadge/>

이 엔진은 `Log` 엔진 계열에 속합니다. `Log` 엔진의 공통 속성과 차이점에 대해서는 [Log Engine Family](../../../engines/table-engines/log-family/index.md) 문서를 참조하십시오.

`Log`는 [TinyLog](../../../engines/table-engines/log-family/tinylog.md)와는 달리 컬럼 파일과 함께 "마크"의 작은 파일이 존재합니다. 이 마크는 모든 데이터 블록에 작성되며, 지정된 수의 행을 건너뛰기 위해 파일 읽기를 시작해야 하는 위치를 나타내는 오프셋을 포함합니다. 이를 통해 테이블 데이터를 여러 스레드에서 읽을 수 있습니다.
동시 데이터 접근을 위해 읽기 작업은 동시에 수행될 수 있지만, 쓰기 작업은 읽기와 서로를 차단합니다.
`Log` 엔진은 인덱스를 지원하지 않습니다. 마찬가지로 테이블에 쓰기가 실패하면 테이블이 손상되고, 이에 대한 읽기는 오류를 반환합니다. `Log` 엔진은 임시 데이터, 쓰기 전용 테이블 및 테스트 또는 시연 목적으로 적합합니다.

## 테이블 생성 {#table_engines-log-creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    column1_name [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    column2_name [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = Log
```

[CREATE TABLE](/sql-reference/statements/create/table) 쿼리에 대한 자세한 설명을 참조하십시오.

## 데이터 쓰기 {#table_engines-log-writing-the-data}

`Log` 엔진은 각 컬럼을 자신의 파일에 작성하여 데이터를 효율적으로 저장합니다. Log 엔진은 각 테이블에 대해 지정된 저장 경로에 다음 파일을 작성합니다:

- `<column>.bin`: 직렬화되고 압축된 데이터를 포함하는 각 컬럼에 대한 데이터 파일.
`__marks.mrk`: 삽입된 각 데이터 블록의 오프셋과 행 수를 저장하는 마크 파일. 마크는 엔진이 읽기 중에 관련 없는 데이터 블록을 건너뛰도록 하여 효율적인 쿼리 실행을 촉진하는 데 사용됩니다.

### 쓰기 과정 {#writing-process}

`Log` 테이블에 데이터가 작성될 때:

1.    데이터가 블록으로 직렬화되고 압축됩니다.
2.    각 컬럼에 대해 압축된 데이터가 해당 `<column>.bin` 파일에 추가됩니다.
3.    새로 삽입된 데이터의 오프셋과 행 수를 기록하기 위해 `__marks.mrk` 파일에 해당 항목이 추가됩니다.

## 데이터 읽기 {#table_engines-log-reading-the-data}

마크가 포함된 파일은 ClickHouse가 데이터 읽기를 병렬화할 수 있게 합니다. 이는 `SELECT` 쿼리가 예측할 수 없는 순서로 행을 반환한다는 것을 의미합니다. 행을 정렬하려면 `ORDER BY` 절을 사용하십시오.

## 사용 예시 {#table_engines-log-example-of-use}

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

우리는 두 개의 `INSERT` 쿼리를 사용하여 `<column>.bin` 파일 내에 두 개의 데이터 블록을 생성했습니다.

ClickHouse는 데이터를 선택할 때 여러 스레드를 사용합니다. 각 스레드는 별도의 데이터 블록을 읽고, 작업이 완료되면 결과 행을 독립적으로 반환합니다. 따라서 출력에서 행 블록의 순서가 입력에서의 동일한 블록 순서와 일치하지 않을 수 있습니다. 예를 들어:

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

결과 정렬 (기본적으로 오름차순):

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
