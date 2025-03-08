---
slug: /sql-reference/table-functions/dictionary
sidebar_position: 47
sidebar_label: dictionary
title: 'dictionary'
description: 'Отображает данные словаря как таблицу ClickHouse. Работает так же, как механизм Dictionary.'
---


# Функция таблицы dictionary

Отображает данные [словаря](../../sql-reference/dictionaries/index.md) как таблицу ClickHouse. Работает так же, как механизм [Dictionary](../../engines/table-engines/special/dictionary.md).

**Синтаксис**

``` sql
dictionary('dict')
```

**Аргументы**

- `dict` — Название словаря. [Строка](../../sql-reference/data-types/string.md).

**Возвращаемое значение**

Таблица ClickHouse.

**Пример**

Входная таблица `dictionary_source_table`:

``` text
┌─id─┬─value─┐
│  0 │     0 │
│  1 │     1 │
└────┴───────┘
```

Создание словаря:

``` sql
CREATE DICTIONARY new_dictionary(id UInt64, value UInt64 DEFAULT 0) PRIMARY KEY id
SOURCE(CLICKHOUSE(HOST 'localhost' PORT tcpPort() USER 'default' TABLE 'dictionary_source_table')) LAYOUT(DIRECT());
```

Запрос:

``` sql
SELECT * FROM dictionary('new_dictionary');
```

Результат:

``` text
┌─id─┬─value─┐
│  0 │     0 │
│  1 │     1 │
└────┴───────┘
```

**См. также**

- [Механизм Dictionary](/engines/table-engines/special/dictionary)
