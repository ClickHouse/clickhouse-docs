---
'description': 'ClickHouse中域类型的概述，这些类型通过附加功能扩展基本类型'
'sidebar_label': '域'
'sidebar_position': 56
'slug': '/sql-reference/data-types/domains/'
'title': '域'
---




# 域

域是特殊用途的类型，它在现有基类型的基础上添加了一些额外功能，但保持基础数据类型的在网络和磁盘格式不变。目前，ClickHouse 不支持用户定义的域。

您可以在任何对应的基类型可以使用的地方使用域，例如：

- 创建一个域类型的列
- 从域列中读取/写入值
- 如果基类型可以用作索引，将其用作索引
- 使用域列的值调用函数

### 域的额外功能 {#extra-features-of-domains}

- 在 `SHOW CREATE TABLE` 或 `DESCRIBE TABLE` 中显示显式列类型名称
- 从人类友好的格式输入，使用 `INSERT INTO domain_table(domain_column) VALUES(...)`
- 为 `SELECT domain_column FROM domain_table` 输出人类友好的格式
- 从外部源加载数据，采用人类友好的格式：`INSERT INTO domain_table FORMAT CSV ...`

### 限制 {#limitations}

- 不能通过 `ALTER TABLE` 将基类型的索引列转换为域类型。
- 插入来自另一个列或表的数据时，无法将字符串值隐式转换为域值。
- 域对存储值没有任何约束。
