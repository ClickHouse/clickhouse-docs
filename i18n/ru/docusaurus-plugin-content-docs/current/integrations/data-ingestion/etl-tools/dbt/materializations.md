---
sidebar_label: 'Материализации'
slug: /integrations/dbt/materializations
sidebar_position: 3
description: 'Доступные материализации и их конфигурации'
keywords: ['clickhouse', 'dbt', 'materializations', 'materialized view', 'incremental']
title: 'Материализации'
doc_type: 'guide'
---

import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Материализации \{#materializations\}

<ClickHouseSupportedBadge/>

В этом разделе описаны все материализации, доступные в dbt-clickhouse, включая экспериментальные возможности.

<TOCInline toc={toc}  maxHeadingLevel={3} />

## Общие конфигурации материализаций \{#general-materialization-configurations\}

В следующей таблице показаны конфигурации, общие для некоторых доступных материализаций. Для более подробной информации об общих конфигурациях моделей dbt см. [документацию dbt](https://docs.getdbt.com/category/general-configs):

| Option         | Description                                                                                                                                                                      | Default if any |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| engine         | Движок таблицы (тип таблицы), который будет использоваться при создании таблиц                                                                                                   | `MergeTree()`  |
| order_by       | Кортеж имен столбцов или произвольных выражений. Это позволяет создать небольшой разреженный индекс, который помогает быстрее находить данные.                                  | `tuple()`      |
| partition_by   | Партиция — это логическая комбинация записей в таблице по заданному критерию. Ключ партиции может быть любым выражением из столбцов таблицы.                                    |                |
| primary_key    | Как и order_by, выражение первичного ключа ClickHouse. Если не указано, ClickHouse будет использовать выражение ORDER BY в качестве первичного ключа                            |                |
| settings       | Map/словарь настроек таблицы ("TABLE settings"), которые будут использоваться в DDL-командах, таких как `CREATE TABLE`, для этой модели                                         |                |
| query_settings | Map/словарь пользовательских настроек ClickHouse, которые будут использоваться с командами `INSERT` или `DELETE` в связке с этой моделью                                        |                |
| ttl            | TTL-выражение, которое будет использоваться с таблицей. TTL-выражение — это строка, с помощью которой можно задать TTL для таблицы.                                              |                |
| sql_security   | Пользователь ClickHouse, от имени которого будет выполняться базовый запрос представления. [Допустимые значения](/sql-reference/statements/create/view#sql_security): `definer`, `invoker`. |                |
| definer        | Если `sql_security` имеет значение `definer`, необходимо указать существующего пользователя или `CURRENT_USER` в параметре `definer`.                                           |                |

### Поддерживаемые движки таблиц \{#supported-table-engines\}

| Тип                      | Подробности                                                                                |
|--------------------------|--------------------------------------------------------------------------------------------|
| MergeTree (по умолчанию) | https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/mergetree/.         |
| HDFS                     | https://clickhouse.com/docs/en/engines/table-engines/integrations/hdfs                    |
| MaterializedPostgreSQL   | https://clickhouse.com/docs/en/engines/table-engines/integrations/materialized-postgresql |
| S3                       | https://clickhouse.com/docs/en/engines/table-engines/integrations/s3                      |
| EmbeddedRocksDB          | https://clickhouse.com/docs/en/engines/table-engines/integrations/embedded-rocksdb        |
| Hive                     | https://clickhouse.com/docs/en/engines/table-engines/integrations/hive                    |

**Примечание**: для materialized view поддерживаются все движки *MergeTree.

#### Экспериментально поддерживаемые движки таблиц \{#experimental-supported-table-engines\}

| Тип               | Сведения                                                                  |
|-------------------|---------------------------------------------------------------------------|
| distributed таблица | https://clickhouse.com/docs/en/engines/table-engines/special/distributed. |
| словарь           | https://clickhouse.com/docs/en/engines/table-engines/special/dictionary   |

Если вы столкнетесь с проблемами при подключении к ClickHouse из dbt, используя один из указанных выше движков, пожалуйста, сообщите о проблеме [здесь](https://github.com/ClickHouse/dbt-clickhouse/issues).

### Примечание о настройках модели \{#a-note-on-model-settings\}

В ClickHouse существует несколько типов и уровней «настроек». В конфигурации модели выше настраиваются два из них.
`settings` обозначает предложение `SETTINGS`,
используемое в DDL-командах типа `CREATE TABLE/VIEW`, то есть, как правило, это настройки, специфичные для
конкретного движка таблицы ClickHouse. Новый
`query_settings` используется для добавления предложения `SETTINGS` к запросам `INSERT` и `DELETE`, используемым для материализации модели
(включая инкрементальные материализации).
В ClickHouse есть сотни настроек, и не всегда очевидно, какая из них является «табличной» настройкой, а какая — «пользовательской»
(хотя последние, как правило,
доступны в таблице `system.settings`.) В целом рекомендуется использовать значения по умолчанию, а любое изменение этих свойств
следует тщательно изучить и протестировать.

### Конфигурация столбца \{#column-configuration\}

> **_ПРИМЕЧАНИЕ:_** Приведённые ниже параметры конфигурации столбца требуют обязательного применения [контрактов моделей](https://docs.getdbt.com/docs/collaborate/govern/model-contracts).

| Опция | Описание                                                                                                                                                | Значение по умолчанию |
|--------|------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------|
| codec  | Строка, состоящая из аргументов, передаваемых в `CODEC()` в DDL столбца. Например: `codec: "Delta, ZSTD"` будет скомпилирована как `CODEC(Delta, ZSTD)`.    |    
| ttl    | Строка, состоящая из выражения [TTL (time-to-live)](https://clickhouse.com/docs/guides/developer/ttl), которое задаёт правило TTL в DDL столбца. Например: `ttl: ts + INTERVAL 1 DAY` будет скомпилирована как `TTL ts + INTERVAL 1 DAY`. |

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

dbt автоматически определяет тип данных каждого столбца, анализируя SQL, используемый для создания модели. Однако в некоторых случаях этот процесс может некорректно определить тип данных, что приводит к конфликтам с типами, указанными в свойстве контракта `data_type`. Чтобы избежать этого, рекомендуется использовать функцию `CAST()` в SQL-модели для явного задания требуемого типа. Например:

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


## Материализация: view \{#materialization-view\}

Модель dbt может быть реализована в виде [представления ClickHouse](/sql-reference/table-functions/view/)
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


## Материализация: table \{#materialization-table\}

Модель dbt может быть создана как [таблица ClickHouse](/operations/system-tables/tables/) и
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


### Индексы пропуска данных \{#data-skipping-indexes\}

Вы можете добавить [индексы пропуска данных](/optimize/skipping-indexes) для материализаций типа `table`, используя конфигурацию `indexes`:

```sql
{{ config(
        materialized='table',
        indexes=[{
          'name': 'your_index_name',
          'definition': 'your_column TYPE minmax GRANULARITY 2'
        }]
) }}
```


### Проекции \{#projections\}

Вы можете добавить [проекции](/data-modeling/projections) к материализациям `table` и `distributed_table` с помощью конфигурации `projections`:

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

**Примечание**: Для distributed таблиц проекция применяется к таблицам `_local`, а не к distributed proxy-таблице.


## Материализация: incremental \{#materialization-incremental\}

Модель таблицы будет пересоздаваться при каждом запуске dbt. Для больших наборов результатов или сложных преобразований это может быть неосуществимо на практике и чрезвычайно затратно. Чтобы решить эту задачу и сократить время сборки, модель dbt может быть создана как инкрементальная таблица ClickHouse и настраивается с помощью следующего синтаксиса:

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


### Конфигурации \{#incremental-configurations\}

Конфигурации, специфичные для этого типа материализации, перечислены ниже:

| Option                   | Description                                                                                                                                                                                                                                                       | Required?                                                                            |
|--------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| `unique_key`             | Кортеж имён столбцов, которые однозначно идентифицируют строки. Дополнительные сведения об ограничениях уникальности см. [здесь](https://docs.getdbt.com/docs/build/incremental-models#defining-a-unique-key-optional).                                                                                       | Обязательный. Если не указано, изменённые строки будут добавлены в инкрементную таблицу дважды. |
| `inserts_only`           | Устарел; вместо него используется инкрементная стратегия `append`, работающая аналогичным образом. Если для инкрементной модели установлено значение True, инкрементальные обновления будут вставляться напрямую в целевую таблицу без создания промежуточной таблицы. Если задано `inserts_only`, параметр `incremental_strategy` игнорируется. | Необязательный (по умолчанию: `False`)                                                          |
| `incremental_strategy`   | Стратегия, используемая для инкрементной материализации. Поддерживаются `delete+insert`, `append`, `insert_overwrite` и `microbatch`. Дополнительные сведения о стратегиях см. [здесь](#incremental-model-strategies). | Необязательный (по умолчанию: 'default')                                                        |
| `incremental_predicates` | Дополнительные условия, применяемые к инкрементной материализации (применяются только для стратегии `delete+insert`).                                                                                                                                                                                   | Необязательный                      

### Стратегии инкрементных моделей \{#incremental-model-strategies\}

`dbt-clickhouse` поддерживает три стратегии инкрементных моделей.

#### Стратегия по умолчанию (устаревшая) \{#default-legacy-strategy\}

Исторически в ClickHouse была лишь ограниченная поддержка операций обновления и удаления в виде асинхронных Мутаций.
Чтобы эмулировать ожидаемое поведение dbt,
dbt-clickhouse по умолчанию создаёт новую временную таблицу, содержащую все неизменённые (не удалённые, не изменённые) «старые»
записи, а также все новые или обновлённые записи,
а затем заменяет эту временную таблицу на существующее инкрементальное отношение модели (операция swap/exchange). Это единственная стратегия,
которая сохраняет исходное отношение, если что-то
идёт не так до завершения операции; однако, поскольку она предполагает полное копирование исходной таблицы, её выполнение может быть довольно
затратным и медленным.

#### Стратегия Delete+Insert \{#delete-insert-strategy\}

В ClickHouse в версии 22.8 как экспериментальная функция были добавлены «легковесные удаления». Легковесные удаления
значительно быстрее операций ALTER TABLE ... DELETE,
поскольку они не требуют перезаписи частей данных ClickHouse. Инкрементальная стратегия `delete+insert`
использует легковесные удаления для реализации
инкрементальных материализаций, которые работают значительно лучше, чем «устаревшая» стратегия. Однако при использовании
этой стратегии есть важные оговорки:

- Легковесные удаления должны быть включены на вашем сервере ClickHouse с помощью настройки
  `allow_experimental_lightweight_delete=1`, либо вы
  должны установить `use_lw_deletes=true` в своем профиле (что включит эту настройку для ваших dbt-сессий).
- Легковесные удаления сейчас считаются готовыми для промышленной эксплуатации, однако в версиях ClickHouse до 23.3
  возможны проблемы с производительностью и другие неисправности.
- Эта стратегия работает напрямую с затронутой таблицей/отношением (без создания каких-либо промежуточных или
  временных таблиц), поэтому, если во время операции возникнет проблема,
  данные в инкрементальной модели, скорее всего, окажутся в некорректном состоянии.
- При использовании легковесных удалений dbt-clickhouse включает настройку `allow_nondeterministic_mutations`. В
  некоторых весьма редких случаях при использовании недетерминированных incremental_predicates
  это может привести к состоянию гонки для обновленных/удаленных элементов (и соответствующим сообщениям в журналах ClickHouse).
  Чтобы обеспечить согласованные результаты,
  инкрементальные предикаты должны включать только подзапросы к данным, которые не будут изменяться во время
  инкрементальной материализации.

#### Стратегия Microbatch (требуется dbt-core >= 1.9) \{#microbatch-strategy\}

Инкрементальная стратегия `microbatch` является функцией dbt-core, начиная с версии 1.9, разработанной для эффективной обработки крупномасштабных преобразований временных рядов. В dbt-clickhouse она основана на существующей инкрементальной стратегии `delete_insert`, разбивая объём инкрементальной обработки на предопределённые временные батчи на основе конфигураций модели `event_time` и `batch_size`.

Помимо обработки крупных преобразований, microbatch предоставляет возможность:

- [Повторно обрабатывать неуспешные батчи](https://docs.getdbt.com/docs/build/incremental-microbatch#retry).
- Автоматически определять [параллельное выполнение батчей](https://docs.getdbt.com/docs/build/parallel-batch-execution).
- Устранить необходимость в сложной условной логике при [дозаполнении исторических данных (backfilling)](https://docs.getdbt.com/docs/build/incremental-microbatch#backfills).

Подробности использования microbatch см. в [официальной документации](https://docs.getdbt.com/docs/build/incremental-microbatch).

##### Доступные конфигурации микропакетов \{#available-microbatch-configurations\}

| Option             | Description                                                                                                                                                                                                                                                                                                                                | Default if any |
|--------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| event_time         | Столбец, указывающий, «в какое время произошла строка» (когда была зафиксирована запись). Обязателен для вашей модели микропакетов и любых непосредственных родительских моделей, которые должны фильтроваться.                                                                                                                           |                |
| begin              | «Начало временной шкалы» для модели микропакетов. Это отправная точка для любых начальных или full-refresh запусков. Например, модель микропакетов с дневным шагом, запущенная 2024-10-01 с begin = '2023-10-01, обработает 366 пакетов (это високосный год!) плюс пакет за «сегодня».                                                   |                |
| batch_size         | Детализация (гранулярность) ваших пакетов. Поддерживаемые значения: `hour`, `day`, `month` и `year`.                                                                                                                                                                                                                                      |                |
| lookback           | Обработать X пакетов до последней контрольной точки, чтобы захватить поздно поступившие записи.                                                                                                                                                                                                                                           | 1              |
| concurrent_batches | Переопределяет автоматическое определение dbt для одновременного запуска пакетов (в одно и то же время). Подробнее читайте в разделе [configuring concurrent batches](https://docs.getdbt.com/docs/build/incremental-microbatch#configure-concurrent_batches). Значение true запускает пакеты одновременно (параллельно). Значение false запускает пакеты последовательно (один за другим). |                |

#### Стратегия append \{#append-strategy\}

Эта стратегия заменяет настройку `inserts_only` в предыдущих версиях dbt-clickhouse. При таком подходе новые строки просто дописываются
к существующему отношению (таблице и т. п.).
В результате дубликаты строк не устраняются и не создаётся временная или промежуточная таблица. Это самый быстрый
подход, если дубликаты либо допустимы
в данных, либо гарантированно исключаются инкрементным запросом с WHERE-условием/фильтром.

#### Стратегия insert_overwrite (экспериментальная) \{#insert-overwrite-strategy\}

> [ВАЖНО]  
> В настоящий момент стратегия insert_overwrite не полностью работоспособна с распределёнными материализациями.

Выполняет следующие шаги:

1. Создаёт staging (временную) таблицу с той же структурой, что и целевая таблица инкрементальной модели:
   `CREATE TABLE <staging> AS <target>`.
2. Вставляет только новые записи (полученные из `SELECT`) в staging-таблицу.
3. Заменяет в целевой таблице только новые партиции (присутствующие в staging-таблице).

Этот подход имеет следующие преимущества:

- Он быстрее, чем стратегия по умолчанию, потому что не копирует всю таблицу.
- Он безопаснее других стратегий, потому что не изменяет исходную таблицу до тех пор, пока операция INSERT не будет
  успешно завершена: в случае промежуточного сбоя исходная таблица не изменяется.
- Он реализует передовую практику инженерии данных — «неизменяемость партиций», что упрощает инкрементальную и параллельную
  обработку данных, откаты и т. д.

Стратегия требует, чтобы в конфигурации модели был задан `partition_by`. Игнорирует все остальные параметры конфигурации
модели, специфичные для стратегий.

## Materialization: materialized_view \{#materialized-view\}

Материализация `materialized_view` создаёт в ClickHouse [materialized view](/sql-reference/statements/create/view#materialized-view), которая действует как триггер на вставку, автоматически преобразуя и вставляя новые строки из исходной таблицы в целевую. Это одна из самых мощных материализаций, доступных в dbt-clickhouse.

Из-за своей сложности эта материализация описана на отдельной странице. **[Перейдите к руководству по materialized view](/integrations/dbt/materialized-views)**, чтобы ознакомиться с полной документацией.

## Materialization: dictionary (experimental) \{#materialization-dictionary\}

См. тесты
в https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/dictionary/test_dictionary.py для
примеров того, как
реализовать материализации для словарей ClickHouse

## Материализация: distributed_table (экспериментальная) \{#materialization-distributed-table\}

distributed таблица создаётся следующим образом:

1. Создать временное представление с SQL-запросом, чтобы получить правильную структуру.
2. Создать пустые локальные таблицы на основе представления.
3. Создать distributed таблицу на основе локальных таблиц.
4. Вставлять данные в distributed таблицу, чтобы они распределялись по сегментам без дублирования.

Примечания:

- dbt-clickhouse теперь автоматически добавляет в запросы настройку `insert_distributed_sync = 1`, чтобы обеспечить
  корректное выполнение последующих операций инкрементной
  материализации. Это может привести к тому, что некоторые вставки в distributed таблицу будут выполняться медленнее,
  чем ожидается.

### Пример модели distributed таблицы \{#distributed-table-model-example\}

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


### Сгенерированные миграции \{#distributed-table-generated-migrations\}

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


### Конфигурации \{#distributed-table-configurations\}

Параметры конфигурации, специфичные для этого типа материализации, перечислены ниже:

| Option       | Description                                                                                                                                                                                                                                                                                                          | Default if any |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| sharding_key | Ключ сегментации определяет целевой сервер при вставке в таблицу с движком Distributed. Ключ сегментации может быть случайным или представлять собой результат хэш-функции                                                                                                                                          | `rand()`)      |

## materialization: distributed_incremental (experimental) \{#materialization-distributed-incremental\}

Инкрементальная модель основана на той же идее, что и distributed таблица; основная задача — корректно обрабатывать все инкрементальные стратегии.

1. _Стратегия Append_ просто вставляет данные в distributed таблицу.
2. _Стратегия Delete+Insert_ создаёт distributed временную таблицу для работы со всеми данными на каждом сегменте.
3. _Стратегия Default (Legacy)_ создаёт distributed временные и промежуточные таблицы по той же причине.

Заменяются только таблицы сегментов, потому что distributed таблица не хранит данные.
Distributed таблица перезагружается только при включённом режиме full_refresh или если структура таблицы могла измениться.

### Пример распределённой инкрементальной модели \{#distributed-incremental-model-example\}

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


### Сгенерированные миграции \{#distributed-incremental-generated-migrations\}

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


## Snapshot \{#snapshot\}

Снимки dbt позволяют фиксировать изменения изменяемой модели со временем. Это, в свою очередь, дает
возможность выполнять запросы к моделям на определенный момент времени, когда аналитики могут «вернуться назад во времени»
и посмотреть на предыдущее состояние модели. Эта функциональность поддерживается коннектором ClickHouse
и настраивается с помощью следующего синтаксиса:

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


## Контракты и ограничения \{#contracts-and-constraints\}

Поддерживаются только контракты с точным соответствием типов столбцов. Например, контракт с типом столбца UInt32 завершится ошибкой, если модель
возвращает UInt64 или другой целочисленный тип.
ClickHouse также поддерживает _только_ ограничения `CHECK` для всей таблицы/модели. Первичные ключи, внешние ключи, уникальные ключи и
ограничения CHECK на уровне столбца не поддерживаются.
(См. документацию ClickHouse о первичных ключах и ключах ORDER BY.)