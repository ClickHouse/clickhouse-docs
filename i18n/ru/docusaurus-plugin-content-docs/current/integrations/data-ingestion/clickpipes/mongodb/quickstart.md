---
title: 'Работа с JSON в ClickHouse'
sidebar_label: 'Работа с JSON'
slug: /integrations/clickpipes/mongodb/quickstart
description: 'Типовые паттерны работы с JSON-данными, реплицируемыми из MongoDB в ClickHouse через ClickPipes'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'data ingestion', 'real-time sync']
---



# Работа с JSON в ClickHouse

В этом руководстве рассмотрены типовые шаблоны работы с JSON‑данными, реплицируемыми из MongoDB в ClickHouse через ClickPipes.

Предположим, мы создали коллекцию `t1` в MongoDB для отслеживания заказов клиентов:

```javascript
db.t1.insertOne({
  "order_id": "ORD-001234",
  "customer_id": 98765,
  "status": "завершен",
  "total_amount": 299.97,
  "order_date": new Date(),
  "shipping": {
    "method": "express",
    "city": "Seattle",
    "cost": 19.99
  },
  "items": [
    {
      "category": "электроника",
      "price": 149.99
    },
    {
      "category": "аксессуары",
      "price": 24.99
    }
  ]
})
```

Коннектор MongoDB CDC реплицирует документы MongoDB в ClickHouse, используя встроенный тип данных JSON. Реплицируемая таблица `t1` в ClickHouse будет содержать следующую строку:

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

Реплицируемые таблицы используют следующую стандартную схему:

```shell
┌─name───────────────┬─type──────────┐
│ _id                │ String        │
│ doc                │ JSON          │
│ _peerdb_synced_at  │ DateTime64(9) │
│ _peerdb_version    │ Int64         │
│ _peerdb_is_deleted │ Int8          │
└────────────────────┴───────────────┘
```

- `_id`: Первичный ключ из MongoDB
- `doc`: Документ MongoDB, реплицированный как тип данных JSON
- `_peerdb_synced_at`: Фиксирует время последней синхронизации строки
- `_peerdb_version`: Отслеживает версию строки; инкрементируется при обновлении или удалении строки
- `_peerdb_is_deleted`: Указывает, удалена ли строка

### Движок таблиц ReplacingMergeTree {#replacingmergetree-table-engine}

ClickPipes отображает коллекции MongoDB в ClickHouse, используя семейство движков таблиц `ReplacingMergeTree`. При использовании этого движка обновления моделируются как вставки с более новой версией (`_peerdb_version`) документа для заданного первичного ключа (`_id`), что обеспечивает эффективную обработку обновлений, замен и удалений в виде версионированных вставок.

`ReplacingMergeTree` асинхронно удаляет дубликаты в фоновом режиме. Чтобы гарантировать отсутствие дубликатов для одной и той же строки, используйте [модификатор `FINAL`](/sql-reference/statements/select/from#final-modifier). Например:

```sql
SELECT * FROM t1 FINAL;
```

### Обработка удалений {#handling-deletes}

Удаления из MongoDB распространяются как новые строки, помеченные как удаленные с помощью столбца `_peerdb_is_deleted`. Обычно их необходимо отфильтровывать в запросах:

```sql
SELECT * FROM t1 FINAL WHERE _peerdb_is_deleted = 0;
```

Также можно создать политику на уровне строк для автоматической фильтрации удаленных строк вместо указания фильтра в каждом запросе:

```sql
CREATE ROW POLICY policy_name ON t1
FOR SELECT USING _peerdb_is_deleted = 0;
```


## Запрос данных JSON {#querying-json-data}

Вы можете напрямую запрашивать поля JSON, используя точечную нотацию:

```sql title="Запрос"
SELECT
    doc.order_id,
    doc.shipping.method
FROM t1;
```

```shell title="Результат"
┌-─doc.order_id─┬─doc.shipping.method─┐
│ ORD-001234    │ express             │
└───────────────┴─────────────────────┘
```

При запросе _вложенных полей объектов_ с использованием точечной нотации обязательно добавьте оператор [`^`](https://clickhouse.com/docs/sql-reference/data-types/newjson#reading-json-sub-objects-as-sub-columns):

```sql title="Запрос"
SELECT doc.^shipping as shipping_info FROM t1;
```

```shell title="Результат"
┌─shipping_info──────────────────────────────────────┐
│ {"city":"Seattle","cost":19.99,"method":"express"} │
└────────────────────────────────────────────────────┘
```

### Тип Dynamic {#dynamic-type}

В ClickHouse каждое поле в JSON имеет тип `Dynamic`. Тип Dynamic позволяет ClickHouse хранить значения любого типа без предварительного знания типа. Вы можете проверить это с помощью функции `toTypeName`:

```sql title="Запрос"
SELECT toTypeName(doc.customer_id) AS type FROM t1;
```

```shell title="Результат"
┌─type────┐
│ Dynamic │
└─────────┘
```

Чтобы узнать фактический тип данных поля, используйте функцию `dynamicType`. Обратите внимание, что для одного и того же имени поля в разных строках могут быть разные типы данных:

```sql title="Запрос"
SELECT dynamicType(doc.customer_id) AS type FROM t1;
```

```shell title="Результат"
┌─type──┐
│ Int64 │
└───────┘
```

[Обычные функции](https://clickhouse.com/docs/sql-reference/functions/regular-functions) работают с типом Dynamic так же, как и с обычными столбцами:

**Пример 1: Разбор дат**

```sql title="Запрос"
SELECT parseDateTimeBestEffortOrNull(doc.order_date) AS order_date FROM t1;
```

```shell title="Результат"
┌─order_date──────────┐
│ 2025-08-19 20:32:11 │
└─────────────────────┘
```

**Пример 2: Условная логика**

```sql title="Запрос"
SELECT multiIf(
    doc.total_amount < 100, 'less_than_100',
    doc.total_amount < 1000, 'less_than_1000',
    '1000+') AS spendings
FROM t1;
```

```shell title="Результат"
┌─spendings──────┐
│ less_than_1000 │
└────────────────┘
```

**Пример 3: Операции с массивами**

```sql title="Запрос"
SELECT length(doc.items) AS item_count FROM t1;
```

```shell title="Результат"
┌─item_count─┐
│          2 │
└────────────┘
```

### Приведение типов полей {#field-casting}

[Агрегатные функции](https://clickhouse.com/docs/sql-reference/aggregate-functions/combinators) в ClickHouse не работают с типом Dynamic напрямую. Например, если вы попытаетесь напрямую использовать функцию `sum` для типа Dynamic, вы получите следующую ошибку:

```sql
SELECT sum(doc.shipping.cost) AS shipping_cost FROM t1;
-- DB::Exception: Illegal type Dynamic of argument for aggregate function sum. (ILLEGAL_TYPE_OF_ARGUMENT)
```

Чтобы использовать агрегатные функции, приведите поле к соответствующему типу с помощью функции `CAST` или синтаксиса `::`:

```sql title="Запрос"
SELECT sum(doc.shipping.cost::Float32) AS shipping_cost FROM t1;
```

```shell title="Результат"
┌─shipping_cost─┐
│         19.99 │
└───────────────┘
```

:::note
Приведение из типа Dynamic к фактическому типу данных (определяемому функцией `dynamicType`) выполняется очень эффективно, поскольку ClickHouse уже хранит значение во внутреннем представлении его фактического типа.
:::


## Преобразование JSON в плоскую структуру {#flattening-json}

### Обычное представление {#normal-view}

Вы можете создавать обычные представления поверх таблицы JSON для инкапсуляции логики преобразования в плоскую структуру, приведения типов и трансформации данных, чтобы запрашивать данные аналогично реляционной таблице. Обычные представления являются легковесными, поскольку они хранят только сам запрос, а не базовые данные. Например:

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

Это представление будет иметь следующую схему:

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

Теперь вы можете запрашивать представление так же, как и плоскую таблицу:

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

Вы можете создавать [обновляемые материализованные представления](https://clickhouse.com/docs/materialized-view/refreshable-materialized-view), которые позволяют планировать выполнение запросов для дедупликации строк и сохранения результатов в плоской целевой таблице. При каждом запланированном обновлении целевая таблица заменяется последними результатами запроса.

Ключевое преимущество этого метода заключается в том, что запрос с использованием ключевого слова `FINAL` выполняется только один раз во время обновления, что устраняет необходимость использования `FINAL` в последующих запросах к целевой таблице.

Недостатком является то, что данные в целевой таблице актуальны только на момент последнего обновления. Для многих сценариев использования интервалы обновления от нескольких минут до нескольких часов обеспечивают хороший баланс между свежестью данных и производительностью запросов.

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

Теперь вы можете запрашивать таблицу `flattened_t1` напрямую без модификатора `FINAL`:

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

### Инкрементное материализованное представление {#incremental-materialized-view}

Если вы хотите получать доступ к плоским столбцам в режиме реального времени, вы можете создать [инкрементные материализованные представления](https://clickhouse.com/docs/materialized-view/incremental-materialized-view). Если ваша таблица часто обновляется, не рекомендуется использовать модификатор `FINAL` в материализованном представлении, поскольку каждое обновление будет запускать слияние. Вместо этого вы можете выполнять дедупликацию данных во время запроса, создав обычное представление поверх материализованного представления.


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
