---
'description': 'ClickHouse 中字符串数据类型的文档'
'sidebar_label': '字符串'
'sidebar_position': 8
'slug': '/sql-reference/data-types/string'
'title': '字符串'
---


# 字符串

任意长度的字符串。长度没有限制。值可以包含任意的字节集，包括空字节。  
String 类型替代了其他数据库管理系统中的 VARCHAR、BLOB、CLOB 等类型。

在创建表时，可以为字符串字段设置数值参数（例如 `VARCHAR(255)`），但 ClickHouse 会忽略这些参数。

别名：

- `String` — `LONGTEXT`, `MEDIUMTEXT`, `TINYTEXT`, `TEXT`, `LONGBLOB`, `MEDIUMBLOB`, `TINYBLOB`, `BLOB`, `VARCHAR`, `CHAR`, `CHAR LARGE OBJECT`, `CHAR VARYING`, `CHARACTER LARGE OBJECT`, `CHARACTER VARYING`, `NCHAR LARGE OBJECT`, `NCHAR VARYING`, `NATIONAL CHARACTER LARGE OBJECT`, `NATIONAL CHARACTER VARYING`, `NATIONAL CHAR VARYING`, `NATIONAL CHARACTER`, `NATIONAL CHAR`, `BINARY LARGE OBJECT`, `BINARY VARYING`,

## 编码 {#encodings}

ClickHouse 并不存在编码的概念。字符串可以包含任意的字节集，并以原样存储和输出。  
如果您需要存储文本，建议使用 UTF-8 编码。至少，如果您的终端使用 UTF-8（如推荐的那样），您可以在不进行转换的情况下读取和写入您的值。  
同样，某些用于处理字符串的函数有分开不同的变体，其中工作假设字符串包含一组表示 UTF-8 编码文本的字节。  
例如， [length](../functions/string-functions.md#length) 函数计算字符串的字节长度，而 [lengthUTF8](../functions/string-functions.md#lengthutf8) 函数计算字符串的 Unicode 码点长度，假设该值是 UTF-8 编码的。
