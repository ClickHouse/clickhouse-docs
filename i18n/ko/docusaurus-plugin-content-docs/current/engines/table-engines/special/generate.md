---
description: 'GenerateRandom 테이블 엔진은 주어진 테이블 스키마에 따라 무작위 데이터를 생성합니다.'
sidebar_label: 'GenerateRandom'
sidebar_position: 140
slug: /engines/table-engines/special/generate
title: 'GenerateRandom 테이블 엔진'
doc_type: 'reference'
---



# GenerateRandom 테이블 엔진 \{#generaterandom-table-engine\}

GenerateRandom 테이블 엔진은 지정된 테이블 스키마에 대해 임의의 데이터를 생성합니다.

사용 예시:

- 재현 가능한 대용량 테이블을 채우는 테스트에 사용합니다.
- 퍼징(fuzzing) 테스트를 위한 임의 입력 데이터를 생성합니다.



## ClickHouse 서버에서 사용 \{#usage-in-clickhouse-server\}

```sql
ENGINE = GenerateRandom([random_seed [,max_string_length [,max_array_length]]])
```

`max_array_length` 및 `max_string_length` 매개변수는 생성된 데이터에서 각각 모든 array 또는 맵 컬럼과 문자열의 최대 길이를 지정합니다.

Generate 테이블 엔진은 `SELECT` 쿼리만 지원합니다.

테이블에 저장할 수 있는 모든 [DataTypes](../../../sql-reference/data-types/index.md)를 지원하지만 `AggregateFunction`은 제외됩니다.


## 예시 \{#example\}

**1.** `generate_engine_table` 테이블을 준비합니다:

```sql
CREATE TABLE generate_engine_table (name String, value UInt32) ENGINE = GenerateRandom(1, 5, 3)
```

**2.** 데이터를 쿼리합니다:

```sql
SELECT * FROM generate_engine_table LIMIT 3
```

```text
┌─name─┬──────value─┐
│ c4xJ │ 1412771199 │
│ r    │ 1791099446 │
│ 7#$  │  124312908 │
└──────┴────────────┘
```


## 구현 세부 사항 \{#details-of-implementation\}

- 다음 기능은 지원되지 않습니다.
  - `ALTER`
  - `SELECT ... SAMPLE`
  - `INSERT`
  - 인덱스
  - 복제
