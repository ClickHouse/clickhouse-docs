---
sidebar_label: 'DataGrip'
slug: /integrations/datagrip
description: 'DataGrip は、ClickHouse を標準でサポートしているデータベース IDE です。'
title: 'DataGrip を ClickHouse に接続する'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'sql_client'
  - website: 'https://www.jetbrains.com/datagrip/'
keywords: ['DataGrip', 'データベース IDE', 'JetBrains', 'SQL クライアント', '統合開発環境']
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import datagrip_1 from '@site/static/images/integrations/sql-clients/datagrip-1.png';
import datagrip_5 from '@site/static/images/integrations/sql-clients/datagrip-5.png';
import datagrip_6 from '@site/static/images/integrations/sql-clients/datagrip-6.png';
import datagrip_7 from '@site/static/images/integrations/sql-clients/datagrip-7.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# DataGrip を ClickHouse に接続する \{#connecting-datagrip-to-clickhouse\}

<CommunityMaintainedBadge/>

## DataGrip を起動するかダウンロードする \{#start-or-download-datagrip\}

DataGrip は https://www.jetbrains.com/datagrip/ からダウンロードできます。

## 1. 接続情報を準備する \{#1-gather-your-connection-details\}

<ConnectionDetails />

## 2. ClickHouse ドライバーを読み込む \{#2-load-the-clickhouse-driver\}

1. DataGrip を起動し、**Data Sources and Drivers** ダイアログの **Data Sources** タブで **+** アイコンをクリックします。

<Image img={datagrip_5} size="lg" border alt="+ アイコンがハイライトされた DataGrip の Data Sources タブ" />

**ClickHouse** を選択します。

:::tip
  接続を作成していくと一覧の順序が変わるため、ClickHouse がまだリストの一番上にない場合があります。
  :::

<Image img={datagrip_6} size="sm" border alt="データソース一覧から ClickHouse を選択している DataGrip" />

- **Drivers** タブに切り替え、ClickHouse ドライバーを読み込みます。

  DataGrip はダウンロードサイズを最小限に抑えるため、ドライバーを同梱していません。**Drivers** タブで
  **Complete Support** リストから **ClickHouse** を選択し、**+** 記号を展開します。**Provided Driver** オプションから **Latest stable** ドライバーを選択します。

<Image img={datagrip_1} size="lg" border alt="ClickHouse ドライバーのインストールを表示している DataGrip の Drivers タブ" />

## 3. ClickHouse に接続する \{#3-connect-to-clickhouse\}

- データベース接続情報を指定して、**Test Connection** をクリックします。  
ステップ 1 で取得した接続情報をもとに、ホスト URL、ポート、ユーザー名、パスワード、データベース名を入力し、接続をテストします。

:::tip
**Host** フィールドには、`https://` などのプロトコルの接頭辞を付けずに、ホスト名のみを入力します（例: `your-host.clickhouse.cloud`）。

ClickHouse Cloud への接続では、Host の下にある **URL** フィールドに `?ssl=true` を追加する必要があります。JDBC URL の完全な例は次のとおりです:

`jdbc:clickhouse://your-host.clickhouse.cloud:8443/default?ssl=true`

ClickHouse Cloud では、すべての接続に SSL 暗号化が必須です。`?ssl=true` クエリパラメータがない場合、認証情報が正しくても "Connection reset" エラーが発生します。

JDBC URL の設定の詳細については、[ClickHouse JDBC driver](https://github.com/ClickHouse/clickhouse-java) リポジトリを参照してください。
:::

<Image img={datagrip_7} border alt="ClickHouse の設定が入力された DataGrip の接続詳細フォーム" />

## さらに詳しく \{#learn-more\}

DataGrip の詳細については DataGrip のドキュメントを参照してください。