---
'sidebar_label': 'Looker Studio'
'slug': '/integrations/lookerstudio'
'keywords':
- 'clickhouse'
- 'looker'
- 'studio'
- 'connect'
- 'mysql'
- 'integrate'
- 'ui'
'description': 'Looker Studio、以前は Google Data Studio として知られていた、データをカスタマイズ可能な情報レポートやダッシュボードに変換するためのオンラインツールです。'
'title': 'Looker Studio'
'doc_type': 'guide'
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

## オンプレミスの ClickHouse サーバー設定 {#on-premise-clickhouse-server-setup}
<MySQLOnPremiseSetup />

## Looker Studio を ClickHouse に接続する {#connecting-looker-studio-to-clickhouse}

まず、あなたの Google アカウントを使用して https://lookerstudio.google.com にログインし、新しいデータソースを作成します。

<Image size="md" img={looker_studio_01} alt="Looker Studio インターフェースでの新しいデータソースの作成" border />
<br/>

Google が提供する公式の MySQL コネクタ（**MySQL** という名前）を検索します。

<Image size="md" img={looker_studio_02} alt="Looker Studio コネクタリストでの MySQL コネクタ検索" border />
<br/>

接続の詳細を指定します。なお、MySQL インターフェースのポートはデフォルトで 9004 ですが、サーバー構成により異なる場合があります。

<Image size="md" img={looker_studio_03} alt="Looker Studio での ClickHouse MySQL 接続の詳細指定" border />
<br/>

次に、ClickHouse からデータを取得する方法が二つあります。まず、テーブルブラウザ機能を使用できます。

<Image size="md" img={looker_studio_04} alt="Looker Studio での ClickHouse テーブルの選択にテーブルブラウザを使用" border />
<br/>

または、カスタムクエリを指定してデータを取得することもできます。

<Image size="md" img={looker_studio_05} alt="Looker Studio での ClickHouse からデータを取得するカスタム SQL クエリの使用" border />
<br/>

最後に、イントロスペクトされたテーブル構造が表示され、必要に応じてデータ型を調整できます。

<Image size="md" img={looker_studio_06} alt="Looker Studio でのイントロスペクトされた ClickHouse テーブル構造の表示" border />
<br/>

これで、データを探索したり、新しいレポートを作成したりすることができます！

## ClickHouse Cloud での Looker Studio の使用 {#using-looker-studio-with-clickhouse-cloud}

ClickHouse Cloud を使用する場合は、まず MySQL インターフェースを有効にする必要があります。接続ダイアログの「MySQL」タブで行えます。

<Image size="md" img={looker_studio_enable_mysql} alt="ClickHouse Cloud 設定での MySQL インターフェースの有効化" border />
<br/>

Looker Studio の UI で、「SSL を有効にする」オプションを選択します。ClickHouse Cloud の SSL 証明書は [Let's Encrypt](https://letsencrypt.org/certificates/) によって署名されています。このルート証明書は [こちら](https://letsencrypt.org/certs/isrgrootx1.pem) からダウンロードできます。

<Image size="md" img={looker_studio_mysql_cloud} alt="ClickHouse Cloud SSL 設定での Looker Studio 接続構成" border />
<br/>

残りの手順は、前のセクションに記載されているのと同様です。
