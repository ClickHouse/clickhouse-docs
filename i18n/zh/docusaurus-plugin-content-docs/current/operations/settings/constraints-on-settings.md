---
'description': 'Constraints on settings can be defined in the `profiles` section of
  the `user.xml` configuration file and prohibit users from changing some of the settings
  with the `SET` query.'
'sidebar_label': '设置约束'
'sidebar_position': 62
'slug': '/operations/settings/constraints-on-settings'
'title': 'Constraints on Settings'
---




# 设置的约束

## 概述 {#overview}

在 ClickHouse 中，设置的“约束”是指您可以分配给设置的限制和规则。这些约束可以应用于维护数据库的稳定性、安全性和可预测性行为。

## 定义约束 {#defining-constraints}

可以在 `user.xml` 配置文件的 `profiles` 部分定义设置上的约束。它们禁止用户使用 [`SET`](/sql-reference/statements/set) 语句更改某些设置。

约束的定义如下：

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

如果用户尝试违反约束，将抛出异常，设置将保持不变。

## 约束类型 {#types-of-constraints}

ClickHouse 支持几种类型的约束：
- `min`
- `max`
- `disallowed`
- `readonly`（别名为 `const`）
- `changeable_in_readonly`

`min` 和 `max` 约束指定数值设置的上界和下界，可以组合使用。

`disallowed` 约束可用于指定特定值，这些值不应被特定设置允许。

`readonly` 或 `const` 约束指定用户根本无法更改相应的设置。

`changeable_in_readonly` 约束类型允许用户在 `min`/`max` 范围内更改设置，即使 `readonly` 设置为 `1`，否则在 `readonly=1` 模式下不允许更改设置。

:::note
仅当启用 `settings_constraints_replace_previous` 时，才支持 `changeable_in_readonly`：

```xml
<access_control_improvements>
  <settings_constraints_replace_previous>true</settings_constraints_replace_previous>
</access_control_improvements>
```
:::

## 多个约束配置文件 {#multiple-constraint-profiles}

如果对用户有多个活动的配置文件，则约束会合并。合并过程取决于 `settings_constraints_replace_previous`：
- **true**（推荐）：在合并期间，相同设置的约束被替换，最后的约束被使用，所有之前的约束被忽略。这包括在新约束中未设置的字段。
- **false**（默认）：相同设置的约束以一种方式合并，即每个未设置的约束类型来自之前的配置文件，每个已设置的约束类型由新配置文件中的值替换。

## 只读模式 {#read-only}

只读模式由 `readonly` 设置启用，不应与 `readonly` 约束类型混淆：
- `readonly=0`：没有只读限制。
- `readonly=1`：只允许读取查询，不能更改设置，除非设置了 `changeable_in_readonly`。
- `readonly=2`：只允许读取查询，但可以更改设置，除了 `readonly` 设置本身。

### 示例 {#example-read-only}

假设 `users.xml` 包含以下行：

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

以下查询将抛出异常：

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
`default` 配置文件的处理是独特的：为 `default` 配置文件定义的所有约束成为默认约束，因此它们会限制所有用户，直到为这些用户显式覆盖。
:::

## MergeTree 设置的约束 {#constraints-on-merge-tree-settings}

可以为 [merge tree settings](merge-tree-settings.md) 设置约束。这些约束在创建具有 MergeTree 引擎的表格或更改其存储设置时应用。

引用 `<constraints>` 部分中的 merge tree 设置时，设置名称必须以 `merge_tree_` 前缀开头。

### 示例 {#example-mergetree}

您可以禁止显式指定 `storage_policy` 创建新表

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
