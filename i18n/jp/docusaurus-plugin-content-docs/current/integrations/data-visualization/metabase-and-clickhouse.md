---
'sidebar_label': 'Metabase'
'sidebar_position': 131
'slug': '/integrations/metabase'
'keywords':
- 'Metabase'
'description': 'Metabaseは、データについて質問するための簡単に使えるオープンソースのUIツールです。'
'title': 'MetabaseをClickHouseに接続する'
'show_related_blogs': true
'doc_type': 'guide'
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


# MetabaseをClickHouseに接続する

<CommunityMaintainedBadge/>

Metabaseは、データに関する質問を行うための使いやすいオープンソースUIツールです。MetabaseはJavaアプリケーションで、単に<a href="https://www.metabase.com/start/oss/jar" target="_blank">JARファイルをダウンロード</a>し、`java -jar metabase.jar`で実行することで起動できます。Metabaseは、ダウンロードしたJDBCドライバを`plugins`フォルダーに配置することでClickHouseに接続します。

## 目標 {#goal}

このガイドでは、Metabaseを使用してClickHouseデータにいくつかの質問をし、その回答を視覚化します。その回答の一例を以下に示します：

  <Image size="md" img={metabase_08} alt="Metabaseの円グラフの視覚化、ClickHouseからのデータを表示" border />
<p/>

:::tip データを追加する
使用するデータセットがない場合は、いくつかの例の中から追加できます。このガイドでは、[UK Price Paid](/getting-started/example-datasets/uk-price-paid.md)データセットを使用するので、それを選ぶとよいでしょう。同じドキュメントカテゴリーには他にもいくつかの選択肢があります。
:::

## 1. 接続情報を集める {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. Metabase用のClickHouseプラグインをダウンロードする {#2--download-the-clickhouse-plugin-for-metabase}

1. `plugins`フォルダーがない場合は、`metabase.jar`が保存されている場所のサブフォルダーとして作成します。

2. プラグインは`clickhouse.metabase-driver.jar`という名前のJARファイルです。最新のJARファイルを<a href="https://github.com/clickhouse/metabase-clickhouse-driver/release" target="_blank">https://github.com/clickhouse/metabase-clickhouse-driver/releases/latest</a>からダウンロードします。

3. `clickhouse.metabase-driver.jar`を`plugins`フォルダーに保存します。

4. ドライバーが正しく読み込まれるようにMetabaseを起動（または再起動）します。

5. <a href="http://localhost:3000/" target="_blank">http://hostname:3000</a>でMetabaseにアクセスします。初回起動時にはウェルカム画面が表示され、一連の質問に答える必要があります。データベースの選択を求められた場合は、"**後でデータを追加します**"を選択します：

## 3. MetabaseをClickHouseに接続する {#3--connect-metabase-to-clickhouse}

1. 右上のギアアイコンをクリックして**管理設定**を選択し、<a href="http://localhost:3000/admin/settings/setup" target="_blank">Metabase管理ページ</a>にアクセスします。

2. **データベースを追加**をクリックします。あるいは、**データベース**タブをクリックして**データベースを追加**ボタンを選択します。

3. ドライバーのインストールが成功していれば、**データベースタイプ**のドロップダウンメニューに**ClickHouse**が表示されます：

    <Image size="md" img={metabase_01} alt="ClickHouseが選択肢として表示されるMetabaseのデータベース選択" border />

4. データベースに**表示名**を付けます。これはMetabaseの設定であり、好きな名前を使用できます。

5. ClickHouseデータベースの接続情報を入力します。ClickHouseサーバーがSSLを使用するように構成されている場合は、安全な接続を有効にします。例えば：

    <Image size="md" img={metabase_02} alt="ClickHouseデータベースの接続情報フォーム" border />

6. **保存**ボタンをクリックすると、Metabaseがデータベース内のテーブルをスキャンします。

## 4. SQLクエリを実行する {#4-run-a-sql-query}

1. 右上のコーナーにある**管理設定**をクリックして**管理を終了**ボタンをクリックします。

2. 右上のコーナーにある**+ 新規**メニューをクリックし、質問をしたり、SQLクエリを実行したり、ダッシュボードを作成したりできることに気づきます：

    <Image size="sm" img={metabase_03} alt="質問、SQLクエリ、ダッシュボードを作成するオプションが表示されるMetabase新規メニュー" border />

3. 例えば、以下は`uk_price_paid`というテーブルで実行されたSQLクエリで、1995年から2022年までの年ごとの平均価格を返します：

    <Image size="md" img={metabase_04} alt="UKの価格支払データに対するクエリを表示するMetabaseのSQLエディタ" border />

## 5. 質問をする {#5-ask-a-question}

1. **+ 新規**をクリックして**質問**を選択します。データベースとテーブルから質問を構築できることに注意してください。例えば、以下の質問は`default`データベースの`uk_price_paid`というテーブルに対して行われています。以下は、グレーター・マンチェスターの町ごとの平均価格を計算する簡単な質問です：

    <Image size="md" img={metabase_06} alt="UK価格データを使用したMetabaseの質問ビルダーインターフェース" border />

2. **視覚化**ボタンをクリックして、結果を表形式で確認します。

    <Image size="md" img={metabase_07} alt="町ごとの平均価格の表形式の結果を表示するMetabaseの視覚化" border />

3. 結果の下で、**視覚化**ボタンをクリックして、視覚化を棒グラフ（または他の利用可能なオプションのいずれか）に変更します：

    <Image size="md" img={metabase_08} alt="グレーター・マンチェスターの町ごとの平均価格のMetabaseの円グラフ視覚化" border />

## 詳しく知る {#learn-more}

Metabaseについての詳細やダッシュボードの作成方法については、<a href="https://www.metabase.com/docs/latest/" target="_blank">Metabaseのドキュメントを訪れて</a>ください。
