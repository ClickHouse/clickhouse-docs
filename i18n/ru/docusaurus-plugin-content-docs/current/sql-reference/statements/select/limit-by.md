---
slug: '/sql-reference/statements/select/limit-by'
sidebar_label: 'LIMIT BY'
description: 'Документация для LIMIT BY ОПЕРАТОРа'
title: 'Условие LIMIT BY'
doc_type: reference
---
# LIMIT BY Клаузула

Запрос с клаузулой `LIMIT n BY expressions` выбирает первые `n` строк для каждого уникального значения `expressions`. Ключ для `LIMIT BY` может содержать любое количество [выражений](/sql-reference/syntax#expressions).

ClickHouse поддерживает следующие варианты синтаксиса:

- `LIMIT [offset_value, ]n BY expressions`
- `LIMIT n OFFSET offset_value BY expressions`

В процессе обработки запроса ClickHouse выбирает данные в порядке, заданном ключом сортировки. Ключ сортировки задается явно с помощью клаузулы [ORDER BY](/sql-reference/statements/select/order-by) или неявно как свойство движка таблицы (порядок строк гарантируется только при использовании [ORDER BY](/sql-reference/statements/select/order-by), в противном случае блоки строк не будут упорядочены из-за многопоточности). Затем ClickHouse применяет `LIMIT n BY expressions` и возвращает первые `n` строк для каждой уникальной комбинации `expressions`. Если указан `OFFSET`, то для каждого блока данных, принадлежащего уникальной комбинации `expressions`, ClickHouse пропускает `offset_value` количество строк от начала блока и возвращает максимум `n` строк в результате. Если `offset_value` превышает количество строк в блоке данных, ClickHouse возвращает ноль строк из блока.

:::note    
`LIMIT BY` не имеет отношения к [LIMIT](../../../sql-reference/statements/select/limit.md). Их можно использовать в одном и том же запросе.
:::

Если вы хотите использовать номера колонок вместо имен колонок в клаузуле `LIMIT BY`, включите настройку [enable_positional_arguments](/operations/settings/settings#enable_positional_arguments).    

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

Следующий запрос возвращает топ-5 рефереров для каждой пары `domain, device_type` с максимальным количеством 100 строк всего (`LIMIT n BY + LIMIT`).

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