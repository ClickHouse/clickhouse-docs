---
description: 'Вычисляет точное число различных значений аргумента.'
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

Используйте функцию `uniqExact`, только если вам абсолютно необходим точный результат. В остальных случаях используйте функцию [uniq](/sql-reference/aggregate-functions/reference/uniq).

Функция `uniqExact` использует больше памяти, чем `uniq`, поскольку размер состояния неограниченно увеличивается по мере роста количества различных значений.

**Аргументы**

Функция принимает переменное количество параметров. Параметрами могут быть значения типов `Tuple`, `Array`, `Date`, `DateTime`, `String` или числовых типов.

**Пример**

В этом примере мы используем функцию `uniqExact`, чтобы подсчитать количество уникальных кодов типов (краткий идентификатор типа самолёта) в [наборе данных OpenSky](https://sql.clickhouse.com?query=U0VMRUNUIHVuaXFFeGFjdCh0eXBlY29kZSkgRlJPTSBvcGVuc2t5Lm9wZW5za3k&).

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
