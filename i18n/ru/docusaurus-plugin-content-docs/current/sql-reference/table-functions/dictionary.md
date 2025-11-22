---
description: 'Отображает данные словаря как таблицу ClickHouse. Работает аналогично движку Dictionary.'
sidebar_label: 'dictionary'
sidebar_position: 47
slug: /sql-reference/table-functions/dictionary
title: 'dictionary'
doc_type: 'reference'
---



# Табличная функция dictionary

Отображает данные [словаря](../../sql-reference/dictionaries/index.md) в виде таблицы ClickHouse. Работает так же, как движок [Dictionary](../../engines/table-engines/special/dictionary.md).



## Синтаксис {#syntax}

```sql
dictionary('dict')
```


## Аргументы {#arguments}

- `dict` — имя словаря. [String](../../sql-reference/data-types/string.md).


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


## Связанное {#related}

- [Движок Dictionary](/engines/table-engines/special/dictionary)
