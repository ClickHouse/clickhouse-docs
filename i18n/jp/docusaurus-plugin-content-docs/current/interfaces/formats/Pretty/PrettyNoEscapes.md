---
alias: []
description: 'PrettyNoEscapes 形式のドキュメンテーション'
input_format: false
keywords: ['PrettyNoEscapes']
output_format: true
slug: /interfaces/formats/PrettyNoEscapes
title: 'PrettyNoEscapes'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| 入力 | 出力  | エイリアス |
|-------|---------|-------|
| ✗     | ✔       |       |

## 説明 {#description}

[Pretty](/interfaces/formats/Pretty) とは異なり、[ANSIエスケープシーケンス](http://en.wikipedia.org/wiki/ANSI_escape_code)は使用されません。
これはブラウザで形式を表示するため、および 'watch' コマンドラインユーティリティを使用するために必要です。

## 使用例 {#example-usage}

例:

```bash
$ watch -n1 "clickhouse-client --query='SELECT event, value FROM system.events FORMAT PrettyCompactNoEscapes'"
```

:::note
[HTTPインターフェース](../../../interfaces/http.md)は、この形式をブラウザで表示するために使用できます。
:::

## 形式設定 {#format-settings}

<PrettyFormatSettings/>
