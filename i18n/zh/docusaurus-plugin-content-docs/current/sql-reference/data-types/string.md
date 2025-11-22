---
description: 'ClickHouse 中 String 数据类型文档'
sidebar_label: 'String'
sidebar_position: 8
slug: /sql-reference/data-types/string
title: 'String'
doc_type: 'reference'
---



# String

任意长度的字符串。长度不受限制。该值可以包含任意字节序列，包括空字节（null 字节）。
`String` 类型取代了其他数据库管理系统中的 `VARCHAR`、`BLOB`、`CLOB` 等类型。

在创建表时，可以为字符串字段设置数值参数（例如 `VARCHAR(255)`），但 ClickHouse 会忽略这些参数。

别名：

- `String` — `LONGTEXT`, `MEDIUMTEXT`, `TINYTEXT`, `TEXT`, `LONGBLOB`, `MEDIUMBLOB`, `TINYBLOB`, `BLOB`, `VARCHAR`, `CHAR`, `CHAR LARGE OBJECT`, `CHAR VARYING`, `CHARACTER LARGE OBJECT`, `CHARACTER VARYING`, `NCHAR LARGE OBJECT`, `NCHAR VARYING`, `NATIONAL CHARACTER LARGE OBJECT`, `NATIONAL CHARACTER VARYING`, `NATIONAL CHAR VARYING`, `NATIONAL CHARACTER`, `NATIONAL CHAR`, `BINARY LARGE OBJECT`, `BINARY VARYING`,



## 编码 {#encodings}

ClickHouse 没有编码的概念。字符串可以包含任意字节集,这些字节会按原样存储和输出。
如果需要存储文本,我们建议使用 UTF-8 编码。至少,如果您的终端使用 UTF-8(推荐使用),您可以直接读写数据值而无需进行转换。
同样,某些用于处理字符串的函数具有单独的变体,这些变体在工作时假定字符串包含一组表示 UTF-8 编码文本的字节。
例如,[length](/sql-reference/functions/array-functions#length) 函数按字节计算字符串长度,而 [lengthUTF8](../functions/string-functions.md#lengthUTF8) 函数按 Unicode 码点计算字符串长度,假定该值采用 UTF-8 编码。
