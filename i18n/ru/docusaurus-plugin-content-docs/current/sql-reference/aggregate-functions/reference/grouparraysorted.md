---
slug: /sql-reference/aggregate-functions/reference/grouparraysorted
sidebar_position: 146
title: 'groupArraySorted'
description: 'Возвращает массив с первыми N элементами в порядке возрастания.'
---


# groupArraySorted

Возвращает массив с первыми N элементами в порядке возрастания.

``` sql
groupArraySorted(N)(column)
```

**Аргументы**

- `N` – Количество элементов для возврата.

- `column` – Значение (целое число, строка, число с плавающей запятой и другие универсальные типы).

**Пример**

Получает первые 10 чисел:

``` sql
SELECT groupArraySorted(10)(number) FROM numbers(100)
```

``` text
┌─groupArraySorted(10)(number)─┐
│ [0,1,2,3,4,5,6,7,8,9]        │
└──────────────────────────────┘
```

Получает все строковые реализации всех чисел в колонке:

``` sql
SELECT groupArraySorted(5)(str) FROM (SELECT toString(number) as str FROM numbers(5));
```

``` text
┌─groupArraySorted(5)(str)─┐
│ ['0','1','2','3','4']    │
└──────────────────────────┘
```
