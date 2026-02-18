---
description: 'ClickHouse에서 세밀한 양자화를 통해 근사 벡터 검색을 가능하게 하는 QBit 데이터 타입에 대한 문서'
keywords: ['qbit', 'data type']
sidebar_label: 'QBit'
sidebar_position: 64
slug: /sql-reference/data-types/qbit
title: 'QBit 데이터 타입'
doc_type: 'reference'
---

`QBit` 데이터 타입은 더 빠른 근사 검색을 위해 벡터 저장 방식을 재구성합니다. 각 벡터의 요소를 함께 저장하는 대신, 모든 벡터에서 동일한 이진수 비트 위치를 기준으로 묶어서 저장합니다.
이 방식은 벡터를 전체 정밀도로 저장하면서, 검색 시점에 세밀한 양자화 수준을 선택할 수 있도록 합니다. 더 적은 비트를 읽으면 I/O가 줄어들어 계산이 더 빨라지고, 더 많은 비트를 읽으면 정확도가 높아집니다. 양자화를 통해 데이터 전송량과 연산량 감소에 따른 속도 이점을 얻으면서도, 필요할 때는 원본 데이터가 그대로 유지된 상태로 언제든지 사용할 수 있습니다.

`QBit` 타입 컬럼을 선언하려면 다음 구문을 사용합니다:

```sql
column_name QBit(element_type, dimension)
```

* `element_type` – 각 벡터 요소의 타입입니다. 사용할 수 있는 타입은 `BFloat16`, `Float32`, `Float64`입니다.
* `dimension` – 각 벡터에 포함된 요소 개수입니다.


## QBit 생성 \{#creating-qbit\}

테이블 컬럼 정의에서 `QBit` 타입을 사용합니다:

```sql
CREATE TABLE test (id UInt32, vec QBit(Float32, 8)) ENGINE = Memory;
INSERT INTO test VALUES (1, [1, 2, 3, 4, 5, 6, 7, 8]), (2, [9, 10, 11, 12, 13, 14, 15, 16]);
SELECT vec FROM test ORDER BY id;
```

```text
┌─vec──────────────────────┐
│ [1,2,3,4,5,6,7,8]        │
│ [9,10,11,12,13,14,15,16] │
└──────────────────────────┘
```


## QBit 서브컬럼 \{#qbit-subcolumns\}

`QBit`은(는) 저장된 벡터의 개별 비트 플레인에 액세스할 수 있는 서브컬럼 액세스 패턴을 구현합니다. 각 비트 위치는 `.N` 구문을 사용하여 액세스할 수 있으며, 여기서 `N`은 비트 위치를 의미합니다:

```sql
CREATE TABLE test (id UInt32, vec QBit(Float32, 8)) ENGINE = Memory;
INSERT INTO test VALUES (1, [0, 0, 0, 0, 0, 0, 0, 0]);
INSERT INTO test VALUES (1, [-0, -0, -0, -0, -0, -0, -0, -0]);
SELECT bin(vec.1) FROM test;
```

```text
┌─bin(tupleElement(vec, 1))─┐
│ 00000000                  │
│ 11111111                  │
└───────────────────────────┘
```

접근할 수 있는 하위 컬럼(subcolumn)의 개수는 요소 유형에 따라 달라집니다:

* `BFloat16`: 하위 컬럼 16개(1-16)
* `Float32`: 하위 컬럼 32개(1-32)
* `Float64`: 하위 컬럼 64개(1-64)


## 벡터 검색 함수 \{#vector-search-functions\}

다음은 `QBit` 데이터 타입을 사용하는 벡터 유사도 검색용 거리 함수들입니다:

* [`L2DistanceTransposed`](../functions/distance-functions.md#L2DistanceTransposed)
* [`cosineDistanceTransposed`](../functions/distance-functions.md#cosineDistanceTransposed)