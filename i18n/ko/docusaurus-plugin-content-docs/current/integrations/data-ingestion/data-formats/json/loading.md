---
'sidebar_label': 'JSON 로드하기'
'sidebar_position': 20
'title': 'JSON 작업하기'
'slug': '/integrations/data-formats/json/loading'
'description': 'JSON 로드하기'
'keywords':
- 'json'
- 'clickhouse'
- 'inserting'
- 'loading'
- 'inserting'
'score': 15
'doc_type': 'guide'
---


# JSON 로드 {#loading-json}

다음 예제는 구조화된 JSON 데이터와 반구조화된 JSON 데이터를 로드하는 매우 간단한 예를 제공합니다. 중첩 구조를 포함한 더 복잡한 JSON에 대해서는 가이드 [**JSON 스키마 디자인**](/integrations/data-formats/json/schema)을 참조하세요.

## 구조화된 JSON 로드 {#loading-structured-json}

이 섹션에서는 JSON 데이터가 [`NDJSON`](https://github.com/ndjson/ndjson-spec) (Newline delimited JSON) 형식으로 되어 있으며 ClickHouse에서는 [`JSONEachRow`](/interfaces/formats/JSONEachRow)로 알려진 형태라고 가정합니다. 구조가 잘 정의되어 있으며 즉, 컬럼 이름과 타입이 고정되어 있습니다. `NDJSON`은 간결성 및 공간의 효율적인 사용으로 인해 JSON을 로드하는 데 선호되는 형식이지만, 다른 입력 및 출력 형식도 지원됩니다 [input and output](/interfaces/formats/JSON).

다음 JSON 샘플은 [Python PyPI 데이터셋](https://clickpy.clickhouse.com/)의 행을 나타냅니다.

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

이 JSON 객체를 ClickHouse에 로드하려면 테이블 스키마를 정의해야 합니다.

이 간단한 경우에 우리의 구조는 정적이며, 컬럼 이름은 알려져 있고 그 타입도 잘 정의되어 있습니다.

ClickHouse는 키 이름과 타입이 동적일 수 있는 JSON 타입을 통해 반구조화된 데이터를 지원하지만, 여기서는 불필요합니다.

:::note 가능하면 정적 스키마를 선호하세요
컬럼의 이름과 타입이 고정되어 있고 새로운 컬럼이 예상되지 않는 경우, 프로덕션에서는 항상 정적으로 정의된 스키마를 선호하세요.

JSON 타입은 컬럼의 이름과 타입이 변경될 수 있는 매우 동적인 데이터에 선호됩니다. 이 타입은 프로토타입 제작과 데이터 탐색에도 유용합니다.
:::

여기에 대한 간단한 스키마는 아래에 표시되어 있으며, **JSON 키가 컬럼 이름에 매핑됩니다**:

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

:::note 정렬 키
여기에서 `ORDER BY` 절을 통해 정렬 키를 선택했습니다. 정렬 키에 대한 자세한 내용과 선택하는 방법은 [여기](/data-modeling/schema-design#choosing-an-ordering-key)를 참조하세요.
:::

ClickHouse는 여러 형식의 JSON 데이터를 로드할 수 있으며, 파일 확장자와 내용에 따라 자동으로 타입을 추론합니다. 위의 테이블을 위해 JSON 파일을 읽으려면 [S3 함수](/sql-reference/table-functions/s3)를 사용할 수 있습니다:

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz')
LIMIT 1
┌───────date─┬─country_code─┬─project────────────┬─type────────┬─installer────┬─python_minor─┬─system─┬─version─┐
│ 2022-11-15 │ CN           │ clickhouse-connect │ bdist_wheel │ bandersnatch │              │        │ 0.2.8 │
└────────────┴──────────────┴────────────────────┴─────────────┴──────────────┴──────────────┴────────┴─────────┘

1 row in set. Elapsed: 1.232 sec.
```

파일 형식을 명시할 필요가 없다는 점에 유의하세요. 대신, 우리는 버킷 내의 모든 `*.json.gz` 파일을 읽기 위해 글로브 패턴을 사용합니다. ClickHouse는 파일 확장자와 내용을 기반으로 형식이 `JSONEachRow` (ndjson) 임을 자동으로 추론합니다. ClickHouse가 이를 감지할 수 없는 경우 매개변수 함수 를 통해 형식을 수동으로 지정할 수 있습니다.

```sql
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz', JSONEachRow)
```

:::note 압축된 파일
위의 파일은 또한 압축되어 있습니다. 이는 ClickHouse에 의해 자동으로 감지되고 처리됩니다.
:::

이 파일의 행을 로드하려면 [`INSERT INTO SELECT`](/sql-reference/statements/insert-into#inserting-the-results-of-select)를 사용할 수 있습니다:

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

행은 [`FORMAT` 절](/sql-reference/statements/select/format)을 사용하여 인라인으로도 로드할 수 있습니다 예:

```sql
INSERT INTO pypi
FORMAT JSONEachRow
{"date":"2022-11-15","country_code":"CN","project":"clickhouse-connect","type":"bdist_wheel","installer":"bandersnatch","python_minor":"","system":"","version":"0.2.8"}
```

이 예제는 `JSONEachRow` 형식의 사용을 가정합니다. 다른 일반적인 JSON 형식도 지원되며, 이들에 대한 로드 예시는 [여기](/integrations/data-formats/json/other-formats)에 제공됩니다.

## 반구조화된 JSON 로드 {#loading-semi-structured-json}

이전 예제에서는 고정된 키 이름과 타입을 가진 정적인 JSON을 로드했습니다. 그러나 이는 종종 그렇지 않습니다 - 키가 추가되거나 그 타입이 변경될 수 있습니다. 이는 가시성 데이터와 같은 사용 사례에서 일반적입니다.

ClickHouse는 이를 전용 [`JSON`](/sql-reference/data-types/newjson) 타입을 통해 처리합니다.

다음 예제를 고려해 보세요. 이는 위의 [Python PyPI 데이터셋](https://clickpy.clickhouse.com/)의 확장 버전입니다. 여기에서는 임의의 `tags` 컬럼을 추가하여 랜덤 키 값 쌍을 포함하고 있습니다.

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

여기 태그 컬럼은 예측할 수 없으므로 모델링할 수 없습니다. 이 데이터를 로드하기 위해 이전 스키마를 사용할 수 있지만, [`JSON`](/sql-reference/data-types/newjson) 타입의 추가 `tags` 컬럼을 제공해야 합니다:

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

원래 데이터셋과 동일한 방식으로 테이블을 채울 수 있습니다:

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

데이터 로드 성능의 차이에 주목하세요. JSON 컬럼은 삽입 시간에 타입 추론이 필요하며 여러 타입을 가진 컬럼이 존재하는 경우 추가 저장 공간이 필요합니다. JSON 타입은 컬럼을 명시적으로 선언하는 경우와 동등한 성능을 위해 구성할 수 있지만 (자세한 내용은 [JSON 스키마 디자인](/integrations/data-formats/json/schema) 참조), 의도적으로 기본적으로 유연합니다. 그러나 이러한 유연성은 비용이 들어갑니다.

### JSON 타입을 사용할 때 {#when-to-use-the-json-type}

데이터에 다음과 같은 특성이 있을 때 JSON 타입을 사용하세요:

* 시간이 지남에 따라 변경될 수 있는 **예측할 수 없는 키**가 있습니다.
* **다양한 타입의 값을** 포함하고 있습니다 (예: 경로가 때때로 문자열을 포함할 수 있고, 때때로 숫자를 포함할 수 있음).
* 엄격한 타입 지정을 사용할 수 없는 경우에 스키마 유연성이 필요합니다.

데이터 구조가 알려져 있고 일관성이 있는 경우, JSON 타입을 사용할 필요는 거의 없습니다. 특히 데이터가 다음과 같은 경우:

* **알려진 키를 가진 평면 구조**: 표준 컬럼 타입을 사용하세요. 예: String.
* **예측 가능한 중첩 구조**: 이러한 구조에 대해 Tuple, Array 또는 Nested 타입을 사용하세요.
* **다양한 타입을 가진 예측 가능한 구조**: 대신 Dynamic 또는 Variant 타입을 고려하세요.

위의 예제에서처럼 접근 방식을 혼합할 수도 있습니다. 예측 가능한 최상위 키에 대해 정적 컬럼을 사용하고, 페이로드의 동적 섹션에 대해 단일 JSON 컬럼을 사용할 수 있습니다.
