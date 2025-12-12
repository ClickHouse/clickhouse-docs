---
sidebar_label: 'Looker Studio'
slug: /integrations/lookerstudio
keywords: ['clickhouse', 'looker', 'studio', 'connect', 'mysql', 'integrate', 'ui']
description: 'Looker Studio（旧称 Google Data Studio）は、データをカスタマイズ可能な情報レポートやダッシュボードに変換するオンラインツールです。'
title: 'Looker Studio'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
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
import PartnerBadge from '@theme/badges/PartnerBadge';

# Looker Studio {#looker-studio}

<PartnerBadge/>

Looker Studio は、公式の Google MySQL データソースを使用して、MySQL インターフェース経由で ClickHouse に接続できます。

## ClickHouse Cloud のセットアップ {#clickhouse-cloud-setup}
<MySQLCloudSetup />

## オンプレミス環境での ClickHouse サーバーのセットアップ {#on-premise-clickhouse-server-setup}
<MySQLOnPremiseSetup />

## Looker Studio を ClickHouse に接続する {#connecting-looker-studio-to-clickhouse}

まず、Google アカウントで https://lookerstudio.google.com にログインし、新しい Data Source を作成します:

<Image size="md" img={looker_studio_01} alt="Looker Studio インターフェースで新しいデータソースを作成する" border />
<br/>

Google が提供する公式の MySQL コネクタ（名前は **MySQL**）を検索します:

<Image size="md" img={looker_studio_02} alt="Looker Studio のコネクタ一覧で MySQL コネクタを検索する" border />
<br/>

接続情報を入力します。MySQL インターフェースのポートはデフォルトで 9004 ですが、
サーバー構成によっては異なる場合がある点に注意してください。

<Image size="md" img={looker_studio_03} alt="Looker Studio で ClickHouse MySQL 接続情報を指定する" border />
<br/>

次に、ClickHouse からデータを取得する方法として 2 つの方法があります。1 つ目は、Table Browser 機能を使用する方法です:

<Image size="md" img={looker_studio_04} alt="Looker Studio で Table Browser を使用して ClickHouse テーブルを選択する" border />
<br/>

もう 1 つは、カスタム SQL クエリを指定してデータを取得する方法です:

<Image size="md" img={looker_studio_05} alt="Looker Studio でカスタム SQL クエリを使用して ClickHouse からデータを取得する" border />
<br/>

最後に、自動解析されたテーブル構造を確認し、必要に応じてデータ型を調整できます。

<Image size="md" img={looker_studio_06} alt="Looker Studio で自動解析された ClickHouse テーブル構造を表示する" border />
<br/>

これで、データの探索や新しいレポートの作成に進むことができます。

## ClickHouse Cloud で Looker Studio を使用する {#using-looker-studio-with-clickhouse-cloud}

ClickHouse Cloud を使用する場合は、まず MySQL インターフェイスを有効にする必要があります。接続ダイアログの「MySQL」タブで有効にできます。

<Image size="md" img={looker_studio_enable_mysql} alt="ClickHouse Cloud の設定で MySQL インターフェイスを有効にする" border />
<br/>

Looker Studio の UI では、「Enable SSL」オプションを選択します。ClickHouse Cloud の SSL 証明書は [Let's Encrypt](https://letsencrypt.org/certificates/) によって署名されています。このルート証明書は [こちら](https://letsencrypt.org/certs/isrgrootx1.pem) からダウンロードできます。

<Image size="md" img={looker_studio_mysql_cloud} alt="ClickHouse Cloud の SSL 設定を用いた Looker Studio の接続構成" border />
<br/>

残りの手順は前のセクションで説明した内容と同じです。
