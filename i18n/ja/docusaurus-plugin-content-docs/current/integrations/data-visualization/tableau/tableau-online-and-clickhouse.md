---
sidebar_label: Tableau Online
sidebar_position: 2
slug: /integrations/tableau-online
keywords: [clickhouse, tableau, online, mysql, connect, integrate, ui]
description: Tableau Onlineはデータの力を活用し、どこからでも迅速かつ自信を持った意思決定を行えるようにします。
---

import MySQLCloudSetup from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_clickhouse_mysql_cloud_setup.mdx';
import MySQLOnPremiseSetup from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_clickhouse_mysql_on_premise_setup.mdx';

# Tableau Online

Tableau Onlineは、公式のMySQLデータソースを使用して、ClickHouse CloudまたはオンプレミスのClickHouseセットアップにMySQLインターフェース経由で接続できます。

## ClickHouse Cloud セットアップ {#clickhouse-cloud-setup}
<MySQLCloudSetup />

## オンプレミスのClickHouseサーバーセットアップ {#on-premise-clickhouse-server-setup}
<MySQLOnPremiseSetup />

## Tableau OnlineをClickHouseに接続する（SSLなしのオンプレミス） {#connecting-tableau-online-to-clickhouse-on-premise-without-ssl}

Tableau Cloudサイトにログインし、新しい公開データソースを追加します。

<img src={require('../images/tableau_online_01.png').default} class="image" alt="新しい公開データソースの作成" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

利用可能なコネクタのリストから「MySQL」を選択します。

<img src={require('../images/tableau_online_02.png').default} class="image" alt="MySQLコネクタの選択" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

ClickHouseセットアップ中に収集した接続詳細を指定します。

<img src={require('../images/tableau_online_03.png').default} class="image" alt="接続詳細の指定" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Tableau Onlineはデータベースを調査し、利用可能なテーブルのリストを提供します。目的のテーブルを右側のキャンバスにドラッグします。さらに、「今すぐ更新」をクリックしてデータをプレビューし、調査したフィールドの型や名前を微調整できます。

<img src={require('../images/tableau_online_04.png').default} class="image" alt="使用するテーブルの選択" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

その後は、右上隅の「公開として」をクリックするだけで、新しく作成したデータセットを通常通りTableau Onlineで使用できるようになります。

注意: Tableau OnlineをTableau Desktopと組み合わせて使用し、ClickHouseデータセットを共有する場合は、Tableau DesktopでもデフォルトのMySQLコネクタを使用し、データソースのドロップダウンからMySQLを選択した場合に表示されるセットアップガイドに従ってください。M1 Macを使用している場合は、[こちらのトラブルシューティングスレッド](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac)を確認して、ドライバーインストールの回避策を探してください。

## Tableau OnlineをClickHouseに接続する（SSL付きCloudまたはオンプレミスセットアップ） {#connecting-tableau-online-to-clickhouse-cloud-or-on-premise-setup-with-ssl}

Tableau OnlineのMySQL接続セットアップウィザードからSSL証明書を提供することは不可能なので、
唯一の方法はTableau Desktopを使用して接続を設定し、それをTableau Onlineにエクスポートすることです。このプロセスは比較的簡単です。

WindowsまたはMacマシンでTableau Desktopを起動し、「接続」->「サーバーに接続」->「MySQL」を選択します。
最初にマシンにMySQLドライバーをインストールする必要があるかもしれません。
データソースのドロップダウンからMySQLを選択した場合に表示されるセットアップガイドに従って、それを行うことができます。
M1 Macを使用している場合は、[こちらのトラブルシューティングスレッド](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac)を確認して、ドライバーインストールの回避策を探してください。

<img src={require('../images/tableau_desktop_01.png').default} class="image" alt="新しいデータソースの作成" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

:::note
MySQL接続セットアップUIで「SSL」オプションが有効になっていることを確認してください。
ClickHouse CloudのSSL証明書は[Let's Encrypt](https://letsencrypt.org/certificates/)によって署名されています。
このルート証明書は[こちら](https://letsencrypt.org/certs/isrgrootx1.pem)からダウンロードできます。
:::

ClickHouse CloudインスタンスのMySQLユーザー資格情報とダウンロードしたルート証明書のパスを指定します。

<img src={require('../images/tableau_desktop_02.png').default} class="image" alt="資格情報の指定" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

通常通り（Tableau Onlineと同様に）目的のテーブルを選択し、「サーバー」->「データソースを公開」->「Tableau Cloud」を選択します。

<img src={require('../images/tableau_desktop_03.png').default} class="image" alt="データソースの公開" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

重要: 「認証」オプションで「埋め込みパスワード」を選択する必要があります。

<img src={require('../images/tableau_desktop_04.png').default} class="image" alt="データソースの公開設定 - 資格情報を埋め込む" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

さらに、「公開データソースを使用するようにワークブックを更新」を選択します。

<img src={require('../images/tableau_desktop_05.png').default} class="image" alt="データソースの公開設定 - オンライン使用のためのワークブック更新" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

最後に「公開」をクリックすると、埋め込み資格情報が含まれたデータソースが自動的にTableau Onlineで開かれます。

## 既知の制限 (ClickHouse 23.11) {#known-limitations-clickhouse-2311}

ClickHouse `23.11`ですべての既知の制限が修正されています。他の非互換性に遭遇した場合は、[お問い合わせ](https://clickhouse.com/company/contact)いただくか、[新しい問題を作成](https://github.com/ClickHouse/ClickHouse/issues)してください。
