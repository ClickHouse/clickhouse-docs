---
alias: []
description: 'Npy 형식에 대한 문서'
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



## 설명 \{#description\}

`Npy` 포맷은 `.npy` 파일에 저장된 NumPy 배열을 ClickHouse로 로드하기 위해 설계되었습니다.  
NumPy 파일 포맷은 수치 데이터 배열을 효율적으로 저장하기 위해 사용되는 이진 포맷입니다.  
가져오는 동안 ClickHouse는 최상위 차원을 단일 컬럼을 가진 행 배열로 처리합니다. 

아래 표는 지원되는 Npy 데이터 타입과 ClickHouse에서의 대응 타입을 보여 줍니다:



## 데이터 타입 매칭 \{#data_types-matching\}

| Npy 데이터 타입 (`INSERT`) | ClickHouse 데이터 타입                                            | Npy 데이터 타입 (`SELECT`) |
|----------------------------|-------------------------------------------------------------------|----------------------------|
| `i1`                       | [Int8](/sql-reference/data-types/int-uint.md)           | `i1`                       |
| `i2`                       | [Int16](/sql-reference/data-types/int-uint.md)          | `i2`                       |
| `i4`                       | [Int32](/sql-reference/data-types/int-uint.md)          | `i4`                       |
| `i8`                       | [Int64](/sql-reference/data-types/int-uint.md)          | `i8`                       |
| `u1`, `b1`                 | [UInt8](/sql-reference/data-types/int-uint.md)          | `u1`                       |
| `u2`                       | [UInt16](/sql-reference/data-types/int-uint.md)         | `u2`                       |
| `u4`                       | [UInt32](/sql-reference/data-types/int-uint.md)         | `u4`                       |
| `u8`                       | [UInt64](/sql-reference/data-types/int-uint.md)         | `u8`                       |
| `f2`, `f4`                 | [Float32](/sql-reference/data-types/float.md)           | `f4`                       |
| `f8`                       | [Float64](/sql-reference/data-types/float.md)           | `f8`                       |
| `S`, `U`                   | [String](/sql-reference/data-types/string.md)           | `S`                        |
|                            | [FixedString](/sql-reference/data-types/fixedstring.md) | `S`                        |



## 사용 예제 \{#example-usage\}

### Python을 사용하여 배열을 .npy 형식으로 저장하기 \{#saving-an-array-in-npy-format-using-python\}

```Python
import numpy as np
arr = np.array([[[1],[2],[3]],[[4],[5],[6]]])
np.save('example_array.npy', arr)
```

### ClickHouse에서 NumPy 파일을 읽는 방법 \{#reading-a-numpy-file-in-clickhouse\}

```sql title="Query"
SELECT *
FROM file('example_array.npy', Npy)
```

```response title="Response"
┌─array─────────┐
│ [[1],[2],[3]] │
│ [[4],[5],[6]] │
└───────────────┘
```

### 데이터 선택 \{#selecting-data\}

다음 `clickhouse-client` 명령을 사용하면 ClickHouse 테이블에서 데이터를 조회하여 Npy 형식의 파일로 저장할 수 있습니다:

```bash
$ clickhouse-client --query="SELECT {column} FROM {some_table} FORMAT Npy" > {filename.npy}
```


## 형식 설정 \{#format-settings\}
