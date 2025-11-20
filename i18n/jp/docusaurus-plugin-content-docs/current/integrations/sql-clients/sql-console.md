---
sidebar_label: 'SQL コンソール'
sidebar_position: 1
title: 'SQL コンソール'
slug: /integrations/sql-clients/sql-console
description: 'SQL コンソールについて'
doc_type: 'guide'
keywords: ['sql console', 'query interface', 'web ui', 'sql editor', 'cloud console']
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


# SQL コンソール

SQL コンソールは、ClickHouse Cloud 内のデータベースを探索し、クエリを実行するための、最速かつ最も簡単な方法です。SQL コンソールを使用すると、次のことができます。

- ClickHouse Cloud のサービスに接続する
- テーブルデータを表示、フィルタリング、およびソートする
- クエリを実行し、数クリックで結果データを可視化する
- クエリをチームメンバーと共有し、より効果的に共同作業する



## テーブルの探索 {#exploring-tables}

### テーブル一覧とスキーマ情報の表示 {#viewing-table-list-and-schema-info}

ClickHouseインスタンスに含まれるテーブルの概要は、左サイドバーで確認できます。左バーの上部にあるデータベースセレクターを使用して、特定のデータベース内のテーブルを表示できます。

<Image
  img={table_list_and_schema}
  size='lg'
  border
  alt='左サイドバーにデータベーステーブルを表示するテーブル一覧とスキーマビュー'
/>

一覧内のテーブルを展開して、カラムと型を表示することもできます。

<Image
  img={view_columns}
  size='lg'
  border
  alt='カラム名とデータ型を表示する展開されたテーブルのビュー'
/>

### テーブルデータの探索 {#exploring-table-data}

一覧内のテーブルをクリックすると、新しいタブで開きます。テーブルビューでは、データを簡単に表示、選択、コピーできます。Microsoft ExcelやGoogle Sheetsなどのスプレッドシートアプリケーションにコピー&ペーストする際、構造と書式が保持されます。フッターのナビゲーションを使用して、テーブルデータのページ間を移動できます(30行単位でページネーション)。

<Image
  img={abc}
  size='lg'
  border
  alt='選択とコピーが可能なデータを表示するテーブルビュー'
/>

### セルデータの検査 {#inspecting-cell-data}

セルインスペクターツールを使用して、単一のセル内に含まれる大量のデータを表示できます。開くには、セルを右クリックして「Inspect Cell」を選択します。セルインスペクターの内容は、インスペクター右上隅にあるコピーアイコンをクリックしてコピーできます。

<Image
  img={inspecting_cell_content}
  size='lg'
  border
  alt='選択されたセルの内容を表示するセルインスペクターダイアログ'
/>


## テーブルのフィルタリングとソート {#filtering-and-sorting-tables}

### テーブルのソート {#sorting-a-table}

SQLコンソールでテーブルをソートするには、テーブルを開き、ツールバーの「Sort」ボタンを選択します。このボタンをクリックすると、ソート設定を行うメニューが開きます。ソート対象の列を選択し、ソート順序(昇順または降順)を設定できます。「Apply」を選択するか、Enterキーを押してテーブルをソートします。

<Image
  img={sort_descending_on_column}
  size='lg'
  border
  alt='列の降順ソート設定を示すソートダイアログ'
/>

SQLコンソールでは、テーブルに複数のソートを追加することもできます。「Sort」ボタンを再度クリックして、別のソートを追加します。注意:ソートは、ソートペインに表示される順序(上から下)で適用されます。ソートを削除するには、ソートの横にある「x」ボタンをクリックします。

### テーブルのフィルタリング {#filtering-a-table}

SQLコンソールでテーブルをフィルタリングするには、テーブルを開き、「Filter」ボタンを選択します。ソートと同様に、このボタンをクリックすると、フィルタ設定を行うメニューが開きます。フィルタリング対象の列を選択し、必要な条件を指定できます。SQLコンソールは、列に含まれるデータ型に応じたフィルタオプションをインテリジェントに表示します。

<Image
  img={filter_on_radio_column_equal_gsm}
  size='lg'
  border
  alt='radio列をGSMに等しくフィルタリングする設定を示すフィルタダイアログ'
/>

フィルタの設定が完了したら、「Apply」を選択してデータをフィルタリングできます。以下に示すように、追加のフィルタを設定することもできます。

<Image
  img={add_more_filters}
  size='lg'
  border
  alt='rangeが2000より大きい追加フィルタを追加する方法を示すダイアログ'
/>

ソート機能と同様に、フィルタの横にある「x」ボタンをクリックして削除します。

### フィルタリングとソートの同時使用 {#filtering-and-sorting-together}

SQLコンソールでは、テーブルのフィルタリングとソートを同時に実行できます。これを行うには、上記の手順を使用して必要なフィルタとソートをすべて追加し、「Apply」ボタンをクリックします。

<Image
  img={filtering_and_sorting_together}
  size='lg'
  border
  alt='フィルタリングとソートが同時に適用されているインターフェース'
/>

### フィルタとソートからクエリを作成 {#creating-a-query-from-filters-and-sorts}

SQLコンソールは、ソートとフィルタをワンクリックでクエリに直接変換できます。任意のソートとフィルタのパラメータを設定した状態で、ツールバーから「Create Query」ボタンを選択するだけです。「Create query」をクリックすると、テーブルビューに含まれるデータに対応するSQLコマンドが事前入力された新しいクエリタブが開きます。

<Image
  img={create_a_query_from_sorts_and_filters}
  size='lg'
  border
  alt='フィルタとソートからSQLを生成するCreate Queryボタンを示すインターフェース'
/>

:::note
「Create Query」機能を使用する際、フィルタとソートは必須ではありません。
:::

SQLコンソールでのクエリの詳細については、(link)クエリドキュメントを参照してください。


## クエリの作成と実行 {#creating-and-running-a-query}

### クエリの作成 {#creating-a-query}

SQLコンソールで新しいクエリを作成する方法は2つあります。

- タブバーの「+」ボタンをクリックする
- 左サイドバーのクエリリストから「New Query」ボタンを選択する

<Image
  img={creating_a_query}
  size='lg'
  border
  alt='+ボタンまたはNew Queryボタンを使用して新しいクエリを作成する方法を示すインターフェース'
/>

### クエリの実行 {#running-a-query}

クエリを実行するには、SQLエディタにSQLコマンドを入力し、「Run」ボタンをクリックするか、ショートカット`cmd / ctrl + enter`を使用します。複数のコマンドを順次記述して実行する場合は、各コマンドの後にセミコロンを追加してください。

クエリ実行オプション
デフォルトでは、実行ボタンをクリックするとSQLエディタに含まれるすべてのコマンドが実行されます。SQLコンソールは他に2つのクエリ実行オプションをサポートしています:

- 選択したコマンドを実行
- カーソル位置のコマンドを実行

選択したコマンドを実行するには、目的のコマンドまたは一連のコマンドをハイライト表示し、「Run」ボタンをクリックします(または`cmd / ctrl + enter`ショートカットを使用します)。選択範囲がある場合は、SQLエディタのコンテキストメニュー(エディタ内の任意の場所を右クリックして開く)から「Run selected」を選択することもできます。

<Image
  img={run_selected_query}
  size='lg'
  border
  alt='SQLクエリの選択した部分を実行する方法を示すインターフェース'
/>

現在のカーソル位置にあるコマンドを実行するには、2つの方法があります:

- 拡張実行オプションメニューから「At Cursor」を選択する(または対応するキーボードショートカット`cmd / ctrl + shift + enter`を使用する)

<Image
  img={run_at_cursor_2}
  size='lg'
  border
  alt='拡張実行オプションメニューのカーソル位置で実行オプション'
/>

- SQLエディタのコンテキストメニューから「Run at cursor」を選択する

<Image
  img={run_at_cursor}
  size='lg'
  border
  alt='SQLエディタのコンテキストメニューのカーソル位置で実行オプション'
/>

:::note
カーソル位置にあるコマンドは、実行時に黄色く点滅します。
:::

### クエリのキャンセル {#canceling-a-query}

クエリの実行中は、クエリエディタツールバーの「Run」ボタンが「Cancel」ボタンに置き換わります。このボタンをクリックするか、`Esc`キーを押すだけでクエリをキャンセルできます。注意:すでに返された結果は、キャンセル後も保持されます。

<Image
  img={cancel_a_query}
  size='lg'
  border
  alt='クエリ実行中に表示されるCancelボタン'
/>

### クエリの保存 {#saving-a-query}

以前に名前を付けていない場合、クエリは「Untitled Query」という名前になります。クエリ名をクリックして変更してください。クエリの名前を変更すると、クエリが保存されます。

<Image
  img={give_a_query_a_name}
  size='lg'
  border
  alt='Untitled Queryからクエリの名前を変更する方法を示すインターフェース'
/>

保存ボタンまたはキーボードショートカット`cmd / ctrl + s`を使用してクエリを保存することもできます。

<Image
  img={save_the_query}
  size='lg'
  border
  alt='クエリエディタツールバーの保存ボタン'
/>


## GenAIを使用したクエリ管理 {#using-genai-to-manage-queries}

この機能により、ユーザーは自然言語の質問形式でクエリを記述でき、クエリコンソールが利用可能なテーブルのコンテキストに基づいてSQLクエリを自動生成します。GenAIはクエリのデバッグ支援も行います。

GenAIの詳細については、[ClickHouse CloudにおけるGenAI搭載クエリ提案機能の発表ブログ記事](https://clickhouse.com/blog/announcing-genai-powered-query-suggestions-clickhouse-cloud)をご覧ください。

### テーブルのセットアップ {#table-setup}

UK Price Paidサンプルデータセットをインポートし、それを使用してGenAIクエリを作成してみましょう。

1. ClickHouse Cloudサービスを開きます。
1. _+_ アイコンをクリックして新しいクエリを作成します。
1. 以下のコードを貼り付けて実行します:

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

   このクエリは完了まで約1秒かかります。完了すると、`uk_price_paid`という名前の空のテーブルが作成されます。

1. 新しいクエリを作成し、以下のクエリを貼り付けます:

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

このクエリは`gov.uk`ウェブサイトからデータセットを取得します。このファイルは約4GBあるため、クエリの完了には数分かかります。ClickHouseがクエリを処理すると、`uk_price_paid`テーブル内に完全なデータセットが格納されます。

#### クエリの作成 {#query-creation}

自然言語を使用してクエリを作成してみましょう。

1. **uk_price_paid**テーブルを選択し、**Create Query**をクリックします。
1. **Generate SQL**をクリックします。クエリがChatGPTに送信されることへの同意を求められる場合があります。続行するには**I agree**を選択する必要があります。
1. このプロンプトを使用して自然言語クエリを入力すると、ChatGPTがそれをSQLクエリに変換します。この例では次のように入力します:

   > Show me the total price and total number of all uk_price_paid transactions by year.

1. コンソールは目的のクエリを生成し、新しいタブに表示します。この例では、GenAIは以下のクエリを作成しました:

   ```sql
   -- Show me the total price and total number of all uk_price_paid transactions by year.
   SELECT year(date), sum(price) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
   ```

1. クエリが正しいことを確認したら、**Run**をクリックして実行します。

### デバッグ {#debugging}

次に、GenAIのクエリデバッグ機能をテストしてみましょう。

1. _+_ アイコンをクリックして新しいクエリを作成し、以下のコードを貼り付けます:


```sql
   -- uk_price_paid の全トランザクションについて、年別の合計価格と合計件数を表示する。
   SELECT year(date), sum(pricee) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
```

1. **Run** をクリックします。`price` ではなく `pricee` から値を取得しようとしているため、クエリは失敗します。
2. **Fix Query** をクリックします。
3. GenAI がクエリの修正を試みます。この例では、`pricee` を `price` に変更しました。また、このシナリオでは `toYear` を使用する方が適切だと判断しました。
4. **Apply** を選択して、提案された変更をクエリに反映したうえで、**Run** をクリックします。

GenAI は実験的な機能であることに留意してください。GenAI によって生成されたクエリを任意のデータセットに対して実行する際は、十分に注意して行ってください。


## 高度なクエリ機能 {#advanced-querying-features}

### クエリ結果の検索 {#searching-query-results}

クエリ実行後、結果ペインの検索入力欄を使用して、返された結果セットを素早く検索できます。この機能は、追加の `WHERE` 句の結果をプレビューしたり、特定のデータが結果セットに含まれていることを確認したりする際に役立ちます。検索入力欄に値を入力すると、結果ペインが更新され、入力値に一致するエントリを含むレコードが返されます。この例では、`ClickHouse` を含むコメントについて、`hackernews` テーブル内のすべての `breakfast` のインスタンスを検索します(大文字小文字を区別しない):

<Image img={search_hn} size='lg' border alt='Hacker Newsデータの検索' />

注意: 入力値に一致するすべてのフィールドが返されます。例えば、上記のスクリーンショットの3番目のレコードは、`by` フィールドでは 'breakfast' に一致しませんが、`text` フィールドでは一致しています:

<Image img={match_in_body} size='lg' border alt='本文内の一致' />

### ページネーション設定の調整 {#adjusting-pagination-settings}

デフォルトでは、クエリ結果ペインはすべての結果レコードを1ページに表示します。大きな結果セットの場合、閲覧しやすくするために結果をページ分割することが望ましい場合があります。これは、結果ペインの右下隅にあるページネーションセレクタを使用して実現できます:

<Image img={pagination} size='lg' border alt='ページネーションオプション' />

ページサイズを選択すると、結果セットに即座にページネーションが適用され、結果ペインのフッター中央にナビゲーションオプションが表示されます

<Image img={pagination_nav} size='lg' border alt='ページネーションナビゲーション' />

### クエリ結果データのエクスポート {#exporting-query-result-data}

クエリ結果セットは、SQLコンソールから直接CSV形式に簡単にエクスポートできます。エクスポートするには、結果ペインツールバーの右側にある `•••` メニューを開き、'Download as CSV' を選択します。

<Image img={download_as_csv} size='lg' border alt='CSVとしてダウンロード' />


## クエリデータの可視化 {#visualizing-query-data}

データによっては、グラフ形式で表示することで解釈しやすくなります。SQLコンソールから直接、わずか数クリックでクエリ結果データの可視化を素早く作成できます。例として、NYCタクシー乗車の週次統計を計算するクエリを使用します:

```sql
SELECT
   toStartOfWeek(pickup_datetime) AS week,
   sum(total_amount) AS fare_total,
   sum(trip_distance) AS distance_total,
   count(*) AS trip_total
FROM
   nyc_taxi
GROUP BY
   1
ORDER BY
   1 ASC
```

<Image
  img={tabular_query_results}
  size='lg'
  border
  alt='表形式のクエリ結果'
/>

可視化しない場合、これらの結果は解釈が困難です。グラフに変換してみましょう。

### グラフの作成 {#creating-charts}

可視化の構築を開始するには、クエリ結果ペインのツールバーから「Chart」オプションを選択します。グラフ設定ペインが表示されます:

<Image
  img={switch_from_query_to_chart}
  size='lg'
  border
  alt='クエリからグラフへの切り替え'
/>

まず、`week`ごとの`trip_total`を追跡するシンプルな棒グラフを作成します。これを実現するには、`week`フィールドをx軸に、`trip_total`フィールドをy軸にドラッグします:

<Image img={trip_total_by_week} size='lg' border alt='週ごとの乗車回数合計' />

ほとんどのグラフタイプは、数値軸上の複数フィールドをサポートしています。これを実演するために、fare_totalフィールドをy軸にドラッグします:

<Image img={bar_chart} size='lg' border alt='棒グラフ' />

### グラフのカスタマイズ {#customizing-charts}

SQLコンソールは、グラフ設定ペインのグラフタイプセレクターから選択できる10種類のグラフタイプをサポートしています。例えば、前のグラフタイプを棒グラフからエリアグラフに簡単に変更できます:

<Image
  img={change_from_bar_to_area}
  size='lg'
  border
  alt='棒グラフからエリアグラフへの変更'
/>

グラフのタイトルは、データを提供するクエリの名前と一致します。クエリの名前を更新すると、グラフのタイトルも更新されます:

<Image img={update_query_name} size='lg' border alt='クエリ名の更新' />

グラフ設定ペインの「Advanced」セクションでは、より高度なグラフ特性も調整できます。まず、以下の設定を調整します:

- サブタイトル
- 軸タイトル
- x軸のラベル方向

グラフはそれに応じて更新されます:

<Image img={update_subtitle_etc} size='lg' border alt='サブタイトルなどの更新' />

シナリオによっては、各フィールドの軸スケールを個別に調整する必要がある場合があります。これは、グラフ設定ペインの「Advanced」セクションで軸範囲の最小値と最大値を指定することで実現できます。例として、上記のグラフは良好に見えますが、`trip_total`と`fare_total`フィールド間の相関を示すためには、軸範囲にいくつかの調整が必要です:

<Image img={adjust_axis_scale} size='lg' border alt='軸スケールの調整' />


## クエリの共有 {#sharing-queries}

SQLコンソールでは、チームメンバーとクエリを共有できます。クエリを共有すると、チームの全メンバーがそのクエリを閲覧・編集できるようになります。共有クエリは、チームでの共同作業に最適な方法です。

クエリを共有するには、クエリツールバーの「Share」ボタンをクリックします。

<Image
  img={sql_console_share}
  size='lg'
  border
  alt='クエリツールバーのShareボタン'
/>

ダイアログが開き、チームの全メンバーとクエリを共有できます。複数のチームがある場合は、どのチームとクエリを共有するかを選択できます。

<Image
  img={sql_console_edit_access}
  size='lg'
  border
  alt='共有クエリのアクセス権を編集するダイアログ'
/>

<Image
  img={sql_console_add_team}
  size='lg'
  border
  alt='共有クエリにチームを追加するインターフェース'
/>

<Image
  img={sql_console_edit_member}
  size='lg'
  border
  alt='共有クエリのメンバーアクセス権を編集するインターフェース'
/>

場合によっては、各フィールドの軸スケールを個別に調整する必要があります。これは、チャート設定ペインの「Advanced」セクションで軸範囲の最小値と最大値を指定することで実現できます。例えば、上記のチャートは良好に見えますが、`trip_total`フィールドと`fare_total`フィールドの相関関係を示すには、軸範囲の調整が必要です。

<Image
  img={sql_console_access_queries}
  size='lg'
  border
  alt='クエリリストの「自分と共有」セクション'
/>
