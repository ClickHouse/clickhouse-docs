---
description: 'MergeTree 테이블의 인덱스 파일과 마크 파일의 내용을 나타냅니다. 내부를 살펴보는 데 사용할 수 있습니다.'
sidebar_label: 'mergeTreeIndex'
sidebar_position: 77
slug: /sql-reference/table-functions/mergeTreeIndex
title: 'mergeTreeIndex'
doc_type: 'reference'
---



# mergeTreeIndex 테이블 함수 \{#mergetreeindex-table-function\}

MergeTree 테이블의 인덱스와 마크 파일의 내용을 나타냅니다. 내부 구조를 살펴보는 용도로 사용할 수 있습니다.



## 구문 \{#syntax\}

```sql
mergeTreeIndex(database, table [, with_marks = true] [, with_minmax = true])
```


## 인수 \{#arguments\}

| Argument      | Description                                       |
|---------------|---------------------------------------------------|
| `database`    | 인덱스와 마크를 읽어 올 데이터베이스 이름입니다.   |
| `table`       | 인덱스와 마크를 읽어 올 테이블 이름입니다.         |
| `with_marks`  | 결과에 마크가 있는 컬럼을 포함할지 여부입니다.     |
| `with_minmax` | 결과에 min-max 인덱스를 포함할지 여부입니다.       |



## 반환 값 \{#returned_value\}

소스 테이블의 기본 인덱스와 min-max 인덱스(사용 설정된 경우) 값이 포함된 컬럼, 소스 테이블의 데이터 파트에서 가능한 모든 파일에 대한 마크 값(사용 설정된 경우)이 포함된 컬럼, 그리고 가상 컬럼을 가진 테이블 객체입니다:

- `part_name` - 데이터 파트의 이름.
- `mark_number` - 데이터 파트에서 현재 마크의 번호.
- `rows_in_granule` - 현재 granule(그라뉼)에 있는 행의 개수.

마크 컬럼에는 컬럼이 데이터 파트에 존재하지 않거나, 서브스트림 중 하나에 대한 마크가 기록되지 않은 경우(예: 컴팩트 파트) `(NULL, NULL)` 값이 들어 있을 수 있습니다.



## 사용 예 \{#usage-example\}

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
