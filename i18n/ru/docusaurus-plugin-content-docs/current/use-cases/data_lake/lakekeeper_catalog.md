---
'slug': '/use-cases/data-lake/lakekeeper-catalog'
'sidebar_label': 'Lakekeeper Catalog'
'title': 'Lakekeeper Catalog'
'pagination_prev': null
'pagination_next': null
'description': 'В этом руководстве мы проведем вас через шаги, чтобы сделать запрос
  к вашим данным, используя ClickHouse и Lakekeeper Catalog.'
'keywords':
- 'Lakekeeper'
- 'REST'
- 'Tabular'
- 'Data Lake'
- 'Iceberg'
'show_related_blogs': true
'doc_type': 'guide'
---
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

<ExperimentalBadge/>

:::note
Интеграция с каталогом Lakekeeper работает только с таблицами Iceberg.
Эта интеграция поддерживает как AWS S3, так и другие поставщики облачного хранения.
:::

ClickHouse поддерживает интеграцию с несколькими каталогами (Unity, Glue, REST, Polaris и др.). В этом руководстве вы узнаете, как выполнять запросы к вашим данным, используя ClickHouse и каталог [Lakekeeper](https://docs.lakekeeper.io/).

Lakekeeper — это реализация REST-каталога с открытым исходным кодом для Apache Iceberg, которая предоставляет:
- **Реализация на Rust** для высокой производительности и надежности
- Соответствие **REST API** спецификации REST-каталога Iceberg
- Интеграция с **облачным хранилищем** с совместимостью с S3

:::note
Поскольку эта функция является экспериментальной, вам необходимо включить ее с помощью:
`SET allow_experimental_database_iceberg = 1;`
:::

## Настройка локальной разработки {#local-development-setup}

Для локальной разработки и тестирования вы можете использовать контейнеризированную настройку Lakekeeper. Этот подход идеально подходит для обучения, прототипирования и сред разработки.

### Предварительные требования {#local-prerequisites}

1. **Docker и Docker Compose**: Убедитесь, что Docker установлен и работает
2. **Пример настройки**: Вы можете использовать настройку Lakekeeper с помощью docker-compose

### Настройка локального каталога Lakekeeper {#setting-up-local-lakekeeper-catalog}

Вы можете использовать официальную настройку [Lakekeeper с помощью docker-compose](https://github.com/lakekeeper/lakekeeper/tree/main/examples/minimal), которая предоставляет полную среду с Lakekeeper, бэкендом метаданных PostgreSQL и MinIO для объектного хранения.

**Шаг 1:** Создайте новую папку, в которой будет выполняться пример, затем создайте файл `docker-compose.yml` со следующим конфигом:

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

  db:
    image: bitnami/postgresql:16.3.0
    environment:
      - POSTGRESQL_USERNAME=postgres
      - POSTGRESQL_PASSWORD=postgres
      - POSTGRESQL_DATABASE=postgres
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -p 5432 -d postgres"]
      interval: 2s
      timeout: 10s
      retries: 5
      start_period: 10s
    volumes:
      - postgres_data:/bitnami/postgresql
    networks:
      - iceberg_net

  minio:
    image: bitnami/minio:2025.4.22
    environment:
      - MINIO_ROOT_USER=minio
      - MINIO_ROOT_PASSWORD=ClickHouse_Minio_P@ssw0rd
      - MINIO_API_PORT_NUMBER=9000
      - MINIO_CONSOLE_PORT_NUMBER=9001
      - MINIO_SCHEME=http
      - MINIO_DEFAULT_BUCKETS=warehouse-rest
    networks: 
      iceberg_net:
        aliases:
          - warehouse-rest.minio
    ports:
      - "9002:9000"
      - "9003:9001"
    healthcheck:
      test: ["CMD", "mc", "ls", "local", "|", "grep", "warehouse-rest"]
      interval: 2s
      timeout: 10s
      retries: 3
      start_period: 15s
    volumes:
      - minio_data:/bitnami/minio/data

  clickhouse:
    image: clickhouse/clickhouse-server:head
    container_name: lakekeeper-clickhouse
    user: '0:0'  # Ensures root permissions
    ports:
      - "8123:8123"
      - "9000:9000"
    volumes:
      - clickhouse_data:/var/lib/clickhouse
      - ./clickhouse/data_import:/var/lib/clickhouse/data_import  # Mount dataset folder
    networks:
      - iceberg_net
    environment:
      - CLICKHOUSE_DB=default
      - CLICKHOUSE_USER=default
      - CLICKHOUSE_DO_NOT_CHOWN=1
      - CLICKHOUSE_PASSWORD=
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
```

**Шаг 2:** Выполните следующую команду, чтобы запустить службы:

```bash
docker compose up -d
```

**Шаг 3:** Дождитесь, пока все службы будут готовы. Вы можете проверить логи:

```bash
docker-compose logs -f
```

:::note
Настройка Lakekeeper требует, чтобы в таблицы Iceberg были загружены образцы данных. Убедитесь, что среда создала и наполнила таблицы, прежде чем пытаться выполнять к ним запросы через ClickHouse. Доступность таблиц зависит от конкретной настройки docker-compose и скриптов загрузки образцов данных.
:::

### Подключение к локальному каталогу Lakekeeper {#connecting-to-local-lakekeeper-catalog}

Подключитесь к вашему контейнеру ClickHouse:

```bash
docker exec -it lakekeeper-clickhouse clickhouse-client
```

Затем создайте соединение с базой данных в каталоге Lakekeeper:

```sql
SET allow_experimental_database_iceberg = 1;

CREATE DATABASE demo
ENGINE = DataLakeCatalog('http://lakekeeper:8181/catalog', 'minio', 'ClickHouse_Minio_P@ssw0rd')
SETTINGS catalog_type = 'rest', storage_endpoint = 'http://minio:9002/warehouse-rest', warehouse = 'demo'
```

## Выполнение запросов к таблицам каталога Lakekeeper с использованием ClickHouse {#querying-lakekeeper-catalog-tables-using-clickhouse}

Теперь, когда соединение установлено, вы можете начать выполнять запросы через каталог Lakekeeper. Например:

```sql
USE demo;

SHOW TABLES;
```

Если ваша настройка включает образцы данных (например, набор данных такси), вы должны увидеть таблицы, такие как:

```sql title="Response"
┌─name──────────┐
│ default.taxis │
└───────────────┘
```

:::note
Если вы не видите никаких таблиц, это обычно означает:
1. Среда еще не создала образцы таблиц
2. Служба каталога Lakekeeper не полностью инициализирована
3. Процесс загрузки образцов данных не завершен

Вы можете проверить логи Spark, чтобы увидеть прогресс создания таблиц:
```bash
docker-compose logs spark
```
:::

Чтобы выполнить запрос к таблице (если доступна):

```sql
SELECT count(*) FROM `default.taxis`;
```

```sql title="Response"
┌─count()─┐
│ 2171187 │
└─────────┘
```

:::note Обязательные обратные кавычки
Обратные кавычки обязательны, потому что ClickHouse не поддерживает более одного пространства имен.
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

## Загрузка данных из вашего ДатаЛэйка в ClickHouse {#loading-data-from-your-data-lake-into-clickhouse}

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

Затем загрузите данные из вашей таблицы каталога Lakekeeper с помощью `INSERT INTO SELECT`:

```sql
INSERT INTO taxis 
SELECT * FROM demo.`default.taxis`;
```