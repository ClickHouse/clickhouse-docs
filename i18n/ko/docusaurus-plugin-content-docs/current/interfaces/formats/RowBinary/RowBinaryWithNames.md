---
description: 'RowBinaryWithNames 형식에 대한 문서'
input_format: true
keywords: ['RowBinaryWithNames']
output_format: true
slug: /interfaces/formats/RowBinaryWithNames
title: 'RowBinaryWithNames'
doc_type: 'reference'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| 입력 | 출력 | 별칭 |
| -- | -- | -- |
| ✔  | ✔  |    |


## 설명 \{#description\}

[`RowBinary`](./RowBinary.md) 형식과 비슷하지만, 헤더가 추가되어 있습니다:

- 컬럼 개수(N)를 나타내는 [`LEB128`](https://en.wikipedia.org/wiki/LEB128)로 인코딩된 숫자.
- 컬럼 이름을 지정하는 N개의 `String`.



## 사용 예 \{#example-usage\}



## 포맷 설정 \{#format-settings\}

<RowBinaryFormatSettings/>

:::note
- [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) 설정이 `1`로 지정되어 있으면,
입력 데이터의 컬럼이 이름을 기준으로 테이블의 컬럼에 매핑됩니다.
- [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 설정이 `1`로 지정되어 있으면
알 수 없는 이름의 컬럼은 건너뛰고, 그렇지 않으면 첫 번째 행을 건너뜁니다.
:::