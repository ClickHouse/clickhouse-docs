---
'description': 'Exact and Approximate Vector Search에 대한 문서'
'keywords':
- 'vector similarity search'
- 'ann'
- 'knn'
- 'hnsw'
- 'indices'
- 'index'
- 'nearest neighbor'
- 'vector search'
'sidebar_label': '정확한 및 근사 벡터 검색'
'slug': '/engines/table-engines/mergetree-family/annindexes'
'title': '정확한 및 근사 벡터 검색'
'doc_type': 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# 정확한 근접 및 근사 벡터 검색

주어진 점에 대해 다차원(벡터) 공간에서 N개의 가장 가까운 점을 찾는 문제는 [최근접 이웃 검색](https://en.wikipedia.org/wiki/Nearest_neighbor_search) 또는 간단히 벡터 검색이라고 불립니다.
벡터 검색을 해결하기 위한 두 가지 일반적인 접근 방식이 있습니다:
- 정확한 벡터 검색은 주어진 점과 벡터 공간의 모든 점 사이의 거리를 계산합니다. 이는 가장 가능한 정확성을 보장하며, 즉 반환된 점들은 실제 최근접 이웃이 보장됩니다. 벡터 공간을 철저히 탐색하기 때문에, 정확한 벡터 검색은 실제 사용에 있어 너무 느릴 수 있습니다.
- 근사 벡터 검색은 정확한 벡터 검색보다 결과를 훨씬 더 빠르게 계산하는 여러 기술(예: 그래프 및 랜덤 포레스트와 같은 특수 데이터 구조)을 지칭합니다. 결과 정확성은 일반적으로 실제 사용에 "충분히 좋습니다." 많은 근사 기술은 결과 정확성과 검색 시간 사이의 트레이드오프를 조정하는 매개변수를 제공합니다.

벡터 검색(정확하거나 근사적)은 다음과 같이 SQL로 작성할 수 있습니다:

```sql
WITH [...] AS reference_vector
SELECT [...]
FROM table
WHERE [...] -- a WHERE clause is optional
ORDER BY <DistanceFunction>(vectors, reference_vector)
LIMIT <N>
```

벡터 공간의 점들은 [Array(Float64)](../../../sql-reference/data-types/array.md), [Array(Float32)](../../../sql-reference/data-types/array.md) 또는 [Array(BFloat16)](../../../sql-reference/data-types/array.md)와 같은 배열 형식의 컬럼 `vectors`에 저장됩니다.
참조 벡터는 상수 배열이며 공통 테이블 표현으로 제공됩니다.
`<DistanceFunction>`은 참조 점과 저장된 모든 점 사이의 거리를 계산합니다.
이를 위해 모든 사용 가능한 [거리 함수](/sql-reference/functions/distance-functions)를 사용할 수 있습니다.
`<N>`은 얼마나 많은 이웃이 반환되어야 하는지를 지정합니다.
## 정확한 벡터 검색 {#exact-nearest-neighbor-search}

정확한 벡터 검색은 위의 SELECT 쿼리를 그대로 사용하여 수행할 수 있습니다.
이러한 쿼리의 실행 시간은 일반적으로 저장된 벡터의 수와 그 차원(즉, 배열 요소의 수)에 비례합니다.
또한 ClickHouse는 모든 벡터에 대해 강제 스캔을 수행하므로 실행 시간은 쿼리의 스레드 수에도 영향을 받습니다(설정 [max_threads](../../../operations/settings/settings.md#max_threads) 참조).
### 예제 {#exact-nearest-neighbor-search-example}

```sql
CREATE TABLE tab(id Int32, vec Array(Float32)) ENGINE = MergeTree ORDER BY id;

INSERT INTO tab VALUES (0, [1.0, 0.0]), (1, [1.1, 0.0]), (2, [1.2, 0.0]), (3, [1.3, 0.0]), (4, [1.4, 0.0]), (5, [1.5, 0.0]), (6, [0.0, 2.0]), (7, [0.0, 2.1]), (8, [0.0, 2.2]), (9, [0.0, 2.3]), (10, [0.0, 2.4]), (11, [0.0, 2.5]);

WITH [0., 2.] AS reference_vec
SELECT id, vec
FROM tab
ORDER BY L2Distance(vec, reference_vec) ASC
LIMIT 3;
```

반환값

```result
   ┌─id─┬─vec─────┐
1. │  6 │ [0,2]   │
2. │  7 │ [0,2.1] │
3. │  8 │ [0,2.2] │
   └────┴─────────┘
```
## 근사 벡터 검색 {#approximate-nearest-neighbor-search}
### 벡터 유사도 인덱스 {#vector-similarity-index}

ClickHouse는 근사 벡터 검색을 수행하기 위한 특별한 "벡터 유사도" 인덱스를 제공합니다.

:::note
벡터 유사도 인덱스는 ClickHouse 버전 25.8 이상에서 사용할 수 있습니다.
문제가 발생하면 [ClickHouse 리포지토리](https://github.com/clickhouse/clickhouse/issues)에서 이슈를 열어 주십시오.
:::
#### 벡터 유사도 인덱스 생성 {#creating-a-vector-similarity-index}

새로운 테이블에 대한 벡터 유사도 인덱스는 다음과 같이 생성할 수 있습니다:

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

기존 테이블에 벡터 유사도 인덱스를 추가하려면:

```sql
ALTER TABLE table ADD INDEX <index_name> vectors TYPE vector_similarity(<type>, <distance_function>, <dimensions>) [GRANULARITY <N>];
```

벡터 유사도 인덱스는 (보시다시피 [여기](mergetree.md#table_engine-mergetree-data_skipping-indexes) 및 [여기](../../../optimize/skipping-indexes)) 스킵 인덱스의 특별한 종류입니다.
따라서 위의 `ALTER TABLE` 문은 테이블에 삽입된 미래의 새로운 데이터에 대해 인덱스를 구축하는 것만 발생합니다.
기존 데이터에 대해서도 인덱스를 구축하려면 이를 물리화해야 합니다:

```sql
ALTER TABLE table MATERIALIZE INDEX <index_name> SETTINGS mutations_sync = 2;
```

`<distance_function>` 함수는 다음 중 하나여야 합니다.
- `L2Distance`, [유클리드 거리](https://en.wikipedia.org/wiki/Euclidean_distance)로, 유클리드 공간에서 두 점 사이의 선의 길이를 나타냅니다, 또는
- `cosineDistance`, [코사인 거리](https://en.wikipedia.org/wiki/Cosine_similarity#Cosine_distance)로, 두 비영점 벡터 사이의 각도를 나타냅니다.

정규화된 데이터의 경우 `L2Distance`가 일반적으로 가장 좋은 선택입니다. 그렇지 않으면 스케일을 보상하기 위해 `cosineDistance`를 추천합니다.

`<dimensions>`는 기본 컬럼에서 배열의 기수(요소 수)를 지정합니다.
ClickHouse가 인덱스 생성 중에 서로 다른 기수를 가진 배열을 발견하면 인덱스는 폐기되고 오류가 반환됩니다.

선택적 GRANULARITY 매개변수 `<N>`은 인덱스 그라뉼의 크기를 나타냅니다(보시다시피 [여기](../../../optimize/skipping-indexes)).
기본값 1억은 대부분의 사용 사례에 대해 합리적으로 잘 작동하지만 조정할 수도 있습니다.
우리는 사용자가 하는 일의 의미를 이해하는 고급 사용자에게만 조정하기를 권장합니다(아래 [정규 스킵 인덱스와의 차이점](#differences-to-regular-skipping-indexes) 참조).

벡터 유사도 인덱스는 다양한 근사 검색 방법을 수용할 수 있는 일반적입니다.
실제로 사용되는 방법은 매개변수 `<type>`에 의해 지정됩니다.
현재로서는 사용할 수 있는 유일한 방법은 HNSW ([학술 논문](https://arxiv.org/abs/1603.09320))로, 계층적 근접 그래프를 기반으로 한 근사 벡터 검색을 위한 인기 있고 최첨단 기술입니다.
HNSW가 타입으로 사용되면 사용자는 HNSW-특정 매개변수를 선택적으로 지정할 수 있습니다:

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

이 HNSW-특정 매개변수는 다음과 같습니다:
- `<quantization>`은 근접 그래프에서 벡터의 양자화를 제어합니다. 가능한 값은 `f64`, `f32`, `f16`, `bf16`, `i8` 또는 `b1`입니다. 기본값은 `bf16`입니다. 이 매개변수가 기본 컬럼의 벡터 표현에 영향을 미치지 않음을 주의하십시오.
- `<hnsw_max_connections_per_layer>`는 그래프 노드당 이웃의 수를 제어하며, HNSW 하이퍼파라미터 `M`으로도 알려져 있습니다. 기본값은 `32`입니다. 값 `0`은 기본값을 사용함을 의미합니다.
- `<hnsw_candidate_list_size_for_construction>`는 HNSW 그래프 생성 중 동적 후보 목록의 크기를 제어하며, HNSW 하이퍼파라미터 `ef_construction`으로도 알려져 있습니다. 기본값은 `128`입니다. 값 `0`은 기본값을 사용함을 의미합니다.

모든 HNSW-특정 매개변수의 기본값은 대부분의 사용 사례에서 합리적으로 잘 작동합니다.
따라서 HNSW-특정 매개변수를 맞춤 설정하는 것을 권장하지 않습니다.

추가적인 제한 사항이 적용됩니다:
- 벡터 유사도 인덱스는 [Array(Float32)](../../../sql-reference/data-types/array.md), [Array(Float64)](../../../sql-reference/data-types/array.md) 또는 [Array(BFloat16)](../../../sql-reference/data-types/array.md) 형식의 컬럼에서만 구축될 수 있습니다. `Array(Nullable(Float32))` 및 `Array(LowCardinality(Float32))`와 같은 널러블 및 저기수 부동 소수점 배열은 허용되지 않습니다.
- 벡터 유사도 인덱스는 단일 컬럼에서만 구축될 수 있습니다.
- 벡터 유사도 인덱스는 계산된 표현(e.g. `INDEX index_name arraySort(vectors) TYPE vector_similarity([...])`)에 구축될 수 있지만, 이러한 인덱스는 이후 근사 이웃 검색에 사용할 수 없습니다.
- 벡터 유사도 인덱스는 기본 컬럼의 모든 배열이 `<dimension>`-many 요소를 가져야 합니다 - 이 요구 사항은 인덱스 생성 중에 확인됩니다. 이 요구 사항의 위반을 조기에 식별하기 위해 사용자는 벡터 컬럼에 대한 [제약 조건](/sql-reference/statements/create/table.md#constraints)을 추가할 수 있습니다, 예: `CONSTRAINT same_length CHECK length(vectors) = 256`.
- 마찬가지로, 기본 컬럼의 배열 값은 비어 있지 않아야 하며(`[]`) 기본값이 없어야 합니다(또한 `[]`).

**저장소 및 메모리 소비 추정**

일반적인 AI 모델(예: 대규모 언어 모델, [LLMs](https://en.wikipedia.org/wiki/Large_language_model))에 사용하기 위한 벡터는 수백 또는 수천 개의 부동 소수점 값으로 구성됩니다.
따라서 단일 벡터 값은 여러 킬로바이트의 메모리 소비를 할 수 있습니다.
기본 벡터 컬럼에서 필요한 저장소를 추정하고 벡터 유사도 인덱스에 대해 필요한 기본 메모리를 추정하려면 아래 두 가지 공식을 사용할 수 있습니다:

테이블에서 벡터 컬럼의 저장소 소비(압축되지 않음):

```text
Storage consumption = Number of vectors * Dimension * Size of column data type
```

[dbpedia 데이터셋](https://huggingface.co/datasets/KShivendu/dbpedia-entities-openai-1M)의 예:

```text
Storage consumption = 1 million * 1536 * 4 (for Float32) = 6.1 GB
```

검색을 수행하기 위해서는 벡터 유사도 인덱스가 디스크에서 메인 메모리로 완전히 로드되어야 합니다.
마찬가지로, 벡터 인덱스도 메모리에 완전히 구축되고 난 후 디스크에 저장됩니다.

벡터 인덱스를 로드하는 데 필요한 메모리 소비:

```text
Memory for vectors in the index (mv) = Number of vectors * Dimension * Size of quantized data type
Memory for in-memory graph (mg) = Number of vectors * hnsw_max_connections_per_layer * Bytes_per_node_id (= 4) * Layer_node_repetition_factor (= 2)

Memory consumption: mv + mg
```

[dbpedia 데이터셋](https://huggingface.co/datasets/KShivendu/dbpedia-entities-openai-1M)의 예:

```text
Memory for vectors in the index (mv) = 1 million * 1536 * 2 (for BFloat16) = 3072 MB
Memory for in-memory graph (mg) = 1 million * 64 * 2 * 4 = 512 MB

Memory consumption = 3072 + 512 = 3584 MB
```

위의 공식은 벡터 유사도 인덱스가 실행 시간 데이터 구조(미리 할당된 버퍼 및 캐시 등)를 할당하는 데 추가적인 메모리가 필요하다는 점은 고려하지 않습니다.
#### 벡터 유사도 인덱스 사용하기 {#using-a-vector-similarity-index}

:::note
벡터 유사도 인덱스를 사용하려면 설정 [compatibility](../../../operations/settings/settings.md)가 `''` (기본값), 또는 `'25.1'` 이상이어야 합니다.
:::

벡터 유사도 인덱스는 다음 형식의 SELECT 쿼리를 지원합니다:

```sql
WITH [...] AS reference_vector
SELECT [...]
FROM table
WHERE [...] -- a WHERE clause is optional
ORDER BY <DistanceFunction>(vectors, reference_vector)
LIMIT <N>
```

ClickHouse의 쿼리 최적화기는 위의 쿼리 템플릿과 일치시키고 사용 가능한 벡터 유사도 인덱스를 활용하려고 합니다.
쿼리는 SELECT 쿼리의 거리 함수가 인덱스 정의의 거리 함수와 동일한 경우에만 벡터 유사도 인덱스를 사용할 수 있습니다.

고급 사용자는 검색 중 후보 목록의 크기를 조정하기 위해 설정 [hnsw_candidate_list_size_for_search](../../../operations/settings/settings.md#hnsw_candidate_list_size_for_search)(HNSW 하이퍼파라미터 "ef_search"라고도 함)의 사용자 정의 값을 제공할 수 있습니다. 설정의 기본값이 256은 대부분 사용 사례에서 잘 작동합니다.
더 높은 설정 값은 성능 저하의 대가로 더 나은 정확성을 의미합니다.

쿼리가 벡터 유사도 인덱스를 사용할 수 있는 경우, ClickHouse는 SELECT 쿼리에서 제공된 LIMIT `<N>`이 합리적인 범위 내에 있는지 확인합니다.
보다 구체적으로, `<N>`이 설정 [max_limit_for_vector_search_queries](../../../operations/settings/settings.md#max_limit_for_vector_search_queries)의 기본값인 100보다 큰 경우 오류가 반환됩니다.
너무 큰 LIMIT 값은 검색 속도를 느리게 할 수 있으며 일반적으로 사용 오류를 나타냅니다.

SELECT 쿼리에서 벡터 유사도 인덱스를 사용하는지 확인하려면 쿼리를 `EXPLAIN indexes = 1`으로 접두어를 붙일 수 있습니다.

예를 들어, 쿼리

```sql
EXPLAIN indexes = 1
WITH [0.462, 0.084, ..., -0.110] AS reference_vec
SELECT id, vec
FROM tab
ORDER BY L2Distance(vec, reference_vec) ASC
LIMIT 10;
```

는 다음과 같은 결과를 반환할 수 있습니다.

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

이 예에서, [dbpedia 데이터셋](https://huggingface.co/datasets/KShivendu/dbpedia-entities-openai-1M)의 1백만 벡터가 저장되어 있으며 각 벡터는 1536차원으로 575개의 그라뉼에 저장되어 있습니다, 즉 그라뉼당 1.7k 행을 갖습니다.
쿼리는 10개의 이웃을 요청하고 벡터 유사도 인덱스는 이 10개의 이웃을 10개의 별도의 그라뉼에서 찾습니다.
이 10개의 그라뉼은 쿼리 실행 중에 읽힐 것입니다.

벡터 유사도 인덱스가 사용된 경우 출력에는 `Skip`과 벡터 인덱스의 이름 및 유형(예: `idx` 및 `vector_similarity`)이 포함됩니다.
이 경우, 벡터 유사도 인덱스는 네 개의 그라뉼 중 두 개를 제외하였으며, 즉 데이터의 50%입니다.
더 많은 그라뉼을 제외할 수 있을수록, 인덱스 사용의 효과가 더욱 증가합니다.

:::tip
인덱스 사용을 강제하려면, [force_data_skipping_indexes](../../../operations/settings/settings#force_data_skipping_indices) 설정으로 SELECT 쿼리를 실행할 수 있습니다(인덱스 이름을 설정 값으로 제공하십시오).
:::

**후처리 및 전처리**

사용자는 SELECT 쿼리에 대해 추가 필터 조건을 가진 `WHERE` 절을 선택적으로 지정할 수 있습니다.
ClickHouse는 이러한 필터 조건을 후처리 또는 전처리 전략을 사용하여 평가합니다.
간단히 말해서, 두 가지 전략 모두 필터가 평가되는 순서를 결정합니다:
- 후처리는 벡터 유사도 인덱스가 먼저 평가되며, 이후 ClickHouse가 `WHERE` 절에서 지정된 추가 필터를 평가합니다.
- 전처리는 필터 평가 순서가 반대입니다.

전략은 서로 다른 트레이드오프를 가집니다:
- 후처리는 일반적으로 `LIMIT <N>` 절에서 요청한 행 수보다 적은 수의 행을 반환할 수 있는 일반적인 문제를 가지고 있습니다. 이 상황은 벡터 유사도 인덱스가 반환한 결과 행 중 하나 이상이 추가 필터를 충족하지 못한 경우 발생합니다.
- 전처리는 일반적으로 해결되지 않은 문제입니다. 특정 전문 벡터 데이터베이스는 전처리 알고리즘을 제공하지만 대부분의 관계형 데이터베이스(ClickHouse 포함)는 정확한 이웃 검색, 즉 인덱스 없이 강제 스캔으로 돌아갑니다.

어떤 전략이 사용되는지는 필터 조건에 따라 다릅니다.

*추가 필터는 파티션 키의 일부*

추가 필터 조건이 파티션 키의 일부인 경우, ClickHouse는 파티션 프루닝을 적용합니다.
예를 들어, 테이블이 `year` 컬럼에 의해 범위로 파티션되며 다음 쿼리가 실행됩니다:

```sql
WITH [0., 2.] AS reference_vec
SELECT id, vec
FROM tab
WHERE year = 2025
ORDER BY L2Distance(vec, reference_vec) ASC
LIMIT 3;
```

ClickHouse는 2025년을 제외한 모든 파티션을 프루닝합니다.

*추가 필터는 인덱스를 사용하여 평가할 수 없습니다*

추가 필터 조건을 인덱스(기본 키 인덱스, 스킵 인덱스)를 사용하여 평가할 수 없는 경우, ClickHouse는 후처리를 적용합니다.

*추가 필터는 기본 키 인덱스를 사용하여 평가할 수 있습니다*

추가 필터 조건이 [기본 키](mergetree.md#primary-key)를 사용하여 평가할 수 있는 경우(즉, 기본 키의 접두사로 형성됨)이고
- 필터 조건이 파트 내에서 적어도 하나의 행을 제거할 경우, ClickHouse는 해당 부분 내의 "남은" 범위에 대해 전처리로 돌아갑니다.
- 필터 조건이 파트 내에서 행을 제거하지 않는 경우, ClickHouse는 해당 파트에 대해 후처리를 수행합니다.

실제 사용 사례에서는 후자의 경우는 다소 드물습니다.

*추가 필터는 스킵 인덱스를 사용하여 평가할 수 있습니다*

추가 필터 조건이 [스킵 인덱스](mergetree.md#table_engine-mergetree-data_skipping-indexes)(최소최대 인덱스, 집합 인덱스 등)를 사용하여 평가할 수 있는 경우, ClickHouse는 후처리를 수행합니다.
이러한 경우, 벡터 유사도 인덱스가 먼저 평가됩니다. 인덱스는 다른 스킵 인덱스에 비해 가장 많은 행을 제거한다고 예상됩니다.

후처리와 전처리에 대한 더 세부적인 제어를 위해 두 가지 설정을 사용할 수 있습니다:

설정 [vector_search_filter_strategy](../../../operations/settings/settings#vector_search_filter_strategy)(기본값: `auto`, 위의 휴리스틱을 구현함)은 `prefilter`로 설정될 수 있습니다.
이는 추가 필터 조건이 매우 선택적인 경우 전처리를 강제하기 위해 유용합니다.
예를 들어, 다음 쿼리는 전처리의 이점을 받을 수 있습니다:

```sql
SELECT bookid, author, title
FROM books
WHERE price < 2.00
ORDER BY cosineDistance(book_vector, getEmbedding('Books on ancient Asian empires'))
LIMIT 10
```

2달러 이하의 가격을 가진 책들이 극히 소수에 불과하다고 가정하면, 후처리는 벡터 인덱스에 의해 반환된 상위 10개 일치 항목이 모두 2달러 이상일 경우 0행을 반환할 수 있습니다.
전처리를 강제하면 (쿼리에 `SETTINGS vector_search_filter_strategy = 'prefilter'`를 추가), ClickHouse는 먼저 2달러 이하의 가격을 가진 모든 책을 찾고, 이후 찾은 책에 대해 강제 벡터 검색을 실행합니다.

위 문제를 해결하기 위한 대안적 접근법으로 설정 [vector_search_index_fetch_multiplier](../../../operations/settings/settings#vector_search_index_fetch_multiplier)(기본값: `1.0`, 최대: `1000.0`)의 값을 `1.0` 초과로 구성할 수 있습니다(예: `2.0`).
벡터 인덱스에서 검색한 최근접 이웃의 수는 설정 값으로 곱해진 후 그 행들에 적용할 추가 필터로 인해 LIMIT 수가 반환됩니다.
예를 들어, 우리는 다시 쿼리를 실행할 수 있지만, 승수 `3.0`으로:

```sql
SELECT bookid, author, title
FROM books
WHERE price < 2.00
ORDER BY cosineDistance(book_vector, getEmbedding('Books on ancient Asian empires'))
LIMIT 10
SETTING vector_search_index_fetch_multiplier = 3.0;
```

ClickHouse는 각 파트에서 벡터 인덱스에서 3.0 x 10 = 30개의 최근접 이웃을 가져온 다음 추가 필터를 평가합니다.
실제 가장 가까운 10개 이웃만 반환됩니다.
설정 `vector_search_index_fetch_multiplier`가 문제를 완화할 수 있지만 극단적인 경우(매우 선택적인 WHERE 조건)에는 여전히 요청된 N보다 적은 행이 반환될 가능성이 있습니다.

**재점수 매기기**

ClickHouse의 스킵 인덱스는 일반적으로 그라뉼 수준에서 필터링을 수행하며, 즉 스킵 인덱스에서의 조회(내부적으로)는 읽기 데이터의 수를 줄이는 잠재적으로 일치하는 그라뉼 목록을 반환합니다.
이는 일반적으로 스킵 인덱스에서 잘 작동하지만 벡터 유사도 인덱스의 경우 "그라뉼 불일치"를 생성합니다.
조금 더 자세히 설명하자면, 벡터 유사도 인덱스는 주어진 참조 벡터에 대해 N개의 가장 유사한 벡터의 행 번호를 결정하지만, 그 행 번호를 그라뉼 번호로 외삽해야 합니다.
ClickHouse는 이후 이러한 그라뉼을 디스크에서 로드하고, 이러한 그라뉼의 모든 벡터에 대해 거리를 계산을 반복합니다.
이 단계는 재점수 매기기라고 하며 이론적으로 정확성을 향상시킬 수 있지만, 벡터 유사도 인덱스는 오직 _근사_ 결과만 반환하므로 성능 면에서는 최적이 아닙니다.

ClickHouse는 따라서 재점수 매기기를 비활성화하고 인덱스에서 가장 유사한 벡터와 그 거리를 직접 반환하는 최적화를 제공합니다.
이 최적화는 기본적으로 활성화되어 있으며, 설정 [vector_search_with_rescoring](../../../operations/settings/settings#vector_search_with_rescoring)를 참조하십시오.
고수준에서 ClickHouse는 가장 유사한 벡터와 그 거리 정보를 가상 컬럼 `_distances`로 제공합니다.
이를 확인하려면 `EXPLAIN header = 1`로 벡터 검색 쿼리를 실행하십시오:

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
재점수 매기기 없이(`vector_search_with_rescoring = 0`) 실행된 쿼리는 병렬 복제가 활성화되어 있는 경우 재점수 매기기로 돌아갈 수 있습니다.
:::
#### 성능 조정 {#performance-tuning}

**압축 조정**

사실상 모든 사용 사례에서 기본 컬럼의 벡터는 조밀하며 압축이 잘 되지 않습니다.
결과적으로, [압축](/sql-reference/statements/create/table.md#column_compression_codec)은 벡터 컬럼으로의 삽입 및 읽기를 둔화시킵니다.
따라서 우리는 압축을 비활성화할 것을 권장합니다.
그렇게 하기 위해서는 벡터 컬럼에 `CODEC(NONE)`을 지정하면 됩니다:

```sql
CREATE TABLE tab(id Int32, vec Array(Float32) CODEC(NONE), INDEX idx vec TYPE vector_similarity('hnsw', 'L2Distance', 2)) ENGINE = MergeTree ORDER BY id;
```

**인덱스 생성 조정**

벡터 유사도 인덱스의 생애 주기는 파트의 생애 주기와 연결되어 있습니다.
즉, 정의된 벡터 유사도 인덱스가 있는 새로운 파트가 생성될 때마다 인덱스도 생성됩니다.
이는 일반적으로 데이터가 [삽입](https://clickhouse.com/docs/guides/inserting-data) 될 때 또는 [병합](https://clickhouse.com/docs/merges) 중에 발생합니다.
안타깝게도 HNSW는 긴 인덱스 생성 시간으로 알려져 있으며, 이는 삽입 및 병합 속도를 현저하게 느리게 할 수 있습니다.
벡터 유사도 인덱스는 데이터가 불변이거나 드물게 변경될 때 이상적으로만 사용되어야 합니다.

인덱스 생성을 가속화하기 위해 다음 기술을 사용할 수 있습니다:

첫째, 인덱스 생성은 병렬화할 수 있습니다.
인덱스 생성 스레드의 최대 수는 서버 설정 [max_build_vector_similarity_index_thread_pool_size](/operations/server-configuration-parameters/settings#max_build_vector_similarity_index_thread_pool_size)를 사용하여 구성할 수 있습니다.
최적의 성능을 위해 설정 값은 CPU 코어 수에 맞게 구성되어야 합니다.

둘째, INSERT 문을 가속화하기 위해 사용자는 세션 설정 [materialize_skip_indexes_on_insert](../../../operations/settings/settings.md#materialize_skip_indexes_on_insert)를 사용하여 새로 삽입된 파트에서 스킵 인덱스 생성을 비활성화할 수 있습니다.
이러한 파트에 대한 SELECT 쿼리는 정확한 검색으로 돌아갑니다.
삽입된 파트는 전체 테이블 크기에 비해 작기 때문에 이로 인한 성능 영향은 미미할 것으로 예상됩니다.

셋째, 병합을 가속화하기 위해 사용자는 세션 설정 [materialize_skip_indexes_on_merge](../../../operations/settings/merge-tree-settings.md#materialize_skip_indexes_on_merge)를 사용하여 병합된 파트에서 스킵 인덱스 생성을 비활성화할 수 있습니다.
이는 명령문 [ALTER TABLE \[...\] MATERIALIZE INDEX \[...\]](../../../sql-reference/statements/alter/skipping-index.md#materialize-index)와 함께 사용하여 벡터 유사도 인덱스의 생애 주기를 명시적으로 제어할 수 있습니다.
예를 들어, 인덱스 생성은 모든 데이터가 수집되거나 주말과 같은 낮은 시스템 부하 기간까지 연기될 수 있습니다.

**인덱스 사용 조정**

SELECT 쿼리는 벡터 유사도 인덱스를 메인 메모리에 로드해야 사용할 수 있습니다.
같은 벡터 유사도 인덱스가 반복적으로 메모리에 로드되지 않도록 ClickHouse는 이러한 인덱스에 전용 인메모리 캐시를 제공합니다.
이 캐시의 크기가 클수록 불필요한 로드는 줄어듭니다.
최대 캐시 크기는 서버 설정 [vector_similarity_index_cache_size](../../../operations/server-configuration-parameters/settings.md#vector_similarity_index_cache_size)를 사용하여 구성할 수 있습니다.
기본적으로 이 캐시는 최대 5GB까지 성장할 수 있습니다.

:::note
벡터 유사도 인덱스 캐시는 벡터 인덱스 그라뉼을 저장합니다.
개별 벡터 인덱스 그라뉼이 캐시 크기보다 크면 캐시되지 않습니다.
따라서 벡터 인덱스 크기를 계산하고("저장소 및 메모리 소비 추정"의 공식이나 [system.data_skipping_indices](../../../operations/system-tables/data_skipping_indices) 기준으로) 캐시 크기를 정의해 주십시오.
:::

벡터 유사도 인덱스 캐시의 현재 크기는 [system.metrics](../../../operations/system-tables/metrics.md)에서 확인할 수 있습니다:

```sql
SELECT metric, value
FROM system.metrics
WHERE metric = 'VectorSimilarityIndexCacheBytes'
```

요청 ID가 있는 쿼리에 대한 캐시 적중 및 실패는 [system.query_log](../../../operations/system-tables/query_log.md)에서 확인할 수 있습니다:

```sql
SYSTEM FLUSH LOGS query_log;

SELECT ProfileEvents['VectorSimilarityIndexCacheHits'], ProfileEvents['VectorSimilarityIndexCacheMisses']
FROM system.query_log
WHERE type = 'QueryFinish' AND query_id = '<...>'
ORDER BY event_time_microseconds;
```

생산 사용 사례를 위해 우리는 모든 벡터 인덱스가 항상 메모리에 유지되도록 캐시 크기를 충분히 크게 설정하는 것을 권장합니다.

**양자화 조정**

[양자화](https://huggingface.co/blog/embedding-quantization)는 벡터의 메모리 사용량과 벡터 인덱스 생성 및 탐색의 계산 비용을 줄이는 기술입니다.
ClickHouse 벡터 인덱스는 다음 양자화 옵션을 지원합니다:

| 양자화         | 이름                                  | 차원당 저장소 |
|----------------|---------------------------------------|----------------|
| f32            | 단정밀도                             | 4바이트        |
| f16            | 반정밀도                             | 2바이트        |
| bf16 (기본값)  | 반정밀도 (브레인 플로트)             | 2바이트        |
| i8             | 사분정밀도                           | 1바이트        |
| b1             | 이진형                                | 1비트         |

양자화는 원래의 전체 정밀도 부동 소수점 값(`f32`)으로 검색하는 것과 비교하여 벡터 검색의 정밀도를 줄입니다.
그러나 대부분의 데이터 세트에서 반정밀도 브레인 플로트 양자화(`bf16`)는 미미한 정밀도 손실을 초래하므로 벡터 유사도 인덱스는 기본적으로 이 양자화 기술을 사용합니다.
사분정밀도(`i8`) 및 이진형(`b1`) 양자화는 벡터 검색에서 인식할 수 있을 정도의 정밀도 손실을 초래합니다.
우리는 벡터 유사도 인덱스의 크기가 사용 가능한 DRAM 크기보다 훨씬 클 경우에만 이 두 가지 양자화를 추천합니다.
이 경우, 정확성을 향상시키기 위해 재점수 매기기를 활성화하는 것도 제안합니다([vector_search_index_fetch_multiplier](../../../operations/settings/settings#vector_search_index_fetch_multiplier), [vector_search_with_rescoring](../../../operations/settings/settings#vector_search_with_rescoring)).
이진형 양자화는 1) 정규화된 임베딩(즉, 벡터 길이 = 1, OpenAI 모델은 보통 정규화 됨) 및 2) 코사인 거리가 거리 함수로 사용되는 경우에만 추천됩니다.
이진형 양자화는 내부적으로 해밍 거리를 사용하여 근접 그래프를 구축하고 탐색합니다.
재점수 매기기 단계는 테이블에 저장된 원래의 전체 정밀도 벡터를 사용하여 코사인 거리를 통해 가장 가까운 이웃을 식별합니다.

**데이터 전송 조정**

벡터 검색 쿼리에서 참조 벡터는 사용자가 제공하며 일반적으로 대규모 언어 모델(LLM)을 호출하여 검색됩니다.
ClickHouse에서 벡터 검색을 실행하는 전형적인 Python 코드는 다음과 같이 생길 수 있습니다.

```python
search_v = openai_client.embeddings.create(input = "[Good Books]", model='text-embedding-3-large', dimensions=1536).data[0].embedding

params = {'search_v': search_v}
result = chclient.query(
   "SELECT id FROM items
    ORDER BY cosineDistance(vector, %(search_v)s)
    LIMIT 10",
    parameters = params)
```

임베딩 벡터(`search_v` 위의 코드 조각에서)는 매우 큰 차원을 가질 수 있습니다.
예를 들어, OpenAI는 1536차원 또는 3072차원으로 임베딩 벡터를 생성하는 모델을 제공합니다.
위 코드에서 ClickHouse Python 드라이버는 임베딩 벡터를 사람이 읽을 수 있는 문자열로 대체한 후, SELECT 쿼리를 문자열로 전체 전송합니다.
임베딩 벡터가 1536개의 단정밀도 부동 소수점 값으로 구성된다고 가정하면, 전송된 문자열의 길이는 20KB에 도달합니다.
이로 인해 토큰화, 파싱 및 수천 개의 문자열-부동 소수점 변환을 수행하는 데 CPU 사용량이 높아집니다.
또한 ClickHouse 서버 로그 파일에도 상당한 공간이 필요하여 `system.query_log`에서 부풀어 오르는 현상이 발생합니다.

대부분의 LLM 모델은 임베딩 벡터를 네이티브 부동 소수점 목록 또는 NumPy 배열로 반환한다는 점에 주의해야 합니다.
따라서 우리는 Python 애플리케이션에서 다음 방법을 사용하여 참조 벡터 매개변수를 이진 형식으로 바인딩할 것을 권장합니다:

```python
search_v = openai_client.embeddings.create(input = "[Good Books]", model='text-embedding-3-large', dimensions=1536).data[0].embedding

params = {'$search_v_binary$': np.array(search_v, dtype=np.float32).tobytes()}
result = chclient.query(
   "SELECT id FROM items
    ORDER BY cosineDistance(vector, (SELECT reinterpret($search_v_binary$, 'Array(Float32)')))
    LIMIT 10"
    parameters = params)
```

예제에서, 참조 벡터는 이진 형식으로 그대로 전송되며 서버에서 부동 소수 배열로 재해석됩니다.
이것은 서버 측에서 CPU 시간을 절약하고 서버 로그 및 `system.query_log`의 부풀어 오르는 현상을 방지합니다.
#### 관리 및 모니터링 {#administration}

벡터 유사도 인덱스의 디스크 크기는 [system.data_skipping_indices](../../../operations/system-tables/data_skipping_indices)에서 얻을 수 있습니다:

```sql
SELECT database, table, name, formatReadableSize(data_compressed_bytes)
FROM system.data_skipping_indices
WHERE type = 'vector_similarity';
```

예시 출력:

```result
┌─database─┬─table─┬─name─┬─formatReadab⋯ssed_bytes)─┐
│ default  │ tab   │ idx  │ 348.00 MB                │
└──────────┴───────┴──────┴──────────────────────────┘
```
#### 일반 스킵 인덱스와의 차이점 {#differences-to-regular-skipping-indexes}

모든 일반 [스킵 인덱스](/optimize/skipping-indexes)와 마찬가지로 벡터 유사도 인덱스는 그라뉼에 대해 구성되며, 각 인덱스 블록은 `GRANULARITY = [N]`-many 그라뉼로 구성됩니다(`N` = 일반 스킵 인덱스의 경우 기본값 1).
예를 들어, 테이블의 기본 인덱스 기수가 8192(설정 `index_granularity = 8192`)이고 `GRANULARITY = 2`인 경우 각 인덱스 블록은 16384개의 행을 포함합니다.
그러나 근사 이웃 검색을 위한 데이터 구조와 알고리즘은 본질적으로 행 중심적입니다.
그들은 행 집합의 압축 표현을 저장하고 벡터 검색 쿼리에 대한 행도 반환합니다.
이로 인해 벡터 유사도 인덱스가 정상 스킵 인덱스와 비교하여 동작하는 방식에서 다소 직관적이지 않은 차이가 발생합니다.

사용자가 컬럼에 벡터 유사도 인덱스를 정의하면, ClickHouse는 내부적으로 각 인덱스 블록에 대해 벡터 유사도 "서브 인덱스"를 생성합니다.
서브 인덱스는 해당 인덱스 블록의 행만 알고 있다는 점에서 "로컬"입니다.
이전 예에서 컬럼에 65536개의 행이 있다고 가정하면, 네 개의 인덱스 블록(여덟 개의 그라뉼을 포함)과 각 인덱스 블록에 대한 벡터 유사도 서브 인덱스를 얻습니다.
서브 인덱스는 이론적으로 해당 인덱스 블록 내에서 N개의 가장 가까운 점의 행을 바로 반환할 수 있습니다.
그러나 ClickHouse는 그라뉼의 기수로부터 메모리로 데이터를 로드하기 때문에, 서브 인덱스는 일치하는 행을 그라뉼 기수로 외삽해야 합니다.
이는 인덱스 블록의 기수에서 데이터를 건너뛰는 일반 스킵 인덱스와 다릅니다.

`GRANULARITY` 매개변수는 얼마나 많은 벡터 유사도 서브 인덱스가 생성되는지를 결정합니다.
더 큰 `GRANULARITY` 값은 더 적지만 더 큰 벡터 유사도 서브 인덱스를 의미하며, 한 컬럼(또는 컬럼의 데이터 파트)에 하나의 서브 인덱스만 있을 수 있습니다.
이 경우, 서브 인덱스는 모든 컬럼 행에 대한 "전역" 뷰를 가지며 관련 행이 있는 컬럼(파트)의 모든 그라뉼을 직접 반환할 수 있습니다(최대 `LIMIT [N]`-many 이러한 그라뉼이 있습니다).
두 번째 단계에서, ClickHouse는 이러한 그라뉼을 로드하고, 그라뉼의 모든 행에 대해 완 brute-force 거리 계산을 수행하여 실제로 가장 좋은 행을 식별합니다.
작은 `GRANULARITY` 값에서는 각 서브 인덱스가 최대 `LIMIT N`-many 그라뉼을 반환합니다.
그 결과, 더 많은 그라뉼이 로드되고 후처리되어야 합니다.
검색 정확도가 두 경우 모두 동등하게 높지만 처리 성능은 다릅니다.
일반적으로 벡터 유사도 인덱스에 대해 큰 `GRANULARITY`를 사용하는 것이 좋으며, 벡터 유사도 구조의 지나치게 많은 메모리 소비와 같은 문제가 발생할 경우에만 더 작은 `GRANULARITY` 값에 되돌리는 것이 좋습니다.
벡터 유사도 인덱스에 대해 `GRANULARITY`가 지정되지 않은 경우 기본값은 1억입니다.
#### 예제 {#approximate-nearest-neighbor-search-example}

```sql
CREATE TABLE tab(id Int32, vec Array(Float32), INDEX idx vec TYPE vector_similarity('hnsw', 'L2Distance', 2)) ENGINE = MergeTree ORDER BY id;

INSERT INTO tab VALUES (0, [1.0, 0.0]), (1, [1.1, 0.0]), (2, [1.2, 0.0]), (3, [1.3, 0.0]), (4, [1.4, 0.0]), (5, [1.5, 0.0]), (6, [0.0, 2.0]), (7, [0.0, 2.1]), (8, [0.0, 2.2]), (9, [0.0, 2.3]), (10, [0.0, 2.4]), (11, [0.0, 2.5]);

WITH [0., 2.] AS reference_vec
SELECT id, vec
FROM tab
ORDER BY L2Distance(vec, reference_vec) ASC
LIMIT 3;
```

반환값

```result
   ┌─id─┬─vec─────┐
1. │  6 │ [0,2]   │
2. │  7 │ [0,2.1] │
3. │  8 │ [0,2.2] │
   └────┴─────────┘
```

근사 벡터 검색을 사용하는 추가 예제 데이터 세트:
- [LAION-400M](../../../getting-started/example-datasets/laion-400m-dataset)
- [LAION-5B](../../../getting-started/example-datasets/laion-5b-dataset)
- [dbpedia](../../../getting-started/example-datasets/dbpedia-dataset)
- [hackernews](../../../getting-started/example-datasets/hackernews-vector-search-dataset)
### Quantized Bit (QBit) {#approximate-nearest-neighbor-search-qbit}

<ExperimentalBadge/>

정확한 벡터 검색을 가속화하는 일반적인 방법 중 하나는 낮은 정밀도의 [float 데이터 유형](../../../sql-reference/data-types/float.md)을 사용하는 것입니다. 예를 들어, 벡터를 `Array(BFloat16)`로 저장하는 대신 `Array(Float32)`로 저장하면 데이터 크기가 절반으로 줄어들며, 쿼리 실행 시간도 비례적으로 감소할 것으로 예상됩니다. 이 방법은 양자화(quantization)로 알려져 있습니다. 계산 속도가 빨라지긴 하지만, 모든 벡터를 포괄적으로 스캔하더라도 결과 정확성이 저하될 수 있습니다.

전통적인 양자화 방법에서는 검색 중과 데이터를 저장할 때 모두 정밀도를 잃습니다. 위의 예에서 `Float32` 대신 `BFloat16`을 저장하면 나중에 더 정확한 검색을 수행할 수 없게 됩니다. 한 가지 대안은 양자화된 데이터와 전체 정밀도의 두 가지 복사본을 저장하는 것입니다. 이렇게 하면 작동하긴 하지만 중복 저장이 필요합니다. 원래 데이터로 `Float64`가 있고 다양한 정밀도(16비트, 32비트 또는 전체 64비트)로 검색을 실행하고 싶다고 가정해 봅시다. 이 경우 데이터의 세 가지 별도 복사본을 저장해야 합니다.

ClickHouse는 이러한 제한 사항을 해결하기 위해 Quantized Bit (`QBit`) 데이터 유형을 제공합니다:
1. 원본 전체 정밀도 데이터를 저장합니다.
2. 쿼리 시 양자화 정밀도를 지정할 수 있습니다.

이는 비트 그룹 형식으로 데이터를 저장하여(즉, 모든 벡터의 모든 i-th 비트를 함께 저장), 요청된 정밀도 수준에서만 읽을 수 있도록 함으로써 달성됩니다. 이렇게 하면 I/O 및 계산량 감소로 인한 속도 이점을 얻으면서 필요할 때 모든 원본 데이터를 사용할 수 있습니다. 최대 정밀도를 선택하면 검색이 정확해집니다.

:::note
`QBit` 데이터 유형 및 관련 거리 함수는 현재 실험적입니다. 이를 활성화하려면 `SET allow_experimental_qbit_type = 1`을 실행하십시오. 문제가 발생하면 [ClickHouse 저장소](https://github.com/clickhouse/clickhouse/issues)에 이슈를 열어주십시오.
:::

`QBit` 유형의 컬럼을 선언하려면 다음 구문을 사용하십시오:

```sql
column_name QBit(element_type, dimension)
```

여기서:
* `element_type` – 각 벡터 요소의 유형. 지원되는 유형은 `BFloat16`, `Float32`, 및 `Float64`입니다.
* `dimension` – 각 벡터의 요소 수입니다.
#### Creating a `QBit` Table and Adding Data {#qbit-create}

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
#### Vector Search with `QBit` {#qbit-search}

L2 거리를 사용하여 단어 'lemon'을 나타내는 벡터의 가장 가까운 이웃을 찾아봅시다. 거리 함수의 세 번째 매개변수는 비트 수에서의 정밀도를 지정하며, 높은 값은 더 정확하지만 더 많은 계산이 필요합니다.

`QBit`에 대한 사용할 수 있는 모든 거리 함수는 [여기](../../../sql-reference/data-types/qbit.md#vector-search-functions)에서 확인할 수 있습니다.

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

**저정밀도 검색:**

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

12비트 양자화를 사용하면 거리의 적절한 근사를 얻으면서 쿼리 실행이 더 빨라지는 것을 볼 수 있습니다. 상대적인 순서는 여전히 일관되며, 'apple'이 가장 가까운 일치 항목으로 남아 있습니다.

:::note
현재 상태에서 속도 향상은 읽는 데이터 양이 줄어들면서 발생합니다. 원본 데이터가 `Float64`처럼 넓은 경우, 낮은 정밀도를 선택해도 동일한 너비의 데이터에서 거리를 계산하게 됩니다. 다만, 정밀도는 저하됩니다.
:::
#### Performance Considerations {#qbit-performance}

`QBit`의 성능 이점은 낮은 정밀도를 사용함으로써 스토리지에서 읽어야 할 데이터가 줄어들어 I/O 작업이 감소하는 데서 옵니다. 또한, `QBit`가 `Float32` 데이터를 포함하고 있을 경우, 정밀도 매개변수가 16 이하이면 계산이 줄어드는 추가적인 이점이 있습니다. 정밀도 매개변수는 정확성과 속도 간의 균형을 직접 제어합니다:

- **높은 정밀도** (원본 데이터 너비에 가까움): 더 정확한 결과, 느린 쿼리
- **낮은 정밀도**: 대략적인 결과와 더 빠른 쿼리, 감소한 메모리 사용량
### References {#references}

Blogs:
- [ClickHouse로 벡터 검색 - 1부](https://clickhouse.com/blog/vector-search-clickhouse-p1)
- [ClickHouse로 벡터 검색 - 2부](https://clickhouse.com/blog/vector-search-clickhouse-p2)
