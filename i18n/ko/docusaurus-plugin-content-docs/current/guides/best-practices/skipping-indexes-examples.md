---
slug: /optimize/skipping-indexes/examples
sidebar_label: '데이터 스키핑 인덱스 - 예제'
sidebar_position: 2
description: '데이터 스키핑 인덱스 예제 모음'
title: '데이터 스키핑 인덱스 예제'
doc_type: 'guide'
keywords: ['데이터 스키핑 인덱스', '데이터 스키핑', '성능', '인덱싱', '모범 사례']
---

# 데이터 스키핑 인덱스 예시 \{#data-skipping-index-examples\}

이 페이지에서는 ClickHouse 데이터 스키핑 인덱스 예시를 정리하여 각 인덱스 유형을 선언하는 방법, 언제 사용하는지, 그리고 인덱스가 적용되었는지 확인하는 방법을 설명합니다. 모든 기능은 [MergeTree 계열 테이블](/engines/table-engines/mergetree-family/mergetree)에서 동작합니다.

**인덱스 문법:**

```sql
INDEX name expr TYPE type(...) [GRANULARITY N]
```

ClickHouse는 여섯 가지 스킵 인덱스 유형을 지원합니다:

| Index Type                                          | Description                         |
| --------------------------------------------------- | ----------------------------------- |
| **minmax**                                          | 각 그래뉼(granule)에서 최소값과 최대값을 추적       |
| **set(N)**                                          | 그래뉼당 최대 N개의 서로 다른 값을 저장             |
| **text**                                            | 전체 텍스트 검색을 위해 토큰화된 문자열 데이터에 대한 역인덱스 |
| **bloom&#95;filter([false&#95;positive&#95;rate])** | 존재 여부 검사를 위한 확률적 필터                 |
| **ngrambf&#95;v1**                                  | 부분 문자열 검색을 위한 N-그램 블룸 필터            |
| **tokenbf&#95;v1**                                  | 전체 텍스트 검색을 위한 토큰 기반 블룸 필터           |

각 섹션에서는 샘플 데이터와 함께 예제를 제시하고, 쿼리 실행 시 인덱스 사용 여부를 확인하는 방법을 보여줍니다.


## MinMax 인덱스 \{#minmax-index\}

`minmax` 인덱스는 느슨하게 정렬된 데이터나 `ORDER BY`와 상관관계가 있는 컬럼에 사용하는 범위 조건에 가장 적합합니다.

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

`EXPLAIN`과 프루닝(pruning)이 적용된 [구체적인 예제](/best-practices/use-data-skipping-indices-where-appropriate#example)를 참고하십시오.


## Set 인덱스 \{#set-index\}

`set` 인덱스는 로컬(블록 단위) 카디널리티가 낮을 때 사용합니다. 각 블록마다 서로 다른 값의 개수가 많다면 효과가 없습니다.

```sql
ALTER TABLE events ADD INDEX user_set user_id TYPE set(100) GRANULARITY 1;
ALTER TABLE events MATERIALIZE INDEX user_set;

SELECT * FROM events WHERE user_id IN (101, 202);

EXPLAIN indexes = 1
SELECT * FROM events WHERE user_id IN (101, 202);
```

생성 및 구체화 워크플로와 적용 전후 효과는 [기본 동작 가이드](/optimize/skipping-indexes#basic-operation)에 나와 있습니다.


## 전문 검색을 위한 텍스트 인덱스(text) \{#textindex-for-full-text-search\}

`text`는 토큰화된 텍스트 데이터에 대한 역색인(inverted index)입니다.
전문 검색 워크로드를 위해 특별히 설계되어 토큰과 용어를 효율적이고 일관된 방식으로 조회할 수 있습니다.
자연어 또는 대규모 텍스트 검색 사용 사례에 적합합니다.

자세한 내용과 예시는 [Text Indexes를 활용한 전문 검색](/engines/table-engines/mergetree-family/textindexes)을 참고하십시오.

```sql
ALTER TABLE logs ADD INDEX msg_text msg TYPE text(tokenizer = splitByNonAlpha);
ALTER TABLE logs MATERIALIZE INDEX msg_text;

SELECT count() FROM logs WHERE hasAllTokens(msg, 'exception');
```

보다 포괄적인 관측성 예시는 [여기](/use-cases/observability/schema-design#text-index-for-full-text-search) 문서를 참조하십시오.

텍스트 인덱스는 완전히 결정론적이며 토큰화(tokenization)와 텍스트 처리 방식을 완전히 조정할 수 있지만, 블룸 필터 기반 인덱스와 비교하면 더 많은 저장 공간을 사용합니다.


## 제네릭 블룸 필터(스칼라) \{#generic-bloom-filter-scalar\}

`bloom_filter` 인덱스는 &quot;건초 더미 속 바늘 찾기&quot;식의 equality/IN 조건 조회에 적합합니다. 선택적 매개변수로 허용 가능한 거짓 양성(false positive) 비율을 지정하며, 기본값은 0.025입니다.

```sql
ALTER TABLE events ADD INDEX value_bf value TYPE bloom_filter(0.01) GRANULARITY 3;
ALTER TABLE events MATERIALIZE INDEX value_bf;

SELECT * FROM events WHERE value IN (7, 42, 99);

EXPLAIN indexes = 1
SELECT * FROM events WHERE value IN (7, 42, 99);
```


## 부분 문자열 검색을 위한 N-그램 블룸 필터(ngrambf_v1) \{#n-gram-bloom-filter-ngrambf-v1-for-substring-search\}

> 참고: ClickHouse 26.2 버전부터 텍스트 인덱스가 일반적으로 사용 가능(GA)이 됨에 따라, 전체 텍스트 검색 용도로는 블룸 필터 기반 인덱스를 더 이상 권장하지 않습니다.
> 블룸 필터는 더 compact하지만, 확률적 구조이기 때문에 거짓 양성이 발생하는 경향이 있습니다.
> 또한, 설정 가능한 범위도 제한적입니다.

`ngrambf_v1` 인덱스는 문자열을 N-그램으로 분할합니다. `LIKE '%...%'` 패턴을 사용하는 쿼리에 효과적으로 동작합니다. String/FixedString/맵(`mapKeys`/`mapValues`를 통해)을 지원하며, 크기, 해시 개수, 시드 값을 조정할 수 있습니다. 자세한 내용은 [N-gram bloom filter](/engines/table-engines/mergetree-family/mergetree#n-gram-bloom-filter) 문서를 참조하십시오.

```sql
-- Create index for substring search
ALTER TABLE logs ADD INDEX msg_ngram msg TYPE ngrambf_v1(3, 10000, 3, 7) GRANULARITY 1;
ALTER TABLE logs MATERIALIZE INDEX msg_ngram;

-- Substring search
SELECT count() FROM logs WHERE msg LIKE '%timeout%';

EXPLAIN indexes = 1
SELECT count() FROM logs WHERE msg LIKE '%timeout%';
```

[이 가이드](/use-cases/observability/schema-design#bloom-filters-for-text-search)는 실제 예제와 함께 token과 ngram을 각각 언제 사용해야 하는지 설명합니다.

**파라미터 최적화 도구:**

네 가지 ngrambf&#95;v1 파라미터(n-gram 크기, 비트맵 크기, 해시 함수 개수, 시드)는 성능과 메모리 사용량에 큰 영향을 미칩니다. 예상 n-gram 개수와 원하는 거짓 양성 비율(false positive rate)을 바탕으로 최적의 비트맵 크기와 해시 함수 개수를 계산하려면 다음 함수를 사용하십시오:

```sql
CREATE FUNCTION bfEstimateFunctions AS
(total_grams, bits) -> round((bits / total_grams) * log(2));

CREATE FUNCTION bfEstimateBmSize AS
(total_grams, p_false) -> ceil((total_grams * log(p_false)) / log(1 / pow(2, log(2))));

-- Example sizing for 4300 ngrams, p_false = 0.0001
SELECT bfEstimateBmSize(4300, 0.0001) / 8 AS size_bytes;  -- ~10304
SELECT bfEstimateFunctions(4300, bfEstimateBmSize(4300, 0.0001)) AS k; -- ~13
```

튜닝 방법 전반에 대한 안내는 [매개변수 문서](/engines/table-engines/mergetree-family/mergetree#n-gram-bloom-filter)를 참조하십시오.


## 단어 기반 검색을 위한 토큰 블룸 필터(tokenbf_v1) \{#token-bloom-filter-tokenbf-v1-for-word-based-search\}

> 참고: ClickHouse 26.2 버전부터 텍스트 인덱스가 일반 제공(GA)이 되면서, 전체 텍스트 검색 용도로는 블룸 필터 기반 인덱스 사용을 더 이상 권장하지 않습니다.
> 블룸 필터는 더 compact하지만, 확률적 특성 때문에 오탐(false positive)을 발생시키는 경향이 있습니다.
> 또한, 구성 옵션이 제한적입니다.

`tokenbf_v1`는 영숫자가 아닌 문자로 구분된 토큰을 인덱싱합니다. [`hasToken`](/sql-reference/functions/string-search-functions#hasToken), `LIKE` 단어 패턴, 또는 `=`/`IN` 연산자와 함께 사용하는 것이 좋습니다. `String`/`FixedString`/`Map` 타입을 지원합니다.

자세한 내용은 [Token bloom filter](/engines/table-engines/mergetree-family/mergetree#token-bloom-filter) 및 [Bloom filter types](/optimize/skipping-indexes#skip-index-types) 페이지를 참고하십시오.

```sql
ALTER TABLE logs ADD INDEX msg_token lower(msg) TYPE tokenbf_v1(10000, 7, 7) GRANULARITY 1;
ALTER TABLE logs MATERIALIZE INDEX msg_token;

-- Word search (case-insensitive via lower)
SELECT count() FROM logs WHERE hasToken(lower(msg), 'exception');

EXPLAIN indexes = 1
SELECT count() FROM logs WHERE hasToken(lower(msg), 'exception');
```

토큰과 ngram 비교에 대한 관측성 예제와 가이드는 [여기](/use-cases/observability/schema-design#bloom-filters-for-text-search)를 참고하십시오.


## CREATE TABLE 시 인덱스 추가 (여러 예시) \{#add-indexes-during-create-table-multiple-examples\}

스키핑 인덱스는 복합 표현식과 `Map`/`Tuple`/`Nested` 타입도 지원합니다. 아래 예시에서 이를 확인할 수 있습니다.

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


## 기존 데이터에 대해 구체화하고 검증하기 \{#materializing-on-existing-data-and-verifying\}

`MATERIALIZE`를 사용하여 기존 데이터 파트에 인덱스를 추가할 수 있으며, 아래 예시와 같이 `EXPLAIN` 또는 트레이스 로그를 사용하여 프루닝(pruning) 동작을 확인할 수 있습니다:

```sql
ALTER TABLE t MATERIALIZE INDEX idx_bf;

EXPLAIN indexes = 1
SELECT count() FROM t WHERE u64 IN (123, 456);

-- Optional: detailed pruning info
SET send_logs_level = 'trace';
```

이 [실행된 minmax 예제](/best-practices/use-data-skipping-indices-where-appropriate#example)는 EXPLAIN 결과 구조와 프루닝(pruning) 수를 보여줍니다.


## 스킵 인덱스를 사용해야 할 때와 피해야 할 때 \{#when-use-and-when-to-avoid\}

**스킵 인덱스를 사용하기 좋은 경우:**

* 필터링 대상 값이 데이터 블록 내에서 희소한 경우  
* `ORDER BY` 컬럼과 강한 상관관계가 있거나 데이터 수집 패턴으로 인해 유사한 값들이 함께 묶여 저장되는 경우  
* 대규모 로그 데이터셋에서 텍스트 검색을 수행하는 경우 (`ngrambf_v1`/`tokenbf_v1` 타입)

**스킵 인덱스를 피해야 할 경우:**

* 대부분의 블록에 적어도 하나의 일치 값이 존재할 가능성이 높은 경우 (결국 해당 블록이 모두 읽히게 됨)  
* 데이터 정렬 순서와 상관관계가 없는, 카디널리티가 높은 컬럼을 필터링하는 경우

:::note 중요한 고려 사항
어떤 값이 데이터 블록에 한 번이라도 나타나면 ClickHouse는 해당 블록 전체를 읽어야 합니다. 실제 데이터와 유사한 데이터셋으로 인덱스를 테스트하고, 실제 성능 측정 결과를 바탕으로 granularity 및 타입별 파라미터를 조정하십시오.
:::

## 인덱스를 일시적으로 무시하거나 강제로 사용하기 \{#temporarily-ignore-or-force-indexes\}

테스트 및 문제 해결 중 개별 쿼리에서 이름으로 특정 인덱스를 비활성화할 수 있습니다. 필요할 때 인덱스 사용을 강제하는 설정도 있습니다. [`ignore_data_skipping_indices`](/operations/settings/settings#ignore_data_skipping_indices)를 참고하십시오.

```sql
-- Ignore an index by name
SELECT * FROM logs
WHERE hasToken(lower(msg), 'exception')
SETTINGS ignore_data_skipping_indices = 'msg_token';
```


## 참고 사항 및 유의점 \{#notes-and-caveats\}

* 스키핑 인덱스는 [MergeTree 계열 테이블](/engines/table-engines/mergetree-family/mergetree)에만 지원되며, 프루닝(pruning)은 그래뉼(granule)/블록 수준에서 수행됩니다.  
* 블룸 필터 기반 인덱스는 확률적인 특성을 가지며, 거짓 양성으로 인해 추가 읽기가 발생할 수 있지만 유효한 데이터가 잘못 건너뛰어지지는 않습니다.  
* 블룸 필터 및 기타 스키핑 인덱스는 `EXPLAIN`과 트레이싱(tracing)을 통해 검증해야 하며, 프루닝 효과와 인덱스 크기 간의 균형을 맞추기 위해 그래뉼러리티(granularity)를 조정하십시오.

## 관련 문서 \{#related-docs\}

- [데이터 스키핑 인덱스 가이드](/optimize/skipping-indexes)
- [모범 사례 가이드](/best-practices/use-data-skipping-indices-where-appropriate)
- [데이터 스키핑 인덱스 다루기](/sql-reference/statements/alter/skipping-index)
- [시스템 테이블 정보](/operations/system-tables/data_skipping_indices)