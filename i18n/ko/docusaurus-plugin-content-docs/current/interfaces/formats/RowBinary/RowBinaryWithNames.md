---
'description': 'RowBinaryWithNames 형식에 대한 Documentation'
'input_format': true
'keywords':
- 'RowBinaryWithNames'
'output_format': true
'slug': '/interfaces/formats/RowBinaryWithNames'
'title': 'RowBinaryWithNames'
'doc_type': 'reference'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 설명 {#description}

[`RowBinary`](./RowBinary.md) 형식과 유사하지만, 추가된 헤더가 있습니다:

- [`LEB128`](https://en.wikipedia.org/wiki/LEB128)로 인코딩된 컬럼 수(N).
- N개의 `String`으로 컬럼 이름을 지정합니다.

## 사용 예제 {#example-usage}

## 형식 설정 {#format-settings}

<RowBinaryFormatSettings/>

:::note
- 설정 [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header)가 `1`로 설정된 경우,
입력 데이터의 컬럼은 이름에 따라 테이블의 컬럼에 매핑되며, 이름이 알려지지 않은 컬럼은 생략됩니다.
- 설정 [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields)가 `1`로 설정된 경우.
그렇지 않으면, 첫 번째 행이 생략됩니다.
:::
