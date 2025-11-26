---
alias: []
description: 'Native 格式文档'
input_format: true
keywords: ['Native']
output_format: true
slug: /interfaces/formats/Native
title: 'Native'
doc_type: 'reference'
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |



## 描述 {#description}

`Native` 格式是 ClickHouse 中最高效的格式，因为它是真正意义上的“列式”格式，
不会将列转换为行。  

在这种格式下，数据以二进制格式按[块](/development/architecture#block)进行读写。
对于每个块，会依次记录行数、列数、列名和类型，以及该块中列的数据部分。 

这是在原生接口中用于服务器之间交互、使用命令行客户端以及 C++ 客户端时所使用的格式。

:::tip
你可以使用这种格式快速生成只能由 ClickHouse 数据库管理系统（DBMS）读取的转储文件。
自己直接使用这种格式进行操作可能并不实用。
:::



## 使用示例 {#example-usage}



## 格式设置 {#format-settings}