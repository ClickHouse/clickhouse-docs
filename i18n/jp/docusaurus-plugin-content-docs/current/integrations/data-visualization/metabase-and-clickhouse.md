---
'sidebar_label': 'Metabase'
'sidebar_position': 131
'slug': '/integrations/metabase'
'keywords':
- 'ClickHouse'
- 'Metabase'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Metabaseは、データに関する質問をするための使いやすいオープンソースUIツールです。'
'title': 'Connecting Metabase to ClickHouse'
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
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# ClickHouseへのMetabaseの接続

<CommunityMaintainedBadge/>

Metabaseは、データに関する質問を行うための使いやすいオープンソースのUIツールです。MetabaseはJavaアプリケーションであり、単に<a href="https://www.metabase.com/start/oss/jar" target="_blank">JARファイルをダウンロード</a>して、`java -jar metabase.jar`を実行することで実行できます。Metabaseは、ダウンロードして`plugins`フォルダに置くJDBCドライバを使用してClickHouseに接続します。

## 目標 {#goal}

このガイドでは、Metabaseを使用してClickHouseデータにいくつかの質問を行い、その回答を可視化します。回答の1つはこのように見えます：

<Image size="md" img={metabase_08} alt="ClickHouseのデータを表示するMetabaseの円グラフビジュアライゼーション" border />
<p/>

:::tip データを追加する
作業するためのデータセットがない場合は、例の1つを追加できます。このガイドでは[UK Price Paid](/getting-started/example-datasets/uk-price-paid.md)データセットを使用しているので、それを選択してもよいでしょう。同じ文書カテゴリに他にもいくつかの候補があります。
:::

## 1. 接続詳細を集める {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. Metabase用のClickHouseプラグインをダウンロードする {#2--download-the-clickhouse-plugin-for-metabase}

1. `plugins`フォルダがない場合は、`metabase.jar`を保存しているフォルダのサブフォルダとして作成します。

2. プラグインは`clickhouse.metabase-driver.jar`という名前のJARファイルです。JARファイルの最新バージョンを<a href="https://github.com/clickhouse/metabase-clickhouse-driver/release" target="_blank">https://github.com/clickhouse/metabase-clickhouse-driver/releases/latest</a>からダウンロードします。

3. `clickhouse.metabase-driver.jar`を`plugins`フォルダに保存します。

4. Metabaseを起動（または再起動）して、ドライバが正常に読み込まれるようにします。

5. <a href="http://localhost:3000/" target="_blank">http://hostname:3000</a>でMetabaseにアクセスします。初回起動時には歓迎画面が表示され、一連の質問を通過する必要があります。データベースを選択するように促された場合は、「**後でデータを追加します**」を選択します：

## 3. MetabaseをClickHouseに接続する {#3--connect-metabase-to-clickhouse}

1. 右上隅の歯車アイコンをクリックして**管理設定**を選択し、<a href="http://localhost:3000/admin/settings/setup" target="_blank">Metabaseの管理ページ</a>にアクセスします。

2. **データベースを追加**をクリックします。あるいは、**データベース**タブをクリックして**データベースを追加**ボタンを選択できます。

3. ドライバのインストールが成功していれば、**データベースタイプ**のドロップダウンメニューに**ClickHouse**が表示されます：

<Image size="md" img={metabase_01} alt="ClickHouseが選択肢に表示されたMetabaseのデータベース選択" border />

4. データベースに**表示名**を付けます。これはMetabaseの設定なので、お好きな名前を使用してください。

5. ClickHouseデータベースの接続詳細を入力します。ClickHouseサーバーがSSLを使用するように設定されている場合は、安全な接続を有効にします。例えば：

<Image size="md" img={metabase_02} alt="ClickHouseデータベースの接続詳細フォーム" border />

6. **保存**ボタンをクリックすると、Metabaseはデータベース内のテーブルをスキャンします。

## 4. SQLクエリを実行する {#4-run-a-sql-query}

1. 右上隅の**管理設定を終了**ボタンをクリックして、**管理設定**から退出します。

2. 右上隅で**+ 新規**メニューをクリックし、質問の作成、SQLクエリの実行、ダッシュボードの構築ができることに気づきます：

<Image size="sm" img={metabase_03} alt="Metabaseの新規メニュー、質問、SQLクエリ、ダッシュボードの作成オプションを表示" border />

3. 例えば、1995年から2022年までの年ごとの平均価格を返す`uk_price_paid`という名前のテーブルで実行されたSQLクエリは以下の通りです：

<Image size="md" img={metabase_04} alt="UK価格支払いデータに対するクエリを示すMetabaseのSQLエディタ" border />

## 5. 質問をする {#5-ask-a-question}

1. **+ 新規**をクリックして**質問**を選択します。データベースとテーブルから開始して質問を構築できることに気づきます。例えば、次の質問は`default`データベースにある`uk_price_paid`というテーブルに対して行われています。ここでは、グレーター・マンチェスター郡内の町ごとの平均価格を計算する簡単な質問です：

<Image size="md" img={metabase_06} alt="UK価格データを使ったMetabaseの質問ビルダーインターフェース" border />

2. **可視化**ボタンをクリックして、結果を表形式で表示します。

<Image size="md" img={metabase_07} alt="町ごとの平均価格の表形式の結果を示すMetabaseの可視化" border />

3. 結果の下にある**可視化**ボタンをクリックして、視覚化を棒グラフに変更します（または他のどのオプションでも可能です）：

<Image size="md" img={metabase_08} alt="グレーター・マンチェスターの町ごとの平均価格の円グラフビジュアライゼーション" border />

## 詳しく学ぶ {#learn-more}

Metabaseやダッシュボードの構築方法についての詳細情報は、<a href="https://www.metabase.com/docs/latest/" target="_blank">Metabaseのドキュメントを訪れることで得られます</a>。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseでのデータの可視化 - 第3部 - Metabase](https://clickhouse.com/blog/visualizing-data-with-metabase)
