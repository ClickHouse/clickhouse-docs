---
description: '텍스트에서 검색어를 빠르게 찾는 방법입니다.'
keywords: ['전문 검색', '텍스트 인덱스', '인덱스', '인덱스']
sidebar_label: '텍스트 인덱스를 활용한 전문 검색'
slug: /engines/table-engines/mergetree-family/textindexes
title: '텍스트 인덱스를 활용한 전문 검색'
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';


# 텍스트 인덱스를 사용한 전체 텍스트 검색 \{#full-text-search-with-text-indexes\}

<BetaBadge />

텍스트 인덱스(또는 [inverted index](https://en.wikipedia.org/wiki/Inverted_index))는 텍스트 데이터에 대해 빠른 전체 텍스트 검색을 가능하게 합니다.
텍스트 인덱스는 토큰에서 각 토큰을 포함하는 행 번호로의 매핑을 저장합니다.
토큰은 토큰화(tokenization)라고 불리는 과정에 의해 생성됩니다.
예를 들어, ClickHouse의 기본 토크나이저는 영어 문장 &quot;The cat likes mice.&quot;를 토큰 [&quot;The&quot;, &quot;cat&quot;, &quot;likes&quot;, &quot;mice&quot;]로 변환합니다.

예를 들어, 하나의 컬럼과 세 개의 행만 있는 테이블을 가정합니다.

```result
1: The cat likes mice.
2: Mice are afraid of dogs.
3: I have two dogs and a cat.
```

해당 토큰은 다음과 같습니다:

```result
1: The, cat, likes, mice
2: Mice, are, afraid, of, dogs
3: I, have, two, dogs, and, a, cat
```

일반적으로 검색 시 대소문자를 구분하지 않으므로 토큰을 소문자로 변환합니다:

```result
1: the, cat, likes, mice
2: mice, are, afraid, of, dogs
3: i, have, two, dogs, and, a, cat
```

또한 거의 모든 행에 나타나는 &quot;I&quot;, &quot;the&quot;, &quot;and&quot;와 같은 불용어도 제거합니다.

```result
1: cat, likes, mice
2: mice, afraid, dogs
3: have, two, dogs, cat
```

개념적으로 보면 텍스트 인덱스에는 다음과 같은 정보가 포함됩니다.

```result
afraid : [2]
cat    : [1, 3]
dogs   : [2, 3]
have   : [3]
likes  : [1]
mice   : [1]
two    : [3]
```

검색 토큰이 주어지면 이 인덱스 구조를 통해 모든 일치하는 행을 빠르게 찾을 수 있습니다.


## 텍스트 인덱스 생성 \{#creating-a-text-index\}

텍스트 인덱스는 ClickHouse 26.2 버전 이상에서 일반 공급(GA) 상태입니다.
이러한 버전에서는 텍스트 인덱스를 사용하기 위해 별도의 설정을 구성할 필요가 없습니다.
프로덕션 사용 사례에서는 ClickHouse 26.2 이상 버전 사용을 강력히 권장합니다.

:::note
ClickHouse 26.2보다 이전 버전에서 업그레이드했거나(또는 ClickHouse Cloud와 같이 업그레이드된 경우), [compatibility](../../../operations/settings/settings#compatibility) 설정이 존재하면 인덱스가 비활성화되거나 텍스트 인덱스 관련 성능 최적화가 비활성화될 수 있습니다.

If query

```sql
SELECT value FROM system.settings WHERE name = 'compatibility';
```

반환합니다

```text
25.4
```

또는 26.2보다 작은 값을 사용하는 경우 텍스트 인덱스를 사용하려면 추가로 세 가지 설정을 지정해야 합니다:

```sql
SET enable_full_text_index = true;
SET query_plan_direct_read_from_text_index = true;
SET use_skip_indexes_on_data_read = true;
```

또는 [compatibility](../../../operations/settings/settings#compatibility) 설정을 `26.2` 이상으로 올릴 수 있지만, 이 경우 많은 설정에 영향을 주므로 일반적으로 사전 테스트가 필요합니다.
:::

텍스트 인덱스는 다음 구문을 사용하여 [String](/sql-reference/data-types/string.md), [FixedString](/sql-reference/data-types/fixedstring.md), [Array(String)](/sql-reference/data-types/array.md), [Array(FixedString)](/sql-reference/data-types/array.md), 그리고 [Map](/sql-reference/data-types/map.md) 컬럼( [mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapKeys) 및 [mapValues](/sql-reference/functions/tuple-map-functions.md/#mapValues) 맵 함수 사용)을 대상으로 정의할 수 있습니다:

```sql
CREATE TABLE table
(
    key UInt64,
    str String,
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
                                [, posting_list_block_size = C]
                                [, posting_list_codec = 'none' | 'bitpacking' ]
                            )
)
ENGINE = MergeTree
ORDER BY key
```

또는 기존 테이블에 텍스트 인덱스를 추가하려면 다음과 같이 합니다.

```sql
ALTER TABLE table
    ADD INDEX text_idx(str) TYPE text(
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
                                [, posting_list_block_size = C]
                                [, posting_list_codec = 'none' | 'bitpacking' ]
                            )

```

이미 존재하는 테이블에 인덱스를 추가하는 경우, 기존 테이블 파트에 대해 인덱스를 구체화(materialize)하는 것이 좋습니다. 그렇지 않으면 인덱스가 없는 파트에 대한 검색은 대신 느린 전수 검색(brute-force scan)으로 처리됩니다.

```sql
ALTER TABLE table MATERIALIZE INDEX text_idx SETTINGS mutations_sync = 2;
```

텍스트 인덱스를 제거하려면 다음 명령을 실행하십시오

```sql
ALTER TABLE table DROP INDEX text_idx;
```

**Tokenizer 인수(필수)**. `tokenizer` 인수는 사용할 tokenizer를 지정합니다:


* `splitByNonAlpha`는 영문자와 숫자가 아닌 ASCII 문자를 기준으로 문자열을 분리합니다(함수 [splitByNonAlpha](/sql-reference/functions/splitting-merging-functions.md/#splitByNonAlpha) 참조).
* `splitByString(S)`는 사용자 정의 구분자 문자열 `S`를 기준으로 문자열을 분리합니다(함수 [splitByString](/sql-reference/functions/splitting-merging-functions.md/#splitByString) 참조).
  구분자는 선택적 매개변수를 사용하여 지정할 수 있으며, 예를 들어 `tokenizer = splitByString([', ', '; ', '\n', '\\'])`와 같이 설정합니다.
  각 문자열은 여러 문자로 구성될 수 있습니다(예시의 `', '` 등).
  구분자를 명시적으로 지정하지 않으면(예: `tokenizer = splitByString`) 기본 구분자 목록은 공백 한 개 `[' ']`입니다.
* `ngrams(N)`는 문자열을 동일한 크기의 `N`-그램으로 분리합니다(함수 [ngrams](/sql-reference/functions/splitting-merging-functions.md/#ngrams) 참조).
  n그램 길이는 1에서 8 사이의 정수 선택적 매개변수를 사용하여 지정할 수 있으며, 예를 들어 `tokenizer = ngrams(3)`와 같이 설정합니다.
  n그램 크기를 명시적으로 지정하지 않으면(예: `tokenizer = ngrams`) 기본값은 3입니다.
* `sparseGrams(min_length, max_length, min_cutoff_length)`는 길이가 최소 `min_length`, 최대 `max_length`(포함)인 가변 길이 n그램으로 문자열을 분리합니다(함수 [sparseGrams](/sql-reference/functions/string-functions#sparseGrams) 참조).
  명시적으로 지정하지 않으면 `min_length`와 `max_length`의 기본값은 각각 3과 100입니다.
  매개변수 `min_cutoff_length`가 제공되면, 길이가 `min_cutoff_length` 이상인 n그램만 반환됩니다.
  `ngrams(N)`과 비교하면, `sparseGrams` 토크나이저는 가변 길이 N-그램을 생성하여 원본 텍스트를 더 유연하게 표현할 수 있습니다.
  예를 들어, `tokenizer = sparseGrams(3, 5, 4)`는 내부적으로 입력 문자열에서 3-, 4-, 5-그램을 생성하지만, 4-그램과 5-그램만 반환합니다.
* `array`는 토큰화를 수행하지 않으며, 각 행 값이 하나의 토큰이 됩니다(함수 [array](/sql-reference/functions/array-functions.md/#array) 참조).

사용 가능한 모든 토크나이저는 [system.tokenizers](../../../operations/system-tables/tokenizers.md)에 나열되어 있습니다.

:::note
`splitByString` 토크나이저는 왼쪽에서 오른쪽 방향으로 분리 구분자를 적용합니다.
이로 인해 모호한 결과가 발생할 수 있습니다.
예를 들어, 구분자 문자열이 `['%21', '%']`이면 `%21abc`는 `['abc']`로 토큰화되지만, 두 구분자 문자열의 순서를 바꾸어 `['%', '%21']`로 설정하면 출력은 `['21abc']`가 됩니다.
대부분의 경우 더 긴 구분자가 먼저 매칭되기를 원하게 됩니다.
이를 위해 일반적으로 구분자 문자열을 길이가 긴 순서대로 전달하면 됩니다.
구분자 문자열들이 [prefix code](https://en.wikipedia.org/wiki/Prefix_code)를 형성하는 경우에는 임의의 순서로 전달해도 됩니다.
:::

토크나이저가 입력 문자열을 어떻게 분리하는지 이해하려면 [tokens](/sql-reference/functions/splitting-merging-functions.md/#tokens) 함수를 사용할 수 있습니다:

예시:

```sql
SELECT tokens('abc def', 'ngrams', 3);
```

결과:

```result
['abc','bc ','c d',' de','def']
```

*비-ASCII 입력 처리.*

텍스트 인덱스는 원칙적으로 어떤 언어와 문자 집합의 텍스트 데이터에도 구축할 수 있지만, 현재로서는 확장 ASCII 문자 집합(예: 서구권 언어) 입력에만 사용하는 것을 권장합니다.
특히 중국어, 일본어, 한국어는 현재 포괄적인 인덱싱 지원이 부족하여, 인덱스 크기가 매우 커지고 쿼리 시간이 길어질 수 있습니다.
향후 이러한 경우를 더 잘 처리할 수 있도록, 언어별 특화 tokenizer를 추가할 계획입니다.
:::

**Preprocessor 인자(선택 사항)**. preprocessor는 토큰화 전에 입력 문자열에 적용되는 표현식을 의미합니다.

Preprocessor 인자의 대표적인 사용 사례는 다음과 같습니다.


1. 대소문자를 구분하지 않는 매칭을 위한 소문자/대문자 변환(예: [lower](/sql-reference/functions/string-functions.md/#lower), [lowerUTF8](/sql-reference/functions/string-functions.md/#lowerUTF8), 아래 첫 번째 예제 참고).
2. UTF-8 정규화(예: [normalizeUTF8NFC](/sql-reference/functions/string-functions.md/#normalizeUTF8NFC), [normalizeUTF8NFD](/sql-reference/functions/string-functions.md/#normalizeUTF8NFD), [normalizeUTF8NFKC](/sql-reference/functions/string-functions.md/#normalizeUTF8NFKC), [normalizeUTF8NFKD](/sql-reference/functions/string-functions.md/#normalizeUTF8NFKD), [toValidUTF8](/sql-reference/functions/string-functions.md/#toValidUTF8)).
3. 불필요한 문자 또는 부분 문자열을 제거하거나 변환(예: [extractTextFromHTML](/sql-reference/functions/string-functions.md/#extractTextFromHTML), [substring](/sql-reference/functions/string-functions.md/#substring), [idnaEncode](/sql-reference/functions/string-functions.md/#idnaEncode), [translate](./sql-reference/functions/string-replace-functions.md/#translate)).

전처리기 표현식은 [String](/sql-reference/data-types/string.md) 또는 [FixedString](/sql-reference/data-types/fixedstring.md) 타입의 입력 값을 동일한 타입의 값으로 변환해야 합니다.

예:

* `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = lower(col))`
* `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = substringIndex(col, '\n', 1))`
* `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = lower(extractTextFromHTML(col))`

또한 전처리기 표현식은 텍스트 인덱스가 정의된 컬럼이나 해당 컬럼을 기반으로 한 표현식만 참조해야 합니다.

예:

* `INDEX idx(lower(col)) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = upper(lower(col)))`
* `INDEX idx(lower(col)) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = concat(lower(col), lower(col)))`
* 허용되지 않음: `INDEX idx(lower(col)) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = concat(col, col))`

비결정적 함수 사용은 허용되지 않습니다.

[hasToken](/sql-reference/functions/string-search-functions.md/#hasToken), [hasAllTokens](/sql-reference/functions/string-search-functions.md/#hasAllTokens), [hasAnyTokens](/sql-reference/functions/string-search-functions.md/#hasAnyTokens) 함수는 검색어를 토큰화하기 전에 먼저 전처리기를 사용하여 검색어를 변환합니다.

예를 들어,

```sql
CREATE TABLE table
(
    str String,
    INDEX idx(str) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = lower(str))
)
ENGINE = MergeTree
ORDER BY tuple();

SELECT count() FROM table WHERE hasToken(str, 'Foo');
```

다음과 같습니다:

```sql
CREATE TABLE table
(
    str String,
    INDEX idx(lower(str)) TYPE text(tokenizer = 'splitByNonAlpha')
)
ENGINE = MergeTree
ORDER BY tuple();

SELECT count() FROM table WHERE hasToken(str, lower('Foo'));
```

전처리기는 [Array(String)](/sql-reference/data-types/array.md) 및 [Array(FixedString)](/sql-reference/data-types/array.md) 컬럼에도 사용할 수 있습니다.
이 경우 전처리기 표현식은 배열 요소를 각각 변환합니다.

예시:

```sql
CREATE TABLE table
(
    arr Array(String),
    INDEX idx arr TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = lower(arr))

    -- This is not legal:
    INDEX idx_illegal arr TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = arraySort(arr))
)
ENGINE = MergeTree
ORDER BY tuple();

SELECT count() FROM tab WHERE hasAllTokens(arr, 'foo');
```

빌드 시 [Map](/sql-reference/data-types/map.md) 타입 컬럼에 대한 텍스트 인덱스에서 전처리기를 정의하려면, 인덱스를
맵의 키 기준으로 생성할지 값 기준으로 생성할지 결정해야 합니다.

예시:

```sql
CREATE TABLE table
(
    map Map(String, String),
    INDEX idx mapKeys(map)  TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = lower(mapKeys(map)))
)
ENGINE = MergeTree
ORDER BY tuple();

SELECT count() FROM tab WHERE hasAllTokens(mapKeys(map), 'foo');
```

**기타 매개변수(선택 사항)**.


<details markdown="1">
  <summary>선택적 고급 파라미터</summary>

  아래 고급 파라미터의 기본값은 거의 모든 상황에서 문제없이 동작합니다.
  변경하지 않는 것을 권장합니다.

  선택적 파라미터 `dictionary_block_size`(기본값: 512)는 딕셔너리 블록의 크기를 행 수 기준으로 지정합니다.

  선택적 파라미터 `dictionary_block_frontcoding_compression`(기본값: 1)는 딕셔너리 블록이 압축 방식으로 프런트 코딩(front coding)을 사용하는지 여부를 지정합니다.

  선택적 파라미터 `posting_list_block_size`(기본값: 1048576)는 posting list 블록의 크기를 행 수 기준으로 지정합니다.

  선택적 파라미터 `posting_list_codec`(기본값: `none`)는 posting list에 사용할 코덱을 지정합니다:

  * `none` - posting list가 추가 압축 없이 저장됩니다.
  * `bitpacking` - [차분(delta) 코딩](https://en.wikipedia.org/wiki/Delta_encoding)을 적용한 뒤, [bit-packing](https://dev.to/madhav_baby_giraffe/bit-packing-the-secret-to-optimizing-data-storage-and-transmission-m70)을 적용합니다(각각 고정 크기 블록 내에서). SELECT 쿼리가 느려지므로 현재는 권장되지 않습니다.
</details>

*인덱스 세분성(Index granularity).*
텍스트 인덱스는 ClickHouse 내부에서 [스킵 인덱스(skip indexes)](/engines/table-engines/mergetree-family/mergetree.md/#skip-index-types)의 한 종류로 구현됩니다.
그러나 다른 스킵 인덱스와 달리, 텍스트 인덱스는 무한 세분성(1억)을 사용합니다.
이는 텍스트 인덱스의 테이블 정의에서 확인할 수 있습니다.

예시:

```sql
CREATE TABLE table(
    k UInt64,
    s String,
    INDEX idx(s) TYPE text(tokenizer = ngrams(2)))
ENGINE = MergeTree()
ORDER BY k;

SHOW CREATE TABLE table;
```

결과:

```result
┌─statement──────────────────────────────────────────────────────────────┐
│ CREATE TABLE default.table                                            ↴│
│↳(                                                                     ↴│
│↳    `k` UInt64,                                                       ↴│
│↳    `s` String,                                                       ↴│
│↳    INDEX idx s TYPE text(tokenizer = ngrams(2)) GRANULARITY 100000000↴│ <-- here
│↳)                                                                     ↴│
│↳ENGINE = MergeTree                                                    ↴│
│↳ORDER BY k                                                            ↴│
│↳SETTINGS index_granularity = 8192                                      │
└────────────────────────────────────────────────────────────────────────┘
```

매우 큰 index granularity를 사용하면 텍스트 인덱스가 파트 전체를 대상으로 생성됩니다.
명시적으로 지정된 index granularity 값은 무시됩니다.


## 텍스트 인덱스 사용하기 \{#using-a-text-index\}

SELECT 쿼리에서 텍스트 인덱스를 사용하는 것은 간단하며, 일반적인 문자열 검색 함수들이 인덱스를 자동으로 활용합니다.
컬럼이나 테이블 파트에 인덱스가 없으면 문자열 검색 함수는 느린 브루트 포스(전체 스캔) 방식으로 검색을 수행합니다.

:::note
텍스트 인덱스를 검색할 때는 `hasAnyTokens` 및 `hasAllTokens` 함수를 사용할 것을 권장하며, 자세한 내용은 [아래](#functions-example-hasanytokens-hasalltokens)를 참고하십시오.
이 함수들은 사용 가능한 모든 토크나이저와 가능한 모든 전처리(preprocessor) 표현식에서 동작합니다.
다른 지원 함수들은 텍스트 인덱스보다 이전에 도입되었기 때문에, 많은 경우 기존 동작을 유지해야 했습니다(예: 전처리 지원 없음).
:::

### 지원되는 함수 \{#functions-support\}

텍스트 함수가 `WHERE` 절 또는 `PREWHERE` 절에서 사용되는 경우 텍스트 인덱스를 사용할 수 있습니다:

```sql
SELECT [...]
FROM [...]
WHERE string_search_function(column_with_text_index)
```


#### `=` 및 `!=` \{#functions-example-equals-notequals\}

`=` ([equals](/sql-reference/functions/comparison-functions.md/#equals)) 및 `!=` ([notEquals](/sql-reference/functions/comparison-functions.md/#notEquals))는 주어진 검색어 전체와 일치합니다.

예시:

```sql
SELECT * from table WHERE str = 'Hello';
```

텍스트 인덱스는 `=` 및 `!=` 연산자를 지원하지만, 같음/같지 않음 조건 검색은 `array` tokenizer를 사용할 때에만 의미가 있습니다 (`array` tokenizer는 인덱스에 전체 행 값을 그대로 저장합니다).


#### `IN` 및 `NOT IN` \{#functions-example-in-notin\}

`IN` ([in](/sql-reference/functions/in-functions)) 및 `NOT IN` ([notIn](/sql-reference/functions/in-functions))은(는) `equals` 및 `notEquals` 함수와 비슷하지만, 모든 검색어와 일치시키거나(`IN`), 어떤 검색어와도 일치시키지 않도록(`NOT IN`) 합니다.

예시:

```sql
SELECT * from table WHERE str IN ('Hello', 'World');
```

`=` 및 `!=`와 동일한 제약이 적용됩니다. 즉, `IN` 및 `NOT IN`은 `array` 토크나이저와 함께 사용하는 경우에만 의미가 있습니다.


#### `LIKE`, `NOT LIKE` 및 `match` \{#functions-example-like-notlike-match\}

:::note
현재 이 함수들은 인덱스 토크나이저가 `splitByNonAlpha`, `ngrams` 또는 `sparseGrams`인 경우에만 필터링에 텍스트 인덱스를 사용합니다.
:::

텍스트 인덱스와 함께 `LIKE`([like](/sql-reference/functions/string-search-functions.md/#like)), `NOT LIKE`([notLike](/sql-reference/functions/string-search-functions.md/#notLike)), 그리고 [match](/sql-reference/functions/string-search-functions.md/#match) 함수를 사용하려면 ClickHouse가 검색어에서 완전한 토큰을 추출할 수 있어야 합니다.
`ngrams` 토크나이저를 사용하는 인덱스의 경우, 와일드카드 사이에 있는 검색 문자열의 길이가 ngram 길이와 같거나 더 길면 이 조건을 충족합니다.

`splitByNonAlpha` 토크나이저를 사용하는 텍스트 인덱스 예:

```sql
SELECT count() FROM table WHERE comment LIKE 'support%';
```

예시에서 `support`는 `support`, `supports`, `supporting` 등과 일치할 수 있습니다.
이러한 종류의 쿼리는 부분 문자열 검색 쿼리이며, 텍스트 인덱스로 성능을 향상시킬 수 없습니다.

LIKE 쿼리에 텍스트 인덱스를 활용하려면 LIKE 패턴을 다음과 같은 방식으로 재작성해야 합니다:

```sql
SELECT count() FROM table WHERE comment LIKE ' support %'; -- or `% support %`
```

`support` 양쪽에 공백을 넣어 두면 해당 용어를 하나의 토큰으로 인식할 수 있습니다.


#### `startsWith` 및 `endsWith` \{#functions-example-startswith-endswith\}

`LIKE`와 유사하게, [startsWith](/sql-reference/functions/string-functions.md/#startsWith) 및 [endsWith](/sql-reference/functions/string-functions.md/#endsWith) 함수는 검색어에서 완전한 토큰을 추출할 수 있는 경우에만 텍스트 인덱스를 사용할 수 있습니다.
`ngrams` tokenizer가 있는 인덱스의 경우, 와일드카드 사이에 있는 검색 문자열의 길이가 ngram 길이와 같거나 더 길어야 합니다.

`splitByNonAlpha` tokenizer를 사용하는 텍스트 인덱스 예시입니다:

```sql
SELECT count() FROM table WHERE startsWith(comment, 'clickhouse support');
```

이 예시에서는 `clickhouse`만 토큰으로 간주됩니다.
`support`는 `support`, `supports`, `supporting` 등과 일치할 수 있으므로 토큰이 아닙니다.

`clickhouse supports`로 시작하는 모든 행을 찾으려면, 검색 패턴의 끝에 공백을 하나 포함하여 지정하십시오:

```sql
startsWith(comment, 'clickhouse supports ')`
```

마찬가지로 `endsWith`도 앞에 공백을 붙여 사용해야 합니다:

```sql
SELECT count() FROM table WHERE endsWith(comment, ' olap engine');
```


#### `hasToken` 및 `hasTokenOrNull` \{#functions-example-hastoken-hastokenornull\}

:::note
함수 `hasToken`은 겉보기에는 사용하기 쉬워 보이지만, 기본 설정이 아닌 tokenizer 및 preprocessor 표현식을 사용할 때 몇 가지 주의해야 할 점이 있습니다.
따라서 `hasAnyTokens` 및 `hasAllTokens` 함수를 대신 사용할 것을 권장합니다.
:::

[hasToken](/sql-reference/functions/string-search-functions.md/#hasToken) 및 [hasTokenOrNull](/sql-reference/functions/string-search-functions.md/#hasTokenOrNull) 함수는 주어진 단일 토큰과의 일치 여부를 검사합니다.

앞에서 언급한 함수들과 달리, 검색어에 대해 토크나이징을 수행하지 않으며, 입력값이 단일 토큰이라고 가정합니다.

예:

```sql
SELECT count() FROM table WHERE hasToken(comment, 'clickhouse');
```


#### `hasAnyTokens` 및 `hasAllTokens` \{#functions-example-hasanytokens-hasalltokens\}

[hasAnyTokens](/sql-reference/functions/string-search-functions.md/#hasAnyTokens) 및 [hasAllTokens](/sql-reference/functions/string-search-functions.md/#hasAllTokens) 함수는 주어진 토큰 중 하나 이상 또는 모두와 일치합니다.

이 두 함수는 검색 토큰을, 인덱스 컬럼에 사용된 것과 동일한 토크나이저로 토큰화될 문자열로 받거나, 이미 처리된 토큰들의 배열로 받을 수 있으며, 배열로 전달된 경우 검색 전에 추가 토큰화를 수행하지 않습니다.
자세한 내용은 함수 문서를 참고하십시오.

예시:

```sql
-- Search tokens passed as string argument
SELECT count() FROM table WHERE hasAnyTokens(comment, 'clickhouse olap');
SELECT count() FROM table WHERE hasAllTokens(comment, 'clickhouse olap');

-- Search tokens passed as Array(String)
SELECT count() FROM table WHERE hasAnyTokens(comment, ['clickhouse', 'olap']);
SELECT count() FROM table WHERE hasAllTokens(comment, ['clickhouse', 'olap']);
```


#### `has` \{#functions-example-has\}

배열 함수 [has](/sql-reference/functions/array-functions#has)는 문자열 배열에 단일 토큰이 포함되어 있는지 확인합니다.

예시:

```sql
SELECT count() FROM table WHERE has(array, 'clickhouse');
```


#### `mapContains` \{#functions-example-mapcontains\}

함수 [mapContains](/sql-reference/functions/tuple-map-functions#mapContainsKey) (`mapContainsKey`의 별칭)은 검색 대상 문자열에서 추출된 토큰을 맵의 키에 대해 일치 여부를 검사합니다.
동작은 `String` 컬럼에서 `equals` 함수를 사용할 때와 유사합니다.
텍스트 인덱스는 `mapKeys(map)` 표현식에 대해 생성된 경우에만 사용됩니다.

예시:

```sql
SELECT count() FROM table WHERE mapContainsKey(map, 'clickhouse');
-- OR
SELECT count() FROM table WHERE mapContains(map, 'clickhouse');
```


#### `mapContainsValue` \{#functions-example-mapcontainsvalue\}

[mapContainsValue](/sql-reference/functions/tuple-map-functions#mapContainsValue) 함수는 검색 문자열에서 추출한 토큰이 맵의 값에 존재하는지 확인합니다.
동작은 `String` 컬럼에 대해 `equals` 함수가 동작하는 방식과 유사합니다.
텍스트 인덱스는 `mapValues(map)` 표현식에 대해 생성된 경우에만 사용됩니다.

예시:

```sql
SELECT count() FROM table WHERE mapContainsValue(map, 'clickhouse');
```


#### `mapContainsKeyLike` 및 `mapContainsValueLike` \{#functions-example-mapcontainslike\}

함수 [mapContainsKeyLike](/sql-reference/functions/tuple-map-functions#mapContainsKeyLike)와 [mapContainsValueLike](/sql-reference/functions/tuple-map-functions#mapContainsValueLike)는 각각 맵의 모든 키 또는 값에 대해 패턴과 일치하는지를 확인합니다.

예:

```sql
SELECT count() FROM table WHERE mapContainsKeyLike(map, '% clickhouse %');
SELECT count() FROM table WHERE mapContainsValueLike(map, '% clickhouse %');
```


#### `operator[]` \{#functions-example-access-operator\}

접근 연산자 [operator[]](/sql-reference/operators#access-operators)는 텍스트 인덱스를 사용하여 키와 값을 필터링할 수 있습니다. 텍스트 인덱스는 `mapKeys(map)` 또는 `mapValues(map)` 표현식, 혹은 둘 모두에 대해 생성된 경우에만 사용됩니다.

예시:

```sql
SELECT count() FROM table WHERE map['engine'] = 'clickhouse';
```

다음 예시는 텍스트 인덱스와 함께 `Array(T)` 및 `Map(K, V)` 타입 컬럼을 사용하는 방법을 보여줍니다.


### `Array` 및 `Map` 컬럼에서 텍스트 인덱스를 사용하는 예제 \{#text-index-array-and-map-examples\}

#### Array(String) 컬럼에 인덱스 생성하기 \{#text-index-example-array\}

블로그 플랫폼이 있다고 가정해 보십시오. 작성자는 키워드를 사용해 블로그 게시물을 분류합니다.
사용자가 주제를 검색하거나 클릭하여 관련 콘텐츠를 발견하도록 하고자 합니다.

다음 테이블 정의를 살펴보겠습니다:

```sql
CREATE TABLE posts
(
    post_id UInt64,
    title String,
    content String,
    keywords Array(String)
)
ENGINE = MergeTree
ORDER BY (post_id);
```

텍스트 인덱스가 없으면 특정 키워드(예: `clickhouse`)가 포함된 게시물을 찾기 위해 모든 레코드를 스캔해야 합니다:

```sql
SELECT count() FROM posts WHERE has(keywords, 'clickhouse'); -- slow full-table scan - checks every keyword in every post
```

플랫폼 규모가 커질수록 쿼리가 모든 행의 `keywords` 배열을 모두 검사해야 하므로 점점 더 느려집니다.
이 성능 문제를 해결하기 위해 `keywords` 컬럼에 대해 텍스트 인덱스를 정의합니다:

```sql
ALTER TABLE posts ADD INDEX keywords_idx(keywords) TYPE text(tokenizer = splitByNonAlpha);
ALTER TABLE posts MATERIALIZE INDEX keywords_idx; -- Don't forget to rebuild the index for existing data
```


#### 맵 컬럼 인덱싱 \{#text-index-example-map\}

많은 관측성 관련 사용 사례에서 로그 메시지는 「구성 요소」로 분리되어, 타임스탬프는 날짜-시간 데이터 타입으로, 로그 레벨은 enum 등으로 적절한 데이터 타입에 따라 저장됩니다.
메트릭 필드는 key-value 쌍으로 저장하는 것이 가장 좋습니다.
운영 팀은 디버깅, 보안 사고, 모니터링을 위해 로그를 효율적으로 검색할 수 있어야 합니다.

다음과 같은 logs 테이블을 살펴보십시오:

```sql
CREATE TABLE logs
(
    id UInt64,
    timestamp DateTime,
    message String,
    attributes Map(String, String)
)
ENGINE = MergeTree
ORDER BY (timestamp);
```

텍스트 인덱스가 없으면 [Map](/sql-reference/data-types/map.md) 데이터에서 검색하려면 테이블 전체를 스캔해야 합니다.

```sql
-- Finds all logs with rate limiting data:
SELECT * FROM logs WHERE has(mapKeys(attributes), 'rate_limit'); -- slow full-table scan

-- Finds all logs from a specific IP:
SELECT * FROM logs WHERE has(mapValues(attributes), '192.168.1.1'); -- slow full-table scan
```

로그 양이 증가할수록 이러한 쿼리는 느려집니다.

해결 방법은 [맵(Map)](/sql-reference/data-types/map.md) 키와 값에 텍스트 인덱스를 생성하는 것입니다.
필드 이름이나 속성 유형으로 로그를 조회해야 하는 경우 [mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapKeys)를 사용하여 텍스트 인덱스를 생성합니다:

```sql
ALTER TABLE logs ADD INDEX attributes_keys_idx mapKeys(attributes) TYPE text(tokenizer = array);
ALTER TABLE posts MATERIALIZE INDEX attributes_keys_idx;
```

속성 값의 실제 내용에서 검색해야 할 때는 [mapValues](/sql-reference/functions/tuple-map-functions.md/#mapValues)를 사용하여 텍스트 인덱스를 생성하십시오:

```sql
ALTER TABLE logs ADD INDEX attributes_vals_idx mapValues(attributes) TYPE text(tokenizer = array);
ALTER TABLE posts MATERIALIZE INDEX attributes_vals_idx;
```

예제 쿼리:

```sql
-- Find all rate-limited requests:
SELECT * FROM logs WHERE mapContainsKey(attributes, 'rate_limit'); -- fast

-- Finds all logs from a specific IP:
SELECT * FROM logs WHERE has(mapValues(attributes), '192.168.1.1'); -- fast

-- Finds all logs where any attribute includes an error:
SELECT * FROM logs WHERE mapContainsValueLike(attributes, '% error %'); -- fast
```


## 성능 튜닝 \{#performance-tuning\}

### 직접 읽기 \{#direct-read\}

일부 유형의 텍스트 쿼리는 &quot;direct read&quot;라고 하는 최적화를 통해 성능이 상당히 향상될 수 있습니다.

예시:

```sql
SELECT column_a, column_b, ...
FROM [...]
WHERE string_search_function(column_with_text_index)
```

직접 읽기 최적화는 기본 텍스트 컬럼에 접근하지 않고 텍스트 인덱스만을 사용하여 쿼리에 응답합니다(즉, 텍스트 인덱스 조회만 수행합니다).
텍스트 인덱스 조회는 상대적으로 적은 데이터를 읽으므로, 일반적인 ClickHouse의 스킵 인덱스(스킵 인덱스를 조회한 뒤 남은 그래뉼을 로드하고 필터링함)보다 훨씬 빠릅니다.

직접 읽기는 두 개의 설정으로 제어됩니다.

* 설정 [query&#95;plan&#95;direct&#95;read&#95;from&#95;text&#95;index](../../../operations/settings/settings#query_plan_direct_read_from_text_index) (기본값은 true) – 직접 읽기를 전반적으로 활성화할지 지정합니다.
* 설정 [use&#95;skip&#95;indexes&#95;on&#95;data&#95;read](../../../operations/settings/settings#use_skip_indexes_on_data_read) – 직접 읽기를 위한 또 다른 전제 조건입니다. ClickHouse 26.1 이상 버전에서는 이 설정이 기본으로 활성화되어 있습니다. 이전 버전에서는 `SET use_skip_indexes_on_data_read = 1` 명령을 명시적으로 실행해야 합니다.

**지원되는 함수**

직접 읽기 최적화는 `hasToken`, `hasAllTokens`, `hasAnyTokens` 함수를 지원합니다.
텍스트 인덱스가 `array` 토크나이저로 정의된 경우, `equals`, `has`, `mapContainsKey`, `mapContainsValue` 함수에도 직접 읽기가 지원됩니다.
이 함수들은 `AND`, `OR`, `NOT` 연산자와 함께 조합하여 사용할 수 있습니다.
`WHERE` 또는 `PREWHERE` 절에는 (텍스트 컬럼 또는 다른 컬럼에 대한) 추가 비텍스트 검색 함수 기반 필터를 포함할 수도 있습니다. 이 경우에도 직접 읽기 최적화는 여전히 사용되지만, 효과는 줄어듭니다(지원되는 텍스트 검색 함수에만 적용되기 때문입니다).

쿼리가 직접 읽기를 활용하는지 확인하려면 `EXPLAIN PLAN actions = 1`을 사용하여 쿼리를 실행하십시오.
예를 들어, 직접 읽기가 비활성화된 쿼리는 다음과 같습니다.

```sql
EXPLAIN PLAN actions = 1
SELECT count()
FROM table
WHERE hasToken(col, 'some_token')
SETTINGS query_plan_direct_read_from_text_index = 0, -- disable direct read
         use_skip_indexes_on_data_read = 1;
```

반환합니다

```text
[...]
Filter ((WHERE + Change column names to column identifiers))
Filter column: hasToken(__table1.col, 'some_token'_String) (removed)
Actions: INPUT : 0 -> col String : 0
         COLUMN Const(String) -> 'some_token'_String String : 1
         FUNCTION hasToken(col :: 0, 'some_token'_String :: 1) -> hasToken(__table1.col, 'some_token'_String) UInt8 : 2
[...]
```

반면 `query_plan_direct_read_from_text_index = 1`로 동일한 쿼리를 실행하면

```sql
EXPLAIN PLAN actions = 1
SELECT count()
FROM table
WHERE hasToken(col, 'some_token')
SETTINGS query_plan_direct_read_from_text_index = 1, -- enable direct read
         use_skip_indexes_on_data_read = 1;
```

반환값

```text
[...]
Expression (Before GROUP BY)
Positions:
  Filter
  Filter column: __text_index_idx_hasToken_94cc2a813036b453d84b6fb344a63ad3 (removed)
  Actions: INPUT :: 0 -> __text_index_idx_hasToken_94cc2a813036b453d84b6fb344a63ad3 UInt8 : 0
[...]
```

두 번째 EXPLAIN PLAN 출력에는 가상 컬럼 `__text_index_<index_name>_<function_name>_<id>`가 포함됩니다.
이 컬럼이 존재하면 direct read가 사용됩니다.

WHERE 절의 필터 조건에 텍스트 검색 함수만 포함되어 있는 경우, 쿼리는 컬럼 데이터를 전혀 읽지 않고도 direct read를 통해 가장 큰 성능 향상을 얻을 수 있습니다.
그러나 쿼리의 다른 부분에서 텍스트 컬럼에 접근하는 경우에도 direct read는 여전히 성능을 개선합니다.

**힌트로서의 direct read**

힌트로서의 direct read는 기본적으로 일반 direct read와 동일한 원리에 기반하지만, 기본이 되는 텍스트 컬럼을 제거하지 않고 텍스트 인덱스 데이터로부터 추가 필터를 생성해 적용한다는 점이 다릅니다.
이는 텍스트 인덱스만 읽어서 처리할 경우 오탐(false positive)이 발생할 수 있는 함수에 사용됩니다.

지원되는 함수는 `like`, `startsWith`, `endsWith`, `equals`, `has`, `mapContainsKey`, `mapContainsValue` 입니다.

이 추가 필터는 다른 필터와 결합되어 결과 집합의 선별성을 더 높여, 다른 컬럼에서 읽어야 하는 데이터 양을 더욱 줄이는 데 도움이 됩니다.

힌트로서의 direct read는 [query&#95;plan&#95;text&#95;index&#95;add&#95;hint](../../../operations/settings/settings#query_plan_text_index_add_hint) 설정(기본값으로 활성화됨)으로 제어합니다.

힌트를 사용하지 않은 쿼리 예시는 다음과 같습니다:


```sql
EXPLAIN actions = 1
SELECT count()
FROM table
WHERE (col LIKE '%some-token%') AND (d >= today())
SETTINGS use_skip_indexes_on_data_read = 1, query_plan_text_index_add_hint = 0
FORMAT TSV
```

반환값

```text
[...]
Prewhere filter column: and(like(__table1.col, \'%some-token%\'_String), greaterOrEquals(__table1.d, _CAST(20440_Date, \'Date\'_String))) (removed)
[...]
```

반면, 동일한 쿼리를 `query_plan_text_index_add_hint = 1`로 설정한 상태에서 실행하면

```sql
EXPLAIN actions = 1
SELECT count()
FROM table
WHERE col LIKE '%some-token%'
SETTINGS use_skip_indexes_on_data_read = 1, query_plan_text_index_add_hint = 1
```

반환값

```text
[...]
Prewhere filter column: and(__text_index_idx_col_like_d306f7c9c95238594618ac23eb7a3f74, like(__table1.col, \'%some-token%\'_String), greaterOrEquals(__table1.d, _CAST(20440_Date, \'Date\'_String))) (removed)
[...]
```

두 번째 EXPLAIN PLAN 출력에서는 필터 조건에 추가적인 조건 항(`__text_index_...`)이 추가된 것을 확인할 수 있습니다.
[PREWHERE](/sql-reference/statements/select/prewhere) 최적화 덕분에 필터 조건은 세 개의 개별 조건 항으로 분해되며, 계산 비용이 낮은 것부터 높은 것 순서대로 적용됩니다.
이 쿼리에서는 `__text_index_...`, 그다음 `greaterOrEquals(...)`, 마지막으로 `like(...)` 순서로 적용됩니다.
이러한 적용 순서 덕분에 텍스트 인덱스와 기존 필터만으로 건너뛸 수 있는 그래뉼보다 더 많은 데이터 그래뉼을, `WHERE` 절 이후 쿼리에서 사용되는 읽기 비용이 큰 컬럼을 읽기 전에 건너뛸 수 있어, 최종적으로 읽어야 하는 데이터 양이 더욱 줄어듭니다.


### 캐싱 \{#caching\}

텍스트 인덱스의 일부를 메모리에 버퍼링하기 위해 다양한 캐시를 사용할 수 있습니다(섹션 [구현 세부 정보](#implementation) 참조).
현재는 I/O를 줄이기 위해 텍스트 인덱스의 역직렬화된 딕셔너리 블록, 헤더 및 포스팅 리스트에 대한 캐시가 제공됩니다.
캐시는 설정 [use_text_index_dictionary_cache](/operations/settings/settings#use_text_index_dictionary_cache), [use_text_index_header_cache](/operations/settings/settings#use_text_index_header_cache), [use_text_index_postings_cache](/operations/settings/settings#use_text_index_postings_cache)를 통해 활성화할 수 있습니다.
기본적으로 모든 캐시는 비활성화되어 있습니다.
캐시를 비우려면 [SYSTEM CLEAR TEXT INDEX CACHES](../../../sql-reference/statements/system#drop-text-index-caches) SQL 문을 사용합니다.

캐시를 구성하려면 다음 서버 설정을 참조하십시오.

#### 딕셔너리 블록 캐시 설정 \{#caching-dictionary\}

| Setting                                                                                                                                                  | 설명                                                                                                            |
|----------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------|
| [text_index_dictionary_block_cache_policy](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_policy)                | 텍스트 인덱스 딕셔너리 블록 캐시 정책 이름입니다.                                                              |
| [text_index_dictionary_block_cache_size](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_size)                    | 캐시의 최대 크기(바이트)입니다.                                                                                |
| [text_index_dictionary_block_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_max_entries)      | 캐시에 저장되는 역직렬화된 딕셔너리 블록의 최대 개수입니다.                                                    |
| [text_index_dictionary_block_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_size_ratio)        | 텍스트 인덱스 딕셔너리 블록 캐시에서 보호 큐의 크기를 캐시 전체 크기에 대해 나타내는 비율입니다.              |

#### 헤더 캐시 설정 \{#caching-header\}

| Setting                                                                                                                              | Description                                                                                          |
|--------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| [text_index_header_cache_policy](/operations/server-configuration-parameters/settings#text_index_header_cache_policy)                | 텍스트 인덱스 헤더 캐시 정책 이름입니다.                                                              |
| [text_index_header_cache_size](/operations/server-configuration-parameters/settings#text_index_header_cache_size)                    | 캐시의 최대 크기(바이트 단위)입니다.                                                                  |
| [text_index_header_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_header_cache_max_entries)      | 캐시에 저장될 수 있는 역직렬화된 헤더의 최대 개수입니다.                                              |
| [text_index_header_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_header_cache_size_ratio)        | 텍스트 인덱스 헤더 캐시에서 보호 큐 크기가 캐시 전체 크기에서 차지하는 비율입니다.                   |

#### Posting lists 캐시 설정 \{#caching-posting-lists\}

| Setting                                                                                                                               | Description                                                                                             |
|---------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| [text_index_postings_cache_policy](/operations/server-configuration-parameters/settings#text_index_postings_cache_policy)             | 텍스트 인덱스 postings 캐시 정책의 이름입니다.                                                           |
| [text_index_postings_cache_size](/operations/server-configuration-parameters/settings#text_index_postings_cache_size)                 | 캐시의 최대 크기(바이트 단위)입니다.                                                                    |
| [text_index_postings_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_postings_cache_max_entries)   | 캐시에 역직렬화된 postings를 저장할 수 있는 최대 개수입니다.                                            |
| [text_index_postings_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_postings_cache_size_ratio)     | 텍스트 인덱스 postings 캐시에서 보호 큐의 크기가 캐시 전체 크기에서 차지하는 비율입니다.                |

## 제한 사항 \{#limitations\}

텍스트 인덱스에는 현재 다음과 같은 제한 사항이 있습니다.

- 매우 많은 토큰 수(예: 100억 개 토큰)를 갖는 텍스트 인덱스를 구체화하면 상당한 양의 메모리를 사용할 수 있습니다. 텍스트
  인덱스 구체화는 직접적으로(`ALTER TABLE <table> MATERIALIZE INDEX <index>`) 또는 파트 병합 과정에서 간접적으로 발생할 수 있습니다.
- 4,294,967,296(= 2^32 = 약 42억) 행을 초과하는 파트에서는 텍스트 인덱스를 구체화할 수 없습니다. 텍스트 인덱스가 구체화되지 않은 경우, 쿼리는 해당 파트 내에서 느린 전수 검색(brute-force search)으로 대체되어 실행됩니다. 최악의 경우를 가정하면, 하나의 파트에 String 타입의 단일 컬럼만 존재하고 MergeTree 설정 `max_bytes_to_merge_at_max_space_in_pool`(기본값: 150 GB)이 변경되지 않았다고 가정합니다. 이 경우, 컬럼이 행당 평균 29.5자 미만을 포함하는 경우에 이와 같은 상황이 발생합니다. 실제로는 테이블에 다른 컬럼들도 포함되므로, 임계치는 다른 컬럼의 개수, 타입, 크기에 따라 이보다 몇 배 더 작아집니다.

## 텍스트 인덱스 vs 블룸 필터 기반 인덱스 \{#text-index-vs-bloom-filter-indexes\}

문자열 조건(predicate)은 텍스트 인덱스와 블룸 필터 기반 인덱스(인덱스 타입 `bloom_filter`, `ngrambf_v1`, `tokenbf_v1`, `sparse_grams`)를 사용해 성능을 높일 수 있지만, 두 방식은 설계와 의도된 사용 사례 측면에서 근본적으로 다릅니다.

**블룸 필터 인덱스**

- 오탐(false positive)이 발생할 수 있는 확률적 자료 구조에 기반합니다.
- 집합 포함 여부(set membership)만 판별할 수 있습니다. 즉, 컬럼에 토큰 X가 포함되어 있을 가능성이 있는지, 혹은 X를 절대 포함하지 않는지를 판별합니다.
- 쿼리 실행 중 거친 범위를 건너뛸 수 있도록 그래뉼(granule) 수준 정보를 저장합니다.
- 적절하게 튜닝하기가 어렵습니다(예시는 [여기](mergetree#n-gram-bloom-filter)를 참고하십시오).
- 비교적 compact합니다(파트(part)당 수 킬로바이트에서 수 메가바이트 수준).

**텍스트 인덱스**

- 토큰에 대해 결정론적 역인덱스를 구축합니다. 인덱스 자체에서 오탐이 발생하지 않습니다.
- 텍스트 검색 워크로드에 특화되어 최적화되어 있습니다.
- 효율적인 용어(term) 조회를 위해 행 수준 정보를 저장합니다.
- 비교적 큽니다(파트당 수십에서 수백 메가바이트 수준).

블룸 필터 기반 인덱스는 어디까지나 부수적인 효과로 전체 텍스트 검색(full-text search)을 지원합니다.

- 고급 토크나이제이션과 전처리를 지원하지 않습니다.
- 다중 토큰 검색을 지원하지 않습니다.
- 역인덱스에서 기대하는 성능 특성을 제공하지 않습니다.

반대로 텍스트 인덱스는 전문 검색(full-text search)을 위해 목적에 맞게 설계되었습니다.

- 토크나이제이션과 전처리를 제공합니다.
- `hasAllTokens`, `LIKE`, `match` 및 이와 유사한 텍스트 검색 함수에 대해 효율적으로 동작합니다.
- 대규모 텍스트 코퍼스에서 훨씬 뛰어난 확장성을 제공합니다.

## 구현 세부사항 \{#implementation\}

각 텍스트 인덱스는 두 가지 (추상적인) 데이터 구조로 구성됩니다.

- 각 토큰을 포스팅 리스트에 매핑하는 딕셔너리
- 각각이 행 번호 집합을 나타내는 포스팅 리스트들의 집합

텍스트 인덱스는 전체 파트에 대해 생성됩니다.
다른 스킵 인덱스와 달리, 텍스트 인덱스는 데이터 파트 병합 시 인덱스를 다시 만드는 대신 병합 단계에서 병합할 수 있습니다(아래 참고).

인덱스를 생성할 때 세 개의 파일이 생성됩니다(파트당).

**딕셔너리 블록 파일(.dct)**

텍스트 인덱스의 토큰은 정렬된 뒤, 각각 512개의 토큰으로 구성된 딕셔너리 블록에 저장됩니다(블록 크기는 `dictionary_block_size` 파라미터로 설정할 수 있습니다).
딕셔너리 블록 파일(.dct)은 하나의 파트 안에 있는 모든 인덱스 그래뉼의 모든 딕셔너리 블록으로 구성됩니다.

**인덱스 헤더 파일(.idx)**

인덱스 헤더 파일에는 각 딕셔너리 블록에 대해, 그 블록의 첫 번째 토큰과 딕셔너리 블록 파일 내에서의 상대 오프셋이 저장됩니다.

이러한 희소 인덱스 구조는 ClickHouse의 [희소 기본 키 인덱스](https://clickhouse.com/docs/guides/best-practices/sparse-primary-indexes)와 유사합니다.

**포스팅 리스트 파일(.pst)**

모든 토큰에 대한 포스팅 리스트는 포스팅 리스트 파일에 순차적으로 저장됩니다.
공간을 절약하면서도 빠른 교집합 및 합집합 연산을 가능하게 하기 위해, 포스팅 리스트는 [roaring 비트맵](https://roaringbitmap.org/)으로 저장됩니다.
포스팅 리스트가 `posting_list_block_size`보다 큰 경우, 여러 블록으로 분할되어 포스팅 리스트 파일에 순차적으로 저장됩니다.

**텍스트 인덱스 병합**

데이터 파트가 병합될 때, 텍스트 인덱스는 처음부터 다시 만들 필요가 없으며, 대신 병합 프로세스의 별도 단계에서 효율적으로 병합할 수 있습니다.
이 단계 동안 각 입력 파트의 텍스트 인덱스에 대한 정렬된 딕셔너리를 읽어 새로운 통합 딕셔너리로 결합합니다.
포스팅 리스트의 행 번호 또한 병합된 데이터 파트에서의 새로운 위치를 반영하도록 재계산되며, 이를 위해 초기 병합 단계에서 생성된 기존 행 번호에서 새로운 행 번호로의 매핑을 사용합니다.
텍스트 인덱스를 병합하는 이러한 방법은 `_part_offset` 컬럼이 있는 [프로젝션](/docs/sql-reference/statements/alter/projection#normal-projection-with-part-offset-field)이 병합되는 방식과 유사합니다.
소스 파트에 인덱스가 구체화되어 있지 않은 경우, 인덱스를 먼저 생성해 임시 파일에 기록한 다음, 다른 파트와 다른 임시 인덱스 파일의 인덱스와 함께 병합합니다.

## 예시: Hackernews 데이터셋 \{#hacker-news-dataset\}

텍스트가 많은 대규모 데이터셋에서 text index의 성능 향상 효과를 살펴보겠습니다.
인기 있는 Hacker News 웹사이트의 댓글 2,870만 행을 사용합니다.
다음은 text index가 없는 테이블입니다.

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

2,870만 행은 Parquet 파일로 S3에 저장되어 있습니다. 이제 이를 `hackernews` 테이블에 삽입해 보겠습니다:

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

`ALTER TABLE`을 사용하여 comment 컬럼에 대해 텍스트 인덱스를 추가한 다음, 이를 구체화합니다:

```sql
-- Add the index
ALTER TABLE hackernews ADD INDEX comment_idx(comment) TYPE text(tokenizer = splitByNonAlpha);

-- Materialize the index for existing data
ALTER TABLE hackernews MATERIALIZE INDEX comment_idx SETTINGS mutations_sync = 2;
```

이제 `hasToken`, `hasAnyTokens`, `hasAllTokens` 함수를 사용해 쿼리를 실행해 보겠습니다.
다음 예제들은 일반적인 인덱스 스캔과 직접 읽기 최적화 간의 극적인 성능 차이를 보여줍니다.


### 1. `hasToken` 사용 \{#using-hasToken\}

`hasToken`은 텍스트에 특정 단일 토큰이 포함되어 있는지 확인합니다.
대소문자를 구분하여 토큰 &#39;ClickHouse&#39;를 검색합니다.

**직접 읽기 비활성화 (표준 스캔)**
기본적으로 ClickHouse는 그래뉼을 필터링하기 위해 skip 인덱스(skip index)를 사용한 다음, 해당 그래뉼의 컬럼 데이터를 읽습니다.
직접 읽기를 비활성화하여 이 동작을 동일하게 재현할 수 있습니다.

```sql
SELECT count()
FROM hackernews
WHERE hasToken(comment, 'ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 0;

┌─count()─┐
│     516 │
└─────────┘

1 row in set. Elapsed: 0.362 sec. Processed 24.90 million rows, 9.51 GB
```

**직접 읽기 활성화(Fast index read)**
이제 직접 읽기 기능을 활성화한 상태(기본값)로 동일한 쿼리를 실행합니다.

```sql
SELECT count()
FROM hackernews
WHERE hasToken(comment, 'ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 1;

┌─count()─┐
│     516 │
└─────────┘

1 row in set. Elapsed: 0.008 sec. Processed 3.15 million rows, 3.15 MB
```

직접 읽기 쿼리는 인덱스만 읽어들이므로 처리하는 데이터 양이 크게 줄어들어(9.51 GB vs 3.15 MB), 속도가 45배 이상 더 빠릅니다(0.362초 vs 0.008초).


### 2. `hasAnyTokens` 사용 \{#using-hasAnyTokens\}

`hasAnyTokens`는 텍스트에 주어진 토큰 중 하나 이상이 포함되어 있는지 확인합니다.
&#39;love&#39; 또는 &#39;ClickHouse&#39;를 포함하는 댓글을 검색합니다.

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

**직접 읽기 활성화 (빠른 인덱스 읽기)**

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

이러한 흔한 「OR」 검색에서는 속도 향상이 한층 더 두드러집니다.
전체 컬럼 스캔을 피함으로써 쿼리 실행 속도가 거의 89배(1.329초 대비 0.015초) 빨라집니다.


### 3. `hasAllTokens` 사용하기 \{#using-hasAllTokens\}

`hasAllTokens`는 텍스트에 주어진 토큰이 모두 포함되어 있는지 확인합니다.
&#39;love&#39;와 &#39;ClickHouse&#39;를 모두 포함하는 댓글을 검색합니다.

**Direct read 비활성화 (Standard scan)**
Direct read가 비활성화된 경우에도 표준 skip 인덱스는 여전히 효과적입니다.
28.7M개의 행을 147.46K개 행으로 줄여 주지만, 여전히 해당 컬럼에서 57.03 MB를 읽어야 합니다.

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

**직접 읽기 활성화됨(Fast index read)**
직접 읽기는 인덱스 데이터만을 사용해 동작하므로, 147.46 KB만 읽고 쿼리에 응답합니다.

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

이 「AND」 검색에서는 direct read 최적화가 표준 skip 인덱스 스캔보다 26배 이상 빠르게 동작합니다(0.184초 vs 0.007초).


### 4. 복합 검색: OR, AND, NOT, ... \{#compound-search\}

직접 읽기 최적화는 복합 불리언 표현식에도 적용됩니다.
여기서는 대소문자를 구분하지 않고 &#39;ClickHouse&#39; 또는 &#39;clickhouse&#39;를 검색합니다.

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

인덱스 결과를 결합하면 직접 읽기 쿼리는 34배 더 빨라지며(0.450초 대비 0.013초), 9.58 GB의 컬럼 데이터를 읽지 않아도 됩니다.
이러한 특정 사례에서는 `hasAnyTokens(comment, ['ClickHouse', 'clickhouse'])`를 사용하는 구문이 더 효율적이며 권장됩니다.


## 관련 콘텐츠 \{#related-content\}

- 발표 자료: https://github.com/ClickHouse/clickhouse-presentations/blob/master/2025-tumuchdata-munich/ClickHouse_%20full-text%20search%20-%2011.11.2025%20Munich%20Database%20Meetup.pdf
- 발표 자료: https://presentations.clickhouse.com/2026-fosdem-inverted-index/Inverted_indexes_the_what_the_why_the_how.pdf

**구버전 자료**

- 블로그: [ClickHouse에서 역인덱스(Inverted Indices) 소개](https://clickhouse.com/blog/clickhouse-search-with-inverted-indices)
- 블로그: [ClickHouse 전문 검색(Full-text search) 내부: 빠르고, 네이티브하며, 열 지향](https://clickhouse.com/blog/clickhouse-full-text-search)
- 동영상: [전문 인덱스(Full-Text Indices): 설계 및 실험](https://www.youtube.com/watch?v=O_MnyUkrIq8)