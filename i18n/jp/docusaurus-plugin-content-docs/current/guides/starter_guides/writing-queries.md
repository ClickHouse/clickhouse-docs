---
sidebar_position: 3
sidebar_label: 'データの選択'
title: 'ClickHouse データの選択'
slug: /guides/writing-queries
description: 'ClickHouse データの選択について学ぶ'
keywords: ['SELECT', 'data formats']
show_related_blogs: true
doc_type: 'guide'
---

ClickHouse は SQL データベースであり、普段使い慣れているのと同じ種類の `SELECT` クエリを記述してデータを取得できます。例えば次のように記述します。

```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
```

:::note
構文および使用可能な句やオプションの詳細については、[SQL Reference](/sql-reference/statements/select) を参照してください。
:::

レスポンスが見やすい表形式で返されることが分かります。

```response
┌─user_id─┬─message────────────────────────────────────────────┬───────────timestamp─┬──metric─┐
│     102 │ バッチごとに大量の行を挿入する                     │ 2022-03-21 00:00:00 │ 1.41421 │
│     102 │ よく使用するクエリに基づいてデータをソートする │ 2022-03-22 00:00:00 │   2.718 │
│     101 │ こんにちは、ClickHouse!                                 │ 2022-03-22 14:04:09 │      -1 │
│     101 │ グラニュールは読み取られるデータの最小単位です      │ 2022-03-22 14:04:14 │ 3.14159 │
└─────────┴────────────────────────────────────────────────────┴─────────────────────┴─────────┘

4行が返されました。経過時間: 0.008秒
```

`FORMAT` 句を追加し、[ClickHouse がサポートする多数の出力フォーマット](/interfaces/formats#formats-overview)のいずれかを指定します。

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
101 グラニュールは読み取られるデータの最小チャンク       2022-03-22 14:04:14     3.14159

4 rows in set. Elapsed: 0.005 sec.
```

:::note
ClickHouse は 70 以上の入力および出力フォーマットをサポートしているため、数千に及ぶ関数とあらゆるデータフォーマットを組み合わせることで、ClickHouse を使って印象的かつ高速な ETL 風のデータ変換を実行できます。実際には、データを変換するために ClickHouse サーバーを起動して稼働させておく必要すらありません。代わりに `clickhouse-local` ツールを使用できます。詳細については、[`clickhouse-local` のドキュメントページ](/interfaces/cli) を参照してください。
:::
