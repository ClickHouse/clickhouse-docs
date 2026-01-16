---
description: '同じ名前でグループ化された設定の集合。'
sidebar_label: '設定プロファイル'
sidebar_position: 61
slug: /operations/settings/settings-profiles
title: '設定プロファイル'
doc_type: 'reference'
---

# 設定プロファイル \\{#settings-profiles\\}

設定プロファイルとは、同じ名前でグループ化された設定の集合です。

:::note
ClickHouse では、設定プロファイルを管理するための [SQL ベースのワークフロー](/operations/access-rights#access-control-usage) もサポートしています。こちらの利用を推奨します。
:::

プロファイル名は任意に設定できます。同じプロファイルを複数のユーザーに指定することもできます。設定プロファイルで最も重要な設定は `readonly=1` であり、これにより読み取り専用アクセスが保証されます。

設定プロファイルは互いに継承できます。継承を利用するには、プロファイル内で列挙される他の設定より前に、1 つまたは複数の `profile` 設定を指定します。ある設定が異なるプロファイルで定義されている場合は、最後に定義されたものが有効になります。

プロファイル内のすべての設定を適用するには、`profile` 設定を指定します。

例:

`web` プロファイルを適用します。

```sql
SET profile = 'web'
```

設定プロファイルはユーザー設定ファイルで定義します。通常は `users.xml` です。

例：

```xml
<!-- Settings profiles -->
<profiles>
    <!-- Default settings -->
    <default>
        <!-- The maximum number of threads when running a single query. -->
        <max_threads>8</max_threads>
    </default>

    <!-- Settings for queries from the user interface -->
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

この例では、`default` と `web` の 2 つのプロファイルを指定しています。

`default` プロファイルには特別な目的があります。必ず定義されている必要があり、サーバー起動時に適用されます。言い換えると、`default` プロファイルには既定の設定が含まれます。

`web` プロファイルは通常のプロファイルであり、`SET` クエリ、または HTTP クエリ内の URL パラメータを使って設定できます。
