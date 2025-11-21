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

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import draxlr_01 from '@site/static/images/integrations/data-visualization/draxlr_01.png';
import draxlr_02 from '@site/static/images/integrations/data-visualization/draxlr_02.png';
import draxlr_03 from '@site/static/images/integrations/data-visualization/draxlr_03.png';
import draxlr_04 from '@site/static/images/integrations/data-visualization/draxlr_04.png';
import draxlr_05 from '@site/static/images/integrations/data-visualization/draxlr_05.png';
import draxlr_06 from '@site/static/images/integrations/data-visualization/draxlr_06.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Draxlr を ClickHouse に接続する

<CommunityMaintainedBadge/>

Draxlr は、ClickHouse データベースに接続するための直感的なインターフェースを提供し、チームが数分以内にデータの探索、可視化、インサイトの公開を行えるようにします。このガイドでは、接続を確立するための手順を順を追って説明します。



## 1. ClickHouseの認証情報を取得する {#1-get-your-clickhouse-credentials}

<ConnectionDetails />


## 2. DraxlrをClickHouseに接続する {#2--connect-draxlr-to-clickhouse}

1. ナビゲーションバーの**Connect a Database**ボタンをクリックします。

2. 利用可能なデータベースのリストから**ClickHouse**を選択し、「次へ」をクリックします。

3. ホスティングサービスのいずれかを選択し、「次へ」をクリックします。

4. **Connection Name**フィールドに任意の名前を入力します。

5. フォームに接続の詳細情報を入力します。

<Image
  size='md'
  img={draxlr_01}
  alt='ClickHouseデータベースの設定オプションを表示するDraxlr接続フォーム'
  border
/>

6. **Next**ボタンをクリックし、接続が確立されるまで待ちます。接続に成功すると、テーブルページが表示されます。


## 4. データを探索する {#4-explore-your-data}

1. リスト内のいずれかのテーブルをクリックします。

2. 探索ページに移動し、テーブル内のデータを確認できます。

3. フィルタの追加、結合の作成、ソートの適用などを行うことができます。

<Image
  size='md'
  img={draxlr_02}
  alt='フィルタとソートオプションを表示するDraxlrのデータ探索インターフェース'
  border
/>

4. **Graph**ボタンを使用してグラフの種類を選択し、データを可視化することもできます。

<Image
  size='md'
  img={draxlr_05}
  alt='ClickHouseデータ用のDraxlrグラフ可視化オプション'
  border
/>


## 4. SQLクエリの使用 {#4-using-sql-queries}

1. ナビゲーションバーの「Explore」ボタンをクリックします。

2. **Raw Query**ボタンをクリックし、テキストエリアにクエリを入力します。

<Image
  size='md'
  img={draxlr_03}
  alt='ClickHouse用DraxlrのSQLクエリインターフェース'
  border
/>

3. **Execute Query**ボタンをクリックして結果を表示します。


## 4. クエリの保存 {#4-saving-you-query}

1. クエリを実行した後、**Save Query** ボタンをクリックします。

<Image
  size='md'
  img={draxlr_04}
  alt='ダッシュボードオプション付きのDraxlr保存クエリダイアログ'
  border
/>

2. **Query Name** テキストボックスでクエリに名前を付け、分類用のフォルダを選択できます。

3. また、**Add to dashboard** オプションを使用して、結果をダッシュボードに追加することもできます。

4. **Save** ボタンをクリックしてクエリを保存します。


## 5. ダッシュボードの構築 {#5-building-dashboards}

1. ナビゲーションバーの **Dashboards** ボタンをクリックします。

<Image
  size='md'
  img={draxlr_06}
  alt='Draxlr ダッシュボード管理インターフェース'
  border
/>

2. 左サイドバーの **Add +** ボタンをクリックして、新しいダッシュボードを追加できます。

3. 新しいウィジェットを追加するには、右上の **Add** ボタンをクリックします。

4. 保存されたクエリのリストからクエリを選択し、可視化タイプを選択してから **Add Dashboard Item** ボタンをクリックします。


## 詳細情報 {#learn-more}

Draxlrの詳細については、[Draxlrドキュメント](https://draxlr.notion.site/draxlr/Draxlr-Docs-d228b23383f64d00a70836ff9643a928)サイトをご覧ください。
