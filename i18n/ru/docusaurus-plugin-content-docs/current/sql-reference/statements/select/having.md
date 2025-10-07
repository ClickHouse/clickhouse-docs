---
slug: '/sql-reference/statements/select/having'
sidebar_label: HAVING
description: 'Документация для HAVING Clause'
title: 'Оператор HAVING'
doc_type: reference
---
# Условие HAVING

Позволяет фильтровать результаты агрегации, полученные с помощью [GROUP BY](/sql-reference/statements/select/group-by). Оно аналогично условию [WHERE](../../../sql-reference/statements/select/where.md), но разница заключается в том, что `WHERE` выполняется до агрегации, тогда как `HAVING` выполняется после неё.

Возможно ссылаться на результаты агрегации из условия `SELECT` в условии `HAVING` по их псевдониму. Кроме того, условие `HAVING` может фильтровать результаты дополнительных агрегаций, которые не возвращаются в результатах запроса.

## Ограничения {#limitations}

`HAVING` не может быть использовано, если агрегация не выполняется. Используйте `WHERE` вместо этого.