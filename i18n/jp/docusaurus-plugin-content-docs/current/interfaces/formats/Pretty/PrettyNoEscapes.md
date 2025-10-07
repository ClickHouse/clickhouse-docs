---
'alias': []
'description': 'PrettyNoEscapes フォーマットに関する Documentation'
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

## 説明 {#description}

[Pretty](/interfaces/formats/Pretty) とは異なり、[ANSI エスケープシーケンス](http://en.wikipedia.org/wiki/ANSI_escape_code)は使用されません。 
これは、ブラウザにフォーマットを表示するため、および 'watch' コマンドラインユーティリティを使用するために必要です。

## 使用例 {#example-usage}

例:

```bash
$ watch -n1 "clickhouse-client --query='SELECT event, value FROM system.events FORMAT PrettyCompactNoEscapes'"
```

:::note
[HTTP インターフェース](../../../interfaces/http.md)は、このフォーマットをブラウザで表示するために使用できます。
:::

## フォーマット設定 {#format-settings}

<PrettyFormatSettings/>
