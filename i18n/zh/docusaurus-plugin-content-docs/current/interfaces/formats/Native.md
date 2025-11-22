---
alias: []
description: 'Native 格式的文档'
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

`Native` 格式是 ClickHouse 最高效的格式,因为它是真正的"列式"格式,不会将列转换为行。

在此格式中,数据以二进制格式按[块](/development/architecture#block)进行写入和读取。
对于每个块,会依次记录行数、列数、列名和类型以及块中各列的数据部分。

此格式用于服务器之间交互的原生接口、命令行客户端以及 C++ 客户端。

:::tip
您可以使用此格式快速生成仅能由 ClickHouse DBMS 读取的转储文件。
但直接处理此格式可能并不实用。
:::


## 使用示例 {#example-usage}


## 格式设置 {#format-settings}
