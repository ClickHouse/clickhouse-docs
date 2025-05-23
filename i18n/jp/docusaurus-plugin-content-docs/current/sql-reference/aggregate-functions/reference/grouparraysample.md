---
'description': 'Creates an array of sample argument values. The size of the resulting
  array is limited to `max_size` elements. Argument values are selected and added
  to the array randomly.'
'sidebar_position': 145
'slug': '/sql-reference/aggregate-functions/reference/grouparraysample'
'title': 'groupArraySample'
---




# groupArraySample

引数値のサンプル配列を作成します。結果の配列のサイズは `max_size` 要素に制限されます。引数値はランダムに選択され、配列に追加されます。

**構文**

```sql
groupArraySample(max_size[, seed])(x)
```

**引数**

- `max_size` — 結果の配列の最大サイズ。 [UInt64](../../data-types/int-uint.md).
- `seed` — ランダム番号生成器のシード。オプション。 [UInt64](../../data-types/int-uint.md). デフォルト値: `123456`。
- `x` — 引数（カラム名または式）。

**返される値**

- ランダムに選択された `x` 引数の配列。

タイプ: [Array](../../data-types/array.md).

**例**

テーブル `colors` を考慮してください：

```text
┌─id─┬─color──┐
│  1 │ red    │
│  2 │ blue   │
│  3 │ green  │
│  4 │ white  │
│  5 │ orange │
└────┴────────┘
```

カラム名を引数として使用したクエリ：

```sql
SELECT groupArraySample(3)(color) as newcolors FROM colors;
```

結果：

```text
┌─newcolors──────────────────┐
│ ['white','blue','green']   │
└────────────────────────────┘
```

カラム名と異なるシードを使用したクエリ：

```sql
SELECT groupArraySample(3, 987654321)(color) as newcolors FROM colors;
```

結果：

```text
┌─newcolors──────────────────┐
│ ['red','orange','green']   │
└────────────────────────────┘
```

式を引数として使用したクエリ：

```sql
SELECT groupArraySample(3)(concat('light-', color)) as newcolors FROM colors;
```

結果：

```text
┌─newcolors───────────────────────────────────┐
│ ['light-blue','light-orange','light-green'] │
└─────────────────────────────────────────────┘
```
