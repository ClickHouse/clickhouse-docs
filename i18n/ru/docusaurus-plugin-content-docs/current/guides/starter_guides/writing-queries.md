---
sidebar_position: 3
sidebar_label: 'Выбор данных'
title: 'Выбор данных в ClickHouse'
slug: /guides/writing-queries
description: 'Узнайте, как выбирать данные в ClickHouse'
keywords: ['SELECT', 'data formats']
show_related_blogs: true
doc_type: 'guide'
---

ClickHouse — это база данных SQL, и вы запрашиваете данные с помощью тех же запросов `SELECT`, с которыми уже знакомы. Например:

```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
```

:::note
См. [справочник по SQL](/sql-reference/statements/select) для получения более подробной информации о синтаксисе, доступных предложениях и параметрах.
:::

Обратите внимание, что ответ возвращается в удобном табличном формате:

```response
┌─user_id─┬─message────────────────────────────────────────────┬───────────timestamp─┬──metric─┐
│     102 │ Insert a lot of rows per batch                     │ 2022-03-21 00:00:00 │ 1.41421 │
│     102 │ Sort your data based on your commonly-used queries │ 2022-03-22 00:00:00 │   2.718 │
│     101 │ Hello, ClickHouse!                                 │ 2022-03-22 14:04:09 │      -1 │
│     101 │ Granules are the smallest chunks of data read      │ 2022-03-22 14:04:14 │ 3.14159 │
└─────────┴────────────────────────────────────────────────────┴─────────────────────┴─────────┘

4 rows in set. Elapsed: 0.008 sec.
```

Добавьте предложение `FORMAT`, чтобы указать один из [многих форматов вывода, поддерживаемых в ClickHouse](/interfaces/formats#formats-overview):

```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
FORMAT TabSeparated
```

В приведённом выше запросе результат выводится в виде значений, разделённых символом табуляции:

```response
Query id: 3604df1c-acfd-4117-9c56-f86c69721121

102 Insert a lot of rows per batch      2022-03-21 00:00:00     1.41421
102 Sort your data based on your commonly-used queries  2022-03-22 00:00:00     2.718
101 Hello, ClickHouse!  2022-03-22 14:04:09     -1
101 Granules are the smallest chunks of data read       2022-03-22 14:04:14     3.14159

4 rows in set. Elapsed: 0.005 sec.
```

:::note
ClickHouse поддерживает более 70 форматов ввода и вывода, поэтому, благодаря тысячам функций и всем этим форматам данных, вы можете использовать ClickHouse для выполнения впечатляющих и быстрых преобразований данных, похожих на ETL. Фактически, вам даже не нужен запущенный сервер ClickHouse для преобразования данных — вы можете использовать утилиту `clickhouse-local`. Подробнее см. [на странице документации по `clickhouse-local`](/interfaces/cli).
:::
