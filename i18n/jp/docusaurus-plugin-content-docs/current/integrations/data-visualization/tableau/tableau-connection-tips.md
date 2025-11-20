---
sidebar_label: '接続のヒント'
sidebar_position: 3
slug: /integrations/tableau/connection-tips
keywords: ['clickhouse', 'tableau', 'online', 'mysql', 'connect', 'integrate', 'ui']
description: 'ClickHouse 公式コネクタ使用時の Tableau への接続に関するヒント。'
title: '接続のヒント'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 接続のコツ

<ClickHouseSupportedBadge/>



## Initial SQLタブ {#initial-sql-tab}

Advancedタブで_Set Session ID_チェックボックスが有効になっている場合（デフォルト）、次のようにしてセッションレベルの[設定](/operations/settings/settings/)を設定できます。

```text
SET my_setting=value;
```


## Advancedタブ {#advanced-tab}

99%のケースではAdvancedタブは不要ですが、残りの1%のケースでは以下の設定を使用できます:

- **Custom Connection Parameters**. デフォルトでは`socket_timeout`が既に指定されています。一部の抽出処理の更新に非常に長い時間がかかる場合は、このパラメータの変更が必要になることがあります。このパラメータの値はミリ秒単位で指定します。その他のパラメータは[こちら](https://github.com/ClickHouse/clickhouse-jdbc/blob/master/clickhouse-client/src/main/java/com/clickhouse/client/config/ClickHouseClientOption.java)で確認でき、このフィールドにカンマ区切りで追加できます
- **JDBC Driver custom_http_params**. このフィールドを使用すると、[ドライバの`custom_http_params`パラメータ](https://github.com/ClickHouse/clickhouse-jdbc#configuration)に値を渡すことで、ClickHouse接続文字列にパラメータを追加できます。例えば、_Set Session ID_チェックボックスが有効化されている場合、このように`session_id`が指定されます
- **JDBC Driver `typeMappings`**. このフィールドを使用すると、[JDBCドライバが使用するClickHouseデータ型とJavaデータ型のマッピングリストを渡す](https://github.com/ClickHouse/clickhouse-jdbc#configuration)ことができます。このパラメータにより、コネクタは大きな整数を自動的に文字列として表示します。独自のマッピングセットを渡すことでこれを変更できます_(理由は不明ですが)_。以下のように指定します:
  ```text
  UInt256=java.lang.Double,Int256=java.lang.Double
  ```
  マッピングの詳細については、対応するセクションをご覧ください


- **JDBC ドライバー URL パラメータ**。このフィールドには、残りの[ドライバーパラメータ](https://github.com/ClickHouse/clickhouse-jdbc#configuration)（例：`jdbcCompliance`）を渡すことができます。注意点として、パラメータ値は URL エンコード形式で渡す必要があります。また、このフィールドと Advanced タブの前のフィールドの両方で `custom_http_params` または `typeMappings` を渡す場合、Advanced タブの前の2つのフィールドの値が優先されます
- **Set Session ID** チェックボックス。Initial SQL タブでセッションレベルの設定を行うために必要です。`"tableau-jdbc-connector-*{timestamp}*-*{number}*"` 形式のタイムスタンプと疑似乱数を含む `session_id` を生成します

## UInt64、Int128、(U)Int256 データ型の限定的なサポート {#limited-support-for-uint64-int128-uint256-data-types}

デフォルトでは、ドライバーは _UInt64、Int128、(U)Int256_ 型のフィールドを文字列として表示しますが、**これは表示であり変換ではありません**。つまり、次のような計算フィールドを記述しようとするとエラーが発生します

```text
LEFT([myUInt256], 2) // エラー!
```

大きな整数フィールドを文字列として扱うには、フィールドを STR() 関数で明示的にラップする必要があります

```text
LEFT(STR([myUInt256]), 2) // 正常に動作します!
```

ただし、このようなフィールドは、一意の値の数を求める（Yandex.Metrica の Watch ID、Visit ID などの ID）ために、または可視化の詳細を指定する _ディメンション_ として使用されることが最も多く、その場合は正常に動作します。

```text
COUNTD([myUInt256]) // これも正常に動作します!
```

UInt64 フィールドを含むテーブルのデータプレビュー（View data）を使用する場合、現在はエラーが表示されません。
