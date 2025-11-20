---
sidebar_position: 3
sidebar_label: 'データの選択'
title: 'ClickHouseデータの選択'
slug: /guides/writing-queries
description: 'ClickHouseデータの選択について学ぶ'
keywords: ['SELECT', 'data formats']
show_related_blogs: true
doc_type: 'guide'
---

ClickHouseはSQLデータベースであり、既に使い慣れている`SELECT`クエリと同じ形式のクエリを記述することでデータをクエリできます。例:

```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
```

:::note
構文および利用可能な句とオプションの詳細については、[SQLリファレンス](/sql-reference/statements/select)を参照してください。
:::

レスポンスが見やすい表形式で返されることに注目してください：

```response
┌─user_id─┬─message────────────────────────────────────────────┬───────────timestamp─┬──metric─┐
│     102 │ バッチごとに多数の行を挿入する                     │ 2022-03-21 00:00:00 │ 1.41421 │
│     102 │ よく使用するクエリに基づいてデータをソートする │ 2022-03-22 00:00:00 │   2.718 │
│     101 │ こんにちは、ClickHouse!                                 │ 2022-03-22 14:04:09 │      -1 │
│     101 │ グラニュールは読み取られるデータの最小チャンク      │ 2022-03-22 14:04:14 │ 3.14159 │
└─────────┴────────────────────────────────────────────────────┴─────────────────────┴─────────┘

4行が返されました。経過時間: 0.008秒。
```

`FORMAT`句を追加して、[ClickHouseがサポートする多数の出力形式](/interfaces/formats#formats-overview)のいずれかを指定します:

```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
FORMAT TabSeparated
```

上記のクエリでは、出力はタブ区切りで返されます：

```response
Query id: 3604df1c-acfd-4117-9c56-f86c69721121

102 バッチごとに大量の行を挿入      2022-03-21 00:00:00     1.41421
102 よく使用するクエリに基づいてデータをソート  2022-03-22 00:00:00     2.718
101 Hello, ClickHouse!  2022-03-22 14:04:09     -1
101 グラニュールは読み取られるデータの最小チャンク       2022-03-22 14:04:14     3.14159

4行のセット。経過時間: 0.005秒
```

:::note
ClickHouseは70種類以上の入出力フォーマットをサポートしており、数千の関数とこれらのデータフォーマットを組み合わせることで、印象的で高速なETL的なデータ変換を実行できます。実際、データ変換を行うためにClickHouseサーバーを起動する必要すらありません。`clickhouse-local`ツールを使用できます。詳細については、[`clickhouse-local`のドキュメントページ](/interfaces/cli)をご覧ください。
:::
