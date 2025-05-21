---
sidebar_label: 'Looker Studio'
slug: /integrations/lookerstudio
keywords: ['clickhouse', 'looker', 'studio', 'connect', 'mysql', 'integrate', 'ui']
description: 'Looker Studio（旧 Google Data Studio）は、データをカスタマイズ可能な情報レポートやダッシュボードに変換するためのオンラインツールです。'
title: 'Looker Studio'
---

import Image from '@theme/IdealImage';
import MySQLCloudSetup from '@site/docs/_snippets/_clickhouse_mysql_cloud_setup.mdx';
import MySQLOnPremiseSetup from '@site/docs/_snippets/_clickhouse_mysql_on_premise_setup.mdx';
import looker_studio_01 from '@site/static/images/integrations/data-visualization/looker_studio_01.png';
import looker_studio_02 from '@site/static/images/integrations/data-visualization/looker_studio_02.png';
import looker_studio_03 from '@site/static/images/integrations/data-visualization/looker_studio_03.png';
import looker_studio_04 from '@site/static/images/integrations/data-visualization/looker_studio_04.png';
import looker_studio_05 from '@site/static/images/integrations/data-visualization/looker_studio_05.png';
import looker_studio_06 from '@site/static/images/integrations/data-visualization/looker_studio_06.png';
import looker_studio_enable_mysql from '@site/static/images/integrations/data-visualization/looker_studio_enable_mysql.png';
import looker_studio_mysql_cloud from '@site/static/images/integrations/data-visualization/looker_studio_mysql_cloud.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Looker Studio

<CommunityMaintainedBadge/>

Looker Studioは、公式Google MySQLデータソースを使用してMySQLインターフェースを介してClickHouseに接続できます。

## ClickHouse Cloud Setup {#clickhouse-cloud-setup}
<MySQLCloudSetup />

## On-premise ClickHouse Server Setup {#on-premise-clickhouse-server-setup}
<MySQLOnPremiseSetup />

## Connecting Looker Studio to ClickHouse {#connecting-looker-studio-to-clickhouse}

まず、Googleアカウントを使用して https://lookerstudio.google.com にログインし、新しいデータソースを作成します。

<Image size="md" img={looker_studio_01} alt="Looker Studioインターフェースで新しいデータソースを作成" border />
<br/>

Googleが提供する公式MySQLコネクタ（**MySQL**という名前）を検索します。

<Image size="md" img={looker_studio_02} alt="Looker StudioコネクタリストでのMySQLコネクタ検索" border />
<br/>

接続の詳細を指定します。MySQLインターフェースポートはデフォルトで9004で、サーバーの設定によって異なる場合がありますのでご注意ください。

<Image size="md" img={looker_studio_03} alt="Looker StudioでClickHouse MySQL接続の詳細を指定" border />
<br/>

次に、ClickHouseからデータを取得する方法が2つあります。まず、テーブルブラウザ機能を使用できます。

<Image size="md" img={looker_studio_04} alt="Looker StudioでClickHouseテーブルを選択するためのテーブルブラウザの使用" border />
<br/>

または、カスタムクエリを指定してデータを取得することもできます。

<Image size="md" img={looker_studio_05} alt="Looker StudioでClickHouseからデータを取得するためのカスタムSQLクエリの使用" border />
<br/>

最後に、インタースペクトされたテーブル構造を表示し、必要に応じてデータ型を調整できるようになるはずです。

<Image size="md" img={looker_studio_06} alt="Looker StudioでインタースペクトされたClickHouseテーブル構造を表示" border />
<br/>

これでデータの探索や新しいレポートの作成を続行できます！

## Using Looker Studio with ClickHouse Cloud {#using-looker-studio-with-clickhouse-cloud}

ClickHouse Cloudを使用する場合、最初にMySQLインターフェースを有効にする必要があります。それは接続ダイアログの「MySQL」タブで行うことができます。

<Image size="md" img={looker_studio_enable_mysql} alt="ClickHouse Cloud設定でMySQLインターフェースを有効にする" border />
<br/>

Looker StudioのUIで「SSLを有効にする」オプションを選択します。ClickHouse CloudのSSL証明書は、[Let's Encrypt](https://letsencrypt.org/certificates/)によって署名されています。このルート証明書は[こちら](https://letsencrypt.org/certs/isrgrootx1.pem)からダウンロードできます。

<Image size="md" img={looker_studio_mysql_cloud} alt="ClickHouse Cloud SSL設定でのLooker Studio接続構成" border />
<br/>

残りの手順は、前のセクションで説明した内容と同じです。
