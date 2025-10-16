---
'sidebar_label': 'DataGrip'
'slug': '/integrations/datagrip'
'description': 'DataGripは、ClickHouseを標準でサポートするデータベースIDEです。'
'title': 'データグリップをClickHouseに接続する'
'doc_type': 'guide'
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

## DataGripの起動またはダウンロード {#start-or-download-datagrip}

DataGripは https://www.jetbrains.com/datagrip/ から入手可能です。

## 1. 接続情報を集める {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. ClickHouseドライバをロードする {#2-load-the-clickhouse-driver}

1. DataGripを起動し、**Data Sources**タブの**Data Sources and Drivers**ダイアログで、**+**アイコンをクリックします。

<Image img={datagrip_5} size="lg" border alt="DataGripのData Sourcesタブで強調表示された+アイコン" />

  **ClickHouse**を選択します。

  :::tip
  接続を確立するにつれて順序が変わりますので、ClickHouseはリストの一番上にないかもしれません。
  :::

<Image img={datagrip_6} size="sm" border alt="DataGripのデータソースリストからClickHouseを選択している様子" />

- **Drivers**タブに切り替え、ClickHouseドライバをロードします。

  DataGripは、ダウンロードサイズを最小限に抑えるためにドライバを同梱していません。**Drivers**タブで、**Complete Support**リストから**ClickHouse**を選択し、**+**サインを展開します。**Provided Driver**オプションから**Latest stable**ドライバを選択します：

<Image img={datagrip_1} size="lg" border alt="DataGripのDriversタブに表示されているClickHouseドライバのインストール" />

## 3. ClickHouseに接続する {#3-connect-to-clickhouse}

- データベース接続情報を指定し、**Test Connection**をクリックします：

  ステップ1で接続情報を集めたら、ホストURL、ポート、ユーザー名、パスワード、データベース名を入力し、接続をテストします。

  :::tip
  DataGripダイアログの**HOST**エントリは実際にはURLです。以下の画像を参照してください。

  JDBC URL設定の詳細については、[ClickHouse JDBC driver](https://github.com/ClickHouse/clickhouse-java) リポジトリをご覧ください。
  :::

<Image img={datagrip_7} size="md" border alt="ClickHouse設定が含まれたDataGrip接続情報フォーム" />

## 詳細情報 {#learn-more}

DataGripに関する詳細情報は、DataGripのドキュメンテーションを訪れてください。
