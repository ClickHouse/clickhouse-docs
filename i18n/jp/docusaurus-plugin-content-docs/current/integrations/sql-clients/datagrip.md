---
sidebar_label: DataGrip
slug: /integrations/datagrip
description: DataGripはClickHouseを標準でサポートするデータベースIDEです。
---
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import datagrip_1 from '@site/static/images/integrations/sql-clients/datagrip-1.png';
import datagrip_5 from '@site/static/images/integrations/sql-clients/datagrip-5.png';
import datagrip_6 from '@site/static/images/integrations/sql-clients/datagrip-6.png';
import datagrip_7 from '@site/static/images/integrations/sql-clients/datagrip-7.png';


# DataGripをClickHouseに接続する

## DataGripを起動またはダウンロードする {#start-or-download-datagrip}

DataGripは https://www.jetbrains.com/datagrip/ から入手できます。

## 1. 接続詳細を集める {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. ClickHouseドライバーをロードする {#2-load-the-clickhouse-driver}

1. DataGripを起動し、**データソース**タブの**データソースとドライバー**ダイアログで、**+**アイコンをクリックします。

<img src={datagrip_5} class="image" alt="DataGrip 05" />

  **ClickHouse**を選択します。

  :::tip
  接続を確立する際にリストの順序が変わるため、ClickHouseがまだリストの上部にない場合があります。
  :::

<img src={datagrip_6} class="image" alt="DataGrip 06" />

- **ドライバー**タブに切り替えてClickHouseドライバーをロードします。

  DataGripはダウンロードサイズを最小限に抑えるため、ドライバーを同梱していません。**ドライバー**タブで、**完全サポート**リストから**ClickHouse**を選択し、**+**記号を展開します。**提供されたドライバー**オプションから**最新の安定版**ドライバーを選択します：

<img src={datagrip_1} class="image" alt="DataGrip 01" />

## 3. ClickHouseに接続する {#3-connect-to-clickhouse}

- データベース接続の詳細を指定し、**接続テスト**をクリックします。

  ステップ1で接続詳細を収集したので、ホストURL、ポート、ユーザー名、パスワード、データベース名を入力し、接続をテストします。

  :::tip
  DataGripダイアログの**HOST**エントリは実際にはURLです。下の画像を参照してください。

  JDBC URL設定の詳細については、[ClickHouse JDBCドライバー](https://github.com/ClickHouse/clickhouse-java)リポジトリを参照してください。
  :::

<img src={datagrip_7} class="image" alt="DataGrip 07" />

## 詳細を学ぶ {#learn-more}

DataGripに関するより多くの情報は、DataGripのドキュメントを訪れてください。
