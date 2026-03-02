---
sidebar_label: '분석 팁'
sidebar_position: 4
slug: /integrations/tableau/analysis-tips
keywords: ['clickhouse', 'tableau', 'online', 'mysql', 'connect', 'integrate', 'ui']
description: 'Tableau에서 ClickHouse 공식 커넥터를 사용할 때 유용한 분석 팁.'
title: '분석 팁'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
---

# 분석 팁 \{#analysis-tips\}

## MEDIAN() 및 PERCENTILE() 함수 \{#median-and-percentile-functions\}

- Live 모드에서 MEDIAN() 및 PERCENTILE() 함수(커넥터 v0.1.3 릴리스부터)는 [ClickHouse quantile()() 함수](/sql-reference/aggregate-functions/reference/quantile/)를 사용하여 계산 속도를 크게 높이지만, 샘플링을 사용합니다. 정확한 계산 결과가 필요하면 [quantileExact()()](/sql-reference/aggregate-functions/reference/quantileexact/)를 기반으로 하는 `MEDIAN_EXACT()` 및 `PERCENTILE_EXACT()` 함수를 사용하십시오.
- Extract 모드에서는 MEDIAN() 및 PERCENTILE() 함수가 항상 정확하게 동작하므로(속도가 느립니다), MEDIAN_EXACT() 및 PERCENTILE_EXACT()를 사용할 수 없습니다.

## Live 모드에서 계산된 필드에 사용할 추가 함수 \{#additional-functions-for-calculated-fields-in-live-mode\}

ClickHouse에는 데이터 분석에 사용할 수 있는 함수가 매우 많이 있으며, Tableau에서 지원하는 것보다 훨씬 많습니다. 사용 편의를 위해 Live 모드에서 계산된 필드를 생성할 때 사용할 수 있는 새로운 함수를 추가했습니다. 안타깝게도 Tableau 인터페이스에서는 이러한 함수에 대한 설명을 추가할 수 없으므로, 이 문서에서 각 함수에 대한 설명을 제공합니다.

* **[`-If` Aggregation Combinator](/sql-reference/aggregate-functions/combinators/#-if)** *(v0.2.3에서 추가됨)* - 집계 계산에서 바로 행 수준 필터(row-level filter)를 사용할 수 있도록 해줍니다. `SUM_IF(), AVG_IF(), COUNT_IF(), MIN_IF() & MAX_IF()` 함수가 추가되었습니다.
* **`BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int])`** *(v0.2.1에서 추가됨)* — 지루한 막대 차트는 잊으십시오! 대신 `BAR()` 함수를 사용하십시오(ClickHouse의 [`bar()`](/sql-reference/functions/other-functions#bar)와 동일합니다). 예를 들어, 다음 계산 필드는 String으로 보기 좋은 막대를 반환합니다:
  ```text
  BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int]) + "  " + FORMAT_READABLE_QUANTITY([my_int])
  ```
  ```text
  == BAR() ==
  ██████████████████▊  327.06 million
  █████  88.02 million
  ███████████████  259.37 million
  ```
* **`COUNTD_UNIQ([my_field])`** *(v0.2.0에서 추가됨)* — 인수의 서로 다른 값들의 개수를 근사적으로 계산합니다. [uniq()](/sql-reference/aggregate-functions/reference/uniq/)와 동일한 기능을 수행합니다. `COUNTD()`보다 훨씬 빠릅니다.
* **`DATE_BIN('day', 10, [my_datetime_or_date])`** *(v0.2.1에서 추가됨)* — ClickHouse의 [`toStartOfInterval()`](/sql-reference/functions/date-time-functions#toStartOfInterval)과 동일합니다. Date 또는 Date 및 Time 값을 지정된 구간으로 내림합니다. 예를 들어:
  ```text
   == my_datetime_or_date == | == DATE_BIN('day', 10, [my_datetime_or_date]) ==
      28.07.2004 06:54:50    |              21.07.2004 00:00:00
      17.07.2004 14:01:56    |              11.07.2004 00:00:00
      14.07.2004 07:43:00    |              11.07.2004 00:00:00
  ```
* **`FORMAT_READABLE_QUANTITY([my_integer])`** *(v0.2.1에서 추가됨)* — 반올림된 숫자에 접미사(천, 백만, 십억 등)를 붙여 문자열로 반환합니다. 사람이 큰 수를 읽을 때 가독성을 높이는 데 유용합니다. [`formatReadableQuantity()`](/sql-reference/functions/other-functions#formatReadableQuantity)와 동일한 함수입니다.
* **`FORMAT_READABLE_TIMEDELTA([my_integer_timedelta_sec], [optional_max_unit])`** *(v0.2.1에 추가됨)* — 시간 차이를 초 단위로 입력받습니다. 연, 월, 일, 시, 분, 초 단위로 표현된 시간 차이를 문자열로 반환합니다. `optional_max_unit`는 표시할 최대 단위입니다. 사용 가능한 값: `seconds`, `minutes`, `hours`, `days`, `months`, `years`. [`formatReadableTimeDelta()`](/sql-reference/functions/other-functions/#formatReadableTimeDelta)와 동등한 함수입니다.
* **`GET_SETTING([my_setting_name])`** *(v0.2.1에 추가됨)* — 사용자 지정 설정의 현재 값을 반환합니다. [`getSetting()`](/sql-reference/functions/other-functions#getSetting)과 동일합니다.
* **`HEX([my_string])`** *(v0.2.1에 추가됨)* — 인수의 16진수 표현으로 구성된 문자열을 반환합니다. [`hex()`](/sql-reference/functions/encoding-functions/#hex)와 동일합니다.
* **`KURTOSIS([my_number])`** — 시퀀스의 표본 첨도를 계산합니다. [`kurtSamp()`](/sql-reference/aggregate-functions/reference/kurtsamp)와 동일합니다.
* **`KURTOSISP([my_number])`** — 수열의 첨도(kurtosis)를 계산합니다. [`kurtPop()`](/sql-reference/aggregate-functions/reference/kurtpop)과 동일합니다.
* **`MEDIAN_EXACT([my_number])`** *(v0.1.3에서 추가됨)* — 수치 데이터 시퀀스의 중앙값을 정확하게 계산합니다. [`quantileExact(0.5)(...)`](/sql-reference/aggregate-functions/reference/quantileexact)와 동일합니다.
* **`MOD([my_number_1], [my_number_2])`** — 나눗셈의 나머지를 계산합니다. 인수가 부동소수점 수인 경우 소수 부분을 버려 먼저 정수로 변환합니다. [`modulo()`](/sql-reference/functions/arithmetic-functions/#modulo)와 동일합니다.
* **`PERCENTILE_EXACT([my_number], [level_float])`** *(v0.1.3에서 추가됨)* — 숫자 데이터 시퀀스의 백분위수를 정확하게 계산합니다. 권장 레벨 값 범위는 [0.01, 0.99]입니다. [`quantileExact()()`](/sql-reference/aggregate-functions/reference/quantileexact)와 동일합니다.
* **`PROPER([my_string])`** *(v0.2.5에 추가됨)* - 각 단어의 첫 글자는 대문자로, 나머지 글자는 소문자로 되도록 텍스트 문자열을 변환합니다. 공백 및 문장 부호와 같은 영숫자가 아닌 문자도 구분자로 작동합니다. 예를 들면 다음과 같습니다.
  ```text
  PROPER("PRODUCT name") => "Product Name"
  ```
  ```text
  PROPER("darcy-mae") => "Darcy-Mae"
  ```
* **`RAND()`** *(v0.2.1에 추가됨)* — 정수(`UInt32`) 값을 반환하며, 예를 들어 `3446222955`와 같습니다. [`rand()`](/sql-reference/functions/random-functions/#rand)와 동일합니다.
* **`RANDOM()`** *(v0.2.1에 추가됨)* — 0 이상 1 미만의 float 값을 반환하는 비공식 Tableau [`RANDOM()`](https://kb.tableau.com/articles/issue/random-function-produces-inconsistent-results) FUNCTION입니다.
* **`RAND_CONSTANT([optional_field])`** *(v0.2.1에서 추가됨)* — 무작위 값이 들어 있는 상수 컬럼을 생성합니다. `{RAND()}`를 사용하는 Fixed LOD와 유사하지만 더 빠릅니다. [`randConstant()`](/sql-reference/functions/random-functions/#randConstant)와 동일합니다.
* **`REAL([my_number])`** — 필드를 부동 소수점 수(Float64) 형식으로 캐스팅합니다. 자세한 내용은 [`여기`](/sql-reference/data-types/decimal/#operations-and-result-type)를 참조하십시오.
* **`SHA256([my_string])`** *(v0.2.1에서 추가됨)* — 문자열로부터 SHA-256 해시를 계산하고, 결과 바이트 집합을 문자열(FixedString)로 반환합니다. 예를 들어 `HEX(SHA256([my_string]))`처럼 `HEX()` 함수와 함께 사용하기에 편리합니다. [`SHA256()`](/sql-reference/functions/hash-functions#SHA256) 함수와 동일합니다.
* **`SKEWNESS([my_number])`** — 값 시퀀스의 표본 왜도(sample skewness)를 계산합니다. [`skewSamp()`](/sql-reference/aggregate-functions/reference/skewsamp)과 동일합니다.
* **`SKEWNESSP([my_number])`** — 값 시퀀스의 왜도를 계산합니다. [`skewPop()`](/sql-reference/aggregate-functions/reference/skewpop)과 동일합니다.
* **`TO_TYPE_NAME([field])`** *(v0.2.1에서 추가됨)* — 전달된 인자의 ClickHouse 타입 이름을 나타내는 문자열을 반환합니다. [`toTypeName()`](/sql-reference/functions/other-functions#toTypeName)와 동일합니다.
* **`TRUNC([my_float])`** — `FLOOR([my_float])` FUNCTION과 동일합니다. [`trunc()`](/sql-reference/functions/rounding-functions#trunc)과 같습니다.
* **`UNHEX([my_string])`** *(v0.2.1에서 추가됨)* — `HEX()`의 역연산을 수행합니다. [`unhex()`](/sql-reference/functions/encoding-functions#unhex)와 동일합니다.