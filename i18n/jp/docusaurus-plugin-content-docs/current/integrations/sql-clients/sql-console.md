---
sidebar_label: 'SQLコンソール'
sidebar_position: 1
title: 'SQLコンソール'
slug: /integrations/sql-clients/sql-console
description: 'SQLコンソールについて学ぶ'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import Image from '@theme/IdealImage';
import table_list_and_schema from '@site/static/images/cloud/sqlconsole/table-list-and-schema.png';
import view_columns from '@site/static/images/cloud/sqlconsole/view-columns.png';
import abc from '@site/static/images/cloud/sqlconsole/abc.png';
import inspecting_cell_content from '@site/static/images/cloud/sqlconsole/inspecting-cell-content.png';
import sort_descending_on_column from '@site/static/images/cloud/sqlconsole/sort-descending-on-column.png';
import filter_on_radio_column_equal_gsm from '@site/static/images/cloud/sqlconsole/filter-on-radio-column-equal-gsm.png';
import add_more_filters from '@site/static/images/cloud/sqlconsole/add-more-filters.png';
import filtering_and_sorting_together from '@site/static/images/cloud/sqlconsole/filtering-and-sorting-together.png';
import create_a_query_from_sorts_and_filters from '@site/static/images/cloud/sqlconsole/create-a-query-from-sorts-and-filters.png';
import creating_a_query from '@site/static/images/cloud/sqlconsole/creating-a-query.png';
import run_selected_query from '@site/static/images/cloud/sqlconsole/run-selected-query.png';
import run_at_cursor_2 from '@site/static/images/cloud/sqlconsole/run-at-cursor-2.png';
import run_at_cursor from '@site/static/images/cloud/sqlconsole/run-at-cursor.png';
import cancel_a_query from '@site/static/images/cloud/sqlconsole/cancel-a-query.png';
import sql_console_save_query from '@site/static/images/cloud/sqlconsole/sql-console-save-query.png';
import sql_console_rename from '@site/static/images/cloud/sqlconsole/sql-console-rename.png';
import sql_console_share from '@site/static/images/cloud/sqlconsole/sql-console-share.png';
import sql_console_edit_access from '@site/static/images/cloud/sqlconsole/sql-console-edit-access.png';
import sql_console_add_team from '@site/static/images/cloud/sqlconsole/sql-console-add-team.png';
import sql_console_edit_member from '@site/static/images/cloud/sqlconsole/sql-console-edit-member.png';
import sql_console_access_queries from '@site/static/images/cloud/sqlconsole/sql-console-access-queries.png';
import search_hn from '@site/static/images/cloud/sqlconsole/search-hn.png';
import match_in_body from '@site/static/images/cloud/sqlconsole/match-in-body.png';
import pagination from '@site/static/images/cloud/sqlconsole/pagination.png';
import pagination_nav from '@site/static/images/cloud/sqlconsole/pagination-nav.png';
import download_as_csv from '@site/static/images/cloud/sqlconsole/download-as-csv.png';
import tabular_query_results from '@site/static/images/cloud/sqlconsole/tabular-query-results.png';
import switch_from_query_to_chart from '@site/static/images/cloud/sqlconsole/switch-from-query-to-chart.png';
import trip_total_by_week from '@site/static/images/cloud/sqlconsole/trip-total-by-week.png';
import bar_chart from '@site/static/images/cloud/sqlconsole/bar-chart.png';
import change_from_bar_to_area from '@site/static/images/cloud/sqlconsole/change-from-bar-to-area.png';
import update_query_name from '@site/static/images/cloud/sqlconsole/update-query-name.png';
import update_subtitle_etc from '@site/static/images/cloud/sqlconsole/update-subtitle-etc.png';
import adjust_axis_scale from '@site/static/images/cloud/sqlconsole/adjust-axis-scale.png';
import give_a_query_a_name from '@site/static/images/cloud/sqlconsole/give-a-query-a-name.png'
import save_the_query from '@site/static/images/cloud/sqlconsole/save-the-query.png'


# SQLコンソール

SQLコンソールは、ClickHouse Cloudでデータベースを探索し、クエリを実行する最も迅速かつ簡単な方法です。SQLコンソールを使用して以下を行うことができます。

- ClickHouse Cloudサービスに接続する
- テーブルデータを表示、フィルタリング、並べ替える
- クエリを実行し、結果データを数回のクリックで視覚化する
- チームメンバーとクエリを共有し、より効果的にコラボレーションする

## テーブルの探索 {#exploring-tables}

### テーブルリストとスキーマ情報の表示 {#viewing-table-list-and-schema-info}

ClickHouseインスタンスに含まれるテーブルの概要は、左サイドバー領域に表示されます。左バーの上部にあるデータベースセレクタを使用して、特定のデータベース内のテーブルを表示します。

<Image img={table_list_and_schema} size="lg" border alt="左サイドバーにおけるデータベーステーブルの表示"/>

リスト内のテーブルは展開して、カラムやデータ型を表示することもできます。

<Image img={view_columns} size="lg" border alt="カラム名とデータ型を表示している拡張テーブルのビュー"/>

### テーブルデータの探索 {#exploring-table-data}

リスト内のテーブルをクリックすると、新しいタブで開きます。テーブルビューでは、データを簡単に表示、選択、コピーできます。構造とフォーマットは、Microsoft ExcelやGoogle Sheetsなどのスプレッドシートアプリケーションにコピー＆ペーストする際にも保持されます。テーブルデータのページを切り替えることができます（30行ずつの分 paginated）下部のナビゲーションを使用して。

<Image img={abc} size="lg" border alt="選択してコピーできるデータを表示しているテーブルビュー"/>

### セルデータの検査 {#inspecting-cell-data}

セルインスペクターツールを使用すると、単一のセル内に含まれる大量のデータを表示できます。セルを右クリックして、「セルを検査」を選択すると開きます。セルインスペクターの内容をコピーするには、インスペクター内容の右上隅にあるコピーアイコンをクリックします。

<Image img={inspecting_cell_content} size="lg" border alt="選択したセルの内容を表示しているセルインスペクターダイアログ"/>

## テーブルのフィルタリングと並べ替え {#filtering-and-sorting-tables}

### テーブルの並べ替え {#sorting-a-table}

SQLコンソールでテーブルを並べ替えるには、テーブルを開いてツールバーの「並べ替え」ボタンを選択します。このボタンをクリックすると、並べ替えを構成するためのメニューが開きます。並べ替えに使用するカラムを選択し、並べ替えの順序（昇順または降順）を設定できます。「適用」を選択するか、Enterを押してテーブルを並べ替えます。

<Image img={sort_descending_on_column} size="lg" border alt="カラムに対する降順並べ替えの設定を表示している並べ替えダイアログ"/>

SQLコンソールでは、テーブルに複数の並べ替えを追加することもできます。「並べ替え」ボタンを再度クリックして、別の並べ替えを追加します。注意: 並べ替えは、並べ替えペインに表示される順序（上から下）に適用されます。並べ替えを削除するには、単に並べ替えの横にある「x」ボタンをクリックしてください。

### テーブルのフィルタリング {#filtering-a-table}

SQLコンソールでテーブルをフィルタリングするには、テーブルを開いて「フィルタ」ボタンを選択します。並べ替えと同様に、このボタンをクリックするとフィルタを設定するためのメニューが開きます。フィルタリングに使用するカラムを選択し、必要な条件を選択できます。SQLコンソールは、カラムに含まれるデータのタイプに応じたフィルタオプションをインテリジェントに表示します。

<Image img={filter_on_radio_column_equal_gsm} size="lg" border alt="GSMに等しいラジオカラムのフィルタ設定を表示しているフィルタダイアログ"/>

フィルタが満足できる状態になったら、「適用」を選択してデータをフィルタリングできます。また、次のように追加フィルタを追加することもできます。

<Image img={add_more_filters} size="lg" border alt="2000より大きな範囲で追加フィルタを追加する方法を示したダイアログ"/>

並べ替え機能と同様に、フィルタを削除するには、フィルタの横にある「x」ボタンをクリックしてください。

### 同時にフィルタリングと並べ替え {#filtering-and-sorting-together}

SQLコンソールでは、テーブルを同時にフィルタリングと並べ替えができます。これを行うには、上記で説明した手順を使用して、必要なフィルタと並べ替えをすべて追加し、「適用」ボタンをクリックします。

<Image img={filtering_and_sorting_together} size="lg" border alt="同時にフィルタリングと並べ替えが適用されているインターフェース"/>

### フィルタと並べ替えからクエリを作成 {#creating-a-query-from-filters-and-sorts}

SQLコンソールは、フィルタと並べ替えを1クリックでクエリに変換できます。「クエリを作成」ボタンをツールバーから選択し、選択した並べ替えとフィルタのパラメータを指定します。「クエリを作成」をクリックすると、新しいクエリタブが開き、テーブルビューに含まれるデータに対応するSQLコマンドが事前に入力された状態になります。

<Image img={create_a_query_from_sorts_and_filters} size="lg" border alt="フィルタと並べ替えからSQLを生成するCreate Queryボタンを表示しているインターフェース"/>

:::note
「クエリ作成」機能を使用する際に、フィルタと並べ替えは必須ではありません。
:::

SQLコンソールでのクエリに関しては、(link)のクエリドキュメントを読むことで詳しく学べます。

## クエリの作成と実行 {#creating-and-running-a-query}

### クエリの作成 {#creating-a-query}

SQLコンソールで新しいクエリを作成する方法は2つあります。

- タブバーの「+」ボタンをクリックする
- 左サイドバーのクエリリストから「新しいクエリ」ボタンを選択する

<Image img={creating_a_query} size="lg" border alt="+ボタンまたは新しいクエリボタンで新しいクエリを作成する方法を表示しているインターフェース"/>

### クエリの実行 {#running-a-query}

クエリを実行するには、SQLエディタにSQLコマンドを入力し、「実行」ボタンをクリックするか、ショートカット `cmd / ctrl + enter` を使用します。複数のコマンドを順次書いて実行するには、各コマンドの後にセミコロンを追加してください。

クエリ実行オプション
デフォルトでは、実行ボタンをクリックするとSQLエディタに含まれるすべてのコマンドが実行されます。SQLコンソールは他に2つのクエリ実行オプションをサポートしています。

- 選択したコマンドを実行
- カーソルの位置でコマンドを実行

選択したコマンドを実行するには、希望するコマンドやコマンドのシーケンスをハイライトして「実行」ボタンをクリックするか、ショートカット `cmd / ctrl + enter` を使用します。また、選択されている状態のときに、SQLエディタのコンテキストメニュー（エディタ内の任意の場所を右クリックして開く）から「選択した実行」を選択することもできます。

<Image img={run_selected_query} size="lg" border alt="選択したSQLクエリの一部を実行する方法を表示しているインターフェース"/>

現在のカーソル位置でコマンドを実行するには、2つの方法があります。

- 拡張実行オプションメニューから「カーソルで実行」を選択する（または `cmd / ctrl + shift + enter` キーのショートカットを使用します）

<Image img={run_at_cursor_2} size="lg" border alt='拡張実行オプションメニューでのカーソルで実行""のオプション'/>

  - SQLエディタのコンテキストメニューから「カーソルで実行」を選択します。

<Image img={run_at_cursor} size="lg" border alt="SQLエディタのコンテキストメニューでのカーソルで実行オプション"/>

:::note
カーソル位置にあるコマンドは、実行時に黄色に点滅します。
:::

### クエリのキャンセル {#canceling-a-query}

クエリが実行中の間、クエリエディタツールバーの「実行」ボタンは「キャンセル」ボタンに置き換えられます。このボタンをクリックするか、 `Esc` キーを押すことでクエリをキャンセルできます。注意: すでに返された結果は、キャンセル後も保持されます。

<Image img={cancel_a_query} size="lg" border alt="クエリ実行中に表示されるキャンセルボタン"/>

### クエリの保存 {#saving-a-query}

未命名の場合、クエリは「無題のクエリ」と呼ばれます。クエリ名をクリックすると変更できます。クエリの名前を変更すると、クエリが保存されます。

<Image img={give_a_query_a_name} size="lg" border alt="無題のクエリからクエリの名前を変更する方法を表示しているインターフェース"/>

保存ボタンまたは `cmd / ctrl + s` のショートカットを使用してクエリを保存することもできます。

<Image img={save_the_query} size="lg" border alt="クエリエディタツールバーにある保存ボタン"/>

## GenAIを使用してクエリを管理する {#using-genai-to-manage-queries}

この機能により、ユーザーは自然言語の質問としてクエリを書くことができ、クエリコンソールが利用可能なテーブルのコンテキストに基づいてSQLクエリを作成します。GenAIはまた、ユーザーがクエリをデバッグする手助けもします。

GenAIの詳細については、[ClickHouse CloudのGenAIによるクエリ提案の発表に関するブログ記事](https://clickhouse.com/blog/announcing-genai-powered-query-suggestions-clickhouse-cloud)をご覧ください。

### テーブルのセットアップ {#table-setup}

イギリスの価格データセットの例をインポートし、それを使用していくつかのGenAIクエリを作成します。

1. ClickHouse Cloudサービスを開きます。
2. _+_ アイコンをクリックして新しいクエリを作成します。
3. 次のコードをペーストして実行します。

   ```sql
   CREATE TABLE uk_price_paid
   (
       price UInt32,
       date Date,
       postcode1 LowCardinality(String),
       postcode2 LowCardinality(String),
       type Enum8('terraced' = 1, 'semi-detached' = 2, 'detached' = 3, 'flat' = 4, 'other' = 0),
       is_new UInt8,
       duration Enum8('freehold' = 1, 'leasehold' = 2, 'unknown' = 0),
       addr1 String,
       addr2 String,
       street LowCardinality(String),
       locality LowCardinality(String),
       town LowCardinality(String),
       district LowCardinality(String),
       county LowCardinality(String)
   )
   ENGINE = MergeTree
   ORDER BY (postcode1, postcode2, addr1, addr2);
   ```

   このクエリは、約1秒で完了します。完了すると、 `uk_price_paid` という空のテーブルが作成されているはずです。

4. 新しいクエリを作成し、次のクエリをペーストします。

   ```sql
   INSERT INTO uk_price_paid
   WITH
      splitByChar(' ', postcode) AS p
   SELECT
       toUInt32(price_string) AS price,
       parseDateTimeBestEffortUS(time) AS date,
       p[1] AS postcode1,
       p[2] AS postcode2,
       transform(a, ['T', 'S', 'D', 'F', 'O'], ['terraced', 'semi-detached', 'detached', 'flat', 'other']) AS type,
       b = 'Y' AS is_new,
       transform(c, ['F', 'L', 'U'], ['freehold', 'leasehold', 'unknown']) AS duration,
       addr1,
       addr2,
       street,
       locality,
       town,
       district,
       county
   FROM url(
       'http://prod.publicdata.landregistry.gov.uk.s3-website-eu-west-1.amazonaws.com/pp-complete.csv',
       'CSV',
       'uuid_string String,
       price_string String,
       time String,
       postcode String,
       a String,
       b String,
       c String,
       addr1 String,
       addr2 String,
       street String,
       locality String,
       town String,
       district String,
       county String,
       d String,
       e String'
   ) SETTINGS max_http_get_redirects=10;
   ```

このクエリは、 `gov.uk` ウェブサイトからデータセットを取得します。このファイルは約4GBなので、このクエリの完了には数分かかります。ClickHouseがクエリを処理した後、 `uk_price_paid` テーブルに全データセットが格納されているはずです。

#### クエリの作成 {#query-creation}

自然言語を使用してクエリを作成してみましょう。

1. **uk_price_paid** テーブルを選択し、次に **クエリを作成** をクリックします。
2. **SQLを生成** をクリックします。クエリがChat-GPTに送信されることを受け入れるように求められる場合があります。続行するには **同意します** を選択する必要があります。
3. 今、自然言語のクエリを入力し、ChatGPTがそれをSQLクエリに変換します。この例では、次の内容を入力します。

   > 年ごとの全 `uk_price_paid` 取引の合計価格と合計数を示してください。

4. コンソールは、探しているクエリを生成し、新しいタブに表示します。この例では、GenAIは次のクエリを作成しました。

   ```sql
   -- 年ごとの全 uk_price_paid 取引の合計価格と合計数を示してください。
   SELECT year(date), sum(price) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
   ```

5. クエリが正しいことを確認したら、 **実行** をクリックして実行します。

### デバッグ {#debugging}

次に、GenAIのクエリデバッグ機能をテストしてみましょう。

1. _+_ アイコンをクリックして新しいクエリを作成し、次のコードをペーストします。

   ```sql
   -- 年ごとの全 uk_price_paid 取引の合計価格と合計数を示してください。
   SELECT year(date), sum(pricee) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
   ```

2. **実行** をクリックします。クエリは失敗します。なぜなら、 `pricee` から値を取得しようとしているからです。
3. **クエリを修正** をクリックします。
4. GenAIはクエリを修正しようとします。この場合、 `pricee` を `price` に変更しました。また、このシナリオでは `toYear` がより良い関数であることに気づきました。
5. 提案された変更をクエリに追加するには **適用** を選択し、 **実行** をクリックします。

GenAIは実験的な機能であることを考慮してください。GenAI生成のクエリを任意のデータセットに対して実行する際は注意が必要です。

## 高度なクエリ機能 {#advanced-querying-features}

### クエリ結果の検索 {#searching-query-results}

クエリが実行された後、結果ペイン内の検索入力を使用して、返された結果セットをすばやく検索できます。この機能は、追加の `WHERE` 句の結果をプレビューしたり、特定のデータが結果セットに含まれていることを確認するのに役立ちます。検索入力に値を入力すると、結果ペインは更新され、入力した値と一致するレコードが返されます。この例では、 `hackernews` テーブルで `ClickHouse` を含むコメントのすべての `breakfast` インスタンスを探します：

<Image img={search_hn} size="lg" border alt="Hacker Newsのデータを検索"/>

注意: 入力された値に一致する任意のフィールドが返されます。例えば、上のスクリーンショットの3番目のレコードは、`by` フィールドにおいて 'breakfast' に一致しませんが、 `text` フィールドは一致します：

<Image img={match_in_body} size="lg" border alt="本文の一致"/>

### ページネーション設定の調整 {#adjusting-pagination-settings}

デフォルトでは、クエリ結果ペインはすべての結果レコードを1ページに表示します。大きな結果セットの場合、結果をページネートして簡単に表示できるようにする方が好ましいことがあります。これは、結果ペインの右下にあるページネーションセレクタを使用して実行できます。

<Image img={pagination} size="lg" border alt="ページネーションオプション"/>

ページサイズを選択すると、結果セットにすぐにページネーションが適用され、結果ペインのフッターの中央にナビゲーションオプションが現れます。

<Image img={pagination_nav} size="lg" border alt="ページネーションナビゲーション"/>

### クエリ結果データのエクスポート {#exporting-query-result-data}

クエリ結果セットは、SQLコンソールから直接CSV形式に簡単にエクスポートできます。そのためには、結果ペインツールバーの右側にある `•••` メニューを開き、「CSVとしてダウンロード」を選択します。

<Image img={download_as_csv} size="lg" border alt="CSVとしてダウンロード"/>

## クエリデータの視覚化 {#visualizing-query-data}

一部のデータは、チャート形式での解釈が容易です。SQLコンソールからクエリ結果データを直接数回のクリックで視覚化できます。例として、NYCタクシーの週次統計を計算するクエリを使用します：

```sql
select
   toStartOfWeek(pickup_datetime) as week,
   sum(total_amount) as fare_total,
   sum(trip_distance) as distance_total,
   count(*) as trip_total
from
   nyc_taxi
group by
   1
order by
   1 asc
```

<Image img={tabular_query_results} size="lg" border alt="表形式のクエリ結果"/>

視覚化がないと、これらの結果は解釈するのが難しいです。これをチャートに変えてみましょう。

### チャートの作成 {#creating-charts}

視覚化の構築を始めるには、クエリ結果ペインツールバーから「チャート」オプションを選択します。チャート設定ペインが表示されます：

<Image img={switch_from_query_to_chart} size="lg" border alt="クエリからチャートに切り替え"/>

最初に、 `week` ごとの `trip_total` を追跡する簡単な棒グラフを作成します。これを実現するために、 `week` フィールドをx軸にドラッグし、 `trip_total` フィールドをy軸にドラッグします：

<Image img={trip_total_by_week} size="lg" border alt="週ごとの移動合計"/>

ほとんどのチャートタイプでは、数値軸上に複数のフィールドをサポートしています。これを示すために、 `fare_total` フィールドをy軸上にドラッグします：

<Image img={bar_chart} size="lg" border alt="棒グラフ"/>

### チャートのカスタマイズ {#customizing-charts}

SQLコンソールは、チャートタイプ設定ペインから選択できる10種類のチャートタイプをサポートしています。例えば、前述のチャートタイプを棒グラフからエリアに簡単に変更できます：

<Image img={change_from_bar_to_area} size="lg" border alt="棒グラフからエリアグラフへの変更"/>

チャートのタイトルは、データを提供するクエリの名前と一致します。クエリの名前を更新すると、チャートのタイトルも更新されます。

<Image img={update_query_name} size="lg" border alt="クエリ名の更新"/>

チャート設定ペインの「高度な」セクションで、より多くの高度なチャート特性も調整できます。最初に、以下の設定を調整します：

- サブタイトル
- 軸タイトル
- x軸のラベルの向き

これに応じて、チャートが更新されます：

<Image img={update_subtitle_etc} size="lg" border alt="サブタイトルなどの更新"/>

場合によっては、それぞれのフィールドの軸スケールを独立して調整することが必要になることがあります。これも、「高度な」セクションで軸範囲の最小値と最大値を指定することによって実現できます。例えば、上のチャートは良好に見えますが、 `trip_total` と `fare_total` フィールド間の相関関係を示すために、軸範囲を調整する必要があります：

<Image img={adjust_axis_scale} size="lg" border alt="軸スケールの調整"/>

## クエリの共有 {#sharing-queries}

SQLコンソールを使用すると、クエリをチームと共有できます。クエリが共有されると、すべてのチームメンバーがそのクエリを表示および編集できます。共有されたクエリは、チームとのコラボレーションに最適です。

クエリを共有するには、クエリツールバー内の「共有」ボタンをクリックします。

<Image img={sql_console_share} size="lg" border alt="クエリツールバー内の共有ボタン"/>

ダイアログが開き、すべてのチームメンバーとクエリを共有することができます。複数のチームがある場合、クエリを共有するチームを選択できます。

<Image img={sql_console_edit_access} size="lg" border alt="共有クエリのアクセスを編集するためのダイアログ"/>

<Image img={sql_console_add_team} size="lg" border alt="共有クエリにチームを追加するためのインターフェース"/>

<Image img={sql_console_edit_member} size="lg" border alt="共有クエリに対するメンバーのアクセスを編集するためのインターフェース"/>

その他のシナリオでは、各フィールドの軸スケールを独立して調整する必要がある場合もあります。これも、「高度な」セクションで、軸範囲の最小値と最大値を指定することによって実現できます。例えば、上のグラフは見栄えが良いですが、 `trip_total` と `fare_total` フィールド間の相関関係を示すために、軸範囲の調整が必要です：

<Image img={sql_console_access_queries} size="lg" border alt="クエリリストの共有されたセクション"/>
