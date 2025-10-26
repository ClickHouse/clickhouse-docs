---
'sidebar_label': 'Omni'
'slug': '/integrations/omni'
'keywords':
- 'clickhouse'
- 'Omni'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Omniは、BI、データアプリケーション、および組み込み分析のためのエンタープライズプラットフォームであり、リアルタイムで洞察を探求し共有するのを助けます。'
'title': 'Omni'
'doc_type': 'guide'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import omni_01 from '@site/static/images/integrations/data-visualization/omni_01.png';
import omni_02 from '@site/static/images/integrations/data-visualization/omni_02.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Omni

<CommunityMaintainedBadge/>

Omniは、公式のClickHouseデータソースを介してClickHouse Cloudまたはオンプレミスのデプロイメントに接続できます。

## 1. 接続の詳細を収集する {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. ClickHouseデータソースを作成する {#2-create-a-clickhouse-data-source}

Admin -> Connectionsに移動し、右上隅の「Add Connection」ボタンをクリックします。

<Image size="lg" img={omni_01} alt="ConnectionsセクションにあるAdd Connectionボタンを示すOmni管理インターフェース" border />
<br/>

`ClickHouse`を選択します。フォームに認証情報を入力します。

<Image size="lg" img={omni_02} alt="認証情報フォームフィールドを示すClickHouse用のOmni接続構成インターフェース" border />
<br/>

これで、OmniでClickHouseからデータをクエリして可視化できるようになりました。
