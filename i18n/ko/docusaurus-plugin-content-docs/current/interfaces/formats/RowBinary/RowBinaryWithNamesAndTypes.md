---
'alias': []
'description': 'RowBinaryWithNamesAndTypes 형식에 대한 문서'
'input_format': true
'keywords':
- 'RowBinaryWithNamesAndTypes'
'output_format': true
'slug': '/interfaces/formats/RowBinaryWithNamesAndTypes'
'title': 'RowBinaryWithNamesAndTypes'
'doc_type': 'reference'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## Description {#description}

[RowBinary](./RowBinary.md) 형식과 유사하지만 헤더가 추가되었습니다:

- [`LEB128`](https://en.wikipedia.org/wiki/LEB128)로 인코딩된 컬럼 수(N).
- N개의 `String`으로 구성된 컬럼 이름 지정.
- N개의 `String`으로 구성된 컬럼 타입 지정.

## Example usage {#example-usage}

## Format settings {#format-settings}

<RowBinaryFormatSettings/>

:::note
[`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) 설정이 1로 설정된 경우,
입력 데이터의 컬럼은 이름에 따라 테이블의 컬럼에 매핑되며, 이름이 알려지지 않은 컬럼은 [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 설정이 1로 설정된 경우 생략됩니다. 
그렇지 않으면 첫 번째 행이 생략됩니다.
[`input_format_with_types_use_header`](/operations/settings/settings-formats.md/#input_format_with_types_use_header) 설정이 `1`로 설정된 경우,
입력 데이터의 타입은 테이블의 해당 컬럼 타입과 비교됩니다. 그렇지 않으면 두 번째 행이 생략됩니다.
:::
