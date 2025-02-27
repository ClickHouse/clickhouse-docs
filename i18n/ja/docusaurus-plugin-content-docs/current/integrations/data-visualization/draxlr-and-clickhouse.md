---
sidebar_label: Draxlr
sidebar_position: 131
slug: /integrations/draxlr
keywords: [clickhouse, Draxlr, 接続, 統合, ui]
description: Draxlrはデータの視覚化と分析を行うビジネスインテリジェンスツールです。
---
import ConnectionDetails from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# DraxlrをClickHouseに接続する

Draxlrは、ClickHouseデータベースへの接続のための直感的なインターフェースを提供し、あなたのチームが数分以内にインサイトを探求、視覚化、公開できるようにします。このガイドでは、成功した接続を確立するためのステップを説明します。

## 1. ClickHouseの資格情報を取得する {#1-get-your-clickhouse-credentials}
<ConnectionDetails />

## 2. DraxlrをClickHouseに接続する {#2--connect-draxlr-to-clickhouse}

1. ナビバーの**データベースに接続**ボタンをクリックします。

2. 利用可能なデータベースのリストから**ClickHouse**を選択し、次に進みます。

3. ホスティングサービスの1つを選択し、次に進みます。

4. **接続名**フィールドに任意の名前を入力します。

5. フォームに接続詳細を追加します。

  <img src={require('./images/draxlr_01.png').default} class="image" style={{width: '80%'}}  alt="接続フォーム" />

6. **次へ**ボタンをクリックし、接続の確立を待ちます。接続が成功すると、テーブルのページが表示されます。

## 4. データを探る {#4-explore-your-data}

1. リスト内のテーブルの1つをクリックします。

2. テーブル内のデータを見るための探求ページに移動します。

3. フィルターを追加したり、結合を作成したり、データにソートを追加したりできます。

  <img src={require('./images/draxlr_02.png').default} class="image" style={{width: '80%'}}  alt="接続フォーム" />

4. **グラフ**ボタンを使用して、データを視覚化するためにグラフの種類を選択することもできます。

  <img src={require('./images/draxlr_05.png').default} class="image" style={{width: '80%'}}  alt="接続フォーム" />


## 4. SQLクエリの使用 {#4-using-sql-queries}

1. ナビバーの**探求**ボタンをクリックします。

2. **生クエリ**ボタンをクリックし、テキストエリアにクエリを入力します。

  <img src={require('./images/draxlr_03.png').default} class="image" style={{width: '80%'}}  alt="接続フォーム" />

3. **クエリを実行**ボタンをクリックして結果を確認します。


## 4. クエリを保存する {#4-saving-you-query}

1. クエリを実行した後、**クエリを保存**ボタンをクリックします。

  <img src={require('./images/draxlr_04.png').default} class="image" style={{width: '80%'}}  alt="接続フォーム" />

2. **クエリ名**テキストボックスにクエリの名前を付け、カテゴリ用のフォルダーを選択します。

3. **ダッシュボードに追加**オプションを使用して、結果をダッシュボードに追加することもできます。

4. **保存**ボタンをクリックしてクエリを保存します。


## 5. ダッシュボードの作成 {#5-building-dashboards}

1. ナビバーの**ダッシュボード**ボタンをクリックします。

  <img src={require('./images/draxlr_06.png').default} class="image" style={{width: '80%'}}  alt="接続フォーム" />

2. 左のサイドバーの**追加 +**ボタンをクリックして新しいダッシュボードを追加できます。

3. 新しいウィジェットを追加するには、右上の**追加**ボタンをクリックします。

4. 保存されたクエリのリストからクエリを選択し、視覚化の種類を選択した後、**ダッシュボードアイテムを追加**ボタンをクリックします。


## 詳細情報 {#learn-more}
Draxlrの詳細については、[Draxlrのドキュメント](https://draxlr.notion.site/draxlr/Draxlr-Docs-d228b23383f64d00a70836ff9643a928)サイトをご覧ください。
