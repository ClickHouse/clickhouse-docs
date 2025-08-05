---
sidebar_position: 3
sidebar_label: 'データの選択'
title: 'ClickHouseデータの選択'
slug: '/guides/writing-queries'
description: 'ClickHouseデータの選択について学びます'
---



ClickHouseはSQLデータベースであり、データをクエリするには、すでに慣れ親しんでいるタイプの`SELECT`クエリを書きます。例えば：

```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
```

:::note
構文および利用可能な句とオプションの詳細については、[SQLリファレンス](../sql-reference/statements/select/index.md)を参照してください。
:::

応答がきれいなテーブル形式で返されることに注意してください：

```response
┌─user_id─┬─message────────────────────────────────────────────┬───────────timestamp─┬──metric─┐
│     102 │ Insert a lot of rows per batch                     │ 2022-03-21 00:00:00 │ 1.41421 │
│     102 │ Sort your data based on your commonly-used queries │ 2022-03-22 00:00:00 │   2.718 │
│     101 │ Hello, ClickHouse!                                 │ 2022-03-22 14:04:09 │      -1 │
│     101 │ Granules are the smallest chunks of data read      │ 2022-03-22 14:04:14 │ 3.14159 │
└─────────┴────────────────────────────────────────────────────┴─────────────────────┴─────────┘

4 rows in set. Elapsed: 0.008 sec.
```

`FORMAT`句を追加して、ClickHouseの[多くのサポートされた出力形式](../interfaces/formats.md)の1つを指定します：
```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
FORMAT TabSeparated
```

上記のクエリでは、出力がタブ区切りで返されます：

```response
Query id: 3604df1c-acfd-4117-9c56-f86c69721121

102 Insert a lot of rows per batch      2022-03-21 00:00:00     1.41421
102 Sort your data based on your commonly-used queries  2022-03-22 00:00:00     2.718
101 Hello, ClickHouse!  2022-03-22 14:04:09     -1
101 Granules are the smallest chunks of data read       2022-03-22 14:04:14     3.14159

4 rows in set. Elapsed: 0.005 sec.
```

:::note
ClickHouseは70以上の入力および出力形式をサポートしているため、何千もの関数とすべてのデータ形式を使用して、ClickHouseを使って印象的で迅速なETLのようなデータ変換を行うことができます。実際、データを変換するためにClickHouseサーバーを稼働させる必要はなく、`clickhouse-local`ツールを使用できます。詳細については、[`clickhouse-local`のドキュメントページ](../operations/utilities/clickhouse-local.md)を参照してください。
:::
