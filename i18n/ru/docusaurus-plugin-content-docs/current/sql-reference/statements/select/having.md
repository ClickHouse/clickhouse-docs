---
description: 'Описание оператора HAVING'
sidebar_label: 'HAVING'
slug: /sql-reference/statements/select/having
title: 'Оператор HAVING'
doc_type: 'reference'
---

# Предложение HAVING {#having-clause}

Позволяет фильтровать результаты агрегирования, полученные с помощью [GROUP BY](/sql-reference/statements/select/group-by). Оно похоже на предложение [WHERE](../../../sql-reference/statements/select/where.md), но разница в том, что `WHERE` выполняется до агрегирования, тогда как `HAVING` выполняется после него.

В предложении `HAVING` можно ссылаться на результаты агрегирования из списка `SELECT` по их псевдонимам. Либо предложение `HAVING` может фильтровать по результатам дополнительных агрегатных функций, которые не возвращаются в результатах запроса.

## Пример {#example}

Если у вас есть таблица `sales` следующей структуры:

```sql
CREATE TABLE sales
(
    region String,
    salesperson String,
    amount Float64
)
ORDER BY (region, salesperson);
```

Вы можете выполнить запрос следующим образом:

```sql
SELECT
    region,
    salesperson,
    sum(amount) AS total_sales
FROM sales
GROUP BY
    region,
    salesperson
HAVING total_sales > 10000
ORDER BY total_sales DESC;
```

Это выведет список продавцов с суммарным объемом продаж более 10 000 в их регионе.

## Ограничения {#limitations}

`HAVING` нельзя использовать, если не выполняется агрегация. Вместо этого используйте `WHERE`.
