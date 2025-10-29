---
'sidebar_label': 'Connection Tips'
'sidebar_position': 3
'slug': '/integrations/tableau/connection-tips'
'keywords':
- 'clickhouse'
- 'tableau'
- 'online'
- 'mysql'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Tableauの接続のヒント ClickHouse公式コネクタを使用する際の。'
'title': '接続のヒント'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';


# 接続のヒント
## 初期SQLタブ {#initial-sql-tab}
*Set Session ID* チェックボックスがAdvancedタブで有効になっている場合（デフォルトで）、セッションレベルの [settings](/operations/settings/settings/) を設定するために自由に使用してください。
```text
SET my_setting=value;
```
## Advancedタブ {#advanced-tab}

99%のケースではAdvancedタブは必要ありませんが、残りの1%では次の設定を使用できます：
- **カスタム接続パラメータ**。デフォルトでは `socket_timeout` が既に指定されており、このパラメータは一部の抽出が非常に長い間更新される場合に変更する必要があるかもしれません。このパラメータの値はミリ秒単位で指定されます。その他のパラメータは [こちら](https://github.com/ClickHouse/clickhouse-jdbc/blob/master/clickhouse-client/src/main/java/com/clickhouse/client/config/ClickHouseClientOption.java) で確認し、カンマで区切ってこのフィールドに追加してください。
- **JDBCドライバ custom_http_params**。このフィールドでは、[`custom_http_params` パラメータ](https://github.com/ClickHouse/clickhouse-jdbc#configuration) に値を渡すことで、ClickHouse接続文字列にいくつかのパラメータを追加できます。例えば、*Set Session ID* チェックボックスが有効になっているときに `session_id` を指定する方法はこの通りです。
- **JDBCドライバ `typeMappings`**。このフィールドでは、[ClickHouseデータ型をJDBCドライバで使用されるJavaデータ型にマッピングするリストを渡すことができます](https://github.com/ClickHouse/clickhouse-jdbc#configuration)。このパラメータのおかげで、コネクタは大きな整数を文字列として自動的に表示しますが、 *(理由は分かりません)*、マッピングセットを渡すことによってこれを変更することができます。
```text
UInt256=java.lang.Double,Int256=java.lang.Double
```
  マッピングについては、該当のセクションでさらに読むことができます。

- **JDBCドライバのURLパラメータ**。このフィールドでは、残りの [ドライバパラメータ](https://github.com/ClickHouse/clickhouse-jdbc#configuration) を渡すことができます。例えば `jdbcCompliance` などです。注意してください。パラメータの値はURLエンコード形式で渡す必要があり、このフィールドおよびAdvancedタブの前のフィールドで `custom_http_params` または `typeMappings` を渡す場合、Advancedタブの前の2つのフィールドの値の方が優先されます。
- **Set Session ID** チェックボックス。これは初期SQLタブでセッションレベルの設定を設定するために必要で、タイムスタンプと擬似乱数を含む形式で `session_id` を生成します： `"tableau-jdbc-connector-*{timestamp}*-*{number}*"`。
## UInt64, Int128, (U)Int256データ型に対する制限付きサポート {#limited-support-for-uint64-int128-uint256-data-types}
デフォルトでは、ドライバは *UInt64, Int128, (U)Int256* 型のフィールドを文字列として表示しますが、**表示するだけで変換はしません**。これは、次の計算フィールドを書き込もうとするとエラーが発生することを意味します。
```text
LEFT([myUInt256], 2) // Error!
```
大きな整数フィールドを文字列として扱うには、そのフィールドを明示的に STR() 関数でラップする必要があります。

```text
LEFT(STR([myUInt256]), 2) // Works well!
```

ただし、そのようなフィールドは、ユニークな値の数を見つけるために最もよく使用されます *(Yandex.MetricaのWatch ID、Visit IDなどのID)* または視覚化の詳細を指定するための *Dimension* として使用され、良好に機能します。

```text
COUNTD([myUInt256]) // Works well too!
```
UInt64フィールドを持つテーブルのデータプレビュー（データ表示）を使用する際には、エラーは現在表示されません。
