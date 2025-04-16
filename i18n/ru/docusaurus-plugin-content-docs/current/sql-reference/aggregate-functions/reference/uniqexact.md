---
description: 'Вычисляет точное количество различных значений аргументов.'
sidebar_position: 207
slug: /sql-reference/aggregate-functions/reference/uniqexact
title: 'uniqExact'
---


# uniqExact

Вычисляет точное количество различных значений аргументов.

```sql
uniqExact(x[, ...])
```

Используйте функцию `uniqExact`, если вам абсолютно необходим точный результат. В противном случае используйте функцию [uniq](/sql-reference/aggregate-functions/reference/uniq).

Функция `uniqExact` использует больше памяти, чем `uniq`, поскольку размер состояния неограниченно возрастает с увеличением количества различных значений.

**Аргументы**

Функция принимает переменное количество параметров. Параметры могут быть `Tuple`, `Array`, `Date`, `DateTime`, `String` или числовые типы.

**Пример**

В этом примере мы используем функцию `uniqExact`, чтобы подсчитать количество уникальных кодов типов (короткий идентификатор для типа самолета) в [наборе данных opensky](https://sql.clickhouse.com?query=U0VMRUNUIHVuaXFFeGFjdCh0eXBlY29kZSkgRlJPTSBvcGVuc2t5Lm9wZW5za3k&).

```sql title="Запрос"
SELECT uniqExact(typecode) FROM opensky.opensky
```

```response title="Ответ"
1106
```

**См. также**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
