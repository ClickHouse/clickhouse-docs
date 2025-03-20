---
slug: /sql-reference/table-functions/null
sidebar_position: 140
sidebar_label: функция null
title: 'null'
description: "Создает временную таблицу заданной структуры с использованием движка таблицы Null. Функция используется для удобства написания тестов и демонстраций."
---


# Функция Таблицы null

Создает временную таблицу заданной структуры с использованием [Null](../../engines/table-engines/special/null.md) движка таблицы. Согласно свойствам движка `Null`, данные таблицы игнорируются, и сама таблица сразу же уничтожается после выполнения запроса. Функция используется для удобства написания тестов и демонстраций.

**Синтаксис**

``` sql
null('structure')
```

**Параметр**

- `structure` — Список колонок и типов колонок. [String](../../sql-reference/data-types/string.md).

**Возвращаемое значение**

Временная таблица с движком `Null` с заданной структурой.

**Пример**

Запрос с использованием функции `null`:

``` sql
INSERT INTO function null('x UInt64') SELECT * FROM numbers_mt(1000000000);
```
может заменить три запроса:

```sql
CREATE TABLE t (x UInt64) ENGINE = Null;
INSERT INTO t SELECT * FROM numbers_mt(1000000000);
DROP TABLE IF EXISTS t;
```

Смотрите также:

- [Движок таблицы Null](../../engines/table-engines/special/null.md)
