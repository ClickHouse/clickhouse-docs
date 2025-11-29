---
description: '表设置变更说明文档'
sidebar_label: '设置'
sidebar_position: 38
slug: /sql-reference/statements/alter/setting
title: '表设置变更'
doc_type: 'reference'
---

# 表设置操作 {#table-settings-manipulations}

有一组查询语句可用于更改表设置。可以修改设置或将其重置为默认值。单条查询语句可以同时更改多个设置。
如果指定名称的设置不存在，则查询会抛出异常。

**语法**

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] 修改|重置 设置 ...
```

:::note\
这些查询仅适用于 [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) 类型的表。
:::

## MODIFY SETTING {#modify-setting}

更改表设置。

**语法**

```sql
修改设置 setting_name=value [, ...]
```

**示例**

```sql
CREATE TABLE example_table (id UInt32, data String) ENGINE=MergeTree() ORDER BY id;

ALTER TABLE example_table MODIFY SETTING max_part_loading_threads=8, max_parts_in_total=50000;
```

## RESET SETTING {#reset-setting}

将表设置重置为默认值。\
如果某个设置已经处于默认状态，则不会执行任何操作。

**语法**

```sql
重置 设置 setting_name [, ...]
```

**示例**

```sql
CREATE TABLE example_table (id UInt32, data String) ENGINE=MergeTree() ORDER BY id
    SETTINGS max_part_loading_threads=8;

ALTER TABLE example_table RESET SETTING max_part_loading_threads;
```

**另请参阅**

* [MergeTree 设置](../../../operations/settings/merge-tree-settings.md)
