---
'description': '引数値の配列を作成します。値は配列に任意の（不確定）順序で追加できます。'
'sidebar_position': 139
'slug': '/sql-reference/aggregate-functions/reference/grouparray'
'title': 'groupArray'
'doc_type': 'reference'
---


# groupArray

構文: `groupArray(x)` または `groupArray(max_size)(x)`

引数の値の配列を作成します。値は任意の（不確定な）順序で配列に追加できます。

2番目のバージョン（`max_size` パラメーター付き）は、結果の配列のサイズを `max_size` 要素に制限します。例えば、`groupArray(1)(x)` は `[any (x)]` と同等です。

いくつかのケースでは、実行順序をまだ信頼することができます。これは、`SELECT` が `ORDER BY` を使用するサブクエリから来る場合に適用されますが、そのサブクエリの結果が十分に小さい場合です。

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
SELECT id, groupArray(10)(name) FROM default.ck GROUP BY id;
```

結果:

```text
┌─id─┬─groupArray(10)(name)─┐
│  1 │ ['zhangsan','lisi']  │
│  2 │ ['wangwu']           │
└────┴──────────────────────┘
```

groupArray 関数は、上記の結果に基づいて ᴺᵁᴸᴸ 値を削除します。

- エイリアス: `array_agg`.
