---
sidebar_label: 'Функции и настройки'
slug: /integrations/dbt/features-and-configurations
sidebar_position: 2
description: 'Возможности использования dbt совместно с ClickHouse'
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


### Схема и база данных \\{#schema-vs-database\\}

Идентификатор отношения модели dbt `database.schema.table` несовместим с ClickHouse, так как ClickHouse не
поддерживает `schema`.
Поэтому используется упрощённый вариант `schema.table`, где `schema` — это база данных ClickHouse. Использование базы данных `default`
не рекомендуется.

### Предупреждение об операторе SET \\{#set-statement-warning\\}

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


### О кластере ClickHouse \\{#about-the-clickhouse-cluster\\}

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


#### Согласованность чтения после записи \\{#read-after-write-consistency\\}

dbt опирается на модель согласованности «чтение после вставки» (read-after-insert). Это несовместимо с кластерами ClickHouse с более чем одной репликой, если вы не можете гарантировать, что все операции будут направляться на одну и ту же реплику. В повседневной работе с dbt вы можете не сталкиваться с проблемами, но в зависимости от конфигурации кластера есть несколько стратегий, которые позволяют обеспечить такую гарантию:

- Если вы используете кластер ClickHouse Cloud, достаточно установить `select_sequential_consistency: 1` в свойстве `custom_settings` вашего профиля. Дополнительную информацию об этой настройке можно найти [здесь](/operations/settings/settings#select_sequential_consistency).
- Если вы используете самостоятельно развернутый (self-hosted) кластер, убедитесь, что все запросы dbt отправляются на одну и ту же реплику ClickHouse. Если перед ним установлен балансировщик нагрузки, попробуйте использовать механизм `replica aware routing`/`sticky sessions`, чтобы всегда обращаться к одной и той же реплике. Добавление настройки `select_sequential_consistency = 1` в кластерах вне ClickHouse Cloud [не рекомендуется](/operations/settings/settings#select_sequential_consistency).

## Общая информация о возможностях \\{#general-information-about-features\\}

### Общие конфигурации моделей \\{#general-model-configurations\\}

В следующей таблице приведены конфигурации, которые используются в некоторых доступных материализациях. Подробную информацию об общих конфигурациях моделей dbt см. в [документации dbt](https://docs.getdbt.com/category/general-configs):

| Параметр               | Описание                                                                                                                                                                                                                                                                                                            | Значение по умолчанию |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| engine                 | Движок таблицы (тип таблицы), используемый при создании таблиц                                                                                                                                                                                                                                                       | `MergeTree()`          |
| order_by               | Кортеж имён столбцов или произвольных выражений. Позволяет создать небольшой разреженный индекс, который помогает быстрее находить данные.                                                                                                                                                                          | `tuple()`              |
| partition_by           | Партиция — это логическое объединение записей в таблице по заданному критерию. Ключ партиции может быть любым выражением из столбцов таблицы.                                                                                                                                                                       |                        |
| primary_key            | Как и `order_by`, выражение первичного ключа ClickHouse. Если не указано, ClickHouse будет использовать выражение `order_by` в качестве первичного ключа.                                                                                                                                                           |                        |
| settings               | Карта/словарь настроек `"TABLE"`, которые будут использоваться в DDL-командах, таких как `CREATE TABLE`, для этой модели                                                                                                                                                                                             |                        |
| query_settings         | Карта/словарь пользовательских настроек ClickHouse, которые будут использоваться с командами `INSERT` или `DELETE` для этой модели                                                                                                                                                                                   |                        |
| ttl                    | Выражение TTL, которое будет использоваться с таблицей. Это строка, с помощью которой задаётся TTL для таблицы.                                                                                                                                                                                                     |                        |
| indexes                | Список [индексов пропуска данных](/optimize/skipping-indexes), которые нужно создать. См. раздел [Об индексах пропуска данных](#data-skipping-indexes) для получения подробной информации.                                                                                                                           |                        |
| sql_security           | Пользователь ClickHouse, от имени которого выполняется базовый запрос представления. [Допустимые значения](/sql-reference/statements/create/view#sql_security): `definer`, `invoker`.                                                                                                                              |                        |
| definer                | Если для `sql_security` установлено значение `definer`, необходимо указать существующего пользователя или `CURRENT_USER` в предложении `definer`.                                                                                                                                                                   |                        |
| projections            | Список [проекций](/data-modeling/projections), которые должны быть созданы. См. раздел [О проекциях](#projections) для получения подробной информации.                                                                                                                                                              |                        |

#### Об индексах пропуска данных \{#data-skipping-indexes\}

Индексы пропуска данных доступны только для материализации `table`. Чтобы добавить список индексов пропуска данных к таблице, используйте конфигурацию `indexes`:

```sql
{{ config(
        materialized='table',
        indexes=[{
          'name': 'your_index_name',
          'definition': 'your_column TYPE minmax GRANULARITY 2'
        }]
) }}
```


#### О проекциях \{#projections\}

Вы можете добавлять [проекции](/data-modeling/projections) для материализаций `table` и `distributed_table` с помощью конфигурации `projections`:

```sql
{{ config(
       materialized='table',
       projections=[
           {
               'name': 'your_projection_name',
               'query': 'SELECT department, avg(age) AS avg_age GROUP BY department'
           }
       ]
) }}
```

**Примечание**: Для distributed таблиц проекция применяется к локальным таблицам `_local`, а не к distributed прокси-таблице.


### Поддерживаемые движки таблиц \\{#supported-table-engines\\}

| Тип                   | Подробности                                                                                |
|------------------------|-------------------------------------------------------------------------------------------|
| MergeTree (по умолчанию) | https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/mergetree/.         |
| HDFS                   | https://clickhouse.com/docs/en/engines/table-engines/integrations/hdfs                    |
| MaterializedPostgreSQL | https://clickhouse.com/docs/en/engines/table-engines/integrations/materialized-postgresql |
| S3                     | https://clickhouse.com/docs/en/engines/table-engines/integrations/s3                      |
| EmbeddedRocksDB        | https://clickhouse.com/docs/en/engines/table-engines/integrations/embedded-rocksdb        |
| Hive                   | https://clickhouse.com/docs/en/engines/table-engines/integrations/hive                    |

**Примечание**: для materialized view поддерживаются все движки семейства *MergeTree.

### Экспериментально поддерживаемые движки таблиц \\{#experimental-supported-table-engines\\}

| Тип               | Подробности                                                                |
|-------------------|---------------------------------------------------------------------------|
| Distributed Table | https://clickhouse.com/docs/en/engines/table-engines/special/distributed. |
| Dictionary        | https://clickhouse.com/docs/en/engines/table-engines/special/dictionary   |

Если вы столкнётесь с проблемами при подключении к ClickHouse из dbt при использовании одного из указанных выше движков, пожалуйста, сообщите о проблеме [здесь](https://github.com/ClickHouse/dbt-clickhouse/issues).

### Примечание о настройках модели \\{#a-note-on-model-settings\\}

В ClickHouse существует несколько типов/уровней «настроек». В конфигурации модели выше настраиваемыми являются два из них. `settings` обозначает предложение `SETTINGS`,
используемое в DDL-командах типа `CREATE TABLE/VIEW`, поэтому, как правило, это настройки, специфичные для
конкретного движка таблиц ClickHouse. Новый
`query_settings` используется для добавления предложения `SETTINGS` к запросам `INSERT` и `DELETE`, применяемым для материализации модели
(включая инкрементальные материализации).
В ClickHouse существуют сотни настроек, и не всегда очевидно, какая из них является «табличной» настройкой, а какая — настройкой «пользователя»
(хотя пользовательские, как правило,
доступны в таблице `system.settings`). В целом рекомендуется использовать значения по умолчанию, а любое изменение этих параметров
следует тщательно изучить и протестировать.

### Конфигурация столбцов \\{#column-configuration\\}

> **_ПРИМЕЧАНИЕ:_** Приведённые ниже параметры конфигурации столбцов требуют включения и применения [контрактов моделей](https://docs.getdbt.com/docs/collaborate/govern/model-contracts).

| Параметр | Описание                                                                                                                                                 | Значение по умолчанию (если есть) |
|----------|----------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------|
| codec    | Строка, состоящая из аргументов, передаваемых в `CODEC()` в DDL столбца. Например: `codec: "Delta, ZSTD"` будет скомпилирована как `CODEC(Delta, ZSTD)`. |    
| ttl      | Строка, состоящая из [выражения TTL (time-to-live)](https://clickhouse.com/docs/guides/developer/ttl), которое задаёт правило TTL в DDL столбца. Например: `ttl: ts + INTERVAL 1 DAY` будет скомпилирована как `TTL ts + INTERVAL 1 DAY`. |

#### Пример настройки схемы \{#example-of-schema-configuration\}

```yaml
models:
  - name: table_column_configs
    description: 'Testing column-level configurations'
    config:
      contract:
        enforced: true
    columns:
      - name: ts
        data_type: timestamp
        codec: ZSTD
      - name: x
        data_type: UInt8
        ttl: ts + INTERVAL 1 DAY
```


#### Добавление сложных типов \{#adding-complex-types\}

dbt автоматически определяет тип данных каждого столбца, анализируя SQL, используемый для создания модели. Однако в некоторых случаях этот процесс может некорректно определить тип данных, что приводит к конфликтам с типами, указанными в свойстве контракта `data_type`. Чтобы избежать этого, рекомендуется использовать функцию `CAST()` в SQL-модели для явного указания требуемого типа. Например:

```sql
{{
    config(
        materialized="materialized_view",
        engine="AggregatingMergeTree",
        order_by=["event_type"],
    )
}}

select
  -- event_type may be infered as a String but we may prefer LowCardinality(String):
  CAST(event_type, 'LowCardinality(String)') as event_type,
  -- countState() may be infered as `AggregateFunction(count)` but we may prefer to change the type of the argument used:
  CAST(countState(), 'AggregateFunction(count, UInt32)') as response_count, 
  -- maxSimpleState() may be infered as `SimpleAggregateFunction(max, String)` but we may prefer to also change the type of the argument used:
  CAST(maxSimpleState(event_type), 'SimpleAggregateFunction(max, LowCardinality(String))') as max_event_type
from {{ ref('user_events') }}
group by event_type
```


## Возможности \\{#features\\}

### Материализация: view \{#materialization-view\}

Модель dbt может быть реализована как [представление ClickHouse](/sql-reference/table-functions/view/)
и настроена с использованием следующего синтаксиса:

Файл проекта (`dbt_project.yml`):

```yaml
models:
  <resource-path>:
    +materialized: view
```

Либо конфигурационный блок (`models/&lt;model_name&gt;.sql`):

```python
{{ config(materialized = "view") }}
```


### Материализация: таблица \{#materialization-table\}

Модель dbt может быть создана как [таблица ClickHouse](/operations/system-tables/tables/) и
настроена с помощью следующего синтаксиса:

Файл проекта (`dbt_project.yml`):

```yaml
models:
  <resource-path>:
    +materialized: table
    +order_by: [ <column-name>, ... ]
    +engine: <engine-type>
    +partition_by: [ <column-name>, ... ]
```

Или блок конфигурации в файле (`models/<model_name>.sql`):

```python
{{ config(
    materialized = "table",
    engine = "<engine-type>",
    order_by = [ "<column-name>", ... ],
    partition_by = [ "<column-name>", ... ],
      ...
    ]
) }}
```


### Материализация: инкрементальная \{#materialization-incremental\}

Модель таблицы будет перестраиваться при каждом выполнении dbt. Это может быть непрактично и крайне затратно для больших результирующих наборов данных или сложных преобразований. Чтобы решить эту задачу и сократить время сборки, модель dbt может быть реализована в виде инкрементальной таблицы ClickHouse и настраивается с помощью следующего синтаксиса:

Определение модели в `dbt_project.yml`:

```yaml
models:
  <resource-path>:
    +materialized: incremental
    +order_by: [ <column-name>, ... ]
    +engine: <engine-type>
    +partition_by: [ <column-name>, ... ]
    +unique_key: [ <column-name>, ... ]
    +inserts_only: [ True|False ]
```

Или конфигурационный блок в `models/<model_name>.sql`:

```python
{{ config(
    materialized = "incremental",
    engine = "<engine-type>",
    order_by = [ "<column-name>", ... ],
    partition_by = [ "<column-name>", ... ],
    unique_key = [ "<column-name>", ... ],
    inserts_only = [ True|False ],
      ...
    ]
) }}
```


#### Конфигурации \\{#incremental-configurations\\}

Ниже перечислены конфигурации, специфичные для этого типа материализации:

| Параметр                 | Описание                                                                                                                                                                                                                                                          | Обязателен?                                                                          |
|--------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| `unique_key`             | Кортеж имён столбцов, которые однозначно идентифицируют строки. Дополнительные сведения об ограничениях уникальности см. [здесь](https://docs.getdbt.com/docs/build/incremental-models#defining-a-unique-key-optional).                                                                                 | Обязателен. Если не указан, изменённые строки будут дважды добавлены в инкрементальную таблицу. |
| `inserts_only`           | Устарел в пользу инкрементальной `strategy` `append`, которая работает аналогичным образом. Если для инкрементальной модели установлено значение `True`, инкрементальные обновления будут вставляться напрямую в целевую таблицу без создания промежуточной таблицы. Если задан `inserts_only`, `incremental_strategy` игнорируется. | Необязателен (по умолчанию: `False`)                                                |
| `incremental_strategy`   | Стратегия, используемая для инкрементальной материализации. Поддерживаются `delete+insert`, `append`, `insert_overwrite` или `microbatch`. Дополнительные сведения о стратегиях см. [здесь](/integrations/dbt/features-and-configurations#incremental-model-strategies). | Необязателен (по умолчанию: `default`)                                              |
| `incremental_predicates` | Дополнительные условия, применяемые к инкрементальной материализации (применяются только для стратегии `delete+insert`).                                                                                                                                         | Необязателен                                                                         |                      

#### Стратегии инкрементных моделей \\{#incremental-model-strategies\\}

`dbt-clickhouse` поддерживает три стратегии для инкрементных моделей.

##### Стратегия по умолчанию (устаревшая) \\{#default-legacy-strategy\\}

Исторически ClickHouse имел лишь ограниченную поддержку операций обновления и удаления в виде асинхронных «мутаций».
Чтобы эмулировать ожидаемое поведение dbt,
dbt-clickhouse по умолчанию создает новую временную таблицу, содержащую все незатронутые (не удаленные, не измененные) «старые»
записи, а также все новые или обновленные записи,
а затем заменяет этой временной таблицей существующее отношение инкрементной модели. Это единственная стратегия,
которая сохраняет исходное отношение, если что-то
идет не так до завершения операции; однако, поскольку она требует полного копирования исходной таблицы, она может быть довольно
дорогой и медленной в выполнении.

##### Стратегия Delete+Insert \\{#delete-insert-strategy\\}

В ClickHouse «легковесные удаления» были добавлены как экспериментальная возможность в версии 22.8. Легковесные удаления значительно
быстрее операций ALTER TABLE ... DELETE,
поскольку они не требуют перезаписи частей данных ClickHouse. Инкрементальная стратегия `delete+insert`
использует легковесные удаления для реализации
инкрементальных материализаций, которые работают значительно лучше, чем «устаревшая» стратегия. Однако при использовании этой стратегии есть важные
предостережения:

- Легковесные удаления должны быть включены на вашем сервере ClickHouse с помощью настройки
  `allow_experimental_lightweight_delete=1`, либо вы
  должны задать `use_lw_deletes=true` в своём профиле (что включит эту настройку для ваших dbt-сессий)
- Легковесные удаления сейчас считаются готовыми к использованию в продакшене, но в версиях ClickHouse
  ранее 23.3 могут наблюдаться проблемы с производительностью и другие проблемы.
- Эта стратегия работает напрямую с затронутой таблицей/отношением (без создания каких-либо промежуточных или временных таблиц),
  поэтому, если во время операции возникнет проблема,
  данные в инкрементальной модели, скорее всего, окажутся в некорректном состоянии
- При использовании легковесных удалений dbt-clickhouse включает настройку `allow_nondeterministic_mutations`. В некоторых очень
  редких случаях при использовании недетерминированных `incremental_predicates`
  это может привести к гонке при обновлении/удалении записей (и соответствующим сообщениям в журналах ClickHouse).
  Чтобы гарантировать согласованные результаты,
  инкрементальные предикаты должны включать только подзапросы к данным, которые не будут изменяться во время инкрементальной
  материализации.

##### Стратегия Microbatch (требуется dbt-core >= 1.9) \\{#microbatch-strategy\\}

Инкрементальная стратегия `microbatch` является функцией dbt-core, начиная с версии 1.9, и предназначена для эффективной обработки крупных
преобразований временных рядов. В dbt-clickhouse она базируется на существующей инкрементальной стратегии `delete_insert`,
разбивая инкрементальную загрузку на предопределённые пакеты (батчи) временных рядов на основе конфигураций модели `event_time` и
`batch_size`.

Помимо обработки крупных преобразований, microbatch предоставляет возможность:

- [Повторно обрабатывать неудавшиеся батчи](https://docs.getdbt.com/docs/build/incremental-microbatch#retry).
- Автоматически определять [параллельное выполнение батчей](https://docs.getdbt.com/docs/build/parallel-batch-execution).
- Устранить необходимость в сложной условной логике при [заполнении исторических данных (backfilling)](https://docs.getdbt.com/docs/build/incremental-microbatch#backfills).

Для получения подробной информации об использовании microbatch см. [официальную документацию](https://docs.getdbt.com/docs/build/incremental-microbatch).

###### Доступные конфигурации микробатчей \\{#available-microbatch-configurations\\}

| Option             | Description                                                                                                                                                                                                                                                                                                                                | Default if any |
|--------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| event_time         | Столбец, указывающий «в какое время появилась строка». Обязателен для вашей микробатчевой модели и любых непосредственных родительских моделей, которые должны фильтроваться.                                                                                                                                                             |                |
| begin              | «Начало времени» для микробатчевой модели. Это стартовая точка для любых начальных или full-refresh сборок. Например, микробатчевая модель с дневной детализацией, запущенная 2024-10-01 с begin = '2023-10-01', обработает 366 батчей (это високосный год!) плюс батч за «сегодня».                                                    |                |
| batch_size         | Детализация (гранулярность) ваших батчей. Поддерживаемые значения: `hour`, `day`, `month` и `year`.                                                                                                                                                                                                                                        |                |
| lookback           | Обработать X батчей до последней контрольной точки (bookmark), чтобы захватить поздно поступившие записи.                                                                                                                                                                                                                                 | 1              |
| concurrent_batches | Переопределяет автоопределение dbt для параллельного запуска батчей. Подробнее см. раздел [configuring concurrent batches](https://docs.getdbt.com/docs/build/incremental-microbatch#configure-concurrent_batches). Значение true запускает батчи параллельно. Значение false запускает батчи последовательно (один за другим).        |                |

##### Стратегия Append \\{#append-strategy\\}

Эта стратегия заменяет настройку `inserts_only` в предыдущих версиях dbt-clickhouse. Такой подход просто добавляет
новые строки в существующую таблицу или представление.
В результате дублирующиеся строки не устраняются и не создаётся временная или промежуточная таблица. Это самый быстрый
подход, если дубликаты либо допустимы в данных,
либо исключаются условием WHERE инкрементального запроса или фильтром.

##### Стратегия insert_overwrite (экспериментальная) \\{#insert-overwrite-strategy\\}

> [IMPORTANT]  
> В настоящее время стратегия insert_overwrite не полностью работоспособна с распределёнными материализациями.

Стратегия выполняет следующие шаги:

1. Создаёт промежуточную (временную) таблицу с той же структурой, что и инкрементальное отношение модели:
   `CREATE TABLE <staging> AS <target>`.
2. Вставляет только новые записи (полученные из `SELECT`) во временную таблицу.
3. Заменяет в целевой таблице только новые партиции, присутствующие во временной таблице.

Такой подход имеет следующие преимущества:

- Он быстрее, чем стратегия по умолчанию, поскольку не копирует всю таблицу.
- Он безопаснее других стратегий, потому что не изменяет исходную таблицу, пока операция INSERT не будет успешно
  завершена: в случае промежуточного сбоя исходная таблица не изменяется.
- Он реализует лучшую практику инженерии данных (data engineering) — «неизменяемость партиций». Это упрощает инкрементальную и
  параллельную обработку данных, откаты и т. д.

Стратегия требует, чтобы `partition_by` был задан в конфигурации модели. При этом игнорируются все остальные параметры
конфигурации модели, специфичные для стратегий.

### Материализация: materialized&#95;view (экспериментальная) \{#materialized-view\}

Материализация `materialized_view` должна представлять собой запрос `SELECT` к существующей (исходной) таблице. Адаптер создаст
целевую таблицу с именем модели
и ClickHouse MATERIALIZED VIEW с именем `<model_name>_mv`. В отличие от PostgreSQL, materialized view в ClickHouse
не является «статической» (и не
имеет соответствующей операции REFRESH). Вместо этого она действует как «триггер вставки» и будет вставлять новые строки в целевую
таблицу, используя определённую в представлении «трансформацию» `SELECT`
для строк, вставляемых в исходную таблицу. См. [файл с тестом](https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/materialized_view/test_materialized_view.py)
для вводного примера
того, как использовать эту функциональность.

ClickHouse предоставляет возможность нескольким materialized view записывать данные в одну и ту же целевую таблицу. Чтобы
поддержать это в dbt-clickhouse, вы можете построить `UNION` в файле вашей модели так, чтобы SQL для каждого из ваших
materialized view был обёрнут в комментарии вида `--my_mv_name:begin` и `--my_mv_name:end`.

Например, следующий пример создаст два materialized view, которые оба будут записывать данные в одну и ту же целевую таблицу
модели. Имена этих materialized view будут иметь вид `<model_name>_mv1` и `<model_name>_mv2`:

```sql
--mv1:begin
select a,b,c from {{ source('raw', 'table_1') }}
--mv1:end
union all
--mv2:begin
select a,b,c from {{ source('raw', 'table_2') }}
--mv2:end
```

> ВАЖНО!
>
> При обновлении модели, использующей несколько materialized view (MV), особенно если вы переименовываете одну из MV,
> dbt-clickhouse не удаляет автоматически старую MV. Вместо этого
> вы получите следующее предупреждение:
> `Warning - Table <previous table name> was detected with the same pattern as model name <your model name> but was not found in this run. In case it is a renamed mv that was previously part of this model, drop it manually (!!!) `


#### Догрузка данных \{#data-catch-up\}

В настоящее время при создании materialized view (MV) целевая таблица сначала заполняется историческими данными, а уже затем создаётся сама MV.

Другими словами, dbt-clickhouse сначала создаёт целевую таблицу и предварительно загружает в неё исторические данные на основе запроса, определённого для MV. Только после этого шага создаётся MV.

Если вы не хотите предварительно загружать исторические данные при создании MV, вы можете отключить это поведение, установив параметр catch-up в значение False:

```python
{{config(
    materialized='materialized_view',
    engine='MergeTree()',
    order_by='(id)',
    catchup=False
)}}
```


#### Refreshable Materialized Views \{#refreshable-materialized-views\}

Чтобы использовать [Refreshable Materialized View](/materialized-view/refreshable-materialized-view),
при необходимости скорректируйте следующие параметры в вашей MV‑модели (все эти параметры должны быть заданы
внутри объекта конфигурации refreshable):

| Option                        | Description                                                                                                                                                                             | Required | Default Value |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------- |
| refresh&#95;interval          | Выражение интервала (обязательный параметр)                                                                                                                                             | Yes      |               |
| randomize                     | Параметр рандомизации, который будет добавлен после `RANDOMIZE FOR`                                                                                                                     |          |               |
| append                        | Если установлено значение `True`, при каждом обновлении в таблицу добавляются строки без удаления существующих строк. Вставка не является атомарной, аналогично обычному INSERT SELECT. |          | False         |
| depends&#95;on                | Список зависимостей для refreshable materialized view. Укажите зависимости в следующем формате `{schema}.{view_name}`                                                                   |          |               |
| depends&#95;on&#95;validation | Определяет, нужно ли проверять существование зависимостей, указанных в `depends_on`. Если зависимость не содержит схемы, проверка выполняется в схеме `default`.                        |          | False         |

Пример конфигурации для refreshable materialized view:

```python
{{
    config(
        materialized='materialized_view',
        refreshable={
            "interval": "EVERY 5 MINUTE",
            "randomize": "1 MINUTE",
            "append": True,
            "depends_on": ['schema.depend_on_model'],
            "depends_on_validation": True
        }
    )
}}
```


#### Ограничения \\{#limitations\\}

* При создании refreshable materialized view (MV) в ClickHouse, у которой есть зависимость, ClickHouse не выдаёт
  ошибку, если указанная зависимость отсутствует в момент создания. Вместо этого refreshable MV остаётся в
  неактивном состоянии, ожидая появления необходимой зависимости, прежде чем начать обрабатывать обновления или выполнять refresh.
  Такое поведение является ожидаемым, но может приводить к задержкам в доступности данных, если вопрос с необходимой зависимостью
  не будет оперативно решён. Пользователям рекомендуется убедиться, что все зависимости корректно определены и
  существуют до создания refreshable materialized view.
* На текущий момент не существует фактической «dbt linkage» между MV и её зависимостями, поэтому порядок создания не
  гарантируется.
* Функциональность refreshable не тестировалась в сценариях с несколькими MV, направляющими данные в одну и ту же целевую модель.

### Материализация: словарь (экспериментальная) \\{#materialization-dictionary\\}

См. тесты
в https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/dictionary/test_dictionary.py для
примеров реализации материализации словарей ClickHouse

### Materialization: distributed_table (экспериментальная) \\{#materialization-distributed-table\\}

distributed таблица создаётся следующими шагами:

1. Создаётся временное представление с SQL-запросом, чтобы получить нужную структуру.
2. Создаются пустые локальные таблицы на основе этого представления.
3. Создаётся distributed таблица на основе локальных таблиц.
4. Данные вставляются в distributed таблицу, поэтому они распределяются по сегментам без дублирования.

Примечания:

- Запросы dbt-clickhouse теперь автоматически включают настройку `insert_distributed_sync = 1`, чтобы гарантировать
  корректное выполнение последующих инкрементальных операций
  материализации. Это может привести к тому, что некоторые вставки в distributed таблицу будут выполняться медленнее, чем
  ожидалось.

#### Пример модели distributed-таблицы \{#distributed-table-model-example\}

```sql
{{
    config(
        materialized='distributed_table',
        order_by='id, created_at',
        sharding_key='cityHash64(id)',
        engine='ReplacingMergeTree'
    )
}}

select id, created_at, item
from {{ source('db', 'table') }}
```


#### Сгенерированные миграции \{#distributed-table-generated-migrations\}

```sql
CREATE TABLE db.table_local on cluster cluster (
    `id` UInt64,
    `created_at` DateTime,
    `item` String
)
    ENGINE = ReplacingMergeTree
    ORDER BY (id, created_at);

CREATE TABLE db.table on cluster cluster (
    `id` UInt64,
    `created_at` DateTime,
    `item` String
)
    ENGINE = Distributed ('cluster', 'db', 'table_local', cityHash64(id));
```


#### Конфигурации \\{#distributed-table-configurations\\}

Ниже перечислены конфигурации, которые специфичны для этого типа материализации:

| Option                 | Description                                                                                                                                                                                                                                                                                                          | Default if any |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| sharding_key           | Ключ сегментирования определяет целевой сервер при вставке в таблицу с движком `Distributed`. Ключ сегментирования может быть случайным или являться результатом хеш-функции                                                                                                                                       | `rand()`)      |

### materialization: distributed_incremental (экспериментальная) \\{#materialization-distributed-incremental\\}

Инкрементальная модель базируется на той же идее, что и distributed таблица; основная сложность — корректно обработать все инкрементальные стратегии.

1. _Стратегия Append_ просто вставляет данные в distributed таблицу.
2. _Стратегия Delete+Insert_ создаёт distributed временную таблицу, чтобы работать со всеми данными на каждом сегменте.
3. _Стратегия Default (Legacy)_ создаёт distributed временную и промежуточные таблицы по той же причине.

Заменяются только таблицы сегментов, потому что distributed таблица не хранит данные.
Distributed таблица пересоздаётся только при включённом режиме full_refresh или если могла измениться структура таблицы.

#### Пример распределённой инкрементальной модели \{#distributed-incremental-model-example\}

```sql
{{
    config(
        materialized='distributed_incremental',
        engine='MergeTree',
        incremental_strategy='append',
        unique_key='id,created_at'
    )
}}

select id, created_at, item
from {{ source('db', 'table') }}
```


#### Автоматически генерируемые миграции \{#distributed-incremental-generated-migrations\}

```sql
CREATE TABLE db.table_local on cluster cluster (
    `id` UInt64,
    `created_at` DateTime,
    `item` String
)
    ENGINE = MergeTree;

CREATE TABLE db.table on cluster cluster (
    `id` UInt64,
    `created_at` DateTime,
    `item` String
)
    ENGINE = Distributed ('cluster', 'db', 'table_local', cityHash64(id));
```


### Снапшот \{#snapshot\}

Снапшоты dbt позволяют фиксировать изменения изменяемой модели во времени. Это, в свою очередь, дает возможность выполнять запросы к моделям на определенный момент времени, когда аналитики могут «вернуться в прошлое» и увидеть предыдущее состояние модели. Эта функциональность поддерживается коннектором ClickHouse и настраивается с использованием следующего синтаксиса:

Блок конфигурации в `snapshots/<model_name>.sql`:

```python
{{
   config(
     schema = "<schema-name>",
     unique_key = "<column-name>",
     strategy = "<strategy>",
     updated_at = "<updated-at-column-name>",
   )
}}
```

Дополнительные сведения о конфигурации см. на справочной странице [snapshot configs](https://docs.getdbt.com/docs/build/snapshots#snapshot-configs).


### Контракты и ограничения \\{#contracts-and-constraints\\}

Поддерживаются только контракты с точным соответствием типа столбца. Например, контракт со столбцом типа UInt32 завершится ошибкой, если модель
возвращает UInt64 или другой целочисленный тип.
ClickHouse также поддерживает _только_ ограничения `CHECK` на уровне всей таблицы/модели. Ограничения первичного ключа, внешнего ключа, уникальности и
ограничения CHECK на уровне столбца не поддерживаются.
(См. документацию ClickHouse по первичным ключам и ключам ORDER BY.)

### Дополнительные макросы ClickHouse \\{#additional-clickhouse-macros\\}

#### Вспомогательные макросы для материализации моделей \\{#model-materialization-utility-macros\\}

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

#### Вспомогательный макрос s3Source \\{#s3source-helper-macro\\}

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

#### Поддержка межбазовых макросов \\{#cross-database-macro-support\\}

dbt-clickhouse поддерживает большинство межбазовых макросов, которые теперь входят в состав `dbt Core`, за следующими исключениями:

* SQL‑функция `split_part` реализована в ClickHouse с использованием функции `splitByChar`. Эта функция требует
  использования константной строки в качестве разделителя, поэтому параметр `delimeter`, используемый для этого макроса, будет
  интерпретироваться как строка, а не как имя столбца
* Аналогично, SQL‑функция `replace` в ClickHouse требует константные строки для параметров `old_chars` и `new_chars`,
  поэтому эти параметры будут интерпретироваться как строки, а не имена столбцов при вызове этого макроса.

## Поддержка каталога \\{#catalog-support\\}

### Статус интеграции с dbt Catalog \\{#dbt-catalog-integration-status\\}

В dbt Core v1.10 была добавлена поддержка интеграции с каталогом, которая позволяет адаптерам материализовывать модели во внешних каталогах, управляющих открытыми табличными форматами, такими как Apache Iceberg. **Эта функция пока не реализована нативно в dbt-clickhouse.** Вы можете отслеживать прогресс её реализации в [GitHub issue #489](https://github.com/ClickHouse/dbt-clickhouse/issues/489).

### Поддержка каталогов в ClickHouse \\{#clickhouse-catalog-support\\}

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


### Заметки о временных решениях \\{#benefits-workarounds\\}

Преимущества этих временных решений:

* Вы получите быстрый доступ к различным типам внешних таблиц и внешних каталогов, не дожидаясь нативной интеграции каталога dbt.
* У вас будет бесшовный путь миграции, когда станет доступна нативная поддержка каталогов.

Однако на данный момент есть некоторые ограничения:

* **Ручная настройка:** таблицы Iceberg и базы данных каталогов должны быть созданы в ClickHouse вручную, прежде чем их можно будет использовать в dbt.
* **Отсутствие DDL на уровне каталога:** dbt не может управлять операциями на уровне каталога, такими как создание или удаление таблиц Iceberg во внешних каталогах. Поэтому вы пока не сможете создавать их через коннектор dbt. Возможность создания таблиц с движками Iceberg() может быть добавлена в будущем.
* **Операции записи:** в настоящее время запись в таблицы Iceberg/Data Catalog ограничена. Ознакомьтесь с документацией ClickHouse, чтобы понять, какие возможности доступны.