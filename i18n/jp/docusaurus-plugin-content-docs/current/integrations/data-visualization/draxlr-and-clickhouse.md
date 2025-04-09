---
sidebar_label: Draxlr
sidebar_position: 131
slug: /integrations/draxlr
keywords: [clickhouse, Draxlr, connect, integrate, ui]
description: Draxlrはデータ可視化と分析のためのビジネスインテリジェンスツールです。
---
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import draxlr_01 from '@site/static/images/integrations/data-visualization/draxlr_01.png';
import draxlr_02 from '@site/static/images/integrations/data-visualization/draxlr_02.png';
import draxlr_03 from '@site/static/images/integrations/data-visualization/draxlr_03.png';
import draxlr_04 from '@site/static/images/integrations/data-visualization/draxlr_04.png';
import draxlr_05 from '@site/static/images/integrations/data-visualization/draxlr_05.png';
import draxlr_06 from '@site/static/images/integrations/data-visualization/draxlr_06.png';



# DraxlrをClickHouseに接続する

DraxlrはClickHouseデータベースへの接続のための直感的なインターフェースを提供し、チームが数分で洞察を探索、可視化、および公開できるようにします。このガイドでは、成功する接続を確立するための手順を説明します。


## 1. ClickHouseの資格情報を取得する {#1-get-your-clickhouse-credentials}
<ConnectionDetails />

## 2. DraxlrをClickHouseに接続する {#2--connect-draxlr-to-clickhouse}

1. ナビゲーションバーの**データベースを接続**ボタンをクリックします。

2. 利用可能なデータベースのリストから**ClickHouse**を選択し、次へ進みます。

3. ホスティングサービスのいずれかを選択し、次へ進みます。

4. **接続名**フィールドに任意の名前を使用します。

5. フォームに接続詳細を追加します。

  <img src={draxlr_01} class="image" style={{width: '80%'}}  alt="接続フォーム" />

6. **次へ**ボタンをクリックし、接続が確立されるのを待ちます。接続が成功すると、テーブルページが表示されます。

## 4. データを探索する {#4-explore-your-data}

1. リストからテーブルの1つをクリックします。

2. テーブル内のデータを確認するための探索ページに移動します。

3. フィルターを追加したり、結合したり、データをソートしたりすることができます。

  <img src={draxlr_02} class="image" style={{width: '80%'}}  alt="接続フォーム" />

4. **グラフ**ボタンを使用して、データを可視化するためのグラフタイプを選択することもできます。

  <img src={draxlr_05} class="image" style={{width: '80%'}}  alt="接続フォーム" />


## 4. SQLクエリを使用する {#4-using-sql-queries}

1. ナビゲーションバーの探索ボタンをクリックします。

2. **生クエリ**ボタンをクリックし、テキストエリアにクエリを入力します。

  <img src={draxlr_03} class="image" style={{width: '80%'}}  alt="接続フォーム" />

3. **クエリを実行**ボタンをクリックして、結果を確認します。


## 4. クエリを保存する {#4-saving-you-query}

1. クエリの実行後、**クエリを保存**ボタンをクリックします。

  <img src={draxlr_04} class="image" style={{width: '80%'}}  alt="接続フォーム" />

2. **クエリ名**テキストボックスにクエリの名前を付け、カテゴリを選択するフォルダーを選択します。

3. 結果をダッシュボードに追加するために**ダッシュボードに追加**オプションを使用することもできます。

4. **保存**ボタンをクリックしてクエリを保存します。


## 5. ダッシュボードを作成する {#5-building-dashboards}

1. ナビゲーションバーの**ダッシュボード**ボタンをクリックします。

  <img src={draxlr_06} class="image" style={{width: '80%'}}  alt="接続フォーム" />

2. 左のサイドバーの**追加 +**ボタンをクリックして新しいダッシュボードを追加できます。

3. 新しいウィジェットを追加するには、右上隅の**追加**ボタンをクリックします。

4. 保存済みクエリのリストからクエリを選択し、可視化タイプを選択してから**ダッシュボードアイテムを追加**ボタンをクリックします。

## 詳細を学ぶ {#learn-more}
Draxlrについてさらに詳しく知りたい場合は、[Draxlrドキュメント](https://draxlr.notion.site/draxlr/Draxlr-Docs-d228b23383f64d00a70836ff9643a928)サイトを訪れてください。
