---
slug: '/integrations/javascript'
sidebar_label: JavaScript
sidebar_position: 4
description: 'Официальный JS клиент для подключения к ClickHouse.'
title: 'ClickHouse JS'
keywords: ['clickhouse', 'js', 'JavaScript', 'NodeJS', 'web', 'browser', 'Cloudflare', 'workers', 'client', 'connect', 'integrate']
doc_type: reference
---
import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# ClickHouse JS

Официальный JS клиент для подключения к ClickHouse. Клиент написан на TypeScript и предоставляет типизацию для публичного API клиента.

Он не имеет зависимостей, оптимизирован для максимальной производительности и протестирован с различными версиями и конфигурациями ClickHouse (одиночный узел на месте, кластер на месте и ClickHouse Cloud).

Доступны две разные версии клиента для разных сред:
- `@clickhouse/client` - только для Node.js
- `@clickhouse/client-web` - браузеры (Chrome/Firefox), Cloudflare workers

При использовании TypeScript убедитесь, что это как минимум [версия 4.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html), которая включает [синтаксис импорта и экспорта встраивания](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#type-modifiers-on-import-names).

Исходный код клиента доступен в [репозитории ClickHouse-JS на GitHub](https://github.com/ClickHouse/clickhouse-js).
## Требования к среде (node.js) {#environment-requirements-nodejs}

Node.js должен быть доступен в среде для работы клиента. Клиент совместим со всеми [поддерживаемыми](https://github.com/nodejs/release#readme) версиями Node.js.

Как только версия Node.js приближается к окончанию жизненного цикла, клиент прекращает поддержку этой версии, считая её устаревшей и небезопасной.

Поддерживаемые текущие версии Node.js:

| Версия Node.js | Поддерживается? |
|----------------|-----------------|
| 22.x           | ✔               |
| 20.x           | ✔               |
| 18.x           | ✔               |
| 16.x           | Прилагаем усилия |

## Требования к среде (web) {#environment-requirements-web}

Веб-версия клиента официально тестируется с последними браузерами Chrome/Firefox и может использоваться как зависимость в, например, приложениях React/Vue/Angular или Cloudflare workers.
## Установка {#installation}

Чтобы установить последнюю стабильную версию клиента Node.js, выполните:

```sh
npm i @clickhouse/client
```

Установка веб-версии:

```sh
npm i @clickhouse/client-web
```
## Совместимость с ClickHouse {#compatibility-with-clickhouse}

| Версия клиента | ClickHouse |
|----------------|------------|
| 1.12.0         | 24.8+      |

Скорее всего, клиент будет работать и с более старыми версиями; однако это поддерживаемая версия, и гарантий нет. Если у вас версия ClickHouse старше 23.3, пожалуйста, ознакомьтесь с [политикой безопасности ClickHouse](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md) и подумайте о выполнении обновления.
## Примеры {#examples}

Мы стремимся рассмотреть различные сценарии использования клиента в [примерах](https://github.com/ClickHouse/clickhouse-js/blob/main/examples) в репозитории клиента.

Обзор доступен в [README примеров](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/README.md#overview). 

Если что-то неясно или отсутствует в примерах или в следующей документации, не стесняйтесь [связаться с нами](./js.md#contact-us).
### API клиента {#client-api}

Большинство примеров должны быть совместимы как с Node.js, так и с веб-версией клиента, если не указано иное.
#### Создание экземпляра клиента {#creating-a-client-instance}

Вы можете создать сколько угодно экземпляров клиента с помощью фабрики `createClient`:

```ts
import { createClient } from '@clickhouse/client' // or '@clickhouse/client-web'

const client = createClient({
  /* configuration */
})
```

Если ваша среда не поддерживает модули ESM, вы можете использовать синтаксис CJS вместо этого:

```ts
const { createClient } = require('@clickhouse/client');

const client = createClient({
  /* configuration */
})
```

Экземпляр клиента может быть [предварительно настроен](./js.md#configuration) при его создании.
#### Конфигурация {#configuration}

При создании экземпляра клиента можно настроить следующие параметры подключения:

| Параметр                                                                | Описание                                                                          | Значение по умолчанию   | См. Также                                                                                   |
|-------------------------------------------------------------------------|---------------------------------------------------------------------------------|-------------------------|--------------------------------------------------------------------------------------------|
| **url**?: string                                                         | URL экземпляра ClickHouse.                                                       | `http://localhost:8123` | [Документация по конфигурации URL](./js.md#url-configuration)                              |
| **pathname**?: string                                                    | Необязательный путь, который будет добавлен к URL ClickHouse после его парсинга клиентом. | `''`                    | [Прокси с путём документация](./js.md#proxy-with-a-pathname)                              |
| **request_timeout**?: number                                             | Таймаут запроса в миллисекундах.                                               | `30_000`                | -                                                                                          |
| **compression**?: `{ **response**?: boolean; **request**?: boolean }`  | Включить сжатие.                                                                 | -                       | [Документация по сжатию](./js.md#compression)                                            |
| **username**?: string                                                    | Имя пользователя, от имени которого отправляются запросы.                       | `default`               | -                                                                                          |
| **password**?: string                                                    | Пароль пользователя.                                                             | `''`                    | -                                                                                          |
| **application**?: string                                                 | Имя приложения, использующего клиент Node.js.                                    | `clickhouse-js`         | -                                                                                          |
| **database**?: string                                                    | Имя базы данных, которую нужно использовать.                                     | `default`               | -                                                                                          |
| **clickhouse_settings**?: ClickHouseSettings                             | Настройки ClickHouse, применяемые ко всем запросам.                             | `{}`                    | -                                                                                          |
| **log**?: `{ **LoggerClass**?: Logger, **level**?: ClickHouseLogLevel }` | Настройки внутренних логов клиента.                                               | -                       | [Документация по логированию](./js.md#logging-nodejs-only)                               |
| **session_id**?: string                                                  | Необязательный идентификатор сессии ClickHouse, который отправляется с каждым запросом. | -                       | -                                                                                          |
| **keep_alive**?: `{ **enabled**?: boolean }`                           | Включен по умолчанию в обеих версиях Node.js и Web.                             | -                       | -                                                                                          |
| **http_headers**?: `Record<string, string>`                              | Дополнительные HTTP заголовки для исходящих запросов ClickHouse.                 | -                       | [Обратный прокси с аутентификацией документация](./js.md#reverse-proxy-with-authentication)|
| **roles**?: string \|  string[]                                          | Имена ролей ClickHouse, которые необходимо прикрепить к исходящим запросам.     | -                       | [Использование ролей с HTTP-интерфейсом](/interfaces/http#setting-role-with-query-parameters) |
#### Параметры конфигурации, специфичные для Node.js {#nodejs-specific-configuration-parameters}

| Параметр                                                                  | Описание                                               | Значение по умолчанию | См. Также                                                                                     |
|---------------------------------------------------------------------------|-------------------------------------------------------|-----------------------|------------------------------------------------------------------------------------------------|
| **max_open_connections**?: number                                         | Максимальное количество открытых соединений для каждого хоста. | `10`                  | -                                                                                              |
| **tls**?: `{ **ca_cert**: Buffer, **cert**?: Buffer, **key**?: Buffer }` | Настройка сертификатов TLS.                          | -                     | [Документация по TLS](./js.md#tls-certificates-nodejs-only)                                  |
| **keep_alive**?: `{ **enabled**?: boolean, **idle_socket_ttl**?: number }` | -                                                    | -                     | [Документация по настройке Keep Alive](./js.md#keep-alive-configuration-nodejs-only)          |
| **http_agent**?: http.Agent \| https.Agent <br/><ExperimentalBadge/>     | Пользовательский HTTP-агент для клиента.            | -                     | [Документация по HTTP-агенту](./js.md#custom-httphttps-agent-experimental-nodejs-only)       |
| **set_basic_auth_header**?: boolean <br/><ExperimentalBadge/>            | Установить заголовок `Authorization` с учетными данными базовой аутентификации. | `true`                | [использование этой настройки в документации по HTTP-агенту](./js.md#custom-httphttps-agent-experimental-nodejs-only) |
### Конфигурация URL {#url-configuration}

:::important
Конфигурация URL _всегда_ перезаписывает жестко закодированные значения, и в этом случае будет записано предупреждение.
:::

Возможно настроить большинство параметров экземпляра клиента с помощью URL. Формат URL: `http[s]://[username:password@]hostname:port[/database][?param1=value1&param2=value2]`. В почти каждом случае имя конкретного параметра отражает его путь в интерфейсе параметров конфигурации, с несколькими исключениями. Поддерживаются следующие параметры:

| Параметр                                   | Тип                                                            |
|---------------------------------------------|----------------------------------------------------------------|
| `pathname`                                  | произвольная строка.                                          |
| `application_id`                            | произвольная строка.                                          |
| `session_id`                                | произвольная строка.                                          |
| `request_timeout`                           | неотрицательное число.                                        |
| `max_open_connections`                      | неотрицательное число, больше нуля.                           |
| `compression_request`                       | булево. См. ниже (1)                                          |
| `compression_response`                      | булево.                                                      |
| `log_level`                                 | допустимые значения: `OFF`, `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`.|
| `keep_alive_enabled`                        | булево.                                                      |
| `clickhouse_setting_*` или `ch_*`            | см. ниже (2)                                                 |
| `http_header_*`                             | см. ниже (3)                                                 |
| (только для Node.js) `keep_alive_idle_socket_ttl` | неотрицательное число.                                       |

- (1) Для булевых значений допустимыми значениями будут `true`/`1` и `false`/`0`. 
- (2) Любой параметр, начинающийся с `clickhouse_setting_` или `ch_`, будет иметь этот префикс удален, а остальная часть добавлена в настройки клиента `clickhouse_settings`. Например, `?ch_async_insert=1&ch_wait_for_async_insert=1` будет равносильно:

```ts
createClient({
  clickhouse_settings: {
    async_insert: 1,
    wait_for_async_insert: 1,
  },
})
```

Примечание: булевые значения для `clickhouse_settings` должны передаваться как `1`/`0` в URL.

- (3) Аналогично (2), но для конфигурации `http_header`. Например, `?http_header_x-clickhouse-auth=foobar` будет эквивалентно:

```ts
createClient({
  http_headers: {
    'x-clickhouse-auth': 'foobar',
  },
})
```
### Подключение {#connecting}
#### Соберите детали подключения {#gather-your-connection-details}

<ConnectionDetails />
#### Обзор подключения {#connection-overview}

Клиент реализует подключение через HTTP(s) протокол. Поддержка RowBinary в работе, см. [связанную проблему](https://github.com/ClickHouse/clickhouse-js/issues/216).

Следующий пример демонстрирует, как установить соединение с ClickHouse Cloud. Предполагается, что значения `url` (включая
протокол и порт) и `password` указаны через переменные окружения, и используется пользователь `default`.

**Пример:** Создание экземпляра клиента Node.js с использованием переменных окружения для конфигурации.

```ts
import { createClient } from '@clickhouse/client'

const client = createClient({
  url: process.env.CLICKHOUSE_HOST ?? 'http://localhost:8123',
  username: process.env.CLICKHOUSE_USER ?? 'default',
  password: process.env.CLICKHOUSE_PASSWORD ?? '',
})
```

Репозиторий клиента содержит множество примеров, использующих переменные окружения, таких как [создание таблицы в ClickHouse Cloud](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts), [использование асинхронных вставок](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert.ts) и множество других.
#### Пул подключений (только Node.js) {#connection-pool-nodejs-only}

Чтобы избежать накладных расходов на установление соединения при каждом запросе, клиент создает пул соединений с ClickHouse для повторного использования, используя механизм Keep-Alive. По умолчанию Keep-Alive включен, а размер пула соединений установлен на `10`, однако вы можете изменить его с помощью параметра [конфигурации](./js.md#configuration) `max_open_connections`.

Нет гарантии, что одно и то же соединение в пуле будет использоваться для последующих запросов, если пользователь не установит `max_open_connections: 1`. Это редко необходимо, но может потребоваться в случаях, когда пользователи используют временные таблицы.

См. также: [Конфигурация Keep-Alive](./js.md#keep-alive-configuration-nodejs-only).
### Идентификатор запроса {#query-id}

Каждый метод, который отправляет запрос или оператор (`command`, `exec`, `insert`, `select`), будет предоставлять `query_id` в результате. Этот уникальный идентификатор назначается клиентом для каждого запроса и может быть полезным для извлечения данных из `system.query_log`,
если он включен в [конфигурации сервера](/operations/server-configuration-parameters/settings), или для отмены долгих запросов (см. [пример](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/cancel_query.ts)). Если это необходимо, пользователь может переопределить `query_id` в параметрах методов `command`/`query`/`exec`/`insert`.

:::tip
Если вы переопределяете параметр `query_id`, вы должны гарантировать его уникальность для каждого вызова. Случайный UUID - хороший выбор.
:::
### Базовые параметры для всех методов клиента {#base-parameters-for-all-client-methods}

Существуют несколько параметров, которые могут быть применены ко всем методам клиента ([query](./js.md#query-method)/[command](./js.md#command-method)/[insert](./js.md#insert-method)/[exec](./js.md#exec-method)).

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
### Метод запроса {#query-method}

Этот метод используется для большинства операторов, которые могут иметь ответ, таких как `SELECT`, или для отправки DDL, таких как `CREATE TABLE`, и должен ожидаться. Ожидается, что возвращаемый набор результатов будет использован в приложении.

:::note
Существует специальный метод [insert](./js.md#insert-method) для вставки данных и [command](./js.md#command-method) для DDL.
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

См. также: [Базовые параметры для всех методов клиента](./js.md#base-parameters-for-all-client-methods).

:::tip
Не указывайте оператор FORMAT в `query`, используйте параметр `format` вместо этого.
:::
#### Набор результатов и абстракции строк {#result-set-and-row-abstractions}

`ResultSet` предоставляет несколько удобных методов для обработки данных в вашем приложении.

Реализация `ResultSet` в Node.js использует `Stream.Readable` под капотом, тогда как веб-версия использует Web API `ReadableStream`.

Вы можете использовать `ResultSet`, вызывая либо `text`, либо `json` методы на `ResultSet` и загружать весь набор строк, возвращаемых запросом, в память.

Вы должны начинать использовать `ResultSet` как можно скорее, поскольку он держит поток ответа открытым и, следовательно, поддерживает фоновые соединения занятыми. Клиент не буферизует входящие данные, чтобы избежать потенциального чрезмерного использования памяти приложением.

В качестве альтернативы, если это слишком велико, чтобы поместиться в память сразу, вы можете вызвать метод `stream` и обрабатывать данные в режиме потоковой передачи. Каждый из частей ответа будет преобразован в относительно небольшие массивы строк вместо (размер этого массива зависит от размера конкретной части, которую клиент получает от сервера, так как она может варьироваться, и размера отдельной строки), по одной части за раз.

Пожалуйста, ознакомьтесь со списком [поддерживаемых форматов данных](./js.md#supported-data-formats), чтобы определить, какой формат лучше всего подходит для потоковой передачи в вашем случае. Например, если вы хотите передавать объекты JSON, вы можете выбрать [JSONEachRow](/sql-reference/formats#jsoneachrow), и каждая строка будет разобрана как JS объект, или, возможно, более компактный формат [JSONCompactColumns](/sql-reference/formats#jsoncompactcolumns), который будет приводить к тому, что каждая строка станет компактным массивом значений. См. также: [поточные файлы](./js.md#streaming-files-nodejs-only).

:::important
Если `ResultSet` или его поток не полностью использованы, он будет уничтожен после периода бездействия, равного `request_timeout`.
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

**Пример:** (Node.js/Web) Запрос с результатом в формате `JSONEachRow`, потребляющий весь поток и разбирая содержимое как JS объекты. 
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts).

```ts
const resultSet = await client.query({
  query: 'SELECT * FROM my_table',
  format: 'JSONEachRow',
})
const dataset = await resultSet.json() // or `row.text` to avoid parsing JSON
```

**Пример:** (только Node.js) Результат запроса в формате `JSONEachRow`, использующий классический подход `on('data')`. Это взаимозаменяемо с синтаксисом `for await const`. [Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row.ts).

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

**Пример:** (только Node.js) Результат запроса в формате `CSV`, использующий классический подход `on('data')`. Это взаимозаменяемо с синтаксисом `for await const`.
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

**Пример:** (только Node.js) Результат запроса как JS объекты в формате `JSONEachRow`, потребляемый с помощью синтаксиса `for await const`. Это взаимозаменяемо с классическим подходом `on('data')`.
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
Синтаксис `for await const` требует немного меньше кода, чем подход `on('data')`, но это может негативно повлиять на производительность.
Смотрите [эту проблему в репозитории Node.js](https://github.com/nodejs/node/issues/31979) для получения дополнительной информации.
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
### Метод вставки {#insert-method}

Это основной метод для вставки данных.

```ts
export interface InsertResult {
  query_id: string
  executed: boolean
}

interface ClickHouseClient {
  insert(params: InsertParams): Promise<InsertResult>
}
```

Возвращаемый тип минимален, так как мы не ожидаем, что сервер вернет какие-либо данные, и немедленно очищаем поток ответа.

Если пустой массив был передан в метод вставки, оператор вставки не будет отправлен на сервер; вместо этого метод сразу разрешится с `{ query_id: '...', executed: false }`. Если `query_id` не был предоставлен в параметрах метода в этом случае, он будет пустой строкой в результате, так как возврат случайного UUID, сгенерированного клиентом, может вызвать путаницу, поскольку запрос с таким `query_id` не будет существовать в таблице `system.query_log`.

Если оператор вставки был отправлен на сервер, флаг `executed` будет равен `true`.
#### Метод вставки и потоковая передача в Node.js {#insert-method-and-streaming-in-nodejs}

Он может работать либо с `Stream.Readable`, либо с обычным `Array<T>`, в зависимости от [формата данных](./js.md#supported-data-formats), указанного в методе `insert`. См. также этот раздел о [файловой потоковой передаче](./js.md#streaming-files-nodejs-only).

Метод вставки должен ожидаться; однако возможно указать вводный поток и дождаться операции `insert` позже, только когда поток завершится (что также разрешит промис `insert`). Это может быть полезно для обработчиков событий и подобных сценариев, но обработка ошибок может быть нетривиальной с множеством нестандартных случаев на стороне клиента. Вместо этого рассмотрите возможность использования [асинхронных вставок](/optimize/asynchronous-inserts), как показано в [этом примере](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert_without_waiting.ts).

:::tip
Если у вас есть собственный оператор INSERT, который сложно смоделировать с помощью этого метода, рассмотрите возможность использования [метода command](./js.md#command-method). 

Вы можете посмотреть, как он используется в примерах [INSERT INTO ... VALUES](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_values_and_functions.ts) или [INSERT INTO ... SELECT](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_from_select.ts).
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

См. также: [Базовые параметры для всех методов клиента](./js.md#base-parameters-for-all-client-methods).

:::important
Запрос, отмененный с помощью `abort_signal`, не гарантирует, что вставка данных не произошла, поскольку сервер мог получить часть передаваемых данных до отмены.
:::

**Пример:** (Node.js/Web) Вставить массив значений. 
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

**Пример:** (только Node.js) Вставка потока из CSV файла.
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts). См. также: [поточная передача файлов](./js.md#streaming-files-nodejs-only).

```ts
await client.insert({
  table: 'my_table',
  values: fs.createReadStream('./path/to/a/file.csv'),
  format: 'CSV',
})
```

**Пример**: Исключение определенных столбцов из оператора вставки.

С учетом такого определения таблицы:

```sql
CREATE OR REPLACE TABLE mytable
(id UInt32, message String)
ENGINE MergeTree()
ORDER BY (id)
```

Вставить только определенный столбец:

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

Исключите определенные столбцы:

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

Смотрите [исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_exclude_columns.ts) для получения дополнительных деталей.

**Пример**: Вставить в базу данных, отличную от той, что указана экземпляру клиента. [Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_into_different_db.ts).

```ts
await client.insert({
  table: 'mydb.mytable', // Fully qualified name including the database
  values: [{ id: 42, message: 'foo' }],
  format: 'JSONEachRow',
})
```
#### Ограничения веб-версии {#web-version-limitations}

В настоящее время вставки в `@clickhouse/client-web` работают только с `Array<T>` и `JSON*` форматами. Вставка потоков еще не поддерживается в веб-версии из-за плохой совместимости браузеров.

Соответственно, интерфейс `InsertParams` для веб-версии выглядит немного иначе, чем версия для Node.js, так как `values` ограничены только типом `ReadonlyArray<T>`:

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

Это может измениться в будущем. См. также: [Базовые параметры для всех методов клиента](./js.md#base-parameters-for-all-client-methods).
### Метод команд {#command-method}

Он может использоваться для операторов, не имеющих вывода, когда оператор формата не применим, или когда вы вообще не интересуетесь ответом. Примером такого оператора может быть `CREATE TABLE` или `ALTER TABLE`.

Должен быть ожидаем.

Поток ответа немедленно уничтожается, что означает, что подлежащий сокет освобождается.

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

См. также: [Базовые параметры для всех методов клиента](./js.md#base-parameters-for-all-client-methods).

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

**Пример:** (Node.js/Web) Создание таблицы в самообслуживаемом экземпляре ClickHouse. 
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
Запрос, отмененный с помощью `abort_signal`, не гарантирует, что оператор не был выполнен сервером.
:::
### Метод exec {#exec-method}

Если у вас есть собственный запрос, который не подходит для `query`/`insert`,
и вас интересует результат, вы можете использовать `exec` как альтернативу `command`.

`exec` возвращает читаемый поток, который ДОЛЖЕН быть использован или уничтожен на стороне приложения.

```ts
interface ExecParams extends BaseQueryParams {
  // Statement to execute.
  query: string
}

interface ClickHouseClient {
  exec(params: ExecParams): Promise<QueryResult>
}
```

См. также: [Базовые параметры для всех методов клиента](./js.md#base-parameters-for-all-client-methods).

Тип возвращаемого потока отличается в версиях Node.js и Web.

Node.js:

```ts
export interface QueryResult {
  stream: Stream.Readable
  query_id: string
}
```

Web:

```ts
export interface QueryResult {
  stream: ReadableStream
  query_id: string
}
```
### Ping {#ping}

Метод `ping`, предназначенный для проверки статуса подключения, возвращает `true`, если сервер доступен. 

Если сервер недоступен, подлежающая ошибка также включается в результат.

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

Ping может быть полезным инструментом для проверки доступности сервера, когда приложение запускается, особенно с ClickHouse Cloud, где экземпляр может быть в ожидании и проснется после пинга: в этом случае вы можете попробовать снова несколько раз с задержкой между попытками.

Обратите внимание, что по умолчанию версия для Node.js использует конечную точку `/ping`, в то время как веб-версия использует простой запрос `SELECT 1`, чтобы достичь аналогичного результата, так как конечная точка `/ping` не поддерживает CORS.

**Пример:** (Node.js/Web) Простой ping к экземпляру сервера ClickHouse. Примечание: для веб-версии захваченные ошибки будут различаться.
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/ping.ts).

```ts
const result = await client.ping();
if (!result.success) {
  // process result.error
}
```

**Пример:** Если вы хотите также проверить учетные данные при вызове метода `ping`, или указать дополнительные параметры, такие как `query_id`, вы можете использовать его следующим образом:

```ts
const result = await client.ping({ select: true, /* query_id, abort_signal, http_headers, or any other query params */ });
```

Метод ping позволит использовать большинство стандартных параметров метода `query` - смотрите определение типов `PingParamsWithSelectQuery`.
### Закрытие (только Node.js) {#close-nodejs-only}

Закрывает все открытые соединения и освобождает ресурсы. Не выполняет никаких операций в веб-версии.

```ts
await client.close()
```
## Потоковые файлы (только Node.js) {#streaming-files-nodejs-only}

В репозитории клиента есть несколько примеров потоковой передачи файлов с популярными форматами данных (NDJSON, CSV, Parquet).

- [Потоковая передача из файла NDJSON](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_ndjson.ts)
- [Потоковая передача из файла CSV](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts)
- [Потоковая передача из файла Parquet](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_parquet.ts)
- [Потоковая передача в файл Parquet](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts)

Потоковая передача других форматов в файл должна быть аналогична формату Parquet,
единственное различие будет в формате, используемом для вызова `query` (`JSONEachRow`, `CSV` и т.д.) и имени выходного файла.
## Поддерживаемые форматы данных {#supported-data-formats}

Клиент обрабатывает форматы данных как JSON или текст.

Если вы указываете `format` как один из форматов семейства JSON (`JSONEachRow`, `JSONCompactEachRow` и т.д.), клиент будет сериализовать и десериализовать данные во время передачи по сети.

Данные, предоставленные в "сырьевых" текстовых форматах (`CSV`, `TabSeparated` и `CustomSeparated`), отправляются по сети без дополнительных преобразований.

:::tip
Может возникнуть путаница между JSON как общим форматом и [форматом JSON ClickHouse](/sql-reference/formats#json). 

Клиент поддерживает потоковые JSON объекты с такими форматами, как [JSONEachRow](/sql-reference/formats#jsoneachrow) (см. сводку таблицы для других форматов, удобных для потоковой передачи; также смотрите примеры с `select_streaming_` [в репозитории клиента](https://github.com/ClickHouse/clickhouse-js/tree/main/examples/node)). 

Только форматы, такие как [ClickHouse JSON](/sql-reference/formats#json) и несколько других, представлены как единый объект в ответе и не могут быть переданы потоком клиентом.
:::

| Формат                                     | Вход (массив) | Вход (объект) | Вход/Выход (Поток) | Выход (JSON) | Выход (текст)  |
|--------------------------------------------|---------------|----------------|---------------------|---------------|----------------|
| JSON                                       | ❌             | ✔️             | ❌                   | ✔️            | ✔️             |
| JSONCompact                                | ❌             | ✔️             | ❌                   | ✔️            | ✔️             |
| JSONObjectEachRow                          | ❌             | ✔️             | ❌                   | ✔️            | ✔️             |
| JSONColumnsWithMetadata                    | ❌             | ✔️             | ❌                   | ✔️            | ✔️             |
| JSONStrings                                | ❌             | ❌️             | ❌                   | ✔️            | ✔️             |
| JSONCompactStrings                         | ❌             | ❌              | ❌                   | ✔️            | ✔️             |
| JSONEachRow                                | ✔️            | ❌              | ✔️                  | ✔️            | ✔️             |
| JSONEachRowWithProgress                    | ❌️            | ❌              | ✔️ ❗- см. ниже      | ✔️            | ✔️             |
| JSONStringsEachRow                         | ✔️            | ❌              | ✔️                  | ✔️            | ✔️             |
| JSONCompactEachRow                         | ✔️            | ❌              | ✔️                  | ✔️            | ✔️             |
| JSONCompactStringsEachRow                  | ✔️            | ❌              | ✔️                  | ✔️            | ✔️             |
| JSONCompactEachRowWithNames                | ✔️            | ❌              | ✔️                  | ✔️            | ✔️             |
| JSONCompactEachRowWithNamesAndTypes        | ✔️            | ❌              | ✔️                  | ✔️            | ✔️             |
| JSONCompactStringsEachRowWithNames         | ✔️            | ❌              | ✔️                  | ✔️            | ✔️             |
| JSONCompactStringsEachRowWithNamesAndTypes | ✔️            | ❌              | ✔️                  | ✔️            | ✔️             |
| CSV                                        | ❌             | ❌              | ✔️                  | ❌             | ✔️             |
| CSVWithNames                               | ❌             | ❌              | ✔️                  | ❌             | ✔️             |
| CSVWithNamesAndTypes                       | ❌             | ❌              | ✔️                  | ❌             | ✔️             |
| TabSeparated                               | ❌             | ❌              | ✔️                  | ❌             | ✔️             |
| TabSeparatedRaw                            | ❌             | ❌              | ✔️                  | ❌             | ✔️             |
| TabSeparatedWithNames                      | ❌             | ❌              | ✔️                  | ❌             | ✔️             |
| TabSeparatedWithNamesAndTypes              | ❌             | ❌              | ✔️                  | ❌             | ✔️             |
| CustomSeparated                            | ❌             | ❌              | ✔️                  | ❌             | ✔️             |
| CustomSeparatedWithNames                   | ❌             | ❌              | ✔️                  | ❌             | ✔️             |
| CustomSeparatedWithNamesAndTypes           | ❌             | ❌              | ✔️                  | ❌             | ✔️             |
| Parquet                                    | ❌             | ❌              | ✔️                  | ❌             | ✔️❗- см. ниже |

Для Parquet основное использование для выборок, вероятно, будет запись результирующего потока в файл. Смотрите [пример](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts) в репозитории клиента.

`JSONEachRowWithProgress` является форматом только для вывода, который поддерживает отчет о прогрессе в потоке. Смотрите [этот пример](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_json_each_row_with_progress.ts) для получения более подробной информации.

Полный список входных и выходных форматов ClickHouse доступен [здесь](/interfaces/formats).
## Поддерживаемые типы данных ClickHouse {#supported-clickhouse-data-types}

:::note
Связанный тип JS имеет значение для любых форматов `JSON*`, кроме тех, которые представляют все как строки (например, `JSONStringEachRow`)
:::

| Тип                    | Статус          | Тип JS                      |
|------------------------|-----------------|-----------------------------|
| UInt8/16/32            | ✔️              | number                      |
| UInt64/128/256         | ✔️ ❗- см. ниже  | string                      |
| Int8/16/32             | ✔️              | number                      |
| Int64/128/256          | ✔️ ❗- см. ниже  | string                      |
| Float32/64             | ✔️              | number                      |
| Decimal                | ✔️ ❗- см. ниже  | number                      |
| Boolean                | ✔️              | boolean                     |
| String                 | ✔️              | string                      |
| FixedString            | ✔️              | string                      |
| UUID                   | ✔️              | string                      |
| Date32/64              | ✔️              | string                      |
| DateTime32/64          | ✔️ ❗- см. ниже  | string                      |
| Enum                   | ✔️              | string                      |
| LowCardinality         | ✔️              | string                      |
| Array(T)               | ✔️              | T[]                         |
| (new) JSON             | ✔️              | object                      |
| Variant(T1, T2...)     | ✔️              | T (в зависимости от варианта) |
| Dynamic                | ✔️              | T (в зависимости от варианта) |
| Nested                 | ✔️              | T[]                         |
| Tuple(T1, T2, ...)     | ✔️              | [T1, T2, ...]               |
| Tuple(n1 T1, n2 T2...) | ✔️              | \{ n1: T1; n2: T2; ...\}     |
| Nullable(T)            | ✔️              | Тип JS для T или null       |
| IPv4                   | ✔️              | string                      |
| IPv6                   | ✔️              | string                      |
| Point                  | ✔️              | [ number, number ]          |
| Ring                   | ✔️              | Array&lt;Point\>            |
| Polygon                | ✔️              | Array&lt;Ring\>             |
| MultiPolygon           | ✔️              | Array&lt;Polygon\>          |
| Map(K, V)              | ✔️              | Record&lt;K, V\>            |
| Time/Time64            | ✔️              | string                      |

Полный список поддерживаемых форматов ClickHouse доступен 
[здесь](/sql-reference/data-types/).

Смотрите также: 

- [Работа с примерами Dynamic/Variant/JSON](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/dynamic_variant_json.ts)
- [Работа с примерами Time/Time64](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/time_time64.ts)
### Предупреждения по типам Date/Date32 {#datedate32-types-caveats}

Так как клиент вставляет значения без дополнительного преобразования типов, столбцы типа `Date`/`Date32` могут быть вставлены только как строки.

**Пример:** Вставить значение типа `Date`. 
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/ba387d7f4ce375a60982ac2d99cb47391cf76cec/__tests__/integration/date_time.test.ts)

```ts
await client.insert({
  table: 'my_table',
  values: [ { date: '2022-09-05' } ],
  format: 'JSONEachRow',
})
```

Тем не менее, если вы используете столбцы `DateTime` или `DateTime64`, вы можете использовать как строки, так и объекты даты JS. Объекты даты JS могут быть переданы в `insert` без изменений с установленным `date_time_input_format` в значение `best_effort`. Смотрите [этот пример](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_js_dates.ts) для получения более подробной информации.
### Предупреждения по типам Decimal* {#decimal-types-caveats}

Можно вставлять Decimal с использованием форматов семейства `JSON*`. Предположим, что у нас есть таблица, определенная как:

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

Мы можем вставлять значения без потери точности, используя строковое представление:

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

Однако при запросе данных в форматах `JSON*` ClickHouse по умолчанию будет возвращать Decimals как _числа_, что может привести к потере точности. Чтобы избежать этого, вы можете привести Decimals к строке в запросе:

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

Смотрите [этот пример](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_decimals.ts) для получения более подробной информации.
### Целочисленные типы: Int64, Int128, Int256, UInt64, UInt128, UInt256 {#integral-types-int64-int128-int256-uint64-uint128-uint256}

Хотя сервер может принимать их как числа, они возвращаются как строки в выходных форматах семейства `JSON*`, чтобы избежать переполнения целых чисел, поскольку максимальные значения для этих типов больше, чем `Number.MAX_SAFE_INTEGER`.

Это поведение, однако, может быть изменено с помощью [настройки `output_format_json_quote_64bit_integers`](/operations/settings/formats#output_format_json_quote_64bit_integers).

**Пример:** Настройка формата JSON для 64-битных чисел.

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
## Настройки ClickHouse {#clickhouse-settings}

Клиент может настраивать поведение ClickHouse через [настройки](/operations/settings/settings/).
Настройки могут быть установлены на уровне экземпляра клиента, чтобы они применялись ко всем запросам, отправляемым в ClickHouse:

```ts
const client = createClient({
  clickhouse_settings: {}
})
```

Или настройку можно настроить на уровне запроса:

```ts
client.query({
  clickhouse_settings: {}
})
```

Файл декларации типов со всеми поддерживаемыми настройками ClickHouse можно найти 
[здесь](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/settings.ts).

:::important
Убедитесь, что у пользователя, от имени которого выполняются запросы, достаточно прав для изменения настроек.
:::
## Расширенные темы {#advanced-topics}
### Запросы с параметрами {#queries-with-parameters}

Вы можете создать запрос с параметрами и передать значения из клиентского приложения. Это позволяет избежать форматирования
запроса с конкретными динамическими значениями на стороне клиента.

Отформатируйте запрос как обычно, затем разместите значения, которые вы хотите передать из параметров приложения в запрос в фигурных скобках в следующем формате:

```text
{<name>: <data_type>}
```

где:

- `name` — идентификатор заполнителя.
- `data_type` - [Тип данных](/sql-reference/data-types/) значения параметра приложения.

**Пример:** Запрос с параметрами. 
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

Проверьте https://clickhouse.com/docs/interfaces/cli#cli-queries-with-parameters-syntax для получения дополнительных деталей.
### Сжатие {#compression}

NB: сжатие запросов в настоящее время недоступно в веб-версии. Сжатие ответов работает как обычно. Версия для Node.js поддерживает оба варианта.

Приложения для работы с большими наборами данных по сети могут извлечь выгоду из включения сжатия. В настоящее время поддерживается только `GZIP` с использованием [zlib](https://nodejs.org/docs/latest-v14.x/api/zlib.html).

```typescript
createClient({
  compression: {
    response: true,
    request: true
  }
})
```

Параметры конфигурации:

- `response: true` указывает серверу ClickHouse отвечать с сжатым ответом. Значение по умолчанию: `response: false`
- `request: true` включает сжатие в теле запроса клиента. Значение по умолчанию: `request: false`
### Логирование (только Node.js) {#logging-nodejs-only}

:::important
Логирование является экспериментальной функцией и может измениться в будущем.
:::

Реализация логгера по умолчанию записывает записи журналов в `stdout` через методы `console.debug/info/warn/error`.
Вы можете настроить логику логирования, предоставив класс `LoggerClass`, и выбрать желаемый уровень журнала через параметр `level` (по умолчанию `OFF`):

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

В настоящее время клиент будет регистрировать следующие события:

- `TRACE` - информация низкого уровня о жизненном цикле сокетов Keep-Alive
- `DEBUG` - информация о ответах (без заголовков аутентификации и информации о хосте)
- `INFO` - в основном не используется, будет выводить текущий уровень журнала при инициализации клиента
- `WARN` - нефатальные ошибки; неудачный запрос `ping` регистрируется как предупреждение, так как основанная ошибка включена в возвращаемый результат
- `ERROR` - фатальные ошибки из методов `query`/`insert`/`exec`/`command`, такие как неудачный запрос

Вы можете найти реализацию логгера по умолчанию [здесь](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/logger.ts).
### TLS сертификаты (только Node.js) {#tls-certificates-nodejs-only}

Клиент Node.js опционально поддерживает как базовый (только Сертификат Удостоверяющего Центра)
так и взаимный (Сертификат Удостоверяющего Центра и клиентские сертификаты) TLS.

Пример базовой конфигурации TLS, предполагая, что у вас есть сертификаты в папке `certs`
и файл CA называется `CA.pem`:

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

Пример конфигурации взаимного TLS с использованием клиентских сертификатов:

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

Смотрите полные примеры для [базового](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/basic_tls.ts) и [взаимного](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/mutual_tls.ts) TLS в репозитории.
### Настройка Keep-alive (только Node.js) {#keep-alive-configuration-nodejs-only}

Клиент по умолчанию включает Keep-Alive в подлежащем HTTP-агенте, что означает, что подключенные сокеты будут повторно использоваться для последующих запросов, а заголовок `Connection: keep-alive` будет отправлен. Сокеты, которые находятся в режиме ожидания, будут оставаться в пуле соединений по умолчанию в течение 2500 миллисекунд (см. [заметки об изменении этой опции](./js.md#adjusting-idle_socket_ttl)).

`keep_alive.idle_socket_ttl` должно иметь значение значительно ниже, чем конфигурация сервера/балансировщика нагрузки. Основная причина заключается в том, что из-за HTTP/1.1 сервер может закрывать сокеты без уведомления клиента; если сервер или балансировщик нагрузки закрывает соединение _до_ того, как клиент, клиент может пытаться повторно использовать закрытый сокет, что приведет к ошибке `socket hang up`.

Если вы изменяете `keep_alive.idle_socket_ttl`, имейте в виду, что оно всегда должно быть синхронизировано с вашей конфигурацией Keep-Alive на сервере/балансировщике нагрузки, и оно должно быть **всегда ниже** этого значения, обеспечивая тем самым, что сервер никогда не закрывает открытое соединение первым.
#### Настройка `idle_socket_ttl` {#adjusting-idle_socket_ttl}

Клиент устанавливает `keep_alive.idle_socket_ttl` в 2500 миллисекунд, так как это может считаться самым безопасным значением по умолчанию; на стороне сервера `keep_alive_timeout` может быть установлен [на минимально 3 секунды в версиях ClickHouse до 23.11](https://github.com/ClickHouse/ClickHouse/commit/1685cdcb89fe110b45497c7ff27ce73cc03e82d1) без изменений в `config.xml`.

:::warning
Если вам нравится производительность и вы не испытываете никаких проблем, рекомендуется **не** увеличивать значение настройки `keep_alive.idle_socket_ttl`, так как это может привести к потенциальным ошибкам "Socket hang-up"; кроме того, если ваше приложение отправляет много запросов и между ними нет большого времени простоя, значение по умолчанию должно быть достаточным, так как сокеты не будут находиться в ожидании достаточно долго, и клиент будет поддерживать их в пуле.
:::

Вы можете найти правильное значение таймаута Keep-Alive в заголовках ответа сервера, запустив следующую команду:

```sh
curl -v --data-binary "SELECT 1" <clickhouse_url>
```

Проверьте значения заголовков `Connection` и `Keep-Alive` в ответе. Например:

```text
< Connection: Keep-Alive
< Keep-Alive: timeout=10
```

В данном случае `keep_alive_timeout` составляет 10 секунд, и вы можете попробовать увеличить `keep_alive.idle_socket_ttl` до 9000 или даже 9500 миллисекунд, чтобы держать находящиеся в ожидании сокеты открытыми немного дольше, чем по умолчанию. Следите за потенциальными ошибками "Socket hang-up", которые будут указывать на то, что сервер закрывает соединения раньше клиента, и уменьшайте значение, пока ошибки не исчезнут.
#### Устранение неполадок {#troubleshooting}

Если вы испытываете ошибки `socket hang up`, даже используя последнюю версию клиента, есть несколько вариантов решения этой проблемы:

* Включите логи с уровнем журнала не ниже `WARN`. Это позволит проверить, есть ли в коде приложения неиспользуемый или зависший поток: уровень транспортного слоя будет регистрировать это на уровне WARN, так как это может привести к закрытию сокета сервером. Вы можете включить логирование в конфигурации клиента следующим образом:
  
```ts
const client = createClient({
  log: { level: ClickHouseLogLevel.WARN },
})
```
  
* Проверьте ваш код приложения с включенным правилом ESLint [no-floating-promises](https://typescript-eslint.io/rules/no-floating-promises/), которое поможет выявить необработанные промисы, которые могут привести к зависшим потокам и сокетам.

* Немного уменьшите значение настройки `keep_alive.idle_socket_ttl` в конфигурации сервера ClickHouse. В определенных ситуациях, например, при высокой сетевой задержке между клиентом и сервером, может быть полезно уменьшить `keep_alive.idle_socket_ttl` еще на 200–500 миллисекунд, исключая ситуацию, когда исходящий запрос может получить сокет, который сервер собирается закрыть.

* Если эта ошибка происходит во время длительных запросов без данных, входящих или выходящих (например, длительный `INSERT FROM SELECT`), это может быть связано с тем, что балансировщик нагрузки закрывает неиспользуемые соединения. Вы можете попробовать принудительно передавать некоторые данные во время длительных запросов, используя комбинацию следующих настроек ClickHouse:

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
  Имейте в виду, что общий размер полученных заголовков имеет предел в 16КБ в последних версиях Node.js; после определенного количества полученных заголовков прогресса, которое было около 70-80 в наших тестах, будет сгенерировано исключение.

  Также возможно использовать совершенно другой подход, полностью избегая времени ожидания по сети; это можно сделать, воспользовавшись "функцией" интерфейса HTTP, которая не отменяет мутации, когда соединение потеряно. Смотрите [этот пример (часть 2)](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/long_running_queries_timeouts.ts) для получения более подробной информации.

* Функция Keep-Alive может быть полностью отключена. В этом случае клиент также добавит заголовок `Connection: close` ко всем запросам, и подлежащий HTTP-агент не будет повторно использовать соединения. Настройка `keep_alive.idle_socket_ttl` будет игнорироваться, так как не будет неиспользуемых сокетов. Это приведет к дополнительным накладным расходам, так как для каждого запроса будет устанавливаться новое соединение.

```ts
const client = createClient({
  keep_alive: {
    enabled: false,
  },
})
```
### Права доступа только для чтения {#read-only-users}

При использовании клиента с пользователем [readonly=1](/operations/settings/permissions-for-queries#readonly) компрессия ответов не может быть включена, так как для этого требуется настройка `enable_http_compression`. Следующая конфигурация приведет к ошибке:

```ts
const client = createClient({
  compression: {
    response: true, // won't work with a readonly=1 user
  },
})
```

Смотрите [пример](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/read_only_user.ts) с дополнительными акцентами на ограничениях пользователя readonly=1.
### Прокси с путём {#proxy-with-a-pathname}

Если ваш экземпляр ClickHouse находится за прокси, и у него есть путь в URL, как, например, http://proxy:8123/clickhouse_server, укажите `clickhouse_server` как параметр конфигурации `pathname` (с ведущим слешем или без); в противном случае, если он указан непосредственно в `url`, он будет считаться параметром `database`. Поддерживаются несколько сегментов, например, `/my_proxy/db`.

```ts
const client = createClient({
  url: 'http://proxy:8123',
  pathname: '/clickhouse_server',
})
```
### Обратный прокси с аутентификацией {#reverse-proxy-with-authentication}

Если перед вашим развертыванием ClickHouse есть обратный прокси с аутентификацией, вы можете использовать настройку `http_headers` для предоставления необходимых заголовков:

```ts
const client = createClient({
  http_headers: {
    'My-Auth-Header': '...',
  },
})
```
### Пользовательский HTTP/HTTPS агент (экспериментально, только Node.js) {#custom-httphttps-agent-experimental-nodejs-only}

:::warning
Это экспериментальная функция, которая может измениться в будущем с несовместимыми изменениями. Реализация по умолчанию и настройки, предоставляемые клиентом, должны быть достаточны для большинства случаев использования. Используйте эту функцию только в том случае, если вы уверены, что она вам нужна.
:::

По умолчанию клиент настроит подлежащий HTTP(s) агент, используя настройки, указанные в конфигурации клиента (такие как `max_open_connections`, `keep_alive.enabled`, `tls`), который будет обрабатывать соединения с сервером ClickHouse. Кроме того, если используются TLS сертификаты, подлежащий агент будет настроен с необходимыми сертификатами, и соответствующие заголовки аутентификации TLS будут применены.

После версии 1.2.0 возможно предоставить пользовательский HTTP(s) агент клиенту, заменяя стандартный подлежащий. Это может быть полезно в случае сложности сетевых настроек. Применяются следующие условия, если предоставлен пользовательский агент:
- Опции `max_open_connections` и `tls` не будут иметь _никакого эффекта_ и будут игнорироваться клиентом, так как являются частью конфигурации подлежащего агента.
- `keep_alive.enabled` будет только регулировать значение по умолчанию заголовка `Connection` (`true` -> `Connection: keep-alive`, `false` -> `Connection: close`).
- Хотя управление неиспользуемыми сокетами Keep-Alive по-прежнему будет работать (так как это не привязано к агенту, а к конкретному сокету), теперь его можно полностью отключить, установив значение `keep_alive.idle_socket_ttl` равным `0`.
#### Примеры использования пользовательского агента {#custom-agent-usage-examples}

Использование пользовательского HTTP(s) агента без сертификатов:

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

Использование пользовательского HTTPS агента с базовым TLS и сертификатом CA:

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

Использование пользовательского HTTPS агента с взаимным TLS:

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

При использовании сертификатов _и_ пользовательского _HTTPS_ агента, вероятно, потребуется отключить заголовок авторизации по умолчанию через настройку `set_basic_auth_header` (введенную в 1.2.0), так как он конфликтует с заголовками TLS. Все заголовки TLS должны быть предоставлены вручную.
## Известные ограничения (Node.js/web) {#known-limitations-nodejsweb}

- Нет сопоставителей данных для наборов результатов, используются только примитивы языка. Определённые сопоставители типов данных запланированы с поддержкой [RowBinary формата](https://github.com/ClickHouse/clickhouse-js/issues/216).
- Существуют некоторые [предупреждения по типам Decimal* и Date* / DateTime*](./js.md#datedate32-types-caveats).
- Когда используются форматы семейства JSON*, числа больше Int32 представляются как строки, так как максимальные значения типов Int64+ больше `Number.MAX_SAFE_INTEGER`. См. раздел [Целочисленные типы](./js.md#integral-types-int64-int128-int256-uint64-uint128-uint256) для получения более подробной информации.
## Известные ограничения (web) {#known-limitations-web}

- Потоковая передача для выборок работает, но отключена для вставок (на уровне типов также).
- Сжатие запросов отключено, и конфигурация игнорируется. Сжатие ответов работает.
- Поддержка логирования пока отсутствует.
## Советы по оптимизации производительности {#tips-for-performance-optimizations}

- Для уменьшения потребления памяти приложением рассмотрите возможность использования потоков для больших вставок (например, из файлов) и выборок, когда это возможно. Для слушателей событий и аналогичных сценариев [асинхронные вставки](/optimize/asynchronous-inserts) могут быть еще одной хорошей опцией, позволяя минимизировать или даже полностью избежать пакетной обработки на стороне клиента. Примеры асинхронных вставок доступны в [репозитории клиента](https://github.com/ClickHouse/clickhouse-js/tree/main/examples), с префиксом `async_insert_` в названии файла.
- Клиент по умолчанию не включает сжатие запросов или ответов. Однако при выборке или вставке больших наборов данных вы можете рассмотреть возможность включения его через `ClickHouseClientConfigOptions.compression` (либо только для `request`, либо для `response`, либо для обоих).
- Сжатие имеет значительные потери производительности. Включение его для `request` или `response` негативно скажется на скорости выборок или вставок соответственно, но уменьшит объем сетевого трафика, передаваемого приложением.
## Свяжитесь с нами {#contact-us}

Если у вас есть вопросы или нужна помощь, не стесняйтесь обращаться к нам в [Community Slack](https://clickhouse.com/slack) (канал `#clickhouse-js`) или через [GitHub issues](https://github.com/ClickHouse/clickhouse-js/issues).