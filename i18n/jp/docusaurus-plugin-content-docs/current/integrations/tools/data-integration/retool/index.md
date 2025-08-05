---
sidebar_label: 'Retool'
slug: '/integrations/retool'
keywords:
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
description: 'Quickly build web and mobile apps with rich user interfaces, automate
  complex tasks, and integrate AI—all powered by your data.'
title: 'Connecting Retool to ClickHouse'
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

Retoolアカウントにログインし、_Resources_ タブに移動します。「新規作成」 -> 「リソース」を選択します：

<Image img={retool_01} size="lg" border alt="新しいリソースを作成" />
<br/>

利用可能なコネクタのリストから「JDBC」を選択します：

<Image img={retool_02} size="lg" border alt="JDBCコネクタの選択" />
<br/>

セットアップウィザードで、「ドライバー名」として `com.clickhouse.jdbc.ClickHouseDriver` を選択してください：

<Image img={retool_03} size="lg" border alt="適切なドライバーを選択" />
<br/>

次の形式でClickHouseの認証情報を入力します: `jdbc:clickhouse://HOST:PORT/DATABASE?user=USERNAME&password=PASSWORD`。
インスタンスがSSLを要求する場合、またはClickHouse Cloudを使用している場合は、接続文字列に `&ssl=true` を追加します。この場合、次のようになります: `jdbc:clickhouse://HOST:PORT/DATABASE?user=USERNAME&password=PASSWORD&ssl=true`

<Image img={retool_04} size="lg" border alt="認証情報を指定" />
<br/>

その後、接続をテストします：

<Image img={retool_05} size="lg" border alt="接続をテスト" />
<br/>

これで、ClickHouseリソースを使用してアプリに進むことができるはずです。
