---
'description': '最後の引数値の配列を作成します。'
'sidebar_position': 142
'slug': '/sql-reference/aggregate-functions/reference/grouparraylast'
'title': 'groupArrayLast'
'doc_type': 'reference'
---


# groupArrayLast

構文: `groupArrayLast(max_size)(x)`

最後の引数値の配列を作成します。  
例えば、`groupArrayLast(1)(x)` は `[anyLast (x)]` と同等です。

いくつかのケースでは、実行順序に依存することができます。これは、`SELECT` が小さいサブクエリから `ORDER BY` を使用してくる場合に適用されます。

**例**

クエリ:

```sql
SELECT groupArrayLast(2)(number+1) numbers FROM numbers(10)
```

結果:

```text
┌─numbers─┐
│ [9,10]  │
└─────────┘
```

`groupArray` と比較して:

```sql
SELECT groupArray(2)(number+1) numbers FROM numbers(10)
```

```text
┌─numbers─┐
│ [1,2]   │
└─────────┘
```
