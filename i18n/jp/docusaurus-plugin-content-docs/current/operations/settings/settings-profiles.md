---
description: '同じ名前でまとめられた設定の集合。'
sidebar_label: '設定プロファイル'
sidebar_position: 61
slug: /operations/settings/settings-profiles
title: '設定プロファイル'
doc_type: 'reference'
---

# 設定プロファイル

設定プロファイルとは、同じ名前の下にまとめられた設定の集合です。

:::note
ClickHouse は、設定プロファイルを管理するための [SQL 主導のワークフロー](/operations/access-rights#access-control-usage) もサポートしています。こちらの利用を推奨します。
:::

プロファイル名は任意です。同じプロファイルを複数のユーザーに指定できます。設定プロファイルで最も重要な設定は `readonly=1` で、これにより読み取り専用アクセスが保証されます。

設定プロファイルは互いに継承できます。継承を使用するには、プロファイル内に列挙される他の設定より前に、1つまたは複数の `profile` 設定を指定します。同じ設定が異なるプロファイルで定義されている場合、最後に定義されたものが使用されます。

プロファイル内のすべての設定を適用するには、`profile` 設定を指定します。

例:

`web` プロファイルを設定します。

```sql
SET profile = 'web'
```

設定プロファイルはユーザー設定ファイルで定義します。通常は `users.xml` です。

例:

```xml
<!-- 設定プロファイル -->
<profiles>
    <!-- デフォルト設定 -->
    <default>
        <!-- 単一クエリ実行時の最大スレッド数 -->
        <max_threads>8</max_threads>
    </default>

    <!-- ユーザーインターフェースからのクエリの設定 -->
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

この例では、`default` と `web` の 2つのプロファイルを指定しています。

`default` プロファイルには特別な役割があります。これは常に定義されている必要があり、サーバー起動時に適用されます。言い換えると、`default` プロファイルにはデフォルトの設定が含まれます。

`web` プロファイルは通常のプロファイルであり、`SET` クエリを使用するか、HTTP クエリで URL パラメータとして指定して設定できます。
