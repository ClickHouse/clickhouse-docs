---
sidebar_label: 'Tableau Online'
sidebar_position: 2
slug: /integrations/tableau-online
keywords: ['clickhouse', 'tableau', 'online', 'mysql', 'connect', 'integrate', 'ui']
description: 'Tableau Online は、場所を問わず、人々がデータの力を簡単に活用し、より迅速かつ自信を持って意思決定できるようにします。'
title: 'Tableau Online'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
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


# Tableau Online \{#tableau-online\}

Tableau Online は、公式の MySQL データソースを使用し、MySQL インターフェイス経由で ClickHouse Cloud またはオンプレミス環境の ClickHouse 構成に接続できます。

## ClickHouse Cloud のセットアップ \{#clickhouse-cloud-setup\}

<MySQLCloudSetup />

## オンプレミスの ClickHouse サーバーのセットアップ \{#on-premise-clickhouse-server-setup\}

<MySQLOnPremiseSetup />

## Tableau Online から ClickHouse へ接続する（オンプレミス、SSL なし） \{#connecting-tableau-online-to-clickhouse-on-premise-without-ssl\}

Tableau Cloud サイトにログインし、新しい Published Data Source を追加します。

<Image size="md" img={tableau_online_01} alt="Tableau Online のインターフェースで、公開データソースを作成するための「New」ボタンが表示されている画面" border />

<br/>

利用可能なコネクタ一覧から「MySQL」を選択します。

<Image size="md" img={tableau_online_02} alt="MySQL オプションがハイライトされた Tableau Online のコネクタ選択画面" border />

<br/>

ClickHouse のセットアップ時に取得した接続情報を入力します。

<Image size="md" img={tableau_online_03} alt="サーバー、ポート、データベース、および認証情報のフィールドがある Tableau Online の MySQL 接続設定画面" border />

<br/>

Tableau Online がデータベースを解析し、利用可能なテーブル一覧を表示します。右側のキャンバスに、使用したいテーブルをドラッグします。あわせて、「Update Now」をクリックしてデータをプレビューしたり、検出されたフィールドの型や名前を細かく調整したりできます。

<Image size="md" img={tableau_online_04} alt="左側にデータベーステーブル、右側にドラッグ＆ドロップ可能なキャンバスが表示されている Tableau Online のデータソース画面" border />

<br/>

その後は、右上の「Publish As」をクリックするだけで、通常どおり Tableau Online で新しく作成したデータセットを使用できるようになります。

注意：Tableau Online と Tableau Desktop を併用し、両者で ClickHouse のデータセットを共有したい場合は、Tableau Desktop でもデフォルトの MySQL コネクタを使用してください。その際は、Data Source ドロップダウンから MySQL を選択すると表示されるセットアップガイド（[こちら](https://www.tableau.com/support/drivers)）に従ってください。M1 Mac を使用している場合は、ドライバインストールの回避策について、この [トラブルシューティングスレッド](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac) を参照してください。

## Tableau Online を ClickHouse（Cloud またはオンプレミス環境での SSL 設定）に接続する \{#connecting-tableau-online-to-clickhouse-cloud-or-on-premise-setup-with-ssl\}

Tableau Online の MySQL 接続セットアップウィザードからは SSL 証明書を指定できないため、  
Tableau Desktop を使って接続を設定し、その接続を Tableau Online にエクスポートする方法しかありません。この手順自体は比較的簡単です。

Windows または Mac マシンで Tableau Desktop を起動し、「Connect」 -> 「To a Server」 -> 「MySQL」を選択します。  
最初にマシンへ MySQL ドライバのインストールが必要になる場合があります。  
Data Source のドロップダウンで MySQL を選択すると表示されるセットアップガイドに従うことで、[こちら](https://www.tableau.com/support/drivers)からインストールできます。  
M1 Mac を使用している場合は、ドライバインストールの回避策として [このトラブルシューティングスレッド](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac) を確認してください。

<Image size="md" img={tableau_desktop_01} alt="Tableau Desktop のインターフェイスで、Connect メニュー内の MySQL オプションがハイライトされている画面" border />

<br/>

:::note
MySQL 接続のセットアップ UI で、必ず "SSL" オプションを有効にしてください。  
ClickHouse Cloud の SSL 証明書は [Let's Encrypt](https://letsencrypt.org/certificates/) によって署名されています。  
ルート証明書は [こちら](https://letsencrypt.org/certs/isrgrootx1.pem) からダウンロードできます。
:::

ClickHouse Cloud インスタンスの MySQL ユーザーの認証情報と、ダウンロードしたルート証明書へのパスを指定します。

<Image size="sm" img={tableau_desktop_02} alt="Tableau Desktop の MySQL 接続ダイアログ。SSL オプションが有効で、サーバー名、ユーザー名、パスワード、証明書の入力フィールドが表示されている画面" border />

<br/>

通常どおり（Tableau Online の場合と同様に）必要なテーブルを選択し、  
「Server」 -> 「Publish Data Source」 -> Tableau Cloud を選択します。

<Image size="md" img={tableau_desktop_03} alt="Tableau Desktop の Server メニューで、Publish Data Source オプションがハイライトされている画面" border />

<br/>

重要: 「Authentication」オプションで "Embedded password" を選択する必要があります。

<Image size="md" img={tableau_desktop_04} alt="Tableau Desktop の公開ダイアログで、Authentication オプションの Embedded password が選択されている画面" border />

<br/>

さらに、「Update workbook to use the published data source」を選択します。

<Image size="sm" img={tableau_desktop_05} alt="Tableau Desktop の公開ダイアログで、「Update workbook to use the published data source」オプションにチェックが入っている画面" border />

<br/>

最後に「Publish」をクリックすると、認証情報を埋め込んだデータソースが自動的に Tableau Online で開かれます。

## 既知の制限事項 (ClickHouse 23.11) \{#known-limitations-clickhouse-2311\}

既知の制限事項はすべて ClickHouse `23.11` で解消されています。その他に互換性の問題が見つかった場合は、[お問い合わせ](https://clickhouse.com/company/contact)からご連絡いただくか、[新しい issue](https://github.com/ClickHouse/ClickHouse/issues) を作成してください。