---
slug: /operations/settings/constraints-on-settings
sidebar_position: 62
sidebar_label: 设置约束
title: '设置约束'
description: '可以在 `user.xml` 配置文件的 `profiles` 部分定义设置约束，并禁止用户通过 `SET` 查询更改某些设置。'
---


# 设置约束

设置约束可以在 `user.xml` 配置文件的 `profiles` 部分定义，并禁止用户通过 `SET` 查询更改某些设置。约束定义如下：

``` xml
<profiles>
  <user_name>
    <constraints>
      <setting_name_1>
        <min>lower_boundary</min>
      </setting_name_1>
      <setting_name_2>
        <max>upper_boundary</max>
      </setting_name_2>
      <setting_name_3>
        <min>lower_boundary</min>
        <max>upper_boundary</max>
      </setting_name_3>
      <setting_name_4>
        <readonly/>
      </setting_name_4>
      <setting_name_5>
        <min>lower_boundary</min>
        <max>upper_boundary</max>
        <changeable_in_readonly/>
      </setting_name_5>
    </constraints>
  </user_name>
</profiles>
```

如果用户尝试违反约束，将抛出异常并且设置不会被更改。支持的约束类型有：`min`、`max`、`readonly`（别名 `const`）和 `changeable_in_readonly`。`min` 和 `max` 约束指定了数值设置的上下边界，可以组合使用。`readonly` 或 `const` 约束指定用户完全不能更改相应的设置。`changeable_in_readonly` 约束类型允许用户在 `readonly` 设置为 1 的情况下，在 `min`/`max` 范围内更改设置，否则在 `readonly=1` 模式下不允许更改设置。请注意，只有在启用 `settings_constraints_replace_previous` 的情况下才支持 `changeable_in_readonly`：
``` xml
<access_control_improvements>
  <settings_constraints_replace_previous>true</settings_constraints_replace_previous>
</access_control_improvements>
```

如果用户有多个激活的配置文件，则约束会合并。合并过程取决于 `settings_constraints_replace_previous`：
- **true**（推荐）：在合并过程中，相同设置的约束被替换，以便使用最后一个约束，之前的约束会被忽略，包括在新约束中未设置的字段。
- **false**（默认）：相同设置的约束以一种方式合并，即每个未设置的约束类型来自以前的配置文件，设置的约束类型则由新配置文件的值替换。

只读模式通过 `readonly` 设置启用（不要与 `readonly` 约束类型混淆）：
- `readonly=0`：没有只读限制。
- `readonly=1`：只允许读取查询，除非设置为 `changeable_in_readonly`，否则无法更改设置。
- `readonly=2`：只允许读取查询，但设置可以更改，除了 `readonly` 设置本身。

**示例：** 假设 `users.xml` 包含如下行：

``` xml
<profiles>
  <default>
    <max_memory_usage>10000000000</max_memory_usage>
    <force_index_by_date>0</force_index_by_date>
    ...
    <constraints>
      <max_memory_usage>
        <min>5000000000</min>
        <max>20000000000</max>
      </max_memory_usage>
      <force_index_by_date>
        <readonly/>
      </force_index_by_date>
    </constraints>
  </default>
</profiles>
```

以下查询都会抛出异常：

``` sql
SET max_memory_usage=20000000001;
SET max_memory_usage=4999999999;
SET force_index_by_date=1;
```

``` text
Code: 452, e.displayText() = DB::Exception: Setting max_memory_usage should not be greater than 20000000000.
Code: 452, e.displayText() = DB::Exception: Setting max_memory_usage should not be less than 5000000000.
Code: 452, e.displayText() = DB::Exception: Setting force_index_by_date should not be changed.
```

**注意：** `default` 配置文件有特别的处理：为 `default` 配置文件定义的所有约束都成为默认约束，因此它们限制所有用户，直到这些用户显式重写。

## Merge Tree 设置的约束 {#constraints-on-merge-tree-settings}
可以为 [merge tree 设置](merge-tree-settings.md) 设置约束。这些约束在创建使用 merge tree 引擎的表时或其存储设置被更改时应用。引用时，merge tree 设置名称必须以 `merge_tree_` 前缀开头写在 `<constraints>` 部分中。

**示例：** 禁止创建新表时显式指定 `storage_policy`

``` xml
<profiles>
  <default>
    <constraints>
      <merge_tree_storage_policy>
        <const/>
      </merge_tree_storage_policy>
    </constraints>
  </default>
</profiles>
```
