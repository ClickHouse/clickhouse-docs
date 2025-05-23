---
'alias': []
'description': 'Native 格式的文档'
'input_format': true
'keywords':
- 'Native'
'output_format': true
'slug': '/interfaces/formats/Native'
'title': 'Native'
---

| 输入  | 输出  | 别名  |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

`Native` 格式是 ClickHouse 最高效的格式，因为它真正是“列式”的，因为它不会将列转换为行。

在此格式中，数据以二进制格式通过 [blocks](/development/architecture#block) 进行写入和读取。对于每个块，记录了行数、列数、列名和类型，以及块中列的部分，依次记录。

这是在服务器之间进行交互时、使用命令行客户端时以及 C++ 客户端时所使用的格式。

:::tip
您可以使用此格式快速生成只能被 ClickHouse DBMS 读取的转储。您自己使用此格式可能并不实用。
:::

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}
