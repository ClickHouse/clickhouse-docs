---
sidebar_position: 3
sidebar_label: Выбор данных
title: Выбор данных ClickHouse
---

ClickHouse является SQL базой данных, и вы запрашиваете ваши данные, написав такие же `SELECT` запросы, с которыми вы уже знакомы. Например:

```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
```

:::note
Посмотрите на [Справочник SQL](../sql-reference/statements/select/index.md) для получения более подробной информации о синтаксисе, доступных частях и опциях.
:::

Обратите внимание, что ответ возвращается в приятном табличном формате:

```response
┌─user_id─┬─message────────────────────────────────────────────┬───────────timestamp─┬──metric─┐
│     102 │ Insert a lot of rows per batch                     │ 2022-03-21 00:00:00 │ 1.41421 │
│     102 │ Sort your data based on your commonly-used queries │ 2022-03-22 00:00:00 │   2.718 │
│     101 │ Hello, ClickHouse!                                 │ 2022-03-22 14:04:09 │      -1 │
│     101 │ Granules are the smallest chunks of data read      │ 2022-03-22 14:04:14 │ 3.14159 │
└─────────┴────────────────────────────────────────────────────┴─────────────────────┴─────────┘

4 строки в наборе. Затрачено: 0.008 сек.
```

Добавьте `FORMAT` часть, чтобы указать один из [многих поддерживаемых форматов вывода ClickHouse](../interfaces/formats.md):
```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
FORMAT TabSeparated
```

В приведенном выше запросе вывод возвращается в виде табуляционно-разделенного:

```response
Query id: 3604df1c-acfd-4117-9c56-f86c69721121

102 Insert a lot of rows per batch	2022-03-21 00:00:00	1.41421
102 Sort your data based on your commonly-used queries	2022-03-22 00:00:00	2.718
101 Hello, ClickHouse!	2022-03-22 14:04:09	-1
101 Granules are the smallest chunks of data read	2022-03-22 14:04:14	3.14159

4 строки в наборе. Затрачено: 0.005 сек.
```

:::note
ClickHouse поддерживает более 70 входных и выходных форматов, поэтому между тысячами функций и всеми форматами данных, вы можете использовать ClickHouse для выполнения впечатляющих и быстрых трансформаций данных на подобие ETL. На самом деле, вам даже не нужен запущенный сервер ClickHouse, чтобы трансформировать данные - вы можете использовать инструмент `clickhouse-local`. Посмотрите на [страницу документации `clickhouse-local`](../operations/utilities/clickhouse-local.md) для подробностей.
:::
