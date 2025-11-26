---
alias: []
description: 'LineAsStringWithNamesAndTypes 格式文档'
input_format: false
keywords: ['LineAsStringWithNamesAndTypes']
output_format: true
slug: /interfaces/formats/LineAsStringWithNamesAndTypes
title: 'LineAsStringWithNamesAndTypes'
doc_type: 'reference'
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✗     | ✔      |       |



## 描述 {#description}

`LineAsStringWithNames` 格式类似于 [`LineAsString`](./LineAsString.md) 格式，
但会打印两行表头：第一行是列名，第二行是类型。



## 使用示例

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
