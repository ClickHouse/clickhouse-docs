---
sidebar_label: 'DataGrip'
slug: /integrations/datagrip
description: 'DataGripは、ClickHouseを標準でサポートするデータベースIDEです。'
title: 'DataGripをClickHouseに接続する'
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import datagrip_1 from '@site/static/images/integrations/sql-clients/datagrip-1.png';
import datagrip_5 from '@site/static/images/integrations/sql-clients/datagrip-5.png';
import datagrip_6 from '@site/static/images/integrations/sql-clients/datagrip-6.png';
import datagrip_7 from '@site/static/images/integrations/sql-clients/datagrip-7.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# DataGripをClickHouseに接続する

<CommunityMaintainedBadge/>

## DataGripのインストールまたはダウンロードを開始する {#start-or-download-datagrip}

DataGripは https://www.jetbrains.com/datagrip/ から入手できます。

## 1. 接続の詳細を収集する {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. ClickHouseドライバーをロードする {#2-load-the-clickhouse-driver}

1. DataGripを起動し、**データソース**タブの**データソースとドライバー**ダイアログで、**+** アイコンをクリックします。

<Image img={datagrip_5} size="lg" border alt="DataGripデータソースタブの+アイコンが強調表示されています" />

  **ClickHouse**を選択します。

  :::tip
  接続を確立するに従って順序が変わりますので、ClickHouseがリストの上部にない場合があります。
  :::

<Image img={datagrip_6} size="sm" border alt="DataGripがデータソースリストからClickHouseを選択している" />

- **ドライバー**タブに切り替え、ClickHouseドライバーをロードします。

  DataGripはダウンロードサイズを最小限に抑えるためにドライバーを同梱していません。**ドライバー**タブで、**完全サポート**リストから**ClickHouse**を選択し、**+**を展開します。**提供されたドライバー**オプションから**最新の安定版**ドライバーを選択します：

<Image img={datagrip_1} size="lg" border alt="DataGripドライバータブにClickHouseドライバーのインストールが表示されています" />

## 3. ClickHouseに接続する {#3-connect-to-clickhouse}

- データベース接続の詳細を指定し、**接続テスト**をクリックします。

  ステップ1で接続の詳細を収集しましたので、ホストURL、ポート、ユーザー名、パスワード、データベース名を入力し、接続をテストします。

  :::tip
  DataGripダイアログの**HOST**エントリは実際にはURLです。下の画像を参照してください。

  JDBC URL設定の詳細については、[ClickHouse JDBCドライバー](https://github.com/ClickHouse/clickhouse-java)リポジトリを参照してください。
  :::

<Image img={datagrip_7} size="md" border alt="ClickHouseの設定を含むDataGrip接続詳細フォーム" />

## 詳細を学ぶ {#learn-more}

DataGripに関する詳しい情報は、DataGripのドキュメントを訪れてください。
