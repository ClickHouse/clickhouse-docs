---
'description': '关于文件的文档'
'sidebar_label': '文件'
'slug': '/sql-reference/functions/files'
'title': '文件'
'doc_type': 'reference'
---

## file {#file}

将文件读取为字符串，并将数据加载到指定的列中。文件内容不会被解释。

另请参见表函数 [file](../table-functions/file.md)。

**语法**

```sql
file(path[, default])
```

**参数**

- `path` — 文件相对于 [user_files_path](../../operations/server-configuration-parameters/settings.md#user_files_path) 的路径。支持通配符 `*`、`**`、`?`、`{abc,def}` 和 `{N..M}`，其中 `N`、`M` 是数字，`'abc'`、`'def'` 是字符串。
- `default` — 如果文件不存在或无法访问，则返回的值。支持的数据类型: [String](../data-types/string.md) 和 [NULL](/operations/settings/formats#input_format_null_as_default)。

**示例**

从文件 a.txt 和 b.txt 中插入数据到表中作为字符串：

```sql
INSERT INTO table SELECT file('a.txt'), file('b.txt');
```
