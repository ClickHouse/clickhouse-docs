---
alias: []
description: 'PrettyNoEscapes フォーマットに関するドキュメント'
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

[Pretty](/interfaces/formats/Pretty) とは異なり、[ANSI エスケープシーケンス](http://en.wikipedia.org/wiki/ANSI_escape_code) を使用しません。  
これは、この形式をブラウザで表示したり、`watch` コマンドラインユーティリティで使用したりするために必要です。



## 使用例

例：

```bash
$ watch -n1 "clickhouse-client --query='SELECT event, value FROM system.events FORMAT PrettyCompactNoEscapes'"
```

:::note
[HTTP インターフェイス](../../../interfaces/http.md)を使用して、この形式をブラウザで表示できます。
:::


## 書式設定 {#format-settings}

<PrettyFormatSettings/>