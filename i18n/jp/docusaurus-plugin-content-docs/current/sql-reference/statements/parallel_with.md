---
'description': 'Documentation for PARALLEL WITH Clause'
'sidebar_label': 'PARALLEL WITH'
'sidebar_position': 53
'slug': '/sql-reference/statements/parallel_with'
'title': 'PARALLEL WITH Clause'
---




# PARALLEL WITH 句

複数のステートメントを並行して実行できるようにします。

## 構文 {#syntax}

```sql
statement1 PARALLEL WITH statement2 [PARALLEL WITH statement3 ...]
```

ステートメント `statement1`、`statement2`、`statement3` などを互いに並行して実行します。これらのステートメントの出力は破棄されます。

多くの場合、ステートメントを並行して実行すると、同じステートメントのシーケンスよりも速くなる可能性があります。たとえば、`statement1 PARALLEL WITH statement2 PARALLEL WITH statement3` は `statement1; statement2; statement3` よりも速い可能性があります。

## 例 {#examples}

2 つのテーブルを並行して作成します：

```sql
CREATE TABLE table1(x Int32) ENGINE = MergeTree ORDER BY tuple()
PARALLEL WITH
CREATE TABLE table2(y String) ENGINE = MergeTree ORDER BY tuple();
```

2 つのテーブルを並行して削除します：

```sql
DROP TABLE table1
PARALLEL WITH
DROP TABLE table2;
```

## 設定 {#settings}

設定 [max_threads](../../operations/settings/settings.md#max_threads) は、スレッドがいくつ生成されるかを制御します。

## UNION との比較 {#comparison-with-union}

`PARALLEL WITH` 句は、オペランドを並行して実行する [UNION](select/union.md) と少し似ています。ただし、いくつかの違いがあります：
- `PARALLEL WITH` は、オペランドの実行から結果を返さず、例外があればそれを再スローすることしかできません；
- `PARALLEL WITH` は、オペランドに同じ結果カラムのセットを必要としません；
- `PARALLEL WITH` は、任意のステートメントを実行できます（`SELECT` のみではありません）。
