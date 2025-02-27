---
title : PrettyCompactNoEscapes
slug: /interfaces/formats/PrettyCompactNoEscapes
keywords : [PrettyCompactNoEscapes]
input_format: false
output_format: true
alias: []
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| 入力  | 出力    | エイリアス |
|-------|---------|-------|
| ✗     | ✔       |       |

## 説明 {#description}

[`PrettyCompact`](./PrettyCompact.md) 形式と異なり、[ANSIエスケープシーケンス](http://en.wikipedia.org/wiki/ANSI_escape_code) は使用されていません。 
これは、ブラウザで形式を表示する必要があるため、および 'watch' コマンドラインユーティリティを使用するために必要です。

## 使用例 {#example-usage}

## 形式設定 {#format-settings}

<PrettyFormatSettings/>
