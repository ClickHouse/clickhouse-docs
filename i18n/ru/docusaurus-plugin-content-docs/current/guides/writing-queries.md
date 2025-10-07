---
'sidebar_position': 3
'sidebar_label': '选择数据'
'title': '选择 ClickHouse 数据'
'slug': '/guides/writing-queries'
'description': '了解 Selecting ClickHouse Data'
'keywords':
- 'SELECT'
- 'data formats'
'show_related_blogs': true
'doc_type': 'guide'
---

ClickHouse — это SQL база данных, и вы запрашиваете свои данные, написав те же типы запросов `SELECT`, с которыми вы уже знакомы. Например:

```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
```

:::note
Посмотрите [Справочник SQL](../sql-reference/statements/select/index.md) для получения дополнительной информации о синтаксисе и доступных операторах и параметрах.
:::

Обратите внимание, что ответ возвращается в приятном табличном формате:

```response
┌─user_id─┬─message────────────────────────────────────────────┬───────────timestamp─┬──metric─┐
│     102 │ Insert a lot of rows per batch                     │ 2022-03-21 00:00:00 │ 1.41421 │
│     102 │ Sort your data based on your commonly-used queries │ 2022-03-22 00:00:00 │   2.718 │
│     101 │ Hello, ClickHouse!                                 │ 2022-03-22 14:04:09 │      -1 │
│     101 │ Granules are the smallest chunks of data read      │ 2022-03-22 14:04:14 │ 3.14159 │
└─────────┴────────────────────────────────────────────────────┴─────────────────────┴─────────┘

4 rows in set. Elapsed: 0.008 sec.
```

Добавьте оператор `FORMAT`, чтобы указать один из [множества поддерживаемых форматов вывода ClickHouse](../interfaces/formats.md):
```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
FORMAT TabSeparated
```

В приведенном выше запросе вывод возвращается в виде, разделенном табуляцией:

```response
Query id: 3604df1c-acfd-4117-9c56-f86c69721121

102 Insert a lot of rows per batch      2022-03-21 00:00:00     1.41421
102 Sort your data based on your commonly-used queries  2022-03-22 00:00:00     2.718
101 Hello, ClickHouse!  2022-03-22 14:04:09     -1
101 Granules are the smallest chunks of data read       2022-03-22 14:04:14     3.14159

4 rows in set. Elapsed: 0.005 sec.
```

:::note
ClickHouse поддерживает более 70 форматов ввода и вывода, поэтому между тысячами функций и всеми форматами данных вы можете использовать ClickHouse для выполнения впечатляющих и быстрых преобразований данных, подобных ETL. На самом деле, вам даже не нужен работающий сервер ClickHouse для преобразования данных — вы можете использовать инструмент `clickhouse-local`. Посмотрите [страницу документации `clickhouse-local`](../operations/utilities/clickhouse-local.md) для получения деталей.
:::
