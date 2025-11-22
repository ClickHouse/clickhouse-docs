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



## 描述 {#description}

`Form` 格式可用于读取 application/x-www-form-urlencoded 格式的单条记录,
数据格式为 `key1=value1&key2=value2`。


## 使用示例 {#example-usage}

假设在 `user_files` 路径下有一个包含 URL 编码数据的文件 `data.tmp`:

```text title="data.tmp"
t_page=116&c.e=ls7xfkpm&c.tti.m=raf&rt.start=navigation&rt.bmr=390%2C11%2C10
```

```sql title="查询"
SELECT * FROM file(data.tmp, Form) FORMAT vertical;
```

```response title="响应"
Row 1:
──────
t_page:   116
c.e:      ls7xfkpm
c.tti.m:  raf
rt.start: navigation
rt.bmr:   390,11,10
```


## 格式设置 {#format-settings}
