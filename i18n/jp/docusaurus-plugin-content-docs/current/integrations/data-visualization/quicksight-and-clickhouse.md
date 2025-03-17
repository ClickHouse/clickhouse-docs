---
sidebar_label: QuickSight
slug: /integrations/quicksight
keywords: [clickhouse, aws, amazon, QuickSight, mysql, connect, integrate, ui]
description: Amazon QuickSightは、統合されたビジネスインテリジェンス（BI）でデータ駆動型の組織を支えます。
---

import MySQLOnPremiseSetup from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_clickhouse_mysql_on_premise_setup.mdx';
import quicksight_01 from '@site/static/images/integrations/data-visualization/quicksight_01.png';
import quicksight_02 from '@site/static/images/integrations/data-visualization/quicksight_02.png';
import quicksight_03 from '@site/static/images/integrations/data-visualization/quicksight_03.png';
import quicksight_04 from '@site/static/images/integrations/data-visualization/quicksight_04.png';
import quicksight_05 from '@site/static/images/integrations/data-visualization/quicksight_05.png';
import quicksight_06 from '@site/static/images/integrations/data-visualization/quicksight_06.png';
import quicksight_07 from '@site/static/images/integrations/data-visualization/quicksight_07.png';


# QuickSight

QuickSightは、公式のMySQLデータソースとDirect Queryモードを使用して、オンプレミスのClickHouseセットアップ（23.11以上）に接続できます。

## オンプレミスのClickHouseサーバーセットアップ {#on-premise-clickhouse-server-setup}

ClickHouseサーバーをMySQLインターフェースでセットアップする方法については、[公式ドキュメント](/interfaces/mysql)を参照してください。

サーバーの`config.xml`にエントリーを追加することに加え、

```xml
<clickhouse>
    <mysql_port>9004</mysql_port>
</clickhouse>
```

MySQLインターフェースを使用するユーザーに対して[ダブルSHA1パスワード暗号化](/operations/settings/settings-users#user-namepassword)を使用することが**必須**です。

シェルからダブルSHA1で暗号化されたランダムパスワードを生成するには：

```shell
PASSWORD=$(base64 < /dev/urandom | head -c16); echo "$PASSWORD"; echo -n "$PASSWORD" | sha1sum | tr -d '-' | xxd -r -p | sha1sum | tr -d '-'
```

出力は以下のようになります：

```text
LZOQYnqQN4L/T6L0
fbc958cc745a82188a51f30de69eebfc67c40ee4
```

最初の行は生成されたパスワードで、2行目はClickHouseを構成するために使用できるハッシュです。

生成されたハッシュを使用した`mysql_user`の設定例：

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

`password_double_sha1_hex`エントリーを自分の生成したダブルSHA1ハッシュに置き換えます。

QuickSightには、MySQLユーザーのプロファイルにいくつかの追加設定が必要です。

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

ただし、デフォルトのプロファイルではなく、MySQLユーザーが使用できる別のプロファイルに割り当てることをお勧めします。

最後に、Clickhouseサーバーが希望するIPアドレスでリスニングするように構成します。 `config.xml`で、すべてのアドレスをリスニングするために以下のコメントを外します：

```bash
<listen_host>::</listen_host>
```

`mysql`バイナリが利用可能な場合は、コマンドラインから接続をテストできます。
上記のサンプルユーザー名（`mysql_user`）とパスワード（`LZOQYnqQN4L/T6L0`）を使用すると、コマンドラインは以下のようになります：

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

まず最初に、https://quicksight.aws.amazon.com に移動し、「データセット」に移動して「新しいデータセット」をクリックします：

<img src={quicksight_01} class="image" alt="新しいデータセットの作成" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

QuickSightにバンドルされている公式のMySQLコネクタ（単に**MySQL**と呼ばれる）を検索します：

<img src={quicksight_02} class="image" alt="MySQLコネクタの検索" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

接続の詳細を指定します。デフォルトでMySQLインターフェースポートは9004ですので、サーバーの設定によって異なる場合があります。

<img src={quicksight_03} class="image" alt="接続の詳細を指定" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

次に、ClickHouseからデータを取得する方法が2つあります。まず、リストからテーブルを選択できます：

<img src={quicksight_04} class="image" alt="リストからテーブルを選択" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

または、カスタムSQLを指定してデータを取得することもできます：

<img src={quicksight_05} class="image" alt="データを取得するためのカスタムSQLの使用" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

「データを編集/プレビュー」をクリックすると、内包されたテーブル構造を見ることができるか、カスタムSQLを調整できます。データにアクセスする方法を決めた場合です：

<img src={quicksight_06} class="image" alt="内包されたテーブル構造を表示" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

UIの左下隅にある「Direct Query」モードが選択されていることを確認してください：

<img src={quicksight_07} class="image" alt="Direct Queryモードを選択" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

これで、データセットを公開し、新しい視覚化を作成する準備が整いました！

## 既知の制限事項 {#known-limitations}

- SPICEインポートは期待通りに動作しません。代わりにDirect Queryモードを使用してください。[#58553](https://github.com/ClickHouse/ClickHouse/issues/58553)を参照してください。
