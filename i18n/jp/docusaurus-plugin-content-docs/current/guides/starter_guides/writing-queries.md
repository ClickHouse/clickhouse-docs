---
sidebar_position: 3
sidebar_label: 'データの選択'
title: 'ClickHouse データの選択'
slug: /guides/writing-queries
description: 'ClickHouse データの選択方法について学ぶ'
keywords: ['SELECT', 'data formats']
show_related_blogs: true
doc_type: 'guide'
---

ClickHouse は SQL データベースであり、すでに使い慣れているのと同じ種類の `SELECT` クエリでデータを取得できます。例えば、次のように実行します。

```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
```

:::note
構文や利用可能な句、オプションの詳細については、[SQL Reference](/sql-reference/statements/select) を参照してください。
:::

レスポンスが見やすいテーブル形式で返ってくることに注目してください。

```response
┌─user_id─┬─message────────────────────────────────────────────┬───────────timestamp─┬──metric─┐
│     102 │ バッチごとに大量の行を挿入する                     │ 2022-03-21 00:00:00 │ 1.41421 │
│     102 │ よく使用するクエリに基づいてデータをソートする │ 2022-03-22 00:00:00 │   2.718 │
│     101 │ Hello, ClickHouse!                                 │ 2022-03-22 14:04:09 │      -1 │
│     101 │ Granuleは読み取られるデータの最小チャンク      │ 2022-03-22 14:04:14 │ 3.14159 │
└─────────┴────────────────────────────────────────────────────┴─────────────────────┴─────────┘

4 rows in set. Elapsed: 0.008 sec.
```

`FORMAT` 句を追加して、ClickHouse で [サポートされている多数の出力フォーマット](/interfaces/formats#formats-overview) のいずれかを指定します。

```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
FORMAT TabSeparated
```

上記のクエリでは、出力はタブ区切り形式で返されます。

```response
Query id: 3604df1c-acfd-4117-9c56-f86c69721121

102 バッチごとに大量の行を挿入      2022-03-21 00:00:00     1.41421
102 よく使用するクエリに基づいてデータをソート  2022-03-22 00:00:00     2.718
101 こんにちは、ClickHouse！  2022-03-22 14:04:09     -1
101 グラニュールは読み取られるデータの最小単位       2022-03-22 14:04:14     3.14159

4 rows in set. Elapsed: 0.005 sec.
```

:::note
ClickHouse は 70 を超える入力および出力フォーマットをサポートしているため、数千におよぶ関数とあらゆるデータフォーマットを組み合わせることで、ClickHouse を使って高性能かつ印象的な ETL 的データ変換を実行できます。さらに、データを変換するために ClickHouse サーバーを起動・稼働させておく必要さえありません。代わりに `clickhouse-local` ツールを使用できます。詳細は、[`clickhouse-local` のドキュメントページ](/interfaces/cli)を参照してください。
:::
