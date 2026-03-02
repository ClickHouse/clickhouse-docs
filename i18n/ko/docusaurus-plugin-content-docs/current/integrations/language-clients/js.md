---
sidebar_label: 'JavaScript'
sidebar_position: 4
keywords: ['clickhouse', 'js', 'JavaScript', 'NodeJS', 'web', 'browser', 'Cloudflare', 'workers', 'client', 'connect', 'integrate']
slug: /integrations/javascript
description: 'ClickHouse에 연결하는 공식 JS 클라이언트입니다.'
title: 'ClickHouse JS'
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'language_client'
  - website: 'https://github.com/ClickHouse/clickhouse-js'
---

import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# ClickHouse JS \{#clickhouse-js\}

ClickHouse에 연결하기 위한 공식 JS 클라이언트입니다.
클라이언트는 TypeScript로 작성되었으며, 클라이언트 public API에 대한 타입 정보를 제공합니다.

이 클라이언트는 외부 의존성이 없고, 최대 성능을 위해 최적화되어 있으며, 다양한 ClickHouse 버전과 구성(온프레미스 단일 노드, 온프레미스 클러스터, ClickHouse Cloud)에서 테스트되었습니다.

다양한 환경에서 사용할 수 있도록 두 가지 버전의 클라이언트를 제공합니다:

- `@clickhouse/client` - Node.js 전용
- `@clickhouse/client-web` - 브라우저(Chrome/Firefox), Cloudflare workers용

TypeScript를 사용할 때는 [버전 4.5 이상](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html)인지 확인하십시오. 이 버전에서는 [inline import 및 export 구문](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#type-modifiers-on-import-names)을 사용할 수 있습니다.

클라이언트 소스 코드는 [ClickHouse-JS GitHub 리포지토리](https://github.com/ClickHouse/clickhouse-js)에서 확인할 수 있습니다.

## 환경 요구 사항 (Node.js) \{#environment-requirements-nodejs\}

클라이언트를 실행하려면 환경에 Node.js가 설치되어 있어야 합니다.
클라이언트는 현재 [유지보수되는](https://github.com/nodejs/release#readme) 모든 Node.js 릴리스와 호환됩니다.

Node.js 버전의 End-Of-Life가 가까워지면, 해당 버전은 구식이고 보안에 취약한 것으로 간주되어 클라이언트 지원 대상에서 제외됩니다.

현재 지원되는 Node.js 버전:

| Node.js version | 지원 여부           |
|-----------------|---------------------|
| 24.x            | ✔                   |
| 22.x            | ✔                   |
| 20.x            | ✔                   |
| 18.x            | 최대한 지원(Best effort) |

## 환경 요구 사항(웹) \{#environment-requirements-web\}

클라이언트의 웹 버전은 최신 버전의 Chrome 및 Firefox 브라우저에서 공식적으로 테스트되었으며, 예를 들어 React/Vue/Angular 애플리케이션이나 Cloudflare Workers에서 의존성으로 사용할 수 있습니다.

## 설치 \{#installation\}

최신 안정 버전의 Node.js 클라이언트를 설치하려면 다음 명령을 실행하십시오:

```sh
npm i @clickhouse/client
```

웹 버전 설치:

```sh
npm i @clickhouse/client-web
```


## ClickHouse와의 호환성 \{#compatibility-with-clickhouse\}

| 클라이언트 버전 | ClickHouse |
|----------------|------------|
| 1.12.0         | 24.8+      |

클라이언트가 이전 버전에서도 동작할 가능성이 크지만, best-effort 수준으로만 지원되므로 동작이 보장되지는 않습니다. 사용 중인 ClickHouse 버전이 23.3보다 이전인 경우 [ClickHouse 보안 정책](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md)을 참고하고 업그레이드를 고려하십시오.

## 예시 \{#examples\}

클라이언트 저장소의 [예시](https://github.com/ClickHouse/clickhouse-js/blob/main/examples)를 통해 다양한 클라이언트 사용 시나리오를 포괄하는 것을 목표로 합니다.

개요는 [examples README](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/README.md#overview)에서 확인할 수 있습니다. 

예시나 이후 문서에서 내용이 불명확하거나 누락된 부분이 있다면, 언제든지 [문의](./js.md#contact-us)해 주십시오.

### Client API \{#client-api\}

별도로 명시하지 않는 한, 대부분의 예시는 Node.js 및 웹 버전의 클라이언트 모두에서 사용할 수 있습니다.

#### 클라이언트 인스턴스 생성 \{#creating-a-client-instance\}

`createClient` 팩토리 함수를 사용하여 필요한 만큼 클라이언트 인스턴스를 생성할 수 있습니다.

```ts
import { createClient } from '@clickhouse/client' // or '@clickhouse/client-web'

const client = createClient({
  /* configuration */
})
```

사용 중인 환경이 ESM 모듈을 지원하지 않는다면, 대신 CJS 구문을 사용할 수 있습니다:

```ts
const { createClient } = require('@clickhouse/client');

const client = createClient({
  /* configuration */
})
```

클라이언트 인스턴스는 생성 시 [미리 구성](./js.md#configuration)할 수 있습니다.


#### Configuration \{#configuration\}

클라이언트 인스턴스를 생성할 때 다음과 같은 연결 설정을 조정할 수 있습니다.

| Setting                                                                  | 설명                                                                                 | 기본값                  | 참고                                                                                       |
|--------------------------------------------------------------------------|-------------------------------------------------------------------------------------|-------------------------|--------------------------------------------------------------------------------------------|
| **url**?: string                                                         | ClickHouse 인스턴스 URL입니다.                                                       | `http://localhost:8123` | [URL 구성 문서](./js.md#url-configuration)                                                 |
| **pathname**?: string                                                    | 클라이언트가 ClickHouse URL을 파싱한 뒤 URL에 추가할 선택적 경로(pathname)입니다.   | `''`                    | [pathname을 사용하는 프록시 문서](./js.md#proxy-with-a-pathname)                          |
| **request_timeout**?: number                                             | 요청 타임아웃(밀리초)입니다.                                                        | `30_000`                | -                                                                                          |
| **compression**?: `{ **response**?: boolean; **request**?: boolean }`    | 압축을 활성화합니다.                                                                 | -                       | [압축 문서](./js.md#compression)                                                           |
| **username**?: string                                                    | 요청을 실행하는 사용자 이름입니다.                                                   | `default`               | -                                                                                          |
| **password**?: string                                                    | 사용자 비밀번호입니다.                                                              | `''`                    | -                                                                                          |
| **application**?: string                                                 | Node.js 클라이언트를 사용하는 애플리케이션 이름입니다.                              | `clickhouse-js`         | -                                                                                          |
| **database**?: string                                                    | 사용할 데이터베이스 이름입니다.                                                      | `default`               | -                                                                                          |
| **clickhouse_settings**?: ClickHouseSettings                             | 모든 요청에 적용할 ClickHouse 설정입니다.                                            | `{}`                    | -                                                                                          |
| **log**?: `{ **LoggerClass**?: Logger, **level**?: ClickHouseLogLevel }` | 내부 클라이언트 로그 구성입니다.                                                    | -                       | [로깅 문서](./js.md#logging-nodejs-only)                                                   |
| **session_id**?: string                                                  | 모든 요청에 함께 전송할 선택적 ClickHouse 세션 ID입니다.                            | -                       | -                                                                                          |
| **keep_alive**?: `{ **enabled**?: boolean }`                             | Node.js 및 Web 버전 모두에서 기본적으로 활성화됩니다.                               | -                       | -                                                                                          |
| **http_headers**?: `Record<string, string>`                              | ClickHouse로 전송되는 요청에 추가할 HTTP 헤더입니다.                                | -                       | [인증이 포함된 리버스 프록시 문서](./js.md#reverse-proxy-with-authentication)             |
| **roles**?: string \|  string[]                                          | 나가는 요청에 첨부할 ClickHouse 역할(role) 이름입니다.                              | -                       | [HTTP 인터페이스에서 역할(role) 사용하기](/interfaces/http#setting-role-with-query-parameters) |

#### Node.js 전용 구성 매개변수 \{#nodejs-specific-configuration-parameters\}

| Setting                                                                    | 설명                                                        | 기본값        | 참고 문서                                                                                             |
|----------------------------------------------------------------------------|-------------------------------------------------------------|---------------|--------------------------------------------------------------------------------------------------------|
| **max_open_connections**?: number                                          | 호스트당 허용되는 최대 소켓 연결 수입니다.                  | `10`          | -                                                                                                      |
| **tls**?: `{ **ca_cert**: Buffer, **cert**?: Buffer, **key**?: Buffer }`   | TLS 인증서를 구성합니다.                                   | -             | [TLS 문서](./js.md#tls-certificates-nodejs-only)                                                       |
| **keep_alive**?: `{ **enabled**?: boolean, **idle_socket_ttl**?: number }` | -                                                           | -             | [Keep Alive 문서](./js.md#keep-alive-configuration-nodejs-only)                                       |
| **http_agent**?: http.Agent \| https.Agent <br/><ExperimentalBadge/>       | 클라이언트용 사용자 지정 HTTP agent입니다.                 | -             | [HTTP agent 문서](./js.md#custom-httphttps-agent-experimental-nodejs-only)                            |
| **set_basic_auth_header**?: boolean <br/><ExperimentalBadge/>              | 기본 인증 자격 증명으로 `Authorization` 헤더를 설정합니다. | `true`        | [이 설정의 사용 방법은 HTTP agent 문서에서 확인하십시오](./js.md#custom-httphttps-agent-experimental-nodejs-only) |

### URL configuration \{#url-configuration\}

:::important
URL 설정은 이때 하드코딩된 값을 *항상* 덮어쓰며, 이 경우 경고가 로그에 기록됩니다.
:::

대부분의 클라이언트 인스턴스 매개변수는 URL로 설정할 수 있습니다. URL 형식은 `http[s]://[username:password@]hostname:port[/database][?param1=value1&param2=value2]`입니다. 대부분의 경우 특정 매개변수 이름은 설정 옵션 인터페이스에서의 경로를 반영하지만, 일부 예외가 있습니다. 지원되는 매개변수는 다음과 같습니다:

| Parameter                                   | Type                                                      |
| ------------------------------------------- | --------------------------------------------------------- |
| `pathname`                                  | 임의의 문자열.                                                  |
| `application_id`                            | 임의의 문자열.                                                  |
| `session_id`                                | 임의의 문자열.                                                  |
| `request_timeout`                           | 음수가 아닌 숫자.                                                |
| `max_open_connections`                      | 0보다 큰 음수가 아닌 숫자.                                          |
| `compression_request`                       | boolean. 아래 (1) 참고                                        |
| `compression_response`                      | boolean.                                                  |
| `log_level`                                 | 허용되는 값: `OFF`, `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`. |
| `keep_alive_enabled`                        | boolean.                                                  |
| `clickhouse_setting_*` or `ch_*`            | 아래 (2) 참고                                                 |
| `http_header_*`                             | 아래 (3) 참고                                                 |
| (Node.js only) `keep_alive_idle_socket_ttl` | 음수가 아닌 숫자.                                                |

* (1) boolean의 경우 유효한 값은 `true`/`1` 및 `false`/`0`입니다.
* (2) `clickhouse_setting_` 또는 `ch_` 접두사가 붙은 모든 매개변수는 이 접두사가 제거되고 나머지 부분이 클라이언트의 `clickhouse_settings`에 추가됩니다. 예를 들어, `?ch_async_insert=1&ch_wait_for_async_insert=1`은 다음과 동일합니다:

```ts
createClient({
  clickhouse_settings: {
    async_insert: 1,
    wait_for_async_insert: 1,
  },
})
```

참고: `clickhouse_settings`의 boolean 값은 URL에서 `1`/`0`으로 전달해야 합니다.

* (3) (2)와 비슷하지만, `http_header` 설정에 사용됩니다. 예를 들어 `?http_header_x-clickhouse-auth=foobar`는 다음과 동일합니다.

```ts
createClient({
  http_headers: {
    'x-clickhouse-auth': 'foobar',
  },
})
```


### 연결 \{#connecting\}

#### 연결 정보 확인하기 \{#gather-your-connection-details\}

<ConnectionDetails />

#### 연결 개요 \{#connection-overview\}

클라이언트는 HTTP(s) 프로토콜을 통해 연결을 구현합니다. RowBinary 지원은 진행 중이며, [관련 이슈](https://github.com/ClickHouse/clickhouse-js/issues/216)를 참고하십시오.

다음 예제는 ClickHouse Cloud에 대한 연결을 설정하는 방법을 보여 줍니다. `url`(프로토콜 및 포트를 포함)과 `password` 값은 환경 변수로 지정되고, `default` 사용자가 사용된다고 가정합니다.

**예시:** 환경 변수로 설정을 구성하는 Node.js Client 인스턴스 생성

```ts
import { createClient } from '@clickhouse/client'

const client = createClient({
  url: process.env.CLICKHOUSE_HOST ?? 'http://localhost:8123',
  username: process.env.CLICKHOUSE_USER ?? 'default',
  password: process.env.CLICKHOUSE_PASSWORD ?? '',
})
```

클라이언트 저장소에는 환경 변수를 사용하는 예제가 여러 개 포함되어 있으며, 예를 들어 [ClickHouse Cloud에서 테이블을 생성하는 예제](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts), [async insert를 사용하는 예제](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert.ts) 등이 있습니다.


#### 연결 풀(Node.js 전용) \{#connection-pool-nodejs-only\}

요청마다 새 연결을 생성하는 오버헤드를 피하기 위해, 클라이언트는 Keep-Alive 메커니즘을 활용하여 ClickHouse에 대한 연결을 재사용할 수 있는 연결 풀을 생성합니다. 기본적으로 Keep-Alive가 활성화되어 있으며, 연결 풀의 크기는 `10`으로 설정되어 있습니다. 하지만 `max_open_connections` [구성 옵션](./js.md#configuration)을 사용하여 변경할 수 있습니다. 

사용자가 `max_open_connections: 1`을 설정하지 않으면, 풀에 있는 동일한 연결이 이후 쿼리에 사용된다는 보장은 없습니다. 이는 드물게 필요하지만, 임시 테이블을 사용하는 경우에는 필요할 수 있습니다.

관련 항목: [Keep-Alive 구성](./js.md#keep-alive-configuration-nodejs-only).

### Query ID \{#query-id\}

`command`, `exec`, `insert`, `select`와 같이 쿼리나 구문을 전송하는 모든 메서드는 결과에 `query_id`를 포함합니다. 이 고유 식별자는 쿼리마다 클라이언트에서 할당되며, [서버 구성](/operations/server-configuration-parameters/settings)에서 활성화된 경우 `system.query_log`에서 데이터를 조회하거나, 장시간 실행되는 쿼리를 취소하는 데 유용하게 사용할 수 있습니다([예제](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/cancel_query.ts) 참고). 필요하다면 `query_id`는 `command`/`query`/`exec`/`insert` 메서드의 매개변수에서 사용자가 재정의할 수 있습니다.

:::tip
`query_id` 매개변수를 재정의하는 경우, 매 호출마다 고유하게 유지되도록 해야 합니다. 랜덤 UUID를 사용하는 것이 좋은 선택입니다.
:::

### 모든 클라이언트 메서드에 공통적으로 적용되는 기본 파라미터 \{#base-parameters-for-all-client-methods\}

모든 클라이언트 메서드([query](./js.md#query-method)/[command](./js.md#command-method)/[insert](./js.md#insert-method)/[exec](./js.md#exec-method))에 공통적으로 적용할 수 있는 여러 파라미터가 있습니다.

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


### Query method \{#query-method\}

이는 `SELECT`와 같이 응답이 있는 대부분의 SQL 문이나 `CREATE TABLE`과 같은 DDL을 전송할 때 사용하며, 완료될 때까지 `await`해야 합니다. 반환된 결과 세트(result set)는 애플리케이션에서 소비(처리)될 것으로 예상됩니다.

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

참고: [모든 클라이언트 메서드에 대한 기본 매개변수](./js.md#base-parameters-for-all-client-methods)를 참조하십시오.

:::tip
`query`에서는 FORMAT 절을 지정하지 말고, 대신 `format` 매개변수를 사용하십시오.
:::


#### Result set과 행 추상화 \{#result-set-and-row-abstractions\}

`ResultSet`은 애플리케이션에서 데이터를 처리할 때 사용할 수 있는 여러 편의 메서드를 제공합니다.

Node.js용 `ResultSet` 구현은 내부적으로 `Stream.Readable`을 사용하고, 웹 버전은 Web API `ReadableStream`을 사용합니다.

`ResultSet`에서 `text` 또는 `json` 메서드를 호출하여, 쿼리가 반환한 전체 행 집합을 메모리에 불러와 처리할 수 있습니다.

`ResultSet`은 응답 스트림을 열린 상태로 유지하여 기저 연결을 계속 사용하게 되므로 가능한 한 빨리 `ResultSet` 소비를 시작하는 것이 좋습니다. 클라이언트는 애플리케이션에서 과도한 메모리 사용이 발생하지 않도록 수신 데이터를 버퍼링하지 않습니다.

또는 한 번에 메모리에 모두 담기에는 너무 큰 경우 `stream` 메서드를 호출하여 스트리밍 모드로 데이터를 처리할 수 있습니다. 응답 청크 각각은 비교적 작은 행 배열로 변환됩니다(이 배열의 크기는 클라이언트가 서버로부터 받는 특정 청크의 크기와 개별 행의 크기에 따라 달라질 수 있습니다). 데이터는 한 번에 하나의 청크씩 처리됩니다.

스트리밍에 어떤 형식이 가장 적합한지 판단하려면 [지원되는 데이터 형식](./js.md#supported-data-formats) 목록을 참고하십시오. 예를 들어 JSON 객체를 스트리밍하려는 경우 [JSONEachRow](/interfaces/formats/JSONEachRow)를 선택할 수 있으며, 각 행은 JS 객체로 파싱됩니다. 또는 보다 압축된 형식인 [JSONCompactColumns](/interfaces/formats/JSONCompactColumns)를 사용하면 각 행이 값의 간결한 배열로 표현됩니다. 또한 [파일 스트리밍](./js.md#streaming-files-nodejs-only)도 참고하십시오.

:::important
`ResultSet` 또는 해당 스트림이 완전히 소비되지 않으면, `request_timeout` 동안 비활성 상태가 지속된 후 제거됩니다.
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

**예시:** (Node.js/Web) 결과 데이터셋을 `JSONEachRow` 포맷으로 반환하는 쿼리 예제로, 전체 스트림을 소비하여 내용을 JS 객체로 파싱합니다.
[소스 코드](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts).

```ts
const resultSet = await client.query({
  query: 'SELECT * FROM my_table',
  format: 'JSONEachRow',
})
const dataset = await resultSet.json() // or `row.text` to avoid parsing JSON
```

**예:** (Node.js 전용) 기존 `on('data')` 방식을 사용하여 `JSONEachRow` 형식으로 쿼리 결과를 스트리밍합니다. 이는 `for await const` 구문과 서로 바꿔 사용할 수 있습니다. [소스 코드](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row.ts).

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

**예시:** (Node.js 전용) 기존의 `on('data')` 방식을 사용해 `CSV` 형식의 쿼리 결과를 스트리밍합니다. 이는 `for await const` 구문과 서로 대체하여 사용할 수 있습니다.
[소스 코드](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_text_line_by_line.ts)


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

**예시:** (Node.js 전용) `JSONEachRow` 형식의 쿼리 결과를 JS 객체로 스트리밍하여 `for await const` 구문으로 처리합니다. 이는 기존의 `on('data')` 방식과 서로 대체하여 사용할 수 있습니다.
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
`for await const` 구문은 `on('data')` 방식보다 코드가 조금 더 간결하지만, 성능에 부정적인 영향을 줄 수 있습니다.
자세한 내용은 [Node.js 저장소의 해당 이슈](https://github.com/nodejs/node/issues/31979)를 참조하십시오.
:::

**예시:** (웹 전용) 객체 `ReadableStream` 반복 예시입니다.

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


### Insert 메서드 \{#insert-method\}

이 메서드는 데이터를 삽입하는 기본적인 방법입니다.

```ts
export interface InsertResult {
  query_id: string
  executed: boolean
}

interface ClickHouseClient {
  insert(params: InsertParams): Promise<InsertResult>
}
```

반환 타입은 서버에서 어떤 데이터도 반환될 것으로 기대하지 않고 응답 스트림을 즉시 소모(draining)하기 때문에 최소입니다.

빈 배열이 insert 메서드에 전달되면 INSERT 문은 서버로 전송되지 않고, 메서드는 대신 즉시 `{ query_id: '...', executed: false }`로 resolve됩니다. 이 경우 메서드 파라미터에 `query_id`가 제공되지 않았다면 결과에서 `query_id` 값은 빈 문자열이 됩니다. 클라이언트에서 생성한 임의의 UUID를 반환하면, 그러한 `query_id`를 가진 쿼리가 `system.query_log` 테이블에 존재하지 않기 때문에 혼란을 줄 수 있기 때문입니다.

INSERT 문이 서버로 전송된 경우 `executed` 플래그는 `true`가 됩니다.


#### Node.js에서 Insert 메서드와 스트리밍 \{#insert-method-and-streaming-in-nodejs\}

`insert` 메서드에 지정한 [데이터 포맷](./js.md#supported-data-formats)에 따라 `Stream.Readable` 또는 일반 `Array<T>`와 함께 동작합니다. 또한 [파일 스트리밍](./js.md#streaming-files-nodejs-only)에 대한 내용을 설명하는 이 섹션도 참고하십시오.

Insert 메서드는 기본적으로 `await`과 함께 사용하도록 설계되었습니다. 그러나 입력 스트림을 먼저 지정한 뒤, 스트림이 완료되었을 때에만(이때 `insert` promise도 resolve됨) `insert` 연산을 `await`하도록 할 수도 있습니다. 이는 이벤트 리스너와 같은 시나리오에서 유용할 수 있으나, 클라이언트 측에서 다양한 엣지 케이스를 처리해야 하므로 오류 처리가 복잡해질 수 있습니다. 대신 [이 예제](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert_without_waiting.ts)에 나와 있듯이 [비동기 insert(async inserts)](/optimize/asynchronous-inserts) 사용을 고려하십시오.

:::tip
이 메서드로는 모델링하기 어려운 커스텀 INSERT 문이 있는 경우 [command 메서드](./js.md#command-method) 사용을 고려하십시오.

사용 예시는 [INSERT INTO ... VALUES](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_values_and_functions.ts) 및 [INSERT INTO ... SELECT](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_from_select.ts) 예제에서 확인할 수 있습니다.
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

다음도 참고하십시오: [모든 클라이언트 메서드에 대한 기본 매개변수](./js.md#base-parameters-for-all-client-methods).

:::important
`abort_signal`로 취소된 요청이라고 해서 데이터 삽입이 전혀 이루어지지 않았다고 보장되지는 않습니다. 서버가 취소 전에 스트리밍된 데이터의 일부를 이미 수신했을 수 있습니다.
:::

**예시:** (Node.js/Web) 값 배열을 삽입합니다.
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

**예시:** (Node.js 전용) CSV 파일 스트림을 삽입합니다.
[소스 코드](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts). 자세한 내용은 [파일 스트리밍](./js.md#streaming-files-nodejs-only)을 참고하십시오.

```ts
await client.insert({
  table: 'my_table',
  values: fs.createReadStream('./path/to/a/file.csv'),
  format: 'CSV',
})
```

**예시**: INSERT 구문에서 특정 컬럼을 제외하는 경우.

다음과 같은 테이블 정의가 있다고 가정합니다.

```sql
CREATE OR REPLACE TABLE mytable
(id UInt32, message String)
ENGINE MergeTree()
ORDER BY (id)
```

특정 컬럼만 삽입하기:

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

특정 컬럼 제외:

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

자세한 내용은 [소스 코드](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_exclude_columns.ts)를 참고하십시오.


**예시**: 클라이언트 인스턴스에 설정된 데이터베이스가 아닌 다른 데이터베이스에 데이터를 INSERT합니다. [소스 코드](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_into_different_db.ts).

```ts
await client.insert({
  table: 'mydb.mytable', // Fully qualified name including the database
  values: [{ id: 42, message: 'foo' }],
  format: 'JSONEachRow',
})
```


#### 웹 버전의 제한 사항 \{#web-version-limitations\}

현재 `@clickhouse/client-web`에서 insert 작업은 `Array<T>` 및 `JSON*` 형식에서만 동작합니다.
브라우저 호환성이 충분하지 않아, 웹 버전에서는 스트림 insert가 아직 지원되지 않습니다.

따라서 웹 버전의 `InsertParams` 인터페이스는 Node.js 버전과 약간 다르며,
`values`는 `ReadonlyArray<T>` 타입으로만 제한됩니다:

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

이는 추후 변경될 수 있습니다. 자세한 내용은 [모든 클라이언트 메서드의 기본 파라미터](./js.md#base-parameters-for-all-client-methods)를 참조하십시오.


### Command 메서드 \{#command-method\}

출력이 없는 SQL 문에 사용할 수 있으며, `FORMAT` 절을 적용할 수 없거나 응답 자체에 관심이 없을 때도 사용할 수 있습니다. 이러한 SQL 문의 예로는 `CREATE TABLE` 또는 `ALTER TABLE`이 있습니다.

`await` 해야 합니다.

응답 스트림은 즉시 소멸되며, 이로 인해 하위 소켓이 해제됩니다.

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

참고: 자세한 내용은 [모든 클라이언트 메서드에 대한 기본 매개변수](./js.md#base-parameters-for-all-client-methods)를 참조하십시오.

**예:** (Node.js/Web) ClickHouse Cloud에 테이블을 생성합니다.
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

**예제:** (Node.js/Web) 셀프 호스트형 ClickHouse 인스턴스에서 테이블을 생성합니다.
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

**예제:** (Node.js/Web) INSERT FROM SELECT

```ts
await client.command({
  query: `INSERT INTO my_table SELECT '42'`,
})
```

:::important
요청을 `abort_signal`로 취소하더라도, 해당 쿼리가 서버에서 실행되지 않았다고 보장할 수는 없습니다.
:::


### Exec 메서드 \{#exec-method\}

사용자 정의 쿼리가 있어서 `query`/`insert`에 맞지 않지만
그 결과를 확인해야 하는 경우 `command` 대신 `exec`를 사용할 수 있습니다.

`exec`는 애플리케이션 측에서 반드시 소비하거나 파기해야 하는 readable stream을 반환합니다.

```ts
interface ExecParams extends BaseQueryParams {
  // Statement to execute.
  query: string
}

interface ClickHouseClient {
  exec(params: ExecParams): Promise<QueryResult>
}
```

다음도 참고하십시오: [모든 클라이언트 메서드의 기본 매개변수](./js.md#base-parameters-for-all-client-methods).

스트림 반환 타입은 Node.js 버전과 Web 버전에서 서로 다릅니다.

Node.js:

```ts
export interface QueryResult {
  stream: Stream.Readable
  query_id: string
}
```

웹 환경:

```ts
export interface QueryResult {
  stream: ReadableStream
  query_id: string
}
```


### Ping \{#ping\}

연결 상태를 확인하기 위해 제공되는 `ping` 메서드는 서버에 접속할 수 있는 경우 `true`를 반환합니다.

서버에 접속할 수 없는 경우 결과에 원인이 된 오류 정보가 함께 포함됩니다.

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

애플리케이션이 시작될 때 서버의 사용 가능 여부를 확인하는 데 Ping이 유용할 수 있습니다. 특히 ClickHouse Cloud에서는 인스턴스가 유휴(idle) 상태일 수 있고 ping 이후에 활성화될 수 있습니다. 이런 경우에는 일정 시간 간격을 두고 여러 번 재시도하도록 구성하는 것이 좋습니다.

기본적으로 Node.js 버전은 `/ping` 엔드포인트를 사용하고, Web 버전은 `/ping` 엔드포인트가 CORS를 지원하지 않기 때문에 동일한 효과를 위해 단순한 `SELECT 1` 쿼리를 사용합니다.

**예:** (Node.js/Web) ClickHouse 서버 인스턴스에 대한 간단한 ping입니다. 참고: Web 버전의 경우 포착되는 에러는 다르게 나타납니다.
[소스 코드](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/ping.ts).

```ts
const result = await client.ping();
if (!result.success) {
  // process result.error
}
```

**예시:** `ping` 메서드를 호출할 때 자격 증명도 함께 검증하거나 `query_id`와 같은 추가 매개변수를 지정하려면 다음과 같이 사용할 수 있습니다:

```ts
const result = await client.ping({ select: true, /* query_id, abort_signal, http_headers, or any other query params */ });
```

`ping` 메서드는 표준 `query` 메서드 매개변수의 대부분을 허용합니다. 자세한 내용은 `PingParamsWithSelectQuery` 타입 정의를 참조하십시오.


### 닫기 (Node.js 전용) \{#close-nodejs-only\}

열려 있는 모든 연결을 닫고 리소스를 해제합니다. 웹 버전에서는 동작하지 않습니다.

```ts
await client.close()
```


## 파일 스트리밍 (Node.js 전용) \{#streaming-files-nodejs-only\}

클라이언트 저장소에는 인기 있는 데이터 형식(NDJSON, CSV, Parquet)에 대한 여러 파일 스트리밍 예제가 있습니다.

- [NDJSON 파일에서 스트리밍](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_ndjson.ts)
- [CSV 파일에서 스트리밍](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts)
- [Parquet 파일에서 스트리밍](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_parquet.ts)
- [Parquet 파일로 스트리밍](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts)

다른 형식을 파일로 스트리밍하는 작업도 Parquet과 유사하며, 
달라지는 부분은 `query` 호출에 사용하는 형식(`JSONEachRow`, `CSV` 등)과 출력 파일 이름뿐입니다.

## 지원되는 데이터 포맷 \{#supported-data-formats\}

클라이언트는 JSON 또는 텍스트 형식의 데이터를 처리합니다.

`format`을 (`JSONEachRow`, `JSONCompactEachRow` 등과 같은) JSON 계열 포맷 중 하나로 지정하면, 클라이언트는 네트워크 통신 중에 데이터를 직렬화 및 역직렬화합니다.

"raw" 텍스트 포맷(`CSV`, `TabSeparated`, `CustomSeparated` 계열)으로 제공되는 데이터는 추가 변환 없이 그대로 전송됩니다.

:::tip
일반적인 포맷으로서의 JSON과 [ClickHouse JSON format](/interfaces/formats/JSON)을 혼동할 수 있습니다. 

클라이언트는 [JSONEachRow](/interfaces/formats/JSONEachRow)와 같은 포맷으로 JSON 객체 스트리밍을 지원합니다(다른 스트리밍 친화적인 포맷은 표 개요를 참고하십시오. 또한 클라이언트 리포지토리의 `select_streaming_` [예제](https://github.com/ClickHouse/clickhouse-js/tree/main/examples/node)도 참고하십시오). 

[ClickHouse JSON](/interfaces/formats/JSON)과 일부 다른 포맷은 응답에서 단일 객체로 표현되며, 클라이언트에서 스트리밍할 수 없다는 점만 다릅니다.
:::

| Format                                     | Input (array) | Input (object) | Input/Output (Stream) | Output (JSON) | Output (text)  |
|--------------------------------------------|---------------|----------------|-----------------------|---------------|----------------|
| JSON                                       | ❌             | ✔️             | ❌                     | ✔️            | ✔️             |
| JSONCompact                                | ❌             | ✔️             | ❌                     | ✔️            | ✔️             |
| JSONObjectEachRow                          | ❌             | ✔️             | ❌                     | ✔️            | ✔️             |
| JSONColumnsWithMetadata                    | ❌             | ✔️             | ❌                     | ✔️            | ✔️             |
| JSONStrings                                | ❌             | ❌️             | ❌                     | ✔️            | ✔️             |
| JSONCompactStrings                         | ❌             | ❌              | ❌                     | ✔️            | ✔️             |
| JSONEachRow                                | ✔️            | ❌              | ✔️                    | ✔️            | ✔️             |
| JSONEachRowWithProgress                    | ❌️            | ❌              | ✔️ ❗- 아래 참고       | ✔️            | ✔️             |
| JSONStringsEachRow                         | ✔️            | ❌              | ✔️                    | ✔️            | ✔️             |
| JSONCompactEachRow                         | ✔️            | ❌              | ✔️                    | ✔️            | ✔️             |
| JSONCompactStringsEachRow                  | ✔️            | ❌              | ✔️                    | ✔️            | ✔️             |
| JSONCompactEachRowWithNames                | ✔️            | ❌              | ✔️                    | ✔️            | ✔️             |
| JSONCompactEachRowWithNamesAndTypes        | ✔️            | ❌              | ✔️                    | ✔️            | ✔️             |
| JSONCompactStringsEachRowWithNames         | ✔️            | ❌              | ✔️                    | ✔️            | ✔️             |
| JSONCompactStringsEachRowWithNamesAndTypes | ✔️            | ❌              | ✔️                    | ✔️            | ✔️             |
| CSV                                        | ❌             | ❌              | ✔️                    | ❌             | ✔️             |
| CSVWithNames                               | ❌             | ❌              | ✔️                    | ❌             | ✔️             |
| CSVWithNamesAndTypes                       | ❌             | ❌              | ✔️                    | ❌             | ✔️             |
| TabSeparated                               | ❌             | ❌              | ✔️                    | ❌             | ✔️             |
| TabSeparatedRaw                            | ❌             | ❌              | ✔️                    | ❌             | ✔️             |
| TabSeparatedWithNames                      | ❌             | ❌              | ✔️                    | ❌             | ✔️             |
| TabSeparatedWithNamesAndTypes              | ❌             | ❌              | ✔️                    | ❌             | ✔️             |
| CustomSeparated                            | ❌             | ❌              | ✔️                    | ❌             | ✔️             |
| CustomSeparatedWithNames                   | ❌             | ❌              | ✔️                    | ❌             | ✔️             |
| CustomSeparatedWithNamesAndTypes           | ❌             | ❌              | ✔️                    | ❌             | ✔️             |
| Parquet                                    | ❌             | ❌              | ✔️                    | ❌             | ✔️❗- 아래 참고 |

Parquet의 경우, SELECT의 주요 사용 사례는 결과 스트림을 파일로 기록하는 것일 가능성이 높습니다. 클라이언트 리포지토리의 [예제](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts)를 참고하십시오.

`JSONEachRowWithProgress`는 스트림에서 진행 상황 보고를 지원하는 출력 전용 형식입니다. 자세한 내용은 [이 예제](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_json_each_row_with_progress.ts)를 참고하십시오.

ClickHouse 입력 및 출력 형식의 전체 목록은 
[여기](/interfaces/formats)에서 확인할 수 있습니다.

## 지원되는 ClickHouse 데이터 타입 \{#supported-clickhouse-data-types\}

:::note
해당 JS 타입 정보는 모든 `JSON*` 포맷에 적용되지만, 모든 값을 문자열로 표현하는 포맷(예: `JSONStringEachRow`)에는 적용되지 않습니다.
:::

| Type                   | Status          | JS type                         |
|------------------------|-----------------|---------------------------------|
| UInt8/16/32            | ✔️              | number                          |
| UInt64/128/256         | ✔️ ❗- see below | string                          |
| Int8/16/32             | ✔️              | number                          |
| Int64/128/256          | ✔️ ❗- see below | string                          |
| Float32/64             | ✔️              | number                          |
| Decimal                | ✔️ ❗- see below | number                          |
| Boolean                | ✔️              | boolean                         |
| String                 | ✔️              | string                          |
| FixedString            | ✔️              | string                          |
| UUID                   | ✔️              | string                          |
| Date32/64              | ✔️              | string                          |
| DateTime32/64          | ✔️ ❗- see below | string                          |
| Enum                   | ✔️              | string                          |
| LowCardinality         | ✔️              | string                          |
| Array(T)               | ✔️              | T[]                             |
| (new) JSON             | ✔️              | object                          |
| Variant(T1, T2...)     | ✔️              | T (variant에 따라 다름)        |
| Dynamic                | ✔️              | T (variant에 따라 다름)        |
| Nested                 | ✔️              | T[]                             |
| Tuple(T1, T2, ...)     | ✔️              | [T1, T2, ...]                   |
| Tuple(n1 T1, n2 T2...) | ✔️              | \{ n1: T1; n2: T2; ...}         |
| Nullable(T)            | ✔️              | T에 대한 JS type 또는 null      |
| IPv4                   | ✔️              | string                          |
| IPv6                   | ✔️              | string                          |
| Point                  | ✔️              | [ number, number ]              |
| Ring                   | ✔️              | Array&lt;Point\>                |
| Polygon                | ✔️              | Array&lt;Ring\>                 |
| MultiPolygon           | ✔️              | Array&lt;Polygon\>              |
| Map(K, V)              | ✔️              | Record&lt;K, V\>                |
| Time/Time64            | ✔️              | string                          |

지원되는 ClickHouse 데이터 타입 전체 목록은
[여기](/sql-reference/data-types/)에서 확인할 수 있습니다.

함께 보기:

- [Dynamic/Variant/JSON 사용 예제](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/dynamic_variant_json.ts)
- [Time/Time64 사용 예제](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/time_time64.ts)

### Date/Date32 타입 주의사항 \{#datedate32-types-caveats\}

클라이언트가 추가적인 타입 변환 없이 값을 삽입하므로, `Date`/`Date32` 타입 컬럼은 문자열 형태로만 삽입할 수 있습니다.

**예제:** `Date` 타입 값을 삽입합니다.
[소스 코드](https://github.com/ClickHouse/clickhouse-js/blob/ba387d7f4ce375a60982ac2d99cb47391cf76cec/__tests__/integration/date_time.test.ts)

```ts
await client.insert({
  table: 'my_table',
  values: [ { date: '2022-09-05' } ],
  format: 'JSONEachRow',
})
```

하지만 `DateTime` 또는 `DateTime64` 컬럼을 사용하는 경우, 문자열과 JS Date 객체 두 형식 모두를 사용할 수 있습니다. JS Date 객체는 `date_time_input_format`을 `best_effort`로 설정한 상태에서 `insert`에 그대로 전달할 수 있습니다. 자세한 내용은 이 [예제](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_js_dates.ts)를 참고하십시오.


### Decimal* 타입 주의사항 \{#decimal-types-caveats\}

`JSON*` 계열 포맷을 사용하여 Decimal 값을 삽입할 수 있습니다. 다음과 같이 정의된 테이블이 있다고 가정합니다:

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

문자열 표현을 사용하면 정밀도 손실 없이 값을 삽입할 수 있습니다.

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

그러나 `JSON*` 형식으로 데이터를 쿼리할 때 ClickHouse는 기본적으로 Decimal을 *숫자*로 반환하며, 이로 인해 정밀도 손실이 발생할 수 있습니다. 이를 피하기 위해 쿼리에서 Decimal을 문자열로 캐스팅할 수 있습니다:

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

자세한 내용은 [이 예제](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_decimals.ts)를 참조하십시오.


### 정수 타입: Int64, Int128, Int256, UInt64, UInt128, UInt256 \{#integral-types-int64-int128-int256-uint64-uint128-uint256\}

서버는 이를 숫자로 처리할 수 있지만, 이 타입들의 최대값이 `Number.MAX_SAFE_INTEGER`보다 크기 때문에 정수 오버플로를 피하기 위해 `JSON*` 계열 출력 포맷에서는 문자열로 반환됩니다.

그러나 이 동작은 [`output_format_json_quote_64bit_integers` setting](/operations/settings/formats#output_format_json_quote_64bit_integers)
으로 변경할 수 있습니다.

**예시:** 64비트 정수에 대한 JSON 출력 포맷을 조정합니다.

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


## ClickHouse 설정 \{#clickhouse-settings\}

클라이언트는 [settings](/operations/settings/settings/) 메커니즘을 통해 ClickHouse 동작 방식을 조정할 수 있습니다.
설정은 클라이언트 인스턴스 수준에서 지정할 수 있으며, 이렇게 지정된 설정은
ClickHouse로 전송되는 모든 요청에 적용됩니다:

```ts
const client = createClient({
  clickhouse_settings: {}
})
```

또는 설정을 요청 단위로 지정할 수도 있습니다:

```ts
client.query({
  clickhouse_settings: {}
})
```

지원되는 모든 ClickHouse 설정에 대한 타입 선언 파일은
[여기](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/settings.ts)에서 확인할 수 있습니다.

:::important
쿼리가 실행되는 사용자에게 설정을 변경할 수 있는 충분한 권한이 있는지 반드시 확인하십시오.
:::


## 고급 주제 \{#advanced-topics\}

### 매개변수가 있는 쿼리 \{#queries-with-parameters\}

클라이언트 애플리케이션에서 값을 전달할 수 있도록 매개변수가 있는 쿼리를 생성할 수 있습니다. 이렇게 하면 클라이언트 측에서
특정 동적 값에 맞게 쿼리를 직접 포맷팅해야 하는 일을 피할 수 있습니다.

쿼리는 평소와 같이 작성한 다음, 앱의 매개변수에서 쿼리로 전달하려는 값을 다음 형식에 따라 중괄호 안에 배치합니다:

```text
{<name>: <data_type>}
```

where:

* `name` — 플레이스홀더 식별자입니다.
* `data_type` - 앱 매개변수 값의 [데이터 타입](/sql-reference/data-types/)입니다.

**예:** 매개변수를 사용하는 쿼리입니다.
[소스 코드](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/query_with_parameter_binding.ts)
.

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

자세한 내용은 https://clickhouse.com/docs/interfaces/cli#cli-queries-with-parameters-syntax를 참고하십시오.


### 압축 \{#compression\}

참고: 요청 압축은 현재 웹 버전에서는 사용할 수 없습니다. 응답 압축은 정상적으로 동작합니다. Node.js 버전은 둘 다 지원합니다.

대량의 데이터를 네트워크로 전송하는 데이터 애플리케이션에서는 압축을 활성화하면 전송 효율이 향상됩니다. 현재는 [zlib](https://nodejs.org/docs/latest-v14.x/api/zlib.html)을 사용한 `GZIP`만 지원합니다.

```typescript
createClient({
  compression: {
    response: true,
    request: true
  }
})
```

구성 매개변수는 다음과 같습니다:

* `response: true`는 ClickHouse 서버가 응답 본문을 압축된 형태로 반환하도록 지시합니다. 기본값: `response: false`
* `request: true`는 클라이언트 요청 본문을 압축하도록 설정합니다. 기본값: `request: false`


### 로깅 (Node.js 전용) \{#logging-nodejs-only\}

:::important
로깅은 실험적 기능으로, 향후 변경될 수 있습니다.
:::

기본 로거 구현은 `console.debug/info/warn/error` 메서드를 사용하여 `stdout`으로 로그 레코드를 출력합니다.
`LoggerClass`를 제공하여 로깅 동작을 사용자 정의할 수 있으며, `level` 매개변수(기본값은 `OFF`)를 통해 원하는 로그 레벨을 선택할 수 있습니다:

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

현재 클라이언트는 다음 이벤트를 기록합니다:

* `TRACE` - Keep-Alive 소켓 수명 주기에 대한 저수준 정보
* `DEBUG` - 응답 정보(인증 헤더 및 호스트 정보 제외)
* `INFO` - 대부분 사용되지 않으며, 클라이언트가 초기화될 때 현재 로그 레벨을 출력합니다
* `WARN` - 치명적이지 않은 오류; 하위 오류가 반환 결과에 포함되므로, 실패한 `ping` 요청은 경고로 기록됩니다
* `ERROR` - 실패한 요청 등 `query`/`insert`/`exec`/`command` 메서드에서 발생하는 치명적인 오류

기본 Logger 구현은 [여기](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/logger.ts)에서 확인할 수 있습니다.


### TLS 인증서 (Node.js 전용) \{#tls-certificates-nodejs-only\}

Node.js 클라이언트는 선택적으로 기본(인증 기관(Certificate Authority)만 사용)
및 상호(인증 기관과 클라이언트 인증서 모두 사용) TLS를 지원합니다.

다음은 기본 TLS 구성 예시입니다. 인증서가 `certs` 폴더에 있고
CA 파일 이름이 `CA.pem`이라고 가정합니다:

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

저장소에서 [기본 TLS](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/basic_tls.ts) 및 [상호 TLS](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/mutual_tls.ts)에 대한 전체 예제를 확인하십시오.


### Keep-alive 구성 (Node.js 전용) \{#keep-alive-configuration-nodejs-only\}

클라이언트는 기본적으로 하위 HTTP 에이전트에서 Keep-Alive를 활성화합니다. 이는 연결된 소켓이 이후 요청에 재사용되고, `Connection: keep-alive` 헤더가 전송됨을 의미합니다. 유휴 상태인 소켓은 기본적으로 2500밀리초 동안 커넥션 풀에 남아 있습니다(이 옵션을 조정하는 방법에 대한 [설명은 여기](./js.md#adjusting-idle_socket_ttl)를 참고하십시오).

`keep_alive.idle_socket_ttl` 값은 서버/LB 설정값보다 충분히 낮게 설정하는 것이 좋습니다. 주된 이유는 HTTP/1.1에서는 서버가 클라이언트에 알리지 않고 소켓을 닫을 수 있으므로, 서버나 로드 밸런서가 클라이언트보다 _먼저_ 연결을 닫는 경우 클라이언트가 이미 닫힌 소켓을 재사용하려 하여 `socket hang up` 오류가 발생할 수 있기 때문입니다.

`keep_alive.idle_socket_ttl`을 수정하는 경우, 이 값이 항상 서버/LB Keep-Alive 설정과 일치하도록 유지되어야 하며, 서버가 열린 연결을 먼저 닫는 일이 없도록 해당 값은 **반드시 더 낮게** 설정해야 합니다.

#### `idle_socket_ttl` 조정 \{#adjusting-idle_socket_ttl\}

클라이언트는 `keep_alive.idle_socket_ttl` 값을 2500밀리초로 설정합니다. 이는 가장 안전한 기본값으로 간주될 수 있기 때문입니다. 서버 측에서는 `config.xml`을 수정하지 않은 경우, [ClickHouse 23.11 이전 버전에서 `keep_alive_timeout`이 최소 3초까지 설정](https://github.com/ClickHouse/ClickHouse/commit/1685cdcb89fe110b45497c7ff27ce73cc03e82d1)될 수 있습니다.

:::warning
성능에 만족하고 문제가 발생하지 않는다면, `keep_alive.idle_socket_ttl` SETTING 값을 늘리지 **않을 것**을 권장합니다. 값을 증가시키면 잠재적으로 &quot;Socket hang-up&quot; 오류가 발생할 수 있습니다. 또한 애플리케이션이 매우 많은 쿼리를 보내고, 쿼리 사이에 유휴 시간이 길지 않은 경우에는 소켓이 충분히 오래 유휴 상태로 유지되지 않으므로 기본값이면 충분하며, 클라이언트가 소켓을 풀에 계속 유지합니다.
:::

다음 명령을 실행하면 서버 응답 헤더에서 올바른 Keep-Alive timeout 값을 확인할 수 있습니다.

```sh
curl -v --data-binary "SELECT 1" <clickhouse_url>
```

응답에서 `Connection` 및 `Keep-Alive` 헤더 값을 확인합니다. 예를 들어:

```text
< Connection: Keep-Alive
< Keep-Alive: timeout=10
```

이 경우 `keep_alive_timeout`은 10초이며, 유휴 소켓을 기본값보다 조금 더 오래 열어 두기 위해 `keep_alive.idle_socket_ttl` 값을 9000 또는 9500밀리초까지 높여 볼 수 있습니다. 서버가 클라이언트보다 먼저 연결을 종료한다는 것을 나타내는 발생 가능한 「Socket hang-up」 오류를 모니터링하고, 오류가 사라질 때까지 해당 값을 점진적으로 낮추십시오.


#### 문제 해결 \{#troubleshooting\}

최신 버전의 클라이언트를 사용하고 있음에도 `socket hang up` 오류가 발생하는 경우, 다음과 같은 방법으로 이 문제를 해결할 수 있습니다:

* 최소한 `WARN` 로그 레벨로 로그를 활성화합니다. 이렇게 하면 애플리케이션 코드에 미처 소비되지 않았거나 떠 있는(dangling) 스트림이 있는지 확인할 수 있습니다. 전송 계층에서 이러한 스트림을 WARN 레벨로 로그에 남기며, 이는 서버가 소켓을 닫는 상황으로 이어질 수 있기 때문입니다. 클라이언트 설정에서 다음과 같이 로깅을 활성화할 수 있습니다:
  
  ```ts
  const client = createClient({
    log: { level: ClickHouseLogLevel.WARN },
  })
  ```
  
* [no-floating-promises](https://typescript-eslint.io/rules/no-floating-promises/) ESLint 규칙을 활성화하여 애플리케이션 코드를 점검합니다. 이 규칙은 처리되지 않은 promise를 식별하는 데 도움이 되며, 이러한 promise가 남아 있는 스트림과 소켓으로 이어질 수 있습니다.

* ClickHouse 서버 설정에서 `keep_alive.idle_socket_ttl` 설정 값을 약간 줄입니다. 예를 들어 클라이언트와 서버 간 네트워크 지연 시간이 큰 경우, `keep_alive.idle_socket_ttl`을 200–500밀리초 정도 추가로 줄여서, 서버가 곧 닫으려는 소켓을 발신 요청이 잡는 상황을 방지하는 것이 도움이 될 수 있습니다. 

* 들어오는 데이터나 나가는 데이터가 없는 장시간 실행 쿼리(예: 장시간 실행되는 `INSERT FROM SELECT`) 중에 이 오류가 발생하는 경우, 로드 밸런서가 유휴 연결을 닫기 때문일 수 있습니다. 이러한 장시간 실행 쿼리 동안 다음 ClickHouse 설정 조합을 사용하여, 쿼리 실행 중에 주기적으로 일부 데이터가 오가도록 하는 방식을 시도할 수 있습니다:

  ```ts
  const client = createClient({
    // 여기서는 실행 시간이 5분을 초과하는 쿼리가 있을 것이라고 가정합니다.
    request_timeout: 400_000,
    /** 이러한 설정 조합은 들어오거나 나가는 데이터가 없는 장시간 실행 쿼리(예: `INSERT FROM SELECT`와 유사한 쿼리)의 경우,
     *  연결이 LB에 의해 유휴 상태로 표시되고 갑자기 종료되는 상황을 피하는 데 도움이 됩니다.
     *  이 예시에서는 LB의 유휴 연결 시간 제한이 120초라고 가정하고, "안전한" 값으로 110초를 설정합니다. */
    clickhouse_settings: {
      send_progress_in_http_headers: 1,
      http_headers_progress_interval_ms: '110000', // UInt64, 문자열로 전달해야 합니다.
    },
  })
  ```
  다만 최근 Node.js 버전에서는 수신되는 헤더의 총 크기에 16KB 제한이 있다는 점을 유의해야 합니다. 진행 상황 헤더가 일정 개수(테스트에서는 약 70–80개)를 초과하여 수신되면 예외가 발생합니다.

  네트워크 구간에서의 대기 시간을 완전히 피하는 방식으로, 전혀 다른 접근 방식을 사용할 수도 있습니다. HTTP 인터페이스의 「연결이 끊어져도 뮤테이션이 취소되지 않는다」는 "특징"을 활용하면 됩니다. 자세한 내용은 [이 예시 (part 2)](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/long_running_queries_timeouts.ts)를 참고하십시오.

* Keep-Alive 기능을 완전히 비활성화할 수도 있습니다. 이 경우 클라이언트는 각 요청에 `Connection: close` 헤더를 추가하며, 내부 HTTP 에이전트는 연결을 재사용하지 않습니다. 유휴 소켓이 존재하지 않으므로 `keep_alive.idle_socket_ttl` 설정은 무시됩니다. 각 요청마다 새로운 연결이 설정되므로 추가 오버헤드가 발생합니다.

  ```ts
  const client = createClient({
    keep_alive: {
      enabled: false,
    },
  })
  ```

### 읽기 전용 사용자 \{#read-only-users\}

클라이언트를 [readonly=1 사용자](/operations/settings/permissions-for-queries#readonly)와 함께 사용하는 경우, `enable_http_compression` SETTING이 필요하므로 응답 압축을 활성화할 수 없습니다. 다음 구성은 오류를 발생시킵니다.

```ts
const client = createClient({
  compression: {
    response: true, // won't work with a readonly=1 user
  },
})
```

readonly=1 USER에 적용되는 제한 사항을 더 잘 보여 주는 [예제](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/read_only_user.ts)를 참고하십시오.


### 경로명을 사용하는 프록시 \{#proxy-with-a-pathname\}

ClickHouse 인스턴스가 프록시 뒤에 배치되어 있고 URL에 예를 들어 http://proxy:8123/clickhouse&#95;server 와 같이 경로명이 포함되는 경우, `pathname` 설정 옵션으로 `clickhouse_server`를 지정합니다(앞에 슬래시가 있어도 되고 없어도 됩니다). 그렇지 않고 이를 `url`에 직접 지정하면 `database` 옵션으로 간주됩니다. `/my_proxy/db`와 같이 여러 개의 세그먼트도 지원됩니다.

```ts
const client = createClient({
  url: 'http://proxy:8123',
  pathname: '/clickhouse_server',
})
```


### 인증이 구성된 리버스 프록시 \{#reverse-proxy-with-authentication\}

ClickHouse 배포 앞단에 인증이 구성된 리버스 프록시가 있는 경우, 필요한 헤더를 전달하기 위해 `http_headers` 설정을 사용할 수 있습니다:

```ts
const client = createClient({
  http_headers: {
    'My-Auth-Header': '...',
  },
})
```


### Custom HTTP/HTTPS agent (experimental, Node.js only) \{#custom-httphttps-agent-experimental-nodejs-only\}

:::warning
이는 향후 릴리스에서 이전 버전과 호환되지 않는 방식으로 변경될 수 있는 실험적 기능입니다. 대부분의 사용 사례에는 클라이언트가 제공하는 기본 구현과 설정만으로 충분합니다. 이 기능이 실제로 필요하다고 확신되는 경우에만 사용하십시오.
:::

기본적으로 클라이언트는 클라이언트 설정(`max_open_connections`, `keep_alive.enabled`, `tls` 등)에 따라 기본 HTTP(s) 에이전트(agent)를 구성하며, 이 에이전트가 ClickHouse 서버로의 연결을 처리합니다. 또한 TLS 인증서를 사용하는 경우, 기본 에이전트는 필요한 인증서로 구성되며 올바른 TLS 인증 헤더가 적용됩니다.

버전 1.2.0부터는 기본 에이전트를 대체할 수 있도록 사용자 정의 HTTP(s) 에이전트를 클라이언트에 제공할 수 있습니다. 이는 네트워크 구성이 까다로운 환경에서 유용할 수 있습니다. 사용자 정의 에이전트를 제공하는 경우 다음 조건이 적용됩니다:

- `max_open_connections` 및 `tls` 옵션은 _효과가 없으며_ 클라이언트에서 무시됩니다. 이 옵션들은 기본 에이전트 설정의 일부이기 때문입니다.
- `keep_alive.enabled`는 `Connection` 헤더의 기본값만 제어합니다(`true` -> `Connection: keep-alive`, `false` -> `Connection: close`).
- 유휴 keep-alive 소켓 관리는 (에이전트가 아니라 개별 소켓 자체에 묶여 있으므로) 계속 동작하지만, 이제 `keep_alive.idle_socket_ttl` 값을 `0`으로 설정하여 이를 완전히 비활성화할 수 있습니다.

#### 커스텀 에이전트 사용 예시 \{#custom-agent-usage-examples\}

인증서 없이 커스텀 HTTP(s) Agent를 사용하는 예:

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

기본 TLS 및 CA 인증서를 사용하는 커스텀 HTTPS 에이전트 사용:

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

상호 TLS를 사용하는 사용자 정의 HTTPS 에이전트 사용:

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

인증서와 사용자 지정 *HTTPS* 에이전트를 함께 사용하는 경우, TLS 헤더와 충돌하므로 `set_basic_auth_header` 설정(1.2.0에서 도입됨)을 통해 기본 Authorization 헤더를 비활성화해야 할 가능성이 큽니다. 모든 TLS 헤더는 수동으로 지정해야 합니다.


## 알려진 제한 사항 (Node.js/web) \{#known-limitations-nodejsweb\}

- 결과 집합에 대한 데이터 매퍼가 없어 언어 기본 타입(primitive)만 사용할 수 있습니다. 특정 데이터 타입 매퍼는 [RowBinary 포맷 지원](https://github.com/ClickHouse/clickhouse-js/issues/216)과 함께 제공될 예정입니다.
- 일부 [Decimal* 및 Date\* / DateTime\* 데이터 타입 관련 주의 사항](./js.md#datedate32-types-caveats)이 있습니다.
- JSON* 계열 포맷을 사용할 때 Int32보다 큰 숫자는 문자열로 표현됩니다. 이는 Int64+ 타입의 최댓값이 `Number.MAX_SAFE_INTEGER`보다 크기 때문입니다. 자세한 내용은 [Integral types](./js.md#integral-types-int64-int128-int256-uint64-uint128-uint256) 섹션을 참고하십시오.

## 알려진 제한 사항 (웹) \{#known-limitations-web\}

- SELECT 쿼리의 스트리밍은 동작하지만 INSERT의 스트리밍은 비활성화되어 있습니다(데이터 타입 수준에서도 마찬가지입니다).
- 요청 압축은 비활성화되어 있으며, 관련 설정은 무시됩니다. 응답 압축은 동작합니다.
- 아직 로깅은 지원되지 않습니다.

## 성능 최적화를 위한 팁 \{#tips-for-performance-optimizations\}

- 애플리케이션 메모리 사용량을 줄이기 위해, 가능한 경우 대용량 insert 작업(예: 파일에서 데이터 로드)과 select에 스트림을 사용하는 것을 고려하십시오. 이벤트 리스너와 유사한 사용 사례에서는 [async inserts](/optimize/asynchronous-inserts)를 사용하는 것도 좋은 옵션이며, 이를 통해 클라이언트 측 배치를 최소화하거나 완전히 피할 수 있습니다. async insert 예시는 [client repository](https://github.com/ClickHouse/clickhouse-js/tree/main/examples)에 있으며, 파일 이름 접두사로 `async_insert_`가 사용됩니다.
- 클라이언트는 기본적으로 요청 또는 응답 압축을 활성화하지 않습니다. 그러나 대용량 데이터셋을 select하거나 insert할 때에는 `ClickHouseClientConfigOptions.compression`을 통해( `request` 또는 `response` 중 하나 또는 둘 다에 대해) 압축을 활성화하는 것을 고려할 수 있습니다.
- 압축은 성능에 상당한 오버헤드를 발생시킵니다. `request` 또는 `response`에 대해 압축을 활성화하면 각각 select 또는 insert 속도에는 부정적인 영향을 주지만, 애플리케이션이 전송하는 네트워크 트래픽 양은 줄어듭니다.

## 문의하기 \{#contact-us\}

질문이 있거나 도움이 필요하면 [Community Slack](https://clickhouse.com/slack) (`#clickhouse-js` 채널) 또는 [GitHub issues](https://github.com/ClickHouse/clickhouse-js/issues)를 통해 언제든지 문의해 주십시오.