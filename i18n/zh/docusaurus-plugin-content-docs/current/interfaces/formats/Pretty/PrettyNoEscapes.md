---
'alias': []
'description': '漂亮无转义格式文档'
'input_format': false
'keywords':
- 'PrettyNoEscapes'
'output_format': true
'slug': '/interfaces/formats/PrettyNoEscapes'
'title': 'PrettyNoEscapes'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| 输入 | 输出  | 别名 |
|-----|-------|------|
| ✗   | ✔     |      |

## 描述 {#description}

与 [Pretty](/interfaces/formats/Pretty) 不同的是，不使用 [ANSI-转义序列](http://en.wikipedia.org/wiki/ANSI_escape_code)。 
这对于在浏览器中显示格式以及使用 'watch' 命令行工具是必要的。

## 示例用法 {#example-usage}

示例：

```bash
$ watch -n1 "clickhouse-client --query='SELECT event, value FROM system.events FORMAT PrettyCompactNoEscapes'"
```

:::note
[HTTP 接口](../../../interfaces/http.md) 可用于在浏览器中显示此格式。
:::

## 格式设置 {#format-settings}

<PrettyFormatSettings/>
