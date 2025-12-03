---
description: 'PARALLEL WITH 句に関するドキュメント'
sidebar_label: 'PARALLEL WITH'
sidebar_position: 53
slug: /sql-reference/statements/parallel_with
title: 'PARALLEL WITH 句'
doc_type: 'reference'
---

# PARALLEL WITH 句 {#parallel-with-clause}

複数のステートメントを並列実行できます。

## 構文 {#syntax}

```sql
statement1 PARALLEL WITH statement2 [PARALLEL WITH statement3 ...]
```

`statement1`、`statement2`、`statement3`、… の各ステートメントを互いに並列で実行します。これらのステートメントの出力結果は破棄されます。

多くの場合、同じステートメントを単純に順番に実行するよりも、並列に実行した方が高速になる場合があります。例えば、`statement1 PARALLEL WITH statement2 PARALLEL WITH statement3` は、`statement1; statement2; statement3` より高速になる可能性が高いです。

## 例 {#examples}

2 つのテーブルを並列に作成します：

```sql
CREATE TABLE table1(x Int32) ENGINE = MergeTree ORDER BY tuple()
PARALLEL WITH
CREATE TABLE table2(y String) ENGINE = MergeTree ORDER BY tuple();
```

2つのテーブルを並列に削除します：

```sql
DROP TABLE table1
PARALLEL WITH
DROP TABLE table2;
```

## 設定 {#settings}

[max_threads](../../operations/settings/settings.md#max_threads) 設定は、起動されるスレッド数を制御します。

## UNION との比較 {#comparison-with-union}

`PARALLEL WITH` 句は、そのオペランドを並列実行するという点で [UNION](select/union.md) と少し似ています。ただし、いくつかの違いがあります。
- `PARALLEL WITH` はオペランドの実行結果を一切返さず、発生した例外を再スローすることしかできません。
- `PARALLEL WITH` は、オペランドが同じ結果列の集合を持つ必要はありません。
- `PARALLEL WITH` は、任意のステートメント（`SELECT` だけでなく）を実行できます。
