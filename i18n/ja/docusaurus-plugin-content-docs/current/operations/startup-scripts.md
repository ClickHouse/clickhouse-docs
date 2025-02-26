---
slug: /operations/startup-scripts
sidebar_label: スタートアップスクリプト
---

# スタートアップスクリプト

ClickHouseは、サーバー設定から任意のSQLクエリを起動時に実行することができます。これは、マイグレーションや自動スキーマ作成に役立ちます。

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

ClickHouseは、`startup_scripts`からすべてのクエリを指定された順序で順次実行します。いずれかのクエリが失敗した場合でも、その後のクエリの実行は中断されません。

設定に条件付きクエリを指定することができます。この場合、対応するクエリは、条件クエリが値`1`または`true`を返したときのみ実行されます。

:::note
条件クエリが`1`または`true`以外の値を返した場合、その結果は`false`として解釈され、対応するクエリは実行されません。
:::
