---
alias: []
description: 'RowBinary 형식에 대한 문서'
input_format: true
keywords: ['RowBinary']
output_format: true
slug: /interfaces/formats/RowBinary
title: 'RowBinary'
doc_type: 'reference'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| 입력 | 출력 | 별칭 |
| -- | -- | -- |
| ✔  | ✔  |    |


## 설명 \{#description\}

`RowBinary` 포맷은 데이터를 바이너리 형식으로 행 단위로 파싱합니다.  
행과 값은 구분자 없이 연속적으로 나열됩니다.  
데이터가 바이너리 포맷이기 때문에 `FORMAT RowBinary` 뒤의 구분자는 다음과 같이 엄격하게 지정됩니다:

- 임의 개수의 공백 문자:
  - `' '` (space - 코드 `0x20`)
  - `'\t'` (tab - 코드 `0x09`)
  - `'\f'` (form feed - 코드 `0x0C`) 
- 이어서 정확히 한 번의 새 줄(new line) 시퀀스:
  - Windows 스타일 `"\r\n"` 
  - 또는 Unix 스타일 `'\n'`
- 그리고 바로 이어서 바이너리 데이터가 옵니다.

:::note
이 포맷은 행 기반 포맷이기 때문에 [Native](../Native.md) 포맷보다 효율성이 떨어집니다.
:::

다음 데이터 타입에 대해서는 다음 사항을 유의해야 합니다:

- [Integers](../../../sql-reference/data-types/int-uint.md)는 고정 길이 리틀 엔디언 표현을 사용합니다. 예를 들어 `UInt64`는 8바이트를 사용합니다.
- [DateTime](../../../sql-reference/data-types/datetime.md)은 값으로 Unix 타임스탬프를 담고 있는 `UInt32`로 표현됩니다.
- [Date](../../../sql-reference/data-types/date.md)는 `1970-01-01` 이후 경과 일수를 값으로 담고 있는 `UInt16` 객체로 표현됩니다.
- [String](../../../sql-reference/data-types/string.md)은 가변 길이 정수(varint) (부호 없는 [`LEB128`](https://en.wikipedia.org/wiki/LEB128))로 길이를 표현하고, 그 뒤에 문자열 바이트들이 따라옵니다.
- [FixedString](../../../sql-reference/data-types/fixedstring.md)은 단순히 바이트 시퀀스로 표현됩니다.
- [Arrays](../../../sql-reference/data-types/array.md)는 가변 길이 정수(varint) (부호 없는 [LEB128](https://en.wikipedia.org/wiki/LEB128))로 길이를 표현하고, 그 뒤에 배열의 요소들이 순차적으로 따라옵니다.

[NULL](/sql-reference/syntax#null) 지원을 위해 각 [Nullable](/sql-reference/data-types/nullable.md) 값 앞에는 `1` 또는 `0`을 담은 추가 바이트가 붙습니다. 
- 값이 `1`이면 해당 값은 `NULL`이며, 이 바이트는 별도의 값으로 해석됩니다. 
- 값이 `0`이면 이 바이트 뒤의 값은 `NULL`이 아닙니다.

`RowBinary` 포맷과 `RawBlob` 포맷의 비교는 다음을 참고하십시오: [Raw 포맷 비교](../RawBLOB.md/#raw-formats-comparison)



## 사용 예 \{#example-usage\}



## 형식 설정 \{#format-settings\}

<RowBinaryFormatSettings/>