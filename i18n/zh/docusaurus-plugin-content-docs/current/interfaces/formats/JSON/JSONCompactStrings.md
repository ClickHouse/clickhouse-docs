---
'alias': []
'description': 'JSONCompactStrings格式的文档'
'input_format': false
'keywords':
- 'JSONCompactStrings'
'output_format': true
'slug': '/interfaces/formats/JSONCompactStrings'
'title': 'JSONCompactStrings'
---



| 输入   | 输出   | 别名   |
|--------|--------|--------|
| ✗      | ✔      |        |

## 描述 {#description}

`JSONCompactStrings` 格式与 [JSONStrings](./JSONStrings.md) 的不同之处在于数据行输出为数组，而不是对象。

## 示例用法 {#example-usage}

```json
{
        "meta":
        [
                {
                        "name": "num",
                        "type": "Int32"
                },
                {
                        "name": "str",
                        "type": "String"
                },
                {
                        "name": "arr",
                        "type": "Array(UInt8)"
                }
        ],

        "data":
        [
                ["42", "hello", "[0,1]"],
                ["43", "hello", "[0,1,2]"],
                ["44", "hello", "[0,1,2,3]"]
        ],

        "rows": 3,

        "rows_before_limit_at_least": 3,

        "statistics":
        {
                "elapsed": 0.001572097,
                "rows_read": 3,
                "bytes_read": 24
        }
}
```

## 格式设置 {#format-settings}
