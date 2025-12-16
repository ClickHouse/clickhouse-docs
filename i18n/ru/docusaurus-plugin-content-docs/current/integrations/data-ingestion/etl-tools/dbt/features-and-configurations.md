---
sidebar_label: 'Возможности и настройки'
slug: /integrations/dbt/features-and-configurations
sidebar_position: 2
description: 'Возможности использования dbt с ClickHouse'
keywords: ['clickhouse', 'dbt', 'возможности']
title: 'Возможности и настройки'
doc_type: 'guide'
---

import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Возможности и настройки {#features-and-configurations}

<ClickHouseSupportedBadge/>

В этом разделе приводится документация по некоторым возможностям использования dbt с ClickHouse.

<TOCInline toc={toc}  maxHeadingLevel={3} />

## Настройки profiles.yml {#profile-yml-configurations}

Чтобы подключиться к ClickHouse из dbt, вам нужно добавить [профиль](https://docs.getdbt.com/docs/core/connect-data-platform/connection-profiles) в файл `profiles.yml`. Профиль ClickHouse должен соответствовать следующему формату:

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


### Схема vs база данных {#schema-vs-database}

Идентификатор relation-модели dbt `database.schema.table` несовместим с ClickHouse, так как ClickHouse не
поддерживает `schema`.
Поэтому мы используем упрощённый вариант `schema.table`, где `schema` — это база данных ClickHouse. Использовать базу данных `default`
не рекомендуется.

### Предупреждение о операторе SET {#set-statement-warning}

Во многих средах использование оператора SET для сохранения настройки ClickHouse для всех запросов DBT ненадёжно
и может приводить к неожиданным сбоям. Это особенно актуально при использовании HTTP‑подключений через балансировщик нагрузки,
распределяющий запросы между несколькими узлами (например, ClickHouse Cloud), хотя в некоторых случаях это может происходить
и с нативными подключениями к ClickHouse. Соответственно, в качестве наилучшей практики мы рекомендуем настраивать необходимые
параметры ClickHouse в свойстве "custom_settings" профиля DBT, вместо того чтобы полагаться на оператор SET в pre-hook,
как это иногда рекомендуют.

### Настройка `quote_columns` {#setting-quote_columns}

Чтобы избежать появления предупреждения, обязательно явно задайте значение для `quote_columns` в файле `dbt_project.yml`. Дополнительную информацию см. в [документации по `quote_columns`](https://docs.getdbt.com/reference/resource-configs/quote_columns).

```yaml
seeds:
  +quote_columns: false  #or `true` if you have CSV column headers with spaces
```


### О кластере ClickHouse {#about-the-clickhouse-cluster}

При использовании кластера ClickHouse необходимо учитывать две вещи:

- Настройку параметра `cluster`.
- Обеспечение согласованности чтения после записи (read-after-write), особенно если вы используете более одного потока (`threads`).

#### Настройка кластера {#cluster-setting}

Параметр `cluster` в профиле позволяет dbt-clickhouse работать с кластером ClickHouse. Если `cluster` задан в профиле, **все модели по умолчанию будут создаваться с директивой `ON CLUSTER`**, за исключением моделей, использующих движок **Replicated**. Это включает:

* Создание базы данных
* Материализации представлений
* Табличные и инкрементальные материализации
* Распределённые материализации

Движки Replicated **не** будут включать директиву `ON CLUSTER`, поскольку они предназначены для управления репликацией внутренне.

Чтобы **отказаться** от создания на кластере для конкретной модели, добавьте конфигурацию `disable_on_cluster`:

```sql
{{ config(
        engine='MergeTree',
        materialized='table',
        disable_on_cluster='true'
    )
}}

```

табличные и инкрементальные материализации с нереплицируемым движком не будут затронуты параметром `cluster` (модель
будет создана только на подключённом узле).

**Совместимость**

Если модель была создана без параметра `cluster`, dbt-clickhouse обнаружит это и выполнит все DDL/DML
без конструкции `on cluster` для этой модели.


#### Согласованность чтения после записи {#read-after-write-consistency}

dbt опирается на модель согласованности чтения после вставки (read-after-insert). Это несовместимо с кластерами ClickHouse с более чем одной репликой, если вы не можете гарантировать, что все операции будут направляться на одну и ту же реплику. В повседневной работе с dbt вы можете не сталкиваться с проблемами, но в зависимости от конфигурации кластера существуют стратегии, позволяющие обеспечить такую гарантию:

- Если вы используете кластер ClickHouse Cloud, вам достаточно установить `select_sequential_consistency: 1` в свойстве `custom_settings` вашего профиля. Дополнительную информацию об этом SETTING можно найти [здесь](/operations/settings/settings#select_sequential_consistency).
- Если вы используете самостоятельно развернутый (self-hosted) кластер, убедитесь, что все запросы dbt отправляются на одну и ту же реплику ClickHouse. Если над ним используется балансировщик нагрузки, попробуйте применить механизм `replica aware routing`/`sticky sessions`, чтобы всегда попадать на одну и ту же реплику. Добавление SETTING `select_sequential_consistency = 1` в кластерах вне ClickHouse Cloud [не рекомендуется](/operations/settings/settings#select_sequential_consistency).

## Общая информация о возможностях {#general-information-about-features}

### Общие конфигурации моделей {#general-model-configurations}

В следующей таблице показаны конфигурации, общие для некоторых из доступных материализаций. Для подробной информации об общих конфигурациях моделей dbt см. [документацию dbt](https://docs.getdbt.com/category/general-configs):

| Option                 | Description                                                                                                                                                                                                                                                                                                          | Default if any        |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| engine                 | Движок таблицы (тип таблицы), который будет использоваться при создании таблиц                                                                                                                                                                                                                                      | `MergeTree()`         |
| order_by               | Кортеж имён столбцов или произвольных выражений. Это позволяет создать небольшой разреженный индекс, который помогает быстрее находить данные.                                                                                                                                                                      | `tuple()`             |
| partition_by           | Партиция — это логическое объединение записей в таблице по заданному критерию. Ключ партиции может быть любым выражением из столбцов таблицы.                                                                                                                                                                       |                       |
| primary_key            | Как и `order_by`, выражение первичного ключа ClickHouse. Если не указано, ClickHouse будет использовать выражение `order_by` в качестве первичного ключа.                                                                                                                                                           |                       |
| settings               | Карта/словарь настроек `TABLE`, которые будут использоваться в DDL-командах, таких как `CREATE TABLE`, для этой модели                                                                                                                                                                                              |                       |
| query_settings         | Карта/словарь пользовательских настроек ClickHouse, которые будут использоваться с командами `INSERT` или `DELETE` для этой модели                                                                                                                                                                                  |                       |
| ttl                    | Выражение TTL, которое будет использоваться для таблицы. Выражение TTL — это строка, с помощью которой задаётся TTL для таблицы.                                                                                                                                                                                     |                       |
| indexes                | Список [индексов пропуска данных](/optimize/skipping-indexes), которые будут созданы. Подробности см. в разделе [О пропускающих индексах](#data-skipping-indexes).                                                                                                                                                 |                       |
| sql_security           | Пользователь ClickHouse, от имени которого выполняется основной запрос представления. [Допустимые значения](/sql-reference/statements/create/view#sql_security): `definer`, `invoker`.                                                                                                                             |                       |
| definer                | Если `sql_security` установлено в `definer`, необходимо указать существующего пользователя или `CURRENT_USER` в предложении `definer`.                                                                                                                                                                              |                       |
| projections            | Список [проекций](/data-modeling/projections), которые будут созданы. Подробности см. в разделе [О проекциях](#projections).                                                                                                                                                                                        |                       |

#### Об индексах пропуска данных {#data-skipping-indexes}

Индексы пропуска данных доступны только для материализации `table`. Чтобы добавить список индексов пропуска данных в таблицу, используйте конфигурацию `indexes`:

```sql
{{ config(
        materialized='table',
        indexes=[{
          'name': 'your_index_name',
          'definition': 'your_column TYPE minmax GRANULARITY 2'
        }]
) }}
```


#### О проекциях {#projections}

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

**Примечание**: В случае distributed таблиц PROJECTION применяется к таблицам `_local`, а не к distributed proxy-таблице.


### Поддерживаемые движки таблиц {#supported-table-engines}

| Тип                   | Подробности                                                                                |
|------------------------|-------------------------------------------------------------------------------------------|
| MergeTree (по умолчанию)    | https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/mergetree/.         |
| HDFS                   | https://clickhouse.com/docs/en/engines/table-engines/integrations/hdfs                    |
| MaterializedPostgreSQL | https://clickhouse.com/docs/en/engines/table-engines/integrations/materialized-postgresql |
| S3                     | https://clickhouse.com/docs/en/engines/table-engines/integrations/s3                      |
| EmbeddedRocksDB        | https://clickhouse.com/docs/en/engines/table-engines/integrations/embedded-rocksdb        |
| Hive                   | https://clickhouse.com/docs/en/engines/table-engines/integrations/hive                    |

**Примечание**: для materialized view поддерживаются все движки семейства *MergeTree.

### Экспериментально поддерживаемые движки таблиц {#experimental-supported-table-engines}

| Тип               | Подробности                                                               |
|-------------------|---------------------------------------------------------------------------|
| Distributed Table | https://clickhouse.com/docs/en/engines/table-engines/special/distributed. |
| Dictionary        | https://clickhouse.com/docs/en/engines/table-engines/special/dictionary   |

Если вы столкнетесь с проблемами при подключении к ClickHouse из dbt при использовании одного из указанных выше движков, пожалуйста, сообщите об ошибке [здесь](https://github.com/ClickHouse/dbt-clickhouse/issues).

### Примечание о настройках модели {#a-note-on-model-settings}

В ClickHouse существует несколько типов и уровней «настроек». В конфигурации модели выше можно задать два таких типа.
`settings` обозначает предложение `SETTINGS`,
используемое в DDL-командах типа `CREATE TABLE/VIEW`, поэтому, как правило, это настройки, специфичные для
конкретного движка таблицы ClickHouse. Новый параметр
`query_settings` используется для добавления предложения `SETTINGS` к запросам `INSERT` и `DELETE`, используемым для материализации модели
(включая инкрементальную материализацию).
В ClickHouse есть сотни настроек, и не всегда очевидно, какие из них относятся к настройкам «таблицы», а какие — к настройкам «пользователя»
(хотя последние, как правило,
доступны в таблице `system.settings`). В общем случае рекомендуется использовать значения по умолчанию, а любое использование этих свойств
должно быть тщательно изучено и протестировано.

### Конфигурация столбца {#column-configuration}

> **_ПРИМЕЧАНИЕ:_** Приведённые ниже параметры конфигурации столбца требуют применения [model contracts](https://docs.getdbt.com/docs/collaborate/govern/model-contracts).

| Параметр | Описание                                                                                                                                                 | Значение по умолчанию (если есть) |
|----------|----------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------|
| codec    | Строковое значение, представляющее аргументы, передаваемые в `CODEC()` в DDL столбца. Например: `codec: "Delta, ZSTD"` будет скомпилирована как `CODEC(Delta, ZSTD)`.    |    
| ttl      | Строковое значение, представляющее [выражение TTL (time-to-live, время жизни)](https://clickhouse.com/docs/guides/developer/ttl), которое определяет правило TTL в DDL столбца. Например: `ttl: ts + INTERVAL 1 DAY` будет скомпилирована как `TTL ts + INTERVAL 1 DAY`. |

#### Пример настройки схемы {#example-of-schema-configuration}

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


#### Добавление сложных типов данных {#adding-complex-types}

dbt автоматически определяет тип данных для каждого столбца, анализируя SQL, используемый для создания модели. Однако в некоторых случаях этот процесс может неточно определить тип данных, что приводит к конфликтам с типами, указанными в свойстве контракта `data_type`. Чтобы избежать этого, рекомендуется использовать функцию `CAST()` в SQL-модели для явного указания нужного типа. Например:

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


## Возможности {#features}

### Материализация: view {#materialization-view}

Модель dbt может быть создана как [представление ClickHouse](/sql-reference/table-functions/view/)
и настроена с использованием следующего синтаксиса:

Файл проекта (`dbt_project.yml`):

```yaml
models:
  <resource-path>:
    +materialized: view
```

Или конфигурационный блок (`models/<model_name>.sql`):

```python
{{ config(materialized = "view") }}
```


### Материализация: table {#materialization-table}

Модель dbt может быть создана в виде [таблицы ClickHouse](/operations/system-tables/tables/) и
настроена с использованием следующего синтаксиса:

Файл проекта (`dbt_project.yml`):

```yaml
models:
  <resource-path>:
    +materialized: table
    +order_by: [ <column-name>, ... ]
    +engine: <engine-type>
    +partition_by: [ <column-name>, ... ]
```

Или конфигурационный блок (`models/<model_name>.sql`):

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


### Материализация: incremental {#materialization-incremental}

Модель таблицы будет перестраиваться при каждом выполнении dbt. Для больших наборов данных или сложных трансформаций это может быть непрактично и чрезвычайно затратно. Чтобы обойти эту проблему и сократить время сборки, модель dbt может быть создана как инкрементальная таблица ClickHouse и настроена с использованием следующего синтаксиса:

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

Или блок config в файле `models/<model_name>.sql`:

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


#### Настройки {#incremental-configurations}

Ниже перечислены настройки, характерные для этого типа материализации:

| Option                   | Description                                                                                                                                                                                                                                                       | Required?                                                                            |
|--------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| `unique_key`             | Кортеж имён столбцов, которые однозначно идентифицируют строки. Дополнительные сведения об ограничениях уникальности см. [здесь](https://docs.getdbt.com/docs/build/incremental-models#defining-a-unique-key-optional).                                                                                       | Обязательный параметр. Если не указан, изменённые строки будут добавлены в инкрементальную таблицу дважды. |
| `inserts_only`           | Устарел в пользу инкрементальной стратегии `append`, которая работает аналогичным образом. Если для инкрементальной модели установлено значение True, инкрементальные обновления будут вставляться напрямую в целевую таблицу без создания промежуточной таблицы. Если установлен `inserts_only`, `incremental_strategy` игнорируется. | Необязательный параметр (по умолчанию: `False`)                                                          |
| `incremental_strategy`   | Стратегия, используемая для инкрементальной материализации. Поддерживаются `delete+insert`, `append`, `insert_overwrite` и `microbatch`. Дополнительные сведения о стратегиях см. [здесь](/integrations/dbt/features-and-configurations#incremental-model-strategies). | Необязательный параметр (по умолчанию: `default`)                                                        |
| `incremental_predicates` | Дополнительные условия, применяемые к инкрементальной материализации (применяются только для стратегии `delete+insert`).                                                                                                                                                                                    | Необязательный параметр                      

#### Стратегии инкрементальных моделей {#incremental-model-strategies}

`dbt-clickhouse` поддерживает три стратегии инкрементальных моделей.

##### Стратегия по умолчанию (устаревшая) {#default-legacy-strategy}

Исторически ClickHouse лишь ограниченно поддерживал операции обновления и удаления в виде асинхронных «мутаций».
Чтобы эмулировать ожидаемое поведение dbt,
dbt-clickhouse по умолчанию создаёт новую временную таблицу, содержащую все незатронутые (не удалённые, не изменённые) «старые»
записи, а также все новые или обновлённые записи,
а затем заменяет (swap) эту временную таблицу или обменивает её с существующим инкрементальным relation этой модели. Это единственная стратегия,
которая сохраняет исходный relation, если что-то
идёт не так до завершения операции; однако, поскольку она предполагает полное копирование исходной таблицы, её выполнение может быть довольно
затратным и медленным.

##### Стратегия Delete+Insert {#delete-insert-strategy}

ClickHouse добавил «легковесное удаление» как экспериментальную функцию в версии 22.8. Легковесное удаление
значительно быстрее, чем операции ALTER TABLE ... DELETE,
поскольку не требует перезаписи частей данных ClickHouse. Инкрементальная стратегия `delete+insert`
использует легковесное удаление для реализации
инкрементальных материализаций, которые работают значительно лучше, чем «устаревшая» стратегия. Однако при использовании
этой стратегии есть важные нюансы:

- Легковесное удаление должно быть включено на вашем сервере ClickHouse с помощью настройки
  `allow_experimental_lightweight_delete=1`, либо вы
  должны установить `use_lw_deletes=true` в своём профиле (что включит эту настройку для ваших dbt-сессий)
- Легковесное удаление сейчас готово к использованию в продакшене, но на версиях ClickHouse ранее 23.3 могут возникать
  проблемы с производительностью и другие проблемы.
- Эта стратегия работает непосредственно с затронутой таблицей/отношением (без создания каких-либо промежуточных или
  временных таблиц), поэтому, если во время операции возникнет проблема,
  данные в инкрементальной модели, скорее всего, окажутся в некорректном состоянии
- При использовании легковесного удаления dbt-clickhouse включает настройку `allow_nondeterministic_mutations`. В
  некоторых очень редких случаях при использовании недетерминированных incremental_predicates
  это может привести к состоянию гонки для обновлённых/удалённых элементов (и соответствующим сообщениям в журналах
  ClickHouse). Чтобы гарантировать согласованные результаты,
  инкрементальные предикаты должны включать только подзапросы к данным, которые не будут изменяться во время
  инкрементальной материализации.

##### Стратегия Microbatch (требуется dbt-core >= 1.9) {#microbatch-strategy}

Инкрементальная стратегия `microbatch` доступна в dbt-core начиная с версии 1.9 и предназначена для эффективной обработки крупных преобразований временных рядов. В dbt-clickhouse она основана на существующей инкрементальной стратегии `delete_insert`, разбивая инкрементальную загрузку на заранее определённые батчи временных рядов на основе конфигураций модели `event_time` и `batch_size`.

Помимо обработки крупных преобразований, microbatch предоставляет возможность:

- [Повторно обрабатывать неудавшиеся батчи](https://docs.getdbt.com/docs/build/incremental-microbatch#retry).
- Автоматически определять [параллельное выполнение батчей](https://docs.getdbt.com/docs/build/parallel-batch-execution).
- Исключить необходимость сложной условной логики при [дозагрузке (backfilling)](https://docs.getdbt.com/docs/build/incremental-microbatch#backfills).

Подробные сведения об использовании microbatch см. в [официальной документации](https://docs.getdbt.com/docs/build/incremental-microbatch).

###### Доступные конфигурации микробатчей {#available-microbatch-configurations}

| Option             | Description                                                                                                                                                                                                                                                                                                                                | Default if any |
|--------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| event_time         | Столбец, указывающий «в какое время произошло событие (строка)». Обязателен для вашей микробатчевой модели и всех прямых родительских моделей, которые должны фильтроваться.                                                                                                                                                              |                |
| begin              | «Начало временного диапазона» для микробатчевой модели. Это отправная точка для любых первоначальных запусков или полных обновлений (full-refresh). Например, микробатчевая модель с дневной гранулярностью, запущенная 2024-10-01 с begin = '2023-10-01, обработает 366 батчей (это високосный год!), а также батч за «сегодня».        |                |
| batch_size         | Гранулярность ваших батчей. Поддерживаемые значения: `hour`, `day`, `month` и `year`.                                                                                                                                                                                                                                                      |                |
| lookback           | Обрабатывает X батчей, предшествующих последней контрольной точке (bookmark), чтобы захватить поздно поступившие записи.                                                                                                                                                                                                                   | 1              |
| concurrent_batches | Переопределяет автоматическое определение dbt для параллельного выполнения батчей. Подробнее см. [настройку параллельных батчей](https://docs.getdbt.com/docs/build/incremental-microbatch#configure-concurrent_batches). Значение true запускает батчи параллельно. Значение false запускает батчи последовательно (один за другим). |                |

##### Стратегия append {#append-strategy}

Эта стратегия заменяет настройку `inserts_only` в предыдущих версиях dbt-clickhouse. Этот подход просто дописывает
новые строки в существующую таблицу или представление.
В результате дубликаты строк не устраняются, и временная или промежуточная таблица не создаётся. Это наиболее быстрый
подход, если дубликаты либо допускаются
в данных, либо исключаются инкрементальным запросом с предложением WHERE или фильтром.

##### Стратегия insert_overwrite (экспериментальная) {#insert-overwrite-strategy}

> [IMPORTANT]  
> В настоящее время стратегия insert_overwrite не полностью работоспособна с распределёнными материализациями.

Стратегия выполняет следующие шаги:

1. Создаёт промежуточную (временную) таблицу с той же структурой, что и инкрементальная модель:
   `CREATE TABLE <staging> AS <target>`.
2. Вставляет только новые записи (полученные с помощью `SELECT`) во временную таблицу.
3. Заменяет в целевой таблице только новые партиции (которые присутствуют во временной таблице).

Такой подход имеет следующие преимущества:

- Работает быстрее, чем стратегия по умолчанию, поскольку не копирует всю таблицу целиком.
- Безопаснее других стратегий, так как не изменяет исходную таблицу, пока операция INSERT не завершится
  успешно: в случае промежуточного сбоя исходная таблица не изменяется.
- Реализует принцип инженерии данных «неизменяемость партиций», что упрощает инкрементальную и параллельную
  обработку данных, откаты и т. д.

Для этой стратегии требуется, чтобы в конфигурации модели был задан `partition_by`. Параметры конфигурации модели,
специфичные для других стратегий, игнорируются.

### Materialization: materialized&#95;view (Экспериментально) {#materialized-view}

Материализация `materialized_view` должна представлять собой оператор `SELECT` из существующей (исходной) таблицы. Адаптер создаст
целевую таблицу с именем модели
и ClickHouse MATERIALIZED VIEW с именем `<model_name>_mv`. В отличие от PostgreSQL, materialized view в ClickHouse
не является «статической» (и
не имеет соответствующей операции REFRESH). Вместо этого она действует как «insert trigger» и будет вставлять новые строки в целевую
таблицу, используя определённое в `SELECT`
«преобразование» в определении view для строк, вставляемых в исходную таблицу. См. [файл с тестом](https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/materialized_view/test_materialized_view.py)
для вводного примера
использования этой функциональности.

ClickHouse предоставляет возможность нескольким materialized view записывать данные в одну и ту же целевую таблицу. Чтобы
поддержать это в dbt-clickhouse, вы можете построить `UNION` в файле модели так, чтобы SQL для каждой из ваших
materialized view был обёрнут в комментарии вида `--my_mv_name:begin` и `--my_mv_name:end`.

Например, следующий пример создаст две materialized view, обе из которых записывают данные в одну и ту же целевую таблицу
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
> При обновлении модели с несколькими materialized view (MV), особенно при переименовании одной из них,
> dbt-clickhouse не удаляет старую MV автоматически. Вместо этого
> вы увидите следующее предупреждение:
> `Warning - Table <previous table name> was detected with the same pattern as model name <your model name> but was not found in this run. In case it is a renamed mv that was previously part of this model, drop it manually (!!!) `


#### Догрузка данных {#data-catch-up}

В настоящее время при создании materialized view (MV) целевая таблица сначала заполняется историческими данными, а уже затем создаётся сама MV.

Другими словами, dbt-clickhouse сначала создаёт целевую таблицу и предварительно загружает в неё исторические данные на основе запроса, определённого для MV. Только после этого шага создаётся MV.

Если вы не хотите предварительно загружать исторические данные при создании MV, вы можете отключить это поведение, установив параметр конфигурации catch-up в значение False:

```python
{{config(
    materialized='materialized_view',
    engine='MergeTree()',
    order_by='(id)',
    catchup=False
)}}
```


#### Refreshable Materialized Views {#refreshable-materialized-views}

Чтобы использовать [Refreshable Materialized View](/materialized-view/refreshable-materialized-view),
при необходимости настройте следующие параметры в вашей модели MV (все эти параметры должны быть заданы внутри
объекта конфигурации refreshable):

| Option                        | Description                                                                                                                                                                   | Required | Default Value |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------- |
| refresh&#95;interval          | Выражение интервала (обязательный параметр)                                                                                                                                   | Yes      |               |
| randomize                     | Выражение рандомизации, будет добавлено после `RANDOMIZE FOR`                                                                                                                 |          |               |
| append                        | Если имеет значение `True`, при каждом обновлении в таблицу вставляются строки без удаления существующих строк. Вставка не является атомарной, как и обычный `INSERT SELECT`. |          | False         |
| depends&#95;on                | Список зависимостей для refreshable MV. Укажите зависимости в следующем формате `{schema}.{view_name}`                                                                        |          |               |
| depends&#95;on&#95;validation | Следует ли проверять существование зависимостей, указанных в `depends_on`. Если зависимость задана без схемы, проверка выполняется в схеме `default`.                         |          | False         |

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


#### Ограничения {#limitations}

* При создании refreshable materialized view (MV) в ClickHouse, у которого есть зависимость, ClickHouse не выдаёт
  ошибку, если указанная зависимость не существует на момент создания. Вместо этого refreshable MV остаётся в
  неактивном состоянии, ожидая выполнения зависимости, прежде чем начать обрабатывать обновления или выполнять
  обновление (refresh). Такое поведение является ожидаемым, но может привести к задержкам в доступности данных, если
  требуемая зависимость не будет своевременно обеспечена. Рекомендуется убедиться, что все зависимости корректно
  определены и существуют до создания refreshable materialized view.
* На сегодняшний день не существует фактической «dbt-связи» между MV и её зависимостями, поэтому порядок создания не
  гарантируется.
* Функциональность refreshable не тестировалась с несколькими MV, направляющими данные в одну и ту же целевую модель.

### Материализация: словарь (экспериментально) {#materialization-dictionary}

См. тесты
в https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/dictionary/test_dictionary.py для
примеров реализации материализаций для словарей ClickHouse

### Материализация: distributed_table (экспериментально) {#materialization-distributed-table}

Distributed таблица создаётся следующим образом:

1. Создаётся временное представление с SQL-запросом, чтобы получить правильную структуру.
2. Создаются пустые локальные таблицы на основе этого представления.
3. Создаётся distributed таблица на основе локальных таблиц.
4. Данные вставляются в distributed таблицу, поэтому они распределяются по сегментам без дублирования.

Примечания:

- `dbt-clickhouse` теперь автоматически добавляет в запросы SETTING `insert_distributed_sync = 1`, чтобы
  последующие операции инкрементальной
  материализации выполнялись корректно. Это может привести к тому, что некоторые вставки в distributed таблицу будут выполняться медленнее, чем
  ожидалось.

#### Пример модели distributed‑таблицы {#distributed-table-model-example}

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


#### Автоматически генерируемые миграции {#distributed-table-generated-migrations}

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


#### Конфигурации {#distributed-table-configurations}

Конфигурации, специфичные для этого типа материализации, перечислены ниже:

| Параметр              | Описание                                                                                                                                                                                                                                                                                                             | Значение по умолчанию |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| sharding_key           | Ключ сегментирования определяет целевой сервер при вставке в таблицу движка `Distributed`. Ключ сегментирования может быть случайным или вычисляться как результат хеш-функции                                                                                                                                      | `rand()`               |

### materialization: distributed_incremental (experimental) {#materialization-distributed-incremental}

Инкрементная модель, основанная на той же идее, что и distributed таблица; основная сложность — корректная обработка всех инкрементных стратегий.

1. _Стратегия Append_ просто вставляет данные в distributed таблицу.
2. _Стратегия Delete+Insert_ создает временную distributed таблицу для работы со всеми данными на каждом сегменте.
3. _Стратегия Default (Legacy)_ создает временные и промежуточные distributed таблицы по той же причине.

Заменяются только таблицы сегментов, так как distributed таблица не хранит данные.
Distributed таблица перезагружается только при включенном режиме full_refresh или при изменении структуры таблицы.

#### Пример модели с распределённой инкрементальной материализацией {#distributed-incremental-model-example}

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


#### Сгенерированные миграции {#distributed-incremental-generated-migrations}

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


### Снимок {#snapshot}

Снимки dbt позволяют фиксировать изменения изменяемой модели во времени. Это, в свою очередь, позволяет выполнять
запросы к моделям в определённый момент времени, когда аналитики могут «вернуться назад во времени» к предыдущему состоянию модели. Эта функциональность
поддерживается коннектором ClickHouse и настраивается с использованием следующего синтаксиса:

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


### Контракты и ограничения {#contracts-and-constraints}

Поддерживаются только контракты с точным соответствием типов столбцов. Например, контракт, в котором столбец имеет тип UInt32, завершится с ошибкой, если модель
вернёт UInt64 или другой целочисленный тип.
В ClickHouse также поддерживаются _только_ ограничения `CHECK` на всю таблицу/модель. Ограничения первичного ключа, внешнего ключа, уникальности и
ограничения CHECK на уровне столбцов не поддерживаются.
(см. документацию ClickHouse по первичным ключам и ключам ORDER BY.)

### Дополнительные макросы ClickHouse {#additional-clickhouse-macros}

#### Вспомогательные макросы для материализации моделей {#model-materialization-utility-macros}

Следующие макросы предоставляются для упрощения создания таблиц и представлений, специфичных для ClickHouse:

- `engine_clause` -- Использует конфигурационное свойство модели `engine` для назначения движка таблицы ClickHouse. dbt-clickhouse
  по умолчанию использует движок `MergeTree`.
- `partition_cols` -- Использует конфигурационное свойство модели `partition_by` для назначения ключа партиционирования в ClickHouse. По
  умолчанию ключ партиционирования не назначается.
- `order_cols` -- Использует конфигурацию модели `order_by` для назначения ключа ORDER BY (сортировки) в ClickHouse. Если не указано,
  ClickHouse будет использовать пустой tuple(), и таблица не будет отсортирована.
- `primary_key_clause` -- Использует конфигурационное свойство модели `primary_key` для назначения первичного ключа ClickHouse. По
  умолчанию первичный ключ задаётся, и ClickHouse будет использовать выражение ORDER BY в качестве первичного ключа.
- `on_cluster_clause` -- Использует свойство профиля `cluster` для добавления выражения `ON CLUSTER` к определённым операциям dbt:
  распределённым материализациям, созданию представлений, созданию баз данных.
- `ttl_config` -- Использует конфигурационное свойство модели `ttl` для назначения выражения TTL таблицы ClickHouse. По умолчанию TTL не
  назначается.

#### Вспомогательный макрос s3Source {#s3source-helper-macro}

Макрос `s3source` упрощает выборку данных ClickHouse напрямую из S3 с помощью табличной функции S3 в ClickHouse.
Он работает,
заполняя параметры табличной функции S3 из именованного конфигурационного словаря (имя словаря должно оканчиваться
на `s3`). Макрос
сначала ищет словарь в профиле `vars`, а затем в конфигурации модели. Словарь может содержать
любые из следующих ключей, используемых для заполнения параметров табличной функции S3:

| Имя аргумента         | Описание                                                                                                                                                                                     |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| bucket                | Базовый URL бакета, например `https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi`. Если протокол не указан, по умолчанию используется `https://`.                           |
| path                  | Путь в S3, который будет использоваться для запроса к таблице, например `/trips_4.gz`. Поддерживаются подстановочные шаблоны (wildcards) S3.                                                |
| fmt                   | Ожидаемый входной формат ClickHouse (например, `TSV` или `CSVWithNames`) для указанных объектов S3.                                                                                          |
| structure             | Структура столбцов данных в бакете в виде списка пар имя/тип данных, например `['id UInt32', 'date DateTime', 'value String']`. Если не указана, ClickHouse автоматически выведет структуру. |
| aws_access_key_id     | Идентификатор ключа доступа S3.                                                                                                                                                              |
| aws_secret_access_key | Секретный ключ S3.                                                                                                                                                                           |
| role_arn              | ARN роли ClickhouseAccess IAM, используемой для безопасного доступа к объектам S3. См. эту [документацию](/cloud/data-sources/secure-s3) для получения дополнительной информации.           |
| compression           | Метод сжатия, используемый для объектов S3. Если не указан, ClickHouse попытается определить сжатие по имени файла.                                                                         |

См.
[S3 test file](https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/clickhouse/test_clickhouse_s3.py)
для примеров использования этого макроса.

#### Поддержка межбазовых макросов {#cross-database-macro-support}

dbt-clickhouse поддерживает большинство межбазовых макросов, которые сейчас входят в `dbt Core`, за следующими исключениями:

* Функция SQL `split_part` реализована в ClickHouse с использованием функции splitByChar. Эта функция требует
  использования константной строки в качестве разделителя, поэтому параметр `delimeter`, используемый для этого макроса,
  будет интерпретироваться как строка, а не как имя столбца.
* Аналогично, функция SQL `replace` в ClickHouse требует константных строк для параметров `old_chars` и `new_chars`,
  поэтому эти параметры будут интерпретироваться как строки, а не как имена столбцов при вызове этого макроса.

## Поддержка каталога {#catalog-support}

### Статус интеграции с каталогом dbt {#dbt-catalog-integration-status}

В dbt Core v1.10 появилась поддержка интеграции с каталогами, которая позволяет адаптерам материализовывать модели во внешние каталоги, управляющие открытыми табличными форматами, такими как Apache Iceberg. **Эта функция ещё не реализована нативно в dbt-clickhouse.** Вы можете отслеживать прогресс её реализации в [задаче GitHub №489](https://github.com/ClickHouse/dbt-clickhouse/issues/489).

### Поддержка каталогов в ClickHouse {#clickhouse-catalog-support}

В ClickHouse недавно появилась нативная поддержка таблиц Apache Iceberg и каталогов данных. Большинство возможностей всё ещё считаются `experimental`, но вы уже можете использовать их, если у вас установлена актуальная версия ClickHouse.

* Вы можете использовать ClickHouse для **выполнения запросов к таблицам Iceberg, хранящимся в объектном хранилище** (S3, Azure Blob Storage, Google Cloud Storage) с помощью [табличного движка Iceberg](/engines/table-engines/integrations/iceberg) и [табличной функции iceberg](/sql-reference/table-functions/iceberg).

* Дополнительно ClickHouse предоставляет [движок базы данных DataLakeCatalog](/engines/database-engines/datalakecatalog), который обеспечивает **подключение к внешним каталогам данных**, включая AWS Glue Catalog, Databricks Unity Catalog, Hive Metastore и REST Catalogs. Это позволяет выполнять запросы к данным в открытых табличных форматах (Iceberg, Delta Lake) напрямую из внешних каталогов без дублирования данных.

### Обходные пути для работы с Iceberg и каталогами {#workarounds-iceberg-catalogs}

Вы можете читать данные из таблиц Iceberg или каталогов в своем проекте dbt, если уже определили их в кластере ClickHouse с помощью описанных выше инструментов. Вы можете использовать функциональность `source` в dbt, чтобы ссылаться на эти таблицы в своих dbt-проектах. Например, если вы хотите получить доступ к своим таблицам в REST Catalog, вы можете:

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


### Заметки о временных решениях {#benefits-workarounds}

Преимущества этих временных решений:

* Вы получите мгновенный доступ к различным типам внешних таблиц и внешним каталогам, не дожидаясь нативной интеграции каталога dbt.
* У вас будет бесшовный путь миграции, когда нативная поддержка каталогов станет доступна.

Но на данный момент есть и некоторые ограничения:

* **Ручная настройка:** таблицы Iceberg и базы данных каталогов должны быть созданы вручную в ClickHouse до того, как их можно будет использовать в dbt.
* **Отсутствие DDL на уровне каталога:** dbt не может управлять операциями на уровне каталога, такими как создание или удаление таблиц Iceberg во внешних каталогах. Поэтому сейчас вы не сможете создавать их из коннектора dbt. Возможность создания таблиц с движками Iceberg() может быть добавлена в будущем.
* **Операции записи:** в настоящее время возможности записи в таблицы Iceberg/Data Catalog ограничены. Ознакомьтесь с документацией ClickHouse, чтобы понять, какие варианты доступны.