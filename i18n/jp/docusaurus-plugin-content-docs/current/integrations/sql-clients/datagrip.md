---
sidebar_label: 'DataGrip'
slug: /integrations/datagrip
description: 'DataGrip は、ClickHouse を標準でサポートするデータベース IDE です。'
title: 'DataGrip から ClickHouse へ接続する'
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

# DataGrip から ClickHouse へ接続する \\{#connecting-datagrip-to-clickhouse\\}

<CommunityMaintainedBadge/>

## DataGrip の起動またはダウンロード \\{#start-or-download-datagrip\\}

DataGrip は https://www.jetbrains.com/datagrip/ からダウンロードできます。

## 1. 接続情報を確認する \\{#1-gather-your-connection-details\\}

<ConnectionDetails />

## 2. ClickHouse ドライバを読み込む \\{#2-load-the-clickhouse-driver\\}

1. DataGrip を起動し、**Data Sources and Drivers** ダイアログの **Data Sources** タブで **+** アイコンをクリックします。

<Image img={datagrip_5} size="lg" border alt="+ アイコンがハイライトされた DataGrip の Data Sources タブ" />

  **ClickHouse** を選択します。

:::tip
  接続を追加していくと並び順が変わるため、ClickHouse がまだリストの先頭に表示されていない場合があります。
  :::

<Image img={datagrip_6} size="sm" border alt="DataGrip でデータソース一覧から ClickHouse を選択している画面" />

- **Drivers** タブに切り替えて、ClickHouse ドライバを読み込みます。

  DataGrip ではダウンロードサイズを小さく抑えるため、ドライバは同梱されていません。**Drivers** タブで
  **Complete Support** リストから **ClickHouse** を選択し、**+** 記号を展開します。**Provided Driver** オプションから **Latest stable** ドライバを選択します。

<Image img={datagrip_1} size="lg" border alt="ClickHouse ドライバのインストールを表示している DataGrip の Drivers タブ" />

## 3. ClickHouse に接続する \\{#3-connect-to-clickhouse\\}

- データベース接続情報を入力し、**Test Connection** をクリックします。  
ステップ 1 で接続情報を取得しているので、ホスト URL、ポート、ユーザー名、パスワード、データベース名を入力し、その後に接続テストを実行します。

:::tip
**Host** フィールドには、`https://` のようなプロトコルを付けずにホスト名のみを入力します（例: `your-host.clickhouse.cloud`）。

ClickHouse Cloud に接続する場合は、ホストの下にある **URL** フィールドに `?ssl=true` を必ず追加してください。最終的な JDBC URL は次のようになります。

`jdbc:clickhouse://your-host.clickhouse.cloud:8443/default?ssl=true`

ClickHouse Cloud は、すべての接続に SSL 暗号化を要求します。`?ssl=true` パラメータがない場合、認証情報が正しくても「Connection reset」エラーが発生します。

JDBC URL の設定の詳細については、[ClickHouse JDBC driver](https://github.com/ClickHouse/clickhouse-java) リポジトリを参照してください。
:::

<Image img={datagrip_7} border alt="ClickHouse の設定が入力された DataGrip の接続詳細フォーム" />

## さらに詳しく \\{#learn-more\\}

DataGrip についての詳細な情報は、DataGrip のドキュメントを参照してください。