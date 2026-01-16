---
slug: /use-cases/data-lake/rest-catalog
sidebar_label: 'Каталог REST'
title: 'Каталог REST'
pagination_prev: null
pagination_next: null
description: 'В этом руководстве мы пошагово расскажем, как запрашивать данные с помощью ClickHouse и REST Catalog.'
keywords: ['REST', 'Табличный', 'Озеро данных', 'Iceberg']
show_related_blogs: true
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

:::note
Интеграция с REST Catalog работает только с таблицами Iceberg.
Эта интеграция поддерживает как AWS S3, так и другие облачные провайдеры хранилища.
:::

ClickHouse поддерживает интеграцию с несколькими каталогами (Unity, Glue, REST, Polaris и т. д.). В этом руководстве описаны шаги по выполнению запросов к вашим данным с помощью ClickHouse и спецификации [REST Catalog](https://github.com/apache/iceberg/blob/main/open-api/rest-catalog-open-api.yaml/).

REST Catalog — это стандартизированная спецификация API для каталогов Iceberg, поддерживаемая различными платформами, включая:

* **Локальные среды разработки** (с использованием конфигураций docker-compose)
* **Управляемые сервисы**, такие как Tabular.io
* **Самостоятельно развернутые** реализации REST Catalog

:::note
Поскольку эта функция является экспериментальной, её необходимо включить с помощью:
`SET allow_experimental_database_iceberg = 1;`
:::

## Локальная среда разработки \\{#local-development-setup\\}

Для локальной разработки и тестирования вы можете использовать контейнеризованную установку REST-каталога. Такой подход подходит для обучения, прототипирования и использования в средах разработки.

### Предварительные требования \\{#local-prerequisites\\}

1. **Docker и Docker Compose**: Убедитесь, что Docker установлен и запущен.
2. **Пример окружения**: Вы можете использовать различные варианты конфигураций docker-compose (см. раздел «Alternative Docker Images» ниже).

### Настройка локального REST-каталога \\{#setting-up-local-rest-catalog\\}

Вы можете использовать различные контейнеризованные реализации REST-каталога, такие как **[Databricks docker-spark-iceberg](https://github.com/databricks/docker-spark-iceberg/blob/main/docker-compose.yml?ref=blog.min.io)**, которая предоставляет полноценную среду Spark + Iceberg + REST-каталог на основе docker-compose, что делает её удобной для тестирования интеграций с Iceberg.

**Шаг 1.** Создайте новую папку, в которой вы будете запускать пример, а затем создайте файл `docker-compose.yml` с конфигурацией из [Databricks docker-spark-iceberg](https://github.com/databricks/docker-spark-iceberg/blob/main/docker-compose.yml?ref=blog.min.io).

**Шаг 2.** Далее создайте файл `docker-compose.override.yml` и поместите в него следующую конфигурацию контейнера ClickHouse:

```yaml
version: '3.8'

services:
  clickhouse:
    image: clickhouse/clickhouse-server:25.5.6
    container_name: clickhouse
    user: '0:0'  # Ensures root permissions
    ports:
      - "8123:8123"
      - "9002:9000"
    volumes:
      - ./clickhouse:/var/lib/clickhouse
      - ./clickhouse/data_import:/var/lib/clickhouse/data_import  # Mount dataset folder
    networks:
      - iceberg_net
    environment:
      - CLICKHOUSE_DB=default
      - CLICKHOUSE_USER=default
      - CLICKHOUSE_DO_NOT_CHOWN=1
      - CLICKHOUSE_PASSWORD=
```

**Шаг 3:** Выполните следующую команду, чтобы запустить службы:

```bash
docker compose up
```

**Шаг 4:** Подождите, пока все сервисы не будут готовы. Вы можете проверить логи:

```bash
docker-compose logs -f
```

:::note
Настройка REST-каталога требует, чтобы демонстрационные данные сначала были загружены в таблицы Iceberg. Убедитесь, что в среде Spark таблицы созданы и заполнены, прежде чем пытаться выполнять к ним запросы из ClickHouse. Доступность таблиц зависит от конкретной конфигурации docker-compose и скриптов загрузки демонстрационных данных.
:::

### Подключение к локальному REST-каталогу \\{#connecting-to-local-rest-catalog\\}

Подключитесь к своему контейнеру с ClickHouse:

```bash
docker exec -it clickhouse clickhouse-client
```

Затем создайте подключение базы данных к каталогу REST:

```sql
SET allow_experimental_database_iceberg = 1;

CREATE DATABASE demo
ENGINE = DataLakeCatalog('http://rest:8181/v1', 'admin', 'password')
SETTINGS 
    catalog_type = 'rest', 
    storage_endpoint = 'http://minio:9000/lakehouse', 
    warehouse = 'demo'
```

## Выполнение запросов к таблицам REST‑каталога с помощью ClickHouse \\{#querying-rest-catalog-tables-using-clickhouse\\}

Теперь, когда соединение установлено, вы можете начинать выполнять запросы через REST‑каталог. Например:

```sql
USE demo;

SHOW TABLES;
```

Если в вашей установке есть демонстрационные данные (например, набор данных taxi), вы должны увидеть следующие таблицы:

```sql title="Response"
┌─name──────────┐
│ default.taxis │
└───────────────┘
```

:::note
Если вы не видите таблиц, это обычно означает:

1. Среда Spark ещё не создала тестовые таблицы
2. Служба REST-каталога ещё не полностью инициализирована
3. Процесс загрузки тестовых данных ещё не завершён

Вы можете проверить логи Spark, чтобы узнать, как продвигается создание таблиц:

```bash
docker-compose logs spark
```

:::

Чтобы выполнить запрос к таблице (если она существует):

```sql
SELECT count(*) FROM `default.taxis`;
```

```sql title="Response"
┌─count()─┐
│ 2171187 │
└─────────┘
```

:::note Требуются обратные кавычки
Обратные кавычки требуются, потому что ClickHouse не поддерживает более одного пространства имён.
:::

Чтобы просмотреть DDL таблицы:

```sql
SHOW CREATE TABLE `default.taxis`;
```

```sql title="Response"
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

## Загрузка данных из вашего озера данных (Data Lake) в ClickHouse \\{#loading-data-from-your-data-lake-into-clickhouse\\}

Если вам нужно загрузить данные из каталога REST в ClickHouse, сначала создайте локальную таблицу ClickHouse:

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

Затем загрузите данные из таблицы каталога REST с помощью оператора `INSERT INTO SELECT`:

```sql
INSERT INTO taxis 
SELECT * FROM demo.`default.taxis`;
```
