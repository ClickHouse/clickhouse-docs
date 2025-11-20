---
'slug': '/optimize/skipping-indexes/examples'
'sidebar_label': '데이터 스킵 인덱스 - 예제'
'sidebar_position': 2
'description': '통합된 Skip 인덱스 예제'
'title': '데이터 스킵 인덱스 예제'
'doc_type': 'guide'
'keywords':
- 'skipping indexes'
- 'data skipping'
- 'performance'
- 'indexing'
- 'best practices'
---


# 데이터 스킵 인덱스 예제 {#data-skipping-index-examples}

이 페이지는 ClickHouse 데이터 스킵 인덱스 예제를 통합하여 각 유형을 선언하는 방법, 사용할 때, 및 적용 여부를 확인하는 방법을 보여줍니다. 모든 기능은 [MergeTree-family tables](/engines/table-engines/mergetree-family/mergetree)와 함께 작동합니다.

**인덱스 구문:** 

```sql
INDEX name expr TYPE type(...) [GRANULARITY N]
```

ClickHouse는 다섯 가지 스킵 인덱스 유형을 지원합니다:

| 인덱스 유형 | 설명 |
|------------|-------------|
| **minmax** | 각 그라뉼의 최소 및 최대 값을 추적합니다. |
| **set(N)** | 각 그라뉼당 최대 N개의 고유 값을 저장합니다. |
| **bloom_filter([false_positive_rate])** | 존재 확인을 위한 확률적 필터입니다. |
| **ngrambf_v1** | 부분 문자열 검색을 위한 N-그램 블룸 필터입니다. |
| **tokenbf_v1** | 전체 텍스트 검색을 위한 토큰 기반 블룸 필터입니다. |

각 섹션은 샘플 데이터와 인덱스 사용을 쿼리 실행에서 확인하는 방법을 보여주는 예제를 제공합니다.

## MinMax 인덱스 {#minmax-index}

`minmax` 인덱스는 느슨하게 정렬된 데이터나 `ORDER BY`와 상관 관계가 있는 컬럼에 대한 범위 프레디케이트에 가장 적합합니다.

```sql
-- Define in CREATE TABLE
CREATE TABLE events
(
  ts DateTime,
  user_id UInt64,
  value UInt32,
  INDEX ts_minmax ts TYPE minmax GRANULARITY 1
)
ENGINE=MergeTree
ORDER BY ts;

-- Or add later and materialize
ALTER TABLE events ADD INDEX ts_minmax ts TYPE minmax GRANULARITY 1;
ALTER TABLE events MATERIALIZE INDEX ts_minmax;

-- Query that benefits from the index
SELECT count() FROM events WHERE ts >= now() - 3600;

-- Verify usage
EXPLAIN indexes = 1
SELECT count() FROM events WHERE ts >= now() - 3600;
```

`EXPLAIN`과 프루닝을 사용한 [작업 예제](/best-practices/use-data-skipping-indices-where-appropriate#example)를 참조하십시오.

## Set 인덱스 {#set-index}

로컬 (블록당) 카디널리티가 낮으면 `set` 인덱스를 사용하십시오; 각 블록에 많은 고유 값이 있는 경우에는 도움이 되지 않습니다.

```sql
ALTER TABLE events ADD INDEX user_set user_id TYPE set(100) GRANULARITY 1;
ALTER TABLE events MATERIALIZE INDEX user_set;

SELECT * FROM events WHERE user_id IN (101, 202);

EXPLAIN indexes = 1
SELECT * FROM events WHERE user_id IN (101, 202);
```

생성/물리화 워크플로우와 전후 효과는 [기본 운영 가이드](/optimize/skipping-indexes#basic-operation)에서 보여줍니다.

## 일반 블룸 필터 (스칼라) {#generic-bloom-filter-scalar}

`bloom_filter` 인덱스는 "바늘 더미에서 바늘 찾기"의 동등성/IN 멤버십에 유용합니다. 선택적 매개변수를 통해 허위 긍정 비율(기본값 0.025)을 설정할 수 있습니다. 

```sql
ALTER TABLE events ADD INDEX value_bf value TYPE bloom_filter(0.01) GRANULARITY 3;
ALTER TABLE events MATERIALIZE INDEX value_bf;

SELECT * FROM events WHERE value IN (7, 42, 99);

EXPLAIN indexes = 1
SELECT * FROM events WHERE value IN (7, 42, 99);
```

## 부분 문자열 검색을 위한 N-그램 블룸 필터 (ngrambf_v1) {#n-gram-bloom-filter-ngrambf-v1-for-substring-search}

`ngrambf_v1` 인덱스는 문자열을 n-그램으로 나눕니다. `LIKE '%...%'` 쿼리에 잘 작동합니다. String/FixedString/Map( mapKeys/mapValues를 통해)을 지원하며, 조정 가능한 크기, 해시 수 및 시드를 제공합니다. 자세한 내용은 [N-그램 블룸 필터](/engines/table-engines/mergetree-family/mergetree#n-gram-bloom-filter) 문서를 참조하십시오.

```sql
-- Create index for substring search
ALTER TABLE logs ADD INDEX msg_ngram msg TYPE ngrambf_v1(3, 10000, 3, 7) GRANULARITY 1;
ALTER TABLE logs MATERIALIZE INDEX msg_ngram;

-- Substring search
SELECT count() FROM logs WHERE msg LIKE '%timeout%';

EXPLAIN indexes = 1
SELECT count() FROM logs WHERE msg LIKE '%timeout%';
```

[이 가이드](/use-cases/observability/schema-design#bloom-filters-for-text-search)는 실용적인 예제와 토큰 대 ngram 사용 시기를 보여줍니다.

**매개변수 최적화 도우미:**

네 개의 ngrambf_v1 매개변수(n-그램 크기, 비트맵 크기, 해시 함수, 시드)는 성능과 메모리 사용에 큰 영향을 미칩니다. 예상 n-그램 볼륨과 원하는 허위 긍정 수치를 기반으로 최적의 비트맵 크기와 해시 함수 수를 계산하기 위해 이 함수를 사용하십시오:

```sql
CREATE FUNCTION bfEstimateFunctions AS
(total_grams, bits) -> round((bits / total_grams) * log(2));

CREATE FUNCTION bfEstimateBmSize AS
(total_grams, p_false) -> ceil((total_grams * log(p_false)) / log(1 / pow(2, log(2))));

-- Example sizing for 4300 ngrams, p_false = 0.0001
SELECT bfEstimateBmSize(4300, 0.0001) / 8 AS size_bytes;  -- ~10304
SELECT bfEstimateFunctions(4300, bfEstimateBmSize(4300, 0.0001)) AS k; -- ~13
```

[매개변수 문서](/engines/table-engines/mergetree-family/mergetree#n-gram-bloom-filter)에서 완전한 조정 지침을 참조하십시오.  

## 단어 기반 검색을 위한 토큰 블룸 필터 (tokenbf_v1) {#token-bloom-filter-tokenbf-v1-for-word-based-search}

`tokenbf_v1`는 비알파벳 문자로 구분된 토큰을 인덱싱합니다. 이를 [`hasToken`](/sql-reference/functions/string-search-functions#hasToken), `LIKE` 단어 패턴 또는 equals/IN과 함께 사용해야 합니다. `String`/`FixedString`/`Map` 유형을 지원합니다.

자세한 내용은 [토큰 블룸 필터](/engines/table-engines/mergetree-family/mergetree#token-bloom-filter) 및 [블룸 필터 유형](/optimize/skipping-indexes#skip-index-types) 페이지를 참조하십시오.

```sql
ALTER TABLE logs ADD INDEX msg_token lower(msg) TYPE tokenbf_v1(10000, 7, 7) GRANULARITY 1;
ALTER TABLE logs MATERIALIZE INDEX msg_token;

-- Word search (case-insensitive via lower)
SELECT count() FROM logs WHERE hasToken(lower(msg), 'exception');

EXPLAIN indexes = 1
SELECT count() FROM logs WHERE hasToken(lower(msg), 'exception');
```

토큰 대 ngram에 대한 관찰 가능리 예제 및 지침은 [여기](/use-cases/observability/schema-design#bloom-filters-for-text-search)를 참조하십시오.

## CREATE TABLE 중 인덱스 추가 (여러 예제) {#add-indexes-during-create-table-multiple-examples}

스킵 인덱스는 복합 표현식 및 `Map`/`Tuple`/`Nested` 유형도 지원합니다. 아래 예제에서 이를 보여줍니다:

```sql
CREATE TABLE t
(
  u64 UInt64,
  s String,
  m Map(String, String),

  INDEX idx_bf u64 TYPE bloom_filter(0.01) GRANULARITY 3,
  INDEX idx_minmax u64 TYPE minmax GRANULARITY 1,
  INDEX idx_set u64 * length(s) TYPE set(1000) GRANULARITY 4,
  INDEX idx_ngram s TYPE ngrambf_v1(3, 10000, 3, 7) GRANULARITY 1,
  INDEX idx_token mapKeys(m) TYPE tokenbf_v1(10000, 7, 7) GRANULARITY 1
)
ENGINE = MergeTree
ORDER BY u64;
```

## 기존 데이터에 대한 물리화 및 검증 {#materializing-on-existing-data-and-verifying}

`MATERIALIZE`를 사용하여 기존 데이터 파트에 인덱스를 추가하고, 아래와 같이 `EXPLAIN` 또는 추적 로그를 통해 프루닝을 검사할 수 있습니다:

```sql
ALTER TABLE t MATERIALIZE INDEX idx_bf;

EXPLAIN indexes = 1
SELECT count() FROM t WHERE u64 IN (123, 456);

-- Optional: detailed pruning info
SET send_logs_level = 'trace';
```

이 [작업 minmax 예제](/best-practices/use-data-skipping-indices-where-appropriate#example)는 EXPLAIN 출력 구조 및 프루닝 수를 보여줍니다.

## 스킵 인덱스를 사용해야 할 때와 피해야 할 때 {#when-use-and-when-to-avoid}

**스킵 인덱스를 사용해야 할 때:**

* 데이터 블록 내에서 필터 값이 희소할 때  
* `ORDER BY` 컬럼과 강한 상관관계가 있거나 데이터 수집 패턴이 유사한 값을 그룹화하고 있을 때  
* 대규모 로그 데이터 세트에서 텍스트 검색을 수행할 때 (`ngrambf_v1`/`tokenbf_v1` 유형)

**스킵 인덱스를 피해야 할 때:**

* 대부분의 블록이 일치하는 값을 최소한 하나 이상 포함할 가능성이 높을 때 (블록은 무조건 읽히게 됨)  
* 데이터 정렬과 상관관계가 없는 고카디널리티 컬럼을 필터링할 때

:::note 중요 고려 사항
데이터 블록 내에 값이 단 한 번이라도 나타나면 ClickHouse는 전체 블록을 읽어야 합니다. 현실적인 데이터 세트로 인덱스를 테스트하고 실제 성능 측정에 따라 세분성과 유형별 매개변수를 조정하십시오.
:::

## 인덱스를 임시로 무시하거나 강제 적용 {#temporarily-ignore-or-force-indexes}

테스트 및 문제 해결 동안 특정 쿼리의 이름으로 특정 인덱스를 비활성화할 수 있습니다. 필요할 때 인덱스 사용을 강제할 수도 있습니다. [`ignore_data_skipping_indices`](/operations/settings/settings#ignore_data_skipping_indices)를 참조하십시오.

```sql
-- Ignore an index by name
SELECT * FROM logs
WHERE hasToken(lower(msg), 'exception')
SETTINGS ignore_data_skipping_indices = 'msg_token';
```

## 참고 사항 및 주의 사항 {#notes-and-caveats}

* 스킵 인덱스는 [MergeTree-family tables](/engines/table-engines/mergetree-family/mergetree)에서만 지원되며; 프루닝은 그라뉼/블록 수준에서 발생합니다.  
* 블룸 필터 기반 인덱스는 확률적입니다 (허위 긍정은 추가 읽기를 유발하지만 유효한 데이터를 스킵하지는 않습니다).  
* 블룸 필터 및 기타 스킵 인덱스는 `EXPLAIN` 및 추적을 사용하여 검증해야 하며; 프루닝과 인덱스 크기를 균형 잡기 위해 세분성을 조정해야 합니다.

## 관련 문서 {#related-docs}
- [데이터 스킵 인덱스 가이드](/optimize/skipping-indexes)
- [모범 사례 가이드](/best-practices/use-data-skipping-indices-where-appropriate)
- [데이터 스킵 인덱스 조작 하기](/sql-reference/statements/alter/skipping-index)
- [시스템 테이블 정보](/operations/system-tables/data_skipping_indices)
