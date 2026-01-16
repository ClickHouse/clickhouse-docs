---
sidebar_label: '接続のヒント'
sidebar_position: 3
slug: /integrations/tableau/connection-tips
keywords: ['clickhouse', 'tableau', 'online', 'mysql', 'connect', 'integrate', 'ui']
description: 'ClickHouse 公式コネクタ使用時の Tableau 接続に関するヒント。'
title: '接続のヒント'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
---

import Image from '@theme/IdealImage';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# 接続に関するヒント \{#connection-tips\}

<ClickHouseSupportedBadge/>

## 初期 SQL タブ \\{#initial-sql-tab\\}

[詳細設定] タブで *Set Session ID* チェックボックスが有効になっている場合（デフォルト）、次を使用してセッションレベルの [設定](/operations/settings/settings/) を行うことができます。

```text
SET my_setting=value;
```


## 詳細タブ \\{#advanced-tab\\}

99% のケースでは詳細タブを使用する必要はありませんが、残りの 1% では次の設定を使用できます:

- **Custom Connection Parameters**。デフォルトでは `socket_timeout` がすでに指定されていますが、一部の抽出処理の更新に非常に長い時間がかかる場合、このパラメータを変更する必要があるかもしれません。このパラメータの値はミリ秒単位で指定します。その他のパラメータは[こちら](https://github.com/ClickHouse/clickhouse-jdbc/blob/master/clickhouse-client/src/main/java/com/clickhouse/client/config/ClickHouseClientOption.java)で確認でき、それらをカンマ区切りでこのフィールドに追加します。
- **JDBC Driver custom_http_params**。このフィールドでは、[ドライバーの `custom_http_params` パラメータ](https://github.com/ClickHouse/clickhouse-jdbc#configuration) に値を渡すことで、いくつかのパラメータを ClickHouse の接続文字列に埋め込むことができます。たとえば、*Set Session ID* チェックボックスが有効な場合、`session_id` はこのように指定されます。
- **JDBC Driver `typeMappings`**。このフィールドでは、[JDBC ドライバーが使用する Java データ型に対する ClickHouse データ型のマッピング一覧を渡すことができます](https://github.com/ClickHouse/clickhouse-jdbc#configuration)。このパラメータのおかげで、コネクタは大きな整数値を自動的に文字列として扱いますが、独自のマッピングセットを渡すことで（なぜそうしたいのかはわかりませんが）、これを変更できます。たとえば次のように指定します:
    ```text
    UInt256=java.lang.Double,Int256=java.lang.Double
    ```
  マッピングについての詳細は、該当するセクションを参照してください。

- **JDBC Driver URL Parameters**。このフィールドでは、残りの[ドライバーパラメータ](https://github.com/ClickHouse/clickhouse-jdbc#configuration)、たとえば `jdbcCompliance` を渡すことができます。注意点として、パラメータ値は URL エンコードされた形式で渡す必要があります。また、このフィールドと Advanced タブ内の前のフィールドの両方で `custom_http_params` または `typeMappings` を指定した場合は、Advanced タブ上の前 2 つのフィールドの値のほうが優先されます。
- **Set Session ID** チェックボックス。Initial SQL タブでセッションレベルの設定を行うために必要なもので、`"tableau-jdbc-connector-*{timestamp}*-*{number}*"` という形式で、タイムスタンプと疑似乱数を含む `session_id` を生成します。

## UInt64, Int128, (U)Int256 データ型のサポート制限 \\{#limited-support-for-uint64-int128-uint256-data-types\\}

デフォルトでは、ドライバーは *UInt64, Int128, (U)Int256* 型のフィールドを文字列として表示するだけで、**変換は行いません**。そのため、次のような計算フィールドを作成しようとすると、エラーが発生します。

```text
LEFT([myUInt256], 2) // Error!
```

大きな整数型フィールドを文字列として扱うには、そのフィールドを明示的に STR() 関数でラップする必要があります。

```text
LEFT(STR([myUInt256]), 2) // Works well!
```

しかし、この種のフィールドは、多くの場合、ユニークな値の数を求めるため *(Yandex.Metrica における Watch ID や Visit ID などの ID)* や、可視化の粒度を指定する *Dimension* として使用されるため、そのような用途では問題なく機能します。

```text
COUNTD([myUInt256]) // Works well too!
```

UInt64 フィールドを含むテーブルでデータプレビュー（View Data）を使用しても、エラーは発生しなくなりました。
