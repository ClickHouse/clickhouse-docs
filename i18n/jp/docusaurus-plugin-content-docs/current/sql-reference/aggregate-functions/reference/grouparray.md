---
description: '引数の値の配列を作成します。値は任意の（不定の）順序で配列に追加できます。'
sidebar_position: 139
slug: /sql-reference/aggregate-functions/reference/grouparray
title: 'groupArray'
---


# groupArray

構文: `groupArray(x)` または `groupArray(max_size)(x)`

引数の値の配列を作成します。
値は任意の（不定の）順序で配列に追加できます。

2番目のバージョン（`max_size` パラメータを伴う）は、生成される配列のサイズを `max_size` 要素に制限します。例えば、`groupArray(1)(x)` は `[any (x)]` と同等です。

いくつかのケースでは、実行順序に依存することができます。これは、`SELECT` が `ORDER BY` を使用するサブクエリから来る場合に適用され、サブクエリの結果が十分に小さいときです。

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

クエリ:

```sql
select id, groupArray(10)(name) from default.ck group by id;
```

結果:

```text
┌─id─┬─groupArray(10)(name)─┐
│  1 │ ['zhangsan','lisi']  │
│  2 │ ['wangwu']           │
└────┴──────────────────────┘
```

上記の結果に基づいて、groupArray 関数は ᴺᵁᴸᴸ 値を削除します。

- エイリアス: `array_agg`.
