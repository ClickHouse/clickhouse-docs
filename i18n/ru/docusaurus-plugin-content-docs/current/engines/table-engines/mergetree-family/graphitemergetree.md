---
description: 'Предназначен для уменьшения объема и агрегации/усреднения (rollup) данных Graphite.'
sidebar_label: 'GraphiteMergeTree'
sidebar_position: 90
slug: /engines/table-engines/mergetree-family/graphitemergetree
title: 'GraphiteMergeTree'
---


# GraphiteMergeTree

Этот движок предназначен для уменьшения объема и агрегации/усреднения (rollup) данных [Graphite](http://graphite.readthedocs.io/en/latest/index.html). Он может быть полезен разработчикам, которые хотят использовать ClickHouse в качестве хранилища данных для Graphite.

Вы можете использовать любой движок таблицы ClickHouse для хранения данных Graphite, если вам не нужен rollup, но если rollup необходим, используйте `GraphiteMergeTree`. Движок уменьшает объем хранимых данных и увеличивает эффективность запросов из Graphite.

Движок наследует свойства от [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md).

## Создание таблицы {#creating-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    Path String,
    Time DateTime,
    Value Float64,
    Version <Numeric_type>
    ...
) ENGINE = GraphiteMergeTree(config_section)
[PARTITION BY expr]
[ORDER BY expr]
[SAMPLE BY expr]
[SETTINGS name=value, ...]
```

Смотрите подробное описание запроса [CREATE TABLE](/sql-reference/statements/create/table).

Таблица для данных Graphite должна содержать следующие столбцы для следующих данных:

- Название метрики (датчик Graphite). Тип данных: `String`.

- Время измерения метрики. Тип данных: `DateTime`.

- Значение метрики. Тип данных: `Float64`.

- Версия метрики. Тип данных: любой числовой (ClickHouse сохраняет строки с наивысшей версией или последнюю записанную, если версии совпадают. Остальные строки удаляются во время слияния частей данных).

Названия этих столбцов должны быть указаны в конфигурации rollup.

**Параметры GraphiteMergeTree**

- `config_section` — Название секции в файле конфигурации, где установлены правила rollup.

**Клаузы запроса**

При создании таблицы `GraphiteMergeTree` требуются те же [клаузы](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table), что и при создании таблицы `MergeTree`.

<details markdown="1">

<summary>Устаревший метод создания таблицы</summary>

:::note
Не используйте этот метод в новых проектах и, если возможно, переведите старые проекты на описанный выше метод.
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    EventDate Date,
    Path String,
    Time DateTime,
    Value Float64,
    Version <Numeric_type>
    ...
) ENGINE [=] GraphiteMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, config_section)
```

Все параметры, кроме `config_section`, имеют то же значение, что и в `MergeTree`.

- `config_section` — Название секции в файле конфигурации, где установлены правила rollup.

</details>

## Конфигурация Rollup {#rollup-configuration}

Настройки для rollup определяются параметром [graphite_rollup](../../../operations/server-configuration-parameters/settings.md#graphite) в конфигурации сервера. Название параметра может быть любым. Вы можете создать несколько конфигураций и использовать их для различных таблиц.

Структура конфигурации rollup:

      required-columns
      patterns

### Обязательные столбцы {#required-columns}

#### path_column_name {#path_column_name}

`path_column_name` — Название столбца, хранящего название метрики (датчик Graphite). Значение по умолчанию: `Path`.

#### time_column_name {#time_column_name}
`time_column_name` — Название столбца, хранящего время измерения метрики. Значение по умолчанию: `Time`.

#### value_column_name {#value_column_name}
`value_column_name` — Название столбца, хранящего значение метрики в момент времени, указанном в `time_column_name`. Значение по умолчанию: `Value`.

#### version_column_name {#version_column_name}
`version_column_name` — Название столбца, хранящего версию метрики. Значение по умолчанию: `Timestamp`.

### Шаблоны {#patterns}

Структура секции `patterns`:

```text
pattern
    rule_type
    regexp
    function
pattern
    rule_type
    regexp
    age + precision
    ...
pattern
    rule_type
    regexp
    function
    age + precision
    ...
pattern
    ...
default
    function
    age + precision
    ...
```

:::important
Шаблоны должны быть строго упорядочены:

1. Шаблоны без `function` или `retention`.
1. Шаблоны с обеими `function` и `retention`.
1. Шаблон `default`.
:::

При обработке строки ClickHouse проверяет правила в секциях `pattern`. Каждая из секций `pattern` (включая `default`) может содержать параметр `function` для агрегации, параметры `retention` или оба. Если название метрики соответствует `regexp`, применяются правила из секции (или секций) `pattern`; в противном случае применяются правила из секции `default`.

Поля для секций `pattern` и `default`:

- `rule_type` - тип правила. Он применяется только к определенной метрике. Движок использует его, чтобы отделить обычные и тегированные метрики. Необязательный параметр. Значение по умолчанию: `all`.
Его не обязательно указывать, когда производительность не критична или используется только один тип метрики, например, обычные метрики. По умолчанию создается только один набор правил. В противном случае, если существует любой из специальных типов, создаются два разных набора. Один для обычных метрик (root.branch.leaf) и один для тегированных метрик (root.branch.leaf;tag1=value1).
Обычно правила по умолчанию попадают в оба набора.
Допустимые значения:
    - `all` (по умолчанию) - универсальное правило, используется, когда `rule_type` опущен.
    - `plain` - правило для обычных метрик. Поле `regexp` обрабатывается как регулярное выражение.
    - `tagged` - правило для тегированных метрик (метрики хранятся в БД в формате `someName?tag1=value1&tag2=value2&tag3=value3`). Регулярное выражение должно быть отсортировано по именам тегов, первый тег должен быть `__name__`, если он существует. Поле `regexp` обрабатывается как регулярное выражение.
    - `tag_list` - правило для тегированных метрик, простой DSL для более простого описания метрики в формате graphite `someName;tag1=value1;tag2=value2`, `someName`, или `tag1=value1;tag2=value2`. Поле `regexp` переводится в правило `tagged`. Сортировка по именам тегов не требуется, она будет выполнена автоматически. Значение тега (но не его имя) может быть установлено как регулярное выражение, например, `env=(dev|staging)`.
- `regexp` – Шаблон для названия метрики (обычный или DSL).
- `age` – Минимальный возраст данных в секундах.
- `precision`– Насколько точно определить возраст данных в секундах. Должен быть делителем для 86400 (секунд в дне).
- `function` – Название агрегационной функции, применяемой к данным, возраст которых попадает в диапазон `[age, age + precision]`. Допустимые функции: min / max / any / avg. Среднее значение рассчитывается неточно, как среднее из средних.

### Пример конфигурации без типов правил {#configuration-example}

```xml
<graphite_rollup>
    <version_column_name>Version</version_column_name>
    <pattern>
        <regexp>click_cost</regexp>
        <function>any</function>
        <retention>
            <age>0</age>
            <precision>5</precision>
        </retention>
        <retention>
            <age>86400</age>
            <precision>60</precision>
        </retention>
    </pattern>
    <default>
        <function>max</function>
        <retention>
            <age>0</age>
            <precision>60</precision>
        </retention>
        <retention>
            <age>3600</age>
            <precision>300</precision>
        </retention>
        <retention>
            <age>86400</age>
            <precision>3600</precision>
        </retention>
    </default>
</graphite_rollup>
```

### Пример конфигурации с типами правил {#configuration-typed-example}

```xml
<graphite_rollup>
    <version_column_name>Version</version_column_name>
    <pattern>
        <rule_type>plain</rule_type>
        <regexp>click_cost</regexp>
        <function>any</function>
        <retention>
            <age>0</age>
            <precision>5</precision>
        </retention>
        <retention>
            <age>86400</age>
            <precision>60</precision>
        </retention>
    </pattern>
    <pattern>
        <rule_type>tagged</rule_type>
        <regexp>^((.*)|.)min\?</regexp>
        <function>min</function>
        <retention>
            <age>0</age>
            <precision>5</precision>
        </retention>
        <retention>
            <age>86400</age>
            <precision>60</precision>
        </retention>
    </pattern>
    <pattern>
        <rule_type>tagged</rule_type>
        <regexp><![CDATA[^someName\?(.*&)*tag1=value1(&|$)]]></regexp>
        <function>min</function>
        <retention>
            <age>0</age>
            <precision>5</precision>
        </retention>
        <retention>
            <age>86400</age>
            <precision>60</precision>
        </retention>
    </pattern>
    <pattern>
        <rule_type>tag_list</rule_type>
        <regexp>someName;tag2=value2</regexp>
        <retention>
            <age>0</age>
            <precision>5</precision>
        </retention>
        <retention>
            <age>86400</age>
            <precision>60</precision>
        </retention>
    </pattern>
    <default>
        <function>max</function>
        <retention>
            <age>0</age>
            <precision>60</precision>
        </retention>
        <retention>
            <age>3600</age>
            <precision>300</precision>
        </retention>
        <retention>
            <age>86400</age>
            <precision>3600</precision>
        </retention>
    </default>
</graphite_rollup>
```

:::note
Агрегация данных выполняется во время слияний. Обычно для старых партиций слияния не запускаются, поэтому для агрегации необходимо инициировать незапланированное слияние с помощью [optimize](../../../sql-reference/statements/optimize.md). Также можно использовать дополнительные инструменты, например [graphite-ch-optimizer](https://github.com/innogames/graphite-ch-optimizer).
:::
