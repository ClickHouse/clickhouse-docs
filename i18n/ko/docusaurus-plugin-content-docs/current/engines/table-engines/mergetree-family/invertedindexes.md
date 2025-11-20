---
'description': '빠르게 찾기 검색 용어 in 텍스트.'
'keywords':
- 'full-text search'
- 'text index'
- 'index'
- 'indices'
'sidebar_label': '전체 텍스트 검색 using Text Indexes'
'slug': '/engines/table-engines/mergetree-family/invertedindexes'
'title': '전체 텍스트 검색 using Text Indexes'
'doc_type': 'reference'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';


# 전체 텍스트 검색을 위한 텍스트 인덱스

<PrivatePreviewBadge/>

ClickHouse의 텍스트 인덱스(모두 "역 인덱스"로 알려져 있음)는 문자열 데이터에 대해 빠른 전체 텍스트 기능을 제공합니다. 인덱스는 컬럼의 각 토큰을 해당 토큰을 포함하는 행에 매핑합니다. 토큰은 토큰화라는 프로세스에 의해 생성됩니다. 예를 들어, ClickHouse는 기본적으로 영어 문장 "All cat like mice."를 ["All", "cat", "like", "mice"]로 토큰화합니다(마지막 점은 무시됨). 로그 데이터에 대한 더 발전된 토크나이저도 제공됩니다.

## 텍스트 인덱스 만들기 {#creating-a-text-index}

텍스트 인덱스를 생성하려면 먼저 해당 실험적 설정을 활성화해야 합니다:

```sql
SET allow_experimental_full_text_index = true;
```

텍스트 인덱스는 다음 구문을 사용하여 [String](/sql-reference/data-types/string.md), [FixedString](/sql-reference/data-types/fixedstring.md), [Array(String)](/sql-reference/data-types/array.md), [Array(FixedString)](/sql-reference/data-types/array.md), 및 [Map](/sql-reference/data-types/map.md) 컬럼에 정의할 수 있습니다( [mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapkeys) 및 [mapValues](/sql-reference/functions/tuple-map-functions.md/#mapvalues) 매핑 함수 이용):

```sql
CREATE TABLE tab
(
    `key` UInt64,
    `str` String,
    INDEX text_idx(str) TYPE text(
                                -- Mandatory parameters:
                                tokenizer = splitByNonAlpha
                                            | splitByString[(S)]
                                            | ngrams[(N)]
                                            | sparseGrams[(min_length[, max_length[, min_cutoff_length]])]
                                            | array
                                -- Optional parameters:
                                [, preprocessor = expression(str)]
                                -- Optional advanced parameters:
                                [, dictionary_block_size = D]
                                [, dictionary_block_frontcoding_compression = B]
                                [, max_cardinality_for_embedded_postings = M]
                                [, bloom_filter_false_positive_rate = R]
                            ) [GRANULARITY 64]
)
ENGINE = MergeTree
ORDER BY key
```

**토크나이저 인수(필수)**. `tokenizer` 인수는 토크나이저를 지정합니다:

- `splitByNonAlpha`는 비알파벳 ASCII 문자를 따라 문자열을 나눕니다(함수 [splitByNonAlpha](/sql-reference/functions/splitting-merging-functions.md/#splitByNonAlpha)도 참조).
- `splitByString(S)`는 특정 사용자 정의 구분 문자열 `S`를 따라 문자열을 나눕니다(함수 [splitByString](/sql-reference/functions/splitting-merging-functions.md/#splitByString)도 참조). 구분 기호는 선택적 매개변수를 사용하여 지정할 수 있습니다. 예: `tokenizer = splitByString([', ', '; ', '\n', '\\'])`. 각 문자열은 여러 문자로 구성될 수 있습니다(`', '` 예시 참조). 명시적으로 지정되지 않은 경우의 기본 구분 기호 목록은 단일 공백 `[' ']`입니다.
- `ngrams(N)`는 문자열을 동일한 크기의 `N`-그램으로 나눕니다(함수 [ngrams](/sql-reference/functions/splitting-merging-functions.md/#ngrams)도 참조). ngram 길이는 2와 8 사이의 선택적 정수 매개변수를 사용하여 지정할 수 있습니다. 예: `tokenizer = ngrams(3)`. 명시적으로 지정되지 않은 경우의 기본 ngram 크기는 3입니다.
- `sparseGrams(min_length, max_length, min_cutoff_length)`는 최소 `min_length` 및 최대 `max_length` (포함) 문자로 구성된 가변 길이 n-그램으로 문자열을 나눕니다(함수 [sparseGrams](/sql-reference/functions/string-functions#sparseGrams)도 참조). 명시적으로 지정되지 않은 경우 `min_length` 및 `max_length`의 기본값은 3과 100입니다. 매개변수 `min_cutoff_length`가 제공되면 길이가 `min_cutoff_length` 이상인 n-그램만 인덱스에 저장됩니다. `ngrams(N)`에 비해 `sparseGrams` 토크나이저는 가변 길이 N-그램을 생성하여 원래 텍스트의 더 유연한 표현을 허용합니다. 예를 들어, `tokenizer = sparseGrams(3, 5, 4)`는 내부적으로 입력 문자열에서 3-, 4-, 5-그램을 생성하지만 4- 및 5-그램만 인덱스에 저장됩니다.
- `array`는 토큰화하지 않으며, 즉 모든 행 값이 토큰입니다(함수 [array](/sql-reference/functions/array-functions.md/#array)도 참조).

:::note
`splitByString` 토크나이저는 왼쪽에서 오른쪽으로 분할 구분 기호를 적용합니다. 이는 모호성을 생성할 수 있습니다. 예를 들어, 구분 문자열 `['%21', '%']`는 `%21abc`를 `['abc']`로 토큰화하지만 두 개의 구분 문자열을 `['%', '%21']`으로 바꾸면 `['21abc']`가 출력됩니다. 대부분의 경우, 매칭이 더 긴 구분 기호를 우선적으로 선호하도록 하려면, 구분 문자열을 길이가 감소하는 순서로 전달하는 것이 좋습니다. 구분 문자열이 [프리픽스 코드](https://en.wikipedia.org/wiki/Prefix_code)를 형성하는 경우, 임의의 순서로 전달할 수 있습니다.
:::

:::warning
현재 비서구어(예: 중국어) 텍스트에 대해 텍스트 인덱스를 구축하는 것은 권장되지 않습니다. 현재 지원되는 토크나이저는 거대한 인덱스 크기 및 긴 쿼리 시간을 초래할 수 있습니다. 우리는 이러한 경우를 더 잘 처리할 전문화된 언어별 토크나이저를 미래에 추가할 계획입니다.
:::

입력 문자열이 어떻게 토큰으로 분할되는지 테스트하려면 ClickHouse의 [tokens](/sql-reference/functions/splitting-merging-functions.md/#tokens) 함수를 사용할 수 있습니다.

예시:

```sql
SELECT tokens('abc def', 'ngrams', 3);
```

결과:

```result
['abc','bc ','c d',' de','def']
```

**전처리기 인수(선택 사항)**. `preprocessor` 인수는 토큰화 이전에 입력 문자열에 적용되는 표현식입니다.

전처리기 인수의 일반적인 사용 사례는 다음과 같습니다:
1. 대소문자 구별 없는 매칭을 가능하게 하기 위한 대문자 또는 소문자 변환, 예: [lower](/sql-reference/functions/string-functions.md/#lower), [lowerUTF8](/sql-reference/functions/string-functions.md/#lowerUTF8). 아래 첫 번째 예를 참조하십시오.
2. UTF-8 정규화, 예: [normalizeUTF8NFC](/sql-reference/functions/string-functions.md/#normalizeUTF8NFC), [normalizeUTF8NFD](/sql-reference/functions/string-functions.md/#normalizeUTF8NFD), [normalizeUTF8NFKC](/sql-reference/functions/string-functions.md/#normalizeUTF8NFKC), [normalizeUTF8NFKD](/sql-reference/functions/string-functions.md/#normalizeUTF8NFKD), [toValidUTF8](/sql-reference/functions/string-functions.md/#toValidUTF8).
3. 원하지 않는 문자나 하위 문자열 제거 또는 변환, 예: [extractTextFromHTML](/sql-reference/functions/string-functions.md/#extractTextFromHTML), [substring](/sql-reference/functions/string-functions.md/#substring), [idnaEncode](/sql-reference/functions/string-functions.md/#idnaEncode).

전처리기 표현식은 [String](/sql-reference/data-types/string.md) 또는 [FixedString](/sql-reference/data-types/fixedstring.md) 유형의 입력 값을 같은 유형의 값으로 변형해야 합니다.

예시:
- `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = lower(col))`
- `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = substringIndex(col, '\n', 1))`
- `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = lower(extractTextFromHTML(col)))`

또한 전처리기 표현식은 텍스트 인덱스가 정의된 컬럼만 참조해야 합니다. 비결정적 함수의 사용은 허용되지 않습니다.

함수 [hasToken](/sql-reference/functions/string-search-functions.md/#hasToken), [hasAllTokens](/sql-reference/functions/string-search-functions.md/#hasAllTokens), [hasAnyTokens](/sql-reference/functions/string-search-functions.md/#hasAnyTokens)는 먼저 검색 용어를 변형하기 위해 전처리기를 사용한 후 이를 토큰화합니다.

예를 들면,

```sql
CREATE TABLE tab
(
    key UInt64,
    str String,
    INDEX idx(str) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = lower(str))
)
ENGINE = MergeTree
ORDER BY tuple();

SELECT count() FROM tab WHERE hasToken(str, 'Foo');
```

다음과 같이 동등합니다:

```sql
CREATE TABLE tab
(
    key UInt64,
    str String,
    INDEX idx(lower(str)) TYPE text(tokenizer = 'splitByNonAlpha')
)
ENGINE = MergeTree
ORDER BY tuple();

SELECT count() FROM tab WHERE hasToken(str, lower('Foo'));
```

**기타 인수(선택 사항)**. ClickHouse의 텍스트 인덱스는 [보조 인덱스](/engines/table-engines/mergetree-family/mergetree.md/#skip-index-types)로 구현됩니다. 그러나 다른 스키핑 인덱스와 달리 텍스트 인덱스는 기본 인덱스 GRANULARITY가 64입니다. 이 값은 경험적으로 선택되었으며 대부분의 사용 사례에서 속도와 인덱스 크기 간의 좋은 균형을 제공합니다. 고급 사용자는 다른 인덱스 세분도를 지정할 수 있지만 (권장하지 않음).

<details markdown="1">

<summary>선택적 고급 매개변수</summary>

다음 고급 매개변수의 기본값은 사실상 모든 상황에서 잘 작동합니다. 우리는 이들을 변경하는 것을 권장하지 않습니다.

선택적 매개변수 `dictionary_block_size`(기본값: 128)는 행 수의 사전 블록 크기를 지정합니다.

선택적 매개변수 `dictionary_block_frontcoding_compression`(기본값: 1)은 사전 블록이 압축을 위해 프론트 코딩을 사용하는지 여부를 지정합니다.

선택적 매개변수 `max_cardinality_for_embedded_postings`(기본값: 16)는 게시 목록이 사전 블록 내에 포함되어야 하는 기준의 카디널리티 임계값을 지정합니다.

선택적 매개변수 `bloom_filter_false_positive_rate`(기본값: 0.1)는 사전 블룸 필터의 오탐률을 지정합니다.
</details>

테이블을 생성한 후 컬럼에 텍스트 인덱스를 추가하거나 제거할 수 있습니다:

```sql
ALTER TABLE tab DROP INDEX text_idx;
ALTER TABLE tab ADD INDEX text_idx(s) TYPE text(tokenizer = splitByNonAlpha);
```

## 텍스트 인덱스 사용하기 {#using-a-text-index}

SELECT 쿼리에서 텍스트 인덱스를 사용하는 것은 일반 문자열 검색 함수가 인덱스를 자동으로 활용하므로 간단합니다. 인덱스가 존재하지 않으면 아래 문자열 검색 함수는 느린 기법적으로 스캔합니다.

### 지원되는 함수 {#functions-support}

텍스트 함수가 SELECT 쿼리의 `WHERE` 절에서 사용되는 경우 텍스트 인덱스를 사용할 수 있습니다:

```sql
SELECT [...]
FROM [...]
WHERE string_search_function(column_with_text_index)
```

#### `=` 및 `!=` {#functions-example-equals-notequals}

`=` ([equals](/sql-reference/functions/comparison-functions.md/#equals)) 및 `!=` ([notEquals](/sql-reference/functions/comparison-functions.md/#notEquals))는 주어진 검색 용어 전체를 일치시킵니다.

예시:

```sql
SELECT * from tab WHERE str = 'Hello';
```

텍스트 인덱스는 `=` 및 `!=`를 지원하지만, 동등성 및 부등식 검색은 `array` 토크나이저와 함께 사용할 때만 의미가 있습니다(이로 인해 인덱스는 전체 행 값을 저장합니다).

#### `IN` 및 `NOT IN` {#functions-example-in-notin}

`IN` ([in](/sql-reference/functions/in-functions)) 및 `NOT IN` ([notIn](/sql-reference/functions/in-functions))는 `equals` 및 `notEquals` 함수와 유사하지만 모든(`IN`) 또는 없음(`NOT IN`) 검색 용어와 일치합니다.

예시:

```sql
SELECT * from tab WHERE str IN ('Hello', 'World');
```

`=` 및 `!=`와 동일한 제한 사항이 적용되며, 즉 `IN` 및 `NOT IN`은 `array` 토크나이저와 함께 사용할 때만 의미가 있습니다.

#### `LIKE`, `NOT LIKE` 및 `match` {#functions-example-like-notlike-match}

:::note
이 함수들은 현재 인덱스 토크나이저가 `splitByNonAlpha` 또는 `ngrams`일 때만 필터링을 위해 텍스트 인덱스를 사용합니다.
:::

`LIKE` ([like](/sql-reference/functions/string-search-functions.md/#like)), `NOT LIKE` ([notLike](/sql-reference/functions/string-search-functions.md/#notLike)), 그리고 [match](/sql-reference/functions/string-search-functions.md/#match) 함수와 함께 텍스트 인덱스를 사용하려면 ClickHouse가 검색 용어에서 완전한 토큰을 추출할 수 있어야 합니다.

예시:

```sql
SELECT count() FROM tab WHERE comment LIKE 'support%';
```

예시의 `support`는 `support`, `supports`, `supporting` 등과 일치할 수 있습니다. 이러한 종류의 쿼리는 하위 문자열 쿼리이며, 텍스트 인덱스에 의해 빠르게 처리될 수 없습니다.

LIKE 쿼리에서 텍스트 인덱스를 활용하려면 LIKE 패턴을 다음과 같이 재작성해야 합니다:

```sql
SELECT count() FROM tab WHERE comment LIKE ' support %'; -- or `% support %`
```

`support`의 왼쪽 및 오른쪽의 공백은 해당 용어가 토큰으로 추출될 수 있도록 합니다.

#### `startsWith` 및 `endsWith` {#functions-example-startswith-endswith}

`LIKE`와 유사하게, 함수 [startsWith](/sql-reference/functions/string-functions.md/#startsWith) 및 [endsWith](/sql-reference/functions/string-functions.md/#endsWith)는 검색 용어에서 완전한 토큰을 추출할 수 있을 때만 텍스트 인덱스를 사용할 수 있습니다.

예시:

```sql
SELECT count() FROM tab WHERE startsWith(comment, 'clickhouse support');
```

예시에서 오직 `clickhouse`만이 토큰으로 간주됩니다. `support`는 `support`, `supports`, `supporting` 등과 일치할 수 있기 때문에 토큰이 아닙니다.

`clickhouse supports`로 시작하는 모든 행을 찾으려면 검색 패턴의 끝에 공백을 추가하십시오:

```sql
startsWith(comment, 'clickhouse supports ')`
```

유사하게, `endsWith`는 선행 공백과 함께 사용해야 합니다:

```sql
SELECT count() FROM tab WHERE endsWith(comment, ' olap engine');
```

#### `hasToken` 및 `hasTokenOrNull` {#functions-example-hastoken-hastokenornull}

함수 [hasToken](/sql-reference/functions/string-search-functions.md/#hasToken) 및 [hasTokenOrNull](/sql-reference/functions/string-search-functions.md/#hasTokenOrNull)은 주어진 단일 토큰과 일치합니다.

앞서 언급한 함수들과 달리, 이들은 검색 용어를 토큰화하지 않습니다(입력이 단일 토큰임을 가정합니다).

예시:

```sql
SELECT count() FROM tab WHERE hasToken(comment, 'clickhouse');
```

함수 `hasToken` 및 `hasTokenOrNull`은 `text` 인덱스와 함께 사용할 때 가장 성능이 좋습니다.

#### `hasAnyTokens` 및 `hasAllTokens` {#functions-example-hasanytokens-hasalltokens}

함수 [hasAnyTokens](/sql-reference/functions/string-search-functions.md/#hasAnyTokens) 및 [hasAllTokens](/sql-reference/functions/string-search-functions.md/#hasAllTokens)은 주어진 토큰 중 하나 또는 모두와 일치합니다.

이 두 함수는 검색 토큰을 인덱스 컬럼에 사용된 것과 동일한 토크나이저를 사용하여 토큰화할 문자열로 받거나, 검색 전에 토큰화가 적용되지 않는 이미 처리된 토큰의 배열로 받을 수 있습니다. 더 많은 정보는 함수 문서를 참조하십시오.

예시:

```sql
-- Search tokens passed as string argument
SELECT count() FROM tab WHERE hasAnyTokens(comment, 'clickhouse olap');
SELECT count() FROM tab WHERE hasAllTokens(comment, 'clickhouse olap');

-- Search tokens passed as Array(String)
SELECT count() FROM tab WHERE hasAnyTokens(comment, ['clickhouse', 'olap']);
SELECT count() FROM tab WHERE hasAllTokens(comment, ['clickhouse', 'olap']);
```

#### `has` {#functions-example-has}

배열 함수 [has](/sql-reference/functions/array-functions#has)는 문자열 배열에서 단일 토큰과 일치합니다.

예시:

```sql
SELECT count() FROM tab WHERE has(array, 'clickhouse');
```

#### `mapContains` {#functions-example-mapcontains}

함수 [mapContains](/sql-reference/functions/tuple-map-functions#mapcontains) (별칭 `mapContainsKey`)는 맵의 키에서 단일 토큰과 일치합니다.

예시:

```sql
SELECT count() FROM tab WHERE mapContainsKey(map, 'clickhouse');
-- OR
SELECT count() FROM tab WHERE mapContains(map, 'clickhouse');
```

#### `operator[]` {#functions-example-access-operator}

접근 [operator[]](/sql-reference/operators#access-operators) 는 텍스트 인덱스와 함께 사용하여 키 및 값을 필터링할 수 있습니다.

예시:

```sql
SELECT count() FROM tab WHERE map['engine'] = 'clickhouse';
```

다음 예시를 참조하여 텍스트 인덱스와 함께 사용한 `Array(T)` 및 `Map(K, V)` 유형의 컬럼을 사용하십시오.

### `Array` 및 `Map` 컬럼에 대한 텍스트 인덱스 예시 {#text-index-array-and-map-examples}

#### Array(String) 컬럼 인덱싱 {#text-index-example-array}

블로깅 플랫폼을 상상해 보세요. 작성자들은 키워드를 사용하여 블로그 게시물을 분류합니다. 사용자가 주제를 검색하거나 클릭하여 관련 콘텐츠를 발견할 수 있기를 원합니다.

이 테이블 정의를 고려하십시오:

```sql
CREATE TABLE posts (
    post_id UInt64,
    title String,
    content String,
    keywords Array(String)
)
ENGINE = MergeTree
ORDER BY (post_id);
```

텍스트 인덱스 없이 특정 키워드(e.g. `clickhouse`)가 포함된 게시물을 찾으려면 모든 항목을 스캔해야 합니다:

```sql
SELECT count() FROM posts WHERE has(keywords, 'clickhouse'); -- slow full-table scan - checks every keyword in every post
```

플랫폼이 성장하면서 이 작업은 모든 행의 키워드 배열을 검사해야 하므로 점점 느려집니다. 이 성능 문제를 극복하기 위해 `keywords` 컬럼에 대한 텍스트 인덱스를 정의합니다:

```sql
ALTER TABLE posts ADD INDEX keywords_idx(keywords) TYPE text(tokenizer = splitByNonAlpha);
ALTER TABLE posts MATERIALIZE INDEX keywords_idx; -- Don't forget to rebuild the index for existing data
```

#### Map 컬럼 인덱싱 {#text-index-example-map}

많은 관측 가능성(use cases)에서 로그 메시지는 "구성 요소"로 분할되고 적절한 데이터 유형(예: timestamp에 대한 날짜 시간, 로그 수준에 대한 enum 등)으로 저장됩니다. 메트릭 필드는 키-값 쌍으로 저장하는 것이 가장 좋습니다. 운영팀은 디버깅, 보안 사건 및 모니터링을 위해 로그를 효율적으로 검색할 수 있어야 합니다.

이 로그 테이블을 고려하십시오:

```sql
CREATE TABLE logs (
    id UInt64,
    timestamp DateTime,
    message String,
    attributes Map(String, String)
)
ENGINE = MergeTree
ORDER BY (timestamp);
```

텍스트 인덱스 없이 [Map](/sql-reference/data-types/map.md) 데이터 검색은 전체 테이블 스캔을 요구합니다:

```sql
-- Finds all logs with rate limiting data:
SELECT count() FROM logs WHERE has(mapKeys(attributes), 'rate_limit'); -- slow full-table scan

-- Finds all logs from a specific IP:
SELECT count() FROM logs WHERE has(mapValues(attributes), '192.168.1.1'); -- slow full-table scan
```

로그 볼륨이 증가함에 따라, 이러한 쿼리는 느려집니다.

해결책은 [Map](/sql-reference/data-types/map.md) 키 및 값에 대한 텍스트 인덱스를 만드는 것입니다. 필드 이름 또는 속성 유형별로 로그를 찾을 필요가 있을 때 [mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapkeys)를 사용하여 텍스트 인덱스를 생성하십시오:

```sql
ALTER TABLE logs ADD INDEX attributes_keys_idx mapKeys(attributes) TYPE text(tokenizer = array);
ALTER TABLE posts MATERIALIZE INDEX attributes_keys_idx;
```

속성의 실제 콘텐츠 내에서 검색해야 할 때 [mapValues](/sql-reference/functions/tuple-map-functions.md/#mapvalues)를 사용하여 텍스트 인덱스를 생성하십시오:

```sql
ALTER TABLE logs ADD INDEX attributes_vals_idx mapValues(attributes) TYPE text(tokenizer = array);
ALTER TABLE posts MATERIALIZE INDEX attributes_vals_idx;
```

예시 쿼리:

```sql
-- Find all rate-limited requests:
SELECT * FROM logs WHERE mapContainsKey(attributes, 'rate_limit'); -- fast

-- Finds all logs from a specific IP:
SELECT * FROM logs WHERE has(mapValues(attributes), '192.168.1.1'); -- fast
```

## 구현 {#implementation}

### 인덱스 레이아웃 {#index-layout}

각 텍스트 인덱스는 두 개의(추상) 데이터 구조로 구성됩니다:
- 각 토큰을 게시 목록에 매핑하는 사전과,
- 각 행 번호 집합을 나타내는 게시 목록 집합입니다.

텍스트 인덱스는 스킵 인덱스이므로 이러한 데이터 구조는 인덱스와 가량별로 논리적으로 존재합니다.

인덱스 생성 중, 세 개의 파일이 생성됩니다(파트마다):

**사전 블록 파일 (.dct)**

인덱스 가량의 토큰은 정렬되어 각각 128개의 토큰으로 구성된 사전 블록에 저장됩니다(블록 크기는 매개변수 `dictionary_block_size`에 의해 구성할 수 있음). 사전 블록 파일(.dct)은 부품의 모든 인덱스 가량의 모든 사전 블록으로 구성됩니다.

**인덱스 가량 파일 (.idx)**

인덱스 가량 파일은 각 사전 블록에 대해 블록의 첫 번째 토큰, 사전 블록 파일 내의 상대 오프셋 및 블록 내의 모든 토큰에 대한 블룸 필터를 포함합니다. 이 스파스 인덱스 구조는 ClickHouse의 [스파스 기본 키 인덱스](https://clickhouse.com/docs/guides/best-practices/sparse-primary-indexes)와 유사합니다. 블룸 필터는 검색된 토큰이 사전 블록에 포함되어 있지 않을 경우 조기에 사전 블록을 스킵할 수 있게 해줍니다.

**게시 목록 파일 (.pst)**

모든 토큰에 대한 게시 목록은 게시 목록 파일에 순차적으로 배치됩니다. 빠른 교차 및 합집합 작업을 허용하면서 공간을 절약하기 위해 게시 목록은 [로어링 비트맵](https://roaringbitmap.org/)으로 저장됩니다. 게시 목록의 카디널리티가 16 미만인 경우(매개변수 `max_cardinality_for_embedded_postings`로 구성 가능) 이는 사전으로 포함됩니다.

### 직접 읽기 {#direct-read}

특정 종류의 текст 쿼리는 "직접 읽기"라는 최적화를 통해 속도를 크게 향상시킬 수 있습니다. 보다 구체적으로, 선택 쿼리가 텍스트 열에서 _프로젝션하지_ 않을 경우 최적화를 적용할 수 있습니다.

예시:

```sql
SELECT column_a, column_b, ... -- not: column_with_text_index
FROM [...]
WHERE string_search_function(column_with_text_index)
```

ClickHouse의 직접 읽기 최적화는 텍스트 인덱스를 통해 쿼리에만 답변합니다(즉, 텍스트 인덱스 조회) 기본 텍스트 열에 접근하지 않고도 가능합니다. 텍스트 인덱스 조회는 상대적으로 적은 데이터를 읽으며, 따라서 ClickHouse의 일반 스킵 인덱스보다 훨씬 빠릅니다(후자는 스킵 인덱스 조회 후, 남은 가량을 로드하고 필터하는 과정입니다).

직접 읽기는 두 가지 설정으로 제어됩니다:
- 설정 [query_plan_direct_read_from_text_index](../../../operations/settings/settings#query_plan_direct_read_from_text_index) (기본값: 1)은 일반적으로 직접 읽기가 활성화되어 있는지 여부를 지정합니다.
- 설정 [use_skip_indexes_on_data_read](../../../operations/settings/settings#use_skip_indexes_on_data_read) (기본값: 1)은 직접 읽기의 또 다른 전제 조건입니다. ClickHouse 데이터베이스에서 [호환성](../../../operations/settings/settings#compatibility) < 25.10인 경우, `use_skip_indexes_on_data_read`는 비활성화되므로, 호환성 설정 값을 높이거나 `SET use_skip_indexes_on_data_read = 1`을 명시적으로 수행해야 합니다.

또한 직접 읽기를 사용하려면 텍스트 인덱스가 완전히 물리화되어야 합니다(이를 위해서는 `ALTER TABLE ... MATERIALIZE INDEX` 사용).

**지원되는 함수**
직접 읽기 최적화는 함수 `hasToken`, `hasAllTokens`, 및 `hasAnyTokens`를 지원합니다. 이 함수들은 AND, OR 및 NOT 연산자로 결합될 수 있습니다. WHERE 절에는 추가적인 비 텍스트 검색 함수 필터(텍스트 열 또는 다른 열에 대해 포함)도 포함될 수 있으며, 이런 경우에도 직접 읽기 최적화는 여전히 사용되지만 효과는 덜할 수 있습니다(지원되는 텍스트 검색 함수에만 적용됨).

쿼리가 직접 읽기를 활용하는지를 이해하기 위해, 쿼리를 `EXPLAIN PLAN actions = 1`로 실행해 보십시오. 비활성화된 직접 읽기가 포함된 쿼리의 예는:

```sql
EXPLAIN PLAN actions = 1
SELECT count()
FROM tab
WHERE hasToken(col, 'some_token')
SETTINGS query_plan_direct_read_from_text_index = 0;
```

다음과 같은 결과를 반환합니다:

```text
[...]
Filter ((WHERE + Change column names to column identifiers))
Filter column: hasToken(__table1.col, 'some_token'_String) (removed)
Actions: INPUT : 0 -> col String : 0
         COLUMN Const(String) -> 'some_token'_String String : 1
         FUNCTION hasToken(col :: 0, 'some_token'_String :: 1) -> hasToken(__table1.col, 'some_token'_String) UInt8 : 2
[...]
```

동일한 쿼리를 `query_plan_direct_read_from_text_index = 1`로 실행하면

```sql
EXPLAIN PLAN actions = 1
SELECT count()
FROM tab
WHERE hasToken(col, 'some_token')
SETTINGS query_plan_direct_read_from_text_index = 1;
```

다음과 같은 결과를 반환합니다:

```text
[...]
Expression (Before GROUP BY)
Positions:
  Filter
  Filter column: __text_index_idx_hasToken_94cc2a813036b453d84b6fb344a63ad3 (removed)
  Actions: INPUT :: 0 -> __text_index_idx_hasToken_94cc2a813036b453d84b6fb344a63ad3 UInt8 : 0
[...]
```

두 번째 EXPLAIN PLAN 출력은 가상 열 `__text_index_<index_name>_<function_name>_<id>`를 포함합니다. 이 열이 존재한다면 직접 읽기가 사용됩니다.

## 예시: Hackernews 데이터세트 {#hacker-news-dataset}

텍스트 인덱스의 성능 개선을 대량의 텍스트 데이터셋에서 살펴보겠습니다. 우리는 인기 있는 Hacker News 웹사이트에 대한 28.7M 개의 댓글을 사용할 것입니다. 텍스트 인덱스가 없는 테이블은 다음과 같습니다:

```sql
CREATE TABLE hackernews (
    id UInt64,
    deleted UInt8,
    type String,
    author String,
    timestamp DateTime,
    comment String,
    dead UInt8,
    parent UInt64,
    poll UInt64,
    children Array(UInt32),
    url String,
    score UInt32,
    title String,
    parts Array(UInt32),
    descendants UInt32
)
ENGINE = MergeTree
ORDER BY (type, author);
```

28.7M 개의 행이 S3의 Parquet 파일에 있습니다 - 이를 `hackernews` 테이블에 삽입할 것입니다:

```sql
INSERT INTO hackernews
    SELECT * FROM s3Cluster(
        'default',
        'https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.parquet',
        'Parquet',
        '
    id UInt64,
    deleted UInt8,
    type String,
    by String,
    time DateTime,
    text String,
    dead UInt8,
    parent UInt64,
    poll UInt64,
    kids Array(UInt32),
    url String,
    score UInt32,
    title String,
    parts Array(UInt32),
    descendants UInt32');
```

`ALTER TABLE`을 사용하여 댓글 컬럼에 텍스트 인덱스를 추가하고 이를 물리화해 보겠습니다:

```sql
-- Add the index
ALTER TABLE hackernews ADD INDEX comment_idx(comment) TYPE text(tokenizer = splitByNonAlpha);

-- Materialize the index for existing data
ALTER TABLE hackernews MATERIALIZE INDEX comment_idx SETTINGS mutations_sync = 2;
```

이제 `hasToken`, `hasAnyTokens`, 및 `hasAllTokens` 함수를 사용한 쿼리를 실행해 보겠습니다. 다음 예제는 표준 인덱스 스캔과 직접 읽기 최적화 간의 극적인 성능 차이를 보여줄 것입니다.

### 1. `hasToken` 사용하기 {#using-hasToken}

`hasToken`은 텍스트가 특정 단일 토큰을 포함하는지 확인합니다. 대소문자를 구분하여 토큰 'ClickHouse'를 검색할 것입니다.

**직접 읽기 비활성화(표준 스캔)**
기본적으로 ClickHouse는 스킵 인덱스를 사용하여 가량을 필터링한 후, 해당 가량의 열 데이터를 읽습니다. 직접 읽기를 비활성화하여 이 동작을 시뮬레이션할 수 있습니다.

```sql
SELECT count()
FROM hackernews
WHERE hasToken(comment, 'ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 0, use_skip_indexes_on_data_read = 0;

┌─count()─┐
│     516 │
└─────────┘

1 row in set. Elapsed: 0.362 sec. Processed 24.90 million rows, 9.51 GB
```

**직접 읽기 활성화(빠른 인덱스 읽기)**
이제 직접 읽기를 활성화한 동일한 쿼리를 실행합니다(기본값).

```sql
SELECT count()
FROM hackernews
WHERE hasToken(comment, 'ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 1, use_skip_indexes_on_data_read = 1;

┌─count()─┐
│     516 │
└─────────┘

1 row in set. Elapsed: 0.008 sec. Processed 3.15 million rows, 3.15 MB
```
직접 읽기 쿼리는 45배 이상 빠릅니다(0.362초 vs 0.008초) 및 인덱스에서만 읽으면서 훨씬 적은 데이터(9.51 GB vs 3.15 MB)를 처리합니다.

### 2. `hasAnyTokens` 사용하기 {#using-hasAnyTokens}

`hasAnyTokens`는 텍스트가 주어진 토큰 중 하나를 포함하는지 확인합니다. 'love' 또는 'ClickHouse'가 포함된 댓글을 검색할 것입니다.

**직접 읽기 비활성화(표준 스캔)**

```sql
SELECT count()
FROM hackernews
WHERE hasAnyTokens(comment, 'love ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 0, use_skip_indexes_on_data_read = 0;

┌─count()─┐
│  408426 │
└─────────┘

1 row in set. Elapsed: 1.329 sec. Processed 28.74 million rows, 9.72 GB
```

**직접 읽기 활성화(빠른 인덱스 읽기)**

```sql
SELECT count()
FROM hackernews
WHERE hasAnyTokens(comment, 'love ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 1, use_skip_indexes_on_data_read = 1;

┌─count()─┐
│  408426 │
└─────────┘

1 row in set. Elapsed: 0.015 sec. Processed 27.99 million rows, 27.99 MB
```
이 일반적인 "OR" 검색에 대해 속도 향상은 더욱 극적입니다. 이 쿼리는 전체 열 스캔을 피하여 거의 89배 빠릅니다(1.329초 vs 0.015초).

### 3. `hasAllTokens` 사용하기 {#using-hasAllTokens}

`hasAllTokens`는 텍스트가 주어진 모든 토큰을 포함하는지 확인합니다. 'love'와 'ClickHouse'가 모두 포함된 댓글을 검색할 것입니다.

**직접 읽기 비활성화(표준 스캔)**
직접 읽기가 비활성화되어 있는 경우에도 표준 스킵 인덱스는 여전히 효과적입니다. 28.7M개의 행 중 147.46K 행으로 필터링하나, 여전히 57.03 MB의 데이터를 열에서 읽어야 합니다.

```sql
SELECT count()
FROM hackernews
WHERE hasAllTokens(comment, 'love ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 0, use_skip_indexes_on_data_read = 0;

┌─count()─┐
│      11 │
└─────────┘

1 row in set. Elapsed: 0.184 sec. Processed 147.46 thousand rows, 57.03 MB
```

**직접 읽기 활성화(빠른 인덱스 읽기)**
직접 읽기는 인덱스 데이터를 처리하여 단지 147.46 KB만 읽으면서 쿼리에 답변합니다.

```sql
SELECT count()
FROM hackernews
WHERE hasAllTokens(comment, 'love ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 1, use_skip_indexes_on_data_read = 1;

┌─count()─┐
│      11 │
└─────────┘

1 row in set. Elapsed: 0.007 sec. Processed 147.46 thousand rows, 147.46 KB
```

이 "AND" 검색의 경우, 직접 읽기 최적화는 표준 스킵 인덱스 스캔보다 26배 이상 빠릅니다(0.184초 vs 0.007초).

### 4. 복합 검색: OR, AND, NOT, ... {#compound-search}
직접 읽기 최적화는 복합 불리언 표현식에도 적용됩니다. 여기서는 'ClickHouse' 또는 'clickhouse'에 대한 대소문자 구별 없는 검색을 수행할 것입니다.

**직접 읽기 비활성화(표준 스캔)**

```sql
SELECT count()
FROM hackernews
WHERE hasToken(comment, 'ClickHouse') OR hasToken(comment, 'clickhouse')
SETTINGS query_plan_direct_read_from_text_index = 0, use_skip_indexes_on_data_read = 0;

┌─count()─┐
│     769 │
└─────────┘

1 row in set. Elapsed: 0.450 sec. Processed 25.87 million rows, 9.58 GB
```

**직접 읽기 활성화(빠른 인덱스 읽기)**

```sql
SELECT count()
FROM hackernews
WHERE hasToken(comment, 'ClickHouse') OR hasToken(comment, 'clickhouse')
SETTINGS query_plan_direct_read_from_text_index = 1, use_skip_indexes_on_data_read = 1;

┌─count()─┐
│     769 │
└─────────┘

1 row in set. Elapsed: 0.013 sec. Processed 25.87 million rows, 51.73 MB
```

인덱스의 결과를 결합함으로써, 직접 읽기 쿼리는 34배 더 빠릅니다(0.450초 vs 0.013초) 및 9.58 GB의 열 데이터를 읽지 않습니다. 이 특정 경우, `hasAnyTokens(comment, ['ClickHouse', 'clickhouse'])`가 더 효율적인 구문이 될 것입니다.

## 텍스트 인덱스 조정 {#tuning-the-text-index}

현재, I/O를 줄이기 위해 텍스트 인덱스의 역직렬화된 사전 블록, 헤더 및 게시 목록에 대한 캐시가 존재합니다.

이들은 각각의 설정을 통해 활성화할 수 있습니다: [use_text_index_dictionary_cache](/operations/settings/settings#use_text_index_dictionary_cache), [use_text_index_header_cache](/operations/settings/settings#use_text_index_header_cache), [use_text_index_postings_cache](/operations/settings/settings#use_text_index_postings_cache). 기본적으로 이들은 비활성화되어 있습니다.

캐시를 구성하는 다음 서버 설정을 참고하십시오.

### 서버 설정 {#text-index-tuning-server-settings}

#### 사전 블록 캐시 설정 {#text-index-tuning-dictionary-blocks-cache}

| 설정                                                                                                                                               | 설명                                                                                                           | 기본값      |
|-----------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|--------------|
| [text_index_dictionary_block_cache_policy](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_policy)           | 텍스트 인덱스 사전 블록 캐시 정책 이름입니다.                                                                   | `SLRU`       |
| [text_index_dictionary_block_cache_size](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_size)               | 최대 캐시 크기(바이트 단위)입니다.                                                                               | `1073741824` |
| [text_index_dictionary_block_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_max_entries) | 캐시에 있는 역직렬화된 사전 블록의 최대 수입니다.                                                               | `1'000'000`  |
| [text_index_dictionary_block_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_size_ratio)  | 텍스트 인덱스 사전 블록 캐시의 보호 큐 크기입니다(캐시의 전체 크기에 대한 비율).                                    | `0.5`        |

#### 헤더 캐시 설정 {#text-index-tuning-header-cache}

| 설정                                                                                                                                              | 설명                                                                                                             | 기본값      |
|---------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------|--------------|
| [text_index_header_cache_policy](/operations/server-configuration-parameters/settings#text_index_header_cache_policy)                           | 텍스트 인덱스 헤더 캐시 정책 이름입니다.                                                                        | `SLRU`       |
| [text_index_header_cache_size](/operations/server-configuration-parameters/settings#text_index_header_cache_size)                               | 최대 캐시 크기(바이트 단위)입니다.                                                                               | `1073741824` |
| [text_index_header_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_header_cache_max_entries)                 | 캐시에 있는 역직렬화된 헤더의 최대 수입니다.                                                                   | `100'000`    |
| [text_index_header_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_header_cache_size_ratio)                   | 텍스트 인덱스 헤더 캐시의 보호 큐 크기입니다(캐시의 전체 크기에 대한 비율).                                       | `0.5`        |

#### 게시 목록 캐시 설정 {#text-index-tuning-posting-lists-cache}

| 설정                                                                                                                                             | 설명                                                                                                             | 기본값      |
|---------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------|--------------|
| [text_index_postings_cache_policy](/operations/server-configuration-parameters/settings#text_index_postings_cache_policy)                         | 텍스트 인덱스 게시 목록 캐시 정책 이름입니다.                                                                      | `SLRU`       |
| [text_index_postings_cache_size](/operations/server-configuration-parameters/settings#text_index_postings_cache_size)                             | 최대 캐시 크기(바이트 단위)입니다.                                                                               | `2147483648` |
| [text_index_postings_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_postings_cache_max_entries)               | 캐시에 있는 역직렬화된 게시물의 최대 수입니다.                                                                   | `1'000'000`  |
| [text_index_postings_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_postings_cache_size_ratio)               | 텍스트 인덱스 게시 목록 캐시의 보호 큐 크기입니다(캐시의 전체 크기에 대한 비율).                                   | `0.5`        |

## 관련 콘텐츠 {#related-content}

- 블로그: [ClickHouse에서 역 인덱스 소개](https://clickhouse.com/blog/clickhouse-search-with-inverted-indices)
- 블로그: [ClickHouse 전체 텍스트 검색 내부: 빠른, 기본 및 컬럼형](https://clickhouse.com/blog/clickhouse-full-text-search)
- 비디오: [전체 텍스트 인덱스: 디자인 및 실험](https://www.youtube.com/watch?v=O_MnyUkrIq8)
