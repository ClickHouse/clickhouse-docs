---
sidebar_label: 'Tableau Online'
sidebar_position: 2
slug: /integrations/tableau-online
keywords: ['clickhouse', 'tableau', 'online', 'mysql', 'connect', 'integrate', 'ui']
description: 'Tableau Online は、どこからでもより迅速かつ自信を持って意思決定できるよう、人々によるデータ活用を効率化します。'
title: 'Tableau Online'
doc_type: 'guide'
---

import MySQLCloudSetup from '@site/docs/_snippets/_clickhouse_mysql_cloud_setup.mdx';
import MySQLOnPremiseSetup from '@site/docs/_snippets/_clickhouse_mysql_on_premise_setup.mdx';
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

Tableau Online は、MySQL インターフェース経由で公式の MySQL データソースを使用して、ClickHouse Cloud またはオンプレミスの ClickHouse 環境に接続できます。



## ClickHouse Cloudのセットアップ {#clickhouse-cloud-setup}

<MySQLCloudSetup />


## オンプレミスClickHouseサーバーのセットアップ {#on-premise-clickhouse-server-setup}

<MySQLOnPremiseSetup />


## Tableau OnlineをClickHouseに接続する(オンプレミス、SSLなし) {#connecting-tableau-online-to-clickhouse-on-premise-without-ssl}

Tableau Cloudサイトにログインし、新しい公開データソースを追加します。

<Image
  size='md'
  img={tableau_online_01}
  alt="公開データソースを作成するための「新規」ボタンが表示されているTableau Onlineインターフェース"
  border
/>
<br />

利用可能なコネクタのリストから「MySQL」を選択します。

<Image
  size='md'
  img={tableau_online_02}
  alt='MySQLオプションがハイライト表示されているTableau Onlineコネクタ選択画面'
  border
/>
<br />

ClickHouseのセットアップ時に収集した接続情報を指定します。

<Image
  size='md'
  img={tableau_online_03}
  alt='サーバー、ポート、データベース、認証情報の各フィールドを含むTableau Online MySQL接続設定画面'
  border
/>
<br />

Tableau Onlineはデータベースを検査し、利用可能なテーブルのリストを表示します。目的のテーブルを右側のキャンバスにドラッグします。また、「今すぐ更新」をクリックしてデータをプレビューしたり、検査されたフィールドの型や名前を微調整したりすることもできます。

<Image
  size='md'
  img={tableau_online_04}
  alt='左側にデータベーステーブル、右側にドラッグアンドドロップ機能を備えたキャンバスが表示されているTableau Onlineデータソースページ'
  border
/>
<br />

その後、右上隅の「名前を付けて公開」をクリックするだけで、新しく作成されたデータセットを通常どおりTableau Onlineで使用できるようになります。

注:Tableau OnlineをTableau Desktopと組み合わせて使用し、ClickHouseデータセットを共有する場合は、Tableau DesktopでもデフォルトのMySQLコネクタを使用してください。データソースのドロップダウンからMySQLを選択した際に表示される[こちら](https://www.tableau.com/support/drivers)のセットアップガイドに従ってください。M1 Macをお使いの場合は、ドライバーインストールの回避策について[このトラブルシューティングスレッド](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac)を確認してください。


## Tableau OnlineをClickHouseに接続する（クラウドまたはSSL対応のオンプレミスセットアップ） {#connecting-tableau-online-to-clickhouse-cloud-or-on-premise-setup-with-ssl}

Tableau OnlineのMySQL接続設定ウィザードではSSL証明書を提供できないため、
Tableau Desktopで接続を設定してからTableau Onlineにエクスポートする方法のみが利用可能です。ただし、このプロセスは非常に簡単です。

WindowsまたはMacマシンでTableau Desktopを起動し、「Connect」→「To a Server」→「MySQL」を選択します。
最初にマシンにMySQLドライバをインストールする必要がある場合があります。
Data Sourceドロップダウンから「MySQL」を選択すると表示される[こちら](https://www.tableau.com/support/drivers)のセットアップガイドに従ってインストールできます。
M1 Macをお使いの場合は、ドライバインストールの回避策について[このトラブルシューティングスレッド](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac)を確認してください。

<Image
  size='md'
  img={tableau_desktop_01}
  alt='MySQLオプションがハイライトされたConnectメニューを表示するTableau Desktopインターフェース'
  border
/>
<br />

:::note
MySQL接続設定UIで、「SSL」オプションが有効になっていることを確認してください。
ClickHouse CloudのSSL証明書は[Let's Encrypt](https://letsencrypt.org/certificates/)によって署名されています。
このルート証明書は[こちら](https://letsencrypt.org/certs/isrgrootx1.pem)からダウンロードできます。
:::

ClickHouse CloudインスタンスのMySQLユーザー認証情報と、ダウンロードしたルート証明書へのパスを指定します。

<Image
  size='sm'
  img={tableau_desktop_02}
  alt='SSLオプションが有効で、サーバー、ユーザー名、パスワード、証明書のフィールドがあるTableau Desktop MySQL接続ダイアログ'
  border
/>
<br />

通常どおり（Tableau Onlineと同様に）目的のテーブルを選択し、
「Server」→「Publish Data Source」→「Tableau Cloud」を選択します。

<Image
  size='md'
  img={tableau_desktop_03}
  alt='Publish Data SourceオプションがハイライトされたServerメニューを表示するTableau Desktop'
  border
/>
<br />

重要：「Authentication」オプションで「Embedded password」を選択する必要があります。

<Image
  size='md'
  img={tableau_desktop_04}
  alt='Embedded passwordが選択されたAuthenticationオプションを表示するTableau Desktop公開ダイアログ'
  border
/>
<br />

さらに、「Update workbook to use the published data source」を選択します。

<Image
  size='sm'
  img={tableau_desktop_05}
  alt="「Update workbook to use the published data source」オプションがチェックされたTableau Desktop公開ダイアログ"
  border
/>
<br />

最後に「Publish」をクリックすると、埋め込まれた認証情報を含むデータソースがTableau Onlineで自動的に開かれます。


## 既知の制限事項（ClickHouse 23.11）{#known-limitations-clickhouse-2311}

既知の制限事項はすべてClickHouse `23.11`で修正されました。その他の非互換性が発生した場合は、[お問い合わせ](https://clickhouse.com/company/contact)いただくか、[新しいissue](https://github.com/ClickHouse/ClickHouse/issues)を作成してください。
