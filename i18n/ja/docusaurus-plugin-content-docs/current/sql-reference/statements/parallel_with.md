---
slug: /sql-reference/statements/parallel_with
sidebar_position: 53
sidebar_label: PARALLEL WITH
---

# PARALLEL WITH句

複数のステートメントを並行して実行することを許可します。

## 構文 {#syntax}

``` sql
statement1 PARALLEL WITH statement2 [PARALLEL WITH statement3 ...]
```

ステートメント `statement1`, `statement2`, `statement3`, ... を互いに並行して実行します。それらのステートメントの出力は破棄されます。

多くの場合、ステートメントを並行して実行する方が、同じステートメントを順番に実行するよりも早くなることがあります。たとえば、`statement1 PARALLEL WITH statement2 PARALLEL WITH statement3` は `statement1; statement2; statement3` よりも速くなる可能性があります。

## 例 {#examples}

2つのテーブルを並行して作成します：

``` sql
CREATE TABLE table1(x Int32) ENGINE = MergeTree ORDER BY tuple()
PARALLEL WITH
CREATE TABLE table2(y String) ENGINE = MergeTree ORDER BY tuple();
```

2つのテーブルを並行して削除します：

``` sql
DROP TABLE table1
PARALLEL WITH
DROP TABLE table2;
```

## 設定 {#settings}

設定 [max_threads](../../operations/settings/settings.md#max_threads) は、生成されるスレッドの数を制御します。

## UNIONとの比較 {#comparison-with-union}

`PARALLEL WITH`句は、オペランドを並行して実行する点で少し[UNION](select/union.md)に似ています。しかし、いくつかの違いがあります：
- `PARALLEL WITH`は、オペランドの実行結果を返さず、例外が発生した場合のみ再スローできます。
- `PARALLEL WITH`は、オペランドが同じ結果カラムのセットを持つ必要はありません。
- `PARALLEL WITH`は、任意のステートメントを実行できます（`SELECT`だけではありません）。
