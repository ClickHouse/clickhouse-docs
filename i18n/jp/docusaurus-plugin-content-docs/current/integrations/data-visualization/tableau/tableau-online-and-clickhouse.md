---
sidebar_label: 'Tableau Online'
sidebar_position: 2
slug: '/integrations/tableau-online'
keywords:
- 'clickhouse'
- 'tableau'
- 'online'
- 'mysql'
- 'connect'
- 'integrate'
- 'ui'
description: 'Tableau Online streamlines the power of data to make people faster
  and more confident decision makers from anywhere.'
title: 'Tableau Online'
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

Tableau Onlineは、公式のMySQLデータソースを使用して、ClickHouse CloudまたはオンプレミスのClickHouseセットアップにMySQLインターフェイス経由で接続できます。

## ClickHouse Cloudの設定 {#clickhouse-cloud-setup}
<MySQLCloudSetup />

## オンプレミスClickHouseサーバーの設定 {#on-premise-clickhouse-server-setup}
<MySQLOnPremiseSetup />

## Tableau OnlineをClickHouseに接続する（SSLなしのオンプレミス） {#connecting-tableau-online-to-clickhouse-on-premise-without-ssl}

Tableau Cloudサイトにログインし、新しい公開データソースを追加します。

<Image size="md" img={tableau_online_01} alt="Tableau Onlineインターフェースにの'新規'ボタンが表示されている" border />
<br/>

利用可能なコネクタのリストから"MySQL"を選択します。

<Image size="md" img={tableau_online_02} alt="Tableau Onlineコネクタ選択画面でMySQLオプションが強調表示されています" border />
<br/>

ClickHouseの設定中に収集した接続詳細を指定します。

<Image size="md" img={tableau_online_03} alt="Tableau OnlineのMySQL接続設定画面でサーバー、ポート、データベースおよび資格情報フィールドが表示されています" border />
<br/>

Tableau Onlineはデータベースを調査し、利用可能なテーブルのリストを提供します。必要なテーブルを右側のキャンバスにドラッグします。また、「Update Now」をクリックしてデータをプレビューしたり、調査したフィールドタイプや名前を微調整することもできます。

<Image size="md" img={tableau_online_04} alt="Tableau Onlineのデータソースページに左側にデータベーステーブル、右側にドラッグアンドドロップ機能のキャンバスが表示されています" border />
<br/>

その後は、右上の「Publish As」をクリックするだけで、新しく作成されたデータセットを通常通りTableau Onlineで使用できるようになります。

注: Tableau OnlineをTableau Desktopと組み合わせて使用し、ClickHouseデータセットを共有したい場合は、Tableau DesktopでもデフォルトのMySQLコネクタを使用し、データソースドロップダウンからMySQLを選択したときに表示されるセットアップガイドに従ってください。M1 Macを使用している場合は、[このトラブルシューティングスレッド](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac)をチェックして、ドライバーのインストール回避策を確認してください。

## Tableau OnlineをClickHouseに接続する（SSLを使用したCloudまたはオンプレミスの設定） {#connecting-tableau-online-to-clickhouse-cloud-or-on-premise-setup-with-ssl}

Tableau OnlineのMySQL接続設定ウィザードからSSL証明書を提供することはできないため、唯一の方法はTableau Desktopを使用して接続を設定し、それをTableau Onlineにエクスポートすることです。しかし、このプロセスはかなり簡単です。

WindowsまたはMacマシンでTableau Desktopを実行し、「Connect」->「To a Server」->「MySQL」を選択します。最初にマシンにMySQLドライバーをインストールする必要がある場合があります。データソースドロップダウンからMySQLを選択すると表示されるセットアップガイドに従ってこれを行うことができます。M1 Macを使用している場合は、[このトラブルシューティングスレッド](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac)をチェックしてドライバーのインストール回避策を確認してください。

<Image size="md" img={tableau_desktop_01} alt="Tableau Desktopインターフェースに接続メニューが表示されておりMySQLオプションが強調表示されています" border />
<br/>

:::note
MySQL接続設定UIで「SSL」オプションが有効になっていることを確認してください。 
ClickHouse CloudのSSL証明書は、[Let's Encrypt](https://letsencrypt.org/certificates/)により署名されています。 
このルート証明書は[こちら](https://letsencrypt.org/certs/isrgrootx1.pem)からダウンロードできます。
:::

ClickHouse CloudインスタンスのMySQLユーザー資格情報とダウンロードしたルート証明書へのパスを提供します。

<Image size="sm" img={tableau_desktop_02} alt="Tableau DesktopのMySQL接続ダイアログでSSLオプションが有効になっており、サーバー、ユーザー名、パスワード、証明書フィールドが表示されています" border />
<br/>

希望のテーブルを通常通り選択し（Tableau Onlineと同様に）、 
「Server」->「Publish Data Source」-> Tableau Cloudを選択します。

<Image size="md" img={tableau_desktop_03} alt="Tableau Desktopにサーバーメニューが表示され、Publish Data Sourceオプションが強調表示されています" border />
<br/>

重要: 「Authentication」オプションで「Embedded password」を選択する必要があります。

<Image size="md" img={tableau_desktop_04} alt="Tableau Desktopの公開ダイアログでAuthenticationオプションが表示され、Embedded passwordが選択されています" border />
<br/>

さらに、「Update workbook to use the published data source」オプションを選択します。

<Image size="sm" img={tableau_desktop_05} alt="Tableau Desktopの公開ダイアログで'Update workbook to use the published data source'オプションがチェックされています" border />
<br/>

最後に、「Publish」をクリックすると、埋め込まれた資格情報を持つデータソースが自動的にTableau Onlineで開かれます。

## 知られている制限事項 (ClickHouse 23.11) {#known-limitations-clickhouse-2311}

すべての知られている制限事項はClickHouse `23.11`で修正されました。他に互換性のない問題が発生した場合は、[お問い合わせ](https://clickhouse.com/company/contact)いただくか、[新しいイシュー](https://github.com/ClickHouse/ClickHouse/issues)を作成してください。
