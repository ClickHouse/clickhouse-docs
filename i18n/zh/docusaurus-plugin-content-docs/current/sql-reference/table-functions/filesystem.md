---
description: '提供对文件系统的访问，可用于列出文件并返回其元数据和内容。'
sidebar_label: 'filesystem'
sidebar_position: 62
slug: /sql-reference/table-functions/filesystem
title: 'filesystem'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# filesystem 表函数 \{#filesystem-table-function\}

<CloudNotSupportedBadge />

递归遍历目录，并返回一个表，其中包含文件元数据 (路径、大小、类型、权限、修改时间) ，以及可选的文件内容。

在 `clickhouse-server` 模式下，路径必须位于 [user&#95;files&#95;path](/operations/server-configuration-parameters/settings.md#user_files_path) 目录内。对于 `user_files_path` 内指向外部的符号链接，系统会跟随这些链接，但只返回其路径 (通过符号链接) 以 `user_files_path` 开头的条目。

在 `clickhouse-local` 模式下，路径不受限制。

## 语法 \{#syntax\}

```sql
filesystem([path])
```

## 参数 \{#arguments\}

| 参数     | 描述                                                                                                             |
| ------ | -------------------------------------------------------------------------------------------------------------- |
| `path` | 要列出的目录。可以是绝对路径 (在服务器模式下必须位于 `user_files_path` 内) ，也可以是相对于 `user_files_path` 的路径。若为空或省略，则默认为 `user_files_path`。 |

## 返回的列 \{#returned_columns\}

| 列                   | 类型                         | 描述                                                                                                                         |
| ------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `path`              | `String`                   | 包含该条目的目录 (不包括文件名或目录名本身) 。                                                                                                  |
| `name`              | `String`                   | 文件或目录名称 (路径的最后一个组成部分) 。                                                                                                    |
| `file`              | `String` (ALIAS of `name`) | `name` 列的别名。                                                                                                               |
| `type`              | `Enum8`                    | 文件类型：`'none'`、`'not_found'`、`'regular'`、`'directory'`、`'symlink'`、`'block'`、`'character'`、`'fifo'`、`'socket'`、`'unknown'`。 |
| `size`              | `Nullable(UInt64)`         | 文件大小 (以字节为单位，仅适用于普通文件) 。对于非普通文件 (目录、符号链接等) 以及发生错误时，值为 `NULL`。                                                              |
| `depth`             | `UInt16`                   | 递归深度。查询的目录本身及其直接子项为 `0`，更深一层的条目为 `1`，依此类推。                                                                                 |
| `modification_time` | `Nullable(DateTime64(6))`  | 最后修改时间，精确到微秒。发生错误时为 `NULL`。                                                                                                |
| `is_symlink`        | `Bool`                     | 该条目是否为符号链接。                                                                                                                |
| `content`           | `Nullable(String)`         | 文件内容 (仅适用于普通文件) 。对于非普通文件 (目录、符号链接等) ，值为 `NULL`。读取错误会引发异常。读取此列会触发实际的文件 I/O，因此如无必要请省略。                                       |
| `owner_read`        | `Bool`                     | 所有者具有读取权限。                                                                                                                 |
| `owner_write`       | `Bool`                     | 所有者具有写入权限。                                                                                                                 |
| `owner_exec`        | `Bool`                     | 所有者具有执行权限。                                                                                                                 |
| `group_read`        | `Bool`                     | 所属组具有读取权限。                                                                                                                 |
| `group_write`       | `Bool`                     | 所属组具有写入权限。                                                                                                                 |
| `group_exec`        | `Bool`                     | 所属组具有执行权限。                                                                                                                 |
| `others_read`       | `Bool`                     | 其他用户具有读取权限。                                                                                                                |
| `others_write`      | `Bool`                     | 其他用户具有写入权限。                                                                                                                |
| `others_exec`       | `Bool`                     | 其他用户具有执行权限。                                                                                                                |
| `set_gid`           | `Bool`                     | Set-GID 位。                                                                                                                 |
| `set_uid`           | `Bool`                     | Set-UID 位。                                                                                                                 |
| `sticky_bit`        | `Bool`                     | Sticky 位。                                                                                                                  |

仅会计算查询中实际用到的列，因此只选择列的子集 (尤其是不包含 `content` 时) 会更高效。

## 示例 \{#examples\}

### 列出 user_files 中的文件 \{#list-files\}

```sql
SELECT name, type, size, depth
FROM filesystem()
ORDER BY name;
```

### 查找大文件 \{#find-large-files\}

```sql
SELECT path, name, size
FROM filesystem()
WHERE type = 'regular' AND size > 1000000
ORDER BY size DESC;
```

### 读取文件内容 \{#read-contents\}

```sql
SELECT name, content
FROM filesystem('my_directory')
WHERE name LIKE '%.csv';
```

### 仅列出一级子项 \{#list-immediate\}

```sql
SELECT name, type
FROM filesystem('my_directory')
WHERE depth = 0;
```