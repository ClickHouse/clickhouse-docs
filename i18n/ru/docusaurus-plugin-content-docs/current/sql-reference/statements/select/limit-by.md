---
description: 'Документация по предложению LIMIT BY'
sidebar_label: 'LIMIT BY'
slug: /sql-reference/statements/select/limit-by
title: 'Предложение LIMIT BY'
doc_type: 'reference'
---



# Оператор LIMIT BY

Запрос с оператором `LIMIT n BY expressions` выбирает первые `n` строк для каждого различного значения `expressions`. Ключ для `LIMIT BY` может содержать любое количество [выражений](/sql-reference/syntax#expressions).

ClickHouse поддерживает следующие варианты синтаксиса:

- `LIMIT [offset_value, ]n BY expressions`
- `LIMIT n OFFSET offset_value BY expressions`

Во время обработки запроса ClickHouse выбирает данные, упорядоченные по ключу сортировки. Ключ сортировки задаётся явно с помощью оператора [ORDER BY](/sql-reference/statements/select/order-by) или неявно как свойство движка таблицы (порядок строк гарантируется только при использовании [ORDER BY](/sql-reference/statements/select/order-by), в противном случае блоки строк не будут упорядочены из-за многопоточности). Затем ClickHouse применяет `LIMIT n BY expressions` и возвращает первые `n` строк для каждой различной комбинации `expressions`. Если указан `OFFSET`, то для каждого блока данных, соответствующего отдельной комбинации `expressions`, ClickHouse пропускает `offset_value` строк с начала блока и возвращает максимум `n` строк в результате. Если `offset_value` больше количества строк в блоке данных, ClickHouse возвращает ноль строк из этого блока.

:::note    
`LIMIT BY` не связан с [LIMIT](../../../sql-reference/statements/select/limit.md). Оба оператора можно использовать в одном и том же запросе.
:::

Если вы хотите использовать номера столбцов вместо их имён в операторе `LIMIT BY`, включите настройку [enable_positional_arguments](/operations/settings/settings#enable_positional_arguments).    



## Примеры {#examples}

Пример таблицы:

```sql
CREATE TABLE limit_by(id Int, val Int) ENGINE = Memory;
INSERT INTO limit_by VALUES (1, 10), (1, 11), (1, 12), (2, 20), (2, 21);
```

Запросы:

```sql
SELECT * FROM limit_by ORDER BY id, val LIMIT 2 BY id
```

```text
┌─id─┬─val─┐
│  1 │  10 │
│  1 │  11 │
│  2 │  20 │
│  2 │  21 │
└────┴─────┘
```

```sql
SELECT * FROM limit_by ORDER BY id, val LIMIT 1, 2 BY id
```

```text
┌─id─┬─val─┐
│  1 │  11 │
│  1 │  12 │
│  2 │  21 │
└────┴─────┘
```

Запрос `SELECT * FROM limit_by ORDER BY id, val LIMIT 2 OFFSET 1 BY id` возвращает тот же результат.

Следующий запрос возвращает топ-5 источников переходов для каждой пары `domain, device_type` с максимальным общим количеством в 100 строк (`LIMIT n BY + LIMIT`).

```sql
SELECT
    domainWithoutWWW(URL) AS domain,
    domainWithoutWWW(REFERRER_URL) AS referrer,
    device_type,
    count() cnt
FROM hits
GROUP BY domain, referrer, device_type
ORDER BY cnt DESC
LIMIT 5 BY domain, device_type
LIMIT 100
```


## LIMIT BY ALL {#limit-by-all}

`LIMIT BY ALL` эквивалентен перечислению всех выражений SELECT, которые не являются агрегатными функциями.

Например:

```sql
SELECT col1, col2, col3 FROM table LIMIT 2 BY ALL
```

это то же самое, что и

```sql
SELECT col1, col2, col3 FROM table LIMIT 2 BY col1, col2, col3
```

В особом случае, когда функция принимает в качестве аргументов как агрегатные функции, так и другие поля, ключи `LIMIT BY` будут содержать максимальное количество неагрегатных полей, которые можно из неё извлечь.

Например:

```sql
SELECT substring(a, 4, 2), substring(substring(a, 1, 2), 1, count(b)) FROM t LIMIT 2 BY ALL
```

это то же самое, что и

```sql
SELECT substring(a, 4, 2), substring(substring(a, 1, 2), 1, count(b)) FROM t LIMIT 2 BY substring(a, 4, 2), substring(a, 1, 2)
```


## Примеры {#examples-limit-by-all}

Пример таблицы:

```sql
CREATE TABLE limit_by(id Int, val Int) ENGINE = Memory;
INSERT INTO limit_by VALUES (1, 10), (1, 11), (1, 12), (2, 20), (2, 21);
```

Запросы:

```sql
SELECT * FROM limit_by ORDER BY id, val LIMIT 2 BY id
```

```text
┌─id─┬─val─┐
│  1 │  10 │
│  1 │  11 │
│  2 │  20 │
│  2 │  21 │
└────┴─────┘
```

```sql
SELECT * FROM limit_by ORDER BY id, val LIMIT 1, 2 BY id
```

```text
┌─id─┬─val─┐
│  1 │  11 │
│  1 │  12 │
│  2 │  21 │
└────┴─────┘
```

Запрос `SELECT * FROM limit_by ORDER BY id, val LIMIT 2 OFFSET 1 BY id` возвращает тот же результат.

Использование `LIMIT BY ALL`:

```sql
SELECT id, val FROM limit_by ORDER BY id, val LIMIT 2 BY ALL
```

Это эквивалентно:

```sql
SELECT id, val FROM limit_by ORDER BY id, val LIMIT 2 BY id, val
```

Следующий запрос возвращает топ-5 источников переходов для каждой пары `domain, device_type` с максимальным общим количеством 100 строк (`LIMIT n BY + LIMIT`).

```sql
SELECT
    domainWithoutWWW(URL) AS domain,
    domainWithoutWWW(REFERRER_URL) AS referrer,
    device_type,
    count() cnt
FROM hits
GROUP BY domain, referrer, device_type
ORDER BY cnt DESC
LIMIT 5 BY domain, device_type
LIMIT 100
```
