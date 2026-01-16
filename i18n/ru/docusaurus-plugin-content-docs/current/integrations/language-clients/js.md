---
sidebar_label: 'JavaScript'
sidebar_position: 4
keywords: ['clickhouse', 'js', 'JavaScript', 'NodeJS', 'web', 'browser', 'Cloudflare', 'workers', 'client', 'connect', 'integrate']
slug: /integrations/javascript
description: 'Официальный JS-клиент для подключения к ClickHouse.'
title: 'ClickHouse JS'
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'language_client'
  - website: 'https://github.com/ClickHouse/clickhouse-js'
---

import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

# ClickHouse JS \{#clickhouse-js\}

Официальный JS‑клиент для подключения к ClickHouse.
Клиент написан на TypeScript и предоставляет типы для публичного API клиента.

Не имеет внешних зависимостей, оптимизирован для максимальной производительности и протестирован с различными версиями и конфигурациями ClickHouse (on-premises: одиночный узел, кластер, а также ClickHouse Cloud).

Существует две разные версии клиента для разных сред:

- `@clickhouse/client` - только для Node.js
- `@clickhouse/client-web` - браузеры (Chrome/Firefox), Cloudflare Workers

При использовании TypeScript убедитесь, что его версия не ниже [4.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html), в которой доступен [синтаксис inline import и export](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#type-modifiers-on-import-names).

Исходный код клиента доступен в [GitHub-репозитории ClickHouse-JS](https://github.com/ClickHouse/clickhouse-js).

## Требования к среде (Node.js) \{#environment-requirements-nodejs\}

Для запуска клиента в среде должен быть установлен Node.js.
Клиент совместим со всеми [поддерживаемыми](https://github.com/nodejs/release#readme) релизами Node.js.

Как только версия Node.js приближается к окончанию срока поддержки (End-Of-Life), клиент прекращает её поддержку, так как такая версия считается устаревшей и небезопасной.

Текущие поддерживаемые версии Node.js:

| Версия Node.js | Поддерживается? |
|----------------|-----------------|
| 24.x           | ✔               |
| 22.x           | ✔               |
| 20.x           | ✔               |
| 18.x           | По возможности  |

## Требования к среде (веб) \{#environment-requirements-web\}

Веб-версия клиента официально тестируется в последних версиях браузеров Chrome и Firefox и может использоваться как зависимость, например, в приложениях на React/Vue/Angular или в среде Cloudflare Workers.

## Установка \{#installation\}

Чтобы установить последнюю стабильную версию клиента Node.js, выполните следующую команду:

```sh
npm i @clickhouse/client
```

Установка веб-версии:

```sh
npm i @clickhouse/client-web
```

## Совместимость с ClickHouse \{#compatibility-with-clickhouse\}

| Версия клиента | ClickHouse |
|----------------|------------|
| 1.12.0         | 24.8+      |

Вероятно, клиент будет работать и с более старыми версиями, однако такая поддержка предоставляется по принципу best-effort и не гарантируется. Если у вас версия ClickHouse ниже 23.3, обратитесь к [политике безопасности ClickHouse](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md) и рассмотрите возможность обновления.

## Примеры \{#examples\}

Мы стремимся охватить различные сценарии использования клиента с помощью [примеров](https://github.com/ClickHouse/clickhouse-js/blob/main/examples) в репозитории клиента.

Обзор доступен в [README с примерами](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/README.md#overview). 

Если что-то остаётся непонятным или чего-то не хватает в примерах или в документации ниже, вы можете [связаться с нами](./js.md#contact-us).

### Клиентский API \{#client-api\}

Большинство примеров подходят как для Node.js, так и для веб-версии клиента, если явно не указано иное.

#### Создание экземпляра клиента \{#creating-a-client-instance\}

Вы можете создать столько экземпляров клиента, сколько необходимо, с помощью фабричной функции `createClient`:

```ts
import { createClient } from '@clickhouse/client' // or '@clickhouse/client-web'

const client = createClient({
  /* configuration */
})
```

Если ваша среда не поддерживает модули ESM, вместо этого вы можете использовать синтаксис CJS:

```ts
const { createClient } = require('@clickhouse/client');

const client = createClient({
  /* configuration */
})
```

Экземпляр клиента можно [заранее настроить](./js.md#configuration) при создании.

#### Конфигурация \{#configuration\}

При создании экземпляра клиента можно настроить следующие параметры подключения:

| Setting                                                                  | Description                                                                                   | Default Value           | See Also                                                                                   |
|--------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|-------------------------|--------------------------------------------------------------------------------------------|
| **url**?: string                                                         | URL экземпляра ClickHouse.                                                                   | `http://localhost:8123` | [Документация по конфигурации URL](./js.md#url-configuration)                              |
| **pathname**?: string                                                    | Необязательный `pathname`, добавляемый к URL ClickHouse после его разбора клиентом.          | `''`                    | [Документация по прокси с pathname](./js.md#proxy-with-a-pathname)                         |
| **request_timeout**?: number                                             | Таймаут запроса в миллисекундах.                                                             | `30_000`                | -                                                                                          |
| **compression**?: `{ **response**?: boolean; **request**?: boolean }`    | Включение сжатия.                                                                            | -                       | [Документация по сжатию](./js.md#compression)                                              |
| **username**?: string                                                    | Имя пользователя, от имени которого выполняются запросы.                                     | `default`               | -                                                                                          |
| **password**?: string                                                    | Пароль пользователя.                                                                         | `''`                    | -                                                                                          |
| **application**?: string                                                 | Имя приложения, использующего клиент Node.js.                                                | `clickhouse-js`         | -                                                                                          |
| **database**?: string                                                    | Имя используемой базы данных.                                                                | `default`               | -                                                                                          |
| **clickhouse_settings**?: ClickHouseSettings                             | Настройки ClickHouse, применяемые ко всем запросам.                                          | `{}`                    | -                                                                                          |
| **log**?: `{ **LoggerClass**?: Logger, **level**?: ClickHouseLogLevel }` | Конфигурация внутреннего логирования клиента.                                                | -                       | [Документация по логированию](./js.md#logging-nodejs-only)                                 |
| **session_id**?: string                                                  | Необязательный идентификатор сессии ClickHouse, отправляемый с каждым запросом.             | -                       | -                                                                                          |
| **keep_alive**?: `{ **enabled**?: boolean }`                             | По умолчанию включено как в версии для Node.js, так и в веб-версии.                         | -                       | -                                                                                          |
| **http_headers**?: `Record<string, string>`                              | Дополнительные HTTP-заголовки для исходящих запросов в ClickHouse.                          | -                       | [Документация по reverse proxy с аутентификацией](./js.md#reverse-proxy-with-authentication) |
| **roles**?: string \|  string[]                                          | Имя или имена ролей ClickHouse, которые будут добавлены к исходящим запросам.               | -                       | [Использование ролей с HTTP-интерфейсом](/interfaces/http#setting-role-with-query-parameters) |

#### Параметры конфигурации, специфичные для Node.js \{#nodejs-specific-configuration-parameters\}

| Setting                                                                    | Description                                                              | Default Value | See Also                                                                                             |
|----------------------------------------------------------------------------|--------------------------------------------------------------------------|---------------|------------------------------------------------------------------------------------------------------|
| **max_open_connections**?: number                                          | Максимально допустимое количество подключённых сокетов для каждого хоста. | `10`          | -                                                                                                    |
| **tls**?: `{ **ca_cert**: Buffer, **cert**?: Buffer, **key**?: Buffer }`   | Настройка сертификатов TLS.                                              | -             | [Документация по TLS](./js.md#tls-certificates-nodejs-only)                                          |
| **keep_alive**?: `{ **enabled**?: boolean, **idle_socket_ttl**?: number }` | -                                                                        | -             | [Документация по Keep Alive](./js.md#keep-alive-configuration-nodejs-only)                           |
| **http_agent**?: http.Agent \| https.Agent <br/><ExperimentalBadge/>       | Пользовательский HTTP-агент для клиента.                                 | -             | [Документация по HTTP-агенту](./js.md#custom-httphttps-agent-experimental-nodejs-only)               |
| **set_basic_auth_header**?: boolean <br/><ExperimentalBadge/>              | Устанавливать заголовок `Authorization` с учетными данными basic auth.   | `true`        | [Использование этого параметра в документации по HTTP-агенту](./js.md#custom-httphttps-agent-experimental-nodejs-only) |

### Настройка URL \{#url-configuration\}

:::important
Настройка URL *всегда* переопределяет жестко заданные значения, и в этом случае в журнал будет записано предупреждение.
:::

Большинство параметров экземпляра клиента можно настроить с помощью URL. Формат URL: `http[s]://[username:password@]hostname:port[/database][?param1=value1&param2=value2]`. Почти во всех случаях имя конкретного параметра отражает его путь в интерфейсе параметров конфигурации, за несколькими исключениями. Поддерживаются следующие параметры:

| Параметр                                          | Тип                                                                    |
| ------------------------------------------------- | ---------------------------------------------------------------------- |
| `pathname`                                        | произвольная строка.                                                   |
| `application_id`                                  | произвольная строка.                                                   |
| `session_id`                                      | произвольная строка.                                                   |
| `request_timeout`                                 | неотрицательное число.                                                 |
| `max_open_connections`                            | неотрицательное число, больше нуля.                                    |
| `compression_request`                             | логическое значение. См. ниже (1)                                      |
| `compression_response`                            | логическое значение.                                                   |
| `log_level`                                       | допустимые значения: `OFF`, `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`. |
| `keep_alive_enabled`                              | логическое значение.                                                   |
| `clickhouse_setting_*` or `ch_*`                  | см. ниже (2)                                                           |
| `http_header_*`                                   | см. ниже (3)                                                           |
| (только для Node.js) `keep_alive_idle_socket_ttl` | неотрицательное число.                                                 |

* (1) Для логических параметров допустимыми являются значения `true`/`1` и `false`/`0`.
* (2) У любого параметра с префиксом `clickhouse_setting_` или `ch_` этот префикс будет удален, а оставшаяся часть имени будет добавлена в `clickhouse_settings` клиента. Например, `?ch_async_insert=1&ch_wait_for_async_insert=1` будет эквивалентен:

```ts
createClient({
  clickhouse_settings: {
    async_insert: 1,
    wait_for_async_insert: 1,
  },
})
```

Примечание: логические значения параметра `clickhouse_settings` должны передаваться как `1`/`0` в URL.

* (3) Аналогично пункту (2), но для конфигурации `http_header`. Например, `?http_header_x-clickhouse-auth=foobar` будет эквивалентом:

```ts
createClient({
  http_headers: {
    'x-clickhouse-auth': 'foobar',
  },
})
```

### Подключение \{#connecting\}

#### Соберите сведения о подключении \{#gather-your-connection-details\}

<ConnectionDetails />

#### Обзор подключения \{#connection-overview\}

Клиент устанавливает подключение по протоколу HTTP(s). Поддержка RowBinary находится в разработке, см. [соответствующую задачу](https://github.com/ClickHouse/clickhouse-js/issues/216).

Следующий пример демонстрирует, как настроить подключение к ClickHouse Cloud. Предполагается, что значения `url` (включая
протокол и порт) и `password` заданы через переменные окружения, и используется пользователь `default`.

**Пример:** создание экземпляра клиента Node.js с использованием переменных окружения для настройки.

```ts
import { createClient } from '@clickhouse/client'

const client = createClient({
  url: process.env.CLICKHOUSE_HOST ?? 'http://localhost:8123',
  username: process.env.CLICKHOUSE_USER ?? 'default',
  password: process.env.CLICKHOUSE_PASSWORD ?? '',
})
```

Репозиторий клиента содержит множество примеров, которые используют переменные окружения, например [создание таблицы в ClickHouse Cloud](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts), [использование асинхронных вставок](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert.ts) и многие другие.

#### Пул соединений (только Node.js) \{#connection-pool-nodejs-only\}

Чтобы избежать накладных расходов на установку соединения при каждом запросе, клиент создает пул соединений с ClickHouse для их повторного использования, используя механизм Keep-Alive. По умолчанию Keep-Alive включен, а размер пула соединений равен `10`, но вы можете изменить его с помощью параметра конфигурации `max_open_connections` [параметра конфигурации](./js.md#configuration). 

Нет гарантии, что одно и то же соединение из пула будет использоваться для последующих запросов, если только пользователь не установит `max_open_connections: 1`. Это требуется редко, но может быть необходимо в случаях, когда используются временные таблицы.

См. также: [Конфигурация Keep-Alive](./js.md#keep-alive-configuration-nodejs-only).

### Идентификатор запроса \{#query-id\}

Каждый метод, который отправляет запрос или оператор (`command`, `exec`, `insert`, `select`), возвращает `query_id` в результате выполнения. Этот уникальный идентификатор назначается клиентом для каждого запроса и может быть полезен для выборки данных из `system.query_log`,
если он включён в [конфигурации сервера](/operations/server-configuration-parameters/settings), или для отмены долгих запросов (см. [пример](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/cancel_query.ts)). При необходимости `query_id` может быть переопределён пользователем в параметрах методов `command`/`query`/`exec`/`insert`.

:::tip
Если вы переопределяете параметр `query_id`, необходимо обеспечить его уникальность для каждого вызова. Хорошим вариантом будет случайный UUID.
:::

### Общие параметры для всех клиентских методов \{#base-parameters-for-all-client-methods\}

Существует несколько параметров, которые могут быть применены ко всем клиентским методам ([query](./js.md#query-method)/[command](./js.md#command-method)/[insert](./js.md#insert-method)/[exec](./js.md#exec-method)).

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

### Метод query \{#query-method\}

Используется для большинства запросов, которые могут вернуть ответ, таких как `SELECT`, а также для отправки DDL, таких как `CREATE TABLE`, и должен вызываться с `await`. Ожидается, что возвращённый результирующий набор данных будет использоваться в приложении.

:::note
Для вставки данных есть отдельный метод [insert](./js.md#insert-method), а для DDL — [command](./js.md#command-method).
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

См. также: [Базовые параметры для всех клиентских методов](./js.md#base-parameters-for-all-client-methods).

:::tip
Не указывайте клаузу FORMAT в `query`, вместо этого используйте параметр `format`.
:::

#### Абстракции набора результатов и строк \{#result-set-and-row-abstractions\}

`ResultSet` предоставляет несколько вспомогательных методов для обработки данных в вашем приложении.

Реализация `ResultSet` в Node.js внутренне использует `Stream.Readable`, тогда как веб-версия использует Web API `ReadableStream`.

Вы можете считывать данные из `ResultSet`, вызывая методы `text` или `json` у `ResultSet` и загружая в память весь набор строк, возвращаемый запросом.

Следует начать чтение `ResultSet` как можно раньше, так как он удерживает открытым поток ответа и, как следствие, держит занятым соответствующее соединение. Клиент не буферизует входящие данные, чтобы избежать потенциально чрезмерного использования памяти приложением.

Если набор данных слишком велик, чтобы поместиться в памяти целиком, вы можете вызвать метод `stream` и обрабатывать данные в потоковом режиме. В этом случае каждый из фрагментов ответа будет преобразован в относительно небольшой массив строк (размер этого массива зависит от размера конкретного фрагмента, который клиент получает от сервера, так как он может различаться, и от размера отдельной строки), обрабатываемый по одному фрагменту за раз.

Обратитесь к списку [поддерживаемых форматов данных](./js.md#supported-data-formats), чтобы определить, какой формат лучше подходит для потоковой обработки в вашем случае. Например, если вы хотите передавать в потоке JSON-объекты, вы можете выбрать формат [JSONEachRow](/interfaces/formats/JSONEachRow), и каждая строка будет разобрана как JS-объект, или, возможно, более компактный формат [JSONCompactColumns](/interfaces/formats/JSONCompactColumns), при котором каждая строка будет представлять собой компактный массив значений. См. также: [потоковая передача файлов](./js.md#streaming-files-nodejs-only).

:::important
Если `ResultSet` или его поток не будут полностью прочитаны, они будут уничтожены по истечении периода бездействия, задаваемого `request_timeout`.
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

**Пример:** (Node.js/Web) Запрос с результирующим набором данных в формате `JSONEachRow`, который полностью считывает поток и разбирает содержимое в объекты JavaScript.
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts).

```ts
const resultSet = await client.query({
  query: 'SELECT * FROM my_table',
  format: 'JSONEachRow',
})
const dataset = await resultSet.json() // or `row.text` to avoid parsing JSON
```

**Пример:** (только для Node.js) потоковое чтение результата запроса в формате `JSONEachRow` с использованием классического подхода `on('data')`. Этот подход взаимозаменяем с синтаксисом `for await const`. [Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row.ts).

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

**Пример:** (только Node.js) Потоковая выборка результата запроса в формате `CSV` с использованием классического подхода `on('data')`. Это эквивалентно использованию синтаксиса `for await const`.
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_text_line_by_line.ts)

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

**Пример:** (только Node.js) Потоковая выборка результатов запроса как объекты JS в формате `JSONEachRow`, которые обрабатываются с использованием синтаксиса `for await const`. Это взаимозаменяемо с классическим подходом `on('data')`.
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row_for_await.ts).

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
Синтаксис `for await const` требует немного меньше кода, чем подход с `on('data')`, но может отрицательно повлиять на производительность.
См. [это обсуждение в репозитории Node.js](https://github.com/nodejs/node/issues/31979) для подробностей.
:::

**Пример:** (только Web) Итерация по `ReadableStream` объектов.

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

### Метод INSERT \{#insert-method\}

Это основной метод вставки данных.

```ts
export interface InsertResult {
  query_id: string
  executed: boolean
}

interface ClickHouseClient {
  insert(params: InsertParams): Promise<InsertResult>
}
```

Тип возвращаемого значения минималистичен, так как мы не ожидаем, что сервер вернёт какие‑либо данные, и сразу же вычитываем и закрываем поток ответа.

Если в метод `insert` был передан пустой массив, оператор INSERT не будет отправлен на сервер; вместо этого метод немедленно вернёт результат `{ query_id: '...', executed: false }`. Если в этом случае `query_id` не был передан в параметрах метода, в результате он будет пустой строкой, поскольку возврат случайного UUID, сгенерированного на стороне клиента, может ввести в заблуждение, так как запроса с таким `query_id` не будет в таблице `system.query_log`.

Если оператор INSERT был отправлен на сервер, флаг `executed` будет иметь значение `true`.

#### Метод insert и потоковая передача данных в Node.js \{#insert-method-and-streaming-in-nodejs\}

Он может работать как с `Stream.Readable`, так и с обычным `Array<T>`, в зависимости от [формата данных](./js.md#supported-data-formats), указанного для метода `insert`. См. также раздел о [потоковой передаче файлов](./js.md#streaming-files-nodejs-only).

Метод insert предназначен для использования с `await`; однако можно передать входной поток и ожидать завершения операции `insert` позже, только после завершения потока (что также приведёт к разрешению промиса `insert`). Это потенциально может быть полезно для обработчиков событий и подобных сценариев, но обработка ошибок при этом может оказаться нетривиальной из‑за большого количества крайних случаев на стороне клиента. Вместо этого рассмотрите использование [асинхронных вставок](/optimize/asynchronous-inserts), как показано в [этом примере](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert_without_waiting.ts).

:::tip
Если у вас есть собственный оператор INSERT, который сложно смоделировать с помощью этого метода, рассмотрите использование [метода command](./js.md#command-method).

Вы можете посмотреть, как он используется, в примерах [INSERT INTO ... VALUES](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_values_and_functions.ts) или [INSERT INTO ... SELECT](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_from_select.ts).
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

См. также: [Базовые параметры для всех клиентских методов](./js.md#base-parameters-for-all-client-methods).

:::important
Отмена запроса с помощью `abort_signal` не гарантирует, что вставка данных не была выполнена, так как сервер мог получить часть передаваемых по потоку данных до момента отмены.
:::

**Пример:** (Node.js/Web) Вставка массива значений.
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts).

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

**Пример:** (только Node.js) Вставка потока из CSV‑файла.
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts). См. также: [потоковая передача файлов](./js.md#streaming-files-nodejs-only).

```ts
await client.insert({
  table: 'my_table',
  values: fs.createReadStream('./path/to/a/file.csv'),
  format: 'CSV',
})
```

**Пример**: исключение отдельных столбцов из оператора INSERT.

Пусть имеется определение таблицы следующего вида:

```sql
CREATE OR REPLACE TABLE mytable
(id UInt32, message String)
ENGINE MergeTree()
ORDER BY (id)
```

Вставить только один столбец:

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

Исключить некоторые столбцы:

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

См. [исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_exclude_columns.ts) для получения дополнительных сведений.

**Пример**: Вставка в другую базу данных, а не ту, что указана в экземпляре клиента. [Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_into_different_db.ts).

```ts
await client.insert({
  table: 'mydb.mytable', // Fully qualified name including the database
  values: [{ id: 42, message: 'foo' }],
  format: 'JSONEachRow',
})
```

#### Ограничения веб-версии \{#web-version-limitations\}

В настоящий момент операции вставки в `@clickhouse/client-web` работают только с форматами `Array<T>` и `JSON*`.
Вставка потоков пока не поддерживается в веб-версии из-за ограниченной поддержки в браузерах.

Соответственно, интерфейс `InsertParams` для веб-версии выглядит немного иначе, чем в версии для Node.js,
так как `values` ограничены только типом `ReadonlyArray<T>`:

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

В будущем это может измениться. См. также: [Базовые параметры для всех клиентских методов](./js.md#base-parameters-for-all-client-methods).

### Метод command \{#command-method\}

Он может использоваться для операторов, которые не возвращают результат, когда предложение `FORMAT` неприменимо, или когда вам вообще не нужен ответ. Примером такого оператора может быть `CREATE TABLE` или `ALTER TABLE`.

Вызов должен ожидаться с помощью `await`.

Поток ответа немедленно закрывается, что означает, что подлежащий сокет освобождается.

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

См. также: [Базовые параметры для всех клиентских методов](./js.md#base-parameters-for-all-client-methods).

**Пример:** (Node.js/Web) Создание таблицы в ClickHouse Cloud.
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts).

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

**Пример:** (Node.js/Web) создание таблицы в self-hosted экземпляре ClickHouse.
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_single_node.ts).

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

**Пример:** (Node.js/Web) INSERT FROM SELECT

```ts
await client.command({
  query: `INSERT INTO my_table SELECT '42'`,
})
```

:::important
Отмена запроса с помощью `abort_signal` не гарантирует, что соответствующий оператор не был выполнен сервером.
:::

### Метод exec \{#exec-method\}

Если у вас есть произвольный запрос, который не вписывается в `query`/`insert`,
и вам нужен результат, вы можете использовать `exec` в качестве альтернативы `command`.

`exec` возвращает читаемый поток, который ДОЛЖЕН быть обязательно прочитан или уничтожен на стороне приложения.

```ts
interface ExecParams extends BaseQueryParams {
  // Statement to execute.
  query: string
}

interface ClickHouseClient {
  exec(params: ExecParams): Promise<QueryResult>
}
```

См. также: [Базовые параметры для всех клиентских методов](./js.md#base-parameters-for-all-client-methods).

Тип возвращаемого значения Stream различается в версиях для Node.js и Web.

Node.js:

```ts
export interface QueryResult {
  stream: Stream.Readable
  query_id: string
}
```

Веб:

```ts
export interface QueryResult {
  stream: ReadableStream
  query_id: string
}
```

### Ping \{#ping\}

Метод `ping`, предназначенный для проверки состояния подключения, возвращает `true`, если сервер доступен.

Если сервер недоступен, соответствующая ошибка также включается в результат.

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

Ping может быть полезным инструментом для проверки доступности сервера при запуске приложения, особенно при работе с ClickHouse Cloud, где экземпляр может простаивать и «просыпается» после ping-запроса: в этом случае имеет смысл повторить его несколько раз с паузой между попытками.

Обратите внимание, что по умолчанию версия для Node.js использует endpoint `/ping`, тогда как Web-версия выполняет простой запрос `SELECT 1` для достижения аналогичного результата, поскольку endpoint `/ping` не поддерживает CORS.

**Пример:** (Node.js/Web) простой ping экземпляра сервера ClickHouse. NB: для Web-версии перехватываемые ошибки будут отличаться.
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/ping.ts).

```ts
const result = await client.ping();
if (!result.success) {
  // process result.error
}
```

**Пример:** Если вы хотите при вызове метода `ping` дополнительно проверять учетные данные или указывать дополнительные параметры, такие как `query_id`, вы можете использовать его следующим образом:

```ts
const result = await client.ping({ select: true, /* query_id, abort_signal, http_headers, or any other query params */ });
```

Метод ping может принимать большинство стандартных параметров метода `query` — см. определение типа `PingParamsWithSelectQuery`.

### Close (только Node.js) \{#close-nodejs-only\}

Закрывает все открытые соединения и освобождает ресурсы. Ничего не делает в веб-версии.

```ts
await client.close()
```

## Потоковая передача файлов (только Node.js) \{#streaming-files-nodejs-only\}

В клиентском репозитории есть несколько примеров потоковой передачи файлов с популярными форматами данных (NDJSON, CSV, Parquet).

- [Потоковая передача из файла NDJSON](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_ndjson.ts)
- [Потоковая передача из файла CSV](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts)
- [Потоковая передача из файла Parquet](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_parquet.ts)
- [Потоковая передача в файл Parquet](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts)

Потоковая передача других форматов в файл должна быть аналогична работе с Parquet; единственное отличие будет в формате, используемом при вызове `query` (`JSONEachRow`, `CSV` и т. д.) и имени выходного файла.

## Поддерживаемые форматы данных \{#supported-data-formats\}

Клиент поддерживает форматы данных на основе JSON или текстовые форматы.

Если вы укажете `format` как один из форматов семейства JSON (`JSONEachRow`, `JSONCompactEachRow` и т.д.), клиент будет сериализовывать и десериализовывать данные при передаче по сети.

Данные, предоставленные в «сырых» текстовых форматах (семейства `CSV`, `TabSeparated` и `CustomSeparated`), отправляются по сети без дополнительных преобразований.

:::tip
Может возникнуть путаница между JSON как общим форматом и [форматом ClickHouse JSON](/interfaces/formats/JSON). 

Клиент поддерживает потоковую передачу JSON-объектов с форматами, такими как [JSONEachRow](/interfaces/formats/JSONEachRow) (см. сводную таблицу для других форматов, удобных для потоковой обработки; см. также [примеры `select_streaming_` в репозитории клиента](https://github.com/ClickHouse/clickhouse-js/tree/main/examples/node)). 

Однако такие форматы, как [ClickHouse JSON](/interfaces/formats/JSON) и некоторые другие, представлены как единый объект в ответе и не могут передаваться потоком со стороны клиента.
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
| JSONEachRowWithProgress                    | ❌️            | ❌              | ✔️ ❗- см. ниже        | ✔️            | ✔️             |
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
| Parquet                                    | ❌             | ❌              | ✔️                    | ❌             | ✔️❗- см. ниже  |

Для Parquet основным сценарием использования запросов SELECT, скорее всего, будет запись результирующего потока в файл. См. [пример](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts) в репозитории клиента.

`JSONEachRowWithProgress` — это формат только для вывода данных, который поддерживает отчёт о прогрессе в потоке. См. [этот пример](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_json_each_row_with_progress.ts) для получения дополнительной информации.

Полный список входных и выходных форматов ClickHouse доступен
[здесь](/interfaces/formats).

## Поддерживаемые типы данных ClickHouse \{#supported-clickhouse-data-types\}

:::note
Соответствующий тип JS актуален для любых форматов `JSON*`, кроме тех, которые представляют всё как строку (например, `JSONStringEachRow`).
:::

| Type                   | Status          | JS type                                |
|------------------------|-----------------|----------------------------------------|
| UInt8/16/32            | ✔️              | number                                 |
| UInt64/128/256         | ✔️ ❗- см. ниже | string                                 |
| Int8/16/32             | ✔️              | number                                 |
| Int64/128/256          | ✔️ ❗- см. ниже | string                                 |
| Float32/64             | ✔️              | number                                 |
| Decimal                | ✔️ ❗- см. ниже | number                                 |
| Boolean                | ✔️              | boolean                                |
| String                 | ✔️              | string                                 |
| FixedString            | ✔️              | string                                 |
| UUID                   | ✔️              | string                                 |
| Date32/64              | ✔️              | string                                 |
| DateTime32/64          | ✔️ ❗- см. ниже | string                                 |
| Enum                   | ✔️              | string                                 |
| LowCardinality         | ✔️              | string                                 |
| Array(T)               | ✔️              | T[]                                    |
| (new) JSON             | ✔️              | object                                 |
| Variant(T1, T2...)     | ✔️              | T (зависит от варианта)                |
| Dynamic                | ✔️              | T (зависит от варианта)                |
| Nested                 | ✔️              | T[]                                    |
| Tuple(T1, T2, ...)     | ✔️              | [T1, T2, ...]                          |
| Tuple(n1 T1, n2 T2...) | ✔️              | \{ n1: T1; n2: T2; ...}                |
| Nullable(T)            | ✔️              | тип JS для T или null                  |
| IPv4                   | ✔️              | string                                 |
| IPv6                   | ✔️              | string                                 |
| Point                  | ✔️              | [ number, number ]                     |
| Ring                   | ✔️              | Array&lt;Point\>                       |
| Polygon                | ✔️              | Array&lt;Ring\>                        |
| MultiPolygon           | ✔️              | Array&lt;Polygon\>                     |
| Map(K, V)              | ✔️              | Record&lt;K, V\>                       |
| Time/Time64            | ✔️              | string                                 |

Полный список поддерживаемых типов данных ClickHouse доступен 
[здесь](/sql-reference/data-types/).

См. также: 

- [Примеры работы с Dynamic/Variant/JSON](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/dynamic_variant_json.ts)
- [Примеры работы с Time/Time64](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/time_time64.ts)

### Особенности типов Date/Date32 \{#datedate32-types-caveats\}

Поскольку клиент вставляет значения без дополнительного преобразования типов, столбцы типа `Date`/`Date32` можно вставлять только в виде строк.

**Пример:** Вставка значения типа `Date`.
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/ba387d7f4ce375a60982ac2d99cb47391cf76cec/__tests__/integration/date_time.test.ts)

```ts
await client.insert({
  table: 'my_table',
  values: [ { date: '2022-09-05' } ],
  format: 'JSONEachRow',
})
```

Однако, если вы используете столбцы с типом `DateTime` или `DateTime64`, вы можете использовать как строки, так и объекты JS Date. Объекты JS Date можно передавать в `insert` как есть, при значении параметра `date_time_input_format`, установленном в `best_effort`. Подробнее см. в этом [примере](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_js_dates.ts).

### Особенности типов Decimal* \{#decimal-types-caveats\}

Можно вставлять значения Decimal с помощью форматов семейства `JSON*`. Предположим, у нас есть таблица, определённая как:

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

Значения можно вставлять без потери точности, используя строковое представление:

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

Однако при запросе данных в форматах `JSON*` ClickHouse по умолчанию будет возвращать значения типов Decimal как *числа*, что может привести к потере точности. Чтобы этого избежать, вы можете приводить значения Decimal к строке в запросе:

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

См. [этот пример](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_decimals.ts) для получения дополнительных сведений.

### Целочисленные типы: Int64, Int128, Int256, UInt64, UInt128, UInt256 \{#integral-types-int64-int128-int256-uint64-uint128-uint256\}

Хотя сервер может принимать это значение как число, в выходных форматах семейства `JSON*` оно возвращается как строка, чтобы избежать
переполнения целого числа, поскольку максимальные значения этих типов превышают `Number.MAX_SAFE_INTEGER`.

Однако это поведение можно изменить с помощью [настройки `output_format_json_quote_64bit_integers`](/operations/settings/formats#output_format_json_quote_64bit_integers).

**Пример:** Настройка формата вывода JSON для 64-битных чисел.

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

## Настройки ClickHouse \{#clickhouse-settings\}

Клиент может настраивать поведение ClickHouse с помощью механизма [настроек](/operations/settings/settings/).
Настройки можно задать на уровне экземпляра клиента, чтобы они применялись к каждому запросу,
отправляемому в ClickHouse:

```ts
const client = createClient({
  clickhouse_settings: {}
})
```

Или параметр можно настроить на уровне отдельного запроса:

```ts
client.query({
  clickhouse_settings: {}
})
```

Файл объявлений типов со всеми поддерживаемыми настройками ClickHouse можно найти
[здесь](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/settings.ts).

:::important
Убедитесь, что пользователь, от имени которого выполняются запросы, имеет достаточные права для изменения настроек.
:::

## Продвинутые темы \{#advanced-topics\}

### Запросы с параметрами \{#queries-with-parameters\}

Вы можете создать запрос с параметрами и передавать значения для них из клиентского приложения. Это позволяет избежать
формирования запроса с конкретными динамическими значениями на стороне клиента.

Сформируйте запрос как обычно, затем заключите в фигурные скобки значения, которые вы хотите передать из параметров приложения в запрос, в следующем формате:

```text
{<name>: <data_type>}
```

где:

* `name` — идентификатор плейсхолдера.
* `data_type` - [Тип данных](/sql-reference/data-types/) значения параметра приложения.

**Пример:** Запрос с параметрами.\
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/query_with_parameter_binding.ts).

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

Дополнительные сведения см. на странице [https://clickhouse.com/docs/interfaces/cli#cli-queries-with-parameters-syntax](https://clickhouse.com/docs/interfaces/cli#cli-queries-with-parameters-syntax).

### Сжатие \{#compression\}

Примечание: сжатие запросов в настоящее время недоступно в веб-версии. Сжатие ответов работает как обычно. Версия для Node.js поддерживает оба варианта.

Приложения для работы с данными, передающие по сети большие объёмы, могут существенно выиграть от включения сжатия. На данный момент поддерживается только `GZIP` с использованием [zlib](https://nodejs.org/docs/latest-v14.x/api/zlib.html).

```typescript
createClient({
  compression: {
    response: true,
    request: true
  }
})
```

Параметры конфигурации следующие:

* `response: true` указывает серверу ClickHouse отправлять сжатое тело ответа. Значение по умолчанию: `response: false`
* `request: true` включает сжатие тела запроса, отправляемого клиентом. Значение по умолчанию: `request: false`

### Логирование (только Node.js) \{#logging-nodejs-only\}

:::important
Функциональность логирования является экспериментальной и может измениться в будущем.
:::

Реализация логгера по умолчанию выводит записи логов в `stdout` через методы `console.debug/info/warn/error`.
Вы можете настроить логику логирования, указав `LoggerClass`, и выбрать нужный уровень логирования с помощью параметра `level` (по умолчанию `OFF`):

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

В настоящее время клиент записывает в лог следующие события:

* `TRACE` — низкоуровневая информация о жизненном цикле сокетов Keep-Alive
* `DEBUG` — информация об ответе (без заголовков авторизации и сведений о хосте)
* `INFO` — в основном не используется, выводит текущий уровень логирования при инициализации клиента
* `WARN` — нефатальные ошибки; неуспешный запрос `ping` записывается как предупреждение, так как исходная ошибка включена в возвращаемый результат
* `ERROR` — фатальные ошибки, возникающие в методах `query`/`insert`/`exec`/`command`, например, при неуспешном запросе

Реализацию Logger по умолчанию можно найти [здесь](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/logger.ts).

### Сертификаты TLS (только для Node.js) \{#tls-certificates-nodejs-only\}

Клиент Node.js опционально поддерживает как односторонний (только центр сертификации, Certificate Authority),
так и взаимный (центр сертификации и клиентские сертификаты, Certificate Authority and client certificates) TLS.

Пример базовой конфигурации TLS, если ваши сертификаты находятся в папке `certs`,
а имя файла CA — `CA.pem`:

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

Пример конфигурации взаимного TLS на основе клиентских сертификатов:

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

Полные примеры конфигурации TLS для режимов [basic](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/basic_tls.ts) и [mutual](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/mutual_tls.ts) см. в репозитории.

### Конфигурация Keep-Alive (только для Node.js) \{#keep-alive-configuration-nodejs-only\}

Клиент по умолчанию включает Keep-Alive во внутреннем HTTP-агенте. Это означает, что установленные сокеты будут повторно использоваться для последующих запросов, а заголовок `Connection: keep-alive` будет отправляться автоматически. Сокеты, простаивающие без активности, по умолчанию остаются в пуле соединений 2500 миллисекунд (см. [заметки по настройке этого параметра](./js.md#adjusting-idle_socket_ttl)).

Значение `keep_alive.idle_socket_ttl` рекомендуется задавать заметно ниже, чем соответствующую настройку на стороне сервера/балансировщика нагрузки (LB). Основная причина в том, что HTTP/1.1 допускает закрытие сокетов сервером без уведомления клиента. Если сервер или балансировщик нагрузки закроет соединение _раньше_, чем это сделает клиент, клиент может попытаться повторно использовать уже закрытый сокет, что приведёт к ошибке `socket hang up`.

Если вы изменяете `keep_alive.idle_socket_ttl`, имейте в виду, что его значение всегда должно быть согласовано с конфигурацией Keep-Alive на сервере/LB и **всегда ниже** неё, чтобы гарантировать, что сервер никогда не закроет открытое соединение первым.

#### Настройка `idle_socket_ttl` \{#adjusting-idle_socket_ttl\}

Клиент устанавливает `keep_alive.idle_socket_ttl` в 2500 миллисекунд, так как это можно считать наиболее безопасным значением по умолчанию; на стороне сервера `keep_alive_timeout` может быть установлен [на значение всего 3 секунды в версиях ClickHouse до 23.11](https://github.com/ClickHouse/ClickHouse/commit/1685cdcb89fe110b45497c7ff27ce73cc03e82d1) без изменений в `config.xml`.

:::warning
Если вас устраивает производительность и вы не сталкиваетесь с какими‑либо проблемами, рекомендуется **не** увеличивать значение настройки `keep_alive.idle_socket_ttl`, так как это может привести к возможным ошибкам «Socket hang-up»; кроме того, если ваше приложение отправляет много запросов и между ними нет больших простоев, значения по умолчанию должно быть достаточно, так как сокеты не будут простаивать достаточно долго, и клиент будет удерживать их в пуле.
:::

Вы можете найти корректное значение таймаута Keep-Alive в заголовках ответа сервера, выполнив следующую команду:

```sh
curl -v --data-binary "SELECT 1" <clickhouse_url>
```

Проверьте значения заголовков `Connection` и `Keep-Alive` в ответе. Например:

```text
< Connection: Keep-Alive
< Keep-Alive: timeout=10
```

В данном случае `keep_alive_timeout` равен 10 секундам, и вы можете попробовать увеличить `keep_alive.idle_socket_ttl` до 9000 или даже 9500 миллисекунд, чтобы неактивные сокеты оставались открытыми немного дольше, чем по умолчанию. Следите за возможными ошибками «Socket hang-up», которые будут указывать на то, что сервер закрывает соединения раньше клиента, и снижайте значение до тех пор, пока ошибки не исчезнут.

#### Поиск и устранение неисправностей \{#troubleshooting\}

Если вы сталкиваетесь с ошибками `socket hang up`, даже используя последнюю версию клиента, есть следующие варианты решения этой проблемы:

* Включите журналирование как минимум с уровнем `WARN`. Это позволит проверить, есть ли в коде приложения непрочитанный или «висящий» поток: транспортный уровень залогирует это на уровне WARN, так как это потенциально может привести к закрытию сокета сервером. Журналирование можно включить в конфигурации клиента следующим образом:
  
  ```ts
  const client = createClient({
    log: { level: ClickHouseLogLevel.WARN },
  })
  ```
  
* Проверьте код вашего приложения с включённым правилом ESLint [no-floating-promises](https://typescript-eslint.io/rules/no-floating-promises/), которое поможет выявить необработанные промисы, способные приводить к висячим потокам и сокетам.

* Незначительно уменьшите значение настройки `keep_alive.idle_socket_ttl` в конфигурации сервера ClickHouse. В определённых ситуациях, например, при высокой сетевой задержке между клиентом и сервером, может быть полезно уменьшить `keep_alive.idle_socket_ttl` ещё на 200–500 миллисекунд, исключив ситуацию, когда исходящий запрос получает сокет, который сервер собирается закрыть. 

* Если эта ошибка возникает во время длительных запросов без входящих или исходящих данных (например, долгий `INSERT FROM SELECT`), это может быть связано с тем, что балансировщик нагрузки закрывает простаивающие соединения. Можно попытаться принудительно инициировать передачу некоторых данных во время длительных запросов, используя комбинацию следующих настроек ClickHouse:

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
  Однако имейте в виду, что общий размер полученных заголовков имеет ограничение 16KB в последних версиях Node.js; после получения определённого количества заголовков прогресса, которое в наших тестах составляло примерно 70–80, будет сгенерировано исключение.

  Также возможно использовать полностью другой подход, полностью избегая ожидания по сети; это можно сделать, используя «особенность» HTTP-интерфейса, заключающуюся в том, что мутации не отменяются при потере соединения. См. [этот пример (часть 2)](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/long_running_queries_timeouts.ts) для подробностей.

* Механизм Keep-Alive можно полностью отключить. В этом случае клиент также будет добавлять заголовок `Connection: close` к каждому запросу, и базовый HTTP-агент не будет переиспользовать соединения. Настройка `keep_alive.idle_socket_ttl` будет проигнорирована, так как простаивающих сокетов не будет. Это приведёт к дополнительным накладным расходам, поскольку для каждого запроса будет устанавливаться новое соединение.

  ```ts
  const client = createClient({
    keep_alive: {
      enabled: false,
    },
  })
  ```

### Пользователи только для чтения \{#read-only-users\}

При использовании клиента с [пользователем с readonly=1](/operations/settings/permissions-for-queries#readonly) сжатие ответа не может быть включено, так как для этого требуется параметр `enable_http_compression`. Следующая конфигурация приведёт к ошибке:

```ts
const client = createClient({
  compression: {
    response: true, // won't work with a readonly=1 user
  },
})
```

См. [пример](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/read_only_user.ts), где подробнее показаны ограничения пользователя с readonly=1.

### Прокси с путем (pathname) \{#proxy-with-a-pathname\}

Если ваш экземпляр ClickHouse находится за прокси и в его URL-адресе есть путь (pathname), как, например, [http://proxy:8123/clickhouse&#95;server](http://proxy:8123/clickhouse_server), укажите `clickhouse_server` в качестве параметра конфигурации `pathname` (с начальным слешем или без него); иначе, если этот путь указан напрямую в `url`, он будет интерпретирован как параметр `database`. Поддерживается несколько сегментов, например `/my_proxy/db`.

```ts
const client = createClient({
  url: 'http://proxy:8123',
  pathname: '/clickhouse_server',
})
```

### Реверс‑прокси с аутентификацией \{#reverse-proxy-with-authentication\}

Если перед вашим развертыванием ClickHouse стоит реверс‑прокси с аутентификацией, вы можете использовать параметр `http_headers`, чтобы передавать необходимые заголовки:

```ts
const client = createClient({
  http_headers: {
    'My-Auth-Header': '...',
  },
})
```

### Пользовательский HTTP/HTTPS-агент (экспериментальная функция, только Node.js) \{#custom-httphttps-agent-experimental-nodejs-only\}

:::warning
Это экспериментальная функция, которая в будущих релизах может измениться с нарушением обратной совместимости. Реализация и настройки по умолчанию, предоставляемые клиентом, должны быть достаточны для большинства сценариев использования. Используйте эту функцию только в том случае, если вы уверены, что она вам действительно необходима.
:::

По умолчанию клиент настраивает внутренний HTTP(s)-агент, используя параметры, заданные в конфигурации клиента (такие как `max_open_connections`, `keep_alive.enabled`, `tls`), и именно он обрабатывает подключения к серверу ClickHouse. Дополнительно, если используются TLS-сертификаты, внутренний агент будет настроен с необходимыми сертификатами, и будут применены корректные заголовки аутентификации TLS.

Начиная с версии 1.2.0, можно передать клиенту пользовательский HTTP(s)-агент, заменив стандартный внутренний агент. Это может быть полезно в случае сложной сетевой конфигурации. Если передан пользовательский агент, применяются следующие условия:

- Параметры `max_open_connections` и `tls` _не будут иметь никакого эффекта_ и будут проигнорированы клиентом, так как они являются частью конфигурации внутреннего агента.
- `keep_alive.enabled` будет регулировать только значение по умолчанию заголовка `Connection` (`true` -> `Connection: keep-alive`, `false` -> `Connection: close`).
- Хотя управление неактивными keep-alive-сокетами по-прежнему будет работать (так как оно не привязано к агенту, а к конкретному сокету), теперь можно полностью отключить его, установив значение `keep_alive.idle_socket_ttl` в `0`.

#### Примеры использования кастомного агента \{#custom-agent-usage-examples\}

Использование кастомного HTTP(S)-агента без сертификатов:

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

Использование пользовательского HTTPS-агента с базовым TLS и сертификатом удостоверяющего центра (CA):

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

Использование настраиваемого HTTPS-агента с взаимной TLS-аутентификацией:

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

При использовании сертификатов *и* пользовательского *HTTPS*-агента, скорее всего, потребуется отключить заголовок авторизации по умолчанию с помощью настройки `set_basic_auth_header` (добавлена в 1.2.0), так как он конфликтует с заголовками TLS. Все заголовки TLS должны задаваться вручную.

## Известные ограничения (Node.js/web) \{#known-limitations-nodejsweb\}

- Для результирующих наборов не предусмотрены мапперы данных, поэтому используются только примитивы языка. Планируется добавление некоторых мапперов типов данных с [поддержкой формата RowBinary](https://github.com/ClickHouse/clickhouse-js/issues/216).
- Существуют некоторые [особенности типов данных Decimal* и Date\* / DateTime\*](./js.md#datedate32-types-caveats).
- При использовании форматов семейства JSON* числа, превышающие Int32, представляются в виде строк, так как максимальные значения типов Int64+ больше, чем `Number.MAX_SAFE_INTEGER`. Подробнее см. в разделе [Integral types](./js.md#integral-types-int64-int128-int256-uint64-uint128-uint256).

## Известные ограничения (web) \{#known-limitations-web\}

- Потоковая обработка для запросов SELECT поддерживается, но отключена для операций INSERT (в том числе на уровне типов).
- Сжатие запросов отключено, настройка игнорируется. Сжатие ответов работает.
- Поддержка логирования пока отсутствует.

## Советы по оптимизации производительности \{#tips-for-performance-optimizations\}

- Чтобы уменьшить потребление памяти приложением, рассмотрите возможность использования потоков для больших вставок (например, из файлов) и выборок, когда это применимо. Для слушателей событий и схожих сценариев использования [асинхронные вставки](/optimize/asynchronous-inserts) могут быть ещё одним хорошим вариантом, позволяя минимизировать или даже полностью избежать батчирования на стороне клиента. Примеры асинхронных вставок доступны в [репозитории клиента](https://github.com/ClickHouse/clickhouse-js/tree/main/examples) — с префиксом `async_insert_` в имени файла.
- Клиент по умолчанию не использует сжатие запросов или ответов. Однако при выборке или вставке больших наборов данных вы можете рассмотреть возможность включения сжатия через `ClickHouseClientConfigOptions.compression` (либо только для `request` или `response`, либо для обоих).
- Сжатие даёт существенные накладные расходы. Включение его для `request` или `response` негативно скажется на скорости выборок или вставок соответственно, но уменьшит объём сетевого трафика, передаваемого приложением.

## Связаться с нами \{#contact-us\}

Если у вас есть вопросы или нужна помощь, вы можете написать нам в [Community Slack](https://clickhouse.com/slack) (канал `#clickhouse-js`) или через раздел [issues на GitHub](https://github.com/ClickHouse/clickhouse-js/issues).