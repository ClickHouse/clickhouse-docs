---
sidebar_label: Looker Studio
slug: /integrations/lookerstudio
keywords: [clickhouse, looker, studio, connect, mysql, integrate, ui]
description: Looker Studio（以前のGoogle Data Studio）は、データをカスタマイズ可能な情報レポートおよびダッシュボードに変換するオンラインツールです。
---

import MySQLCloudSetup from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_clickhouse_mysql_cloud_setup.mdx';
import MySQLOnPremiseSetup from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_clickhouse_mysql_on_premise_setup.mdx';

# Looker Studio

Looker Studioは、公式のGoogle MySQLデータソースを使用してMySQLインターフェース経由でClickHouseに接続できます。

## ClickHouseクラウドセットアップ {#clickhouse-cloud-setup}
<MySQLCloudSetup />

## オンプレミスClickHouseサーバーセットアップ {#on-premise-clickhouse-server-setup}
<MySQLOnPremiseSetup />

## Looker StudioをClickHouseに接続する {#connecting-looker-studio-to-clickhouse}

まず、Googleアカウントを使用して https://lookerstudio.google.com にログインし、新しいデータソースを作成します。

<img src={require('./images/looker_studio_01.png').default} class="image" alt="新しいデータソースの作成" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Googleが提供する公式のMySQLコネクタを検索します（名前はそのまま**MySQL**です）：

<img src={require('./images/looker_studio_02.png').default} class="image" alt="MySQLコネクタ検索" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

接続詳細を指定します。デフォルトでMySQLインターフェースのポートは9004ですが、サーバーの構成によって異なる場合があります。

<img src={require('./images/looker_studio_03.png').default} class="image" alt="接続詳細の指定" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

次に、ClickHouseからデータを取得する方法が2つあります。まずは、テーブルブラウザ機能を使用できます：

<img src={require('./images/looker_studio_04.png').default} class="image" alt="テーブルブラウザの使用" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

または、カスタムクエリを指定してデータを取得することもできます：

<img src={require('./images/looker_studio_05.png').default} class="image" alt="カスタムクエリを使用してデータを取得する" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

最終的に、インストロスペクトされたテーブル構造を確認し、必要に応じてデータ型を調整できるはずです。

<img src={require('./images/looker_studio_06.png').default} class="image" alt="インストロスペクトされたテーブル構造の確認" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

これで、データを探査したり、新しいレポートを作成したりする準備が整いました！

## ClickHouseクラウドでのLooker Studioの使用 {#using-looker-studio-with-clickhouse-cloud}

ClickHouseクラウドを使用する場合、まずMySQLインターフェースを有効にする必要があります。接続ダイアログの「MySQL」タブでこれを行うことができます。

<img src={require('./images/looker_studio_enable_mysql.png').default} class="image" alt="Looker StudioではまずMySQLの有効化が必要" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Looker StudioのUIで「SSLを有効にする」オプションを選択します。ClickHouse CloudのSSL証明書は[Let's Encrypt](https://letsencrypt.org/certificates/)によって署名されています。このルート証明書は[こちら](https://letsencrypt.org/certs/isrgrootx1.pem)からダウンロードできます。

<img src={require('./images/looker_studio_mysql_cloud.png').default} class="image" alt="Looker StudioとClickHouse CloudのSSL構成" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

残りの手順は、前のセクションに記載されているものと同じです。
