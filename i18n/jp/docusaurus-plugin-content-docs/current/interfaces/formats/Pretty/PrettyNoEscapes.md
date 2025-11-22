---
alias: []
description: 'PrettyNoEscapes フォーマットのドキュメント'
input_format: false
keywords: ['PrettyNoEscapes']
output_format: true
slug: /interfaces/formats/PrettyNoEscapes
title: 'PrettyNoEscapes'
doc_type: 'reference'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| 入力 | 出力 | 別名 |
| -- | -- | -- |
| ✗  | ✔  |    |


## 説明 {#description}

[Pretty](/interfaces/formats/Pretty)とは異なり、[ANSIエスケープシーケンス](http://en.wikipedia.org/wiki/ANSI_escape_code)を使用しません。
これは、ブラウザでの表示や、`watch`コマンドラインユーティリティの使用に必要です。


## 使用例 {#example-usage}

例:

```bash
$ watch -n1 "clickhouse-client --query='SELECT event, value FROM system.events FORMAT PrettyCompactNoEscapes'"
```

:::note
ブラウザでこの形式を表示するには、[HTTPインターフェース](../../../interfaces/http.md)を使用できます。
:::


## フォーマット設定 {#format-settings}

<PrettyFormatSettings />
