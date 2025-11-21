---
sidebar_title: 'Конечные точки Query API'
slug: /cloud/get-started/query-endpoints
description: 'Легко развертывайте конечные точки REST API на основе сохранённых запросов'
keywords: ['api', 'конечные точки query api', 'конечные точки запросов', 'query rest api']
title: 'Конечные точки Query API'
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


# Настройка конечных точек Query API

Функция **Query API Endpoints** позволяет создавать конечную точку API напрямую из любого сохранённого SQL-запроса в консоли ClickHouse Cloud. Вы сможете обращаться к таким конечным точкам по HTTP, чтобы выполнять свои сохранённые запросы без необходимости подключаться к сервису ClickHouse Cloud через нативный драйвер.



## Предварительные требования {#quick-start-guide}

Перед началом работы убедитесь, что у вас есть:

- API-ключ с соответствующими разрешениями
- Роль администратора в консоли

Если у вас еще нет API-ключа, следуйте [этому руководству по его созданию](/cloud/manage/openapi).

:::note Минимальные разрешения
Для выполнения запросов к API-эндпоинту требуется API-ключ с организационной ролью `Member` и доступом к сервису `Query Endpoints`. Роль базы данных настраивается при создании эндпоинта.
:::

<VerticalStepper headerLevel="h3">

### Создание сохраненного запроса {#creating-a-saved-query}

Если у вас уже есть сохраненный запрос, можете пропустить этот шаг.

Откройте новую вкладку запроса. Для демонстрации мы будем использовать [набор данных youtube](/getting-started/example-datasets/youtube-dislikes), который содержит приблизительно 4,5 миллиарда записей.
Следуйте инструкциям в разделе [«Создание таблицы»](/getting-started/example-datasets/youtube-dislikes#create-the-table), чтобы создать таблицу в вашем облачном сервисе и загрузить в нее данные.

:::tip Ограничьте количество строк с помощью `LIMIT`
В руководстве по примеру набора данных загружается большой объем данных — 4,65 миллиарда строк, что может занять значительное время.
Для целей данного руководства рекомендуется использовать оператор `LIMIT` для загрузки меньшего объема данных,
например, 10 миллионов строк.
:::

В качестве примера запроса мы получим топ-10 авторов по среднему количеству просмотров на видео за год, указанный пользователем в параметре `year`.

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

Обратите внимание, что этот запрос содержит параметр (`year`), который выделен в приведенном выше фрагменте кода.
Параметры запроса указываются с помощью фигурных скобок `{ }` вместе с типом параметра.
Редактор запросов SQL-консоли автоматически распознает выражения параметров запросов ClickHouse и предоставляет поле ввода для каждого параметра.

Давайте быстро выполним этот запрос, чтобы убедиться в его работоспособности, указав год `2010` в поле ввода переменных запроса в правой части SQL-редактора:

<Image img={endpoints_testquery} size='md' alt='Test the example query' />

Затем сохраните запрос:

<Image img={endpoints_savequery} size='md' alt='Save example query' />

Дополнительную документацию по сохраненным запросам можно найти в разделе [«Сохранение запроса»](/cloud/get-started/sql-console#saving-a-query).

### Настройка API-эндпоинта запроса {#configuring-the-query-api-endpoint}

API-эндпоинты запросов можно настроить непосредственно из представления запроса, нажав кнопку **Share** и выбрав `API Endpoint`.
Вам будет предложено указать, какие API-ключи должны иметь доступ к эндпоинту:

<Image img={endpoints_configure} size='md' alt='Configure query endpoint' />

После выбора API-ключа вам будет предложено:

- Выбрать роль базы данных, которая будет использоваться для выполнения запроса (`Full access`, `Read only` или `Create a custom role`)
- Указать разрешенные домены для совместного использования ресурсов между источниками (CORS)

После выбора этих параметров API-эндпоинт запроса будет автоматически создан.

Будет отображена примерная команда `curl`, с помощью которой вы сможете отправить тестовый запрос:

<Image img={endpoints_completed} size='md' alt='Endpoint curl command' />

Команда curl, отображаемая в интерфейсе, приведена ниже для удобства:

```bash
curl -H "Content-Type: application/json" -s --user '<key_id>:<key_secret>' '<API-endpoint>?format=JSONEachRow&param_year=<value>'
```

### Параметры API запросов {#query-api-parameters}

Параметры запроса указываются с помощью синтаксиса `{parameter_name: type}`. Эти параметры будут автоматически обнаружены, и пример полезной нагрузки запроса будет содержать объект `queryVariables`, через который можно передавать эти параметры.

### Тестирование и мониторинг {#testing-and-monitoring}

После создания API-эндпоинта запроса вы можете проверить его работу с помощью `curl` или любого другого HTTP-клиента:

<Image img={endpoints_curltest} size='md' alt='endpoint curl test' />

После отправки первого запроса справа от кнопки **Share** должна появиться новая кнопка. При нажатии на нее откроется всплывающая панель с данными мониторинга запроса:

<Image img={endpoints_monitoring} size='sm' alt='Endpoint monitoring' />

</VerticalStepper>


## Детали реализации {#implementation-details}

Данная конечная точка выполняет запросы к сохранённым конечным точкам Query API.
Поддерживаются несколько версий, гибкие форматы ответов, параметризованные запросы и опциональная потоковая передача ответов (только версия 2).

**Конечная точка:**

```text
GET /query-endpoints/{queryEndpointId}/run
POST /query-endpoints/{queryEndpointId}/run
```

### HTTP-методы {#http-methods}

| Метод    | Сценарий использования                     | Параметры                                                      |
| -------- | ------------------------------------------ | -------------------------------------------------------------- |
| **GET**  | Простые запросы с параметрами              | Передача переменных запроса через URL-параметры (`?param_name=value`)  |
| **POST** | Сложные запросы или при использовании тела запроса | Передача переменных запроса в теле запроса (объект `queryVariables`) |

**Когда использовать GET:**

- Простые запросы без сложных вложенных данных
- Параметры легко кодируются в URL
- Преимущества кэширования благодаря семантике HTTP GET

**Когда использовать POST:**

- Сложные переменные запроса (массивы, объекты, большие строки)
- Когда тело запроса предпочтительнее с точки зрения безопасности/конфиденциальности
- Потоковая загрузка файлов или больших объёмов данных

### Аутентификация {#authentication}

**Обязательно:** Да  
**Метод:** Basic Auth с использованием OpenAPI Key/Secret  
**Разрешения:** Соответствующие разрешения для конечной точки запроса

### Конфигурация запроса {#request-configuration}

#### URL-параметры {#url-params}

| Параметр          | Обязательно | Описание                                        |
| ----------------- | -------- | -------------------------------------------------- |
| `queryEndpointId` | **Да**   | Уникальный идентификатор выполняемой конечной точки запроса |

#### Параметры запроса {#query-params}

| Параметр              | Обязательно | Описание                                                                                  | Пример                |
| --------------------- | -------- | -------------------------------------------------------------------------------------------- | --------------------- |
| `format`              | Нет      | Формат ответа (поддерживаются все форматы ClickHouse)                                        | `?format=JSONEachRow` |
| `param_:name`         | Нет      | Переменные запроса, когда тело запроса является потоком. Замените `:name` на имя вашей переменной | `?param_year=2024`    |
| `:clickhouse_setting` | Нет      | Любая поддерживаемая [настройка ClickHouse](https://clickhouse.com/docs/operations/settings/settings) | `?max_threads=8`      |

#### Заголовки {#headers}

| Заголовок                       | Обязательно | Описание                                                 | Значения                                    |
| ------------------------------- | -------- | ----------------------------------------------------------- | ------------------------------------------- |
| `x-clickhouse-endpoint-version` | Нет      | Указывает версию конечной точки                             | `1` или `2` (по умолчанию последняя сохранённая версия) |
| `x-clickhouse-endpoint-upgrade` | Нет      | Инициирует обновление версии конечной точки (используется с заголовком версии) | `1` для обновления                          |

---

### Тело запроса {#request-body}

#### Параметры {#params}

| Параметр         | Тип    | Обязательно | Описание                       |
| ---------------- | ------ | -------- | --------------------------------- |
| `queryVariables` | object | Нет      | Переменные, используемые в запросе |
| `format`         | string | Нет      | Формат ответа                     |

#### Поддерживаемые форматы {#supported-formats}

| Версия                  | Поддерживаемые форматы                                                                                                                                            |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Версия 2**            | Все форматы, поддерживаемые ClickHouse                                                                                                                            |
| **Версия 1 (ограниченная)** | TabSeparated <br/> TabSeparatedWithNames <br/> TabSeparatedWithNamesAndTypes <br/> JSON <br/> JSONEachRow <br/> CSV <br/> CSVWithNames <br/> CSVWithNamesAndTypes |

---

### Ответы {#responses}

#### Успешный ответ {#success}

**Статус:** `200 OK`  
Запрос успешно выполнен.

#### Коды ошибок {#error-codes}

| Код статуса        | Описание                                           |
| ------------------ | -------------------------------------------------- |
| `400 Bad Request`  | Запрос имеет неверный формат                       |
| `401 Unauthorized` | Отсутствует аутентификация или недостаточно разрешений |
| `404 Not Found`    | Указанная конечная точка запроса не найдена        |

#### Рекомендации по обработке ошибок {#error-handling-best-practices}

- Убедитесь, что в запрос включены действительные учётные данные для аутентификации
- Проверьте `queryEndpointId` и `queryVariables` перед отправкой
- Реализуйте корректную обработку ошибок с соответствующими сообщениями об ошибках

---

### Обновление версий конечной точки {#upgrading-endpoint-versions}

Для обновления с версии 1 до версии 2:

1. Включите заголовок `x-clickhouse-endpoint-upgrade` со значением `1`
2. Включите заголовок `x-clickhouse-endpoint-version` со значением `2`

Это обеспечивает доступ к функциям версии 2, включая:

- Поддержку всех форматов ClickHouse
- Возможности потоковой передачи ответов
- Улучшенную производительность и функциональность


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

### Запрос с настройкой ClickHouse `max_threads`, установленной в значение 8 {#request-with-clickhouse-settings-max_threads-set-to-8}

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
