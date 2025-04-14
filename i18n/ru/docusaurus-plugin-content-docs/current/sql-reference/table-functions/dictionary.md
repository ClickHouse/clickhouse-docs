---
description: 'Отображает данные словаря в виде таблицы ClickHouse. Работает так же, как и движок Dictionary.'
sidebar_label: 'словарь'
sidebar_position: 47
slug: /sql-reference/table-functions/dictionary
title: 'словарь'
---


# Функция Таблицы dictionary

Отображает данные [словаря](../../sql-reference/dictionaries/index.md) в виде таблицы ClickHouse. Работает так же, как и движок [Dictionary](../../engines/table-engines/special/dictionary.md).

**Синтаксис**

```sql
dictionary('dict')
```

**Аргументы**

- `dict` — Имя словаря. [Строка](../../sql-reference/data-types/string.md).

**Возвращаемое значение**

Таблица ClickHouse.

**Пример**

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

**См. Также**

- [Движок Dictionary](/engines/table-engines/special/dictionary)
