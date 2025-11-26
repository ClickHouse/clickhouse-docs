---
sidebar_label: 'QuickSight'
slug: /integrations/quicksight
keywords: ['clickhouse', 'aws', 'amazon', 'QuickSight', 'mysql', 'connect', 'integrate', 'ui']
description: 'Amazon QuickSight は、統合型ビジネスインテリジェンス (BI) により、データドリブンな組織を支援します。'
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

QuickSight は、公式の MySQL データソースと Direct Query モードを使用することで、MySQL インターフェイス経由でオンプレミス環境の ClickHouse（23.11 以降）に接続できます。



## オンプレミス ClickHouse サーバーのセットアップ

MySQL インターフェイスを有効にした ClickHouse サーバーのセットアップ方法については、[公式ドキュメント](/interfaces/mysql) を参照してください。

サーバーの `config.xml` に設定項目を追加することに加えて

```xml
<clickhouse>
    <mysql_port>9004</mysql_port>
</clickhouse>
```

MySQL インターフェイスを利用するユーザーには、[Double SHA1 password encryption](/operations/settings/settings-users#user-namepassword) の使用も*必須*です。

シェルから Double SHA1 で暗号化されたランダムなパスワードを生成するには、次のようにします。

```shell
PASSWORD=$(base64 < /dev/urandom | head -c16); echo "$PASSWORD"; echo -n "$PASSWORD" | sha1sum | tr -d '-' | xxd -r -p | sha1sum | tr -d '-'
```

出力は以下のようになります。

```text
LZOQYnqQN4L/T6L0
fbc958cc745a82188a51f30de69eebfc67c40ee4
```

1 行目が生成されたパスワードで、2 行目が ClickHouse の設定に使用できるハッシュです。

以下は、生成されたハッシュを使用する `mysql_user` の設定例です。

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

`password_double_sha1_hex` エントリを、生成した Double SHA1 ハッシュ値に置き換えてください。

QuickSight では、MySQL ユーザーのプロファイルにいくつかの追加設定が必要です。

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

ただし、デフォルトのプロファイルではなく、その MySQL ユーザーが使用できる別のプロファイルを割り当てることを推奨します。

最後に、ClickHouse Server が目的の IP アドレスで待ち受けるように設定します。
`config.xml` で、すべてのアドレスで待ち受けるようにするには、次の設定のコメントを解除します：

```bash
<listen_host>::</listen_host>
```

`mysql` バイナリが利用可能な場合は、コマンドラインから接続をテストできます。
上記のサンプルのユーザー名（`mysql_user`）とパスワード（`LZOQYnqQN4L/T6L0`）を使用した場合、実行するコマンドは次のとおりです。

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


## QuickSight を ClickHouse に接続する {#connecting-quicksight-to-clickhouse}

まず [https://quicksight.aws.amazon.com](https://quicksight.aws.amazon.com) にアクセスし、Datasets セクションに移動して「New dataset」をクリックします。

<Image size="md" img={quicksight_01} alt="Datasets セクションで New dataset ボタンが表示されている Amazon QuickSight ダッシュボード" border />
<br/>

QuickSight にバンドルされている公式の MySQL コネクタ（名前は **MySQL** のみ）を検索します。

<Image size="md" img={quicksight_02} alt="検索結果で MySQL がハイライトされている QuickSight のデータソース選択画面" border />
<br/>

接続情報を入力します。MySQL インターフェイスのポートはデフォルトで 9004 ですが、
サーバー構成によっては異なる場合がある点に注意してください。

<Image size="md" img={quicksight_03} alt="ホスト名、ポート、データベース、認証情報のフィールドがある QuickSight の MySQL 接続設定フォーム" border />
<br/>

ここで、ClickHouse からデータを取得する方法として 2 つの選択肢があります。1 つ目は、リストからテーブルを選択する方法です。

<Image size="md" img={quicksight_04} alt="ClickHouse から利用可能なデータベーステーブルが表示されている QuickSight のテーブル選択インターフェイス" border />
<br/>

もう 1 つの方法は、カスタム SQL を指定してデータを取得することです。

<Image size="md" img={quicksight_05} alt="ClickHouse からデータを取得するための QuickSight のカスタム SQL クエリエディタ" border />
<br/>

「Edit/Preview data」をクリックすると、自動検出されたテーブル構造を確認したり、データへのアクセス方法としてカスタム SQL を選択した場合はその内容を調整したりできます。

<Image size="md" img={quicksight_06} alt="カラムとサンプルデータを含むテーブル構造が表示されている QuickSight のデータプレビュー" border />
<br/>

UI の左下隅で「Direct Query」モードが選択されていることを確認してください。

<Image size="md" img={quicksight_07} alt="左下隅で Direct Query モードのオプションがハイライトされている QuickSight インターフェイス" border />
<br/>

これで、データセットを公開して新しいビジュアライゼーションを作成できます。



## 既知の制限事項 {#known-limitations}

- SPICE インポートは期待どおりに動作しません。代わりに Direct Query モードを使用してください。[#58553](https://github.com/ClickHouse/ClickHouse/issues/58553) を参照してください。
