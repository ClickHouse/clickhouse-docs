---
description: '可以在 `user.xml` 配置文件的 `profiles` 部分为某些设置定义约束条件，从而禁止用户通过 `SET` 查询更改这些设置。'
sidebar_label: '设置约束条件'
sidebar_position: 62
slug: /operations/settings/constraints-on-settings
title: '设置约束条件'
doc_type: 'reference'
---

# 配置约束 \\{#constraints-on-settings\\}

## 概览 \\{#overview\\}

在 ClickHouse 中，设置上的“约束”是指可以应用于这些设置的限制和规则。这些约束可以帮助维护数据库的稳定性、安全性以及行为的可预测性。

## 定义约束 \\{#defining-constraints\\}

可以在 `user.xml` 配置文件的 `profiles` 部分中定义设置约束。它们会禁止用户通过
[`SET`](/sql-reference/statements/set) 语句更改某些设置。

约束的定义方式如下：

```xml
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
      <setting_name_6>
        <min>lower_boundary</min>
        <max>upper_boundary</max>
        <disallowed>value1</disallowed>
        <disallowed>value2</disallowed>
        <disallowed>value3</disallowed>
        <changeable_in_readonly/>
      </setting_name_6>
    </constraints>
  </user_name>
</profiles>
```

如果用户尝试违反这些约束，则会抛出异常，且该设置保持不变。

## 约束类型 \\{#types-of-constraints\\}

ClickHouse 中支持以下几种类型的约束：

* `min`
* `max`
* `disallowed`
* `readonly`（别名为 `const`）
* `changeable_in_readonly`

`min` 和 `max` 约束为数值型设置指定上下界，并且可以组合使用。

`disallowed` 约束可用于指定某个设置不允许使用的特定取值（或取值集合）。

`readonly` 或 `const` 约束表示用户完全不能修改对应的设置。

`changeable_in_readonly` 约束类型允许用户在 `min`/`max` 范围内修改设置，即使 `readonly` 设置为 `1`；否则在 `readonly=1` 模式下将不允许修改该设置。

:::note
仅当启用了 `settings_constraints_replace_previous` 时，才支持 `changeable_in_readonly`：

```xml
<access_control_improvements>
  <settings_constraints_replace_previous>true</settings_constraints_replace_previous>
</access_control_improvements>
```

:::

## 多个约束配置文件 \\{#multiple-constraint-profiles\\}

如果某个用户同时有多个配置文件生效，这些约束会被合并。
合并行为取决于 `settings_constraints_replace_previous`：
- **true**（推荐）：在合并时，相同设置的约束会被替换，后面的约束生效，之前的全部被忽略。
  这也包括那些在新约束中未设置的字段（不会从之前的约束中继承）。
- **false**（默认）：在合并时，相同设置的约束会按以下方式处理：
  所有未设置的约束类型从之前的配置文件中继承，所有已设置的约束类型则被新配置文件中的值所替换。

## 只读模式 \\{#read-only\\}

只读模式通过 `readonly` 设置启用，不要将其与 `readonly` 约束类型混淆：

* `readonly=0`：无只读限制。
* `readonly=1`：只允许执行只读查询，且无法更改设置，
  除非设置了 `changeable_in_readonly`。
* `readonly=2`：只允许执行只读查询，但可以更改设置，
  `readonly` 设置本身除外。

### 示例 \\{#example-read-only\\}

假设 `users.xml` 包含以下几行：

```xml
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

```sql
SET max_memory_usage=20000000001;
SET max_memory_usage=4999999999;
SET force_index_by_date=1;
```

```text
Code: 452, e.displayText() = DB::Exception: Setting max_memory_usage should not be greater than 20000000000.
Code: 452, e.displayText() = DB::Exception: Setting max_memory_usage should not be less than 5000000000.
Code: 452, e.displayText() = DB::Exception: Setting force_index_by_date should not be changed.
```

:::note
`default` 配置文件有特殊处理方式：为 `default` 配置文件定义的所有约束都会成为默认约束，因此它们会对所有用户生效，直到为这些用户显式设置了新的约束将其覆盖为止。
:::

## 对 MergeTree 设置的约束 \\{#constraints-on-merge-tree-settings\\}

可以为 [MergeTree 设置](merge-tree-settings.md) 定义约束。
在创建使用 MergeTree 引擎的表，
或修改其存储设置时，这些约束会被应用。

在 `<constraints>` 部分中引用 MergeTree 设置名称时，
必须在其前面加上 `merge_tree_` 前缀。

### 示例 \\{#example-mergetree\\}

可以禁止创建显式指定 `storage_policy` 的新表。

```xml
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
