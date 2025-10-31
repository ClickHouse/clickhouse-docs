---
slug: '/sql-reference/aggregate-functions/reference/uniqexact'
sidebar_position: 207
description: 'Вычисляет точное количество различных значений аргументов.'
title: uniqExact
doc_type: reference
---
# uniqExact

Вычисляет точное количество различных значений аргументов.

```sql
uniqExact(x[, ...])
```

Используйте функцию `uniqExact`, если вам абсолютно нужен точный результат. В противном случае используйте функцию [uniq](/sql-reference/aggregate-functions/reference/uniq).

Функция `uniqExact` использует больше памяти, чем `uniq`, потому что размер состояния не ограничен и растет с увеличением количества различных значений.

**Аргументы**

Функция принимает переменное количество параметров. Параметры могут быть типов `Tuple`, `Array`, `Date`, `DateTime`, `String` или числовых типов.

**Пример**

В этом примере мы используем функцию `uniqExact`, чтобы подсчитать количество уникальных кодов типов (короткий идентификатор типа воздушного судна) в наборе данных [opensky](https://sql.clickhouse.com?query=U0VMRUNUIHVuaXFFeGFjdCh0eXBlY29kZSkgRlJPTSBvcGVuc2t5Lm9wZW5za3k&).

```sql title="Query"
SELECT uniqExact(typecode) FROM opensky.opensky
```

```response title="Response"
1106
```

**Смотрите также**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)