---
slug: /sql-reference/statements/parallel_with
sidebar_position: 53
sidebar_label: PARALLEL WITH
---


# PARALLEL WITH 句

複数のステートメントを並行して実行できるようにします。

## 構文 {#syntax}

``` sql
statement1 PARALLEL WITH statement2 [PARALLEL WITH statement3 ...]
```

`statement1`、`statement2`、`statement3` などのステートメントを互いに並行して実行します。それらのステートメントの出力は破棄されます。

多くの場合、ステートメントを並行して実行する方が、同じステートメントを順次実行するよりも速くなります。たとえば、`statement1 PARALLEL WITH statement2 PARALLEL WITH statement3` は、`statement1; statement2; statement3` よりも速い可能性があります。

## 例 {#examples}

並行して2つのテーブルを作成します：

``` sql
CREATE TABLE table1(x Int32) ENGINE = MergeTree ORDER BY tuple()
PARALLEL WITH
CREATE TABLE table2(y String) ENGINE = MergeTree ORDER BY tuple();
```

並行して2つのテーブルを削除します：

``` sql
DROP TABLE table1
PARALLEL WITH
DROP TABLE table2;
```

## 設定 {#settings}

設定 [max_threads](../../operations/settings/settings.md#max_threads) は、生成されるスレッドの数を制御します。

## UNION との比較 {#comparison-with-union}

`PARALLEL WITH` 句は、オペランドを並行して実行する [UNION](select/union.md) と少し似ています。ただし、いくつかの違いがあります：
- `PARALLEL WITH` はオペランドの実行からの結果を返さず、例外が発生した場合にはそれを再スローすることしかできません；
- `PARALLEL WITH` は、オペランドが同じ結果カラムのセットを持つ必要はありません；
- `PARALLEL WITH` は、任意のステートメント（`SELECT` だけでなく）を実行できます。
