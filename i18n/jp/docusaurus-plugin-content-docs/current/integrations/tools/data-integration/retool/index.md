---
sidebar_label: 'Retool'
slug: /integrations/retool
keywords: ['clickhouse', 'retool', 'connect', 'integrate', 'ui', 'admin', 'panel', 'dashboard', 'nocode', 'no-code']
description: 'リッチなユーザーインターフェースを備えた Web およびモバイルアプリをすばやく構築し、複雑なタスクを自動化し、AI と統合できます。これらすべてをお客様のデータを基盤として実現します。'
title: 'Retool と ClickHouse を接続する'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_integration'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import retool_01 from '@site/static/images/integrations/tools/data-integration/retool/retool_01.png';
import retool_02 from '@site/static/images/integrations/tools/data-integration/retool/retool_02.png';
import retool_03 from '@site/static/images/integrations/tools/data-integration/retool/retool_03.png';
import retool_04 from '@site/static/images/integrations/tools/data-integration/retool/retool_04.png';
import retool_05 from '@site/static/images/integrations/tools/data-integration/retool/retool_05.png';
import PartnerBadge from '@theme/badges/PartnerBadge';

# Retool を ClickHouse に接続する \{#connecting-retool-to-clickhouse\}

<PartnerBadge/>

## 1. 接続情報を準備する \{#1-gather-your-connection-details\}
<ConnectionDetails />

## 2. ClickHouse リソースを作成する \{#2-create-a-clickhouse-resource\}

Retool アカウントにログインし、_Resources_ タブに移動します。「Create New」 -> 「Resource」を選択します:

<Image img={retool_01} size="lg" border alt="新しいリソースを作成する" />
<br/>

利用可能なコネクタ一覧から「JDBC」を選択します:

<Image img={retool_02} size="lg" border alt="JDBC コネクタを選択する" />
<br/>

セットアップウィザードで、必ず "Driver name" に `com.clickhouse.jdbc.ClickHouseDriver` を選択します:

<Image img={retool_03} size="lg" border alt="正しいドライバーを選択する" />
<br/>

次の形式で ClickHouse の認証情報を入力します: `jdbc:clickhouse://HOST:PORT/DATABASE?user=USERNAME&password=PASSWORD`。
インスタンスで SSL が必須の場合、または ClickHouse Cloud を使用している場合は、接続文字列に `&ssl=true` を追加し、`jdbc:clickhouse://HOST:PORT/DATABASE?user=USERNAME&password=PASSWORD&ssl=true` のようにします。

<Image img={retool_04} size="lg" border alt="認証情報を指定する" />
<br/>

その後、接続をテストします:

<Image img={retool_05} size="lg" border alt="接続をテストする" />
<br/>

これで、ClickHouse リソースを使用してアプリの作成を続行できるようになります。
