---
sidebar_label: 'Metabase'
sidebar_position: 131
slug: /integrations/metabase
keywords: ['Metabase']
description: 'Metabase は、データについての疑問を簡単に可視化・分析できる、使いやすいオープンソースの UI ツールです。'
title: 'Metabase を ClickHouse に接続する'
show_related_blogs: true
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
  - website: 'https://github.com/clickhouse/metabase-clickhouse-driver'
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
import PartnerBadge from '@theme/badges/PartnerBadge';


# Metabase を ClickHouse に接続する

<PartnerBadge/>

Metabase は、データに対するさまざまな問いを簡単に投げかけられるオープンソースの UI ツールです。Metabase は Java アプリケーションで、<a href="https://www.metabase.com/start/oss/jar" target="_blank">JAR ファイルをダウンロード</a>し、`java -jar metabase.jar` で実行するだけで動かせます。Metabase は、JDBC ドライバーをダウンロードして `plugins` フォルダに配置することで ClickHouse に接続します。



## 目標 {#goal}

このガイドでは、Metabaseを使用してClickHouseのデータに対してクエリを実行し、その結果を可視化します。可視化の例は次のようになります:

<Image
  size='md'
  img={metabase_08}
  alt='ClickHouseのデータを表示するMetabaseの円グラフ'
  border
/>
<p />

:::tip データの追加
使用するデータセットがない場合は、サンプルデータセットのいずれかを追加できます。このガイドでは[UK Price Paid](/getting-started/example-datasets/uk-price-paid.md)データセットを使用しているため、こちらを選択することをお勧めします。同じドキュメントカテゴリには他にも複数のデータセットがあります。
:::


## 1. 接続情報を収集する {#1-gather-your-connection-details}

<ConnectionDetails />


## 2. MetabaseのClickHouseプラグインをダウンロードする {#2--download-the-clickhouse-plugin-for-metabase}

1. `plugins`フォルダが存在しない場合は、`metabase.jar`を保存した場所にサブフォルダとして作成してください。

2. このプラグインは`clickhouse.metabase-driver.jar`という名前のJARファイルです。最新バージョンのJARファイルは<a href="https://github.com/clickhouse/metabase-clickhouse-driver/release" target="_blank">https://github.com/clickhouse/metabase-clickhouse-driver/releases/latest</a>からダウンロードできます。

3. `clickhouse.metabase-driver.jar`を`plugins`フォルダに保存してください。

4. ドライバが正しく読み込まれるように、Metabaseを起動(または再起動)してください。

5. <a href="http://localhost:3000/" target="_blank">http://hostname:3000</a>でMetabaseにアクセスしてください。初回起動時にはウェルカム画面が表示され、一連の質問に回答する必要があります。データベースの選択を求められた場合は、「**I'll add my data later**」を選択してください:


## 3. MetabaseをClickHouseに接続する {#3--connect-metabase-to-clickhouse}

1. 右上の歯車アイコンをクリックし、**Admin Settings**を選択して<a href="http://localhost:3000/admin/settings/setup" target="_blank">Metabase管理ページ</a>にアクセスします。

2. **Add a database**をクリックします。または、**Databases**タブをクリックして**Add database**ボタンを選択することもできます。

3. ドライバーのインストールが正常に完了していれば、**Database type**のドロップダウンメニューに**ClickHouse**が表示されます:

   <Image
     size='md'
     img={metabase_01}
     alt='ClickHouseがオプションとして表示されているMetabaseのデータベース選択画面'
     border
   />

4. データベースに**Display name**を設定します。これはMetabaseの設定項目なので、任意の名前を使用できます。

5. ClickHouseデータベースの接続詳細を入力します。ClickHouseサーバーがSSLを使用するように設定されている場合は、セキュア接続を有効にしてください。例:

   <Image
     size='md'
     img={metabase_02}
     alt='ClickHouseデータベース用のMetabase接続詳細フォーム'
     border
   />

6. **Save**ボタンをクリックすると、Metabaseがデータベースをスキャンしてテーブルを検出します。


## 4. SQLクエリを実行する {#4-run-a-sql-query}

1. 右上隅の **Exit admin** ボタンをクリックして **Admin settings** を終了します。

2. 右上隅の **+ New** メニューをクリックすると、質問の作成、SQLクエリの実行、ダッシュボードの構築が可能であることが確認できます。

   <Image
     size='sm'
     img={metabase_03}
     alt='質問、SQLクエリ、ダッシュボードを作成するオプションを表示するMetabaseの新規メニュー'
     border
   />

3. 例えば、以下は `uk_price_paid` という名前のテーブルに対して実行されたSQLクエリで、1995年から2022年までの年別平均支払価格を返します。

   <Image
     size='md'
     img={metabase_04}
     alt='英国不動産価格データに対するクエリを表示するMetabase SQLエディタ'
     border
   />


## 5. 質問を作成する {#5-ask-a-question}

1. **+ New**をクリックし、**Question**を選択します。データベースとテーブルを起点として質問を作成できます。例えば、以下は`default`データベース内の`uk_price_paid`テーブルに対する質問です。グレーター・マンチェスター郡内の町別に平均価格を計算する簡単な例を示します:

   <Image
     size='md'
     img={metabase_06}
     alt='英国価格データを使用したMetabase質問ビルダーインターフェース'
     border
   />

2. **Visualize**ボタンをクリックすると、結果が表形式で表示されます。

   <Image
     size='md'
     img={metabase_07}
     alt='町別の平均価格を表形式で表示したMetabaseの可視化'
     border
   />

3. 結果の下にある**Visualization**ボタンをクリックして、可視化形式を棒グラフ(または他の利用可能なオプション)に変更します:

   <Image
     size='md'
     img={metabase_08}
     alt='グレーター・マンチェスターの町別平均価格を示すMetabase円グラフの可視化'
     border
   />


## さらに詳しく {#learn-more}

Metabaseおよびダッシュボードの構築方法の詳細については、<a href="https://www.metabase.com/docs/latest/" target="_blank">Metabaseのドキュメント</a>を参照してください。
