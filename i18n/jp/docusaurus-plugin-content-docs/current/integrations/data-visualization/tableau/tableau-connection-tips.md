---
sidebar_label: '接続のヒント'
sidebar_position: 3
slug: /integrations/tableau/connection-tips
keywords: ['clickhouse', 'tableau', 'オンライン', 'mysql', '接続', '統合', 'ui']
description: 'ClickHouse公式コネクタを使用する際のTableau接続のヒント。'
title: '接続のヒント'
---

import Image from '@theme/IdealImage';


# 接続のヒント
## 初期SQLタブ {#initial-sql-tab}
*セッションIDの設定* チェックボックスがAdvancedタブで有効になっている場合（デフォルトでは有効）、セッションレベルの [settings](/operations/settings/settings/) を以下のように設定できます。
```text
SET my_setting=value;
``` 
## 高度なタブ {#advanced-tab}

99%の場合、高度なタブは必要ありません。残りの1%の場合は、以下の設定を使用できます：
- **カスタム接続パラメータ**。デフォルトでは `socket_timeout` が指定されており、このパラメータは一部の抽出が非常に長い時間更新される場合に変更が必要です。このパラメータの値はミリ秒で指定されます。他のパラメータは [こちら](https://github.com/ClickHouse/clickhouse-jdbc/blob/master/clickhouse-client/src/main/java/com/clickhouse/client/config/ClickHouseClientOption.java) で見つけられ、このフィールドにカンマ区切りで追加します。
- **JDBCドライバの custom_http_params**。このフィールドでは、ClickHouse接続文字列にいくつかのパラメータを投げ入れることができます。値を [ドライバの `custom_http_params` パラメータ](https://github.com/ClickHouse/clickhouse-jdbc#configuration) として渡します。例えば、*セッションIDの設定* チェックボックスが有効な場合、`session_id` はこのように指定されます。
- **JDBCドライバの `typeMappings`**。このフィールドでは、[ClickHouseデータ型をJDBCドライバで使用されるJavaデータ型へのマッピングリストを渡すことができます](https://github.com/ClickHouse/clickhouse-jdbc#configuration)。このパラメータのおかげでコネクタは大きな整数を文字列として自動的に表示しますが、自分のマッピングセットを渡すことで変更できます *(なぜか分かりません)*。
    ```text
    UInt256=java.lang.Double,Int256=java.lang.Double
    ```
  マッピングについての詳細は、該当セクションで読むことができます。

- **JDBCドライバのURLパラメータ**。残りの [ドライバパラメータ](https://github.com/ClickHouse/clickhouse-jdbc#configuration) を、このフィールドで渡すことができます。例えば `jdbcCompliance` です。注意してください。パラメータの値はURLエンコーディング形式で渡す必要があります。また、高度なタブの前のフィールドに `custom_http_params` または `typeMappings` を渡す場合、高度なタブの前の2つのフィールドの値が優先されます。
- **セッションIDの設定** チェックボックス。このオプションは、初期SQLタブでセッションレベルの設定を行うために必要で、タイムスタンプと擬似乱数を含む`session_id`を生成します。フォーマットは`"tableau-jdbc-connector-*{timestamp}*-*{number}*"`です。
## UInt64、Int128、(U)Int256データ型に対する制限されたサポート {#limited-support-for-uint64-int128-uint256-data-types}
デフォルトでは、ドライバは *UInt64、Int128、(U)Int256* 型のフィールドを文字列として表示しますが、**表示するだけで変換はしません**。これにより、次の計算フィールドを記述しようとするとエラーが発生します。
```text
LEFT([myUInt256], 2) // エラー！
```
大きな整数フィールドを文字列として扱うためには、フィールドをSTR()関数で明示的にラップする必要があります。

```text
LEFT(STR([myUInt256]), 2) // 正常に動作！
```

しかし、このようなフィールドは最も一般的に、一意の値の数を見つけるために使用されます *(Watch IDやVisit IDなどがYandex.MetricaにおけるID)* または可視化の詳細を指定するための *Dimension* として使用され、うまく機能します。

```text
COUNTD([myUInt256]) // これも正常に動作！
```
UInt64フィールドを持つテーブルのデータプレビュー（データを表示）を使用する際にも、エラーは表示されません。
