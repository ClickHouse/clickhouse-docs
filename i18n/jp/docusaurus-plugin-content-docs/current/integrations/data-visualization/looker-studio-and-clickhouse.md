---
sidebar_label: Looker Studio
slug: /integrations/lookerstudio
keywords: [clickhouse, looker, studio, connect, mysql, integrate, ui]
description: Looker Studio, formerly Google Data Studio, is an online tool for converting data into customizable informative reports and dashboards.
---

import MySQLCloudSetup from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_clickhouse_mysql_cloud_setup.mdx';
import MySQLOnPremiseSetup from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_clickhouse_mysql_on_premise_setup.mdx';
import looker_studio_01 from '@site/static/images/integrations/data-visualization/looker_studio_01.png';
import looker_studio_02 from '@site/static/images/integrations/data-visualization/looker_studio_02.png';
import looker_studio_03 from '@site/static/images/integrations/data-visualization/looker_studio_03.png';
import looker_studio_04 from '@site/static/images/integrations/data-visualization/looker_studio_04.png';
import looker_studio_05 from '@site/static/images/integrations/data-visualization/looker_studio_05.png';
import looker_studio_06 from '@site/static/images/integrations/data-visualization/looker_studio_06.png';
import looker_studio_enable_mysql from '@site/static/images/integrations/data-visualization/looker_studio_enable_mysql.png';
import looker_studio_mysql_cloud from '@site/static/images/integrations/data-visualization/looker_studio_mysql_cloud.png';


# Looker Studio

Looker Studioは、公式のGoogle MySQLデータソースを使用して、MySQLインターフェース経由でClickHouseに接続することができます。

## ClickHouse Cloud Setup {#clickhouse-cloud-setup}
<MySQLCloudSetup />

## On-premise ClickHouse Server Setup {#on-premise-clickhouse-server-setup}
<MySQLOnPremiseSetup />

## Connecting Looker Studio to ClickHouse {#connecting-looker-studio-to-clickhouse}

まず、Googleアカウントを使用して https://lookerstudio.google.com にログインし、新しいデータソースを作成します:

<img src={looker_studio_01} class="image" alt="Creating a new data source" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Googleが提供する公式のMySQLコネクタ（**MySQL**という名前）の検索を行います:

<img src={looker_studio_02} class="image" alt="MySQL connector search" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

接続詳細を指定します。MySQLインターフェースのポートはデフォルトで9004ですが、サーバー設定によっては異なる場合がありますのでご注意ください。

<img src={looker_studio_03} class="image" alt="Specifying the connection details" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

データをClickHouseから取得する方法は2つあります。まず、Table Browser機能を使用することができます:

<img src={looker_studio_04} class="image" alt="Using the Table Browser" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

または、カスタムクエリを指定してデータを取得することもできます:

<img src={looker_studio_05} class="image" alt="Using a custom query to fetch the data" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

最後に、照会したテーブル構造が表示され、必要に応じてデータ型を調整することができます。

<img src={looker_studio_06} class="image" alt="Viewing the introspected table structure" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

これでデータを探索したり、新しいレポートを作成したりすることができます!

## Using Looker Studio with ClickHouse Cloud {#using-looker-studio-with-clickhouse-cloud}

ClickHouse Cloudを使用する場合、まずMySQLインターフェースを有効にする必要があります。それは接続ダイアログの「MySQL」タブで行えます。

<img src={looker_studio_enable_mysql} class="image" alt="Looker Studio Require MySQL enabled first" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Looker StudioのUIでは、「SSLを有効にする」オプションを選択します。ClickHouse CloudのSSL証明書は[Let's Encrypt](https://letsencrypt.org/certificates/)によって署名されています。このルート証明書は[こちら](https://letsencrypt.org/certs/isrgrootx1.pem)からダウンロードできます。

<img src={looker_studio_mysql_cloud} class="image" alt="Looker Studio with ClickHouse Cloud SSL Config" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

残りの手順は、前のセクションに記載されているものと同様です。
