---
description: 'Вычисляет точное количество различных значений аргумента.'
sidebar_position: 207
slug: /sql-reference/aggregate-functions/reference/uniqexact
title: 'uniqExact'
doc_type: 'reference'
---

# uniqExact

Вычисляет точное количество различных значений аргументов.

```sql
uniqExact(x[, ...])
```

Используйте функцию `uniqExact` только в том случае, если вам абсолютно необходим точный результат. В остальных случаях используйте функцию [uniq](/sql-reference/aggregate-functions/reference/uniq).

Функция `uniqExact` использует больше памяти, чем `uniq`, потому что состояние неограниченно растёт по мере увеличения числа различных значений.

**Аргументы**

Функция принимает переменное число параметров. Параметры могут иметь типы `Tuple`, `Array`, `Date`, `DateTime`, `String` или числовые типы.

**Пример**

В этом примере мы используем функцию `uniqExact`, чтобы посчитать количество уникальных кодов типов (краткий идентификатор типа самолёта) в [наборе данных OpenSky](https://sql.clickhouse.com?query=U0VMRUNUIHVuaXFFeGFjdCh0eXBlY29kZSkgRlJPTSBvcGVuc2t5Lm9wZW5za3k&).

```sql title="Query"
SELECT uniqExact(typecode) FROM opensky.opensky
```

```response title="Response"
1106
```

**См. также**

* [uniq](/sql-reference/aggregate-functions/reference/uniq)
* [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
* [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
* [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
