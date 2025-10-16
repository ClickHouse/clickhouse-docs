---
'description': '在 ClickHouse 中的域类型概述，它们通过附加特性扩展基本类型'
'sidebar_label': 'Domains'
'sidebar_position': 56
'slug': '/sql-reference/data-types/domains/'
'title': 'Domains'
'doc_type': 'reference'
---


# 域

域是特殊用途的类型，它在现有基本类型的基础上添加了额外的功能，同时保持底层数据类型的传输和存储格式不变。目前，ClickHouse 不支持用户定义的域。

您可以在任何可以使用相应基本类型的地方使用域，例如：

- 创建域类型的列
- 从域列读取/写入值
- 如果基本类型可以用作索引，则将其用作索引
- 使用域列的值调用函数

### 域的额外功能 {#extra-features-of-domains}

- 在 `SHOW CREATE TABLE` 或 `DESCRIBE TABLE` 中明确列类型名称
- 以人类友好的格式输入： `INSERT INTO domain_table(domain_column) VALUES(...)`
- 为 `SELECT domain_column FROM domain_table` 输出人类友好的格式
- 以人类友好的格式从外部源加载数据： `INSERT INTO domain_table FORMAT CSV ...`

### 限制 {#limitations}

- 不能通过 `ALTER TABLE` 将基本类型的索引列转换为域类型。
- 在从另一列或表插入数据时，不能将字符串值隐式转换为域值。
- 域对存储值没有任何约束。
