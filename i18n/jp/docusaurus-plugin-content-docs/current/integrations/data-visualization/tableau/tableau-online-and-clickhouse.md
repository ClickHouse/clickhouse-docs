---
'sidebar_label': 'Tableau Online'
'sidebar_position': 2
'slug': '/integrations/tableau-online'
'keywords':
- 'clickhouse'
- 'tableau'
- 'online'
- 'mysql'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Tableau Onlineは、どこからでも人々を迅速かつ自信を持った意思決定者にするために、データの力を合理化します。'
'title': 'Tableau Online'
'doc_type': 'guide'
---

import MySQLCloudSetup from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_clickhouse_mysql_cloud_setup.mdx';
import MySQLOnPremiseSetup from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_clickhouse_mysql_on_premise_setup.mdx';
import Image from '@theme/IdealImage';
import tableau_online_01 from '@site/static/images/integrations/data-visualization/tableau_online_01.png';
import tableau_online_02 from '@site/static/images/integrations/data-visualization/tableau_online_02.png';
import tableau_online_03 from '@site/static/images/integrations/data-visualization/tableau_online_03.png';
import tableau_online_04 from '@site/static/images/integrations/data-visualization/tableau_online_04.png';
import tableau_desktop_01 from '@site/static/images/integrations/data-visualization/tableau_desktop_01.png';
import tableau_desktop_02 from '@site/static/images/integrations/data-visualization/tableau_desktop_02.png';
import tableau_desktop_03 from '@site/static/images/integrations/data-visualization/tableau_desktop_03.png';
import tableau_desktop_04 from '@site/static/images/integrations/data-visualization/tableau_desktop_04.png';
import tableau_desktop_05 from '@site/static/images/integrations/data-visualization/tableau_desktop_05.png';


# Tableau Online

Tableau Online は、公式の MySQL データソースを使用して、ClickHouse Cloud またはオンプレミスの ClickHouse セットアップに MySQL インターフェースを介して接続できます。

## ClickHouse Cloud セットアップ {#clickhouse-cloud-setup}
<MySQLCloudSetup />

## オンプレミスの ClickHouse サーバーセットアップ {#on-premise-clickhouse-server-setup}
<MySQLOnPremiseSetup />

## Tableau Online を ClickHouse に接続する (SSLなしのオンプレミス) {#connecting-tableau-online-to-clickhouse-on-premise-without-ssl}

あなたの Tableau Cloud サイトにログインし、新しい公開データソースを追加します。

<Image size="md" img={tableau_online_01} alt="Tableau Online インターフェースに 'New' ボタンが表示されています。公開データソースを作成するためのボタン。" border />
<br/>

利用可能なコネクタのリストから "MySQL" を選択します。

<Image size="md" img={tableau_online_02} alt="Tableau Online コネクタ選択画面に MySQL オプションがハイライトされています。" border />
<br/>

ClickHouse セットアップ中に収集した接続情報を指定します。

<Image size="md" img={tableau_online_03} alt="Tableau Online MySQL 接続設定画面で、サーバー、ポート、データベース、および資格情報フィールドが表示されています。" border />
<br/>

Tableau Online はデータベースを調査し、利用可能なテーブルのリストを提供します。希望するテーブルを右側のキャンバスにドラッグします。さらに、"Update Now" をクリックするとデータをプレビューでき、調査したフィールドタイプや名前を微調整することができます。

<Image size="md" img={tableau_online_04} alt="Tableau Online データソースページで、左側にデータベーステーブル、右側にドラッグ＆ドロップ機能のあるキャンバスが表示されています。" border />
<br/>

その後は、右上隅で "Publish As" をクリックするだけで、通常通り Tableau Online で新しく作成したデータセットを使用できるようになります。

NB: Tableau Online を Tableau Desktop と組み合わせて使用し、ClickHouse データセットを共有したい場合は、デフォルトの MySQL コネクタとともに Tableau Desktop を使用する必要があることに注意してください。MySQL をデータソースのドロップダウンから選択すると表示されるセットアップガイドに従ってください。M1 Mac を使用している場合は、[このトラブルシューティングスレッド](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac)をチェックして、ドライバーのインストールワークアラウンドをご確認ください。

## Tableau Online を ClickHouse に接続する (SSLを使用したクラウドまたはオンプレミスのセットアップ) {#connecting-tableau-online-to-clickhouse-cloud-or-on-premise-setup-with-ssl}

Tableau Online MySQL 接続設定ウィザードを介して SSL 証明書を提供することはできないため、唯一の方法は Tableau Desktop を使用して接続を設定し、その後それを Tableau Online にエクスポートすることです。このプロセスは、しかし、非常に簡単です。

Windows または Mac マシンで Tableau Desktop を実行し、"Connect" -> "To a Server" -> "MySQL" を選択します。
おそらく、最初にあなたのマシンに MySQL ドライバーをインストールする必要があります。
MySQL をデータソースのドロップダウンから選択すると表示されるセットアップガイドに従って、これを行うことができます。
M1 Mac を使用している場合は、[このトラブルシューティングスレッド](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac)をチェックして、ドライバーのインストールワークアラウンドをご確認ください。

<Image size="md" img={tableau_desktop_01} alt="Tableau Desktop インターフェースに接続メニューが表示されており、MySQL オプションがハイライトされています。" border />
<br/>

:::note
MySQL 接続設定 UI で、"SSL" オプションが有効になっていることを確認してください。
ClickHouse Cloud の SSL 証明書は [Let's Encrypt](https://letsencrypt.org/certificates/) によって署名されています。
このルート証明書を [こちら](https://letsencrypt.org/certs/isrgrootx1.pem) からダウンロードできます。
:::

あなたの ClickHouse Cloud インスタンスの MySQL ユーザー資格情報とダウンロードしたルート証明書のパスを提供します。

<Image size="sm" img={tableau_desktop_02} alt="Tableau Desktop MySQL 接続ダイアログで SSL オプションが有効になっており、サーバー、ユーザー名、パスワード、および証明書のためのフィールドが表示されています。" border />
<br/>

通常通り（Tableau Online に似て）希望のテーブルを選択し、"Server" -> "Publish Data Source" -> Tableau Cloud を選択します。

<Image size="md" img={tableau_desktop_03} alt="Tableau Desktop にサーバーメニューが表示されており、Publish Data Source オプションがハイライトされています。" border />
<br/>

重要: "Authentication" オプションで "Embedded password" を選択する必要があります。

<Image size="md" img={tableau_desktop_04} alt="Tableau Desktop 公開ダイアログで、Authentication オプションに Embedded password が選択されています。" border />
<br/>

さらに、"Update workbook to use the published data source" を選択します。

<Image size="sm" img={tableau_desktop_05} alt="Tableau Desktop 公開ダイアログで 'Update workbook to use the published data source' オプションがチェックされています。" border />
<br/>

最後に "Publish" をクリックすると、埋め込まれた資格情報を持つデータソースが自動的に Tableau Online で開かれます。

## 既知の制限 (ClickHouse 23.11) {#known-limitations-clickhouse-2311}

既知の制限はすべて ClickHouse `23.11` で修正されました。他に互換性のない問題に出会った場合は、ためらわずに [お問い合わせ](https://clickhouse.com/company/contact) または [新しい問題を作成](https://github.com/ClickHouse/ClickHouse/issues)してください。
