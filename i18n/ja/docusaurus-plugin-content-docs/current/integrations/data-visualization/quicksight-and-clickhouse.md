---
sidebar_label: QuickSight
slug: /integrations/quicksight
keywords: [clickhouse, aws, amazon, QuickSight, mysql, connect, integrate, ui]
description: Amazon QuickSight は、統一されたビジネスインテリジェンス (BI) によってデータ駆動型の組織をサポートします。
---

import MySQLOnPremiseSetup from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_clickhouse_mysql_on_premise_setup.mdx';

# QuickSight

QuickSight は、公式の MySQL データソースと Direct Query モードを使用して、オンプレミスの ClickHouse セットアップ (23.11+) に MySQL インターフェース経由で接続できます。

## オンプレミス ClickHouse サーバーのセットアップ {#on-premise-clickhouse-server-setup}

ClickHouse サーバーを MySQL インターフェースで設定する方法については、[公式ドキュメント](/interfaces/mysql) を参照してください。

サーバーの `config.xml` にエントリを追加することに加えて、

```xml
<clickhouse>
    <mysql_port>9004</mysql_port>
</clickhouse>
```

MySQL インターフェースを使用するユーザーには [Double SHA1 パスワード暗号化](/operations/settings/settings-users#user-namepassword) を使用することが _必要_ です。

シェルから Double SHA1 で暗号化されたランダムパスワードを生成するコマンド:

```shell
PASSWORD=$(base64 < /dev/urandom | head -c16); echo "$PASSWORD"; echo -n "$PASSWORD" | sha1sum | tr -d '-' | xxd -r -p | sha1sum | tr -d '-'
```

出力は次のようになります:

```text
LZOQYnqQN4L/T6L0
fbc958cc745a82188a51f30de69eebfc67c40ee4
```

最初の行は生成されたパスワードで、2 番目の行は ClickHouse を構成するために使用できるハッシュです。

以下は、生成されたハッシュを使用した `mysql_user` の構成例です。

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

`password_double_sha1_hex` エントリを生成した Double SHA1 ハッシュに置き換えます。

QuickSight には、MySQL ユーザーのプロファイルにいくつかの追加設定が必要です。

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

ただし、デフォルトではなく、MySQL ユーザーが使用できる別のプロファイルに割り当てることをお勧めします。

最後に、Clickhouse サーバーが希望する IP アドレスでリッスンするように構成します。 
`config.xml` で、すべてのアドレスでリッスンするように以下の行のコメントを外します:

```bash
<listen_host>::</listen_host> 
```

`mysql` バイナリが利用可能な場合、コマンドラインから接続をテストできます。
上記のサンプルユーザー名 (`mysql_user`) とパスワード (`LZOQYnqQN4L/T6L0`) を使った場合、コマンドラインは次のようになります:

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

まず、https://quicksight.aws.amazon.com にアクセスし、データセットに移動して「新しいデータセット」をクリックしてください:

<img src={require('./images/quicksight_01.png').default} class="image" alt="新しいデータセットの作成" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

QuickSight にバンドルされている公式の MySQL コネクタ (単に **MySQL** と呼ばれる) を検索してください:

<img src={require('./images/quicksight_02.png').default} class="image" alt="MySQL コネクタの検索" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

接続の詳細を指定します。MySQL インターフェースポートはデフォルトで 9004 ですが、サーバー設定によって異なる場合があります。

<img src={require('./images/quicksight_03.png').default} class="image" alt="接続の詳細の指定" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

今、ClickHouse からデータを取得する方法は2つのオプションがあります。最初に、リストからテーブルを選択することができます:

<img src={require('./images/quicksight_04.png').default} class="image" alt="リストからテーブルを選択する" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

または、カスタム SQL を指定してデータを取得することもできます:

<img src={require('./images/quicksight_05.png').default} class="image" alt="カスタム SQL を使用してデータを取得する" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

「データを編集/プレビュー」ボタンをクリックすると、テーブル構造のインスペクションを確認したり、カスタム SQL を調整したりできます。これはデータにアクセスするための方法です:

<img src={require('./images/quicksight_06.png').default} class="image" alt="インスペクションされたテーブル構造の表示" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

UI の左下隅で「Direct Query」モードが選択されていることを確認してください:

<img src={require('./images/quicksight_07.png').default} class="image" alt="Direct Query モードの選択" style={{width: '50%', 'background-color': 'transparent'}}/>  
<br/>                                                                                                      

これで、データセットを公開し、新しいビジュアルを作成できます！

## 知られている制限 {#known-limitations}

- SPICE インポートは期待通りに動作しません。代わりに Direct Query モードを使用してください。詳細は [#58553](https://github.com/ClickHouse/ClickHouse/issues/58553) を参照してください。
