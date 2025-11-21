---
sidebar_label: 'JavaScript'
sidebar_position: 4
keywords: ['clickhouse', 'js', 'JavaScript', 'NodeJS', 'web', 'browser', 'Cloudflare', 'workers', 'client', 'connect', 'integrate']
slug: /integrations/javascript
description: 'Официальный JS‑клиент для подключения к ClickHouse.'
title: 'ClickHouse JS'
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'language_client'
  - website: 'https://github.com/ClickHouse/clickhouse-js'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# ClickHouse JS

Официальный JS‑клиент для подключения к ClickHouse.
Клиент написан на TypeScript и предоставляет типы для публичного API клиента.

У него нет зависимостей, он оптимизирован для максимальной производительности и протестирован с различными версиями и конфигурациями ClickHouse (отдельный on‑premise‑узел, on‑premise‑кластер и ClickHouse Cloud).

Доступны две разные версии клиента для различных сред:
- `@clickhouse/client` — только Node.js
- `@clickhouse/client-web` — браузеры (Chrome/Firefox), Cloudflare Workers

При использовании TypeScript убедитесь, что его версия не ниже [4.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html), в которой появился [синтаксис встроенных import и export](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#type-modifiers-on-import-names).

Исходный код клиента доступен в [репозитории ClickHouse-JS на GitHub](https://github.com/ClickHouse/clickhouse-js).



## Требования к окружению (node.js) {#environment-requirements-nodejs}

Для работы клиента в окружении должен быть установлен Node.js.
Клиент совместим со всеми [поддерживаемыми](https://github.com/nodejs/release#readme) релизами Node.js.

Как только версия Node.js достигает статуса End-Of-Life, клиент прекращает её поддержку, так как она считается устаревшей и небезопасной.

Поддержка текущих версий Node.js:

| Версия Node.js | Поддерживается?  |
| --------------- | ----------- |
| 22.x            | ✔          |
| 20.x            | ✔          |
| 18.x            | ✔          |
| 16.x            | В меру возможностей |


## Требования к окружению (веб) {#environment-requirements-web}

Веб-версия клиента официально протестирована с последними версиями браузеров Chrome и Firefox и может использоваться в качестве зависимости, например, в приложениях React/Vue/Angular или в Cloudflare Workers.


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
| -------------- | ---------- |
| 1.12.0         | 24.8+      |

Вероятно, клиент будет работать и со старыми версиями, однако это поддержка в режиме «как есть» и не гарантируется. Если вы используете версию ClickHouse старше 23.3, ознакомьтесь с [политикой безопасности ClickHouse](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md) и рассмотрите возможность обновления.


## Примеры {#examples}

Мы стремимся охватить различные сценарии использования клиента с помощью [примеров](https://github.com/ClickHouse/clickhouse-js/blob/main/examples) в репозитории клиента.

Обзор доступен в [README примеров](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/README.md#overview).

Если что-то неясно или отсутствует в примерах или в документации ниже, обращайтесь к нам [напрямую](./js.md#contact-us).

### API клиента {#client-api}

Большинство примеров совместимы как с Node.js, так и с веб-версией клиента, если явно не указано иное.

#### Создание экземпляра клиента {#creating-a-client-instance}

Вы можете создать любое необходимое количество экземпляров клиента с помощью фабрики `createClient`:

```ts
import { createClient } from "@clickhouse/client" // or '@clickhouse/client-web'

const client = createClient({
  /* конфигурация */
})
```

Если ваша среда не поддерживает модули ESM, можно использовать синтаксис CJS:

```ts
const { createClient } = require("@clickhouse/client")

const client = createClient({
  /* конфигурация */
})
```

Экземпляр клиента может быть [предварительно настроен](./js.md#configuration) при создании.

#### Конфигурация {#configuration}

При создании экземпляра клиента можно настроить следующие параметры подключения:

| Параметр                                                                 | Описание                                                                            | Значение по умолчанию   | См. также                                                                                  |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------ |
| **url**?: string                                                         | URL экземпляра ClickHouse.                                                          | `http://localhost:8123` | [Документация по конфигурации URL](./js.md#url-configuration)                              |
| **pathname**?: string                                                    | Необязательный путь для добавления к URL ClickHouse после его разбора клиентом.     | `''`                    | [Документация по прокси с путем](./js.md#proxy-with-a-pathname)                            |
| **request_timeout**?: number                                             | Тайм-аут запроса в миллисекундах.                                                   | `30_000`                | -                                                                                          |
| **compression**?: `{ **response**?: boolean; **request**?: boolean }`    | Включить сжатие.                                                                    | -                       | [Документация по сжатию](./js.md#compression)                                              |
| **username**?: string                                                    | Имя пользователя, от имени которого выполняются запросы.                            | `default`               | -                                                                                          |
| **password**?: string                                                    | Пароль пользователя.                                                                | `''`                    | -                                                                                          |
| **application**?: string                                                 | Имя приложения, использующего клиент Node.js.                                       | `clickhouse-js`         | -                                                                                          |
| **database**?: string                                                    | Имя используемой базы данных.                                                       | `default`               | -                                                                                          |
| **clickhouse_settings**?: ClickHouseSettings                             | Настройки ClickHouse, применяемые ко всем запросам.                                 | `{}`                    | -                                                                                          |
| **log**?: `{ **LoggerClass**?: Logger, **level**?: ClickHouseLogLevel }` | Конфигурация внутреннего логирования клиента.                                       | -                       | [Документация по логированию](./js.md#logging-nodejs-only)                                 |
| **session_id**?: string                                                  | Необязательный идентификатор сессии ClickHouse для отправки с каждым запросом.      | -                       | -                                                                                          |
| **keep_alive**?: `{ **enabled**?: boolean }`                             | Включено по умолчанию как в Node.js, так и в веб-версии.                            | -                       | -                                                                                          |
| **http_headers**?: `Record<string, string>`                              | Дополнительные HTTP-заголовки для исходящих запросов к ClickHouse.                  | -                       | [Документация по обратному прокси с аутентификацией](./js.md#reverse-proxy-with-authentication) |
| **roles**?: string \| string[]                                           | Имя (имена) ролей ClickHouse для присоединения к исходящим запросам.                | -                       | [Использование ролей с HTTP-интерфейсом](/interfaces/http#setting-role-with-query-parameters) |

#### Параметры конфигурации, специфичные для Node.js {#nodejs-specific-configuration-parameters}


| Настройка                                                                  | Описание                                                    | Значение по умолчанию | См. также                                                                                            |
| -------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------- |
| **max_open_connections**?: number                                          | Максимальное количество разрешенных подключенных сокетов на хост.    | `10`          | -                                                                                                    |
| **tls**?: `{ **ca_cert**: Buffer, **cert**?: Buffer, **key**?: Buffer }`   | Настройка TLS-сертификатов.                                 | -             | [Документация по TLS](./js.md#tls-certificates-nodejs-only)                                                     |
| **keep_alive**?: `{ **enabled**?: boolean, **idle_socket_ttl**?: number }` | -                                                           | -             | [Документация по Keep Alive](./js.md#keep-alive-configuration-nodejs-only)                                      |
| **http_agent**?: http.Agent \| https.Agent <br/><ExperimentalBadge/>       | Пользовательский HTTP-агент для клиента.                           | -             | [Документация по HTTP-агенту](./js.md#custom-httphttps-agent-experimental-nodejs-only)                           |
| **set_basic_auth_header**?: boolean <br/><ExperimentalBadge/>              | Установка заголовка `Authorization` с учетными данными базовой аутентификации. | `true`        | [использование этой настройки в документации по HTTP-агенту](./js.md#custom-httphttps-agent-experimental-nodejs-only) |

### Конфигурация URL {#url-configuration}

:::important
Конфигурация URL _всегда_ перезаписывает жестко заданные значения, и в этом случае будет записано предупреждение в лог.
:::

Большинство параметров экземпляра клиента можно настроить с помощью URL. Формат URL: `http[s]://[username:password@]hostname:port[/database][?param1=value1&param2=value2]`. Почти во всех случаях имя конкретного параметра соответствует его пути в интерфейсе параметров конфигурации, за некоторыми исключениями. Поддерживаются следующие параметры:

| Параметр                                    | Тип                                                               |
| ------------------------------------------- | ----------------------------------------------------------------- |
| `pathname`                                  | произвольная строка.                                              |
| `application_id`                            | произвольная строка.                                              |
| `session_id`                                | произвольная строка.                                              |
| `request_timeout`                           | неотрицательное число.                                              |
| `max_open_connections`                      | неотрицательное число, больше нуля.                           |
| `compression_request`                       | логическое значение. См. ниже (1)                                            |
| `compression_response`                      | логическое значение.                                                          |
| `log_level`                                 | допустимые значения: `OFF`, `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`. |
| `keep_alive_enabled`                        | логическое значение.                                                          |
| `clickhouse_setting_*` или `ch_*`            | см. ниже (2)                                                     |
| `http_header_*`                             | см. ниже (3)                                                     |
| (только Node.js) `keep_alive_idle_socket_ttl` | неотрицательное число.                                              |

- (1) Для логических значений допустимыми являются `true`/`1` и `false`/`0`.
- (2) Любой параметр с префиксом `clickhouse_setting_` или `ch_` будет иметь удаленный префикс, а остальная часть будет добавлена в `clickhouse_settings` клиента. Например, `?ch_async_insert=1&ch_wait_for_async_insert=1` будет эквивалентно:

```ts
createClient({
  clickhouse_settings: {
    async_insert: 1,
    wait_for_async_insert: 1
  }
})
```

Примечание: логические значения для `clickhouse_settings` должны передаваться как `1`/`0` в URL.

- (3) Аналогично (2), но для конфигурации `http_header`. Например, `?http_header_x-clickhouse-auth=foobar` будет эквивалентно:

```ts
createClient({
  http_headers: {
    "x-clickhouse-auth": "foobar"
  }
})
```

### Подключение {#connecting}

#### Сбор данных для подключения {#gather-your-connection-details}

<ConnectionDetails />

#### Обзор подключения {#connection-overview}

Клиент реализует подключение через протокол HTTP(s). Поддержка RowBinary находится в разработке, см. [соответствующую задачу](https://github.com/ClickHouse/clickhouse-js/issues/216).

Следующий пример демонстрирует, как настроить подключение к ClickHouse Cloud. Предполагается, что значения `url` (включая протокол и порт) и `password` указаны через переменные окружения, и используется пользователь `default`.

**Пример:** Создание экземпляра клиента Node.js с использованием переменных окружения для конфигурации.

```ts
import { createClient } from "@clickhouse/client"

const client = createClient({
  url: process.env.CLICKHOUSE_HOST ?? "http://localhost:8123",
  username: process.env.CLICKHOUSE_USER ?? "default",
  password: process.env.CLICKHOUSE_PASSWORD ?? ""
})
```


Репозиторий клиента содержит множество примеров использования переменных окружения, таких как [создание таблицы в ClickHouse Cloud](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts), [использование асинхронных вставок](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert.ts) и многие другие.

#### Пул соединений (только для Node.js) {#connection-pool-nodejs-only}

Чтобы избежать накладных расходов на установку соединения при каждом запросе, клиент создает пул соединений с ClickHouse для повторного использования, применяя механизм Keep-Alive. По умолчанию Keep-Alive включен, а размер пула соединений установлен равным `10`, но вы можете изменить это с помощью [параметра конфигурации](./js.md#configuration) `max_open_connections`.

Нет гарантии, что одно и то же соединение из пула будет использоваться для последующих запросов, если пользователь не установит `max_open_connections: 1`. Это редко требуется, но может быть необходимо в случаях использования временных таблиц.

См. также: [Конфигурация Keep-Alive](./js.md#keep-alive-configuration-nodejs-only).

### Идентификатор запроса {#query-id}

Каждый метод, отправляющий запрос или оператор (`command`, `exec`, `insert`, `select`), возвращает `query_id` в результате. Этот уникальный идентификатор назначается клиентом для каждого запроса и может быть полезен для получения данных из `system.query_log`,
если он включен в [конфигурации сервера](/operations/server-configuration-parameters/settings), или для отмены долго выполняющихся запросов (см. [пример](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/cancel_query.ts)). При необходимости `query_id` может быть переопределен пользователем в параметрах методов `command`/`query`/`exec`/`insert`.

:::tip
Если вы переопределяете параметр `query_id`, необходимо обеспечить его уникальность для каждого вызова. Случайный UUID является хорошим выбором.
:::

### Базовые параметры для всех методов клиента {#base-parameters-for-all-client-methods}

Существует несколько параметров, которые могут применяться ко всем методам клиента ([query](./js.md#query-method)/[command](./js.md#command-method)/[insert](./js.md#insert-method)/[exec](./js.md#exec-method)).

```ts
interface BaseQueryParams {
  // Настройки ClickHouse, которые могут применяться на уровне запроса.
  clickhouse_settings?: ClickHouseSettings
  // Параметры для привязки запроса.
  query_params?: Record<string, unknown>
  // Экземпляр AbortSignal для отмены выполняющегося запроса.
  abort_signal?: AbortSignal
  // Переопределение query_id; если не указано, случайный идентификатор будет сгенерирован автоматически.
  query_id?: string
  // Переопределение session_id; если не указано, идентификатор сессии будет взят из конфигурации клиента.
  session_id?: string
  // Переопределение учетных данных; если не указано, будут использованы учетные данные клиента.
  auth?: { username: string; password: string }
  // Конкретный список ролей для использования в этом запросе. Переопределяет роли, установленные в конфигурации клиента.
  role?: string | Array<string>
}
```

### Метод query {#query-method}

Используется для большинства операторов, которые могут возвращать ответ, таких как `SELECT`, или для отправки DDL-операторов, таких как `CREATE TABLE`, и должен ожидаться. Возвращаемый набор результатов предполагается обрабатывать в приложении.

:::note
Существует специальный метод [insert](./js.md#insert-method) для вставки данных и [command](./js.md#command-method) для DDL-операторов.
:::

```ts
interface QueryParams extends BaseQueryParams {
  // Запрос для выполнения, который может вернуть данные.
  query: string
  // Формат результирующего набора данных. По умолчанию: JSON.
  format?: DataFormat
}

interface ClickHouseClient {
  query(params: QueryParams): Promise<ResultSet>
}
```

См. также: [Базовые параметры для всех методов клиента](./js.md#base-parameters-for-all-client-methods).

:::tip
Не указывайте предложение FORMAT в `query`, используйте вместо этого параметр `format`.
:::

#### Абстракции набора результатов и строк {#result-set-and-row-abstractions}

`ResultSet` предоставляет несколько удобных методов для обработки данных в вашем приложении.

Реализация `ResultSet` в Node.js использует `Stream.Readable` под капотом, в то время как веб-версия использует `ReadableStream` из Web API.

Вы можете обработать `ResultSet`, вызвав методы `text` или `json` на `ResultSet` и загрузив весь набор строк, возвращенных запросом, в память.


Вы должны начать чтение `ResultSet` как можно раньше, так как он удерживает поток ответа открытым и, как следствие, занимает нижележащее соединение. Клиент не буферизует входящие данные, чтобы избежать потенциально чрезмерного использования памяти приложением.

Если результат слишком велик, чтобы целиком поместиться в памяти, вы можете вызвать метод `stream` и обрабатывать данные в потоковом режиме. Каждый из фрагментов ответа будет преобразован в относительно небольшие массивы строк (размер этого массива зависит от размера конкретного фрагмента, который клиент получает от сервера, так как он может меняться, и от размера отдельной строки), по одному фрагменту за раз.

Обратитесь к списку [поддерживаемых форматов данных](./js.md#supported-data-formats), чтобы определить, какой формат лучше всего подходит для потоковой обработки в вашем случае. Например, если вы хотите передавать объекты JSON в потоковом режиме, вы можете выбрать формат [JSONEachRow](/interfaces/formats/JSONEachRow), и каждая строка будет интерпретирована как объект JS, или, возможно, более компактный формат [JSONCompactColumns](/interfaces/formats/JSONCompactColumns), при котором каждая строка будет представлять собой компактный массив значений. См. также: [streaming files](./js.md#streaming-files-nodejs-only).

:::important
Если `ResultSet` или его поток не будут полностью прочитаны, они будут уничтожены по истечении периода бездействия, определяемого параметром `request_timeout`.
:::

```ts
interface BaseResultSet<Stream> {
  // См. раздел "Идентификатор запроса" выше
  query_id: string

  // Прочитать весь поток и получить содержимое в виде строки
  // Может использоваться с любым DataFormat
  // Должен вызываться только один раз
  text(): Promise<string>

  // Прочитать весь поток и разобрать содержимое как объект JS
  // Может использоваться только с форматами JSON
  // Должен вызываться только один раз
  json<T>(): Promise<T>

  // Возвращает читаемый поток для ответов, которые можно передавать потоком
  // Каждая итерация по потоку предоставляет массив Row[] в выбранном DataFormat
  // Должен вызываться только один раз
  stream(): Stream
}

interface Row {
  // Получить содержимое строки в виде обычной строки
  text: string

  // Разобрать содержимое строки как объект JS
  json<T>(): T
}
```

**Пример:** (Node.js/Web) Запрос, возвращающий набор данных в формате `JSONEachRow`, который полностью считывает поток и парсит его содержимое в объекты JS.
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts).

```ts
const resultSet = await client.query({
  query: 'SELECT * FROM my_table',
  format: 'JSONEachRow',
})
const dataset = await resultSet.json() // или `row.text`, чтобы избежать парсинга JSON
```

**Пример:** (только Node.js) Потоковая обработка результата запроса в формате `JSONEachRow` с использованием классического подхода `on('data')`. Его можно заменить на синтаксис `for await const`. [Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row.ts).

```ts
const rows = await client.query({
  query: 'SELECT number FROM system.numbers_mt LIMIT 5',
  format: 'JSONEachRow', // или JSONCompactEachRow, JSONStringsEachRow и т. д.
})
const stream = rows.stream()
stream.on('data', (rows: Row[]) => {
  rows.forEach((row: Row) => {
    console.log(row.json()) // или `row.text`, чтобы избежать разбора JSON
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

**Пример:** (только для Node.js) потоковое получение результатов запроса в формате `CSV` с использованием классического подхода `on('data')`. Взаимозаменяемо с синтаксисом `for await const`.
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_text_line_by_line.ts)

```ts
const resultSet = await client.query({
  query: 'SELECT number FROM system.numbers_mt LIMIT 5',
  format: 'CSV', // или TabSeparated, CustomSeparated и т. д.
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


**Пример:** (только Node.js) Потоковая передача результата запроса в виде JS-объектов в формате `JSONEachRow` с использованием синтаксиса `for await const`. Этот подход взаимозаменяем с классическим `on('data')`.
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row_for_await.ts).

```ts
const resultSet = await client.query({
  query: "SELECT number FROM system.numbers LIMIT 10",
  format: "JSONEachRow" // or JSONCompactEachRow, JSONStringsEachRow, etc.
})
for await (const rows of resultSet.stream()) {
  rows.forEach((row) => {
    console.log(row.json())
  })
}
```

:::note
Синтаксис `for await const` требует немного меньше кода, чем подход `on('data')`, но может негативно сказаться на производительности.
Подробнее см. в [этой проблеме в репозитории Node.js](https://github.com/nodejs/node/issues/31979).
:::

**Пример:** (только Web) Итерация по `ReadableStream` объектов.

```ts
const resultSet = await client.query({
  query: "SELECT * FROM system.numbers LIMIT 10",
  format: "JSONEachRow"
})

const reader = resultSet.stream().getReader()
while (true) {
  const { done, value: rows } = await reader.read()
  if (done) {
    break
  }
  rows.forEach((row) => {
    console.log(row.json())
  })
}
```

### Метод insert {#insert-method}

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

Возвращаемый тип минимален, поскольку мы не ожидаем получения каких-либо данных от сервера и немедленно опустошаем поток ответа.

Если методу insert был передан пустой массив, оператор вставки не будет отправлен на сервер; вместо этого метод немедленно вернёт `{ query_id: '...', executed: false }`. Если в параметрах метода не был указан `query_id`, в результате будет пустая строка, поскольку возврат случайного UUID, сгенерированного клиентом, может вызвать путаницу — запрос с таким `query_id` не будет существовать в таблице `system.query_log`.

Если оператор вставки был отправлен на сервер, флаг `executed` будет иметь значение `true`.

#### Метод insert и потоковая передача в Node.js {#insert-method-and-streaming-in-nodejs}

Метод может работать как с `Stream.Readable`, так и с обычным `Array<T>`, в зависимости от [формата данных](./js.md#supported-data-formats), указанного для метода `insert`. См. также раздел о [потоковой передаче файлов](./js.md#streaming-files-nodejs-only).

Метод insert предполагает использование await; однако можно указать входной поток и дождаться завершения операции `insert` позже, только когда поток будет завершён (что также разрешит промис `insert`). Это может быть полезно для обработчиков событий и подобных сценариев, но обработка ошибок может оказаться нетривиальной с множеством граничных случаев на стороне клиента. Вместо этого рассмотрите использование [асинхронных вставок](/optimize/asynchronous-inserts), как показано в [этом примере](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert_without_waiting.ts).

:::tip
Если у вас есть пользовательский оператор INSERT, который сложно реализовать с помощью этого метода, рассмотрите использование [метода command](./js.md#command-method).

Примеры использования см. в [INSERT INTO ... VALUES](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_values_and_functions.ts) или [INSERT INTO ... SELECT](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_from_select.ts).
:::


```ts
interface InsertParams<T> extends BaseQueryParams {
  // Имя таблицы для вставки данных
  table: string
  // Набор данных для вставки.
  values: ReadonlyArray<T> | Stream.Readable
  // Формат набора данных для вставки.
  format?: DataFormat
  // Позволяет указать, в какие столбцы будут вставлены данные.
  // - Массив вида `['a', 'b']` сгенерирует: `INSERT INTO table (a, b) FORMAT DataFormat`
  // - Объект вида `{ except: ['a', 'b'] }` сгенерирует: `INSERT INTO table (* EXCEPT (a, b)) FORMAT DataFormat`
  // По умолчанию данные вставляются во все столбцы таблицы,
  // и сгенерированный оператор будет иметь вид: `INSERT INTO table FORMAT DataFormat`.
  columns?: NonEmptyArray<string> | { except: NonEmptyArray<string> }
}
```

См. также: [Базовые параметры для всех методов клиента](./js.md#base-parameters-for-all-client-methods).

:::important
Отмена запроса с помощью `abort_signal` не гарантирует, что вставка данных не произошла, поскольку сервер мог получить часть потоковых данных до отмены.
:::

**Пример:** (Node.js/Web) Вставка массива значений.
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts).

```ts
await client.insert({
  table: "my_table",
  // структура должна соответствовать требуемому формату, в данном примере JSONEachRow
  values: [
    { id: 42, name: "foo" },
    { id: 42, name: "bar" }
  ],
  format: "JSONEachRow"
})
```

**Пример:** (только Node.js) Вставка потока из CSV-файла.
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts). См. также: [потоковая передача файлов](./js.md#streaming-files-nodejs-only).

```ts
await client.insert({
  table: "my_table",
  values: fs.createReadStream("./path/to/a/file.csv"),
  format: "CSV"
})
```

**Пример**: Исключение определённых столбцов из оператора вставки.

Для определения таблицы вида:

```sql
CREATE OR REPLACE TABLE mytable
(id UInt32, message String)
ENGINE MergeTree()
ORDER BY (id)
```

Вставка только определённого столбца:

```ts
// Сгенерированный оператор: INSERT INTO mytable (message) FORMAT JSONEachRow
await client.insert({
  table: "mytable",
  values: [{ message: "foo" }],
  format: "JSONEachRow",
  // значение столбца `id` для этой строки будет равно нулю (значение по умолчанию для UInt32)
  columns: ["message"]
})
```

Исключение определённых столбцов:

```ts
// Сгенерированный оператор: INSERT INTO mytable (* EXCEPT (message)) FORMAT JSONEachRow
await client.insert({
  table: tableName,
  values: [{ id: 144 }],
  format: "JSONEachRow",
  // значение столбца `message` для этой строки будет пустой строкой
  columns: {
    except: ["message"]
  }
})
```

Дополнительные сведения см. в [исходном коде](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_exclude_columns.ts).

**Пример**: Вставка в базу данных, отличную от той, которая указана для экземпляра клиента. [Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_into_different_db.ts).

```ts
await client.insert({
  table: "mydb.mytable", // Полное имя, включающее базу данных
  values: [{ id: 42, message: "foo" }],
  format: "JSONEachRow"
})
```

#### Ограничения веб-версии {#web-version-limitations}

В настоящее время вставки в `@clickhouse/client-web` работают только с форматами `Array<T>` и `JSON*`.
Вставка потоков пока не поддерживается в веб-версии из-за недостаточной совместимости с браузерами.

Следовательно, интерфейс `InsertParams` для веб-версии немного отличается от версии Node.js,
поскольку `values` ограничены только типом `ReadonlyArray<T>`:


```ts
interface InsertParams<T> extends BaseQueryParams {
  // Имя таблицы для вставки данных
  table: string
  // Набор данных для вставки.
  values: ReadonlyArray<T>
  // Формат набора данных для вставки.
  format?: DataFormat
  // Позволяет указать, в какие столбцы будут вставлены данные.
  // - Массив вида `['a', 'b']` сгенерирует: `INSERT INTO table (a, b) FORMAT DataFormat`
  // - Объект вида `{ except: ['a', 'b'] }` сгенерирует: `INSERT INTO table (* EXCEPT (a, b)) FORMAT DataFormat`
  // По умолчанию данные вставляются во все столбцы таблицы,
  // и сгенерированный оператор будет иметь вид: `INSERT INTO table FORMAT DataFormat`.
  columns?: NonEmptyArray<string> | { except: NonEmptyArray<string> }
}
```

Это может измениться в будущем. См. также: [Базовые параметры для всех методов клиента](./js.md#base-parameters-for-all-client-methods).

### Метод command {#command-method}

Может использоваться для операторов, которые не возвращают результат, когда предложение format неприменимо, или когда ответ вообще не требуется. Примерами таких операторов могут быть `CREATE TABLE` или `ALTER TABLE`.

Должен использоваться с await.

Поток ответа уничтожается немедленно, что означает освобождение базового сокета.

```ts
interface CommandParams extends BaseQueryParams {
  // Оператор для выполнения.
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
  // Рекомендуется для использования в кластере, чтобы избежать ситуаций, когда ошибка обработки запроса произошла после отправки кода ответа,
  // и HTTP-заголовки уже были отправлены клиенту.
  // См. https://clickhouse.com/docs/interfaces/http/#response-buffering
  clickhouse_settings: {
    wait_end_of_query: 1
  }
})
```

**Пример:** (Node.js/Web) Создание таблицы в самостоятельно размещённом экземпляре ClickHouse.
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_single_node.ts).

```ts
await client.command({
  query: `
    CREATE TABLE IF NOT EXISTS my_table
    (id UInt64, name String)
    ENGINE MergeTree()
    ORDER BY (id)
  `
})
```

**Example:** (Node.js/Web) INSERT FROM SELECT

```ts
await client.command({
  query: `INSERT INTO my_table SELECT '42'`
})
```

:::important
Отмена запроса с помощью `abort_signal` не гарантирует, что оператор не был выполнен сервером.
:::

### Метод exec {#exec-method}

Если у вас есть пользовательский запрос, который не подходит для `query`/`insert`,
и вас интересует результат, вы можете использовать `exec` в качестве альтернативы `command`.

`exec` возвращает читаемый поток, который ДОЛЖЕН быть обработан или уничтожен на стороне приложения.

```ts
interface ExecParams extends BaseQueryParams {
  // Оператор для выполнения.
  query: string
}

interface ClickHouseClient {
  exec(params: ExecParams): Promise<QueryResult>
}
```

См. также: [Базовые параметры для всех методов клиента](./js.md#base-parameters-for-all-client-methods).

Тип возвращаемого потока различается в версиях Node.js и Web.

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

Метод `ping`, предназначенный для проверки состояния подключения, возвращает `true`, если сервер доступен.

Если сервер недоступен, базовая ошибка также включается в результат.

```ts
type PingResult = { success: true } | { success: false; error: Error }
```


/\*\* Параметры запроса проверки работоспособности (health-check) с использованием встроенной конечной точки `/ping`.

- Это поведение по умолчанию для версии Node.js. _/
  export type PingParamsWithEndpoint = {
  select: false
  /\*\* Экземпляр AbortSignal для отмены выполняющегося запроса. _/
  abort_signal?: AbortSignal
  /** Дополнительные HTTP-заголовки, которые нужно добавить к этому запросу. \*/
  http_headers?: Record<string, string>
  }
  /** Параметры запроса проверки работоспособности (health-check) с использованием запроса SELECT.
- Это поведение по умолчанию для веб-версии, так как конечная точка `/ping` не поддерживает CORS.
- Большинство стандартных параметров метода `query`, например `query_id`, `abort_signal`, `http_headers` и т. д., будут работать,
- за исключением `query_params`, которым нет смысла разрешать использование в этом методе. \*/
  export type PingParamsWithSelectQuery = { select: true } & Omit<
  BaseQueryParams,
  'query_params'
  > export type PingParams = PingParamsWithEndpoint | PingParamsWithSelectQuer
  >
  > y

interface ClickHouseClient {
ping(params?: PingParams): Promise<PingResult>
}

````

Ping может быть полезным инструментом для проверки доступности сервера при запуске приложения, особенно в ClickHouse Cloud, где экземпляр может простаивать и «проснуться» после ping-запроса: в этом случае может потребоваться повторить запрос несколько раз с паузой между попытками.

По умолчанию версия для Node.js использует конечную точку `/ping`, тогда как веб-версия использует простой запрос `SELECT 1` для достижения аналогичного результата, поскольку конечная точка `/ping` не поддерживает CORS.

**Пример:** (Node.js/Web) Простой ping экземпляра сервера ClickHouse. Обратите внимание, что для веб-версии перехваченные ошибки будут отличаться.
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/ping.ts).

```ts
const result = await client.ping();
if (!result.success) {
  // process result.error
}
````

**Пример:** Если при вызове метода `ping` необходимо также проверить учетные данные или указать дополнительные параметры, такие как `query_id`, это можно сделать следующим образом:

```ts
const result = await client.ping({
  select: true /* query_id, abort_signal, http_headers, or any other query params */
})
```

Метод `ping` принимает большинство стандартных параметров метода `query` — см. определение типа `PingParamsWithSelectQuery`.

### Закрыть (только Node.js) {#close-nodejs-only}

Закрывает все открытые соединения и освобождает ресурсы. В веб-версии метод ничего не делает.

```ts
await client.close()
```


## Потоковая обработка файлов (только Node.js) {#streaming-files-nodejs-only}

В репозитории клиента доступны примеры потоковой обработки файлов в популярных форматах данных (NDJSON, CSV, Parquet).

- [Потоковое чтение из файла NDJSON](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_ndjson.ts)
- [Потоковое чтение из файла CSV](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts)
- [Потоковое чтение из файла Parquet](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_parquet.ts)
- [Потоковая запись в файл Parquet](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts)

Потоковая запись других форматов в файл выполняется аналогично Parquet.
Единственное отличие — формат, используемый при вызове `query` (`JSONEachRow`, `CSV` и т. д.), и имя выходного файла.


## Поддерживаемые форматы данных {#supported-data-formats}

Клиент работает с форматами данных JSON и текстовыми форматами.

Если вы указываете `format` из семейства форматов JSON (`JSONEachRow`, `JSONCompactEachRow` и т.д.), клиент будет выполнять сериализацию и десериализацию данных при передаче по сети.

Данные в «сырых» текстовых форматах (семейства `CSV`, `TabSeparated` и `CustomSeparated`) передаются по сети без дополнительных преобразований.

:::tip
Возможна путаница между JSON как общим форматом и [форматом ClickHouse JSON](/interfaces/formats/JSON).

Клиент поддерживает потоковую передачу объектов JSON в таких форматах, как [JSONEachRow](/interfaces/formats/JSONEachRow) (см. обзор таблицы для других форматов, поддерживающих потоковую передачу; см. также [примеры `select_streaming_` в репозитории клиента](https://github.com/ClickHouse/clickhouse-js/tree/main/examples/node)).

Однако такие форматы, как [ClickHouse JSON](/interfaces/formats/JSON) и некоторые другие, представлены в ответе как единый объект и не могут передаваться клиентом в потоковом режиме.
:::

| Формат                                     | Ввод (массив) | Ввод (объект) | Ввод/Вывод (Поток) | Вывод (JSON) | Вывод (текст)   |
| ------------------------------------------ | ------------- | -------------- | --------------------- | ------------- | --------------- |
| JSON                                       | ❌            | ✔️             | ❌                    | ✔️            | ✔️              |
| JSONCompact                                | ❌            | ✔️             | ❌                    | ✔️            | ✔️              |
| JSONObjectEachRow                          | ❌            | ✔️             | ❌                    | ✔️            | ✔️              |
| JSONColumnsWithMetadata                    | ❌            | ✔️             | ❌                    | ✔️            | ✔️              |
| JSONStrings                                | ❌            | ❌️            | ❌                    | ✔️            | ✔️              |
| JSONCompactStrings                         | ❌            | ❌             | ❌                    | ✔️            | ✔️              |
| JSONEachRow                                | ✔️            | ❌             | ✔️                    | ✔️            | ✔️              |
| JSONEachRowWithProgress                    | ❌️           | ❌             | ✔️ ❗- см. ниже      | ✔️            | ✔️              |
| JSONStringsEachRow                         | ✔️            | ❌             | ✔️                    | ✔️            | ✔️              |
| JSONCompactEachRow                         | ✔️            | ❌             | ✔️                    | ✔️            | ✔️              |
| JSONCompactStringsEachRow                  | ✔️            | ❌             | ✔️                    | ✔️            | ✔️              |
| JSONCompactEachRowWithNames                | ✔️            | ❌             | ✔️                    | ✔️            | ✔️              |
| JSONCompactEachRowWithNamesAndTypes        | ✔️            | ❌             | ✔️                    | ✔️            | ✔️              |
| JSONCompactStringsEachRowWithNames         | ✔️            | ❌             | ✔️                    | ✔️            | ✔️              |
| JSONCompactStringsEachRowWithNamesAndTypes | ✔️            | ❌             | ✔️                    | ✔️            | ✔️              |
| CSV                                        | ❌            | ❌             | ✔️                    | ❌            | ✔️              |
| CSVWithNames                               | ❌            | ❌             | ✔️                    | ❌            | ✔️              |
| CSVWithNamesAndTypes                       | ❌            | ❌             | ✔️                    | ❌            | ✔️              |
| TabSeparated                               | ❌            | ❌             | ✔️                    | ❌            | ✔️              |
| TabSeparatedRaw                            | ❌            | ❌             | ✔️                    | ❌            | ✔️              |
| TabSeparatedWithNames                      | ❌            | ❌             | ✔️                    | ❌            | ✔️              |
| TabSeparatedWithNamesAndTypes              | ❌            | ❌             | ✔️                    | ❌            | ✔️              |
| CustomSeparated                            | ❌            | ❌             | ✔️                    | ❌            | ✔️              |
| CustomSeparatedWithNames                   | ❌            | ❌             | ✔️                    | ❌            | ✔️              |
| CustomSeparatedWithNamesAndTypes           | ❌            | ❌             | ✔️                    | ❌            | ✔️              |
| Parquet                                    | ❌            | ❌             | ✔️                    | ❌            | ✔️❗- see below |


Для Parquet основным вариантом использования при выполнении запросов `SELECT`, скорее всего, будет запись результирующего потока в файл. См. [пример](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts) в репозитории клиента.

`JSONEachRowWithProgress` — это формат только для вывода, который поддерживает отчет о прогрессе в потоке. См. [этот пример](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_json_each_row_with_progress.ts) для получения дополнительной информации.

Полный список входных и выходных форматов ClickHouse доступен 
[здесь](/interfaces/formats).



## Поддерживаемые типы данных ClickHouse {#supported-clickhouse-data-types}

:::note
Соответствующий тип JS применим для всех форматов `JSON*`, за исключением тех, которые представляют все данные в виде строк (например, `JSONStringEachRow`)
:::

| Тип                    | Статус           | Тип JS                     |
| ---------------------- | ---------------- | -------------------------- |
| UInt8/16/32            | ✔️               | number                     |
| UInt64/128/256         | ✔️ ❗- см. ниже | string                     |
| Int8/16/32             | ✔️               | number                     |
| Int64/128/256          | ✔️ ❗- см. ниже | string                     |
| Float32/64             | ✔️               | number                     |
| Decimal                | ✔️ ❗- см. ниже | number                     |
| Boolean                | ✔️               | boolean                    |
| String                 | ✔️               | string                     |
| FixedString            | ✔️               | string                     |
| UUID                   | ✔️               | string                     |
| Date32/64              | ✔️               | string                     |
| DateTime32/64          | ✔️ ❗- см. ниже | string                     |
| Enum                   | ✔️               | string                     |
| LowCardinality         | ✔️               | string                     |
| Array(T)               | ✔️               | T[]                        |
| (new) JSON             | ✔️               | object                     |
| Variant(T1, T2...)     | ✔️               | T (зависит от варианта)    |
| Dynamic                | ✔️               | T (зависит от варианта)    |
| Nested                 | ✔️               | T[]                        |
| Tuple(T1, T2, ...)     | ✔️               | [T1, T2, ...]              |
| Tuple(n1 T1, n2 T2...) | ✔️               | \{ n1: T1; n2: T2; ...}    |
| Nullable(T)            | ✔️               | тип JS для T или null      |
| IPv4                   | ✔️               | string                     |
| IPv6                   | ✔️               | string                     |
| Point                  | ✔️               | [ number, number ]         |
| Ring                   | ✔️               | Array&lt;Point\>           |
| Polygon                | ✔️               | Array&lt;Ring\>            |
| MultiPolygon           | ✔️               | Array&lt;Polygon\>         |
| Map(K, V)              | ✔️               | Record&lt;K, V\>           |
| Time/Time64            | ✔️               | string                     |

Полный список поддерживаемых типов данных ClickHouse доступен
[здесь](/sql-reference/data-types/).

См. также:

- [Примеры работы с Dynamic/Variant/JSON](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/dynamic_variant_json.ts)
- [Примеры работы с Time/Time64](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/time_time64.ts)

### Особенности типов Date/Date32 {#datedate32-types-caveats}

Поскольку клиент вставляет значения без дополнительного преобразования типов, столбцы типов `Date`/`Date32` можно вставлять только в виде
строк.

**Пример:** Вставка значения типа `Date`.
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/ba387d7f4ce375a60982ac2d99cb47391cf76cec/__tests__/integration/date_time.test.ts)

```ts
await client.insert({
  table: "my_table",
  values: [{ date: "2022-09-05" }],
  format: "JSONEachRow"
})
```

Однако при использовании столбцов `DateTime` или `DateTime64` можно использовать как строки, так и объекты JS Date. Объекты JS Date можно передавать в `insert` напрямую при установке параметра `date_time_input_format` в значение `best_effort`. Подробнее см. в этом [примере](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_js_dates.ts).

### Особенности типов Decimal\* {#decimal-types-caveats}

Возможна вставка значений Decimal с использованием форматов семейства `JSON*`. Предположим, у нас есть таблица, определённая следующим образом:

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

Можно вставлять значения без потери точности, используя строковое представление:


```ts
await client.insert({
  table: "my_table",
  values: [
    {
      id: 1,
      dec32: "1234567.89",
      dec64: "123456789123456.789",
      dec128: "1234567891234567891234567891.1234567891",
      dec256:
        "12345678912345678912345678911234567891234567891234567891.12345678911234567891"
    }
  ],
  format: "JSONEachRow"
})
```

Однако при запросе данных в форматах `JSON*` ClickHouse по умолчанию возвращает значения Decimal как _числа_, что может привести к потере точности. Чтобы этого избежать, можно преобразовать Decimal в строку в запросе:

```ts
await client.query({
  query: `
    SELECT toString(dec32)  AS decimal32,
           toString(dec64)  AS decimal64,
           toString(dec128) AS decimal128,
           toString(dec256) AS decimal256
    FROM my_table
  `,
  format: "JSONEachRow"
})
```

Подробнее см. в [этом примере](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_decimals.ts).

### Целочисленные типы: Int64, Int128, Int256, UInt64, UInt128, UInt256 {#integral-types-int64-int128-int256-uint64-uint128-uint256}

Хотя сервер может принимать значения как числа, они возвращаются в виде строк в выходных форматах семейства `JSON*` во избежание переполнения целых чисел, так как максимальные значения для этих типов превышают `Number.MAX_SAFE_INTEGER`.

Однако это поведение можно изменить с помощью настройки [`output_format_json_quote_64bit_integers`](/operations/settings/formats#output_format_json_quote_64bit_integers).

**Пример:** Настройка формата вывода JSON для 64-битных чисел.

```ts
const resultSet = await client.query({
  query: "SELECT * from system.numbers LIMIT 1",
  format: "JSONEachRow"
})

expect(await resultSet.json()).toEqual([{ number: "0" }])
```

```ts
const resultSet = await client.query({
  query: "SELECT * from system.numbers LIMIT 1",
  format: "JSONEachRow",
  clickhouse_settings: { output_format_json_quote_64bit_integers: 0 }
})

expect(await resultSet.json()).toEqual([{ number: 0 }])
```


## Настройки ClickHouse {#clickhouse-settings}

Клиент может управлять поведением ClickHouse с помощью механизма [настроек](/operations/settings/settings/).

Настройки можно задать на уровне экземпляра клиента, чтобы они применялись к каждому запросу, отправляемому в ClickHouse:

```ts
const client = createClient({
  clickhouse_settings: {}
})
```

Также настройку можно задать на уровне отдельного запроса:

```ts
client.query({
  clickhouse_settings: {}
})
```

Файл с объявлениями типов для всех поддерживаемых настроек ClickHouse можно найти
[здесь](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/settings.ts).

:::important
Убедитесь, что пользователь, от имени которого выполняются запросы, имеет достаточные права для изменения настроек.
:::


## Расширенные возможности {#advanced-topics}

### Запросы с параметрами {#queries-with-parameters}

Вы можете создать запрос с параметрами и передать в них значения из клиентского приложения. Это позволяет избежать форматирования запроса с конкретными динамическими значениями на стороне клиента.

Отформатируйте запрос как обычно, затем поместите значения, которые вы хотите передать из параметров приложения в запрос, в фигурные скобки в следующем формате:

```text
{<name>: <data_type>}
```

где:

- `name` — идентификатор заполнителя.
- `data_type` — [тип данных](/sql-reference/data-types/) значения параметра приложения.

**Пример:** запрос с параметрами.
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/query_with_parameter_binding.ts).

```ts
await client.query({
  query: "SELECT plus({val1: Int32}, {val2: Int32})",
  format: "CSV",
  query_params: {
    val1: 10,
    val2: 20
  }
})
```

Дополнительные сведения см. на странице https://clickhouse.com/docs/interfaces/cli#cli-queries-with-parameters-syntax.

### Сжатие {#compression}

Примечание: сжатие запросов в настоящее время недоступно в веб-версии. Сжатие ответов работает в обычном режиме. Версия Node.js поддерживает оба варианта.

Приложения для работы с данными, оперирующие большими наборами данных по сети, могут получить преимущество от включения сжатия. В настоящее время поддерживается только `GZIP` с использованием [zlib](https://nodejs.org/docs/latest-v14.x/api/zlib.html).

```typescript
createClient({
  compression: {
    response: true,
    request: true
  }
})
```

Параметры конфигурации:

- `response: true` указывает серверу ClickHouse отвечать со сжатым телом ответа. Значение по умолчанию: `response: false`
- `request: true` включает сжатие тела запроса клиента. Значение по умолчанию: `request: false`

### Логирование (только Node.js) {#logging-nodejs-only}

:::important
Логирование является экспериментальной функцией и может быть изменено в будущем.
:::

Реализация логгера по умолчанию выводит записи журнала в `stdout` через методы `console.debug/info/warn/error`.
Вы можете настроить логику логирования, предоставив `LoggerClass`, и выбрать желаемый уровень логирования через параметр `level` (по умолчанию `OFF`):

```typescript
import type { Logger } from "@clickhouse/client"

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

В настоящее время клиент регистрирует следующие события:

- `TRACE` — низкоуровневая информация о жизненном цикле сокетов Keep-Alive
- `DEBUG` — информация об ответе (без заголовков авторизации и информации о хосте)
- `INFO` — в основном не используется, выводит текущий уровень логирования при инициализации клиента
- `WARN` — некритичные ошибки; неудачный запрос `ping` регистрируется как предупреждение, поскольку базовая ошибка включена в возвращаемый результат
- `ERROR` — критические ошибки методов `query`/`insert`/`exec`/`command`, такие как неудачный запрос

Реализацию логгера по умолчанию можно найти [здесь](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/logger.ts).

### TLS-сертификаты (только Node.js) {#tls-certificates-nodejs-only}

Клиент Node.js опционально поддерживает как базовый TLS (только центр сертификации), так и взаимный TLS (центр сертификации и клиентские сертификаты).

Пример базовой конфигурации TLS при условии, что ваши сертификаты находятся в папке `certs`, а имя файла центра сертификации — `CA.pem`:

```ts
const client = createClient({
  url: "https://<hostname>:<port>",
  username: "<username>",
  password: "<password>", // если требуется
  tls: {
    ca_cert: fs.readFileSync("certs/CA.pem")
  }
})
```

Пример конфигурации взаимного TLS с использованием клиентских сертификатов:


```ts
const client = createClient({
  url: "https://<hostname>:<port>",
  username: "<username>",
  tls: {
    ca_cert: fs.readFileSync("certs/CA.pem"),
    cert: fs.readFileSync(`certs/client.crt`),
    key: fs.readFileSync(`certs/client.key`)
  }
})
```

Полные примеры для [базового](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/basic_tls.ts) и [взаимного](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/mutual_tls.ts) TLS см. в репозитории.

### Конфигурация Keep-alive (только для Node.js) {#keep-alive-configuration-nodejs-only}

Клиент по умолчанию включает Keep-Alive в базовом HTTP-агенте, что означает повторное использование подключенных сокетов для последующих запросов и отправку заголовка `Connection: keep-alive`. Простаивающие сокеты по умолчанию остаются в пуле соединений в течение 2500 миллисекунд (см. [примечания о настройке этого параметра](./js.md#adjusting-idle_socket_ttl)).

Значение `keep_alive.idle_socket_ttl` должно быть заметно ниже, чем конфигурация сервера/балансировщика нагрузки. Основная причина заключается в том, что HTTP/1.1 позволяет серверу закрывать сокеты без уведомления клиента, и если сервер или балансировщик нагрузки закроет соединение _раньше_ клиента, клиент может попытаться повторно использовать закрытый сокет, что приведет к ошибке `socket hang up`.

При изменении `keep_alive.idle_socket_ttl` помните, что это значение должно всегда соответствовать конфигурации Keep-Alive вашего сервера/балансировщика нагрузки и должно быть **всегда ниже** этого значения, гарантируя, что сервер никогда не закроет открытое соединение первым.

#### Настройка `idle_socket_ttl` {#adjusting-idle_socket_ttl}

Клиент устанавливает `keep_alive.idle_socket_ttl` в 2500 миллисекунд, так как это можно считать наиболее безопасным значением по умолчанию; на стороне сервера `keep_alive_timeout` может быть установлен [всего в 3 секунды в версиях ClickHouse до 23.11](https://github.com/ClickHouse/ClickHouse/commit/1685cdcb89fe110b45497c7ff27ce73cc03e82d1) без изменений в `config.xml`.

:::warning
Если вас устраивает производительность и вы не сталкиваетесь с какими-либо проблемами, рекомендуется **не** увеличивать значение параметра `keep_alive.idle_socket_ttl`, так как это может привести к потенциальным ошибкам «Socket hang-up»; кроме того, если ваше приложение отправляет много запросов и между ними нет длительных простоев, значения по умолчанию должно быть достаточно, так как сокеты не будут простаивать достаточно долго, и клиент будет сохранять их в пуле.
:::

Вы можете найти правильное значение тайм-аута Keep-Alive в заголовках ответа сервера, выполнив следующую команду:

```sh
curl -v --data-binary "SELECT 1" <clickhouse_url>
```

Проверьте значения заголовков `Connection` и `Keep-Alive` в ответе. Например:

```text
< Connection: Keep-Alive
< Keep-Alive: timeout=10
```

В этом случае `keep_alive_timeout` составляет 10 секунд, и вы можете попробовать увеличить `keep_alive.idle_socket_ttl` до 9000 или даже 9500 миллисекунд, чтобы простаивающие сокеты оставались открытыми немного дольше, чем по умолчанию. Следите за потенциальными ошибками «Socket hang-up», которые будут указывать на то, что сервер закрывает соединения раньше клиента, и уменьшайте значение до тех пор, пока ошибки не исчезнут.

#### Устранение неполадок {#troubleshooting}

Если вы сталкиваетесь с ошибками `socket hang up` даже при использовании последней версии клиента, существуют следующие варианты решения этой проблемы:

- Включите логирование с уровнем не ниже `WARN`. Это позволит проверить, есть ли в коде приложения непотребленный или висячий поток: транспортный уровень зарегистрирует это на уровне WARN, так как это потенциально может привести к закрытию сокета сервером. Вы можете включить логирование в конфигурации клиента следующим образом:

  ```ts
  const client = createClient({
    log: { level: ClickHouseLogLevel.WARN }
  })
  ```

- Проверьте код вашего приложения с включенным правилом ESLint [no-floating-promises](https://typescript-eslint.io/rules/no-floating-promises/), которое поможет выявить необработанные промисы, способные привести к висячим потокам и сокетам.


- Немного уменьшите значение параметра `keep_alive.idle_socket_ttl` в конфигурации сервера ClickHouse. В определённых ситуациях, например при высокой сетевой задержке между клиентом и сервером, может быть полезно уменьшить `keep_alive.idle_socket_ttl` ещё на 200–500 миллисекунд, чтобы исключить ситуацию, когда исходящий запрос может получить сокет, который сервер собирается закрыть.

- Если эта ошибка возникает во время длительных запросов без входящих или исходящих данных (например, длительный `INSERT FROM SELECT`), это может быть связано с тем, что балансировщик нагрузки закрывает простаивающие соединения. Вы можете попробовать принудительно передавать данные во время длительных запросов, используя комбинацию следующих настроек ClickHouse:

  ```ts
  const client = createClient({
    // Здесь мы предполагаем, что у нас будут запросы с временем выполнения более 5 минут
    request_timeout: 400_000,
    /** Эти настройки в комбинации позволяют избежать проблем с таймаутом балансировщика нагрузки в случае длительных запросов без входящих или исходящих данных,
     *  таких как `INSERT FROM SELECT` и подобных, поскольку соединение может быть помечено балансировщиком как простаивающее и внезапно закрыто.
     *  В данном случае мы предполагаем, что у балансировщика таймаут простаивающего соединения составляет 120 секунд, поэтому устанавливаем 110 секунд как «безопасное» значение. */
    clickhouse_settings: {
      send_progress_in_http_headers: 1,
      http_headers_progress_interval_ms: "110000" // UInt64, должно передаваться как строка
    }
  })
  ```

  Однако имейте в виду, что общий размер получаемых заголовков ограничен 16 КБ в последних версиях Node.js; после получения определённого количества заголовков прогресса, которое в наших тестах составляло около 70–80, будет сгенерировано исключение.

  Также возможно использовать совершенно другой подход, полностью избегая времени ожидания на линии связи; это можно сделать, используя «особенность» HTTP-интерфейса, заключающуюся в том, что мутации не отменяются при потере соединения. См. [этот пример (часть 2)](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/long_running_queries_timeouts.ts) для получения дополнительной информации.

- Функцию Keep-Alive можно полностью отключить. В этом случае клиент также будет добавлять заголовок `Connection: close` к каждому запросу, и базовый HTTP-агент не будет повторно использовать соединения. Параметр `keep_alive.idle_socket_ttl` будет игнорироваться, поскольку не будет простаивающих сокетов. Это приведёт к дополнительным накладным расходам, так как для каждого запроса будет устанавливаться новое соединение.

  ```ts
  const client = createClient({
    keep_alive: {
      enabled: false
    }
  })
  ```

### Пользователи только для чтения {#read-only-users}

При использовании клиента с [пользователем readonly=1](/operations/settings/permissions-for-queries#readonly) сжатие ответов не может быть включено, так как для этого требуется настройка `enable_http_compression`. Следующая конфигурация приведёт к ошибке:

```ts
const client = createClient({
  compression: {
    response: true // не будет работать с пользователем readonly=1
  }
})
```

См. [пример](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/read_only_user.ts), в котором подробнее освещены ограничения пользователя readonly=1.

### Прокси с путём {#proxy-with-a-pathname}

Если ваш экземпляр ClickHouse находится за прокси-сервером и имеет путь в URL, например http://proxy:8123/clickhouse_server, укажите `clickhouse_server` в качестве параметра конфигурации `pathname` (с начальной косой чертой или без неё); в противном случае, если указать его непосредственно в `url`, он будет рассматриваться как параметр `database`. Поддерживаются множественные сегменты, например `/my_proxy/db`.

```ts
const client = createClient({
  url: "http://proxy:8123",
  pathname: "/clickhouse_server"
})
```

### Обратный прокси с аутентификацией {#reverse-proxy-with-authentication}

Если перед вашим развёртыванием ClickHouse находится обратный прокси-сервер с аутентификацией, вы можете использовать настройку `http_headers` для передачи необходимых заголовков:

```ts
const client = createClient({
  http_headers: {
    "My-Auth-Header": "..."
  }
})
```

### Пользовательский HTTP/HTTPS-агент (экспериментально, только для Node.js) {#custom-httphttps-agent-experimental-nodejs-only}

:::warning
Это экспериментальная функция, которая может измениться несовместимым образом в будущих выпусках. Стандартная реализация и настройки, предоставляемые клиентом, должны быть достаточными для большинства случаев использования. Используйте эту функцию только если вы уверены, что она вам необходима.
:::


По умолчанию клиент настраивает базовый HTTP(s)-агент, используя параметры, указанные в конфигурации клиента (такие как `max_open_connections`, `keep_alive.enabled`, `tls`), который будет управлять соединениями с сервером ClickHouse. Кроме того, если используются TLS-сертификаты, базовый агент будет настроен с необходимыми сертификатами, и будут применены корректные заголовки аутентификации TLS.

Начиная с версии 1.2.0 можно предоставить клиенту пользовательский HTTP(s)-агент, заменяющий базовый агент по умолчанию. Это может быть полезно в случае сложных сетевых конфигураций. При использовании пользовательского агента применяются следующие условия:

- Параметры `max_open_connections` и `tls` _не будут иметь эффекта_ и будут проигнорированы клиентом, поскольку они являются частью конфигурации базового агента.
- `keep_alive.enabled` будет регулировать только значение по умолчанию заголовка `Connection` (`true` -> `Connection: keep-alive`, `false` -> `Connection: close`).
- Хотя управление неактивными сокетами keep-alive будет продолжать работать (поскольку оно привязано не к агенту, а к конкретному сокету), теперь можно полностью отключить его, установив значение `keep_alive.idle_socket_ttl` равным `0`.

#### Примеры использования пользовательского агента {#custom-agent-usage-examples}

Использование пользовательского HTTP(s)-агента без сертификатов:

```ts
const agent = new http.Agent({
  // or https.Agent
  keepAlive: true,
  keepAliveMsecs: 2500,
  maxSockets: 10,
  maxFreeSockets: 10
})
const client = createClient({
  http_agent: agent
})
```

Использование пользовательского HTTPS-агента с базовым TLS и сертификатом CA:

```ts
const agent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 2500,
  maxSockets: 10,
  maxFreeSockets: 10,
  ca: fs.readFileSync("./ca.crt")
})
const client = createClient({
  url: "https://myserver:8443",
  http_agent: agent,
  // При использовании пользовательского HTTPS-агента клиент не будет использовать реализацию HTTPS-соединения по умолчанию; заголовки должны быть предоставлены вручную
  http_headers: {
    "X-ClickHouse-User": "username",
    "X-ClickHouse-Key": "password"
  },
  // Важно: заголовок авторизации конфликтует с заголовками TLS; отключите его.
  set_basic_auth_header: false
})
```

Использование пользовательского HTTPS-агента с взаимным TLS:

```ts
const agent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 2500,
  maxSockets: 10,
  maxFreeSockets: 10,
  ca: fs.readFileSync("./ca.crt"),
  cert: fs.readFileSync("./client.crt"),
  key: fs.readFileSync("./client.key")
})
const client = createClient({
  url: "https://myserver:8443",
  http_agent: agent,
  // При использовании пользовательского HTTPS-агента клиент не будет использовать реализацию HTTPS-соединения по умолчанию; заголовки должны быть предоставлены вручную
  http_headers: {
    "X-ClickHouse-User": "username",
    "X-ClickHouse-Key": "password",
    "X-ClickHouse-SSL-Certificate-Auth": "on"
  },
  // Важно: заголовок авторизации конфликтует с заголовками TLS; отключите его.
  set_basic_auth_header: false
})
```

При использовании сертификатов _и_ пользовательского _HTTPS_-агента, вероятно, потребуется отключить заголовок авторизации по умолчанию через параметр `set_basic_auth_header` (введён в версии 1.2.0), поскольку он конфликтует с заголовками TLS. Все заголовки TLS должны быть предоставлены вручную.


## Известные ограничения (Node.js/web) {#known-limitations-nodejsweb}

- Отсутствуют маппинги данных для результирующих наборов, поэтому используются только языковые примитивы. Некоторые маппинги типов данных планируются вместе с [поддержкой формата RowBinary](https://github.com/ClickHouse/clickhouse-js/issues/216).
- Существуют некоторые [особенности работы с типами данных Decimal\* и Date\* / DateTime\*](./js.md#datedate32-types-caveats).
- При использовании форматов семейства JSON\* числа больше Int32 представляются в виде строк, так как максимальные значения типов Int64+ превышают `Number.MAX_SAFE_INTEGER`. Подробнее см. раздел [Целочисленные типы](./js.md#integral-types-int64-int128-int256-uint64-uint128-uint256).


## Известные ограничения (web) {#known-limitations-web}

- Потоковая передача для запросов SELECT работает, но отключена для INSERT (в том числе на уровне типов).
- Сжатие запросов отключено, конфигурация игнорируется. Сжатие ответов работает.
- Поддержка логирования пока не реализована.


## Советы по оптимизации производительности {#tips-for-performance-optimizations}

- Для снижения потребления памяти приложением рекомендуется использовать потоки для больших вставок (например, из файлов) и выборок, где это применимо. Для обработчиков событий и аналогичных сценариев использования [асинхронные вставки](/optimize/asynchronous-inserts) могут быть другим хорошим вариантом, позволяющим минимизировать или даже полностью избежать пакетирования на стороне клиента. Примеры асинхронных вставок доступны в [репозитории клиента](https://github.com/ClickHouse/clickhouse-js/tree/main/examples) с префиксом имени файла `async_insert_`.
- Клиент не включает сжатие запросов или ответов по умолчанию. Однако при выборке или вставке больших наборов данных можно рассмотреть возможность включения сжатия через `ClickHouseClientConfigOptions.compression` (либо только для `request`, либо для `response`, либо для обоих).
- Сжатие существенно снижает производительность. Включение сжатия для `request` или `response` негативно повлияет на скорость выборок или вставок соответственно, но уменьшит объем сетевого трафика, передаваемого приложением.


## Свяжитесь с нами {#contact-us}

Если у вас возникли вопросы или вам требуется помощь, обращайтесь к нам в [Community Slack](https://clickhouse.com/slack) (канал `#clickhouse-js`) или через [GitHub issues](https://github.com/ClickHouse/clickhouse-js/issues).
