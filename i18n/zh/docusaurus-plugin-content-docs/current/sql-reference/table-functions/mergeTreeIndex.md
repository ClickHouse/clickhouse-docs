
# mergeTreeIndex 表函数

表示 MergeTree 表的索引和标记文件的内容。它可以用于内部检查。

## 语法 {#syntax}

```sql
mergeTreeIndex(database, table, [with_marks = true])
```

## 参数 {#arguments}

| 参数         | 描述                                             |
|--------------|---------------------------------------------------|
| `database`   | 读取索引和标记的数据库名称。                       |
| `table`      | 读取索引和标记的表名称。                         |
| `with_marks` | 是否将带有标记的列包含到结果中。                 |

## 返回值 {#returned_value}

一个表对象，包含源表主键的列值，以及数据分区中所有可能文件的标记的列值（如果启用），同时还有虚拟列：

- `part_name` - 数据分区的名称。
- `mark_number` - 数据分区当前标记的编号。
- `rows_in_granule` - 当前粒度中的行数。

当数据分区中缺少列或其子流的标记未写入（例如，在紧凑型分区中）时，标记列可能包含 `(NULL, NULL)` 值。

## 使用示例 {#usage-example}

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
```
