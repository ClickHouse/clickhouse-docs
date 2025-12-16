---
sidebar_position: 3
sidebar_label: 'データの選択'
title: 'ClickHouse データの選択'
slug: /guides/writing-queries
description: 'ClickHouse データの選択方法を学ぶ'
keywords: ['SELECT', 'データフォーマット']
show_related_blogs: true
doc_type: 'guide'
---

ClickHouse は SQL データベースであり、データには、すでに使い慣れているのと同じ種類の `SELECT` クエリでアクセスします。例えば次のようになります。

```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
```

:::note
構文や利用可能な句やオプションの詳細については、[SQL リファレンス](/sql-reference/statements/select) を参照してください。
:::

レスポンスは見やすい表形式で返ってきます。

```response
┌─user_id─┬─message────────────────────────────────────────────┬───────────timestamp─┬──metric─┐
│     102 │ Insert a lot of rows per batch                     │ 2022-03-21 00:00:00 │ 1.41421 │
│     102 │ Sort your data based on your commonly-used queries │ 2022-03-22 00:00:00 │   2.718 │
│     101 │ Hello, ClickHouse!                                 │ 2022-03-22 14:04:09 │      -1 │
│     101 │ Granules are the smallest chunks of data read      │ 2022-03-22 14:04:14 │ 3.14159 │
└─────────┴────────────────────────────────────────────────────┴─────────────────────┴─────────┘

4 rows in set. Elapsed: 0.008 sec.
```

ClickHouse でサポートされている多数の出力フォーマットのいずれかを指定するには、`FORMAT` 句を追加します。([多くのサポートされている出力フォーマット](/interfaces/formats#formats-overview))

```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
FORMAT TabSeparated
```

上記のクエリでは、結果はタブ区切り形式で返されます。

```response
Query id: 3604df1c-acfd-4117-9c56-f86c69721121

102 Insert a lot of rows per batch      2022-03-21 00:00:00     1.41421
102 Sort your data based on your commonly-used queries  2022-03-22 00:00:00     2.718
101 Hello, ClickHouse!  2022-03-22 14:04:09     -1
101 Granules are the smallest chunks of data read       2022-03-22 14:04:14     3.14159

4 rows in set. Elapsed: 0.005 sec.
```

:::note
ClickHouse は 70 を超える入力形式および出力形式をサポートしているため、数千におよぶ関数とこれらのデータ形式を組み合わせることで、ClickHouse を使って強力かつ高速な ETL 的なデータ変換を実行できます。実際には、データを変換するために ClickHouse サーバーを起動しておく必要すらなく、`clickhouse-local` ツールを使用できます。詳細については、[`clickhouse-local` のドキュメントページ](/interfaces/cli) を参照してください。
:::
