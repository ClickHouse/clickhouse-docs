---
'alias': []
'description': 'RowBinary 형식에 대한 Documentation'
'input_format': true
'keywords':
- 'RowBinary'
'output_format': true
'slug': '/interfaces/formats/RowBinary'
'title': 'RowBinary'
'doc_type': 'reference'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 설명 {#description}

`RowBinary` 형식은 이진 형식으로 행별로 데이터를 구문 분석합니다.  
행과 값은 구분자 없이 연속적으로 나열됩니다.   
데이터가 이진 형식이기 때문에 `FORMAT RowBinary` 이후의 구분자는 다음과 같이 엄격하게 지정됩니다: 

- 공백의 수:
  - `' '` (공백 - 코드 `0x20`)
  - `'\t'` (탭 - 코드 `0x09`)
  - `'\f'` (폼 피드 - 코드 `0x0C`) 
- 정확히 하나의 새 줄 시퀀스:
  - Windows 스타일 `"\r\n"` 
  - 또는 Unix 스타일 `'\n'`
- 바로 뒤에 이진 데이터가 옵니다.

:::note
이 형식은 행 기반이기 때문에 [Native](../Native.md) 형식보다 효율성이 떨어집니다.
:::

다음 데이터 유형에 대해 주목해야 할 점은:

- [정수](../../../sql-reference/data-types/int-uint.md)는 고정 길이 리틀 엔디안 표현을 사용합니다. 예를 들어, `UInt64`는 8바이트를 사용합니다.
- [DateTime](../../../sql-reference/data-types/datetime.md)는 Unix 타임스탬프를 값으로 가지는 `UInt32`로 표현됩니다.
- [날짜](../../../sql-reference/data-types/date.md)는 `1970-01-01` 이후의 일 수를 값으로 가지는 UInt16 객체로 표현됩니다.
- [문자열](../../../sql-reference/data-types/string.md)은 가변 너비 정수(변수 정수) (무부호 [`LEB128`](https://en.wikipedia.org/wiki/LEB128))로 표현된 후, 문자열의 바이트가 뒤따릅니다.
- [FixedString](../../../sql-reference/data-types/fixedstring.md)은 단순히 바이트 시퀀스로 표현됩니다.
- [배열](../../../sql-reference/data-types/array.md)은 가변 너비 정수(변수 정수) (무부호 [LEB128](https://en.wikipedia.org/wiki/LEB128))로 표현된 후, 배열의 연속적인 요소가 뒤따릅니다.

[NULL](/sql-reference/syntax#null) 지원의 경우, 각 [Nullable](/sql-reference/data-types/nullable.md) 값 앞에 `1` 또는 `0`이 포함된 추가 바이트가 추가됩니다. 
- `1`이면, 값은 `NULL`이고 이 바이트는 별도의 값으로 해석됩니다. 
- `0`이면, 바이트 뒤의 값은 `NULL`이 아닙니다.

`RowBinary` 형식과 `RawBlob` 형식의 비교는 다음을 참조하십시오: [Raw Formats Comparison](../RawBLOB.md/#raw-formats-comparison)

## 사용 예시 {#example-usage}

## 형식 설정 {#format-settings}

<RowBinaryFormatSettings/>
