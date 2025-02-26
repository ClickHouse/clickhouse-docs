---
title : PrettyNoEscapes
slug: /interfaces/formats/PrettyNoEscapes
keywords : [PrettyNoEscapes]
input_format: false
output_format: true
alias: []
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| 入力 | 出力  | エイリアス |
|-------|---------|-------|
| ✗     | ✔       |       |

## 説明 {#description}

[Pretty](/interfaces/formats/Pretty)とは異なり、[ANSIエスケープシーケンス](http://en.wikipedia.org/wiki/ANSI_escape_code)は使用されません。  
これはブラウザでフォーマットを表示するため、さらに 'watch' コマンドラインユーティリティを使用するために必要です。

## 使用例 {#example-usage}

例:

```bash
$ watch -n1 "clickhouse-client --query='SELECT event, value FROM system.events FORMAT PrettyCompactNoEscapes'"
```

:::note
このフォーマットをブラウザで表示するには、[HTTPインターフェース](../../../interfaces/http.md)を使用できます。
:::

## フォーマット設定 {#format-settings}

<PrettyFormatSettings/>
