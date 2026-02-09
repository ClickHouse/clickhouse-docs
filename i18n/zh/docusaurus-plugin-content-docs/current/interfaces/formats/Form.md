---
alias: []
description: 'Form 格式文档'
input_format: true
keywords: ['Form']
output_format: false
slug: /interfaces/formats/Form
title: 'Form'
doc_type: 'reference'
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✗      |       |

## 描述 \{#description\}

`Form` 格式可用于读取一条采用 `application/x-www-form-urlencoded` 格式编码的记录，
其中数据的格式为 `key1=value1&key2=value2`。

## 示例用法 \{#example-usage\}

假设在 `user_files` 路径下放置了一个名为 `data.tmp`、包含一些 URL 编码数据的文件：

```text title="data.tmp"
t_page=116&c.e=ls7xfkpm&c.tti.m=raf&rt.start=navigation&rt.bmr=390%2C11%2C10
```

```sql title="Query"
SELECT * FROM file(data.tmp, Form) FORMAT vertical;
```

```response title="Response"
Row 1:
──────
t_page:   116
c.e:      ls7xfkpm
c.tti.m:  raf
rt.start: navigation
rt.bmr:   390,11,10
```

## 格式设置 \{#format-settings\}