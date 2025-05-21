---
sidebar_label: 'Retool'
slug: /integrations/retool
keywords: ['clickhouse', 'retool', 'connect', 'integrate', 'ui', 'admin', 'panel', 'dashboard', 'nocode', 'no-code']
description: 'リッチなユーザーインターフェースを持つウェブおよびモバイルアプリを迅速に構築し、複雑なタスクを自動化し、AIを統合します。すべてはあなたのデータによって支えられています。'
title: 'RetoolをClickHouseに接続する'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
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

Retoolアカウントにログインし、_Resources_ タブに移動します。「新規作成」->「リソース」を選択します：

<Image img={retool_01} size="lg" border alt="新しいリソースを作成" />
<br/>

利用可能なコネクタの中から「JDBC」を選択します：

<Image img={retool_02} size="lg" border alt="JDBCコネクタを選択" />
<br/>

セットアップウィザードで、「ドライバ名」として `com.clickhouse.jdbc.ClickHouseDriver` を選択してください：

<Image img={retool_03} size="lg" border alt="適切なドライバを選択" />
<br/>

以下の形式でClickHouseの認証情報を入力します：`jdbc:clickhouse://HOST:PORT/DATABASE?user=USERNAME&password=PASSWORD`。もしインスタンスがSSLを必要とする場合や、ClickHouse Cloudを使用している場合は、接続文字列に `&ssl=true` を追加し、次のようになります：`jdbc:clickhouse://HOST:PORT/DATABASE?user=USERNAME&password=PASSWORD&ssl=true`

<Image img={retool_04} size="lg" border alt="認証情報を指定" />
<br/>

その後、接続をテストします：

<Image img={retool_05} size="lg" border alt="接続をテスト" />
<br/>

これで、ClickHouseリソースを使用してアプリに進むことができるようになります。
