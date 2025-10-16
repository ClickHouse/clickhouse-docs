---
'description': 'SQL 起動スクリプト を ClickHouse で自動スキーマ作成とマイグレーションのために設定および使用するためのガイド'
'sidebar_label': '起動スクリプト'
'slug': '/operations/startup-scripts'
'title': '起動スクリプト'
'doc_type': 'guide'
---


# スタートアップスクリプト

ClickHouseは、サーバーの設定から任意のSQLクエリを起動時に実行できます。これは、マイグレーションや自動スキーマの作成に便利です。

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

ClickHouseは、`startup_scripts`からすべてのクエリを指定された順序で順次実行します。もしクエリのいずれかが失敗しても、次のクエリの実行は中断されません。ただし、`throw_on_error`がtrueに設定されている場合、スクリプト実行中にエラーが発生するとサーバーは起動しません。

設定ファイルに条件付きクエリを指定できます。その場合、条件クエリが値 `1` または `true` を返したときのみ、対応するクエリが実行されます。

:::note
条件クエリが `1` または `true` 以外の値を返すと、その結果は `false` と解釈され、対応するクエリは実行されません。
:::
