---
sidebar_label: 'SQLコンソール'
sidebar_position: 1
title: 'SQLコンソール'
slug: /integrations/sql-clients/sql-console
description: 'SQLコンソールについて学ぶ'
doc_type: 'guide'
keywords: ['sql console', 'クエリインターフェース', 'Web UI', 'SQLエディター', 'クラウドコンソール']
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


# SQL コンソール {#sql-console}

SQL コンソールは、ClickHouse Cloud 上のデータベースを調査し、クエリを実行するための最速かつ最も簡単な方法です。SQL コンソールを使用すると、次のことができます。

- ClickHouse Cloud のサービスに接続する
- テーブルデータを表示、フィルター、並べ替えする
- クエリを実行し、数回のクリックで結果データを可視化する
- クエリをチームメンバーと共有し、より効率的に共同作業を行う

## テーブルの探索 {#exploring-tables}

### テーブル一覧とスキーマ情報の表示 {#viewing-table-list-and-schema-info}

ClickHouse インスタンスに含まれるテーブルの概要は、左サイドバーで確認できます。左サイドバー上部のデータベースセレクタを使用して、特定のデータベース内のテーブルを表示します。

<Image img={table_list_and_schema} size="lg" border alt="左サイドバーにデータベース内のテーブルが表示された、テーブル一覧とスキーマビュー"/>

一覧のテーブルは展開して、カラムと型を表示することもできます。

<Image img={view_columns} size="lg" border alt="展開されたテーブルと、そのカラム名およびデータ型が表示されているビュー"/>

### テーブルデータの探索 {#exploring-table-data}

一覧のテーブルをクリックすると、新しいタブで開きます。Table View では、データを簡単に表示・選択・コピーできます。Microsoft Excel や Google Sheets などのスプレッドシートアプリケーションにコピー＆ペーストする際も、構造と書式は保持されます。フッターのナビゲーションを使用して、テーブルデータのページ（30 行単位でページ分割）を切り替えられます。

<Image img={abc} size="lg" border alt="選択およびコピー可能なデータが表示されている Table View"/>

### セルデータの検査 {#inspecting-cell-data}

Cell Inspector ツールを使用すると、単一セル内に含まれる大量のデータを表示できます。開くには、セルを右クリックし、「Inspect Cell」を選択します。Cell Inspector の内容は、インスペクタ右上にあるコピーアイコンをクリックすることでコピーできます。

<Image img={inspecting_cell_content} size="lg" border alt="選択したセルの内容を表示している Cell Inspector ダイアログ"/>

## テーブルのフィルタリングとソート {#filtering-and-sorting-tables}

### テーブルをソートする {#sorting-a-table}

SQL Console でテーブルをソートするには、テーブルを開き、ツールバーの「Sort」ボタンを選択します。このボタンをクリックすると、ソートを設定できるメニューが開きます。ソート対象のカラムと、ソート順序（昇順または降順）を選択できます。「Apply」を選択するか Enter キーを押してテーブルをソートします。

<Image img={sort_descending_on_column} size="lg" border alt="あるカラムに対して降順ソートを設定しているソートダイアログ"/>

SQL Console では、テーブルに複数のソート条件を追加することもできます。再度「Sort」ボタンをクリックして、別のソート条件を追加します。注意: ソートはソートペイン内に表示されている順番（上から下）で適用されます。ソートを削除するには、該当するソートの横にある「x」ボタンをクリックします。

### テーブルをフィルタリングする {#filtering-a-table}

SQL Console でテーブルをフィルタリングするには、テーブルを開き、「Filter」ボタンを選択します。ソートと同様に、このボタンをクリックするとフィルタを設定できるメニューが開きます。フィルタ対象のカラムを選択し、必要な条件を指定できます。SQL Console は、カラムに含まれるデータ型に対応したフィルタオプションを自動的に表示します。

<Image img={filter_on_radio_column_equal_gsm} size="lg" border alt="radio カラムが GSM と等しい条件でフィルタを設定しているフィルタダイアログ"/>

フィルタの内容に満足したら、「Apply」を選択してデータをフィルタリングできます。以下に示すように、フィルタを追加することも可能です。

<Image img={add_more_filters} size="lg" border alt="2000 より大きい範囲の追加フィルタを設定する方法を示すダイアログ"/>

ソート機能と同様に、フィルタを削除するにはフィルタの横にある「x」ボタンをクリックします。

### フィルタリングとソートを同時に行う {#filtering-and-sorting-together}

SQL Console では、テーブルに対してフィルタリングとソートを同時に適用できます。これを行うには、上記の手順に従って必要なフィルタとソートをすべて追加し、「Apply」ボタンをクリックします。

<Image img={filtering_and_sorting_together} size="lg" border alt="フィルタリングとソートが同時に適用されているインターフェース"/>

### フィルタとソートからクエリを作成する {#creating-a-query-from-filters-and-sorts}

SQL Console は、ソートとフィルタの設定をワンクリックでクエリに変換できます。ツールバーから、任意のソートおよびフィルタパラメータを指定した状態で「Create Query」ボタンを選択します。「Create query」をクリックすると、新しいクエリタブが開き、現在のテーブルビューの内容に対応した SQL コマンドがあらかじめ入力されています。

<Image img={create_a_query_from_sorts-and-filters} size="lg" border alt="フィルタとソートから SQL を生成する Create Query ボタンを示すインターフェース"/>

:::note
「Create Query」機能を使用する際に、フィルタやソートは必須ではありません。
:::

SQL Console でのクエリの実行については、(link) のクエリに関するドキュメントを参照してください。

## クエリの作成と実行 {#creating-and-running-a-query}

### クエリの作成 {#creating-a-query}

SQL コンソールで新しいクエリを作成する方法は 2 つあります。

- タブバーの「+」ボタンをクリックする
- 左サイドバーのクエリ一覧から「New Query」ボタンをクリックする

<Image img={creating_a_query} size="lg" border alt="「+」ボタンまたは New Query ボタンを使って新しいクエリを作成する方法を示すインターフェース"/>

### クエリの実行 {#running-a-query}

クエリを実行するには、SQL Editor に SQL コマンドを入力し、「Run」ボタンをクリックするか、ショートカット `cmd / ctrl + enter` を使用します。複数のコマンドを順番に記述して実行する場合は、各コマンドの末尾にセミコロンを付けてください。

クエリ実行オプション  
デフォルトでは、「Run」ボタンをクリックすると SQL Editor 内に含まれるすべてのコマンドが実行されます。SQL コンソールでは、次の 2 つのクエリ実行オプションもサポートしています。

- 選択したコマンドを実行
- カーソル位置のコマンドを実行

選択したコマンドを実行するには、対象のコマンドまたはコマンドの並びを選択し、「Run」ボタンをクリックします（またはショートカット `cmd / ctrl + enter` を使用します）。選択範囲がある場合は、SQL Editor のコンテキストメニュー（エディタ内の任意の場所を右クリックして表示）から「Run selected」を選択することもできます。

<Image img={run_selected_query} size="lg" border alt="SQL クエリの一部を選択して実行する方法を示すインターフェース"/>

現在のカーソル位置のコマンドを実行する方法は 2 つあります。

- 「Run」の拡張オプションメニューから「At Cursor」を選択する（または対応するキーボードショートカット `cmd / ctrl + shift + enter` を使用する）

<Image img={run_at_cursor_2} size="lg" border alt="拡張 Run オプションメニュー内の Run at cursor オプション"/>

- SQL Editor のコンテキストメニューから「Run at cursor」を選択する

<Image img={run_at_cursor} size="lg" border alt="SQL Editor のコンテキストメニュー内の Run at cursor オプション"/>

:::note
カーソル位置にあるコマンドは、実行時に黄色く点滅します。
:::

### クエリのキャンセル {#canceling-a-query}

クエリが実行中の場合、Query Editor ツールバーの「Run」ボタンは「Cancel」ボタンに置き換えられます。このボタンをクリックするか、`Esc` を押すだけでクエリをキャンセルできます。注意: すでに返されている結果は、キャンセル後も残ります。

<Image img={cancel_a_query} size="lg" border alt="クエリ実行中に表示される Cancel ボタン"/>

### クエリの保存 {#saving-a-query}

まだ名前が付けられていない場合、クエリ名は「Untitled Query」になっています。クエリ名をクリックして変更してください。クエリ名を変更すると、そのクエリは保存されます。

<Image img={give_a_query_a_name} size="lg" border alt="Untitled Query からクエリ名を変更する方法を示すインターフェース"/>

保存ボタンや、キーボードショートカット `cmd / ctrl + s` を使用してクエリを保存することもできます。

<Image img={save_the_query} size="lg" border alt="Query Editor ツールバー内の Save ボタン"/>

## GenAI を使用したクエリ管理 {#using-genai-to-manage-queries}

この機能を使用すると、ユーザーはクエリを自然言語の質問として記述でき、それに基づいてクエリコンソールが、利用可能なテーブルのコンテキストに沿った SQL クエリを生成します。GenAI はクエリのデバッグにも役立ちます。

GenAI の詳細については、[Announcing GenAI powered query suggestions in ClickHouse Cloud blog post](https://clickhouse.com/blog/announcing-genai-powered-query-suggestions-clickhouse-cloud) を参照してください。

### テーブルのセットアップ {#table-setup}

UK Price Paid のサンプルデータセットをインポートし、それを使っていくつかの GenAI クエリを作成します。

1. ClickHouse Cloud サービスを開きます。
1. _+_ アイコンをクリックして新しいクエリを作成します。
1. 次のコードを貼り付けて実行します:

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

   このクエリは完了までに約 1 秒かかるはずです。完了すると、`uk_price_paid` という空のテーブルが作成されているはずです。

1. 新しいクエリを作成し、次のクエリを貼り付けます:

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

このクエリは `gov.uk` ウェブサイトからデータセットを取得します。このファイルは約 4GB あるため、クエリの完了までに数分かかります。ClickHouse がクエリを処理し終えると、`uk_price_paid` テーブル内にデータセット全体が取り込まれているはずです。

#### クエリの作成 {#query-creation}

自然言語でクエリを作成してみましょう。

1. **uk_price_paid** テーブルを選択し、**Create Query** をクリックします。
1. **Generate SQL** をクリックします。クエリが ChatGPT に送信されることへの同意を求められる場合があります。続行するには **I agree** を選択する必要があります。
1. ここで、プロンプトに自然言語のクエリを入力し、ChatGPT に SQL クエリへ変換させることができます。この例では次のように入力します:

   > uk_price_paid のすべてのトランザクションについて、年ごとの合計価格と件数を表示してください。

1. コンソールは目的のクエリを生成し、新しいタブに表示します。この例では、GenAI により次のクエリが作成されました:

   ```sql
   -- uk_price_paid のすべてのトランザクションについて、年ごとの合計価格と件数を表示してください。
   SELECT year(date), sum(price) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
   ```

1. クエリ内容を確認して問題なければ、**Run** をクリックして実行します。

### デバッグ {#debugging}

ここでは、GenAI のクエリデバッグ機能を試してみます。

1. _+_ アイコンをクリックして新しいクエリを作成し、次のコードを貼り付けます。

   ```sql
   -- uk_price_paid の全トランザクションについて、年ごとの合計金額とトランザクション総数を表示する。
   SELECT year(date), sum(pricee) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
   ```

1. **Run** をクリックします。`price` ではなく `pricee` から値を取得しようとしているため、クエリは失敗します。
1. **Fix Query** をクリックします。
1. GenAI がクエリの修正を試みます。この例では、`pricee` を `price` に変更しました。また、このケースでは `toYear` 関数を使用する方が適切であることも認識しました。
1. 提案された変更をクエリに適用するために **Apply** をクリックし、**Run** をクリックします。

GenAI は実験的な機能であることに注意してください。GenAI によって生成されたクエリをいかなるデータセットに対して実行する場合も、十分注意して実行してください。

## 高度なクエリ機能 {#advanced-querying-features}

### クエリ結果の検索 {#searching-query-results}

クエリを実行した後、結果ペイン内の検索ボックスを使って、返された結果セットを素早く検索できます。この機能は、追加の `WHERE` 句を適用した場合の結果をプレビューしたり、特定のデータが結果セットに含まれているかを確認したりする際に役立ちます。検索ボックスに値を入力すると、結果ペインが更新され、入力した値に一致するエントリを含むレコードが返されます。この例では、`ClickHouse` を含むコメントについて、`hackernews` テーブル内の `breakfast` が登場するすべての箇所を検索します（大文字小文字は区別しません）:

<Image img={search_hn} size="lg" border alt="Hacker News データの検索"/>

注記: 入力した値に一致するフィールドを含むレコードはすべて返されます。たとえば、上のスクリーンショットの 3 つ目のレコードは `by` フィールドでは「breakfast」に一致していませんが、`text` フィールドは一致しています。

<Image img={match_in_body} size="lg" border alt="本文内の一致"/>

### ページネーション設定の調整 {#adjusting-pagination-settings}

デフォルトでは、クエリ結果ペインはすべての結果レコードを 1 ページに表示します。結果セットが大きい場合は、閲覧しやすくするために結果をページ分割した方がよいことがあります。これは、結果ペインの右下にあるページネーションセレクタを使用して行います:

<Image img={pagination} size="lg" border alt="ページネーションオプション"/>

ページサイズを選択すると、すぐに結果セットにページネーションが適用され、結果ペインのフッター中央にナビゲーションオプションが表示されます。

<Image img={pagination_nav} size="lg" border alt="ページネーションナビゲーション"/>

### クエリ結果データのエクスポート {#exporting-query-result-data}

クエリ結果セットは、SQL コンソールから直接 CSV 形式に簡単にエクスポートできます。エクスポートするには、結果ペインのツールバー右側にある `•••` メニューを開き、「Download as CSV」を選択します。

<Image img={download_as_csv} size="lg" border alt="CSV としてダウンロード"/>

## クエリデータの可視化 {#visualizing-query-data}

一部のデータは、チャート形式にするとより理解しやすくなります。SQL コンソールからクエリ結果データを直接利用し、数回クリックするだけで素早く可視化を作成できます。例として、NYC タクシー乗車の週次統計を計算するクエリを使用します。

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

<Image img={tabular_query_results} size="lg" border alt="表形式のクエリ結果" />

可視化しないと、これらの結果を解釈するのは困難です。チャートにしてみましょう。


### チャートの作成 {#creating-charts}

可視化の作成を開始するには、クエリ結果ペインのツールバーから「Chart」オプションを選択します。チャート設定ペインが表示されます。

<Image img={switch_from_query_to_chart} size="lg" border alt="クエリからチャートへの切り替え" />

まずは、`week` ごとの `trip_total` を追跡するシンプルな棒グラフを作成します。これを行うには、`week` フィールドを x 軸に、`trip_total` フィールドを y 軸にドラッグします。

<Image img={trip_total_by_week} size="lg" border alt="週ごとの Trip total" />

ほとんどのチャートタイプでは、数値軸に複数のフィールドを設定できます。例として、`fare_total` フィールドを y 軸にドラッグしてみます。

<Image img={bar_chart} size="lg" border alt="棒グラフ" />

### チャートのカスタマイズ {#customizing-charts}

SQL コンソールでは 10 種類のチャートタイプをサポートしており、チャート設定ペイン内のチャートタイプセレクタから選択できます。たとえば、先ほどのチャートタイプを「Bar」から「Area」に簡単に変更できます。

<Image img={change_from_bar_to_area} size="lg" border alt="Bar チャートから Area への変更" />

チャートタイトルは、データを提供しているクエリ名と一致します。クエリ名を更新すると、チャートタイトルも同様に更新されます。

<Image img={update_query_name} size="lg" border alt="クエリ名の更新" />

より高度なチャートの特性も、チャート設定ペインの「Advanced」セクションで調整できます。ここでは、次の設定を調整します。

- サブタイトル
- 軸タイトル
- x 軸のラベルの向き

チャートはそれに応じて更新されます。

<Image img={update_subtitle_etc} size="lg" border alt="サブタイトルなどの更新" />

シナリオによっては、各フィールドごとに軸のスケールを個別に調整する必要がある場合があります。これは、チャート設定ペインの「Advanced」セクションで軸範囲の最小値および最大値を指定することで行えます。例として、上記のチャートは見た目には問題ありませんが、`trip_total` フィールドと `fare_total` フィールドの相関関係を示すには、軸範囲を少し調整する必要があります。

<Image img={adjust_axis_scale} size="lg" border alt="軸スケールの調整" />

## クエリの共有 {#sharing-queries}

SQL コンソールでは、クエリをチームと共有できます。クエリを共有すると、チームの全メンバーがそのクエリを閲覧および編集できるようになります。共有クエリは、チームで共同作業を行うための有効な手段です。

クエリを共有するには、クエリツールバーの「Share」ボタンをクリックします。

<Image img={sql_console_share} size="lg" border alt="クエリツールバー内の「Share」ボタン"/>

ダイアログが開き、チームの全メンバーとクエリを共有できるようになります。複数のチームがある場合は、どのチームとクエリを共有するかを選択できます。

<Image img={sql_console_edit_access} size="lg" border alt="共有クエリへのアクセス権を編集するダイアログ"/>

<Image img={sql_console_add_team} size="lg" border alt="共有クエリにチームを追加するインターフェース"/>

<Image img={sql_console_edit_member} size="lg" border alt="共有クエリへのメンバーアクセスを編集するインターフェース"/>

状況によっては、各フィールドごとに軸のスケールを個別に調整する必要がある場合があります。これは、チャート設定ペインの「Advanced」セクションで軸範囲の最小値と最大値を指定することで実行できます。たとえば、上記のチャートは見た目には問題ありませんが、`trip_total` フィールドと `fare_total` フィールド間の相関関係を示すためには、軸の範囲を少し調整する必要があります。

<Image img={sql_console_access_queries} size="lg" border alt="クエリ一覧内の「Shared with me」セクション"/>