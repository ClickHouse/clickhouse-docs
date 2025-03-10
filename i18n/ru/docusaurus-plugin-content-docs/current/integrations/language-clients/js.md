---
sidebar_label: JavaScript
sidebar_position: 4
keywords: [clickhouse, js, JavaScript, NodeJS, web, browser, Cloudflare, workers, client, connect, integrate]
slug: /integrations/javascript
description: Официальный JS-клиент для подключения к ClickHouse.
---
import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

# ClickHouse JS

Официальный JS-клиент для подключения к ClickHouse.  
Клиент написан на TypeScript и предоставляет типы для публичного API клиента.

Он не имеет зависимостей, оптимизирован для максимальной производительности и протестирован с различными версиями и конфигурациями ClickHouse (локальный одиночный узел, локальный кластер и ClickHouse Cloud).

Существует две разные версии клиента для различных сред:
- `@clickhouse/client` - только для Node.js
- `@clickhouse/client-web` - браузеры (Chrome/Firefox), Cloudflare workers

При использовании TypeScript убедитесь, что он не ниже [версии 4.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html), которая позволяет использовать [синтаксис импорта и экспорта в строках](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#type-modifiers-on-import-names).

Исходный код клиента доступен в [репозитории ClickHouse-JS на GitHub](https://github.com/ClickHouse/clickhouse-js).
## Требования к окружению (Node.js) {#environment-requirements-nodejs}

Node.js должен быть доступен в окружении для работы клиента.  
Клиент совместим со всеми [поддерживаемыми](https://github.com/nodejs/release#readme) версиями Node.js.

Как только версия Node.js достигает конца своего жизненного цикла, клиент перестает ее поддерживать, так как она считается устаревшей и небезопасной.

Поддерживаемые версии Node.js:

| Версия Node.js | Поддерживается? |
|----------------|------------------|
| 22.x           | ✔                |
| 20.x           | ✔                |
| 18.x           | ✔                |
| 16.x           | Упорный труд     |
## Требования к окружению (Web) {#environment-requirements-web}

Веб-версия клиента официально тестируется с последними браузерами Chrome/Firefox и может использоваться в качестве зависимости, например, в приложениях React/Vue/Angular или Cloudflare workers.
## Установка {#installation}

Чтобы установить последнюю стабильную версию клиента Node.js, выполните команду:

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
| 1.8.0          | 23.3+      |

Скорее всего, клиент будет работать и с более старыми версиями, но это поддержка на лучших условиях и не гарантируется. Если у вас версия ClickHouse ниже 23.3, пожалуйста, ознакомьтесь с [политикой безопасности ClickHouse](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md) и рассмотрите возможность обновления.
## Примеры {#examples}

Мы стремимся охватить различные сценарии использования клиента в [примерах](https://github.com/ClickHouse/clickhouse-js/blob/main/examples) в репозитории клиента.

Обзор доступен в [README примеров](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/README.md#overview).

Если что-то неясно или отсутствует в примерах или следующей документации, не стесняйтесь [связываться с нами](./js.md#contact-us).
### API клиента {#client-api}

Большинство примеров должны быть совместимы как с Node.js, так и с веб-версиями клиента, если явно не указано иное.
#### Создание экземпляра клиента {#creating-a-client-instance}

Вы можете создать столько экземпляров клиента, сколько необходимо, с помощью фабрики `createClient`:

```ts
import { createClient } from '@clickhouse/client' // или '@clickhouse/client-web'

const client = createClient({
  /* конфигурация */
})
```

Если ваша среда не поддерживает ESM модули, вы можете использовать вместо этого синтаксис CJS:

```ts
const { createClient } = require('@clickhouse/client');

const client = createClient({
  /* конфигурация */
})
```

Экземпляр клиента может быть [предварительно настроен](./js.md#configuration) во время создания.
#### Конфигурация {#configuration}

При создании экземпляра клиента можно настроить следующие параметры подключения:

| Параметр                                                               | Описание                                                                             | Значение по умолчанию      | Смотрите также                                                                                                          |
|------------------------------------------------------------------------|-------------------------------------------------------------------------------------|----------------------------|-------------------------------------------------------------------------------------------------------------------------|
| **url**?: string                                                       | URL-адрес экземпляра ClickHouse.                                                     | `http://localhost:8123`    | [Документация по конфигурации URL](./js.md#url-configuration)                                                           |
| **pathname**?: string                                                  | Дополнительный путь, который будет добавлен к URL ClickHouse после его разбора клиентом. | `''`                       | [Прокси с путем документ](./js.md#proxy-with-a-pathname)                                                                |
| **request_timeout**?: number                                           | Таймаут запроса в миллисекундах.                                                   | `30_000`                   | -                                                                                                                       |
| **compression**?: `{ **response**?: boolean; **request**?: boolean }` | Включить сжатие.                                                                     | -                          | [Документация по сжатию](./js.md#compression)                                                                         |
| **username**?: string                                                  | Имя пользователя, от имени которого выполняются запросы.                            | `default`                  | -                                                                                                                       |
| **password**?: string                                                  | Пароль пользователя.                                                                  | `''`                       | -                                                                                                                       |
| **application**?: string                                               | Имя приложения, использующего клиент Node.js.                                       | `clickhouse-js`            | -                                                                                                                       |
| **database**?: string                                                  | Имя базы данных для использования.                                                   | `default`                  | -                                                                                                                       |
| **clickhouse_settings**?: ClickHouseSettings                           | Настройки ClickHouse, которые будут применены ко всем запросам.                     | `{}`                       | -                                                                                                                       |
| **log**?: `{ **LoggerClass**?: Logger, **level**?: ClickHouseLogLevel }` | Конфигурация внутренних логов клиента.                                               | -                          | [Документация по ведению журнала](./js.md#logging-nodejs-only)                                                        |
| **session_id**?: string                                                | Необязательный идентификатор сессии ClickHouse, который будет отправлен с каждым запросом. | -                          | -                                                                                                                       |
| **keep_alive**?: `{ **enabled**?: boolean }`                           | Включен по умолчанию как в версиях Node.js, так и в веб-версиях.                     | -                          | -                                                                                                                       |
| **http_headers**?: `Record<string, string>`                            | Дополнительные HTTP-заголовки для исходящих запросов ClickHouse.                    | -                          | [Обратный прокси с аутентификацией документация](./js.md#reverse-proxy-with-authentication)                         |
| **roles**?: string \|  string[]                                        | Имена ролей ClickHouse, которые будут прикреплены к исходящим запросам.             | -                          | [Использование ролей с HTTP-интерфейсом](/interfaces/http#setting-role-with-query-parameters)                         |
#### Специфические параметры конфигурации для Node.js {#nodejs-specific-configuration-parameters}

| Параметр                                                               | Описание                                                | Значение по умолчанию | Смотрите также                                                                                                      |
|------------------------------------------------------------------------|--------------------------------------------------------|----------------------|---------------------------------------------------------------------------------------------------------------------|
| **max_open_connections**?: number                                      | Максимальное количество подключенных сокетов для каждого хоста. | `10`                 | -                                                                                                                   |
| **tls**?: `{ **ca_cert**: Buffer, **cert**?: Buffer, **key**?: Buffer }` | Настройка сертификатов TLS.                          | -                    | [Документация по TLS](./js.md#tls-certificates-nodejs-only)                                                      |
| **keep_alive**?: `{ **enabled**?: boolean, **idle_socket_ttl**?: number }` | -                                                      | -                    | [Документация по Keep Alive](./js.md#keep-alive-configuration-nodejs-only)                                         |
| **http_agent**?: http.Agent \| https.Agent <br/><ExperimentalBadge/> | Пользовательский HTTP-агент для клиента.              | -                    | [Документация по HTTP-агенту](./js.md#custom-httphttps-agent-experimental-nodejs-only)                            |
| **set_basic_auth_header**?: boolean <br/><ExperimentalBadge/>         | Установить заголовок `Authorization` с учетными данными базовой аутентификации. | `true`               | [использование этого параметра в документации HTTP-агента](./js.md#custom-httphttps-agent-experimental-nodejs-only) |
### Конфигурация URL {#url-configuration}

:::important
Конфигурация URL _всегда_ перезапишет закодированные значения, и в этом случае будет выведено предупреждение.
:::

Возможно настроить большинство параметров экземпляра клиента с помощью URL. Формат URL: `http[s]://[username:password@]hostname:port[/database][?param1=value1&param2=value2]`. В большинстве случаев имя конкретного параметра отражает его путь в интерфейсе параметров конфигурации, за исключением нескольких случаев. Поддерживаются следующие параметры:

| Параметр                                   | Тип                                               |
|---------------------------------------------|--------------------------------------------------|
| `pathname`                                  | произвольная строка.                            |
| `application_id`                            | произвольная строка.                            |
| `session_id`                                | произвольная строка.                            |
| `request_timeout`                           | неотрицательное число.                          |
| `max_open_connections`                      | неотрицательное число, больше нуля.            |
| `compression_request`                       | boolean. См. ниже (1)                           |
| `compression_response`                      | boolean.                                         |
| `log_level`                                 | допустимые значения: `OFF`, `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`. |
| `keep_alive_enabled`                        | boolean.                                         |
| `clickhouse_setting_*` или `ch_*`           | см. ниже (2)                                    |
| `http_header_*`                             | см. ниже (3)                                    |
| (только для Node.js) `keep_alive_idle_socket_ttl` | неотрицательное число.                          |

- (1) Для boolean допустимые значения `true`/`1` и `false`/`0`. 
- (2) Любой параметр, начинающийся с `clickhouse_setting_` или `ch_`, будет иметь этот префикс удалённым, а оставшаяся часть будет добавлена к `clickhouse_settings` клиента. Например, `?ch_async_insert=1&ch_wait_for_async_insert=1` будет равно:

```ts
createClient({
  clickhouse_settings: {
    async_insert: 1,
    wait_for_async_insert: 1,
  },
})
```

Примечание: boolean значения для `clickhouse_settings` должны передаваться как `1`/`0` в URL.

- (3) Аналогично (2), но для конфигурации `http_header`. Например, `?http_header_x-clickhouse-auth=foobar` будет эквивалентно:

```ts
createClient({
  http_headers: {
    'x-clickhouse-auth': 'foobar',
  },
})
```
### Подключение {#connecting}
#### Соберите свои данные подключения {#gather-your-connection-details}

<ConnectionDetails />
#### Обзор подключения {#connection-overview}

Клиент реализует подключение через протокол HTTP(s). Поддержка RowBinary планируется, см. [связанную проблему](https://github.com/ClickHouse/clickhouse-js/issues/216).

Следующий пример демонстрирует, как настроить подключение к ClickHouse Cloud. Предполагается, что значения `url` (включая протокол и порт) и `password` указаны через переменные окружения, и используется пользователь `default`.

**Пример:** Создание экземпляра клиента Node.js с использованием переменных окружения для конфигурации.

```ts
import { createClient } from '@clickhouse/client'

const client = createClient({
  url: process.env.CLICKHOUSE_HOST ?? 'http://localhost:8123',
  username: process.env.CLICKHOUSE_USER ?? 'default',
  password: process.env.CLICKHOUSE_PASSWORD ?? '',
})
```

Репозиторий клиента содержит множество примеров, которые используют переменные окружения, такие как [создание таблицы в ClickHouse Cloud](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts), [использование асинхронных вставок](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert.ts) и множество других.
#### Пул подключений (только для Node.js) {#connection-pool-nodejs-only}

Чтобы избежать накладных расходов на установление соединения при каждом запросе, клиент создает пул подключений к ClickHouse для повторного использования, используя механизм Keep-Alive. По умолчанию Keep-Alive включен, а размер пула подключений установлен на `10`, но вы можете изменить его с помощью параметра конфигурации `max_open_connections` [опции](./js.md#configuration).  

Нет гарантии, что одно и то же соединение в пуле будет использоваться для последующих запросов, если пользователь не установил `max_open_connections: 1`. Это редко необходимо, но может потребоваться в случаях, когда пользователи используют временные таблицы.

Смотрите также: [Конфигурация Keep-Alive](./js.md#keep-alive-configuration-nodejs-only).
### ID запроса {#query-id}

Каждый метод, который отправляет запрос или оператор (`command`, `exec`, `insert`, `select`), предоставит `query_id` в результате. Этот уникальный идентификатор определяется клиентом для каждого запроса и может быть полезен для извлечения данных из `system.query_log`, если он включен в [конфигурации сервера](/operations/server-configuration-parameters/settings), или для отмены длительных запросов (см. [пример](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/cancel_query.ts)). Если необходимо, `query_id` может быть переопределен пользователем в параметрах методов `command`/`query`/`exec`/`insert`.

:::tip
Если вы переопределяете параметр `query_id`, вам нужно убедиться в его уникальности для каждого вызова. Случайный UUID - хорошее решение.
:::
### Базовые параметры для всех методов клиента {#base-parameters-for-all-client-methods}

Существует несколько параметров, которые могут быть применены ко всем методам клиента ([query](./js.md#query-method)/[command](./js.md#command-method)/[insert](./js.md#insert-method)/[exec](./js.md#exec-method)).

```ts
interface BaseQueryParams {
  // Настройки ClickHouse, которые могут применяться на уровне запроса.
  clickhouse_settings?: ClickHouseSettings
  // Параметры для связывания запросов.
  query_params?: Record<string, unknown>
  // AbortSignal экземпляр для отмены запроса в процессе.
  abort_signal?: AbortSignal
  // переопределение query_id; если не указано, автоматически будет сгенерирован случайный идентификатор.
  query_id?: string
  // переопределение session_id; если не указано, идентификатор сессии будет взят из конфигурации клиента.
  session_id?: string
  // переопределение учетных данных; если не указано, будут использованы учетные данные клиента.
  auth?: { username: string, password: string }
  // Конкретный список ролей для использования в этом запросе. Переопределяет роли, установленные в конфигурации клиента.
  role?: string | Array<string>
}
```
### Метод запроса {#query-method}

Этот метод используется для большинства операторов, которые могут иметь ответ, таких как `SELECT`, или для отправки DDL, таких как `CREATE TABLE`, и его следует ожидать. Ожидается, что возвращаемый набор результатов будет потребляться в приложении.

:::note
Существует специальный метод [insert](./js.md#insert-method) для вставки данных и [command](./js.md#command-method) для DDL.
:::

```ts
interface QueryParams extends BaseQueryParams {
  // Запрос для выполнения, который может возвращать данные.
  query: string
  // Формат результирующего набора данных. По умолчанию: JSON.
  format?: DataFormat
}

interface ClickHouseClient {
  query(params: QueryParams): Promise<ResultSet>
}
```

Смотрите также: [Базовые параметры для всех методов клиента](./js.md#base-parameters-for-all-client-methods).

:::tip
Не указывайте форматный клауз в `query`, используйте вместо этого параметр `format`.
:::
#### Наборы результатов и абстракции строк {#result-set-and-row-abstractions}

`ResultSet` предоставляет несколько удобных методов для обработки данных в вашем приложении.

Реализация `ResultSet` для Node.js использует `Stream.Readable` под капотом, в то время как веб-версия использует Web API `ReadableStream`.

Вы можете потреблять `ResultSet`, вызывая методы `text` или `json` на `ResultSet` и загружая весь набор строк, возвращенный запросом, в память.

Вы должны начинать потребление `ResultSet` как можно скорее, так как он удерживает открытую строчку ответа и, следовательно, поддерживает активным базовое соединение. Клиент не буферизует входные данные, чтобы избежать потенциального чрезмерного использования памяти приложением. 

В качестве альтернативы, если он слишком велик, чтобы поместиться в памяти за один раз, вы можете вызвать метод `stream` и обрабатывать данные в потоковом режиме. Каждый из частей ответа будет преобразован в относительно небольшие массивы строк (размер этого массива зависит от размера конкретного порции, получаемого клиентом от сервера, так как это может варьироваться, и размера отдельных строк), по очереди. 

Пожалуйста, обратитесь к списку [поддерживаемых форматов данных](./js.md#supported-data-formats), чтобы определить, какой формат является наилучшим для потоковой передачи в вашем случае. Например, если вы хотите передавать JSON-объекты, вы можете выбрать [JSONEachRow](/sql-reference/formats#jsoneachrow), и каждая строка будет распознана как объект JS, или, возможно, более компактный формат [JSONCompactColumns](/sql-reference/formats#jsoncompactcolumns), который приведет к тому, что каждая строка будет компактным массивом значений. См. также: [потоковые файлы](./js.md#streaming-files-nodejs-only).

:::important
Если `ResultSet` или его поток не будут полностью потреблены, он будет уничтожен после периода неактивности `request_timeout`.
:::

```ts
interface BaseResultSet<Stream> {
  // Смотрите раздел "ID запроса" выше
  query_id: string

  // Потребляет весь поток и получает содержимое как строку
  // Можно использовать с любым форматом данных
  // Должно вызываться только один раз
  text(): Promise<string>

  // Потребляет весь поток и парсит содержимое как объект JS
  // Можно использовать только с JSON форматами
  // Должно вызываться только один раз
  json<T>(): Promise<T>

  // Возвращает читаемый поток для ответов, которые могут быть проанализированы
  // Каждая итерация потока предоставляет массив Row[] в выбранном формате данных
  // Должно вызываться только один раз
  stream(): Stream
}

interface Row {
  // Получите содержимое строки как обычную строку
  text: string

  // Проанализируйте содержимое строки как объект JS
  json<T>(): T
}
```

**Пример:** (Node.js/Web) Запрос с результирующим набором данных в формате `JSONEachRow`, потребление всего потока и парсинг содержимого как JS объектов.  
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts).

```ts
const resultSet = await client.query({
  query: 'SELECT * FROM my_table',
  format: 'JSONEachRow',
})
const dataset = await resultSet.json() // или `row.text`, чтобы избежать парсинга JSON
```

**Пример:** (Node.js только) Потоковый результат запроса в формате `JSONEachRow`, используя классический подход `on('data')`. Это взаимозаменяемо с синтаксисом `for await const`.  
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row.ts).

```ts
const rows = await client.query({
  query: 'SELECT number FROM system.numbers_mt LIMIT 5',
  format: 'JSONEachRow', // или JSONCompactEachRow, JSONStringsEachRow и тд.
})
const stream = rows.stream()
stream.on('data', (rows: Row[]) => {
  rows.forEach((row: Row) => {
    console.log(row.json()) // или `row.text`, чтобы избежать парсинга JSON
  })
})
await new Promise((resolve, reject) => {
  stream.on('end', () => {
    console.log('Завершено!')
    resolve(0)
  })
  stream.on('error', reject)
})
```

**Пример:** (Node.js только) Потоковый результат запроса в формате `CSV`, используя классический подход `on('data')`. Это взаимозаменяемо с синтаксисом `for await const`.  
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_text_line_by_line.ts).

```ts
const resultSet = await client.query({
  query: 'SELECT number FROM system.numbers_mt LIMIT 5',
  format: 'CSV', // или TabSeparated, CustomSeparated и т.д.
})
const stream = resultSet.stream()
stream.on('data', (rows: Row[]) => {
  rows.forEach((row: Row) => {
    console.log(row.text)
  })
})
await new Promise((resolve, reject) => {
  stream.on('end', () => {
    console.log('Завершено!')
    resolve(0)
  })
  stream.on('error', reject)
})
```

**Пример:** (Node.js только) Потоковый результат запроса как JS объекты в формате `JSONEachRow`, потребляемый с использованием синтаксиса `for await const`. Это взаимозаменяемо с классическим подходом `on('data')`.  
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row_for_await.ts).

```ts
const resultSet = await client.query({
  query: 'SELECT number FROM system.numbers LIMIT 10',
  format: 'JSONEachRow', // или JSONCompactEachRow, JSONStringsEachRow и т.д.
})
for await (const rows of resultSet.stream()) {
  rows.forEach(row => {
    console.log(row.json())
  })
}
```

:::note
Синтаксис `for await const` имеет немного меньше кода, чем подход `on('data')`, но может иметь негативное влияние на производительность.  
Смотрите [это сообщение в репозитории Node.js](https://github.com/nodejs/node/issues/31979) для получения дополнительной информации.
:::

**Пример:** (Только веб) Итерация по `ReadableStream` объектов.

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

Тип возврата минимален, так как мы не ожидаем, что сервер вернет какие-либо данные и сразу же освободит поток ответа.

Если пустой массив был предоставлен методу вставки, оператор вставки не будет отправлен на сервер; вместо этого метод немедленно вернется с `{ query_id: '...', executed: false }`. Если параметр `query_id` не был предоставлен в параметрах метода, он будет пустой строкой в результате, так как возвращение случайного UUID, сгенерированного клиентом, может быть запутанным, поскольку запроса с таким `query_id` не будет в таблице `system.query_log`.

Если оператор вставки был отправлен на сервер, флаг `executed` будет `true`.
#### Метод вставки и потоковая передача в Node.js {#insert-method-and-streaming-in-nodejs}

Он может работать либо с `Stream.Readable`, либо с обычным `Array<T>`, в зависимости от [формата данных](./js.md#supported-data-formats), указанного в методе `insert`. Также смотрите этот раздел о [потоковой передаче файлов](./js.md#streaming-files-nodejs-only).

Метод вставки должен ожидаться (await); однако можно указать входной поток и ожидать операцию `insert` позже, только когда поток завершится (что также разрешит промис `insert`). Это может быть полезно для обработчиков событий и аналогичных сценариев, но обработка ошибок может быть сложной с множеством крайних случаев на стороне клиента. Вместо этого рассмотрите возможность использования [асинхронных вставок](/optimize/asynchronous-inserts), как показано в [этом примере](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert_without_waiting.ts).

:::tip
Если у вас есть пользовательское утверждение INSERT, которое трудно смоделировать с помощью этого метода, рассмотрите возможность использования [метода команд](./js.md#command-method).

Вы можете увидеть, как он используется в примерах [INSERT INTO ... VALUES](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_values_and_functions.ts) или [INSERT INTO ... SELECT](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_from_select.ts).
:::

```ts
interface InsertParams<T> extends BaseQueryParams {
  // Имя таблицы для вставки данных
  table: string
  // Набор данных для вставки.
  values: ReadonlyArray<T> | Stream.Readable
  // Формат набора данных для вставки.
  format?: DataFormat
  // Позволяет указать, в какие колонки будут вставлены данные.
  // - Массив, например, `['a', 'b']` сгенерирует: `INSERT INTO table (a, b) FORMAT DataFormat`
  // - Объект, например, `{ except: ['a', 'b'] }` сгенерирует: `INSERT INTO table (* EXCEPT (a, b)) FORMAT DataFormat`
  // По умолчанию данные вставляются во все колонки таблицы,
  // и сгенерированное утверждение будет: `INSERT INTO table FORMAT DataFormat`.
  columns?: NonEmptyArray<string> | { except: NonEmptyArray<string> }
}
```

Смотрите также: [Базовые параметры для всех методов клиента](./js.md#base-parameters-for-all-client-methods).

:::important
Запрос, отмененный с помощью `abort_signal`, не гарантирует, что вставка данных не произошла, так как сервер мог получить часть потоковых данных до отмены.
:::

**Пример:** (Node.js/Web) Вставка массива значений. 
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts).

```ts
await client.insert({
  table: 'my_table',
  // структура должна соответствовать желаемому формату, JSONEachRow в этом примере
  values: [
    { id: 42, name: 'foo' },
    { id: 42, name: 'bar' },
  ],
  format: 'JSONEachRow',
})
```

**Пример:** (Только Node.js) Вставка потока из CSV файла.
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts). Также смотрите: [потоковая передача файлов](./js.md#streaming-files-nodejs-only).

```ts
await client.insert({
  table: 'my_table',
  values: fs.createReadStream('./path/to/a/file.csv'),
  format: 'CSV',
})
```

**Пример**: Исключение определенных колонок из SQL-выражения вставки.

При заданной такой определении таблицы:

```sql
CREATE OR REPLACE TABLE mytable
(id UInt32, message String)
ENGINE MergeTree()
ORDER BY (id)
```

Вставьте только определенную колонку:

```ts
// Сгенерированное утверждение: INSERT INTO mytable (message) FORMAT JSONEachRow
await client.insert({
  table: 'mytable',
  values: [{ message: 'foo' }],
  format: 'JSONEachRow',
  // `id` значение колонки для этой строки будет равен нулю (по умолчанию для UInt32)
  columns: ['message'],
})
```

Исключите определенные колонки:

```ts
// Сгенерированное утверждение: INSERT INTO mytable (* EXCEPT (message)) FORMAT JSONEachRow
await client.insert({
  table: tableName,
  values: [{ id: 144 }],
  format: 'JSONEachRow',
  // `message` значение колонки для этой строки будет пустой строкой
  columns: {
    except: ['message'],
  },
})
```

Смотрите [исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_exclude_columns.ts) для дополнительных деталей.

**Пример**: Вставка в базу данных, отличную от предоставленной экземпляру клиента. [Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_into_different_db.ts).

```ts
await client.insert({
  table: 'mydb.mytable', // Полное имя, включая базу данных
  values: [{ id: 42, message: 'foo' }],
  format: 'JSONEachRow',
})
```
#### Ограничения веб-версии {#web-version-limitations}

В настоящее время вставки в `@clickhouse/client-web` работают только с `Array<T>` и форматами `JSON*`. 
Потоковая передача не поддерживается в веб-версии из-за плохой совместимости с браузерами.

Соответственно, интерфейс `InsertParams` для веб-версии выглядит немного иначе, чем версия Node.js, 
так как `values` ограничены только типом `ReadonlyArray<T>`:

```ts
interface InsertParams<T> extends BaseQueryParams {
  // Имя таблицы для вставки данных
  table: string
  // Набор данных для вставки.
  values: ReadonlyArray<T>
  // Формат набора данных для вставки.
  format?: DataFormat
  // Позволяет указать, в какие колонки будут вставлены данные.
  // - Массив, например, `['a', 'b']` сгенерирует: `INSERT INTO table (a, b) FORMAT DataFormat`
  // - Объект, например, `{ except: ['a', 'b'] }` сгенерирует: `INSERT INTO table (* EXCEPT (a, b)) FORMAT DataFormat`
  // По умолчанию данные вставляются во все колонки таблицы,
  // и сгенерированное утверждение будет: `INSERT INTO table FORMAT DataFormat`.
  columns?: NonEmptyArray<string> | { except: NonEmptyArray<string> }
}
```

Это может измениться в будущем. Смотрите также: [Базовые параметры для всех методов клиента](./js.md#base-parameters-for-all-client-methods).
### Метод команды {#command-method}

Он может быть использован для утверждений, которые не имеют никакого вывода, когда клаузула формата не применима или когда вы вообще не заинтересованы в ответе. Примером такого утверждения могут быть `CREATE TABLE` или `ALTER TABLE`.

Должен ожидаться.

Поток ответа немедленно уничтожается, что означает, что сокет, на котором он основан, освобождается.

```ts
interface CommandParams extends BaseQueryParams {
  // Утверждение для выполнения.
  query: string
}

interface CommandResult {
  query_id: string
}

interface ClickHouseClient {
  command(params: CommandParams): Promise<CommandResult>
}
```

Смотрите также: [Базовые параметры для всех методов клиента](./js.md#base-parameters-for-all-client-methods).

**Пример:** (Node.js/Web) Создание таблицы в ClickHouse Cloud. 
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts).

```ts
await client.command({
  query: `
    CREATE TABLE IF NOT EXISTS my_cloud_table
    (id UInt64, name String)
    ORDER BY (id)
  `,
  // Рекомендуется для использования в кластере, чтобы избежать ситуаций, когда ошибка обработки запроса произошла после кода ответа, 
  // и HTTP-заголовки были уже отправлены клиенту.
  // Смотрите https://clickhouse.com/docs/interfaces/http/#response-buffering
  clickhouse_settings: {
    wait_end_of_query: 1,
  },
})
```

**Пример:** (Node.js/Web) Создание таблицы в установленном ClickHouse. 
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

**Пример:** (Node.js/Web) ВСТАВКА ИЗ SELECT

```ts
await client.command({
  query: `INSERT INTO my_table SELECT '42'`,
})
```

:::important
Запрос, отмененный с помощью `abort_signal`, не гарантирует, что утверждение не было выполнено сервером.
:::
### Метод exec {#exec-method}

Если у вас есть пользовательский запрос, который не подходит под `query`/`insert`,
и вас интересует результат, вы можете использовать `exec` в качестве альтернативы `command`.

`exec` возвращает читаемый поток, который ДОЛЖЕН быть потреблен или уничтожен на стороне приложения.

```ts
interface ExecParams extends BaseQueryParams {
  // Утверждение для выполнения.
  query: string
}

interface ClickHouseClient {
  exec(params: ExecParams): Promise<QueryResult>
}
```

Смотрите также: [Базовые параметры для всех методов клиента](./js.md#base-parameters-for-all-client-methods).

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

Метод `ping`, предоставленный для проверки состояния подключения, возвращает `true`, если сервер доступен.

Если сервер недоступен, связанная ошибка включена в результат.

```ts
type PingResult =
  | { success: true }
  | { success: false; error: Error }

interface ClickHouseClient {
  ping(): Promise<PingResult>
}
```

Ping может быть полезным инструментом для проверки доступности сервера при запуске приложения, особенно с ClickHouse Cloud, где экземпляр может быть в режиме ожидания и проснется после пинга.

**Пример:** (Node.js/Web) Пинг экземпляра сервера ClickHouse. Обратите внимание: для веб-версии пойманные ошибки будут различаться.
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/ping.ts).

```ts
const result = await client.ping();
if (!result.success) {
  // обработайте result.error
}
```

Обратите внимание: из-за отсутствия реализации CORS для конечной точки `/ping` веб-версия использует простой `SELECT 1`, чтобы достичь аналогичного результата.
### Закрыть (только Node.js) {#close-nodejs-only}

Закрывает все открытые соединения и освобождает ресурсы. Не выполняет никаких действий в веб-версии.

```ts
await client.close()
```
## Потоковая передача файлов (только Node.js) {#streaming-files-nodejs-only}

Существует несколько примеров потоковой передачи файлов с популярными форматами данных (NDJSON, CSV, Parquet) в репозитории клиента.

- [Потоковая передача из файла NDJSON](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_ndjson.ts)
- [Потоковая передача из файла CSV](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts)
- [Потоковая передача из файла Parquet](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_parquet.ts)
- [Потоковая передача в файл Parquet](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts)

Потоковая передача других форматов в файл должна быть аналогична Parquet, 
единственное отличие будет в формате, используемом для вызова `query` (`JSONEachRow`, `CSV` и т. д.) и имени выходного файла.
## Поддерживаемые форматы данных {#supported-data-formats}

Клиент обрабатывает форматы данных как JSON или текст.

Если вы указываете `format` как один из форматов семейства JSON (`JSONEachRow`, `JSONCompactEachRow` и т. д.), клиент будет сериализовать и десериализовать данные в процессе передачи.

Данные, предоставленные в "сыром" текстовом формате (семейства `CSV`, `TabSeparated` и `CustomSeparated`), отправляются без дополнительных преобразований.

:::tip
Может возникнуть путаница между JSON как общим форматом и [форматом JSON ClickHouse](/sql-reference/formats#json). 

Клиент поддерживает потоковую передачу JSON объектов с форматами, такими как [JSONEachRow](/sql-reference/formats#jsoneachrow) (смотрите обзор таблицы для других форматов, благоприятствующих потоковой передаче; также смотрите примеры `select_streaming_` в репозитории клиента [здесь](https://github.com/ClickHouse/clickhouse-js/tree/main/examples/node)). 

Только форматы, такие как [ClickHouse JSON](/sql-reference/formats#json) и несколько других, представлены в виде единого объекта в ответе и не могут быть переданы клиентом в потоке.
:::

| Формат                                     | Ввод (массив) | Ввод (объект) | Ввод/вывод (Поток) | Вывод (JSON) | Вывод (текст)  |
|--------------------------------------------|---------------|----------------|---------------------|---------------|----------------|
| JSON                                       | ❌             | ✔️             | ❌                   | ✔️            | ✔️             |
| JSONCompact                                | ❌             | ✔️             | ❌                   | ✔️            | ✔️             |
| JSONObjectEachRow                          | ❌             | ✔️             | ❌                   | ✔️            | ✔️             |
| JSONColumnsWithMetadata                    | ❌             | ✔️             | ❌                   | ✔️            | ✔️             |
| JSONStrings                                | ❌             | ❌              | ❌                   | ✔️            | ✔️             |
| JSONCompactStrings                         | ❌             | ❌              | ❌                   | ✔️            | ✔️             |
| JSONEachRow                                | ✔️            | ❌              | ✔️                    | ✔️            | ✔️             |
| JSONEachRowWithProgress                    | ❌             | ❌              | ✔️ ❗- см. ниже      | ✔️            | ✔️             |
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
| Parquet                                    | ❌             | ❌              | ✔️                    | ❌             | ✔️❗- см. ниже |

Для Parquet основной сценарий использования для выборок, вероятно, будет запись результирующего потока в файл. Смотрите [пример](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts) в репозитории клиента.

`JSONEachRowWithProgress` - это формат только для вывода, который поддерживает отчетность о прогрессе в потоке. Смотрите [этот пример](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_json_each_row_with_progress.ts) для получения дополнительных сведений.

Полный список входных и выходных форматов ClickHouse доступен 
[здесь](/interfaces/formats).
## Поддерживаемые типы данных ClickHouse {#supported-clickhouse-data-types}

:::note
Связанный тип JS актуален для всех форматов `JSON*`, кроме тех, которые представляют все в виде строки (например, `JSONStringEachRow`)
:::

| Тип               | Статус          | Тип JS                    |
|--------------------|-----------------|----------------------------|
| UInt8/16/32        | ✔️              | number                     |
| UInt64/128/256     | ✔️ ❗- см. ниже | string                     |
| Int8/16/32         | ✔️              | number                     |
| Int64/128/256      | ✔️ ❗- см. ниже | string                     |
| Float32/64         | ✔️              | number                     |
| Decimal            | ✔️ ❗- см. ниже | number                     |
| Boolean            | ✔️              | boolean                    |
| String             | ✔️              | string                     |
| FixedString        | ✔️              | string                     |
| UUID               | ✔️              | string                     |
| Date32/64          | ✔️              | string                     |
| DateTime32/64      | ✔️ ❗- см. ниже | string                     |
| Enum               | ✔️              | string                     |
| LowCardinality     | ✔️              | string                     |
| Array(T)           | ✔️              | T[]                        |
| (новый) JSON       | ✔️              | object                     |
| Variant(T1, T2...) | ✔️              | T (зависит от варианта)  |
| Dynamic            | ✔️              | T (зависит от варианта)  |
| Nested             | ✔️              | T[]                        |
| Tuple              | ✔️              | Tuple                      |
| Nullable(T)        | ✔️              | Тип JS для T или null      |
| IPv4               | ✔️              | string                     |
| IPv6               | ✔️              | string                     |
| Point              | ✔️              | [ number, number ]         |
| Ring               | ✔️              | Array&lt;Point\>              |
| Polygon            | ✔️              | Array&lt;Ring\>               |
| MultiPolygon       | ✔️              | Array&lt;Polygon\>            |
| Map(K, V)          | ✔️              | Record&lt;K, V\>              |

Полный список поддерживаемых форматов ClickHouse доступен 
[здесь](/sql-reference/data-types/).
### Предостережения по типам Date/Date32 {#datedate32-types-caveats}

Поскольку клиент вставляет значения без дополнительного преобразования типов, столбцы типов `Date`/`Date32` могут быть вставлены только как строки.

**Пример:** Вставка значения типа `Date`. 
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/ba387d7f4ce375a60982ac2d99cb47391cf76cec/__tests__/integration/date_time.test.ts).

```ts
await client.insert({
  table: 'my_table',
  values: [ { date: '2022-09-05' } ],
  format: 'JSONEachRow',
})
```

Тем не менее, если вы используете столбцы `DateTime` или `DateTime64`, вы можете использовать как строки, так и объекты Date JS. Объекты Date JS могут быть переданы в `insert` как есть с установленным `date_time_input_format` на `best_effort`. Смотрите этот [пример](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_js_dates.ts) для получения дополнительных сведений.
### Предостережения по типам Decimal* {#decimal-types-caveats}

Можно вставлять Decimals, используя форматы семейства `JSON*`. Предположим, у нас есть таблица, определенная как:

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

Мы можем вставить значения без потери точности, используя строковое представление:

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

Однако, при запросе данных в форматах `JSON*` ClickHouse вернет Decimals как _числа_ по умолчанию, что может привести к потере точности. Чтобы избежать этого, вы можете привести Decimals к строкам в запросе:

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

Смотрите [этот пример](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_decimals.ts) для получения дополнительных сведений.
### Целочисленные типы: Int64, Int128, Int256, UInt64, UInt128, UInt256 {#integral-types-int64-int128-int256-uint64-uint128-uint256}

Хотя сервер может принимать их как числа, они возвращаются как строки в форматах выходных данных семейства `JSON*`, чтобы избежать
переполнения целых чисел, так как максимальные значения для этих типов больше, чем `Number.MAX_SAFE_INTEGER`.

Тем не менее, это поведение может быть изменено с помощью [`output_format_json_quote_64bit_integers` настройки](/operations/settings/formats#output_format_json_quote_64bit_integers)
.

**Пример:** Настройка формата JSON для вывода 64-битных чисел.

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

Клиент может настраивать поведение ClickHouse с помощью механизма [настроек](/operations/settings/settings/).
Настройки могут быть установлены на уровне экземпляра клиента, чтобы они применялись к каждому запросу, отправленному в ClickHouse:

```ts
const client = createClient({
  clickhouse_settings: {}
})
```

Или настройка может быть настроена на уровне запроса:

```ts
client.query({
  clickhouse_settings: {}
})
```

Файл определения типов, содержащий все поддерживаемые настройки ClickHouse, можно найти 
[здесь](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/settings.ts).

:::important
Убедитесь, что у пользователя, от имени которого выполняются запросы, достаточно прав для изменения настроек.
:::
## Расширенные темы {#advanced-topics}
### Запросы с параметрами {#queries-with-parameters}

Вы можете создать запрос с параметрами и передать значения от клиентского приложения. Это позволяет избежать форматирования
запроса с конкретными динамическими значениями на стороне клиента.

Форматируйте запрос, как обычно, затем поместите значения, которые вы хотите передать из приложения, в фигурные скобки в
следующем формате:

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

Смотрите https://clickhouse.com/docs/interfaces/cli#cli-queries-with-parameters-syntax для получения дополнительных сведений.
### Сжатие {#compression}

Обратите внимание: сжатие запросов в настоящее время недоступно в веб-версии. Ответное сжатие работает как обычно. Версия Node.js поддерживает оба.

Приложения для работы с большими наборами данных через сеть могут получить выгоду от включения сжатия. В настоящее время поддерживается только `GZIP`, используя [zlib](https://nodejs.org/docs/latest-v14.x/api/zlib.html).

```typescript
createClient({
  compression: {
    response: true,
    request: true
  }
})
```

Параметры конфигурации:

- `response: true` указывает серверу ClickHouse отвечать с сжатым телом ответа. Значение по умолчанию: `response: false`
- `request: true` включает сжатие тела запроса клиента. Значение по умолчанию: `request: false`
### Логирование (только Node.js) {#logging-nodejs-only}

:::important
Логирование является экспериментальной функцией и может измениться в будущем.
:::

Реализация по умолчанию генерирует записи журналов в `stdout` с помощью методов `console.debug/info/warn/error`.
Вы можете настроить логику логирования, предоставив `LoggerClass`, и выбрать желаемый уровень журнала через параметр `level` (по умолчанию `OFF`):

```typescript
import type { Logger } from '@clickhouse/client'

// Все три типа LogParams экспортируются клиентом
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

В настоящее время клиент будет записывать следующие события:

- `TRACE` - информация низкого уровня о жизненном цикле сокетов Keep-Alive
- `DEBUG` - информация о ответе (без заголовков авторизации и информации о хосте)
- `INFO` - в основном не используется, выводит текущий уровень журнала при инициализации клиента
- `WARN` - нефатальные ошибки; неудачный запрос `ping` записывается как предупреждение, так как связанная ошибка включена в возвращаемый результат
- `ERROR` - фатальные ошибки из методов `query`/`insert`/`exec`/`command`, такие как неудачный запрос

Вы можете найти реализацию по умолчанию для Logger [здесь](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/logger.ts).
### TLS-сертификаты (только Node.js) {#tls-certificates-nodejs-only}

Клиент Node.js дополнительно поддерживает как базовый (только удостоверяющий центр),
так и взаимный (удостоверяющий центр и клиентские сертификаты) TLS.

Пример базовой конфигурации TLS, предполагая, что у вас есть сертификаты в папке `certs`
и файл CA называется `CA.pem`:

```ts
const client = createClient({
  url: 'https://<hostname>:<port>',
  username: '<username>',
  password: '<password>', // если требуется
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
### Настройка Keep-Alive (только Node.js) {#keep-alive-configuration-nodejs-only}

Клиент по умолчанию включает Keep-Alive в основном HTTP-агенте, что означает, что подключенные сокеты будут повторно использоваться для последующих запросов, и заголовок `Connection: keep-alive` будет отправлен. Сокеты, находящиеся в режиме ожидания, останутся в пуле соединений на 2500 миллисекунд по умолчанию (см. [замечания о настройке этой опции](./js.md#adjusting-idle_socket_ttl)).

`keep_alive.idle_socket_ttl` должен иметь значение, значительно меньшее, чем конфигурация сервера/LB. Основная причина в том, что в HTTP/1.1 сервер может закрыть сокеты без уведомления клиента; если сервер или балансировщик нагрузки закроют соединение _до_ того, как клиент, клиент может попытаться повторно использовать закрытый сокет, что приведет к ошибке `socket hang up`.

Если вы изменяете `keep_alive.idle_socket_ttl`, учтите, что он всегда должен быть согласован с вашей конфигурацией Keep-Alive сервера/LB, и он должен быть **всегда ниже**, чтобы обеспечить, чтобы сервер никогда не закрывал открытое соединение первым.
#### Корректировка `idle_socket_ttl` {#adjusting-idle_socket_ttl}

Клиент устанавливает `keep_alive.idle_socket_ttl` на 2500 миллисекунд, так как это можно считать самым безопасным значением по умолчанию; на стороне сервера `keep_alive_timeout` может быть установлен [настолько низко как 3 секунды в версиях ClickHouse до 23.11](https://github.com/ClickHouse/ClickHouse/commit/1685cdcb89fe110b45497c7ff27ce73cc03e82d1) без изменений в `config.xml`.

:::warning
Если вас устраивает производительность и вы не испытываете никаких проблем, рекомендуется **не** увеличивать значение настройки `keep_alive.idle_socket_ttl`, так как это может привести к потенциальным ошибкам "Socket hang-up"; кроме того, если ваше приложение отправляет много запросов и между ними не так много времени простоя, значение по умолчанию должно быть достаточным, поскольку сокеты не будут достаточно долго бездействовать, и клиент будет удерживать их в пуле.
:::

Вы можете найти правильное значение таймаута Keep-Alive в заголовках ответа сервера, выполнив следующую команду:

```sh
curl -v --data-binary "SELECT 1" <clickhouse_url>
```

Проверьте значения заголовков `Connection` и `Keep-Alive` в ответе. Например:

```text
< Connection: Keep-Alive
< Keep-Alive: timeout=10
```

В этом случае `keep_alive_timeout` составляет 10 секунд, и вы можете попробовать увеличить `keep_alive.idle_socket_ttl` до 9000 или даже 9500 миллисекунд, чтобы поддерживать сокеты в режиме ожидания открытыми немного дольше, чем по умолчанию. Следите за потенциальными ошибками "Socket hang-up", которые укажут на то, что сервер закрывает соединения раньше, чем клиент, и снижайте значение, пока ошибки не исчезнут.
```yaml
title: 'Устранение неполадок Keep-Alive'
sidebar_label: 'Устранение неполадок Keep-Alive'
keywords: ['Keep-Alive', 'socket hang up', 'ClickHouse']
description: 'Инструкции по устранению неполадок, связанных с использованием Keep-Alive в ClickHouse.'
```

#### Устранение неполадок Keep-Alive {#keep-alive-troubleshooting}

Если вы сталкиваетесь с ошибками `socket hang up` при использовании Keep-Alive, рассмотрите следующие варианты для решения этой проблемы:

* Немного уменьшите значение настройки `keep_alive.idle_socket_ttl` в конфигурации сервера ClickHouse. В некоторых ситуациях, например, при высокой сетевой задержке между клиентом и сервером, может быть полезно уменьшить `keep_alive.idle_socket_ttl` еще на 200-500 миллисекунд, исключив ситуацию, когда исходящий запрос может получить сокет, который сервер собирается закрыть.

* Если эта ошибка возникает во время длительных запросов, когда нет данных, поступающих внутрь или наружу (например, длительный `INSERT FROM SELECT`), это может быть связано с тем, что балансировщик нагрузки закрывает неактивные соединения. Вы можете попробовать заставить некоторые данные поступать во время длительных запросов, используя комбинацию следующих настроек ClickHouse:

  ```ts
  const client = createClient({
    // Здесь мы предполагаем, что у нас будут запросы с временем выполнения более 5 минут
    request_timeout: 400_000,
    /** Эти настройки в комбинации позволяют избежать проблем со временем ожидания LB в случае длительных запросов без поступления данных,
     *  таких как `INSERT FROM SELECT` и подобные, так как соединение может быть помечено как неактивное LB и закрыто резко.
     *  В этом случае мы предполагаем, что LB имеет тайм-аут неактивного соединения 120 секунд, поэтому устанавливаем 110 секунд как "безопасное" значение. */
    clickhouse_settings: {
      send_progress_in_http_headers: 1,
      http_headers_progress_interval_ms: '110000', // UInt64, должен передаваться как строка
    },
  })
  ```
  Тем не менее, учтите, что общий размер полученных заголовков имеет лимит в 16КБ в недавних версиях Node.js; после определенного количества полученных заголовков прогресса, которое в наших тестах составило около 70-80, будет сгенерировано исключение.

  Также возможно использовать совершенно другой подход, полностью избегая времени ожидания на сети; это может быть сделано с помощью "функции" HTTP интерфейса, что мутации не отменяются, когда соединение потеряно. Смотрите [этот пример (часть 2)](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/long_running_queries_timeouts.ts) для получения дополнительных подробностей.

* Функцию Keep-Alive можно отключить полностью. В этом случае клиент также добавит заголовок `Connection: close` к каждому запросу, и нижележащий HTTP-агент не будет повторно использовать соединения. Настройка `keep_alive.idle_socket_ttl` будет игнорироваться, так как не будет неактивных сокетов. Это приведет к дополнительным накладным расходам, так как для каждого запроса будет устанавливаться новое соединение.

  ```ts
  const client = createClient({
    keep_alive: {
      enabled: false,
    },
  })
  ```

### Пользователи только для чтения {#read-only-users}

При использовании клиента с [readonly=1 пользователем](/operations/settings/permissions-for-queries#readonly) сжатие ответа нельзя включить, так как это требует настройки `enable_http_compression`. Следующая конфигурация приведет к ошибке:

```ts
const client = createClient({
  compression: {
    response: true, // не будет работать с readonly=1 пользователем
  },
})
```

Смотрите [пример](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/read_only_user.ts), который содержит больше информации о ограничениях пользователя readonly=1.

### Прокси с путём {#proxy-with-a-pathname}

Если ваш экземпляр ClickHouse находится за прокси и в URL есть путь, например, http://proxy:8123/clickhouse_server, укажите `clickhouse_server` как параметр конфигурации `pathname` (с или без ведущего слэша); в противном случае, если он предоставлен напрямую в `url`, он будет считаться параметром `database`. Поддерживаются несколько сегментов, например, `/my_proxy/db`.

```ts
const client = createClient({
  url: 'http://proxy:8123',
  pathname: '/clickhouse_server',
})
```

### Обратный прокси с аутентификацией {#reverse-proxy-with-authentication}

Если у вас есть обратный прокси с аутентификацией перед вашим развертыванием ClickHouse, вы можете использовать настройку `http_headers`, чтобы предоставить необходимые заголовки:

```ts
const client = createClient({
  http_headers: {
    'My-Auth-Header': '...',
  },
})
```

### Пользовательский HTTP/HTTPS-агент (экспериментально, только Node.js) {#custom-httphttps-agent-experimental-nodejs-only}

:::warning
Это экспериментальная функция, которая может измениться в обратном несовместимом виде в будущих релизах. Стандартная реализация и настройки, предоставляемые клиентом, должны быть достаточно для большинства случаев использования. Используйте эту функцию только если вы уверены, что она вам нужна.
:::

По умолчанию, клиент будет настраивать нижележащий HTTP(s) агент, используя настройки, предоставленные в конфигурации клиента (такие как `max_open_connections`, `keep_alive.enabled`, `tls`), который будет обрабатывать соединения с сервером ClickHouse. Кроме того, если используются TLS сертификаты, нижележащий агент будет настроен с необходимыми сертификатами, и правильные заголовки аутентификации TLS будут применены.

После версии 1.2.0, возможно предоставить пользовательский HTTP(s) агент клиенту, заменяя стандартный нижележащий. Это может быть полезно в случае сложных сетевых конфигураций. Если предоставлен пользовательский агент, действуют следующие условия:
- Опции `max_open_connections` и `tls` не будут оказывать _никакого эффекта_ и будут игнорироваться клиентом, так как это часть конфигурации нижележащего агента.
- `keep_alive.enabled` будет регулировать лишь стандартное значение заголовка `Connection` (`true` -> `Connection: keep-alive`, `false` -> `Connection: close`).
- В то время как управление неактивными сокетами keep-alive все еще будет работать (так как оно не связано с агентом, а с конкретным сокетом), теперь возможно полностью отключить его, установив значение `keep_alive.idle_socket_ttl` в `0`.

#### Примеры использования пользовательского агента {#custom-agent-usage-examples}

Использование пользовательского HTTP(s) агента без сертификатов:

```ts
const agent = new http.Agent({ // или https.Agent
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
  // С пользователем HTTPS агентом клиент не будет использовать стандартную реализацию HTTPS соединения; заголовки должны быть предоставлены вручную
  http_headers: {
    'X-ClickHouse-User': 'username',
    'X-ClickHouse-Key': 'password',
  },
  // Важно: заголовок аутентификации конфликтует с заголовками TLS; отключите его.
  set_basic_auth_header: false,
})
```

Использование пользовательского HTTPS агента с взаимной TLS:

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
  // С пользовательским HTTPS агентом клиент не будет использовать стандартную реализацию HTTPS соединения; заголовки должны быть предоставлены вручную
  http_headers: {
    'X-ClickHouse-User': 'username',
    'X-ClickHouse-Key': 'password',
    'X-ClickHouse-SSL-Certificate-Auth': 'on',
  },
  // Важно: заголовок аутентификации конфликтует с заголовками TLS; отключите его.
  set_basic_auth_header: false,
})
```

С сертификатами _и_ пользовательским _HTTPS_ агентом, вероятно, необходимо отключить стандартный заголовок аутентификации через настройку `set_basic_auth_header` (введена в 1.2.0), так как она конфликтует с заголовками TLS. Все заголовки TLS должны быть предоставлены вручную.

## Известные ограничения (Node.js/Веб) {#known-limitations-nodejsweb}

- Нет мапперов данных для наборов результатов, поэтому используются только примитивы языка. Определенные мапперы типов данных запланированы с [поддержкой формата RowBinary](https://github.com/ClickHouse/clickhouse-js/issues/216).
- Есть некоторые [особенности типов данных Decimal* и Date* / DateTime*](./js.md#datedate32-types-caveats).
- При использовании форматов семейства JSON* числа, большие чем Int32, представляются как строки, так как максимальные значения типов Int64+ больше, чем `Number.MAX_SAFE_INTEGER`. Смотрите раздел [Целые типы](./js.md#integral-types-int64-int128-int256-uint64-uint128-uint256) для получения дополнительных подробностей.

## Известные ограничения (Веб) {#known-limitations-web}

- Потоковая передача для запросов select работает, но отключена для вставок (на уровне типа тоже).
- Сжатие запроса отключено, и конфигурация игнорируется. Сжатие ответа работает.
- Поддержка журналирования пока отсутствует.

## Советы по оптимизации производительности {#tips-for-performance-optimizations}

- Для снижения потребления памяти приложением рассмотрите возможность использования потоков для больших вставок (например, из файлов) и выборок, когда это применимо. Для обработчиков событий и похожих случаев, [асинхронные вставки](/optimize/asynchronous-inserts) могут быть еще одним хорошим вариантом, позволяя минимизировать, или даже полностью избежать пакетирования на стороне клиента. Примеры асинхронных вставок доступны в [репозитории клиента](https://github.com/ClickHouse/clickhouse-js/tree/main/examples), с префиксом имени файла `async_insert_`.
- Клиент по умолчанию не включает сжатие запросов или ответов. Тем не менее, при выборе или вставке больших наборов данных вы можете рассмотреть возможность его включения через `ClickHouseClientConfigOptions.compression` (либо только для `request`, либо для `response`, либо для обоих).
- Сжатие имеет значительный штраф по производительности. Включение его для `request` или `response` негативно повлияет на скорость выборок или вставок соответственно, но уменьшит объем сетевого трафика, передаваемого приложением.

## Связаться с нами {#contact-us}

Если у вас есть вопросы или вам нужна помощь, не стесняйтесь обращаться к нам в [Community Slack](https://clickhouse.com/slack) (канал `#clickhouse-js`) или через [GitHub issues](https://github.com/ClickHouse/clickhouse-js/issues).
