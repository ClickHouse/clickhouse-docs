---
'alias': []
'description': '表格式文档'
'input_format': true
'keywords':
- 'Form'
'output_format': false
'slug': '/interfaces/formats/Form'
'title': '表单'
---



| 输入  | 输出   | 别名  |
|-------|--------|-------|
| ✔     | ✗      |       |


## 描述 {#description}

`Form` 格式可用于读取以 application/x-www-form-urlencoded 格式的单个记录，其中数据格式为 `key1=value1&key2=value2`。

## 示例用法 {#example-usage}

给定一个放置在 `user_files` 路径中的文件 `data.tmp`，其中包含一些URL编码的数据：

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
