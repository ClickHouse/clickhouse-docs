---
sidebar_label: 'Tableau Online'
sidebar_position: 2
slug: /integrations/tableau-online
keywords: ['clickhouse', 'tableau', 'online', 'mysql', 'connect', 'integrate', 'ui']
description: 'Tableau Online は、データ活用を効率化し、どこからでも、より迅速かつ自信を持って意思決定できるよう支援します。'
title: 'Tableau Online'
doc_type: 'guide'
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

# Tableau Online {#tableau-online}

Tableau Online は、公式の MySQL データソースを利用し、MySQL インターフェース経由で ClickHouse Cloud またはオンプレミス環境の ClickHouse に接続できます。

## ClickHouse Cloud のセットアップ {#clickhouse-cloud-setup}
<MySQLCloudSetup />

## オンプレミスの ClickHouse サーバーのセットアップ {#on-premise-clickhouse-server-setup}
<MySQLOnPremiseSetup />

## Tableau Online から ClickHouse（オンプレミス・SSL なし）への接続 {#connecting-tableau-online-to-clickhouse-on-premise-without-ssl}

Tableau Cloud サイトにログインし、新しい Published Data Source（公開データソース）を追加します。

<Image size="md" img={tableau_online_01} alt="公開データソースを作成するための「New」ボタンが表示された Tableau Online のインターフェイス" border />
<br/>

利用可能なコネクタ一覧から「MySQL」を選択します。

<Image size="md" img={tableau_online_02} alt="MySQL オプションがハイライトされた Tableau Online のコネクタ選択画面" border />
<br/>

ClickHouse のセットアップ時に取得した接続情報を入力します。

<Image size="md" img={tableau_online_03} alt="サーバー、ポート、データベース、および認証情報フィールドを備えた Tableau Online の MySQL 接続設定画面" border />
<br/>

Tableau Online がデータベースをスキャンし、利用可能なテーブルの一覧を表示します。右側のキャンバスに目的のテーブルをドラッグします。さらに、「Update Now」をクリックしてデータをプレビューしたり、検出されたフィールドの型や名前を微調整したりできます。

<Image size="md" img={tableau_online_04} alt="左側にデータベーステーブル、右側にドラッグ＆ドロップが可能なキャンバスが表示された Tableau Online のデータソースページ" border />
<br/>

その後は、右上の「Publish As」をクリックするだけで、作成したデータセットを Tableau Online で通常どおり利用できるようになります。

注: Tableau Online と Tableau Desktop を併用し、それらの間で ClickHouse のデータセットを共有したい場合は、Tableau Desktop でもデフォルトの MySQL コネクタを使用してください。Data Source ドロップダウンから MySQL を選択した際に表示されるセットアップガイドに従って構成します（ガイドは [こちら](https://www.tableau.com/support/drivers) にあります）。M1 Mac を使用している場合は、ドライバーインストールの回避策について、この [トラブルシューティングスレッド](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac) を参照してください。

## Tableau Online を ClickHouse に接続する（SSL を用いたクラウドまたはオンプレミス環境） {#connecting-tableau-online-to-clickhouse-cloud-or-on-premise-setup-with-ssl}

Tableau Online の MySQL 接続セットアップウィザードでは SSL 証明書を指定できないため、  
Tableau Desktop で接続を設定し、その接続を Tableau Online にエクスポートする方法のみが利用できます。とはいえ、この手順は比較的容易です。

Windows または Mac のマシン上で Tableau Desktop を起動し、「Connect」 -> 「To a Server」 -> 「MySQL」を選択します。  
多くの場合、最初にマシンに MySQL ドライバをインストールする必要があります。  
Data Source のドロップダウンから MySQL を選択すると表示されるセットアップガイドに従うことで、[ここ](https://www.tableau.com/support/drivers)からインストールできます。  
M1 Mac をお使いの場合は、ドライバインストールの回避策について、この[トラブルシューティングスレッド](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac)を確認してください。

<Image size="md" img={tableau_desktop_01} alt="MySQL オプションがハイライトされた Connect メニューを表示している Tableau Desktop インターフェイス" border />
<br/>

:::note
MySQL 接続セットアップの UI で、「SSL」オプションが有効になっていることを確認してください。  
ClickHouse Cloud の SSL 証明書は [Let's Encrypt](https://letsencrypt.org/certificates/) によって署名されています。  
ルート証明書は[ここ](https://letsencrypt.org/certs/isrgrootx1.pem)からダウンロードできます。
:::

ClickHouse Cloud インスタンス用の MySQL ユーザー認証情報と、ダウンロードしたルート証明書へのパスを入力します。

<Image size="sm" img={tableau_desktop_02} alt="SSL オプションが有効になっており、サーバー、ユーザ名、パスワード、証明書の各フィールドが表示されている Tableau Desktop の MySQL 接続ダイアログ" border />
<br/>

（Tableau Online の場合と同様に）必要なテーブルをいつもどおり選択し、  
「Server」 -> 「Publish Data Source」 -> 「Tableau Cloud」を選択します。

<Image size="md" img={tableau_desktop_03} alt="Server メニューで Publish Data Source オプションがハイライトされている Tableau Desktop 画面" border />
<br/>

重要: 「Authentication」オプションで「Embedded password」を選択する必要があります。

<Image size="md" img={tableau_desktop_04} alt="Authentication オプションで Embedded password が選択されている Tableau Desktop の公開ダイアログ" border />
<br/>

さらに、「Update workbook to use the published data source」を選択します。

<Image size="sm" img={tableau_desktop_05} alt="'Update workbook to use the published data source' オプションにチェックが入っている Tableau Desktop の公開ダイアログ" border />
<br/>

最後に「Publish」をクリックすると、認証情報が埋め込まれたデータソースが自動的に Tableau Online で開かれます。

## 既知の制限事項（ClickHouse 23.11） {#known-limitations-clickhouse-2311}

既知の制限事項はすべて ClickHouse `23.11` で修正されています。その他の非互換性が発生した場合は、[お問い合わせ](https://clickhouse.com/company/contact)いただくか、[新しい issue](https://github.com/ClickHouse/ClickHouse/issues) を作成してください。
