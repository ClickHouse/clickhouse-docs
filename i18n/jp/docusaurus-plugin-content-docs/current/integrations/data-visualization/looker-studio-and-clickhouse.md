---
sidebar_label: 'Looker Studio'
slug: /integrations/lookerstudio
keywords: ['clickhouse', 'looker', 'studio', 'connect', 'mysql', 'integrate', 'ui']
description: 'Looker Studio（旧称 Google Data Studio）は、データを柔軟にカスタマイズ可能なレポートやダッシュボードに変換するオンラインツールです。'
title: 'Looker Studio'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
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
import PartnerBadge from '@theme/badges/PartnerBadge';


# Looker Studio

<PartnerBadge/>

Looker Studio は、公式の Google MySQL データソースを使用して、MySQL インターフェイス経由で ClickHouse に接続できます。



## ClickHouse Cloud のセットアップ {#clickhouse-cloud-setup}

<MySQLCloudSetup />


## オンプレミスClickHouseサーバーのセットアップ {#on-premise-clickhouse-server-setup}

<MySQLOnPremiseSetup />


## Looker StudioをClickHouseに接続する {#connecting-looker-studio-to-clickhouse}

まず、Googleアカウントを使用してhttps://lookerstudio.google.comにログインし、新しいデータソースを作成します:

<Image
  size='md'
  img={looker_studio_01}
  alt='Looker Studioインターフェースで新しいデータソースを作成'
  border
/>
<br />

Googleが提供する公式MySQLコネクタ(名称は単に**MySQL**)を検索します:

<Image
  size='md'
  img={looker_studio_02}
  alt='Looker StudioコネクタリストでのMySQLコネクタ検索'
  border
/>
<br />

接続の詳細を指定します。MySQLインターフェースポートはデフォルトで9004ですが、サーバー構成によって異なる場合があることに注意してください。

<Image
  size='md'
  img={looker_studio_03}
  alt='Looker StudioでClickHouse MySQL接続の詳細を指定'
  border
/>
<br />

ClickHouseからデータを取得する方法には2つのオプションがあります。1つ目は、テーブルブラウザ機能を使用する方法です:

<Image
  size='md'
  img={looker_studio_04}
  alt='Looker Studioでテーブルブラウザを使用してClickHouseテーブルを選択'
  border
/>
<br />

または、カスタムクエリを指定してデータを取得することもできます:

<Image
  size='md'
  img={looker_studio_05}
  alt='Looker StudioでカスタムSQLクエリを使用してClickHouseからデータを取得'
  border
/>
<br />

最後に、検出されたテーブル構造を確認し、必要に応じてデータ型を調整できます。

<Image
  size='md'
  img={looker_studio_06}
  alt='Looker Studioで検出されたClickHouseテーブル構造を表示'
  border
/>
<br />

これで、データの探索や新しいレポートの作成を進めることができます!


## ClickHouse CloudでLooker Studioを使用する {#using-looker-studio-with-clickhouse-cloud}

ClickHouse Cloudを使用する場合は、まずMySQLインターフェースを有効にする必要があります。接続ダイアログの「MySQL」タブで有効化できます。

<Image
  size='md'
  img={looker_studio_enable_mysql}
  alt='ClickHouse Cloud設定でMySQLインターフェースを有効化'
  border
/>
<br />

Looker StudioのUIで「Enable SSL」オプションを選択します。ClickHouse CloudのSSL証明書は[Let's Encrypt](https://letsencrypt.org/certificates/)によって署名されています。ルート証明書は[こちら](https://letsencrypt.org/certs/isrgrootx1.pem)からダウンロードできます。

<Image
  size='md'
  img={looker_studio_mysql_cloud}
  alt='ClickHouse CloudのSSL設定を使用したLooker Studioの接続構成'
  border
/>
<br />

残りの手順は前のセクションに記載されているものと同じです。
