---
description: 'Files 函数文档'
sidebar_label: 'Files'
slug: /sql-reference/functions/files
title: 'Files'
doc_type: 'reference'
---



## file {#file}

将文件作为字符串读取并将数据加载到指定列中。文件内容不会被解释。

另请参阅表函数 [file](../table-functions/file.md)。

**语法**

```sql
file(path[, default])
```

**参数**

- `path` — 相对于 [user_files_path](../../operations/server-configuration-parameters/settings.md#user_files_path) 的文件路径。支持通配符 `*`、`**`、`?`、`{abc,def}` 和 `{N..M}`,其中 `N`、`M` 为数字,`'abc'`、`'def'` 为字符串。
- `default` — 当文件不存在或无法访问时返回的值。支持的数据类型:[String](../data-types/string.md) 和 [NULL](/operations/settings/formats#input_format_null_as_default)。

**示例**

将文件 a.txt 和 b.txt 中的数据作为字符串插入表中:

```sql
INSERT INTO table SELECT file('a.txt'), file('b.txt');
```
