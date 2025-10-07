---
'slug': '/use-cases/data-lake/rest-catalog'
'sidebar_label': 'REST Catalog'
'title': 'REST Catalog'
'pagination_prev': null
'pagination_next': null
'description': 'В этом руководстве мы проведем вас через шаги для выполнения запросов
  к вашим данным с использованием ClickHouse и REST Catalog.'
'keywords':
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
Интеграция с REST Catalog работает только с таблицами Iceberg.
Эта интеграция поддерживает как AWS S3, так и другие облачные хранилища.
:::

ClickHouse поддерживает интеграцию с несколькими каталогами (Unity, Glue, REST, Polaris и др.). Этот гид проведет вас через шаги запроса ваших данных, используя ClickHouse и спецификацию [REST Catalog](https://github.com/apache/iceberg/blob/main/open-api/rest-catalog-open-api.yaml/).

REST Catalog — это стандартизированная API спецификация для каталогов Iceberg, поддерживаемая различными платформами, включая:
- **Локальные среды разработки** (с использованием docker-compose)
- **Управляемые сервисы**, такие как Tabular.io
- **Самостоятельно размещенные** реализации REST каталога

:::note
Поскольку эта функция экспериментальная, вам нужно будет активировать её с помощью:
`SET allow_experimental_database_iceberg = 1;`
:::

## Настройка локальной разработки {#local-development-setup}

Для локальной разработки и тестирования вы можете использовать контейнеризированную настройку REST каталога. Этот подход идеален для обучения, прототипирования и рабочих сред.

### Предварительные условия {#local-prerequisites}

1. **Docker и Docker Compose**: Убедитесь, что Docker установлен и работает
2. **Пример настройки**: Вы можете использовать различные настройки docker-compose (см. раздел Альтернативные образы Docker ниже)

### Настройка локального REST каталога {#setting-up-local-rest-catalog}

Вы можете использовать различные контейнеризированные реализации REST каталога, такие как **[Databricks docker-spark-iceberg](https://github.com/databricks/docker-spark-iceberg/blob/main/docker-compose.yml?ref=blog.min.io)**, которые обеспечивают полноценную среду Spark + Iceberg + REST каталога с помощью docker-compose, что делает её идеальной для тестирования интеграций Iceberg.

**Шаг 1:** Создайте новую папку, в которой будете запускать пример, затем создайте файл `docker-compose.yml` с конфигурацией из [Databricks docker-spark-iceberg](https://github.com/databricks/docker-spark-iceberg/blob/main/docker-compose.yml?ref=blog.min.io).

**Шаг 2:** Далее создайте файл `docker-compose.override.yml` и поместите в него следующую конфигурацию контейнера ClickHouse:

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

**Шаг 3:** Запустите следующую команду для старта сервисов:

```bash
docker compose up
```

**Шаг 4:** Подождите, пока все сервисы будут готовы. Вы можете проверить логи:

```bash
docker-compose logs -f
```

:::note
Настройка REST каталога требует предварительной загрузки примерных данных в таблицы Iceberg. Убедитесь, что среда Spark создала и наполнила таблицы перед тем, как пытаться запрашивать их через ClickHouse. Доступность таблиц зависит от конкретной настройки docker-compose и скриптов загрузки примерных данных.
:::

### Подключение к локальному REST каталогу {#connecting-to-local-rest-catalog}

Подключитесь к вашему контейнеру ClickHouse:

```bash
docker exec -it clickhouse clickhouse-client
```

Затем создайте соединение с базой данных для REST каталога:

```sql
SET allow_experimental_database_iceberg = 1;

CREATE DATABASE demo
ENGINE = DataLakeCatalog('http://rest:8181/v1', 'admin', 'password')
SETTINGS 
    catalog_type = 'rest', 
    storage_endpoint = 'http://minio:9000/lakehouse', 
    warehouse = 'demo'
```

## Запрос таблиц REST каталога с использованием ClickHouse {#querying-rest-catalog-tables-using-clickhouse}

Теперь, когда соединение установлено, вы можете начать делать запросы через REST каталог. Например:

```sql
USE demo;

SHOW TABLES;
```

Если ваша настройка включает примерные данные (такие как набор данных такси), вы должны увидеть такие таблицы:

```sql title="Response"
┌─name──────────┐
│ default.taxis │
└───────────────┘
```

:::note
Если вы не видите никаких таблиц, это обычно означает:
1. Среда Spark ещё не создала примерные таблицы
2. Сервис REST каталога не полностью инициализирован
3. Процесс загрузки примерных данных не завершён

Вы можете проверить логи Spark, чтобы увидеть прогресс создания таблиц:
```bash
docker-compose logs spark
```
:::

Чтобы сделать запрос к таблице (если она доступна):

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

## Загрузка данных из вашего Data Lake в ClickHouse {#loading-data-from-your-data-lake-into-clickhouse}

Если вам нужно загрузить данные из REST каталога в ClickHouse, начните с создания локальной таблицы ClickHouse:

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

Затем загрузите данные из вашей таблицы REST каталога через `INSERT INTO SELECT`:

```sql
INSERT INTO taxis 
SELECT * FROM demo.`default.taxis`;
```
