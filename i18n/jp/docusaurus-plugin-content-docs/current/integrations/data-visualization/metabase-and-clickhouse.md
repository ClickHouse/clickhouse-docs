---
sidebar_label: 'Metabase'
sidebar_position: 131
slug: /integrations/metabase
keywords: ['Metabase']
description: 'Metabase は、データについての疑問を簡単に投げかけられるオープンソースの UI ツールです。'
title: 'Metabase と ClickHouse を接続する'
show_related_blogs: true
doc_type: 'guide'
integration:
  - support_level: 'core'
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

# Metabase を ClickHouse に接続する {#connecting-metabase-to-clickhouse}

<PartnerBadge/>

Metabase は、データに関する疑問を解消するための、使いやすいオープンソースの UI ツールです。Metabase は Java アプリケーションであり、<a href="https://www.metabase.com/start/oss/jar" target="_blank">JAR ファイルをダウンロード</a>して `java -jar metabase.jar` で実行するだけで起動できます。Metabase は、JDBC ドライバーを使用して ClickHouse に接続します。このドライバーをダウンロードして `plugins` フォルダに配置します。

## 目標 {#goal}

このガイドでは、Metabase を使って ClickHouse のデータに対していくつかクエリを実行し、その結果を可視化します。可視化結果の 1 つは次のようになります：

  <Image size="md" img={metabase_08} alt="ClickHouse のデータを表示している Metabase の円グラフ可視化" border />
<p/>

:::tip データを追加する
作業に使えるデータセットがない場合は、サンプルデータセットのいずれかを追加できます。このガイドでは [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md) データセットを使用しているので、それを選んでもよいでしょう。同じドキュメントカテゴリ内に、他にもいくつか利用できるデータセットがあります。
:::

## 1. 接続情報を確認する {#1-gather-your-connection-details}
<ConnectionDetails />

## 2.  Metabase 用の ClickHouse プラグインをダウンロードする {#2--download-the-clickhouse-plugin-for-metabase}

1. `plugins` フォルダがない場合は、`metabase.jar` を保存している場所のサブフォルダとして `plugins` フォルダを作成します。

2. プラグインは `clickhouse.metabase-driver.jar` という名前の JAR ファイルです。最新版の JAR ファイルを <a href="https://github.com/clickhouse/metabase-clickhouse-driver/release" target="_blank">https://github.com/clickhouse/metabase-clickhouse-driver/releases/latest</a> からダウンロードします。

3. `clickhouse.metabase-driver.jar` を `plugins` フォルダに保存します。

4. Metabase を起動（または再起動）して、ドライバが正しく読み込まれるようにします。

5. <a href="http://localhost:3000/" target="_blank">http://hostname:3000</a> で Metabase にアクセスします。初回起動時にはウェルカム画面が表示され、いくつかの質問に順に回答する必要があります。データベースの選択を求められた場合は、「**I'll add my data later**」を選択します。

## 3.  Metabase を ClickHouse に接続する {#3--connect-metabase-to-clickhouse}

1. 右上の歯車アイコンをクリックし、**Admin Settings** を選択して、<a href="http://localhost:3000/admin/settings/setup" target="_blank">Metabase 管理ページ</a>に移動します。

2. **Add a database** をクリックします。 または、**Databases** タブをクリックし、**Add database** ボタンを選択します。

3. ドライバーのインストールが正しく行われていれば、**Database type** のドロップダウンメニューに **ClickHouse** が表示されます。

    <Image size="md" img={metabase_01} alt="ClickHouse がオプションとして表示されている Metabase のデータベース選択画面" border />

4. データベースに **Display name** を付けます。これは Metabase 側の設定なので、任意の名前を使用できます。

5. ClickHouse データベースの接続情報を入力します。ClickHouse サーバーが SSL を使用するように構成されている場合は、安全な接続を有効にします。例:

    <Image size="md" img={metabase_02} alt="ClickHouse データベース用の Metabase 接続情報フォーム" border />

6. **Save** ボタンをクリックすると、Metabase がデータベース内のテーブルをスキャンします。

## 4. SQL クエリを実行する {#4-run-a-sql-query}

1. 右上隅にある **Exit admin** ボタンをクリックして、**Admin settings** を閉じます。

2. 右上隅の **+ New** メニューをクリックすると、質問の作成、SQL クエリの実行、ダッシュボードの作成ができることを確認できます。

    <Image size="sm" img={metabase_03} alt="Metabase の New メニューに、質問、SQL クエリ、ダッシュボードを作成するオプションが表示されている" border />

3. 例として、`uk_price_paid` というテーブルに対して、1995 年から 2022 年までの年ごとの平均支払価格を返す SQL クエリは次のようになります。

    <Image size="md" img={metabase_04} alt="UK price paid データに対するクエリを表示している Metabase の SQL エディタ" border />

## 5. 質問を作成する {#5-ask-a-question}

1. **+ New** をクリックして、**Question** を選択します。データベースとテーブルを基点として質問を作成できることに注目してください。たとえば、次の質問は `default` データベース内の `uk_price_paid` というテーブルに対して作成されています。以下は、Greater Manchester 郡内の町ごとの平均価格を計算するシンプルな質問です。

    <Image size="md" img={metabase_06} alt="UK の価格データを用いた Metabase のクエスチョンビルダーインターフェース" border />

2. **Visualize** ボタンをクリックして、結果を表形式ビューで表示します。

    <Image size="md" img={metabase_07} alt="町ごとの平均価格の表形式結果を表示している Metabase の可視化" border />

3. 結果の下にある **Visualization** ボタンをクリックして、可視化を棒グラフ（または他の利用可能なオプション）に変更します。

    <Image size="md" img={metabase_08} alt="Greater Manchester における町ごとの平均価格を示す Metabase の円グラフ可視化" border />

## 詳細はこちら {#learn-more}

Metabase の詳細やダッシュボードの作成方法については、<a href="https://www.metabase.com/docs/latest/" target="_blank">Metabase ドキュメントをご覧ください</a>。
