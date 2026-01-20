---
alias: []
description: 'Buffers 格式文档'
input_format: true
keywords: ['Buffers']
output_format: true
slug: /interfaces/formats/Buffers
title: 'Buffers'
doc_type: 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 \{#description\}

`Buffers` 是一种非常简单的用于**临时**数据交换的二进制格式，在该格式中，消费者和生产者都已知晓模式（schema）和列顺序。

与 [Native](./Native.md) 不同，它**不会**存储列名、列类型或任何额外的元数据。

在这种格式中，数据以二进制格式按[块](/development/architecture#block)进行读写。Buffers 使用与 [Native](./Native.md) 格式相同的按列二进制表示，并遵循相同的 Native 格式设置。

对于每个块，会写入如下序列：

1. 列的数量（UInt64，小端序）。
2. 行的数量（UInt64，小端序）。
3. 对于每一列：

- 序列化列数据的总字节大小（UInt64，小端序）。
- 序列化的列数据字节，与 [Native](./Native.md) 格式中的完全一致。

## 示例用法 \{#example-usage\}

写入到文件：

```sql
SELECT
    number AS num,
    number * number AS num_square
FROM numbers(10)
INTO OUTFILE 'squares.buffers'
FORMAT Buffers;
```

以显式列类型读取：

```sql
SELECT
    *
FROM file(
    'squares.buffers',
    'Buffers',
    'col_1 UInt64, col_2 UInt64'
);
```

```txt
  ┌─col_1─┬─col_2─┐
  │     0 │     0 │
  │     1 │     1 │
  │     2 │     4 │
  │     3 │     9 │
  │     4 │    16 │
  │     5 │    25 │
  │     6 │    36 │
  │     7 │    49 │
  │     8 │    64 │
  │     9 │    81 │
  └───────┴───────┘
```

如果你有一张列类型相同的表，可以直接向其中写入数据：

```sql
CREATE TABLE number_squares
(
    a UInt64,
    b UInt64
) ENGINE = Memory;

INSERT INTO number_squares
FROM INFILE 'squares.buffers'
FORMAT Buffers;
```

查看该表：

```sql
SELECT * FROM number_squares;
```

```txt
  ┌─a─┬──b─┐
  │ 0 │  0 │
  │ 1 │  1 │
  │ 2 │  4 │
  │ 3 │  9 │
  │ 4 │ 16 │
  │ 5 │ 25 │
  │ 6 │ 36 │
  │ 7 │ 49 │
  │ 8 │ 64 │
  │ 9 │ 81 │
  └───┴────┘
```


## 格式设置 \{#format-settings\}