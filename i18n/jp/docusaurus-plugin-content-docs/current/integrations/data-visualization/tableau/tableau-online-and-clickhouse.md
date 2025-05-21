---
sidebar_label: 'Tableau Online'
sidebar_position: 2
slug: /integrations/tableau-online
keywords: ['clickhouse', 'tableau', 'online', 'mysql', 'connect', 'integrate', 'ui']
description: 'Tableau Online は、どこからでも人々が迅速かつ自信を持って意思決定を行うためのデータの力を簡素化します。'
title: 'Tableau Online'
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

Tableau Online は、公式の MySQL データソースを使用して、ClickHouse Cloud またはオンプレミスの ClickHouse セットアップに MySQL インターフェースを介して接続できます。

## ClickHouse Cloud Setup {#clickhouse-cloud-setup}
<MySQLCloudSetup />

## On-premise ClickHouse Server Setup {#on-premise-clickhouse-server-setup}
<MySQLOnPremiseSetup />

## Connecting Tableau Online to ClickHouse (on-premise without SSL) {#connecting-tableau-online-to-clickhouse-on-premise-without-ssl}

Tableau Cloud サイトにログインし、新しい公開データソースを追加します。

<Image size="md" img={tableau_online_01} alt="Tableau Online インターフェースに 'New' ボタンが表示されており、公開データソースを作成する" border />
<br/>

利用可能なコネクタのリストから「MySQL」を選択します。

<Image size="md" img={tableau_online_02} alt="Tableau Online コネクタ選択画面で MySQL オプションが強調表示されている" border />
<br/>

ClickHouse セットアップ中に収集した接続の詳細を指定します。

<Image size="md" img={tableau_online_03} alt="Tableau Online MySQL 接続設定画面、サーバー、ポート、データベースおよび認証情報のフィールドが表示されている" border />
<br/>

Tableau Online がデータベースを探索し、利用可能なテーブルのリストを提供します。目的のテーブルを右側のキャンバスにドラッグします。また、「Update Now」をクリックしてデータをプレビューしたり、探索されたフィールドタイプや名前を微調整したりすることもできます。

<Image size="md" img={tableau_online_04} alt="Tableau Online データソースページに左側にデータベーステーブル、右側にドラッグ・アンド・ドロップ機能のあるキャンバスが表示されている" border />
<br/>

その後は、右上隅の「Publish As」をクリックするだけで、新しく作成されたデータセットを Tableau Online で通常通り使用できるようになります。

NB: Tableau Online を Tableau Desktop と組み合わせて使用し、ClickHouse データセットを両者で共有したい場合は、デフォルトの MySQL コネクタを使用して Tableau Desktop も使用してください。データソースのドロップダウンから MySQL を選択すると表示されるセットアップガイドを参照してください [こちら](https://www.tableau.com/support/drivers)。M1 Mac をお持ちの場合は、[こちらのトラブルシューティングスレッド](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac)でドライバーのインストール回避策を確認してください。

## Connecting Tableau Online to ClickHouse (Cloud or on-premise setup with SSL) {#connecting-tableau-online-to-clickhouse-cloud-or-on-premise-setup-with-ssl}

Tableau Online の MySQL 接続設定ウィザードを通じて SSL 証明書を提供することはできないため、唯一の方法は Tableau Desktop を使用して接続を設定し、その後 Tableau Online にエクスポートすることです。ただし、このプロセスは非常に簡単です。

Windows または Mac マシンで Tableau Desktop を実行し、「Connect」->「To a Server」->「MySQL」を選択します。最初にマシンに MySQL ドライバーをインストールする必要がある場合があります。データソースのドロップダウンから MySQL を選択すると表示されるセットアップガイドに従ってそれを行うことができます。M1 Mac をお持ちの場合は、[こちらのトラブルシューティングスレッド](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac)でドライバーのインストール回避策を確認してください。

<Image size="md" img={tableau_desktop_01} alt="Tableau Desktop インターフェースに接続メニューが表示されており、MySQL オプションが強調表示されている" border />
<br/>

:::note
MySQL 接続設定 UI では、必ず「SSL」オプションを有効にしてください。 
ClickHouse Cloud の SSL 証明書は [Let's Encrypt](https://letsencrypt.org/certificates/) によって署名されています。 
このルート証明書を [こちら](https://letsencrypt.org/certs/isrgrootx1.pem) からダウンロードできます。
:::

ClickHouse Cloud インスタンスの MySQL ユーザー認証情報と、ダウンロードしたルート証明書のパスを指定します。

<Image size="sm" img={tableau_desktop_02} alt="Tableau Desktop MySQL 接続ダイアログに SSL オプションが有効で、サーバー、ユーザー名、パスワード、証明書のフィールドが表示されている" border />
<br/>

通常通り、必要なテーブルを選択し（Tableau Online と同様に）、 
「Server」->「Publish Data Source」-> Tableau Cloud を選択します。

<Image size="md" img={tableau_desktop_03} alt="Tableau Desktop サーバーメニューに Publish Data Source オプションが強調表示されている" border />
<br/>

重要: 認証オプションで「Embedded password」を選択する必要があります。

<Image size="md" img={tableau_desktop_04} alt="Tableau Desktop 公開ダイアログに認証オプションが表示されており、Embedded password が選択されている" border />
<br/>

また、「Update workbook to use the published data source」を選択します。

<Image size="sm" img={tableau_desktop_05} alt="Tableau Desktop 公開ダイアログに 'Update workbook to use the published data source' オプションがチェックされている" border />
<br/>

最後に「Publish」をクリックすると、埋め込まれた認証情報を持つデータソースが Tableau Online で自動的に開かれます。


## Known limitations (ClickHouse 23.11) {#known-limitations-clickhouse-2311}

ClickHouse `23.11` では、すべての既知の制限が修正されています。他の互換性の問題に遭遇した場合は、遠慮なく [お問い合わせ](https://clickhouse.com/company/contact) いただくか、[新しい問題を作成](https://github.com/ClickHouse/ClickHouse/issues)してください。
