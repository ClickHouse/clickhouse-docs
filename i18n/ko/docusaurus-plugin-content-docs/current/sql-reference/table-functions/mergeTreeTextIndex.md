---
description: 'MergeTree 테이블에서 텍스트 인덱스의 딕셔너리를 나타냅니다.
  내부 상태를 확인하는 용도로 사용할 수 있습니다.'
sidebar_label: 'mergeTreeTextIndex'
sidebar_position: 77
slug: /sql-reference/table-functions/mergeTreeTextIndex
title: 'mergeTreeTextIndex'
doc_type: 'reference'
---

# mergeTreeTextIndex 테이블 함수 \{#mergetreetextindex-table-function\}

MergeTree 테이블에서 텍스트 인덱스의 딕셔너리를 나타냅니다.
토큰과 해당 포스팅 리스트 메타데이터를 반환합니다.
내부 구조를 점검하거나 분석하는 용도로 사용할 수 있습니다.

## 구문 \{#syntax\}

```sql
mergeTreeTextIndex(database, table, index_name)
```


## Arguments \{#arguments\}

| 인수          | 설명                                            |
|--------------|-------------------------------------------------|
| `database`   | 텍스트 인덱스를 읽어 올 데이터베이스 이름입니다. |
| `table`      | 텍스트 인덱스를 읽어 올 테이블 이름입니다.       |
| `index_name` | 읽어 올 텍스트 인덱스입니다.                     |

## 반환 값 \{#returned_value\}

토큰과 해당 포스팅 리스트(posting list) 메타데이터를 포함하는 테이블 객체입니다.

## 사용 예제 \{#usage-example\}

```sql
CREATE TABLE tab
(
    id UInt64,
    s String,
    INDEX idx_s (s) TYPE text(tokenizer = splitByNonAlpha)
)
ENGINE = MergeTree
ORDER BY id;

INSERT INTO tab SELECT number, concatWithSeparator(' ', 'apple', 'banana') FROM numbers(500);
INSERT INTO tab SELECT 500 + number, concatWithSeparator(' ', 'cherry', 'date') FROM numbers(500);

SELECT * FROM mergeTreeTextIndex(currentDatabase(), tab, idx_s);
```

결과:

```text
   ┌─part_name─┬─token──┬─dictionary_compression─┬─cardinality─┬─num_posting_blocks─┬─has_embedded_postings─┬─has_raw_postings─┬─has_compressed_postings─┐
1. │ all_1_1_0 │ apple  │ front_coded            │         500 │                  1 │                     0 │                0 │                       0 │
2. │ all_1_1_0 │ banana │ front_coded            │         500 │                  1 │                     0 │                0 │                       0 │
3. │ all_2_2_0 │ cherry │ front_coded            │         500 │                  1 │                     0 │                0 │                       0 │
4. │ all_2_2_0 │ date   │ front_coded            │         500 │                  1 │                     0 │                0 │                       0 │
   └───────────┴────────┴────────────────────────┴─────────────┴────────────────────┴───────────────────────┴──────────────────┴─────────────────────────┘
```
