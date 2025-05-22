---
'alias': []
'description': 'PrettyNoEscapes フォーマットのドキュメント'
'input_format': false
'keywords':
- 'PrettyNoEscapes'
'output_format': true
'slug': '/interfaces/formats/PrettyNoEscapes'
'title': 'PrettyNoEscapes'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Input | Output  | Alias |
|-------|---------|-------|
| ✗     | ✔       |       |

## 説明 {#description}

[Pretty](/interfaces/formats/Pretty) と異なり、[ANSI-escape sequences](http://en.wikipedia.org/wiki/ANSI_escape_code) が使用されていません。
これは、ブラウザでフォーマットを表示するため、また 'watch' コマンドラインユーティリティを使用するために必要です。

## 使用例 {#example-usage}

例:

```bash
$ watch -n1 "clickhouse-client --query='SELECT event, value FROM system.events FORMAT PrettyCompactNoEscapes'"
```

:::note
[HTTP interface](../../../interfaces/http.md) を使用して、このフォーマットをブラウザに表示できます。
:::

## フォーマット設定 {#format-settings}

<PrettyFormatSettings/>
