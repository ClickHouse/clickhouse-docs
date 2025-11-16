---
'sidebar_label': '분석 팁'
'sidebar_position': 4
'slug': '/integrations/tableau/analysis-tips'
'keywords':
- 'clickhouse'
- 'tableau'
- 'online'
- 'mysql'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Tableau 분석 팁 ClickHouse 공식 커넥터 사용할 때.'
'title': '분석 팁'
'doc_type': 'guide'
---


# 분석 팁
## MEDIAN() 및 PERCENTILE() 함수 {#median-and-percentile-functions}
- 라이브 모드에서 MEDIAN() 및 PERCENTILE() 함수(커넥터 v0.1.3 출시 이후)는 [ClickHouse quantile()() 함수](/sql-reference/aggregate-functions/reference/quantile/)를 사용하여 계산 속도를 크게 향상시키지만 샘플링을 사용합니다. 정확한 계산 결과를 원하면 `MEDIAN_EXACT()` 및 `PERCENTILE_EXACT()` 함수를 사용하십시오( [quantileExact()()](/sql-reference/aggregate-functions/reference/quantileexact/) 기반).
- 추출 모드에서는 MEDIAN_EXACT() 및 PERCENTILE_EXACT()를 사용할 수 없습니다. 왜냐하면 MEDIAN() 및 PERCENTILE()는 항상 정확하고(그러나 느립니다) 때문이다.
## 라이브 모드에서 계산 필드를 위한 추가 함수 {#additional-functions-for-calculated-fields-in-live-mode}
ClickHouse는 데이터 분석에 사용할 수 있는 많은 함수를 제공합니다. Tableau가 지원하는 것보다 훨씬 많습니다. 사용자 편의를 위해 계산 필드를 생성할 때 라이브 모드에서 사용할 수 있는 새로운 함수를 추가했습니다. 불행히도 Tableau 인터페이스에서 이러한 함수에 설명을 추가할 수 없으므로, 여기에서 그에 대한 설명을 추가하겠습니다.
- **[`-If` 집계 조합기](/sql-reference/aggregate-functions/combinators/#-if)** *(v0.2.3에서 추가됨)* - 집계 계산 내에서 행 수준의 필터를 사용할 수 있습니다. `SUM_IF(), AVG_IF(), COUNT_IF(), MIN_IF() & MAX_IF()` 함수가 추가되었습니다.
- **`BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int])`** *(v0.2.1에서 추가됨)* — 지루한 막대 차트를 잊으세요! 대신 `BAR()` 함수를 사용하세요(ClickHouse에서의 [`bar()`](/sql-reference/functions/other-functions#bar)와 동등합니다). 예를 들어, 이 계산 필드는 문자열로 아름다운 막대를 반환합니다:
```text
BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int]) + "  " + FORMAT_READABLE_QUANTITY([my_int])
```
```text
== BAR() ==
██████████████████▊  327.06 million
█████  88.02 million
███████████████  259.37 million
```
- **`COUNTD_UNIQ([my_field])`** *(v0.2.0에서 추가됨)* — 인수의 서로 다른 값의 대략적인 수를 계산합니다. [uniq()](/sql-reference/aggregate-functions/reference/uniq/)의 동등체입니다. `COUNTD()`보다 훨씬 빠릅니다.
- **`DATE_BIN('day', 10, [my_datetime_or_date])`** *(v0.2.1에서 추가됨)* — ClickHouse에서의 [`toStartOfInterval()`](/sql-reference/functions/date-time-functions#toStartOfInterval)와 동등합니다. 주어진 간격으로 날짜 또는 날짜 및 시간을 내림합니다. 예를 들어:
```text
== my_datetime_or_date == | == DATE_BIN('day', 10, [my_datetime_or_date]) ==
   28.07.2004 06:54:50    |              21.07.2004 00:00:00
   17.07.2004 14:01:56    |              11.07.2004 00:00:00
   14.07.2004 07:43:00    |              11.07.2004 00:00:00
```
- **`FORMAT_READABLE_QUANTITY([my_integer])`** *(v0.2.1에서 추가됨)* — 접미사가 있는 반올림된 숫자를 문자열로 반환합니다(천, 백만, 십억 등). 수치가 큰 것을 사람이 읽기 쉽게 만드는 데 유용합니다. [`formatReadableQuantity()`](/sql-reference/functions/other-functions#formatReadableQuantity)의 동등체입니다.
- **`FORMAT_READABLE_TIMEDELTA([my_integer_timedelta_sec], [optional_max_unit])`** *(v0.2.1에서 추가됨)* — 초 단위의 시간 차이를 받습니다. 문자열로 (년, 월, 일, 시, 분, 초) 단위의 시간 차이를 반환합니다. `optional_max_unit`은 표시할 최대 단위입니다. 허용되는 값: `seconds`, `minutes`, `hours`, `days`, `months`, `years`. [`formatReadableTimeDelta()`](/sql-reference/functions/other-functions/#formatReadableTimeDelta)의 동등체입니다.
- **`GET_SETTING([my_setting_name])`** *(v0.2.1에서 추가됨)* — 사용자 정의 설정의 현재 값을 반환합니다. [`getSetting()`](/sql-reference/functions/other-functions#getSetting)의 동등체입니다.
- **`HEX([my_string])`** *(v0.2.1에서 추가됨)* — 인수의 16진수 표현을 포함하는 문자열을 반환합니다. [`hex()`](/sql-reference/functions/encoding-functions/#hex)의 동등체입니다.
- **`KURTOSIS([my_number])`** — 시퀀스의 샘플 첨도를 계산합니다. [`kurtSamp()`](/sql-reference/aggregate-functions/reference/kurtsamp)의 동등체입니다.
- **`KURTOSISP([my_number])`** — 시퀀스의 첨도를 계산합니다. [`kurtPop()`](/sql-reference/aggregate-functions/reference/kurtpop)의 동등체입니다.
- **`MEDIAN_EXACT([my_number])`** *(v0.1.3에서 추가됨)* — 수치 데이터 시퀀스의 중앙값을 정확히 계산합니다. [`quantileExact(0.5)(...)`](/sql-reference/aggregate-functions/reference/quantileexact/#quantileexact)의 동등체입니다.
- **`MOD([my_number_1], [my_number_2])`** — 나눈 후 나머지를 계산합니다. 인수가 부동 소수점 숫자인 경우 소수 부분을 제거하여 정수로 미리 변환됩니다. [`modulo()`](/sql-reference/functions/arithmetic-functions/#modulo)의 동등체입니다.
- **`PERCENTILE_EXACT([my_number], [level_float])`** *(v0.1.3에서 추가됨)* — 수치 데이터 시퀀스의 백분위를 정확히 계산합니다. 추천 레벨 범위는 [0.01, 0.99]입니다. [`quantileExact()()`](/sql-reference/aggregate-functions/reference/quantileexact/#quantileexact)의 동등체입니다.
- **`PROPER([my_string])`** *(v0.2.5에서 추가됨)* - 텍스트 문자열을 변환하여 각 단어의 첫 글자는 대문자로, 나머지 글자는 소문자로 변환합니다. 공백과 구두점 등의 비알파벳 문자도 구분 기호로 작용합니다. 예를 들어:
```text
PROPER("PRODUCT name") => "Product Name"
```
```text
PROPER("darcy-mae") => "Darcy-Mae"
```
- **`RAND()`** *(v0.2.1에서 추가됨)* — 정수 (UInt32) 숫자를 반환합니다. 예: `3446222955`. [`rand()`](/sql-reference/functions/random-functions/#rand)의 동등체입니다.
- **`RANDOM()`** *(v0.2.1에서 추가됨)* — 0과 1 사이의 부동 소수점을 반환하는 비공식 [`RANDOM()`](https://kb.tableau.com/articles/issue/random-function-produces-inconsistent-results) Tableau 함수입니다.
- **`RAND_CONSTANT([optional_field])`** *(v0.2.1에서 추가됨)* — 임의의 값으로 고정된 LOD와 비슷한 상수 컬럼을 생성합니다. 그러나 더 빠릅니다. [`randConstant()`](/sql-reference/functions/random-functions/#randConstant)의 동등체입니다.
- **`REAL([my_number])`** — 필드를 부동 소수점( Float64)으로 캐스트합니다. 자세한 내용은 [`여기`](/sql-reference/data-types/decimal/#operations-and-result-type)에서 확인하십시오.
- **`SHA256([my_string])`** *(v0.2.1에서 추가됨)* — 문자열에서 SHA-256 해시를 계산하고 결과 바이트 집합을 문자열( FixedString)로 반환합니다. `HEX()` 함수와 함께 사용하기에 편리합니다. 예를 들어, `HEX(SHA256([my_string]))`. [`SHA256()`](/sql-reference/functions/hash-functions#SHA256)의 동등체입니다.
- **`SKEWNESS([my_number])`** — 시퀀스의 샘플 왜도를 계산합니다. [`skewSamp()`](/sql-reference/aggregate-functions/reference/skewsamp)의 동등체입니다.
- **`SKEWNESSP([my_number])`** — 시퀀스의 왜도를 계산합니다. [`skewPop()`](/sql-reference/aggregate-functions/reference/skewpop)의 동등체입니다.
- **`TO_TYPE_NAME([field])`** *(v0.2.1에서 추가됨)* — 전달된 인수의 ClickHouse 유형 이름이 포함된 문자열을 반환합니다. [`toTypeName()`](/sql-reference/functions/other-functions#toTypeName)의 동등체입니다.
- **`TRUNC([my_float])`** — `FLOOR([my_float])` 함수와 같습니다. [`trunc()`](/sql-reference/functions/rounding-functions#trunc)의 동등체입니다.
- **`UNHEX([my_string])`** *(v0.2.1에서 추가됨)* — `HEX()`의 반대 작업을 수행합니다. [`unhex()`](/sql-reference/functions/encoding-functions#unhex)의 동등체입니다.
