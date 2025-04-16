---
description: 'Документация для LIMIT Clause'
sidebar_label: 'LIMIT'
slug: /sql-reference/statements/select/limit
title: 'LIMIT Clause'
---


# LIMIT Clause

`LIMIT m` позволяет выбрать первые `m` строк из результата.

`LIMIT n, m` позволяет выбрать `m` строк из результата, пропустив первые `n` строк. Синтаксис `LIMIT m OFFSET n` эквивалентен.

`n` и `m` должны быть неотрицательными целыми числами.

Если нет [ORDER BY](../../../sql-reference/statements/select/order-by.md) клаузулы, которая явно сортирует результаты, выбор строк для результата может быть произвольным и недетерминированным.

:::note    
Количество строк в результате также может зависеть от настройки [limit](../../../operations/settings/settings.md#limit).
:::

## LIMIT ... WITH TIES Модификатор {#limit--with-ties-modifier}

Когда вы устанавливаете модификатор `WITH TIES` для `LIMIT n[,m]` и указываете `ORDER BY expr_list`, вы получите в результате первые `n` или `n,m` строк и все строки, где значения полей `ORDER BY` равны строке на позиции `n` для `LIMIT n` и `m` для `LIMIT n,m`.

Этот модификатор также может комбинироваться с [ORDER BY ... WITH FILL модификатором](/sql-reference/statements/select/order-by#order-by-expr-with-fill-modifier).

Например, следующий запрос

```sql
SELECT * FROM (
    SELECT number%50 AS n FROM numbers(100)
) ORDER BY n LIMIT 0,5
```

возвращает

```text
┌─n─┐
│ 0 │
│ 0 │
│ 1 │
│ 1 │
│ 2 │
└───┘
```

но после применения модификатора `WITH TIES`

```sql
SELECT * FROM (
    SELECT number%50 AS n FROM numbers(100)
) ORDER BY n LIMIT 0,5 WITH TIES
```

он возвращает другой набор строк

```text
┌─n─┐
│ 0 │
│ 0 │
│ 1 │
│ 1 │
│ 2 │
│ 2 │
└───┘
```

поскольку строка номер 6 имеет то же значение "2" для поля `n`, что и строка номер 5.
