---
description: '引数の値からなる配列を作成します。値は任意の（不定の）順序で配列に追加されます。'
sidebar_position: 139
slug: /sql-reference/aggregate-functions/reference/grouparray
title: 'groupArray'
doc_type: 'reference'
---

# groupArray

構文: `groupArray(x)` または `groupArray(max_size)(x)`

引数の値から配列を作成します。
配列への値の追加は任意の（不定な）順序で行われます。

2つ目の形式（`max_size` パラメータ付き）は、結果の配列のサイズを `max_size` 要素に制限します。たとえば、`groupArray(1)(x)` は `[any (x)]` と同等です。

場合によっては、なお実行順序に依存できます。これは、`SELECT` 文が `ORDER BY` を使用するサブクエリからデータを取得し、そのサブクエリの結果が十分に小さい場合に当てはまります。

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
