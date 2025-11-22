---
description: 'Документация по предложению INTERSECT'
sidebar_label: 'INTERSECT'
slug: /sql-reference/statements/select/intersect
title: 'Предложение INTERSECT'
doc_type: 'reference'
---



# Оператор INTERSECT

Клауза `INTERSECT` возвращает только те строки, которые присутствуют в результатах и первого, и второго запроса. Запросы должны совпадать по количеству столбцов, их порядку и типам данных. Результат `INTERSECT` может содержать повторяющиеся строки.

Несколько операторов `INTERSECT` выполняются слева направо, если скобки не используются. Оператор `INTERSECT` имеет более высокий приоритет, чем операторы `UNION` и `EXCEPT`.

```sql
SELECT column1 [, column2 ]
FROM table1
[WHERE condition]

INTERSECT

SELECT column1 [, column2 ]
FROM table2
[WHERE condition]

```

Условие может представлять собой любое выражение, соответствующее вашим требованиям.


## Примеры {#examples}

Вот простой пример пересечения чисел от 1 до 10 с числами от 3 до 8:

```sql
SELECT number FROM numbers(1,10) INTERSECT SELECT number FROM numbers(3,8);
```

Результат:

```response
┌─number─┐
│      3 │
│      4 │
│      5 │
│      6 │
│      7 │
│      8 │
└────────┘
```

`INTERSECT` полезен, если у вас есть две таблицы с общим столбцом (или столбцами). Вы можете пересечь результаты двух запросов при условии, что результаты содержат одинаковые столбцы. Например, предположим, что у нас есть несколько миллионов строк исторических данных о криптовалютах, содержащих цены торгов и объёмы:

```sql
CREATE TABLE crypto_prices
(
    trade_date Date,
    crypto_name String,
    volume Float32,
    price Float32,
    market_cap Float32,
    change_1_day Float32
)
ENGINE = MergeTree
PRIMARY KEY (crypto_name, trade_date);

INSERT INTO crypto_prices
   SELECT *
   FROM s3(
    'https://learn-clickhouse.s3.us-east-2.amazonaws.com/crypto_prices.csv',
    'CSVWithNames'
);

SELECT * FROM crypto_prices
WHERE crypto_name = 'Bitcoin'
ORDER BY trade_date DESC
LIMIT 10;
```

```response
┌─trade_date─┬─crypto_name─┬──────volume─┬────price─┬───market_cap─┬──change_1_day─┐
│ 2020-11-02 │ Bitcoin     │ 30771456000 │ 13550.49 │ 251119860000 │  -0.013585099 │
│ 2020-11-01 │ Bitcoin     │ 24453857000 │ 13737.11 │ 254569760000 │ -0.0031840964 │
│ 2020-10-31 │ Bitcoin     │ 30306464000 │ 13780.99 │ 255372070000 │   0.017308505 │
│ 2020-10-30 │ Bitcoin     │ 30581486000 │ 13546.52 │ 251018150000 │   0.008084608 │
│ 2020-10-29 │ Bitcoin     │ 56499500000 │ 13437.88 │ 248995320000 │   0.012552661 │
│ 2020-10-28 │ Bitcoin     │ 35867320000 │ 13271.29 │ 245899820000 │   -0.02804481 │
│ 2020-10-27 │ Bitcoin     │ 33749879000 │ 13654.22 │ 252985950000 │    0.04427984 │
│ 2020-10-26 │ Bitcoin     │ 29461459000 │ 13075.25 │ 242251000000 │  0.0033826586 │
│ 2020-10-25 │ Bitcoin     │ 24406921000 │ 13031.17 │ 241425220000 │ -0.0058658565 │
│ 2020-10-24 │ Bitcoin     │ 24542319000 │ 13108.06 │ 242839880000 │   0.013650347 │
└────────────┴─────────────┴─────────────┴──────────┴──────────────┴───────────────┘
```

Теперь предположим, что у нас есть таблица `holdings`, содержащая список криптовалют, которыми мы владеем, вместе с количеством монет:

```sql
CREATE TABLE holdings
(
    crypto_name String,
    quantity UInt64
)
ENGINE = MergeTree
PRIMARY KEY (crypto_name);

INSERT INTO holdings VALUES
   ('Bitcoin', 1000),
   ('Bitcoin', 200),
   ('Ethereum', 250),
   ('Ethereum', 5000),
   ('DOGEFI', 10);
   ('Bitcoin Diamond', 5000);
```

Мы можем использовать `INTERSECT` для ответа на такие вопросы, как **«Какими монетами мы владеем, которые торговались по цене выше $100?»**:

```sql
SELECT crypto_name FROM holdings
INTERSECT
SELECT crypto_name FROM crypto_prices
WHERE price > 100
```

Результат:

```response
┌─crypto_name─┐
│ Bitcoin     │
│ Bitcoin     │
│ Ethereum    │
│ Ethereum    │
└─────────────┘
```


Это означает, что в какой‑то момент Bitcoin и Ethereum торговались по цене выше $100, а DOGEFI и Bitcoin Diamond никогда не торговались выше $100 (по крайней мере, согласно данным, которые у нас есть в этом примере).



## INTERSECT DISTINCT {#intersect-distinct}

Обратите внимание, что в предыдущем запросе у нас было несколько записей о владении Bitcoin и Ethereum, которые торговались выше $100. Было бы удобно удалить дублирующиеся строки (поскольку они лишь повторяют уже известную информацию). Вы можете добавить `DISTINCT` к `INTERSECT`, чтобы исключить дублирующиеся строки из результата:

```sql
SELECT crypto_name FROM holdings
INTERSECT DISTINCT
SELECT crypto_name FROM crypto_prices
WHERE price > 100;
```

Результат:

```response
┌─crypto_name─┐
│ Bitcoin     │
│ Ethereum    │
└─────────────┘
```

**См. также**

- [UNION](/sql-reference/statements/select/union)
- [EXCEPT](/sql-reference/statements/select/except)
