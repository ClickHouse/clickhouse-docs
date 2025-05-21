---
sidebar_position: 3
sidebar_label: 'データの選択'
title: 'ClickHouse データの選択'
slug: /guides/writing-queries
description: 'ClickHouse データの選択について学ぶ'
---

ClickHouse は SQL データベースであり、既に馴染みのあるタイプの `SELECT` クエリを記述することでデータをクエリします。例えば：

```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
```

:::note
構文および利用可能な句やオプションの詳細については [SQL リファレンス](../sql-reference/statements/select/index.md) を参照してください。
:::

応答は、きれいなテーブルフォーマットで返されることに注意してください：

```response
┌─user_id─┬─message────────────────────────────────────────────┬───────────timestamp─┬──metric─┐
│     102 │ Insert a lot of rows per batch                     │ 2022-03-21 00:00:00 │ 1.41421 │
│     102 │ Sort your data based on your commonly-used queries │ 2022-03-22 00:00:00 │   2.718 │
│     101 │ Hello, ClickHouse!                                 │ 2022-03-22 14:04:09 │      -1 │
│     101 │ Granules are the smallest chunks of data read      │ 2022-03-22 14:04:14 │ 3.14159 │
└─────────┴────────────────────────────────────────────────────┴─────────────────────┴─────────┘

4 行がセットされました。経過時間: 0.008 秒。
```

`FORMAT` 句を追加して、ClickHouse の [多くのサポートされている出力フォーマット](../interfaces/formats.md) のうちの1つを指定します：
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

4 行がセットされました。経過時間: 0.005 秒。
```

:::note
ClickHouse は 70 以上の入力および出力フォーマットをサポートしているため、数千の関数とすべてのデータフォーマットを組み合わせて、ClickHouse を使用して印象的で迅速な ETL のようなデータ変換を実行できます。実際、データを変換するために ClickHouse サーバーを実行する必要はなく、`clickhouse-local` ツールを使用することができます。詳細については [`clickhouse-local` のドキュスページ](../operations/utilities/clickhouse-local.md) を参照してください。
:::
