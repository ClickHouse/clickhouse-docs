---
'alias': []
'description': 'RowBinaryWithDefaults 포맷에 대한 Documentation'
'input_format': true
'keywords':
- 'RowBinaryWithDefaults'
'output_format': false
'slug': '/interfaces/formats/RowBinaryWithDefaults'
'title': 'RowBinaryWithDefaults'
'doc_type': 'reference'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✗      |       |

## 설명 {#description}

[`RowBinary`](./RowBinary.md) 형식과 유사하지만, 각 컬럼 앞에 기본 값을 사용해야 하는지를 나타내는 추가 바이트가 있습니다.

## 예제 사용법 {#example-usage}

예제:

```sql title="Query"
SELECT * FROM FORMAT('RowBinaryWithDefaults', 'x UInt32 default 42, y UInt32', x'010001000000')
```
```response title="Response"
┌──x─┬─y─┐
│ 42 │ 1 │
└────┴───┘
```

- 컬럼 `x`에 대해 기본 값을 사용해야 함을 나타내는 바이트 `01`만 있으며, 이 바이트 이후에는 다른 데이터가 제공되지 않습니다.
- 컬럼 `y`의 데이터는 기본 값이 아닌 실제 값이 있음을 나타내는 바이트 `00`으로 시작하며, 이후 데이터 `01000000`에서 읽어야 할 실제 값이 있습니다.

## 형식 설정 {#format-settings}

<RowBinaryFormatSettings/>
