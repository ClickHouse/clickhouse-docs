---
description: 'Документация для оператора EXCEPT'
sidebar_label: 'EXCEPT'
slug: /sql-reference/statements/select/except
title: 'Оператор EXCEPT'
---


# Оператор EXCEPT

Оператор `EXCEPT` возвращает только те строки, которые получены из первого запроса без учета второго.

- Оба запроса должны иметь одинаковое количество столбцов в одном и том же порядке и типах данных.
- Результат `EXCEPT` может содержать дублирующиеся строки. Используйте `EXCEPT DISTINCT`, если это недопустимо.
- Несколько операторов `EXCEPT` выполняются слева направо, если не указаны скобки.
- Оператор `EXCEPT` имеет такой же приоритет, как и оператор `UNION`, и меньший приоритет, чем оператор `INTERSECT`.

## Синтаксис {#syntax}

```sql
SELECT column1 [, column2 ]
FROM table1
[WHERE condition]

EXCEPT

SELECT column1 [, column2 ]
FROM table2
[WHERE condition]
```
Условие может быть любым выражением, основанным на ваших требованиях.

Кроме того, `EXCEPT()` может использоваться для исключения столбцов из результата в одной и той же таблице, как это возможно в BigQuery (Google Cloud), с использованием следующего синтаксиса:

```sql
SELECT column1 [, column2 ] EXCEPT (column3 [, column4]) 
FROM table1 
[WHERE condition]
```

## Примеры {#examples}

Примеры в этом разделе демонстрируют использование оператора `EXCEPT`.

### Фильтрация чисел с помощью оператора `EXCEPT` {#filtering-numbers-using-the-except-clause}

Вот простой пример, который возвращает числа от 1 до 10, которые _не_ являются частью чисел от 3 до 8:

Запрос:

```sql
SELECT number
FROM numbers(1, 10)
EXCEPT
SELECT number
FROM numbers(3, 8)
```

Результат:

```response
┌─number─┐
│      1 │
│      2 │
│      9 │
│     10 │
└────────┘
```

### Исключение определенных столбцов с помощью `EXCEPT()` {#excluding-specific-columns-using-except}

`EXCEPT()` можно использовать для быстрого исключения столбцов из результата. Например, если мы хотим выбрать все столбцы из таблицы, кроме нескольких выбранных столбцов, как показано в примере ниже:

Запрос:

```sql
SHOW COLUMNS IN system.settings

SELECT * EXCEPT (default, alias_for, readonly, description)
FROM system.settings
LIMIT 5
```

Результат:

```response
    ┌─field───────┬─type─────────────────────────────────────────────────────────────────────┬─null─┬─key─┬─default─┬─extra─┐
 1. │ alias_for   │ String                                                                   │ NO   │     │ ᴺᵁᴸᴸ    │       │
 2. │ changed     │ UInt8                                                                    │ NO   │     │ ᴺᵁᴸᴸ    │       │
 3. │ default     │ String                                                                   │ NO   │     │ ᴺᵁᴸᴸ    │       │
 4. │ description │ String                                                                   │ NO   │     │ ᴺᵁᴸᴸ    │       │
 5. │ is_obsolete │ UInt8                                                                    │ NO   │     │ ᴺᵁᴸᴸ    │       │
 6. │ max         │ Nullable(String)                                                         │ YES  │     │ ᴺᵁᴸᴸ    │       │
 7. │ min         │ Nullable(String)                                                         │ YES  │     │ ᴺᵁᴸᴸ    │       │
 8. │ name        │ String                                                                   │ NO   │     │ ᴺᵁᴸᴸ    │       │
 9. │ readonly    │ UInt8                                                                    │ NO   │     │ ᴺᵁᴸᴸ    │       │
10. │ tier        │ Enum8('Production' = 0, 'Obsolete' = 4, 'Experimental' = 8, 'Beta' = 12) │ NO   │     │ ᴺᵁᴸᴸ    │       │
11. │ type        │ String                                                                   │ NO   │     │ ᴺᵁᴸᴸ    │       │
12. │ value       │ String                                                                   │ NO   │     │ ᴺᵁᴸᴸ    │       │
    └─────────────┴──────────────────────────────────────────────────────────────────────────┴──────┴─────┴─────────┴───────┘

   ┌─name────────────────────┬─value──────┬─changed─┬─min──┬─max──┬─type────┬─is_obsolete─┬─tier───────┐
1. │ dialect                 │ clickhouse │       0 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ Dialect │           0 │ Production │
2. │ min_compress_block_size │ 65536      │       0 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ UInt64  │           0 │ Production │
3. │ max_compress_block_size │ 1048576    │       0 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ UInt64  │           0 │ Production │
4. │ max_block_size          │ 65409      │       0 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ UInt64  │           0 │ Production │
5. │ max_insert_block_size   │ 1048449    │       0 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ UInt64  │           0 │ Production │
   └─────────────────────────┴────────────┴─────────┴──────┴──────┴─────────┴─────────────┴────────────┘
```

### Использование `EXCEPT` и `INTERSECT` с данными о криптовалюте {#using-except-and-intersect-with-cryptocurrency-data}

`EXCEPT` и `INTERSECT` часто можно использовать взаимозаменяемо с различной логикой булевых выражений, и они оба полезны, если у вас есть две таблицы, которые разделяют общий столбец (или столбцы). 
Например, предположим, что у нас есть несколько миллионов строк исторических данных о криптовалюте, которые содержат цены торгов и объем:

Запрос:

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

Результат:

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

Теперь предположим, что у нас есть таблица с названием `holdings`, которая содержит список криптовалют, которые мы владеем, вместе с количеством монет:

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
   ('DOGEFI', 10),
   ('Bitcoin Diamond', 5000);
```

Мы можем использовать `EXCEPT`, чтобы ответить на вопрос **"Какие монеты мы имеем, которые никогда не торговались ниже $10?"**:

```sql
SELECT crypto_name FROM holdings
EXCEPT
SELECT crypto_name FROM crypto_prices
WHERE price < 10;
```

Результат:

```response
┌─crypto_name─┐
│ Bitcoin     │
│ Bitcoin     │
└─────────────┘
```

Это означает, что из четырех криптовалют, которые мы имеем, только Bitcoin никогда не падал ниже $10 (на основе ограниченных данных, которые у нас есть в этом примере).

### Использование `EXCEPT DISTINCT` {#using-except-distinct}

Обратите внимание, что в предыдущем запросе у нас было несколько владений Bitcoin в результате. Вы можете добавить `DISTINCT` к `EXCEPT`, чтобы удалить дублирующиеся строки из результата:

```sql
SELECT crypto_name FROM holdings
EXCEPT DISTINCT
SELECT crypto_name FROM crypto_prices
WHERE price < 10;
```

Результат:

```response
┌─crypto_name─┐
│ Bitcoin     │
└─────────────┘
```

**Смотрите также**

- [UNION](/sql-reference/statements/select/union)
- [INTERSECT](/sql-reference/statements/select/intersect)
