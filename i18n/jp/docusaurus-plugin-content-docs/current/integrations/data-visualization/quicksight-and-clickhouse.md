---
sidebar_label: 'QuickSight'
slug: '/integrations/quicksight'
keywords:
- 'clickhouse'
- 'aws'
- 'amazon'
- 'QuickSight'
- 'mysql'
- 'connect'
- 'integrate'
- 'ui'
description: 'Amazon QuickSightは、統合されたビジネスインテリジェンス（BI）でデータ駆動型の組織を支援します。'
title: 'QuickSight'
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

QuickSightは、公式のMySQLデータソースとDirect Queryモードを使用して、オンプレミスのClickHouseセットアップ (23.11以上) にMySQLインターフェースで接続できます。

## オンプレミスのClickHouseサーバー設定 {#on-premise-clickhouse-server-setup}

ClickHouseサーバーをMySQLインターフェースで設定する方法については、[公式ドキュメント](/interfaces/mysql) を参照してください。

サーバーの `config.xml` にエントリを追加することに加えて、

```xml
<clickhouse>
    <mysql_port>9004</mysql_port>
</clickhouse>
```

MySQLインターフェースを使用するユーザーに対して、[Double SHA1パスワード暗号化](/operations/settings/settings-users#user-namepassword) を使用することが**必須**です。

シェルからDouble SHA1で暗号化されたランダムパスワードを生成するには：

```shell
PASSWORD=$(base64 < /dev/urandom | head -c16); echo "$PASSWORD"; echo -n "$PASSWORD" | sha1sum | tr -d '-' | xxd -r -p | sha1sum | tr -d '-'
```

出力は以下のようになります。

```text
LZOQYnqQN4L/T6L0
fbc958cc745a82188a51f30de69eebfc67c40ee4
```

最初の行は生成されたパスワードで、2行目はClickHouseの設定に使用できるハッシュです。

以下は、生成されたハッシュを使用した `mysql_user` の設定例です。

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

`password_double_sha1_hex` のエントリを、生成したDouble SHA1ハッシュと置き換えてください。

QuickSightは、MySQLユーザーのプロファイルにいくつかの追加設定を要求します。

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

最後に、クリックハウスサーバーを希望のIPアドレスでリッスンするように構成します。
`config.xml` で、すべてのアドレスでリッスンするように以下の行のコメントアウトを外します。

```bash
<listen_host>::</listen_host>
```

`mysql` バイナリが利用可能であれば、コマンドラインから接続をテストできます。
上記のサンプルユーザー名 (`mysql_user`) とパスワード (`LZOQYnqQN4L/T6L0`) を使用した場合、コマンドラインは以下のようになります。

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

最初に、 https://quicksight.aws.amazon.com にアクセスし、データセットに移動して「新しいデータセット」をクリックします。

<Image size="md" img={quicksight_01} alt="Amazon QuickSightダッシュボードのデータセットセクションにある新しいデータセットボタン" border />
<br/>

QuickSightにバンドルされている公式のMySQLコネクタを検索します（名称は**MySQL**）。

<Image size="md" img={quicksight_02} alt="検索結果にハイライトされたQuickSightデータソース選択画面" border />
<br/>

接続詳細を指定します。MySQLインターフェースポートはデフォルトで9004ですが、サーバー構成によって異なる場合があります。

<Image size="md" img={quicksight_03} alt="ホスト名、ポート、データベースおよび資格情報フィールドを含むQuickSight MySQL接続設定フォーム" border />
<br/>

ClickHouseからデータを取得する方法として、2つの選択肢があります。まずは、リストからテーブルを選択できます。

<Image size="md" img={quicksight_04} alt="ClickHouseから利用可能なデータベーステーブルを示すQuickSightのテーブル選択インターフェース" border />
<br/>

あるいは、カスタムSQLを指定してデータを取得することもできます。

<Image size="md" img={quicksight_05} alt="ClickHouseからデータを取得するためのQuickSightカスタムSQLクエリエディタ" border />
<br/>

「データを編集/プレビュー」をクリックすると、テーブルの構造を確認したり、カスタムSQLを調整したりできます。

<Image size="md" img={quicksight_06} alt="カラムとサンプルデータを含むテーブル構造を示すQuickSightデータプレビュー" border />
<br/>

UIの左下隅で「Direct Query」モードが選択されていることを確認します。

<Image size="md" img={quicksight_07} alt="左下隅にハイライトされたDirect Queryモードオプションを持つQuickSightインターフェース" border />
<br/>

これで、データセットを公開し、新しい視覚化を作成することができます！

## 知られている制限事項 {#known-limitations}

- SPICEインポートは期待通りに動作しません。かわりにDirect Queryモードを使用してください。詳細は [#58553](https://github.com/ClickHouse/ClickHouse/issues/58553) を参照してください。
