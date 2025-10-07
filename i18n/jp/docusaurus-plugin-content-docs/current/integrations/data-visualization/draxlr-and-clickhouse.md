---
'sidebar_label': 'Draxlr'
'sidebar_position': 131
'slug': '/integrations/draxlr'
'keywords':
- 'clickhouse'
- 'Draxlr'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Draxlrはデータ可視化と分析を備えたビジネスインテリジェンスツールです。'
'title': 'DraxlrをClickHouseに接続する'
'doc_type': 'guide'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import draxlr_01 from '@site/static/images/integrations/data-visualization/draxlr_01.png';
import draxlr_02 from '@site/static/images/integrations/data-visualization/draxlr_02.png';
import draxlr_03 from '@site/static/images/integrations/data-visualization/draxlr_03.png';
import draxlr_04 from '@site/static/images/integrations/data-visualization/draxlr_04.png';
import draxlr_05 from '@site/static/images/integrations/data-visualization/draxlr_05.png';
import draxlr_06 from '@site/static/images/integrations/data-visualization/draxlr_06.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Connecting Draxlr to ClickHouse

<CommunityMaintainedBadge/>

Draxlrは、ClickHouseデータベースへの接続のための直感的なインターフェースを提供し、チームが数分で洞察を探索、視覚化、公開できるようにします。このガイドでは、成功裏に接続を確立するための手順を説明します。

## 1. ClickHouseの資格情報を取得する {#1-get-your-clickhouse-credentials}
<ConnectionDetails />

## 2. DraxlrをClickHouseに接続する {#2--connect-draxlr-to-clickhouse}

1. ナビゲーションバーの**データベースに接続**ボタンをクリックします。

2. 利用可能なデータベースのリストから**ClickHouse**を選択し、次へ進みます。

3. ホスティングサービスの1つを選択して次へ進みます。

4. **接続名**フィールドに任意の名前を入力します。

5. フォームに接続の詳細を追加します。

  <Image size="md" img={draxlr_01} alt="Draxlr connection form showing ClickHouse database configuration options" border />

6. **次へ**ボタンをクリックし、接続が確立されるのを待ちます。接続が成功すれば、テーブルページが表示されます。

## 4. データを探索する {#4-explore-your-data}

1. リスト内のテーブルの1つをクリックします。

2. テーブル内のデータを見るための探索ページに移動します。

3. フィルタを追加したり、結合を作成したり、データを並べ替えたりできます。

  <Image size="md" img={draxlr_02} alt="Draxlr data exploration interface showing filters and sorting options" border />

4. **グラフ**ボタンを使用して、データを視覚化するためにグラフタイプを選択することもできます。

  <Image size="md" img={draxlr_05} alt="Draxlr graph visualization options for ClickHouse data" border />

## 4. SQLクエリを使用する {#4-using-sql-queries}

1. ナビゲーションバーの探索ボタンをクリックします。

2. **生クエリ**ボタンをクリックし、テキストエリアにクエリを入力します。

  <Image size="md" img={draxlr_03} alt="Draxlr SQL query interface for ClickHouse" border />

3. **クエリを実行**ボタンをクリックして結果を表示します。

## 4. クエリを保存する {#4-saving-you-query}

1. クエリを実行した後、**クエリを保存**ボタンをクリックします。

  <Image size="md" img={draxlr_04} alt="Draxlr save query dialog with dashboard options" border />

2. **クエリ名**テキストボックスにクエリに名前を付け、カテゴリ用のフォルダを選択します。

3. 結果をダッシュボードに追加するには、**ダッシュボードに追加**オプションを使用することもできます。

4. **保存**ボタンをクリックしてクエリを保存します。

## 5. ダッシュボードを作成する {#5-building-dashboards}

1. ナビゲーションバーの**ダッシュボード**ボタンをクリックします。

  <Image size="md" img={draxlr_06} alt="Draxlr dashboard management interface" border />

2. 左側のサイドバーの**追加 +**ボタンをクリックして新しいダッシュボードを追加できます。

3. 新しいウィジェットを追加するには、右上隅の**追加**ボタンをクリックします。

4. 保存したクエリのリストからクエリを選択し、視覚化タイプを選択してから**ダッシュボードアイテムを追加**ボタンをクリックします。

## Learn more {#learn-more}
Draxlrについて詳しく知りたい方は、[Draxlr documentation](https://draxlr.notion.site/draxlr/Draxlr-Docs-d228b23383f64d00a70836ff9643a928)サイトをご覧ください。
