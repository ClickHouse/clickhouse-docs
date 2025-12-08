---
sidebar_label: 'Draxlr'
sidebar_position: 131
slug: /integrations/draxlr
keywords: ['clickhouse', 'Draxlr', 'connect', 'integrate', 'ui']
description: 'Draxlr はデータ可視化と分析機能を備えたビジネスインテリジェンスツールです。'
title: 'Draxlr を ClickHouse に接続する'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
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

# Draxlr を ClickHouse に接続する {#connecting-draxlr-to-clickhouse}

<CommunityMaintainedBadge/>

Draxlr は、ClickHouse データベースに接続するための直感的なインターフェースを提供し、チームが数分でデータの探索、可視化、インサイトの公開を行えるようにします。本ガイドでは、問題なく接続を確立するための手順を順を追って説明します。

## 1. ClickHouse の認証情報を取得する {#1-get-your-clickhouse-credentials}
<ConnectionDetails />

## 2.  Draxlr を ClickHouse に接続する {#2--connect-draxlr-to-clickhouse}

1. ナビゲーションバーの **Connect a Database** ボタンをクリックします。

2. 利用可能なデータベース一覧から **ClickHouse** を選択し、**Next** をクリックします。

3. いずれかのホスティングサービスを選択し、**Next** をクリックします。

4. **Connection Name** フィールドには任意の名前を入力します。

5. フォームに接続情報を入力します。

  <Image size="md" img={draxlr_01} alt="ClickHouse データベースの設定オプションを表示している Draxlr の接続フォーム" border />

6. **Next** ボタンをクリックし、接続が確立されるまで待ちます。接続に成功すると、テーブル一覧ページが表示されます。

## 4. データを探索する {#4-explore-your-data}

1. 一覧からいずれかのテーブルをクリックします。

2. テーブル内のデータを確認できる Explore ページに移動します。

3. フィルターを追加したり、テーブル同士を結合したり、データの並び替えを行ったりできます。

  <Image size="md" img={draxlr_02} alt="フィルターとソートオプションを表示している Draxlr のデータ探索インターフェイス" border />

4. **Graph** ボタンをクリックして、グラフの種類を選択し、データを可視化することもできます。

  <Image size="md" img={draxlr_05} alt="ClickHouse データ向けの Draxlr のグラフ可視化オプション" border />

## 4. SQL クエリの使用 {#4-using-sql-queries}

1. ナビゲーションバーの「Explore」ボタンをクリックします。

2. 「**Raw Query**」ボタンをクリックし、テキストエリアにクエリを入力します。

  <Image size="md" img={draxlr_03} alt="ClickHouse 用 Draxlr SQL クエリインターフェイス" border />

3. 「**Execute Query**」ボタンをクリックして結果を表示します。

## 4. クエリの保存 {#4-saving-you-query}

1. クエリを実行した後、**Save Query** ボタンをクリックします。

  <Image size="md" img={draxlr_04} alt="ダッシュボードオプションを含む Draxlr のクエリ保存ダイアログ" border />

2. **Query Name** テキストボックスでクエリに名前を付け、分類用のフォルダーを選択します。

3. **Add to dashboard** オプションを使用して、結果をダッシュボードに追加することもできます。

4. クエリを保存するには、**Save** ボタンをクリックします。

## 5. ダッシュボードの作成 {#5-building-dashboards}

1. ナビゲーションバーの **Dashboards** ボタンをクリックします。

  <Image size="md" img={draxlr_06} alt="Draxlr dashboard management interface" border />

2. 左サイドバーの **Add +** ボタンをクリックして、新しいダッシュボードを追加します。

3. 新しいウィジェットを追加するには、右上隅の **Add** ボタンをクリックします。

4. 保存済みクエリの一覧からクエリを選択し、可視化の種類を選んでから **Add Dashboard Item** ボタンをクリックします。

## 詳細はこちら {#learn-more}
Draxlr についてさらに詳しく知るには、[Draxlr ドキュメント](https://draxlr.notion.site/draxlr/Draxlr-Docs-d228b23383f64d00a70836ff9643a928) サイトを参照してください。
