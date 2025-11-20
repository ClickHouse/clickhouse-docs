---
slug: /use-cases/data-lake/lakekeeper-catalog
sidebar_label: 'Каталог Lakekeeper'
title: 'Каталог Lakekeeper'
pagination_prev: null
pagination_next: null
description: 'В этом руководстве мы рассмотрим шаги по выполнению запросов
 к вашим данным с помощью ClickHouse и каталога Lakekeeper.'
keywords: ['Lakekeeper', 'REST', 'Tabular', 'Data Lake', 'Iceberg']
show_related_blogs: true
doc_type: 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

<ExperimentalBadge />

:::note
Интеграция с каталогом Lakekeeper работает только с таблицами Iceberg.
Эта интеграция поддерживает как AWS S3, так и другие провайдеры облачного хранения.
:::

ClickHouse поддерживает интеграцию с несколькими каталогами (Unity, Glue, REST, Polaris и др.). В этом руководстве описаны шаги по выполнению запросов к данным с использованием ClickHouse и каталога [Lakekeeper](https://docs.lakekeeper.io/).

Lakekeeper — это реализация REST-каталога с открытым исходным кодом для Apache Iceberg, которая обеспечивает:

* **Нативную реализацию на Rust** для высокой производительности и надёжности
* **REST API**, соответствующий спецификации каталога Iceberg REST
* **Интеграцию с облачным хранилищем** с поддержкой S3-совместимых хранилищ

:::note
Поскольку эта функция является экспериментальной, её необходимо включить с помощью команды:
`SET allow_experimental_database_iceberg = 1;`
:::


## Настройка локальной среды разработки {#local-development-setup}

Для локальной разработки и тестирования можно использовать контейнеризованную установку Lakekeeper. Этот подход идеально подходит для обучения, создания прототипов и сред разработки.

### Предварительные требования {#local-prerequisites}

1. **Docker и Docker Compose**: Убедитесь, что Docker установлен и запущен
2. **Пример настройки**: Можно использовать настройку docker-compose для Lakekeeper

### Настройка локального каталога Lakekeeper {#setting-up-local-lakekeeper-catalog}

Можно использовать официальную [настройку docker-compose для Lakekeeper](https://github.com/lakekeeper/lakekeeper/tree/main/examples/minimal), которая предоставляет полную среду с Lakekeeper, бэкендом метаданных PostgreSQL и MinIO для объектного хранилища.

**Шаг 1:** Создайте новую папку для запуска примера, затем создайте в ней файл `docker-compose.yml` со следующей конфигурацией:

```yaml
version: "3.8"

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
environment: - POSTGRESQL_USERNAME=postgres - POSTGRESQL_PASSWORD=postgres - POSTGRESQL_DATABASE=postgres
healthcheck:
test: ["CMD-SHELL", "pg_isready -U postgres -p 5432 -d postgres"]
interval: 2s
timeout: 10s
retries: 5
start_period: 10s
volumes: - postgres_data:/bitnami/postgresql
networks: - iceberg_net

minio:
image: bitnami/minio:2025.4.22
environment: - MINIO_ROOT_USER=minio - MINIO_ROOT_PASSWORD=ClickHouse_Minio_P@ssw0rd - MINIO_API_PORT_NUMBER=9000 - MINIO_CONSOLE_PORT_NUMBER=9001 - MINIO_SCHEME=http - MINIO_DEFAULT_BUCKETS=warehouse-rest
networks:
iceberg_net:
aliases: - warehouse-rest.minio
ports: - "9002:9000" - "9003:9001"
healthcheck:
test: ["CMD", "mc", "ls", "local", "|", "grep", "warehouse-rest"]
interval: 2s
timeout: 10s
retries: 3
start_period: 15s
volumes: - minio_data:/bitnami/minio/data

clickhouse:
image: clickhouse/clickhouse-server:head
container_name: lakekeeper-clickhouse
user: '0:0' # Ensures root permissions
ports: - "8123:8123" - "9000:9000"
volumes: - clickhouse_data:/var/lib/clickhouse - ./clickhouse/data_import:/var/lib/clickhouse/data_import # Mount dataset folder
networks: - iceberg_net
environment: - CLICKHOUSE_DB=default - CLICKHOUSE_USER=default - CLICKHOUSE_DO_NOT_CHOWN=1 - CLICKHOUSE_PASSWORD=
depends_on:
lakekeeper:
condition: service_healthy
minio:
condition: service_healthy

volumes:
postgres_data:
minio_data:
clickhouse_data:

networks:
iceberg_net:
driver: bridge

````

**Шаг 2:** Выполните следующую команду для запуска сервисов:

```bash
docker compose up -d
````

**Шаг 3:** Дождитесь готовности всех сервисов. Проверить логи можно следующим образом:

```bash
docker-compose logs -f
```

:::note
Для настройки Lakekeeper необходимо предварительно загрузить тестовые данные в таблицы Iceberg. Убедитесь, что окружение создало и заполнило таблицы, прежде чем выполнять запросы через ClickHouse. Доступность таблиц зависит от конкретной конфигурации docker-compose и скриптов загрузки тестовых данных.
:::

### Подключение к локальному каталогу Lakekeeper {#connecting-to-local-lakekeeper-catalog}

Подключитесь к контейнеру ClickHouse:

```bash
docker exec -it lakekeeper-clickhouse clickhouse-client
```

Затем создайте подключение к каталогу Lakekeeper:

```sql
SET allow_experimental_database_iceberg = 1;

CREATE DATABASE demo
ENGINE = DataLakeCatalog('http://lakekeeper:8181/catalog', 'minio', 'ClickHouse_Minio_P@ssw0rd')
SETTINGS catalog_type = 'rest', storage_endpoint = 'http://minio:9002/warehouse-rest', warehouse = 'demo'
```


## Запрос таблиц каталога Lakekeeper с использованием ClickHouse {#querying-lakekeeper-catalog-tables-using-clickhouse}

Теперь, когда соединение установлено, можно начать выполнять запросы через каталог Lakekeeper. Например:

```sql
USE demo;

SHOW TABLES;
```

Если ваша установка включает тестовые данные (например, набор данных о такси), вы должны увидеть таблицы следующего вида:

```sql title="Ответ"
┌─name──────────┐
│ default.taxis │
└───────────────┘
```

:::note
Если вы не видите никаких таблиц, это обычно означает:

1. Окружение еще не создало тестовые таблицы
2. Служба каталога Lakekeeper не полностью инициализирована
3. Процесс загрузки тестовых данных не завершен

Вы можете проверить логи Spark, чтобы отследить прогресс создания таблиц:

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
│ ENGINE = Iceberg('http://minio:9002/warehouse-rest/warehouse/default/taxis/', 'minio', '[HIDDEN]') │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```


## Загрузка данных из Data Lake в ClickHouse {#loading-data-from-your-data-lake-into-clickhouse}

Чтобы загрузить данные из каталога Lakekeeper в ClickHouse, сначала создайте локальную таблицу ClickHouse:

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

Затем загрузите данные из таблицы каталога Lakekeeper с помощью `INSERT INTO SELECT`:

```sql
INSERT INTO taxis
SELECT * FROM demo.`default.taxis`;
```
