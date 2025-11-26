---
description: '在同一名称下分组的设置集合。'
sidebar_label: '设置配置集'
sidebar_position: 61
slug: /operations/settings/settings-profiles
title: '设置配置集'
doc_type: 'reference'
---

# 设置配置文件

设置配置文件是按同一名称分组的一组设置。

:::note
ClickHouse 也支持用于管理设置配置文件的[基于 SQL 的工作流程](/operations/access-rights#access-control-usage)。建议优先使用该方式。
:::

配置文件可以有任意名称。可以为不同用户指定相同的配置文件。在设置配置文件中，最重要的一项是 `readonly=1`，它可以确保只读访问。

设置配置文件之间可以相互继承。要使用继承，请在配置文件中列出的其他设置之前，先指定一个或多个 `profile` 设置。如果某个设置在不同的配置文件中都有定义，则以最后定义的为准。

要应用配置文件中的所有设置，请设置 `profile` 参数。

示例：

安装 `web` 配置文件。

```sql
SET profile = 'web'
```

设置配置在用户配置文件中声明，通常是 `users.xml`。

示例：

```xml
<!-- 设置配置文件 -->
<profiles>
    <!-- 默认设置 -->
    <default>
        <!-- 执行单个查询时的最大线程数 -->
        <max_threads>8</max_threads>
    </default>

    <!-- 用户界面查询的设置 -->
    <web>
        <max_rows_to_read>1000000000</max_rows_to_read>
        <max_bytes_to_read>100000000000</max_bytes_to_read>

        <max_rows_to_group_by>1000000</max_rows_to_group_by>
        <group_by_overflow_mode>any</group_by_overflow_mode>

        <max_rows_to_sort>1000000</max_rows_to_sort>
        <max_bytes_to_sort>1000000000</max_bytes_to_sort>

        <max_result_rows>100000</max_result_rows>
        <max_result_bytes>100000000</max_result_bytes>
        <result_overflow_mode>break</result_overflow_mode>

        <max_execution_time>600</max_execution_time>
        <min_execution_speed>1000000</min_execution_speed>
        <timeout_before_checking_execution_speed>15</timeout_before_checking_execution_speed>

        <max_columns_to_read>25</max_columns_to_read>
        <max_temporary_columns>100</max_temporary_columns>
        <max_temporary_non_const_columns>50</max_temporary_non_const_columns>

        <max_subquery_depth>2</max_subquery_depth>
        <max_pipeline_depth>25</max_pipeline_depth>
        <max_ast_depth>50</max_ast_depth>
        <max_ast_elements>100</max_ast_elements>

        <max_sessions_for_user>4</max_sessions_for_user>

        <readonly>1</readonly>
    </web>
</profiles>
```

该示例定义了两个配置文件：`default` 和 `web`。

`default` 配置文件有一个特殊用途：它必须始终存在，并在启动服务器时应用。换句话说，`default` 配置文件包含默认设置。

`web` 配置文件是一个常规配置文件，可以通过 `SET` 查询或在 HTTP 查询中使用 URL 参数来设置。
