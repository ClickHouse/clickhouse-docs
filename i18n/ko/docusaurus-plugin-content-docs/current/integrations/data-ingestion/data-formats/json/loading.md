---
sidebar_label: 'JSON 불러오기'
sidebar_position: 20
title: 'JSON 다루기'
slug: /integrations/data-formats/json/loading
description: 'JSON 불러오기'
keywords: ['json', 'clickhouse', '삽입', '로딩', '삽입']
score: 15
doc_type: 'guide'
---

# JSON 로드하기 \{#loading-json\}

다음 예제들은 구조화된 JSON 데이터와 반구조화된 JSON 데이터를 로드하는 아주 간단한 방법을 보여줍니다. 중첩 구조를 포함한 더 복잡한 JSON에 대해서는 가이드 [**JSON 스키마 설계**](/integrations/data-formats/json/schema)를 참고하십시오.

## 구조화된 JSON 적재 \{#loading-structured-json\}

이 섹션에서는 JSON 데이터가 [`NDJSON`](https://github.com/ndjson/ndjson-spec) (Newline delimited JSON) 형식이며 ClickHouse에서 [`JSONEachRow`](/interfaces/formats/JSONEachRow)로 알려져 있고, 컬럼 이름과 타입이 고정된 잘 구조화된 데이터라고 가정합니다. `NDJSON`은 간결성과 공간 효율성 때문에 JSON을 적재할 때 선호되는 형식이지만, [입력 및 출력](/interfaces/formats/JSON)용으로 다른 형식도 지원됩니다.

다음 JSON 예제는 [Python PyPI 데이터셋](https://clickpy.clickhouse.com/)의 한 행을 나타냅니다.

```json
{
  "date": "2022-11-15",
  "country_code": "ES",
  "project": "clickhouse-connect",
  "type": "bdist_wheel",
  "installer": "pip",
  "python_minor": "3.9",
  "system": "Linux",
  "version": "0.3.0"
}
```

이 JSON 객체를 ClickHouse에 로드하려면 테이블 스키마를 먼저 정의해야 합니다.

이 단순한 예제에서는 구조가 고정되어 있고 컬럼 이름이 미리 알려져 있으며, 각 컬럼의 타입도 명확하게 정의되어 있습니다.

ClickHouse는 키 이름과 타입이 동적으로 변할 수 있는 JSON 타입을 통해 반정형 데이터를 지원하지만, 여기서는 이를 사용할 필요가 없습니다.

:::note 가능한 경우 정적 스키마를 선호하십시오
컬럼의 이름과 타입이 고정되어 있고 새로운 컬럼이 추가될 것으로 예상되지 않는 경우, 운영 환경에서는 항상 정적으로 정의된 스키마를 사용하는 것이 좋습니다.

JSON 타입은 컬럼의 이름과 타입이 자주 변경되는 매우 동적인 데이터에 적합합니다. 또한 프로토타이핑이나 데이터 탐색에도 유용합니다.
:::

이에 대한 간단한 스키마는 아래와 같으며, 여기서 **JSON 키를 컬럼 이름에 매핑합니다**:

```sql
CREATE TABLE pypi (
  `date` Date,
  `country_code` String,
  `project` String,
  `type` String,
  `installer` String,
  `python_minor` String,
  `system` String,
  `version` String
)
ENGINE = MergeTree
ORDER BY (project, date)
```

:::note 정렬 키(Ordering keys)
여기서는 `ORDER BY` 절을 사용해 정렬 키를 지정했습니다. 정렬 키와 이를 선택하는 방법에 대한 자세한 내용은 [여기](/data-modeling/schema-design#choosing-an-ordering-key)를 참고하십시오.
:::

ClickHouse는 JSON 형식의 데이터를 여러 방식으로 로드할 수 있으며, 파일 확장자와 내용에서 형식을 자동으로 추론합니다. 위 테이블에 대한 JSON 파일은 [S3 function](/sql-reference/table-functions/s3)을 사용하여 읽을 수 있습니다.

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz')
LIMIT 1
┌───────date─┬─country_code─┬─project────────────┬─type────────┬─installer────┬─python_minor─┬─system─┬─version─┐
│ 2022-11-15 │ CN           │ clickhouse-connect │ bdist_wheel │ bandersnatch │              │        │ 0.2.8 │
└────────────┴──────────────┴────────────────────┴─────────────┴──────────────┴──────────────┴────────┴─────────┘

1 row in set. Elapsed: 1.232 sec.
```

파일 형식을 명시할 필요가 없다는 점에 주목하십시오. 대신 버킷 안의 모든 `*.json.gz` 파일을 읽기 위해 glob 패턴을 사용합니다. ClickHouse는 파일 확장자와 내용을 기반으로 포맷이 `JSONEachRow`(ndjson)임을 자동으로 추론합니다. ClickHouse가 포맷을 감지하지 못하는 경우, 파라미터 함수를 통해 포맷을 수동으로 지정할 수 있습니다.

```sql
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz', JSONEachRow)
```

:::note 압축 파일
위 파일들도 압축되어 있습니다. ClickHouse에서 이를 자동으로 감지하여 처리합니다.
:::

이 파일들의 행을 로드하려면 [`INSERT INTO SELECT`](/sql-reference/statements/insert-into#inserting-the-results-of-select)을(를) 사용할 수 있습니다.


```sql
INSERT INTO pypi SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz')
Ok.

0 rows in set. Elapsed: 10.445 sec. Processed 19.49 million rows, 35.71 MB (1.87 million rows/s., 3.42 MB/s.)

SELECT * FROM pypi LIMIT 2

┌───────date─┬─country_code─┬─project────────────┬─type──┬─installer────┬─python_minor─┬─system─┬─version─┐
│ 2022-05-26 │ CN           │ clickhouse-connect │ sdist │ bandersnatch │              │        │ 0.0.7 │
│ 2022-05-26 │ CN           │ clickhouse-connect │ sdist │ bandersnatch │              │        │ 0.0.7 │
└────────────┴──────────────┴────────────────────┴───────┴──────────────┴──────────────┴────────┴─────────┘

2 rows in set. Elapsed: 0.005 sec. Processed 8.19 thousand rows, 908.03 KB (1.63 million rows/s., 180.38 MB/s.)
```

행은 [`FORMAT` 절](/sql-reference/statements/select/format)을 사용하여 인라인으로도 로드할 수 있습니다. 예:

```sql
INSERT INTO pypi
FORMAT JSONEachRow
{"date":"2022-11-15","country_code":"CN","project":"clickhouse-connect","type":"bdist_wheel","installer":"bandersnatch","python_minor":"","system":"","version":"0.2.8"}
```

다음 예제에서는 `JSONEachRow` 형식을 사용한다고 가정합니다. 다른 일반적인 JSON 형식도 지원되며, 이를 로드하는 방법에 대한 예시는 [여기](/integrations/data-formats/json/other-formats)에 제공됩니다.


## 반정형 JSON 로딩 \{#loading-semi-structured-json\}

이전 예제에서는 키 이름과 타입이 잘 알려진 정적인 JSON 데이터를 로딩했습니다. 그러나 실제로는 그렇지 않은 경우가 많으며, 키가 추가되거나 타입이 변경될 수 있습니다. 이는 관측성 데이터와 같은 사용 사례에서 흔히 발생합니다.

ClickHouse는 전용 [`JSON`](/sql-reference/data-types/newjson) 타입을 통해 이를 처리합니다.

위에서 사용한 [Python PyPI dataset](https://clickpy.clickhouse.com/)의 확장 버전 예제를 살펴보겠습니다. 여기서는 임의의 키-값 쌍을 가진 `tags` 컬럼을 추가했습니다.

```json
{
  "date": "2022-09-22",
  "country_code": "IN",
  "project": "clickhouse-connect",
  "type": "bdist_wheel",
  "installer": "bandersnatch",
  "python_minor": "",
  "system": "",
  "version": "0.2.8",
  "tags": {
    "5gTux": "f3to*PMvaTYZsz!*rtzX1",
    "nD8CV": "value"
  }
}

```

여기서 tags 컬럼은 예측이 불가능하여 모델링할 수 없습니다. 이 데이터를 로드하려면 이전 스키마를 그대로 사용하되, 타입이 [`JSON`](/sql-reference/data-types/newjson)인 `tags` 컬럼을 하나 추가하면 됩니다.

```sql
SET enable_json_type = 1;

CREATE TABLE pypi_with_tags
(
    `date` Date,
    `country_code` String,
    `project` String,
    `type` String,
    `installer` String,
    `python_minor` String,
    `system` String,
    `version` String,
    `tags` JSON
)
ENGINE = MergeTree
ORDER BY (project, date);
```

원본 데이터셋에서 사용한 것과 같은 방식으로 테이블을 채웁니다.

```sql
INSERT INTO pypi_with_tags SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/pypi_with_tags/sample.json.gz')
```

```sql
INSERT INTO pypi_with_tags SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/pypi_with_tags/sample.json.gz')

Ok.

0 rows in set. Elapsed: 255.679 sec. Processed 1.00 million rows, 29.00 MB (3.91 thousand rows/s., 113.43 KB/s.)
Peak memory usage: 2.00 GiB.

SELECT *
FROM pypi_with_tags
LIMIT 2

┌───────date─┬─country_code─┬─project────────────┬─type──┬─installer────┬─python_minor─┬─system─┬─version─┬─tags─────────────────────────────────────────────────────┐
│ 2022-05-26 │ CN           │ clickhouse-connect │ sdist │ bandersnatch │              │        │ 0.0.7 │ {"nsBM":"5194603446944555691"}                           │
│ 2022-05-26 │ CN           │ clickhouse-connect │ sdist │ bandersnatch │              │        │ 0.0.7 │ {"4zD5MYQz4JkP1QqsJIS":"0","name":"8881321089124243208"} │
└────────────┴──────────────┴────────────────────┴───────┴──────────────┴──────────────┴────────┴─────────┴──────────────────────────────────────────────────────────┘

2 rows in set. Elapsed: 0.149 sec.
```

여기에서 데이터 로드 시 성능 차이에 주목하십시오. JSON 컬럼은 INSERT 시점에 타입 추론이 필요하고, 하나의 컬럼에 둘 이상의 타입이 존재하는 경우 추가 저장 공간도 필요합니다. JSON 타입은 명시적으로 컬럼을 선언하는 것과 동등한 성능을 내도록 구성할 수 있지만(자세한 내용은 [JSON 스키마 설계](/integrations/data-formats/json/schema)를 참고), 기본적으로는 의도적으로 유연하게 설계되어 있습니다. 그러나 이러한 유연성에는 일정한 비용이 따릅니다.


### JSON 타입을 언제 사용해야 하는가 \{#when-to-use-the-json-type\}

다음과 같은 경우 JSON 타입을 사용합니다:

* 시간이 지나면서 변경될 수 있는 **예측 불가능한 키**를 가진 데이터인 경우
* **타입이 서로 다른 값들**을 포함하는 경우 (예: 어떤 경로에는 문자열이 들어가기도 하고, 다른 경우에는 숫자가 들어가기도 하는 경우)
* 엄격한 타입 지정이 적합하지 않고 스키마의 유연성이 필요한 경우

데이터 구조가 이미 알려져 있고 일관적이라면, 데이터가 JSON 형식이더라도 JSON 타입을 꼭 사용해야 하는 것은 아닙니다. 특히 데이터가 다음과 같은 경우에는 JSON 타입을 사용할 필요가 거의 없습니다:

* **알려진 키를 가진 단순한(플랫) 구조인 경우**: String 등과 같은 표준 컬럼 타입을 사용합니다.
* **예측 가능한 중첩 구조인 경우**: 이러한 구조에는 Tuple, Array, Nested 타입을 사용합니다.
* **예측 가능한 구조지만 값의 타입이 다른 경우**: 대신 Dynamic 또는 Variant 타입을 고려합니다.

위 예제에서처럼, 예측 가능한 최상위 키에는 정적 컬럼을 사용하고, 페이로드의 동적인 부분에는 단일 JSON 컬럼을 사용하는 방식으로 여러 접근 방식을 혼합하여 사용할 수도 있습니다.