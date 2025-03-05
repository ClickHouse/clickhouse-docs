---
slug: /sql-reference/aggregate-functions/reference/grouparray
sidebar_position: 139
title: "groupArray"
description: "引数の値の配列を作成します。値は任意の（決定できない）順序で配列に追加できます。"
---


# groupArray

構文: `groupArray(x)` または `groupArray(max_size)(x)`

引数の値の配列を作成します。  
値は任意の（決定できない）順序で配列に追加できます。

2番目のバージョン（`max_size` パラメータ付き）は、結果の配列のサイズを `max_size` 要素に制限します。例えば、`groupArray(1)(x)` は `[any (x)]` と等価です。

いくつかのケースでは、実行順序に依存することができます。これは、`SELECT` が `ORDER BY` を使用しているサブクエリから来る場合に適用されますが、サブクエリの結果が十分に小さい場合に限ります。

**例**

``` text
SELECT * FROM default.ck;

┌─id─┬─name─────┐
│  1 │ zhangsan │
│  1 │ ᴺᵁᴸᴸ     │
│  1 │ lisi     │
│  2 │ wangwu   │
└────┴──────────┘

```

クエリ:

``` sql
select id, groupArray(10)(name) from default.ck group by id;
```

結果:

``` text
┌─id─┬─groupArray(10)(name)─┐
│  1 │ ['zhangsan','lisi']  │
│  2 │ ['wangwu']           │
└────┴──────────────────────┘
```

groupArray 関数は、上記の結果に基づいて ᴺᵁᴸᴸ 値を削除します。

- エイリアス: `array_agg`.
