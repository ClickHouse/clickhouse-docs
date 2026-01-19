---
alias: []
description: 'Buffers 形式のドキュメント'
input_format: true
keywords: ['Buffers']
output_format: true
slug: /interfaces/formats/Buffers
title: 'Buffers'
doc_type: 'reference'
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 \{#description\}

`Buffers` は、コンシューマーとプロデューサーの両方が既にスキーマとカラム順序を把握していることを前提とした、**一時的な** データ交換向けの非常にシンプルなバイナリ形式です。

[Native](./Native.md) と異なり、カラム名、カラム型、その他の追加メタデータは保持しません。

この形式では、データはバイナリ形式で [blocks](/development/architecture#block) 単位で書き込みおよび読み出しが行われます。Buffers は [Native](./Native.md) フォーマットと同じカラム単位のバイナリ表現を使用し、同じ Native フォーマットの設定に従います。

各ブロックごとに、次のシーケンスが書き込まれます：

1. カラム数 (UInt64, リトルエンディアン)。
2. 行数 (UInt64, リトルエンディアン)。
3. 各カラムごとに:

- シリアライズされたカラムデータの合計バイトサイズ (UInt64, リトルエンディアン)。
- [Native](./Native.md) フォーマットと完全に同一のシリアライズ済みカラムデータのバイト列。

## 使用例 \{#example-usage\}

ファイルに書き込む：

```sql
SELECT
    number AS num,
    number * number AS num_square
FROM numbers(10)
INTO OUTFILE 'squares.buffers'
FORMAT Buffers;
```

明示的にカラム型を指定して読み出します：

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

同じカラム型を持つテーブルがある場合は、そのテーブルに直接データを取り込めます。

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

テーブルを確認します。

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


## 書式設定 \{#format-settings\}