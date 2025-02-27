---
slug: /sql-reference/aggregate-functions/reference/grouparraylast
sidebar_position: 142
---

# groupArrayLast

構文: `groupArrayLast(max_size)(x)`

最後の引数の値の配列を作成します。  
例えば、`groupArrayLast(1)(x)`は`[anyLast (x)]`と同等です。

いくつかのケースでは、実行順序に依存することができます。これは、`SELECT`が`ORDER BY`を使用するサブクエリからの場合で、サブクエリの結果が十分に小さい場合に適用されます。

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

`groupArray`と比較すると:

```sql
select groupArray(2)(number+1) numbers from numbers(10)
```

```text
┌─numbers─┐
│ [1,2]   │
└─────────┘
```
