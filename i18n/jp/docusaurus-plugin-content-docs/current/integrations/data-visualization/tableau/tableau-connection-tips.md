---
sidebar_label: '接続のヒント'
sidebar_position: 3
slug: /integrations/tableau/connection-tips
keywords: ['clickhouse', 'tableau', 'online', 'mysql', 'connect', 'integrate', 'ui']
description: 'ClickHouse 公式コネクタ使用時の Tableau への接続に関するヒント。'
title: '接続のヒント'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
---

import Image from '@theme/IdealImage';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 接続のヒント \{#connection-tips\}

<ClickHouseSupportedBadge/>

## Initial SQL タブ \{#initial-sql-tab\}

Advanced タブで *Set Session ID* チェックボックスが有効になっている場合（デフォルトの設定）、セッションレベルの [settings](/operations/settings/settings/) を次のように設定できます

```text
SET my_setting=value;
```


## 詳細タブ \{#advanced-tab\}

99% のケースでは「詳細」タブは不要ですが、残りの 1% のケースでは次の設定を利用できます。

- **Custom Connection Parameters**。デフォルトでは `socket_timeout` がすでに指定されていますが、一部の抽出の更新に非常に長い時間がかかる場合、このパラメータを変更する必要があるかもしれません。このパラメータの値はミリ秒単位で指定します。その他のパラメータは[こちら](https://github.com/ClickHouse/clickhouse-jdbc/blob/master/clickhouse-client/src/main/java/com/clickhouse/client/config/ClickHouseClientOption.java)で確認でき、カンマ区切りでこのフィールドに追加します
- **JDBC Driver custom_http_params**。このフィールドでは、[ドライバの `custom_http_params` パラメータ](https://github.com/ClickHouse/clickhouse-jdbc#configuration)に値を渡すことで、ClickHouse 接続文字列にパラメータを追加できます。たとえば、*Set Session ID* チェックボックスを有効にしたときには、この方法で `session_id` が指定されます
- **JDBC Driver `typeMappings`**。このフィールドでは、[JDBC ドライバが使用する Java データ型への ClickHouse データ型のマッピング一覧を渡す](https://github.com/ClickHouse/clickhouse-jdbc#configuration)ことができます。コネクタは、このパラメータのおかげで大きな整数値を自動的に文字列として扱いますが、次のようにマッピングの Set（*理由はよく分かりません*）を渡すことで変更できます
    ```text
    UInt256=java.lang.Double,Int256=java.lang.Double
    ```
  マッピングの詳細については、対応するセクションを参照してください

- **JDBC Driver URL Parameters**。このフィールドでは、例えば `jdbcCompliance` などの[残りのドライバパラメータ](https://github.com/ClickHouse/clickhouse-jdbc#configuration)を渡すことができます。注意点として、パラメータ値は URL エンコード形式で渡す必要があります。また、このフィールドと詳細タブ内の前のフィールドで `custom_http_params` や `typeMappings` を渡した場合、詳細タブの先頭 2 つのフィールドの値の方が優先されます
- **Set Session ID** チェックボックス。Initial SQL タブでセッションレベルの設定を行うために必要で、`"tableau-jdbc-connector-*{timestamp}*-*{number}*"` という形式で、タイムスタンプと疑似乱数からなる `session_id` を生成します

## UInt64、Int128、(U)Int256 データ型のサポートの制限 \{#limited-support-for-uint64-int128-uint256-data-types\}

デフォルトでは、ドライバーは *UInt64, Int128, (U)Int256* 型のフィールドを文字列として表示しますが、**変換は行わず表示するだけ**です。これは、次のような計算フィールドを書き込もうとするとエラーが発生することを意味します

```text
LEFT([myUInt256], 2) // Error!
```

大きな整数型フィールドを文字列と同様に扱うには、そのフィールドを明示的に `STR()` 関数でラップする必要があります。

```text
LEFT(STR([myUInt256]), 2) // Works well!
```

しかし、このようなフィールドは、主にユニークな値の数を取得するため（*Yandex.Metrica における Watch ID や Visit ID といった ID*）や、可視化の詳細度を指定するための *Dimension* として使用され、その用途であれば問題なく利用できます。

```text
COUNTD([myUInt256]) // Works well too!
```

UInt64 フィールドを含むテーブルのデータプレビュー（View data）を使用しても、エラーは発生しなくなりました。
