---
description: 'PARALLEL WITH句のドキュメント'
sidebar_label: 'PARALLEL WITH'
sidebar_position: 53
slug: /sql-reference/statements/parallel_with
title: 'PARALLEL WITH句'
---


# PARALLEL WITH句

複数のステートメントを並行して実行することを可能にします。

## 構文 {#syntax}

```sql
statement1 PARALLEL WITH statement2 [PARALLEL WITH statement3 ...]
```

ステートメント `statement1`、`statement2`、`statement3` などを互いに並行して実行します。これらのステートメントの出力は破棄されます。

並行してステートメントを実行することは、多くの場合、同じステートメントのシーケンスよりも速くなります。たとえば、`statement1 PARALLEL WITH statement2 PARALLEL WITH statement3` は、`statement1; statement2; statement3` よりも速くなる可能性があります。

## 例 {#examples}

並行して2つのテーブルを作成します：

```sql
CREATE TABLE table1(x Int32) ENGINE = MergeTree ORDER BY tuple()
PARALLEL WITH
CREATE TABLE table2(y String) ENGINE = MergeTree ORDER BY tuple();
```

並行して2つのテーブルを削除します：

```sql
DROP TABLE table1
PARALLEL WITH
DROP TABLE table2;
```

## 設定 {#settings}

設定 [max_threads](../../operations/settings/settings.md#max_threads) は、どれだけのスレッドが生成されるかを制御します。

## UNIONとの比較 {#comparison-with-union}

`PARALLEL WITH`句は、[UNION](select/union.md)に似ていて、そのオペランドを並行して実行します。しかし、いくつかの違いがあります：
- `PARALLEL WITH`は、そのオペランドを実行して得られる結果を返さず、あれば例外だけを再スローできます。
- `PARALLEL WITH`は、そのオペランドが同じ結果カラムのセットを持つ必要はありません。
- `PARALLEL WITH`は、任意のステートメントを実行できます（`SELECT`だけではありません）。
