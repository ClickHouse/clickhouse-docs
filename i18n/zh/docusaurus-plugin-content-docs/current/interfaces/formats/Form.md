---
title: Form
slug: /interfaces/formats/Form
keywords: ['表单']
input_format: true
output_format: false
alias: []
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✗      |       |


## 描述 {#description}

`Form` 格式可用于读取单条记录，格式为 application/x-www-form-urlencoded，其中数据格式为 `key1=value1&key2=value2`。

## 示例用法 {#example-usage}

给定一个文件 `data.tmp`，放置在 `user_files` 路径中，包含一些 URL 编码的数据：

```text title="data.tmp"
t_page=116&c.e=ls7xfkpm&c.tti.m=raf&rt.start=navigation&rt.bmr=390%2C11%2C10
```

```sql title="查询"
SELECT * FROM file(data.tmp, Form) FORMAT vertical;
```

```response title="响应"
行 1:
──────
t_page:   116
c.e:      ls7xfkpm
c.tti.m:  raf
rt.start: navigation
rt.bmr:   390,11,10
```

## 格式设置 {#format-settings}
