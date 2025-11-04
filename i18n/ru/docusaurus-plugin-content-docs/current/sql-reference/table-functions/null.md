---
slug: '/sql-reference/table-functions/null'
sidebar_label: 'null функция'
sidebar_position: 140
description: 'Создает временную таблицу заданной структуры с движком таблицы Null.'
title: 'null'
doc_type: reference
---
# Функция Таблицы null

Создает временную таблицу заданной структуры с помощью движка таблицы [Null](../../engines/table-engines/special/null.md). В соответствии с свойствами движка `Null` данные таблицы игнорируются, и сама таблица немедленно удаляется сразу после выполнения запроса. Функция используется для удобства написания тестов и демонстраций.

## Синтаксис {#syntax}

```sql
null('structure')
```

## Аргумент {#argument}

- `structure` — Список колонок и типов колонок. [String](../../sql-reference/data-types/string.md).

## Возвращаемое значение {#returned_value}

Временная таблица с движком `Null` заданной структуры.

## Пример {#example}

Запрос с функцией `null`:

```sql
INSERT INTO function null('x UInt64') SELECT * FROM numbers_mt(1000000000);
```
может заменить три запроса:

```sql
CREATE TABLE t (x UInt64) ENGINE = Null;
INSERT INTO t SELECT * FROM numbers_mt(1000000000);
DROP TABLE IF EXISTS t;
```

## Связанные {#related}

- [Движок таблицы Null](../../engines/table-engines/special/null.md)