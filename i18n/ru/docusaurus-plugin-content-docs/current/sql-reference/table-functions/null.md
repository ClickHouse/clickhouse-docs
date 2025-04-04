---
description: 'Создает временную таблицу заданной структуры с движком таблицы Null. Функция используется для удобства написания тестов и демонстраций.'
sidebar_label: 'null функция'
sidebar_position: 140
slug: /sql-reference/table-functions/null
title: 'null'
---


# null Функция Таблицы

Создает временную таблицу заданной структуры с движком таблицы [Null](../../engines/table-engines/special/null.md). В соответствии со свойствами движка `Null`, данные таблицы игнорируются, и сама таблица сразу удаляется после выполнения запроса. Функция используется для удобства написания тестов и демонстраций.

**Синтаксис**

```sql
null('structure')
```

**Параметр**

- `structure` — Список колонок и типов колонок. [Строка](../../sql-reference/data-types/string.md).

**Возвращаемое значение**

Временная таблица с движком `Null` с заданной структурой.

**Пример**

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

См. также:

- [Движок таблицы Null](../../engines/table-engines/special/null.md)
