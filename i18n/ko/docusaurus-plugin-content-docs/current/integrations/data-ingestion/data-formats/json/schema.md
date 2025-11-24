---
'title': 'JSON 스키마 설계'
'slug': '/integrations/data-formats/json/schema'
'description': 'JSON 스키마를 최적적으로 설계하는 방법'
'keywords':
- 'json'
- 'clickhouse'
- 'inserting'
- 'loading'
- 'formats'
- 'schema'
- 'structured'
- 'semi-structured'
'score': 20
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import json_column_per_type from '@site/static/images/integrations/data-ingestion/data-formats/json_column_per_type.png';
import json_offsets from '@site/static/images/integrations/data-ingestion/data-formats/json_offsets.png';
import shared_json_column from '@site/static/images/integrations/data-ingestion/data-formats/json_shared_column.png';



# 스키마 설계

[schema inference](/integrations/data-formats/json/inference)를 사용하여 JSON 데이터의 초기 스키마를 설정하고 S3와 같은 위치에서 JSON 데이터 파일을 쿼리할 수 있지만, 사용자는 자신의 데이터에 대한 최적화된 버전 스키마를 설정하는 것을 목표로 해야 합니다. 아래에서는 JSON 구조를 모델링하기 위한 권장 접근 방식을 논의합니다.

## 정적 JSON 대 동적 JSON {#static-vs-dynamic-json}

JSON에 대한 스키마를 정의하는 주된 과제는 각 키의 값에 적합한 유형을 결정하는 것입니다. 사용자는 JSON 계층 구조의 각 키에 대해 다음 규칙을 재귀적으로 적용하여 적합한 유형을 결정할 것을 권장합니다.

1. **원시 유형** - 키의 값이 원시 유형인 경우 (하위 객체에 속하든 루트에 속하든 관계없이) 일반적인 스키마 [설계 모범 사례](/data-modeling/schema-design) 및 [유형 최적화 규칙](/data-modeling/schema-design#optimizing-types)에 따라 해당 유형을 선택해야 합니다. 아래의 `phone_numbers`와 같은 원시 배열은 `Array(<type>)`로 모델링할 수 있습니다. 예: `Array(String)`.
2. **정적 대 동적** - 키의 값이 복합 객체(즉, 객체 또는 객체 배열)인 경우 변경 여부를 설정하십시오. 새로운 키가 거의 추가되지 않는 객체는 새로운 키의 추가가 예측 가능하고 [`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column)을 통해 스키마 변경으로 처리할 수 있는 경우 **정적**으로 간주할 수 있습니다. 이는 일부 JSON 문서에서 제공될 수 있는 키의 부분 집합만 포함하는 객체를 포함합니다. 새로운 키가 자주 추가되거나 예측할 수 없는 객체는 **동적**으로 간주해야 합니다. **수백 또는 수천 개의 하위 키를 갖는 구조는 편의성을 위해 동적이라고 간주될 수 있습니다.**

값이 **정적**인지 **동적**인지 확인하려면 아래의 관련 섹션 [**정적 객체 처리**](/integrations/data-formats/json/schema#handling-static-structures) 및 [**동적 객체 처리**](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures)를 참조하십시오.

<p></p>

**중요:** 위의 규칙은 재귀적으로 적용되어야 합니다. 키의 값이 동적이라고 판단되면 추가 평가가 필요하지 않으며, [**동적 객체 처리**](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures)에서 제시된 지침을 따를 수 있습니다. 객체가 정적이라면 하위 키를 계속 평가하여 키 값이 원시이거나 동적 키가 발견될 때까지 계속하십시오.

이러한 규칙을 설명하기 위해, 우리는 사람을 나타내는 다음 JSON 예제를 사용합니다:

```json
{
  "id": 1,
  "name": "Clicky McCliickHouse",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "address": [
    {
      "street": "Victor Plains",
      "suite": "Suite 879",
      "city": "Wisokyburgh",
      "zipcode": "90566-7771",
      "geo": {
        "lat": -43.9509,
        "lng": -34.4618
      }
    }
  ],
  "phone_numbers": [
    "010-692-6593",
    "020-192-3333"
  ],
  "website": "clickhouse.com",
  "company": {
    "name": "ClickHouse",
    "catchPhrase": "The real-time data warehouse for analytics",
    "labels": {
      "type": "database systems",
      "founded": "2021"
    }
  },
  "dob": "2007-03-31",
  "tags": {
    "hobby": "Databases",
    "holidays": [
      {
        "year": 2024,
        "location": "Azores, Portugal"
      }
    ],
    "car": {
      "model": "Tesla",
      "year": 2023
    }
  }
}
```

이 규칙을 적용하면:

- 루트 키 `name`, `username`, `email`, `website`는 유형 `String`으로 표현될 수 있습니다. `phone_numbers` 컬럼은 `Array(String)` 타입의 원시 배열이며, `dob`와 `id`는 각각 `Date`와 `UInt32` 타입입니다.
- `address` 객체에는 새로운 키가 추가되지 않으므로(새로운 주소 객체만 추가됨) **정적**으로 간주될 수 있습니다. 재귀적으로 진행하면, 하위 컬럼은 `geo`를 제외하고 모두 원시형(유형 `String`)으로 간주될 수 있습니다. 이는 두 개의 `Float32` 컬럼인 `lat`와 `lon`을 가진 정적인 구조입니다.
- `tags` 컬럼은 **동적**입니다. 우리는 새로운 임의의 태그가 이 객체에 추가될 수 있다고 가정합니다.
- `company` 객체는 **정적**이며 항상 최대 세 개의 지정된 키를 포함합니다. 하위 키 `name`과 `catchPhrase`는 `String` 유형입니다. 키 `labels`는 **동적**입니다. 우리는 새로운 임의의 태그가 이 객체에 추가될 수 있다고 가정합니다. 값은 항상 문자열 유형의 키-값 쌍이 될 것입니다.

:::note
수백 또는 수천 개의 정적 키를 가진 구조는 동적으로 간주될 수 있으며, 이는 이러한 구조에 대한 열을 정적으로 선언하는 것이 현실적이지 않기 때문입니다. 그러나 가능하면 필요하지 않은 경로는 [skip paths](#using-type-hints-and-skipping-paths)를 사용하여 저장 공간과 추론 오버헤드를 절약하십시오.
:::

## 정적 구조 처리 {#handling-static-structures}

정적 구조는 명명된 튜플 즉 `Tuple`을 사용하여 처리하는 것이 좋습니다. 객체 배열은 튜플 배열 즉 `Array(Tuple)`을 사용하여 보유할 수 있습니다. 튜플 내부에서도 컬럼과 해당 유형을 동일한 규칙을 사용하여 정의해야 합니다. 이렇게 하면 아래와 같이 중첩된 객체를 나타내기 위해 중첩된 튜플이 생성될 수 있습니다.

이것을 설명하기 위해, 이전의 JSON 사람 예제를 사용하되 동적 객체는 생략합니다:

```json
{
  "id": 1,
  "name": "Clicky McCliickHouse",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "address": [
    {
      "street": "Victor Plains",
      "suite": "Suite 879",
      "city": "Wisokyburgh",
      "zipcode": "90566-7771",
      "geo": {
        "lat": -43.9509,
        "lng": -34.4618
      }
    }
  ],
  "phone_numbers": [
    "010-692-6593",
    "020-192-3333"
  ],
  "website": "clickhouse.com",
  "company": {
    "name": "ClickHouse",
    "catchPhrase": "The real-time data warehouse for analytics"
  },
  "dob": "2007-03-31"
}
```

이 테이블의 스키마는 아래와 같습니다:

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
    `dob` Date
)
ENGINE = MergeTree
ORDER BY username
```

`company` 컬럼이 `Tuple(catchPhrase String, name String)`으로 정의된 것에 주목하십시오. `address` 키는 `Array(Tuple)`를 사용하고, `geo` 컬럼을 나타내기 위해 중첩된 `Tuple`을 사용합니다.

현재 구조의 JSON을 이 테이블에 삽입할 수 있습니다:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}
```

위의 예에서는 데이터가 최소하지만, 아래와 같이 기간으로 구분된 이름을 가진 튜플 컬럼을 쿼리할 수 있습니다.

```sql
SELECT
 address.street,
 company.name
FROM people

┌─address.street────┬─company.name─┐
│ ['Victor Plains'] │ ClickHouse   │
└───────────────────┴──────────────┘
```

`address.street` 컬럼이 `Array`로 반환되는 것을 주목하십시오. 배열 내에서 특정 객체에 위치로 접근하려면, 배열 오프셋을 컬럼 이름 뒤에 지정해야 합니다. 예를 들어 최초의 주소에서 거리 정보에 접근하려면:

```sql
SELECT address.street[1] AS street
FROM people

┌─street────────┐
│ Victor Plains │
└───────────────┘

1 row in set. Elapsed: 0.001 sec.
```

하위 컬럼은 또한 [`24.12`](https://clickhouse.com/blog/clickhouse-release-24-12#json-subcolumns-as-table-primary-key)에서의 정렬 키에서 사용될 수 있습니다:

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
    `dob` Date
)
ENGINE = MergeTree
ORDER BY company.name
```

### 기본값 처리 {#handling-default-values}

JSON 객체가 구조화되어 있더라도, 제공된 키의 부분 집합만 가진 경우가 많습니다. 다행히도 `Tuple` 유형은 JSON 페이로드의 모든 컬럼을 요구하지 않습니다. 제공되지 않은 경우 기본값이 사용됩니다.

앞서 언급한 `people` 테이블과 `suite`, `geo`, `phone_numbers`, `catchPhrase` 키가 누락된 다음과 같은 희소 JSON을 고려하십시오.

```json
{
  "id": 1,
  "name": "Clicky McCliickHouse",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "address": [
    {
      "street": "Victor Plains",
      "city": "Wisokyburgh",
      "zipcode": "90566-7771"
    }
  ],
  "website": "clickhouse.com",
  "company": {
    "name": "ClickHouse"
  },
  "dob": "2007-03-31"
}
```

아래와 같이 이 행이 성공적으로 삽입될 수 있음을 알 수 있습니다:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","city":"Wisokyburgh","zipcode":"90566-7771"}],"website":"clickhouse.com","company":{"name":"ClickHouse"},"dob":"2007-03-31"}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

이 단일 행을 쿼리하면 제외된 컬럼(하위 객체 포함)에 대해 기본값이 사용되는 것을 볼 수 있습니다:

```sql
SELECT *
FROM people
FORMAT PrettyJSONEachRow

{
  "id": "1",
  "name": "Clicky McCliickHouse",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "address": [
    {
      "city": "Wisokyburgh",
      "geo": {
        "lat": 0,
        "lng": 0
      },
      "street": "Victor Plains",
      "suite": "",
      "zipcode": "90566-7771"
    }
  ],
  "phone_numbers": [],
  "website": "clickhouse.com",
  "company": {
    "catchPhrase": "",
    "name": "ClickHouse"
  },
  "dob": "2007-03-31"
}

1 row in set. Elapsed: 0.001 sec.
```

:::note 비어 있거나 Null 구분
사용자가 값이 비어 있는 것과 제공되지 않은 것 사이의 차이를 구분해야 하는 경우, [Nullable](/sql-reference/data-types/nullable) 유형을 사용할 수 있습니다. 이는 [피해야 합니다](/best-practices/select-data-types#avoid-nullable-columns) 절대적으로 필요한 경우를 제외하고, 이러한 컬럼의 저장 공간과 쿼리 성능에 부정적인 영향을 미치기 때문입니다.
:::

### 새로운 컬럼 처리 {#handling-new-columns}

JSON 키가 정적일 때 구조화된 접근 방식이 가장 간단하지만, 스키마의 변경 사항을 계획할 수 있는 경우에는 여전히 이 접근 방식을 사용할 수 있습니다. 즉, 새로운 키가 사전에 알려져 있고 이에 따라 스키마를 수정할 수 있습니다.

ClickHouse는 기본적으로 페이로드에 제공되는 JSON 키 중 스키마에 없는 키를 무시합니다. `nickname` 키가 추가된 다음과 같은 수정된 JSON 페이로드를 고려하십시오:

```json
{
  "id": 1,
  "name": "Clicky McCliickHouse",
  "nickname": "Clicky",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "address": [
    {
      "street": "Victor Plains",
      "suite": "Suite 879",
      "city": "Wisokyburgh",
      "zipcode": "90566-7771",
      "geo": {
        "lat": -43.9509,
        "lng": -34.4618
      }
    }
  ],
  "phone_numbers": [
    "010-692-6593",
    "020-192-3333"
  ],
  "website": "clickhouse.com",
  "company": {
    "name": "ClickHouse",
    "catchPhrase": "The real-time data warehouse for analytics"
  },
  "dob": "2007-03-31"
}
```

이 JSON은 `nickname` 키가 무시된 상태로 성공적으로 삽입될 수 있습니다:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

스키마에 컬럼을 추가하려면 [`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column) 명령을 사용할 수 있습니다. 기본값은 `DEFAULT` 절을 통해 지정할 수 있으며, 이는 다음 삽입 시 지정되지 않은 경우 사용됩니다. 이 값이 없는 행(구성 이전에 삽입된 행)은 기본값을 반환합니다. `DEFAULT` 값이 지정되지 않은 경우, 해당 유형의 기본값이 사용됩니다.

예를 들어:

```sql
-- insert initial row (nickname will be ignored)
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

-- add column
ALTER TABLE people
 (ADD COLUMN `nickname` String DEFAULT 'no_nickname')

-- insert new row (same data different id)
INSERT INTO people FORMAT JSONEachRow
{"id":2,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

-- select 2 rows
SELECT id, nickname FROM people

┌─id─┬─nickname────┐
│  2 │ Clicky      │
│  1 │ no_nickname │
└────┴─────────────┘

2 rows in set. Elapsed: 0.001 sec.
```

## 반정형/동적 구조 처리 {#handling-semi-structured-dynamic-structures}

키가 동적으로 추가되거나 다중 유형을 가질 수 있는 반정형 JSON 데이터의 경우 [`JSON`](/sql-reference/data-types/newjson) 유형을 사용하는 것이 좋습니다.

더 구체적으로, 데이터에 다음과 같은 특성이 있을 때 JSON 유형을 사용하십시오:

- 시간이 지남에 따라 변경될 수 있는 **예측할 수 없는 키**가 있는 경우.
- **다양한 유형**의 값이 포함된 경우 (예: 어떤 경로에서는 문자열이 포함되고, 또 어떤 경로에서는 숫자가 포함될 수 있음).
- 엄격한 유형 지정이 불가능한 곳에서 스키마 유연성이 필요한 경우.
- **수백 또는 수천 개의** 경로가 정적으로 있지만 명시적으로 선언하는 것이 그리 현실적이지 않은 경우. 이는 드문 일입니다.

`company.labels` 객체가 동적으로 결정된 우리의 [이전 사람 JSON](/integrations/data-formats/json/schema#static-vs-dynamic-json)을 고려하십시오.

`company.labels`가 임의의 키를 포함하고 있다고 가정해 봅시다. 또한 이 구조의 어떤 키의 유형은 행마다 일관되지 않을 수 있습니다. 예를 들어:

```json
{
  "id": 1,
  "name": "Clicky McCliickHouse",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "address": [
    {
      "street": "Victor Plains",
      "suite": "Suite 879",
      "city": "Wisokyburgh",
      "zipcode": "90566-7771",
      "geo": {
        "lat": -43.9509,
        "lng": -34.4618
      }
    }
  ],
  "phone_numbers": [
    "010-692-6593",
    "020-192-3333"
  ],
  "website": "clickhouse.com",
  "company": {
    "name": "ClickHouse",
    "catchPhrase": "The real-time data warehouse for analytics",
    "labels": {
      "type": "database systems",
      "founded": "2021",
      "employees": 250
    }
  },
  "dob": "2007-03-31",
  "tags": {
    "hobby": "Databases",
    "holidays": [
      {
        "year": 2024,
        "location": "Azores, Portugal"
      }
    ],
    "car": {
      "model": "Tesla",
      "year": 2023
    }
  }
}
```

```json
{
  "id": 2,
  "name": "Analytica Rowe",
  "username": "Analytica",
  "address": [
    {
      "street": "Maple Avenue",
      "suite": "Apt. 402",
      "city": "Dataford",
      "zipcode": "11223-4567",
      "geo": {
        "lat": 40.7128,
        "lng": -74.006
      }
    }
  ],
  "phone_numbers": [
    "123-456-7890",
    "555-867-5309"
  ],
  "website": "fastdata.io",
  "company": {
    "name": "FastData Inc.",
    "catchPhrase": "Streamlined analytics at scale",
    "labels": {
      "type": [
        "real-time processing"
      ],
      "founded": 2019,
      "dissolved": 2023,
      "employees": 10
    }
  },
  "dob": "1992-07-15",
  "tags": {
    "hobby": "Running simulations",
    "holidays": [
      {
        "year": 2023,
        "location": "Kyoto, Japan"
      }
    ],
    "car": {
      "model": "Audi e-tron",
      "year": 2022
    }
  }
}
```

키 및 유형에 대한 `company.labels` 컬럼의 동적 특성으로 인해, 이 데이터를 모델링할 수 있는 몇 가지 옵션이 있습니다:

- **단일 JSON 컬럼** - 전체 스키마를 단일 `JSON` 컬럼으로 나타내어 아래 모든 구조가 동적이 될 수 있도록 합니다.
- **타겟화된 JSON 컬럼** - 다른 모든 컬럼에 대해 위에서 사용한 구조화된 스키마를 유지하면서 `company.labels` 컬럼에 대해서만 `JSON` 유형을 사용합니다.

첫 번째 접근 방식은 [이전 방법론과 일치하지 않지만](#static-vs-dynamic-json) 단일 JSON 컬럼 접근 방식은 프로토타이핑 및 데이터 엔지니어링 작업에 유용합니다.

ClickHouse의 대규모 프로덕션 배포에는 구조를 구체적으로 정의하고 가능할 때 타겟화된 동적 하위 구조에 대해 JSON 유형을 사용하는 것이 좋습니다.

엄격한 스키마는 여러 가지 이점이 있습니다:

- **데이터 검증** — 엄격한 스키마를 강제하면 특정 구조를 제외하고는 컬럼의 폭발 위험이 줄어듭니다.
- **컬럼 폭발 위험 회피** - JSON 유형은 잠재적으로 수천 개의 컬럼으로 확장되지만, 하위 열이 전용 열로 저장되면 성능에 영향을 미치는 과도한 수의 열 파일이 생성될 수 있습니다. 이를 완화하기 위해 JSON에서 사용되는 기본 [Dynamic type](/sql-reference/data-types/dynamic)은 [`max_dynamic_paths`](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns) 매개변수를 제공하여 별도의 열 파일로 저장되는 고유 경로의 수를 제한합니다. 임계값에 도달하면 추가 경로는 압축된 인코딩 형식을 사용하여 공유 열 파일에 저장되며, 성능 및 저장 효율성을 유지하면서 유연한 데이터 수집을 지원합니다. 그러나 이 공유 열 파일에 대한 액세스는 성능이 낮을 수 있습니다. 논의하자면, JSON 열은 [유형 힌트](#using-type-hints-and-skipping-paths)와 함께 사용할 수 있습니다. "힌트"가 있는 컬럼은 전용 컬럼과 동일한 성능을 제공합니다.
- **경로 및 유형의 더 간단한 직관** - JSON 유형에서 추론된 유형 및 경로를 결정하기 위한 [직관 함수](/sql-reference/data-types/newjson#introspection-functions)를 지원하지만, 정적 구조는 탐색하기 더 간단할 수 있습니다. 예: `DESCRIBE`.

### 단일 JSON 컬럼 {#single-json-column}

이 접근 방식은 프로토타이핑 및 데이터 엔지니어링 작업에 유용합니다. 프로덕션에서는 가능한 경우 동적 하위 구조에 대해서만 `JSON`을 사용하도록 하십시오.

:::note 성능 고려 사항
단일 JSON 컬럼은 필요하지 않은 JSON 경로를 스킵(저장하지 않음)하고 [유형 힌트](#using-type-hints-and-skipping-paths)를 사용하여 최적화할 수 있습니다. 유형 힌트를 사용하면 사용자가 하위 열의 유형을 명시적으로 정의하여 쿼리 시 추론 및 간접 프로세스를 건너뛸 수 있습니다. 이는 명시적 스키마를 사용하는 것과 같은 성능을 제공하는 데 사용될 수 있습니다. 추가적인 세부 정보를 보려면 ["Using type hints and skipping paths"](#using-type-hints-and-skipping-paths)를 참조하십시오.
:::

여기 단일 JSON 컬럼의 스키마는 간단합니다:

```sql
SET enable_json_type = 1;

CREATE TABLE people
(
    `json` JSON(username String)
)
ENGINE = MergeTree
ORDER BY json.username;
```

:::note
`username` 컬럼에 대한 [유형 힌트](#using-type-hints-and-skipping-paths)를 JSON 정의에서 제공하는 이유는 정렬/기본 키에서 사용하기 때문입니다. 이는 ClickHouse가 이 컬럼이 null이 아님을 알 수 있도록 도와주고, 어떤 `username` 하위 컬럼을 사용할지 알 수 있게 합니다 (유형마다 여러 가지가 있을 수 있기 때문에, 그렇지 않다면 이는 애매해질 수 있습니다).
:::

위의 테이블에 행을 삽입하는 것은 `JSONAsObject` 형식을 사용하여 달성할 수 있습니다:

```sql
INSERT INTO people FORMAT JSONAsObject 
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021","employees":250}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

1 row in set. Elapsed: 0.028 sec.

INSERT INTO people FORMAT JSONAsObject
{"id":2,"name":"Analytica Rowe","username":"Analytica","address":[{"street":"Maple Avenue","suite":"Apt. 402","city":"Dataford","zipcode":"11223-4567","geo":{"lat":40.7128,"lng":-74.006}}],"phone_numbers":["123-456-7890","555-867-5309"],"website":"fastdata.io","company":{"name":"FastData Inc.","catchPhrase":"Streamlined analytics at scale","labels":{"type":["real-time processing"],"founded":2019,"dissolved":2023,"employees":10}},"dob":"1992-07-15","tags":{"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}}

1 row in set. Elapsed: 0.004 sec.
```

```sql
SELECT *
FROM people
FORMAT Vertical

Row 1:
──────
json: {"address":[{"city":"Dataford","geo":{"lat":40.7128,"lng":-74.006},"street":"Maple Avenue","suite":"Apt. 402","zipcode":"11223-4567"}],"company":{"catchPhrase":"Streamlined analytics at scale","labels":{"dissolved":"2023","employees":"10","founded":"2019","type":["real-time processing"]},"name":"FastData Inc."},"dob":"1992-07-15","id":"2","name":"Analytica Rowe","phone_numbers":["123-456-7890","555-867-5309"],"tags":{"car":{"model":"Audi e-tron","year":"2022"},"hobby":"Running simulations","holidays":[{"location":"Kyoto, Japan","year":"2023"}]},"username":"Analytica","website":"fastdata.io"}

Row 2:
──────
json: {"address":[{"city":"Wisokyburgh","geo":{"lat":-43.9509,"lng":-34.4618},"street":"Victor Plains","suite":"Suite 879","zipcode":"90566-7771"}],"company":{"catchPhrase":"The real-time data warehouse for analytics","labels":{"employees":"250","founded":"2021","type":"database systems"},"name":"ClickHouse"},"dob":"2007-03-31","email":"clicky@clickhouse.com","id":"1","name":"Clicky McCliickHouse","phone_numbers":["010-692-6593","020-192-3333"],"tags":{"car":{"model":"Tesla","year":"2023"},"hobby":"Databases","holidays":[{"location":"Azores, Portugal","year":"2024"}]},"username":"Clicky","website":"clickhouse.com"}

2 rows in set. Elapsed: 0.005 sec.
```

우리는 [직관 함수](/sql-reference/data-types/newjson#introspection-functions)를 사용하여 추론된 하위 열과 해당 유형을 확인할 수 있습니다. 예를 들어:

```sql
SELECT JSONDynamicPathsWithTypes(json) AS paths
FROM people
FORMAT PrettyJsonEachRow

{
    "paths": {
        "address": "Array(JSON(max_dynamic_types=16, max_dynamic_paths=256))",
        "company.catchPhrase": "String",
        "company.labels.employees": "Int64",
        "company.labels.founded": "String",
        "company.labels.type": "String",
        "company.name": "String",
        "dob": "Date",
        "email": "String",
        "id": "Int64",
        "name": "String",
        "phone_numbers": "Array(Nullable(String))",
        "tags.car.model": "String",
        "tags.car.year": "Int64",
        "tags.hobby": "String",
        "tags.holidays": "Array(JSON(max_dynamic_types=16, max_dynamic_paths=256))",
        "website": "String"
 }
}
{
    "paths": {
        "address": "Array(JSON(max_dynamic_types=16, max_dynamic_paths=256))",
        "company.catchPhrase": "String",
        "company.labels.dissolved": "Int64",
        "company.labels.employees": "Int64",
        "company.labels.founded": "Int64",
        "company.labels.type": "Array(Nullable(String))",
        "company.name": "String",
        "dob": "Date",
        "id": "Int64",
        "name": "String",
        "phone_numbers": "Array(Nullable(String))",
        "tags.car.model": "String",
        "tags.car.year": "Int64",
        "tags.hobby": "String",
        "tags.holidays": "Array(JSON(max_dynamic_types=16, max_dynamic_paths=256))",
        "website": "String"
 }
}

2 rows in set. Elapsed: 0.009 sec.
```

추론 기능의 완전한 목록은 ["Introspection functions"](/sql-reference/data-types/newjson#introspection-functions)를 참조하십시오.

[하위 경로에 접근할 수 있습니다](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns) `.` 표기법을 사용하여 예:

```sql
SELECT json.name, json.email FROM people

┌─json.name────────────┬─json.email────────────┐
│ Analytica Rowe       │ ᴺᵁᴸᴸ                  │
│ Clicky McCliickHouse │ clicky@clickhouse.com │
└──────────────────────┴───────────────────────┘

2 rows in set. Elapsed: 0.006 sec.
```

행에 없는 컬럼이 `NULL`로 반환되는 것을 주목하십시오.

또한 동일한 유형의 경로에 대해 별도의 하위 컬럼이 생성됩니다. 예를 들어, `company.labels.type`에 대해 `String` 및 `Array(Nullable(String))` 두 가지 유형의 하위 컬럼이 존재합니다. 가능할 경우 두 개가 모두 반환되지만, `.:` 구문을 사용하여 특정 하위 컬럼을 타겟팅할 수 있습니다:

```sql
SELECT json.company.labels.type
FROM people

┌─json.company.labels.type─┐
│ database systems         │
│ ['real-time processing'] │
└──────────────────────────┘

2 rows in set. Elapsed: 0.007 sec.

SELECT json.company.labels.type.:String
FROM people

┌─json.company⋯e.:`String`─┐
│ ᴺᵁᴸᴸ                     │
│ database systems         │
└──────────────────────────┘

2 rows in set. Elapsed: 0.009 sec.
```

중첩된 하위 객체를 반환하려면 `^`가 필요합니다. 이는 높은 수의 열을 읽지 않도록 설계된 선택입니다 - 명시적으로 요청되지 않는 한. `^` 없이 접근된 객체는 NULL을 반환하게 됩니다, 아래와 같이:

```sql
-- sub objects will not be returned by default
SELECT json.company.labels
FROM people

┌─json.company.labels─┐
│ ᴺᵁᴸᴸ                │
│ ᴺᵁᴸᴸ                │
└─────────────────────┘

2 rows in set. Elapsed: 0.002 sec.

-- return sub objects using ^ notation
SELECT json.^company.labels
FROM people

┌─json.^`company`.labels─────────────────────────────────────────────────────────────────┐
│ {"employees":"250","founded":"2021","type":"database systems"}                         │
│ {"dissolved":"2023","employees":"10","founded":"2019","type":["real-time processing"]} │
└────────────────────────────────────────────────────────────────────────────────────────┘

2 rows in set. Elapsed: 0.004 sec.
```

### 타겟화된 JSON 컬럼 {#targeted-json-column}

프로토타이핑 및 데이터 엔지니어링 문제에서 유용하지만, 가능한 경우 프로덕션에서는 명시적 스키마를 사용하는 것이 좋습니다.

이전 예를 `company.labels` 컬럼에 대해 단일 `JSON` 컬럼으로 모델링할 수 있습니다.

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
    `company` Tuple(catchPhrase String, name String, labels JSON),
    `dob` Date,
    `tags` String
)
ENGINE = MergeTree
ORDER BY username
```

위의 테이블에 `JSONEachRow` 형식을 사용하여 삽입할 수 있습니다:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021","employees":250}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

1 row in set. Elapsed: 0.450 sec.

INSERT INTO people FORMAT JSONEachRow
{"id":2,"name":"Analytica Rowe","username":"Analytica","address":[{"street":"Maple Avenue","suite":"Apt. 402","city":"Dataford","zipcode":"11223-4567","geo":{"lat":40.7128,"lng":-74.006}}],"phone_numbers":["123-456-7890","555-867-5309"],"website":"fastdata.io","company":{"name":"FastData Inc.","catchPhrase":"Streamlined analytics at scale","labels":{"type":["real-time processing"],"founded":2019,"dissolved":2023,"employees":10}},"dob":"1992-07-15","tags":{"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}}

1 row in set. Elapsed: 0.440 sec.
```

```sql
SELECT *
FROM people
FORMAT Vertical

Row 1:
──────
id:            2
name:          Analytica Rowe
username:      Analytica
email:
address:       [('Dataford',(40.7128,-74.006),'Maple Avenue','Apt. 402','11223-4567')]
phone_numbers: ['123-456-7890','555-867-5309']
website:       fastdata.io
company:       ('Streamlined analytics at scale','FastData Inc.','{"dissolved":"2023","employees":"10","founded":"2019","type":["real-time processing"]}')
dob:           1992-07-15
tags:          {"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}

Row 2:
──────
id:            1
name:          Clicky McCliickHouse
username:      Clicky
email:         clicky@clickhouse.com
address:       [('Wisokyburgh',(-43.9509,-34.4618),'Victor Plains','Suite 879','90566-7771')]
phone_numbers: ['010-692-6593','020-192-3333']
website:       clickhouse.com
company:       ('The real-time data warehouse for analytics','ClickHouse','{"employees":"250","founded":"2021","type":"database systems"}')
dob:           2007-03-31
tags:          {"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}

2 rows in set. Elapsed: 0.005 sec.
```

[직관 함수](/sql-reference/data-types/newjson#introspection-functions)를 사용하여 `company.labels` 컬럼에 대한 추론된 경로와 유형을 결정할 수 있습니다.

```sql
SELECT JSONDynamicPathsWithTypes(company.labels) AS paths
FROM people
FORMAT PrettyJsonEachRow

{
    "paths": {
        "dissolved": "Int64",
        "employees": "Int64",
        "founded": "Int64",
        "type": "Array(Nullable(String))"
 }
}
{
    "paths": {
        "employees": "Int64",
        "founded": "String",
        "type": "String"
 }
}

2 rows in set. Elapsed: 0.003 sec.
```

### 유형 힌트 및 경로 스킵 하기 {#using-type-hints-and-skipping-paths}

유형 힌트는 경로와 하위 컬럼에 대한 유형을 지정할 수 있도록 하여 불필요한 유형 추론을 방지합니다. JSON 컬럼 `company.labels` 내에서 `dissolved`, `employees`, 및 `founded` 키에 대한 유형을 지정하는 예를 고려하십시오.

```sql
CREATE TABLE people
(
    `id` Int64,
    `name` String,
    `username` String,
    `email` String,
    `address` Array(Tuple(
        city String,
        geo Tuple(
            lat Float32,
            lng Float32),
        street String,
        suite String,
        zipcode String)),
    `phone_numbers` Array(String),
    `website` String,
    `company` Tuple(
        catchPhrase String,
        name String,
        labels JSON(dissolved UInt16, employees UInt16, founded UInt16)),
    `dob` Date,
    `tags` String
)
ENGINE = MergeTree
ORDER BY username
```

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021","employees":250}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

1 row in set. Elapsed: 0.450 sec.

INSERT INTO people FORMAT JSONEachRow
{"id":2,"name":"Analytica Rowe","username":"Analytica","address":[{"street":"Maple Avenue","suite":"Apt. 402","city":"Dataford","zipcode":"11223-4567","geo":{"lat":40.7128,"lng":-74.006}}],"phone_numbers":["123-456-7890","555-867-5309"],"website":"fastdata.io","company":{"name":"FastData Inc.","catchPhrase":"Streamlined analytics at scale","labels":{"type":["real-time processing"],"founded":2019,"dissolved":2023,"employees":10}},"dob":"1992-07-15","tags":{"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}}

1 row in set. Elapsed: 0.440 sec.
```

이 컬럼들이 우리의 명시적 유형을 갖고 있는 것을 알아차리십시오:

```sql
SELECT JSONAllPathsWithTypes(company.labels) AS paths
FROM people
FORMAT PrettyJsonEachRow

{
    "paths": {
        "dissolved": "UInt16",
        "employees": "UInt16",
        "founded": "UInt16",
        "type": "String"
 }
}
{
    "paths": {
        "dissolved": "UInt16",
        "employees": "UInt16",
        "founded": "UInt16",
        "type": "Array(Nullable(String))"
 }
}

2 rows in set. Elapsed: 0.003 sec.
```

또한, 저장하고 싶지 않은 JSON 내의 경로는 [`SKIP` 및 `SKIP REGEXP`](/sql-reference/data-types/newjson) 매개변수를 사용하여 스킵하여 저장 공간을 최소화하고 불필요한 경로에 대한 추론을 피할 수 있습니다. 예를 들어, 위 데이터를 위해 단일 JSON 컬럼을 사용하는 경우 `address` 및 `company` 경로를 스킵할 수 있습니다:

```sql
CREATE TABLE people
(
    `json` JSON(username String, SKIP address, SKIP company)
)
ENGINE = MergeTree
ORDER BY json.username

INSERT INTO people FORMAT JSONAsObject
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021","employees":250}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

1 row in set. Elapsed: 0.450 sec.

INSERT INTO people FORMAT JSONAsObject
{"id":2,"name":"Analytica Rowe","username":"Analytica","address":[{"street":"Maple Avenue","suite":"Apt. 402","city":"Dataford","zipcode":"11223-4567","geo":{"lat":40.7128,"lng":-74.006}}],"phone_numbers":["123-456-7890","555-867-5309"],"website":"fastdata.io","company":{"name":"FastData Inc.","catchPhrase":"Streamlined analytics at scale","labels":{"type":["real-time processing"],"founded":2019,"dissolved":2023,"employees":10}},"dob":"1992-07-15","tags":{"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}}

1 row in set. Elapsed: 0.440 sec.
```

데이터에서 우리의 컬럼이 제외된 것을 주목하십시오:

```sql

SELECT *
FROM people
FORMAT PrettyJSONEachRow

{
    "json": {
        "dob" : "1992-07-15",
        "id" : "2",
        "name" : "Analytica Rowe",
        "phone_numbers" : [
            "123-456-7890",
            "555-867-5309"
        ],
        "tags" : {
            "car" : {
                "model" : "Audi e-tron",
                "year" : "2022"
            },
            "hobby" : "Running simulations",
            "holidays" : [
                {
                    "location" : "Kyoto, Japan",
                    "year" : "2023"
                }
            ]
        },
        "username" : "Analytica",
        "website" : "fastdata.io"
    }
}
{
    "json": {
        "dob" : "2007-03-31",
        "email" : "clicky@clickhouse.com",
        "id" : "1",
        "name" : "Clicky McCliickHouse",
        "phone_numbers" : [
            "010-692-6593",
            "020-192-3333"
        ],
        "tags" : {
            "car" : {
                "model" : "Tesla",
                "year" : "2023"
            },
            "hobby" : "Databases",
            "holidays" : [
                {
                    "location" : "Azores, Portugal",
                    "year" : "2024"
                }
            ]
        },
        "username" : "Clicky",
        "website" : "clickhouse.com"
    }
}

2 rows in set. Elapsed: 0.004 sec.
```

#### 유형 힌트로 성능 최적화 {#optimizing-performance-with-type-hints}  

유형 힌트는 불필요한 유형 추론을 피하는 것 이상의 기능을 제공합니다 - 저장 및 프로세싱 간접성을 완전히 제거할 수 있으며, [최적의 원시 유형](/data-modeling/schema-design#optimizing-types)을 지정할 수 있게 해줍니다. 유형 힌트가 있는 JSON 경로는 전통적인 컬럼과 genauso 저장되어 추상화된 [**식별자 열**](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data)나 쿼리 시 동적 해상도가 필요하지 않습니다. 

결과적으로, 잘 정의된 유형 힌트를 통해 중첩 JSON 키는 처음부터 최상위 열로 모델링한 것과 동일한 성능과 효율성을 달성합니다. 

실제로 일관성이 높지만 여전히 JSON의 유연성에서 이점을 누릴 수 있는 데이터 세트에 대해 유형 힌트는 스키마 또는 수집 파이프라인을 재구성할 필요 없이 성능을 유지하는 편리한 방법을 제공합니다.

### 동적 경로 설정 {#configuring-dynamic-paths}

ClickHouse는 각 JSON 경로를 진정한 컬럼형 레이아웃에서 하위 컬럼으로 저장하여 전통적인 컬럼에서 볼 수 있는 동일한 성능 이점을 가능하게 합니다. - 압축, SIMD 가속 처리, 최소 디스크 I/O 등. JSON 데이터의 각 고유 경로 및 유형 조합은 디스크의 개별 컬럼 파일이 될 수 있습니다.

<Image img={json_column_per_type} size="md" alt="Column per JSON path" />

예를 들어 두 개의 JSON 경로가 서로 다른 유형으로 삽입될 때, ClickHouse는 각 [구체적인 유형을 별도의 하위 컬럼](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data)으로 저장합니다. 이러한 하위 컬럼은 독립적으로 액세스할 수 있어 불필요한 I/O를 최소화합니다. 여러 유형이 있는 컬럼을 쿼리할 때, 여전히 값이 단일 컬럼 응답으로 반환됩니다.

또한 ClickHouse는 오프셋을 활용하여 이러한 하위 컬럼을 조밀하게 유지하고, 누락된 JSON 경로에 대해 기본값이 저장되지 않게 합니다. 이 접근 방식은 압축을 극대화하고 추가 I/O를 줄입니다.

<Image img={json_offsets} size="md" alt="JSON offsets" />

그러나, 높은 카디널리티 또는 매우 가변적인 JSON 구조가 있는 경우(예: 텔레메트리 파이프라인, 로그, 또는 머신러닝 특성 저장소) 이러한 동작은 컬럼 파일의 폭발을 초래할 수 있습니다. 새로운 고유 JSON 경로마다 새로운 컬럼 파일이 생성되고, 해당 경로 내의 각 유형 변형에 대해서도 추가 컬럼 파일이 생성됩니다. 이는 읽기 성능에 최적이지만, 운영적 문제를 초래할 수 있습니다: 파일 설명자 고갈, 메모리 사용 증가, 그리고 높은 소형 파일 수로 인해 느려진 병합.

이를 완화하기 위해 ClickHouse는 오버플로우 하위 컬럼의 개념을 도입합니다: 고유 JSON 경로의 수가 임계값을 초과하면 추가 경로는 압축된 인코딩 형식을 사용하여 단일 공유 파일에 저장됩니다. 이 파일은 여전히 쿼리가 가능하지만 전용 하위 열과 동일한 성능 특혜를 누리지 못합니다.

<Image img={shared_json_column} size="md" alt="Shared JSON column" />

이 임계값은 JSON 유형 선언에서 [`max_dynamic_paths`](/sql-reference/data-types/newjson#reaching-the-limit-of-dynamic-paths-inside-json) 매개변수로 제어됩니다.

```sql
CREATE TABLE logs
(
    payload JSON(max_dynamic_paths = 500)
)
ENGINE = MergeTree
ORDER BY tuple();
```

**이 매개변수를 너무 높게 설정하지 마십시오** - 큰 값은 리소스 소비를 증가시키고 효율성을 감소시킵니다. 일반적으로 10,000 미만으로 유지하십시오. 높은 동적 구조를 가진 작업 부하의 경우 저장되는 내용을 제한하기 위해 유형 힌트 및 `SKIP` 매개변수를 사용하십시오.

이 새로운 열 유형의 구현에 대해 궁금한 사용자는 ["A New Powerful JSON Data Type for ClickHouse"](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse)라는 상세 블로그 게시물을 읽기를 권장합니다.
