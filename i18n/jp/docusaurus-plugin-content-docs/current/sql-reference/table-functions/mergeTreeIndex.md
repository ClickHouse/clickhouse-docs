---
description: 'Represents the contents of index and marks files of MergeTree tables.
  It can be used for introspection.'
sidebar_label: 'mergeTreeIndex'
sidebar_position: 77
slug: '/sql-reference/table-functions/mergeTreeIndex'
title: 'mergeTreeIndex'
---




# mergeTreeIndex テーブル関数

MergeTree テーブルのインデックスとマークファイルの内容を表します。これは内部確認に使用できます。

## 構文 {#syntax}

```sql
mergeTreeIndex(database, table, [with_marks = true])
```

## 引数 {#arguments}

| 引数         | 説明                                           |
|--------------|------------------------------------------------|
| `database`   | インデックスとマークを読み込むデータベース名。   |
| `table`      | インデックスとマークを読み込むテーブル名。      |
| `with_marks` | 結果にマーク付きカラムを含めるかどうか。        |

## 戻り値 {#returned_value}

ソーステーブルの主キーの値を持つカラム、すべてのデータパーツに対するマークの値を持つカラム（有効な場合）、および仮想カラムを持つテーブルオブジェクト：

- `part_name` - データパートの名前。
- `mark_number` - データパート内の現在のマークの番号。
- `rows_in_granule` - 現在のグラニュール内の行数。

マークのカラムは、データパートにカラムが存在しない場合や、そのサブストリームのいずれかのマークが書き込まれていない場合（例：コンパクトパーツ）に `(NULL, NULL)` 値を含むことがあります。

## 使用例 {#usage-example}

```sql
CREATE TABLE test_table
(
    `id` UInt64,
    `n` UInt64,
    `arr` Array(UInt64)
)
ENGINE = MergeTree
ORDER BY id
SETTINGS index_granularity = 3, min_bytes_for_wide_part = 0, min_rows_for_wide_part = 8;

INSERT INTO test_table SELECT number, number, range(number % 5) FROM numbers(5);

INSERT INTO test_table SELECT number, number, range(number % 5) FROM numbers(10, 10);
```

```sql
SELECT * FROM mergeTreeIndex(currentDatabase(), test_table, with_marks = true);
```

```text
┌─part_name─┬─mark_number─┬─rows_in_granule─┬─id─┬─id.mark─┬─n.mark──┬─arr.size0.mark─┬─arr.mark─┐
│ all_1_1_0 │           0 │               3 │  0 │ (0,0)   │ (42,0)  │ (NULL,NULL)    │ (84,0)   │
│ all_1_1_0 │           1 │               2 │  3 │ (133,0) │ (172,0) │ (NULL,NULL)    │ (211,0)  │
│ all_1_1_0 │           2 │               0 │  4 │ (271,0) │ (271,0) │ (NULL,NULL)    │ (271,0)  │
└───────────┴─────────────┴─────────────────┴────┴─────────┴─────────┴────────────────┴──────────┘
┌─part_name─┬─mark_number─┬─rows_in_granule─┬─id─┬─id.mark─┬─n.mark─┬─arr.size0.mark─┬─arr.mark─┐
│ all_2_2_0 │           0 │               3 │ 10 │ (0,0)   │ (0,0)  │ (0,0)          │ (0,0)    │
│ all_2_2_0 │           1 │               3 │ 13 │ (0,24)  │ (0,24) │ (0,24)         │ (0,24)   │
│ all_2_2_0 │           2 │               3 │ 16 │ (0,48)  │ (0,48) │ (0,48)         │ (0,80)   │
│ all_2_2_0 │           3 │               1 │ 19 │ (0,72)  │ (0,72) │ (0,72)         │ (0,128)  │
│ all_2_2_0 │           4 │               0 │ 19 │ (0,80)  │ (0,80) │ (0,80)         │ (0,160)  │
└───────────┴─────────────┴─────────────────┴────┴─────────┴────────┴────────────────┴──────────┘
```

```sql
DESCRIBE mergeTreeIndex(currentDatabase(), test_table, with_marks = true) SETTINGS describe_compact_output = 1;
```

```text
┌─name────────────┬─type─────────────────────────────────────────────────────────────────────────────────────────────┐
│ part_name       │ String                                                                                           │
│ mark_number     │ UInt64                                                                                           │
│ rows_in_granule │ UInt64                                                                                           │
│ id              │ UInt64                                                                                           │
│ id.mark         │ Tuple(offset_in_compressed_file Nullable(UInt64), offset_in_decompressed_block Nullable(UInt64)) │
│ n.mark          │ Tuple(offset_in_compressed_file Nullable(UInt64), offset_in_decompressed_block Nullable(UInt64)) │
│ arr.size0.mark  │ Tuple(offset_in_compressed_file Nullable(UInt64), offset_in_decompressed_block Nullable(UInt64)) │
│ arr.mark        │ Tuple(offset_in_compressed_file Nullable(UInt64), offset_in_decompressed_block Nullable(UInt64)) │
└─────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────────┘

