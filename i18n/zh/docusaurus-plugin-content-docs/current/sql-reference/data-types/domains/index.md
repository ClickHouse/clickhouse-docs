---
description: 'ClickHouse 中域类型的概览，它们在基础类型之上提供了附加特性'
sidebar_label: '域类型'
sidebar_position: 56
slug: /sql-reference/data-types/domains/
title: '域类型'
doc_type: 'reference'
---



# 域类型

域类型是一种特殊用途的类型,在现有基础类型之上添加额外功能,同时保持底层数据类型的网络传输和磁盘存储格式不变。目前,ClickHouse 不支持用户自定义域类型。

您可以在任何可以使用相应基础类型的地方使用域类型,例如:

- 创建域类型的列
- 从域类型列读取/写入值
- 如果基础类型可以用作索引,则域类型也可以用作索引
- 使用域类型列的值调用函数

### 域类型的额外特性 {#extra-features-of-domains}

- 在 `SHOW CREATE TABLE` 或 `DESCRIBE TABLE` 中显示明确的列类型名称
- 使用 `INSERT INTO domain_table(domain_column) VALUES(...)` 以易读格式输入数据
- 使用 `SELECT domain_column FROM domain_table` 以易读格式输出数据
- 以易读格式从外部源加载数据:`INSERT INTO domain_table FORMAT CSV ...`

### 限制 {#limitations}

- 无法通过 `ALTER TABLE` 将基础类型的索引列转换为域类型
- 从其他列或表插入数据时,无法隐式地将字符串值转换为域类型值
- 域类型不对存储的值添加任何约束
