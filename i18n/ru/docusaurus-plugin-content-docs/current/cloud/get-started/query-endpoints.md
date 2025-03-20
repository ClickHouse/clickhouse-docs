---
sidebar_title: Конечные точки API запросов
slug: /cloud/get-started/query-endpoints
description: Легко создавайте конечные точки REST API из ваших сохраненных запросов
keywords: [api, конечные точки api запросов, конечные точки запросов, api запросов rest]
---

import endpoints_testquery from '@site/static/images/cloud/sqlconsole/endpoints-testquery.png';
import endpoints_savequery from '@site/static/images/cloud/sqlconsole/endpoints-savequery.png';
import endpoints_configure from '@site/static/images/cloud/sqlconsole/endpoints-configure.png';
import endpoints_completed from '@site/static/images/cloud/sqlconsole/endpoints-completed.png';
import endpoints_curltest from '@site/static/images/cloud/sqlconsole/endpoints-curltest.png';
import endpoints_monitoring from '@site/static/images/cloud/sqlconsole/endpoints-monitoring.png';


# Конечные точки API запросов

Функция **Конечные точки API запросов** позволяет вам создавать конечную точку API прямо из любого сохраненного SQL-запроса в консоли ClickHouse Cloud. Вы сможете получать доступ к конечным точкам API через HTTP, чтобы выполнять ваши сохраненные запросы без необходимости подключаться к вашему сервису ClickHouse Cloud через нативный драйвер.

## Быстрый старт {#quick-start-guide}

Прежде чем продолжить, убедитесь, что у вас есть API ключ и роль администратора консоли. Вы можете следовать этому руководству, чтобы [создать API ключ](/cloud/manage/openapi).

### Создание сохраненного запроса {#creating-a-saved-query}

Если у вас уже есть сохраненный запрос, вы можете пропустить этот шаг.

Откройте новую вкладку запроса. Для демонстрации мы будем использовать [набор данных youtube](/getting-started/example-datasets/youtube-dislikes), который содержит приблизительно 4,5 миллиарда записей. В качестве примера запроса мы вернем 10 лучших загружающих пользователей по среднему количеству просмотров на видео в параметре `year`, введенном пользователем:

```sql
with sum(view_count) as view_sum,
    round(view_sum / num_uploads, 2) as per_upload
select
    uploader,
    count() as num_uploads,
    formatReadableQuantity(view_sum) as total_views,
    formatReadableQuantity(per_upload) as views_per_video
from
    youtube
where
    toYear(upload_date) = {year: UInt16}
group by uploader
order by per_upload desc
limit 10
```

Обратите внимание, что этот запрос содержит параметр (`year`). Редактор запросов SQL консоли автоматически обнаруживает выражения параметров запроса ClickHouse и предоставляет ввод для каждого параметра. Давайте быстро запустим этот запрос, чтобы убедиться, что он работает:

<img src={endpoints_testquery} alt="Проверить пример запроса"/>

Следующий шаг — сохранить запрос:

<img src={endpoints_savequery} alt="Сохранить пример запроса"/>

Дополнительную документацию по сохраненным запросам можно найти [здесь](/cloud/get-started/sql-console#saving-a-query).

### Настройка конечной точки API запросов {#configuring-the-query-api-endpoint}

Конечные точки API запросов могут быть настроены прямо из представления запроса, нажав кнопку **Поделиться** и выбрав `API Endpoint`. Вам будет предложено указать, какие API ключи должны иметь доступ к конечной точке:

<img src={endpoints_configure} alt="Настроить конечную точку запроса"/>

После выбора API ключа конечная точка API запроса будет автоматически предоставлена. Будет показан пример команды `curl`, чтобы вы могли отправить тестовый запрос:

<img src={endpoints_completed} alt="Команда curl для конечной точки"/>

### Параметры API запроса {#query-api-parameters}

Параметры запроса в запросе могут быть указаны с помощью синтаксиса `{parameter_name: type}`. Эти параметры будут автоматически обнаружены, и пример полезной нагрузки запроса будет содержать объект `queryVariables`, через который вы можете передавать эти параметры.

### Тестирование и мониторинг {#testing-and-monitoring}

После создания конечной точки API запроса вы можете протестировать, что она работает, используя `curl` или любой другой HTTP-клиент:

<img src={endpoints_curltest} class="image" alt="тест curl для конечной точки" style={{width: '80%', background:'none'}} />

После того как вы отправите свой первый запрос, новая кнопка должна немедленно появиться справа от кнопки **Поделиться**. Нажав на нее, вы откроете всплывающее окно с данными мониторинга о запросе:

<img src={endpoints_monitoring} alt="Мониторинг конечной точки"/>


## Подробности реализации {#implementation-details}

### Описание {#description}

Этот маршрут выполняет запрос на указанной конечной точке запроса. Он поддерживает различные версии, форматы и переменные запроса. Ответ может быть передан как поток (_версия 2 только_) или возвращен как единая полезная нагрузка.

### Аутентификация {#authentication}

- **Обязательно**: Да
- **Метод**: Основная аутентификация через OpenAPI Key/Secret
- **Права доступа**: Соответствующие права для конечной точки запроса.

### URL Параметры {#url-parameters}

- `queryEndpointId` (обязательно): Уникальный идентификатор конечной точки запроса, которую необходимо выполнить.

### Параметры запроса {#query-parameters}

#### V1 {#v1}

Нет

#### V2 {#v2}

- `format` (необязательно): Формат ответа. Поддерживает все форматы, поддерживаемые ClickHouse.
- `param_:name` Переменные запроса, которые будут использоваться в запросе. `name` должен соответствовать имени переменной в запросе. Это следует использовать только когда тело запроса — это поток.
- `:clickhouse_setting` Любую поддерживаемую [настройку ClickHouse](/operations/settings/settings) можно передать как параметр запроса.

### Заголовки {#headers}

- `x-clickhouse-endpoint-version` (необязательно): Версия конечной точки запроса. Поддерживаемые версии: `1` и `2`. Если не предоставлено, версия по умолчанию — последняя сохраненная для конечной точки.
- `x-clickhouse-endpoint-upgrade` (необязательно): Установите этот заголовок для обновления версии конечной точки. Это работает совместно с заголовком `x-clickhouse-endpoint-version`.

### Тело запроса {#request-body}

- `queryVariables` (необязательно): Объект, содержащий переменные, которые будут использоваться в запросе.
- `format` (необязательно): Формат ответа. Если конечная точка API запроса версии 2, любой поддерживаемый формат ClickHouse возможен. Поддерживаемые форматы для версии 1:
  - TabSeparated
  - TabSeparatedWithNames
  - TabSeparatedWithNamesAndTypes
  - JSON
  - JSONEachRow
  - CSV
  - CSVWithNames
  - CSVWithNamesAndTypes

### Ответы {#responses}

- **200 OK**: Запрос был успешно выполнен.
- **400 Bad Request**: Запрос был неправильно сформирован.
- **401 Unauthorized**: Запрос был сделан без аутентификации или с недостаточными правами.
- **404 Not Found**: Указанная конечная точка запроса не найдена.

### Обработка ошибок {#error-handling}

- Убедитесь, что запрос включает действительные учетные данные аутентификации.
- Проверьте `queryEndpointId` и `queryVariables`, чтобы убедиться, что они корректны.
- Обрабатывайте любые ошибки сервера корректно, возвращая соответствующие сообщения об ошибках.

### Обновление версии конечной точки {#upgrading-the-endpoint-version}

Чтобы обновить версию конечной точки с `v1` до `v2`, включите заголовок `x-clickhouse-endpoint-upgrade` в запрос и установите его значение на `1`. Это инициирует процесс обновления и позволит вам использовать функции и улучшения, доступные в `v2`.

## Примеры {#examples}

### Основной запрос {#basic-request}

**SQL конечной точки API запроса:**

```sql
SELECT database, name as num_tables FROM system.tables limit 3;
```

#### Версия 1 {#version-1}

**cURL:**

```bash
curl -X POST 'https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run' \
--user '<openApiKeyId:openApiKeySecret>' \
-H 'Content-Type: application/json' \
-d '{ "format": "JSONEachRow" }'
```

**JavaScript:**

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

**Ответ:**

```json
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

#### Версия 2 {#version-2}

**cURL:**

```bash
curl -X POST 'https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?format=JSONEachRow' \
--user '<openApiKeyId:openApiKeySecret>' \
-H 'Content-Type: application/json' \
-H 'x-clickhouse-endpoint-version: 2'
```

**JavaScript:**

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

**Ответ:**

```application/x-ndjson
{"database":"INFORMATION_SCHEMA","num_tables":"COLUMNS"}
{"database":"INFORMATION_SCHEMA","num_tables":"KEY_COLUMN_USAGE"}
{"database":"INFORMATION_SCHEMA","num_tables":"REFERENTIAL_CONSTRAINTS"}
```

### Запрос с переменными запроса и версией 2 в формате JSONCompactEachRow {#request-with-query-variables-and-version-2-on-jsoncompacteachrow-format}

**SQL конечной точки API запроса:**

```sql
SELECT name, database FROM system.tables WHERE match(name, {tableNameRegex: String}) AND database = {database: String};
```

**cURL:**

```bash
curl -X POST 'https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?format=JSONCompactEachRow' \
--user '<openApiKeyId:openApiKeySecret>' \
-H 'Content-Type: application/json' \
-H 'x-clickhouse-endpoint-version: 2' \
-d '{ "queryVariables": { "tableNameRegex": "query.*", "database": "system" } }'
```

**JavaScript:**

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

**Ответ:**

```application/x-ndjson
["query_cache", "system"]
["query_log", "system"]
["query_views_log", "system"]
```

### Запрос с массивом в переменных запроса, который вставляет данные в таблицу {#request-with-array-in-the-query-variables-that-inserts-data-into-a-table}

**SQL таблицы:**

```SQL
CREATE TABLE default.t_arr
(
    `arr` Array(Array(Array(UInt32)))
)
ENGINE = MergeTree
ORDER BY tuple()
```

**SQL конечной точки API запроса:**

```sql
  INSERT INTO default.t_arr VALUES ({arr: Array(Array(Array(UInt32)))});
```

**cURL:**

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

**JavaScript:**

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
  .catch((error) => console.error("Error:", error));
```

**Ответ:**

```text
OK
```

### Запрос с настройкой ClickHouse max_threads, установленной на 8 {#request-with-clickhouse-settings-max_threads-set-to-8}

**SQL конечной точки API запроса:**

```sql
SELECT * from system.tables;
```

**cURL:**

```bash
curl -X POST 'https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?max_threads=8,' \
--user '<openApiKeyId:openApiKeySecret>' \
-H 'Content-Type: application/json' \
-H 'x-clickhouse-endpoint-version: 2' \
```

**JavaScript:**

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

### Запрос и парсинг ответа как поток {#request-and-parse-the-response-as-a-stream}

**SQL конечной точки API запроса:**

```sql
SELECT name, database from system.tables;
```

**Typescript:**

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
    console.log("Поток закончился.");
  });

  reader.on("error", (err) => {
    console.error("Ошибка потока:", err);
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

**Вывод**

```shell
> npx tsx index.ts
> {"name":"COLUMNS","database":"INFORMATION_SCHEMA"}
> {"name":"KEY_COLUMN_USAGE","database":"INFORMATION_SCHEMA"}
...
> Поток закончился.
```

### Вставка потока из файла в таблицу {#insert-a-stream-from-a-file-into-a-table}

Создайте файл ./samples/my_first_table_2024-07-11.csv со следующим содержимым:

```csv
"user_id","json","name"
"1","{""name"":""John"",""age"":30}","John"
"2","{""name"":""Jane"",""age"":25}","Jane"
```

**SQL Создания Таблицы:**

```sql
create table default.my_first_table
(
    user_id String,
    json String,
    name String,
) ENGINE = MergeTree()
ORDER BY user_id;
```

**SQL конечной точки API запроса:**

```sql
INSERT INTO default.my_first_table
```

**cURL:**

```bash
cat ./samples/my_first_table_2024-07-11.csv | curl --user '<openApiKeyId:openApiKeySecret>' \
                                                   -X POST \
                                                   -H 'Content-Type: application/octet-stream' \
                                                   -H 'x-clickhouse-endpoint-version: 2' \
                                                   "https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?format=CSV" \
                                                   --data-binary @-
```
