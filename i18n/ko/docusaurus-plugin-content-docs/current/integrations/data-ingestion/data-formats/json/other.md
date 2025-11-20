---
'title': '다른 JSON 접근법'
'slug': '/integrations/data-formats/json/other-approaches'
'description': 'JSON 모델링에 대한 다른 접근법'
'keywords':
- 'json'
- 'formats'
'doc_type': 'reference'
---


# JSON 모델링의 다른 접근법

**다음은 ClickHouse에서 JSON을 모델링하는 대안입니다. 이들은 JSON 유형 개발 이전에 적용되었으며 완전성을 위해 문서화되었으므로 일반적으로 권장되지 않거나 대부분의 사용 사례에 적용되지 않습니다.**

:::note 객체 수준 접근 방식 적용
동일한 스키마 내의 서로 다른 객체에 대해 서로 다른 기술을 적용할 수 있습니다. 예를 들어, 일부 객체는 `String` 유형으로 해결하는 것이 가장 좋고, 다른 객체는 `Map` 유형으로 해결할 수 있습니다. `String` 유형이 사용된 경우, 추가적인 스키마 결정을 할 필요가 없습니다. 반대로, `Map` 키 내에서 하위 객체를 중첩시킬 수 있습니다 - JSON을 나타내는 `String`을 포함하여 아래에 보여주는 바와 같이:
:::

## String 유형 사용 {#using-string}

객체가 매우 동적이고 예측 가능한 구조가 없으며 임의의 중첩 객체를 포함하는 경우 사용자는 `String` 유형을 사용해야 합니다. 값은 아래와 같이 JSON 함수들을 사용하여 쿼리 시 추출할 수 있습니다.

위에서 설명한 구조적 접근법을 통해 데이터를 처리하는 것은 변동성이 큰 JSON을 가진 사용자에게는 종종 실행 가능하지 않으며, 이는 변경될 수 있거나 스키마가 잘 이해되지 않는 경우입니다. 절대적인 유연성을 위해 사용자는 JSON을 필요에 따라 필드를 추출하는 함수 사용 전에 단순히 `String`으로 저장할 수 있습니다. 이는 JSON을 구조적 객체로 처리하는 것과 극명하게 반대되는 방법입니다. 이러한 유연성은 쿼리 구문 복잡성과 성능 저하와 같은 상당한 단점을 초래합니다.

앞에서 언급했듯이, [원래 사람 객체](/integrations/data-formats/json/schema#static-vs-dynamic-json)에 대해 `tags` 컬럼의 구조를 보장할 수 없습니다. 우리는 원래 행(현재 무시하고 있는 `company.labels`를 포함)을 삽입하며, `Tags` 컬럼을 `String`으로 선언합니다:

```sql
CREATE TABLE people
(
    `id` Int64,
    `name` String,
    `username` String,
    `email` String,
    `address` Array(Tuple(city String, geo Tuple(lat Float32, lng Float32), street String, suite String, zipcode String)),
    `phone_numbers` Array(String),
    `website` String,
    `company` Tuple(catchPhrase String, name String),
    `dob` Date,
    `tags` String
)
ENGINE = MergeTree
ORDER BY username

INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021"}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

Ok.
1 row in set. Elapsed: 0.002 sec.
```

`tags` 컬럼을 선택하면 JSON이 문자열로 삽입된 것을 볼 수 있습니다:

```sql
SELECT tags
FROM people

┌─tags───────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}} │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

[`JSONExtract`](/sql-reference/functions/json-functions#jsonextract-functions) 함수를 사용하여 이 JSON에서 값을 검색할 수 있습니다. 다음의 간단한 예를 고려하십시오:

```sql
SELECT JSONExtractString(tags, 'holidays') AS holidays FROM people

┌─holidays──────────────────────────────────────┐
│ [{"year":2024,"location":"Azores, Portugal"}] │
└───────────────────────────────────────────────┘

1 row in set. Elapsed: 0.002 sec.
```

함수가 `String` 컬럼 `tags`에 대한 참조와 JSON에서 추출할 경로를 모두 요구하는 것이 주목할 만합니다. 중첩된 경로는 함수를 중첩시켜야 하며, 예를 들어 `JSONExtractUInt(JSONExtractString(tags, 'car'), 'year')`는 컬럼 `tags.car.year`를 추출합니다. 중첩 경로의 추출은 [`JSON_QUERY`](/sql-reference/functions/json-functions#JSON_QUERY)와 [`JSON_VALUE`](/sql-reference/functions/json-functions#JSON_VALUE) 함수들로 간단하게 처리할 수 있습니다.

`arxiv` 데이터셋에서 모든 내용을 `String`으로 간주하는 극단적인 경우를 고려하십시오.

```sql
CREATE TABLE arxiv (
  body String
)
ENGINE = MergeTree ORDER BY ()
```

이 스키마에 삽입하려면 `JSONAsString` 형식을 사용해야 합니다:

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz', 'JSONAsString')

0 rows in set. Elapsed: 25.186 sec. Processed 2.52 million rows, 1.38 GB (99.89 thousand rows/s., 54.79 MB/s.)
```

연도별로 발행된 논문의 수를 세고 싶다고 가정해 보겠습니다. 문자열만 사용한 다음 쿼리와 [구조적 버전](/integrations/data-formats/json/inference#creating-tables)을 대비해 보십시오:

```sql
-- using structured schema
SELECT
    toYear(parseDateTimeBestEffort(versions.created[1])) AS published_year,
    count() AS c
FROM arxiv_v2
GROUP BY published_year
ORDER BY c ASC
LIMIT 10

┌─published_year─┬─────c─┐
│           1986 │     1 │
│           1988 │     1 │
│           1989 │     6 │
│           1990 │    26 │
│           1991 │   353 │
│           1992 │  3190 │
│           1993 │  6729 │
│           1994 │ 10078 │
│           1995 │ 13006 │
│           1996 │ 15872 │
└────────────────┴───────┘

10 rows in set. Elapsed: 0.264 sec. Processed 2.31 million rows, 153.57 MB (8.75 million rows/s., 582.58 MB/s.)

-- using unstructured String

SELECT
    toYear(parseDateTimeBestEffort(JSON_VALUE(body, '$.versions[0].created'))) AS published_year,
    count() AS c
FROM arxiv
GROUP BY published_year
ORDER BY published_year ASC
LIMIT 10

┌─published_year─┬─────c─┐
│           1986 │     1 │
│           1988 │     1 │
│           1989 │     6 │
│           1990 │    26 │
│           1991 │   353 │
│           1992 │  3190 │
│           1993 │  6729 │
│           1994 │ 10078 │
│           1995 │ 13006 │
│           1996 │ 15872 │
└────────────────┴───────┘

10 rows in set. Elapsed: 1.281 sec. Processed 2.49 million rows, 4.22 GB (1.94 million rows/s., 3.29 GB/s.)
Peak memory usage: 205.98 MiB.
```

여기서 방법으로 JSON을 필터링하기 위해 XPath 표현식의 사용이 있을 수 있습니다. 즉, `JSON_VALUE(body, '$.versions[0].created')`입니다.

문자열 함수는 인덱스가 있는 명시적 형 변환보다 상당히 느립니다 (> 10배). 위의 쿼리는 항상 전체 테이블 스캔과 모든 행의 처리 요구 사항을 직면합니다. 이러한 쿼리는 이와 같은 소규모 데이터셋에서는 여전히 빠르지만, 대규모 데이터셋에서는 성능이 저하될 것입니다.

이 접근 방식의 유연성은 명확한 성능 및 구문 비용이 따르며, 스키마 내에서 매우 동적인 객체에 대해서만 사용해야 합니다.

### 간단한 JSON 함수 {#simple-json-functions}

위의 예는 JSON* 함수 패밀리를 사용합니다. 이 함수들은 [simdjson](https://github.com/simdjson/simdjson)을 기반으로 한 전체 JSON 파서를 활용하며, 이는 구문 분석에 엄격하고 서로 다른 수준에서 중첩된 동일한 필드를 구별합니다. 이러한 함수는 구문적으로 올바르지만 잘 형식화되지 않은 JSON을 처리할 수 있습니다. 예를 들어, 키 사이의 이중 공백이 포함된 경우입니다.

보다 빠르고 엄격한 함수 세트도 사용할 수 있습니다. 이러한 `simpleJSON*` 함수는 JSON의 구조 및 형식에 대한 엄격한 가정을 통해 잠재적으로 우수한 성능을 제공합니다. 구체적으로:

- 필드 이름은 상수여야 합니다.
- 필드 이름의 일관된 인코딩 필요. 예: `simpleJSONHas('{"abc":"def"}', 'abc') = 1`, 그러나 `visitParamHas('{"\\u0061\\u0062\\u0063":"def"}', 'abc') = 0`
- 필드 이름은 모든 중첩 구조 간에 고유해야 합니다. 중첩 수준 간에 구분이 없으며 일치가 비차별적입니다. 여러 개의 일치하는 필드가 있는 경우, 첫 번째 발생이 사용됩니다.
- 문자열 리터럴 외부에 특별 문자가 없습니다. 여기에는 공백이 포함됩니다. 아래는 유효하지 않으며 구문 분석되지 않습니다.

```json
{"@timestamp": 893964617, "clientip": "40.135.0.0", "request": {"method": "GET",
"path": "/images/hm_bg.jpg", "version": "HTTP/1.0"}, "status": 200, "size": 24736}
```

반면, 아래는 올바르게 구문 분석됩니다:

```json
{"@timestamp":893964617,"clientip":"40.135.0.0","request":{"method":"GET",
    "path":"/images/hm_bg.jpg","version":"HTTP/1.0"},"status":200,"size":24736}

In some circumstances, where performance is critical and your JSON meets the above requirements, these may be appropriate. An example of the earlier query, re-written to use `simpleJSON*` functions, is shown below:

```sql
SELECT
    toYear(parseDateTimeBestEffort(simpleJSONExtractString(simpleJSONExtractRaw(body, 'versions'), 'created'))) AS published_year,
    count() AS c
FROM arxiv
GROUP BY published_year
ORDER BY published_year ASC
LIMIT 10

┌─published_year─┬─────c─┐
│           1986 │     1 │
│           1988 │     1 │
│           1989 │     6 │
│           1990 │    26 │
│           1991 │   353 │
│           1992 │  3190 │
│           1993 │  6729 │
│           1994 │ 10078 │
│           1995 │ 13006 │
│           1996 │ 15872 │
└────────────────┴───────┘

10 rows in set. Elapsed: 0.964 sec. Processed 2.48 million rows, 4.21 GB (2.58 million rows/s., 4.36 GB/s.)
Peak memory usage: 211.49 MiB.
```

위의 쿼리는 `simpleJSONExtractString`을 사용하여 `created` 키를 추출하며, 출판 날짜에 대해 첫 번째 값만 필요함을 활용합니다. 이 경우 `simpleJSON*` 함수의 제한 사항은 성능 향상을 위해 허용 가능합니다.

## Map 유형 사용 {#using-map}

객체가 임의의 키를 저장하는 데 사용되는 경우, 대부분 하나의 유형일 때 `Map` 유형을 사용하는 것을 고려하십시오. 이상적으로, 고유한 키의 수는 수백 개를 초과해서는 안 됩니다. `Map` 유형은 하위 객체가 있는 객체에 대해서도 고려될 수 있으며, 후자의 유형이 획일적일 경우가 가능합니다. 일반적으로, `Map` 유형은 라벨 및 태그에 사용되기를 권장하며, 예를 들어 로그 데이터의 Kubernetes 포드 라벨을 포함합니다.

`Map`은 중첩 구조를 표현하는 간단한 방법을 제공하지만 다음과 같은 몇 가지 주목할 만한 제한 사항이 있습니다:

- 모든 필드는 동일한 유형이어야 합니다.
- 하위 컬럼에 접근하는 것은 특별한 맵 구문이 필요합니다. 왜냐하면 필드가 컬럼으로 존재하지 않기 때문입니다. 전체 객체는 _컬럼_입니다.
- 하위 컬럼에 접근하는 것은 전체 `Map` 값을 로드합니다. 즉, 모든 형제와 그에 따른 값이 로드됩니다. 더 큰 맵의 경우 이는 상당한 성능 저하를 초래할 수 있습니다.

:::note 문자열 키
객체를 `Map`으로 모델링할 때 `String` 키를 사용하여 JSON 키 이름을 저장합니다. 따라서 맵은 항상 `Map(String, T)`가 되며, 여기서 `T`는 데이터에 따라 다릅니다.
:::

#### 기본 값 {#primitive-values}

`Map`의 가장 간단한 적용은 객체가 값으로 동일한 기본 유형을 포함하는 경우입니다. 대부분의 경우, 이는 값 `T`에 대해 `String` 유형을 사용하는 것을 포함합니다.

우리의 [이전 사람 JSON](/integrations/data-formats/json/schema#static-vs-dynamic-json)을 고려해 보십시오. 여기서 `company.labels` 객체가 동적이라고 판단되었습니다. 중요하게도, 우리는 이 객체에 추가될 키-값 쌍이 String 유형이라고만 기대합니다. 따라서 이를 `Map(String, String)`으로 선언할 수 있습니다:

```sql
CREATE TABLE people
(
    `id` Int64,
    `name` String,
    `username` String,
    `email` String,
    `address` Array(Tuple(city String, geo Tuple(lat Float32, lng Float32), street String, suite String, zipcode String)),
    `phone_numbers` Array(String),
    `website` String,
    `company` Tuple(catchPhrase String, name String, labels Map(String,String)),
    `dob` Date,
    `tags` String
)
ENGINE = MergeTree
ORDER BY username
```

우리의 원래 완전한 JSON 객체를 삽입할 수 있습니다:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021"}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

요청 객체 내에서 이러한 필드를 쿼리하려면 다음과 같은 맵 구문이 필요합니다:

```sql
SELECT company.labels FROM people

┌─company.labels───────────────────────────────┐
│ {'type':'database systems','founded':'2021'} │
└──────────────────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.

SELECT company.labels['type'] AS type FROM people

┌─type─────────────┐
│ database systems │
└──────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

맵 함수를 모두 사용할 수 있으며, 이에 대한 설명은 [여기](/sql-reference/functions/tuple-map-functions.md)에서 찾을 수 있습니다. 데이터가 일관된 유형이 아닐 경우, [필요한 형 변환](/sql-reference/functions/type-conversion-functions) 함수를 사용할 수 있습니다.

#### 객체 값 {#object-values}

`Map` 유형은 하위 객체가 있는 객체에 대해서도 고려될 수 있습니다. 단, 후자는 그 유형에 일관성이 있어야 합니다.

만약 `persons` 객체의 `tags` 키가 일관된 구조를 요구하는 경우, 각 `tag`의 하위 객체는 `name`과 `time` 컬럼을 가져야 합니다. 그러한 JSON 문서의 단순화된 예는 다음과 같을 수 있습니다:

```json
{
  "id": 1,
  "name": "Clicky McCliickHouse",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "tags": {
    "hobby": {
      "name": "Diving",
      "time": "2024-07-11 14:18:01"
    },
    "car": {
      "name": "Tesla",
      "time": "2024-07-11 15:18:23"
    }
  }
}
```

이는 다음과 같이 `Map(String, Tuple(name String, time DateTime))`으로 모델링될 수 있습니다:

```sql
CREATE TABLE people
(
    `id` Int64,
    `name` String,
    `username` String,
    `email` String,
    `tags` Map(String, Tuple(name String, time DateTime))
)
ENGINE = MergeTree
ORDER BY username

INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","tags":{"hobby":{"name":"Diving","time":"2024-07-11 14:18:01"},"car":{"name":"Tesla","time":"2024-07-11 15:18:23"}}}

Ok.

1 row in set. Elapsed: 0.002 sec.

SELECT tags['hobby'] AS hobby
FROM people
FORMAT JSONEachRow

{"hobby":{"name":"Diving","time":"2024-07-11 14:18:01"}}

1 row in set. Elapsed: 0.001 sec.
```

이 경우 맵의 적용은 일반적으로 드물며, 데이터가 동적 키 이름을 가진 하위 객체를 가지지 않도록 재모델링되어야 함을 나타냅니다. 예를 들어, 위의 내용을 다음과 같이 재모델링하여 `Array(Tuple(key String, name String, time DateTime))`를 사용할 수 있도록 할 수 있습니다.

```json
{
  "id": 1,
  "name": "Clicky McCliickHouse",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "tags": [
    {
      "key": "hobby",
      "name": "Diving",
      "time": "2024-07-11 14:18:01"
    },
    {
      "key": "car",
      "name": "Tesla",
      "time": "2024-07-11 15:18:23"
    }
  ]
}
```

## Nested 유형 사용 {#using-nested}

[Nested 유형](/sql-reference/data-types/nested-data-structures/nested)은 거의 변경되지 않는 정적 객체를 모델링하는 데 사용될 수 있으며, `Tuple` 및 `Array(Tuple)`의 대안을 제공합니다. JSON에 이 유형을 사용하는 것은 일반적으로 피하는 것이 좋습니다. 그 이유는 종종 혼란스러운 동작을 하기 때문입니다. `Nested`의 주요 이점은 하위 컬럼을 정렬 키에 사용할 수 있다는 것입니다.

아래는 정적 객체를 모델링하기 위해 Nested 유형을 사용하는 예입니다. 다음과 같은 간단한 로그 항목을 JSON으로 고려하십시오:

```json
{
  "timestamp": 897819077,
  "clientip": "45.212.12.0",
  "request": {
    "method": "GET",
    "path": "/french/images/hm_nav_bar.gif",
    "version": "HTTP/1.0"
  },
  "status": 200,
  "size": 3305
}
```

`request` 키를 `Nested`로 선언할 수 있습니다. `Tuple`과 유사하게 하위 컬럼을 명시해야 합니다.

```sql
-- default
SET flatten_nested=1
CREATE table http
(
   timestamp Int32,
   clientip     IPv4,
   request Nested(method LowCardinality(String), path String, version LowCardinality(String)),
   status       UInt16,
   size         UInt32,
) ENGINE = MergeTree() ORDER BY (status, timestamp);
```

### flatten_nested {#flatten_nested}

설정 `flatten_nested`는 중첩의 동작을 제어합니다.

#### flatten_nested=1 {#flatten_nested1}

값 `1`(기본값)은 임의 수준의 중첩을 지원하지 않습니다. 이 값으로는 중첩 데이터 구조를 동일한 길이를 가진 여러 [Array](/sql-reference/data-types/array) 컬럼으로 생각하는 것이 가장 쉽습니다. 필드 `method`, `path`, 및 `version`은 실제로는 개별적인 `Array(Type)` 컬럼이며 한 가지 중요한 제약 조건이 있습니다: **`method`, `path`, 및 `version` 필드의 길이는 동일해야 합니다.** `SHOW CREATE TABLE`를 사용하면 다음과 같이 나타납니다:

```sql
SHOW CREATE TABLE http

CREATE TABLE http
(
    `timestamp` Int32,
    `clientip` IPv4,
    `request.method` Array(LowCardinality(String)),
    `request.path` Array(String),
    `request.version` Array(LowCardinality(String)),
    `status` UInt16,
    `size` UInt32
)
ENGINE = MergeTree
ORDER BY (status, timestamp)
```

아래에서 이 테이블에 삽입합니다:

```sql
SET input_format_import_nested_json = 1;
INSERT INTO http
FORMAT JSONEachRow
{"timestamp":897819077,"clientip":"45.212.12.0","request":[{"method":"GET","path":"/french/images/hm_nav_bar.gif","version":"HTTP/1.0"}],"status":200,"size":3305}
```

여기서 주목할 몇 가지 중요한 사항이 있습니다:

* JSON을 중첩 구조로 삽입하려면 `input_format_import_nested_json` 설정을 사용해야 합니다. 그렇지 않으면 JSON을 평탄화해야 합니다. 즉,

```sql
INSERT INTO http FORMAT JSONEachRow
{"timestamp":897819077,"clientip":"45.212.12.0","request":{"method":["GET"],"path":["/french/images/hm_nav_bar.gif"],"version":["HTTP/1.0"]},"status":200,"size":3305}
```
* 중첩된 필드 `method`, `path`, 및 `version`은 JSON 배열로 전달되어야 합니다. 즉,

```json
{
  "@timestamp": 897819077,
  "clientip": "45.212.12.0",
  "request": {
    "method": [
      "GET"
    ],
    "path": [
      "/french/images/hm_nav_bar.gif"
    ],
    "version": [
      "HTTP/1.0"
    ]
  },
  "status": 200,
  "size": 3305
}
```

컬럼은 점 표기법을 사용하여 쿼리할 수 있습니다:

```sql
SELECT clientip, status, size, `request.method` FROM http WHERE has(request.method, 'GET');

┌─clientip────┬─status─┬─size─┬─request.method─┐
│ 45.212.12.0 │    200 │ 3305 │ ['GET']        │
└─────────────┴────────┴──────┴────────────────┘
1 row in set. Elapsed: 0.002 sec.
```

하위 컬럼에 대한 `Array`의 사용은 전체 [Array 함수](/sql-reference/functions/array-functions)를 활용할 수 있게 해주는 잠재력을 포함하며, [`ARRAY JOIN`](/sql-reference/statements/select/array-join) 절을 포함하여 컬럼에 여러 값이 있는 경우에 유용합니다.

#### flatten_nested=0 {#flatten_nested0}

이는 임의 수준의 중첩을 허용하며 중첩된 컬럼이 단일 `Tuple`의 배열로 유지되도록 하여 기본적으로 `Array(Tuple)`와 동일하게 만듭니다.

**이는 JSON을 `Nested`로 사용하는 선호되는 방법이며 종종 가장 간단한 방법입니다. 아래에서 보여주는 대로, 모든 객체가 리스트가 되기만 하면 됩니다.**

아래에서 테이블을 재생성하고 행을 재삽입합니다:

```sql
CREATE TABLE http
(
    `timestamp` Int32,
    `clientip` IPv4,
    `request` Nested(method LowCardinality(String), path String, version LowCardinality(String)),
    `status` UInt16,
    `size` UInt32
)
ENGINE = MergeTree
ORDER BY (status, timestamp)

SHOW CREATE TABLE http

-- note Nested type is preserved.
CREATE TABLE default.http
(
    `timestamp` Int32,
    `clientip` IPv4,
    `request` Nested(method LowCardinality(String), path String, version LowCardinality(String)),
    `status` UInt16,
    `size` UInt32
)
ENGINE = MergeTree
ORDER BY (status, timestamp)

INSERT INTO http
FORMAT JSONEachRow
{"timestamp":897819077,"clientip":"45.212.12.0","request":[{"method":"GET","path":"/french/images/hm_nav_bar.gif","version":"HTTP/1.0"}],"status":200,"size":3305}
```

여기서 주목할 몇 가지 중요한 사항이 있습니다:

* 삽입할 때 `input_format_import_nested_json`이 필요하지 않습니다.
* `SHOW CREATE TABLE`에서 `Nested` 유형이 보존됩니다. 이 컬럼 아래는 사실상 `Array(Tuple(Nested(method LowCardinality(String), path String, version LowCardinality(String))))`입니다.
* 그 결과, `request`를 배열로 삽입해야 합니다. 즉,

```json
{
  "timestamp": 897819077,
  "clientip": "45.212.12.0",
  "request": [
    {
      "method": "GET",
      "path": "/french/images/hm_nav_bar.gif",
      "version": "HTTP/1.0"
    }
  ],
  "status": 200,
  "size": 3305
}
```

컬럼은 다시 점 표기법을 사용하여 쿼리할 수 있습니다:

```sql
SELECT clientip, status, size, `request.method` FROM http WHERE has(request.method, 'GET');

┌─clientip────┬─status─┬─size─┬─request.method─┐
│ 45.212.12.0 │    200 │ 3305 │ ['GET']        │
└─────────────┴────────┴──────┴────────────────┘
1 row in set. Elapsed: 0.002 sec.
```

### 예시 {#example}

위 데이터를 포함하는 더 큰 예는 s3의 공용 버킷에 있습니다: `s3://datasets-documentation/http/`.

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz', 'JSONEachRow')
LIMIT 1
FORMAT PrettyJSONEachRow

{
    "@timestamp": "893964617",
    "clientip": "40.135.0.0",
    "request": {
        "method": "GET",
        "path": "\/images\/hm_bg.jpg",
        "version": "HTTP\/1.0"
    },
    "status": "200",
    "size": "24736"
}

1 row in set. Elapsed: 0.312 sec.
```

JSON에 대한 제약 조건 및 입력 형식에 따라, 다음 쿼리를 사용하여 이 샘플 데이터 세트를 삽입합니다. 여기서 `flatten_nested=0`을 설정합니다.

다음 문장은 1000만 개의 행을 삽입하므로 실행하는 데 몇 분이 걸릴 수 있습니다. 필요한 경우 `LIMIT`을 적용하십시오:

```sql
INSERT INTO http
SELECT `@timestamp` AS `timestamp`, clientip, [request], status,
size FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz',
'JSONEachRow');
```

이 데이터를 쿼리하려면 요청 필드에 배열로 접근해야 합니다. 아래에서는 고정된 시간 동안 오류 및 http 메서드를 요약합니다.

```sql
SELECT status, request.method[1] AS method, count() AS c
FROM http
WHERE status >= 400
  AND toDateTime(timestamp) BETWEEN '1998-01-01 00:00:00' AND '1998-06-01 00:00:00'
GROUP BY method, status
ORDER BY c DESC LIMIT 5;

┌─status─┬─method─┬─────c─┐
│    404 │ GET    │ 11267 │
│    404 │ HEAD   │   276 │
│    500 │ GET    │   160 │
│    500 │ POST   │   115 │
│    400 │ GET    │    81 │
└────────┴────────┴───────┘

5 rows in set. Elapsed: 0.007 sec.
```

### 쌍 배열 사용 {#using-pairwise-arrays}

쌍 배열은 JSON을 문자열로 표현하는 유연성과 보다 구조화된 접근 방식을 통한 성능 사이의 균형을 제공합니다. 스키마는 유연하여 루트에 새로운 필드를 잠재적으로 추가할 수 있습니다. 그러나 이는 훨씬 더 복잡한 쿼리 구문을 요구하며 중첩 구조와 호환되지 않습니다.

예를 들어, 다음 테이블을 고려하십시오:

```sql
CREATE TABLE http_with_arrays (
   keys Array(String),
   values Array(String)
)
ENGINE = MergeTree  ORDER BY tuple();
```

이 테이블에 삽입하려면 JSON을 키와 값의 리스트로 구조화해야 합니다. 다음 쿼리는 `JSONExtractKeysAndValues`를 사용하여 이를 달성하는 방법을 보여줍니다:

```sql
SELECT
    arrayMap(x -> (x.1), JSONExtractKeysAndValues(json, 'String')) AS keys,
    arrayMap(x -> (x.2), JSONExtractKeysAndValues(json, 'String')) AS values
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz', 'JSONAsString')
LIMIT 1
FORMAT Vertical

Row 1:
──────
keys:   ['@timestamp','clientip','request','status','size']
values: ['893964617','40.135.0.0','{"method":"GET","path":"/images/hm_bg.jpg","version":"HTTP/1.0"}','200','24736']

1 row in set. Elapsed: 0.416 sec.
```

요청 컬럼이 여전히 문자열로 표현된 중첩 구조로 유지되는 방식을 주목하십시오. 루트에 새로운 키를 삽입할 수 있습니다. JSON 자체에서 임의의 차이를 가질 수도 있습니다. 로컬 테이블에 삽입하려면 다음을 실행하십시오:

```sql
INSERT INTO http_with_arrays
SELECT
    arrayMap(x -> (x.1), JSONExtractKeysAndValues(json, 'String')) AS keys,
    arrayMap(x -> (x.2), JSONExtractKeysAndValues(json, 'String')) AS values
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz', 'JSONAsString')

0 rows in set. Elapsed: 12.121 sec. Processed 10.00 million rows, 107.30 MB (825.01 thousand rows/s., 8.85 MB/s.)
```

이 구조를 쿼리하려면 [`indexOf`](/sql-reference/functions/array-functions#indexOf) 함수를 사용하여 필요한 키의 인덱스를 식별해야 합니다(이는 값의 순서와 일치해야 합니다). 이를 사용하여 값 배열 컬럼에 접근할 수 있습니다. 즉, `values[indexOf(keys, 'status')]`. 요청 컬럼에 대한 JSON 파싱 방법도 여전히 필요하며, 이 경우 `simpleJSONExtractString`을 사용합니다.

```sql
SELECT toUInt16(values[indexOf(keys, 'status')])                           AS status,
       simpleJSONExtractString(values[indexOf(keys, 'request')], 'method') AS method,
       count()                                                             AS c
FROM http_with_arrays
WHERE status >= 400
  AND toDateTime(values[indexOf(keys, '@timestamp')]) BETWEEN '1998-01-01 00:00:00' AND '1998-06-01 00:00:00'
GROUP BY method, status ORDER BY c DESC LIMIT 5;

┌─status─┬─method─┬─────c─┐
│    404 │ GET    │ 11267 │
│    404 │ HEAD   │   276 │
│    500 │ GET    │   160 │
│    500 │ POST   │   115 │
│    400 │ GET    │    81 │
└────────┴────────┴───────┘

5 rows in set. Elapsed: 0.383 sec. Processed 8.22 million rows, 1.97 GB (21.45 million rows/s., 5.15 GB/s.)
Peak memory usage: 51.35 MiB.
```
