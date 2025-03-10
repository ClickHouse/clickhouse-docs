---
title: LineAsStringWithNames
slug: /interfaces/formats/LineAsStringWithNames
keywords: ['LineAsStringWithNames']
input_format: true
output_format: true
alias: []
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✗     | ✔      |       |

## 描述 {#description}

`LineAsStringWithNames` 格式类似于 [`LineAsString`](./LineAsString.md) 格式，但打印包含列名的标题行。

## 示例用法 {#example-usage}

```sql title="查询"
CREATE TABLE example (
    name String,
    value Int32
)
ENGINE = Memory;

INSERT INTO example VALUES ('John', 30), ('Jane', 25), ('Peter', 35);

SELECT * FROM example FORMAT LineAsStringWithNames;
```

```response title="响应"
name	value
John	30
Jane	25
Peter	35
```

## 格式设置 {#format-settings}
