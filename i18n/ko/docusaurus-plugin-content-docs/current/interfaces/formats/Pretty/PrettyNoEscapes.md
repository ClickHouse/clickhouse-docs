---
alias: []
description: 'PrettyNoEscapes 형식에 대한 설명서'
input_format: false
keywords: ['PrettyNoEscapes']
output_format: true
slug: /interfaces/formats/PrettyNoEscapes
title: 'PrettyNoEscapes'
doc_type: 'reference'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| 입력 | 출력 | 별칭 |
| -- | -- | -- |
| ✗  | ✔  |    |


## 설명 \{#description\}

[Pretty](/interfaces/formats/Pretty) 형식과는 [ANSI 이스케이프 시퀀스](http://en.wikipedia.org/wiki/ANSI_escape_code)를 사용하지 않는다는 점에서 다릅니다.  
이는 브라우저에서 형식을 표시하거나 `watch` 명령줄 유틸리티를 사용할 때 필요합니다.

## 사용 예 \{#example-usage\}

예:

```bash
$ watch -n1 "clickhouse-client --query='SELECT event, value FROM system.events FORMAT PrettyCompactNoEscapes'"
```

:::note
이 형식을 브라우저에서 표시할 때 [HTTP 인터페이스](/interfaces/http)를 사용할 수 있습니다.
:::


## 형식 설정 \{#format-settings\}

<PrettyFormatSettings/>