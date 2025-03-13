---
sidebar_label: 接続のヒント
sidebar_position: 3
slug: /integrations/tableau/connection-tips
keywords: [clickhouse, tableau, online, mysql, connect, integrate, ui]
description: ClickHouse公式コネクタを使用した際のTableau接続のヒント。
---


# 接続のヒント
## 初期 SQL タブ {#initial-sql-tab}
*Set Session ID* チェックボックスが高度なタブで有効になっている場合（デフォルトで有効）、セッションレベルの [settings](/operations/settings/settings/) を以下のように設定しても構いません。
```text
SET my_setting=value;
``` 

## 高度なタブ {#advanced-tab}

99%のケースでは高度なタブは必要ありませんが、残りの1%のケースでは以下の設定を使用できます：
- **カスタム接続パラメータ**。デフォルトで `socket_timeout` が指定されていますが、一部の抽出が非常に長時間更新される場合はこのパラメータの変更が必要です。このパラメータの値はミリ秒で指定します。その他のパラメータは [こちら](https://github.com/ClickHouse/clickhouse-jdbc/blob/master/clickhouse-client/src/main/java/com/clickhouse/client/config/ClickHouseClientOption.java) にありますので、カンマで区切ってこのフィールドに追加してください。
- **JDBC ドライバー custom_http_params**。このフィールドでは、ClickHouse接続文字列にいくつかのパラメータを追加できます。これは [`custom_http_params` パラメータ](https://github.com/ClickHouse/clickhouse-jdbc#configuration) に値を渡すことによって実現されます。例えば、*Set Session ID* チェックボックスが有効になっている場合の `session_id` の指定方法は次の通りです。
- **JDBC ドライバー `typeMappings`**。このフィールドでは、[ClickHouseデータ型をJDBCドライバーで使用されるJavaデータ型にマッピングするリストを渡すことができます](https://github.com/ClickHouse/clickhouse-jdbc#configuration)。このパラメータのおかげで、コネクタは大きな整数を自動的に文字列として表示します。以下のようにマッピングセットを渡すことで変更できますが、*理由は不明です*。
    ```text
    UInt256=java.lang.Double,Int256=java.lang.Double
    ```
  マッピングについては、該当するセクションで詳しく説明しています。

- **JDBC ドライバー URL パラメータ**。このフィールドでは、残りの [ドライバーパラメータ](https://github.com/ClickHouse/clickhouse-jdbc#configuration) を渡すことができます。例えば `jdbcCompliance` などです。注意が必要で、パラメータの値はURLエンコード形式で渡す必要があります。また、こちらのフィールド、および高度なタブの前のフィールドで `custom_http_params` や `typeMappings` を渡す場合、高度なタブの先行する2つのフィールドの値が優先されます。
- **Set Session ID** チェックボックス。これは初期 SQL タブでセッションレベルの設定を行うために必要で、タイムスタンプと擬似乱数を持つ `session_id` を `"tableau-jdbc-connector-*{timestamp}*-*{number}*"` という形式で生成します。

## UInt64, Int128, (U)Int256 データ型の制限付きサポート {#limited-support-for-uint64-int128-uint256-data-types}
デフォルトでは、ドライバーは *UInt64, Int128, (U)Int256* 型のフィールドを文字列として表示しますが、**表示するだけで変換はしません**。これは、次に計算されたフィールドを記述しようとするとエラーが発生することを意味します。
```text
LEFT([myUInt256], 2) // エラー！
```
大きな整数フィールドを文字列として扱うためには、明示的にフィールドを STR() 関数でラップする必要があります。

```text
LEFT(STR([myUInt256]), 2) // 問題なく機能します！
```

ただし、これらのフィールドは通常、ユニークな値の数を見つけるために使用されます *(Watch ID、Yandex.MetricaのVisit IDとしてのID)* または *Dimension* として視覚化の詳細を指定するために使用されるため、良好に機能します。

```text
COUNTD([myUInt256]) // こちらも問題なく機能します！
```
UInt64フィールドを持つテーブルのデータプレビュー（データを表示）の使用時、現在はエラーが表示されません。
