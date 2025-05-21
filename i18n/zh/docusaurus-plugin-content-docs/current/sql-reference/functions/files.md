---
'description': 'Documentation for Files'
'sidebar_label': 'Files'
'sidebar_position': 75
'slug': '/sql-reference/functions/files'
'title': 'Files'
---



## file {#file}

将文件作为字符串读取并加载数据到指定的列中。文件内容不会被解析。

另见表函数 [file](../table-functions/file.md)。

**语法**

```sql
file(path[, default])
```

**参数**

- `path` — 文件的路径，相对于 [user_files_path](../../operations/server-configuration-parameters/settings.md#user_files_path)。支持通配符 `*`、`**`、`?`、`{abc,def}` 和 `{N..M}`，其中 `N`、`M` 是数字，`'abc'`、`'def'` 是字符串。
- `default` — 当文件不存在或无法访问时返回的值。支持的数据类型：[String](../data-types/string.md) 和 [NULL](/operations/settings/formats#input_format_null_as_default)。

**示例**

从文件 a.txt 和 b.txt 中插入数据到表中作为字符串：

```sql
INSERT INTO table SELECT file('a.txt'), file('b.txt');
```
