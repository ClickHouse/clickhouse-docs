---
description: 'ClickHouse 中域类型的概述，它们在基础类型之上扩展了额外功能'
sidebar_label: '域'
sidebar_position: 56
slug: /sql-reference/data-types/domains/
title: '域'
doc_type: 'reference'
---

# 域（Domains） \{#domains\}

域是一种具有特定用途的类型，它在现有基础类型之上增加了额外功能，同时保持底层数据类型在网络传输和磁盘存储时的格式不变。目前，ClickHouse 不支持用户自定义域。

在任何可以使用对应基础类型的地方，都可以使用域，例如：

- 创建一个域类型的列
- 从域列读取值 / 向域列写入值
- 如果基础类型可以用作索引，则也可以将该域用作索引
- 在调用函数时使用域列的值

### 域的额外功能 \{#extra-features-of-domains\}

- 在 `SHOW CREATE TABLE` 或 `DESCRIBE TABLE` 中显示明确的列类型名称
- 以更适合人工阅读的格式输入：`INSERT INTO domain_table(domain_column) VALUES(...)`
- 以更适合人工阅读的格式输出：`SELECT domain_column FROM domain_table`
- 以更适合人工阅读的格式，从外部数据源加载数据：`INSERT INTO domain_table FORMAT CSV ...`

### 限制 \{#limitations\}

- 无法通过 `ALTER TABLE` 将基础类型的索引列转换为域类型。
- 在从其他列或表插入数据时，无法将字符串值隐式转换为域值。
- 域不会对存储的值施加任何约束。
