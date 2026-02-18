---
alias: []
description: 'RowBinaryWithNamesAndTypes 형식에 대한 문서입니다'
input_format: true
keywords: ['RowBinaryWithNamesAndTypes']
output_format: true
slug: /interfaces/formats/RowBinaryWithNamesAndTypes
title: 'RowBinaryWithNamesAndTypes'
doc_type: 'reference'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| 입력 | 출력 | 별칭 |
| -- | -- | -- |
| ✔  | ✔  |    |


## 설명 \{#description\}

[RowBinary](./RowBinary.md) 포맷과 유사하지만, 헤더가 추가되어 있습니다:

- 컬럼 수(N)를 [`LEB128`](https://en.wikipedia.org/wiki/LEB128)로 인코딩한 숫자.
- 컬럼 이름을 지정하는 N개의 `String`.
- 컬럼 타입을 지정하는 N개의 `String`.



## 사용 예 \{#example-usage\}



## 포맷 설정 \{#format-settings\}

<RowBinaryFormatSettings/>

:::note
[`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) 설정이 1로 설정된 경우,
입력 데이터의 컬럼이 이름을 기준으로 테이블의 컬럼에 매핑되며, [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 설정이 1로 설정된 경우 이름을 알 수 없는 컬럼은 건너뜁니다.
그렇지 않으면 첫 번째 행이 건너뜁니다.
[`input_format_with_types_use_header`](/operations/settings/settings-formats.md/#input_format_with_types_use_header) 설정이 `1`로 설정된 경우,
입력 데이터의 타입이 테이블의 해당 컬럼 타입과 비교됩니다. 그렇지 않으면 두 번째 행이 건너뜁니다.
:::