---
'sidebar_title': 'Query API Endpoints'
'slug': '/cloud/get-started/query-endpoints'
'description': '저장된 쿼리에서 REST API 엔드포인트를 쉽게 생성하세요'
'keywords':
- 'api'
- 'query api endpoints'
- 'query endpoints'
- 'query rest api'
'title': '쿼리 API 엔드포인트'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import endpoints_testquery from '@site/static/images/cloud/sqlconsole/endpoints-testquery.png';
import endpoints_savequery from '@site/static/images/cloud/sqlconsole/endpoints-savequery.png';
import endpoints_configure from '@site/static/images/cloud/sqlconsole/endpoints-configure.png';
import endpoints_completed from '@site/static/images/cloud/sqlconsole/endpoints-completed.png';
import endpoints_curltest from '@site/static/images/cloud/sqlconsole/endpoints-curltest.png';
import endpoints_monitoring from '@site/static/images/cloud/sqlconsole/endpoints-monitoring.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# 쿼리 API 엔드포인트 설정

**쿼리 API 엔드포인트** 기능을 사용하면 ClickHouse Cloud 콘솔의 모든 저장된 SQL 쿼리에서 API 엔드포인트를 직접 생성할 수 있습니다. 이를 통해 네이티브 드라이버를 통해 ClickHouse Cloud 서비스에 연결하지 않고도 HTTP를 통해 API 엔드포인트에 액세스하여 저장된 쿼리를 실행할 수 있습니다.

## 전제 조건 {#quick-start-guide}

진행하기 전에 다음을 준비하세요:
- 적절한 권한이 있는 API 키
- 관리자 콘솔 역할

아직 API 키가 없다면 이 가이드를 따라 [API 키를 생성하세요](/cloud/manage/openapi).

:::note 최소 권한
API 엔드포인트를 쿼리하기 위해 API 키는 `쿼리 엔드포인트` 서비스 액세스 권한이 있는 `회원` 조직 역할을 가지고 있어야 합니다. 데이터베이스 역할은 엔드포인트를 생성할 때 구성됩니다.
:::

<VerticalStepper headerLevel="h3">

### 저장된 쿼리 만들기 {#creating-a-saved-query}

저장된 쿼리가 이미 있다면 이 단계를 건너갈 수 있습니다.

새 쿼리 탭을 엽니다. 설명을 위해 [youtube 데이터셋](/getting-started/example-datasets/youtube-dislikes)을 사용할 것입니다. 이 데이터셋은 약 45억 개의 기록을 포함하고 있습니다.
["테이블 만들기"](/getting-started/example-datasets/youtube-dislikes#create-the-table) 섹션의 단계를 따라 Cloud 서비스에서 테이블을 생성하고 데이터를 삽입하세요.

:::tip `LIMIT` 행 수 제한
예시 데이터셋 자습서는 많은 데이터를 삽입합니다 - 46.5억 행이므로 삽입하는 데 시간이 걸릴 수 있습니다. 
이 가이드를 위해 더 적은 양의 데이터를 삽입하기 위해 `LIMIT` 절을 사용하는 것이 좋습니다. 예를 들면, 1,000만 행을 사용할 수 있습니다.
:::

예시 쿼리로는 사용자 입력 `year` 매개변수에 따라 비디오당 평균 조회수가 가장 많은 상위 10명의 업로더를 반환합니다.

```sql
WITH sum(view_count) AS view_sum,
  round(view_sum / num_uploads, 2) AS per_upload
SELECT
  uploader,
  count() AS num_uploads,
  formatReadableQuantity(view_sum) AS total_views,
  formatReadableQuantity(per_upload) AS views_per_video
FROM
  youtube
WHERE
-- highlight-next-line
  toYear(upload_date) = {year: UInt16}
GROUP BY uploader
ORDER BY per_upload desc
  LIMIT 10
```

위 코드 스니펫에서 강조된 바와 같이 이 쿼리에는 매개변수(`year`)가 포함되어 있습니다. 
중괄호 `{ }`와 함께 매개변수의 유형을 사용하여 쿼리 매개변수를 지정할 수 있습니다. 
SQL 콘솔 쿼리 편집기는 ClickHouse 쿼리 매개변수 표현식을 자동으로 감지하고 각 매개변수에 대한 입력을 제공합니다.

이 쿼리가 작동하는지 확인하기 위해 SQL 편집기의 오른쪽에 있는 쿼리 변수 입력 상자에 `2010`년을 지정하여 이 쿼리를 빨리 실행해보겠습니다:

<Image img={endpoints_testquery} size="md" alt="예시 쿼리 테스트" />

다음으로 쿼리를 저장합니다:

<Image img={endpoints_savequery} size="md" alt="예시 쿼리 저장" />

저장된 쿼리와 관련된 문서는 ["쿼리 저장하기"](/cloud/get-started/sql-console#saving-a-query) 섹션에서 확인할 수 있습니다.

### 쿼리 API 엔드포인트 구성하기 {#configuring-the-query-api-endpoint}

쿼리 API 엔드포인트는 쿼리 보기에서 **공유** 버튼을 클릭하고 `API Endpoint`를 선택하여 구성할 수 있습니다. 
어떤 API 키가 엔드포인트에 액세스할 수 있는지 지정하라는 메시지가 표시됩니다:

<Image img={endpoints_configure} size="md" alt="쿼리 엔드포인트 구성" />

API 키를 선택한 후에는 다음을 요청받습니다:
- 쿼리를 실행하는 데 사용할 데이터베이스 역할 선택(`전체 접근`, `읽기 전용` 또는 `사용자 정의 역할 생성`)
- 교차 출처 리소스 공유(CORS)가 허용된 도메인 지정

이 옵션을 선택하면 쿼리 API 엔드포인트가 자동으로 프로비저닝됩니다.

테스트 요청을 보낼 수 있도록 예시 `curl` 명령이 표시됩니다:

<Image img={endpoints_completed} size="md" alt="엔드포인트 curl 명령" />

인터페이스에 표시된 curl 명령은 편의성을 위해 아래에 나열되어 있습니다:

```bash
curl -H "Content-Type: application/json" -s --user '<key_id>:<key_secret>' '<API-endpoint>?format=JSONEachRow&param_year=<value>'
```

### 쿼리 API 매개변수 {#query-api-parameters}

쿼리의 쿼리 매개변수는 `{parameter_name: type}` 구문으로 지정할 수 있습니다. 이러한 매개변수는 자동으로 감지되며 예시 요청 페이로드에는 이러한 매개변수를 전송할 수 있는 `queryVariables` 객체가 포함됩니다.

### 테스트 및 모니터링 {#testing-and-monitoring}

쿼리 API 엔드포인트가 생성된 후 `curl` 또는 다른 HTTP 클라이언트를 사용하여 올바르게 작동하는지 테스트할 수 있습니다:

<Image img={endpoints_curltest} size="md" alt="엔드포인트 curl 테스트" />

첫 번째 요청을 보낸 후, **공유** 버튼 오른쪽에 새로운 버튼이 즉시 나타납니다. 이를 클릭하면 쿼리에 대한 모니터링 데이터가 포함된 플라이아웃이 열립니다:

<Image img={endpoints_monitoring} size="sm" alt="엔드포인트 모니터링" />

</VerticalStepper>

## 구현 세부정보 {#implementation-details}

이 엔드포인트는 저장된 쿼리 API 엔드포인트에서 쿼리를 실행합니다. 
여러 버전을 지원하며, 유연한 응답 형식, 매개변수화된 쿼리 및 선택적 스트리밍 응답(버전 2 전용)을 지원합니다.

**엔드포인트:**

```text
GET /query-endpoints/{queryEndpointId}/run
POST /query-endpoints/{queryEndpointId}/run
```

### HTTP 메서드 {#http-methods}

| 메서드 | 사용 사례 | 매개변수 |
|---------|----------|------------|
| **GET** | 매개변수가 있는 간단한 쿼리 | URL 매개변수로 쿼리 변수 전달 (`?param_name=value`) |
| **POST** | 복잡한 쿼리 또는 요청 본문 사용 시 | 요청 본문에 쿼리 변수 전달 (`queryVariables` 객체) |

**GET을 사용할 때:**
- 복잡한 중첩 데이터가 없는 간단한 쿼리
- 매개변수가 쉽게 URL 인코딩될 수 있음
- HTTP GET 의미론의 캐싱 이점

**POST를 사용할 때:**
- 복잡한 쿼리 변수(배열, 객체, 대용량 문자열)
- 보안/프라이버시를 위해 요청 본문 선호 시
- 스트리밍 파일 업로드 또는 대용량 데이터

### 인증 {#authentication}

**필수:** 예  
**방법:** OpenAPI 키/비밀을 사용한 기본 인증  
**권한:** 쿼리 엔드포인트에 대한 적절한 권한

### 요청 구성 {#request-configuration}

#### URL 매개변수 {#url-params}

| 매개변수 | 필수 | 설명 |
|-----------|----------|-------------|
| `queryEndpointId` | **예** | 실행할 쿼리 엔드포인트의 고유 식별자 |

#### 쿼리 매개변수 {#query-params}

| 매개변수 | 필수 | 설명 | 예시 |
|-----------|----------|-------------|---------|
| `format` | 아니오 | 응답 형식 (모든 ClickHouse 형식 지원) | `?format=JSONEachRow` |
| `param_:name` | 아니오 | 요청 본문이 스트림일 때 쿼리 변수. `:name`을 변수 이름으로 교체 | `?param_year=2024` |
| `:clickhouse_setting` | 아니오 | 지원되는 [ClickHouse 설정](https://clickhouse.com/docs/operations/settings/settings) | `?max_threads=8` |

#### 헤더 {#headers}

| 헤더 | 필수 | 설명 | 값 |
|--------|----------|-------------|--------|
| `x-clickhouse-endpoint-version` | 아니오 | 엔드포인트 버전 지정 | `1` 또는 `2` (마지막으로 저장된 버전 기본값) |
| `x-clickhouse-endpoint-upgrade` | 아니오 | 엔드포인트 버전 업그레이드 트리거 (버전 헤더와 함께 사용) | `1`로 업그레이드 |

---

### 요청 본문 {#request-body}

#### 매개변수 {#params}

| 매개변수 | 유형 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `queryVariables` | 객체 | 아니오 | 쿼리에서 사용할 변수 |
| `format` | 문자열 | 아니오 | 응답 형식 |

#### 지원되는 형식 {#supported-formats}

| 버전                 | 지원되는 형식                                                                                                                                            |
|-------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **버전 2**           | 모든 ClickHouse 지원 형식                                                                                                                             |
| **버전 1 (제한적)** | TabSeparated <br/> TabSeparatedWithNames <br/> TabSeparatedWithNamesAndTypes <br/> JSON <br/> JSONEachRow <br/> CSV <br/> CSVWithNames <br/> CSVWithNamesAndTypes |

---

### 응답 {#responses}

#### 성공 {#success}

**상태:** `200 OK`  
쿼리가 성공적으로 실행되었습니다.

#### 오류 코드 {#error-codes}

| 상태 코드 | 설명 |
|-------------|-------------|
| `400 Bad Request` | 요청이 잘못됨 |
| `401 Unauthorized` | 인증 누락 또는 권한 부족 |
| `404 Not Found` | 지정된 쿼리 엔드포인트를 찾을 수 없음 |

#### 오류 처리 모범 사례 {#error-handling-best-practices}

- 요청에 유효한 인증 정보를 포함시키세요.
- 전송 전 `queryEndpointId` 및 `queryVariables`를 검증하세요.
- 적절한 오류 메시지를 활용하여 원활한 오류 처리 구현하세요.

---

### 엔드포인트 버전 업그레이드 {#upgrading-endpoint-versions}

버전 1에서 버전 2로 업그레이드하려면:

1. `x-clickhouse-endpoint-upgrade` 헤더를 `1`로 설정합니다.
2. `x-clickhouse-endpoint-version` 헤더를 `2`로 설정합니다.

이렇게 하면 다음 기능을 포함하여 버전 2에 대한 액세스가 가능해집니다:
- 모든 ClickHouse 형식 지원
- 응답 스트리밍 기능
- 향상된 성능 및 기능

## 예시 {#examples}

### 기본 요청 {#basic-request}

**쿼리 API 엔드포인트 SQL:**

```sql
SELECT database, name AS num_tables FROM system.tables LIMIT 3;
```

#### 버전 1 {#version-1}

<Tabs>
<TabItem value="cURL" label="cURL" default>

```bash
curl -X POST 'https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run' \
--user '<openApiKeyId:openApiKeySecret>' \
-H 'Content-Type: application/json' \
-d '{ "format": "JSONEachRow" }'
```
</TabItem>
<TabItem value="JavaScript" label="JavaScript" default>

```javascript
fetch(
  "https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run",
  {
    method: "POST",
    headers: {
      Authorization: "Basic <base64_encoded_credentials>",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      format: "JSONEachRow",
    }),
  }
)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Error:", error));
```

```json title="Response"
{
  "data": {
    "columns": [
      {
        "name": "database",
        "type": "String"
      },
      {
        "name": "num_tables",
        "type": "String"
      }
    ],
    "rows": [
      ["INFORMATION_SCHEMA", "COLUMNS"],
      ["INFORMATION_SCHEMA", "KEY_COLUMN_USAGE"],
      ["INFORMATION_SCHEMA", "REFERENTIAL_CONSTRAINTS"]
    ]
  }
}
```
</TabItem>
</Tabs>

#### 버전 2 {#version-2}

<Tabs>
<TabItem value="GET" label="GET (cURL)" default>

```bash
curl 'https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?format=JSONEachRow' \
--user '<openApiKeyId:openApiKeySecret>' \
-H 'x-clickhouse-endpoint-version: 2'
```

```application/x-ndjson title="Response"
{"database":"INFORMATION_SCHEMA","num_tables":"COLUMNS"}
{"database":"INFORMATION_SCHEMA","num_tables":"KEY_COLUMN_USAGE"}
{"database":"INFORMATION_SCHEMA","num_tables":"REFERENTIAL_CONSTRAINTS"}
```

</TabItem>
<TabItem value="cURL" label="POST (cURL)">

```bash
curl -X POST 'https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?format=JSONEachRow' \
--user '<openApiKeyId:openApiKeySecret>' \
-H 'Content-Type: application/json' \
-H 'x-clickhouse-endpoint-version: 2'
```
</TabItem>
<TabItem value="JavaScript" label="JavaScript" default>

```javascript
fetch(
  "https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?format=JSONEachRow",
  {
    method: "POST",
    headers: {
      Authorization: "Basic <base64_encoded_credentials>",
      "Content-Type": "application/json",
      "x-clickhouse-endpoint-version": "2",
    },
  }
)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Error:", error));
```

```application/x-ndjson title="Response"
{"database":"INFORMATION_SCHEMA","num_tables":"COLUMNS"}
{"database":"INFORMATION_SCHEMA","num_tables":"KEY_COLUMN_USAGE"}
{"database":"INFORMATION_SCHEMA","num_tables":"REFERENTIAL_CONSTRAINTS"}
```
</TabItem>
</Tabs>

### 쿼리 변수와 JSONCompactEachRow 형식의 버전 2 요청 {#request-with-query-variables-and-version-2-on-jsoncompacteachrow-format}

**쿼리 API 엔드포인트 SQL:**

```sql
SELECT name, database FROM system.tables WHERE match(name, {tableNameRegex: String}) AND database = {database: String};
```

<Tabs>
<TabItem value="GET" label="GET (cURL)" default>

```bash
curl 'https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?format=JSONCompactEachRow&param_tableNameRegex=query.*&param_database=system' \
--user '<openApiKeyId:openApiKeySecret>' \
-H 'x-clickhouse-endpoint-version: 2'
```

```application/x-ndjson title="Response"
["query_cache", "system"]
["query_log", "system"]
["query_views_log", "system"]
```

</TabItem>
<TabItem value="cURL" label="POST (cURL)">

```bash
curl -X POST 'https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?format=JSONCompactEachRow' \
--user '<openApiKeyId:openApiKeySecret>' \
-H 'Content-Type: application/json' \
-H 'x-clickhouse-endpoint-version: 2' \
-d '{ "queryVariables": { "tableNameRegex": "query.*", "database": "system" } }'
```
</TabItem>

<TabItem value="JavaScript" label="JavaScript" default>

```javascript
fetch(
  "https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?format=JSONCompactEachRow",
  {
    method: "POST",
    headers: {
      Authorization: "Basic <base64_encoded_credentials>",
      "Content-Type": "application/json",
      "x-clickhouse-endpoint-version": "2",
    },
    body: JSON.stringify({
      queryVariables: {
        tableNameRegex: "query.*",
        database: "system",
      },
    }),
  }
)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Error:", error));
```

```application/x-ndjson title="Response"
["query_cache", "system"]
["query_log", "system"]
["query_views_log", "system"]
```
</TabItem>
</Tabs>

### 테이블에 데이터를 삽입하는 쿼리 변수 배열과 요청 {#request-with-array-in-the-query-variables-that-inserts-data-into-a-table}

**테이블 SQL:**

```SQL
CREATE TABLE default.t_arr
(
    `arr` Array(Array(Array(UInt32)))
)
ENGINE = MergeTree
ORDER BY tuple()
```

**쿼리 API 엔드포인트 SQL:**

```sql
INSERT INTO default.t_arr VALUES ({arr: Array(Array(Array(UInt32)))});
```

<Tabs>
<TabItem value="cURL" label="cURL" default>

```bash
curl -X POST 'https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run' \
--user '<openApiKeyId:openApiKeySecret>' \
-H 'Content-Type: application/json' \
-H 'x-clickhouse-endpoint-version: 2' \
-d '{
  "queryVariables": {
    "arr": [[[12, 13, 0, 1], [12]]]
  }
}'
```

</TabItem>
<TabItem value="JavaScript" label="JavaScript" default>

```javascript
fetch(
  "https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run",
  {
    method: "POST",
    headers: {
      Authorization: "Basic <base64_encoded_credentials>",
      "Content-Type": "application/json",
      "x-clickhouse-endpoint-version": "2",
    },
    body: JSON.stringify({
      queryVariables: {
        arr: [[[12, 13, 0, 1], [12]]],
      },
    }),
  }
)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Error:", error));
```

```text title="Response"
OK
```
</TabItem>
</Tabs>

### `max_threads` 설정이 8로 설정된 요청 {#request-with-clickhouse-settings-max_threads-set-to-8}

**쿼리 API 엔드포인트 SQL:**

```sql
SELECT * FROM system.tables;
```

<Tabs>
<TabItem value="GET" label="GET (cURL)" default>

```bash
curl 'https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?max_threads=8' \
--user '<openApiKeyId:openApiKeySecret>' \
-H 'x-clickhouse-endpoint-version: 2'
```

</TabItem>
<TabItem value="cURL" label="POST (cURL)">

```bash
curl -X POST 'https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?max_threads=8,' \
--user '<openApiKeyId:openApiKeySecret>' \
-H 'Content-Type: application/json' \
-H 'x-clickhouse-endpoint-version: 2' \
```
</TabItem>
<TabItem value="JavaScript" label="JavaScript">

```javascript
fetch(
  "https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?max_threads=8",
  {
    method: "POST",
    headers: {
      Authorization: "Basic <base64_encoded_credentials>",
      "Content-Type": "application/json",
      "x-clickhouse-endpoint-version": "2",
    },
  }
)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Error:", error));
```

</TabItem>
</Tabs>

### 파일에서 테이블로 스트림 삽입 {#insert-a-stream-from-a-file-into-a-table}

파일 `./samples/my_first_table_2024-07-11.csv`를 다음 내용으로 만듭니다:

```csv
"user_id","json","name"
"1","{""name"":""John"",""age"":30}","John"
"2","{""name"":""Jane"",""age"":25}","Jane"
```

**테이블 생성 SQL:**

```sql
create table default.my_first_table
(
    user_id String,
    json String,
    name String,
) ENGINE = MergeTree()
ORDER BY user_id;
```

**쿼리 API 엔드포인트 SQL:**

```sql
INSERT INTO default.my_first_table
```

```bash
cat ./samples/my_first_table_2024-07-11.csv | curl --user '<openApiKeyId:openApiKeySecret>' \
                                                   -X POST \
                                                   -H 'Content-Type: application/octet-stream' \
                                                   -H 'x-clickhouse-endpoint-version: 2' \
                                                   "https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?format=CSV" \
                                                   --data-binary @-
```
