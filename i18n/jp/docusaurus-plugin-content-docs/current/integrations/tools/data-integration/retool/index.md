---
sidebar_label: 'Retool'
slug: /integrations/retool
keywords: ['clickhouse', 'retool', 'connect', 'integrate', 'ui', 'admin', 'panel', 'dashboard', 'nocode', 'no-code']
description: 'リッチなユーザーインターフェースを備えた Web およびモバイルアプリをすばやく構築し、複雑なタスクを自動化し、AI と統合できます ― すべてはあなたのデータを基盤としています。'
title: 'Retool を ClickHouse に接続する'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_integration'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import retool_01 from '@site/static/images/integrations/tools/data-integration/retool/retool_01.png';
import retool_02 from '@site/static/images/integrations/tools/data-integration/retool/retool_02.png';
import retool_03 from '@site/static/images/integrations/tools/data-integration/retool/retool_03.png';
import retool_04 from '@site/static/images/integrations/tools/data-integration/retool/retool_04.png';
import retool_05 from '@site/static/images/integrations/tools/data-integration/retool/retool_05.png';
import PartnerBadge from '@theme/badges/PartnerBadge';


# Retool を ClickHouse に接続する

<PartnerBadge/>



## 1. 接続情報を収集する {#1-gather-your-connection-details}

<ConnectionDetails />


## 2. ClickHouseリソースを作成する {#2-create-a-clickhouse-resource}

Retoolアカウントにログインし、_Resources_タブに移動します。「Create New」→「Resource」を選択します：

<Image img={retool_01} size='lg' border alt='新しいリソースの作成' />
<br />

利用可能なコネクタのリストから「JDBC」を選択します：

<Image img={retool_02} size='lg' border alt='JDBCコネクタの選択' />
<br />

セットアップウィザードで、「Driver name」として`com.clickhouse.jdbc.ClickHouseDriver`を選択してください：

<Image img={retool_03} size='lg' border alt='適切なドライバの選択' />
<br />

ClickHouseの認証情報を次の形式で入力します：`jdbc:clickhouse://HOST:PORT/DATABASE?user=USERNAME&password=PASSWORD`。
インスタンスでSSLが必要な場合、またはClickHouse Cloudを使用している場合は、接続文字列に`&ssl=true`を追加して、`jdbc:clickhouse://HOST:PORT/DATABASE?user=USERNAME&password=PASSWORD&ssl=true`のようにします。

<Image img={retool_04} size='lg' border alt='認証情報の指定' />
<br />

その後、接続をテストします：

<Image img={retool_05} size='lg' border alt='接続のテスト' />
<br />

これで、ClickHouseリソースを使用してアプリケーションに進むことができるようになります。
