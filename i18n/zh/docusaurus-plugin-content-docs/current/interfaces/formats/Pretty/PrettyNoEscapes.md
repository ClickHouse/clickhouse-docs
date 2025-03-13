---
title: 'PrettyNoEscapes'
slug: /interfaces/formats/PrettyNoEscapes
keywords: ['PrettyNoEscapes']
input_format: false
output_format: true
alias: []
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| 输入 | 输出  | 别名 |
|-------|---------|-------|
| ✗     | ✔       |       |

## 描述 {#description}

与 [Pretty](/interfaces/formats/Pretty) 的不同之处在于不使用 [ANSI 转义序列](http://en.wikipedia.org/wiki/ANSI_escape_code)。  
这是在浏览器中显示格式，以及使用 'watch' 命令行工具所必需的。

## 示例用法 {#example-usage}

示例：

```bash
$ watch -n1 "clickhouse-client --query='SELECT event, value FROM system.events FORMAT PrettyCompactNoEscapes'"
```

:::note
可以使用 [HTTP 接口](../../../interfaces/http.md) 在浏览器中显示此格式。
:::

## 格式设置 {#format-settings}

<PrettyFormatSettings/>
