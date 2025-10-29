---
'sidebar_label': 'QuickSight'
'slug': '/integrations/quicksight'
'keywords':
- 'clickhouse'
- 'aws'
- 'amazon'
- 'QuickSight'
- 'mysql'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Amazon QuickSight は、統合されたビジネスインテリジェンス (BI) によってデータ駆動型の組織を支援します。'
'title': 'QuickSight'
'doc_type': 'guide'
---

import MySQLOnPremiseSetup from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_clickhouse_mysql_on_premise_setup.mdx';
import Image from '@theme/IdealImage';
import quicksight_01 from '@site/static/images/integrations/data-visualization/quicksight_01.png';
import quicksight_02 from '@site/static/images/integrations/data-visualization/quicksight_02.png';
import quicksight_03 from '@site/static/images/integrations/data-visualization/quicksight_03.png';
import quicksight_04 from '@site/static/images/integrations/data-visualization/quicksight_04.png';
import quicksight_05 from '@site/static/images/integrations/data-visualization/quicksight_05.png';
import quicksight_06 from '@site/static/images/integrations/data-visualization/quicksight_06.png';
import quicksight_07 from '@site/static/images/integrations/data-visualization/quicksight_07.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# QuickSight

<CommunityMaintainedBadge/>

QuickSight は、公式の MySQL データソースおよびダイレクトクエリモードを使用して、オンプレミスの ClickHouse セットアップ (23.11+) に接続できます。

## オンプレミス ClickHouse サーバー設定 {#on-premise-clickhouse-server-setup}

ClickHouse サーバーを MySQL インターフェースで設定する方法については、[公式ドキュメント](/interfaces/mysql) を参照してください。

サーバーの `config.xml` にエントリを追加することに加えて、

```xml
<clickhouse>
    <mysql_port>9004</mysql_port>
</clickhouse>
```

MySQL インターフェースを使用するユーザーには、[Double SHA1 パスワード暗号化](/operations/settings/settings-users#user-namepassword) を使用することが_必須_です。

シェルから Double SHA1 で暗号化されたランダムパスワードを生成するコマンド:

```shell
PASSWORD=$(base64 < /dev/urandom | head -c16); echo "$PASSWORD"; echo -n "$PASSWORD" | sha1sum | tr -d '-' | xxd -r -p | sha1sum | tr -d '-'
```

出力は以下のようになります:

```text
LZOQYnqQN4L/T6L0
fbc958cc745a82188a51f30de69eebfc67c40ee4
```

最初の行は生成されたパスワードで、2 行目は ClickHouse を設定するために使用できるハッシュです。

生成されたハッシュを使用した `mysql_user` の例の設定は次のとおりです:

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

`password_double_sha1_hex` エントリを自分が生成した Double SHA1 ハッシュに置き換えてください。

QuickSight では、MySQL ユーザープロファイルにさらにいくつかの追加設定が必要です。

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

ただし、デフォルトのプロファイルの代わりに MySQL ユーザーが使用できる別のプロファイルに割り当てることをお勧めします。

最後に、ClickHouse サーバーを希望の IP アドレスでリッスンするように設定します。
`config.xml` 内で、以下のコメントを解除してすべてのアドレスをリッスンさせます:

```bash
<listen_host>::</listen_host>
```

`mysql` バイナリが利用可能な場合は、コマンドラインから接続をテストできます。
上記のサンプルユーザー名 (`mysql_user`) およびパスワード (`LZOQYnqQN4L/T6L0`) を使用したコマンドラインは次のようになります:

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

まず、[https://quicksight.aws.amazon.com](https://quicksight.aws.amazon.com) に移動し、データセットに移動して「新しいデータセット」をクリックします:

<Image size="md" img={quicksight_01} alt="Amazon QuickSight ダッシュボードでデータセットセクションの新しいデータセットボタンを示す" border />
<br/>

QuickSight にバンドルされている公式 MySQL コネクタ (名前は**MySQL**です) を検索します:

<Image size="md" img={quicksight_02} alt="QuickSight データソース選択画面で検索結果の中で MySQL が強調表示されている" border />
<br/>

接続の詳細を指定します。MySQL インターフェースのポートはデフォルトで 9004 ですが、サーバーの設定によって異なる場合があります。

<Image size="md" img={quicksight_03} alt="QuickSight MySQL 接続設定フォームにホスト名、ポート、データベースおよび認証情報フィールドが表示されている" border />
<br/>

次に、ClickHouse からデータを取得するための 2 つのオプションがあります。最初に、リストからテーブルを選択できます:

<Image size="md" img={quicksight_04} alt="QuickSight テーブル選択インターフェースで ClickHouse から利用可能なデータベーステーブルが表示されている" border />
<br/>

あるいは、カスタム SQL を指定してデータを取得することもできます:

<Image size="md" img={quicksight_05} alt="QuickSight カスタム SQL クエリエディタで ClickHouse からデータを取得" border />
<br/>

「データの編集/プレビュー」をクリックすると、インタラクションされたテーブルの構造が表示されるか、データにアクセスする方法としてカスタム SQL を調整することができます:

<Image size="md" img={quicksight_06} alt="QuickSight データプレビューでカラムとサンプルデータを示すテーブル構造が表示されている" border />
<br/>

UI の左下隅で「ダイレクトクエリ」モードが選択されていることを確認してください:

<Image size="md" img={quicksight_07} alt="QuickSight インターフェースでダイレクトクエリモードオプションが強調表示されている" border />
<br/>

これで、データセットを公開し、新しいビジュアライゼーションを作成できます!

## 知られている制限 {#known-limitations}

- SPICE インポートは期待通りに動作しません。代わりにダイレクトクエリモードを使用してください。詳細は [#58553](https://github.com/ClickHouse/ClickHouse/issues/58553) を参照してください。
