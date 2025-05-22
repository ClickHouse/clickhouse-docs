## file {#file}

将文件作为字符串读取，并将数据加载到指定列中。文件内容不进行解释。

另请参见表函数 [file](../table-functions/file.md)。

**语法**

```sql
file(path[, default])
```

**参数**

- `path` — 文件的路径，相对于 [user_files_path](../../operations/server-configuration-parameters/settings.md#user_files_path)。支持通配符 `*`、`**`、`?`、`{abc,def}` 和 `{N..M}`，其中 `N` 和 `M` 是数字，`'abc'`、`'def'` 是字符串。
- `default` — 如果文件不存在或无法访问时返回的值。支持的数据类型：[String](../data-types/string.md) 和 [NULL](/operations/settings/formats#input_format_null_as_default)。

**示例**

从文件 a.txt 和 b.txt 中以字符串形式插入数据到表中：

```sql
INSERT INTO table SELECT file('a.txt'), file('b.txt');
```
