---
slug: '/sql-reference/aggregate-functions/reference/anyheavy'
sidebar_position: 104
description: 'Использует алгоритм heavy hitters для выбора часто встречающегося'
title: anyHeavy
doc_type: reference
---
# anyHeavy

Выбирает часто встречающееся значение с помощью алгоритма [heavy hitters](https://doi.org/10.1145/762471.762473). Если существует значение, которое встречается более чем в половине случаев в каждом из потоков выполнения запроса, это значение возвращается. Обычно результат является недетерминированным.

```sql
anyHeavy(column)
```

**Аргументы**

- `column` – Имя колонки.

**Пример**

Возьмите набор данных [OnTime](../../../getting-started/example-datasets/ontime.md) и выберите любое часто встречающееся значение в колонке `AirlineID`.

```sql
SELECT anyHeavy(AirlineID) AS res
FROM ontime
```

```text
┌───res─┐
│ 19690 │
└───────┘
```