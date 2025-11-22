---
description: '可以在 `user.xml` 配置文件的 `profiles` 部分中定义设置约束，并禁止用户通过 `SET` 查询修改某些设置。'
sidebar_label: '设置约束'
sidebar_position: 62
slug: /operations/settings/constraints-on-settings
title: '设置约束'
doc_type: 'reference'
---



# 设置约束



## 概述 {#overview}

在 ClickHouse 中,设置"约束"是指可以应用于设置项的限制和规则。通过应用这些约束,可以维护数据库的稳定性、安全性和可预测的行为。


## 定义约束 {#defining-constraints}

可以在 `user.xml` 配置文件的 `profiles` 部分中定义设置约束。这些约束可防止用户使用 [`SET`](/sql-reference/statements/set) 语句修改某些设置。

约束的定义方式如下:

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

如果用户尝试违反约束,系统将抛出异常,且设置保持不变。


## 约束类型 {#types-of-constraints}

ClickHouse 支持以下几种约束类型:

- `min`
- `max`
- `disallowed`
- `readonly` (别名为 `const`)
- `changeable_in_readonly`

`min` 和 `max` 约束用于为数值型设置指定上限和下限,可以组合使用。

`disallowed` 约束用于指定特定设置不允许使用的值。

`readonly` 或 `const` 约束指定用户完全无法更改相应的设置。

`changeable_in_readonly` 约束类型允许用户在 `readonly` 设置为 `1` 时,仍可在 `min`/`max` 范围内更改设置,否则在 `readonly=1` 模式下不允许更改设置。

:::note
仅当启用 `settings_constraints_replace_previous` 时才支持 `changeable_in_readonly`:

```xml
<access_control_improvements>
  <settings_constraints_replace_previous>true</settings_constraints_replace_previous>
</access_control_improvements>
```

:::


## 多个约束配置文件 {#multiple-constraint-profiles}

如果用户激活了多个配置文件,则约束将被合并。
合并过程取决于 `settings_constraints_replace_previous` 参数:

- **true**(推荐):合并时,相同设置的约束会被替换,
  即使用最后一个约束,忽略所有先前的约束。
  这包括新约束中未设置的字段。
- **false**(默认):相同设置的约束按以下方式合并:
  未设置类型的约束从先前的配置文件中获取,
  已设置类型的约束则被新配置文件中的值替换。


## 只读模式 {#read-only}

只读模式通过 `readonly` 设置启用,请勿将其与 `readonly` 约束类型混淆:

- `readonly=0`: 无只读限制。
- `readonly=1`: 仅允许执行读取查询,且无法更改设置,除非设置了 `changeable_in_readonly`。
- `readonly=2`: 仅允许执行读取查询,但可以更改设置,`readonly` 设置本身除外。

### 示例 {#example-read-only}

假设 `users.xml` 包含以下内容:

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

以下查询都将抛出异常:

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
`default` 配置文件的处理方式较为特殊:为 `default` 配置文件定义的所有约束都会成为默认约束,因此它们会限制所有用户,直到为这些用户显式覆盖。
:::


## MergeTree 设置的约束 {#constraints-on-merge-tree-settings}

可以为 [MergeTree 设置](merge-tree-settings.md)设定约束。
这些约束在创建使用 MergeTree 引擎的表或修改其存储设置时应用。

在 `<constraints>` 部分中引用 MergeTree 设置时,其名称必须添加 `merge_tree_` 前缀。

### 示例 {#example-mergetree}

您可以禁止创建显式指定 `storage_policy` 的新表

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
