---
'alias': []
'description': '表单格式的文档'
'input_format': true
'keywords':
- 'Form'
'output_format': false
'slug': '/interfaces/formats/Form'
'title': '表单'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✗      |       |

## 描述 {#description}

`Form` 格式可用于读取单条记录，采用 application/x-www-form-urlencoded 格式，其中数据格式为 `key1=value1&key2=value2`。

## 示例用法 {#example-usage}

假设有一个文件 `data.tmp` 位于 `user_files` 路径中，包含一些 URL 编码的数据：

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

## 格式设置 {#format-settings}
