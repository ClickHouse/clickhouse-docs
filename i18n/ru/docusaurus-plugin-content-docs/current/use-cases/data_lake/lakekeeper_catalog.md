---
slug: /use-cases/data-lake/lakekeeper-catalog
sidebar_label: 'Каталог Lakekeeper'
title: 'Каталог Lakekeeper'
pagination_prev: null
pagination_next: null
description: 'В этом руководстве мы расскажем, как выполнять запросы к вашим данным с помощью ClickHouse и каталога Lakekeeper.'
keywords: ['Lakekeeper', 'REST', 'Tabular', 'озеро данных', 'Iceberg']
show_related_blogs: true
doc_type: 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

<ExperimentalBadge />

:::note
Интеграция с каталогом Lakekeeper работает только с таблицами Iceberg.
Эта интеграция поддерживает как AWS S3, так и других поставщиков облачных хранилищ.
:::

ClickHouse поддерживает интеграцию с несколькими каталогами (Unity, Glue, REST, Polaris и т. д.). В этом руководстве описаны шаги для выполнения запросов к вашим данным с помощью ClickHouse и каталога [Lakekeeper](https://docs.lakekeeper.io/).

Lakekeeper — это open-source реализация REST-каталога для Apache Iceberg, которая обеспечивает:

* **Нативную реализацию на Rust** для высокой производительности и надежности
* **REST API**, совместимый со спецификацией REST-каталога Iceberg
* **Интеграцию с облачными хранилищами**, совместимыми с S3

:::note
Поскольку эта функциональность является экспериментальной, вы должны включить её с помощью следующей команды:
`SET allow_experimental_database_iceberg = 1;`
:::


## Локальная среда разработки

Для локальной разработки и тестирования вы можете использовать контейнеризированный экземпляр Lakekeeper. Такой подход оптимален для обучения, прототипирования и сред разработки.

### Предварительные требования

1. **Docker и Docker Compose**: Убедитесь, что Docker установлен и запущен.
2. **Пример конфигурации**: Вы можете использовать docker-compose конфигурацию Lakekeeper.

### Настройка локального каталога Lakekeeper

Вы можете использовать официальную [docker-compose конфигурацию Lakekeeper](https://github.com/lakekeeper/lakekeeper/tree/main/examples/minimal), которая предоставляет полноценную среду с Lakekeeper, PostgreSQL в качестве хранилища метаданных и MinIO для объектного хранилища.

**Шаг 1:** Создайте новую папку, в которой вы будете запускать пример, затем создайте файл `docker-compose.yml` со следующей конфигурацией:

```yaml
version: '3.8'

services:
  lakekeeper:
    image: quay.io/lakekeeper/catalog:latest
    environment:
      - LAKEKEEPER__PG_ENCRYPTION_KEY=This-is-NOT-Secure!
      - LAKEKEEPER__PG_DATABASE_URL_READ=postgresql://postgres:postgres@db:5432/postgres
      - LAKEKEEPER__PG_DATABASE_URL_WRITE=postgresql://postgres:postgres@db:5432/postgres
      - RUST_LOG=info
    command: ["serve"]
    healthcheck:
      test: ["CMD", "/home/nonroot/lakekeeper", "healthcheck"]
      interval: 1s
      timeout: 10s
      retries: 10
      start_period: 30s
    depends_on:
      migrate:
        condition: service_completed_successfully
      db:
        condition: service_healthy
      minio:
        condition: service_healthy
    ports:
      - 8181:8181
    networks:
      - iceberg_net

  migrate:
    image: quay.io/lakekeeper/catalog:latest-main
    environment:
      - LAKEKEEPER__PG_ENCRYPTION_KEY=This-is-NOT-Secure!
      - LAKEKEEPER__PG_DATABASE_URL_READ=postgresql://postgres:postgres@db:5432/postgres
      - LAKEKEEPER__PG_DATABASE_URL_WRITE=postgresql://postgres:postgres@db:5432/postgres
      - RUST_LOG=info
    restart: "no"
    command: ["migrate"]
    depends_on:
      db:
        condition: service_healthy
    networks:
      - iceberg_net

  bootstrap:
    image: curlimages/curl
    depends_on:
      lakekeeper:
        condition: service_healthy
    restart: "no"
    command:
      - -w
      - "%{http_code}"
      - "-X"
      - "POST"
      - "-v"
      - "http://lakekeeper:8181/management/v1/bootstrap"
      - "-H"
      - "Content-Type: application/json"
      - "--data"
      - '{"accept-terms-of-use": true}'
      - "-o"
      - "/dev/null"
    networks:
      - iceberg_net

  initialwarehouse:
    image: curlimages/curl
    depends_on:
      lakekeeper:
        condition: service_healthy
      bootstrap:
        condition: service_completed_successfully
    restart: "no"
    command:
      - -w
      - "%{http_code}"
      - "-X"
      - "POST"
      - "-v"
      - "http://lakekeeper:8181/management/v1/warehouse"
      - "-H"
      - "Content-Type: application/json"
      - "--data"
      - '{"warehouse-name": "demo", "project-id": "00000000-0000-0000-0000-000000000000", "storage-profile": {"type": "s3", "bucket": "warehouse-rest", "key-prefix": "", "assume-role-arn": null, "endpoint": "http://minio:9000", "region": "local-01", "path-style-access": true, "flavor": "minio", "sts-enabled": true}, "storage-credential": {"type": "s3", "credential-type": "access-key", "aws-access-key-id": "minio", "aws-secret-access-key": "ClickHouse_Minio_P@ssw0rd"}}'
      - "-o"
      - "/dev/null"
    networks:
      - iceberg_net
```


db:
image: bitnami/postgresql:16.3.0
environment:

* POSTGRESQL&#95;USERNAME=postgres
* POSTGRESQL&#95;PASSWORD=postgres
* POSTGRESQL&#95;DATABASE=postgres
  healthcheck:
  test: [&quot;CMD-SHELL&quot;, &quot;pg&#95;isready -U postgres -p 5432 -d postgres&quot;]
  interval: 2s
  timeout: 10s
  retries: 5
  start&#95;period: 10s
  volumes:
* postgres&#95;data:/bitnami/postgresql
  networks:
* iceberg&#95;net

minio:
image: bitnami/minio:2025.4.22
environment:

* MINIO&#95;ROOT&#95;USER=minio
* MINIO&#95;ROOT&#95;PASSWORD=ClickHouse&#95;Minio&#95;P@ssw0rd
* MINIO&#95;API&#95;PORT&#95;NUMBER=9000
* MINIO&#95;CONSOLE&#95;PORT&#95;NUMBER=9001
* MINIO&#95;SCHEME=http
* MINIO&#95;DEFAULT&#95;BUCKETS=warehouse-rest
  networks:
  iceberg&#95;net:
  aliases:
  * warehouse-rest.minio
    ports:
* &quot;9002:9000&quot;
* &quot;9003:9001&quot;
  healthcheck:
  test: [&quot;CMD&quot;, &quot;mc&quot;, &quot;ls&quot;, &quot;local&quot;, &quot;|&quot;, &quot;grep&quot;, &quot;warehouse-rest&quot;]
  interval: 2s
  timeout: 10s
  retries: 3
  start&#95;period: 15s
  volumes:
* minio&#95;data:/bitnami/minio/data

clickhouse:
image: clickhouse/clickhouse-server:head
container&#95;name: lakekeeper-clickhouse
user: &#39;0:0&#39;  # Гарантирует запуск с правами root
ports:

* &quot;8123:8123&quot;
* &quot;9000:9000&quot;
  volumes:
* clickhouse&#95;data:/var/lib/clickhouse
* ./clickhouse/data&#95;import:/var/lib/clickhouse/data&#95;import  # Монтирует каталог с набором данных
  networks:
* iceberg&#95;net
  environment:
* CLICKHOUSE&#95;DB=default
* CLICKHOUSE&#95;USER=default
* CLICKHOUSE&#95;DO&#95;NOT&#95;CHOWN=1
* CLICKHOUSE&#95;PASSWORD=
  depends&#95;on:
  lakekeeper:
  condition: service&#95;healthy
  minio:
  condition: service&#95;healthy

volumes:
postgres&#95;data:
minio&#95;data:
clickhouse&#95;data:

networks:
iceberg&#95;net:
driver: bridge

````

**Шаг 2:** Выполните следующую команду для запуска сервисов:

```bash
docker compose up -d
````

**Шаг 3:** Дождитесь готовности всех сервисов. Вы можете проверить логи:

```bash
docker-compose logs -f
```

:::note
Настройка Lakekeeper требует предварительной загрузки демонстрационных данных в таблицы Iceberg. Убедитесь, что в среде созданы и заполнены таблицы, прежде чем выполнять к ним запросы через ClickHouse. Наличие таблиц зависит от конкретной конфигурации docker-compose и скриптов загрузки демонстрационных данных.
:::

### Подключение к локальному каталогу Lakekeeper

Подключитесь к вашему контейнеру ClickHouse:

```bash
docker exec -it lakekeeper-clickhouse clickhouse-client
```

Затем создайте подключение к каталогу Lakekeeper в базе данных:

```sql
SET allow_experimental_database_iceberg = 1;

CREATE DATABASE demo
ENGINE = DataLakeCatalog('http://lakekeeper:8181/catalog', 'minio', 'ClickHouse_Minio_P@ssw0rd')
SETTINGS catalog_type = 'rest', storage_endpoint = 'http://minio:9002/warehouse-rest', warehouse = 'demo'
```


## Выполнение запросов к таблицам каталога Lakekeeper с помощью ClickHouse

Теперь, когда подключение установлено, вы можете начинать выполнять запросы по каталогу Lakekeeper. Например:

```sql
USE demo;

SHOW TABLES;
```

Если в вашей установке загружены примерочные данные (например, набор данных taxi), вы должны увидеть следующие таблицы:

```sql title="Response"
┌─name──────────┐
│ default.taxis │
└───────────────┘
```

:::note
Если вы не видите таблиц, это обычно означает:

1. Среда еще не создала образцы таблиц
2. Сервис каталога Lakekeeper еще не полностью инициализирован
3. Процесс загрузки примерочных данных еще не завершен

Вы можете проверить логи Spark, чтобы отследить прогресс создания таблиц:

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

:::note Обратные кавычки обязательны
Обратные кавычки обязательны, потому что ClickHouse не поддерживает несколько пространств имен.
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
│ ENGINE = Iceberg('http://minio:9002/warehouse-rest/warehouse/default/taxis/', 'minio', '[HIDDEN]') │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```


## Загрузка данных из вашего озера данных (Data Lake) в ClickHouse

Если вам нужно загрузить данные из каталога Lakekeeper в ClickHouse, начните с создания локальной таблицы ClickHouse:

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

Затем загрузите данные из таблицы каталога Lakekeeper с помощью оператора `INSERT INTO SELECT`:

```sql
INSERT INTO taxis 
SELECT * FROM demo.`default.taxis`;
```
