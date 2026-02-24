---
alias: []
description: 'PrettyMonoBlock 포맷에 대한 문서'
input_format: false
keywords: ['PrettyMonoBlock']
output_format: true
slug: /interfaces/formats/PrettyMonoBlock
title: 'PrettyMonoBlock'
doc_type: 'reference'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| 입력 | 출력 | 별칭 |
| -- | -- | -- |
| ✗  | ✔  |    |


## 설명 \{#description\}

[`Pretty`](/interfaces/formats/Pretty) 형식과 다른 점은 최대 `10,000`개의 행을 버퍼링해 두었다가,
[블록](/development/architecture#block) 단위가 아니라 하나의 테이블로 한 번에 출력한다는 점입니다.



## 사용 예시 \{#example-usage\}



## 형식 설정 \{#format-settings\}

<PrettyFormatSettings/>