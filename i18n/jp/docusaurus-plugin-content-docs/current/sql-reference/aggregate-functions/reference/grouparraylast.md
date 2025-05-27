---
'description': 'Creates an array of the last argument values.'
'sidebar_position': 142
'slug': '/sql-reference/aggregate-functions/reference/grouparraylast'
'title': 'groupArrayLast'
---




# groupArrayLast

構文: `groupArrayLast(max_size)(x)`

最後の引数の値の配列を作成します。例えば、`groupArrayLast(1)(x)` は `[anyLast (x)]` と等価です。

いくつかのケースでは、実行順序に依存することができます。これは、`SELECT` が小さすぎるサブクエリの結果を使用して `ORDER BY` を含む場合に該当します。

**例**

クエリ:

```sql
select groupArrayLast(2)(number+1) numbers from numbers(10)
```

結果:

```text
┌─numbers─┐
│ [9,10]  │
└─────────┘
```

`groupArray` と比較すると:

```sql
select groupArray(2)(number+1) numbers from numbers(10)
```

```text
┌─numbers─┐
│ [1,2]   │
└─────────┘
```
