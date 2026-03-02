---
sidebar_label: 'Материализация: materialized_view'
slug: /integrations/dbt/materialization-materialized-view
sidebar_position: 4
description: 'Специализированная документация по материализации materialized_view'
keywords: ['clickhouse', 'dbt', 'materialized_view', 'обновляемое', 'Materialized Views', 'catchup']
title: 'Материализация: materialized_view'
doc_type: 'guide'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Materialized Views \{#materialized-views\}

<ClickHouseSupportedBadge/>

Материализация `materialized_view` должна быть `SELECT`‑запросом к существующей (исходной) таблице. В отличие от PostgreSQL, materialized view в ClickHouse не является «статичной» (и не имеет соответствующей операции REFRESH). Вместо этого она работает как **триггер вставки**, добавляя новые строки в целевую таблицу, применяя заданное `SELECT`‑преобразование к строкам, вставляемым в исходную таблицу. См. [документацию по materialized view в ClickHouse](/materialized-view) для получения дополнительных сведений о том, как materialized view работает в ClickHouse.

:::note
Общие концепции материализаций и их общие настройки (engine, order_by, partition_by и т. д.) см. на странице [Materializations](/integrations/dbt/materializations).
:::

## Как управляется целевая таблица \{#target-table-management\}

Когда вы используете материализацию `materialized_view`, dbt-clickhouse создает как **materialized view**, так и **целевую таблицу**, в которую вставляются преобразованные строки. Существуют два способа управления целевой таблицей:

| Подход | Описание | Статус   |
|--------|----------|----------|
| **Неявная целевая таблица** | dbt-clickhouse автоматически создает и управляет целевой таблицей в рамках той же модели. Схема целевой таблицы выводится из SQL MV. | Stable   |
| **Явная целевая таблица** | Вы определяете целевую таблицу как отдельную материализацию `table` и ссылаетесь на нее из своей MV-модели с помощью макроса `materialization_target_table()`. MV создается с оператором `TO`, указывающим на эту таблицу. Эта функциональность доступна, начиная с **dbt-clickhouse версии 1.10**. **Внимание**: эта функция находится в бета-версии, и ее API может измениться на основе отзывов сообщества. | **Beta** |

Выбранный вами подход влияет на то, как обрабатываются изменения схемы, полные обновления (full refresh) и конфигурации с несколькими MV. В следующих разделах каждый подход описан более подробно.

## Материализация с неявной целевой таблицей \{#implicit-target\}

Это поведение по умолчанию. Когда вы определяете модель `materialized_view`, адаптер будет:

1. Создавать **целевую таблицу** с именем модели
2. Создавать в ClickHouse **materialized view** с именем `<model_name>_mv`

Схема целевой таблицы выводится из столбцов в операторе `SELECT` соответствующей materialized view (MV). Все ресурсы (целевая таблица и все materialized view) используют одну и ту же конфигурацию модели.

```sql
-- models/events_mv.sql
{{
    config(
        materialized='materialized_view',
        engine='SummingMergeTree()',
        order_by='(event_date, event_type)'
    )
}}

SELECT
    toStartOfDay(event_time) AS event_date,
    event_type,
    count() AS total
FROM {{ source('raw', 'events') }}
GROUP BY event_date, event_type
```

Дополнительные примеры см. в [тестовом файле](https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/materialized_view/test_materialized_view.py).


### Несколько materialized view \{#multiple-materialized-views\}

ClickHouse позволяет нескольким materialized view записывать данные в одну и ту же целевую таблицу. Чтобы поддержать это в dbt-clickhouse при использовании подхода с неявной целевой таблицей, вы можете построить `UNION` в файле модели, оборачивая SQL для каждого materialized view комментариями вида `--my_mv_name:begin` и `--my_mv_name:end`.

Например, следующий пример создаст два materialized view, которые оба записывают данные в одну и ту же целевую таблицу модели. Имена этих materialized view будут иметь вид `<model_name>_mv1` и `<model_name>_mv2`:

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
> При обновлении модели с несколькими materialized view (MV), особенно при переименовании одной из MV,
> dbt-clickhouse не удаляет старую MV автоматически. Вместо этого
> вы получите следующее предупреждение:
> `Warning - Table <previous table name> was detected with the same pattern as model name <your model name> but was not found in this run. In case it is a renamed mv that was previously part of this model, drop it manually (!!!) `


### Как управлять обходом схемы целевой таблицы \{#how-to-iterate-the-target-table-schema\}

Начиная с **dbt-clickhouse версии 1.9.8**, вы можете управлять тем, как выполняется обход схемы целевой таблицы, когда `dbt run` обнаруживает разные столбцы в SQL материализованного представления (MV).

```python
{{config(
    materialized='materialized_view',
    engine='MergeTree()',
    order_by='(id)',
    on_schema_change='fail'  # this setting
)}}
```

По умолчанию dbt не будет применять какие-либо изменения к целевой таблице (значение настройки `ignore`), но вы можете изменить эту настройку, чтобы поведение соответствовало конфигурации `on_schema_change` [в инкрементальных моделях](https://docs.getdbt.com/docs/build/incremental-models#what-if-the-columns-of-my-incremental-model-change).

Кроме того, вы можете использовать эту настройку как дополнительный механизм защиты. Если вы установите её в значение `fail`, сборка завершится с ошибкой, если столбцы в SQL материализованного представления (MV) отличаются от целевой таблицы, которая была создана при первом выполнении `dbt run`.


### Дозагрузка данных \{#data-catch-up\}

По умолчанию при создании или пересоздании materialized view (MV) целевая таблица сначала заполняется историческими данными до создания самой MV (`catchup=True`). Это поведение можно отключить, установив параметр `catchup` в значение `False`.

```python
{{config(
    materialized='materialized_view',
    engine='MergeTree()',
    order_by='(id)',
    catchup=False  # this setting
)}}
```

| Operation                               | `catchup: True` (по умолчанию)                       | `catchup: False`                                                       |
| --------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------- |
| Initial deployment (`dbt run`)          | Целевая таблица заполняется историческими данными    | Целевая таблица создаётся пустой                                       |
| Full refresh (`dbt run --full-refresh`) | Целевая таблица перестраивается и заполняется заново | Целевая таблица пересоздаётся пустой, **существующие данные теряются** |
| Normal operation                        | materialized view фиксирует новые вставки            | materialized view фиксирует новые вставки                              |

:::warning Риск потери данных при полном обновлении
Использование `catchup: False` с `dbt run --full-refresh` приведёт к тому, что **все существующие данные** в целевой таблице будут удалены. Таблица будет пересоздана пустой и далее будет содержать только новые данные. Убедитесь, что у вас есть резервные копии, если исторические данные могут понадобиться позже.
:::


## Материализация с явной целевой таблицей (Beta) \{#explicit-target\}

:::warning Beta
Эта функция находится на стадии бета-тестирования и доступна, начиная с **dbt-clickhouse версии 1.10**. API может измениться в зависимости от отзывов сообщества.
:::

По умолчанию dbt-clickhouse создаёт и управляет как целевой таблицей, так и materialized view в рамках одной модели (подход [implicit target](#implicit-target), описанный выше). У этого подхода есть несколько ограничений:

- Все ресурсы (целевая таблица + MV) используют одну и ту же конфигурацию. Если несколько MV указывают на одну и ту же целевую таблицу, они должны быть определены вместе с использованием синтаксиса `UNION ALL`.
- Все эти ресурсы нельзя обрабатывать по отдельности — ими нужно управлять через один и тот же файл модели.
- Вы не можете гибко управлять именем каждой MV.
- Все настройки общие для целевой таблицы и MV, что затрудняет индивидуальную конфигурацию каждого ресурса и понимание того, какая конфигурация относится к какому ресурсу.

Функция **explicit target** позволяет определить целевую таблицу отдельно как обычную материализацию `table`, а затем ссылаться на неё из ваших моделей materialized view.

### Преимущества \{#explicit-target-benefits\}

- **Полностью разделённые ресурсы**: теперь каждый ресурс может определяться отдельно, что улучшает читаемость.
- **Соответствие ресурсов dbt и CH 1:1**: теперь вы можете использовать инструменты dbt, чтобы независимо управлять этими ресурсами и итеративно их развивать.
- **Доступны разные конфигурации**: теперь к каждому ресурсу можно применять собственную конфигурацию.
- **Больше нет необходимости соблюдать соглашения об именовании**: теперь все ресурсы создаются с именем, которое задаёт пользователь, а не с добавленным суффиксом `_mv` для MVs.

### Ограничения \{#explicit-target-limitations\}

- Определение целевой таблицы не является естественным для dbt: это не SQL, который читает из исходной таблицы, поэтому здесь мы теряем проверки dbt. SQL материализованного представления по‑прежнему будет проверяться с использованием утилит dbt, а его совместимость со столбцами целевой таблицы будет проверяться на уровне ClickHouse.
- **Мы выявили некоторые проблемы, связанные с ограничениями функции `ref()`**: нам нужно использовать её для ссылок между моделями, но её можно использовать только для ссылок на вышестоящие модели, а не на нижестоящие. Это создаёт определённые проблемы для данной реализации. Мы создали issue в репозитории dbt-core и сейчас обсуждаем с ними [поиск возможных решений (dbt-labs/dbt-core#12319)](https://github.com/dbt-labs/dbt-core/issues/12319):
  - Когда `ref()` вызывается изнутри блока config, она возвращает текущую модель, а не общую. Это не позволяет нам определять её в секции config(), вынуждая использовать комментарий для добавления этой зависимости. Мы следуем тому же подходу, который описан в документации dbt, с [подходом "--depends_on:"](https://docs.getdbt.com/reference/dbt-jinja-functions/ref#forcing-dependencies).
  - `ref()` работает для нас, поскольку она заставляет сначала создать целевую таблицу, но на графе зависимостей в сгенерированной документации целевая таблица будет показана как ещё одна вышестоящая зависимость, а не нижестоящая, что несколько усложняет понимание.
  - `unit-test` также вынуждает нас определять некоторые данные для целевой таблицы, даже если задумка состоит в том, чтобы не читать из неё. Обходной путь — просто оставить данные для этой таблицы пустыми.

### Использование \{#explicit-target-usage\}

**Шаг 1. Определите целевую таблицу как обычную модель таблицы**

Модель `events_daily.sql`:

```sql
{{
    config(
        materialized='table',
        engine='SummingMergeTree()',
        order_by='(event_date, event_type)',
        partition_by='toYYYYMM(event_date)'
    )
}}

SELECT
    toDate(now()) AS event_date,
    '' AS event_type,
    toUInt64(0) AS total
WHERE 0  -- Creates empty table with correct schema
```

Это обходной вариант, который мы упоминаем в разделе с ограничениями. Здесь вы можете лишиться части проверок dbt, но схема по‑прежнему будет проверяться на уровне ClickHouse.

**Шаг 2: Определите materialized views, указывающие на целевую таблицу**

Например, вы можете определить разные MV в разных моделях следующим образом, даже если они указывают на одну и ту же целевую таблицу. Обратите внимание на новый вызов макроса `{{ materialization_target_table(ref('events_daily')) }}`, который настраивает целевую таблицу для MV.

Модель `page_events_aggregator.sql`:

```sql
{{ config(materialized='materialized_view') }}
{{ materialization_target_table(ref('events_daily')) }}

SELECT
    toStartOfDay(event_time) AS event_date,
    event_type,
    count() AS total
FROM {{ source('raw', 'page_events') }}
GROUP BY event_date, event_type
```

Модель `mobile_events_aggregator.sql`:

```sql
{{ config(materialized='materialized_view') }}
{{ materialization_target_table(ref('events_daily')) }}

SELECT
    toStartOfDay(event_time) AS event_date,
    event_type,
    count() AS total
FROM {{ source('raw', 'mobile_events') }}
GROUP BY event_date, event_type
```


### Параметры конфигурации \{#explicit-target-configuration\}

При использовании явных целевых таблиц доступны следующие параметры конфигурации:

**Для целевой таблицы (`materialized='table'`):**

| Option | Description | Default |
|--------|-------------|---------|
| `mv_on_schema_change` | Как обрабатывать изменения схемы, когда таблица используется materialized view под управлением dbt. Поведение соответствует параметру конфигурации `on_schema_change` [в инкрементальных моделях](https://docs.getdbt.com/docs/build/incremental-models#what-if-the-columns-of-my-incremental-model-change).| **Внимание**: Модель `materialized='table'` будет вести себя как обычно, если к ней не привязаны materialized view, поэтому, даже если этот параметр задан, он будет проигнорирован. Если таблица является целевой для materialized view, этот параметр по умолчанию будет иметь значение `mv_on_schema_change='fail'`, чтобы защитить данные в этих таблицах. |
| `repopulate_from_mvs_on_full_refresh` | При `--full-refresh` вместо выполнения SQL таблицы перестраивать таблицу, выполняя INSERT-SELECT на основе SQL всех materialized view, которые на неё ссылаются. | `False` |

**Для materialized view (`materialized='materialized_view'`):**

| Option | Description | Default |
|--------|-------------|---------|
| `catchup` | Нужно ли заполнять исторические данные при создании materialized view. | `True` |

:::note
Обычно имеет смысл устанавливать `catchup` в `True` только в materialized view или `repopulate_from_mvs_on_full_refresh` в `True` только в их целевых таблицах. Если установить оба параметра в `True`, это может привести к дублированию данных.
:::

### Распространённые операции \{#explicit-target-common-operations\}

#### Полное обновление с явными целевыми таблицами \{#explicit-target-full-refresh\}

При использовании `--full-refresh` явные целевые таблицы будут пересозданы (поэтому есть риск потери данных, если приём данных происходит во время этого процесса). Поведение будет отличаться в зависимости от ваших настроек:

**Вариант 1: поведение `--full-refresh` по умолчанию. Всё пересоздаётся, но во время пересоздания материализованных представлений (MV) целевая таблица будет пустой или частично загруженной.**

Всё удаляется и пересоздаётся. Если вы хотите повторно вставить данные с помощью SQL материализованных представлений (MV), оставьте настройку `catchup=True`:

```sql
-- models/page_events_aggregator.sql
{{ config(
    materialized='materialized_view',
    catchup=True  -- this is the default value so you don't need to actully set it.
) }}
{{ materialization_target_table(ref('events_daily')) }}
...
```

**Вариант 2: я хочу пересоздать целевую таблицу и не хочу, чтобы при пересоздании MV читались пустые данные.**

Если вам сначала нужно обновить SQL определений MV, задайте в них `catchup=False`, а затем выполните `dbt run` или `dbt run --full-refresh` для MV. Убедитесь, что MV созданы до запуска `--full-refresh` для целевой таблицы, так как при этом используются определения MV из ClickHouse.

Установите `repopulate_from_mvs_on_full_refresh=True` в модели целевой таблицы. При выполнении `dbt run --full-refresh` это приведёт к следующему:

1. Будет создана новая временная таблица
2. Будет выполнен INSERT-SELECT с использованием SQL каждого MV
3. Таблицы будут атомарно поменяны местами

Таким образом, пользователи вашей таблицы не столкнутся с пустыми данными, пока MV пересоздаются.

```sql
-- models/events_daily.sql
{{
    config(
        materialized='table',
        engine='SummingMergeTree()',
        order_by='(event_date, event_type)',
        repopulate_from_mvs_on_full_refresh=True
    )
}}
...
```


#### Изменение целевой таблицы \{#explicit-target-changing\}

Нельзя изменить целевую таблицу материализованного представления (MV) без выполнения `--full-refresh`. Если вы попытаетесь запустить обычный `dbt run` после изменения ссылки в `materialization_target_table()`, сборка завершится с ошибкой с сообщением о том, что целевая таблица изменилась.

Чтобы изменить целевую таблицу:

1. Обновите вызов `materialization_target_table()`
2. Выполните `dbt run --full-refresh -s your_mv_model`

### Устранение распространённых проблем \{#explicit-target-troubleshooting\}

#### Целевая таблица остаётся пустой во время или после выполнения `run` \{#target-table-empty\}

Есть несколько причин, по которым это может происходить:

- materialized view могут быть настроены с `catchup=False` или целевая таблица может быть настроена с `repopulate_from_mvs_on_full_refresh=False`, поэтому backfill не выполняется при создании materialized view или при пересоздании целевой таблицы. Это ожидаемое поведение, поэтому, если вы хотите повторно вставить данные с использованием SQL materialized view, убедитесь, что в materialized view установлено `catchup=True` (это значение по умолчанию) или в целевой таблице установлено `repopulate_from_mvs_on_full_refresh=True`. Проследите, чтобы оба параметра не были активированы одновременно, чтобы избежать дубликатов. Подробности смотрите в [разделе конфигурации](#explicit-target-configuration).
- Когда выполняется `dbt run --full-refresh`, если materialized view используют значение по умолчанию `catchup=True`, целевая таблица будет пересоздана, и MVs последовательно повторно вставят данные. Чтобы избежать этой ситуации, изучите раздел [Full refresh with explicit targets](#explicit-target-full-refresh)

#### `dbt run --full-refresh` в целевой таблице с `repopulate_from_mvs_on_full_refresh=True` использует логику из старых версий materialized view, а не из текущего SQL в проекте \{#full-refresh-with-repopulate-from-mvs-on-full-refresh\}

`repopulate_from_mvs_on_full_refresh=True` использует существующий SQL materialized view, который уже определён в ClickHouse. Чтобы убедиться, что используется новое определение materialized view, выполните `dbt run` для каждого materialized view перед выполнением `dbt run --full-refresh` в целевой таблице.

#### После выполнения запуска появляются дубликаты данных \{#duplicate-data\}

Возможные причины:

- Одновременно включены `catchup=True` на materialized view и `repopulate_from_mvs_on_full_refresh=True` на целевой таблице: оставьте только один из них в зависимости от операций, которые вы хотите выполнять. См. [раздел конфигурации](#explicit-target-configuration) для получения дополнительной информации.
- Целевая таблица не определена с `WHERE 0`: целевая таблица должна создаваться пустой, но внутренний запрос может вставлять данные, если `WHERE 0` не указан. Убедитесь, что это условие включено.

#### Потеря данных при активной ингестии после выполнения `dbt run --full-refresh` \{#data-loss-active-ingestion\}

Некоторые строки из исходной таблицы отсутствуют в целевой таблице после выполнения `dbt run --full-refresh`.
materialized view в ClickHouse ведут себя как триггеры вставки — они обрабатывают данные только пока существуют. Во время полного обновления есть небольшой интервал, когда MV удаляется и создаётся заново («слепое окно»). Любые строки, вставленные в исходную таблицу в это окно, не будут захвачены. Подробности см. в разделе [Поведение при активной ингестии](#behavior-during-active-ingestion).

### Методы отладки \{#debugging-techniques\}

#### Проверьте текущую таблицу-назначение materialized view в ClickHouse \{#check-mv-target\}

Выполните запрос к `system.tables`, чтобы узнать, в какую таблицу materialized view записывает данные:

```sql
SELECT
    name as mv_name,
    replaceRegexpOne(
        create_table_query,
        '.*TO\\s+`?([^`\\s(]+)`?\\.`?([^`\\s(]+)`?.*',
        '\\1.\\2'
    ) AS target_table
FROM system.tables
WHERE database = 'your_schema'
  AND engine = 'MaterializedView'
```


#### Проверьте, распознаёт ли dbt таблицу как целевую для materialized view \{#check-dbt-recognition\}

Во время выполнения dbt run найдите в логах следующее сообщение:

>Table `<table_name>` is used as a target by a dbt-managed materialized view. Defaulting mv_on_schema_change to "fail" to prevent data loss.

Если это сообщение появляется, значит dbt обнаружил, что таблица используется как целевая как минимум одной materialized view, управляемой dbt. Если вы ожидаете это сообщение, но не видите его, убедитесь, что:

- Модель materialized view корректно определяет `{{ materialization_target_table(ref('your_target')) }}`
- В конфигурации модели materialized view указано `materialized='materialized_view'`
- И materialized view, и целевая таблица были запущены как минимум один раз

### Миграция от неявной к явной целевой таблице \{#migration-implicit-to-explicit\}

Если у вас есть существующие модели materialized view, использующие подход с неявной целевой таблицей, и вы хотите перейти на подход с явной целевой таблицей, выполните следующие шаги:

**1. Создайте модель целевой таблицы**

Создайте новый файл модели с `materialized='table'`, который задаёт ту же схему, что и текущая целевая таблица MV. Используйте предложение `WHERE 0`, чтобы создать пустую таблицу. Используйте то же имя, что и у текущей модели неявного materialized view. Теперь вы сможете использовать эту модель для итеративного изменения целевой таблицы.

```sql
-- models/events_daily.sql
{{
    config(
        materialized='table',
        engine='MergeTree()',
        order_by='(event_date, event_type)'
    )
}}

SELECT
    toDate(now()) AS event_date,
    '' AS event_type,
    toUInt64(0) AS total
WHERE 0
```

**2. Обновите MV‑модели**

Создайте новые модели, которые будут включать SQL‑код MV и вызов макроса `materialization_target_table()`, указывающий на новую целевую таблицу. Если вы ранее использовали `UNION ALL`, удалите эту часть и комментарии.

Для имён моделей необходимо придерживаться следующего соглашения об именовании:

* если было определено только одно MV, оно будет иметь имя: `<old_model_name>_mv`
* если было определено несколько MV, каждое будет иметь имя: `<old_model_name>_mv_<name_in_comments>`

Ранее в `my_model.sql` (неявная целевая таблица, одна модель с UNION ALL):

```sql
--mv1:begin
select a, b, c from {{ source('raw', 'table_1') }}
--mv1:end
union all
--mv2:begin
select a, b, c from {{ source('raw', 'table_2') }}
--mv2:end
```

После (явно заданная цель, отдельные файлы моделей):

```sql
-- models/my_model_mv_mv1.sql
{{ config(materialized='materialized_view') }}
{{ materialization_target_table(ref('events_daily')) }}

select a, b, c from {{ source('raw', 'table_1') }}
```

```sql
-- models/my_model_mv_mv2.sql
{{ config(materialized='materialized_view') }}
{{ materialization_target_table(ref('events_daily')) }}

select a, b, c from {{ source('raw', 'table_2') }}
```

**3. При необходимости повторяйте их, руководствуясь инструкциями из раздела [«Явная цель»](#explicit-target).**


## Сравнение поведения между подходами с неявной и явной целевой таблицей\{#behavior-comparison\}

### Как они ведут себя в целом \{#general-behavior\}

| Operation | Неявная цель | Явная цель |
| --- | --- | --- |
| First dbt run | Все ресурсы созданы | Все ресурсы созданы |
| Next dbt run |  **Отдельными ресурсами нельзя управлять, всё выполняется разом:**<br /><br />**target table**: <br /> изменения управляются с помощью настройки `on_schema_change`. По умолчанию установлено значение `ignore`, поэтому новые столбцы не обрабатываются.<br /><br />**Materialized views**: все обновляются с помощью операций `alter table modify query` | **Изменения можно применять по отдельности:<br /><br />target table**: <br />автоматическое определение, являются ли они целевыми таблицами из materialized views, определённых в dbt. Если да, изменения структуры столбцов по умолчанию управляются настройкой `mv_on_schema_change` со значением `fail`, поэтому выполнение завершится с ошибкой, если столбец изменится. Мы добавили это значение по умолчанию как дополнительный уровень защиты<br /><br />**Materialized views**: их SQL обновляется с помощью операций `alter table modify query`. |
| dbt run --full-refresh | **Отдельными ресурсами нельзя управлять, всё выполняется разом:<br /><br />target table**: <br />target table пересоздаётся пустой. `catchup` доступен для настройки бэкфила с использованием SQL всех materialized views вместе. `catchup` имеет значение `True` по умолчанию<br /><br />**Materialized views**: все пересоздаются. | **Изменения будут применяться по отдельности:<br /><br />target table:** будет пересоздана как обычно.<br /><br />**Materialized views**: удаление и пересоздание. `catchup` доступен для первоначального бэкфила. `catchup` имеет значение `True` по умолчанию. <br /><br />**Примечание: в процессе выполнения целевая таблица будет пустой или частично загруженной до тех пор, пока materialized views не будут пересозданы. Чтобы этого избежать, см. следующий раздел о том, как поэтапно обновлять целевую таблицу.**|

### Поведение во время активной ингестии \{#behavior-during-active-ingestion\}

При итеративной доработке моделей важно понимать, как разные операции взаимодействуют с вставляемыми данными:

- Поскольку materialized view в ClickHouse действуют как **триггеры на вставку** (insert triggers), они обрабатывают данные только пока существуют. Если materialized view удаляется и создаётся заново (например, во время `--full-refresh`), любые строки, вставленные в исходную таблицу в этот промежуток времени, **не** будут обработаны этой materialized view. Такое состояние materialized view называют «слепым» (blind).
- Различные процессы `catchup` основаны на операциях `INSERT INTO ... SELECT`, использующих SQL materialized view, и не зависят от того, как сами materialized view работают. Как только начинается выполнение `INSERT`, новые данные в него уже не попадают, но они будут захвачены присоединённой materialized view.

В следующей таблице показана степень безопасности каждой операции, когда вставки активно выполняются в исходную таблицу.

#### Неявные операции с целевой таблицей \{#ingestion-implicit-target\}

| Operation | Internal process | Safety while inserts are happening |
|-----------|------------------|------------------------------------|
| Первый `dbt run` | 1. Создать целевую таблицу<br/>2. Вставить данные (если `catchup=True`)<br/>3. Создать materialized view(ы) | ⚠️ **materialized view «ничего не видит» между шагами 1 и 3.** Любые строки, вставленные в исходную таблицу в этот промежуток, не будут зафиксированы. |
| Последующие `dbt run` | `ALTER TABLE ... MODIFY QUERY` | ✅ Безопасно. materialized view обновляется атомарно. |
| `dbt run --full-refresh` | 1. Создать резервную таблицу<br/>2. Вставить данные (если `catchup=True`)<br/>3. Удалить materialized view(ы)<br/>4. Поменять таблицы местами<br/>5. Воссоздать materialized view(ы) | ⚠️ **materialized view «ничего не видит» во время пересоздания.** Данные, вставленные в исходную таблицу между шагами 3 и 5, не попадут в новую целевую таблицу. |

#### Явные операции с целевыми объектами \{#ingestion-explicit-target\}

**Модели materialized view:**

| Operation | Internal process | Safety while inserts are happening |
|-----------|------------------|------------------------------------|
| First `dbt run` | 1. Создать MV (с `TO`-клаузой)<br/>2. Выполнить догоняющее заполнение (если `catchup=True`) | ✅ MV создаётся первой, поэтому новые вставки сразу же попадают в неё.<br/>⚠️ **Догоняющее заполнение может дублировать данные** — запрос backfill может пересекаться со строками, которые уже обрабатываются MV. Безопасно при использовании дедуплицирующего движка (например, `ReplacingMergeTree`). |
| Subsequent `dbt run` | `ALTER TABLE ... MODIFY QUERY` | ✅ Безопасно. MV обновляется атомарно. |
| `dbt run --full-refresh` на MV | 1. Удалить и пересоздать MV<br/>2. Выполнить догоняющее заполнение (если `catchup=True`) | ⚠️ **MV "слепа" во время пересоздания** (между удалением и созданием).<br/>⚠️ **Догоняющее заполнение может дублировать данные**, если вставки выполняются одновременно. |

**Модель целевой таблицы:**

| Operation | Internal process | Safety while inserts are happening |
|-----------|------------------|------------------------------------|
| `dbt run` | Изменения схемы применяются согласно настройке `mv_on_schema_change` | ✅ Безопасно. Перемещения данных не происходит. |
| `dbt run --full-refresh` (по умолчанию) | Пересоздать таблицу (оставив её пустой) | ⚠️ **Целевая таблица пуста**, пока MV не заполнят её в ходе backfill-а. MV продолжают вставлять данные в новую таблицу, как только она появляется. |
| `dbt run --full-refresh` с `repopulate_from_mvs_on_full_refresh=True` | 1. Создать резервную таблицу<br/>2. Вставить данные, используя SQL каждой MV<br/>3. Атомарно поменять таблицы местами | ⚠️ **MV "слепа" во время пересоздания.** Данные, вставленные между шагами 1 и 3, не появятся в новой таблице. **Это может измениться в следующих версиях**|

:::tip Рекомендации для продакшен-сред с активной ингестией

- **По возможности приостанавливайте приём данных во время операций dbt**: это сделает все операции безопасными и исключит потерю данных.
- **По возможности используйте дедуплицирующий движок** (например, `ReplacingMergeTree`) на целевой таблице для обработки потенциальных дубликатов из-за пересечения догоняющего заполнения.
- **Отдавайте предпочтение `ALTER TABLE ... MODIFY QUERY`** (обычный `dbt run` без `--full-refresh`), когда это возможно — это всегда безопасно.
- **Учитывайте проблемные интервалы времени** во время операций dbt.
:::

## Обновляемые materialized view \{#refreshable-materialized-views\}

[Refreshable Materialized Views](/materialized-view/refreshable-materialized-view) — это особый тип materialized view в ClickHouse, которые периодически повторно выполняют запрос и сохраняют результат, аналогично тому, как materialized view работают в других базах данных. Это полезно в сценариях, когда нужны периодические срезы или агрегации, а не триггеры вставки в режиме реального времени.

:::tip
Refreshable materialized view могут использоваться **как** с [неявной целевой таблицей](#implicit-target), так и с [явной целевой таблицей](#explicit-target). Конфигурация `refreshable` не зависит от того, как управляется целевая таблица.
:::

Чтобы использовать refreshable materialized view, добавьте объект конфигурации `refreshable` в вашу MV-модель со следующими параметрами:

| Option                | Description                                                                                                                                                                           | Required | Default Value |
|-----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|---------------|
| refresh_interval      | Обязательное поле с интервалом                                                                                                                                                        | Yes      |               |
| randomize             | Параметр рандомизации, будет добавлен после `RANDOMIZE FOR`                                                                                                                           |          |               |
| append                | Если установлено в `True`, при каждом обновлении в таблицу вставляются новые строки без удаления существующих. Вставка не является атомарной, так же как обычный INSERT SELECT.      |          | False         |
| depends_on            | Список зависимостей для refreshable materialized view. Укажите зависимости в следующем формате: `{schema}.{view_name}`                                                               |          |               |
| depends_on_validation | Нужно ли проверять существование зависимостей, указанных в `depends_on`. Если зависимость не содержит схемы, проверка выполняется в схеме `default`.                                  |          | False         |

### Пример с неявно заданной целевой таблицей \{#refreshable-implicit-example\}

```python
{{
    config(
        materialized='materialized_view',
        engine='MergeTree()',
        order_by='(event_date)',
        refreshable={
            "interval": "EVERY 5 MINUTE",
            "randomize": "1 MINUTE",
            "append": True,
            "depends_on": ['schema.depend_on_model'],
            "depends_on_validation": True
        }
    )
}}

SELECT
    toStartOfDay(event_time) AS event_date,
    count() AS total
FROM {{ source('raw', 'events') }}
GROUP BY event_date
```


### Пример с явным указанием целевой таблицы \{#refreshable-explicit-example\}

```python
{{
    config(
        materialized='materialized_view',
        refreshable={
            "interval": "EVERY 1 HOUR",
            "append": False
        }
    )
}}
{{ materialization_target_table(ref('events_daily')) }}

SELECT
    toStartOfDay(event_time) AS event_date,
    event_type,
    count() AS total
FROM {{ source('raw', 'events') }}
GROUP BY event_date, event_type
```


### Ограничения \{#refreshable-limitations\}

* При создании refreshable materialized view (MV) в ClickHouse, у которой есть зависимость, ClickHouse не выдаёт
  ошибку, если указанная зависимость не существует на момент создания. Вместо этого refreshable MV остаётся в
  неактивном состоянии, ожидая удовлетворения зависимости, прежде чем начать обрабатывать обновления или выполнять refresh.
  Такое поведение является ожидаемым, но может привести к задержкам в доступности данных, если требуемая зависимость
  не будет своевременно обеспечена. Рекомендуется перед созданием refreshable materialized view убедиться, что все
  зависимости корректно определены и существуют.
* В настоящее время не существует фактической «dbt-связи» между MV и её зависимостями, поэтому порядок создания не
  гарантируется.
* Функциональность refreshable не тестировалась с несколькими MV, направляющими данные в одну и ту же целевую модель.