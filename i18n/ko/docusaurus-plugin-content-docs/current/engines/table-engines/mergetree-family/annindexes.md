---
description: '정확 및 근사 벡터 검색에 대한 문서'
keywords: ['벡터 유사도 검색', 'ann', 'knn', 'hnsw', '인덱스', '인덱스', '최근접 이웃', '벡터 검색']
sidebar_label: '정확 및 근사 벡터 검색'
slug: /engines/table-engines/mergetree-family/annindexes
title: '정확 및 근사 벡터 검색'
doc_type: 'guide'
---

# 정확 벡터 검색과 근사 벡터 검색 \{#exact-and-approximate-vector-search\}

주어진 점에 대해 다차원(벡터) 공간에서 가장 가까운 N개의 점을 찾는 문제는 [최근접 이웃 검색](https://en.wikipedia.org/wiki/Nearest_neighbor_search)이라고 하며, 줄여서 벡터 검색이라고 합니다.
벡터 검색을 수행하는 일반적인 접근 방식은 두 가지가 있습니다.

* 정확 벡터 검색은 주어진 점과 벡터 공간에 있는 모든 점 사이의 거리를 계산합니다. 이렇게 하면 가능한 최상의 정확도가 보장되며, 즉 반환되는 점들이 실제 최근접 이웃임이 보장됩니다. 벡터 공간을 완전 탐색하기 때문에, 정확 벡터 검색은 실제 환경에서 사용하기에는 지나치게 느릴 수 있습니다.
* 근사 벡터 검색은 그래프나 랜덤 포레스트와 같은 특수 데이터 구조를 사용하여, 정확 벡터 검색보다 훨씬 빠르게 결과를 계산하는 기법들의 집합을 의미합니다. 결과 정확도는 일반적으로 실사용에 「충분히 좋은」 수준입니다. 많은 근사 기법은 결과 정확도와 검색 시간 간의 트레이드오프를 조정할 수 있는 매개변수를 제공합니다.

벡터 검색(정확 또는 근사)은 다음과 같이 SQL로 작성할 수 있습니다.

```sql
WITH [...] AS reference_vector
SELECT [...]
FROM table
WHERE [...] -- a WHERE clause is optional
ORDER BY <DistanceFunction>(vectors, reference_vector)
LIMIT <N>
```

벡터 공간의 점들은 배열 타입의 `vectors` 컬럼에 저장됩니다. 예를 들어 [Array(Float64)](../../../sql-reference/data-types/array.md), [Array(Float32)](../../../sql-reference/data-types/array.md), [Array(BFloat16)](../../../sql-reference/data-types/array.md) 등이 있습니다.
참조 벡터는 상수 배열이며 공통 테이블 식(common table expression)으로 제공합니다.
`<DistanceFunction>`은 참조 점과 저장된 모든 점 사이의 거리를 계산합니다.
사용 가능한 [distance function](/sql-reference/functions/distance-functions) 중 아무 것이나 사용할 수 있습니다.
`<N>`은 반환할 이웃(neighbor)의 수를 지정합니다.


## 정확한 벡터 검색 \{#exact-nearest-neighbor-search\}

정확한 벡터 검색은 위의 `SELECT` 쿼리를 그대로 사용하여 수행할 수 있습니다.
이러한 쿼리의 런타임은 일반적으로 저장된 벡터의 개수와 그 차원, 즉 배열 요소의 개수에 비례합니다.
또한 ClickHouse가 모든 벡터를 브루트 포스(brute-force) 방식으로 전수 스캔하므로, 런타임은 쿼리에 의해 사용되는 스레드 수(설정값 [max_threads](../../../operations/settings/settings.md#max_threads) 참조)에도 영향을 받습니다.

### 예제 \{#exact-nearest-neighbor-search-example\}

```sql
CREATE TABLE tab(id Int32, vec Array(Float32)) ENGINE = MergeTree ORDER BY id;

INSERT INTO tab VALUES (0, [1.0, 0.0]), (1, [1.1, 0.0]), (2, [1.2, 0.0]), (3, [1.3, 0.0]), (4, [1.4, 0.0]), (5, [1.5, 0.0]), (6, [0.0, 2.0]), (7, [0.0, 2.1]), (8, [0.0, 2.2]), (9, [0.0, 2.3]), (10, [0.0, 2.4]), (11, [0.0, 2.5]);

WITH [0., 2.] AS reference_vec
SELECT id, vec
FROM tab
ORDER BY L2Distance(vec, reference_vec) ASC
LIMIT 3;
```

반환

```result
   ┌─id─┬─vec─────┐
1. │  6 │ [0,2]   │
2. │  7 │ [0,2.1] │
3. │  8 │ [0,2.2] │
   └────┴─────────┘
```


## 근사치 벡터 검색 \{#approximate-nearest-neighbor-search\}

### 벡터 유사성 인덱스 \{#vector-similarity-index\}

ClickHouse는 근사 벡터 검색을 수행하기 위한 특별한 「벡터 유사성」 인덱스를 제공합니다.

:::note
벡터 유사성 인덱스는 ClickHouse 25.8 버전 이상에서 사용 가능합니다.
문제가 발생하면 [ClickHouse 리포지토리](https://github.com/clickhouse/clickhouse/issues)에 이슈를 등록해 주십시오.
:::

#### 벡터 유사도 인덱스 생성 \{#creating-a-vector-similarity-index\}

벡터 유사도 인덱스는 새 테이블에서 다음과 같이 생성할 수 있습니다:

```sql
CREATE TABLE table
(
  [...],
  vectors Array(Float*),
  INDEX <index_name> vectors TYPE vector_similarity(<type>, <distance_function>, <dimensions>) [GRANULARITY <N>]
)
ENGINE = MergeTree
ORDER BY [...]
```

또는 기존 테이블에 벡터 유사성 인덱스를 추가하려면 다음과 같이 합니다.

```sql
ALTER TABLE table ADD INDEX <index_name> vectors TYPE vector_similarity(<type>, <distance_function>, <dimensions>) [GRANULARITY <N>];
```

벡터 유사도 인덱스는 특수한 형태의 스키핑 인덱스입니다(설명은 [여기](mergetree.md#table_engine-mergetree-data_skipping-indexes)와 [여기](../../../optimize/skipping-indexes) 참고).
따라서 위의 `ALTER TABLE` 구문은 테이블에 이후에 삽입되는 신규 데이터에 대해서만 인덱스를 생성합니다.
기존 데이터에 대해서도 인덱스를 생성하려면, 인덱스를 머티리얼라이즈(materialize)해야 합니다:

```sql
ALTER TABLE table MATERIALIZE INDEX <index_name> SETTINGS mutations_sync = 2;
```

Function `<distance_function>`은(는) 다음 중 하나여야 합니다.

* `L2Distance`: [Euclidean distance](https://en.wikipedia.org/wiki/Euclidean_distance)로, 유클리드 공간에서 두 점 사이의 직선 길이를 나타내며,
* `cosineDistance`: [cosine distance](https://en.wikipedia.org/wiki/Cosine_similarity#Cosine_distance)로, 0이 아닌 두 벡터 사이의 각도를 나타냅니다.

정규화된 데이터에서는 일반적으로 `L2Distance`가 가장 좋은 선택이며, 그렇지 않은 경우에는 스케일을 보정하기 위해 `cosineDistance` 사용을 권장합니다.

`<dimensions>`는 기반 컬럼의 배열 카디널리티(요소 개수)를 지정합니다.
ClickHouse가 인덱스를 생성하는 동안 카디널리티가 다른 배열을 발견하면 인덱스는 폐기되고 오류가 반환됩니다.

선택적 GRANULARITY 파라미터 `<N>`은 인덱스 그래뉼의 크기를 의미합니다([여기](../../../optimize/skipping-indexes) 참고).
기본 인덱스 그래뉼을 1로 사용하는 일반 스킵 인덱스와 달리, 벡터 유사도 인덱스는 기본 인덱스 그래뉼로 1억을 사용합니다.
이 값은 큰 파트에 대해서도 내부적으로 적은 수의 인덱스만 생성되도록 보장합니다.
인덱스 그래뉼 변경은 그 영향에 대해 충분히 이해하고 있는 고급 사용자에게만 권장합니다([아래](#differences-to-regular-skipping-indexes) 참고).

벡터 유사도 인덱스는 서로 다른 근사 검색 알고리즘을 수용할 수 있다는 점에서 범용적으로 설계되었습니다.
실제로 사용되는 알고리즘은 파라미터 `<type>`으로 지정됩니다.
현재 사용 가능한 유일한 방법은 HNSW([학술 논문](https://arxiv.org/abs/1603.09320))로, 계층적 근접 그래프에 기반한 근사 벡터 검색에서 널리 사용되는 최신 기법입니다.
`type`으로 HNSW를 사용하는 경우, 선택적으로 HNSW 전용 추가 파라미터를 지정할 수 있습니다:

```sql
CREATE TABLE table
(
  [...],
  vectors Array(Float*),
  INDEX index_name vectors TYPE vector_similarity('hnsw', <distance_function>, <dimensions>[, <quantization>, <hnsw_max_connections_per_layer>, <hnsw_candidate_list_size_for_construction>]) [GRANULARITY N]
)
ENGINE = MergeTree
ORDER BY [...]
```

다음과 같은 HNSW 전용 파라미터를 사용할 수 있습니다:

* `<quantization>`은 근접 그래프에서 벡터의 양자화 방식을 제어합니다. 사용 가능한 값은 `f64`, `f32`, `f16`, `bf16`, `i8`, `b1`이며, 기본값은 `bf16`입니다. 이 파라미터는 기본 컬럼에서 벡터가 표현되는 방식에는 영향을 주지 않는다는 점에 유의합니다.
* `<hnsw_max_connections_per_layer>`는 그래프 노드당 이웃의 수를 제어하며, HNSW 하이퍼파라미터 `M`으로도 알려져 있습니다. 기본값은 `32`입니다. 값이 `0`이면 기본값을 사용함을 의미합니다.
* `<hnsw_candidate_list_size_for_construction>`는 HNSW 그래프를 구성하는 동안 동적 후보 목록의 크기를 제어하며, HNSW 하이퍼파라미터 `ef_construction`으로도 알려져 있습니다. 기본값은 `128`입니다. 값이 `0`이면 기본값을 사용함을 의미합니다.

모든 HNSW 전용 파라미터의 기본값은 대부분의 사용 사례에서 충분히 잘 동작합니다.
따라서 HNSW 전용 파라미터를 개별적으로 조정하는 것은 권장하지 않습니다.

추가 제한 사항이 적용됩니다:


* 벡터 유사도 인덱스는 [Array(Float32)](../../../sql-reference/data-types/array.md), [Array(Float64)](../../../sql-reference/data-types/array.md), [Array(BFloat16)](../../../sql-reference/data-types/array.md) 타입의 컬럼에만 생성할 수 있습니다. `Array(Nullable(Float32))`, `Array(LowCardinality(Float32))`와 같이 널 허용 및 저 카디널리티 부동소수점 배열은 허용되지 않습니다.
* 벡터 유사도 인덱스는 단일 컬럼에만 생성해야 합니다.
* 벡터 유사도 인덱스는 계산된 표현식(예: `INDEX index_name arraySort(vectors) TYPE vector_similarity([...])`)에도 생성할 수 있지만, 이러한 인덱스는 이후 근사 이웃 검색에는 사용할 수 없습니다.
* 벡터 유사도 인덱스는 기반 컬럼의 모든 배열이 `<dimension>`개의 요소를 가지도록 요구합니다. 이는 인덱스 생성 시점에 검사됩니다. 이 요구 사항 위반을 가능한 한 일찍 감지하기 위해, 사용자는 벡터 컬럼에 대해 `CONSTRAINT same_length CHECK length(vectors) = 256`과 같은 [제약 조건(constraint)](/sql-reference/statements/create/table.md#constraints)을 추가할 수 있습니다.
* 마찬가지로, 기반 컬럼의 배열 값은 비어 있으면 안 되며(`[]`), 기본값(역시 `[]`)을 가져서도 안 됩니다.

**스토리지 및 메모리 사용량 추정**

일반적인 AI 모델(예: Large Language Model, [LLMs](https://en.wikipedia.org/wiki/Large_language_model))에서 사용하기 위해 생성된 벡터는 수백 또는 수천 개의 부동소수점 값으로 구성됩니다.
따라서 단일 벡터 값만으로도 여러 킬로바이트의 메모리를 사용할 수 있습니다.
테이블에서 기반 벡터 컬럼에 필요한 스토리지와 벡터 유사도 인덱스에 필요한 메인 메모리를 미리 추정하려는 사용자는 아래 두 가지 공식을 사용할 수 있습니다:

테이블에서 벡터 컬럼의 스토리지 사용량(비압축):

```text
Storage consumption = Number of vectors * Dimension * Size of column data type
```

[dbpedia 데이터셋](https://huggingface.co/datasets/KShivendu/dbpedia-entities-openai-1M) 예제:

```text
Storage consumption = 1 million * 1536 * 4 (for Float32) = 6.1 GB
```

벡터 유사성 인덱스는 검색을 수행하기 위해 디스크에서 주 메모리로 완전히 로드되어야 합니다.
마찬가지로 벡터 인덱스도 메모리에서 완전히 구축한 다음 디스크에 저장됩니다.

벡터 인덱스를 로드하는 데 필요한 메모리 사용량:

```text
Memory for vectors in the index (mv) = Number of vectors * Dimension * Size of quantized data type
Memory for in-memory graph (mg) = Number of vectors * hnsw_max_connections_per_layer * Bytes_per_node_id (= 4) * Layer_node_repetition_factor (= 2)

Memory consumption: mv + mg
```

[dbpedia 데이터세트](https://huggingface.co/datasets/KShivendu/dbpedia-entities-openai-1M)에 대한 예:

```text
Memory for vectors in the index (mv) = 1 million * 1536 * 2 (for BFloat16) = 3072 MB
Memory for in-memory graph (mg) = 1 million * 64 * 2 * 4 = 512 MB

Memory consumption = 3072 + 512 = 3584 MB
```

위의 공식에는 사전 할당된 버퍼와 캐시와 같은 런타임 데이터 구조를 위해 벡터 유사도 인덱스에 추가로 요구되는 메모리가 반영되어 있지 않습니다.


#### 벡터 유사도 인덱스 사용하기 \{#using-a-vector-similarity-index\}

:::note
벡터 유사도 인덱스를 사용하려면 [compatibility](../../../operations/settings/settings.md) 설정이 `''`(기본값) 또는 `'25.1'` 이상이어야 합니다.
:::

벡터 유사도 인덱스는 다음과 같은 형태의 SELECT 쿼리를 지원합니다.

```sql
WITH [...] AS reference_vector
SELECT [...]
FROM table
WHERE [...] -- a WHERE clause is optional
ORDER BY <DistanceFunction>(vectors, reference_vector)
LIMIT <N>
```

ClickHouse&#39;s 쿼리 옵티마이저는 위 쿼리 템플릿과 매칭하고, 사용 가능한 벡터 유사도 인덱스를 활용하려고 시도합니다.
SELECT 쿼리에서 사용하는 거리 함수가 인덱스 정의에 사용된 거리 함수와 동일할 때만 쿼리는 벡터 유사도 인덱스를 사용할 수 있습니다.

고급 사용자는 검색 중 후보 리스트 크기를 조정하기 위해 설정 값 [hnsw&#95;candidate&#95;list&#95;size&#95;for&#95;search](../../../operations/settings/settings.md#hnsw_candidate_list_size_for_search) (HNSW 하이퍼파라미터 &quot;ef&#95;search&quot;라고도 함)에 사용자 정의 값을 지정할 수 있습니다 (예:  `SELECT [...] SETTINGS hnsw_candidate_list_size_for_search = <value>`).
이 설정의 기본값 256은 대부분의 사용 사례에서 잘 동작합니다.
이 설정 값을 더 크게 지정할수록 정확도는 올라가지만 성능은 느려집니다.

쿼리가 벡터 유사도 인덱스를 사용할 수 있는 경우, ClickHouse는 SELECT 쿼리에 지정된 LIMIT `<N>` 값이 합리적인 범위인지 확인합니다.
보다 구체적으로, `<N>`이 기본값 100인 설정 [max&#95;limit&#95;for&#95;vector&#95;search&#95;queries](../../../operations/settings/settings.md#max_limit_for_vector_search_queries)의 값보다 크면 오류가 반환됩니다.
너무 큰 LIMIT 값은 검색을 느리게 만들 수 있으며, 일반적으로 사용상의 오류를 나타냅니다.

SELECT 쿼리가 벡터 유사도 인덱스를 사용하는지 확인하려면 쿼리 앞에 `EXPLAIN indexes = 1`을 붙이면 됩니다.

예를 들어, 다음과 같은 쿼리를 사용할 수 있습니다.

```sql
EXPLAIN indexes = 1
WITH [0.462, 0.084, ..., -0.110] AS reference_vec
SELECT id, vec
FROM tab
ORDER BY L2Distance(vec, reference_vec) ASC
LIMIT 10;
```

반환할 수 있습니다

```result
    ┌─explain─────────────────────────────────────────────────────────────────────────────────────────┐
 1. │ Expression (Project names)                                                                      │
 2. │   Limit (preliminary LIMIT (without OFFSET))                                                    │
 3. │     Sorting (Sorting for ORDER BY)                                                              │
 4. │       Expression ((Before ORDER BY + (Projection + Change column names to column identifiers))) │
 5. │         ReadFromMergeTree (default.tab)                                                         │
 6. │         Indexes:                                                                                │
 7. │           PrimaryKey                                                                            │
 8. │             Condition: true                                                                     │
 9. │             Parts: 1/1                                                                          │
10. │             Granules: 575/575                                                                   │
11. │           Skip                                                                                  │
12. │             Name: idx                                                                           │
13. │             Description: vector_similarity GRANULARITY 100000000                                │
14. │             Parts: 1/1                                                                          │
15. │             Granules: 10/575                                                                    │
    └─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

이 예제에서는 [dbpedia 데이터셋](https://huggingface.co/datasets/KShivendu/dbpedia-entities-openai-1M)에 있는 1백만 개의 벡터(각각 차원 1536인)가 575개의 그래뉼에 저장되어 있으며, 즉 그래뉼당 약 1.7k 행입니다.
쿼리는 10개의 이웃을 요청하고, 벡터 유사도 인덱스는 서로 다른 10개의 그래뉼에서 이 10개의 이웃을 찾습니다.
쿼리 실행 시 이 10개의 그래뉼이 읽힙니다.

벡터 유사도 인덱스는 출력에 `Skip`과 벡터 인덱스의 이름과 타입(이 예제에서는 `idx`와 `vector_similarity`)이 포함된 경우 사용됩니다.
이 경우, 벡터 유사도 인덱스는 4개의 그래뉼 중 2개를 건너뛰었으며, 이는 전체 데이터의 50%에 해당합니다.
더 많은 그래뉼을 건너뛸수록 인덱스 사용 효율이 높아집니다.

:::tip
인덱스 사용을 강제하려면 [force&#95;data&#95;skipping&#95;indexes](../../../operations/settings/settings#force_data_skipping_indices) 설정을 사용하여 SELECT 쿼리를 실행하면 됩니다(설정 값으로 인덱스 이름을 지정합니다).
:::

**Post-filtering과 Pre-filtering**

사용자는 선택적으로 SELECT 쿼리의 `WHERE` 절에 추가 필터 조건을 지정할 수 있습니다.
ClickHouse는 post-filtering 또는 pre-filtering 전략을 사용하여 이러한 필터 조건을 평가합니다.
간단히 말해, 두 전략은 필터를 평가하는 순서를 결정합니다.

* Post-filtering은 벡터 유사도 인덱스를 먼저 평가한 다음 ClickHouse가 `WHERE` 절에 지정된 추가 필터를 평가함을 의미합니다.
* Pre-filtering은 필터 평가 순서가 그 반대임을 의미합니다.

각 전략은 서로 다른 트레이드오프를 가집니다:


* 사후 필터링(post-filtering)은 일반적으로 `LIMIT <N>` 절에서 요청한 행 개수보다 적은 행을 반환할 수 있다는 문제가 있습니다. 이러한 상황은 벡터 유사도 인덱스가 반환한 하나 이상의 결과 행이 추가 필터 조건을 만족하지 못할 때 발생합니다.
* 사전 필터링(pre-filtering)은 일반적으로 아직 완전히 해결되지 않은 문제입니다. 일부 특수화된 벡터 데이터베이스는 사전 필터링 알고리즘을 제공하지만, 대부분의 관계형 데이터베이스(ClickHouse 포함)는 결국 정확한 이웃 검색(exact neighbor search), 즉 인덱스 없이 전체를 브루트 포스로 스캔하는 방식으로 되돌아갑니다.

어떤 전략이 사용되는지는 필터 조건에 따라 달라집니다.

*추가 필터가 파티션 키의 일부인 경우*

추가 필터 조건이 파티션 키의 일부인 경우 ClickHouse는 파티션 프루닝(partition pruning)을 적용합니다.
예를 들어, 테이블이 컬럼 `year` 기준으로 범위 파티션(range partition)으로 나뉘어 있고 다음 쿼리가 실행된다고 가정합니다:

```sql
WITH [0., 2.] AS reference_vec
SELECT id, vec
FROM tab
WHERE year = 2025
ORDER BY L2Distance(vec, reference_vec) ASC
LIMIT 3;
```

ClickHouse는 2025 파티션만 남기고 나머지 모든 파티션을 제거합니다.

*추가 필터를 인덱스를 사용해 평가할 수 없는 경우*

추가 필터 조건을 인덱스(기본 키 인덱스, 스키핑 인덱스)를 사용해 평가할 수 없는 경우, ClickHouse는 사후 필터링을 적용합니다.

*추가 필터를 기본 키 인덱스를 사용해 평가할 수 있는 경우*

추가 필터 조건을 [기본 키](mergetree.md#primary-key)를 사용해 평가할 수 있는 경우(즉, 기본 키의 접두사를 구성하는 경우)이며,

* 필터 조건이 파트 내에서 최소 한 개의 행을 제거하는 경우, ClickHouse는 해당 파트 내의 「남아 있는」 범위들에 대해 사전 필터링으로 전환합니다.
* 필터 조건이 파트 내에서 어떠한 행도 제거하지 못하는 경우, ClickHouse는 해당 파트에 대해 사후 필터링을 수행합니다.

실제 사용 사례에서 후자의 경우는 거의 발생하지 않습니다.

*추가 필터를 스키핑 인덱스를 사용해 평가할 수 있는 경우*

추가 필터 조건을 [스키핑 인덱스](mergetree.md#table_engine-mergetree-data_skipping-indexes)(minmax 인덱스, Set 인덱스 등)를 사용해 평가할 수 있는 경우, ClickHouse는 사후 필터링을 수행합니다.
이러한 경우, 다른 스키핑 인덱스에 비해 가장 많은 행을 제거할 것으로 예상되므로, 벡터 유사도 인덱스가 먼저 평가됩니다.

사후 필터링과 사전 필터링을 더 세밀하게 제어하기 위해 두 가지 설정을 사용할 수 있습니다.

[vector&#95;search&#95;filter&#95;strategy](../../../operations/settings/settings#vector_search_filter_strategy) 설정(기본값: 위의 휴리스틱을 구현하는 `auto`)을 `prefilter`로 설정할 수 있습니다.
이는 추가 필터 조건의 선택성이 매우 높은 경우 사전 필터링을 강제로 적용하는 데 유용합니다.
예를 들어, 다음 쿼리는 사전 필터링으로 인해 성능 이점을 얻을 수 있습니다.

```sql
SELECT bookid, author, title
FROM books
WHERE price < 2.00
ORDER BY cosineDistance(book_vector, getEmbedding('Books on ancient Asian empires'))
LIMIT 10
```

2달러 미만의 가격을 가진 책이 극히 소수라고 가정하면, 벡터 인덱스가 반환한 상위 10개의 일치 결과가 모두 2달러 초과 가격일 수 있으므로, 사후 필터링(post-filtering)을 사용하면 행이 0개 반환될 수 있습니다.
사전 필터링(pre-filtering)을 강제하려면(쿼리에 `SETTINGS vector_search_filter_strategy = 'prefilter'`를 추가), ClickHouse가 먼저 가격이 2달러 미만인 모든 책을 찾은 후, 해당 책들에 대해 브루트 포스 벡터 검색을 수행합니다.

위 문제를 해결하는 또 다른 방법으로 [vector&#95;search&#95;index&#95;fetch&#95;multiplier](../../../operations/settings/settings#vector_search_index_fetch_multiplier) (기본값: `1.0`, 최대값: `1000.0`)를 `1.0`보다 큰 값(예: `2.0`)으로 설정할 수 있습니다.
벡터 인덱스에서 가져오는 최근접 이웃의 개수에 이 설정값을 곱해 늘린 다음, 그 행들에 추가 필터를 적용하여 LIMIT 개수만큼의 행을 반환합니다.
예를 들어, multiplier 값을 `3.0`으로 설정하여 다시 쿼리할 수 있습니다:

```sql
SELECT bookid, author, title
FROM books
WHERE price < 2.00
ORDER BY cosineDistance(book_vector, getEmbedding('Books on ancient Asian empires'))
LIMIT 10
SETTING vector_search_index_fetch_multiplier = 3.0;
```

ClickHouse는 각 파트의 벡터 인덱스에서 3.0 x 10 = 30개의 최근접 이웃을 가져온 후, 추가 필터를 적용합니다.
이 중에서 가장 가까운 이웃 10개만 반환됩니다.
`vector_search_index_fetch_multiplier`를 설정하면 이 문제를 완화할 수 있지만, 극단적인 경우(WHERE 조건이 매우 선택적인 경우)에는 여전히 요청된 N개의 행보다 적은 행만 반환될 수 있습니다.

**재점수화**


ClickHouse의 skip 인덱스는 일반적으로 그래뉼 수준에서 필터링합니다. 즉, skip 인덱스에서의 (내부) 조회는 잠재적으로 일치할 수 있는 그래뉼 목록을 반환하여 이후 스캔에서 읽어야 하는 데이터 양을 줄입니다.
이 방식은 일반적인 skip 인덱스에는 잘 동작하지만, 벡터 유사도 인덱스의 경우에는 「granularity mismatch」를 일으킵니다.
조금 더 자세히 말하면, 벡터 유사도 인덱스는 주어진 기준 벡터에 대해 가장 유사한 N개의 벡터에 대한 행 번호를 결정하지만, 이후 이 행 번호를 그래뉼 번호로 외삽해야 합니다.
ClickHouse는 그런 다음 디스크에서 해당 그래뉼들을 로드하고, 이 그래뉼에 포함된 모든 벡터에 대해 거리를 다시 계산합니다.
이 단계를 재점수(rescoring)라고 하며, 벡터 유사도 인덱스가 *근사* 결과만 반환한다는 점을 고려하면 이론적으로는 정확도를 향상시킬 수 있지만, 성능 측면에서는 최적이라고 보기 어렵습니다.

따라서 ClickHouse는 재점수를 비활성화하고 인덱스로부터 직접 가장 유사한 벡터와 그 거리 값을 반환하는 최적화를 제공합니다.
이 최적화는 기본적으로 활성화되어 있으며, 설정 [vector&#95;search&#95;with&#95;rescoring](../../../operations/settings/settings#vector_search_with_rescoring)을 참고하십시오.
높은 수준에서의 동작 방식은 ClickHouse가 가장 유사한 벡터와 그 거리를 가상 컬럼 `_distances`로 제공한다는 것입니다.
이를 확인하려면 `EXPLAIN header = 1`과 함께 벡터 검색 쿼리를 실행하십시오:

```sql
EXPLAIN header = 1
WITH [0., 2.] AS reference_vec
SELECT id
FROM tab
ORDER BY L2Distance(vec, reference_vec) ASC
LIMIT 3
SETTINGS vector_search_with_rescoring = 0
```

```result
Query id: a2a9d0c8-a525-45c1-96ca-c5a11fa66f47

    ┌─explain─────────────────────────────────────────────────────────────────────────────────────────────────┐
 1. │ Expression (Project names)                                                                              │
 2. │ Header: id Int32                                                                                        │
 3. │   Limit (preliminary LIMIT (without OFFSET))                                                            │
 4. │   Header: L2Distance(__table1.vec, _CAST([0., 2.]_Array(Float64), 'Array(Float64)'_String)) Float64     │
 5. │           __table1.id Int32                                                                             │
 6. │     Sorting (Sorting for ORDER BY)                                                                      │
 7. │     Header: L2Distance(__table1.vec, _CAST([0., 2.]_Array(Float64), 'Array(Float64)'_String)) Float64   │
 8. │             __table1.id Int32                                                                           │
 9. │       Expression ((Before ORDER BY + (Projection + Change column names to column identifiers)))         │
10. │       Header: L2Distance(__table1.vec, _CAST([0., 2.]_Array(Float64), 'Array(Float64)'_String)) Float64 │
11. │               __table1.id Int32                                                                         │
12. │         ReadFromMergeTree (default.tab)                                                                 │
13. │         Header: id Int32                                                                                │
14. │                 _distance Float32                                                                       │
    └─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

:::note
재점수화 없이(`vector_search_with_rescoring = 0`) 쿼리를 실행하고 병렬 레플리카를 활성화한 경우에도 재점수화가 다시 수행될 수 있습니다.
:::


#### 성능 튜닝 \{#performance-tuning\}

**압축 튜닝**

거의 모든 사용 사례에서 기본 컬럼의 벡터는 조밀(dense)하여 압축 효율이 좋지 않습니다.
그 결과, [압축](/sql-reference/statements/create/table.md#column_compression_codec)은 벡터 컬럼에 대한 삽입 및 읽기 성능을 저하시킵니다.
따라서 압축을 비활성화할 것을 권장합니다.
이를 위해 벡터 컬럼에 대해 다음과 같이 `CODEC(NONE)`을 지정합니다:

```sql
CREATE TABLE tab(id Int32, vec Array(Float32) CODEC(NONE), INDEX idx vec TYPE vector_similarity('hnsw', 'L2Distance', 2)) ENGINE = MergeTree ORDER BY id;
```

**인덱스 생성 튜닝**

벡터 유사도 인덱스의 수명 주기는 파트의 수명 주기와 연결됩니다.
다시 말해, 정의된 벡터 유사도 인덱스를 가진 새로운 파트가 생성될 때마다 인덱스도 함께 생성됩니다.
이는 일반적으로 데이터가 [삽입될 때](https://clickhouse.com/docs/guides/inserting-data)나 [머지](https://clickhouse.com/docs/merges) 중에 발생합니다.
하지만 HNSW는 인덱스 생성 시간이 길기로 알려져 있으며, 이는 삽입과 머지를 상당히 느리게 만들 수 있습니다.
벡터 유사도 인덱스는 이상적으로는 데이터가 변경되지 않거나 매우 드물게 변경되는 경우에만 사용하는 것이 좋습니다.

인덱스 생성을 가속화하기 위해 다음 기법을 사용할 수 있습니다.

첫째, 인덱스 생성은 병렬화할 수 있습니다.
인덱스 생성 스레드의 최대 개수는 서버 설정 [max&#95;build&#95;vector&#95;similarity&#95;index&#95;thread&#95;pool&#95;size](/operations/server-configuration-parameters/settings#max_build_vector_similarity_index_thread_pool_size)를 사용하여 구성할 수 있습니다.
최적의 성능을 위해 이 설정 값은 CPU 코어 수로 설정하는 것이 좋습니다.

둘째, INSERT 문을 가속화하기 위해 세션 설정 [materialize&#95;skip&#95;indexes&#95;on&#95;insert](../../../operations/settings/settings.md#materialize_skip_indexes_on_insert)를 사용하여 새로 삽입된 파트에서 스키핑 인덱스 생성을 비활성화할 수 있습니다.
이러한 파트에 대한 SELECT 쿼리는 정확한 검색으로 대체되어 수행됩니다.
삽입된 파트는 전체 테이블 크기에 비해 작은 경향이 있으므로, 이에 따른 성능 영향은 무시할 수 있을 것으로 예상됩니다.

셋째, 머지를 가속화하기 위해 세션 설정 [materialize&#95;skip&#95;indexes&#95;on&#95;merge](../../../operations/settings/merge-tree-settings.md#materialize_skip_indexes_on_merge)를 사용하여 머지된 파트에서 스키핑 인덱스 생성을 비활성화할 수 있습니다.
이는 SQL 문 [ALTER TABLE [...] MATERIALIZE INDEX [...]](../../../sql-reference/statements/alter/skipping-index.md#materialize-index)와 함께 사용하면 벡터 유사도 인덱스의 수명 주기를 명시적으로 제어할 수 있습니다.
예를 들어, 모든 데이터가 수집될 때까지 또는 주말과 같이 시스템 부하가 낮은 기간까지 인덱스 생성을 지연시킬 수 있습니다.

**인덱스 사용 튜닝**

SELECT 쿼리는 벡터 유사도 인덱스를 사용하기 위해 이를 메인 메모리로 로드해야 합니다.
동일한 벡터 유사도 인덱스가 메인 메모리에 반복해서 로드되지 않도록, ClickHouse는 이러한 인덱스를 위한 전용 인메모리 캐시를 제공합니다.
이 캐시가 클수록 불필요한 로드 횟수는 줄어듭니다.
캐시의 최대 크기는 서버 설정 [vector&#95;similarity&#95;index&#95;cache&#95;size](../../../operations/server-configuration-parameters/settings.md#vector_similarity_index_cache_size)를 사용하여 구성할 수 있습니다.
기본적으로 캐시는 최대 5 GB까지 커질 수 있습니다.

다음 로그 메시지(`system.text_log`)는 벡터 유사도 인덱스가 로드되고 있음을 나타냅니다.
이러한 메시지가 서로 다른 벡터 검색 쿼리에 대해 반복해서 나타난다면, 캐시 크기가 너무 작다는 의미입니다.

```text
2026-02-03 07:39:10.351635 [1386] f0ac5c85-1b1c-4f35-8848-87a1d1aa00ba : VectorSimilarityIndex Start loading vector similarity index

<...>

2026-02-03 07:40:25.217603 [1386] f0ac5c85-1b1c-4f35-8848-87a1d1aa00ba : VectorSimilarityIndex Loaded vector similarity index: max_level = 2, connectivity = 64, size = 1808111, capacity = 1808111, memory_usage = 8.00 GiB, bytes_per_vector = 4096, scalar_words = 1024, nodes = 1808111, edges = 51356964, max_edges = 233395072
```

:::note
벡터 유사도 인덱스 캐시는 벡터 인덱스 그래뉼을 저장합니다.
개별 벡터 인덱스 그래뉼이 캐시 크기보다 크면 캐시에 저장되지 않습니다.
따라서 「저장소 및 메모리 사용량 추정(Estimating storage and memory consumption)」에 나와 있는 공식 또는 [system.data&#95;skipping&#95;indices](../../../operations/system-tables/data_skipping_indices)를 기반으로 벡터 인덱스 크기를 계산한 뒤, 그에 맞게 캐시 크기를 설정해야 합니다.
:::

*벡터 검색 쿼리가 느릴 때, 첫 번째로 수행해야 할 작업은 벡터 인덱스 캐시를 확인하고 필요하다면 크기를 증가시키는 것임을 다시 한 번 강조합니다.*

현재 벡터 유사도 인덱스 캐시의 크기는 [system.metrics](../../../operations/system-tables/metrics.md)에 표시됩니다.


```sql
SELECT metric, value
FROM system.metrics
WHERE metric = 'VectorSimilarityIndexCacheBytes'
```

특정 query id가 있는 쿼리에 대한 캐시 적중 및 실패 정보는 [system.query&#95;log](../../../operations/system-tables/query_log.md)에서 확인할 수 있습니다:

```sql
SYSTEM FLUSH LOGS query_log;

SELECT ProfileEvents['VectorSimilarityIndexCacheHits'], ProfileEvents['VectorSimilarityIndexCacheMisses']
FROM system.query_log
WHERE type = 'QueryFinish' AND query_id = '<...>'
ORDER BY event_time_microseconds;
```

프로덕션 환경에서는 모든 벡터 인덱스가 항상 메모리에 상주할 수 있도록 캐시 크기를 충분히 크게 설정할 것을 권장합니다.

**양자화 튜닝**

[양자화](https://huggingface.co/blog/embedding-quantization)는 벡터의 메모리 사용량을 줄이고, 벡터 인덱스를 생성하고 탐색하는 데 필요한 계산 비용을 낮추는 기법입니다.
ClickHouse 벡터 인덱스는 다음과 같은 양자화 옵션을 지원합니다:

| Quantization   | Name                         | Storage per dimension |
| -------------- | ---------------------------- | --------------------- |
| f32            | Single precision             | 4 bytes               |
| f16            | Half precision               | 2 bytes               |
| bf16 (default) | Half precision (brain float) | 2 bytes               |
| i8             | Quarter precision            | 1 byte                |
| b1             | Binary                       | 1 bit                 |

양자화를 사용하면 원래의 단정밀도 부동소수점 값(`f32`)을 사용한 검색에 비해 벡터 검색의 정밀도가 낮아집니다.
그러나 대부분의 데이터셋에서는 half-precision brain float 양자화(`bf16`)를 사용해도 정밀도 손실이 매우 작기 때문에, 벡터 유사성 인덱스는 기본적으로 이 양자화 기법을 사용합니다.
쿼터 정밀도(`i8`)와 바이너리(`b1`) 양자화는 벡터 검색에서 상당한 정밀도 손실을 초래합니다.
벡터 유사성 인덱스의 크기가 사용 가능한 DRAM 크기보다 훨씬 큰 경우에만 이 두 양자화를 사용할 것을 권장합니다.
이 경우 정확도를 향상시키기 위해 리스코어링([vector&#95;search&#95;index&#95;fetch&#95;multiplier](../../../operations/settings/settings#vector_search_index_fetch_multiplier), [vector&#95;search&#95;with&#95;rescoring](../../../operations/settings/settings#vector_search_with_rescoring))을 활성화할 것을 함께 권장합니다.
바이너리 양자화는 1) 정규화된 임베딩(예: 벡터 길이 = 1, OpenAI 모델은 일반적으로 정규화됨)이고, 2) 거리 함수로 코사인 거리(cosine distance)를 사용하는 경우에만 권장됩니다.
바이너리 양자화는 내부적으로 해밍 거리(Hamming distance)를 사용하여 근접 그래프를 구성하고 검색합니다.
리스코어링 단계에서는 테이블에 저장된 원래의 단정밀도 벡터를 사용하여 코사인 거리를 통해 최근접 이웃을 식별합니다.

**데이터 전송 튜닝**

벡터 검색 쿼리에서 기준이 되는 벡터는 사용자가 제공하며, 일반적으로 Large Language Model(LLM)을 호출하여 가져옵니다.
ClickHouse에서 벡터 검색을 수행하는 일반적인 Python 코드는 다음과 같습니다.

```python
search_v = openai_client.embeddings.create(input = "[Good Books]", model='text-embedding-3-large', dimensions=1536).data[0].embedding

params = {'search_v': search_v}
result = chclient.query(
   "SELECT id FROM items
    ORDER BY cosineDistance(vector, %(search_v)s)
    LIMIT 10",
    parameters = params)
```

임베딩 벡터(위 코드 조각의 `search_v`)는 차원이 매우 클 수 있습니다.
예를 들어, OpenAI는 1536 또는 3072차원의 임베딩 벡터를 생성하는 모델을 제공합니다.
위 코드에서 ClickHouse Python 드라이버는 임베딩 벡터를 사람이 읽을 수 있는 문자열로 치환한 후, 전체 SELECT 쿼리를 문자열 형태로 전송합니다.
임베딩 벡터가 1536개의 단정밀도 부동 소수점 값으로 구성되어 있다고 가정하면, 전송되는 문자열 길이는 20 kB에 이릅니다.
이는 토크나이징, 파싱, 그리고 수천 번의 문자열을 실수로 변환하는 작업을 수행하는 과정에서 높은 CPU 사용량을 유발합니다.
또한 ClickHouse 서버 로그 파일에 상당한 공간이 필요하게 되어 `system.query_log` 역시 비대해집니다.

대부분의 LLM 모델은 임베딩 벡터를 네이티브 부동 소수점 값들의 리스트 또는 NumPy 배열로 반환한다는 점에 유의하십시오.
따라서 Python 애플리케이션에서는 아래와 같은 방식으로 참조 벡터 매개변수를 바이너리 형식으로 바인딩할 것을 권장합니다:

```python
search_v = openai_client.embeddings.create(input = "[Good Books]", model='text-embedding-3-large', dimensions=1536).data[0].embedding

params = {'$search_v_binary$': np.array(search_v, dtype=np.float32).tobytes()}
result = chclient.query(
   "SELECT id FROM items
    ORDER BY cosineDistance(vector, reinterpret($search_v_binary$, 'Array(Float32)'))
    LIMIT 10"
    parameters = params)
```

이 예제에서는 참조 벡터를 바이너리 형태 그대로 전송하고, 서버에서 이를 실수 배열로 다시 해석합니다.
이렇게 하면 서버 측 CPU 사용 시간을 절약하고, 서버 로그와 `system.query_log`가 불필요하게 커지는 것을 방지할 수 있습니다.


#### 관리 및 모니터링 \{#administration\}

벡터 유사성 인덱스가 디스크에서 차지하는 크기는 [system.data&#95;skipping&#95;indices](../../../operations/system-tables/data_skipping_indices)에서 확인할 수 있습니다:

```sql
SELECT database, table, name, formatReadableSize(data_compressed_bytes)
FROM system.data_skipping_indices
WHERE type = 'vector_similarity';
```

예제 출력:

```result
┌─database─┬─table─┬─name─┬─formatReadab⋯ssed_bytes)─┐
│ default  │ tab   │ idx  │ 348.00 MB                │
└──────────┴───────┴──────┴──────────────────────────┘
```


#### 일반 스키핑 인덱스와의 차이점 \{#differences-to-regular-skipping-indexes\}

모든 일반 [스키핑 인덱스](/optimize/skipping-indexes)와 마찬가지로, 벡터 유사도 인덱스는 그래뉼 단위로 구성되며, 각 인덱스 블록은 `GRANULARITY = [N]`개의 그래뉼로 이루어집니다(일반 스키핑 인덱스의 기본값은 `[N]` = 1입니다).
예를 들어, 테이블의 기본 인덱스 그래뉼 크기가 8192(`index_granularity = 8192` 설정)이고 `GRANULARITY = 2`이면, 각 인덱스 블록에는 16384개의 행이 포함됩니다.
그러나 근사 이웃 검색을 위한 데이터 구조와 알고리즘은 본질적으로 행 지향적입니다.
이들은 행 집합의 압축 표현을 저장하며, 벡터 검색 쿼리에 대해 행을 반환합니다.
이로 인해 벡터 유사도 인덱스의 동작 방식이 일반 스키핑 인덱스와 비교했을 때 다소 직관적이지 않은 차이점이 발생합니다.

사용자가 특정 컬럼에 벡터 유사도 인덱스를 정의하면, ClickHouse는 내부적으로 각 인덱스 블록마다 벡터 유사도 "서브 인덱스(sub-index)"를 생성합니다.
서브 인덱스는 자신이 포함된 인덱스 블록의 행만을 알고 있다는 의미에서 "로컬한" 구조입니다.
앞의 예시에서, 어떤 컬럼에 65536개의 행이 있다고 가정하면, 4개의 인덱스 블록(8개의 그래뉼 범위)과 각 인덱스 블록마다 하나의 벡터 유사도 서브 인덱스를 얻게 됩니다.
서브 인덱스는 이론적으로 자신의 인덱스 블록 내에서 가장 가까운 N개의 포인트를 가진 행을 직접 반환할 수 있습니다.
그러나 ClickHouse는 디스크에서 메모리로 데이터를 로드할 때 그래뉼 단위로 처리하므로, 서브 인덱스는 일치하는 행을 그래뉼 단위까지 외삽하여 확장합니다.
이는 인덱스 블록 단위로 데이터를 건너뛰는 일반 스키핑 인덱스와는 다른 점입니다.

`GRANULARITY` 파라미터는 몇 개의 벡터 유사도 서브 인덱스를 생성할지를 결정합니다.
`GRANULARITY` 값이 클수록 더 적지만 더 큰 벡터 유사도 서브 인덱스가 생성되며, 극단적으로는 하나의 컬럼(또는 하나의 컬럼 데이터 파트)에 단 하나의 서브 인덱스만 존재할 수도 있습니다.
이 경우 서브 인덱스는 해당 컬럼의 모든 행에 대한 "글로벌" 시야를 가지며, 관련 행을 포함하는 컬럼(또는 파트)의 모든 그래뉼을 직접 반환할 수 있습니다(이러한 그래뉼은 최대 `LIMIT [N]`개입니다).
두 번째 단계에서 ClickHouse는 이러한 그래뉼을 로드한 뒤, 그래뉼 내 모든 행에 대해 브루트 포스(brute-force) 거리 계산을 수행하여 실제로 가장 좋은 행을 식별합니다.
`GRANULARITY` 값이 작으면 각 서브 인덱스는 최대 `LIMIT N`개의 그래뉼을 반환합니다.
그 결과 더 많은 그래뉼을 로드하고 후속 필터링을 수행해야 합니다.
두 경우 모두 검색 정확도는 동일하며, 처리 성능만 달라집니다.
일반적으로 벡터 유사도 인덱스에는 큰 `GRANULARITY` 값을 사용하는 것이 권장되며, 벡터 유사도 구조의 메모리 사용량 과다와 같은 문제가 발생하는 경우에만 더 작은 `GRANULARITY` 값으로 되돌리는 것이 좋습니다.
벡터 유사도 인덱스에 대해 `GRANULARITY`를 지정하지 않으면, 기본값은 1억입니다.

#### 예제 \{#approximate-nearest-neighbor-search-example\}

```sql
CREATE TABLE tab(id Int32, vec Array(Float32), INDEX idx vec TYPE vector_similarity('hnsw', 'L2Distance', 2)) ENGINE = MergeTree ORDER BY id;

INSERT INTO tab VALUES (0, [1.0, 0.0]), (1, [1.1, 0.0]), (2, [1.2, 0.0]), (3, [1.3, 0.0]), (4, [1.4, 0.0]), (5, [1.5, 0.0]), (6, [0.0, 2.0]), (7, [0.0, 2.1]), (8, [0.0, 2.2]), (9, [0.0, 2.3]), (10, [0.0, 2.4]), (11, [0.0, 2.5]);

WITH [0., 2.] AS reference_vec
SELECT id, vec
FROM tab
ORDER BY L2Distance(vec, reference_vec) ASC
LIMIT 3;
```

반환합니다

```result
   ┌─id─┬─vec─────┐
1. │  6 │ [0,2]   │
2. │  7 │ [0,2.1] │
3. │  8 │ [0,2.2] │
   └────┴─────────┘
```

근사 벡터 검색을 사용하는 추가 예제 데이터셋은 다음과 같습니다:

* [LAION-400M](../../../getting-started/example-datasets/laion-400m-dataset)
* [LAION-5B](../../../getting-started/example-datasets/laion-5b-dataset)
* [dbpedia](../../../getting-started/example-datasets/dbpedia-dataset)
* [hackernews](../../../getting-started/example-datasets/hackernews-vector-search-dataset)


### Quantized Bit (QBit) \{#approximate-nearest-neighbor-search-qbit\}

정확한 벡터 검색을 가속하는 일반적인 방법 중 하나는 더 낮은 정밀도의 [float data type](../../../sql-reference/data-types/float.md)을 사용하는 것입니다.
예를 들어, 벡터를 `Array(Float32)` 대신 `Array(BFloat16)`으로 저장하면 데이터 크기가 절반으로 줄어들고, 쿼리 수행 시간도 그에 비례하여 감소할 것으로 예상됩니다.
이 방법을 양자화(quantization)라고 합니다. 계산 속도는 빨라지지만, 모든 벡터를 완전 탐색(exhaustive scan)하더라도 결과 정확도가 낮아질 수 있습니다.

기존 양자화 방식에서는 검색 시점과 데이터 저장 시점 모두에서 정밀도가 손실됩니다. 위 예시에서는 `Float32` 대신 `BFloat16`으로 저장하므로, 나중에 더 높은 정확도로 검색하고 싶어도 그렇게 할 수 없습니다. 한 가지 대안은 데이터를 양자화된 사본과 전체 정밀도의 사본 두 가지로 저장하는 것입니다. 이 방법은 동작하긴 하지만 중복 저장 공간이 필요합니다. 원본 데이터가 `Float64`이고, 서로 다른 정밀도(16비트, 32비트, 전체 64비트)로 검색을 실행하려는 상황을 고려해 보십시오. 이 경우 데이터를 세 가지 사본으로 각각 저장해야 합니다.

ClickHouse는 다음과 같은 방식으로 이러한 제약을 해결하는 Quantized Bit (`QBit`) 데이터 타입을 제공합니다:

1. 원본 전체 정밀도 데이터를 저장합니다.
2. 쿼리 시점에 양자화 정밀도를 지정할 수 있습니다.

이는 데이터를 비트 그룹(bit-grouped) 형식으로 저장하여(모든 벡터의 i번째 비트를 함께 저장한다는 의미) 요청된 정밀도 수준으로만 읽기를 수행할 수 있도록 함으로써 달성됩니다. 이를 통해 양자화를 통한 I/O 및 연산량 감소에 따른 속도 향상을 얻으면서도 필요할 때는 모든 원본 데이터를 사용할 수 있습니다. 최대 정밀도를 선택하면 검색은 정확한 검색이 됩니다.

`QBit` 타입의 컬럼을 선언하려면 다음 문법을 사용합니다:

```sql
column_name QBit(element_type, dimension)
```

다음은 각 파라미터의 의미입니다.

* `element_type` – 각 벡터 요소의 타입입니다. 지원되는 타입은 `BFloat16`, `Float32`, `Float64`입니다.
* `dimension` – 각 벡터를 구성하는 요소(차원)의 개수입니다.


#### `QBit` 테이블 생성 및 데이터 삽입 \{#qbit-create\}

```sql
CREATE TABLE fruit_animal (
    word String,
    vec QBit(Float64, 5)
) ENGINE = MergeTree
ORDER BY word;

INSERT INTO fruit_animal VALUES
    ('apple', [-0.99105519, 1.28887844, -0.43526649, -0.98520696, 0.66154391]),
    ('banana', [-0.69372815, 0.25587061, -0.88226235, -2.54593015, 0.05300475]),
    ('orange', [0.93338752, 2.06571317, -0.54612565, -1.51625717, 0.69775337]),
    ('dog', [0.72138876, 1.55757105, 2.10953259, -0.33961248, -0.62217325]),
    ('cat', [-0.56611276, 0.52267331, 1.27839863, -0.59809804, -1.26721048]),
    ('horse', [-0.61435682, 0.48542571, 1.21091247, -0.62530446, -1.33082533]);
```


#### `QBit`을(를) 사용한 벡터 검색 \{#qbit-search\}

L2 거리를 사용하여 단어 &#39;lemon&#39;을 나타내는 벡터의 최근접 이웃을 찾아보겠습니다. 거리 함수의 세 번째 매개변수는 비트 단위의 정밀도를 지정합니다. 값이 높을수록 정확도는 높아지지만 더 많은 연산이 필요합니다.

`QBit`에 사용할 수 있는 모든 거리 함수는 [여기](../../../sql-reference/data-types/qbit.md#vector-search-functions)에서 확인할 수 있습니다.

**전체 정밀도 검색(64비트):**

```sql
SELECT
    word,
    L2DistanceTransposed(vec, [-0.88693672, 1.31532824, -0.51182908, -0.99652702, 0.59907770], 64) AS distance
FROM fruit_animal
ORDER BY distance;
```

```text
   ┌─word───┬────────────distance─┐
1. │ apple  │ 0.14639757188169716 │
2. │ banana │   1.998961369007679 │
3. │ orange │   2.039041552613732 │
4. │ cat    │   2.752802631487914 │
5. │ horse  │  2.7555776805484813 │
6. │ dog    │   3.382295083120104 │
   └────────┴─────────────────────┘
```

**저정밀 검색:**

```sql
SELECT
    word,
    L2DistanceTransposed(vec, [-0.88693672, 1.31532824, -0.51182908, -0.99652702, 0.59907770], 12) AS distance
FROM fruit_animal
ORDER BY distance;
```

```text
   ┌─word───┬───────────distance─┐
1. │ apple  │  0.757668703053566 │
2. │ orange │ 1.5499475034938677 │
3. │ banana │ 1.6168396735102937 │
4. │ cat    │  2.429752230904804 │
5. │ horse  │  2.524650475528617 │
6. │ dog    │   3.17766975527459 │
   └────────┴────────────────────┘
```

12비트 양자화를 사용하면 거리 근사값을 잘 유지하면서도 쿼리 실행을 더 빠르게 할 수 있습니다. 상대적인 순서는 대부분 동일하게 유지되며, &#39;apple&#39;이 여전히 가장 가까운 결과입니다.


#### 성능 고려 사항 \{#qbit-performance\}

`QBit`의 성능상의 이점은 더 낮은 정밀도를 사용할 때 스토리지에서 읽어야 하는 데이터 양이 줄어들어 I/O 연산이 감소하는 데서 비롯됩니다. 또한 `QBit`에 `Float32` 데이터가 포함되어 있고 정밀도 매개변수가 16 이하인 경우, 연산량이 줄어들어 추가적인 성능 이점을 얻을 수 있습니다. 정밀도 매개변수는 정확도와 속도 간의 트레이드오프를 직접적으로 제어합니다:

- **높은 정밀도**(원래 데이터 폭에 가까울수록): 더 정확한 결과, 더 느린 쿼리
- **낮은 정밀도**: 근사값 기반의 더 빠른 쿼리, 메모리 사용량 감소

### 참고 자료 \{#references\}

블로그 글:

- [Vector Search with ClickHouse - Part 1](https://clickhouse.com/blog/vector-search-clickhouse-p1)
- [Vector Search with ClickHouse - Part 2](https://clickhouse.com/blog/vector-search-clickhouse-p2)
- [We built a vector search engine that lets you choose precision at query time](https://clickhouse.com/blog/qbit-vector-search)