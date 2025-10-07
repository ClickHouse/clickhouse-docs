---
slug: '/sql-reference/table-functions/dictionary'
sidebar_label: словарь
sidebar_position: 47
description: 'Отображает данные словаря как таблицу ClickHouse. Работает так же,'
title: словарь
doc_type: reference
---
# Табличная функция словаря

Отображает данные [словаря](../../sql-reference/dictionaries/index.md) в виде таблицы ClickHouse. Работает так же, как и движок [Словарь](../../engines/table-engines/special/dictionary.md).

## Синтаксис {#syntax}

```sql
dictionary('dict')
```

## Аргументы {#arguments}

- `dict` — Имя словаря. [Строка](../../sql-reference/data-types/string.md).

## Возвращаемое значение {#returned_value}

Таблица ClickHouse.

## Примеры {#examples}

Входная таблица `dictionary_source_table`:

```text
┌─id─┬─value─┐
│  0 │     0 │
│  1 │     1 │
└────┴───────┘
```

Создайте словарь:

```sql
CREATE DICTIONARY new_dictionary(id UInt64, value UInt64 DEFAULT 0) PRIMARY KEY id
SOURCE(CLICKHOUSE(HOST 'localhost' PORT tcpPort() USER 'default' TABLE 'dictionary_source_table')) LAYOUT(DIRECT());
```

Запрос:

```sql
SELECT * FROM dictionary('new_dictionary');
```

Результат:

```text
┌─id─┬─value─┐
│  0 │     0 │
│  1 │     1 │
└────┴───────┘
```

## Связанные {#related}

- [Движок словаря](/engines/table-engines/special/dictionary)