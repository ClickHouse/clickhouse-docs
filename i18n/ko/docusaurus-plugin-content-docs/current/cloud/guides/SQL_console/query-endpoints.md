---
sidebar_title: '쿼리 API 엔드포인트'
slug: /cloud/get-started/query-endpoints
description: '저장된 쿼리에서 쉽게 REST API 엔드포인트를 생성합니다'
keywords: ['api', '쿼리 API 엔드포인트', '쿼리 엔드포인트', '쿼리 REST API']
title: '쿼리 API 엔드포인트'
doc_type: 'guide'
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


# 쿼리 API 엔드포인트 설정 \{#setting-up-query-api-endpoints\}

**Query API Endpoints** 기능을 사용하면 ClickHouse Cloud 콘솔에서 저장된 SQL 쿼리로부터 직접 API 엔드포인트를 생성할 수 있습니다. 이를 통해 네이티브 드라이버를 사용해 ClickHouse Cloud 서비스에 연결할 필요 없이 HTTP를 통해 API 엔드포인트를 호출하여 저장된 쿼리를 실행할 수 있습니다.

## 사전 준비 사항 \{#quick-start-guide\}

진행하기 전에 다음 항목을 준비했는지 확인합니다:

- 적절한 권한이 부여된 API 키
- Admin Console 역할

아직 API 키가 없다면 이 가이드를 따라 [API 키를 생성](/cloud/manage/openapi)할 수 있습니다.

:::note 최소 권한
API 엔드포인트에 쿼리하려면 API 키에 `Member` 조직 역할과 `Query Endpoints` 서비스 액세스가 필요합니다. 데이터베이스 역할은 엔드포인트를 생성할 때 설정됩니다.
:::

<VerticalStepper headerLevel="h3">

### 저장된 쿼리 생성 \{#creating-a-saved-query\}

이미 저장된 쿼리가 있다면 이 단계를 건너뛸 수 있습니다.

새 쿼리 탭을 엽니다. 데모용으로 약 45억 개의 레코드를 포함하는 [youtube dataset](/getting-started/example-datasets/youtube-dislikes)을 사용합니다.
["Create table"](/getting-started/example-datasets/youtube-dislikes#create-the-table) 섹션의 단계를 따라 Cloud 서비스에 테이블을 생성하고 데이터를 삽입합니다.

:::tip `LIMIT`으로 행 수 제한
예제 데이터셋 튜토리얼은 많은 데이터를 삽입합니다. 46억 5천만 개의 행을 삽입하므로 시간이 걸릴 수 있습니다.
이 가이드에서는 `LIMIT` 절을 사용하여 예를 들어 1천만 개 행처럼 더 적은 양의 데이터를 삽입할 것을 권장합니다.
:::

예시 쿼리로, 사용자 입력 `year` 파라미터에 대해 동영상당 평균 조회수가 가장 높은 상위 10명의 업로더를 반환합니다.

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
-- 다음 줄 강조
  toYear(upload_date) = {year: UInt16}
GROUP BY uploader
ORDER BY per_upload desc
  LIMIT 10
```

이 쿼리에는 위 코드 조각에서 강조된 파라미터(`year`)가 포함되어 있다는 점에 유의하십시오.
중괄호 `{ }`와 파라미터 타입을 함께 사용하여 쿼리 파라미터를 지정할 수 있습니다. 
SQL 콘솔 쿼리 편집기는 ClickHouse 쿼리 파라미터 표현식을 자동으로 감지하고 각 파라미터에 대한 입력 필드를 제공합니다.

SQL 편집기 오른쪽에 있는 쿼리 변수 입력 상자에 연도 `2010`을 지정하여 이 쿼리가 정상적으로 동작하는지 빠르게 실행해 봅니다:

<Image img={endpoints_testquery} size="md" alt="예제 쿼리 테스트" />

다음으로 쿼리를 저장합니다:

<Image img={endpoints_savequery} size="md" alt="예제 쿼리 저장" />

저장된 쿼리에 대한 자세한 문서는 ["쿼리 저장"](/cloud/get-started/sql-console#saving-a-query) 섹션에서 확인할 수 있습니다.

### Query API 엔드포인트 구성 \{#configuring-the-query-api-endpoint\}

Query API 엔드포인트는 쿼리 뷰에서 **Share** 버튼을 클릭하고 `API Endpoint`를 선택하여 직접 구성할 수 있습니다.
어떤 API 키가 엔드포인트에 액세스할 수 있는지 지정하라는 메시지가 표시됩니다:

<Image img={endpoints_configure} size="md" alt="쿼리 엔드포인트 구성" />

API 키를 선택한 후 다음 항목을 지정해야 합니다:
- 쿼리를 실행하는 데 사용할 Database 역할 선택 (`Full access`, `Read only` 또는 `Create a custom role`)
- CORS(Cross-Origin Resource Sharing)에 허용할 도메인 지정

이 옵션들을 선택하면 Query API 엔드포인트가 자동으로 프로비저닝됩니다.

테스트 요청을 보낼 수 있도록 예제 `curl` 명령이 표시됩니다:

<Image img={endpoints_completed} size="md" alt="엔드포인트 curl 명령" />

편의를 위해 인터페이스에 표시되는 curl 명령은 아래와 같습니다:

```bash
curl -H "Content-Type: application/json" -s --user '<key_id>:<key_secret>' '<API-endpoint>?format=JSONEachRow&param_year=<value>'
```

### Query API 파라미터 \{#query-api-parameters\}

쿼리 내 쿼리 파라미터는 `{parameter_name: type}` 문법으로 지정할 수 있습니다. 이러한 파라미터는 자동으로 감지되며, 예제 요청 페이로드에는 이 파라미터들을 전달할 수 있는 `queryVariables` 객체가 포함됩니다.

### 테스트 및 모니터링 \{#testing-and-monitoring\}

Query API 엔드포인트가 생성되면 `curl` 또는 다른 HTTP 클라이언트를 사용하여 정상 동작 여부를 테스트할 수 있습니다:

<Image img={endpoints_curltest} size="md" alt="엔드포인트 curl 테스트" />

첫 번째 요청을 보내고 나면 **Share** 버튼 오른쪽에 새 버튼이 즉시 나타납니다. 이 버튼을 클릭하면 쿼리에 대한 모니터링 데이터를 포함하는 플라이아웃이 열립니다:

<Image img={endpoints_monitoring} size="sm" alt="엔드포인트 모니터링" />

</VerticalStepper>

## 구현 세부 사항 \{#implementation-details\}

이 엔드포인트는 저장해 둔 Query API 엔드포인트에 대해 쿼리를 실행합니다.
여러 버전, 유연한 응답 형식, 매개변수화된 쿼리, 그리고 버전 2에서만 제공되는 선택적 스트리밍 응답을 지원합니다.

**엔드포인트:**

```text
GET /query-endpoints/{queryEndpointId}/run
POST /query-endpoints/{queryEndpointId}/run
```


### HTTP methods \{#http-methods\}

| Method | Use Case | Parameters |
|---------|----------|------------|
| **GET** | 매개변수가 있는 단순 쿼리 | URL 매개변수(`?param_name=value`)로 쿼리 변수 전달 |
| **POST** | 복잡한 쿼리 또는 요청 본문을 사용할 때 | 요청 본문(`queryVariables` 객체)에 쿼리 변수 전달 |

**GET을 사용할 때:**

- 복잡한 중첩 데이터가 없는 단순 쿼리인 경우
- 매개변수를 쉽게 URL 인코딩할 수 있는 경우
- HTTP GET의 의미론을 활용한 캐싱 이점이 필요한 경우

**POST를 사용할 때:**

- 배열, 객체, 긴 문자열 등 복잡한 쿼리 변수가 있는 경우
- 보안/프라이버시 측면에서 요청 본문 사용이 더 적합한 경우
- 파일 스트리밍 업로드나 대용량 데이터 전송이 필요한 경우

### 인증 \{#authentication\}

**필수:** 예  
**방식:** OpenAPI Key/Secret를 사용하는 Basic 인증  
**권한:** 해당 쿼리 엔드포인트에 대한 적절한 권한

### 요청 설정 \{#request-configuration\}

#### URL 매개변수 \{#url-params\}

| 매개변수 | 필수 여부 | 설명 |
|-----------|----------|-------------|
| `queryEndpointId` | **예** | 실행할 쿼리 엔드포인트의 고유 식별자 |

#### 쿼리 매개변수 \{#query-params\}

| Parameter(매개변수) | Required(필수 여부) | Description(설명) | Example(예시) |
|-----------|----------|-------------|---------|
| `format` | No | 응답 형식(모든 ClickHouse 형식 지원) | `?format=JSONEachRow` |
| `param_:name` | No | 요청 본문이 스트림일 때 사용하는 쿼리 변수입니다. `:name`을 변수 이름으로 바꾸십시오. | `?param_year=2024` |
| `request_timeout` | No | 밀리초 단위 쿼리 타임아웃(기본값: 30000) | `?request_timeout=60000` |
| `:clickhouse_setting` | No | 지원되는 [ClickHouse 설정](https://clickhouse.com/docs/operations/settings/settings) | `?max_threads=8` |

#### 헤더 \{#headers\}

| 헤더 | 필수 여부 | 설명 | 값 |
|--------|----------|-------------|--------|
| `x-clickhouse-endpoint-version` | 아니요 | 엔드포인트 버전을 지정합니다 | `1` 또는 `2` (기본값은 마지막으로 저장된 버전) |
| `x-clickhouse-endpoint-upgrade` | 아니요 | 엔드포인트 버전 업그레이드를 실행합니다(버전 헤더와 함께 사용) | 업그레이드를 위해 `1` |
---

### 요청 본문 \{#request-body\}

#### 매개변수 \{#params\}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `queryVariables` | object | 아니요 | 쿼리에서 사용할 변수 |
| `format` | string | 아니요 | 응답 형식 |

#### 지원되는 형식 \{#supported-formats\}

| 버전                    | 지원 형식                                                                                                                                                     |
|-------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **버전 2**              | ClickHouse에서 지원하는 모든 형식                                                                                                                             |
| **버전 1 (제한적)**     | TabSeparated <br/> TabSeparatedWithNames <br/> TabSeparatedWithNamesAndTypes <br/> JSON <br/> JSONEachRow <br/> CSV <br/> CSVWithNames <br/> CSVWithNamesAndTypes |

---

### 응답 \{#responses\}

#### 성공 \{#success\}

**상태:** `200 OK`  
쿼리가 성공적으로 실행되었습니다.

#### 오류 코드 \{#error-codes\}

| 상태 코드 | 설명 |
|-------------|-------------|
| `400 Bad Request` | 요청 형식이 잘못되었습니다 |
| `401 Unauthorized` | 인증이 누락되었거나 권한이 부족합니다 |
| `404 Not Found` | 지정한 쿼리 엔드포인트를 찾을 수 없습니다 |

#### 오류 처리 모범 사례 \{#error-handling-best-practices\}

- 요청에 유효한 인증 정보가 포함되어 있는지 확인합니다
- 전송하기 전에 `queryEndpointId`와 `queryVariables`를 검증합니다
- 적절한 오류 메시지를 제공하고, 예외 상황을 안정적으로 처리하도록 구현합니다

---

### 엔드포인트 버전 업그레이드 \{#upgrading-endpoint-versions\}

버전 1에서 버전 2로 업그레이드하려면 다음을 수행하십시오.

1. `x-clickhouse-endpoint-upgrade` 헤더를 `1`로 설정합니다.
2. `x-clickhouse-endpoint-version` 헤더를 `2`로 설정합니다.

이렇게 하면 다음과 같은 버전 2 기능을 사용할 수 있게 됩니다.

- 모든 ClickHouse 포맷 지원
- 응답 스트리밍 기능
- 향상된 성능 및 기능

## 예제 \{#examples\}

### 기본 요청 \{#basic-request\}

**쿼리 API 엔드포인트 SQL:**

```sql
SELECT database, name AS num_tables FROM system.tables LIMIT 3;
```


#### 버전 1 \{#version-1\}

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

```json title="응답"
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

#### 버전 2 \{#version-2\}

<Tabs>
<TabItem value="GET" label="GET (cURL)" default>

```bash
curl 'https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?format=JSONEachRow' \
--user '<openApiKeyId:openApiKeySecret>' \
-H 'x-clickhouse-endpoint-version: 2'
```

```application/x-ndjson title="응답"
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

```application/x-ndjson title="응답"
{"database":"INFORMATION_SCHEMA","num_tables":"COLUMNS"}
{"database":"INFORMATION_SCHEMA","num_tables":"KEY_COLUMN_USAGE"}
{"database":"INFORMATION_SCHEMA","num_tables":"REFERENTIAL_CONSTRAINTS"}
```
</TabItem>
</Tabs>

### 쿼리 변수와 JSONCompactEachRow 포맷 버전 2를 사용하는 요청 \{#request-with-query-variables-and-version-2-on-jsoncompacteachrow-format\}

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

    ```application/x-ndjson title="응답"
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

    ```application/x-ndjson title="응답"
    ["query_cache", "system"]
    ["query_log", "system"]
    ["query_views_log", "system"]
    ```
  </TabItem>
</Tabs>


### 쿼리 변수에 배열이 포함된, 테이블에 데이터를 삽입하는 요청 \{#request-with-array-in-the-query-variables-that-inserts-data-into-a-table\}

**테이블 SQL:**

```SQL
CREATE TABLE default.t_arr
(
    `arr` Array(Array(Array(UInt32)))
)
ENGINE = MergeTree
ORDER BY tuple()
```

**쿼리 API 엔드포인트용 SQL:**

```sql
INSERT INTO default.t_arr VALUES ({arr: Array(Array(Array(UInt32)))});
```

<Tabs>
  <TabItem value="cURL" label="cURL" default>
    ```bash
    curl -X POST 'https://console-api.clickhouse.cloud/.api/query-endpoints/&lt;endpoint id&gt;/run' \
    --user '&lt;openApiKeyId:openApiKeySecret&gt;' \
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
      "https://console-api.clickhouse.cloud/.api/query-endpoints/&lt;endpoint id&gt;/run",
      {
        method: "POST",
        headers: {
          Authorization: "Basic &lt;base64_encoded_credentials&gt;",
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
      .then((response) =&gt; response.json())
      .then((data) =&gt; console.log(data))
      .catch((error) =&gt; console.error("Error:", error));
    ```

    ```text title="응답"
    OK
    ```
  </TabItem>
</Tabs>


### ClickHouse 설정 `max_threads`를 8로 지정한 요청 \{#request-with-clickhouse-settings-max_threads-set-to-8\}

**쿼리 API 엔드포인트 SQL:**

```sql
SELECT * FROM system.tables;
```

<Tabs>
  <TabItem value="GET" label="GET (cURL)" default>
    ```bash
    curl 'https://console-api.clickhouse.cloud/.api/query-endpoints/&lt;endpoint id&gt;/run?max_threads=8' \
    --user '&lt;openApiKeyId:openApiKeySecret&gt;' \
    -H 'x-clickhouse-endpoint-version: 2'
    ```
  </TabItem>

  <TabItem value="cURL" label="POST (cURL)">
    ```bash
    curl -X POST 'https://console-api.clickhouse.cloud/.api/query-endpoints/&lt;endpoint id&gt;/run?max_threads=8,' \
    --user '&lt;openApiKeyId:openApiKeySecret&gt;' \
    -H 'Content-Type: application/json' \
    -H 'x-clickhouse-endpoint-version: 2' \
    ```
  </TabItem>

  <TabItem value="JavaScript" label="JavaScript">
    ```javascript
    fetch(
      "https://console-api.clickhouse.cloud/.api/query-endpoints/&lt;endpoint id&gt;/run?max_threads=8",
      {
        method: "POST",
        headers: {
          Authorization: "Basic &lt;base64_encoded_credentials&gt;",
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


### 요청을 보내고 응답을 스트림으로 파싱하기` \{#request-and-parse-the-response-as-a-stream\}

**Query API 엔드포인트용 SQL:**

```sql
SELECT name, database FROM system.tables;
```

<Tabs>
  <TabItem value="TypeScript" label="TypeScript" default>
    ```typescript
    async function fetchAndLogChunks(
      url: string,
      openApiKeyId: string,
      openApiKeySecret: string
    ) {
      const auth = Buffer.from(`${openApiKeyId}:${openApiKeySecret}`).toString(
        "base64"
      );

      const headers = {
        Authorization: `Basic ${auth}`,
        "x-clickhouse-endpoint-version": "2",
      };

      const response = await fetch(url, {
        headers,
        method: "POST",
        body: JSON.stringify({ format: "JSONEachRow" }),
      });

      if (!response.ok) {
        console.error(`HTTP error! Status: ${response.status}`);
        return;
      }

      const reader = response.body as unknown as Readable;
      reader.on("data", (chunk) => {
        console.log(chunk.toString());
      });

      reader.on("end", () => {
        console.log("Stream ended.");
      });

      reader.on("error", (err) => {
        console.error("Stream error:", err);
      });
    }

    const endpointUrl =
      "https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?format=JSONEachRow";
    const openApiKeyId = "<myOpenApiKeyId>";
    const openApiKeySecret = "<myOpenApiKeySecret>";
    // 사용 예시
    fetchAndLogChunks(endpointUrl, openApiKeyId, openApiKeySecret).catch((err) =>
      console.error(err)
    );
    ```

    ```shell title="출력"
    > npx tsx index.ts
    > {"name":"COLUMNS","database":"INFORMATION_SCHEMA"}
    > {"name":"KEY_COLUMN_USAGE","database":"INFORMATION_SCHEMA"}
    ...
    > Stream ended.
    ```
  </TabItem>
</Tabs>


### 파일의 스트림을 테이블에 삽입 \{#insert-a-stream-from-a-file-into-a-table\}

다음 내용을 포함하는 `./samples/my_first_table_2024-07-11.csv` 파일을 생성합니다:

```csv
"user_id","json","name"
"1","{""name"":""John"",""age"":30}","John"
"2","{""name"":""Jane"",""age"":25}","Jane"
```

**CREATE TABLE SQL:**

```sql
create table default.my_first_table
(
    user_id String,
    json String,
    name String,
) ENGINE = MergeTree()
ORDER BY user_id;
```

**쿼리 API 엔드포인트용 SQL:**

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
