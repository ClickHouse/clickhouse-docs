---
sidebar_position: 3
sidebar_label: 'Выбор данных'
title: 'Выбор данных ClickHouse'
slug: /guides/writing-queries
description: 'Узнайте о выборе данных ClickHouse'
---

ClickHouse — это SQL база данных, и вы запрашиваете ваши данные, пишет те же типы запросов `SELECT`, с которыми вы уже знакомы. Например:

```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
```

:::note
Посмотрите [Справочник SQL](../sql-reference/statements/select/index.md) для получения дополнительной информации о синтаксисе и доступных клаузах и опциях.
:::

Обратите внимание, что ответ приходит в красивом табличном формате:

```response
┌─user_id─┬─message────────────────────────────────────────────┬───────────timestamp─┬──metric─┐
│     102 │ Insert a lot of rows per batch                     │ 2022-03-21 00:00:00 │ 1.41421 │
│     102 │ Sort your data based on your commonly-used queries │ 2022-03-22 00:00:00 │   2.718 │
│     101 │ Hello, ClickHouse!                                 │ 2022-03-22 14:04:09 │      -1 │
│     101 │ Granules are the smallest chunks of data read      │ 2022-03-22 14:04:14 │ 3.14159 │
└─────────┴────────────────────────────────────────────────────┴─────────────────────┴─────────┘

4 rows in set. Elapsed: 0.008 sec.
```

Добавьте клаузу `FORMAT`, чтобы указать один из [многих поддерживаемых форматов вывода ClickHouse](../interfaces/formats.md):
```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
FORMAT TabSeparated
```

В приведённом выше запросе вывод возвращается в виде табуляции:

```response
Query id: 3604df1c-acfd-4117-9c56-f86c69721121

102 Insert a lot of rows per batch      2022-03-21 00:00:00     1.41421
102 Sort your data based on your commonly-used queries  2022-03-22 00:00:00     2.718
101 Hello, ClickHouse!  2022-03-22 14:04:09     -1
101 Granules are the smallest chunks of data read       2022-03-22 14:04:14     3.14159

4 rows in set. Elapsed: 0.005 sec.
```

:::note
ClickHouse поддерживает более 70 форматов ввода и вывода, так что между тысячами функций и всеми форматами данных вы можете использовать ClickHouse для выполнения впечатляющих и быстрых ETL-подобных преобразований данных. На самом деле, вам даже не нужно, чтобы сервер ClickHouse работал, чтобы преобразовать данные — вы можете использовать инструмент `clickhouse-local`. Просмотрите [страницу документации `clickhouse-local`](../operations/utilities/clickhouse-local.md) для получения подробностей.
:::
