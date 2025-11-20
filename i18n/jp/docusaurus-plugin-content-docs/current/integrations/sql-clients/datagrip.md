---
sidebar_label: 'DataGrip'
slug: /integrations/datagrip
description: 'DataGrip は、ClickHouse を標準でサポートするデータベース IDE です。'
title: 'DataGrip を ClickHouse に接続する'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'sql_client'
  - website: 'https://www.jetbrains.com/datagrip/'
keywords: ['DataGrip', 'database IDE', 'JetBrains', 'SQL クライアント', '統合開発環境']
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import datagrip_1 from '@site/static/images/integrations/sql-clients/datagrip-1.png';
import datagrip_5 from '@site/static/images/integrations/sql-clients/datagrip-5.png';
import datagrip_6 from '@site/static/images/integrations/sql-clients/datagrip-6.png';
import datagrip_7 from '@site/static/images/integrations/sql-clients/datagrip-7.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# DataGrip から ClickHouse へ接続する

<CommunityMaintainedBadge/>



## DataGripの起動またはダウンロード {#start-or-download-datagrip}

DataGripは https://www.jetbrains.com/datagrip/ から入手できます


## 1. 接続情報を収集する {#1-gather-your-connection-details}

<ConnectionDetails />


## 2. ClickHouseドライバーの読み込み {#2-load-the-clickhouse-driver}

1. DataGripを起動し、**Data Sources and Drivers**ダイアログの**Data Sources**タブで**+**アイコンをクリックします

<Image
  img={datagrip_5}
  size='lg'
  border
  alt='DataGripのData Sourcesタブで+アイコンがハイライトされている'
/>

**ClickHouse**を選択します

:::tip
接続を確立していくと順序が変わるため、ClickHouseがまだリストの最上部にない場合があります。
:::

<Image
  img={datagrip_6}
  size='sm'
  border
  alt='DataGripでデータソースリストからClickHouseを選択している'
/>

- **Drivers**タブに切り替えて、ClickHouseドライバーを読み込みます

  DataGripはダウンロードサイズを最小限に抑えるため、ドライバーを同梱していません。**Drivers**タブで
  **Complete Support**リストから**ClickHouse**を選択し、**+**記号を展開します。**Provided Driver**オプションから**Latest stable**ドライバーを選択します:

<Image
  img={datagrip_1}
  size='lg'
  border
  alt='DataGripのDriversタブでClickHouseドライバーのインストールを表示している'
/>


## 3. ClickHouseへの接続 {#3-connect-to-clickhouse}

- データベース接続の詳細を指定し、**Test Connection**をクリックします。
  ステップ1で収集した接続情報を入力します。ホストURL、ポート、ユーザー名、パスワード、データベース名を入力したら、接続をテストします。

:::tip
**Host**フィールドには、ホスト名のみを入力してください（例：`your-host.clickhouse.cloud`）。`https://`などのプロトコルプレフィックスは含めないでください。

ClickHouse Cloud接続の場合、ホストの下にある**URL**フィールドに`?ssl=true`を追加する必要があります。完全なJDBC URLは次のようになります：

`jdbc:clickhouse://your-host.clickhouse.cloud:8443/default?ssl=true`

ClickHouse Cloudはすべての接続でSSL暗号化が必須です。`?ssl=true`パラメータがない場合、正しい認証情報を使用していても「Connection reset」エラーが発生します。

JDBC URLの設定の詳細については、[ClickHouse JDBCドライバー](https://github.com/ClickHouse/clickhouse-java)リポジトリを参照してください。
:::

<Image
  img={datagrip_7}
  border
  alt='ClickHouse設定を含むDataGrip接続詳細フォーム'
/>


## 詳細情報 {#learn-more}

DataGripの詳細については、DataGripのドキュメントを参照してください。
