---
'description': 'ClickHouse 中 String 数据类型的文档'
'sidebar_label': '字符串'
'sidebar_position': 8
'slug': '/sql-reference/data-types/string'
'title': '字符串'
---


# String

字符串的长度可以是任意的。长度没有限制。值可以包含任意字节集合，包括空字节。  
String 类型替代了其他数据库管理系统中的类型 VARCHAR、BLOB、CLOB 等。

在创建表时，可以为字符串字段设置数值参数（例如 `VARCHAR(255)`），但 ClickHouse 会忽略它们。

别名：

- `String` — `LONGTEXT`、`MEDIUMTEXT`、`TINYTEXT`、`TEXT`、`LONGBLOB`、`MEDIUMBLOB`、`TINYBLOB`、`BLOB`、`VARCHAR`、`CHAR`、`CHAR LARGE OBJECT`、`CHAR VARYING`、`CHARACTER LARGE OBJECT`、`CHARACTER VARYING`、`NCHAR LARGE OBJECT`、`NCHAR VARYING`、`NATIONAL CHARACTER LARGE OBJECT`、`NATIONAL CHARACTER VARYING`、`NATIONAL CHAR VARYING`、`NATIONAL CHARACTER`、`NATIONAL CHAR`、`BINARY LARGE OBJECT`、`BINARY VARYING`，

## Encodings {#encodings}

ClickHouse 没有编码的概念。字符串可以包含任意字节集合，这些字节以原样存储和输出。  
如果需要存储文本，建议使用 UTF-8 编码。最起码，如果您的终端使用 UTF-8（如推荐那样），您可以在不进行转换的情况下读取和写入值。  
同样，某些操作字符串的函数有单独的变体，其假设字符串包含一组表示 UTF-8 编码文本的字节。  
例如， [length](../functions/string-functions.md#length) 函数计算字符串在字节上的长度，而 [lengthUTF8](../functions/string-functions.md#lengthutf8) 函数计算字符串在 Unicode 代码点上的长度，假设值是 UTF-8 编码的。
