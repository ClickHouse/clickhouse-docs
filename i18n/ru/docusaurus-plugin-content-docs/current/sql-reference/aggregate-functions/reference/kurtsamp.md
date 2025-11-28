---
description: 'Вычисляет выборочный эксцесс последовательности.'
sidebar_position: 158
slug: /sql-reference/aggregate-functions/reference/kurtsamp
title: 'kurtSamp'
doc_type: 'reference'
---

# kurtSamp

Вычисляет [выборочный эксцесс](https://ru.wikipedia.org/wiki/Эксцесс_распределения) последовательности.

Представляет собой несмещённую оценку эксцесса случайной величины, если переданные значения образуют её выборку. Подробнее: [https://en.wikipedia.org/wiki/Kurtosis](https://en.wikipedia.org/wiki/Kurtosis)

```sql
kurtSamp(expr)
```

**Аргументы**

`expr` — [выражение](/sql-reference/syntax#expressions), возвращающее число.

**Возвращаемое значение**

Эксцесс заданного распределения. Тип — [Float64](../../../sql-reference/data-types/float.md). Если `n <= 1` (`n` — размер выборки), то функция возвращает `nan`.

**Пример**

```sql
SELECT kurtSamp(value) FROM series_with_value_column;
```
