---
description: '引数値の配列を作成します。値は任意の（順不同の）順序で配列に追加されます。'
sidebar_position: 139
slug: /sql-reference/aggregate-functions/reference/grouparray
title: 'groupArray'
doc_type: 'reference'
---

# groupArray {#grouparray}

構文: `groupArray(x)` または `groupArray(max_size)(x)`

引数の値を要素とする配列を作成します。
配列に値が追加される順序は任意（非決定的）です。

2 番目の形式（`max_size` パラメータ付き）は、結果の配列サイズを `max_size` 要素に制限します。たとえば、`groupArray(1)(x)` は `[any (x)]` と等価です。

場合によっては、実行順序に依存しても問題ないことがあります。これは、`SELECT` が `ORDER BY` を使用するサブクエリからのものであり、そのサブクエリの結果が十分に小さい場合に当てはまります。

**例**

```text
SELECT * FROM default.ck;

┌─id─┬─name─────┐
│  1 │ zhangsan │
│  1 │ ᴺᵁᴸᴸ     │
│  1 │ lisi     │
│  2 │ wangwu   │
└────┴──────────┘

```

クエリ：

```sql
SELECT id, groupArray(10)(name) FROM default.ck GROUP BY id;
```

結果：

```text
┌─id─┬─groupArray(10)(name)─┐
│  1 │ ['zhangsan','lisi']  │
│  2 │ ['wangwu']           │
└────┴──────────────────────┘
```

`groupArray` 関数は、上記の結果に基づいて ᴺᵁᴸᴸ 値を除外します。

* 別名: `array_agg`。
