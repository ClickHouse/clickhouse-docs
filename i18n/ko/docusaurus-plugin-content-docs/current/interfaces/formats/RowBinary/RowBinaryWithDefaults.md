---
alias: []
description: 'RowBinaryWithDefaults 형식에 대한 문서'
input_format: true
keywords: ['RowBinaryWithDefaults']
output_format: false
slug: /interfaces/formats/RowBinaryWithDefaults
title: 'RowBinaryWithDefaults'
doc_type: 'reference'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| 입력 | 출력 | 별칭 |
| -- | -- | -- |
| ✔  | ✗  |    |


## 설명 \{#description\}

[`RowBinary`](./RowBinary.md) 형식과 유사하지만, 각 컬럼 앞에 기본값 사용 여부를 나타내는 1바이트가 추가됩니다.



## 사용 예 \{#example-usage\}

예시:

```sql title="Query"
SELECT * FROM FORMAT('RowBinaryWithDefaults', 'x UInt32 default 42, y UInt32', x'010001000000')
```

```response title="Response"
┌──x─┬─y─┐
│ 42 │ 1 │
└────┴───┘
```

* 컬럼 `x`에서는 기본값을 사용해야 함을 나타내는 1바이트 `01`만 있으며, 이 바이트 뒤에는 다른 데이터가 존재하지 않습니다.
* 컬럼 `y`에서는 데이터가 바이트 `00`으로 시작하는데, 이는 컬럼에 실제 값이 있으며 뒤이은 데이터 `01000000`에서 읽어야 함을 나타냅니다.


## 형식 설정 \{#format-settings\}

<RowBinaryFormatSettings/>
