---
title: '기타 JSON 접근 방식'
slug: /integrations/data-formats/json/other-approaches
description: 'JSON을 모델링하는 다른 접근 방식'
keywords: ['json', 'formats']
doc_type: 'reference'
---

# JSON을 모델링하는 다른 접근 방식 \{#other-approaches-to-modeling-json\}

**다음 내용은 ClickHouse에서 JSON을 모델링하는 대체 방법들입니다. 이는 완전한 설명을 위해 문서화된 것이며, JSON 타입이 도입되기 이전에는 유효했으나, 일반적으로 대부분의 사용 사례에서는 권장되지 않거나 적용되지 않습니다.**

:::note 객체 단위 접근 방식 적용
동일한 스키마 내에서도 객체별로 서로 다른 기법을 적용할 수 있습니다. 예를 들어, 일부 객체에는 `String` 타입이 가장 적합하고, 다른 객체에는 맵(Map) 타입이 더 적합할 수 있습니다. 한 번 `String` 타입을 사용하면 추가적인 스키마 결정을 내릴 필요가 없습니다. 반대로, 아래에서 보여드리는 것처럼 JSON을 나타내는 `String`을 포함하여, 맵(Map) 키 내부에 하위 객체를 중첩하는 것도 가능합니다:
:::

## String 타입 사용 \{#using-string\}

객체가 예측 가능한 구조가 없을 정도로 매우 동적이고 임의의 중첩 객체를 포함하는 경우에는 `String` 타입을 사용해야 합니다. 아래와 같이 JSON 함수를 사용하여 쿼리 시점에 값을 추출할 수 있습니다.

위에서 설명한 구조화된 접근 방식은 JSON이 동적이며 변경 가능하거나, 스키마가 잘 이해되지 않은 사용자에게는 실용적이지 않은 경우가 많습니다. 완전한 유연성을 확보하기 위해 필요한 필드를 함수로 추출하기 전에 JSON을 `String`으로 그대로 저장할 수 있습니다. 이는 JSON을 구조화된 객체로 다루는 방식과 완전히 정반대에 해당합니다. 이러한 유연성은 상당한 단점을 수반하는데, 주로 쿼리 구문 복잡도 증가와 성능 저하라는 비용이 발생합니다.

앞서 언급했듯이, [원본 person 객체](/integrations/data-formats/json/schema#static-vs-dynamic-json)의 경우 `tags` 컬럼의 구조를 보장할 수 없습니다. 원본 행(일단 무시하는 `company.labels`를 포함하여)을 삽입하면서 `Tags` 컬럼을 `String`으로 선언합니다:

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

`tags` 컬럼을 선택하면 JSON이 문자열로 삽입된 것을 확인할 수 있습니다.

```sql
SELECT tags
FROM people

┌─tags───────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}} │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

[`JSONExtract`](/sql-reference/functions/json-functions#jsonextract-functions) 함수는 이 JSON에서 값을 추출하는 데 사용할 수 있습니다. 아래의 간단한 예제를 살펴보십시오.

```sql
SELECT JSONExtractString(tags, 'holidays') AS holidays FROM people

┌─holidays──────────────────────────────────────┐
│ [{"year":2024,"location":"Azores, Portugal"}] │
└───────────────────────────────────────────────┘

1 row in set. Elapsed: 0.002 sec.
```

함수들은 `String` 컬럼 `tags`에 대한 참조와, 추출할 JSON 경로를 모두 필요로 한다는 점에 주목하십시오. 중첩된 경로는 예를 들어 `JSONExtractUInt(JSONExtractString(tags, 'car'), 'year')`처럼 함수의 중첩을 필요로 하며, 이는 컬럼 `tags.car.year`를 추출한다는 의미입니다. 중첩 경로의 추출은 [`JSON_QUERY`](/sql-reference/functions/json-functions#JSON_QUERY) 및 [`JSON_VALUE`](/sql-reference/functions/json-functions#JSON_VALUE) 함수를 사용하여 단순화할 수 있습니다.

전체 본문을 `String`으로 간주하는 `arxiv` 데이터셋과 같은 극단적인 경우를 생각해 볼 수 있습니다.

```sql
CREATE TABLE arxiv (
  body String
)
ENGINE = MergeTree ORDER BY ()
```

이 스키마에 데이터를 삽입하려면 `JSONAsString` 형식을 사용해야 합니다:

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz', 'JSONAsString')

0 rows in set. Elapsed: 25.186 sec. Processed 2.52 million rows, 1.38 GB (99.89 thousand rows/s., 54.79 MB/s.)
```


연도별로 발표된 논문의 개수를 세고자 한다고 가정합니다. 문자열만 사용하는 다음 쿼리를 스키마의 [구조화된 버전](/integrations/data-formats/json/inference#creating-tables)과 비교해 보십시오.

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

여기에서는 JSON을 메서드 기준으로 필터링하기 위해 XPath 표현식을 사용한다는 점에 주목하십시오. 예를 들어 `JSON_VALUE(body, '$.versions[0].created')`와 같습니다.

`String` 함수는 인덱스를 사용하는 명시적 타입 변환보다 상당히 느리며(10배 이상), 위와 같은 쿼리는 항상 전체 테이블 스캔과 모든 행 처리 작업을 필요로 합니다. 이 예제처럼 작은 데이터셋에서는 여전히 빠르게 동작하지만, 더 큰 데이터셋에서는 성능이 저하됩니다.

이 접근 방식은 유연성이 높지만 성능과 구문 측면에서 분명한 비용이 발생하므로, 스키마에서 매우 동적인 객체에만 사용해야 합니다.


### Simple JSON functions \{#simple-json-functions\}

위 예시에서는 JSON* 계열 함수들을 사용합니다. 이 함수들은 [simdjson](https://github.com/simdjson/simdjson)을 기반으로 한 완전한 JSON 파서를 활용하며, 구문 분석이 엄격하고 서로 다른 깊이에 중첩된 동일한 필드를 구분합니다. 이 함수들은 문법적으로는 올바르지만 서식이 잘 정돈되지 않은 JSON, 예를 들어 키 사이에 공백이 두 번 들어간 경우 등도 처리할 수 있습니다.

더 빠르고 더 엄격한 함수 집합도 제공됩니다. `simpleJSON*` 함수들은 JSON의 구조와 형식에 대해 엄격한 가정을 함으로써 잠재적으로 더 나은 성능을 제공합니다. 구체적으로:

* 필드 이름은 반드시 상수여야 합니다.
* 필드 이름 인코딩이 일관되어야 합니다. 예: `simpleJSONHas('{"abc":"def"}', 'abc') = 1`, 그러나 `visitParamHas('{"\\u0061\\u0062\\u0063":"def"}', 'abc') = 0`
* 필드 이름은 모든 중첩 구조 전체에서 고유해야 합니다. 중첩 수준에 따른 구분은 하지 않으며, 매칭은 무차별적으로 수행됩니다. 일치하는 필드가 여러 개일 경우 첫 번째 항목이 사용됩니다.
* 문자열 리터럴 외의 특수 문자는 허용되지 않습니다. 여기에는 공백도 포함됩니다. 아래 예시는 유효하지 않으며 파싱되지 않습니다.

  ```json
  {"@timestamp": 893964617, "clientip": "40.135.0.0", "request": {"method": "GET",
  "path": "/images/hm_bg.jpg", "version": "HTTP/1.0"}, "status": 200, "size": 24736}
  ```

반면, 아래 예시는 정상적으로 파싱됩니다:

````json
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
````

위 쿼리는 게시 날짜에 대해서는 첫 번째 값만 필요하다는 점을 활용하여 `created` 키를 추출하기 위해 `simpleJSONExtractString`을 사용합니다. 이 경우 `simpleJSON*` 함수의 제약은 성능 향상이라는 이점을 고려할 때 수용할 만합니다.


## 맵(Map) 타입 사용 {#using-map}

객체를 임의의 키(주로 동일한 타입)를 저장하는 용도로 사용하려는 경우 `Map` 타입 사용을 고려하십시오. 이상적으로는 고유 키의 개수가 수백 개를 넘지 않는 것이 좋습니다. `Map` 타입은 하위 객체(서브 객체)가 있는 객체에도 사용할 수 있지만, 이때 하위 객체들의 타입이 균일해야 합니다. 일반적으로 `Map` 타입은 라벨과 태그에 사용하는 것을 권장하며, 예를 들어 로그 데이터의 Kubernetes 파드 라벨에 사용할 수 있습니다.

`Map`은 중첩 구조를 단순하게 표현할 수 있지만, 다음과 같은 몇 가지 중요한 제한 사항이 있습니다:

- 모든 필드는 동일한 타입이어야 합니다.
- 필드가 개별 컬럼으로 존재하지 않기 때문에, 하위 컬럼에 접근하려면 특수한 맵 구문을 사용해야 합니다. 전체 객체가 _하나의_ 컬럼입니다.
- 하위 컬럼에 접근하면 전체 `Map` 값, 즉 모든 형제 키와 해당 값이 함께 로드됩니다. 맵 크기가 큰 경우 상당한 성능 저하로 이어질 수 있습니다.

:::note String keys
객체를 `Map`으로 모델링할 때는 JSON 키 이름을 저장하기 위해 `String` 키를 사용합니다. 따라서 맵은 항상 `Map(String, T)` 형태가 되며, 여기서 `T`는 데이터에 따라 달라집니다.
:::

#### 원시 값

`Map`의 가장 단순한 사용 방식은 객체의 값들이 모두 동일한 원시 타입인 경우입니다. 대부분의 경우 값 `T`에 `String` 타입을 사용합니다.

`company.labels` 객체가 동적인 것으로 판단되었던 [앞서의 person JSON](/integrations/data-formats/json/schema#static-vs-dynamic-json)을 다시 살펴보십시오. 중요한 점은, 이 객체에는 String 타입의 key-value 쌍만 추가될 것으로 예상된다는 것입니다. 따라서 이를 `Map(String, String)`으로 선언할 수 있습니다:

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

원본 JSON 객체 전체를 그대로 INSERT할 수 있습니다:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021"}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

요청 객체 내에서 이러한 필드를 쿼리하려면 맵 구문을 사용해야 합니다. 예를 들면 다음과 같습니다:

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

이 경우 쿼리에 사용할 수 있는 전체 `Map` 함수가 제공되며, 그 내용은 [여기](/sql-reference/functions/tuple-map-functions.md)에 설명되어 있습니다. 데이터의 타입이 일관되지 않은 경우, [필요한 타입 변환](/sql-reference/functions/type-conversion-functions)을 수행하기 위한 함수를 사용할 수 있습니다.


#### 객체 값

`Map` 맵 타입은 하위 객체를 가지는 객체에도 사용할 수 있으며, 이때 하위 객체들의 타입이 일관된 경우에 적합합니다.

`persons` 객체의 `tags` 키가 각 `tag`마다 `name`과 `time` 컬럼을 가지는 하위 객체로 이루어진, 일관된 구조를 가져야 한다고 가정해 보겠습니다. 이러한 JSON 문서의 단순화된 예시는 다음과 같습니다.

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

이는 다음과 같이 `Map(String, Tuple(name String, time DateTime))`으로 모델링할 수 있습니다:

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

이 경우 맵을 사용하는 일은 일반적으로 드물며, 이는 동적 키 이름 아래에 하위 객체가 없도록 데이터를 다시 모델링해야 함을 시사합니다. 예를 들어, 위 예시는 `Array(Tuple(key String, name String, time DateTime))`을 사용할 수 있도록 다음과 같이 다시 모델링할 수 있습니다.

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


## Nested 타입 사용

[Nested 타입](/sql-reference/data-types/nested-data-structures/nested)은 거의 변경되지 않는 정적인 객체를 모델링하는 데 사용할 수 있으며, `Tuple`과 `Array(Tuple)`의 대안이 됩니다. 일반적으로 JSON을 대상으로는 이 타입 사용을 피할 것을 권장하는데, 동작이 혼란스러운 경우가 많기 때문입니다. `Nested`의 주요 이점은 하위 컬럼을 정렬 키에 사용할 수 있다는 점입니다.

아래에서는 정적인 객체를 모델링하기 위해 Nested 타입을 사용하는 예시를 제공합니다. JSON 형식의 다음과 같은 간단한 로그 엔트리를 생각해 보십시오:

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

`request` 키를 `Nested` 타입으로 정의할 수 있습니다. `Tuple`과 마찬가지로 하위 컬럼을 명시해야 합니다.

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

`flatten_nested` SETTING은 Nested 타입의 동작을 제어합니다.

#### flatten_nested=1

값이 `1`(기본값)인 경우 임의 깊이의 중첩을 지원하지 않습니다. 이 설정에서는 중첩된 데이터 구조를 동일한 길이의 여러 [Array](/sql-reference/data-types/array) 컬럼으로 간주하는 것이 가장 이해하기 쉽습니다. `method`, `path`, `version` 필드는 실제로 모두 별개의 `Array(Type)` 컬럼이지만, 한 가지 중요한 제약 조건이 있습니다. **`method`, `path`, `version` 필드의 길이는 반드시 동일해야 합니다.** `SHOW CREATE TABLE`을 사용하면 다음과 같이 확인할 수 있습니다:

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

다음과 같이 이 테이블에 데이터를 INSERT합니다:

```sql
SET input_format_import_nested_json = 1;
INSERT INTO http
FORMAT JSONEachRow
{"timestamp":897819077,"clientip":"45.212.12.0","request":[{"method":"GET","path":"/french/images/hm_nav_bar.gif","version":"HTTP/1.0"}],"status":200,"size":3305}
```

여기에서 몇 가지 중요한 사항을 알아두어야 합니다:

* JSON을 중첩 구조로 삽입하려면 `input_format_import_nested_json` 설정을 사용해야 합니다. 이 설정이 없으면 JSON을 평탄화(flatten)해야 합니다. 예:

  ```sql
  INSERT INTO http FORMAT JSONEachRow
  {"timestamp":897819077,"clientip":"45.212.12.0","request":{"method":["GET"],"path":["/french/images/hm_nav_bar.gif"],"version":["HTTP/1.0"]},"status":200,"size":3305}
  ```
* 중첩 필드 `method`, `path`, `version`은 JSON 배열로 전달해야 합니다. 예:

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

컬럼은 점(dot) 표기법을 사용해 조회할 수 있습니다:

```sql
SELECT clientip, status, size, `request.method` FROM http WHERE has(request.method, 'GET');

┌─clientip────┬─status─┬─size─┬─request.method─┐
│ 45.212.12.0 │    200 │ 3305 │ ['GET']        │
└─────────────┴────────┴──────┴────────────────┘
1 row in set. Elapsed: 0.002 sec.
```

서브 컬럼에 `Array`를 사용하면 전체 [Array 함수](/sql-reference/functions/array-functions)를 모두 활용할 수 있으며, 컬럼에 여러 값이 있는 경우 유용한 [`ARRAY JOIN`](/sql-reference/statements/select/array-join) 절도 사용할 수 있습니다.


#### flatten_nested=0

이는 임의 수준의 중첩을 허용하며, 중첩된 컬럼이 `Tuple`의 단일 배열로 유지된다는 의미입니다. 사실상 `Array(Tuple)`과 동일해집니다.

**이는 `Nested`와 함께 JSON을 사용할 때 권장되는 방식이며, 종종 가장 간단한 방식입니다. 아래에서 보듯이, 모든 객체가 리스트 형태이기만 하면 됩니다.**

아래에서는 테이블을 다시 생성하고 행을 다시 삽입합니다:

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

여기에서 주의해야 할 몇 가지 중요한 사항은 다음과 같습니다:

* `input_format_import_nested_json`은 데이터 삽입 시 필수가 아닙니다.
* `Nested` 타입은 `SHOW CREATE TABLE`에서 그대로 유지됩니다. 내부적으로 이 컬럼은 사실상 `Array(Tuple(Nested(method LowCardinality(String), path String, version LowCardinality(String))))`입니다.
* 그 결과 `request`는 배열로 INSERT해야 합니다. 예를 들어:

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

컬럼은 점 표기(dot notation)를 사용하여 다시 조회할 수 있습니다:

```sql
SELECT clientip, status, size, `request.method` FROM http WHERE has(request.method, 'GET');

┌─clientip────┬─status─┬─size─┬─request.method─┐
│ 45.212.12.0 │    200 │ 3305 │ ['GET']        │
└─────────────┴────────┴──────┴────────────────┘
1 row in set. Elapsed: 0.002 sec.
```


### 예시

위에서 사용한 데이터의 더 큰 규모 예시는 S3 공개 버킷에 있습니다: `s3://datasets-documentation/http/`.

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

JSON에 대한 제약 조건과 입력 형식을 고려하여 다음 쿼리를 사용하여 이 샘플 데이터 세트를 삽입합니다. 여기서는 `flatten_nested=0`으로 설정합니다.

다음 구문은 1,000만 행을 삽입하므로 실행에 몇 분 정도 소요될 수 있습니다. 필요하다면 `LIMIT`을 적용하십시오:

```sql
INSERT INTO http
SELECT `@timestamp` AS `timestamp`, clientip, [request], status,
size FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz',
'JSONEachRow');
```

이 데이터를 쿼리하려면 `request` 필드를 배열로 취급해 접근해야 합니다. 아래 예시에서는 고정된 시간 구간 동안 오류와 HTTP 메서드를 요약합니다.

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


### 쌍 배열(pairwise arrays) 사용

쌍 배열은 JSON을 `String`으로 표현하는 방식의 유연성과 보다 구조화된 방식의 성능 사이에서 균형을 제공합니다. 스키마는 루트에 새로운 필드를 추가할 수 있다는 점에서 유연합니다. 다만, 이 방식은 쿼리 구문이 훨씬 더 복잡해지며 중첩 구조와는 호환되지 않습니다.

예시로, 다음 테이블을 살펴보겠습니다.

```sql
CREATE TABLE http_with_arrays (
   keys Array(String),
   values Array(String)
)
ENGINE = MergeTree  ORDER BY tuple();
```

이 테이블에 데이터를 삽입하려면 JSON을 키와 값 목록 형태로 구성해야 합니다. 다음 쿼리는 이를 위해 `JSONExtractKeysAndValues` 함수를 사용하는 예를 보여 줍니다:

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

request 컬럼이 문자열로 표현된 중첩 구조로 유지된다는 점에 주목하십시오. 루트에 새로운 키를 얼마든지 삽입할 수 있습니다. 또한 JSON 자체가 임의로 달라도 됩니다. 로컬 테이블에 데이터를 삽입하려면 다음을 실행하십시오:

```sql
INSERT INTO http_with_arrays
SELECT
    arrayMap(x -> (x.1), JSONExtractKeysAndValues(json, 'String')) AS keys,
    arrayMap(x -> (x.2), JSONExtractKeysAndValues(json, 'String')) AS values
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz', 'JSONAsString')

0 rows in set. Elapsed: 12.121 sec. Processed 10.00 million rows, 107.30 MB (825.01 thousand rows/s., 8.85 MB/s.)
```

이 구조에 대해 쿼리를 실행하려면 필요한 키의 인덱스를 식별하기 위해 [`indexOf`](/sql-reference/functions/array-functions#indexOf) 함수를 사용해야 합니다(이 인덱스는 values의 순서와 일관되어야 합니다). 이렇게 식별한 인덱스를 사용해 values 배열 컬럼에 접근할 수 있습니다. 예: `values[indexOf(keys, 'status')]`. request 컬럼에 대해서는 여전히 JSON 파싱 방법이 필요하며, 이 경우에는 `simpleJSONExtractString`을 사용합니다.

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
