---
'sidebar_label': '자바스크립트'
'sidebar_position': 4
'keywords':
- 'clickhouse'
- 'js'
- 'JavaScript'
- 'NodeJS'
- 'web'
- 'browser'
- 'Cloudflare'
- 'workers'
- 'client'
- 'connect'
- 'integrate'
'slug': '/integrations/javascript'
'description': 'ClickHouse에 연결하기 위한 공식 JS 클라이언트입니다.'
'title': 'ClickHouse JS'
'doc_type': 'reference'
'integration':
- 'support_level': 'core'
- 'category': 'language_client'
- 'website': 'https://github.com/ClickHouse/clickhouse-js'
---

import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# ClickHouse JS

ClickHouse에 연결하기 위한 공식 JS 클라이언트입니다.  
클라이언트는 TypeScript로 작성되었으며, 클라이언트 공개 API에 대한 타입 정의를 제공합니다.

종속성이 없으며, 최대 성능을 위해 최적화되어 있으며 다양한 ClickHouse 버전과 구성(온프레미스 단일 노드, 온프레미스 클러스터 및 ClickHouse Cloud)에서 테스트되었습니다.

다양한 환경을 위한 두 가지 버전의 클라이언트가 제공됩니다:
- `@clickhouse/client` - Node.js 전용
- `@clickhouse/client-web` - 브라우저(Chrome/Firefox), Cloudflare 워커

TypeScript를 사용할 때는 최소한 [버전 4.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html) 이상이어야 하며, 이는 [인라인 가져오기 및 내보내기 문법](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#type-modifiers-on-import-names)을 활성화합니다.

클라이언트 소스 코드는 [ClickHouse-JS GitHub 저장소](https://github.com/ClickHouse/clickhouse-js)에서 확인할 수 있습니다.

## 환경 요구 사항 (node.js) {#environment-requirements-nodejs}

클라이언트를 실행하기 위해 Node.js가 환경에서 사용할 수 있어야 합니다.  
클라이언트는 모든 [유지 관리되는](https://github.com/nodejs/release#readme) Node.js 릴리스와 호환됩니다.

Node.js 버전이 End-Of-Life에 가까워지면, 클라이언트는 이를 구식 및 안전하지 않다고 간주하여 지원을 중단합니다.

현재 지원되는 Node.js 버전:

| Node.js 버전 | 지원 여부  |
|--------------|-------------|
| 22.x         | ✔           |
| 20.x         | ✔           |
| 18.x         | ✔           |
| 16.x         | 최선의 노력 |

## 환경 요구 사항 (웹) {#environment-requirements-web}

클라이언트의 웹 버전은 최신 Chrome/Firefox 브라우저에서 공식적으로 테스트되었으며, React/Vue/Angular 애플리케이션 또는 Cloudflare 워커와 같은 종속성으로 사용될 수 있습니다.

## 설치 {#installation}

최신 안정적인 Node.js 클라이언트 버전을 설치하려면 다음 명령을 실행하세요:

```sh
npm i @clickhouse/client
```

웹 버전 설치:

```sh
npm i @clickhouse/client-web
```

## ClickHouse와의 호환성 {#compatibility-with-clickhouse}

| 클라이언트 버전 | ClickHouse |
|------------------|------------|
| 1.12.0           | 24.8+      |

클라이언트는 이전 버전에서도 작동할 가능성이 있지만, 이는 최선의 노력 지원이며 보장되지 않습니다. ClickHouse 버전이 23.3보다 이전인 경우, [ClickHouse 보안 정책](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md)을 참조하고 업그레이드를 고려하시기 바랍니다.

## 예제 {#examples}

클라이언트 사용의 다양한 시나리오를 [예제](https://github.com/ClickHouse/clickhouse-js/blob/main/examples)로 다룰 계획입니다.

개요는 [예제 README](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/README.md#overview)에서 확인할 수 있습니다.

예제나 다음 문서에서 불분명하거나 누락된 부분이 있으면 주저하지 말고 [문의하기](./js.md#contact-us) 바랍니다.

### 클라이언트 API {#client-api}

대부분의 예제는 명시적으로 다르게 언급되지 않는 한 Node.js 및 웹 버전의 클라이언트 모두와 호환됩니다.

#### 클라이언트 인스턴스 생성 {#creating-a-client-instance}

`createClient` 팩토리를 사용하여 필요한 만큼 클라이언트 인스턴스를 생성할 수 있습니다:

```ts
import { createClient } from '@clickhouse/client' // or '@clickhouse/client-web'

const client = createClient({
  /* configuration */
})
```

환경이 ESM 모듈을 지원하지 않는 경우 CJS 문법을 대신 사용할 수 있습니다:

```ts
const { createClient } = require('@clickhouse/client');

const client = createClient({
  /* configuration */
})
```

클라이언트 인스턴스는 생성 시 [미리 구성](./js.md#configuration)할 수 있습니다.

#### 구성 {#configuration}

클라이언트 인스턴스를 생성할 때 다음 연결 설정을 조정할 수 있습니다:

| 설정                                                                    | 설명                                                                         | 기본값                 | 관련 문서                                                                                    |
|-------------------------------------------------------------------------|------------------------------------------------------------------------------|-----------------------|----------------------------------------------------------------------------------------------|
| **url**?: string                                                          | ClickHouse 인스턴스 URL.                                                   | `http://localhost:8123` | [URL 구성 문서](./js.md#url-configuration)                                                 |
| **pathname**?: string                                                     | ClickHouse URL에 추가할 선택적 경로.                                        | `''`                  | [경로가 있는 프록시 문서](./js.md#proxy-with-a-pathname)                                    |
| **request_timeout**?: number                                              | 요청 타임아웃(밀리초).                                                      | `30_000`              | -                                                                                            |
| **compression**?: `{ **response**?: boolean; **request**?: boolean }`    | 압축 활성화.                                                                | -                     | [압축 문서](./js.md#compression)                                                            |
| **username**?: string                                                     | 요청을 대리하는 사용자 이름.                                                | `default`             | -                                                                                            |
| **password**?: string                                                     | 사용자 비밀번호.                                                            | `''`                  | -                                                                                            |
| **application**?: string                                                  | Node.js 클라이언트를 사용하는 애플리케이션의 이름.                          | `clickhouse-js`       | -                                                                                            |
| **database**?: string                                                    | 사용할 데이터베이스 이름.                                                  | `default`             | -                                                                                            |
| **clickhouse_settings**?: ClickHouseSettings                             | 모든 요청에 적용할 ClickHouse 설정.                                          | `{}`                  | -                                                                                            |
| **log**?: `{ **LoggerClass**?: Logger, **level**?: ClickHouseLogLevel }` | 내부 클라이언트 로그 구성.                                                   | -                     | [로깅 문서](./js.md#logging-nodejs-only)                                                    |
| **session_id**?: string                                                   | 모든 요청에 함께 전송할 선택적 ClickHouse 세션 ID.                         | -                     | -                                                                                            |
| **keep_alive**?: `{ **enabled**?: boolean }`                             | 기본적으로 Node.js 및 웹 버전 모두에서 활성화됨.                           | -                     | -                                                                                            |
| **http_headers**?: `Record<string, string>`                              | ClickHouse 요청에 대한 추가 HTTP 헤더.                                      | -                     | [인증을 위한 리버스 프록시 문서](./js.md#reverse-proxy-with-authentication)                 |
| **roles**?: string \|  string[]                                          | 전송 요청에 첨부할 ClickHouse 역할 이름.                                    | -                     | [HTTP 인터페이스에서 역할 사용](/interfaces/http#setting-role-with-query-parameters)       |

#### Node.js 전용 구성 매개변수 {#nodejs-specific-configuration-parameters}

| 설정                                                                    | 설명                                                        | 기본값       | 관련 문서                                                                                            |
|-------------------------------------------------------------------------|-----------------------------------------------------------|-------------|----------------------------------------------------------------------------------------------------|
| **max_open_connections**?: number                                        | 호스트당 허용할 최대 연결 소켓 수.                        | `10`        | -                                                                                                  |
| **tls**?: `{ **ca_cert**: Buffer, **cert**?: Buffer, **key**?: Buffer }`  | TLS 인증서 구성.                                          | -           | [TLS 문서](./js.md#tls-certificates-nodejs-only)                                                |
| **keep_alive**?: `{ **enabled**?: boolean, **idle_socket_ttl**?: number }` | -                                                          | -           | [Keep Alive 문서](./js.md#keep-alive-configuration-nodejs-only)                                  |
| **http_agent**?: http.Agent \| https.Agent <br/><ExperimentalBadge/>     | 클라이언트용 사용자 정의 HTTP 에이전트.                    | -           | [HTTP 에이전트 문서](./js.md#custom-httphttps-agent-experimental-nodejs-only)                     |
| **set_basic_auth_header**?: boolean <br/><ExperimentalBadge/>            | 기본 인증 자격 증명으로 `Authorization` 헤더 설정.        | `true`      | [이 설정의 HTTP 에이전트 문서에서의 사용법](./js.md#custom-httphttps-agent-experimental-nodejs-only) |

### URL 구성 {#url-configuration}

:::important  
URL 구성은 _항상_ 하드코딩된 값을 덮어쓰며, 이 경우 경고가 로그에 기록됩니다.  
:::

대부분의 클라이언트 인스턴스 매개변수를 URL로 구성할 수 있습니다. URL 형식은 `http[s]://[username:password@]hostname:port[/database][?param1=value1&param2=value2]`입니다. 거의 모든 경우 특정 매개변수의 이름은 구성 옵션 인터페이스에서 그 경로를 반영하며, 몇 가지 예외가 있습니다. 지원되는 매개변수는 다음과 같습니다:

| 매개변수                                    | 유형                                                         |
|---------------------------------------------|------------------------------------------------------------|
| `pathname`                                  | 임의의 문자열.                                             |
| `application_id`                            | 임의의 문자열.                                             |
| `session_id`                                | 임의의 문자열.                                             |
| `request_timeout`                           | 0 이상의 숫자.                                            |
| `max_open_connections`                      | 0 이상의 숫자, 0보다 큰 숫자.                             |
| `compression_request`                       | 부울. 아래(1) 참조                                         |
| `compression_response`                      | 부울.                                                     |
| `log_level`                                 | 허용된 값: `OFF`, `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`. |
| `keep_alive_enabled`                        | 부울.                                                     |
| `clickhouse_setting_*` 또는 `ch_*`         | 아래(2) 참조                                              |
| (Node.js 전용) `keep_alive_idle_socket_ttl` | 0 이상의 숫자.                                            |

- (1) 부울의 경우 유효한 값은 `true`/`1` 및 `false`/`0`입니다.  
- (2) `clickhouse_setting_` 또는 `ch_`로 접두사된 매개변수는 이 접두사가 제거되고 나머지가 클라이언트의 `clickhouse_settings`에 추가됩니다. 예를 들어 `?ch_async_insert=1&ch_wait_for_async_insert=1`은 다음과 같습니다:

```ts
createClient({
  clickhouse_settings: {
    async_insert: 1,
    wait_for_async_insert: 1,
  },
})
```

주의: `clickhouse_settings`의 부울 값은 URL에서 `1`/`0`으로 전달되어야 합니다.

- (3) (2)와 유사하지만 `http_header` 구성에 해당합니다. 예를 들어 `?http_header_x-clickhouse-auth=foobar`는 다음과 같은 동등한 결과가 됩니다:

```ts
createClient({
  http_headers: {
    'x-clickhouse-auth': 'foobar',
  },
})
```

### 연결하기 {#connecting}

#### 연결 세부 정보 수집 {#gather-your-connection-details}

<ConnectionDetails />

#### 연결 개요 {#connection-overview}

클라이언트는 HTTP(s) 프로토콜을 통해 연결을 구현합니다. RowBinary 지원은 진행 중이며, [관련 이슈](https://github.com/ClickHouse/clickhouse-js/issues/216)를 참조하세요.

다음 예제에서는 ClickHouse Cloud에 대한 연결 설정 방법을 보여줍니다. `url`(프로토콜 및 포트 포함) 및 `password` 값이 환경 변수로 지정되어 있고 `default` 사용자가 사용된다고 가정합니다.

**예제:** 환경 변수를 사용하여 Node.js 클라이언트 인스턴스 생성하기.

```ts
import { createClient } from '@clickhouse/client'

const client = createClient({
  url: process.env.CLICKHOUSE_HOST ?? 'http://localhost:8123',
  username: process.env.CLICKHOUSE_USER ?? 'default',
  password: process.env.CLICKHOUSE_PASSWORD ?? '',
})
```

클라이언트 저장소에는 환경 변수를 사용하는 여러 예제가 포함되어 있으며, [ClickHouse Cloud에서 테이블 생성하기](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts), [비동기 삽입 사용하기](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert.ts) 및 기타 여러 예제가 있습니다.

#### 연결 풀 (Node.js 전용) {#connection-pool-nodejs-only}

매 요청마다 연결을 설정하는 오버헤드를 피하기 위해, 클라이언트는 ClickHouse와의 연결을 재사용하기 위해 연결 풀을 만듭니다. 기본적으로 Keep-Alive가 활성화되어 있으며, 연결 풀의 크기는 `10`으로 설정되어 있지만 `max_open_connections` [구성 옵션](./js.md#configuration)으로 변경할 수 있습니다.

사용자가 `max_open_connections: 1`을 설정하지 않는 한, 풀 내에서 동일한 연결이 후속 쿼리에 사용될 것이라는 보장은 없습니다. 이는 드물게 필요하지만 사용자가 임시 테이블을 사용할 경우 필요할 수 있습니다.

참조: [Keep-Alive 구성](./js.md#keep-alive-configuration-nodejs-only).

### 쿼리 ID {#query-id}

쿼리 또는 문장을 전송하는 모든 메서드(`command`, `exec`, `insert`, `select`)는 결과에 `query_id`를 제공합니다. 이 고유 식별자는 쿼리마다 클라이언트에 의해 할당되며, [서버 설정](/operations/server-configuration-parameters/settings)에서 활성화된 경우 `system.query_log`에서 데이터를 수집하는 데 유용할 수 있으며, 장기 실행 쿼리를 취소하는 데도 사용할 수 있습니다(예를 들어 [이 예제](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/cancel_query.ts)). 필요 시 사용자는 `command`/`query`/`exec`/`insert` 메서드 매개변수에서 `query_id`를 재정의할 수 있습니다.

:::tip  
`query_id` 매개변수를 재정의하는 경우, 각 호출에 대해 고유성을 보장해야 합니다. 랜덤 UUID가 좋은 선택입니다.  
:::

### 모든 클라이언트 메서드의 기본 매개변수 {#base-parameters-for-all-client-methods}

모든 클라이언트 메서드([query](./js.md#query-method)/[command](./js.md#command-method)/[insert](./js.md#insert-method)/[exec](./js.md#exec-method))에 적용할 수 있는 여러 매개변수가 있습니다.

```ts
interface BaseQueryParams {
  // ClickHouse settings that can be applied on query level.
  clickhouse_settings?: ClickHouseSettings
  // Parameters for query binding.
  query_params?: Record<string, unknown>
  // AbortSignal instance to cancel a query in progress.
  abort_signal?: AbortSignal
  // query_id override; if not specified, a random identifier will be generated automatically.
  query_id?: string
  // session_id override; if not specified, the session id will be taken from the client configuration.
  session_id?: string
  // credentials override; if not specified, the client's credentials will be used.
  auth?: { username: string, password: string }
  // A specific list of roles to use for this query. Overrides the roles set in the client configuration.
  role?: string | Array<string>
}
```

### 쿼리 메서드 {#query-method}

이는 응답을 가질 수 있는 대부분의 문장, 예를 들어 `SELECT`를 위한 것이며, DDL을 전송하기 위해 `CREATE TABLE`과 같은 쿼리를 사용할 때도 사용되며, 대기해야 합니다. 반환된 결과 세트는 응용 프로그램에서 소비될 것으로 예상됩니다.

:::note  
데이터 삽입을 위한 전용 메서드 [insert](./js.md#insert-method)와 DDL을 위한 [command](./js.md#command-method)가 있습니다.  
:::

```ts
interface QueryParams extends BaseQueryParams {
  // Query to execute that might return some data.
  query: string
  // Format of the resulting dataset. Default: JSON.
  format?: DataFormat
}

interface ClickHouseClient {
  query(params: QueryParams): Promise<ResultSet>
}
```

참조: [모든 클라이언트 메서드의 기본 매개변수](./js.md#base-parameters-for-all-client-methods).

:::tip  
`query`에서 FORMAT 절을 지정하지 마세요. 대신 `format` 매개변수를 사용하세요.  
:::

#### 결과 집합 및 행 추상화 {#result-set-and-row-abstractions}

`ResultSet`는 애플리케이션에서 데이터 처리를 위한 여러 편의 메서드를 제공합니다.

Node.js의 `ResultSet` 구현은 내부적으로 `Stream.Readable`을 사용하며, 웹 버전은 Web API의 `ReadableStream`을 사용합니다.

`ResultSet`을 소비하려면 `ResultSet`에서 `text` 또는 `json` 메서드를 호출하여 쿼리에서 반환된 모든 행의 세트를 메모리에 로드할 수 있습니다.

`ResultSet`을 가능한 한 빨리 소비하기 시작해야 합니다. `ResultSet`은 응답 스트림을 열어두므로, 연결이 바쁘게 유지됩니다. 클라이언트는 수신 데이터를 버퍼링하지 않으며, 이는 응용 프로그램에서 과도한 메모리 사용을 방지합니다.

대안으로, 한 번에 메모리에 모두 맞지 않을 경우, `stream` 메서드를 호출하여 스트리밍 모드에서 데이터를 처리할 수 있습니다. 응답 청크의 각각은 서버로부터 클라이언트가 수신한 특정 청크의 크기에 따라 소규모 배열로 변환됩니다(이 배열의 크기는 특정 청크의 크기와 개별 행의 크기에 따라 달라질 수 있음). 

최적의 포맷을 결정하기 위해 [지원되는 데이터 포맷 목록](./js.md#supported-data-formats)을 참조하세요. 예를 들어 JSON 객체를 스트리밍하려면 [JSONEachRow](/interfaces/formats/JSONEachRow)를 선택할 수 있으며, 각 행은 JS 객체로 구문 분석됩니다. 또는, 각 행이 값을 압축한 배열이 되는 더 컴팩트한 [JSONCompactColumns](/interfaces/formats/JSONCompactColumns) 포맷을 선택할 수 있습니다. 또한 [파일 스트리밍](./js.md#streaming-files-nodejs-only)을 참조하세요.

:::important  
`ResultSet` 또는 해당 스트림이 완전히 소비되지 않으면, 비활성 상태의 `request_timeout` 기간 후에 파괴됩니다.  
:::

```ts
interface BaseResultSet<Stream> {
  // See "Query ID" section above
  query_id: string

  // Consume the entire stream and get the contents as a string
  // Can be used with any DataFormat
  // Should be called only once
  text(): Promise<string>

  // Consume the entire stream and parse the contents as a JS object
  // Can be used only with JSON formats
  // Should be called only once
  json<T>(): Promise<T>

  // Returns a readable stream for responses that can be streamed
  // Every iteration over the stream provides an array of Row[] in the selected DataFormat
  // Should be called only once
  stream(): Stream
}

interface Row {
  // Get the content of the row as a plain string
  text: string

  // Parse the content of the row as a JS object
  json<T>(): T
}
```

**예제:** (Node.js/웹) `JSONEachRow` 형식의 결과 데이터 세트가 있는 쿼리로, 전체 스트림을 소비하고 내용을 JS 객체로 구문 분석합니다.  
[소스 코드](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts).

```ts
const resultSet = await client.query({
  query: 'SELECT * FROM my_table',
  format: 'JSONEachRow',
})
const dataset = await resultSet.json() // or `row.text` to avoid parsing JSON
```

**예제:** (Node.js 전용) 클래식 `on('data')` 접근 방식을 사용하여 `JSONEachRow` 형식으로 쿼리 결과를 스트리밍합니다. 이는 `for await const` 문법과 호환됩니다.  
[소스 코드](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row.ts).

```ts
const rows = await client.query({
  query: 'SELECT number FROM system.numbers_mt LIMIT 5',
  format: 'JSONEachRow', // or JSONCompactEachRow, JSONStringsEachRow, etc.
})
const stream = rows.stream()
stream.on('data', (rows: Row[]) => {
  rows.forEach((row: Row) => {
    console.log(row.json()) // or `row.text` to avoid parsing JSON
  })
})
await new Promise((resolve, reject) => {
  stream.on('end', () => {
    console.log('Completed!')
    resolve(0)
  })
  stream.on('error', reject)
})
```

**예제:** (Node.js 전용) 클래식 `on('data')` 접근 방식을 사용하여 `CSV` 형식으로 쿼리 결과를 스트리밍합니다. 이는 `for await const` 문법과 호환됩니다.  
[소스 코드](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_text_line_by_line.ts).

```ts
const resultSet = await client.query({
  query: 'SELECT number FROM system.numbers_mt LIMIT 5',
  format: 'CSV', // or TabSeparated, CustomSeparated, etc.
})
const stream = resultSet.stream()
stream.on('data', (rows: Row[]) => {
  rows.forEach((row: Row) => {
    console.log(row.text)
  })
})
await new Promise((resolve, reject) => {
  stream.on('end', () => {
    console.log('Completed!')
    resolve(0)
  })
  stream.on('error', reject)
})
```

**예제:** (Node.js 전용) `JSONEachRow` 형식의 JS 객체로 스트리밍된 쿼리 결과를 `for await const` 문법을 사용하여 소비합니다. 이는 클래식 `on('data')` 접근 방식과 호환됩니다.  
[소스 코드](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row_for_await.ts).

```ts
const resultSet = await client.query({
  query: 'SELECT number FROM system.numbers LIMIT 10',
  format: 'JSONEachRow', // or JSONCompactEachRow, JSONStringsEachRow, etc.
})
for await (const rows of resultSet.stream()) {
  rows.forEach(row => {
    console.log(row.json())
  })
}
```

:::note  
`for await const` 문법은 `on('data')` 접근 방식보다 코드가 약간 적지만, 성능에 부정적인 영향을 미칠 수 있습니다. 
자세한 내용은 [Node.js 저장소의 이 이슈](https://github.com/nodejs/node/issues/31979)를 참조하세요.  
:::

**예제:** (웹 전용) 객체의 `ReadableStream`를 반복합니다.

```ts
const resultSet = await client.query({
  query: 'SELECT * FROM system.numbers LIMIT 10',
  format: 'JSONEachRow'
})

const reader = resultSet.stream().getReader()
while (true) {
  const { done, value: rows } = await reader.read()
  if (done) { break }
  rows.forEach(row => {
    console.log(row.json())
  })
}
```

### 삽입 메서드 {#insert-method}

데이터 삽입을 위한 기본 메서드입니다.

```ts
export interface InsertResult {
  query_id: string
  executed: boolean
}

interface ClickHouseClient {
  insert(params: InsertParams): Promise<InsertResult>
}
```

반환 유형은 최소한으로, 서버에서 반환된 데이터가 없을 것으로 예상하고 응답 스트림을 즉시 소모합니다.

삽입 메서드에 빈 배열이 제공되면, 삽입 문은 서버에 전송되지 않으며 대신 메서드는 즉시 `{ query_id: '...', executed: false }`로 해결됩니다. 이 경우 매개변수에서 `query_id`가 제공되지 않으면 결과에서 빈 문자열이 됩니다. 클라이언트가 생성한 랜덤 UUID를 반환하는 것은 혼란스러울 수 있으므로, `query_id`가 `system.query_log` 테이블에 존재하지 않을 수 있습니다.

삽입 문이 서버로 전송되면 `executed` 플래그는 `true`가 됩니다.

#### 삽입 메서드 및 Node.js에서 스트리밍 {#insert-method-and-streaming-in-nodejs}

입력 형식에 따라 `Stream.Readable` 또는 일반 `Array<T>`와 함께 작동할 수 있습니다. 이는 [지원되는 데이터 형식](./js.md#supported-data-formats)에 지정됩니다. 또한 [파일 스트리밍](./js.md#streaming-files-nodejs-only)에 대한 이 섹션을 참조하세요.

삽입 메서드는 대기해야 하지만, 입력 스트림을 지정하고 나중에 스트림이 완료될 때 삽입 작업을 대기하는 것도 가능합니다(이는 삽입 약속도 해결합니다). 이는 이벤트 리스너 및 유사한 시나리오에 유용할 수 있지만, 오류 처리가 클라이언트 측에서 여러 엣지 케이스를 다뤄야 할 수 있으므로 고려해 보시기 바랍니다. 대신 [비동기 삽입](/optimize/asynchronous-inserts)을 사용하는 것을 고려하세요. 이 방법은 [이 예시](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert_without_waiting.ts)와 같이 사용할 수 있습니다.

:::tip  
이 메서드로 모델링하기 어려운 사용자 정의 INSERT 문이 있는 경우, [command 메서드](./js.md#command-method)를 사용하는 것을 고려하세요. 

어떻게 사용하는지는 [INSERT INTO ... VALUES](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_values_and_functions.ts) 또는 [INSERT INTO ... SELECT](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_from_select.ts) 예제를 참조하세요.  
:::

```ts
interface InsertParams<T> extends BaseQueryParams {
  // Table name to insert the data into
  table: string
  // A dataset to insert.
  values: ReadonlyArray<T> | Stream.Readable
  // Format of the dataset to insert.
  format?: DataFormat
  // Allows to specify which columns the data will be inserted into.
  // - An array such as `['a', 'b']` will generate: `INSERT INTO table (a, b) FORMAT DataFormat`
  // - An object such as `{ except: ['a', 'b'] }` will generate: `INSERT INTO table (* EXCEPT (a, b)) FORMAT DataFormat`
  // By default, the data is inserted into all columns of the table,
  // and the generated statement will be: `INSERT INTO table FORMAT DataFormat`.
  columns?: NonEmptyArray<string> | { except: NonEmptyArray<string> }
}
```

참조: [모든 클라이언트 메서드의 기본 매개변수](./js.md#base-parameters-for-all-client-methods).

:::important  
`abort_signal`로 취소된 요청은 삽입이 일어나지 않았을 것이라는 보장을 하지 않으며, 서버는 취소 전에 스트리밍된 데이터의 일부를 수신했을 수 있습니다.  
:::

**예제:** (Node.js/웹) 값 배열 삽입하기.  
[소스 코드](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts).

```ts
await client.insert({
  table: 'my_table',
  // structure should match the desired format, JSONEachRow in this example
  values: [
    { id: 42, name: 'foo' },
    { id: 42, name: 'bar' },
  ],
  format: 'JSONEachRow',
})
```

**예제:** (Node.js 전용) CSV 파일에서 스트림 삽입하기.  
[소스 코드](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts). 참조: [파일 스트리밍](./js.md#streaming-files-nodejs-only).

```ts
await client.insert({
  table: 'my_table',
  values: fs.createReadStream('./path/to/a/file.csv'),
  format: 'CSV',
})
```

**예제:** 특정 열을 삽입 문에서 제외하기.

다음과 같은 테이블 정의가 주어졌다고 가정합니다:

```sql
CREATE OR REPLACE TABLE mytable
(id UInt32, message String)
ENGINE MergeTree()
ORDER BY (id)
```

특정 열만 삽입하기:

```ts
// Generated statement: INSERT INTO mytable (message) FORMAT JSONEachRow
await client.insert({
  table: 'mytable',
  values: [{ message: 'foo' }],
  format: 'JSONEachRow',
  // `id` column value for this row will be zero (default for UInt32)
  columns: ['message'],
})
```

특정 열 제외하기:

```ts
// Generated statement: INSERT INTO mytable (* EXCEPT (message)) FORMAT JSONEachRow
await client.insert({
  table: tableName,
  values: [{ id: 144 }],
  format: 'JSONEachRow',
  // `message` column value for this row will be an empty string
  columns: {
    except: ['message'],
  },
})
```

추가 세부 사항은 [소스 코드](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_exclude_columns.ts)를 참조하세요.

**예제:** 클라이언트 인스턴스에 제공된 데이터베이스와 다른 데이터베이스로 삽입하기.  
[소스 코드](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_into_different_db.ts).

```ts
await client.insert({
  table: 'mydb.mytable', // Fully qualified name including the database
  values: [{ id: 42, message: 'foo' }],
  format: 'JSONEachRow',
})
```

#### 웹 버전 제한사항 {#web-version-limitations}

현재 `@clickhouse/client-web`에서의 삽입은 `Array<T>` 및 `JSON*` 형식에서만 작동합니다. 브라우저 호환성 문제로 인해 웹 버전에서 스트리밍 삽입은 지원되지 않습니다.

결과적으로 웹 버전의 `InsertParams` 인터페이스는 Node.js 버전과 약간 다르며, `values`는 오직 `ReadonlyArray<T>` 유형으로 제한됩니다:

```ts
interface InsertParams<T> extends BaseQueryParams {
  // Table name to insert the data into
  table: string
  // A dataset to insert.
  values: ReadonlyArray<T>
  // Format of the dataset to insert.
  format?: DataFormat
  // Allows to specify which columns the data will be inserted into.
  // - An array such as `['a', 'b']` will generate: `INSERT INTO table (a, b) FORMAT DataFormat`
  // - An object such as `{ except: ['a', 'b'] }` will generate: `INSERT INTO table (* EXCEPT (a, b)) FORMAT DataFormat`
  // By default, the data is inserted into all columns of the table,
  // and the generated statement will be: `INSERT INTO table FORMAT DataFormat`.
  columns?: NonEmptyArray<string> | { except: NonEmptyArray<string> }
}
```

이는 향후 변경될 수 있습니다. 참조: [모든 클라이언트 메서드의 기본 매개변수](./js.md#base-parameters-for-all-client-methods).

### 명령 메서드 {#command-method}

이는 출력이 없는 문장에 사용할 수 있으며, 포맷 절이 적용되지 않거나 응답에 관심이 없는 경우에 유용합니다. 그런 문장의 예로는 `CREATE TABLE` 또는 `ALTER TABLE`이 있습니다.

대기해야 합니다.

응답 스트림은 즉시 파괴되며, 이는 기본 소켓이 해제됨을 의미합니다.

```ts
interface CommandParams extends BaseQueryParams {
  // Statement to execute.
  query: string
}

interface CommandResult {
  query_id: string
}

interface ClickHouseClient {
  command(params: CommandParams): Promise<CommandResult>
}
```

참조: [모든 클라이언트 메서드의 기본 매개변수](./js.md#base-parameters-for-all-client-methods).

**예제:** (Node.js/웹) ClickHouse Cloud에서 테이블 생성하기.  
[소스 코드](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts).

```ts
await client.command({
  query: `
    CREATE TABLE IF NOT EXISTS my_cloud_table
    (id UInt64, name String)
    ORDER BY (id)
  `,
  // Recommended for cluster usage to avoid situations where a query processing error occurred after the response code, 
  // and HTTP headers were already sent to the client.
  // See https://clickhouse.com/docs/interfaces/http/#response-buffering
  clickhouse_settings: {
    wait_end_of_query: 1,
  },
})
```

**예제:** (Node.js/웹) 자체 호스팅 ClickHouse 인스턴스에서 테이블 생성하기.  
[소스 코드](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_single_node.ts).

```ts
await client.command({
  query: `
    CREATE TABLE IF NOT EXISTS my_table
    (id UInt64, name String)
    ENGINE MergeTree()
    ORDER BY (id)
  `,
})
```

**예제:** (Node.js/웹) SELECT에서 INSERT 하는 방법.

```ts
await client.command({
  query: `INSERT INTO my_table SELECT '42'`,
})
```

:::important  
`abort_signal`로 취소된 요청은 서버에서 문장이 실행되지 않았을 것이라는 보장을 하지 않습니다.  
:::

### Exec 메서드 {#exec-method}

`query`/`insert`에 맞지 않는 사용자 정의 쿼리가 있고 결과에 관심이 있는 경우 `exec`를 `command`의 대안으로 사용할 수 있습니다.

`exec`는 읽을 수 있는 스트림을 반환하며, 이는 응용 프로그램 측에서 소비되거나 파괴되어야 합니다.

```ts
interface ExecParams extends BaseQueryParams {
  // Statement to execute.
  query: string
}

interface ClickHouseClient {
  exec(params: ExecParams): Promise<QueryResult>
}
```

참조: [모든 클라이언트 메서드의 기본 매개변수](./js.md#base-parameters-for-all-client-methods).

스트림 반환 유형은 Node.js와 웹 버전에서 다릅니다.

Node.js:

```ts
export interface QueryResult {
  stream: Stream.Readable
  query_id: string
}
```

웹:

```ts
export interface QueryResult {
  stream: ReadableStream
  query_id: string
}
```

### 핑 {#ping}

서버 연결 상태를 확인하기 위해 제공된 `ping` 메서드는 서버에 도달할 수 있는 경우 `true`를 반환합니다.

서버에 도달할 수 없는 경우, 기본 오류도 결과에 포함됩니다.

```ts
type PingResult =
  | { success: true }
  | { success: false; error: Error }

/** Parameters for the health-check request - using the built-in `/ping` endpoint. 
 *  This is the default behavior for the Node.js version. */
export type PingParamsWithEndpoint = {
  select: false
  /** AbortSignal instance to cancel a request in progress. */
  abort_signal?: AbortSignal
  /** Additional HTTP headers to attach to this particular request. */
  http_headers?: Record<string, string>
}
/** Parameters for the health-check request - using a SELECT query.
 *  This is the default behavior for the Web version, as the `/ping` endpoint does not support CORS.
 *  Most of the standard `query` method params, e.g., `query_id`, `abort_signal`, `http_headers`, etc. will work, 
 *  except for `query_params`, which does not make sense to allow in this method. */
export type PingParamsWithSelectQuery = { select: true } & Omit<
  BaseQueryParams,
  'query_params'
>
export type PingParams = PingParamsWithEndpoint | PingParamsWithSelectQuery

interface ClickHouseClient {
  ping(params?: PingParams): Promise<PingResult>
}
```

ClickHouse Cloud와 같이 인스턴스가 대기 상태일 수 있는 경우, 애플리케이션 시작 시 서버가 사용 가능한지를 확인하는 유용한 도구가 될 수 있습니다. 이때 핑을 통한 수신 후 몇 번 재시도하고 잠시 대기하는 것이 좋습니다.

기본적으로 Node.js 버전은 `/ping` 엔드포인트를 사용하고, 웹 버전은 유사한 결과를 얻기 위해 간단한 `SELECT 1` 쿼리를 사용하며, `/ping` 엔드포인트는 CORS를 지원하지 않기 때문입니다.

**예제:** (Node.js/웹) ClickHouse 서버 인스턴스에 간단한 핑. 참고: 웹 버전의 캡처된 오류는 다를 수 있습니다.  
[소스 코드](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/ping.ts).

```ts
const result = await client.ping();
if (!result.success) {
  // process result.error
}
```

**예제:** `ping` 메서드를 호출할 때 자격 증명도 확인하거나 `query_id`와 같은 추가 매개변수를 지정하려면 다음과 같이 사용할 수 있습니다:

```ts
const result = await client.ping({ select: true, /* query_id, abort_signal, http_headers, or any other query params */ });
```

ping 메서드는 대부분의 표준 `query` 메서드 매개변수를 허용합니다 - `PingParamsWithSelectQuery` 타이핑 정의를 참조하세요.

### 닫기 (Node.js 전용) {#close-nodejs-only}

열려 있는 모든 연결을 닫고 리소스를 해제합니다. 웹 버전에서는 효과가 없습니다.

```ts
await client.close()
```

## 스트리밍 파일 (Node.js 전용) {#streaming-files-nodejs-only}

클라이언트 저장소에는 인기 있는 데이터 형식(NDJSON, CSV, Parquet)으로 파일 스트리밍에 대한 여러 예제가 있습니다.

- [NDJSON 파일에서 스트리밍](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_ndjson.ts)
- [CSV 파일에서 스트리밍](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts)
- [Parquet 파일에서 스트리밍](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_parquet.ts)
- [Parquet 파일로 스트리밍하기](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts)

다른 형식을 파일로 스트리밍할 경우 Parquet와 유사할 것이며, 유일한 차이점은 `query` 호출에 사용하는 형식(`JSONEachRow`, `CSV` 등)과 출력 파일 이름입니다.

## 지원되는 데이터 형식 {#supported-data-formats}

클라이언트는 데이터를 JSON 또는 텍스트 형식으로 처리합니다.

`format`을 JSON 계열 형식 중 하나(`JSONEachRow`, `JSONCompactEachRow` 등)로 지정하면, 클라이언트는 전송 중에 데이터를 직렬화하고 역직렬화합니다.

"원시" 텍스트 형식(`CSV`, `TabSeparated`, `CustomSeparated` 계열)으로 제공된 데이터는 추가 변환 없이 전송됩니다.

:::tip
JSON이 일반 형식으로서와 [ClickHouse JSON 형식](/interfaces/formats/JSON) 간에 혼동이 있을 수 있습니다.

클라이언트는 [JSONEachRow](/interfaces/formats/JSONEachRow)와 같은 형식으로 JSON 객체 스트리밍을 지원합니다(기타 스트리밍 친화적 형식에 대한 테이블 개요 참조; 클라이언트 저장소의 `select_streaming_` [예시 참조](https://github.com/ClickHouse/clickhouse-js/tree/main/examples/node)).

[ClickHouse JSON](/interfaces/formats/JSON) 및 일부 다른 형식은 응답에서 단일 객체로 표현되며 클라이언트에 의해 스트리밍될 수 없습니다.
:::

| 형식                                       | 입력 (배열) | 입력 (객체) | 입력/출력 (스트림) | 출력 (JSON) | 출력 (텍스트)  |
|--------------------------------------------|---------------|----------------|-----------------------|---------------|----------------|
| JSON                                       | ❌             | ✔️             | ❌                     | ✔️            | ✔️             |
| JSONCompact                                | ❌             | ✔️             | ❌                     | ✔️            | ✔️             |
| JSONObjectEachRow                          | ❌             | ✔️             | ❌                     | ✔️            | ✔️             |
| JSONColumnsWithMetadata                    | ❌             | ✔️             | ❌                     | ✔️            | ✔️             |
| JSONStrings                                | ❌             | ❌             | ❌                     | ✔️            | ✔️             |
| JSONCompactStrings                         | ❌             | ❌             | ❌                     | ✔️            | ✔️             |
| JSONEachRow                                | ✔️            | ❌             | ✔️                    | ✔️            | ✔️             |
| JSONEachRowWithProgress                    | ❌            | ❌             | ✔️ ❗- 아래 참조       | ✔️            | ✔️             |
| JSONStringsEachRow                         | ✔️            | ❌             | ✔️                    | ✔️            | ✔️             |
| JSONCompactEachRow                         | ✔️            | ❌             | ✔️                    | ✔️            | ✔️             |
| JSONCompactStringsEachRow                  | ✔️            | ❌             | ✔️                    | ✔️            | ✔️             |
| JSONCompactEachRowWithNames                | ✔️            | ❌             | ✔️                    | ✔️            | ✔️             |
| JSONCompactEachRowWithNamesAndTypes        | ✔️            | ❌             | ✔️                    | ✔️            | ✔️             |
| JSONCompactStringsEachRowWithNames         | ✔️            | ❌             | ✔️                    | ✔️            | ✔️             |
| JSONCompactStringsEachRowWithNamesAndTypes | ✔️            | ❌             | ✔️                    | ✔️            | ✔️             |
| CSV                                        | ❌             | ❌             | ✔️                    | ❌             | ✔️             |
| CSVWithNames                               | ❌             | ❌             | ✔️                    | ❌             | ✔️             |
| CSVWithNamesAndTypes                       | ❌             | ❌             | ✔️                    | ❌             | ✔️             |
| TabSeparated                               | ❌             | ❌             | ✔️                    | ❌             | ✔️             |
| TabSeparatedRaw                            | ❌             | ❌             | ✔️                    | ❌             | ✔️             |
| TabSeparatedWithNames                      | ❌             | ❌             | ✔️                    | ❌             | ✔️             |
| TabSeparatedWithNamesAndTypes              | ❌             | ❌             | ✔️                    | ❌             | ✔️             |
| CustomSeparated                            | ❌             | ❌             | ✔️                    | ❌             | ✔️             |
| CustomSeparatedWithNames                   | ❌             | ❌             | ✔️                    | ❌             | ✔️             |
| CustomSeparatedWithNamesAndTypes           | ❌             | ❌             | ✔️                    | ❌             | ✔️             |
| Parquet                                    | ❌             | ❌             | ✔️                    | ❌             | ✔️❗- 아래 참조 |

Parquet의 경우, 주 사용 사례는 결과 스트림을 파일에 쓰는 것일 가능성이 높습니다. 클라이언트 저장소의 [예시](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts)를 참조하십시오.

`JSONEachRowWithProgress`는 스트림에서 진행 보고를 지원하는 출력 전용 형식입니다. 더 자세한 내용은 [이 예시](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_json_each_row_with_progress.ts)를 참조하십시오.

ClickHouse의 모든 입력 및 출력 형식을 찾을 수 있습니다 
[여기](/interfaces/formats).
## 지원되는 ClickHouse 데이터 유형 {#supported-clickhouse-data-types}

:::note
관련 JS 유형은 모든 `JSON*` 형식에 해당하며, 모든 내용을 문자열로 표현하는 형식(e.g., `JSONStringEachRow`)을 제외합니다.
:::

| 유형                   | 상태            | JS 유형                    |
|------------------------|-----------------|----------------------------|
| UInt8/16/32            | ✔️              | number                     |
| UInt64/128/256         | ✔️ ❗- 아래 참조 | string                     |
| Int8/16/32             | ✔️              | number                     |
| Int64/128/256          | ✔️ ❗- 아래 참조 | string                     |
| Float32/64             | ✔️              | number                     |
| Decimal                | ✔️ ❗- 아래 참조 | number                     |
| Boolean                | ✔️              | boolean                    |
| String                 | ✔️              | string                     |
| FixedString            | ✔️              | string                     |
| UUID                   | ✔️              | string                     |
| Date32/64              | ✔️              | string                     |
| DateTime32/64          | ✔️ ❗- 아래 참조 | string                     |
| Enum                   | ✔️              | string                     |
| LowCardinality         | ✔️              | string                     |
| Array(T)               | ✔️              | T[]                        |
| (new) JSON             | ✔️              | object                     |
| Variant(T1, T2...)     | ✔️              | T (variant에 따라 다름)   |
| Dynamic                | ✔️              | T (variant에 따라 다름)   |
| Nested                 | ✔️              | T[]                        |
| Tuple(T1, T2, ...)     | ✔️              | [T1, T2, ...]              |
| Tuple(n1 T1, n2 T2...) | ✔️              | \{ n1: T1; n2: T2; ...}    |
| Nullable(T)            | ✔️              | T 또는 null에 대한 JS 유형 |
| IPv4                   | ✔️              | string                     |
| IPv6                   | ✔️              | string                     |
| Point                  | ✔️              | [ number, number ]         |
| Ring                   | ✔️              | Array&lt;Point\>           |
| Polygon                | ✔️              | Array&lt;Ring\>            |
| MultiPolygon           | ✔️              | Array&lt;Polygon\>         |
| Map(K, V)              | ✔️              | Record&lt;K, V\>           |
| Time/Time64            | ✔️              | string                     |

ClickHouse의 모든 지원 형식 목록은 
[여기](/sql-reference/data-types/)에서 확인할 수 있습니다.

또한 참고: 

- [Dynamic/Variant/JSON 예시 작업](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/dynamic_variant_json.ts)
- [Time/Time64 예시 작업](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/time_time64.ts)
### Date/Date32 유형 주의사항 {#datedate32-types-caveats}

클라이언트는 값을 추가 형 변환 없이 삽입하므로 `Date`/`Date32` 유형 컬럼은 문자열로만 삽입할 수 있습니다.

**예제:** `Date` 유형 값을 삽입합니다. 
[소스 코드](https://github.com/ClickHouse/clickhouse-js/blob/ba387d7f4ce375a60982ac2d99cb47391cf76cec/__tests__/integration/date_time.test.ts)

```ts
await client.insert({
  table: 'my_table',
  values: [ { date: '2022-09-05' } ],
  format: 'JSONEachRow',
})
```

그러나 `DateTime` 또는 `DateTime64` 컬럼을 사용하는 경우, 문자열과 JS Date 객체를 모두 사용할 수 있습니다. JS Date 객체는 `insert`에 `date_time_input_format`이 `best_effort`로 설정된 상태로 그대로 전달할 수 있습니다. 더 자세한 내용은 [이 예시](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_js_dates.ts)를 참조하십시오.
### Decimal\* 유형 주의사항 {#decimal-types-caveats}

`JSON*` 계열 형식을 사용하여 Decimals를 삽입할 수 있습니다. 다음과 같은 테이블을 정의했다고 가정합시다:

```sql
CREATE TABLE my_table
(
  id     UInt32,
  dec32  Decimal(9, 2),
  dec64  Decimal(18, 3),
  dec128 Decimal(38, 10),
  dec256 Decimal(76, 20)
)
ENGINE MergeTree()
ORDER BY (id)
```

문자열 표현을 사용하여 정밀도 손실 없이 값을 삽입할 수 있습니다:

```ts
await client.insert({
  table: 'my_table',
  values: [{
    id: 1,
    dec32:  '1234567.89',
    dec64:  '123456789123456.789',
    dec128: '1234567891234567891234567891.1234567891',
    dec256: '12345678912345678912345678911234567891234567891234567891.12345678911234567891',
  }],
  format: 'JSONEachRow',
})
```

그러나 `JSON*` 형식으로 데이터를 쿼리할 때, ClickHouse는 기본적으로 Decimals를 _숫자_로 반환하여 정밀도 손실이 발생할 수 있습니다. 이를 피하기 위해 쿼리에서 Decimals를 문자열로 변환할 수 있습니다:

```ts
await client.query({
  query: `
    SELECT toString(dec32)  AS decimal32,
           toString(dec64)  AS decimal64,
           toString(dec128) AS decimal128,
           toString(dec256) AS decimal256
    FROM my_table
  `,
  format: 'JSONEachRow',
})
```

더 자세한 내용은 [이 예시](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_decimals.ts)를 참조하십시오.
### 정수형 유형: Int64, Int128, Int256, UInt64, UInt128, UInt256 {#integral-types-int64-int128-int256-uint64-uint128-uint256}

서버가 숫자로 받아들일 수는 있지만, `JSON*` 계열 출력 형식에서 문자열로 반환되며 이는 정수 오버플로우를 피하기 위함입니다. 이러한 유형의 최대값이 `Number.MAX_SAFE_INTEGER`보다 크기 때문입니다.

이 동작은 [`output_format_json_quote_64bit_integers` 설정](/operations/settings/formats#output_format_json_quote_64bit_integers)으로 수정할 수 있습니다.

**예제:** 64비트 숫자에 대한 JSON 출력 형식 조정.

```ts
const resultSet = await client.query({
  query: 'SELECT * from system.numbers LIMIT 1',
  format: 'JSONEachRow',
})

expect(await resultSet.json()).toEqual([ { number: '0' } ])
```

```ts
const resultSet = await client.query({
  query: 'SELECT * from system.numbers LIMIT 1',
  format: 'JSONEachRow',
  clickhouse_settings: { output_format_json_quote_64bit_integers: 0 },
})

expect(await resultSet.json()).toEqual([ { number: 0 } ])
```
## ClickHouse 설정 {#clickhouse-settings}

클라이언트는 [설정](/operations/settings/settings/) 메커니즘을 통해 ClickHouse 동작을 조정할 수 있습니다.
설정은 클라이언트 인스턴스 수준에서 설정할 수 있어 ClickHouse에 전송되는 모든 요청에 적용됩니다:

```ts
const client = createClient({
  clickhouse_settings: {}
})
```

또는 설정을 요청 수준에서 구성할 수 있습니다:

```ts
client.query({
  clickhouse_settings: {}
})
```

모든 지원되는 ClickHouse 설정에 대한 타입 선언 파일은 
[여기](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/settings.ts)에서 찾을 수 있습니다.

:::important
쿼리가 실행되는 사용자가 설정을 변경할 수 있는 충분한 권한을 가지고 있는지 확인하십시오.
:::
## 고급 주제 {#advanced-topics}
### 매개변수가 있는 쿼리 {#queries-with-parameters}

매개변수가 있는 쿼리를 작성하고 클라이언트 애플리케이션에서 값으로 전달할 수 있습니다. 이는 클라이언트 측에서 특정 동적 값으로 쿼리를 포맷하는 것을 피할 수 있게 해줍니다.

쿼리를 평소처럼 포맷한 다음, 애플리케이션 매개변수에서 쿼리로 전달할 값을 중괄호 안에 다음 형식으로 배치합니다:

```text
{<name>: <data_type>}
```

여기서:

- `name` — 자리 표시자 식별자입니다.
- `data_type` - 애플리케이션 매개변수 값의 [데이터 유형](/sql-reference/data-types/)입니다.

**예제:** 매개변수가 있는 쿼리. 
[소스 코드](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/query_with_parameter_binding.ts)입니다.

```ts
await client.query({
  query: 'SELECT plus({val1: Int32}, {val2: Int32})',
  format: 'CSV',
  query_params: {
    val1: 10,
    val2: 20,
  },
})
```

추가 세부정보는 https://clickhouse.com/docs/interfaces/cli#cli-queries-with-parameters-syntax를 확인하십시오.
### 압축 {#compression}

참고: 웹 버전에서는 요청 압축이 현재 사용할 수 없습니다. 응답 압축은 정상적으로 작동합니다. Node.js 버전은 둘 다 지원합니다.

대량 데이터 세트를 처리하는 데이터 애플리케이션은 압축을 활성화함으로써 이점을 누릴 수 있습니다. 현재 `GZIP`만 [zlib](https://nodejs.org/docs/latest-v14.x/api/zlib.html)를 통해 지원됩니다.

```typescript
createClient({
  compression: {
    response: true,
    request: true
  }
})
```

구성 매개변수는 다음과 같습니다:

- `response: true`는 ClickHouse 서버에 압축된 응답 본문으로 응답하도록 지시합니다. 기본값: `response: false`
- `request: true`는 클라이언트 요청 본문에서 압축을 활성화합니다. 기본값: `request: false`
### 로깅 (Node.js 전용) {#logging-nodejs-only}

:::important
로깅은 실험적 기능이며 향후 변경될 수 있습니다.
:::

기본 로거 구현은 `stdout`로 로그 레코드를 `console.debug/info/warn/error` 메서드를 통해 출력합니다.
`LoggerClass`를 제공하여 로깅 논리를 사용자 정의할 수 있으며, `level` 매개변수를 통해 원하는 로깅 수준을 선택할 수 있습니다(기본값은 `OFF`):

```typescript
import type { Logger } from '@clickhouse/client'

// All three LogParams types are exported by the client
interface LogParams {
  module: string
  message: string
  args?: Record<string, unknown>
}
type ErrorLogParams = LogParams & { err: Error }
type WarnLogParams = LogParams & { err?: Error }

class MyLogger implements Logger {
  trace({ module, message, args }: LogParams) {
    // ...
  }
  debug({ module, message, args }: LogParams) {
    // ...
  }
  info({ module, message, args }: LogParams) {
    // ...
  }
  warn({ module, message, args }: WarnLogParams) {
    // ...
  }
  error({ module, message, args, err }: ErrorLogParams) {
    // ...
  }
}

const client = createClient({
  log: {
    LoggerClass: MyLogger,
    level: ClickHouseLogLevel
  }
})
```

현재 클라이언트는 다음 이벤트를 로깅합니다:

- `TRACE` - Keep-Alive 소켓 생명 주기에 대한 저수준 정보
- `DEBUG` - 응답 정보(인증 헤더 및 호스트 정보 제외)
- `INFO` - 일반 사용되지 않음; 클라이언트가 초기화될 때 현재 로깅 수준을 인쇄합니다.
- `WARN` - 비치명적 오류; `ping` 요청 실패는 경고로 로깅되며 반환된 결과에 기본 오류가 포함되어 있습니다.
- `ERROR` - `query`/`insert`/`exec`/`command` 메서드의 치명적 오류, 예를 들어 요청 실패 등.

기본 Logger 구현을 [여기](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/logger.ts)에서 확인할 수 있습니다.
### TLS 인증서 (Node.js 전용) {#tls-certificates-nodejs-only}

Node.js 클라이언트는 기본(TLS 인증 기관 전용) 및 상호(TLS 인증 기관 및 클라이언트 인증서) TLS를 선택적으로 지원합니다.

기본 TLS 구성 예제는 인증서가 `certs` 폴더에 있고 CA 파일 이름이 `CA.pem`이라고 가정합니다:

```ts
const client = createClient({
  url: 'https://<hostname>:<port>',
  username: '<username>',
  password: '<password>', // if required
  tls: {
    ca_cert: fs.readFileSync('certs/CA.pem'),
  },
})
```

클라이언트 인증서를 사용하는 상호 TLS 구성 예제:

```ts
const client = createClient({
  url: 'https://<hostname>:<port>',
  username: '<username>',
  tls: {
    ca_cert: fs.readFileSync('certs/CA.pem'),
    cert: fs.readFileSync(`certs/client.crt`),
    key: fs.readFileSync(`certs/client.key`),
  },
})
```

저장소에서 [기본](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/basic_tls.ts) 및 [상호](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/mutual_tls.ts) TLS의 전체 예제를 참조하십시오.
### Keep-alive 구성 (Node.js 전용) {#keep-alive-configuration-nodejs-only}

클라이언트는 기본적으로 기본 HTTP 에이전트에서 Keep-Alive를 활성화하며, 이는 연결된 소켓이 이후 요청에 재사용됨을 의미하며, `Connection: keep-alive` 헤더가 전송됩니다. 유휴 상태의 소켓은 기본적으로 2500밀리초 동안 연결 풀에 남아 있습니다(이 옵션 조정에 대한 [노트 참고](./js.md#adjusting-idle_socket_ttl)).

`keep_alive.idle_socket_ttl`은 서버/LB 구성보다 상당히 낮은 값을 가져야 합니다. 그 주요 이유는 HTTP/1.1이 서버가 클라이언트에 알리지 않고 소켓을 닫을 수 있도록 허용하므로, 서버나 로드 밸런서가 클라이언트보다 먼저 연결을 닫으면 클라이언트가 닫힌 소켓을 재사용하려고 시도하여 `socket hang up` 오류가 발생할 수 있기 때문입니다.

`keep_alive.idle_socket_ttl`을 조정하는 경우, 이는 항상 서버/LB Keep-Alive 구성과 동기화되어 있어야 하며, **항상 그보다 낮아야** 하여 서버가 열린 연결을 먼저 닫지 않도록 해야 합니다.
#### `idle_socket_ttl` 조정 {#adjusting-idle_socket_ttl}

클라이언트는 안전한 기본값으로 간주될 수 있는 2500밀리초로 `keep_alive.idle_socket_ttl`을 설정합니다. 서버 측에서 `keep_alive_timeout`은 ClickHouse 23.11 이전 버전에서 [최대로 3초까지 설정될 수 있습니다](https://github.com/ClickHouse/ClickHouse/commit/1685cdcb89fe110b45497c7ff27ce73cc03e82d1) `config.xml` 수정 없이.

:::warning
성능이 만족스럽고 문제가 발생하지 않으면, `keep_alive.idle_socket_ttl` 설정 값을 **증가시키지 않는 것이 좋습니다**, 이는 잠재적인 "Socket hang-up" 오류를 초래할 수 있습니다; 또한, 애플리케이션이 많은 쿼리를 전송하고 그 사이에 큰 다운타임이 없다면 기본값으로 충분할 수 있으며, 소켓이 유휴 상태가 되는 시간을 충분히 확보하지 못하고 클라이언트가 그것들을 풀에 유지할 것입니다.
:::

다음 명령을 실행하여 서버 응답 헤더에서 올바른 Keep-Alive 시간 초과 값을 찾을 수 있습니다:

```sh
curl -v --data-binary "SELECT 1" <clickhouse_url>
```

응답에서 `Connection` 및 `Keep-Alive` 헤더의 값을 확인하십시오. 예를 들어:

```text
< Connection: Keep-Alive
< Keep-Alive: timeout=10
```

이 경우 `keep_alive_timeout`은 10초이며, 유휴 소켓을 기본값보다 조금 더 긴 시간 동안 열린 상태로 유지하기 위해 `keep_alive.idle_socket_ttl`을 9000 또는 9500 밀리초로 증가시켜 볼 수 있습니다. 서버가 클라이언트보다 먼저 연결을 닫는 경우를 나타내는 잠재적인 "Socket hang-up" 오류에 주의하고, 오류가 사라질 때까지 값을 낮추십시오.
#### 문제 해결 {#troubleshooting}

최신 버전의 클라이언트를 사용하는 경우에도 `socket hang up` 오류가 발생하는 경우, 다음 옵션을 통해 문제를 해결할 수 있습니다:

* 최소 `WARN` 로그 수준으로 로그를 활성화하십시오. 이는 애플리케이션 코드에서 소비되지 않거나 대기 중인 스트림이 있는지 확인할 수 있게 해줍니다: 전송 계층은 `WARN` 수준으로 이를 로깅하여 소켓이 서버에 의해 닫힐 수 있는 상황을 피할 수 있습니다. 클라이언트 구성에서 로깅을 다음과 같이 활성화할 수 있습니다:
  
```ts
const client = createClient({
  log: { level: ClickHouseLogLevel.WARN },
})
```

* [no-floating-promises](https://typescript-eslint.io/rules/no-floating-promises/) ESLint 규칙이 활성화된 상태에서 애플리케이션 코드를 확인하여 대기 중인 스트림 및 소켓으로 이어질 수 있는 처리되지 않은 약속을 식별합니다.

* ClickHouse 서버 구성에서 `keep_alive.idle_socket_ttl` 설정을 약간 줄입니다. 예를 들어, 클라이언트와 서버 간의 높은 네트워크 지연으로 인해 특정 상황에서는 `keep_alive.idle_socket_ttl`을 추가로 200~500 밀리초 줄이는 것이 유리할 수 있으며, 이는 나가는 요청이 서버가 닫으려고 하는 소켓을 얻을 수 있는 상황을 배제하는 데 도움을 줄 수 있습니다.

* 데이터가 들어오거나 나가지 않는 장기 실행 쿼리(예: 긴 실행 `INSERT FROM SELECT`) 중에 이 오류가 발생하는 경우, 이는 로드 밸런서가 유휴 연결을 닫는 것 때문일 수 있습니다. 긴 실행 쿼리 동안 약간의 데이터가 유입되도록 하기 위해 다음 ClickHouse 설정을 조합하여 사용할 수 있습니다:

```ts
const client = createClient({
  // Here we assume that we will have some queries with more than 5 minutes of execution time
  request_timeout: 400_000,
  /** These settings in combination allow to avoid LB timeout issues in case of long-running queries without data coming in or out,
   *  such as `INSERT FROM SELECT` and similar ones, as the connection could be marked as idle by the LB and closed abruptly.
   *  In this case, we assume that the LB has idle connection timeout of 120s, so we set 110s as a "safe" value. */
  clickhouse_settings: {
    send_progress_in_http_headers: 1,
    http_headers_progress_interval_ms: '110000', // UInt64, should be passed as a string
  },
})
```
  그러나 최근 Node.js 버전에서는 수신 헤더의 총 크기에 16KB 제한이 있으며, 일부 진행 헤더가 수신된 후(우리 테스트에서는 약 70-80개) 예외가 발생합니다.

  또한 대기 시간을 완전히 피하는 전혀 다른 접근 방식을 사용할 수 있습니다. 이는 연결이 끊겨도 변동이 취소되지 않는 HTTP 인터페이스의 "기능"을 활용하여 수행할 수 있습니다. 추가 세부정보는 [이 예시 (2부)](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/long_running_queries_timeouts.ts)를 참조하십시오.

* Keep-Alive 기능을 완전히 비활성화할 수 있습니다. 이 경우 클라이언트는 요청마다 `Connection: close` 헤더를 추가하고 기본 HTTP 에이전트는 연결을 재사용하지 않습니다. `keep_alive.idle_socket_ttl` 설정은 무시되며, 유휴 소켓이 없으므로 추가 오버헤드가 발생하며 모든 요청에 대해 새로운 연결이 설정됩니다.

```ts
const client = createClient({
  keep_alive: {
    enabled: false,
  },
})
```
### 읽기 전용 사용자 {#read-only-users}

[readonly=1 사용자](/operations/settings/permissions-for-queries#readonly)로 클라이언트를 사용할 때, 응답 압축을 활성화할 수 없으며 이는 `enable_http_compression` 설정을 요구합니다. 다음 구성은 오류를 발생시킵니다:

```ts
const client = createClient({
  compression: {
    response: true, // won't work with a readonly=1 user
  },
})
```

읽기 전용 사용자의 제한을 더 자세히 설명하는 [예시](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/read_only_user.ts)를 참조하십시오.
### 경로가 있는 프록시 {#proxy-with-a-pathname}

ClickHouse 인스턴스가 프록시 뒤에 있으며 URL에 경로가 포함된 경우, 예를 들어 http://proxy:8123/clickhouse_server와 같이, `clickhouse_server`를 `pathname` 구성 옵션으로 지정하십시오(선행 슬래시 유무에 관계없이). 그렇지 않으면 `url`에 직접 제공되면 `database` 옵션으로 간주됩니다. 여러 세그먼트가 지원됩니다. 예: `/my_proxy/db`.

```ts
const client = createClient({
  url: 'http://proxy:8123',
  pathname: '/clickhouse_server',
})
```
### 인증이 있는 리버스 프록시 {#reverse-proxy-with-authentication}

ClickHouse 배포 앞에 인증이 필요한 리버스 프록시가 있는 경우 필요한 헤더를 제공하기 위해 `http_headers` 설정을 사용할 수 있습니다:

```ts
const client = createClient({
  http_headers: {
    'My-Auth-Header': '...',
  },
})
```
### 사용자 정의 HTTP/HTTPS 에이전트 (실험적, Node.js 전용) {#custom-httphttps-agent-experimental-nodejs-only}

:::warning
이는 실험적 기능으로, 향후 릴리스에서 하위 호환 방식으로 변경될 수 있습니다. 클라이언트가 제공하는 기본 구현 및 설정은 대부분의 사용 사례에 충분해야 합니다. 이 기능은 필요하다고 확신하는 경우에만 사용하십시오.
:::

기본적으로 클라이언트는 클라이언트 구성에서 제공된 설정(예: `max_open_connections`, `keep_alive.enabled`, `tls`)을 사용하여 기본 HTTP(s) 에이전트를 구성하며, 이는 ClickHouse 서버에 대한 연결을 처리합니다. 또한 TLS 인증서를 사용하는 경우, 기본 에이전트는 필요한 인증서로 구성되며 올바른 TLS 인증 헤더가 강제 적용됩니다.

1.2.0 이후, 클라이언트에 사용자 정의 HTTP(s) 에이전트를 제공하고 기본 에이전트를 대체할 수 있습니다. 이는 까다로운 네트워크 구성에서 유용할 수 있습니다. 사용자 정의 에이전트를 제공하는 경우 적용되는 조건은 다음과 같습니다:
- `max_open_connections` 및 `tls` 옵션은 _영향을 미치지 않으며_ 클라이언트에 의해 무시됩니다. 이는 기본 에이전트 구성의 일부입니다.
- `keep_alive.enabled`는 `Connection` 헤더의 기본값을 조절합니다 (`true` -> `Connection: keep-alive`, `false` -> `Connection: close`).
- 유휴 keep-alive 소켓 관리는 여전히 작동하지만(이는 에이전트에만 연결되는 것이 아니라 특정 소켓에 연결됩니다), `keep_alive.idle_socket_ttl` 값을 `0`으로 설정하여 이를 완전히 비활성화할 수 있습니다.
#### 사용자 정의 에이전트 사용 예시 {#custom-agent-usage-examples}

인증서 없이 사용자 정의 HTTP(s) 에이전트를 사용하는 예:

```ts
const agent = new http.Agent({ // or https.Agent
  keepAlive: true,
  keepAliveMsecs: 2500,
  maxSockets: 10,
  maxFreeSockets: 10,
})
const client = createClient({
  http_agent: agent,
})
```

기본 TLS 및 CA 인증서를 사용하는 사용자 정의 HTTPS 에이전트를 사용하는 예:

```ts
const agent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 2500,
  maxSockets: 10,
  maxFreeSockets: 10,
  ca: fs.readFileSync('./ca.crt'),
})
const client = createClient({
  url: 'https://myserver:8443',
  http_agent: agent,
  // With a custom HTTPS agent, the client won't use the default HTTPS connection implementation; the headers should be provided manually
  http_headers: {
    'X-ClickHouse-User': 'username',
    'X-ClickHouse-Key': 'password',
  },
  // Important: authorization header conflicts with the TLS headers; disable it.
  set_basic_auth_header: false,
})
```

상호 TLS를 사용하는 사용자 정의 HTTPS 에이전트를 사용하는 예:

```ts
const agent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 2500,
  maxSockets: 10,
  maxFreeSockets: 10,
  ca: fs.readFileSync('./ca.crt'),
  cert: fs.readFileSync('./client.crt'),
  key: fs.readFileSync('./client.key'),
})
const client = createClient({
  url: 'https://myserver:8443',
  http_agent: agent,
  // With a custom HTTPS agent, the client won't use the default HTTPS connection implementation; the headers should be provided manually
  http_headers: {
    'X-ClickHouse-User': 'username',
    'X-ClickHouse-Key': 'password',
    'X-ClickHouse-SSL-Certificate-Auth': 'on',
  },
  // Important: authorization header conflicts with the TLS headers; disable it.
  set_basic_auth_header: false,
})
```

인증서 _및_ 사용자 정의 _HTTPS_ 에이전트와 함께 사용할 경우, 기본 인증 헤더를 비활성화하기 위해 `set_basic_auth_header` 설정(1.2.0에서 도입됨)을 통해 TLS 헤더와 충돌하게 되므로 이를 수동으로 제공해야 함이 필요할 수 있습니다.
## 알려진 제한 사항 (Node.js/web) {#known-limitations-nodejsweb}

- 결과 세트에 대한 데이터 매퍼가 없으므로 언어 기본값만 사용됩니다. 특정 데이터 유형 매퍼는 [RowBinary 형식 지원](https://github.com/ClickHouse/clickhouse-js/issues/216)과 함께 예정되어 있습니다.
- 일부 [Decimal* 및 Date\* / DateTime\* 데이터 유형 주의사항](./js.md#datedate32-types-caveats)도 있습니다.
- JSON* 계열 형식을 사용할 때 Int32보다 큰 숫자는 문자열로 표현됩니다. 이는 Int64+ 유형의 최대값이 `Number.MAX_SAFE_INTEGER`보다 크기 때문입니다. 자세한 내용은 [정수형 유형](./js.md#integral-types-int64-int128-int256-uint64-uint128-uint256) 섹션을 참조하십시오.
## 알려진 제한 사항 (웹) {#known-limitations-web}

- 선택 쿼리에 대한 스트리밍은 작동하지만 삽입에 대해서는 비활성화되어 있습니다(유형 수준에서도 마찬가지입니다).
- 요청 압축은 비활성화되어 있으며 구성은 무시됩니다. 응답 압축은 작동합니다.
- 현재 로깅 지원이 없습니다.
## 성능 최적화 팁 {#tips-for-performance-optimizations}

- 애플리케이션의 메모리 소비를 줄이기 위해 대량 삽입(예: 파일에서) 및 선택에 대해 스트림을 사용하는 것을 고려하십시오. 이벤트 리스너 및 유사한 사용 사례에 대해서는 [비동기 삽입](/optimize/asynchronous-inserts)이 좋은 옵션이 될 수 있으며, 클라이언트 측에서 배칭을 최소화하거나 완전히 피할 수 있게 해줍니다. 비동기 삽입 예시는 [클라이언트 저장소](https://github.com/ClickHouse/clickhouse-js/tree/main/examples)에서 `async_insert_`가 파일 이름 접두사로 사용됩니다.
- 클라이언트는 기본적으로 요청 또는 응답 압축을 활성화하지 않습니다. 그러나 대량 데이터 세트를 선택하거나 삽입할 때 `ClickHouseClientConfigOptions.compression`을 통해 이를 활성화하는 것을 고려할 수 있습니다(위치적 `request` 또는 `response`, 또는 둘 다).
- 압축은 성능에 상당한 패널티를 유발합니다. `request` 또는 `response`에 대해 활성화하면 각각 선택 또는 삽입 속도에 부정적인 영향을 미치지만, 애플리케이션에서 전송되는 네트워크 트래픽의 양을 줄이는 데는 효과적입니다.
## 연락처 {#contact-us}

질문이 있거나 도움이 필요하시면 [커뮤니티 슬랙](https://clickhouse.com/slack)(` #clickhouse-js ` 채널)이나 [GitHub 문제](https://github.com/ClickHouse/clickhouse-js/issues)를 통해 언제든지 연락해 주십시오.
