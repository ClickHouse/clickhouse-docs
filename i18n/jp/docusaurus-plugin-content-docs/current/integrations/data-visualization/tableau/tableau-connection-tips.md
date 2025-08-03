---
sidebar_label: 'Connection Tips'
sidebar_position: 3
slug: '/integrations/tableau/connection-tips'
keywords:
- 'clickhouse'
- 'tableau'
- 'online'
- 'mysql'
- 'connect'
- 'integrate'
- 'ui'
description: 'Tableau connection tips when using ClickHouse official connector.'
title: 'Connection tips'
---

import Image from '@theme/IdealImage';



# 接続のヒント
## 初期 SQL タブ {#initial-sql-tab}
*Set Session ID* チェックボックスが詳細タブで有効になっている場合（デフォルト）、セッションレベルの [設定](/operations/settings/settings/) を以下のように設定できます。
```text
SET my_setting=value;
``` 
## 詳細タブ {#advanced-tab}

99% のケースでは詳細タブを使用する必要はありませんが、残りの 1% のために以下の設定を使用できます：
- **カスタム接続パラメータ**。デフォルトでは `socket_timeout` が既に指定されています。このパラメータは、一部の抽出が非常に長い時間更新される場合に変更する必要があるかもしれません。このパラメータの値はミリ秒単位で指定されます。他のパラメータについては [こちら](https://github.com/ClickHouse/clickhouse-jdbc/blob/master/clickhouse-client/src/main/java/com/clickhouse/client/config/ClickHouseClientOption.java) で確認し、カンマで区切ってこのフィールドに追加してください。
- **JDBC ドライバ custom_http_params**。このフィールドでは、ClickHouse 接続文字列にいくつかのパラメータを追加することができます。[`custom_http_params` パラメータに値を渡す](https://github.com/ClickHouse/clickhouse-jdbc#configuration)ことで実現します。例えば、*Set Session ID* チェックボックスが有効になっている場合、`session_id` はこのように指定されます。
- **JDBC ドライバ `typeMappings`**。このフィールドでは、[ClickHouse のデータ型マッピングを JDBC ドライバで使用する Java データ型のリストとして渡すことができます](https://github.com/ClickHouse/clickhouse-jdbc#configuration)。このパラメータのおかげで、コネクタは大きな整数を文字列として自動的に表示しますが、このマッピングセットを渡すことで変更できます *(理由はわかりません)*。
    ```text
    UInt256=java.lang.Double,Int256=java.lang.Double
    ```
  マッピングの詳細については、該当するセクションを参照してください。

- **JDBC ドライバ URL パラメータ**。残りの [ドライバパラメータ](https://github.com/ClickHouse/clickhouse-jdbc#configuration)、例えば `jdbcCompliance` をこのフィールドに渡すことができます。注意してください。パラメータの値は URL エンコード形式で渡す必要があり、`custom_http_params` または `typeMappings` をこのフィールドと詳細タブの前のフィールドに渡す場合、詳細タブの両方の先行フィールドの値が優先されます。
- **Set Session ID** チェックボックス。これは初期 SQL タブでセッションレベルの設定を行うために必要で、タイムスタンプと擬似乱数を持つ `session_id` を `"tableau-jdbc-connector-*{timestamp}*-*{number}*"` という形式で生成します。
## UInt64、Int128、(U)Int256 データ型のサポートを制限 {#limited-support-for-uint64-int128-uint256-data-types}
デフォルトでは、ドライバは *UInt64、Int128、(U)Int256* 型のフィールドを文字列として表示しますが、**表示するだけで変換はしません**。これは、次の計算フィールドを記述しようとするとエラーが発生することを意味します。
```text
LEFT([myUInt256], 2) // エラー！
```
大きな整数フィールドを文字列として扱うには、フィールドを STR() 関数で明示的にラップする必要があります。

```text
LEFT(STR([myUInt256]), 2) // 正常に動作します！
```

しかし、そのようなフィールドは大抵、ユニークな値の数を見つけるために使用されます *(Watch ID や Visit ID などの ID、Yandex.Metrica における)* または視覚化の詳細を指定する *Dimension* として使用され、正常に機能します。

```text
COUNTD([myUInt256]) // こちらも正常に動作します！
```
UInt64 フィールドを持つテーブルのデータプレビュー（データの表示）を使用する際、エラーは今は表示されません。
