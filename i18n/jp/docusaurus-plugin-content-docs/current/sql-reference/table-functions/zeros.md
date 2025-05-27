---
'description': 'Used for test purposes as the fastest method to generate many rows.
  Similar to the `system.zeros` and `system.zeros_mt` system tables.'
'sidebar_label': 'zeros'
'sidebar_position': 145
'slug': '/sql-reference/table-functions/zeros'
'title': 'zeros'
---




# zeros テーブル関数

* `zeros(N)` – 整数 0 を `N` 回含む単一の 'zero' カラム（UInt8）を持つテーブルを返します
* `zeros_mt(N)` – `zeros` と同様ですが、複数のスレッドを使用します。

この関数は、行を多数生成するための最速の方法としてテスト目的で使用されます。`system.zeros` および `system.zeros_mt` システムテーブルに似ています。

以下のクエリは同等です：

```sql
SELECT * FROM zeros(10);
SELECT * FROM system.zeros LIMIT 10;
SELECT * FROM zeros_mt(10);
SELECT * FROM system.zeros_mt LIMIT 10;
```

```response
┌─zero─┐
│    0 │
│    0 │
│    0 │
│    0 │
│    0 │
│    0 │
│    0 │
│    0 │
│    0 │
│    0 │
└──────┘

