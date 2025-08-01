---
sidebar_label: 'Looker Studio'
slug: '/integrations/lookerstudio'
keywords:
- 'clickhouse'
- 'looker'
- 'studio'
- 'connect'
- 'mysql'
- 'integrate'
- 'ui'
description: 'Looker Studio, formerly Google Data Studio, is an online tool for
  converting data into customizable informative reports and dashboards.'
title: 'Looker Studio'
---

import Image from '@theme/IdealImage';
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
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Looker Studio

<CommunityMaintainedBadge/>

Looker Studio は、公式の Google MySQL データソースを使用して MySQL インターフェース経由で ClickHouse に接続できます。

## ClickHouse Cloud の設定 {#clickhouse-cloud-setup}
<MySQLCloudSetup />

## オンプレミスの ClickHouse サーバーの設定 {#on-premise-clickhouse-server-setup}
<MySQLOnPremiseSetup />

## Looker Studio を ClickHouse に接続する {#connecting-looker-studio-to-clickhouse}

まず、Google アカウントを使用して https://lookerstudio.google.com にログインし、新しいデータソースを作成します。

<Image size="md" img={looker_studio_01} alt="Looker Studio インターフェースで新しいデータソースを作成する" border />
<br/>

Google が提供する公式の MySQL コネクタ（名前は **MySQL** のみ）を検索します。

<Image size="md" img={looker_studio_02} alt="Looker Studio コネクタリストでの MySQL コネクタ検索" border />
<br/>

接続の詳細を指定します。デフォルトで MySQL インターフェースのポートは 9004 ですが、サーバーの設定によって異なる場合がありますのでご注意ください。

<Image size="md" img={looker_studio_03} alt="Looker Studio で ClickHouse MySQL 接続の詳細を指定する" border />
<br/>

次に、ClickHouse からデータを取得する方法について2つのオプションがあります。最初に、テーブルブラウザ機能を使用できます：

<Image size="md" img={looker_studio_04} alt="Looker Studio で ClickHouse テーブルを選択するためのテーブルブラウザの使用" border />
<br/>

あるいは、カスタムクエリを指定してデータを取得することもできます：

<Image size="md" img={looker_studio_05} alt="Looker Studio で ClickHouse からデータを取得するためのカスタム SQL クエリの使用" border />
<br/>

最後に、内部のテーブル構造を確認し、必要に応じてデータ型を調整できるようになります。

<Image size="md" img={looker_studio_06} alt="Looker Studio で内部の ClickHouse テーブル構造を表示する" border />
<br/>

これで、データを探索するか、新しいレポートを作成することができます！

## ClickHouse Cloud で Looker Studio を使用する {#using-looker-studio-with-clickhouse-cloud}

ClickHouse Cloud を使用する場合、まず MySQL インターフェースを有効にする必要があります。それは接続ダイアログの「MySQL」タブで行えます。

<Image size="md" img={looker_studio_enable_mysql} alt="ClickHouse Cloud 設定で MySQL インターフェースを有効にする" border />
<br/>

Looker Studio UI で、「SSL を有効にする」オプションを選択します。ClickHouse Cloud の SSL 証明書は [Let's Encrypt](https://letsencrypt.org/certificates/) によって署名されています。このルート証明書を [こちら](https://letsencrypt.org/certs/isrgrootx1.pem) からダウンロードできます。

<Image size="md" img={looker_studio_mysql_cloud} alt="ClickHouse Cloud SSL 設定での Looker Studio 接続構成" border />
<br/>

残りの手順は、前のセクションに記載されているものと同じです。
