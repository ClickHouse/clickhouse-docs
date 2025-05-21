---
description: 'ClickHouseにおける自動スキーマ作成およびマイグレーションのためのSQLスタートアップスクリプトの設定と使用に関するガイド'
sidebar_label: 'スタートアップスクリプト'
slug: /operations/startup-scripts
title: 'スタートアップスクリプト'
---


# スタートアップスクリプト

ClickHouseは、サーバー設定から任意のSQLクエリを起動時に実行できます。これは、マイグレーションや自動スキーマ作成に便利です。

```xml
<clickhouse>
    <startup_scripts>
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

ClickHouseは、指定された順序で`startup_scripts`内のすべてのクエリを順次実行します。もしクエリのいずれかが失敗した場合でも、次のクエリの実行は中断されません。

設定内で条件付きクエリを指定できます。その場合、条件クエリが`1`または`true`の値を返すときのみ、対応するクエリが実行されます。

:::note
条件クエリが`1`または`true`以外の任意の値を返す場合、その結果は`false`として解釈され、対応するクエリは実行されません。
:::
