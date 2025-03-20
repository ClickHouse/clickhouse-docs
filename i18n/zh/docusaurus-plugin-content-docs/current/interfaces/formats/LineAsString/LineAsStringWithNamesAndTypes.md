---
title: LineAsStringWithNamesAndTypes
slug: /interfaces/formats/LineAsStringWithNamesAndTypes
keywords: ['LineAsStringWithNamesAndTypes']
input_format: false
output_format: true
alias: []
---

| 输入  | 输出   | 别名  |
|-------|--------|-------|
| ✗     | ✔      |       |

## 描述 {#description}

`LineAsStringWithNames` 格式与 [`LineAsString`](./LineAsString.md) 格式类似，但打印两个标题行：一个是列名，另一个是类型。

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

```response title="响应"
name	value
String	Int32
John	30
Jane	25
Peter	35
```

## 格式设置 {#format-settings}
