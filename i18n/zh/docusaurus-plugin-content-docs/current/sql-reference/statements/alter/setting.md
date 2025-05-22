---
'description': '表设置操作的文档'
'sidebar_label': 'SETTING'
'sidebar_position': 38
'slug': '/sql-reference/statements/alter/setting'
'title': '表设置操作'
---


# 表设置操作

有一组查询可以更改表设置。您可以修改设置或将其重置为默认值。单个查询可以同时更改多个设置。如果指定名称的设置不存在，则查询会引发异常。

**语法**

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY|RESET SETTING ...
```

:::note    
这些查询仅适用于 [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) 表。
:::

## 修改设置 {#modify-setting}

更改表设置。

**语法**

```sql
MODIFY SETTING setting_name=value [, ...]
```

**示例**

```sql
CREATE TABLE example_table (id UInt32, data String) ENGINE=MergeTree() ORDER BY id;

ALTER TABLE example_table MODIFY SETTING max_part_loading_threads=8, max_parts_in_total=50000;
```

## 重置设置 {#reset-setting}

将表设置重置为默认值。如果设置处于默认状态，则不采取任何操作。

**语法**

```sql
RESET SETTING setting_name [, ...]
```

**示例**

```sql
CREATE TABLE example_table (id UInt32, data String) ENGINE=MergeTree() ORDER BY id
    SETTINGS max_part_loading_threads=8;

ALTER TABLE example_table RESET SETTING max_part_loading_threads;
```

**另请参阅**

- [MergeTree 设置](../../../operations/settings/merge-tree-settings.md)
