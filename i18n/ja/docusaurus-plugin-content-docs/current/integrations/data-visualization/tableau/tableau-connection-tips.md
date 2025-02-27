---
sidebar_label: 接続のヒント
sidebar_position: 3
slug: /integrations/tableau/connection-tips
keywords: [clickhouse, tableau, online, mysql, connect, integrate, ui]
description: ClickHouseの公式コネクタを使用した際のTableau接続のヒント。
---

# 接続のヒント
## 初期SQLタブ {#initial-sql-tab}
*Set Session ID* チェックボックスが高度なタブで有効になっている場合（デフォルトでは有効）、セッションレベルの[設定](/operations/settings/settings/)を次のように設定できます。
```text
SET my_setting=value;
``` 
## 高度なタブ {#advanced-tab}

99%のケースでは高度なタブは必要ありませんが、残りの1%の場合には次の設定を使用できます：
- **カスタム接続パラメータ**。デフォルトでは `socket_timeout` が指定されています。このパラメータは、一部の抽出が非常に長い時間更新される場合に変更する必要があるかもしれません。このパラメータの値はミリ秒で指定されます。その他のパラメータは[こちら](https://github.com/ClickHouse/clickhouse-jdbc/blob/master/clickhouse-client/src/main/java/com/clickhouse/client/config/ClickHouseClientOption.java)で確認でき、このフィールドにカンマで区切って追加します。
- **JDBCドライバの custom_http_params**。このフィールドでは、ClickHouse接続文字列にいくつかのパラメータを追加することができ、[`custom_http_params`パラメータに値を渡します](https://github.com/ClickHouse/clickhouse-jdbc#configuration)。例えば、*Set Session ID* チェックボックスが有効なときに `session_id` が指定される方法は以下のとおりです。
- **JDBCドライバの `typeMappings`**。このフィールドでは、[ClickHouseデータ型のマッピングをJDBCドライバで使用するJavaデータ型に渡すことができます](https://github.com/ClickHouse/clickhouse-jdbc#configuration)。このパラメータのおかげで、コネクタは大きな整数を自動的に文字列として表示します。これを変更するには、自分のマッピングセットを渡します *(私は理由が分かりません)*。
    ```text
    UInt256=java.lang.Double,Int256=java.lang.Double
    ```
  マッピングの詳細については、対応するセクションを参照してください。

- **JDBCドライバのURLパラメータ**。残りの[ドライバパラメータ](https://github.com/ClickHouse/clickhouse-jdbc#configuration)（例：`jdbcCompliance`）をこのフィールドに渡すことができます。注意してください。パラメータの値はURLエンコード形式で渡す必要があり、`custom_http_params`や`typeMappings`をこのフィールドと高度なタブの前のフィールドに渡す場合、前の2つのフィールドの値は高度なタブの優先順位が高くなります。
- **Set Session ID** チェックボックス。このチェックボックスは、初期SQLタブでセッションレベルの設定を行うために必要で、タイムスタンプと擬似乱数を使用して`session_id`を生成します。その形式は `"tableau-jdbc-connector-*{timestamp}*-*{number}*"` です。
## UInt64, Int128, (U)Int256データ型のサポート制限 {#limited-support-for-uint64-int128-uint256-data-types}
デフォルトでは、ドライバは*UInt64, Int128, (U)Int256*型のフィールドを文字列として表示しますが、**表示するだけで変換はしません**。つまり、次の計算フィールドを書こうとするとエラーが発生します。
```text
LEFT([myUInt256], 2) // エラー!
```
大きな整数フィールドを文字列として扱うためには、フィールドを明示的にSTR()関数でラップする必要があります。

```text
LEFT(STR([myUInt256]), 2) // 正常に動作します!
```

しかし、このようなフィールドは、ユニークな値（*Watch IDやVisit IDのようなID*）の数を見つけるためや、視覚化の詳細を指定するための*ディメンション*としてよく使われるため、うまく機能します。

```text
COUNTD([myUInt256]) // これも正常に動作します!
```
UInt64フィールドを持つテーブルのデータプレビュー（View data）を使用する際には、エラーが表示されなくなりました。
