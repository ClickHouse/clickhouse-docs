---
'alias': []
'description': 'LineAsStringWithNames格式的文档'
'input_format': true
'keywords':
- 'LineAsStringWithNames'
'output_format': true
'slug': '/interfaces/formats/LineAsStringWithNames'
'title': 'LineAsStringWithNames'
---



| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✗     | ✔      |       |

## 描述 {#description}

`LineAsStringWithNames` 格式与 [`LineAsString`](./LineAsString.md) 格式类似，但会打印带有列名称的标题行。

## 示例用法 {#example-usage}

```sql title="Query"
CREATE TABLE example (
    name String,
    value Int32
)
ENGINE = Memory;

INSERT INTO example VALUES ('John', 30), ('Jane', 25), ('Peter', 35);

SELECT * FROM example FORMAT LineAsStringWithNames;
```

```response title="Response"
name    value
John    30
Jane    25
Peter    35
```

## 格式设置 {#format-settings}
