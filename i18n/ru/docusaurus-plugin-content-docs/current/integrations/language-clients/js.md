---
sidebar_label: 'JavaScript'
sidebar_position: 4
keywords: ['clickhouse', 'js', 'JavaScript', 'NodeJS', 'web', 'browser', 'Cloudflare', 'workers', 'client', 'connect', 'integrate']
slug: /integrations/javascript
description: 'Официальный клиент JS для подключения к ClickHouse.'
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

Он не имеет внешних зависимостей, оптимизирован для максимальной производительности и протестирован с различными версиями и конфигурациями ClickHouse (одиночный локальный узел (on‑premise), локальный кластер (on‑premise) и ClickHouse Cloud).

Доступны две версии клиента для разных сред:
- `@clickhouse/client` — только для Node.js
- `@clickhouse/client-web` — браузеры (Chrome/Firefox), воркеры Cloudflare

При использовании TypeScript убедитесь, что его версия не ниже [4.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html), которая добавляет поддержку [inline import and export syntax](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#type-modifiers-on-import-names).

Исходный код клиента доступен в [репозитории ClickHouse-JS на GitHub](https://github.com/ClickHouse/clickhouse-js).



## Требования к окружению (node.js) {#environment-requirements-nodejs}

Для запуска клиента в окружении должен быть доступен Node.js.
Клиент совместим со всеми [поддерживаемыми](https://github.com/nodejs/release#readme) выпусками Node.js.

Как только версия Node.js приближается к окончанию срока поддержки (End-Of-Life), клиент прекращает её поддержку, поскольку она считается устаревшей и небезопасной.

Поддержка текущих версий Node.js:

| Node.js version | Supported?       |
|-----------------|------------------|
| 22.x            | ✔                |
| 20.x            | ✔                |
| 18.x            | ✔                |
| 16.x            | По возможности   |



## Требования к окружению (web) {#environment-requirements-web}

Веб-версия клиента официально тестируется в последних версиях браузеров Chrome и Firefox и может использоваться в качестве зависимости, например, в приложениях React/Vue/Angular или в Cloudflare Workers.



## Установка

Чтобы установить последнюю стабильную версию клиента Node.js, выполните следующую команду:

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

Скорее всего, клиент будет работать и с более старыми версиями, однако такая поддержка предоставляется по принципу «best effort» и не гарантируется. Если у вас версия ClickHouse ниже 23.3, обратитесь к [политике безопасности ClickHouse](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md) и рассмотрите возможность обновления.



## Примеры

Мы стремимся охватить различные сценарии использования клиента с помощью [примеров](https://github.com/ClickHouse/clickhouse-js/blob/main/examples) в репозитории клиента.

Обзор доступен в [README для примеров](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/README.md#overview).

Если что-то непонятно или отсутствует в примерах или в дальнейшей документации, вы можете [связаться с нами](./js.md#contact-us).

### API клиента

Большинство примеров должны быть совместимы как с версией клиента для Node.js, так и с веб-версией клиента, если явно не указано иное.

#### Создание экземпляра клиента

Вы можете создать столько экземпляров клиента, сколько необходимо, с помощью фабричной функции `createClient`:

```ts
import { createClient } from '@clickhouse/client' // или '@clickhouse/client-web'

const client = createClient({
  /* конфигурация */
})
```

Если ваша среда не поддерживает модули ESM, вместо этого вы можете использовать синтаксис CJS:

```ts
const { createClient } = require('@clickhouse/client');

const client = createClient({
  /* конфигурация */
})
```

Экземпляр клиента можно [предварительно настроить](./js.md#configuration) при его создании.

#### Конфигурация

При создании экземпляра клиента можно настроить следующие параметры подключения:

| Setting                                                                  | Description                                                                         | Default Value                                                   | See Also                                                                                     |                                                                                               |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **url**?: string                                                         | URL экземпляра ClickHouse.                                                          | `http://localhost:8123`                                         | [Документация по конфигурации URL](./js.md#url-configuration)                                |                                                                                               |
| **pathname**?: string                                                    | Необязательный `pathname`, добавляемый к URL ClickHouse после его разбора клиентом. | `''`                                                            | [Документация по прокси с pathname](./js.md#proxy-with-a-pathname)                           |                                                                                               |
| **request&#95;timeout**?: number                                         | Таймаут запроса в миллисекундах.                                                    | `30_000`                                                        | -                                                                                            |                                                                                               |
| **compression**?: `{ **response**?: boolean; **request**?: boolean }`    | Включить сжатие.                                                                    | -                                                               | [Документация по сжатию](./js.md#compression)                                                |                                                                                               |
| **username**?: string                                                    | Имя пользователя, от имени которого выполняются запросы.                            | `default`                                                       | -                                                                                            |                                                                                               |
| **password**?: string                                                    | Пароль пользователя.                                                                | `''`                                                            | -                                                                                            |                                                                                               |
| **application**?: string                                                 | Имя приложения, использующего клиент Node.js.                                       | `clickhouse-js`                                                 | -                                                                                            |                                                                                               |
| **database**?: string                                                    | Имя используемой базы данных.                                                       | `default`                                                       | -                                                                                            |                                                                                               |
| **clickhouse&#95;settings**?: ClickHouseSettings                         | Настройки ClickHouse, применяемые ко всем запросам.                                 | `{}`                                                            | -                                                                                            |                                                                                               |
| **log**?: `{ **LoggerClass**?: Logger, **level**?: ClickHouseLogLevel }` | Настройки внутреннего логирования клиента.                                          | -                                                               | [Документация по логированию](./js.md#logging-nodejs-only)                                   |                                                                                               |
| **session&#95;id**?: string                                              | Необязательный идентификатор сессии ClickHouse, отправляемый с каждым запросом.     | -                                                               | -                                                                                            |                                                                                               |
| **keep&#95;alive**?: `{ **enabled**?: boolean }`                         | Включён по умолчанию как в Node.js‑версии, так и в веб‑версии клиента.              | -                                                               | -                                                                                            |                                                                                               |
| **http&#95;headers**?: `Record<string, string>`                          | Дополнительные HTTP‑заголовки для исходящих запросов в ClickHouse.                  | -                                                               | [Документация по реверс‑прокси с аутентификацией](./js.md#reverse-proxy-with-authentication) |                                                                                               |
| **roles**?: string                                                       | string[]                                                                            | Имя или имена ролей ClickHouse, назначаемых исходящим запросам. | -                                                                                            | [Использование ролей с HTTP‑интерфейсом](/interfaces/http#setting-role-with-query-parameters) |

#### Параметры конфигурации, специфичные для Node.js


| Параметр                                                                       | Описание                                                                           | Значение по умолчанию                    | См. также                                                                                                              |                                                                                        |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **max&#95;open&#95;connections**?: number                                      | Максимальное количество подключенных сокетов, разрешённое на хост.                 | `10`                                     | -                                                                                                                      |                                                                                        |
| **tls**?: `{ **ca_cert**: Buffer, **cert**?: Buffer, **key**?: Buffer }`       | Настройка TLS‑сертификатов.                                                        | -                                        | [Документация по TLS](./js.md#tls-certificates-nodejs-only)                                                            |                                                                                        |
| **keep&#95;alive**?: `{ **enabled**?: boolean, **idle_socket_ttl**?: number }` | -                                                                                  | -                                        | [Документация по Keep Alive](./js.md#keep-alive-configuration-nodejs-only)                                             |                                                                                        |
| **http&#95;agent**?: http.Agent                                                | https.Agent <br /><ExperimentalBadge />                                            | Пользовательский HTTP‑агент для клиента. | -                                                                                                                      | [Документация по HTTP‑агенту](./js.md#custom-httphttps-agent-experimental-nodejs-only) |
| **set&#95;basic&#95;auth&#95;header**?: boolean <br /><ExperimentalBadge />    | Устанавливать заголовок `Authorization` с учётными данными базовой аутентификации. | `true`                                   | [использование этого параметра в документации по HTTP‑агенту](./js.md#custom-httphttps-agent-experimental-nodejs-only) |                                                                                        |

### Конфигурация URL

:::important
Конфигурация URL *всегда* переопределяет жёстко заданные значения, и в этом случае в журнал будет записано предупреждение.
:::

Большинство параметров экземпляра клиента можно настроить с помощью URL. Формат URL: `http[s]://[username:password@]hostname:port[/database][?param1=value1&param2=value2]`. Почти во всех случаях имя конкретного параметра отражает его путь в интерфейсе параметров конфигурации, за несколькими исключениями. Поддерживаются следующие параметры:

| Параметр                                    | Тип                                                                    |
| ------------------------------------------- | ---------------------------------------------------------------------- |
| `pathname`                                  | произвольная строка.                                                   |
| `application_id`                            | произвольная строка.                                                   |
| `session_id`                                | произвольная строка.                                                   |
| `request_timeout`                           | неотрицательное число.                                                 |
| `max_open_connections`                      | неотрицательное число, больше нуля.                                    |
| `compression_request`                       | логическое значение. См. ниже (1)                                      |
| `compression_response`                      | логическое значение.                                                   |
| `log_level`                                 | допустимые значения: `OFF`, `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`. |
| `keep_alive_enabled`                        | логическое значение.                                                   |
| `clickhouse_setting_*` or `ch_*`            | см. ниже (2)                                                           |
| `http_header_*`                             | см. ниже (3)                                                           |
| (Node.js only) `keep_alive_idle_socket_ttl` | неотрицательное число.                                                 |

* (1) Для логических значений допустимы `true`/`1` и `false`/`0`.
* (2) Любой параметр с префиксом `clickhouse_setting_` или `ch_` будет иметь этот префикс удалён, а оставшаяся часть будет добавлена в `clickhouse_settings` клиента. Например, `?ch_async_insert=1&ch_wait_for_async_insert=1` будет эквивалентно:

```ts
createClient({
  clickhouse_settings: {
    async_insert: 1,
    wait_for_async_insert: 1,
  },
})
```

Примечание: логические значения для `clickhouse_settings` должны передаваться как `1`/`0` в URL-адресе.

* (3) Аналогично пункту (2), но для параметра `http_header`. Например, `?http_header_x-clickhouse-auth=foobar` будет эквивалентен следующему:

```ts
createClient({
  http_headers: {
    'x-clickhouse-auth': 'foobar',
  },
})
```

### Подключение

#### Соберите параметры подключения

<ConnectionDetails />

#### Общие сведения о подключении

Клиент устанавливает подключение по протоколу HTTP(s). Поддержка RowBinary находится в разработке, см. [соответствующую задачу](https://github.com/ClickHouse/clickhouse-js/issues/216).

В следующем примере показано, как настроить подключение к ClickHouse Cloud. Предполагается, что значения `url` (включая
протокол и порт) и `password` заданы через переменные среды, и используется пользователь `default`.

**Пример:** создание экземпляра клиента Node.js с использованием переменных среды для конфигурации.

```ts
import { createClient } from '@clickhouse/client'

const client = createClient({
  url: process.env.CLICKHOUSE_HOST ?? 'http://localhost:8123',
  username: process.env.CLICKHOUSE_USER ?? 'default',
  password: process.env.CLICKHOUSE_PASSWORD ?? '',
})
```


Репозиторий клиента содержит несколько примеров, которые используют переменные окружения, например, [создание таблицы в ClickHouse Cloud](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts), [использование асинхронных вставок](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert.ts) и многие другие.

#### Пул подключений (только Node.js)

Чтобы избежать накладных расходов на установку соединения при каждом запросе, клиент создает пул подключений к ClickHouse для повторного использования, применяя механизм Keep-Alive. По умолчанию Keep-Alive включен, а размер пула подключений установлен в `10`, но вы можете изменить его с помощью параметра конфигурации `max_open_connections` (см. [configuration](./js.md#configuration)).

Нет гарантии, что одно и то же соединение из пула будет использоваться для последующих запросов, если только пользователь не установит `max_open_connections: 1`. Это требуется редко, но может понадобиться в случаях, когда используются временные таблицы.

См. также: [настройка Keep-Alive](./js.md#keep-alive-configuration-nodejs-only).

### Идентификатор запроса (Query ID)

Каждый метод, который отправляет запрос или выражение (`command`, `exec`, `insert`, `select`), возвращает `query_id` в результате. Этот уникальный идентификатор назначается клиентом на каждый запрос и может быть полезен для выборки данных из `system.query_log`,
если он включен в [конфигурации сервера](/operations/server-configuration-parameters/settings), или для отмены долгих запросов (см. [пример](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/cancel_query.ts)). При необходимости `query_id` может быть переопределён пользователем в параметрах методов `command`/`query`/`exec`/`insert`.

:::tip
Если вы переопределяете параметр `query_id`, вам необходимо обеспечить его уникальность для каждого вызова. Случайный UUID — хороший выбор.
:::

### Базовые параметры для всех методов клиента

Существует несколько параметров, которые можно применить ко всем методам клиента ([query](./js.md#query-method)/[command](./js.md#command-method)/[insert](./js.md#insert-method)/[exec](./js.md#exec-method)).

```ts
interface BaseQueryParams {
  // Настройки ClickHouse, применяемые на уровне запроса.
  clickhouse_settings?: ClickHouseSettings
  // Параметры для подстановки в запрос.
  query_params?: Record<string, unknown>
  // Экземпляр AbortSignal для отмены выполняемого запроса.
  abort_signal?: AbortSignal
  // Переопределение query_id; если не указан, будет автоматически сгенерирован случайный идентификатор.
  query_id?: string
  // Переопределение session_id; если не указан, идентификатор сеанса будет взят из конфигурации клиента.
  session_id?: string
  // Переопределение учетных данных; если не указаны, будут использованы учетные данные клиента.
  auth?: { username: string, password: string }
  // Список ролей для использования в данном запросе. Переопределяет роли, заданные в конфигурации клиента.
  role?: string | Array<string>
}
```

### Метод `query`

Используется для большинства операторов, которые возвращают ответ, например `SELECT`, а также для отправки DDL, таких как `CREATE TABLE`, и должен вызываться с использованием `await`. Ожидается, что возвращённый набор результатов будет обработан в приложении.

:::note
Для вставки данных существует отдельный метод [insert](./js.md#insert-method), а для DDL — [command](./js.md#command-method).
:::

```ts
interface QueryParams extends BaseQueryParams {
  // Запрос для выполнения, который может вернуть некоторые данные.
  query: string
  // Формат результирующего набора данных. По умолчанию: JSON.
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

#### Абстракции набора результатов и строк

`ResultSet` предоставляет несколько удобных методов для обработки данных в вашем приложении.

Реализация `ResultSet` в Node.js внутренне использует `Stream.Readable`, а веб-версия — Web API `ReadableStream`.

Вы можете считывать данные из `ResultSet`, вызывая методы `text` или `json` у `ResultSet` и загружая в память весь набор строк, возвращённых запросом.


Вы должны начинать чтение `ResultSet` как можно скорее, так как он удерживает поток ответа открытым и, следовательно, держит занятым базовое соединение. Клиент не буферизует входящие данные, чтобы избежать потенциального чрезмерного использования памяти приложением.

Или, если данные слишком велики, чтобы поместиться в памяти целиком, вы можете вызвать метод `stream` и обрабатывать данные в потоковом режиме. Каждый из получаемых фрагментов ответа будет преобразован в сравнительно небольшой массив строк (размер этого массива зависит от размера конкретного фрагмента, который клиент получает от сервера, так как он может различаться, и от размера отдельной строки), по одному фрагменту за раз.

Обратитесь к списку [поддерживаемых форматов данных](./js.md#supported-data-formats), чтобы определить, какой формат лучше всего подходит для потоковой обработки в вашем случае. Например, если вы хотите передавать объекты JSON, вы можете выбрать [JSONEachRow](/interfaces/formats/JSONEachRow), и каждая строка будет разобрана как объект JS, или, возможно, более компактный формат [JSONCompactColumns](/interfaces/formats/JSONCompactColumns), при котором каждая строка будет представлена компактным массивом значений. См. также: [streaming files](./js.md#streaming-files-nodejs-only).

:::important
Если `ResultSet` или его поток не будут полностью прочитаны, они будут уничтожены по истечении периода бездействия, задаваемого параметром `request_timeout`.
:::

```ts
interface BaseResultSet<Stream> {
  // См. раздел "Идентификатор запроса" выше
  query_id: string

  // Прочитать весь поток и получить содержимое в виде строки
  // Может использоваться с любым DataFormat
  // Должен вызываться только один раз
  text(): Promise<string>

  // Прочитать весь поток и разобрать содержимое как JS-объект
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

  // Разобрать содержимое строки как JS-объект
  json<T>(): T
}
```

**Пример:** (Node.js/Web) Запрос с результирующим набором данных в формате `JSONEachRow`, который полностью считывает поток и парсит содержимое в объекты JS.
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts).

```ts
const resultSet = await client.query({
  query: 'SELECT * FROM my_table',
  format: 'JSONEachRow',
})
const dataset = await resultSet.json() // или `row.text` для пропуска парсинга JSON
```

**Пример:** (только Node.js) Потоковое получение результата запроса в формате `JSONEachRow` с использованием классического подхода `on('data')`. Это эквивалентно синтаксису `for await const`. [Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row.ts).

```ts
const rows = await client.query({
  query: 'SELECT number FROM system.numbers_mt LIMIT 5',
  format: 'JSONEachRow', // или JSONCompactEachRow, JSONStringsEachRow и т. д.
})
const stream = rows.stream()
stream.on('data', (rows: Row[]) => {
  rows.forEach((row: Row) => {
    console.log(row.json()) // или `row.text` для пропуска парсинга JSON
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

**Пример:** (только Node.js) потоковое получение результата запроса в формате `CSV` с использованием классического обработчика `on('data')`. Этот подход взаимозаменяем с синтаксисом `for await const`.
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


**Пример:** (только для Node.js) потоковое получение результатов запроса как JS-объектов в формате `JSONEachRow`, обрабатываемых с использованием синтаксиса `for await const`. Это взаимозаменяемо с классическим подходом `on('data')`.
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
Синтаксис `for await const` требует немного меньше кода, чем подход с `on('data')`, но может негативно сказаться на производительности.
См. [эту задачу в репозитории Node.js](https://github.com/nodejs/node/issues/31979) для получения дополнительной информации.
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

### Метод INSERT

Это основной способ вставки данных.

```ts
export interface InsertResult {
  query_id: string
  executed: boolean
}

interface ClickHouseClient {
  insert(params: InsertParams): Promise<InsertResult>
}
```

Тип возвращаемого значения минималистичный, так как мы не ожидаем, что с сервера будут возвращены какие-либо данные, и сразу же полностью читаем поток ответа.

Если методу `insert` был передан пустой массив, оператор INSERT не будет отправлен на сервер; вместо этого метод немедленно завершится с результатом `{ query_id: '...', executed: false }`. Если в этом случае `query_id` не был передан в параметрах метода, в результате он будет пустой строкой, поскольку возврат случайного UUID, сгенерированного на стороне клиента, может ввести в заблуждение: запрос с таким `query_id` не будет существовать в таблице `system.query_log`.

Если оператор INSERT был отправлен на сервер, флаг `executed` будет иметь значение `true`.

#### Метод insert и стриминг в Node.js

Он может работать либо с `Stream.Readable`, либо с обычным `Array<T>`, в зависимости от [формата данных](./js.md#supported-data-formats), указанного для метода `insert`. См. также раздел о [стриминге файлов](./js.md#streaming-files-nodejs-only).

Метод `insert` рекомендуется вызывать с `await`; однако можно указать входной поток и ожидать выполнения операции `insert` позже — только после завершения потока (что также завершит промис `insert`). Это потенциально может быть полезно для обработчиков событий и аналогичных сценариев, но обработка ошибок может оказаться нетривиальной из‑за большого количества крайних случаев на стороне клиента. Вместо этого рассмотрите возможность использования [асинхронных вставок](/optimize/asynchronous-inserts), как показано в [этом примере](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert_without_waiting.ts).

:::tip
Если у вас есть нестандартный оператор INSERT, который сложно выразить с помощью этого метода, рассмотрите использование [метода `command`](./js.md#command-method).

Вы можете посмотреть, как он используется, в примерах [INSERT INTO ... VALUES](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_values_and_functions.ts) и [INSERT INTO ... SELECT](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_from_select.ts).
:::


```ts
interface InsertParams<T> extends BaseQueryParams {
  // Имя таблицы для вставки данных
  table: string
  // Набор данных для вставки.
  values: ReadonlyArray<T> | Stream.Readable
  // Формат вставляемого набора данных.
  format?: DataFormat
  // Позволяет указать столбцы, в которые будут вставлены данные.
  // - Массив вида `['a', 'b']` сгенерирует: `INSERT INTO table (a, b) FORMAT DataFormat`
  // - Объект вида `{ except: ['a', 'b'] }` сгенерирует: `INSERT INTO table (* EXCEPT (a, b)) FORMAT DataFormat`
  // По умолчанию данные вставляются во все столбцы таблицы,
  // и сгенерированный оператор будет: `INSERT INTO table FORMAT DataFormat`.
  columns?: NonEmptyArray<string> | { except: NonEmptyArray<string> }
}
```

См. также: [Базовые параметры для всех клиентских методов](./js.md#base-parameters-for-all-client-methods).

:::important
Отмена запроса с помощью `abort_signal` не гарантирует, что вставка данных не была выполнена, поскольку сервер мог получить часть потоковых данных до момента отмены.
:::

**Пример:** (Node.js/Web) Вставить массив значений.
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts).

```ts
await client.insert({
  table: 'my_table',
  // структура должна соответствовать желаемому формату, в данном примере JSONEachRow
  values: [
    { id: 42, name: 'foo' },
    { id: 42, name: 'bar' },
  ],
  format: 'JSONEachRow',
})
```

**Пример:** (только Node.js) Вставка потока данных из CSV-файла.
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts). См. также: [потоковая передача файлов](./js.md#streaming-files-nodejs-only).

```ts
await client.insert({
  table: 'my_table',
  values: fs.createReadStream('./path/to/a/file.csv'),
  format: 'CSV',
})
```

**Пример**: исключение отдельных столбцов из оператора INSERT.

Предположим, у нас есть следующее определение таблицы:

```sql
CREATE OR REPLACE TABLE mytable
(id UInt32, message String)
ENGINE MergeTree()
ORDER BY (id)
```

Вставить только определённый столбец:

```ts
// Сгенерированная инструкция: INSERT INTO mytable (message) FORMAT JSONEachRow
await client.insert({
  table: 'mytable',
  values: [{ message: 'foo' }],
  format: 'JSONEachRow',
  // Значение столбца `id` для данной строки будет равно нулю (по умолчанию для UInt32)
  columns: ['message'],
})
```

Исключить определённые столбцы:

```ts
// Сгенерированный запрос: INSERT INTO mytable (* EXCEPT (message)) FORMAT JSONEachRow
await client.insert({
  table: tableName,
  values: [{ id: 144 }],
  format: 'JSONEachRow',
  // Значение столбца `message` для этой строки будет пустой строкой
  columns: {
    except: ['message'],
  },
})
```

См. [исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_exclude_columns.ts) для получения дополнительной информации.

**Пример**: вставка в базу данных, отличную от той, что указана в экземпляре клиента. [Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_into_different_db.ts).

```ts
await client.insert({
  table: 'mydb.mytable', // Полное квалифицированное имя, включая базу данных
  values: [{ id: 42, message: 'foo' }],
  format: 'JSONEachRow',
})
```

#### Ограничения веб-версии

В данный момент операции вставки в `@clickhouse/client-web` работают только с форматами `Array<T>` и `JSON*`.
Вставка потоков в веб-версии пока не поддерживается из-за ограниченной поддержки в браузерах.

Соответственно, интерфейс `InsertParams` для веб-версии выглядит немного иначе, чем в Node.js-версии,
так как `values` ограничены только типом `ReadonlyArray<T>`:


```ts
interface InsertParams<T> extends BaseQueryParams {
  // Имя таблицы для вставки данных
  table: string
  // Набор данных для вставки.
  values: ReadonlyArray<T>
  // Формат вставляемого набора данных.
  format?: DataFormat
  // Позволяет указать, в какие столбцы будут вставлены данные.
  // - Массив вида `['a', 'b']` сгенерирует: `INSERT INTO table (a, b) FORMAT DataFormat`
  // - Объект вида `{ except: ['a', 'b'] }` сгенерирует: `INSERT INTO table (* EXCEPT (a, b)) FORMAT DataFormat`
  // По умолчанию данные вставляются во все столбцы таблицы,
  // и сгенерированный оператор будет: `INSERT INTO table FORMAT DataFormat`.
  columns?: NonEmptyArray<string> | { except: NonEmptyArray<string> }
}
```

Это может измениться в будущем. См. также: [Базовые параметры для всех клиентских методов](./js.md#base-parameters-for-all-client-methods).

### Метод command

Может использоваться для операторов, которые не возвращают результат, когда предложение `FORMAT` неприменимо или когда вас вообще не интересует ответ. Примером такого оператора может быть `CREATE TABLE` или `ALTER TABLE`.

Должен вызываться с `await`.

Поток ответа немедленно закрывается, что означает, что подлежащий сетевой сокет освобождается.

```ts
interface CommandParams extends BaseQueryParams {
  // Запрос для выполнения.
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

**Пример:** (Node.js/Web) Создайте таблицу в ClickHouse Cloud.
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts).

```ts
await client.command({
  query: `
    CREATE TABLE IF NOT EXISTS my_cloud_table
    (id UInt64, name String)
    ORDER BY (id)
  `,
  // Рекомендуется при работе с кластером во избежание ситуаций, когда ошибка обработки запроса возникает после того, 
  // как код ответа и HTTP-заголовки уже отправлены клиенту.
  // См. https://clickhouse.com/docs/interfaces/http/#response-buffering
  clickhouse_settings: {
    wait_end_of_query: 1,
  },
})
```

**Пример:** (Node.js/Web) Создайте таблицу в самостоятельно развернутом экземпляре ClickHouse.
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
Отмена запроса с помощью `abort_signal` не гарантирует, что выражение не было выполнено сервером.
:::

### Метод exec

Если у вас есть произвольный запрос, который не подходит для `query`/`insert`,
и вас интересует результат, вы можете использовать `exec` как альтернативу `command`.

`exec` возвращает читаемый поток, который ОБЯЗАТЕЛЬНО должен быть либо прочитан, либо уничтожен на стороне приложения.

```ts
interface ExecParams extends BaseQueryParams {
  // Запрос для выполнения.
  query: string
}

interface ClickHouseClient {
  exec(params: ExecParams): Promise<QueryResult>
}
```

См. также: [Базовые параметры для всех клиентских методов](./js.md#base-parameters-for-all-client-methods).

Тип возвращаемого значения Stream отличается в версиях для Node.js и Web.

Node.js:

```ts
export interface QueryResult {
  stream: Stream.Readable
  query_id: string
}
```

Веб-интерфейс:

```ts
export interface QueryResult {
  stream: ReadableStream
  query_id: string
}
```

### Ping

Метод `ping`, предназначенный для проверки статуса подключения, возвращает `true`, если сервер доступен.

Если сервер недоступен, исходная ошибка также содержится в результате.

```ts
type PingResult =
  | { success: true }
  | { success: false; error: Error }
```


/** Параметры запроса проверки состояния с использованием встроенной конечной точки `/ping`.

- Это поведение по умолчанию для версии Node.js. _/
  export type PingParamsWithEndpoint = {
  select: false
  /** Экземпляр AbortSignal для отмены выполняющегося запроса. _/
  abort_signal?: AbortSignal
  /** Дополнительные HTTP-заголовки, которые нужно добавить к этому запросу. \*/
  http_headers?: Record<string, string>
  }
  /** Параметры запроса проверки состояния с использованием запроса SELECT.
- Это поведение по умолчанию для Web-версии, так как конечная точка `/ping` не поддерживает CORS.
- Большинство стандартных параметров метода `query`, например `query_id`, `abort_signal`, `http_headers` и т. д., будут работать,
- за исключением `query_params`, которые не имеют смысла для этого метода. \*/
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

Ping может быть полезным инструментом для проверки доступности сервера при запуске приложения, особенно в ClickHouse Cloud, где экземпляр может простаивать и «просыпается» после пинга: в этом случае может потребоваться выполнить пинг несколько раз с паузой между попытками.

Обратите внимание, что по умолчанию версия для Node.js использует конечную точку `/ping`, тогда как Web-версия использует простой запрос `SELECT 1` для получения аналогичного результата, поскольку конечная точка `/ping` не поддерживает CORS.

**Пример:** (Node.js/Web) простой пинг экземпляра сервера ClickHouse. Примечание: для Web-версии перехватываемые ошибки будут другими.
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/ping.ts).

```ts
const result = await client.ping();
if (!result.success) {
  // process result.error
}
````

**Пример:** если вы хотите также проверить учетные данные при вызове метода `ping` или указать дополнительные параметры, такие как `query_id`, вы можете использовать его следующим образом:

```ts
const result = await client.ping({
  select: true /* query_id, abort_signal, http_headers или любые другие параметры запроса */
})
```

Метод `ping` поддерживает большинство стандартных параметров метода `query` — см. типизацию `PingParamsWithSelectQuery`.

### Close (только Node.js) {#close-nodejs-only}

Закрывает все открытые соединения и освобождает ресурсы. В Web-версии не выполняет никаких действий.

```ts
await client.close()
```


## Потоковая передача файлов (только Node.js) {#streaming-files-nodejs-only}

В репозитории клиента есть несколько примеров потоковой передачи файлов с популярными форматами данных (NDJSON, CSV, Parquet).

- [Потоковая передача из файла NDJSON](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_ndjson.ts)
- [Потоковая передача из файла CSV](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts)
- [Потоковая передача из файла Parquet](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_parquet.ts)
- [Потоковая передача в файл Parquet](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts)

Потоковая запись других форматов в файл должна выполняться аналогично Parquet; 
единственное отличие — в формате, указанном в вызове `query` (`JSONEachRow`, `CSV` и т. д.), и имени выходного файла.



## Поддерживаемые форматы данных {#supported-data-formats}

Клиент обрабатывает форматы данных в виде JSON или текста.

Если вы укажете `format` как один из форматов семейства JSON (`JSONEachRow`, `JSONCompactEachRow` и т.д.), клиент будет сериализовывать и десериализовывать данные при передаче по сети.

Данные, предоставленные в «сыром» текстовом формате (семейства `CSV`, `TabSeparated` и `CustomSeparated`), отправляются по сети без дополнительных преобразований.

:::tip
Может возникнуть путаница между JSON как общим форматом и [форматом ClickHouse JSON](/interfaces/formats/JSON). 

Клиент поддерживает потоковую передачу объектов JSON с такими форматами, как [JSONEachRow](/interfaces/formats/JSONEachRow) (см. обзор таблицы для других форматов, удобных для потоковой обработки; см. также [примеры `select_streaming_` в репозитории клиента](https://github.com/ClickHouse/clickhouse-js/tree/main/examples/node)). 

Дело в том, что такие форматы, как [ClickHouse JSON](/interfaces/formats/JSON) и некоторые другие, представляются как единый объект в ответе и не могут передаваться клиентом в потоковом режиме.
:::

| Format                                     | Ввод (массив) | Ввод (объект) | Ввод/вывод (Stream)   | Вывод (JSON)  | Вывод (текст)  |
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



Для Parquet основным сценарием использования `SELECT`-запросов, скорее всего, будет запись результирующего потока в файл. См. [пример](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts) в репозитории клиента.

`JSONEachRowWithProgress` — это формат только для вывода, который поддерживает отображение прогресса в потоке. См. [этот пример](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_json_each_row_with_progress.ts) для получения дополнительной информации.

Полный список форматов ввода и вывода ClickHouse доступен 
[здесь](/interfaces/formats).



## Поддерживаемые типы данных ClickHouse

:::note
Соответствующий тип JS важен для любых форматов `JSON*`, кроме тех, которые представляют всё в виде строки (например, `JSONStringEachRow`).
:::

| Type                   | Status         | JS type                          |
| ---------------------- | -------------- | -------------------------------- |
| UInt8/16/32            | ✔️             | number                           |
| UInt64/128/256         | ✔️ ❗- см. ниже | string                           |
| Int8/16/32             | ✔️             | number                           |
| Int64/128/256          | ✔️ ❗- см. ниже | string                           |
| Float32/64             | ✔️             | number                           |
| Decimal                | ✔️ ❗- см. ниже | number                           |
| Boolean                | ✔️             | boolean                          |
| String                 | ✔️             | string                           |
| FixedString            | ✔️             | string                           |
| UUID                   | ✔️             | string                           |
| Date32/64              | ✔️             | string                           |
| DateTime32/64          | ✔️ ❗- см. ниже | string                           |
| Enum                   | ✔️             | string                           |
| LowCardinality         | ✔️             | string                           |
| Array(T)               | ✔️             | T[]                              |
| (new) JSON             | ✔️             | object                           |
| Variant(T1, T2...)     | ✔️             | T (зависит от варианта)          |
| Dynamic                | ✔️             | T (зависит от варианта)          |
| Nested                 | ✔️             | T[]                              |
| Tuple(T1, T2, ...)     | ✔️             | [T1, T2, ...]                    |
| Tuple(n1 T1, n2 T2...) | ✔️             | &#123; n1: T1; n2: T2; ...&#125; |
| Nullable(T)            | ✔️             | тип JS для T или null            |
| IPv4                   | ✔️             | string                           |
| IPv6                   | ✔️             | string                           |
| Point                  | ✔️             | [ number, number ]               |
| Ring                   | ✔️             | Array&lt;Point&gt;               |
| Polygon                | ✔️             | Array&lt;Ring&gt;                |
| MultiPolygon           | ✔️             | Array&lt;Polygon&gt;             |
| Map(K, V)              | ✔️             | Record&lt;K, V&gt;               |
| Time/Time64            | ✔️             | string                           |

Полный список поддерживаемых форматов ClickHouse доступен
[здесь](/sql-reference/data-types/).

См. также:

* [Примеры работы с Dynamic/Variant/JSON](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/dynamic_variant_json.ts)
* [Примеры работы с Time/Time64](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/time_time64.ts)

### Особенности типов Date/Date32

Поскольку клиент вставляет значения без дополнительного преобразования типов, в столбцы типов `Date`/`Date32` можно вставлять данные только в виде строк.

**Пример:** Вставка значения типа `Date`.
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/ba387d7f4ce375a60982ac2d99cb47391cf76cec/__tests__/integration/date_time.test.ts)

```ts
await client.insert({
  table: 'my_table',
  values: [ { date: '2022-09-05' } ],
  format: 'JSONEachRow',
})
```

Однако если вы используете столбцы типа `DateTime` или `DateTime64`, вы можете использовать как строки, так и объекты типа JS Date. Объекты JS Date можно передавать в `insert` как есть при `date_time_input_format`, установленном в `best_effort`. См. этот [пример](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_js_dates.ts) для более подробной информации.

### Особенности типов Decimal*

Можно вставлять значения Decimal с использованием форматов семейства `JSON*`. Предположим, у нас есть таблица, определённая следующим образом:

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

Однако при запросе данных в форматах `JSON*` ClickHouse по умолчанию будет возвращать значения типов `Decimal` как *числа*, что может привести к потере точности. Чтобы этого избежать, можно явно приводить `Decimal` к строковому типу в запросе:

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

См. [этот пример](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_decimals.ts) для подробностей.

### Целочисленные типы: Int64, Int128, Int256, UInt64, UInt128, UInt256

Хотя сервер может принимать значение как число, оно возвращается как строка в форматах вывода семейства `JSON*`, чтобы избежать
целочисленного переполнения, так как максимальные значения для этих типов превышают `Number.MAX_SAFE_INTEGER`.

Однако это поведение можно изменить
с помощью настройки [`output_format_json_quote_64bit_integers`](/operations/settings/formats#output_format_json_quote_64bit_integers).

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


## Параметры ClickHouse

Клиент может настраивать поведение ClickHouse с помощью механизма [settings](/operations/settings/settings/).
Параметры могут быть заданы на уровне экземпляра клиента, чтобы они применялись к каждому запросу,
отправляемому в ClickHouse:

```ts
const client = createClient({
  clickhouse_settings: {}
})
```

Или настройку можно задать на уровне запроса:

```ts
client.query({
  clickhouse_settings: {}
})
```

Файл объявлений типов со всеми поддерживаемыми настройками ClickHouse можно найти
[здесь](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/settings.ts).

:::important
Убедитесь, что пользователь, от имени которого выполняются запросы, имеет достаточные права для изменения этих настроек.
:::


## Расширенные темы

### Запросы с параметрами

Вы можете создать запрос с параметрами и передавать им значения из клиентского приложения. Это позволяет не форматировать
запрос с конкретными динамическими значениями на стороне клиента.

Сформируйте запрос как обычно, затем заключите в фигурные скобки значения параметров, которые вы хотите передать из приложения в запрос, в следующем формате:

```text
{<имя>: <тип_данных>}
```

где:

* `name` — идентификатор плейсхолдера.
* `data_type` - [тип данных](/sql-reference/data-types/) значения параметра приложения.

**Пример:** Запрос с параметрами.
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/query_with_parameter_binding.ts)
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

См. [https://clickhouse.com/docs/interfaces/cli#cli-queries-with-parameters-syntax](https://clickhouse.com/docs/interfaces/cli#cli-queries-with-parameters-syntax) для получения дополнительной информации.

### Сжатие

Важно: сжатие запросов в настоящее время недоступно в веб-версии. Сжатие ответов работает как обычно. Версия для Node.js поддерживает оба варианта.

При работе приложений с большими объемами данных по сети будет полезно включить сжатие. В настоящее время поддерживается только `GZIP` с использованием [zlib](https://nodejs.org/docs/latest-v14.x/api/zlib.html).

```typescript
createClient({
  compression: {
    response: true,
    request: true
  }
})
```

Параметры конфигурации следующие:

* `response: true` указывает серверу ClickHouse возвращать сжатое тело ответа. Значение по умолчанию: `response: false`
* `request: true` включает сжатие тела запроса на стороне клиента. Значение по умолчанию: `request: false`

### Логирование (только для Node.js)

:::important
Функциональность логирования является экспериментальной и может измениться в будущем.
:::

Реализация логгера по умолчанию выводит записи журнала в `stdout` через методы `console.debug/info/warn/error`.
Вы можете настроить логику логирования, предоставив `LoggerClass`, и выбрать нужный уровень логирования с помощью параметра `level` (по умолчанию `OFF`):

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

В настоящее время клиент регистрирует следующие события:

* `TRACE` — низкоуровневая информация о жизненном цикле сокетов Keep-Alive
* `DEBUG` — информация об ответе (без заголовков авторизации и сведений о хосте)
* `INFO` — в основном не используется, выводит текущий уровень логирования при инициализации клиента
* `WARN` — нефатальные ошибки; неудачный запрос `ping` записывается как предупреждение, поскольку исходная ошибка включена в возвращаемый результат
* `ERROR` — фатальные ошибки из методов `query`/`insert`/`exec`/`command`, например, неудачный запрос

Реализацию Logger по умолчанию можно найти [здесь](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/logger.ts).

### TLS-сертификаты (только Node.js)

Клиент Node.js при необходимости поддерживает как базовый (только Certificate Authority),
так и взаимный (Certificate Authority и клиентские сертификаты) TLS.

Пример базовой конфигурации TLS при условии, что ваши сертификаты находятся в папке `certs`,
а имя файла CA — `CA.pem`:

```ts
const client = createClient({
  url: 'https://<hostname>:<port>',
  username: '<username>',
  password: '<password>', // при необходимости
  tls: {
    ca_cert: fs.readFileSync('certs/CA.pem'),
  },
})
```

Пример настройки взаимного TLS с использованием клиентских сертификатов:


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

Полные примеры [базового](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/basic_tls.ts) и [взаимного](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/mutual_tls.ts) TLS смотрите в репозитории.

### Конфигурация Keep-Alive (только для Node.js)

Клиент по умолчанию включает Keep-Alive во встроенном HTTP-агенте, что означает повторное использование установленных сокетов для последующих запросов и отправку заголовка `Connection: keep-alive`. Сокеты, находящиеся в состоянии ожидания, по умолчанию остаются в пуле соединений 2500 миллисекунд (см. [заметки по настройке этого параметра](./js.md#adjusting-idle_socket_ttl)).

Ожидается, что значение `keep_alive.idle_socket_ttl` будет заметно ниже значений в конфигурации сервера/балансировщика нагрузки. Основная причина в том, что, так как HTTP/1.1 позволяет серверу закрывать сокеты без уведомления клиента, если сервер или балансировщик нагрузки закроет соединение *раньше*, чем это сделает клиент, клиент может попытаться повторно использовать уже закрытый сокет, что приведёт к ошибке `socket hang up`.

Если вы изменяете `keep_alive.idle_socket_ttl`, помните, что оно всегда должно быть согласовано с конфигурацией Keep-Alive на сервере/балансировщике нагрузки и **всегда ниже** её, чтобы гарантировать, что сервер никогда не закроет открытое соединение первым.

#### Настройка `idle_socket_ttl`

Клиент задаёт `keep_alive.idle_socket_ttl` равным 2500 миллисекундам, так как это можно считать наиболее безопасным значением по умолчанию; на стороне сервера `keep_alive_timeout` может быть установлен [на значение до 3 секунд в версиях ClickHouse до 23.11](https://github.com/ClickHouse/ClickHouse/commit/1685cdcb89fe110b45497c7ff27ce73cc03e82d1) без модификаций `config.xml`.

:::warning
Если вас устраивает производительность и вы не сталкиваетесь с какими-либо проблемами, рекомендуется **не** увеличивать значение настройки `keep_alive.idle_socket_ttl`, так как это может привести к потенциальным ошибкам «Socket hang-up»; кроме того, если ваше приложение отправляет много запросов и между ними нет больших простоев, значения по умолчанию должно быть достаточно, так как сокеты не будут простаивать достаточно долго, и клиент будет удерживать их в пуле.
:::

Вы можете найти корректное значение тайм-аута Keep-Alive в заголовках ответа сервера, выполнив следующую команду:

```sh
curl -v --data-binary "SELECT 1" <clickhouse_url>
```

Проверьте значения заголовков `Connection` и `Keep-Alive` в ответе. Например:

```text
< Connection: Keep-Alive
< Keep-Alive: timeout=10
```

В этом случае `keep_alive_timeout` составляет 10 секунд, и вы можете попробовать увеличить `keep_alive.idle_socket_ttl` до 9000 или даже 9500 миллисекунд, чтобы поддерживать простаивающие сокеты в открытом состоянии немного дольше, чем по умолчанию. Следите за возможными ошибками «Socket hang-up», которые будут указывать на то, что сервер закрывает соединения раньше, чем это делает клиент, и уменьшайте значение, пока ошибки не исчезнут.

#### Диагностика неполадок

Если вы сталкиваетесь с ошибками `socket hang up`, даже используя последнюю версию клиента, есть следующие варианты решения этой проблемы:

* Включите логи как минимум с уровнем `WARN`. Это позволит проверить, есть ли в коде приложения непрочитанный или «висящий» поток: транспортный уровень запишет его в лог на уровне WARN, так как это потенциально может привести к закрытию сокета сервером. Вы можете включить логирование в конфигурации клиента следующим образом:

  ```ts
  const client = createClient({
    log: { level: ClickHouseLogLevel.WARN },
  })
  ```

* Проверьте код вашего приложения с включённым правилом ESLint [no-floating-promises](https://typescript-eslint.io/rules/no-floating-promises/), которое поможет выявить необработанные промисы, способные приводить к «висящим» потокам и сокетам.


* Немного уменьшите значение `keep_alive.idle_socket_ttl` в конфигурации сервера ClickHouse. В некоторых ситуациях, например при высокой сетевой задержке между клиентом и сервером, может быть полезно уменьшить `keep_alive.idle_socket_ttl` ещё на 200–500 миллисекунд, чтобы исключить ситуацию, когда исходящий запрос получает сокет, который сервер собирается закрыть.

* Если эта ошибка возникает во время длительных запросов, при которых не происходит обмена данными (например, длительный `INSERT FROM SELECT`), это может быть связано с тем, что балансировщик нагрузки закрывает простаивающие соединения. Можно попробовать принудительно передавать некоторые данные во время таких запросов, используя комбинацию следующих настроек ClickHouse:

  ```ts
  const client = createClient({
    // Здесь мы предполагаем, что у нас будут запросы с временем выполнения более 5 минут
    request_timeout: 400_000,
    /** Эти настройки в сочетании позволяют избежать проблем с тайм-аутом балансировщика нагрузки
     *  в случае длительных запросов без входящих или исходящих данных,
     *  таких как `INSERT FROM SELECT` и подобные, поскольку соединение может быть помечено балансировщиком как простаивающее и внезапно закрыто.
     *  В этом случае мы предполагаем, что у балансировщика тайм-аут простаивающего соединения — 120 с, поэтому мы устанавливаем 110 с как «безопасное» значение. */
    clickhouse_settings: {
      send_progress_in_http_headers: 1,
      http_headers_progress_interval_ms: '110000', // UInt64, должно передаваться в виде строки
    },
  })
  ```

  Однако имейте в виду, что в последних версиях Node.js общий размер полученных заголовков ограничен 16 КБ; после получения определённого количества заголовков прогресса (в наших тестах это было около 70–80) будет сгенерировано исключение.

  Также возможно использовать полностью иной подход, полностью избегая времени ожидания «на проводе»; это можно сделать, используя «особенность» HTTP-интерфейса, заключающуюся в том, что мутации не отменяются при потере соединения. Для подробностей см. [этот пример (часть 2)](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/long_running_queries_timeouts.ts).

* Функцию Keep-Alive можно полностью отключить. В этом случае клиент также будет добавлять заголовок `Connection: close` к каждому запросу, а используемый HTTP-агент не будет переиспользовать соединения. Настройка `keep_alive.idle_socket_ttl` будет игнорироваться, так как не будет простаивающих сокетов. Это приведёт к дополнительным накладным расходам, поскольку для каждого запроса будет устанавливаться новое соединение.

  ```ts
  const client = createClient({
    keep_alive: {
      enabled: false,
    },
  })
  ```

### Пользователи с доступом только для чтения

При использовании клиента с [пользователем readonly=1](/operations/settings/permissions-for-queries#readonly) сжатие ответа не может быть включено, так как для этого требуется настройка `enable_http_compression`. Следующая конфигурация приведёт к ошибке:

```ts
const client = createClient({
  compression: {
    response: true, // не работает с пользователем readonly=1
  },
})
```

См. [пример](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/read_only_user.ts), в котором подробнее показаны ограничения пользователя с readonly=1.

### Прокси с путем в URL (pathname)

Если ваш экземпляр ClickHouse находится за прокси и в его URL есть путь, например [http://proxy:8123/clickhouse&#95;server](http://proxy:8123/clickhouse_server), укажите `clickhouse_server` в качестве параметра конфигурации `pathname` (с ведущим слешем или без него); в противном случае, если он указан напрямую в `url`, он будет интерпретирован как параметр `database`. Поддерживаются несколько сегментов, например `/my_proxy/db`.

```ts
const client = createClient({
  url: 'http://proxy:8123',
  pathname: '/clickhouse_server',
})
```

### Обратный прокси с аутентификацией

Если перед вашим развертыванием ClickHouse стоит обратный прокси с аутентификацией, вы можете использовать параметр `http_headers`, чтобы передать туда необходимые заголовки:

```ts
const client = createClient({
  http_headers: {
    'My-Auth-Header': '...',
  },
})
```

### Пользовательский HTTP/HTTPS-агент (экспериментальная функция, только для Node.js)

:::warning
Это экспериментальная функция, которая в будущих релизах может измениться с нарушением обратной совместимости. Стандартной реализации и настроек клиента по умолчанию должно быть достаточно для большинства сценариев использования. Используйте эту функцию только в том случае, если вы уверены, что она вам нужна.
:::


По умолчанию клиент будет настраивать базовый HTTP(S)‑агент, используя параметры, указанные в конфигурации клиента (такие как `max_open_connections`, `keep_alive.enabled`, `tls`), который будет обрабатывать соединения с сервером ClickHouse. Кроме того, если используются TLS‑сертификаты, базовый агент будет настроен с необходимыми сертификатами, и будут применены корректные заголовки аутентификации TLS.

Начиная с версии 1.2.0, можно передать клиенту пользовательский HTTP(S)‑агент, заменив базовый агент по умолчанию. Это может быть полезно в случае сложных сетевых конфигураций. Если передан пользовательский агент, применяются следующие условия:

* Опции `max_open_connections` и `tls` не будут *оказывать никакого влияния* и будут проигнорированы клиентом, так как являются частью конфигурации базового агента.
* `keep_alive.enabled` будет регулировать только значение по умолчанию заголовка `Connection` (`true` -&gt; `Connection: keep-alive`, `false` -&gt; `Connection: close`).
* Хотя управление неактивными сокетами keep-alive по-прежнему будет работать (так как оно не связано с агентом, а привязано к конкретному сокету), теперь можно полностью отключить его, установив значение `keep_alive.idle_socket_ttl` в `0`.

#### Примеры использования пользовательского агента

Использование пользовательского HTTP(S)‑агента без сертификатов:

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
  // При использовании пользовательского HTTPS-агента клиент не использует стандартную реализацию HTTPS-соединения; заголовки необходимо указать вручную
  http_headers: {
    'X-ClickHouse-User': 'username',
    'X-ClickHouse-Key': 'password',
  },
  // Важно: заголовок авторизации конфликтует с заголовками TLS; его необходимо отключить.
  set_basic_auth_header: false,
})
```

Использование настраиваемого HTTPS-агента с взаимной аутентификацией TLS:

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
  // При использовании пользовательского HTTPS-агента клиент не использует стандартную реализацию HTTPS-соединения; заголовки необходимо указать вручную
  http_headers: {
    'X-ClickHouse-User': 'username',
    'X-ClickHouse-Key': 'password',
    'X-ClickHouse-SSL-Certificate-Auth': 'on',
  },
  // Важно: заголовок авторизации конфликтует с заголовками TLS; его необходимо отключить.
  set_basic_auth_header: false,
})
```

При использовании сертификатов *и* кастомного *HTTPS*-агента, скорее всего, потребуется отключить заголовок авторизации по умолчанию с помощью настройки `set_basic_auth_header` (появившейся в версии 1.2.0), так как он конфликтует с TLS-заголовками. Все TLS-заголовки должны задаваться вручную.


## Известные ограничения (Node.js/web) {#known-limitations-nodejsweb}

- Для наборов результатов запросов отсутствуют мапперы данных, поэтому используются только языковые примитивы. Планируется добавить некоторые мапперы типов данных с поддержкой [формата RowBinary](https://github.com/ClickHouse/clickhouse-js/issues/216).
- Существуют некоторые [особенности типов данных Decimal* и Date\* / DateTime\*](./js.md#datedate32-types-caveats).
- При использовании форматов семейства JSON* числа больше Int32 представляются как строки, так как максимальные значения типов Int64+ превышают `Number.MAX_SAFE_INTEGER`. Дополнительные сведения см. в разделе [Integral types](./js.md#integral-types-int64-int128-int256-uint64-uint128-uint256).



## Известные ограничения (web) {#known-limitations-web}

- Стриминг для запросов `SELECT` работает, но отключён для вставок (в том числе на уровне типа).
- Сжатие запросов отключено, настройки игнорируются. Сжатие ответов работает.
- Поддержка логирования пока отсутствует.



## Советы по оптимизации производительности {#tips-for-performance-optimizations}

- Чтобы сократить потребление памяти приложением, рассмотрите возможность использования потоков для крупных вставок (например, из файлов) и выборок, когда это применимо. Для обработчиков событий и похожих сценариев использования [асинхронные вставки](/optimize/asynchronous-inserts) могут быть дополнительным вариантом, позволяющим минимизировать или даже полностью избежать пакетной обработки на стороне клиента. Примеры асинхронных вставок доступны в [репозитории клиента](https://github.com/ClickHouse/clickhouse-js/tree/main/examples) — файлы с префиксом `async_insert_` в имени.
- Клиент по умолчанию не использует сжатие запросов или ответов. Однако при выборке или вставке больших наборов данных можно рассмотреть включение сжатия через `ClickHouseClientConfigOptions.compression` (как только для `request` или `response`, так и для обоих сразу).
- Сжатие существенно снижает производительность. Включение его для `request` или `response` отрицательно скажется на скорости выборок или вставок соответственно, но уменьшит объём сетевого трафика, передаваемого приложением.



## Свяжитесь с нами {#contact-us}

Если у вас есть вопросы или нужна помощь, обращайтесь к нам в [Community Slack](https://clickhouse.com/slack) (канал `#clickhouse-js`) или через раздел [issues на GitHub](https://github.com/ClickHouse/clickhouse-js/issues).
