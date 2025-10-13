---
slug: '/sql-reference/statements/select/limit'
sidebar_label: LIMIT
description: 'Документация для LIMIT оператор'
title: 'LIMIT Clause'
doc_type: reference
---
# LIMIT Оператор

`LIMIT m` позволяет выбирать первые `m` строк из результата.

`LIMIT n, m` позволяет выбирать `m` строк из результата после пропуска первых `n` строк. Синтаксис `LIMIT m OFFSET n` эквивалентен.

`n` и `m` должны быть неотрицательными целыми числами.

Если нет [ORDER BY](../../../sql-reference/statements/select/order-by.md) оператора, который явно сортирует результаты, выбор строк для результата может быть произвольным и недетерминированным.

:::note    
Количество строк в наборе результатов также может зависеть от настройки [limit](../../../operations/settings/settings.md#limit).
:::

## Модификатор LIMIT ... WITH TIES {#limit--with-ties-modifier}

Когда вы устанавливаете модификатор `WITH TIES` для `LIMIT n[,m]` и указываете `ORDER BY expr_list`, вы получите в результате первые `n` или `n,m` строк и все строки с такими же значениями полей `ORDER BY`, как у строки на позиции `n` для `LIMIT n` и `m` для `LIMIT n,m`.

Этот модификатор также может быть объединен с [ORDER BY ... WITH FILL модификатором](/sql-reference/statements/select/order-by#order-by-expr-with-fill-modifier).

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

возвращает другой набор строк

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

так как строка номер 6 имеет такое же значение "2" для поля `n`, как и строка номер 5.