sidebar_label: 'JavaScript'
sidebar_position: 4
keywords: ['clickhouse', 'js', 'JavaScript', 'NodeJS', 'web', 'browser', 'Cloudflare', 'workers', 'client', 'connect', 'integrate']
slug: /integrations/javascript
description: 'Официальный JS-клиент для подключения к ClickHouse.'
title: 'ClickHouse JS'
---

import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

# ClickHouse JS

Официальный JS-клиент для подключения к ClickHouse.
Клиент написан на TypeScript и предоставляет типизацию для публичного API клиента.

Он не имеет зависимостей, оптимизирован для максимальной производительности и протестирован с различными версиями и конфигурациями ClickHouse (локальный одиночный узел, локальный кластер и ClickHouse Cloud).

Доступны две разные версии клиента для различных окружений:
- `@clickhouse/client` - только для Node.js
- `@clickhouse/client-web` - браузеры (Chrome/Firefox), Cloudflare workers

При использовании TypeScript убедитесь, что он не ниже [версии 4.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html), что позволяет использовать [синтаксис импорта и экспорта в строках](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#type-modifiers-on-import-names).

Исходный код клиента доступен в [репозитории ClickHouse-JS на GitHub](https://github.com/ClickHouse/clickhouse-js).
## Требования к окружению (Node.js) {#environment-requirements-nodejs}

Node.js должен быть доступен в окружении для работы клиента.
Клиент совместим со всеми [поддерживаемыми](https://github.com/nodejs/release#readme) версиями Node.js.

Как только версия Node.js достигает конца срока службы, клиент прекращает поддержку этой версии, так как она считается устаревшей и небезопасной.

Поддерживаемые текущие версии Node.js:

| Версия Node.js | Поддержка?  |
|----------------|-------------|
| 22.x           | ✔           |
| 20.x           | ✔           |
| 18.x           | ✔           |
| 16.x           | Успехи      |
## Требования к окружению (Web) {#environment-requirements-web}

Веб-версия клиента официально протестирована с последними браузерами Chrome/Firefox и может быть использована как зависимость, например, в приложениях React/Vue/Angular или Cloudflare workers.
## Установка {#installation}

Для установки последней стабильной версии клиента для Node.js выполните команду:

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

Скорее всего, клиент будет работать и со старыми версиями, однако эта поддержка предоставляется на основе «наилучших усилий» и не гарантируется. Если у вас версия ClickHouse старше 23.3, пожалуйста, ознакомьтесь с [политикой безопасности ClickHouse](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md) и рассмотрите возможность обновления.
## Примеры {#examples}

Мы стремимся охватить различные сценарии использования клиента в [примерах](https://github.com/ClickHouse/clickhouse-js/blob/main/examples) в репозитории клиента.

Обзор доступен в [README примеров](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/README.md#overview). 

Если что-то непонятно или отсутствует в примерах или в следующей документации, не стесняйтесь [связываться с нами](./js.md#contact-us).
### API клиента {#client-api}

Большинство примеров должны быть совместимы как с версиями для Node.js, так и с веб-версией клиента, если не указано иное.
#### Создание экземпляра клиента {#creating-a-client-instance}

Вы можете создать столько экземпляров клиента, сколько вам необходимо, с помощью фабрики `createClient`:

```ts
import { createClient } from '@clickhouse/client' // или '@clickhouse/client-web'

const client = createClient({
  /* конфигурация */
})
```

Если ваша среда не поддерживает ESM-модули, вы можете использовать синтаксис CJS вместо:

```ts
const { createClient } = require('@clickhouse/client');

const client = createClient({
  /* конфигурация */
})
```

Экземпляр клиента может быть [преднастроен](./js.md#configuration) во время инициализации.
#### Конфигурация {#configuration}

При создании экземпляра клиента можно настроить следующие параметры подключения:

| Параметр                                                                 | Описание                                                                                | Значение по умолчанию     | См. также                                                                                         |
|---------------------------------------------------------------------------|----------------------------------------------------------------------------------------|-------------------------|---------------------------------------------------------------------------------------------------|
| **url**?: string                                                          | URL экземпляра ClickHouse.                                                             | `http://localhost:8123` | [Документация по настройке URL](./js.md#url-configuration)                                       |
| **pathname**?: string                                                     | Необязательный путь, добавляемый к URL ClickHouse после его анализа клиентом.           | `''`                    | [Прокси с путем](./js.md#proxy-with-a-pathname)                                                |
| **request_timeout**?: number                                              | Тайм-аут запроса в миллисекундах.                                                     | `30_000`                | -                                                                                                 |
| **compression**?: `{ **response**?: boolean; **request**?: boolean }`   | Включить сжатие.                                                                       | -                       | [Документация по сжатию](./js.md#compression)                                                    |
| **username**?: string                                                     | Имя пользователя, от имени которого делаются запросы.                                 | `default`               | -                                                                                                 |
| **password**?: string                                                     | Пароль пользователя.                                                                    | `''`                    | -                                                                                                 |
| **application**?: string                                                  | Имя приложения, использующего клиент Node.js.                                          | `clickhouse-js`         | -                                                                                                 |
| **database**?: string                                                     | Имя базы данных для использования.                                                      | `default`               | -                                                                                                 |
| **clickhouse_settings**?: ClickHouseSettings                              | Настройки ClickHouse, которые будут применены ко всем запросам.                       | `{}`                    | -                                                                                                 |
| **log**?: `{ **LoggerClass**?: Logger, **level**?: ClickHouseLogLevel }`| Настройки внутреннего журнала клиента.                                                  | -                       | [Документация по журналированию](./js.md#logging-nodejs-only)                                    |
| **session_id**?: string                                                   | Необязательный идентификатор сессии ClickHouse, который будет отправлен с каждым запросом.| -                       | -                                                                                                 |
| **keep_alive**?: `{ **enabled**?: boolean }`                              | Включен по умолчанию как в версиях Node.js, так и в веб-версии.                       | -                       | -                                                                                                 |
| **http_headers**?: `Record<string, string>`                               | Дополнительные HTTP-заголовки для исходящих запросов ClickHouse.                      | -                       | [Обратный прокси с аутентификацией](./js.md#reverse-proxy-with-authentication)                  |
| **roles**?: string \|  string[]                                           | Название(я) роли ClickHouse, которые будут прикреплены к исходящим запросам.           | -                       | [Использование ролей с HTTP интерфейсом](/interfaces/http#setting-role-with-query-parameters)   |
#### Параметры конфигурации, специфичные для Node.js {#nodejs-specific-configuration-parameters}

| Параметр                                                                  | Описание                                                     | Значение по умолчанию | См. также                                                                                                |
|---------------------------------------------------------------------------|-------------------------------------------------------------|-----------------------|---------------------------------------------------------------------------------------------------------|
| **max_open_connections**?: number                                         | Максимальное количество открытых сокетов для одного хоста.  | `10`                  | -                                                                                                       |
| **tls**?: `{ **ca_cert**: Buffer, **cert**?: Buffer, **key**?: Buffer }`| Настройка TLS-сертификатов.                               | -                     | [Документация по TLS](./js.md#tls-certificates-nodejs-only)                                           |
| **keep_alive**?: `{ **enabled**?: boolean, **idle_socket_ttl**?: number }`| -                                                           | -                     | [Настройка Keep Alive](./js.md#keep-alive-configuration-nodejs-only)                                   |
| **http_agent**?: http.Agent \| https.Agent <br/><ExperimentalBadge/>    | Пользовательский HTTP-агент для клиента.                  | -                     | [Документация по HTTP-агентам](./js.md#custom-httphttps-agent-experimental-nodejs-only)               |
| **set_basic_auth_header**?: boolean <br/><ExperimentalBadge/>            | Установите заголовок `Authorization` с учетными данными базовой аутентификации. | `true`                | [использование этого параметра в документации для HTTP-агентов](./js.md#custom-httphttps-agent-experimental-nodejs-only) |
### Настройка URL {#url-configuration}

:::important
Настройки URL _всегда_ переопределят жестко заданные значения, и в этом случае будет выведено предупреждение.
:::

Можно настроить большинство параметров экземпляра клиента с помощью URL. Формат URL: `http[s]://[username:password@]hostname:port[/database][?param1=value1&param2=value2]`. В большинстве случаев имя конкретного параметра отражает его путь в интерфейсе опций конфигурации, с несколькими исключениями. Поддерживаются следующие параметры:

| Параметр                                  | Тип                                                           |
|--------------------------------------------|----------------------------------------------------------------|
| `pathname`                                 | произвольная строка.                                          |
| `application_id`                           | произвольная строка.                                          |
| `session_id`                               | произвольная строка.                                          |
| `request_timeout`                          | неотрицательное число.                                        |
| `max_open_connections`                     | неотрицательное число, больше нуля.                           |
| `compression_request`                      | boolean. См. ниже (1)                                         |
| `compression_response`                     | boolean.                                                      |
| `log_level`                                | допустимые значения: `OFF`, `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`. |
| `keep_alive_enabled`                       | boolean.                                                      |
| `clickhouse_setting_*` или `ch_*`          | см. ниже (2)                                                |
| (только для Node.js) `keep_alive_idle_socket_ttl` | неотрицательное число.                                         |

- (1) Для булевых значений допустимые значения будут `true`/`1` и `false`/`0`. 
- (2) Любой параметр с префиксом `clickhouse_setting_` или `ch_` будет иметь этот префикс удаленным, а остальная часть добавлена в `clickhouse_settings` клиента. Например, `?ch_async_insert=1&ch_wait_for_async_insert=1` будет эквивалентно:

```ts
createClient({
  clickhouse_settings: {
    async_insert: 1,
    wait_for_async_insert: 1,
  },
})
```

Примечание: булевые значения для `clickhouse_settings` должны передаваться как `1`/`0` в URL.

- (3) Похожим образом на (2), но для конфигурации заголовков `http_header`. Например, `?http_header_x-clickhouse-auth=foobar` будет эквивалентно:

```ts
createClient({
  http_headers: {
    'x-clickhouse-auth': 'foobar',
  },
})
```
### Подключение {#connecting}
#### Соберите ваши данные для подключения {#gather-your-connection-details}

<ConnectionDetails />
#### Обзор подключения {#connection-overview}

Клиент реализует подключение через протокол HTTP(s). Поддержка RowBinary на подходе, см. [связанную задачу](https://github.com/ClickHouse/clickhouse-js/issues/216).

Следующий пример демонстрирует, как установить подключение к ClickHouse Cloud. Предполагается, что значения `url` (включая протокол и порт) и `password` указаны через переменные окружения, а используется пользователь `default`.

**Пример:** Создание экземпляра клиента Node.js с использованием переменных окружения для конфигурации.

```ts
import { createClient } from '@clickhouse/client'

const client = createClient({
  url: process.env.CLICKHOUSE_HOST ?? 'http://localhost:8123',
  username: process.env.CLICKHOUSE_USER ?? 'default',
  password: process.env.CLICKHOUSE_PASSWORD ?? '',
})
```

Репозиторий клиента содержит множество примеров, использующих переменные окружения, такие как [создание таблицы в ClickHouse Cloud](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts), [использование асинхронных вставок](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert.ts) и многие другие.
#### Пул подключений (только для Node.js) {#connection-pool-nodejs-only}

Чтобы избежать накладных расходов на установление соединения при каждом запросе, клиент создает пул подключений к ClickHouse для повторного использования, используя механизм Keep-Alive. По умолчанию Keep-Alive включен, а размер пула подключений установлен на `10`, но вы можете изменить это с помощью параметра конфигурации `max_open_connections` [опция](./js.md#configuration). 

Нет гарантии, что одно и то же соединение в пуле будет использоваться для последующих запросов, если пользователь не установит `max_open_connections: 1`. Это редко необходимо, но может потребоваться в случаях, когда пользователи используют временные таблицы.

См. также: [Настройка Keep-Alive](./js.md#keep-alive-configuration-nodejs-only).
### Идентификатор запроса {#query-id}

Каждый метод, который отправляет запрос или оператор (`command`, `exec`, `insert`, `select`), предоставит `query_id` в результате. Этот уникальный идентификатор назначается клиентом для каждого запроса и может быть полезен для получения данных из `system.query_log`,
если он включен в [конфигурации сервера](/operations/server-configuration-parameters/settings), или для отмены долгих запросов (см. [пример](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/cancel_query.ts)). Если необходимо, `query_id` может быть переопределен пользователем в параметрах методов `command`/`query`/`exec`/`insert`.

:::tip
Если вы переопределяете параметр `query_id`, убедитесь, что он уникален для каждого вызова. Случайный UUID является хорошим выбором.
:::
### Базовые параметры для всех методов клиента {#base-parameters-for-all-client-methods}

Существуют несколько параметров, которые могут быть применены ко всем методам клиента ([query](./js.md#query-method)/[command](./js.md#command-method)/[insert](./js.md#insert-method)/[exec](./js.md#exec-method)).

```ts
interface BaseQueryParams {
  // Настройки ClickHouse, которые могут быть применены на уровне запроса.
  clickhouse_settings?: ClickHouseSettings
  // Параметры для привязки запроса.
  query_params?: Record<string, unknown>
  // Экземпляр AbortSignal для отмены текущего запроса.
  abort_signal?: AbortSignal
  // Переопределение query_id; если не указано, идентификатор будет сгенерирован автоматически.
  query_id?: string
  // Переопределение session_id; если не указано, идентификатор сессии будет взят из конфигурации клиента.
  session_id?: string
  // Переопределение учетных данных; если не указано, будут использованы учетные данные клиента.
  auth?: { username: string, password: string }
  // Конкретный список ролей, используемых для этого запроса. Переопределяет роли, установленные в конфигурации клиента.
  role?: string | Array<string>
}
```
### Метод запроса {#query-method}

Этот метод используется для большинства операторов, которые могут иметь ответ, таких как `SELECT`, или для отправки DDL, таких как `CREATE TABLE`, и должен ожидать завершения. Ожидается, что возвращаемый набор результатов будет обработан в приложении.

:::note
Существует специализированный метод [insert](./js.md#insert-method) для вставки данных и [command](./js.md#command-method) для DDL.
:::

```ts
interface QueryParams extends BaseQueryParams {
  // Запрос для выполнения, который может вернуть какие-либо данные.
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
Не указывайте предложение FORMAT в `query`, используйте параметр `format` вместо.
:::
#### Набор результатов и абстракции строки {#result-set-and-row-abstractions}

`ResultSet` предоставляет несколько удобных методов для обработки данных в вашем приложении.

Реализация `ResultSet` для Node.js использует `Stream.Readable` под капотом, в то время как веб-версия использует Web API `ReadableStream`.

Вы можете потреблять `ResultSet`, вызывая либо метод `text`, либо метод `json` у `ResultSet` и загружая весь набор строк, возвращаемых запросом, в память.

Вы должны начать потребление `ResultSet` как можно скорее, так как он удерживает поток ответа открытым и, следовательно, поддерживает подлежащее подключение активным. Клиент не буферизует входящие данные, чтобы избежать потенциального чрезмерного использования памяти приложением. 

В качестве альтернативы, если данные слишком велики, чтобы уместиться в память сразу, вы можете вызвать метод `stream` и обрабатывать данные в режиме потоковой передачи. Каждый из сегментов ответа будет преобразован в относительно небольшие массивы строк вместо (размер этого массива зависит от размера конкретного сегмента, который клиент получает от сервера, так как он может варьироваться, и размера отдельной строки), по одному сегменту за раз. 

Пожалуйста, ознакомьтесь со списком [поддерживаемых форматов данных](./js.md#supported-data-formats), чтобы определить, какой формат лучше всего подходит для потоковой передачи в вашем случае. Например, если вы хотите передать JSON-объекты, вы могли бы выбрать [JSONEachRow](/sql-reference/formats#jsoneachrow), и каждая строка будет обработана как JS-объект, или, возможно, более компактный формат [JSONCompactColumns](/sql-reference/formats#jsoncompactcolumns), который приведет к тому, что каждая строка будет компактным массивом значений. См. также: [потоковые файлы](./js.md#streaming-files-nodejs-only).

:::important
Если `ResultSet` или его поток не будут полностью потреблены, он будет уничтожен после периода бездействия, равного `request_timeout`.
:::

```ts
interface BaseResultSet<Stream> {
  // См. раздел "Идентификатор запроса" выше
  query_id: string

  // Потребить весь поток и получить содержимое в виде строки
  // Может использоваться с любым форматом данных
  // Должен быть вызван только один раз
  text(): Promise<string>

  // Потребить весь поток и разобрать содержимое как JS-объект
  // Может быть использован только с JSON-форматами
  // Должен быть вызван только один раз
  json<T>(): Promise<T>

  // Возвращает читаемый поток для ответов, которые можно передавать
  // Каждая итерация потока предоставляет массив Row[] в выбранном формате данных
  // Должен быть вызван только один раз
  stream(): Stream
}

interface Row {
  // Получить содержимое строки как обычную строку
  text: string

  // Разобрать содержимое строки как JS-объект
  json<T>(): T
}
```

**Пример:** (Node.js/Web) Запрос с результирующим набором данных в формате `JSONEachRow`, который потребляет весь поток и разбирает содержимое как JS-объекты. 
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts).

```ts
const resultSet = await client.query({
  query: 'SELECT * FROM my_table',
  format: 'JSONEachRow',
})
const dataset = await resultSet.json() // или `row.text`, чтобы избежать разбора JSON
```

**Пример:** (только для Node.js) Подача результата запроса в формате `JSONEachRow` с использованием классического подхода `on('data')`. Это можно использовать с синтаксисом `for await const`. [Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row.ts).

```ts
const rows = await client.query({
  query: 'SELECT number FROM system.numbers_mt LIMIT 5',
  format: 'JSONEachRow', // или JSONCompactEachRow, JSONStringsEachRow и т.д.
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

**Пример:** (только для Node.js) Подача результата запроса в формате `CSV` с использованием классического подхода `on('data')`. Это можно использовать с синтаксисом `for await const`.
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_text_line_by_line.ts)

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

**Пример:** (только для Node.js) Подача результата запроса как JS-объекты в формате `JSONEachRow`, потребляемых с использованием синтаксиса `for await const`. Это можно использовать с классическим подходом `on('data')`.
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
Синтаксис `for await const` имеет немного менее кода, чем подход `on('data')`, но может негативно повлиять на производительность.
Смотрите [эту проблему в репозитории Node.js](https://github.com/nodejs/node/issues/31979) для получения дополнительной информации.
:::

**Пример:** (только для веба) Итерация по `ReadableStream` объектов.

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

Тип возвращаемого значения минимален, так как мы не ожидаем никаких данных в ответ от сервера и сразу закрываем поток ответа.

Если для метода вставки был передан пустой массив, оператор вставки не будет отправлен на сервер; вместо этого метод немедленно вернет результат с `{ query_id: '...', executed: false }`. Если `query_id` не был передан в параметрах метода, он будет пустой строкой в результате, так как возвращение случайного UUID, сгенерированного клиентом, может вызвать путаницу, ведь запрос с таким `query_id` не будет существовать в таблице `system.query_log`.

Если оператор вставки был отправлен на сервер, флаг `executed` будет равен `true`.
```
#### Метод вставки и потоковая передача в Node.js {#insert-method-and-streaming-in-nodejs}

Он может работать как с `Stream.Readable`, так и с обычным `Array<T>`, в зависимости от [формата данных](./js.md#supported-data-formats), указанного в методе `insert`. См. также этот раздел о [потоковой передаче файлов](./js.md#streaming-files-nodejs-only).

Метод вставки предполагается ожидать; однако, возможно указать входной поток и дождаться операции `insert` позже, только когда поток будет завершен (что также разрешит обещание `insert`). Это может быть полезно для слушателей событий и аналогичных сценариев, но обработка ошибок может быть нетривиальной и иметь множество крайних случаев на стороне клиента. Вместо этого рекомендуется использовать [асинхронные вставки](/optimize/asynchronous-inserts), как показано в [этом примере](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert_without_waiting.ts).

:::tip
Если у вас есть собственное выражение INSERT, которое сложно смоделировать с помощью этого метода, рассмотрите возможность использования [метода command](./js.md#command-method).

Вы можете посмотреть, как он используется в примерах [INSERT INTO ... VALUES](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_values_and_functions.ts) или [INSERT INTO ... SELECT](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_from_select.ts).
:::

```ts
interface InsertParams<T> extends BaseQueryParams {
  // Имя таблицы, в которую будут вставлены данные
  table: string
  // Набор данных для вставки.
  values: ReadonlyArray<T> | Stream.Readable
  // Формат набора данных для вставки.
  format?: DataFormat
  // Позволяет указать, в какие столбцы будут вставлены данные.
  // - Массив, такой как `['a', 'b']`, сгенерирует: `INSERT INTO table (a, b) FORMAT DataFormat`
  // - Объект, такой как `{ except: ['a', 'b'] }`, сгенерирует: `INSERT INTO table (* EXCEPT (a, b)) FORMAT DataFormat`
  // По умолчанию данные вставляются во все столбцы таблицы,
  // и сгенерированное выражение будет: `INSERT INTO table FORMAT DataFormat`.
  columns?: NonEmptyArray<string> | { except: NonEmptyArray<string> }
}
```

См. также: [Базовые параметры для всех клиентских методов](./js.md#base-parameters-for-all-client-methods).

:::important
Запрос, отмененный с помощью `abort_signal`, не гарантирует, что вставка данных не произошла, так как сервер мог получить часть переданных данных до отмены.
:::

**Пример:** (Node.js/Web) Вставить массив значений. 
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

**Пример:** (Только Node.js) Вставить поток из CSV файла.
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts). См. также: [потоковая передача файлов](./js.md#streaming-files-nodejs-only).

```ts
await client.insert({
  table: 'my_table',
  values: fs.createReadStream('./path/to/a/file.csv'),
  format: 'CSV',
})
```

**Пример**: Исключить определенные столбцы из оператора вставки.

Учитывая некоторое определение таблицы, такое как:

```sql
CREATE OR REPLACE TABLE mytable
(id UInt32, message String)
ENGINE MergeTree()
ORDER BY (id)
```

Вставить только определенный столбец:

```ts
// Сгенерированное выражение: INSERT INTO mytable (message) FORMAT JSONEachRow
await client.insert({
  table: 'mytable',
  values: [{ message: 'foo' }],
  format: 'JSONEachRow',
  // Значение столбца `id` для этой строки будет нулевым (по умолчанию для UInt32)
  columns: ['message'],
})
```

Исключить определенные столбцы:

```ts
// Сгенерированное выражение: INSERT INTO mytable (* EXCEPT (message)) FORMAT JSONEachRow
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

Смотрите [исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_exclude_columns.ts) для получения дополнительных деталей.

**Пример**: Вставить в базу данных, отличную от той, которая указана в экземпляре клиента. [Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_into_different_db.ts).

```ts
await client.insert({
  table: 'mydb.mytable', // Полное имя, включая базу данных
  values: [{ id: 42, message: 'foo' }],
  format: 'JSONEachRow',
})
```

#### Ограничения веб-версии {#web-version-limitations}

В настоящее время вставки в `@clickhouse/client-web` работают только с `Array<T>` и форматами `JSON*`.
Потоковая передача не поддерживается в веб-версии из-за плохой совместимости браузеров.

Соответственно, интерфейс `InsertParams` для веб-версии выглядит немного иначе, чем версия Node.js, так как `values` ограничены только типом `ReadonlyArray<T>`:

```ts
interface InsertParams<T> extends BaseQueryParams {
  // Имя таблицы, в которую будут вставлены данные
  table: string
  // Набор данных для вставки.
  values: ReadonlyArray<T>
  // Формат набора данных для вставки.
  format?: DataFormat
  // Позволяет указать, в какие столбцы будут вставлены данные.
  // - Массив, такой как `['a', 'b']`, сгенерирует: `INSERT INTO table (a, b) FORMAT DataFormat`
  // - Объект, такой как `{ except: ['a', 'b'] }`, сгенерирует: `INSERT INTO table (* EXCEPT (a, b)) FORMAT DataFormat`
  // По умолчанию данные вставляются во все столбцы таблицы,
  // и сгенерированное выражение будет: `INSERT INTO table FORMAT DataFormat`.
  columns?: NonEmptyArray<string> | { except: NonEmptyArray<string> }
}
```

Это может измениться в будущем. См. также: [Базовые параметры для всех клиентских методов](./js.md#base-parameters-for-all-client-methods).

### Метод command {#command-method}

Он может быть использован для операторов, которые не имеют никакого вывода, когда раздел формат не применим, или когда вы вообще не заинтересованы в ответе. Примером такого оператора могут быть `CREATE TABLE` или `ALTER TABLE`.

Должен быть ожидаться.

Поток ответа немедленно уничтожается, что означает, что базовый сокет освобождается.

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
  // Рекомендуется для кластерного использования, чтобы избежать ситуаций, когда ошибка обработки запроса произошла после кода ответа, 
  // и HTTP заголовки уже были отправлены клиенту.
  // См. https://clickhouse.com/docs/interfaces/http/#response-buffering
  clickhouse_settings: {
    wait_end_of_query: 1,
  },
})
```

**Пример:** (Node.js/Web) Создание таблицы в собственном экземпляре ClickHouse. 
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

Если у вас есть пользовательский запрос, который не вписывается в `query`/`insert`, 
и вы заинтересованы в результате, вы можете использовать `exec` как альтернативу `command`.

`exec` возвращает читаемый поток, который ДОЛЖЕН быть потреблен или уничтожен на стороне приложения.

```ts
interface ExecParams extends BaseQueryParams {
  // Оператор для выполнения.
  query: string
}

interface ClickHouseClient {
  exec(params: ExecParams): Promise<QueryResult>
}
```

См. также: [Базовые параметры для всех клиентских методов](./js.md#base-parameters-for-all-client-methods).

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
### Пинг {#ping}

Метод `ping`, предоставленный для проверки статуса соединения, возвращает `true`, если сервер доступен.

Если сервер недоступен, основная ошибка включается в результат.

```ts
type PingResult =
  | { success: true }
  | { success: false; error: Error }

interface ClickHouseClient {
  ping(): Promise<PingResult>
}
```

Ping может быть полезным инструментом для проверки доступности сервера, когда приложение запускается, особенно в ClickHouse Cloud, где экземпляр может быть бездействующим и «просыпаться» после пинга.

**Пример:** (Node.js/Web) Пинг экземпляра сервера ClickHouse. Примечание: для веб-версии захваченные ошибки будут различаться.
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/ping.ts).

```ts
const result = await client.ping();
if (!result.success) {
  // обработать result.error
}
```

Примечание: из-за отсутствия реализации CORS на конечной точке `/ping` веб-версия использует простой `SELECT 1`, чтобы достичь аналогичного результата.
### Закрытие (только Node.js) {#close-nodejs-only}

Закрывает все открытые соединения и освобождает ресурсы. Не выполняет никаких операций в веб-версии.

```ts
await client.close()
```
## Потоковая передача файлов (только Node.js) {#streaming-files-nodejs-only}

Существуют несколько примеров потоковой передачи файлов с популярными форматами данных (NDJSON, CSV, Parquet) в репозитории клиента.

- [Потоковая передача из NDJSON файла](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_ndjson.ts)
- [Потоковая передача из CSV файла](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts)
- [Потоковая передача из Parquet файла](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_parquet.ts)
- [Потоковая передача в Parquet файл](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts)

Потоковая передача других форматов в файл должна быть похожа на Parquet, 
единственное отличие будет в формате, используемом для вызова `query` (`JSONEachRow`, `CSV` и т.д.) и имени выходного файла.
## Поддерживаемые форматы данных {#supported-data-formats}

Клиент обрабатывает форматы данных как JSON или текст.

Если вы укажете `format` как один из форматов семейства JSON (`JSONEachRow`, `JSONCompactEachRow` и т.д.), клиент будет сериализовать и десериализовать данные во время передачи по сети.

Данные, предоставленные в "сырых" текстовых форматах (семейства `CSV`, `TabSeparated` и `CustomSeparated`), отправляются по сети без дополнительных преобразований.

:::tip
Может возникнуть путаница между JSON как общим форматом и [форматом JSON ClickHouse](/sql-reference/formats#json).

Клиент поддерживает потоковую передачу JSON объектов с форматами, такими как [JSONEachRow](/sql-reference/formats#jsoneachrow) (см. обзор таблицы для других форматов, удобных для потоковой передачи; см. также примеры `select_streaming_` [в репозитории клиента](https://github.com/ClickHouse/clickhouse-js/tree/main/examples/node)). 

Просто так форматы, такие как [ClickHouse JSON](/sql-reference/formats#json), и несколько других представлены как единственный объект в ответе и не могут быть преобразованы потоком клиентом.
:::

| Формат                                     | Ввод (массив) | Ввод (объект) | Ввод/Вывод (поток) | Вывод (JSON) | Вывод (текст)  |
|--------------------------------------------|---------------|----------------|-----------------------|---------------|----------------|
| JSON                                       | ❌             | ✔️             | ❌                     | ✔️            | ✔️             |
| JSONCompact                                | ❌             | ✔️             | ❌                     | ✔️            | ✔️             |
| JSONObjectEachRow                          | ❌             | ✔️             | ❌                     | ✔️            | ✔️             |
| JSONColumnsWithMetadata                    | ❌             | ✔️             | ❌                     | ✔️            | ✔️             |
| JSONStrings                                | ❌             | ❌️             | ❌                     | ✔️            | ✔️             |
| JSONCompactStrings                         | ❌             | ❌              | ❌                     | ✔️            | ✔️             |
| JSONEachRow                                | ✔️            | ❌              | ✔️                    | ✔️            | ✔️             |
| JSONEachRowWithProgress                    | ❌️            | ❌              | ✔️ ❗- см. ниже       | ✔️            | ✔️             |
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

Для Parquet основным сценарием для выборок, вероятно, будет запись результирующего потока в файл. См. [пример](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts) в репозитории клиента.

`JSONEachRowWithProgress` – это формат только для вывода, который поддерживает отчет о прогрессе в потоке. См. [этот пример](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_json_each_row_with_progress.ts) для получения дополнительных деталей.

Полный список входных и выходных форматов ClickHouse доступен 
[здесь](/interfaces/formats).
## Поддерживаемые типы данных ClickHouse {#supported-clickhouse-data-types}

:::note
Связанный JS тип имеет значение для любых форматов `JSON*`, кроме тех, которые представляют все как строку (например, `JSONStringEachRow`)
:::

| Тип               | Статус          | JS тип                    |
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
| Variant(T1, T2...) | ✔️              | T (в зависимости от варианта) |
| Dynamic            | ✔️              | T (в зависимости от варианта) |
| Nested             | ✔️              | T[]                        |
| Tuple              | ✔️              | Tuple                      |
| Nullable(T)        | ✔️              | JS тип для T или null      |
| IPv4               | ✔️              | string                     |
| IPv6               | ✔️              | string                     |
| Point              | ✔️              | [ number, number ]         |
| Ring               | ✔️              | Array&lt;Point\>              |
| Polygon            | ✔️              | Array&lt;Ring\>               |
| MultiPolygon       | ✔️              | Array&lt;Polygon\>            |
| Map(K, V)          | ✔️              | Record&lt;K, V\>              |

Полный список поддерживаемых форматов ClickHouse доступен 
[здесь](/sql-reference/data-types/).
### Параметры типов Date/Date32 {#datedate32-types-caveats}

Поскольку клиент вставляет значения без дополнительного преобразования типов, столбцы типа `Date`/`Date32` могут быть вставлены только как
строки.

**Пример:** Вставить значение типа `Date`. 
[Исходный код](https://github.com/ClickHouse/clickhouse-js/blob/ba387d7f4ce375a60982ac2d99cb47391cf76cec/__tests__/integration/date_time.test.ts).

```ts
await client.insert({
  table: 'my_table',
  values: [ { date: '2022-09-05' } ],
  format: 'JSONEachRow',
})
```

Однако, если вы используете столбцы `DateTime` или `DateTime64`, вы можете использовать как строки, так и объекты Date JS. Объекты Date JS могут быть переданы в `insert` как есть с установленным `date_time_input_format` на `best_effort`. См. этот [пример](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_js_dates.ts) для получения дополнительных деталей.
### Параметры типов Decimal* {#decimal-types-caveats}

Возможно вставить Decimal с использованием форматов семейства `JSON*`. Предположим, что у нас есть таблица, определенная как:

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

Однако при запросе данных в форматах `JSON*`, ClickHouse по умолчанию вернет Decimals как _числа_, что может привести к потере точности. Чтобы избежать этого, вы можете преобразовать Decimals в строку в запросе:

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

Смотрите [этот пример](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_decimals.ts) для получения дополнительных деталей.
### Целочисленные типы: Int64, Int128, Int256, UInt64, UInt128, UInt256 {#integral-types-int64-int128-int256-uint64-uint128-uint256}

Хотя сервер может принять это как число, он возвращается как строка в форматах вывода семейства `JSON*`, чтобы избежать
переполнения целых чисел, так как максимальные значения для этих типов больше, чем `Number.MAX_SAFE_INTEGER`.

Однако это поведение может быть изменено
с помощью [`output_format_json_quote_64bit_integers` настройки](/operations/settings/formats#output_format_json_quote_64bit_integers).

**Пример:** Регулировка формата вывода JSON для 64-битных чисел.

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

Клиент может корректировать поведение ClickHouse через механизм [настроек](/operations/settings/settings/).
Настройки могут быть установлены на уровне экземпляра клиента, чтобы они применялись к каждому запросу, отправляемому в ClickHouse:

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

Файл декларации типа со всеми поддерживаемыми настройками ClickHouse можно найти 
[здесь](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/settings.ts).

:::important
Убедитесь, что у пользователя, от имени которого выполняются запросы, достаточно прав для изменения настроек.
:::
## Расширенные темы {#advanced-topics}
### Запросы с параметрами {#queries-with-parameters}

Вы можете создать запрос с параметрами и передать значения им из клиентского приложения. Это позволяет избежать форматирования
запроса с конкретными динамическими значениями на стороне клиента.

Отформатируйте запрос как обычно, затем поместите значения, которые вы хотите передать из параметров приложения в запрос, в фигурные скобки в следующем формате:

```text
{<name>: <data_type>}
```

где:

- `name` — Идентификатор-маркер.
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

Примечание: сжатие запросов в настоящее время недоступно в веб-версии. Сжатие ответов работает нормально. Версия Node.js поддерживает оба варианта.

Приложения для обработки больших наборов данных через сеть могут получить выгоду от включения сжатия. В настоящее время поддерживается только `GZIP` с использованием [zlib](https://nodejs.org/docs/latest-v14.x/api/zlib.html).

```typescript
createClient({
  compression: {
    response: true,
    request: true
  }
})
```

Конфигурационные параметры:

- `response: true` инструктирует сервер ClickHouse отвечать с сжатым телом ответа. Значение по умолчанию: `response: false`
- `request: true` включает сжатие для тела запроса клиента. Значение по умолчанию: `request: false`
### Логирование (только Node.js) {#logging-nodejs-only}

:::important
Логирование является экспериментальной функцией и может быть изменено в будущем.
:::

Реализация стандартного логгера излучает записи журналов в `stdout` через методы `console.debug/info/warn/error`.
Вы можете настроить логику логирования, предоставив `LoggerClass`, и выбрать желаемый уровень логирования через параметр `level` (по умолчанию `OFF`):

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

В настоящее время клиент будет регистрировать следующие события:

- `TRACE` - информация низкого уровня о жизненном цикле сокетов Keep-Alive
- `DEBUG` - информация о ответе (без заголовков аутентификации и информации о хосте)
- `INFO` - в основном не используется, будет выводить текущий уровень логирования, когда клиент инициализируется
- `WARN` - нефатальные ошибки; неудачный запрос `ping` регистрируется как предупреждение, так как основная ошибка включена в возвращенный результат
- `ERROR` - фатальные ошибки из методов `query`/`insert`/`exec`/`command`, такие как неудачный запрос

Вы можете найти реализацию стандартного логгера [здесь](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/logger.ts).
### TLS сертификаты (только Node.js) {#tls-certificates-nodejs-only}

Клиент Node.js дополнительно поддерживает как базовые (только сертификат удостоверяющего центра), так и взаимные (сертификаты удостоверяющего центра и клиентские сертификаты) TLS.

Пример конфигурации базового TLS, предположим, что у вас есть ваши сертификаты в папке `certs`, а имя файла CA - `CA.pem`:

```ts
const client = createClient({
  url: 'https://<hostname>:<port>',
  username: '<username>',
  password: '<password>', // если необходимо
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
### Конфигурация Keep-Alive (только Node.js) {#keep-alive-configuration-nodejs-only}

Клиент по умолчанию включает Keep-Alive в нижнем HTTP-агенте, что означает, что соединенные сокеты будут повторно использоваться для последующих запросов, и заголовок `Connection: keep-alive` будет отправлен. Сокеты, которые просто находятся в простое, останутся в пуле подключений по умолчанию в течение 2500 миллисекунд (см. [заметки о настройке этой опции](./js.md#adjusting-idle_socket_ttl)).

`keep_alive.idle_socket_ttl` должно иметь свое значение значительно ниже, чем конфигурация сервера/LB. Основная причина заключается в том, что из-за HTTP/1.1 сервер может закрывать сокеты, не уведомляя клиента; если сервер или балансировщик нагрузки закроет соединение _до_ того, как это сделает клиент, клиент может попытаться повторно использовать закрытый сокет, что приведет к ошибке `socket hang up`.

Если вы изменяете `keep_alive.idle_socket_ttl`, помните, что он всегда должен быть синхронизирован с вашей конфигурацией Keep-Alive сервера/LB, и он всегда должен быть **ниже** этого значения, чтобы гарантировать, что сервер никогда не закроет открытое соединение первее клиента.
#### Настройка `idle_socket_ttl` {#adjusting-idle_socket_ttl}

Клиент устанавливает `keep_alive.idle_socket_ttl` на 2500 миллисекунд, так как это может считаться самым безопасным значением по умолчанию; на стороне сервера `keep_alive_timeout` может быть установлен [даже до 3 секунд в версиях ClickHouse до 23.11](https://github.com/ClickHouse/ClickHouse/commit/1685cdcb89fe110b45497c7ff27ce73cc03e82d1) без модификаций в `config.xml`.

:::warning
Если вы довольны производительностью и не испытываете никаких проблем, рекомендуется **не** увеличивать значение настройки `keep_alive.idle_socket_ttl`, поскольку это может привести к потенциальным ошибкам "Socket hang-up"; кроме того, если ваше приложение отправляет много запросов и между ними не слишком много времени простоя, значение по умолчанию должно быть достаточным, так как сокеты не будут простаивать долго, и клиент будет держать их в пуле.
:::

Вы можете найти правильное значение времени ожидания Keep-Alive в заголовках ответа сервера, выполнив следующую команду:

```sh
curl -v --data-binary "SELECT 1" <clickhouse_url>
```

Проверьте значения заголовков `Connection` и `Keep-Alive` в ответе. Например:

```text
< Connection: Keep-Alive
< Keep-Alive: timeout=10
```

В этом случае `keep_alive_timeout` составляет 10 секунд, и вы могли бы попробовать увеличить `keep_alive.idle_socket_ttl` до 9000 или даже 9500 миллисекунд, чтобы держать сокеты, находящиеся в простое, открытыми дольше, чем по умолчанию. Следите за потенциальными ошибками "Socket hang-up", которые будут указывать на то, что сервер закрывает соединения раньше клиента, и снижайте значение, пока ошибки не исчезнут.
```yaml
title: 'Устранение неполадок Keep-Alive'
sidebar_label: 'Устранение неполадок Keep-Alive'
keywords: ['keep-alive', 'clickhouse', 'socket hang up', 'технологии']
description: 'Советы по устранению неполадок, связанных с функцией Keep-Alive в ClickHouse.'
```

#### Устранение неполадок Keep-Alive {#keep-alive-troubleshooting}

Если вы сталкиваетесь с ошибками `socket hang up` при использовании функции Keep-Alive, есть несколько вариантов решения этой проблемы:

* Незначительно уменьшите параметр `keep_alive.idle_socket_ttl` в конфигурации сервера ClickHouse. В некоторых ситуациях, например, при высокой задержке в сети между клиентом и сервером, может быть полезно уменьшить `keep_alive.idle_socket_ttl` еще на 200-500 миллисекунд, исключая возможность того, что исходящий запрос может получить сокет, который сервер собирается закрыть.

* Если эта ошибка происходит во время долгих запросов без поступления или выхода данных (например, долгая операция `INSERT FROM SELECT`), это может быть связано с тем, что балансировщик нагрузки закрывает простаивающие соединения. Вы можете попробовать принудительно передавать некоторые данные во время долгих запросов, используя комбинацию следующих настроек ClickHouse:

  ```ts
  const client = createClient({
    // Здесь мы предполагаем, что у нас будут запросы с временем выполнения более 5 минут
    request_timeout: 400_000,
    /** Эти настройки в комбинации позволяют избежать проблем с тайм-аутом LB в случае долгих запросов без поступления или выхода данных,
     *  таких как `INSERT FROM SELECT` и подобные, так как соединение может быть помечено как неактивное балансировщиком и закрыто внезапно.
     *  В этом случае мы предполагаем, что LB имеет тайм-аут неактивного соединения 120 секунд, поэтому мы устанавливаем 110 секунд как "безопасное" значение. */
    clickhouse_settings: {
      send_progress_in_http_headers: 1,
      http_headers_progress_interval_ms: '110000', // UInt64, должно передаваться как строка
    },
  })
  ```
  Имейте в виду, однако, что общий размер полученных заголовков имеет лимит 16KB в последних версиях Node.js; после определенного количества полученных заголовков прогресса, которое составляет около 70-80 в наших тестах, будет сгенерировано исключение.

  Также возможно использовать совершенно другой подход, полностью избегая времени ожидания в сети; это можно сделать, используя "функцию" интерфейса HTTP, которая позволяет мутациям не отменяться при потере соединения. См. [этот пример (часть 2)](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/long_running_queries_timeouts.ts) для получения более подробной информации.

* Функцию Keep-Alive можно отключить полностью. В этом случае клиент также добавит заголовок `Connection: close` к каждому запросу, и основной HTTP-агент не будет повторно использовать соединения. Параметр `keep_alive.idle_socket_ttl` будет игнорироваться, так как не будет неактивных сокетов. Это приведет к дополнительным накладным расходам, так как для каждого запроса будет устанавливаться новое соединение.

  ```ts
  const client = createClient({
    keep_alive: {
      enabled: false,
    },
  })
  ```

### Пользователи только для чтения {#read-only-users}

При использовании клиента с пользователем [readonly=1](/operations/settings/permissions-for-queries#readonly) невозможно включить сжатие ответов, так как для этого требуется параметр `enable_http_compression`. Следующая конфигурация приведет к ошибке:

```ts
const client = createClient({
  compression: {
    response: true, // не сработает с пользователем readonly=1
  },
})
```

См. [пример](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/read_only_user.ts), который содержит больше информации о ограничениях пользователя readonly=1.

### Прокси с путем {#proxy-with-a-pathname}

Если ваш экземпляр ClickHouse находится за прокси и у него есть путь в URL, как в примере http://proxy:8123/clickhouse_server, укажите `clickhouse_server` в качестве параметра конфигурации `pathname` (с ведущим слэшем или без); в противном случае, если указано напрямую в `url`, это будет считаться параметром `database`. Поддерживаются несколько сегментов, например, `/my_proxy/db`.

```ts
const client = createClient({
  url: 'http://proxy:8123',
  pathname: '/clickhouse_server',
})
```

### Реверсивный прокси с аутентификацией {#reverse-proxy-with-authentication}

Если у вас есть реверсивный прокси с аутентификацией перед вашим развертыванием ClickHouse, вы можете использовать настройку `http_headers`, чтобы предоставить необходимые заголовки:

```ts
const client = createClient({
  http_headers: {
    'My-Auth-Header': '...',
  },
})
```

### Пользовательский HTTP/HTTPS агент (экспериментально, только Node.js) {#custom-httphttps-agent-experimental-nodejs-only}

:::warning
Это экспериментальная функция, которая может измениться в несовместимых с предыдущими версиями направлениях в будущих релизах. Стандартная реализация и настройки, предоставляемые клиентом, должны быть достаточными для большинства сценариев использования. Используйте эту функцию только если вы уверены, что она вам необходима.
:::

По умолчанию клиент будет настраивать основной HTTP(s) агент, используя параметры, предоставленные в конфигурации клиента (такие как `max_open_connections`, `keep_alive.enabled`, `tls`), который будет обрабатывать соединения с сервером ClickHouse. Дополнительно, если используются TLS сертификаты, основной агент будет настроен с необходимыми сертификатами, и правильные заголовки аутентификации TLS будут принудительно применены.

После версии 1.2.0 возможно предоставить пользовательский HTTP(s) агент клиенту, заменяя стандартный основной. Это может быть полезно в случае сложных сетевых конфигураций. Применяются следующие условия, если предоставлен пользовательский агент:
- Опции `max_open_connections` и `tls` будут _не иметь эффекта_ и будут игнорироваться клиентом, так как это часть конфигурации основного агента.
- `keep_alive.enabled` будет регулировать только стандартное значение заголовка `Connection` (`true` -> `Connection: keep-alive`, `false` -> `Connection: close`).
- Хотя управление неактивными сокетами keep-alive все еще будет работать (так как это не связано с агентом, а с конкретным сокетом), теперь возможно полностью отключить его, установив значение `keep_alive.idle_socket_ttl` в `0`.

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

Использование пользовательского HTTPS агента с базовым TLS и CA сертификатом:

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
  // С пользовательским HTTPS агентом клиент не будет использовать стандартную реализацию HTTPS соединения; заголовки должны предоставляться вручную
  http_headers: {
    'X-ClickHouse-User': 'username',
    'X-ClickHouse-Key': 'password',
  },
  // Важно: заголовок авторизации конфликтует с заголовками TLS; отключите его.
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
  // С пользовательским HTTPS агентом клиент не будет использовать стандартную реализацию HTTPS соединения; заголовки должны предоставляться вручную
  http_headers: {
    'X-ClickHouse-User': 'username',
    'X-ClickHouse-Key': 'password',
    'X-ClickHouse-SSL-Certificate-Auth': 'on',
  },
  // Важно: заголовок авторизации конфликтует с заголовками TLS; отключите его.
  set_basic_auth_header: false,
})
```

С сертификатами _и_ пользовательским _HTTPS_ агентом, вероятно, необходимо отключить стандартный заголовок авторизации через настройку `set_basic_auth_header` (введено в 1.2.0), так как он конфликтует с заголовками TLS. Все заголовки TLS должны предоставляться вручную.

## Известные ограничения (Node.js/Web) {#known-limitations-nodejsweb}

- Нет мапперов данных для наборов результатов, поэтому используются только языковые примитивы. Определенные мапперы типов данных запланированы с [поддержкой формата RowBinary](https://github.com/ClickHouse/clickhouse-js/issues/216).
- Есть некоторые [особенности типов данных Decimal* и Date* / DateTime*](./js.md#datedate32-types-caveats).
- При использовании форматов семейства JSON* числа больше Int32 представляются как строки, так как максимальные значения типов Int64+ превышают `Number.MAX_SAFE_INTEGER`. См. раздел [Целочисленные типы](./js.md#integral-types-int64-int128-int256-uint64-uint128-uint256) для получения дополнительных деталей.

## Известные ограничения (Web) {#known-limitations-web}

- Потоковая передача для выборок работает, но отключена для вставок (также на уровне типа).
- Сжатие запросов отключено, и конфигурация игнорируется. Сжатие ответов работает.
- Поддержки логирования пока нет.

## Советы по оптимизации производительности {#tips-for-performance-optimizations}

- Чтобы уменьшить потребление памяти приложением, рассмотрите возможность использования потоков для больших вставок (например, из файлов) и выборок, когда это возможно. Для слушателей событий и подобных случаев [асинхронные вставки](/optimize/asynchronous-inserts) могут быть еще одним хорошим вариантом, позволяя минимизировать или даже полностью избежать пакетной обработки на стороне клиента. Примеры асинхронных вставок доступны в [репозитории клиента](https://github.com/ClickHouse/clickhouse-js/tree/main/examples), с префиксом имени файла `async_insert_`.
- Клиент не включает сжатие запросов или ответов по умолчанию. Однако при выборке или вставке больших наборов данных вы можете рассмотреть возможность его включения через `ClickHouseClientConfigOptions.compression` (либо только для `request`, либо для `response`, или для обоих).
- Сжатие имеет значительное влияние на производительность. Включение его для `request` или `response` негативно скажется на скорости выборок или вставок соответственно, но уменьшит количество сетевого трафика, передаваемого приложением.

## Свяжитесь с нами {#contact-us}

Если у вас есть какие-либо вопросы или вам нужна помощь, не стесняйтесь обращаться к нам в [Community Slack](https://clickhouse.com/slack) (канал `#clickhouse-js`) или через [GitHub issues](https://github.com/ClickHouse/clickhouse-js/issues).
