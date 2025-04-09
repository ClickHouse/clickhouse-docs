---
title: Npy
slug: /interfaces/formats/Npy
keywords: [Npy]
input_format: true
output_format: true
alias: []
---

| 入力   | 出力   | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

`Npy` 形式は、`.npy` ファイルから NumPy 配列を ClickHouse にロードするために設計されています。
NumPy ファイル形式は、数値データの配列を効率的に保存するために使用されるバイナリ形式です。
インポート中、ClickHouse は最上位の次元を単一カラムの行の配列として扱います。

以下の表は、サポートされている Npy データ型とそれに対応する ClickHouse のデータ型を示しています。

## データ型の対応 {#data_types-matching}

| Npy データ型 (`INSERT`) | ClickHouse データ型                                                 | Npy データ型 (`SELECT`) |
|-------------------------|--------------------------------------------------------------------|-------------------------|
| `i1`                    | [Int8](/sql-reference/data-types/int-uint.md)                | `i1`                    |
| `i2`                    | [Int16](/sql-reference/data-types/int-uint.md)               | `i2`                    |
| `i4`                    | [Int32](/sql-reference/data-types/int-uint.md)               | `i4`                    |
| `i8`                    | [Int64](/sql-reference/data-types/int-uint.md)               | `i8`                    |
| `u1`, `b1`              | [UInt8](/sql-reference/data-types/int-uint.md)               | `u1`                    |
| `u2`                    | [UInt16](/sql-reference/data-types/int-uint.md)              | `u2`                    |
| `u4`                    | [UInt32](/sql-reference/data-types/int-uint.md)              | `u4`                    |
| `u8`                    | [UInt64](/sql-reference/data-types/int-uint.md)              | `u8`                    |
| `f2`, `f4`              | [Float32](/sql-reference/data-types/float.md)                | `f4`                    |
| `f8`                    | [Float64](/sql-reference/data-types/float.md)                | `f8`                    |
| `S`, `U`                | [String](/sql-reference/data-types/string.md)                | `S`                     |
|                         | [FixedString](/sql-reference/data-types/fixedstring.md)      | `S`                     |

## 使用例 {#example-usage}

### Python を使用して .npy 形式で配列を保存する {#saving-an-array-in-npy-format-using-python}

```Python
import numpy as np
arr = np.array([[[1],[2],[3]],[[4],[5],[6]]])
np.save('example_array.npy', arr)
```

### ClickHouse で NumPy ファイルを読み込む {#reading-a-numpy-file-in-clickhouse}

```sql title="クエリ"
SELECT *
FROM file('example_array.npy', Npy)
```

```response title="レスポンス"
┌─array─────────┐
│ [[1],[2],[3]] │
│ [[4],[5],[6]] │
└───────────────┘
```

### データの選択 {#selecting-data}

ClickHouse テーブルからデータを選択し、Npy 形式でファイルに保存するには、次のコマンドを clickhouse-client で使用します。

```bash
$ clickhouse-client --query="SELECT {column} FROM {some_table} FORMAT Npy" > {filename.npy}
```

## フォーマット設定 {#format-settings}
