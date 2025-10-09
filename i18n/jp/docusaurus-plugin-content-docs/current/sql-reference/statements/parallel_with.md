---
'description': 'PARALLEL WITH 句のためのドキュメント'
'sidebar_label': 'PARALLEL WITH'
'sidebar_position': 53
'slug': '/sql-reference/statements/parallel_with'
'title': 'PARALLEL WITH 句'
'doc_type': 'reference'
---


# PARALLEL WITH 句

複数の文を並行して実行することを可能にします。

## 構文 {#syntax}

```sql
statement1 PARALLEL WITH statement2 [PARALLEL WITH statement3 ...]
```

`statement1`、`statement2`、`statement3`、... を互いに並行して実行します。これらの文の出力は破棄されます。

多くの場合、文を並行して実行する方が、同じ文を単純にシーケンスで実行するよりも速くなる可能性があります。例えば、`statement1 PARALLEL WITH statement2 PARALLEL WITH statement3` は `statement1; statement2; statement3` よりも速いでしょう。

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

設定 [max_threads](../../operations/settings/settings.md#max_threads) は、いくつのスレッドが生成されるかを制御します。

## UNION との比較 {#comparison-with-union}

`PARALLEL WITH` 句は、オペランドを並行して実行する [UNION](select/union.md) に少し似ています。ただし、いくつかの違いがあります：
- `PARALLEL WITH` はオペランドを実行した結果を返さず、例外があった場合のみそれを再スローできます；
- `PARALLEL WITH` はオペランドが同じ結果カラムのセットを持つ必要はありません；
- `PARALLEL WITH` は任意の文を実行できます（`SELECT` に限らず）。
