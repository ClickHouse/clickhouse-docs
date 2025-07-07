---
'description': '对 ClickHouse 中域类型的概述，这些类型在基础类型的基础上扩展了附加特性'
'sidebar_label': '域'
'sidebar_position': 56
'slug': '/sql-reference/data-types/domains/'
'title': '域'
---


# 域

域是特殊用途的类型，它在现有基本类型上添加了一些额外的功能，但保持底层数据类型的传输和存储格式不变。目前，ClickHouse 不支持用户定义的域。

您可以在任何可以使用相应基本类型的地方使用域，例如：

- 创建一个域类型的列
- 从域列中读写值
- 如果基本类型可以用作索引，则将其用作索引
- 使用域列的值调用函数

### 域的额外功能 {#extra-features-of-domains}

- 在 `SHOW CREATE TABLE` 或 `DESCRIBE TABLE` 中显示明确的列类型名称
- 从人类友好的格式输入 `INSERT INTO domain_table(domain_column) VALUES(...)`
- 输出为人类友好的格式 `SELECT domain_column FROM domain_table`
- 从外部源以人类友好的格式加载数据：`INSERT INTO domain_table FORMAT CSV ...`

### 限制 {#limitations}

- 不能通过 `ALTER TABLE` 将基本类型的索引列转换为域类型。
- 从另一个列或表插入数据时，不能隐式地将字符串值转换为域值。
- 域不会对存储的值添加约束。
