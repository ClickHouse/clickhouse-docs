---
'sidebar_label': 'Функции и Конфигурации'
'slug': '/integrations/dbt/features-and-configurations'
'sidebar_position': 2
'description': 'Функции для использования dbt с ClickHouse'
'keywords':
- 'clickhouse'
- 'dbt'
- 'features'
'title': 'Функции и Конфигурации'
'doc_type': 'guide'
---
import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Функции и конфигурации

<ClickHouseSupportedBadge/>

В этом разделе представлена документация о некоторых функциях, доступных для dbt с ClickHouse.

<TOCInline toc={toc}  maxHeadingLevel={3} />
## Конфигурации profile.yml {#profile-yml-configurations}

Чтобы подключиться к ClickHouse из dbt, вам нужно добавить [профиль](https://docs.getdbt.com/docs/core/connect-data-platform/connection-profiles) в файл `profiles.yml`. Профиль ClickHouse соответствует следующему синтаксису:

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

      # Native (clickhouse-driver) connection settings
      sync_request_timeout: [5] # Timeout for server ping
      compress_block_size: [1048576] # Compression block size if compression is enabled
```
### Схема vs База данных {#schema-vs-database}

Идентификатор отношения модели dbt `database.schema.table` несовместим с Clickhouse, так как Clickhouse не поддерживает `schema`. Поэтому мы используем упрощенный подход `schema.table`, где `schema` — это база данных Clickhouse. Использовать базу данных `default` не рекомендуется.
### Предупреждение для оператора SET {#set-statement-warning}

Во многих окружениях использование оператора SET для сохранения настройки ClickHouse на протяжении всех запросов DBT ненадежно и может вызвать неожиданное поведение. Это особенно актуально при использовании HTTP-соединений через балансировщик нагрузки, который распределяет запросы между несколькими узлами (например, ClickHouse cloud), хотя в некоторых случаях это также может произойти с нативными соединениями ClickHouse. Соответственно, рекомендуется настраивать любые необходимые параметры ClickHouse в свойстве "custom_settings" профиля DBT в качестве лучшей практики, вместо того, чтобы полагаться на предварительный оператор "SET", как это иногда предлагалось.
### Установка `quote_columns` {#setting-quote_columns}

Чтобы избежать предупреждения, убедитесь, что вы явно указали значение для `quote_columns` в вашем `dbt_project.yml`. Смотрите [документацию по quote_columns](https://docs.getdbt.com/reference/resource-configs/quote_columns) для получения дополнительной информации.

```yaml
seeds:
  +quote_columns: false  #or `true` if you have CSV column headers with spaces
```
### О кластере ClickHouse {#about-the-clickhouse-cluster}

Настройка `cluster` в профиле позволяет dbt-clickhouse работать с кластером ClickHouse. Если в профиле указано `cluster`, **все модели будут созданы с предложением `ON CLUSTER`** по умолчанию — за исключением тех, которые используют движок **Replicated**. Это включает в себя:

- Создание базы данных
- Материализации представлений
- Материализации таблиц и инкрементные материализации
- Распределенные материализации

Движки Replicated **не** будут включать предложение `ON CLUSTER`, так как они предназначены для внутреннего управления репликацией.

Чтобы **отказаться** от создания на основе кластера для конкретной модели, добавьте конфигурацию `disable_on_cluster`:

```sql
{{ config(
        engine='MergeTree',
        materialized='table',
        disable_on_cluster='true'
    )
}}

```

Материализации таблиц и инкрементные материализации с нереплицированным движком не будут затронуты настройкой `cluster` (модель будет создана только на подключенном узле).
#### Совместимость {#compatibility}

Если модель была создана без настройки `cluster`, dbt-clickhouse обнаружит эту ситуацию и выполнит все DDL/DML без условия `on cluster` для этой модели.
## Общая информация о функциях {#general-information-about-features}
### Общие конфигурации таблиц {#general-table-configurations}

| Опция                 | Описание                                                                                                                                                                                                                                                                                                          | По умолчанию |
|----------------------| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| engine               | Движок таблицы (тип таблицы), используемый при создании таблиц                                                                                                                                                                                                                                              | `MergeTree()`  |
| order_by             | Кортеж имен колонок или произвольных выражений. Это позволяет создать небольшой разреженный индекс, который помогает быстрее находить данные.                                                                                                                                                                | `tuple()`      |
| partition_by         | Партиция — это логическое объединение записей в таблице по заданному критерию. Ключ партиционирования может быть любым выражением из колонок таблицы.                                                                                                                                                        |                |
| sharding_key         | Ключ шардирования определяет целевой сервер при вставке в таблицу распределенного движка. Ключ шардирования может быть случайным или результатом хеш-функции                                                                                                                                                      | `rand()`      |
| primary_key          | Как order_by, выражение первичного ключа ClickHouse. Если не указано, ClickHouse будет использовать выражение order_by в качестве первичного ключа                                                                                                                                                                  |                |
| unique_key           | Кортеж имен колонок, которые уникально идентифицируют строки. Используется с инкрементными моделями для обновлений.                                                                                                                                                                                          |                |
| settings             | Карта/словарь "TABLE" настроек, которые будут использоваться для DDL-запросов, таких как 'CREATE TABLE' с этой моделью                                                                                                                                                                                   |                |
| query_settings       | Карта/словарь пользовательских настроек ClickHouse, которые будут использоваться с операторами `INSERT` или `DELETE` в сочетании с этой моделью                                                                                                                                                                  |                |
| ttl                  | Выражение TTL, которое будет использоваться с таблицей. Выражение TTL — это строка, которую можно использовать для указания TTL для таблицы.                                                                                                                                                                   |                |
| indexes              | Список индексов для создания, доступный только для материализации `table`. Примеры можно посмотреть в ([#397](https://github.com/ClickHouse/dbt-clickhouse/pull/397))                                                                                                                                                     |                |
| sql_security         | Позволяет указать, какого пользователя ClickHouse использовать при выполнении подлежащего запроса представления. [`SQL SECURITY`](https://clickhouse.com/docs/sql-reference/statements/create/view#sql_security) имеет два законных значения: `definer` `invoker`.                                                      |                |
| definer              | Если `sql_security` было установлено на `definer`, вы должны указать любого существующего пользователя или `CURRENT_USER` в разделе `definer`.                                                                                                                                                               |                |
### Поддерживаемые движки таблиц {#supported-table-engines}

| Тип                   | Подробности                                                                                   |
|----------------------|-------------------------------------------------------------------------------------------|
| MergeTree (по умолчанию) | https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/mergetree/.         |
| HDFS                 | https://clickhouse.com/docs/en/engines/table-engines/integrations/hdfs                    |
| MaterializedPostgreSQL | https://clickhouse.com/docs/en/engines/table-engines/integrations/materialized-postgresql |
| S3                   | https://clickhouse.com/docs/en/engines/table-engines/integrations/s3                      |
| EmbeddedRocksDB      | https://clickhouse.com/docs/en/engines/table-engines/integrations/embedded-rocksdb        |
| Hive                 | https://clickhouse.com/docs/en/engines/table-engines/integrations/hive                    |
### Экспериментальные поддерживаемые движки таблиц {#experimental-supported-table-engines}

| Тип                      | Подробности                                                                   |
|-------------------------|-----------------------------------------------------------------------------|
| Дистрибутивная таблица | https://clickhouse.com/docs/en/engines/table-engines/special/distributed. |
| Словарь                  | https://clickhouse.com/docs/en/engines/table-engines/special/dictionary   |

Если вы столкнетесь с проблемами при подключении к ClickHouse из dbt с одним из вышеуказанных движков, пожалуйста, сообщите об этом [здесь](https://github.com/ClickHouse/dbt-clickhouse/issues).
### Заметка о настройках модели {#a-note-on-model-settings}

ClickHouse имеет несколько типов/уровней "настроек". В конфигурации модели выше настраиваются два типа из них. `settings` означает клаузу `SETTINGS`, используемую в запросах типа `CREATE TABLE/VIEW`, так что это обычно настройки, специфичные для конкретного движка таблиц ClickHouse. Новая `query_settings` используется для добавления клаузы `SETTINGS` в запросы `INSERT` и `DELETE`, используемые для материализации моделей (включая инкрементные материализации). В ClickHouse сотни настроек, и не всегда ясно, какая из них является "табличной" настройкой, а какая - "пользовательской" (хотя последние обычно доступны в таблице `system.settings`). В общем, рекомендуется использовать настройки по умолчанию, и любое использование этих свойств должно быть тщательно исследовано и протестировано.
### Конфигурация колонок {#column-configuration}

> **_ПРИМЕЧАНИЕ:_** Опции конфигурации колонок ниже требуют соблюдения [контрактов модели](https://docs.getdbt.com/docs/collaborate/govern/model-contracts).

| Опция | Описание                                                                                                                                                | По умолчанию |
|--------|------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| codec  | Строка, состоящая из аргументов, переданных в `CODEC()` в DDL колонки. Например: `codec: "Delta, ZSTD"` будет скомпилировано как `CODEC(Delta, ZSTD)`.    |    
| ttl    | Строка, состоящая из [выражения TTL (время жизни)](https://clickhouse.com/docs/guides/developer/ttl), которое определяет правило TTL в DDL колонки. Например: `ttl: ts + INTERVAL 1 DAY` будет скомпилировано как `TTL ts + INTERVAL 1 DAY`. |
#### Пример {#example}

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
## Функции {#features}
### Материализация: представление {#materialization-view}

Модель dbt может быть создана как [представление ClickHouse](https://clickhouse.com/docs/en/sql-reference/table-functions/view/) и настроена с использованием следующего синтаксиса:

Файл проекта (`dbt_project.yml`):
```yaml
models:
  <resource-path>:
    +materialized: view
```

Или блок конфигурации (`models/<model_name>.sql`):
```python
{{ config(materialized = "view") }}
```
### Материализация: таблица {#materialization-table}

Модель dbt может быть создана как [таблица ClickHouse](https://clickhouse.com/docs/en/operations/system-tables/tables/) и настроена с использованием следующего синтаксиса:

Файл проекта (`dbt_project.yml`):
```yaml
models:
  <resource-path>:
    +materialized: table
    +order_by: [ <column-name>, ... ]
    +engine: <engine-type>
    +partition_by: [ <column-name>, ... ]
```

Или блок конфигурации (`models/<model_name>.sql`):
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
### Материализация: инкрементная {#materialization-incremental}

Модель таблицы будет пересоздаваться для каждого выполнения dbt. Это может быть непрактично и чрезвычайно затратно для больших наборов результатов или сложных преобразований. Чтобы решить эту проблему и сократить время сборки, модель dbt может быть создана как инкрементная таблица ClickHouse и настроена с использованием следующего синтаксиса:

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

Или блок конфигурации в `models/<model_name>.sql`:
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
#### Конфигурации {#configurations}
Конфигурации, специфичные для этого типа материализации, перечислены ниже:

| Опция                   | Описание                                                                                                                                                                                                                                                       | Обязательно?                                                                            |
|------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| `unique_key`           | Кортеж имен колонок, которые уникально идентифицируют строки. Для получения дополнительных сведений о ограничениях уникальности смотрите [здесь](https://docs.getdbt.com/docs/build/incremental-models#defining-a-unique-key-optional).                                                                                       | Обязательно. Если не предоставлено, измененные строки будут добавлены дважды в инкрементную таблицу. |
| `inserts_only`         | Он был устаревшим в пользу `append` инкрементной стратегии, которая работает аналогичным образом. Если установлено в True для инкрементной модели, инкрементные обновления будут вставлены непосредственно в целевую таблицу без создания промежуточной таблицы. Если `inserts_only` установлен, `incremental_strategy` игнорируется. | Необязательно (по умолчанию: `False`)                                                          |
| `incremental_strategy` | Стратегия, используемая для инкрементной материализации. Поддерживаются `delete+insert`, `append`, `insert_overwrite` или `microbatch`. Для более подробной информации о стратегиях смотрите [здесь](/integrations/dbt/features-and-configurations#incremental-model-strategies) | Необязательно (по умолчанию: 'default')                                                        |
| `incremental_predicates` | Дополнительные условия, которые будут применены к инкрементной материализации (применяются только к стратегии `delete+insert`.                                                                                                                                                                                    | Необязательно
#### Стратегии инкрементной модели {#incremental-model-strategies}

`dbt-clickhouse` поддерживает три стратегии инкрементной модели.
##### Стратегия по умолчанию (наследие) {#default-legacy-strategy}

Исторически ClickHouse имел только ограниченную поддержку обновлений и удалений в виде асинхронных "мутаций". Чтобы воспроизвести ожидаемое поведение dbt, по умолчанию dbt-clickhouse создает новую временную таблицу, содержащую все неизмененные (не удаленные, не измененные) "старые" записи, а также любые новые или обновленные записи, и затем обменивает эту временную таблицу с существующим отношением инкрементной модели. Это единственная стратегия, которая сохраняет исходное отношение, если что-то пойдет не так до завершения операции; однако, поскольку это требует полной копии исходной таблицы, это может быть довольно дорого и медленно в выполнении.
##### Стратегия Delete+Insert {#delete-insert-strategy}

ClickHouse добавил "легковесные удаления" как экспериментальную функцию в версии 22.8. Легковесные удаления значительно быстрее, чем операции ALTER TABLE ... DELETE, потому что они не требуют переписывания частей данных ClickHouse. Инкрементная стратегия `delete+insert` использует легковесные удаления для реализации инкрементных материализаций, которые работают значительно лучше, чем стратегия "наследия". Однако существуют важные предостережения при использовании этой стратегии:

- Легковесные удаления должны быть включены на вашем сервере ClickHouse с помощью настройки `allow_experimental_lightweight_delete=1` или вы должны установить `use_lw_deletes=true` в вашем профиле (что включит эту настройку для ваших сессий dbt).
- Легковесные удаления теперь готовы к производству, но могут возникнуть проблемы с производительностью и других аспектов в версиях ClickHouse, предшествующих 23.3.
- Эта стратегия работает напрямую с затронутой таблицей/отношением (без создания промежуточных или временных таблиц), поэтому, если возникает проблема в процессе выполнения, данные в инкрементной модели, вероятно, окажутся в недопустимом состоянии.
- При использовании легковесных удалений dbt-clickhouse включает настройку `allow_nondeterministic_mutations`. В некоторых очень редких случаях использование недетерминированных `incremental_predicates` может привести к состоянию гонки для обновленных/удаленных элементов (и связанным с ними сообщениям в журналах ClickHouse). Чтобы обеспечить консистентные результаты, инкрементные предикаты должны включать только подзапросы на данные, которые не будут изменены в процессе инкрементной материализации.
##### Стратегия Microbatch (Требуется dbt-core >= 1.9) {#microbatch-strategy}

Инкрементная стратегия `microbatch` является функцией dbt-core с версии 1.9, предназначенной для эффективной обработки больших преобразований данных временных рядов. В dbt-clickhouse она построена на основе существующей инкрементной стратегии `delete_insert`, разбивая прирост на заранее определенные временные партии на основе конфигураций `event_time` и `batch_size`.

Кроме обработки крупных преобразований, microbatch предоставляет возможность:
- [Обрабатывать неудачные партии](https://docs.getdbt.com/docs/build/incremental-microbatch#retry).
- Автоопределять [параллельное выполнение партий](https://docs.getdbt.com/docs/build/parallel-batch-execution).
- Устранить необходимость в сложной условной логике в [заполнении](https://docs.getdbt.com/docs/build/incremental-microbatch#backfills).

Для подробного использования microbatch обращайтесь к [официальной документации](https://docs.getdbt.com/docs/build/incremental-microbatch).
###### Доступные конфигурации Microbatch {#available-microbatch-configurations}

| Опция             | Описание                                                                                                                                                                                                                                                                                                                                | По умолчанию |
|--------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| event_time         | Колонка, указывающая "в какое время произошла запись". Обязательно для вашей модели microbatch и любых прямых родителей, которые должны быть отфильтрованы.                                                                                                                                                                       |                |
| begin              | "начало времени" для модели microbatch. Это отправная точка для любых начальных или полных построек. Например, модель microbatch с дневным интервалом, запущенная 2024-10-01 с begin = '2023-10-01, обработает 366 партий (это високосный год!) плюс партию для "сегодня".                                                         |                |
| batch_size         | Гранулярность ваших партий. Поддерживаемые значения: `hour`, `day`, `month`, и `year`                                                                                                                                                                                                                                                   |                |
| lookback           | Обработка X партий до последнего закладки, чтобы захватить записи, прибывающие с опозданием.                                                                                                                                                                                                                                          | 1              |
| concurrent_batches | Переопределяет автоопределение dbt для одновременного выполнения партий (в одно и то же время). Узнайте больше о [конфигурации параллельных партий](https://docs.getdbt.com/docs/build/incremental-microbatch#configure-concurrent_batches). Установка в true запускает партии одновременно (параллельно). false запуск партий последовательно (одна за другой). |                |
##### Стратегия Append {#append-strategy}

Эта стратегия заменяет настройку `inserts_only` в предыдущих версиях dbt-clickhouse. Этот подход просто добавляет новые строки к существующему отношению. В результате дублирующие строки не исключаются, и нет временной или промежуточной таблицы. Это самый быстрый подход, если дубликаты либо разрешены в данных, либо исключены с помощью условия WHERE/фильтра инкрементного запроса.
##### Стратегия insert_overwrite (Экспериментальная) {#insert-overwrite-strategy}

> [ВАЖНО]  
> В настоящее время стратегия insert_overwrite не полностью функциональна с распределенными материализациями.

Выполняет следующие шаги:

1. Создает временную (промежуточную) таблицу с той же структурой, что и отношение инкрементной модели: `CREATE TABLE <staging> AS <target>`.
2. Вставляет только новые записи (созданные с помощью `SELECT`) в промежуточную таблицу.
3. Заменяет только новые партиции (присутствующие в промежуточной таблице) в целевой таблице.

Этот подход имеет следующие преимущества:

- Он быстрее, чем стратегия по умолчанию, потому что не копирует всю таблицу.
- Он надежнее других стратегий, потому что не изменяет исходную таблицу, пока операция INSERT не завершится успешно: в случае промежуточного сбоя исходная таблица не изменяется.
- Он реализует "иммутабельность партиций" как лучшую практику в области обработки данных. Что упрощает инкрементную и параллельную обработку данных, откаты и т. д.

Стратегия требует указания `partition_by` в конфигурации модели. Игнорирует все остальные параметры, специфичные для стратегии модели.
### Материализация: materialized_view (Экспериментальная) {#materialized-view}

Материализация `materialized_view` должна быть `SELECT` из существующей (исходной) таблицы. Адаптер создаст целевую таблицу с именем модели и материаловое представление ClickHouse с именем `<model_name>_mv`. В отличие от PostgreSQL, материализованное представление ClickHouse не является "статичным" (и не имеет соответствующей операции REFRESH). Вместо этого оно выполняет функцию "триггера вставки" и будет вставлять новые строки в целевую таблицу, используя определенное `SELECT` "преобразование" в определении представления для строк, вставленных в исходную таблицу. Смотрите [тестовый файл](https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/materialized_view/test_materialized_view.py) для введения в то, как использовать эту функциональность.

Clickhouse предоставляет возможность того, чтобы более одного материализованного представления записывало записи в одну и ту же целевую таблицу. Чтобы поддержать это в dbt-clickhouse, вы можете построить `UNION` в вашем файле модели, так чтобы SQL для каждого из ваших материалов было обернуто в комментарии вида `--my_mv_name:begin` и `--my_mv_name:end`.

Например, следующее создаст два материализованных представления, которые будут записывать данные в одну и ту же конечную таблицу. Имена материализованных представлений примут форму `<model_name>_mv1` и `<model_name>_mv2` :

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
> При обновлении модели с несколькими материализованными представлениями (MVs), особенно когда переименовывается одно из имен MV, dbt-clickhouse не автоматически удаляет старый MV. Вместо этого вы получите следующее предупреждение:
`Предупреждение - Таблица <предыдущее имя таблицы> была обнаружена с тем же шаблоном, что и имя модели <ваше имя модели>, но не была найдена в этом запуске. Если это переименованный mv, который ранее был частью этой модели, удалите его вручную (!!!) `
#### Достижение данных {#data-catch-up}

В настоящее время, при создании материализованного представления (MV), целевая таблица сначала заполняется историческими данными перед созданием самого MV.

Другими словами, dbt-clickhouse изначально создает целевую таблицу и предварительно заполняет ее историческими данными на основе запроса, определенного для MV. Только после этого шага создается MV.

Если вы предпочитаете не предварительно загружать исторические данные во время создания MV, вы можете отключить это поведение, установив конфигурацию catch-up в False:

```python
{{config(
    materialized='materialized_view',
    engine='MergeTree()',
    order_by='(id)',
    catchup=False
)}}
```
#### Обновляемые материализованные представления {#refreshable-materialized-views}

Чтобы использовать [обновляемое материализованное представление](https://clickhouse.com/docs/en/materialized-view/refreshable-materialized-view), пожалуйста, настройте следующие конфигурации по мере необходимости в вашей модели MV (все эти конфигурации предполагается установить внутри объекта конфигурации обновляемости):

| Опция                | Описание                                                                                                                                                              | Обязательно | Значение по умолчанию |
|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|---------------|
| refresh_interval      | Интервал для клаузы (обязательный)                                                                                                                                           | Да      |               |
| randomize             | Клаузу рандомизации, которая появится после `RANDOMIZE FOR`                                                                                                              |          |               |
| append                | Если установлено в `True`, каждое обновление вставляет строки в таблицу без удаления существующих строк. Вставка не является атомарной, как и обычный INSERT SELECT.                  |          | False         |
| depends_on            | Список зависимостей для обновляемого mv. Пожалуйста, предоставьте зависимости в следующем формате `{schema}.{view_name}`                                               |          |               |
| depends_on_validation | Нужно ли проверять наличие зависимостей, указанных в `depends_on`. Если зависимость не содержит схемы, проверка происходит на схему `default`                           |          | False         |

Пример конфигурации для обновляемого материализованного представления:

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

* При создании обновляемого материализованного представления (MV) в ClickHouse, которое имеет зависимость, ClickHouse не выдаст ошибку, если указанная зависимость не существует на момент создания. Вместо этого обновляемый MV остается в неактивном состоянии, дожидаясь, пока зависимость будет удовлетворена, прежде чем начнет обрабатывать обновления или обновление.
  Это поведение предопределено, но может привести к задержкам в доступности данных, если требуемая зависимость не будет быстро решена. Пользователям рекомендуется убедиться, что все зависимости правильно определены и существуют перед созданием обновляемого материализованного представления.
* На сегодняшний день нет фактической "связи dbt" между mv и его зависимостями, поэтому порядок создания не гарантирован.
* Функция обновляемости не была протестирована с несколькими mv, указывающими на одну и ту же целевую модель.
### Материализация: словарь (экспериментальная) {#materialization-dictionary}

Смотрите тесты в https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/dictionary/test_dictionary.py для примеров того, как реализовать материализации для словарей ClickHouse.
### Материализация: распределенная таблица (экспериментальная) {#materialization-distributed-table}

Распределенная таблица создается следующим образом:

1. Создает временное представление с sql-запросом для получения нужной структуры.
2. Создает пустые локальные таблицы на основе представления.
3. Создает распределенную таблицу на основе локальных таблиц.
4. Данные вставляются в распределенную таблицу, таким образом они распределяются по шартам без дублирования.

Примечания:
- Запросы dbt-clickhouse теперь автоматически включают настройку `insert_distributed_sync = 1`, чтобы обеспечить корректное выполнение последующих инкрементных операций материализации. Это может привести к тому, что некоторые вставки в распределенную таблицу будут выполняться медленнее, чем ожидалось.
#### Пример модели распределенной таблицы {#distributed-table-model-example}

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
#### Сгенерированные миграции {#distributed-table-generated-migrations}

```sql
CREATE TABLE db.table_local on cluster cluster (
    `id` UInt64,
    `created_at` DateTime,
    `item` String
)
    ENGINE = ReplacingMergeTree
    ORDER BY (id, created_at)
    SETTINGS index_granularity = 8192;

CREATE TABLE db.table on cluster cluster (
    `id` UInt64,
    `created_at` DateTime,
    `item` String
)
    ENGINE = Distributed ('cluster', 'db', 'table_local', cityHash64(id));
```
### Материализация: распределенная инкрементная (экспериментальная) {#materialization-distributed-incremental}

Инкрементная модель основана на той же идее, что и распределенная таблица, основная сложность заключается в корректной обработке всех инкрементных стратегий.

1. _Стратегия Append_ просто вставляет данные в распределенную таблицу.
2. _Стратегия Delete+Insert_ создает распределенную временную таблицу для работы со всеми данными на каждом шарде.
3. _Стратегия по умолчанию (наследия)_ создает распределенные временные и промежуточные таблицы по той же причине.

Только таблицы шарда заменяются, поскольку распределенная таблица не хранит данные.
Распределенная таблица перезагружается только тогда, когда режим полной перезагрузки включен или структура таблицы могла измениться.
#### Сгенерированные миграции {#distributed-incremental-generated-migrations}

```sql
CREATE TABLE db.table_local on cluster cluster (
    `id` UInt64,
    `created_at` DateTime,
    `item` String
)
    ENGINE = MergeTree
    SETTINGS index_granularity = 8192;

CREATE TABLE db.table on cluster cluster (
    `id` UInt64,
    `created_at` DateTime,
    `item` String
)
    ENGINE = Distributed ('cluster', 'db', 'table_local', cityHash64(id));
```
### Снимок {#snapshot}

Снимки dbt позволяют фиксировать изменения в изменяемой модели с течением времени. Это, в свою очередь, позволяет выполнять запросы в определённый момент времени по моделям, где аналитики могут «смотреть назад во времени» на предыдущее состояние модели. Эта функциональность поддерживается соединителем ClickHouse и настраивается с использованием следующего синтаксиса:

Конфигурационный блок в `snapshots/<model_name>.sql`:
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

Для получения дополнительной информации о конфигурации, ознакомьтесь со страницей справки по [конфигурациям снимков](https://docs.getdbt.com/docs/build/snapshots#snapshot-configs).
### Контракты и ограничения {#contracts-and-constraints}

Поддерживаются только контракты с точными типами колонок. Например, контракт с типом колонки UInt32 завершится неудачей, если модель вернёт тип UInt64 или другой целочисленный тип. 
ClickHouse также поддерживает _только_ ограничения `CHECK` для всей таблицы/модели. Ограничения по первичному ключу, внешнему ключу, уникальности и на уровне колонок CHECK не поддерживаются. 
(См. документацию ClickHouse о первичных/порядковых ключах.)
### Дополнительные макросы ClickHouse {#additional-clickhouse-macros}
#### Макросы утилиты материализации моделей {#model-materialization-utility-macros}

Следующие макросы включены для упрощения создания специфичных для ClickHouse таблиц и представлений:

- `engine_clause` -- Использует свойство конфигурации модели `engine` для назначения движка таблицы ClickHouse. dbt-clickhouse использует движок `MergeTree` по умолчанию.
- `partition_cols` -- Использует свойство конфигурации модели `partition_by` для назначения ключа партиции ClickHouse. По умолчанию ключ партиции не назначен.
- `order_cols` -- Использует конфигурацию модели `order_by` для назначения ключа сортировки/порядка ClickHouse. Если не указано, ClickHouse будет использовать пустой кортеж() и таблица не будет отсортирована.
- `primary_key_clause` -- Использует свойство конфигурации модели `primary_key` для назначения первичного ключа ClickHouse. По умолчанию первичный ключ устанавливается, и ClickHouse будет использовать клаузу сортировки как первичный ключ.
- `on_cluster_clause` -- Использует свойство профиля `cluster` для добавления к определённым операциям dbt клаузу `ON CLUSTER`: распределённые материализации, создание представлений, создание баз данных.
- `ttl_config` -- Использует свойство конфигурации модели `ttl` для назначения выражения TTL таблицы ClickHouse. По умолчанию TTL не назначен.
#### Макрос-утилита s3Source {#s3source-helper-macro}

Макрос `s3source` упрощает процесс выбора данных ClickHouse непосредственно из S3 с использованием функции таблицы ClickHouse S3. Он работает, заполняя параметры функции таблицы S3 из именованного словаря конфигурации (имя словаря должно заканчиваться на `s3`). Макрос сначала ищет словарь в `vars` профиля, а затем в конфигурации модели. Словарь может содержать любые из следующих ключей, используемых для заполнения параметров функции таблицы S3:

| Имя аргумента        | Описание                                                                                                                                                                                   |
|----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| bucket               | Базовый URL корзины, например, `https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi`. Предполагается `https://`, если протокол не указан.                                 |
| path                 | Путь S3 для выполнения запроса таблицы, например, `/trips_4.gz`. Поддерживаются подстановочные знаки S3.                                                                                 |
| fmt                  | Ожидаемый входной формат ClickHouse (например, `TSV` или `CSVWithNames`) для ссылочных объектов S3.                                                                                     |
| structure            | Структура колонок данных в корзине, в виде списка пар имя/тип данных, например, `['id UInt32', 'date DateTime', 'value String']`. Если не предоставлено, ClickHouse выведет структуру. |
| aws_access_key_id    | Идентификатор ключа доступа S3.                                                                                                                                                           |
| aws_secret_access_key | Секретный ключ S3.                                                                                                                                                                        |
| role_arn             | ARN роли IAM ClickhouseAccess, используемой для безопасного доступа к объектам S3. Дополнительную информацию смотрите в [документации](https://clickhouse.com/docs/en/cloud/security/secure-s3).  |
| compression          | Метод сжатия, используемый с объектами S3. Если не предоставлено, ClickHouse попытается определить сжатие на основе имени файла.                                                          |

Смотрите [тестовый файл S3](https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/clickhouse/test_clickhouse_s3.py) для примеров использования этого макроса.
#### Поддержка кросс-базовых макросов {#cross-database-macro-support}

dbt-clickhouse поддерживает большинство кросс-базовых макросов, теперь включённых в `dbt Core`, с следующими исключениями:

* SQL-функция `split_part` реализована в ClickHouse с использованием функции splitByChar. Эта функция требует использования постоянной строки для разделителя "split", поэтому параметр `delimeter`, используемый для этого макроса, будет интерпретироваться как строка, а не как имя колонки.
* Аналогично, SQL-функция `replace` в ClickHouse требует постоянных строк для параметров `old_chars` и `new_chars`, поэтому эти параметры будут интерпретироваться как строки, а не как имена колонок при вызове этого макроса.