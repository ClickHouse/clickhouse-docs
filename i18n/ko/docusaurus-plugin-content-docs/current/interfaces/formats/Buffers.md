---
alias: []
description: 'Buffers 형식에 대한 문서'
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

## 설명 \{#description\}

`Buffers`는 소비자와 생산자 모두가 이미 스키마와 컬럼 순서를 알고 있는 상황에서 **휘발성** 데이터 교환을 위한 매우 단순한 이진 형식입니다.

[Native](./Native.md)와 달리, 컬럼 이름, 컬럼 타입 또는 추가 메타데이터를 저장하지 **않습니다**.

이 형식에서는 데이터가 이진 형식의 [블록](/development/architecture#block) 단위로 쓰이고 읽힙니다. Buffers는 [Native](./Native.md) 형식과 동일한 컬럼별 이진 표현을 사용하며, 동일한 Native 형식 설정을 따릅니다.

각 블록마다 다음 순서로 데이터가 기록됩니다:

1. 컬럼 개수 (UInt64, 리틀 엔디언).
2. 행 개수 (UInt64, 리틀 엔디언).
3. 각 컬럼에 대해:

- 직렬화된 컬럼 데이터의 전체 바이트 크기 (UInt64, 리틀 엔디언).
- [Native](./Native.md) 형식과 정확히 동일한 직렬화된 컬럼 데이터 바이트.

## 사용 예시 \{#example-usage\}

파일에 기록합니다:

```sql
SELECT
    number AS num,
    number * number AS num_square
FROM numbers(10)
INTO OUTFILE 'squares.buffers'
FORMAT Buffers;
```

컬럼 타입을 명시하여 다시 읽기:

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

동일한 컬럼 타입을 사용하는 테이블이 있다면, 해당 테이블을 바로 채울 수 있습니다:

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

테이블을 살펴보십시오:

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


## 형식 설정 \{#format-settings\}