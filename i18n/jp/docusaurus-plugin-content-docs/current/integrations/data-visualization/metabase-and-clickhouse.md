---
sidebar_label: 'Metabase'
sidebar_position: 131
slug: /integrations/metabase
keywords: ['Metabase']
description: 'Metabase は、データに関する質問を簡単に行える使いやすいオープンソースの UI ツールです。'
title: 'Metabase を ClickHouse に接続する'
show_related_blogs: true
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
  - website: 'https://github.com/clickhouse/metabase-clickhouse-driver'
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import metabase_01 from '@site/static/images/integrations/data-visualization/metabase_01.png';
import metabase_02 from '@site/static/images/integrations/data-visualization/metabase_02.png';
import metabase_03 from '@site/static/images/integrations/data-visualization/metabase_03.png';
import metabase_04 from '@site/static/images/integrations/data-visualization/metabase_04.png';
import metabase_06 from '@site/static/images/integrations/data-visualization/metabase_06.png';
import metabase_07 from '@site/static/images/integrations/data-visualization/metabase_07.png';
import metabase_08 from '@site/static/images/integrations/data-visualization/metabase_08.png';
import PartnerBadge from '@theme/badges/PartnerBadge';


# Metabase を ClickHouse に接続する \{#connecting-metabase-to-clickhouse\}

<PartnerBadge/>

Metabase は、データに関するクエリや分析を行うための、使いやすいオープンソースの UI ツールです。Metabase は Java 製のアプリケーションで、<a href="https://www.metabase.com/start/oss/jar" target="_blank">JAR ファイルをダウンロード</a>し、`java -jar metabase.jar` で実行するだけで動かせます。Metabase は、JDBC ドライバーをダウンロードして `plugins` フォルダーに配置することで ClickHouse に接続できます。

## 目的 \{#goal\}

このガイドでは、Metabase を使って ClickHouse のデータにいくつか質問を投げかけ、その回答を可視化します。回答のひとつは次のようになります。

<Image size="md" img={metabase_08} alt="ClickHouse のデータを表示している Metabase の円グラフ可視化" border />

<p/>

:::tip データを追加する
まだ操作できるデータセットがない場合は、サンプルデータセットのいずれかを追加してください。このガイドでは [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md) データセットを使用するので、それを選んでもよいでしょう。同じドキュメントカテゴリ内に、他にもいくつかのデータセットがあります。
:::

## 1. 接続情報を準備する \{#1-gather-your-connection-details\}

<ConnectionDetails />

## 2.  Metabase 用の ClickHouse プラグインをダウンロードする \{#2--download-the-clickhouse-plugin-for-metabase\}

1. `plugins` フォルダがない場合は、`metabase.jar` を保存している場所のサブフォルダとして `plugins` フォルダを作成します。

2. プラグインは `clickhouse.metabase-driver.jar` という名前の JAR ファイルです。JAR ファイルの最新バージョンを <a href="https://github.com/clickhouse/metabase-clickhouse-driver/release" target="_blank">https://github.com/clickhouse/metabase-clickhouse-driver/releases/latest</a> からダウンロードします。

3. `clickhouse.metabase-driver.jar` を `plugins` フォルダに保存します。

4. ドライバが正しく読み込まれるように、Metabase を起動（または再起動）します。

5. <a href="http://localhost:3000/" target="_blank">http://hostname:3000</a> で Metabase にアクセスします。初回起動時には、ウェルカム画面が表示され、一連の質問に回答していく必要があります。データベースの選択を求められたら、「**I'll add my data later**」を選択します。

## 3.  Metabase を ClickHouse に接続する \{#3--connect-metabase-to-clickhouse\}

1. 右上の歯車アイコンをクリックし、**Admin Settings** を選択して、<a href="http://localhost:3000/admin/settings/setup" target="_blank">Metabase 管理ページ</a>にアクセスします。

2. **Add a database** をクリックします。 または、**Databases** タブをクリックして **Add database** ボタンを選択します。

3. ドライバーのインストールが成功していれば、**Database type** のドロップダウンメニューに **ClickHouse** が表示されます:

    <Image size="md" img={metabase_01} alt="Metabase のデータベース選択画面に ClickHouse がオプションとして表示されている様子" border />

4. データベースに **Display name** を付けます。これは Metabase 側の設定項目なので、任意の名前を使用できます。

5. ClickHouse データベースの接続情報を入力します。ClickHouse サーバーが SSL を使用するように構成されている場合は、セキュアな接続を有効にします。例えば:

    <Image size="md" img={metabase_02} alt="ClickHouse データベース用の Metabase 接続情報入力フォーム" border />

6. **Save** ボタンをクリックすると、Metabase がデータベース内のテーブルをスキャンします。

## 4. SQL クエリを実行する \{#4-run-a-sql-query\}

1. 画面右上の **Exit admin** ボタンをクリックして、**Admin settings** を終了します。

2. 画面右上の **+ New** メニューをクリックすると、質問の作成、SQL クエリの実行、ダッシュボードの作成ができることが分かります:

    <Image size="sm" img={metabase_03} alt="Metabase の New メニューに、質問、SQL クエリ、ダッシュボードを作成するオプションが表示されている" border />

3. 例として、`uk_price_paid` という名前のテーブルに対して実行した SQL クエリを示します。このクエリは、1995 年から 2022 年までの年ごとの平均支払価格を返します:

    <Image size="md" img={metabase_04} alt="UK の price paid データに対するクエリを表示している Metabase の SQL エディタ" border />

## 5. 質問を作成する \{#5-ask-a-question\}

1. **+ New** をクリックし、**Question** を選択します。データベースとテーブルを起点にして質問を作成できることが分かります。たとえば、次の質問は、`default` データベース内の `uk_price_paid` という名前のテーブルに対して実行しています。以下は、Greater Manchester 郡内で、町ごとの平均価格を計算するシンプルな質問です。

    <Image size="md" img={metabase_06} alt="UK の価格データを表示する Metabase の質問ビルダーインターフェース" border />

2. **Visualize** ボタンをクリックして、結果を表形式で表示します。

    <Image size="md" img={metabase_07} alt="町ごとの平均価格を表形式で表示する Metabase の可視化画面" border />

3. 結果の下にある **Visualization** ボタンをクリックし、可視化タイプを棒グラフ（または利用可能な他のオプション）に変更します。

    <Image size="md" img={metabase_08} alt="Greater Manchester における町ごとの平均価格を示す Metabase の円グラフ可視化" border />

## さらに学ぶ \{#learn-more\}

Metabase についてさらに詳しく知り、ダッシュボードの構築方法を学ぶには、<a href="https://www.metabase.com/docs/latest/" target="_blank">Metabase のドキュメントをご覧ください</a>。