| 输入 | 输出 | 别名 |
|------|------|------|
| ✔    | ✔    |      |

## 描述 {#description}

与 [JSON](./JSON.md) 的唯一区别在于数据行以数组的形式输出，而不是以对象的形式。

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
                [42, "hello", [0,1]],
                [43, "hello", [0,1,2]],
                [44, "hello", [0,1,2,3]]
        ],

        "rows": 3,

        "rows_before_limit_at_least": 3,

        "statistics":
        {
                "elapsed": 0.001222069,
                "rows_read": 3,
                "bytes_read": 24
        }
}
```

## 格式设置 {#format-settings}
