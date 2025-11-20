---
sidebar_label: 'QuickSight'
slug: /integrations/quicksight
keywords: ['clickhouse', 'aws', 'amazon', 'QuickSight', 'mysql', 'connect', 'integrate', 'ui']
description: 'Amazon QuickSight は、統合されたビジネスインテリジェンス (BI) により、データドリブンな組織の意思決定を支援します。'
title: 'QuickSight'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
---

import MySQLOnPremiseSetup from '@site/docs/_snippets/_clickhouse_mysql_on_premise_setup.mdx';
import Image from '@theme/IdealImage';
import quicksight_01 from '@site/static/images/integrations/data-visualization/quicksight_01.png';
import quicksight_02 from '@site/static/images/integrations/data-visualization/quicksight_02.png';
import quicksight_03 from '@site/static/images/integrations/data-visualization/quicksight_03.png';
import quicksight_04 from '@site/static/images/integrations/data-visualization/quicksight_04.png';
import quicksight_05 from '@site/static/images/integrations/data-visualization/quicksight_05.png';
import quicksight_06 from '@site/static/images/integrations/data-visualization/quicksight_06.png';
import quicksight_07 from '@site/static/images/integrations/data-visualization/quicksight_07.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# QuickSight

<ClickHouseSupportedBadge/>

QuickSight は、公式の MySQL データソースと Direct Query モードを使用することで、MySQL インターフェイス経由でオンプレミス環境の ClickHouse (バージョン 23.11 以降) に接続できます。



## オンプレミスClickHouseサーバーのセットアップ {#on-premise-clickhouse-server-setup}

MySQLインターフェースを有効にしたClickHouseサーバーのセットアップ方法については、[公式ドキュメント](/interfaces/mysql)を参照してください。

サーバーの`config.xml`にエントリを追加するだけでなく

```xml
<clickhouse>
    <mysql_port>9004</mysql_port>
</clickhouse>
```

MySQLインターフェースを使用するユーザーには、[Double SHA1パスワード暗号化](/operations/settings/settings-users#user-namepassword)の使用も_必須_となります。

シェルからDouble SHA1で暗号化されたランダムパスワードを生成する方法:

```shell
PASSWORD=$(base64 < /dev/urandom | head -c16); echo "$PASSWORD"; echo -n "$PASSWORD" | sha1sum | tr -d '-' | xxd -r -p | sha1sum | tr -d '-'
```

出力は以下のようになります:

```text
LZOQYnqQN4L/T6L0
fbc958cc745a82188a51f30de69eebfc67c40ee4
```

1行目が生成されたパスワードで、2行目がClickHouseの設定に使用するハッシュです。

生成されたハッシュを使用した`mysql_user`の設定例を以下に示します:

`/etc/clickhouse-server/users.d/mysql_user.xml`

```xml
<users>
    <mysql_user>
        <password_double_sha1_hex>fbc958cc745a82188a51f30de69eebfc67c40ee4</password_double_sha1_hex>
        <networks>
            <ip>::/0</ip>
        </networks>
        <profile>default</profile>
        <quota>default</quota>
    </mysql_user>
</users>
```

`password_double_sha1_hex`エントリを、ご自身で生成したDouble SHA1ハッシュに置き換えてください。

QuickSightでは、MySQLユーザーのプロファイルにいくつかの追加設定が必要です。

`/etc/clickhouse-server/users.d/mysql_user.xml`

```xml
<profiles>
    <default>
        <prefer_column_name_to_alias>1</prefer_column_name_to_alias>
        <mysql_map_string_to_text_in_show_columns>1</mysql_map_string_to_text_in_show_columns>
        <mysql_map_fixed_string_to_text_in_show_columns>1</mysql_map_fixed_string_to_text_in_show_columns>
    </default>
</profiles>
```

ただし、デフォルトのプロファイルではなく、MySQLユーザー専用の別のプロファイルに割り当てることを推奨します。

最後に、ClickHouseサーバーが目的のIPアドレスでリッスンするように設定します。
`config.xml`で、すべてのアドレスでリッスンするには以下の行のコメントを解除してください:

```bash
<listen_host>::</listen_host>
```

`mysql`バイナリが利用可能な場合、コマンドラインから接続をテストできます。
上記のサンプルユーザー名（`mysql_user`）とパスワード（`LZOQYnqQN4L/T6L0`）を使用する場合、コマンドラインは以下のようになります:

```bash
mysql --protocol tcp -h localhost -u mysql_user -P 9004 --password=LZOQYnqQN4L/T6L0
```

```response
mysql> show databases;
+--------------------+
| name               |
+--------------------+
| INFORMATION_SCHEMA |
| default            |
| information_schema |
| system             |
+--------------------+
4 rows in set (0.00 sec)
Read 4 rows, 603.00 B in 0.00156 sec., 2564 rows/sec., 377.48 KiB/sec.
```


## QuickSightをClickHouseに接続する {#connecting-quicksight-to-clickhouse}

まず、[https://quicksight.aws.amazon.com](https://quicksight.aws.amazon.com)にアクセスし、Datasetsに移動して「New dataset」をクリックします:

<Image
  size='md'
  img={quicksight_01}
  alt='DatasetsセクションのNew datasetボタンが表示されているAmazon QuickSightダッシュボード'
  border
/>
<br />

QuickSightにバンドルされている公式MySQLコネクタ(名称は**MySQL**)を検索します:

<Image
  size='md'
  img={quicksight_02}
  alt='検索結果でMySQLがハイライトされているQuickSightデータソース選択画面'
  border
/>
<br />

接続の詳細を指定します。MySQLインターフェースのポートはデフォルトで9004ですが、サーバー構成によって異なる場合があることに注意してください。

<Image
  size='md'
  img={quicksight_03}
  alt='ホスト名、ポート、データベース、認証情報フィールドを含むQuickSight MySQL接続設定フォーム'
  border
/>
<br />

ClickHouseからデータを取得する方法には2つのオプションがあります。1つ目は、リストからテーブルを選択する方法です:

<Image
  size='md'
  img={quicksight_04}
  alt='ClickHouseから利用可能なデータベーステーブルが表示されているQuickSightテーブル選択インターフェース'
  border
/>
<br />

もう1つは、カスタムSQLを指定してデータを取得する方法です:

<Image
  size='md'
  img={quicksight_05}
  alt='ClickHouseからデータを取得するためのQuickSightカスタムSQLクエリエディタ'
  border
/>
<br />

「Edit/Preview data」をクリックすると、解析されたテーブル構造を確認したり、カスタムSQLでデータにアクセスする場合はそれを調整したりできます:

<Image
  size='md'
  img={quicksight_06}
  alt='カラムとサンプルデータを含むテーブル構造が表示されているQuickSightデータプレビュー'
  border
/>
<br />

UIの左下隅で「Direct Query」モードが選択されていることを確認してください:

<Image
  size='md'
  img={quicksight_07}
  alt='下隅でDirect QueryモードオプションがハイライトされているQuickSightインターフェース'
  border
/>
<br />

これで、データセットを公開して新しいビジュアライゼーションを作成できます!


## 既知の制限事項 {#known-limitations}

- SPICEインポートは正常に動作しません。代わりにDirect Queryモードをご使用ください。詳細は[#58553](https://github.com/ClickHouse/ClickHouse/issues/58553)を参照してください。
