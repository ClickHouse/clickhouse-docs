---
title: 'Работа с JSON в ClickHouse'
sidebar_label: 'Работа с JSON'
slug: /integrations/clickpipes/mongodb/quickstart
description: 'Распространённые подходы к работе с JSON-данными, реплицируемыми из MongoDB в ClickHouse через ClickPipes'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'ингестия данных', 'синхронизация в реальном времени']
---

# Работа с JSON в ClickHouse {#working-with-json-in-clickhouse}

В этом руководстве рассматриваются типовые подходы к работе с JSON‑данными, реплицируемыми из MongoDB в ClickHouse через ClickPipes.

Предположим, что мы создали коллекцию `t1` в MongoDB для отслеживания клиентских заказов:

```javascript
db.t1.insertOne({
  "order_id": "ORD-001234",
  "customer_id": 98765,
  "status": "completed",
  "total_amount": 299.97,
  "order_date": new Date(),
  "shipping": {
    "method": "express",
    "city": "Seattle",
    "cost": 19.99
  },
  "items": [
    {
      "category": "electronics",
      "price": 149.99
    },
    {
      "category": "accessories",
      "price": 24.99
    }
  ]
})
```

Коннектор MongoDB CDC реплицирует документы MongoDB в ClickHouse, используя нативный тип данных JSON. Реплицированная таблица `t1` в ClickHouse будет содержать следующую строку:

```shell
Row 1:
──────
_id:                "68a4df4b9fe6c73b541703b0"
doc:                {"_id":"68a4df4b9fe6c73b541703b0","customer_id":"98765","items":[{"category":"electronics","price":149.99},{"category":"accessories","price":24.99}],"order_date":"2025-08-19T20:32:11.705Z","order_id":"ORD-001234","shipping":{"city":"Seattle","cost":19.99,"method":"express"},"status":"completed","total_amount":299.97}
_peerdb_synced_at:  2025-08-19 20:50:42.005000000
_peerdb_is_deleted: 0
_peerdb_version:    0
```

## Схема таблицы {#table-schema}

Реплицируемые таблицы используют эту стандартную схему:

```shell
┌─name───────────────┬─type──────────┐
│ _id                │ String        │
│ doc                │ JSON          │
│ _peerdb_synced_at  │ DateTime64(9) │
│ _peerdb_version    │ Int64         │
│ _peerdb_is_deleted │ Int8          │
└────────────────────┴───────────────┘
```

* `_id`: Первичный ключ из MongoDB
* `doc`: Документ MongoDB, реплицируемый в тип данных JSON
* `_peerdb_synced_at`: Фиксирует время последней синхронизации строки
* `_peerdb_version`: Отслеживает версию строки; увеличивается при обновлении или удалении строки
* `_peerdb_is_deleted`: Показывает, удалена ли строка

### Движок таблицы ReplacingMergeTree {#replacingmergetree-table-engine}

ClickPipes сопоставляет коллекции MongoDB с ClickHouse, используя семейство движков таблиц `ReplacingMergeTree`. В этом движке обновления моделируются как вставки с более новой версией (`_peerdb_version`) документа для заданного первичного ключа (`_id`), что обеспечивает эффективную обработку обновлений, замен и удалений как версионных вставок.

`ReplacingMergeTree` асинхронно очищает дубликаты в фоновом режиме. Чтобы гарантировать отсутствие дубликатов для одной и той же строки, используйте [модификатор `FINAL`](/sql-reference/statements/select/from#final-modifier). Например:

```sql
SELECT * FROM t1 FINAL;
```

### Обработка удалений {#handling-deletes}

Удаления из MongoDB реплицируются как новые строки, помеченные как удалённые с помощью столбца `_peerdb_is_deleted`. Обычно такие строки следует отфильтровывать в запросах:

```sql
SELECT * FROM t1 FINAL WHERE _peerdb_is_deleted = 0;
```

Вы также можете создать политику на уровне строк, чтобы автоматически отфильтровывать удалённые строки вместо того, чтобы указывать фильтр в каждом запросе:

```sql
CREATE ROW POLICY policy_name ON t1
FOR SELECT USING _peerdb_is_deleted = 0;
```

## Выполнение запросов к данным JSON {#querying-json-data}

Вы можете напрямую обращаться к полям JSON, используя точечную нотацию:

```sql title="Query"
SELECT
    doc.order_id,
    doc.shipping.method
FROM t1;
```

```shell title="Result"
┌-─doc.order_id─┬─doc.shipping.method─┐
│ ORD-001234    │ express             │
└───────────────┴─────────────────────┘
```

При выполнении запросов к *вложенным полям объекта* с использованием точечной нотации не забудьте добавить оператор [`^`](https://clickhouse.com/docs/sql-reference/data-types/newjson#reading-json-sub-objects-as-sub-columns):

```sql title="Query"
SELECT doc.^shipping as shipping_info FROM t1;
```

```shell title="Result"
┌─shipping_info──────────────────────────────────────┐
│ {"city":"Seattle","cost":19.99,"method":"express"} │
└────────────────────────────────────────────────────┘
```

### Динамический тип {#dynamic-type}

В ClickHouse каждое поле JSON имеет тип `Dynamic`. Динамический тип позволяет ClickHouse хранить значения любого типа, не зная этот тип заранее. Это можно проверить с помощью функции `toTypeName`:

```sql title="Query"
SELECT toTypeName(doc.customer_id) AS type FROM t1;
```

```shell title="Result"
┌─type────┐
│ Dynamic │
└─────────┘
```

Чтобы изучить исходный тип (или типы) данных для поля, вы можете воспользоваться функцией `dynamicType`. Обратите внимание, что для одного и того же имени поля в разных строках могут быть разные типы данных:

```sql title="Query"
SELECT dynamicType(doc.customer_id) AS type FROM t1;
```

```shell title="Result"
┌─type──┐
│ Int64 │
└───────┘
```

[Обычные функции](https://clickhouse.com/docs/sql-reference/functions/regular-functions) работают с типом Dynamic так же, как и с обычными столбцами:

**Пример 1: Разбор дат**

```sql title="Query"
SELECT parseDateTimeBestEffortOrNull(doc.order_date) AS order_date FROM t1;
```

```shell title="Result"
┌─order_date──────────┐
│ 2025-08-19 20:32:11 │
└─────────────────────┘
```

**Пример 2: Условная логика**

```sql title="Query"
SELECT multiIf(
    doc.total_amount < 100, 'less_than_100',
    doc.total_amount < 1000, 'less_than_1000',
    '1000+') AS spendings
FROM t1;
```

```shell title="Result"
┌─spendings──────┐
│ less_than_1000 │
└────────────────┘
```

**Пример 3: Операции с массивами**

```sql title="Query"
SELECT length(doc.items) AS item_count FROM t1;
```

```shell title="Result"
┌─item_count─┐
│          2 │
└────────────┘
```

### Приведение типов полей {#field-casting}

[Агрегатные функции](https://clickhouse.com/docs/sql-reference/aggregate-functions/combinators) в ClickHouse не работают напрямую с типом `dynamic`. Например, если вы попытаетесь напрямую использовать функцию `sum` для типа `dynamic`, вы получите следующую ошибку:

```sql
SELECT sum(doc.shipping.cost) AS shipping_cost FROM t1;
-- DB::Exception: Illegal type Dynamic of argument for aggregate function sum. (ILLEGAL_TYPE_OF_ARGUMENT)
```

Чтобы использовать агрегатные функции, приведите поле к соответствующему типу с помощью функции `CAST` или синтаксиса `::`:

```sql title="Query"
SELECT sum(doc.shipping.cost::Float32) AS shipping_cost FROM t1;
```

```shell title="Result"
┌─shipping_cost─┐
│         19.99 │
└───────────────┘
```

:::note
Приведение значения из динамического типа к его базовому типу данных (определяется `dynamicType`) обладает высокой производительностью, так как ClickHouse уже хранит значение во внутреннем представлении этого базового типа.
:::

## Уплощение JSON {#flattening-json}

### Обычное представление {#normal-view}

Вы можете создавать обычные представления поверх JSON-таблицы, чтобы инкапсулировать логику уплощения/приведения типов/преобразования и запрашивать данные в виде, похожем на реляционную таблицу. Обычные представления являются лёгкими, так как они хранят только сам запрос, а не исходные данные. Например:

```sql
CREATE VIEW v1 AS
SELECT
    CAST(doc._id, 'String') AS object_id,
    CAST(doc.order_id, 'String') AS order_id,
    CAST(doc.customer_id, 'Int64') AS customer_id,
    CAST(doc.status, 'String') AS status,
    CAST(doc.total_amount, 'Decimal64(2)') AS total_amount,
    CAST(parseDateTime64BestEffortOrNull(doc.order_date, 3), 'DATETIME(3)') AS order_date,
    doc.^shipping AS shipping_info,
    doc.items AS items
FROM t1 FINAL
WHERE _peerdb_is_deleted = 0;
```

У этого представления будет следующая схема:

```shell
┌─name────────────┬─type───────────┐
│ object_id       │ String         │
│ order_id        │ String         │
│ customer_id     │ Int64          │
│ status          │ String         │
│ total_amount    │ Decimal(18, 2) │
│ order_date      │ DateTime64(3)  │
│ shipping_info   │ JSON           │
│ items           │ Dynamic        │
└─────────────────┴────────────────┘
```

Теперь вы можете выполнять запросы к этому представлению так же, как к денормализованной («расплющенной») таблице:

```sql
SELECT
    customer_id,
    sum(total_amount)
FROM v1
WHERE shipping_info.city = 'Seattle'
GROUP BY customer_id
ORDER BY customer_id DESC
LIMIT 10;
```

### Обновляемое материализованное представление {#refreshable-materialized-view}

Вы можете создать [обновляемые материализованные представления](https://clickhouse.com/docs/materialized-view/refreshable-materialized-view), которые позволяют планировать выполнение запроса для дедупликации строк и сохранения результатов в денормализованной целевой таблице. При каждом запланированном обновлении целевая таблица заменяется последними результатами запроса.

Ключевое преимущество этого подхода заключается в том, что запрос с использованием ключевого слова `FINAL` выполняется только один раз во время обновления, устраняя необходимость выполнения последующих запросов к целевой таблице с использованием `FINAL`.

Недостаток заключается в том, что данные в целевой таблице актуальны только на момент последнего обновления. Для многих сценариев интервалы обновления от нескольких минут до нескольких часов обеспечивают хороший баланс между актуальностью данных и производительностью запросов.

```sql
CREATE TABLE flattened_t1 (
    `_id` String,
    `order_id` String,
    `customer_id` Int64,
    `status` String,
    `total_amount` Decimal(18, 2),
    `order_date` DateTime64(3),
    `shipping_info` JSON,
    `items` Dynamic
)
ENGINE = ReplacingMergeTree()
PRIMARY KEY _id
ORDER BY _id;

CREATE MATERIALIZED VIEW rmv REFRESH EVERY 1 HOUR TO flattened_t1 AS
SELECT 
    CAST(doc._id, 'String') AS _id,
    CAST(doc.order_id, 'String') AS order_id,
    CAST(doc.customer_id, 'Int64') AS customer_id,
    CAST(doc.status, 'String') AS status,
    CAST(doc.total_amount, 'Decimal64(2)') AS total_amount,
    CAST(parseDateTime64BestEffortOrNull(doc.order_date, 3), 'DATETIME(3)') AS order_date,
    doc.^shipping AS shipping_info,
    doc.items AS items
FROM t1 FINAL
WHERE _peerdb_is_deleted = 0;
```

Теперь вы можете напрямую выполнять запросы к таблице `flattened_t1`, не используя модификатор `FINAL`:

```sql
SELECT
    customer_id,
    sum(total_amount)
FROM flattened_t1
WHERE shipping_info.city = 'Seattle'
GROUP BY customer_id
ORDER BY customer_id DESC
LIMIT 10;
```

### Инкрементальное материализованное представление {#incremental-materialized-view}

Если вам нужно получать доступ к плоским (flattened) столбцам в режиме реального времени, вы можете создать [инкрементальное материализованное представление](https://clickhouse.com/docs/materialized-view/incremental-materialized-view). Если в вашей таблице часто происходят обновления, не рекомендуется использовать модификатор `FINAL` в материализованном представлении, так как каждое обновление будет запускать операцию слияния. Вместо этого вы можете выполнять дедупликацию данных на этапе выполнения запроса, построив обычное представление поверх материализованного представления.

```sql
CREATE TABLE flattened_t1 (
    `_id` String,
    `order_id` String,
    `customer_id` Int64,
    `status` String,
    `total_amount` Decimal(18, 2),
    `order_date` DateTime64(3),
    `shipping_info` JSON,
    `items` Dynamic,
    `_peerdb_version` Int64,
    `_peerdb_synced_at` DateTime64(9),
    `_peerdb_is_deleted` Int8
)
ENGINE = ReplacingMergeTree()
PRIMARY KEY _id
ORDER BY _id;

CREATE MATERIALIZED VIEW imv TO flattened_t1 AS
SELECT 
    CAST(doc._id, 'String') AS _id,
    CAST(doc.order_id, 'String') AS order_id,
    CAST(doc.customer_id, 'Int64') AS customer_id,
    CAST(doc.status, 'String') AS status,
    CAST(doc.total_amount, 'Decimal64(2)') AS total_amount,
    CAST(parseDateTime64BestEffortOrNull(doc.order_date, 3), 'DATETIME(3)') AS order_date,
    doc.^shipping AS shipping_info,
    doc.items,
    _peerdb_version,
    _peerdb_synced_at,   
    _peerdb_is_deleted
FROM t1;

CREATE VIEW flattened_t1_final AS
SELECT * FROM flattened_t1 FINAL WHERE _peerdb_is_deleted = 0;
```

Теперь вы можете выполнить запрос к представлению `flattened_t1_final` следующим образом:

```sql
SELECT
    customer_id,
    sum(total_amount)
FROM flattened_t1_final
AND shipping_info.city = 'Seattle'
GROUP BY customer_id
ORDER BY customer_id DESC
LIMIT 10;
```
