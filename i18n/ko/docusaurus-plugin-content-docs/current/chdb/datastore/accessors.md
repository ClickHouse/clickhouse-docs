---
title: 'DataStore 접근자'
sidebar_label: '접근자'
slug: /chdb/datastore/accessors
description: '문자열(String), DateTime, 배열(Array), JSON, URL, IP, Geo에 대한 접근자와 185개 이상의 메서드'
keywords: ['chdb', 'datastore', 'accessor', 'str', 'dt', 'arr', 'json', 'url', 'ip', 'geo']
doc_type: 'reference'
---

# DataStore Accessors \{#datastore-accessors\}

DataStore는 도메인별 작업을 위해 7개의 액세서 네임스페이스와 185개 이상의 메서드를 제공합니다.

| Accessor | Methods | Description |
|----------|---------|-------------|
| `.str` | 56 | 문자열 연산 |
| `.dt` | 42+ | DateTime 연산 |
| `.arr` | 37 | 배열 연산 (ClickHouse 전용) |
| `.json` | 13 | JSON 파싱 (ClickHouse 전용) |
| `.url` | 15 | URL 파싱 (ClickHouse 전용) |
| `.ip` | 9 | IP 주소 연산 (ClickHouse 전용) |
| `.geo` | 14 | Geo/거리 연산 (ClickHouse 전용) |

---

## String Accessor (`.str`) \{#str\}

모든 56개의 pandas `.str` 메서드와 ClickHouse 문자열 함수를 지원합니다.

### 대소문자 변환 \{#str-case\}

| Method         | ClickHouse  | 설명               |
| -------------- | ----------- | ---------------- |
| `upper()`      | `upper()`   | 대문자로 변환          |
| `lower()`      | `lower()`   | 소문자로 변환          |
| `capitalize()` | `initcap()` | 첫 글자를 대문자로 변환    |
| `title()`      | `initcap()` | 제목 형식으로 변환       |
| `swapcase()`   | -           | 대소문자를 서로 뒤바꿈     |
| `casefold()`   | `lower()`   | 케이스 폴딩(대소문자 표준화) |

```python
ds['name_upper'] = ds['name'].str.upper()
ds['name_title'] = ds['name'].str.title()
```


### 길이 및 크기 \{#str-length\}

| Method          | ClickHouse      | Description   |
| --------------- | --------------- | ------------- |
| `len()`         | `length()`      | 문자열 길이(바이트)   |
| `char_length()` | `char_length()` | 문자열 길이(문자 단위) |

```python
ds['name_len'] = ds['name'].str.len()
```


### 부분 문자열과 슬라이싱 \{#str-substring\}

| Method               | ClickHouse    | Description   |
| -------------------- | ------------- | ------------- |
| `slice(start, stop)` | `substring()` | 부분 문자열 추출     |
| `slice_replace()`    | -             | 슬라이스 치환       |
| `left(n)`            | `left()`      | 가장 왼쪽의 n개 문자  |
| `right(n)`           | `right()`     | 가장 오른쪽의 n개 문자 |
| `get(i)`             | -             | 해당 인덱스 위치의 문자 |

```python
ds['first_3'] = ds['name'].str.slice(0, 3)
ds['last_4'] = ds['name'].str.right(4)
```


### 공백 제거(Trimming) \{#str-trim\}

| Method     | ClickHouse    | Description |
| ---------- | ------------- | ----------- |
| `strip()`  | `trim()`      | 공백 제거       |
| `lstrip()` | `trimLeft()`  | 선행 공백 제거    |
| `rstrip()` | `trimRight()` | 후행 공백 제거    |

```python
ds['trimmed'] = ds['text'].str.strip()
```


### 검색 및 매칭 \{#str-search\}

| Method            | ClickHouse     | Description        |
| ----------------- | -------------- | ------------------ |
| `contains(pat)`   | `position()`   | 부분 문자열 포함          |
| `startswith(pat)` | `startsWith()` | 접두사로 시작            |
| `endswith(pat)`   | `endsWith()`   | 접미사로 끝남            |
| `find(sub)`       | `position()`   | 위치 찾기              |
| `rfind(sub)`      | -              | 오른쪽에서부터 찾기         |
| `index(sub)`      | `position()`   | 찾지 못하면 예외 발생       |
| `rindex(sub)`     | -              | 오른쪽에서 찾지 못하면 예외 발생 |
| `match(pat)`      | `match()`      | 정규식 일치             |
| `fullmatch(pat)`  | -              | 전체 정규식 일치          |
| `count(pat)`      | -              | 발생 횟수 세기           |

```python
# Contains substring
ds['has_john'] = ds['name'].str.contains('John')

# Regex match
ds['valid_email'] = ds['email'].str.match(r'^[\w.-]+@[\w.-]+\.\w+$')
```


### 치환 \{#str-replace\}

| Method                           | ClickHouse           | Description |
| -------------------------------- | -------------------- | ----------- |
| `replace(pat, repl)`             | `replace()`          | 등장 부분 치환    |
| `replace(pat, repl, regex=True)` | `replaceRegexpAll()` | 정규식으로 치환    |
| `removeprefix(prefix)`           | -                    | 접두사 제거      |
| `removesuffix(suffix)`           | -                    | 접미사 제거      |
| `translate(table)`               | -                    | 문자 변환       |

```python
ds['cleaned'] = ds['text'].str.replace('\n', ' ')
ds['digits_only'] = ds['phone'].str.replace(r'\D', '', regex=True)
```


### 분할 \{#str-split\}

| Method            | ClickHouse        | Description      |
| ----------------- | ----------------- | ---------------- |
| `split(sep)`      | `splitByString()` | 배열로 분할           |
| `rsplit(sep)`     | -                 | 오른쪽부터 분할         |
| `partition(sep)`  | -                 | 3개의 파트로 분할       |
| `rpartition(sep)` | -                 | 오른쪽부터 3개의 파트로 분할 |

```python
ds['parts'] = ds['path'].str.split('/')
```


### 패딩 \{#str-padding\}

| Method          | ClickHouse          | Description |
| --------------- | ------------------- | ----------- |
| `pad(width)`    | `leftPad()`         | 왼쪽 채우기      |
| `ljust(width)`  | `rightPad()`        | 오른쪽 정렬      |
| `rjust(width)`  | `leftPad()`         | 왼쪽 정렬       |
| `center(width)` | -                   | 가운데 정렬      |
| `zfill(width)`  | `leftPad(..., '0')` | 0으로 채우기     |

```python
ds['padded_id'] = ds['id'].astype(str).str.zfill(6)
```


### 문자 테스트 \{#str-tests\}

| Method        | Description       |
| ------------- | ----------------- |
| `isalpha()`   | 모두 알파벳 문자         |
| `isdigit()`   | 모두 숫자             |
| `isalnum()`   | 모두 영숫자 문자         |
| `isspace()`   | 모두 공백 문자          |
| `isupper()`   | 모두 대문자            |
| `islower()`   | 모두 소문자            |
| `istitle()`   | Title case(제목 형식) |
| `isnumeric()` | 숫자 문자             |
| `isdecimal()` | 10진수 문자           |

```python
ds['is_numeric'] = ds['code'].str.isdigit()
```


### 기타 \{#str-other\}

| Method | 설명 |
|--------|-------------|
| `repeat(n)` | n번 반복 |
| `reverse()` | 문자열 역순 변환 |
| `wrap(width)` | 텍스트 줄바꿈 |
| `encode(enc)` | 인코딩 |
| `decode(enc)` | 디코딩 |
| `normalize(form)` | 유니코드 정규화 |
| `extract(pat)` | 정규식 그룹 추출 |
| `extractall(pat)` | 모든 일치 항목 추출 |
| `cat(sep)` | 모든 값 연결 |
| `get_dummies(sep)` | 더미 변수 생성 |

---

## DateTime Accessor (`.dt`) \{#dt\}

총 42개 이상의 pandas `.dt` 메서드와 ClickHouse datetime 함수를 모두 지원합니다.

### 날짜 구성 요소 \{#dt-components\}

| Property        | ClickHouse        | Description  |
| --------------- | ----------------- | ------------ |
| `year`          | `toYear()`        | 연도           |
| `month`         | `toMonth()`       | 월 (1-12)     |
| `day`           | `toDayOfMonth()`  | 일 (1-31)     |
| `hour`          | `toHour()`        | 시 (0-23)     |
| `minute`        | `toMinute()`      | 분 (0-59)     |
| `second`        | `toSecond()`      | 초 (0-59)     |
| `millisecond`   | `toMillisecond()` | 밀리초          |
| `microsecond`   | `toMicrosecond()` | 마이크로초        |
| `quarter`       | `toQuarter()`     | 분기 (1-4)     |
| `dayofweek`     | `toDayOfWeek()`   | 요일 (0 = 월요일) |
| `dayofyear`     | `toDayOfYear()`   | 연중 일자        |
| `week`          | `toWeek()`        | 주차           |
| `days_in_month` | -                 | 해당 월의 일수     |

```python
ds['year'] = ds['date'].dt.year
ds['month'] = ds['date'].dt.month
ds['day_of_week'] = ds['date'].dt.dayofweek
```


### 잘라내기(Truncation) \{#dt-truncation\}

| Method                  | ClickHouse           | Description         |
| ----------------------- | -------------------- | ------------------- |
| `to_start_of_day()`     | `toStartOfDay()`     | 하루의 시작 시각           |
| `to_start_of_week()`    | `toStartOfWeek()`    | 한 주의 시작 시각          |
| `to_start_of_month()`   | `toStartOfMonth()`   | 한 달의 시작 시각          |
| `to_start_of_quarter()` | `toStartOfQuarter()` | 분기의 시작 시각           |
| `to_start_of_year()`    | `toStartOfYear()`    | 연도의 시작 시각           |
| `to_start_of_hour()`    | `toStartOfHour()`    | 해당 시(hour)의 시작 시각   |
| `to_start_of_minute()`  | `toStartOfMinute()`  | 해당 분(minute)의 시작 시각 |

```python
ds['month_start'] = ds['date'].dt.to_start_of_month()
```


### 산술 연산 \{#dt-arithmetic\}

| Method               | ClickHouse         | Description |
| -------------------- | ------------------ | ----------- |
| `add_years(n)`       | `addYears()`       | 연도를 더합니다    |
| `add_months(n)`      | `addMonths()`      | 개월 수를 더합니다  |
| `add_weeks(n)`       | `addWeeks()`       | 주 수를 더합니다   |
| `add_days(n)`        | `addDays()`        | 일 수를 더합니다   |
| `add_hours(n)`       | `addHours()`       | 시간을 더합니다    |
| `add_minutes(n)`     | `addMinutes()`     | 분을 더합니다     |
| `add_seconds(n)`     | `addSeconds()`     | 초를 더합니다     |
| `subtract_years(n)`  | `subtractYears()`  | 연도를 뺍니다     |
| `subtract_months(n)` | `subtractMonths()` | 개월 수를 뺍니다   |
| `subtract_days(n)`   | `subtractDays()`   | 일 수를 뺍니다    |

```python
ds['next_month'] = ds['date'].dt.add_months(1)
ds['last_week'] = ds['date'].dt.subtract_weeks(1)
```


### 불리언 검사 \{#dt-checks\}

| Method               | Description |
| -------------------- | ----------- |
| `is_month_start()`   | 월의 첫날       |
| `is_month_end()`     | 월의 마지막 날    |
| `is_quarter_start()` | 분기의 첫날      |
| `is_quarter_end()`   | 분기의 마지막 날   |
| `is_year_start()`    | 연도의 첫날      |
| `is_year_end()`      | 연도의 마지막 날   |
| `is_leap_year()`     | 윤년 여부       |

```python
ds['is_eom'] = ds['date'].dt.is_month_end()
```


### 형식 지정 \{#dt-formatting\}

| Method          | ClickHouse         | Description |
| --------------- | ------------------ | ----------- |
| `strftime(fmt)` | `formatDateTime()` | 문자열 형식으로 변환 |
| `day_name()`    | -                  | 요일 이름       |
| `month_name()`  | -                  | 월 이름        |

```python
ds['date_str'] = ds['date'].dt.strftime('%Y-%m-%d')
ds['day_name'] = ds['date'].dt.day_name()
```


### 타임존 \{#dt-timezone\}

| Method            | ClickHouse     | Description |
| ----------------- | -------------- | ----------- |
| `tz_convert(tz)`  | `toTimezone()` | 타임존 변환      |
| `tz_localize(tz)` | -              | 타임존 지정      |

```python
ds['utc_time'] = ds['timestamp'].dt.tz_convert('UTC')
```

***


## 배열 Accessor (`.arr`) \{#arr\}

ClickHouse 전용 배열 연산 메서드(37개)입니다.

### 속성 \{#arr-properties\}

| Property    | ClickHouse   | Description       |
| ----------- | ------------ | ----------------- |
| `length`    | `length()`   | 배열의 길이            |
| `size`      | `length()`   | `length()` 함수의 별칭 |
| `empty`     | `empty()`    | 비어 있는지 여부         |
| `not_empty` | `notEmpty()` | 비어 있지 않은지 여부      |

```python
ds['tag_count'] = ds['tags'].arr.length
ds['has_tags'] = ds['tags'].arr.not_empty
```


### 요소 접근 \{#arr-access\}

| Method                  | ClickHouse              | Description |
| ----------------------- | ----------------------- | ----------- |
| `array_first()`         | `arrayElement(..., 1)`  | 첫 번째 요소     |
| `array_last()`          | `arrayElement(..., -1)` | 마지막 요소      |
| `array_element(n)`      | `arrayElement()`        | N번째 요소      |
| `array_slice(off, len)` | `arraySlice()`          | 배열 슬라이스(부분) |

```python
ds['first_tag'] = ds['tags'].arr.array_first()
ds['last_tag'] = ds['tags'].arr.array_last()
```


### 집계 \{#arr-aggregations\}

| Method            | ClickHouse       | Description |
| ----------------- | ---------------- | ----------- |
| `array_sum()`     | `arraySum()`     | 요소 합계       |
| `array_avg()`     | `arrayAvg()`     | 평균          |
| `array_min()`     | `arrayMin()`     | 최솟값         |
| `array_max()`     | `arrayMax()`     | 최댓값         |
| `array_product()` | `arrayProduct()` | 요소 곱        |
| `array_uniq()`    | `arrayUniq()`    | 서로 다른 값 개수  |

```python
ds['total'] = ds['values'].arr.array_sum()
ds['average'] = ds['values'].arr.array_avg()
```


### 변환 \{#arr-transformations\}

| Method                 | ClickHouse           | Description |
| ---------------------- | -------------------- | ----------- |
| `array_sort()`         | `arraySort()`        | 오름차순 정렬     |
| `array_reverse_sort()` | `arrayReverseSort()` | 내림차순 정렬     |
| `array_reverse()`      | `arrayReverse()`     | 순서 뒤집기      |
| `array_distinct()`     | `arrayDistinct()`    | 고유 요소 추출    |
| `array_compact()`      | `arrayCompact()`     | 연속 중복 제거    |
| `array_flatten()`      | `arrayFlatten()`     | 중첩된 배열 평탄화  |

```python
ds['sorted_tags'] = ds['tags'].arr.array_sort()
ds['unique_tags'] = ds['tags'].arr.array_distinct()
```


### 변경 \{#arr-modifications\}

| Method | ClickHouse | 설명 |
|--------|------------|-------------|
| `array_push_back(elem)` | `arrayPushBack()` | 끝에 요소 추가 |
| `array_push_front(elem)` | `arrayPushFront()` | 앞에 요소 추가 |
| `array_pop_back()` | `arrayPopBack()` | 마지막 요소 제거 |
| `array_pop_front()` | `arrayPopFront()` | 첫 번째 요소 제거 |
| `array_concat(other)` | `arrayConcat()` | 연결 |

### 검색 \{#arr-search\}

| Method              | ClickHouse     | Description |
| ------------------- | -------------- | ----------- |
| `has(elem)`         | `has()`        | 요소 포함 여부    |
| `index_of(elem)`    | `indexOf()`    | 인덱스 검색      |
| `count_equal(elem)` | `countEqual()` | 일치 횟수 계산    |

```python
ds['has_python'] = ds['skills'].arr.has('Python')
```


### 문자열 연산 \{#arr-string\}

| Method                     | ClickHouse            | Description |
| -------------------------- | --------------------- | ----------- |
| `array_string_concat(sep)` | `arrayStringConcat()` | 문자열로 결합합니다  |

```python
ds['tags_str'] = ds['tags'].arr.array_string_concat(', ')
```

***


## JSON Accessor (`.json`) \{#json\}

ClickHouse 고유의 JSON 파싱 메서드(13개)입니다.

| Method             | ClickHouse            | Description  |
| ------------------ | --------------------- | ------------ |
| `get_string(path)` | `JSONExtractString()` | 문자열 추출       |
| `get_int(path)`    | `JSONExtractInt()`    | 정수 추출        |
| `get_float(path)`  | `JSONExtractFloat()`  | 부동소수점 수 추출   |
| `get_bool(path)`   | `JSONExtractBool()`   | 불리언 추출       |
| `get_raw(path)`    | `JSONExtractRaw()`    | 원시 JSON 추출   |
| `get_keys()`       | `JSONExtractKeys()`   | 키 반환         |
| `get_type(path)`   | `JSONType()`          | 타입 반환        |
| `get_length(path)` | `JSONLength()`        | 길이 반환        |
| `has_key(key)`     | `JSONHas()`           | 키 존재 여부 확인   |
| `is_valid()`       | `isValidJSON()`       | JSON 유효성 검사  |
| `to_json_string()` | `toJSONString()`      | JSON 문자열로 변환 |

```python
# Parse JSON columns
ds['user_name'] = ds['json_data'].json.get_string('user.name')
ds['user_age'] = ds['json_data'].json.get_int('user.age')
ds['is_active'] = ds['json_data'].json.get_bool('user.active')
ds['has_email'] = ds['json_data'].json.has_key('user.email')
```

***


## URL Accessor (`.url`) \{#url\}

ClickHouse 전용 URL 파싱 메서드(15개).

| Method                        | ClickHouse               | Description      |
| ----------------------------- | ------------------------ | ---------------- |
| `domain()`                    | `domain()`               | 도메인 추출           |
| `domain_without_www()`        | `domainWithoutWWW()`     | www 제외 도메인       |
| `top_level_domain()`          | `topLevelDomain()`       | 최상위 도메인(TLD)     |
| `protocol()`                  | `protocol()`             | 프로토콜(http/https) |
| `path()`                      | `path()`                 | URL 경로           |
| `path_full()`                 | `pathFull()`             | 쿼리 포함 경로         |
| `query_string()`              | `queryString()`          | 쿼리 문자열           |
| `fragment()`                  | `fragment()`             | 프래그먼트(#...)      |
| `port()`                      | `port()`                 | 포트 번호            |
| `extract_url_parameter(name)` | `extractURLParameter()`  | 쿼리 파라미터 조회       |
| `extract_url_parameters()`    | `extractURLParameters()` | 모든 파라미터 조회       |
| `cut_url_parameter(name)`     | `cutURLParameter()`      | 파라미터 제거          |
| `decode_url_component()`      | `decodeURLComponent()`   | URL 디코딩          |
| `encode_url_component()`      | `encodeURLComponent()`   | URL 인코딩          |

```python
# Parse URLs
ds['domain'] = ds['url'].url.domain()
ds['path'] = ds['url'].url.path()
ds['utm_source'] = ds['url'].url.extract_url_parameter('utm_source')
```

***


## IP Accessor (`.ip`) \{#ip\}

ClickHouse 전용 IP 주소 연산 (메서드 9개).

| Method                     | ClickHouse          | Description      |
| -------------------------- | ------------------- | ---------------- |
| `to_ipv4()`                | `toIPv4()`          | IPv4로 변환         |
| `to_ipv6()`                | `toIPv6()`          | IPv6로 변환         |
| `ipv4_num_to_string()`     | `IPv4NumToString()` | 숫자를 문자열로 변환      |
| `ipv4_string_to_num()`     | `IPv4StringToNum()` | 문자열을 숫자로 변환      |
| `ipv6_num_to_string()`     | `IPv6NumToString()` | IPv6 숫자를 문자열로 변환 |
| `ipv4_to_ipv6()`           | `IPv4ToIPv6()`      | IPv4를 IPv6로 변환   |
| `is_ipv4_string()`         | `isIPv4String()`    | IPv4 유효성 검사      |
| `is_ipv6_string()`         | `isIPv6String()`    | IPv6 유효성 검사      |
| `ipv4_cidr_to_range(cidr)` | `IPv4CIDRToRange()` | CIDR를 범위로 변환     |

```python
# IP operations
ds['is_valid_ip'] = ds['ip'].ip.is_ipv4_string()
ds['ip_num'] = ds['ip'].ip.ipv4_string_to_num()
```

***


## Geo Accessor (`.geo`) \{#geo\}

ClickHouse에 특화된 지리/거리 연산(총 14개 메서드)입니다.

### 거리 함수 \{#geo-distance\}

| Method | ClickHouse | Description |
|--------|------------|-------------|
| `great_circle_distance(...)` | `greatCircleDistance()` | 대권 거리 |
| `geo_distance(...)` | `geoDistance()` | WGS-84 거리 |
| `l1_distance(v1, v2)` | `L1Distance()` | 맨해튼 거리 |
| `l2_distance(v1, v2)` | `L2Distance()` | 유클리드 거리 |
| `l2_squared_distance(v1, v2)` | `L2SquaredDistance()` | 유클리드 거리 제곱 |
| `linf_distance(v1, v2)` | `LinfDistance()` | 체비셰프 거리 |
| `cosine_distance(v1, v2)` | `cosineDistance()` | 코사인 거리 |

### 벡터 연산 \{#geo-vector\}

| Method | ClickHouse | 설명 |
|--------|------------|-------------|
| `dot_product(v1, v2)` | `dotProduct()` | 내적 |
| `l2_norm(vec)` | `L2Norm()` | 벡터 노름 |
| `l2_normalize(vec)` | `L2Normalize()` | 벡터 정규화 |

### H3 함수 \{#geo-h3\}

| Method | ClickHouse | 설명 |
|--------|------------|-------------|
| `geo_to_h3(lon, lat, res)` | `geoToH3()` | 지리 좌표를 H3 인덱스로 변환 |
| `h3_to_geo(h3)` | `h3ToGeo()` | H3를 지리 좌표로 변환 |

### 점 연산 \{#geo-point\}

| Method                       | ClickHouse          | Description       |
| ---------------------------- | ------------------- | ----------------- |
| `point_in_polygon(pt, poly)` | `pointInPolygon()`  | 점이 다각형 내부에 있는지 판별 |
| `point_in_ellipses(...)`     | `pointInEllipses()` | 점이 타원 내부에 있는지 판별  |

```python
from chdb.datastore import F

# Calculate distances
ds['distance'] = F.great_circle_distance(
    ds['lon1'], ds['lat1'],
    ds['lon2'], ds['lat2']
)

# Vector similarity
ds['similarity'] = F.cosine_distance(ds['embedding1'], ds['embedding2'])
```

***


## Accessor 사용 방법 \{#using-accessors\}

### 지연 평가(Lazy Evaluation) \{#lazy\}

대부분의 accessor 메서드는 지연 평가 방식으로 동작하여, 나중에 평가되는 표현식을 반환합니다.

```python
# All these are lazy
ds['name_upper'] = ds['name'].str.upper()  # Not executed yet
ds['year'] = ds['date'].dt.year            # Not executed yet
ds['domain'] = ds['url'].url.domain()      # Not executed yet

# Execution happens when you access results
df = ds.to_df()  # Now everything executes
```


### 즉시 실행되는 메서드 \{#execute-immediately\}

일부 `.str` 메서드는 구조를 변경하므로 지연 평가 없이 즉시 실행됩니다:

| Method | Returns | Why |
|--------|---------|-----|
| `partition(sep)` | DataStore (컬럼 3개) | 여러 컬럼을 생성 |
| `rpartition(sep)` | DataStore (컬럼 3개) | 여러 컬럼을 생성 |
| `get_dummies(sep)` | DataStore (컬럼 N개) | 컬럼 개수가 동적으로 변함 |
| `extractall(pat)` | DataStore | MultiIndex 결과 반환 |
| `cat(sep)` | str | 집계 (N개의 행 → 1개 행) |

### Accessor 체이닝 \{#chaining\}

Accessor 메서드는 체이닝하여 사용할 수 있습니다:

```python
ds['clean_name'] = (ds['name']
    .str.strip()
    .str.lower()
    .str.replace(' ', '_')
)

ds['next_month_start'] = (ds['date']
    .dt.add_months(1)
    .dt.to_start_of_month()
)
```
