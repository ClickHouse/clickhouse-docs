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
'description': 'Draxlr is a Business intelligence tool with data visualization and
  analytics.'
'title': 'Connecting Draxlr to ClickHouse'
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


# DraxlrをClickHouseに接続する

<CommunityMaintainedBadge/>

Draxlrは、ClickHouseデータベースに接続するための直感的なインターフェースを提供し、チームが数分以内に洞察を探求、視覚化、公開できるようにします。このガイドでは、成功した接続を確立するための手順を説明します。


## 1. ClickHouseの認証情報を取得する {#1-get-your-clickhouse-credentials}
<ConnectionDetails />

## 2. DraxlrをClickHouseに接続する {#2--connect-draxlr-to-clickhouse}

1. ナビゲーションバーの**データベースに接続**ボタンをクリックします。

2. 利用可能なデータベースのリストから**ClickHouse**を選択し、次へ進みます。

3. ホスティングサービスの1つを選択し、次へ進みます。

4. **接続名**フィールドに任意の名前を入力します。

5. フォームに接続詳細を追加します。

  <Image size="md" img={draxlr_01} alt="Draxlr接続フォームがClickHouseデータベースの設定オプションを表示" border />

6. **次へ**ボタンをクリックし、接続が確立されるのを待ちます。接続に成功すると、テーブルページが表示されます。

## 4. データを探索する {#4-explore-your-data}

1. リストからテーブルの1つをクリックします。

2. テーブルのデータを見るために探索ページに移動します。

3. フィルタを追加したり、結合を行ったりして、データをソートすることができます。

  <Image size="md" img={draxlr_02} alt="Draxlrデータ探索インターフェースがフィルタとソートオプションを表示" border />

4. また、**グラフ**ボタンを使用して、グラフの種類を選択しデータを視覚化することもできます。

  <Image size="md" img={draxlr_05} alt="DraxlrのClickHouseデータ用グラフ視覚化オプション" border />


## 4. SQLクエリを使用する {#4-using-sql-queries}

1. ナビゲーションバーの探索ボタンをクリックします。

2. **生クエリ**ボタンをクリックし、テキストエリアにクエリを入力します。

  <Image size="md" img={draxlr_03} alt="DraxlrのClickHouse用SQLクエリインターフェース" border />

3. **クエリを実行**ボタンをクリックして、結果を確認します。


## 4. クエリを保存する {#4-saving-you-query}

1. クエリを実行した後、**クエリを保存**ボタンをクリックします。

  <Image size="md" img={draxlr_04} alt="Draxlrのクエリ保存ダイアログがダッシュボードオプションを表示" border />

2. **クエリ名**テキストボックスにクエリの名前を付け、カテゴリを選択するフォルダを選択します。

3. **ダッシュボードに追加**オプションを使用して、結果をダッシュボードに追加することもできます。

4. **保存**ボタンをクリックして、クエリを保存します。


## 5. ダッシュボードの構築 {#5-building-dashboards}

1. ナビゲーションバーの**ダッシュボード**ボタンをクリックします。

  <Image size="md" img={draxlr_06} alt="Draxlrのダッシュボード管理インターフェース" border />

2. 左のサイドバーの**追加 +**ボタンをクリックして、新しいダッシュボードを追加できます。

3. 新しいウィジェットを追加するには、右上隅の**追加**ボタンをクリックします。

4. 保存されたクエリのリストからクエリを選択し、視覚化の種類を選んで、**ダッシュボード項目を追加**ボタンをクリックします。

## 詳しく知る {#learn-more}
Draxlrの詳細については、[Draxlrドキュメント](https://draxlr.notion.site/draxlr/Draxlr-Docs-d228b23383f64d00a70836ff9643a928)サイトをご覧ください。
