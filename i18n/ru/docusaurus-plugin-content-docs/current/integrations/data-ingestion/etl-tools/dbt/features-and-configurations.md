---
sidebar_label: 'Функции и настройки'
slug: /integrations/dbt/features-and-configurations
sidebar_position: 2
description: 'Описание доступных функций и общих настроек'
keywords: ['clickhouse', 'dbt', 'features']
title: 'Функции и настройки'
doc_type: 'guide'
---

import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Возможности и параметры конфигурации \{#features-and-configurations\}

<ClickHouseSupportedBadge/>

В этом разделе приведена документация по некоторым функциям dbt при работе с ClickHouse.

<TOCInline toc={toc}  maxHeadingLevel={3} />

## Настройка profiles.yml \{#profile-yml-configurations\}

Чтобы подключиться к ClickHouse из dbt, вам необходимо добавить [profile](https://docs.getdbt.com/docs/core/connect-data-platform/connection-profiles) в файл `profiles.yml`. Профиль ClickHouse имеет следующий синтаксис:

```yaml
your_profile_name:
  target: dev
  outputs:
    dev:
      type: clickhouse

      # Optional
      schema: [default] # ClickHouse database for dbt models
      driver: [http] # http or native.  If not set this will be autodetermined based on port setting
      host: [localhost] 
      port: [8123]  # If not set, defaults to 8123, 8443, 9000, 9440 depending on the secure and driver settings 
      user: [default] # User for all database operations
      password: [<empty string>] # Password for the user
      cluster: [<empty string>] # If set, certain DDL/table operations will be executed with the `ON CLUSTER` clause using this cluster. Distributed materializations require this setting to work. See the following ClickHouse Cluster section for more details.
      verify: [True] # Validate TLS certificate if using TLS/SSL
      secure: [False] # Use TLS (native protocol) or HTTPS (http protocol)
      client_cert: [null] # Path to a TLS client certificate in .pem format
      client_cert_key: [null] # Path to the private key for the TLS client certificate
      retries: [1] # Number of times to retry a "retriable" database exception (such as a 503 'Service Unavailable' error)
      compression: [<empty string>] # Use gzip compression if truthy (http), or compression type for a native connection
      connect_timeout: [10] # Timeout in seconds to establish a connection to ClickHouse
      send_receive_timeout: [300] # Timeout in seconds to receive data from the ClickHouse server
      cluster_mode: [False] # Use specific settings designed to improve operation on Replicated databases (recommended for ClickHouse Cloud)
      use_lw_deletes: [False] # Use the strategy `delete+insert` as the default incremental strategy.
      check_exchange: [True] # Validate that clickhouse support the atomic EXCHANGE TABLES command.  (Not needed for most ClickHouse versions)
      local_suffix: [_local] # Table suffix of local tables on shards for distributed materializations.
      local_db_prefix: [<empty string>] # Database prefix of local tables on shards for distributed materializations. If empty, it uses the same database as the distributed table.
      allow_automatic_deduplication: [False] # Enable ClickHouse automatic deduplication for Replicated tables
      tcp_keepalive: [False] # Native client only, specify TCP keepalive configuration. Specify custom keepalive settings as [idle_time_sec, interval_sec, probes].
      custom_settings: [{}] # A dictionary/mapping of custom ClickHouse settings for the connection - default is empty.
      database_engine: '' # Database engine to use when creating new ClickHouse schemas (databases).  If not set (the default), new databases will use the default ClickHouse database engine (usually Atomic).
      threads: [1] # Number of threads to use when running queries. Before setting it to a number higher than 1, make sure to read the [read-after-write consistency](#read-after-write-consistency) section.
      
      # Native (clickhouse-driver) connection settings
      sync_request_timeout: [5] # Timeout for server ping
      compress_block_size: [1048576] # Compression block size if compression is enabled
```


### Схема и база данных \{#schema-vs-database\}

Идентификатор отношения модели dbt `database.schema.table` несовместим с ClickHouse, так как ClickHouse не
поддерживает `schema`.
Поэтому используется упрощённый вариант `schema.table`, где `schema` — это база данных ClickHouse. Использование базы данных `default`
не рекомендуется.

### Предупреждение об операторе SET \{#set-statement-warning\}

Во многих окружениях использование оператора SET для сохранения значения настройки ClickHouse, распространяющейся на все запросы DBT, не является надежным
и может приводить к неожиданным сбоям. Особенно это актуально при использовании HTTP‑подключений через балансировщик
нагрузки, который распределяет запросы по нескольким узлам (например, ClickHouse Cloud), хотя в некоторых
случаях это может происходить и с нативными подключениями ClickHouse. Соответственно, мы рекомендуем задавать все
необходимые настройки ClickHouse в свойстве "custom_settings" профиля DBT (как рекомендуемую практику), вместо того чтобы
полагаться на оператор "SET" в предварительном хуке (pre-hook), как иногда предлагается.

### Настройка `quote_columns` \{#setting-quote_columns\}

Во избежание предупреждений явно задайте значение параметра `quote_columns` в файле `dbt_project.yml`. Подробнее см. в [документации по `quote_columns`](https://docs.getdbt.com/reference/resource-configs/quote_columns).

```yaml
seeds:
  +quote_columns: false  #or `true` if you have CSV column headers with spaces
```


### О кластере ClickHouse \{#about-the-clickhouse-cluster\}

При использовании кластера ClickHouse необходимо учитывать два момента:

- Настройку параметра `cluster`.
- Обеспечение согласованности чтения после записи, особенно если вы используете значение `threads` больше 1.

#### Параметр cluster \{#cluster-setting\}

Параметр `cluster` в профиле позволяет запускать dbt-clickhouse на кластере ClickHouse. Если в профиле задан `cluster`, **все модели по умолчанию будут создаваться с предложением `ON CLUSTER`**, за исключением моделей, использующих движок **Replicated**. К ним относятся:

* создание баз данных;
* материализации представлений;
* материализации таблиц и инкрементальные материализации;
* распределённые материализации.

Движки Replicated **не** будут включать предложение `ON CLUSTER`, так как они изначально спроектированы для внутреннего управления репликацией.

Чтобы **отключить** создание на кластере для конкретной модели, добавьте настройку `disable_on_cluster`:

```sql
{{ config(
        engine='MergeTree',
        materialized='table',
        disable_on_cluster='true'
    )
}}

```

табличные и инкрементальные материализации с нереплицированным движком не будут зависеть от настройки `cluster` (модель
будет создана только на текущем подключённом узле).

**Совместимость**

Если модель была создана без настройки `cluster`, dbt-clickhouse обнаружит это и выполнит все DDL/DML
без конструкции `on cluster` для этой модели.


#### Согласованность чтения после записи \{#read-after-write-consistency\}

dbt опирается на модель согласованности «чтение после вставки» (read-after-insert). Это несовместимо с кластерами ClickHouse с более чем одной репликой, если вы не можете гарантировать, что все операции будут направляться на одну и ту же реплику. В повседневной работе с dbt вы можете не сталкиваться с проблемами, но в зависимости от конфигурации кластера есть несколько стратегий, которые позволяют обеспечить такую гарантию:

- Если вы используете кластер ClickHouse Cloud, достаточно установить `select_sequential_consistency: 1` в свойстве `custom_settings` вашего профиля. Дополнительную информацию об этой настройке можно найти [здесь](/operations/settings/settings#select_sequential_consistency).
- Если вы используете самостоятельно развернутый (self-hosted) кластер, убедитесь, что все запросы dbt отправляются на одну и ту же реплику ClickHouse. Если перед ним установлен балансировщик нагрузки, попробуйте использовать механизм `replica aware routing`/`sticky sessions`, чтобы всегда обращаться к одной и той же реплике. Добавление настройки `select_sequential_consistency = 1` в кластерах вне ClickHouse Cloud [не рекомендуется](/operations/settings/settings#select_sequential_consistency).

## Дополнительные макросы ClickHouse \{#additional-clickhouse-macros\}

### Вспомогательные макросы для материализации моделей \{#model-materialization-utility-macros\}

Следующие макросы предназначены для упрощения создания таблиц и представлений, специфичных для ClickHouse:

- `engine_clause` -- Использует конфигурационное свойство модели `engine` для назначения движка таблицы ClickHouse. dbt-clickhouse
  по умолчанию использует движок `MergeTree`.
- `partition_cols` -- Использует конфигурационное свойство модели `partition_by` для назначения ключа партиционирования ClickHouse. По умолчанию
  ключ партиционирования не задаётся.
- `order_cols` -- Использует конфигурацию модели `order_by` для назначения ключа сортировки (order by) ClickHouse. Если не указано,
  ClickHouse использует пустой кортеж tuple(), и таблица будет несортированной.
- `primary_key_clause` -- Использует конфигурационное свойство модели `primary_key` для назначения первичного ключа ClickHouse. По
  умолчанию первичный ключ задаётся, и ClickHouse использует выражение ORDER BY в качестве первичного ключа.
- `on_cluster_clause` -- Использует свойство профиля `cluster` для добавления выражения `ON CLUSTER` к определённым операциям dbt:
  распределённые материализации, создание представлений, создание базы данных.
- `ttl_config` -- Использует конфигурационное свойство модели `ttl` для назначения выражения TTL для таблицы ClickHouse. По умолчанию TTL
  не задаётся.

### Вспомогательный макрос s3Source \{#s3source-helper-macro\}

Макрос `s3source` упрощает выборку данных ClickHouse напрямую из S3 с использованием табличной функции ClickHouse S3.
Он работает следующим образом: параметры табличной функции S3 заполняются из именованного конфигурационного словаря (имя словаря должно оканчиваться
на `s3`). Сначала макрос ищет словарь в `vars` профиля, затем в конфигурации модели. Словарь может содержать любые из следующих
ключей, используемых для заполнения параметров табличной функции S3:

| Argument Name         | Description                                                                                                                                                                                  |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| bucket                | Базовый URL bucket, например `https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi`. Если протокол не указан, предполагается `https://`.                                       |
| path                  | Путь S3, используемый для запроса к таблице, например `/trips_4.gz`. Поддерживаются подстановочные символы S3 (wildcard).                                                                   |
| fmt                   | Ожидаемый входной формат ClickHouse (например, `TSV` или `CSVWithNames`) для указанных объектов S3.                                                                                          |
| structure             | Структура столбцов данных в bucket в виде списка пар имя/тип данных, например `['id UInt32', 'date DateTime', 'value String']`. Если не указано, ClickHouse выведет структуру автоматически. |
| aws_access_key_id     | Идентификатор ключа доступа S3.                                                                                                                                                              |
| aws_secret_access_key | Секретный ключ S3.                                                                                                                                                                           |
| role_arn              | ARN роли IAM ClickhouseAccess, используемой для безопасного доступа к объектам S3. Дополнительные сведения см. в этой [документации](/cloud/data-sources/secure-s3).                        |
| compression           | Метод сжатия, используемый для объектов S3. Если не указан, ClickHouse попытается определить тип сжатия по имени файла.                                                                     |

См. [тестовый файл S3](https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/clickhouse/test_clickhouse_s3.py)
для примеров использования этого макроса.

### Поддержка межбазовых макросов \{#cross-database-macro-support\}

dbt-clickhouse поддерживает большинство межбазовых макросов, которые теперь входят в состав `dbt Core`, за следующими исключениями:

* SQL‑функция `split_part` реализована в ClickHouse с использованием функции `splitByChar`. Эта функция требует
  использования константной строки в качестве разделителя, поэтому параметр `delimeter`, используемый для этого макроса, будет
  интерпретироваться как строка, а не как имя столбца
* Аналогично, SQL‑функция `replace` в ClickHouse требует константные строки для параметров `old_chars` и `new_chars`,
  поэтому эти параметры будут интерпретироваться как строки, а не имена столбцов при вызове этого макроса.

## Поддержка каталога \{#catalog-support\}

### Статус интеграции с dbt Catalog \{#dbt-catalog-integration-status\}

В dbt Core v1.10 была добавлена поддержка интеграции с каталогом, которая позволяет адаптерам материализовывать модели во внешних каталогах, управляющих открытыми табличными форматами, такими как Apache Iceberg. **Эта функция пока не реализована нативно в dbt-clickhouse.** Вы можете отслеживать прогресс её реализации в [GitHub issue #489](https://github.com/ClickHouse/dbt-clickhouse/issues/489).

### Поддержка каталогов в ClickHouse \{#clickhouse-catalog-support\}

В ClickHouse недавно появилась нативная поддержка таблиц Apache Iceberg и каталогов данных. Большинство возможностей по-прежнему имеют статус `experimental`, но вы уже можете использовать их, если работаете на одной из последних версий ClickHouse.

* Вы можете использовать ClickHouse для **выполнения запросов к таблицам Iceberg, хранящимся в объектном хранилище** (S3, Azure Blob Storage, Google Cloud Storage) с помощью [табличного движка Iceberg](/engines/table-engines/integrations/iceberg) и [табличной функции iceberg](/sql-reference/table-functions/iceberg).

* Дополнительно ClickHouse предоставляет [движок базы данных DataLakeCatalog](/engines/database-engines/datalakecatalog), который обеспечивает **подключение к внешним каталогам данных**, включая AWS Glue Catalog, Databricks Unity Catalog, Hive Metastore и REST‑каталоги. Это позволяет выполнять запросы к данным в открытых форматах таблиц (Iceberg, Delta Lake) напрямую из внешних каталогов без дублирования данных.

### Обходные решения для работы с Iceberg и каталогами \{#workarounds-iceberg-catalogs\}

Вы можете читать данные из таблиц или каталогов Iceberg в своем проекте dbt, если уже определили их в своем кластере ClickHouse с помощью описанных выше инструментов. В dbt вы можете использовать функциональность `source`, чтобы ссылаться на эти таблицы в своих dbt-проектах. Например, если вы хотите получить доступ к своим таблицам в REST Catalog, вы можете:

1. **Создать базу данных, указывающую на внешний каталог:**

```sql
-- Example with REST Catalog
SET allow_experimental_database_iceberg = 1;

CREATE DATABASE iceberg_catalog
ENGINE = DataLakeCatalog('http://rest:8181/v1', 'admin', 'password')
SETTINGS 
    catalog_type = 'rest', 
    storage_endpoint = 'http://minio:9000/lakehouse', 
    warehouse = 'demo'
```

2. **Определите базу данных каталога и её таблицы как источники в dbt:** учтите, что эти таблицы уже должны существовать в ClickHouse

```yaml
version: 2

sources:
  - name: external_catalog
    database: iceberg_catalog
    tables:
      - name: orders
      - name: customers
```

3. **Используйте таблицы каталога в моделях dbt:**

```sql
SELECT 
    o.order_id,
    c.customer_name,
    o.order_date
FROM {{ source('external_catalog', 'orders') }} o
INNER JOIN {{ source('external_catalog', 'customers') }} c
    ON o.customer_id = c.customer_id
```


### Заметки о временных решениях \{#benefits-workarounds\}

Преимущества этих временных решений:

* Вы получите быстрый доступ к различным типам внешних таблиц и внешних каталогов, не дожидаясь нативной интеграции каталога dbt.
* У вас будет бесшовный путь миграции, когда станет доступна нативная поддержка каталогов.

Однако на данный момент есть некоторые ограничения:

* **Ручная настройка:** таблицы Iceberg и базы данных каталогов должны быть созданы в ClickHouse вручную, прежде чем их можно будет использовать в dbt.
* **Отсутствие DDL на уровне каталога:** dbt не может управлять операциями на уровне каталога, такими как создание или удаление таблиц Iceberg во внешних каталогах. Поэтому вы пока не сможете создавать их через коннектор dbt. Возможность создания таблиц с движками Iceberg() может быть добавлена в будущем.
* **Операции записи:** в настоящее время запись в таблицы Iceberg/Data Catalog ограничена. Ознакомьтесь с документацией ClickHouse, чтобы понять, какие возможности доступны.