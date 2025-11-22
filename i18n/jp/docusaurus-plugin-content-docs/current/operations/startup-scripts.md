---
description: '自動的なスキーマ作成とマイグレーションのための ClickHouse における SQL 起動スクリプトの設定および使用ガイド'
sidebar_label: '起動スクリプト'
slug: /operations/startup-scripts
title: '起動スクリプト'
doc_type: 'guide'
---

# 起動スクリプト

ClickHouse は、起動時にサーバー設定に記述された任意の SQL クエリを実行できます。これは、マイグレーションやスキーマの自動作成に役立ちます。

```xml
<clickhouse>
    <startup_scripts>
        <throw_on_error>false</throw_on_error>
        <scripts>
            <query>CREATE ROLE OR REPLACE test_role</query>
        </scripts>
        <scripts>
            <query>CREATE TABLE TestTable (id UInt64) ENGINE=TinyLog</query>
            <condition>SELECT 1;</condition>
        </scripts>
        <scripts>
            <query>CREATE DICTIONARY test_dict (...) SOURCE(CLICKHOUSE(...))</query>
            <user>default</user>
        </scripts>
    </startup_scripts>
</clickhouse>
```

ClickHouse は、`startup_scripts` に含まれるすべてのクエリを指定された順序で順番に実行します。いずれかのクエリが失敗しても、その後のクエリの実行は中断されません。ただし、`throw_on_error` が true に設定されている場合は、スクリプトの実行中にエラーが発生するとサーバーは起動しません。

設定で条件付きクエリを指定できます。その場合、対応するクエリは、条件クエリが値 `1` または `true` を返した場合にのみ実行されます。

:::note
条件クエリが `1` または `true` 以外の値を返した場合、その結果は `false` と解釈され、対応するクエリは実行されません。
:::
