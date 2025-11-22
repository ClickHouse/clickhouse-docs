---
description: 'Создает временную таблицу заданной структуры с табличным движком Null. Функция используется для удобства написания тестов и проведения демонстраций.'
sidebar_label: 'функция null'
sidebar_position: 140
slug: /sql-reference/table-functions/null
title: 'null'
doc_type: 'reference'
---



# Табличная функция null

Создает временную таблицу заданной структуры с движком таблицы [Null](../../engines/table-engines/special/null.md). В соответствии со свойствами движка `Null` данные таблицы игнорируются, а сама таблица немедленно удаляется сразу после выполнения запроса. Функция используется для удобства при написании тестов и проведении демонстраций.



## Синтаксис {#syntax}

```sql
null('structure')
```


## Аргумент {#argument}

- `structure` — список столбцов и их типов. [String](../../sql-reference/data-types/string.md).


## Возвращаемое значение {#returned_value}

Временная таблица с движком `Null` и указанной структурой.


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


## Связанные разделы {#related}

- [Движок таблиц Null](../../engines/table-engines/special/null.md)
