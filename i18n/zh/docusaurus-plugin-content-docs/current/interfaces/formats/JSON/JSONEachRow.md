---
'description': 'JSONEachRow 格式的 Documentation'
'keywords':
- 'JSONEachRow'
'slug': '/interfaces/formats/JSONEachRow'
'title': 'JSONEachRow'
---

## 描述 {#description}

在这种格式下，ClickHouse 输出每行作为一个分隔的、以换行符为分隔的 JSON 对象。别名： `JSONLines`, `NDJSON`。

## 示例用法 {#example-usage}

示例：

```json
{"num":42,"str":"hello","arr":[0,1]}
{"num":43,"str":"hello","arr":[0,1,2]}
{"num":44,"str":"hello","arr":[0,1,2,3]}
```

在导入数据时，如果设置 [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 为 1，列名称未知的字段将被跳过。

## 格式设置 {#format-settings}
