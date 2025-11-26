---
slug: /use-cases/data-lake/rest-catalog
sidebar_label: 'Каталог REST'
title: 'Каталог REST'
pagination_prev: null
pagination_next: null
description: 'В этом руководстве мы пошагово покажем, как выполнять запросы
к данным с помощью ClickHouse и каталога REST.'
keywords: ['REST', 'Табличный', 'Озеро данных', 'Iceberg']
show_related_blogs: true
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

:::note
Интеграция с REST Catalog работает только с таблицами Iceberg.
Эта интеграция поддерживает как AWS S3, так и других провайдеров облачного хранилища.
:::

ClickHouse поддерживает интеграцию с несколькими каталогами (Unity, Glue, REST, Polaris и т. д.). В этом руководстве показано, как выполнять запросы к вашим данным с помощью ClickHouse и спецификации [REST Catalog](https://github.com/apache/iceberg/blob/main/open-api/rest-catalog-open-api.yaml/).

REST Catalog — это стандартизированная спецификация API для каталогов Iceberg, поддерживаемая различными платформами, включая:

* **Локальные среды разработки** (с использованием конфигураций docker-compose)
* **Управляемые сервисы**, такие как Tabular.io
* **Самостоятельно развернутые** реализации REST Catalog

:::note
Поскольку эта функция является экспериментальной, её нужно включить с помощью:
`SET allow_experimental_database_iceberg = 1;`
:::


## Локальная среда разработки

Для локальной разработки и тестирования вы можете использовать контейнеризованный REST-каталог. Такой подход идеально подходит для изучения, прототипирования и сред разработки.

### Предварительные требования

1. **Docker и Docker Compose**: Убедитесь, что Docker установлен и запущен.
2. **Пример настройки**: Вы можете использовать различные конфигурации docker-compose (см. альтернативные Docker-образы ниже).

### Настройка локального REST-каталога

Вы можете использовать различные контейнеризованные реализации REST-каталога, такие как **[Databricks docker-spark-iceberg](https://github.com/databricks/docker-spark-iceberg/blob/main/docker-compose.yml?ref=blog.min.io)**, которая предоставляет полноценную среду Spark + Iceberg + REST-каталог на базе docker-compose, что делает её идеальной для тестирования интеграций с Iceberg.

**Шаг 1:** Создайте новый каталог, в котором будет запускаться пример, затем создайте файл `docker-compose.yml` с конфигурацией из [Databricks docker-spark-iceberg](https://github.com/databricks/docker-spark-iceberg/blob/main/docker-compose.yml?ref=blog.min.io).

**Шаг 2:** Далее создайте файл `docker-compose.override.yml` и поместите в него следующую конфигурацию контейнера ClickHouse:

```yaml
version: '3.8'

services:
  clickhouse:
    image: clickhouse/clickhouse-server:25.5.6
    container_name: clickhouse
    user: '0:0'  # Обеспечивает права root
    ports:
      - "8123:8123"
      - "9002:9000"
    volumes:
      - ./clickhouse:/var/lib/clickhouse
      - ./clickhouse/data_import:/var/lib/clickhouse/data_import  # Монтирование каталога с набором данных
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

**Шаг 4:** Дождитесь, пока все сервисы станут готовы. Вы можете проверить логи:

```bash
docker-compose logs -f
```

:::note
Настройка REST-каталога требует, чтобы примерные данные были предварительно загружены в таблицы Iceberg. Убедитесь, что в среде Spark таблицы созданы и заполнены до того, как вы попытаетесь обращаться к ним из ClickHouse. Наличие таблиц зависит от конкретной конфигурации docker-compose и скриптов загрузки примерных данных.
:::

### Подключение к локальному REST-каталогу

Подключитесь к вашему контейнеру ClickHouse:

```bash
docker exec -it clickhouse clickhouse-client
```

Затем создайте подключение к базе данных для каталога REST:

```sql
SET allow_experimental_database_iceberg = 1;

CREATE DATABASE demo
ENGINE = DataLakeCatalog('http://rest:8181/v1', 'admin', 'password')
SETTINGS 
    catalog_type = 'rest', 
    storage_endpoint = 'http://minio:9000/lakehouse', 
    warehouse = 'demo'
```


## Выполнение запросов к таблицам REST-каталога с помощью ClickHouse

Теперь, когда соединение установлено, вы можете начинать выполнять запросы к REST-каталогу. Например:

```sql
USE demo;

SHOW TABLES;
```

Если в вашей среде развернуты примерочные данные (например, датасет taxi), вы должны увидеть следующие таблицы:

```sql title="Response"
┌─name──────────┐
│ default.taxis │
└───────────────┘
```

:::note
Если вы не видите таблиц, это, как правило, означает:

1. Среда Spark ещё не создала таблицы с примерами (sample tables)
2. Сервис REST-каталога ещё не полностью инициализирован
3. Процесс загрузки демонстрационных данных ещё не завершён

Вы можете проверить журналы Spark, чтобы отслеживать ход создания таблиц:

```bash
docker-compose logs spark
```

:::

Чтобы выполнить запрос к таблице (если она доступна):

```sql
SELECT count(*) FROM `default.taxis`;
```

```sql title="Response"
┌─count()─┐
│ 2171187 │
└─────────┘
```

:::note Требуются обратные кавычки
Обратные кавычки требуются, потому что ClickHouse не поддерживает несколько пространств имен.
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


## Загрузка данных из Data Lake в ClickHouse

Если вам нужно загрузить данные из REST-каталога в ClickHouse, начните с создания локальной таблицы ClickHouse:

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

Затем загрузите данные из таблицы каталога REST с помощью оператора `INSERT ... SELECT`:

```sql
INSERT INTO taxis 
SELECT * FROM demo.`default.taxis`;
```
