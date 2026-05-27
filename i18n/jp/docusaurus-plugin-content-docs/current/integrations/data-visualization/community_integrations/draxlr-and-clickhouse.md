---
sidebar_label: 'Draxlr'
sidebar_position: 131
slug: /integrations/draxlr
keywords: ['clickhouse', 'Draxlr', '接続', '統合', 'UI']
description: 'Draxlrは、データの可視化と分析を行えるビジネスインテリジェンスツールです。'
title: 'DraxlrをClickHouseに接続する'
doc_type: 'guide'
integration:
  - support_level: 'community'
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

<CommunityMaintainedBadge />

Draxlr は、ClickHouse データベースに接続するための直感的なインターフェイスを備えており、チームは数分でインサイトの探索、可視化、公開を行えます。このガイドでは、接続を正常に確立するための手順を説明します。

## 1. ClickHouse の認証情報を取得する \{#1-get-your-clickhouse-credentials\}

<ConnectionDetails />

## 2.  Draxlr を ClickHouse に接続する \{#2--connect-draxlr-to-clickhouse\}

1. ナビゲーションバーの **Connect a Database** ボタンをクリックします。

2. 利用可能なデータベースの一覧から **ClickHouse** を選択し、**Next** をクリックします。

3. ホスティングサービスを 1 つ選択し、**Next** をクリックします。

4. **Connection Name** フィールドに任意の名前を入力します。

5. フォームに接続の詳細を入力します。

<Image size="md" img={draxlr_01} alt="ClickHouse データベースの設定オプションを表示している Draxlr の接続フォーム" border />

6. **Next** ボタンをクリックし、接続が確立されるまで待ちます。接続に成功すると、テーブルページが表示されます。

## 4. データを探索する \{#4-explore-your-data\}

1. リスト内のいずれかのテーブルをクリックします。

2. テーブル内のデータを確認できる探索ページに移動します。

3. フィルターを追加したり、ジョインを実行したり、データに並べ替えを適用したりできます。

<Image size="md" img={draxlr_02} alt="フィルターと並べ替えのオプションを表示する Draxlr のデータ探索インターフェイス" border />

4. **Graph** ボタンを使用してグラフの種類を選択し、データを可視化することもできます。

<Image size="md" img={draxlr_05} alt="ClickHouse データ用の Draxlr グラフ可視化オプション" border />

## 4. SQLクエリを使用する \{#4-using-sql-queries\}

1. ナビゲーションバーの Explore ボタンをクリックします。

2. **Raw Query** ボタンをクリックし、テキストエリアにクエリを入力します。

<Image size="md" img={draxlr_03} alt="ClickHouse向けDraxlrのSQLクエリインターフェイス" border />

3. **Execute Query** ボタンをクリックして、結果を表示します。

## 4. クエリを保存する \{#4-saving-you-query\}

1. クエリを実行したら、**Save Query** ボタンをクリックします。

<Image size="md" img={draxlr_04} alt="ダッシュボードのオプションが表示されたDraxlrのクエリ保存ダイアログ" border />

2. **Query Name** テキストボックスでクエリ名を入力し、分類先のフォルダを選択できます。

3. **Add to dashboard** オプションを使うと、結果をダッシュボードに追加することもできます。

4. **Save** ボタンをクリックしてクエリを保存します。

## 5. ダッシュボードの作成 \{#5-building-dashboards\}

1. ナビゲーションバーの **Dashboards** ボタンをクリックします。

<Image size="md" img={draxlr_06} alt="Draxlr ダッシュボード管理インターフェイス" border />

2. 左側のサイドバーにある **Add +** ボタンをクリックして、新しいダッシュボードを追加します。

3. 新しいウィジェットを追加するには、右上の **Add** ボタンをクリックします。

4. 保存済みクエリの一覧からクエリを選択し、表示形式を選んで **Add Dashboard Item** ボタンをクリックします。

## 詳しく見る \{#learn-more\}

Draxlr の詳細については、[Draxlr ドキュメント](https://draxlr.notion.site/draxlr/Draxlr-Docs-d228b23383f64d00a70836ff9643a928)をご覧ください。