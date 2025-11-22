---
alias: []
description: 'LineAsStringWithNames 格式文档'
input_format: true
keywords: ['LineAsStringWithNames']
output_format: true
slug: /interfaces/formats/LineAsStringWithNames
title: 'LineAsStringWithNames'
doc_type: 'reference'
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✗     | ✔      |       |



## 描述 {#description}

`LineAsStringWithNames` 格式与 [`LineAsString`](./LineAsString.md) 格式类似,但会输出包含列名的标题行。


## 使用示例 {#example-usage}

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
name    value
John    30
Jane    25
Peter    35
```


## 格式设置 {#format-settings}
