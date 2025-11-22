---
alias: []
description: 'Npy 形式のドキュメント'
input_format: true
keywords: ['Npy']
output_format: true
slug: /interfaces/formats/Npy
title: 'Npy'
doc_type: 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |



## 説明 {#description}

`Npy`フォーマットは、`.npy`ファイルからNumPy配列をClickHouseに読み込むために設計されています。
NumPyファイルフォーマットは、数値データの配列を効率的に保存するためのバイナリフォーマットです。
インポート時、ClickHouseは最上位の次元を単一列を持つ行の配列として扱います。

以下の表は、サポートされているNpyデータ型とClickHouseにおける対応する型を示しています:


## データ型の対応 {#data_types-matching}

| Npyデータ型（`INSERT`） | ClickHouseデータ型                                    | Npyデータ型（`SELECT`） |
| ------------------------ | ------------------------------------------------------- | ------------------------ |
| `i1`                     | [Int8](/sql-reference/data-types/int-uint.md)           | `i1`                     |
| `i2`                     | [Int16](/sql-reference/data-types/int-uint.md)          | `i2`                     |
| `i4`                     | [Int32](/sql-reference/data-types/int-uint.md)          | `i4`                     |
| `i8`                     | [Int64](/sql-reference/data-types/int-uint.md)          | `i8`                     |
| `u1`, `b1`               | [UInt8](/sql-reference/data-types/int-uint.md)          | `u1`                     |
| `u2`                     | [UInt16](/sql-reference/data-types/int-uint.md)         | `u2`                     |
| `u4`                     | [UInt32](/sql-reference/data-types/int-uint.md)         | `u4`                     |
| `u8`                     | [UInt64](/sql-reference/data-types/int-uint.md)         | `u8`                     |
| `f2`, `f4`               | [Float32](/sql-reference/data-types/float.md)           | `f4`                     |
| `f8`                     | [Float64](/sql-reference/data-types/float.md)           | `f8`                     |
| `S`, `U`                 | [String](/sql-reference/data-types/string.md)           | `S`                      |
|                          | [FixedString](/sql-reference/data-types/fixedstring.md) | `S`                      |


## 使用例 {#example-usage}

### Pythonを使用した配列の.npy形式での保存 {#saving-an-array-in-npy-format-using-python}

```Python
import numpy as np
arr = np.array([[[1],[2],[3]],[[4],[5],[6]]])
np.save('example_array.npy', arr)
```

### ClickHouseでのNumPyファイルの読み込み {#reading-a-numpy-file-in-clickhouse}

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

clickhouse-clientで以下のコマンドを使用して、ClickHouseテーブルからデータを選択し、Npy形式のファイルに保存できます:

```bash
$ clickhouse-client --query="SELECT {column} FROM {some_table} FORMAT Npy" > {filename.npy}
```


## フォーマット設定 {#format-settings}
