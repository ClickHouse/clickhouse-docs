---
slug: /use-cases/data-lake/rest-catalog
sidebar_label: 'Каталог REST'
title: 'Каталог REST'
pagination_prev: null
pagination_next: null
description: 'В этом руководстве мы шаг за шагом рассмотрим, как выполнять запросы к вашим данным с помощью ClickHouse и REST Catalog.'
keywords: ['REST', 'Tabular', 'Data Lake', 'Iceberg']
show_related_blogs: true
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

:::note
Интеграция с REST Catalog работает только с таблицами Iceberg.
Эта интеграция поддерживает как AWS S3, так и других провайдеров облачного хранилища.
:::

ClickHouse поддерживает интеграцию с несколькими каталогами (Unity, Glue, REST, Polaris и др.). Это руководство пошагово покажет, как выполнять запросы к данным с использованием ClickHouse и спецификации [REST Catalog](https://github.com/apache/iceberg/blob/main/open-api/rest-catalog-open-api.yaml/).

REST Catalog — это стандартизированная спецификация API для каталогов Iceberg, поддерживаемая различными платформами, включая:

* **Локальные среды разработки** (с использованием конфигураций docker-compose)
* **Управляемые сервисы**, такие как Tabular.io
* **Самостоятельно размещаемые** реализации REST Catalog

:::note
Поскольку эта функция является экспериментальной, вам нужно включить её с помощью:
`SET allow_experimental_database_iceberg = 1;`
:::


## Настройка локальной среды разработки {#local-development-setup}

Для локальной разработки и тестирования можно использовать контейнеризованную установку REST-каталога. Этот подход идеально подходит для обучения, прототипирования и сред разработки.

### Предварительные требования {#local-prerequisites}

1. **Docker и Docker Compose**: Убедитесь, что Docker установлен и запущен
2. **Пример установки**: Можно использовать различные конфигурации docker-compose (см. раздел «Альтернативные образы Docker» ниже)

### Настройка локального REST-каталога {#setting-up-local-rest-catalog}

Можно использовать различные контейнеризованные реализации REST-каталога, например **[Databricks docker-spark-iceberg](https://github.com/databricks/docker-spark-iceberg/blob/main/docker-compose.yml?ref=blog.min.io)**, который предоставляет полную среду Spark + Iceberg + REST-каталог с docker-compose, что делает его идеальным для тестирования интеграций Iceberg.

**Шаг 1:** Создайте новую папку для запуска примера, затем создайте файл `docker-compose.yml` с конфигурацией из [Databricks docker-spark-iceberg](https://github.com/databricks/docker-spark-iceberg/blob/main/docker-compose.yml?ref=blog.min.io).

**Шаг 2:** Затем создайте файл `docker-compose.override.yml` и поместите в него следующую конфигурацию контейнера ClickHouse:

```yaml
version: "3.8"

services:
  clickhouse:
    image: clickhouse/clickhouse-server:25.5.6
    container_name: clickhouse
    user: "0:0" # Обеспечивает права root
    ports:
      - "8123:8123"
      - "9002:9000"
    volumes:
      - ./clickhouse:/var/lib/clickhouse
      - ./clickhouse/data_import:/var/lib/clickhouse/data_import # Монтирование папки с набором данных
    networks:
      - iceberg_net
    environment:
      - CLICKHOUSE_DB=default
      - CLICKHOUSE_USER=default
      - CLICKHOUSE_DO_NOT_CHOWN=1
      - CLICKHOUSE_PASSWORD=
```

**Шаг 3:** Выполните следующую команду для запуска сервисов:

```bash
docker compose up
```

**Шаг 4:** Дождитесь готовности всех сервисов. Проверить логи можно следующим образом:

```bash
docker-compose logs -f
```

:::note
Установка REST-каталога требует предварительной загрузки тестовых данных в таблицы Iceberg. Убедитесь, что среда Spark создала и заполнила таблицы, прежде чем пытаться запрашивать их через ClickHouse. Доступность таблиц зависит от конкретной конфигурации docker-compose и скриптов загрузки тестовых данных.
:::

### Подключение к локальному REST-каталогу {#connecting-to-local-rest-catalog}

Подключитесь к контейнеру ClickHouse:

```bash
docker exec -it clickhouse clickhouse-client
```

Затем создайте подключение базы данных к REST-каталогу:

```sql
SET allow_experimental_database_iceberg = 1;

CREATE DATABASE demo
ENGINE = DataLakeCatalog('http://rest:8181/v1', 'admin', 'password')
SETTINGS
    catalog_type = 'rest',
    storage_endpoint = 'http://minio:9000/lakehouse',
    warehouse = 'demo'
```


## Запрос таблиц каталога REST с использованием ClickHouse {#querying-rest-catalog-tables-using-clickhouse}

Теперь, когда соединение установлено, можно начать выполнять запросы через каталог REST. Например:

```sql
USE demo;

SHOW TABLES;
```

Если ваша установка включает примеры данных (например, набор данных о такси), вы должны увидеть таблицы следующего вида:

```sql title="Ответ"
┌─name──────────┐
│ default.taxis │
└───────────────┘
```

:::note
Если вы не видите никаких таблиц, это обычно означает:

1. Окружение Spark еще не создало примеры таблиц
2. Служба каталога REST не полностью инициализирована
3. Процесс загрузки примеров данных не завершен

Вы можете проверить журналы Spark, чтобы отследить прогресс создания таблиц:

```bash
docker-compose logs spark
```

:::

Чтобы выполнить запрос к таблице (если она доступна):

```sql
SELECT count(*) FROM `default.taxis`;
```

```sql title="Ответ"
┌─count()─┐
│ 2171187 │
└─────────┘
```

:::note Требуются обратные кавычки
Обратные кавычки необходимы, поскольку ClickHouse не поддерживает более одного пространства имен.
:::

Чтобы просмотреть DDL таблицы:

```sql
SHOW CREATE TABLE `default.taxis`;
```

```sql title="Ответ"
┌─statement─────────────────────────────────────────────────────────────────────────────────────┐
│ CREATE TABLE demo.`default.taxis`                                                             │
│ (                                                                                             │
│     `VendorID` Nullable(Int64),                                                               │
│     `tpep_pickup_datetime` Nullable(DateTime64(6)),                                           │
│     `tpep_dropoff_datetime` Nullable(DateTime64(6)),                                          │
│     `passenger_count` Nullable(Float64),                                                      │
│     `trip_distance` Nullable(Float64),                                                        │
│     `RatecodeID` Nullable(Float64),                                                           │
│     `store_and_fwd_flag` Nullable(String),                                                    │
│     `PULocationID` Nullable(Int64),                                                           │
│     `DOLocationID` Nullable(Int64),                                                           │
│     `payment_type` Nullable(Int64),                                                           │
│     `fare_amount` Nullable(Float64),                                                          │
│     `extra` Nullable(Float64),                                                                │
│     `mta_tax` Nullable(Float64),                                                              │
│     `tip_amount` Nullable(Float64),                                                           │
│     `tolls_amount` Nullable(Float64),                                                         │
│     `improvement_surcharge` Nullable(Float64),                                                │
│     `total_amount` Nullable(Float64),                                                         │
│     `congestion_surcharge` Nullable(Float64),                                                 │
│     `airport_fee` Nullable(Float64)                                                           │
│ )                                                                                             │
│ ENGINE = Iceberg('http://minio:9000/lakehouse/warehouse/default/taxis/', 'admin', '[HIDDEN]') │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```


## Загрузка данных из Data Lake в ClickHouse {#loading-data-from-your-data-lake-into-clickhouse}

Если необходимо загрузить данные из REST-каталога в ClickHouse, сначала создайте локальную таблицу ClickHouse:

```sql
CREATE TABLE taxis
(
    `VendorID` Int64,
    `tpep_pickup_datetime` DateTime64(6),
    `tpep_dropoff_datetime` DateTime64(6),
    `passenger_count` Float64,
    `trip_distance` Float64,
    `RatecodeID` Float64,
    `store_and_fwd_flag` String,
    `PULocationID` Int64,
    `DOLocationID` Int64,
    `payment_type` Int64,
    `fare_amount` Float64,
    `extra` Float64,
    `mta_tax` Float64,
    `tip_amount` Float64,
    `tolls_amount` Float64,
    `improvement_surcharge` Float64,
    `total_amount` Float64,
    `congestion_surcharge` Float64,
    `airport_fee` Float64
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(tpep_pickup_datetime)
ORDER BY (VendorID, tpep_pickup_datetime, PULocationID, DOLocationID);
```

Затем загрузите данные из таблицы REST-каталога с помощью `INSERT INTO SELECT`:

```sql
INSERT INTO taxis
SELECT * FROM demo.`default.taxis`;
```
