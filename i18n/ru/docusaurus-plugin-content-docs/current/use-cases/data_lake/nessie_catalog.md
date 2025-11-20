---
slug: /use-cases/data-lake/nessie-catalog
sidebar_label: 'Каталог Nessie'
title: 'Каталог Nessie'
pagination_prev: null
pagination_next: null
description: 'В этом руководстве мы пошагово покажем, как выполнять запросы к вашим данным с помощью ClickHouse и каталога Nessie.'
keywords: ['Nessie', 'REST', 'Transactional', 'Data Lake', 'Iceberg', 'Git-like']
show_related_blogs: true
doc_type: 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

<ExperimentalBadge />

:::note
Интеграция с каталогом Nessie работает только с таблицами Iceberg.
Эта интеграция поддерживает как AWS S3, так и другие облачные провайдеры хранилищ.
:::

ClickHouse поддерживает интеграцию с несколькими каталогами (Unity, Glue, REST, Polaris и др.). В этом руководстве описаны шаги по выполнению запросов к вашим данным с помощью ClickHouse и каталога [Nessie](https://projectnessie.org/).

Nessie — это открытый транзакционный каталог для дата-лейков, который предоставляет:

* **Git-подобное** управление версиями данных с ветками и коммитами
* **Транзакции между таблицами** и гарантии видимости
* Соответствие спецификации каталога Iceberg REST по **REST API**
* Подход **открытого дата-лейка**, поддерживающий Hive, Spark, Dremio, Trino и другие системы
* **Готовое к промышленной эксплуатации** развёртывание в Docker или Kubernetes

:::note
Поскольку эта возможность является экспериментальной, её нужно включить с помощью:
`SET allow_experimental_database_iceberg = 1;`
:::


## Настройка локальной среды разработки {#local-development-setup}

Для локальной разработки и тестирования можно использовать контейнеризованную установку Nessie. Этот подход идеально подходит для обучения, прототипирования и разработки.

### Предварительные требования {#local-prerequisites}

1. **Docker и Docker Compose**: Убедитесь, что Docker установлен и запущен
2. **Пример настройки**: Можно использовать официальную конфигурацию docker-compose для Nessie

### Настройка локального каталога Nessie {#setting-up-local-nessie-catalog}

Можно использовать официальную [конфигурацию docker-compose для Nessie](https://projectnessie.org/guides/setting-up/), которая предоставляет полную среду с Nessie, хранилищем версий в памяти и MinIO для объектного хранилища.

**Шаг 1:** Создайте новую папку для запуска примера, затем создайте файл `docker-compose.yml` со следующей конфигурацией:

```yaml
version: "3.8"

services:
  nessie:
    image: ghcr.io/projectnessie/nessie:latest
    ports:
      - "19120:19120"
    environment:
      - nessie.version.store.type=IN_MEMORY
      - nessie.catalog.default-warehouse=warehouse
      - nessie.catalog.warehouses.warehouse.location=s3://my-bucket/
      - nessie.catalog.service.s3.default-options.endpoint=http://minio:9000/
      - nessie.catalog.service.s3.default-options.access-key=urn:nessie-secret:quarkus:nessie.catalog.secrets.access-key
      - nessie.catalog.service.s3.default-options.path-style-access=true
      - nessie.catalog.service.s3.default-options.auth-type=STATIC
      - nessie.catalog.secrets.access-key.name=admin
      - nessie.catalog.secrets.access-key.secret=password
      - nessie.catalog.service.s3.default-options.region=us-east-1
      - nessie.server.authentication.enabled=false
    depends_on:
      minio:
        condition: service_healthy
    networks:
      - iceberg_net

  minio:
    image: quay.io/minio/minio
    ports:
      - "9002:9000"
      - "9003:9001"
    environment:
      - MINIO_ROOT_USER=admin
      - MINIO_ROOT_PASSWORD=password
      - MINIO_REGION=us-east-1
    healthcheck:
      test: ["CMD", "mc", "ready", "local"]
      interval: 5s
      timeout: 10s
      retries: 5
      start_period: 30s
    entrypoint: >
      /bin/sh -c "
      minio server /data --console-address ':9001' &
      sleep 10;
      mc alias set myminio http://localhost:9000 admin password;
      mc mb myminio/my-bucket --ignore-existing;
      tail -f /dev/null"
    networks:
      - iceberg_net

  clickhouse:
    image: clickhouse/clickhouse-server:head
    container_name: nessie-clickhouse
    user: "0:0" # Ensures root permissions
    ports:
      - "8123:8123"
      - "9000:9000"
    volumes:
      - clickhouse_data:/var/lib/clickhouse
      - ./clickhouse/data_import:/var/lib/clickhouse/data_import # Mount dataset folder
    networks:
      - iceberg_net
    environment:
      - CLICKHOUSE_DB=default
      - CLICKHOUSE_USER=default
      - CLICKHOUSE_DO_NOT_CHOWN=1
      - CLICKHOUSE_PASSWORD=
    depends_on:
      nessie:
        condition: service_started
      minio:
        condition: service_healthy

volumes:
  clickhouse_data:

networks:
  iceberg_net:
    driver: bridge
```

**Шаг 2:** Выполните следующую команду для запуска сервисов:

```bash
docker compose up -d
```

**Шаг 3:** Дождитесь готовности всех сервисов. Проверить логи можно следующим образом:

```bash
docker-compose logs -f
```

:::note
Установка Nessie использует хранилище версий в памяти и требует предварительной загрузки тестовых данных в таблицы Iceberg. Убедитесь, что среда создала и заполнила таблицы, прежде чем выполнять запросы к ним через ClickHouse.
:::

### Подключение к локальному каталогу Nessie {#connecting-to-local-nessie-catalog}

Подключитесь к контейнеру ClickHouse:

```bash
docker exec -it nessie-clickhouse clickhouse-client
```

Затем создайте подключение к каталогу Nessie:

```sql
SET allow_experimental_database_iceberg = 1;

```


CREATE DATABASE demo
ENGINE = DataLakeCatalog(&#39;[http://nessie:19120/iceberg](http://nessie:19120/iceberg)&#39;, &#39;admin&#39;, &#39;password&#39;)
SETTINGS catalog&#95;type = &#39;rest&#39;, storage&#95;endpoint = &#39;[http://minio:9002/my-bucket](http://minio:9002/my-bucket)&#39;, warehouse = &#39;warehouse&#39;

```
```


## Выполнение запросов к таблицам каталога Nessie с помощью ClickHouse {#querying-nessie-catalog-tables-using-clickhouse}

Теперь, когда подключение установлено, вы можете начинать выполнять запросы через каталог Nessie. Например:

```sql
USE demo;

SHOW TABLES;
```

Если в вашей среде развернуты демонстрационные данные (например, набор данных по такси), вы увидите таблицы вида:

```sql title="Response"
┌─name──────────┐
│ default.taxis │
└───────────────┘
```

:::note
Если вы не видите ни одной таблицы, это обычно означает, что:

1. В среде ещё не созданы демонстрационные таблицы
2. Сервис каталога Nessie ещё не полностью инициализирован
3. Процесс загрузки демонстрационных данных ещё не завершён

Вы можете просмотреть логи Nessie, чтобы увидеть активность каталога:

```bash
docker-compose logs nessie
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
Обратные кавычки обязательны, поскольку ClickHouse не поддерживает более одного пространства имён.
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
│ ENGINE = Iceberg('http://localhost:9002/my-bucket/default/taxis/', 'admin', '[HIDDEN]')      │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```


## Загрузка данных из Data Lake в ClickHouse {#loading-data-from-your-data-lake-into-clickhouse}

Если необходимо загрузить данные из каталога Nessie в ClickHouse, сначала создайте локальную таблицу ClickHouse:

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

Затем загрузите данные из таблицы каталога Nessie с помощью `INSERT INTO SELECT`:

```sql
INSERT INTO taxis
SELECT * FROM demo.`default.taxis`;
```
