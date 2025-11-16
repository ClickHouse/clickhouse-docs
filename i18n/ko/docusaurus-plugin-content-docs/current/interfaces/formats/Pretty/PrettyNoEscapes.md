---
'alias': []
'description': 'PrettyNoEscapes 포맷에 대한 Documentation'
'input_format': false
'keywords':
- 'PrettyNoEscapes'
'output_format': true
'slug': '/interfaces/formats/PrettyNoEscapes'
'title': 'PrettyNoEscapes'
'doc_type': 'reference'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Input | Output  | Alias |
|-------|---------|-------|
| ✗     | ✔       |       |

## 설명 {#description}

[Pretty](/interfaces/formats/Pretty)와 다르게 [ANSI-escape sequences](http://en.wikipedia.org/wiki/ANSI_escape_code)가 사용되지 않습니다.  
이는 브라우저에서 형식을 표시하는 데 필요하며, 'watch' 명령줄 유틸리티를 사용하는 데에도 필요합니다.

## 예제 사용법 {#example-usage}

예제:

```bash
$ watch -n1 "clickhouse-client --query='SELECT event, value FROM system.events FORMAT PrettyCompactNoEscapes'"
```

:::note
[HTTP 인터페이스](../../../interfaces/http.md)는 브라우저에서 이 형식을 표시하는 데 사용할 수 있습니다.
:::

## 형식 설정 {#format-settings}

<PrettyFormatSettings/>
