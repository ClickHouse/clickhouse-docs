---
slug: /sql-reference/statements/create/dictionary/sources/yamlregexptree
title: 'YAMLRegExpTree 字典源'
sidebar_position: 15
sidebar_label: 'YAMLRegExpTree'
description: '将 YAML 文件配置为正则表达式树字典的源。'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

<CloudNotSupportedBadge />

`YAMLRegExpTree` 源会从本地文件系统中的 YAML 文件加载一个正则表达式树。
它专门用于与 [`regexp_tree`](../layouts/regexp-tree.md) 字典布局配合使用，
并为基于模式的查找（例如 User-Agent 解析）提供分层的正则表达式到属性的映射。

:::note
`YAMLRegExpTree` 源仅在 ClickHouse 开源版本中可用。
对于 ClickHouse Cloud，请先将字典导出为 CSV，然后通过 [ClickHouse table source](./clickhouse.md) 加载。
详情参见 [在 ClickHouse Cloud 中使用 regexp&#95;tree 字典](../layouts/regexp-tree#use-regular-expression-tree-dictionary-in-clickhouse-cloud)。
:::


## 配置 \{#configuration\}

```sql
CREATE DICTIONARY regexp_dict
(
    regexp String,
    name String,
    version String
)
PRIMARY KEY(regexp)
SOURCE(YAMLRegExpTree(PATH '/var/lib/clickhouse/user_files/regexp_tree.yaml'))
LAYOUT(regexp_tree)
LIFETIME(0);
```

设置字段：

| Setting | Description                                                    |
| ------- | -------------------------------------------------------------- |
| `PATH`  | 指向包含正则表达式树的 YAML 文件的绝对路径。在通过 DDL 创建时，该文件必须位于 `user_files` 目录中。 |


## YAML 文件结构 \{#yaml-file-structure\}

YAML 文件包含一个正则表达式树的节点列表。每个节点都可以具有属性和子节点，从而形成一个层级结构：

```yaml
- regexp: 'Linux/(\d+[\.\d]*).+tlinux'
  name: 'TencentOS'
  version: '\1'

- regexp: '\d+/tclwebkit(?:\d+[\.\d]*)'
  name: 'Android'
  versions:
    - regexp: '33/tclwebkit'
      version: '13'
    - regexp: '3[12]/tclwebkit'
      version: '12'
    - regexp: '30/tclwebkit'
      version: '11'
    - regexp: '29/tclwebkit'
      version: '10'
```

每个节点具有以下结构：

* **`regexp`**：该节点对应的正则表达式。
* **attributes**：用户自定义的字典属性（例如 `name`、`version`）。属性值可以包含对正则表达式中捕获组的**反向引用**，写作 `\1` 或 `$1`（数字 1-9）。这些引用会在查询时被替换为相应的匹配捕获组。
* **child nodes**：子节点列表，每个子节点都有自己的属性，并且可以选择包含更多子节点。子节点列表的名称是任意的（例如上面的 `versions`）。字符串匹配以深度优先的方式进行：如果某个字符串匹配到某个节点，其子节点也会被检查。最深层匹配节点的属性优先级最高，会覆盖同名的父节点属性。


## 相关页面 \{#related-pages\}

- [regexp_tree 字典布局](../layouts/regexp-tree.md) — 布局配置、查询示例和匹配模式
- [dictGet](/sql-reference/functions/ext-dict-functions#dictGet), [dictGetAll](/sql-reference/functions/ext-dict-functions#dictGetAll) — 用于查询 regexp_tree 字典的函数