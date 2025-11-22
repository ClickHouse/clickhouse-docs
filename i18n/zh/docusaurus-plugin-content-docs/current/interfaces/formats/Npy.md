---
alias: []
description: 'Npy 格式文档'
input_format: true
keywords: ['Npy']
output_format: true
slug: /interfaces/formats/Npy
title: 'Npy'
doc_type: 'reference'
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |



## 描述 {#description}

`Npy` 格式用于将 `.npy` 文件中的 NumPy 数组加载到 ClickHouse 中。
NumPy 文件格式是一种二进制格式,用于高效存储数值数据数组。
在导入时,ClickHouse 将顶层维度视为包含单列的行数组。

下表列出了支持的 Npy 数据类型及其在 ClickHouse 中的对应类型:


## 数据类型映射 {#data_types-matching}

| Npy 数据类型（`INSERT`） | ClickHouse 数据类型                                    | Npy 数据类型（`SELECT`） |
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


## 使用示例 {#example-usage}

### 使用 Python 保存数组为 .npy 格式 {#saving-an-array-in-npy-format-using-python}

```Python
import numpy as np
arr = np.array([[[1],[2],[3]],[[4],[5],[6]]])
np.save('example_array.npy', arr)
```

### 在 ClickHouse 中读取 NumPy 文件 {#reading-a-numpy-file-in-clickhouse}

```sql title="查询"
SELECT *
FROM file('example_array.npy', Npy)
```

```response title="响应"
┌─array─────────┐
│ [[1],[2],[3]] │
│ [[4],[5],[6]] │
└───────────────┘
```

### 查询数据 {#selecting-data}

您可以使用 clickhouse-client 通过以下命令从 ClickHouse 表中查询数据并将其保存为 Npy 格式文件:

```bash
$ clickhouse-client --query="SELECT {column} FROM {some_table} FORMAT Npy" > {filename.npy}
```


## 格式设置 {#format-settings}
