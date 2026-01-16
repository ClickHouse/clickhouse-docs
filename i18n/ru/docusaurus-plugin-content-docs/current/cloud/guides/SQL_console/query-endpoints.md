---
sidebar_title: 'Конечные точки API запросов'
slug: /cloud/get-started/query-endpoints
description: 'Легко разворачивайте REST-конечные точки API из сохранённых запросов'
keywords: ['api', 'конечные точки api запросов', 'конечные точки запросов', 'rest api запросов']
title: 'Конечные точки API запросов'
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

# Настройка конечных точек API для запросов \\{#setting-up-query-api-endpoints\\}

Возможность **Query API Endpoints** позволяет создавать конечные точки API непосредственно из любого сохранённого SQL-запроса в консоли ClickHouse Cloud. Вы сможете обращаться к конечным точкам API по HTTP для выполнения своих сохранённых запросов без необходимости подключаться к вашему сервису ClickHouse Cloud через нативный драйвер.

## Предварительные требования \\{#quick-start-guide\\}

Прежде чем продолжить, убедитесь, что у вас есть:

- Ключ API с соответствующими правами доступа
- Роль Admin Console

Вы можете воспользоваться этим руководством, чтобы [создать ключ API](/cloud/manage/openapi), если у вас его ещё нет.

:::note Минимальные права доступа
Чтобы отправлять запрос к API-эндпоинту, ключу API необходима роль организации `Member` с доступом к сервису `Query Endpoints`. Роль базы данных настраивается при создании эндпоинта.
:::

<VerticalStepper headerLevel="h3">

### Создание сохранённого запроса \\{#creating-a-saved-query\\}

Если у вас уже есть сохранённый запрос, вы можете пропустить этот шаг.

Откройте новую вкладку запроса. В качестве примера мы будем использовать [набор данных YouTube](/getting-started/example-datasets/youtube-dislikes), который содержит примерно 4,5 миллиарда записей.
Выполните шаги из раздела ["Create table"](/getting-started/example-datasets/youtube-dislikes#create-the-table), чтобы создать таблицу в вашем Cloud-сервисе и вставить в неё данные.

:::tip Используйте `LIMIT` для ограничения количества строк
Учебный пример набора данных вставляет большой объём данных — 4,65 миллиарда строк, что может занять некоторое время.
Для целей этого руководства мы рекомендуем использовать предложение `LIMIT`, чтобы вставить меньший объём данных,
например 10 миллионов строк.
:::

В качестве примера запроса мы вернём 10 лидеров по количеству загрузок по среднему числу просмотров на видео за год, переданный пользователем в параметре `year`.

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

Обратите внимание, что этот запрос содержит параметр (`year`), который выделен в приведённом выше фрагменте.
Вы можете указывать параметры запроса, используя фигурные скобки `{ }` вместе с типом параметра.
Редактор запросов SQL Console автоматически обнаруживает выражения параметров запроса ClickHouse и предоставляет поле ввода для каждого параметра.

Быстро запустим этот запрос, чтобы убедиться, что он работает: укажите год `2010` в поле ввода переменных запроса справа от редактора SQL:

<Image img={endpoints_testquery} size="md" alt="Проверка примерного запроса" />

Затем сохраните запрос:

<Image img={endpoints_savequery} size="md" alt="Сохранить пример запроса" />

Дополнительную документацию по сохранённым запросам можно найти в разделе ["Сохранение запроса"](/cloud/get-started/sql-console#saving-a-query).

### Настройка API-эндпоинта для запроса \\{#configuring-the-query-api-endpoint\\}

Эндпоинты Query API можно настраивать непосредственно из окна запроса, нажав кнопку **Share** и выбрав `API Endpoint`.
Вам будет предложено указать, какие ключи API должны иметь доступ к этому эндпоинту:

<Image img={endpoints_configure} size="md" alt="Настройка эндпоинта запроса" />

После выбора ключа API вам будет предложено:
- Выбрать роль базы данных, которая будет использоваться для выполнения запроса (`Full access`, `Read only` или `Create a custom role`)
- Указать домены, разрешённые для CORS (cross-origin resource sharing)

После выбора этих параметров эндпоинт Query API будет автоматически создан.

Для отправки тестового запроса будет показана примерная команда `curl`:

<Image img={endpoints_completed} size="md" alt="Команда curl для эндпоинта" />

Команда curl, отображаемая в интерфейсе, приведена ниже для удобства:

```bash
curl -H "Content-Type: application/json" -s --user '<key_id>:<key_secret>' '<API-endpoint>?format=JSONEachRow&param_year=<value>'
```

### Параметры Query API \\{#query-api-parameters\\}

Параметры в запросе можно задавать с помощью синтаксиса `{parameter_name: type}`. Эти параметры будут обнаружены автоматически, и пример тела запроса будет содержать объект `queryVariables`, через который вы можете передавать эти параметры.

### Тестирование и мониторинг \\{#testing-and-monitoring\\}

После создания эндпоинта Query API вы можете проверить его работу, используя `curl` или любой другой HTTP-клиент:

<Image img={endpoints_curltest} size="md" alt="curl-тест эндпоинта" />

После отправки первого запроса сразу справа от кнопки **Share** должна появиться новая кнопка. Нажав на неё, вы откроете боковую панель, содержащую данные мониторинга по этому запросу:

<Image img={endpoints_monitoring} size="sm" alt="Мониторинг эндпоинта" />

</VerticalStepper>

## Детали реализации \\{#implementation-details\\}

Этот эндпоинт выполняет запросы к вашим сохранённым эндпоинтам Query API.
Он поддерживает несколько версий, гибкие форматы ответа, параметризованные запросы и, при необходимости, потоковые ответы (только версия 2).

**Эндпоинт:**

```text
GET /query-endpoints/{queryEndpointId}/run
POST /query-endpoints/{queryEndpointId}/run
```

### HTTP-методы \\{#http-methods\\}

| Метод | Сценарий использования | Параметры |
|---------|------------------------|-----------|
| **GET** | Простые запросы с параметрами | Передавайте переменные запроса через параметры URL (`?param_name=value`) |
| **POST** | Сложные запросы или когда используется тело запроса | Передавайте переменные запроса в теле запроса (объект `queryVariables`) |

**Когда использовать GET:**

- Простые запросы без сложных вложенных данных
- Параметры можно легко закодировать в URL
- Преимущества кеширования благодаря семантике HTTP GET

**Когда использовать POST:**

- Сложные переменные запроса (массивы, объекты, большие строки)
- Когда для безопасности/конфиденциальности предпочтительно использовать тело запроса
- Потоковая загрузка файлов или больших объёмов данных

### Аутентификация \\{#authentication\\}

**Обязательно:** Да  
**Метод:** Базовая аутентификация (Basic Auth) с использованием ключа/секрета OpenAPI  
**Права доступа:** Соответствующие права доступа для конечной точки запроса (endpoint)

### Настройка запроса \\{#request-configuration\\}

#### Параметры URL \\{#url-params\\}

| Параметр | Обязателен | Описание |
|-----------|----------|-------------|
| `queryEndpointId` | **Да** | Уникальный идентификатор endpoint'а запроса, который нужно выполнить |

#### Параметры запроса \\{#query-params\\}

| Параметр | Обязателен | Описание | Пример |
|---------|------------|----------|--------|
| `format` | Нет | Формат ответа (поддерживаются все форматы ClickHouse) | `?format=JSONEachRow` |
| `param_:name` | Нет | Переменные запроса, когда тело запроса передаётся как поток. Замените `:name` на имя вашей переменной | `?param_year=2024` |
| `request_timeout` | Нет | Таймаут выполнения запроса в миллисекундах (по умолчанию: 30000) | `?request_timeout=60000` |
| `:clickhouse_setting` | Нет | Любая поддерживаемая [настройка ClickHouse](https://clickhouse.com/docs/operations/settings/settings) | `?max_threads=8` |

#### Заголовки \\{#headers\\}

| Заголовок | Обязателен | Описание | Значения |
|--------|----------|-------------|--------|
| `x-clickhouse-endpoint-version` | Нет | Указывает версию эндпоинта | `1` или `2` (по умолчанию используется последняя сохранённая версия) |
| `x-clickhouse-endpoint-upgrade` | Нет | Запускает обновление версии эндпоинта (используется вместе с заголовком версии) | `1` для обновления |

---

### Тело запроса \\{#request-body\\}

#### Параметры \\{#params\\}

| Параметр | Тип | Обязательный | Описание |
|-----------|------|----------|-------------|
| `queryVariables` | object | Нет | Переменные, которые будут использоваться в запросе |
| `format` | string | Нет | Формат ответа |

#### Поддерживаемые форматы \\{#supported-formats\\}

| Версия                     | Поддерживаемые форматы                                                                                                                                   |
|----------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Версия 2**               | Все форматы, поддерживаемые в ClickHouse                                                                                                                 |
| **Версия 1 (ограниченная)** | TabSeparated <br/> TabSeparatedWithNames <br/> TabSeparatedWithNamesAndTypes <br/> JSON <br/> JSONEachRow <br/> CSV <br/> CSVWithNames <br/> CSVWithNamesAndTypes |

---

### Ответы \\{#responses\\}

#### Успешный ответ \\{#success\\}

**Статус:** `200 OK`  
Запрос был успешно выполнен.

#### Коды ошибок \\{#error-codes\\}

| Код состояния | Описание |
|-------------|-------------|
| `400 Bad Request` | Запрос имеет неверный формат |
| `401 Unauthorized` | Отсутствует аутентификация или недостаточно прав |
| `404 Not Found` | Указанный endpoint запроса не найден |

#### Рекомендации по обработке ошибок \\{#error-handling-best-practices\\}

- Убедитесь, что в запрос включены корректные учетные данные для аутентификации
- Проверьте корректность `queryEndpointId` и `queryVariables` перед отправкой
- Реализуйте корректную обработку ошибок с понятными и информативными сообщениями

---

### Обновление версий конечных точек \\{#upgrading-endpoint-versions\\}

Чтобы выполнить обновление с версии 1 до версии 2:

1. Добавьте заголовок `x-clickhouse-endpoint-upgrade` со значением `1`
2. Добавьте заголовок `x-clickhouse-endpoint-version` со значением `2`

Это откроет доступ к возможностям версии 2, в том числе:

- Поддержку всех форматов ClickHouse
- Возможности потоковой передачи ответов
- Повышенную производительность и функциональность

## Примеры \\{#examples\\}

### Базовый запрос \\{#basic-request\\}

**SQL конечной точки API запросов:**

```sql
SELECT database, name AS num_tables FROM system.tables LIMIT 3;
```

#### Версия 1 \\{#version-1\\}

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

#### Версия 2 \\{#version-2\\}

<Tabs>
<TabItem value="GET" label="GET (cURL)" default>

```bash
curl 'https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?format=JSONEachRow' \
--user '<openApiKeyId:openApiKeySecret>' \
-H 'x-clickhouse-endpoint-version: 2'
```

```application/x-ndjson title="Ответ"
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

```application/x-ndjson title="Ответ"
{"database":"INFORMATION_SCHEMA","num_tables":"COLUMNS"}
{"database":"INFORMATION_SCHEMA","num_tables":"KEY_COLUMN_USAGE"}
{"database":"INFORMATION_SCHEMA","num_tables":"REFERENTIAL_CONSTRAINTS"}
```
</TabItem>
</Tabs>

### Request with query variables and version 2 on JSONCompactEachRow format \\{#request-with-query-variables-and-version-2-on-jsoncompacteachrow-format\\}

**Query API Endpoint SQL:**

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

```application/x-ndjson title="Ответ"
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

```application/x-ndjson title="Ответ"
    ["query_cache", "system"]
    ["query_log", "system"]
    ["query_views_log", "system"]
    ```
</TabItem>
</Tabs>

### Request with array in the query variables that inserts data into a table \\{#request-with-array-in-the-query-variables-that-inserts-data-into-a-table\\}

**Table SQL:**

```SQL
CREATE TABLE default.t_arr
(
    `arr` Array(Array(Array(UInt32)))
)
ENGINE = MergeTree
ORDER BY tuple()
```

**Query API Endpoint SQL:**

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
      .catch((error) => console.error("Ошибка:", error));
    ```

    ```text title="Response"
    OK
    ```

</TabItem>
</Tabs>

### Request with ClickHouse settings `max_threads` set to 8 \\{#request-with-clickhouse-settings-max_threads-set-to-8\\}

**Query API Endpoint SQL:**

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

### Request and parse the response as a stream` \\{#request-and-parse-the-response-as-a-stream\\}

**Query API Endpoint SQL:**

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
    // Пример использования
    fetchAndLogChunks(endpointUrl, openApiKeyId, openApiKeySecret).catch((err) =>
      console.error(err)
    );
    ```

```shell title="Вывод"
    > npx tsx index.ts
    > {"name":"COLUMNS","database":"INFORMATION_SCHEMA"}
    > {"name":"KEY_COLUMN_USAGE","database":"INFORMATION_SCHEMA"}
    ...
    > Stream ended.
    ```

</TabItem>
</Tabs>

### Insert a stream from a file into a table \\{#insert-a-stream-from-a-file-into-a-table\\}

Create a file `./samples/my_first_table_2024-07-11.csv` with the following content:

```csv
"user_id","json","name"
"1","{""name"":""John"",""age"":30}","John"
"2","{""name"":""Jane"",""age"":25}","Jane"
```

**Create Table SQL:**

```sql
create table default.my_first_table
(
    user_id String,
    json String,
    name String,
) ENGINE = MergeTree()
ORDER BY user_id;
```

**Query API Endpoint SQL:**

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
