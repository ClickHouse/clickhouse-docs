---
'sidebar_position': 3
'sidebar_label': '选择 数据'
'title': 'SELECTING ClickHouse 数据'
'slug': '/guides/writing-queries'
'description': '了解关于 SELECTING ClickHouse 数据'
'keywords':
- 'SELECT'
- 'data formats'
'show_related_blogs': true
'doc_type': 'guide'
---

ClickHouseはSQLデータベースであり、あなたはすでに慣れている同じタイプの `SELECT` クエリを書くことによってデータにクエリを実行します。例えば：

```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
```

:::note
構文および利用可能なクローズとオプションに関する詳細は、[SQLリファレンス](../sql-reference/statements/select/index.md)をご覧ください。
:::

応答がきれいなテーブル形式で戻ってくることに注意してください：

```response
┌─user_id─┬─message────────────────────────────────────────────┬───────────timestamp─┬──metric─┐
│     102 │ Insert a lot of rows per batch                     │ 2022-03-21 00:00:00 │ 1.41421 │
│     102 │ Sort your data based on your commonly-used queries │ 2022-03-22 00:00:00 │   2.718 │
│     101 │ Hello, ClickHouse!                                 │ 2022-03-22 14:04:09 │      -1 │
│     101 │ Granules are the smallest chunks of data read      │ 2022-03-22 14:04:14 │ 3.14159 │
└─────────┴────────────────────────────────────────────────────┴─────────────────────┴─────────┘

4 rows in set. Elapsed: 0.008 sec.
```

`FORMAT` クローズを追加して、[ClickHouseの多くのサポートされた出力形式の1つ](../interfaces/formats.md)を指定します：
```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
FORMAT TabSeparated
```

上記のクエリでは、出力はタブ区切りで返されます：

```response
Query id: 3604df1c-acfd-4117-9c56-f86c69721121

102 Insert a lot of rows per batch      2022-03-21 00:00:00     1.41421
102 Sort your data based on your commonly-used queries  2022-03-22 00:00:00     2.718
101 Hello, ClickHouse!  2022-03-22 14:04:09     -1
101 Granules are the smallest chunks of data read       2022-03-22 14:04:14     3.14159

4 rows in set. Elapsed: 0.005 sec.
```

:::note
ClickHouseは70以上の入力および出力形式をサポートしているため、数千の関数とすべてのデータ形式の間で、ClickHouseを使用して印象的で迅速なETLライクなデータ変換を実行できます。実際、データを変換するために稼働中のClickHouseサーバーは必要ありません - `clickhouse-local`ツールを使用できます。詳細は[`clickhouse-local`のドキュメントページ](../operations/utilities/clickhouse-local.md)をご覧ください。
:::
