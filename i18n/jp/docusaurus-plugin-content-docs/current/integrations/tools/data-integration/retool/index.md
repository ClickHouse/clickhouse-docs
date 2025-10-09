---
'sidebar_label': 'Retool'
'slug': '/integrations/retool'
'keywords':
- 'clickhouse'
- 'retool'
- 'connect'
- 'integrate'
- 'ui'
- 'admin'
- 'panel'
- 'dashboard'
- 'nocode'
- 'no-code'
'description': "豊富なユーザーインターフェースを持つウェブおよびモバイルアプリを迅速に構築し、複雑なタスクを自動化し、AIを統合します\b0;すべてはあなたのデータによって支えられています。"
'title': 'RetoolとClickHouseの接続'
'doc_type': 'guide'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import retool_01 from '@site/static/images/integrations/tools/data-integration/retool/retool_01.png';
import retool_02 from '@site/static/images/integrations/tools/data-integration/retool/retool_02.png';
import retool_03 from '@site/static/images/integrations/tools/data-integration/retool/retool_03.png';
import retool_04 from '@site/static/images/integrations/tools/data-integration/retool/retool_04.png';
import retool_05 from '@site/static/images/integrations/tools/data-integration/retool/retool_05.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# RetoolをClickHouseに接続する

<CommunityMaintainedBadge/>

## 1. 接続詳細を収集する {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. ClickHouseリソースを作成する {#2-create-a-clickhouse-resource}

Retoolアカウントにログインし、_Resources_ タブに移動します。「Create New」 -> 「Resource」を選択します:

<Image img={retool_01} size="lg" border alt="新しいリソースを作成する" />
<br/>

利用可能なコネクタのリストから「JDBC」を選択します:

<Image img={retool_02} size="lg" border alt="JDBCコネクタの選択" />
<br/>

セットアップウィザードで、「Driver name」として `com.clickhouse.jdbc.ClickHouseDriver` を選択することを確認します:

<Image img={retool_03} size="lg" border alt="正しいドライバーの選択" />
<br/>

次の形式でClickHouseの資格情報を入力します: `jdbc:clickhouse://HOST:PORT/DATABASE?user=USERNAME&password=PASSWORD`。
インスタンスがSSLを必要とする場合やClickHouse Cloudを使用している場合は、接続文字列に `&ssl=true` を追加します。これにより、次のようになります: `jdbc:clickhouse://HOST:PORT/DATABASE?user=USERNAME&password=PASSWORD&ssl=true`

<Image img={retool_04} size="lg" border alt="資格情報を指定する" />
<br/>

その後、接続をテストします:

<Image img={retool_05} size="lg" border alt="接続のテスト" />
<br/>

これで、ClickHouseリソースを使用してアプリに進むことができるはずです。
