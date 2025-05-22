---
'alias': []
'description': 'LineAsStringWithNamesAndTypes 格式的 文档'
'input_format': false
'keywords':
- 'LineAsStringWithNamesAndTypes'
'output_format': true
'slug': '/interfaces/formats/LineAsStringWithNamesAndTypes'
'title': 'LineAsStringWithNamesAndTypes'
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✗     | ✔      |       |

## 描述 {#description}

`LineAsStringWithNames` 格式类似于 [`LineAsString`](./LineAsString.md) 格式，但打印两个标题行：一个包含列名，另一个包含类型。

## 示例用法 {#example-usage}

```sql
CREATE TABLE example (
    name String,
    value Int32
)
ENGINE = Memory;

INSERT INTO example VALUES ('John', 30), ('Jane', 25), ('Peter', 35);

SELECT * FROM example FORMAT LineAsStringWithNamesAndTypes;
```

```response title="Response"
name    value
String    Int32
John    30
Jane    25
Peter    35
```

## 格式设置 {#format-settings}
