---
description: '`EXISTS` 演算子に関するドキュメント'
slug: /sql-reference/operators/exists
title: 'EXISTS'
doc_type: 'reference'
---

# EXISTS {#exists}

`EXISTS` 演算子は、サブクエリの結果にレコードが存在するかどうかを判定します。結果が空の場合、この演算子は `0` を返し、1 件以上存在する場合は `1` を返します。

`EXISTS` は [WHERE](../../sql-reference/statements/select/where.md) 句でも使用できます。

:::tip\
メインクエリのテーブルおよびカラムへの参照は、サブクエリ内ではサポートされません。
:::

**構文**

```sql
EXISTS(subquery)
```

**例**

サブクエリ内に値が存在するかどうかを確認するクエリ:

```sql
SELECT EXISTS(SELECT * FROM numbers(10) WHERE number > 8), EXISTS(SELECT * FROM numbers(10) WHERE number > 11)
```

結果：

```text
┌─in(1, _subquery1)─┬─in(1, _subquery2)─┐
│                 1 │                 0 │
└───────────────────┴───────────────────┘
```

複数行を返す副問い合わせを使用したクエリ:

```sql
SELECT count() FROM numbers(10) WHERE EXISTS(SELECT number FROM numbers(10) WHERE number > 8);
```

結果：

```text
┌─count()─┐
│      10 │
└─────────┘
```

結果が空になるサブクエリを含むクエリ:

```sql
SELECT count() FROM numbers(10) WHERE EXISTS(SELECT number FROM numbers(10) WHERE number > 11);
```

結果：

```text
┌─count()─┐
│       0 │
└─────────┘
```
