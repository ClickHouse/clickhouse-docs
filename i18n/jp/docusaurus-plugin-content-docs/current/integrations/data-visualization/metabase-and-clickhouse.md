---
sidebar_label: Metabase
sidebar_position: 131
slug: /integrations/metabase
keywords: [ClickHouse, Metabase, 接続, 統合, ui]
description: Metabaseは、あなたのデータに関する質問をするための使いやすいオープンソースのUIツールです。
---
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import metabase_01 from '@site/static/images/integrations/data-visualization/metabase_01.png';
import metabase_02 from '@site/static/images/integrations/data-visualization/metabase_02.png';
import metabase_03 from '@site/static/images/integrations/data-visualization/metabase_03.png';
import metabase_04 from '@site/static/images/integrations/data-visualization/metabase_04.png';
import metabase_06 from '@site/static/images/integrations/data-visualization/metabase_06.png';
import metabase_07 from '@site/static/images/integrations/data-visualization/metabase_07.png';
import metabase_08 from '@site/static/images/integrations/data-visualization/metabase_08.png';


# MetabaseをClickHouseに接続する

Metabaseは、あなたのデータに関する質問をするための使いやすいオープンソースのUIツールです。MetabaseはJavaアプリケーションであり、単に<a href="https://www.metabase.com/start/oss/jar" target="_blank">JARファイルをダウンロード</a>して、`java -jar metabase.jar`で実行することで動かすことができます。MetabaseはJDBCドライバーを使用してClickHouseに接続し、そのドライバーをダウンロードして`plugins`フォルダーに配置します。

## 目標 {#goal}

このガイドでは、Metabaseを使用してClickHouseのデータにいくつかの質問をし、回答を視覚化します。回答の一つは次のようになります：

  <img src={metabase_08} class="image" alt="円グラフ" />
<p/>

:::tip データを追加する
使用するデータセットがない場合は、いくつかの例の1つを追加できます。このガイドでは[UK Price Paid](/getting-started/example-datasets/uk-price-paid.md)データセットを使用するため、それを選択することができます。同じドキュメンテーションカテゴリに他のいくつかのデータセットがあります。
:::

## 1. 接続詳細を収集する {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. Metabase用のClickHouseプラグインをダウンロードする {#2--download-the-clickhouse-plugin-for-metabase}

1. `plugins`フォルダーがない場合は、`metabase.jar`を保存しているフォルダーのサブフォルダーとして作成します。

2. プラグインは、`clickhouse.metabase-driver.jar`という名前のJARファイルです。最新のJARファイルを<a href="https://github.com/clickhouse/metabase-clickhouse-driver/release" target="_blank">https://github.com/clickhouse/metabase-clickhouse-driver/releases/latest</a>からダウンロードします。

3. `clickhouse.metabase-driver.jar`を`plugins`フォルダーに保存します。

4. ドライバーが正しく読み込まれるように、Metabaseを起動（または再起動）します。

5. <a href="http://localhost:3000/" target="_blank">http://hostname:3000</a>でMetabaseにアクセスします。初回の起動時にウェルカムスクリーンが表示され、いくつかの質問を通り抜ける必要があります。データベースを選択するように求められた場合は、" **I'll add my data later** "を選択します：

## 3. MetabaseをClickHouseに接続する {#3--connect-metabase-to-clickhouse}

1. 右上のギアアイコンをクリックし、**Admin Settings**を選択して<a href="http://localhost:3000/admin/settings/setup" target="_blank">Metabase管理ページ</a>に移動します。

2. **データベースを追加**をクリックします。もしくは、**Databases**タブをクリックして**Add database**ボタンを選択します。

3. ドライバーのインストールが成功していれば、**Database type**のドロップダウンメニューに**ClickHouse**が表示されます：

    <img src={metabase_01} class="image" alt="ClickHouseデータベースの追加" />

4. データベースの**表示名**を設定します。これはMetabaseの設定であり、任意の名前を使用できます。

5. ClickHouseデータベースの接続詳細を入力します。ClickHouseサーバーがSSLを使用するように構成されている場合は、安全な接続を有効にします。例：

    <img src={metabase_02} class="image" style={{width: '80%'}}  alt="接続詳細" />

6. **保存**ボタンをクリックすると、Metabaseがデータベース内のテーブルをスキャンします。

## 4. SQLクエリを実行する {#4-run-a-sql-query}

1. 右上隅の**Exit admin**ボタンをクリックして**管理設定**を終了します。

2. 右上隅で**+ New**メニューをクリックし、質問をしたり、SQLクエリを実行したり、ダッシュボードを構築できることに気付いてください：

    <img src={metabase_03} class="image" style={{width: 283}} alt="新しいメニュー" />

3. たとえば、`uk_price_paid`というテーブルで実行されるSQLクエリが、1995年から2022年までの年ごとの平均価格を返します：

    <img src={metabase_04} class="image" alt="SQLクエリを実行する" />

## 5. 質問をする {#5-ask-a-question}

1. **+ New**をクリックし、**Question**を選択します。データベースとテーブルから始めて質問を構築できます。たとえば、以下の質問は`default`データベース内の`uk_price_paid`テーブルに対して尋ねられたものです。ここでは、グレーター・マンチェスター郡内の町ごとの平均価格を計算するシンプルな質問です：

    <img src={metabase_06} class="image" alt="新しい質問" />

2. **視覚化**ボタンをクリックして、結果を表形式で表示します。

    <img src={metabase_07} class="image" alt="新しい質問" />

3. 結果の下にある**Visualization**ボタンをクリックして視覚化を棒グラフ（または他の利用可能なオプション）に変更します：

    <img src={metabase_08} class="image" alt="円グラフの視覚化" />

## 詳細を学ぶ {#learn-more}

Metabaseについてのさらなる情報やダッシュボードの構築方法については、<a href="https://www.metabase.com/docs/latest/" target="_blank">Metabaseのドキュメントを訪問する</a>ことで確認できます。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseでのデータ視覚化 - パート3 - Metabase](https://clickhouse.com/blog/visualizing-data-with-metabase)
