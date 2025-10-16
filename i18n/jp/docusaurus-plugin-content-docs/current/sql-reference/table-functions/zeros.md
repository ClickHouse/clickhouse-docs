---
'description': 'テスト目的で、多くの行を生成するための最も高速な方法として使用されます。`system.zeros`および`system.zeros_mt`システムテーブルに似ています。'
'sidebar_label': 'ゼロ'
'sidebar_position': 145
'slug': '/sql-reference/table-functions/zeros'
'title': 'ゼロ'
'doc_type': 'reference'
---


# zeros テーブル関数

* `zeros(N)` – 整数 0 を `N` 回含む単一の 'zero' カラム (UInt8) を持つテーブルを返します
* `zeros_mt(N)` – `zeros` と同じですが、複数のスレッドを使用します。

この関数は、テスト目的で多くの行を生成するための最速の方法として使用されます。 `system.zeros` と `system.zeros_mt` システムテーブルに似ています。

次のクエリは同等です：

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
```
