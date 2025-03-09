slug: /operations/settings/settings-profiles
sidebar_position: 61
sidebar_label: '设置配置文件'
description: '一组以相同名称分组的设置。'
title: '设置配置文件'
```


# 设置配置文件

设置配置文件是一组以相同名称分组的设置。

:::note
ClickHouse 还支持 [SQL驱动的工作流](/operations/access-rights#access-control-usage) 来管理设置配置文件。我们建议使用它。
:::

配置文件可以有任何名称。您可以为不同用户指定相同的配置文件。您在设置配置文件中可以写的最重要的内容是 `readonly=1`，这确保了只读访问。

设置配置文件可以相互继承。要使用继承，请在列出的其他设置之前指明一个或多个 `profile` 设置。当一个设置在不同的配置文件中定义时，将使用最后定义的设置。

要应用配置文件中的所有设置，请设置 `profile` 设置。

示例：

安装 `web` 配置文件。

``` sql
SET profile = 'web'
```

设置配置文件在用户配置文件中声明。通常是 `users.xml`。

示例：

``` xml
<!-- 设置配置文件 -->
<profiles>
    <!-- 默认设置 -->
    <default>
        <!-- 运行单个查询时的最大线程数。 -->
        <max_threads>8</max_threads>
    </default>

    <!-- 用户界面的查询设置 -->
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

该示例指定了两个配置文件：`default` 和 `web`。

`default` 配置文件有特殊用途：它必须始终存在，并在启动服务器时应用。换句话说，`default` 配置文件包含默认设置。

`web` 配置文件是一个常规配置文件，可以使用 `SET` 查询或在 HTTP 查询中使用 URL 参数设置。
