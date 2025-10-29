---
'alias': []
'description': 'Native 格式的文档'
'input_format': true
'keywords':
- 'Native'
'output_format': true
'slug': '/interfaces/formats/Native'
'title': 'Native'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

`Native` 格式是 ClickHouse 最高效的格式，因为它真正是“列式”的， 
即它不将列转换为行。

在此格式中，数据以二进制格式通过 [blocks](/development/architecture#block) 写入和读取。 
对于每个 block，记录了行数、列数、列名和类型，以及 block 中列的部分。 

这是在服务器之间进行交互、使用命令行客户端以及 C++ 客户端时使用的原生接口格式。

:::tip
您可以使用此格式快速生成只能由 ClickHouse DBMS 读取的转储。 
自己处理此格式可能不太实用。
:::

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}
