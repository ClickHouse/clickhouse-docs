---
sidebar_label: 'Metabase'
sidebar_position: 131
slug: /integrations/metabase
keywords: ['ClickHouse', 'Metabase', 'connect', 'integrate', 'ui']
description: 'Metabaseはデータに関する質問をするための使いやすいオープンソースのUIツールです。'
title: 'MetabaseをClickHouseに接続する'
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import metabase_01 from '@site/static/images/integrations/data-visualization/metabase_01.png';
import metabase_02 from '@site/static/images/integrations/data-visualization/metabase_02.png';
import metabase_03 from '@site/static/images/integrations/data-visualization/metabase_03.png';
import metabase_04 from '@site/static/images/integrations/data-visualization/metabase_04.png';
import metabase_06 from '@site/static/images/integrations/data-visualization/metabase_06.png';
import metabase_07 from '@site/static/images/integrations/data-visualization/metabase_07.png';
import metabase_08 from '@site/static/images/integrations/data-visualization/metabase_08.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# MetabaseをClickHouseに接続する

<CommunityMaintainedBadge/>

Metabaseはデータに関する質問をするための使いやすいオープンソースのUIツールです。MetabaseはJavaアプリケーションで、単に<a href="https://www.metabase.com/start/oss/jar" target="_blank">JARファイルをダウンロード</a>し、`java -jar metabase.jar`で実行することで動作します。Metabaseは、ダウンロードして`plugins`フォルダに配置したJDBCドライバーを使用してClickHouseに接続します。

## 目標 {#goal}

このガイドでは、Metabaseを使用してClickHouseデータに対するいくつかの質問をし、その回答を視覚化します。一つの回答は次のようになります：

  <Image size="md" img={metabase_08} alt="ClickHouseからのデータを示すMetabaseの円グラフ視覚化" border />
<p/>

:::tip データを追加する
作業するデータセットがない場合は、いずれかの例を追加できます。このガイドでは[UK Price Paid](/getting-started/example-datasets/uk-price-paid.md)データセットを使用するので、それを選ぶことができます。同じドキュメントカテゴリには、他にもいくつかの例があります。
:::

## 1. 接続情報を集める {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. Metabase用のClickHouseプラグインをダウンロードする {#2--download-the-clickhouse-plugin-for-metabase}

1. `plugins`フォルダがない場合は、`metabase.jar`を保存しているフォルダのサブフォルダとして作成します。

2. プラグインは`clickhouse.metabase-driver.jar`という名前のJARファイルです。最新バージョンのJARファイルを<a href="https://github.com/clickhouse/metabase-clickhouse-driver/release" target="_blank">https://github.com/clickhouse/metabase-clickhouse-driver/releases/latest</a>からダウンロードします。

3. `clickhouse.metabase-driver.jar`を`plugins`フォルダに保存します。

4. ドライバーが正しく読み込まれるように、Metabaseを起動（または再起動）します。

5. <a href="http://localhost:3000/" target="_blank">http://hostname:3000</a>でMetabaseにアクセスします。初回起動時には、ウェルカム画面が表示され、いくつかの質問に答える必要があります。データベースを選択するように求められた場合は、「**データは後で追加します**」を選択してください：

## 3. MetabaseをClickHouseに接続する {#3--connect-metabase-to-clickhouse}

1. 右上のギアアイコンをクリックし、**管理者設定**を選択して<a href="http://localhost:3000/admin/settings/setup" target="_blank">Metabase管理ページ</a>に移動します。

2. **データベースを追加**をクリックします。あるいは、**データベース**タブをクリックして**データベースを追加**ボタンを選ぶこともできます。

3. ドライバのインストールが成功すれば、**データベースタイプ**のドロップダウンメニューに**ClickHouse**が表示されます：

    <Image size="md" img={metabase_01} alt="Metabaseデータベース選択でClickHouseがオプションとして表示される" border />

4. データベースに**表示名**を付けます。これはMetabaseの設定であり、好きな名前を使用できます。

5. ClickHouseデータベースの接続情報を入力します。ClickHouseサーバーがSSLを使用するように設定されている場合は、安全な接続を有効にしてください。例えば：

    <Image size="md" img={metabase_02} alt="ClickHouseデータベースの接続情報フォーム" border />

6. **保存**ボタンをクリックすると、Metabaseがデータベースのテーブルをスキャンします。

## 4. SQLクエリを実行する {#4-run-a-sql-query}

1. 右上の**管理者設定**から**管理者を終了**ボタンをクリックして退出します。

2. 右上の**+ 新規**メニューをクリックし、質問をしたり、SQLクエリを実行したり、ダッシュボードを構築できることに気づきます：

    <Image size="sm" img={metabase_03} alt="Metabaseの新規メニューに質問、SQLクエリ、ダッシュボードを作成するオプションが表示される" border />

3. 例えば、以下は1995年から2022年までの年ごとの平均価格を返す`uk_price_paid`というテーブルに対して実行したSQLクエリです：

    <Image size="md" img={metabase_04} alt="UKの支払価格データに関するクエリを示すMetabaseのSQLエディタ" border />

## 5. 質問をする {#5-ask-a-question}

1. **+ 新規**をクリックし、**質問**を選択します。データベースとテーブルから始めて質問を構築できることに気づきます。例えば、以下の質問は`default`データベースの`uk_price_paid`というテーブルに対して行われています。ここでは、グレーター・マンチェスターの町ごとの平均価格を計算する簡単な質問です：

    <Image size="md" img={metabase_06} alt="UK価格データのあるMetabase質問ビルダーインターフェース" border />

2. **視覚化**ボタンをクリックして、結果を表形式で表示します。

    <Image size="md" img={metabase_07} alt="町ごとの平均価格の結果を示すMetabaseの視覚化" border />

3. 結果の下にある**視覚化**ボタンをクリックして、視覚化を棒グラフ（または他の利用可能なオプション）に変更します：

    <Image size="md" img={metabase_08} alt="グレーター・マンチェスターの町ごとの平均価格を示すMetabaseの円グラフ視覚化" border />

## もっと学ぶ {#learn-more}

Metabaseに関するさらなる情報や、ダッシュボードの構築方法については、<a href="https://www.metabase.com/docs/latest/" target="_blank">Metabaseドキュメントを訪れて</a>ご確認ください。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseを使ったデータの視覚化 - パート3 - Metabase](https://clickhouse.com/blog/visualizing-data-with-metabase)
