---
sidebar_label: 'Draxlr'
sidebar_position: 131
slug: /integrations/draxlr
keywords: ['clickhouse', 'Draxlr', '接続', '統合', 'ui']
description: 'Draxlrはデータの視覚化と分析を提供するビジネスインテリジェンスツールです。'
title: 'DraxlrをClickHouseに接続する'
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


# DraxlrをClickHouseに接続する

<CommunityMaintainedBadge/>

Draxlrは、あなたのClickHouseデータベースに接続するための直感的なインターフェースを提供し、チームが数分でインサイトを探索、視覚化、公開できるようにします。このガイドでは、成功した接続を確立するためのステップを説明します。


## 1. ClickHouseの認証情報を取得する {#1-get-your-clickhouse-credentials}
<ConnectionDetails />

## 2. DraxlrをClickHouseに接続する {#2--connect-draxlr-to-clickhouse}

1. ナビゲーションバーの**データベースに接続**ボタンをクリックします。

2. 利用可能なデータベースのリストから**ClickHouse**を選択し、次へ進みます。

3. ホスティングサービスのいずれかを選択し、次へ進みます。

4. **接続名**フィールドに任意の名前を使用します。

5. フォームに接続詳細を追加します。

  <Image size="md" img={draxlr_01} alt="ClickHouseデータベース設定オプションを示すDraxlr接続フォーム" border />

6. **次へ**ボタンをクリックし、接続が確立されるのを待ちます。接続が成功すると、テーブルページが表示されます。

## 3. データを探索する {#4-explore-your-data}

1. リストの中からテーブルの1つをクリックします。

2. テーブル内のデータを見るための探索ページに移動します。

3. フィルターを追加したり、結合を作成したり、データに対してソートを適用したりできます。

  <Image size="md" img={draxlr_02} alt="フィルターとソートオプションを示すDraxlrデータ探索インターフェース" border />

4. また、**グラフ**ボタンを使用して、データを視覚化するグラフのタイプを選択することもできます。

  <Image size="md" img={draxlr_05} alt="ClickHouseデータのためのDraxlrグラフ視覚化オプション" border />


## 4. SQLクエリの使用 {#4-using-sql-queries}

1. ナビゲーションバーの「探索」ボタンをクリックします。

2. **生クエリ**ボタンをクリックし、テキストエリアにクエリを入力します。

  <Image size="md" img={draxlr_03} alt="ClickHouse用のDraxlr SQLクエリインターフェース" border />

3. **クエリを実行**ボタンをクリックして結果を表示します。


## 5. クエリの保存 {#4-saving-you-query}

1. クエリを実行した後、**クエリを保存**ボタンをクリックします。

  <Image size="md" img={draxlr_04} alt="ダッシュボードオプションを含むDraxlrクエリ保存ダイアログ" border />

2. **クエリ名**テキストボックスでクエリに名前を付け、カテゴライズするフォルダーを選択できます。

3. 結果をダッシュボードに追加するために**ダッシュボードに追加**オプションを使用することもできます。

4. **保存**ボタンをクリックしてクエリを保存します。


## 6. ダッシュボードの作成 {#5-building-dashboards}

1. ナビゲーションバーの**ダッシュボード**ボタンをクリックします。

  <Image size="md" img={draxlr_06} alt="Draxlrダッシュボード管理インターフェース" border />

2. 左側のサイドバーにある**追加 +**ボタンをクリックして新しいダッシュボードを追加できます。

3. 新しいウィジェットを追加するには、右上隅の**追加**ボタンをクリックします。

4. 保存されたクエリのリストからクエリを選択し、視覚化タイプを選択してから**ダッシュボードアイテムを追加**ボタンをクリックします。

## 詳しく知る {#learn-more}
Draxlrについてもっと知りたい場合は、[Draxlrドキュメント](https://draxlr.notion.site/draxlr/Draxlr-Docs-d228b23383f64d00a70836ff9643a928)サイトをご覧ください。
