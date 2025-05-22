## 描述 {#description}

在此格式中，ClickHouse 将每行输出为单独的以换行符分隔的 JSON 对象。 别名： `JSONLines`， `NDJSON`。

## 示例用法 {#example-usage}

示例：

```json
{"num":42,"str":"hello","arr":[0,1]}
{"num":43,"str":"hello","arr":[0,1,2]}
{"num":44,"str":"hello","arr":[0,1,2,3]}
```

在导入数据时，如果设置 [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 为 1，则将跳过具有未知名称的列。

## 格式设置 {#format-settings}
