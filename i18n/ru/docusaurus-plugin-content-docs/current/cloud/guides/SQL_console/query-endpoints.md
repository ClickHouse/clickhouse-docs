---
sidebar_title: 'Конечные точки API запросов'
slug: /cloud/get-started/query-endpoints
description: 'Легко разворачивайте конечные точки REST API на основе сохранённых запросов'
keywords: ['api', 'конечные точки api запросов', 'конечные точки запросов', 'rest api для запросов']
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


# Настройка конечных точек API для запросов

Функция **Query API Endpoints** позволяет создавать конечные точки API напрямую из любого сохранённого SQL‑запроса в консоли ClickHouse Cloud. Вы сможете обращаться к конечным точкам API по HTTP, чтобы выполнять сохранённые запросы, не подключаясь к вашему сервису ClickHouse Cloud с использованием нативного драйвера.



## Предварительные требования {#quick-start-guide}

Прежде чем продолжить, убедитесь, что у вас есть:
- Ключ API с соответствующими правами доступа
- Роль Admin Console

Вы можете воспользоваться этим руководством, чтобы [создать ключ API](/cloud/manage/openapi), если у вас его еще нет.

:::note Минимальные права доступа
Чтобы выполнять запросы к API endpoint, ключ API должен иметь роль организации `Member` с доступом к сервису `Query Endpoints`. Роль базы данных настраивается при создании endpoint.
:::

<VerticalStepper headerLevel="h3">

### Создание сохраненного запроса {#creating-a-saved-query}

Если у вас уже есть сохраненный запрос, вы можете пропустить этот шаг.

Откройте новую вкладку запроса. В демонстрационных целях мы будем использовать [набор данных youtube](/getting-started/example-datasets/youtube-dislikes), который содержит примерно 4,5 миллиарда записей.
Следуйте шагам из раздела ["Создание таблицы"](/getting-started/example-datasets/youtube-dislikes#create-the-table), чтобы создать таблицу в вашем облачном сервисе и вставить в нее данные.

:::tip Ограничьте количество строк с помощью `LIMIT`
В учебном примере с набором данных вставляется большой объем данных — 4,65 миллиарда строк, что может занять некоторое время.
Для целей данного руководства мы рекомендуем использовать оператор `LIMIT`, чтобы вставить меньший объем данных,
например 10 миллионов строк.
:::

В качестве примерного запроса мы вернем 10 лучших авторов по среднему количеству просмотров на видео за указанный пользователем параметр `year`.

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

Обратите внимание, что этот запрос содержит параметр (`year`), который выделен в приведенном выше фрагменте.
Вы можете указывать параметры запроса, используя фигурные скобки `{ }` вместе с указанием типа параметра. 
Редактор запросов SQL console автоматически обнаруживает выражения параметров запроса ClickHouse и предоставляет поле ввода для каждого параметра.

Быстро запустим этот запрос, чтобы убедиться, что он работает, указав год `2010` в поле ввода переменных запроса в правой части редактора SQL:

<Image img={endpoints_testquery} size="md" alt="Тестовый запуск примерного запроса" />

Затем сохраните запрос:

<Image img={endpoints_savequery} size="md" alt="Сохранение примерного запроса" />

Дополнительную документацию по сохраненным запросам можно найти в разделе ["Сохранение запроса"](/cloud/get-started/sql-console#saving-a-query).

### Настройка Query API endpoint {#configuring-the-query-api-endpoint}

Query API endpoints можно настраивать непосредственно из представления запроса, нажав кнопку **Share** и выбрав `API Endpoint`.
Вам будет предложено указать, какие ключи API должны иметь доступ к этому endpoint:

<Image img={endpoints_configure} size="md" alt="Настройка endpoint запроса" />

После выбора ключа API вам будет предложено:
- Выбрать роль базы данных, которая будет использоваться для выполнения запроса (`Full access`, `Read only` или `Create a custom role`)
- Указать разрешенные домены для совместного использования ресурсов между источниками (CORS)

После выбора этих параметров Query API endpoint будет автоматически создан.

Будет показана примерная команда `curl`, с помощью которой вы можете отправить тестовый запрос:

<Image img={endpoints_completed} size="md" alt="Команда curl для endpoint" />

Команда curl, отображаемая в интерфейсе, приведена ниже для удобства:

```bash
curl -H "Content-Type: application/json" -s --user '<key_id>:<key_secret>' '<API-endpoint>?format=JSONEachRow&param_year=<value>'
```

### Параметры Query API {#query-api-parameters}

Параметры в запросе могут быть заданы с помощью синтаксиса `{parameter_name: type}`. Эти параметры будут автоматически обнаружены, а пример тела запроса будет содержать объект `queryVariables`, через который вы сможете передавать эти параметры.

### Тестирование и мониторинг {#testing-and-monitoring}

После создания Query API endpoint вы можете протестировать его работу, используя `curl` или любой другой HTTP‑клиент:

<Image img={endpoints_curltest} size="md" alt="Тестирование endpoint с помощью curl" />

После того как вы отправите первый запрос, сразу справа от кнопки **Share** должна появиться новая кнопка. При нажатии она откроет выезжающую панель, содержащую данные мониторинга по этому запросу:

<Image img={endpoints_monitoring} size="sm" alt="Мониторинг endpoint" />

</VerticalStepper>



## Подробности реализации

Этот endpoint выполняет запросы к вашим сохранённым endpoint&#39;ам Query API.
Он поддерживает несколько версий, гибкие форматы ответа, параметризованные запросы и опциональные потоковые ответы (только для версии 2).

**Endpoint:**

```text
GET /query-endpoints/{queryEndpointId}/run
POST /query-endpoints/{queryEndpointId}/run
```

### HTTP-методы

| Method   | Use Case                                           | Parameters                                                               |
| -------- | -------------------------------------------------- | ------------------------------------------------------------------------ |
| **GET**  | Простые запросы с параметрами                      | Передавайте переменные запроса через параметры URL (`?param_name=value`) |
| **POST** | Сложные запросы или при использовании тела запроса | Передавайте переменные запроса в теле запроса (объект `queryVariables`)  |

**Когда использовать GET:**

* Простые запросы без сложных вложенных данных
* Параметры можно легко закодировать в URL
* Преимущества кэширования благодаря семантике HTTP GET

**Когда использовать POST:**

* Сложные переменные запроса (массивы, объекты, длинные строки)
* Когда для целей безопасности/конфиденциальности предпочтительно тело запроса
* Потоковая загрузка файлов или больших объёмов данных

### Аутентификация

**Обязательно:** Да\
**Метод:** Базовая аутентификация (Basic Auth) с использованием OpenAPI Key/Secret\
**Права доступа:** Необходимые права для конечной точки запроса

### Конфигурация запроса

#### Параметры URL

| Параметр          | Обязательно | Описание                                                       |
| ----------------- | ----------- | -------------------------------------------------------------- |
| `queryEndpointId` | **Да**      | Уникальный идентификатор конечной точки запроса для выполнения |

#### Параметры запроса

| Параметр              | Обязательно | Описание                                                                                              | Пример                |
| --------------------- | ----------- | ----------------------------------------------------------------------------------------------------- | --------------------- |
| `format`              | Нет         | Формат ответа (поддерживаются все форматы ClickHouse)                                                 | `?format=JSONEachRow` |
| `param_:name`         | Нет         | Переменные запроса, когда тело запроса передаётся потоком. Замените `:name` на имя вашей переменной   | `?param_year=2024`    |
| `:clickhouse_setting` | Нет         | Любая поддерживаемая [настройка ClickHouse](https://clickhouse.com/docs/operations/settings/settings) | `?max_threads=8`      |

#### Заголовки

| Header                          | Required | Description                                                                   | Values                                                               |
| ------------------------------- | -------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `x-clickhouse-endpoint-version` | No       | Указывает версию конечной точки                                               | `1` или `2` (по умолчанию используется последняя сохранённая версия) |
| `x-clickhouse-endpoint-upgrade` | No       | Инициирует обновление версии конечной точки (используйте с заголовком версии) | `1` для обновления                                                   |

***

### Тело запроса

#### Параметры

| Параметр         | Тип    | Обязательно | Описание                                         |
| ---------------- | ------ | ----------- | ------------------------------------------------ |
| `queryVariables` | object | Нет         | Переменные, которые будут использованы в запросе |
| `format`         | string | Нет         | Формат ответа                                    |

#### Поддерживаемые форматы

| Версия                  | Поддерживаемые форматы                                                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Version 2**           | Все форматы, поддерживаемые ClickHouse                                                                                                                                   |
| **Version 1 (limited)** | TabSeparated <br /> TabSeparatedWithNames <br /> TabSeparatedWithNamesAndTypes <br /> JSON <br /> JSONEachRow <br /> CSV <br /> CSVWithNames <br /> CSVWithNamesAndTypes |

***

### Ответы

#### Успешный ответ

**Статус:** `200 OK`\
Запрос был успешно выполнен.

#### Коды ошибок

| Код статуса        | Описание                                         |
| ------------------ | ------------------------------------------------ |
| `400 Bad Request`  | Некорректный запрос                              |
| `401 Unauthorized` | Отсутствует аутентификация или недостаточно прав |
| `404 Not Found`    | Указанная конечная точка запроса не найдена      |

#### Рекомендации по обработке ошибок

* Убедитесь, что в запрос включены корректные аутентификационные данные
* Проверьте `queryEndpointId` и `queryVariables` перед отправкой
* Реализуйте корректную обработку ошибок с информативными сообщениями

***

### Обновление версий конечных точек

Чтобы обновить версию с 1 до 2:

1. Добавьте заголовок `x-clickhouse-endpoint-upgrade` со значением `1`
2. Добавьте заголовок `x-clickhouse-endpoint-version` со значением `2`

Это даёт доступ к возможностям версии 2, таким как:

* Поддержка всех форматов ClickHouse
* Возможность потоковой передачи ответа
* Повышенная производительность и функциональность


## Примеры {#examples}

### Базовый запрос {#basic-request}

**SQL конечной точки Query API:**

```sql
SELECT database, name AS num_tables FROM system.tables LIMIT 3;
```

#### Версия 1 {#version-1}

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
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      format: "JSONEachRow"
    })
  }
)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Error:", error))
```

```json title="Ответ"
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

#### Версия 2 {#version-2}

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
      "x-clickhouse-endpoint-version": "2"
    }
  }
)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Error:", error))
```

```application/x-ndjson title="Ответ"
{"database":"INFORMATION_SCHEMA","num_tables":"COLUMNS"}
{"database":"INFORMATION_SCHEMA","num_tables":"KEY_COLUMN_USAGE"}
{"database":"INFORMATION_SCHEMA","num_tables":"REFERENTIAL_CONSTRAINTS"}
```

</TabItem>
</Tabs>

### Запрос с параметрами и версией 2 в формате JSONCompactEachRow {#request-with-query-variables-and-version-2-on-jsoncompacteachrow-format}

**SQL конечной точки Query API:**

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
      "x-clickhouse-endpoint-version": "2"
    },
    body: JSON.stringify({
      queryVariables: {
        tableNameRegex: "query.*",
        database: "system"
      }
    })
  }
)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Error:", error))
```

```application/x-ndjson title="Ответ"
["query_cache", "system"]
["query_log", "system"]
["query_views_log", "system"]
```

</TabItem>
</Tabs>

### Запрос с массивом в переменных запроса для вставки данных в таблицу {#request-with-array-in-the-query-variables-that-inserts-data-into-a-table}

**SQL таблицы:**

```SQL
CREATE TABLE default.t_arr
(
    `arr` Array(Array(Array(UInt32)))
)
ENGINE = MergeTree
ORDER BY tuple()
```

**SQL конечной точки Query API:**

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
      "x-clickhouse-endpoint-version": "2"
    },
    body: JSON.stringify({
      queryVariables: {
        arr: [[[12, 13, 0, 1], [12]]]
      }
    })
  }
)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Error:", error))
```

```text title="Ответ"
OK
```

</TabItem>
</Tabs>

### Запрос с настройкой ClickHouse `max_threads`, установленной на 8 {#request-with-clickhouse-settings-max_threads-set-to-8}

**SQL конечной точки Query API:**

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
      "x-clickhouse-endpoint-version": "2"
    }
  }
)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Error:", error))
```

</TabItem>
</Tabs>

### Запрос и обработка ответа в виде потока {#request-and-parse-the-response-as-a-stream}

**SQL конечной точки Query API:**

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
  )

  const headers = {
    Authorization: `Basic ${auth}`,
    "x-clickhouse-endpoint-version": "2"
  }

  const response = await fetch(url, {
    headers,
    method: "POST",
    body: JSON.stringify({ format: "JSONEachRow" })
  })

  if (!response.ok) {
    console.error(`Ошибка HTTP! Статус: ${response.status}`)
    return
  }

  const reader = response.body as unknown as Readable
  reader.on("data", (chunk) => {
    console.log(chunk.toString())
  })

  reader.on("end", () => {
    console.log("Поток завершён.")
  })

  reader.on("error", (err) => {
    console.error("Ошибка потока:", err)
  })
}

const endpointUrl =
  "https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?format=JSONEachRow"
const openApiKeyId = "<myOpenApiKeyId>"
const openApiKeySecret = "<myOpenApiKeySecret>"
// Пример использования
fetchAndLogChunks(endpointUrl, openApiKeyId, openApiKeySecret).catch((err) =>
  console.error(err)
)
```

```shell title="Вывод"
> npx tsx index.ts
> {"name":"COLUMNS","database":"INFORMATION_SCHEMA"}
> {"name":"KEY_COLUMN_USAGE","database":"INFORMATION_SCHEMA"}
...
> Поток завершён.
```

</TabItem>
</Tabs>

### Вставка потока из файла в таблицу {#insert-a-stream-from-a-file-into-a-table}

Создайте файл `./samples/my_first_table_2024-07-11.csv` со следующим содержимым:

```csv
"user_id","json","name"
"1","{""name"":""John"",""age"":30}","John"
"2","{""name"":""Jane"",""age"":25}","Jane"
```

**SQL создания таблицы:**

```sql
create table default.my_first_table
(
    user_id String,
    json String,
    name String,
) ENGINE = MergeTree()
ORDER BY user_id;
```

**SQL конечной точки Query API:**

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
