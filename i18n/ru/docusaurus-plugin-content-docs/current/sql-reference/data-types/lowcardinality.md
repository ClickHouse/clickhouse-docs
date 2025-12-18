---
description: 'Документация по оптимизации LowCardinality для строковых столбцов'
sidebar_label: 'LowCardinality(T)'
sidebar_position: 42
slug: /sql-reference/data-types/lowcardinality
title: 'LowCardinality(T)'
doc_type: 'reference'
---

# LowCardinality(T) {#lowcardinalityt}

Изменяет внутреннее представление других типов данных на представление с использованием словарной кодировки.

## Синтаксис {#syntax}

```sql
LowCardinality(data_type)
```

**Параметры**

* `data_type` — [String](../../sql-reference/data-types/string.md), [FixedString](../../sql-reference/data-types/fixedstring.md), [Date](../../sql-reference/data-types/date.md), [DateTime](../../sql-reference/data-types/datetime.md) и числовые типы данных, за исключением [Decimal](../../sql-reference/data-types/decimal.md). `LowCardinality` неэффективен для некоторых типов данных, см. описание настройки [allow&#95;suspicious&#95;low&#95;cardinality&#95;types](../../operations/settings/settings.md#allow_suspicious_low_cardinality_types).


## Описание {#description}

`LowCardinality` — это надстройка, которая изменяет способ хранения данных и правила их обработки. ClickHouse применяет [словарное кодирование](https://en.wikipedia.org/wiki/Dictionary_coder) к столбцам типа `LowCardinality`. Работа со словарно закодированными данными существенно повышает производительность выполнения запросов [SELECT](../../sql-reference/statements/select/index.md) для многих приложений.

Эффективность использования типа данных `LowCardinality` зависит от разнообразия данных. Если словарь содержит менее 10 000 различных значений, ClickHouse в большинстве случаев показывает более высокую эффективность чтения и хранения данных. Если словарь содержит более 100 000 различных значений, ClickHouse может работать хуже по сравнению с использованием обычных типов данных.

Рассмотрите возможность использования `LowCardinality` вместо [Enum](../../sql-reference/data-types/enum.md) при работе со строками. `LowCardinality` обеспечивает большую гибкость в использовании и часто демонстрирует такую же или более высокую эффективность.

## Пример {#example}

Создайте таблицу со столбцом типа `LowCardinality`:

```sql
CREATE TABLE lc_t
(
    `id` UInt16,
    `strings` LowCardinality(String)
)
ENGINE = MergeTree()
ORDER BY id
```


## Связанные настройки и функции {#related-settings-and-functions}

Настройки:

- [low_cardinality_max_dictionary_size](../../operations/settings/settings.md#low_cardinality_max_dictionary_size)
- [low_cardinality_use_single_dictionary_for_part](../../operations/settings/settings.md#low_cardinality_use_single_dictionary_for_part)
- [low_cardinality_allow_in_native_format](../../operations/settings/settings.md#low_cardinality_allow_in_native_format)
- [allow_suspicious_low_cardinality_types](../../operations/settings/settings.md#allow_suspicious_low_cardinality_types)
- [output_format_arrow_low_cardinality_as_dictionary](/operations/settings/formats#output_format_arrow_low_cardinality_as_dictionary)

Функции:

- [toLowCardinality](../../sql-reference/functions/type-conversion-functions.md#toLowCardinality)

## Связанные материалы {#related-content}

- Блог: [Оптимизация ClickHouse с помощью схем и кодеков](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)
- Блог: [Работа с временными рядами в ClickHouse](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
- [Оптимизация строк (видеодоклад на русском)](https://youtu.be/rqf-ILRgBdY?list=PL0Z2YDlm0b3iwXCpEFiOOYmwXzVmjJfEt). [Слайды на английском](https://github.com/ClickHouse/clickhouse-presentations/raw/master/meetup19/string_optimization.pdf)