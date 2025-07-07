---
'description': 'Guide to configuring and using SQL startup scripts in ClickHouse for
  automatic schema creation and migrations'
'sidebar_label': 'Startup Scripts'
'slug': '/operations/startup-scripts'
'title': 'Startup Scripts'
---




# スタートアップスクリプト

ClickHouseは、スタートアップ時にサーバー構成から任意のSQLクエリを実行できます。これは、マイグレーションや自動スキーマ作成に役立ちます。

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

ClickHouseは、指定された順序で`startup_scripts`からすべてのクエリを順次実行します。クエリのいずれかが失敗した場合でも、その後のクエリの実行は中断されません。

設定ファイルに条件付きクエリを指定できます。この場合、条件クエリが値 `1` または `true` を返すときのみ、対応するクエリが実行されます。

:::note
条件クエリが `1` または `true` 以外の値を返すと、その結果は `false` として解釈され、対応するクエリは実行されません。
:::
