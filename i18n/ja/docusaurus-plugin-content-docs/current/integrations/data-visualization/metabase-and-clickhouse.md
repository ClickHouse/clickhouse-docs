---
sidebar_label: Metabase
sidebar_position: 131
slug: /integrations/metabase
keywords: [ClickHouse, Metabase, connect, integrate, ui]
description: Metabaseはデータに関する質問をするための使いやすいオープンソースのUIツールです。
---
import ConnectionDetails from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# MetabaseとClickHouseの接続

Metabaseはデータに関する質問をするための使いやすいオープンソースのUIツールです。MetabaseはJavaアプリケーションであり、<a href="https://www.metabase.com/start/oss/jar" target="_blank">JARファイルをダウンロード</a>し、`java -jar metabase.jar`で実行することで簡単に起動できます。MetabaseはJDBCドライバーを使用してClickHouseに接続します。このドライバーはダウンロードして`plugins`フォルダに配置します。

## 目標 {#goal}

このガイドでは、Metabaseを使ってClickHouseのデータにいくつかの質問をし、その回答を視覚化します。回答の一例は次のようになります：

  <img src={require('./images/metabase_08.png').default} class="image" alt="円グラフ" />
<p/>

:::tip データを追加する
作業するデータセットがない場合は、例の一つを追加できます。このガイドでは[UK Price Paid](/getting-started/example-datasets/uk-price-paid.md)データセットを使用しているので、それを選択することができます。同じドキュメントカテゴリには他にもいくつかのデータセットがあります。
:::

## 1. 接続情報を集める {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. Metabase用のClickHouseプラグインをダウンロードする {#2--download-the-clickhouse-plugin-for-metabase}

1. `plugins`フォルダがない場合は、`metabase.jar`が保存されている場所のサブフォルダとして作成します。

2. プラグインは`clickhouse.metabase-driver.jar`という名前のJARファイルです。最新のJARファイルを<a href="https://github.com/clickhouse/metabase-clickhouse-driver/release" target="_blank">https://github.com/clickhouse/metabase-clickhouse-driver/releases/latest</a>からダウンロードしてください。

3. `clickhouse.metabase-driver.jar`を`plugins`フォルダに保存します。

4. ドライバーが正しく読み込まれるように、Metabaseを起動（または再起動）します。

5. <a href="http://localhost:3000/" target="_blank">http://hostname:3000</a>でMetabaseにアクセスします。初回起動時にはウェルカム画面が表示され、一連の質問を通過する必要があります。データベースの選択を求められたら、「**データは後で追加します**」を選択してください：

## 3. MetabaseをClickHouseに接続する {#3--connect-metabase-to-clickhouse}

1. 右上のギアアイコンをクリックして**管理設定**を選択し、<a href="http://localhost:3000/admin/settings/setup" target="_blank">Metabase管理ページ</a>にアクセスします。

2. **データベースを追加**をクリックします。もしくは、**データベース**タブをクリックして**データベースを追加**ボタンを選択します。

3. ドライバーのインストールが成功している場合、**データベースタイプ**のドロップダウンメニューに**ClickHouse**が表示されます：

    <img src={require('./images/metabase_01.png').default} class="image" alt="ClickHouseデータベースを追加" />

4. データベースの**表示名**を設定します。これはMetabaseの設定なので、お好きな名前を使用してください。

5. ClickHouseデータベースの接続情報を入力します。ClickHouseサーバーがSSLを使用するように設定されている場合は、安全な接続を有効にします。例えば：

    <img src={require('./images/metabase_02.png').default} class="image" style={{width: '80%'}}  alt="接続情報" />

6. **保存**ボタンをクリックすると、Metabaseがデータベースをスキャンしてテーブルを確認します。

## 4. SQLクエリを実行する {#4-run-a-sql-query}

1. 右上の**管理設定**をクリックし、**管理を終了**ボタンをクリックして**管理設定**を終了します。

2. 右上の**+ 新規**メニューをクリックすると、質問を投げたり、SQLクエリを実行したり、ダッシュボードを構築できることがわかります：

    <img src={require('./images/metabase_03.png').default} class="image" style={{width: 283}} alt="新規メニュー" />

3. 例えば、`uk_price_paid`という名前のテーブルで実行されたSQLクエリは、1995年から2022年にかけての年ごとの平均価格を返します：

    <img src={require('./images/metabase_04.png').default} class="image" alt="SQLクエリを実行する" />

## 5. 質問をする {#5-ask-a-question}

1. **+ 新規**をクリックして**質問**を選択します。データベースとテーブルから始めて質問を構築できることに気づくでしょう。例えば、次の質問は`default`データベースの`uk_price_paid`テーブルに対して行われるもので、グレーター・マンチェスター内の町ごとの平均価格を計算する単純な質問です：

    <img src={require('./images/metabase_06.png').default} class="image" alt="新しい質問" />

2. **視覚化**ボタンをクリックすると、結果が表形式で表示されます。

    <img src={require('./images/metabase_07.png').default} class="image" alt="新しい質問" />

3. 結果の下にある**視覚化**ボタンをクリックして、視覚化を棒グラフ（または他の選択肢のいずれか）に変更します：

    <img src={require('./images/metabase_08.png').default} class="image" alt="円グラフの視覚化" />

## 詳しく学ぶ {#learn-more}

Metabaseやダッシュボードの構築方法に関する詳細情報を得るには、<a href="https://www.metabase.com/docs/latest/" target="_blank">Metabaseのドキュメンテーションを訪問してください</a>。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseによるデータの視覚化 - パート3 - Metabase](https://clickhouse.com/blog/visualizing-data-with-metabase)
