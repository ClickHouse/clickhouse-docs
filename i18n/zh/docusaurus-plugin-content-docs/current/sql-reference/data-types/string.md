---
description: 'ClickHouse 中 String 数据类型文档'
sidebar_label: 'String'
sidebar_position: 8
slug: /sql-reference/data-types/string
title: 'String'
doc_type: 'reference'
---



# String

任意长度的字符串。长度不受限制。其值可以包含任意字节序列，包括空字节（null byte）。
`String` 类型替代了其他数据库管理系统中的 `VARCHAR`、`BLOB`、`CLOB` 等类型。

在创建表时，可以为字符串字段指定数值参数（例如 `VARCHAR(255)`），但 ClickHouse 会忽略这些参数。

别名：

- `String` — `LONGTEXT`、`MEDIUMTEXT`、`TINYTEXT`、`TEXT`、`LONGBLOB`、`MEDIUMBLOB`、`TINYBLOB`、`BLOB`、`VARCHAR`、`CHAR`、`CHAR LARGE OBJECT`、`CHAR VARYING`、`CHARACTER LARGE OBJECT`、`CHARACTER VARYING`、`NCHAR LARGE OBJECT`、`NCHAR VARYING`、`NATIONAL CHARACTER LARGE OBJECT`、`NATIONAL CHARACTER VARYING`、`NATIONAL CHAR VARYING`、`NATIONAL CHARACTER`、`NATIONAL CHAR`、`BINARY LARGE OBJECT`、`BINARY VARYING`,



## 编码 {#encodings}

ClickHouse 没有“编码”这一概念。`String` 类型的值可以包含任意字节序列，并会按原样存储和输出。
如果你需要存储文本，我们建议使用 UTF-8 编码。至少在你的终端使用 UTF-8（同样是推荐的）时，你可以在不进行转换的情况下读写这些值。
同样地，一些用于处理字符串的函数提供了不同的变体，这些变体在假定字符串包含的是表示 UTF-8 编码文本的字节序列的前提下工作。
例如，[length](/sql-reference/functions/array-functions#length) 函数按字节计算字符串长度，而 [lengthUTF8](../functions/string-functions.md#lengthUTF8) 函数在假定该值为 UTF-8 编码的前提下，按 Unicode 码点计算字符串长度。
