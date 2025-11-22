---
description: 'Документация по оператору HAVING'
sidebar_label: 'HAVING'
slug: /sql-reference/statements/select/having
title: 'Оператор HAVING'
doc_type: 'reference'
---



# Предложение HAVING

Позволяет фильтровать результаты агрегации, полученные с помощью [GROUP BY](/sql-reference/statements/select/group-by). Похоже на предложение [WHERE](../../../sql-reference/statements/select/where.md), но отличие в том, что `WHERE` применяется до агрегации, а `HAVING` — после неё.

В `HAVING` можно ссылаться на результаты агрегации из предложения `SELECT` по их псевдонимам. Кроме того, предложение `HAVING` может фильтровать результаты дополнительных агрегатных функций, которые не возвращаются в результатах запроса.



## Пример {#example}

Если у вас есть таблица `sales` следующего вида:

```sql
CREATE TABLE sales
(
    region String,
    salesperson String,
    amount Float64
)
ORDER BY (region, salesperson);
```


Запрос можно выполнить следующим образом:

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

Будут выведены продавцы с общим объёмом продаж более 10 000 в их регионе.

## Ограничения {#limitations}

`HAVING` нельзя использовать без агрегации. В этом случае используйте `WHERE`.
