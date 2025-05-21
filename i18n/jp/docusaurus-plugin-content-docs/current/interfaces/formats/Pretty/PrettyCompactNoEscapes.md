---
alias: []
description: 'PrettyCompactNoEscapesフォーマットに関するドキュメント'
input_format: false
keywords: ['PrettyCompactNoEscapes']
output_format: true
slug: /interfaces/formats/PrettyCompactNoEscapes
title: 'PrettyCompactNoEscapes'
---
```

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Input | Output  | Alias |
|-------|---------|-------|
| ✗     | ✔       |       |

## 説明 {#description}

[`PrettyCompact`](./PrettyCompact.md)フォーマットとは異なり、[ANSIエスケープシーケンス](http://en.wikipedia.org/wiki/ANSI_escape_code)は使用されません。  
これは、ブラウザでフォーマットを表示するため、および'watch'コマンドラインユーティリティを使用するために必要です。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

<PrettyFormatSettings/>
