---
'description': 'ClickHouse에서 QBit 데이터 유형에 대한 문서로, 근사 벡터 검색을 위한 세밀한 양자화를 가능하게 합니다.'
'keywords':
- 'qbit'
- 'data type'
'sidebar_label': 'QBit'
'sidebar_position': 64
'slug': '/sql-reference/data-types/qbit'
'title': 'QBit 데이터 유형'
'doc_type': 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

<ExperimentalBadge/>

`QBit` 데이터 유형은 빠른 근사 검색을 위해 벡터 저장 구조를 재구성합니다. 각 벡터의 요소를 함께 저장하는 대신, 모든 벡터에서 동일한 이진 숫자 위치를 그룹화합니다. 이렇게 하면 검색 시 세밀한 양자화 수준을 선택할 수 있으면서 벡터를 전체 정밀도로 저장합니다: I/O가 적고 계산이 더 빠르게 이루어지는 적은 비트를 읽거나, 더 높은 정확도를 위해 더 많은 비트를 읽을 수 있습니다. 양자화로 인해 데이터 전송 및 계산의 속도 이점을 누리면서도 원래 데이터는 필요할 때 언제든지 사용할 수 있습니다.

:::note
`QBit` 데이터 유형과 관련 거리 함수는 현재 실험적입니다.
사용하려면 먼저 `SET allow_experimental_qbit_type = 1`을 실행하십시오.
문제가 발생할 경우, [ClickHouse repository](https://github.com/clickhouse/clickhouse/issues)에서 이슈를 열어주십시오.
:::

`QBit` 유형의 컬럼을 선언하려면 다음 구문을 사용하십시오:

```sql
column_name QBit(element_type, dimension)
```

* `element_type` – 각 벡터 요소의 유형입니다. 허용되는 유형은 `BFloat16`, `Float32`, 및 `Float64`입니다.
* `dimension` – 각 벡터의 요소 수입니다.

## QBit 생성 {#creating-qbit}

테이블 컬럼 정의에서 `QBit` 유형 사용:

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

## QBit 서브컬럼 {#qbit-subcolumns}

`QBit`는 저장된 벡터의 개별 비트 평면에 접근할 수 있는 서브컬럼 접근 패턴을 구현합니다. 각 비트 위치는 `.N` 구문을 사용하여 접근할 수 있으며, 여기서 `N`은 비트 위치입니다:

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

접근 가능한 서브컬럼 수는 요소 유형에 따라 다릅니다:

* `BFloat16`: 16개의 서브컬럼 (1-16)
* `Float32`: 32개의 서브컬럼 (1-32)
* `Float64`: 64개의 서브컬럼 (1-64)

## 벡터 검색 함수 {#vector-search-functions}

다음은 `QBit` 데이터 유형을 사용하는 벡터 유사성 검색을 위한 거리 함수입니다:

* [`L2DistanceTransposed`](../functions/distance-functions.md#L2DistanceTransposed)
