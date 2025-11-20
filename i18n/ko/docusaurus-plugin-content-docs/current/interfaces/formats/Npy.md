---
'alias': []
'description': 'Npy 형식에 대한 문서'
'input_format': true
'keywords':
- 'Npy'
'output_format': true
'slug': '/interfaces/formats/Npy'
'title': 'Npy'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 설명 {#description}

`Npy` 형식은 `.npy` 파일에서 NumPy 배열을 ClickHouse에 로드하기 위해 설계되었습니다. 
NumPy 파일 형식은 숫자 데이터 배열을 효율적으로 저장하기 위해 사용되는 이진 형식입니다. 
수입 시, ClickHouse는 상위 차원을 단일 컬럼이 있는 행의 배열로 취급합니다.

아래 표는 지원되는 Npy 데이터 유형과 해당 ClickHouse 유형을 제공합니다:

## 데이터 유형 일치 {#data_types-matching}

| Npy 데이터 유형 (`INSERT`) | ClickHouse 데이터 유형                                            | Npy 데이터 유형 (`SELECT`) |
|-----------------------------|------------------------------------------------------------------|-----------------------------|
| `i1`                        | [Int8](/sql-reference/data-types/int-uint.md)           | `i1`                        |
| `i2`                        | [Int16](/sql-reference/data-types/int-uint.md)          | `i2`                        |
| `i4`                        | [Int32](/sql-reference/data-types/int-uint.md)          | `i4`                        |
| `i8`                        | [Int64](/sql-reference/data-types/int-uint.md)          | `i8`                        |
| `u1`, `b1`                  | [UInt8](/sql-reference/data-types/int-uint.md)          | `u1`                        |
| `u2`                        | [UInt16](/sql-reference/data-types/int-uint.md)         | `u2`                        |
| `u4`                        | [UInt32](/sql-reference/data-types/int-uint.md)         | `u4`                        |
| `u8`                        | [UInt64](/sql-reference/data-types/int-uint.md)         | `u8`                        |
| `f2`, `f4`                  | [Float32](/sql-reference/data-types/float.md)           | `f4`                        |
| `f8`                        | [Float64](/sql-reference/data-types/float.md)           | `f8`                        |
| `S`, `U`                    | [String](/sql-reference/data-types/string.md)           | `S`                         |
|                             | [FixedString](/sql-reference/data-types/fixedstring.md) | `S`                         |

## 예제 사용법 {#example-usage}

### Python을 사용하여 .npy 형식으로 배열 저장하기 {#saving-an-array-in-npy-format-using-python}

```Python
import numpy as np
arr = np.array([[[1],[2],[3]],[[4],[5],[6]]])
np.save('example_array.npy', arr)
```

### ClickHouse에서 NumPy 파일 읽기 {#reading-a-numpy-file-in-clickhouse}

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

### 데이터 선택하기 {#selecting-data}

ClickHouse 테이블에서 데이터를 선택하고 clickhouse-client를 사용하여 Npy 형식으로 파일에 저장할 수 있습니다:

```bash
$ clickhouse-client --query="SELECT {column} FROM {some_table} FORMAT Npy" > {filename.npy}
```

## 형식 설정 {#format-settings}
