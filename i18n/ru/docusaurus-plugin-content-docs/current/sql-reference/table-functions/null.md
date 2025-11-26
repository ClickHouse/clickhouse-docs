---
description: 'Создаёт временную таблицу указанной структуры с табличным движком Null. Функция используется для удобства написания тестов и проведения демонстраций.'
sidebar_label: 'функция null'
sidebar_position: 140
slug: /sql-reference/table-functions/null
title: 'null'
doc_type: 'reference'
---



# Функция таблицы null

Создает временную таблицу указанной структуры с движком таблицы [Null](../../engines/table-engines/special/null.md). В соответствии со свойствами движка `Null` данные таблицы игнорируются, а сама таблица немедленно удаляется после выполнения запроса. Функция используется для удобства при написании тестов и проведении демонстраций.



## Синтаксис

```sql
null('structure')
```


## Аргумент {#argument}

- `structure` — список столбцов и их типов, строка типа [String](../../sql-reference/data-types/string.md).



## Возвращаемое значение {#returned_value}

Временная таблица движка `Null` с указанной структурой.



## Пример

Запрос с использованием функции `null`:

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

- [Движок таблицы Null](../../engines/table-engines/special/null.md)
