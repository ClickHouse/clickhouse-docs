---
sidebar_label: '接続のヒント'
sidebar_position: 3
slug: /integrations/tableau/connection-tips
keywords: ['clickhouse', 'tableau', 'online', 'mysql', 'connect', 'integrate', 'ui']
description: 'ClickHouse 公式コネクタ使用時の Tableau 接続に関するヒント。'
title: '接続のヒント'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 接続に関するヒント

<ClickHouseSupportedBadge/>



## 初期 SQL タブ

[詳細設定] タブで *Set Session ID* チェックボックスが有効になっている場合（デフォルト）、次を使用してセッションレベルの [設定](/operations/settings/settings/) を行うことができます。

```text
SET my_setting=value;
```


## 詳細タブ {#advanced-tab}

99% のケースでは詳細タブを使用する必要はありませんが、残りの 1% では次の設定を使用できます:
- **Custom Connection Parameters**。デフォルトでは `socket_timeout` がすでに指定されていますが、一部の抽出処理の更新に非常に長い時間がかかる場合、このパラメータを変更する必要があるかもしれません。このパラメータの値はミリ秒単位で指定します。その他のパラメータは[こちら](https://github.com/ClickHouse/clickhouse-jdbc/blob/master/clickhouse-client/src/main/java/com/clickhouse/client/config/ClickHouseClientOption.java)で確認でき、それらをカンマ区切りでこのフィールドに追加します。
- **JDBC Driver custom_http_params**。このフィールドでは、[ドライバーの `custom_http_params` パラメータ](https://github.com/ClickHouse/clickhouse-jdbc#configuration) に値を渡すことで、いくつかのパラメータを ClickHouse の接続文字列に埋め込むことができます。たとえば、*Set Session ID* チェックボックスが有効な場合、`session_id` はこのように指定されます。
- **JDBC Driver `typeMappings`**。このフィールドでは、[JDBC ドライバーが使用する Java データ型に対する ClickHouse データ型のマッピング一覧を渡すことができます](https://github.com/ClickHouse/clickhouse-jdbc#configuration)。このパラメータのおかげで、コネクタは大きな整数値を自動的に文字列として扱いますが、独自のマッピングセットを渡すことで（なぜそうしたいのかはわかりませんが）、これを変更できます。たとえば次のように指定します:
    ```text
    UInt256=java.lang.Double,Int256=java.lang.Double
    ```
  マッピングについての詳細は、該当するセクションを参照してください。



* **JDBC Driver URL Parameters**。このフィールドには、`jdbcCompliance` などの残りの[ドライバーパラメータ](https://github.com/ClickHouse/clickhouse-jdbc#configuration)を指定できます。パラメータ値は URL エンコード形式で渡す必要がある点に注意してください。また、このフィールドと Advanced タブ内の前のフィールドの両方で `custom_http_params` や `typeMappings` を指定した場合は、Advanced タブ側の前の 2 つのフィールドで指定した値が優先されます。
* **Set Session ID** チェックボックス。Initial SQL タブでセッションレベルの設定を行うために必要であり、`"tableau-jdbc-connector-*{timestamp}*-*{number}*"` という形式で、タイムスタンプと疑似乱数を含む `session_id` を生成します。

## UInt64, Int128, (U)Int256 データ型のサポート制限

デフォルトでは、ドライバーは *UInt64, Int128, (U)Int256* 型のフィールドを文字列として表示するだけで、**変換は行いません**。そのため、次のような計算フィールドを作成しようとすると、エラーが発生します。

```text
LEFT([myUInt256], 2) // Error!
```

大きな整数型フィールドを文字列として扱うには、そのフィールドを明示的にSTR() 関数で囲む必要があります

```text
LEFT(STR([myUInt256]), 2) // 正常に動作します
```

しかし、この種のフィールドは、多くの場合、ユニークな値の数を求めるため *(Yandex.Metrica における Watch ID や Visit ID などの ID)* や、可視化の詳細度を指定する *Dimension* として使用されるため、そのような用途では問題なく機能します。

```text
COUNTD([myUInt256]) // これも問題なく動作します!
```

UInt64 フィールドを含むテーブルのデータプレビュー（View data）を使用しても、エラーは発生しなくなりました。
