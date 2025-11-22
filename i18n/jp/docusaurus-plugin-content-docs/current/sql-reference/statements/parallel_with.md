---
description: 'PARALLEL WITH 句のリファレンス'
sidebar_label: 'PARALLEL WITH'
sidebar_position: 53
slug: /sql-reference/statements/parallel_with
title: 'PARALLEL WITH 句'
doc_type: 'reference'
---



# PARALLEL WITH 句

複数のステートメントを並列実行することを可能にします。



## 構文 {#syntax}

```sql
statement1 PARALLEL WITH statement2 [PARALLEL WITH statement3 ...]
```

ステートメント `statement1`、`statement2`、`statement3`、... を並列実行します。これらのステートメントの出力は破棄されます。

多くの場合、ステートメントを並列実行することで、同じステートメントを順次実行するよりも高速化できます。例えば、`statement1 PARALLEL WITH statement2 PARALLEL WITH statement3` は `statement1; statement2; statement3` よりも高速になる可能性が高いです。


## 例 {#examples}

2つのテーブルを並列で作成します：

```sql
CREATE TABLE table1(x Int32) ENGINE = MergeTree ORDER BY tuple()
PARALLEL WITH
CREATE TABLE table2(y String) ENGINE = MergeTree ORDER BY tuple();
```

2つのテーブルを並列で削除します：

```sql
DROP TABLE table1
PARALLEL WITH
DROP TABLE table2;
```


## 設定 {#settings}

[max_threads](../../operations/settings/settings.md#max_threads) 設定は、起動されるスレッド数を制御します。


## UNIONとの比較 {#comparison-with-union}

`PARALLEL WITH`句は、オペランドを並列で実行する[UNION](select/union.md)と似ていますが、いくつかの違いがあります:

- `PARALLEL WITH`はオペランドの実行結果を返さず、例外が発生した場合にのみそれを再スローします;
- `PARALLEL WITH`はオペランドが同じ結果列のセットを持つ必要がありません;
- `PARALLEL WITH`は任意のステートメントを実行できます(`SELECT`に限定されません)。
