---
description: 'Вычисляет точное количество различных значений аргумента.'
sidebar_position: 207
slug: /sql-reference/aggregate-functions/reference/uniqexact
title: 'uniqExact'
---


# uniqExact

Вычисляет точное количество различных значений аргумента.

```sql
uniqExact(x[, ...])
```

Используйте функцию `uniqExact`, если вам абсолютно необходим точный результат. В противном случае используйте функцию [uniq](/sql-reference/aggregate-functions/reference/uniq).

Функция `uniqExact` использует больше памяти, чем `uniq`, потому что размер состояния неограниченно растет с увеличением количества различных значений.

**Аргументы**

Функция принимает переменное количество параметров. Параметры могут быть типа `Tuple`, `Array`, `Date`, `DateTime`, `String` или числовых типов.

**Пример**

В этом примере мы воспользуемся функцией `uniqExact`, чтобы подсчитать количество уникальных кодов типов (короткий идентификатор типа самолета) в [наборе данных opensky](https://sql.clickhouse.com?query=U0VMRUNUIHVuaXFFeGFjdCh0eXBlY29kZSkgRlJPTSBvcGVuc2t5Lm9wZW5za3k&).

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
