---
sidebar_label: 'DataGrip'
slug: '/integrations/datagrip'
description: 'DataGripは、ボックスからClickHouseをサポートするデータベースIDEです。'
title: 'Connecting DataGrip to ClickHouse'
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import datagrip_1 from '@site/static/images/integrations/sql-clients/datagrip-1.png';
import datagrip_5 from '@site/static/images/integrations/sql-clients/datagrip-5.png';
import datagrip_6 from '@site/static/images/integrations/sql-clients/datagrip-6.png';
import datagrip_7 from '@site/static/images/integrations/sql-clients/datagrip-7.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# DataGripをClickHouseに接続する

<CommunityMaintainedBadge/>

## 1. DataGripを開始またはダウンロードする {#start-or-download-datagrip}

DataGripは https://www.jetbrains.com/datagrip/ で入手できます。

## 2. 接続情報を集める {#1-gather-your-connection-details}
<ConnectionDetails />

## 3. ClickHouseドライバーを読み込む {#2-load-the-clickhouse-driver}

1. DataGripを起動し、**データソース**タブの**データソースとドライバー**ダイアログで**+**アイコンをクリックします。

<Image img={datagrip_5} size="lg" border alt="DataGripのデータソースタブでハイライトされた+アイコン" />

  **ClickHouse**を選択します。

  :::tip
  接続を確立する際に、順序が変更されるため、ClickHouseがリストの上部にない場合があります。
  :::

<Image img={datagrip_6} size="sm" border alt="データソースリストからClickHouseを選択するDataGrip" />

- **ドライバー**タブに切り替えてClickHouseドライバーを読み込みます。

  DataGripはダウンロードサイズを最小限に抑えるために、ドライバーを同梱していません。**ドライバー**タブで、**完全サポート**リストから**ClickHouse**を選択し、**+**アイコンを展開します。**提供されたドライバー**オプションから**最新の安定版**ドライバーを選択します：

<Image img={datagrip_1} size="lg" border alt="ClickHouseドライバーのインストールを示すDataGripドライバータブ" />

## 4. ClickHouseに接続する {#3-connect-to-clickhouse}

- データベース接続情報を指定し、**接続テスト**をクリックします：

  最初のステップで接続情報を集めたら、ホストURL、ポート、ユーザー名、パスワード、データベース名を入力し、接続のテストを行います。

  :::tip
  DataGripダイアログの**HOST**エントリーは実際にはURLです。以下の画像を参照してください。

  JDBC URL設定の詳細については、[ClickHouse JDBCドライバー](https://github.com/ClickHouse/clickhouse-java)リポジトリを参照してください。
  :::

<Image img={datagrip_7} size="md" border alt="ClickHouse設定を持つDataGrip接続詳細フォーム" />

## もっと学ぶ {#learn-more}

DataGripに関する詳細情報はDataGripドキュメントを訪れてください。
