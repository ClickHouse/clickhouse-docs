---
sidebar_label: 'SQL コンソール'
sidebar_position: 1
title: 'SQL コンソール'
slug: /integrations/sql-clients/sql-console
description: 'SQL コンソールについて学ぶ'
doc_type: 'guide'
keywords: ['SQL コンソール', 'クエリ インターフェース', 'Web UI', 'SQL エディター', 'Cloud コンソール']
integration:
   - support_level: 'community'
   - category: 'sql_client'
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

SQL コンソールは、ClickHouse Cloud 上のデータベースを探索し、クエリを実行するための最速かつ最も簡単な方法です。SQL コンソールを使用すると、次のことができます：

- ClickHouse Cloud サービスに接続する
- テーブルデータを表示、フィルタリング、およびソートする
- 数回のクリックでクエリを実行し、結果データを可視化する
- クエリをチームメンバーと共有して、より効果的に共同作業を行う

## テーブルを確認する {#exploring-tables}

### テーブル一覧とスキーマ情報の表示 {#viewing-table-list-and-schema-info}

ClickHouse インスタンスに含まれるテーブルの概要は、左側のサイドバー領域で確認できます。左側のサイドバー上部にあるデータベースセレクターを使用して、特定のデータベース内のテーブルを表示します。

<Image img={table_list_and_schema} size="lg" border alt="左側サイドバーにデータベーステーブルが表示されたテーブル一覧とスキーマビュー"/>

リスト内のテーブルは展開して、カラムと型を表示することもできます。

<Image img={view_columns} size="lg" border alt="テーブルを展開してカラム名とデータ型を表示しているビュー"/>

### テーブルデータの探索 {#exploring-table-data}

リスト内のテーブルをクリックすると、新しいタブで開きます。「Table View」では、データを簡単に表示・選択・コピーできます。Microsoft Excel や Google Sheets などのスプレッドシートアプリケーションにコピー＆ペーストする際も、構造と書式は保持されます。フッターのナビゲーションを使用して、テーブルデータのページ（30 行単位でページ分割）を切り替えることができます。

<Image img={abc} size="lg" border alt="選択およびコピー可能なデータを表示している Table View"/>

### セルデータの検査 {#inspecting-cell-data}

Cell Inspector ツールを使用すると、1 つのセルに含まれる大量のデータを確認できます。開くには、セルを右クリックして「Inspect Cell」を選択します。セルインスペクタ内の内容は、右上隅にあるコピーアイコンをクリックするとコピーできます。

<Image img={inspecting_cell_content} size="lg" border alt="選択したセルの内容を表示する Cell Inspector ダイアログ"/>

## テーブルのフィルタリングと並べ替え {#filtering-and-sorting-tables}

### テーブルのソート {#sorting-a-table}

SQL コンソールでテーブルをソートするには、テーブルを開き、ツールバーの「Sort」ボタンをクリックします。このボタンをクリックすると、ソートを設定できるメニューが開きます。ソートに使用するカラムを選択し、ソートの順序（昇順または降順）を設定できます。「Apply」を選択するか Enter キーを押すと、テーブルがソートされます。

<Image img={sort_descending_on_column} size="lg" border alt="カラムを降順にソートする設定を示すソートダイアログ"/>

SQL コンソールでは、テーブルに対して複数のソート条件を追加することもできます。「Sort」ボタンをもう一度クリックすると、別のソート条件を追加できます。注意: ソートはソートペインに表示されている順序（上から下）で適用されます。ソートを削除するには、対象のソートの横にある「x」ボタンをクリックするだけです。

### テーブルのフィルタリング {#filtering-a-table}

SQL コンソールでテーブルをフィルタリングするには、テーブルを開き、`Filter` ボタンを選択します。ソートと同様に、このボタンをクリックすると、フィルタを設定するためのメニューが開きます。フィルタリングに使用するカラムを選択し、必要な条件を指定できます。SQL コンソールは、カラムに含まれるデータ型に応じたフィルタオプションを自動的に表示します。

<Image img={filter_on_radio_column_equal_gsm} size="lg" border alt="radio カラムが GSM と等しい条件でフィルタする設定を示すフィルタダイアログ"/>

フィルタの設定が完了したら、`Apply` を選択してデータをフィルタリングします。以下のように、フィルタを追加することもできます。

<Image img={add_more_filters} size="lg" border alt="2000 より大きい範囲の追加フィルタを設定する方法を示すダイアログ"/>

ソート機能と同様に、フィルタの横にある `x` ボタンをクリックすると、そのフィルタを削除できます。

### フィルタリングとソートを同時に行う {#filtering-and-sorting-together}

SQL コンソールでは、テーブルに対してフィルタリングとソートを同時に実行できます。これを行うには、上記の手順に従って必要なフィルターとソートをすべて追加し、「Apply」ボタンをクリックします。

<Image img={filtering_and_sorting_together} size="lg" border alt="フィルタリングとソートが同時に適用されたインターフェースを示す画面"/>

### フィルターとソートからクエリを作成する {#creating-a-query-from-filters-and-sorts}

SQL コンソールでは、ソートやフィルターをワンクリックでクエリに変換できます。ツールバーで任意のソートおよびフィルター条件を設定し、「Create Query」ボタンをクリックします。「Create query」をクリックすると、新しいクエリタブが開き、テーブルビューに表示されているデータに対応する SQL コマンドがあらかじめ入力された状態で表示されます。

<Image img={create_a_query_from_sorts_and_filters} size="lg" border alt="フィルターとソートから SQL を生成する Create Query ボタンを示すインターフェース"/>

:::note
「Create Query」機能を使用する際、フィルターやソートの設定は必須ではありません。
:::

SQL コンソールでのクエリについて詳しくは、(link) のクエリに関するドキュメントを参照してください。

## クエリの作成と実行 {#creating-and-running-a-query}

### クエリの作成 {#creating-a-query}

SQL コンソールで新しいクエリを作成する方法は 2 つあります。

- タブバーの「+」ボタンをクリックします
- 左サイドバーのクエリ一覧で「New Query」ボタンを選択します

<Image img={creating_a_query} size="lg" border alt="+ ボタンまたは New Query ボタンを使って新しいクエリを作成する方法を示すインターフェイス"/>

### クエリの実行 {#running-a-query}

クエリを実行するには、SQL Editor に SQL コマンドを入力し、「Run」ボタンをクリックするか、ショートカット `cmd / ctrl + enter` を使用します。複数のコマンドを順に実行する場合は、それぞれのコマンドの末尾にセミコロンを付けてください。

クエリ実行オプション  
デフォルトでは、「Run」ボタンをクリックすると、SQL Editor 内に含まれるすべてのコマンドが実行されます。SQL コンソールでは、さらに 2 つのクエリ実行オプションを利用できます。

- 選択したコマンドの実行
- カーソル位置のコマンドの実行

選択したコマンドを実行するには、実行したいコマンドまたはコマンドの並びを選択し、「Run」ボタンをクリックするか（またはショートカット `cmd / ctrl + enter` を使用）、選択範囲がある状態で SQL Editor のコンテキストメニュー（エディタ内の任意の場所を右クリックして開く）から「Run selected」を選択します。

<Image img={run_selected_query} size="lg" border alt="選択した部分のみを SQL クエリとして実行する方法を示すインターフェース"/>

現在のカーソル位置のコマンドを実行するには、次の 2 通りの方法があります。

- 拡張 Run オプションメニューから「At Cursor」を選択する（または対応するキーボードショートカット `cmd / ctrl + shift + enter` を使用する）

<Image img={run_at_cursor_2} size="lg" border alt="拡張 Run オプションメニュー内の「Run at cursor」オプション"/>

- SQL Editor のコンテキストメニューから「Run at cursor」を選択する

<Image img={run_at_cursor} size="lg" border alt="SQL Editor のコンテキストメニュー内の「Run at cursor」オプション"/>

:::note
カーソル位置にあるコマンドは、実行時に黄色く点滅します。
:::

### クエリのキャンセル {#canceling-a-query}

クエリの実行中は、Query Editor ツールバーの「Run」ボタンが「Cancel」ボタンに切り替わります。このボタンをクリックするか、`Esc` キーを押すことでクエリをキャンセルできます。注意：すでに返されている結果は、キャンセル後もそのまま残ります。

<Image img={cancel_a_query} size="lg" border alt="クエリ実行中に表示される Cancel ボタン"/>

### クエリを保存する {#saving-a-query}

まだ名前を付けていない場合、クエリ名は「Untitled Query」になっています。クエリ名をクリックして変更します。クエリの名前を変更すると、そのクエリが保存されます。

<Image img={give_a_query_a_name} size="lg" border alt="Untitled Query からクエリ名を変更する方法を示すインターフェイス"/>

また、保存ボタンや `cmd / ctrl + s` のキーボードショートカットでもクエリを保存できます。

<Image img={save_the_query} size="lg" border alt="クエリエディタのツールバーにある保存ボタン"/>

## GenAI を使用してクエリを管理する {#using-genai-to-manage-queries}

この機能を使用すると、自然言語で質問を入力することで、現在利用可能なテーブルのコンテキストに基づいて、クエリコンソールに SQL クエリを自動生成させることができます。GenAI はクエリのデバッグにも役立ちます。

GenAI の詳細については、[ClickHouse Cloud における GenAI ベースのクエリサジェスト機能のご紹介 (Announcing GenAI powered query suggestions in ClickHouse Cloud)](https://clickhouse.com/blog/announcing-genai-powered-query-suggestions-clickhouse-cloud) を参照してください。

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

   このクエリは完了までに約 1 秒かかるはずです。完了すると、`uk_price_paid` という空のテーブルが作成されています。

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

このクエリは `gov.uk` の Web サイトからデータセットを取得します。このファイルは約 4GB あるため、このクエリの完了までに数分かかります。ClickHouse がクエリの処理を完了すると、`uk_price_paid` テーブル内にデータセット全体が格納されます。

#### クエリの作成 {#query-creation}

自然言語を使ってクエリを作成してみましょう。

1. **uk_price_paid** テーブルを選択し、**Create Query** をクリックします。
1. **Generate SQL** をクリックします。クエリが Chat-GPT に送信されることへの同意を求められる場合があります。続行するには **I agree** を選択する必要があります。
1. プロンプト欄に自然言語でクエリ内容を入力すると、ChatGPT がそれを SQL クエリに変換してくれます。この例では、次のように入力します。

   > すべての uk_price_paid トランザクションの合計金額とトランザクション数を年ごとに表示して。

1. コンソールは目的のクエリを生成し、新しいタブに表示します。今回の例では、GenAI により次のクエリが作成されました。

   ```sql
   -- Show me the total price and total number of all uk_price_paid transactions by year.
   SELECT year(date), sum(price) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
   ```

1. クエリが正しいことを確認したら、**Run** をクリックして実行します。

### デバッグ {#debugging}

ここでは、GenAI のクエリデバッグ機能を試してみます。

1. _+_ アイコンをクリックして新しいクエリを作成し、次のコードを貼り付けます:

   ```sql
   -- Show me the total price and total number of all uk_price_paid transactions by year.
   SELECT year(date), sum(pricee) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
   ```

1. **Run** をクリックします。`price` ではなく `pricee` から値を取得しようとしているため、このクエリは失敗します。
1. **Fix Query** をクリックします。
1. GenAI がクエリの修正を試みます。この例では、`pricee` を `price` に変更します。また、このシナリオでは `toYear` の方が適切な関数であると判断します。
1. 提案された変更をクエリに反映するには **Apply** を選択し、**Run** をクリックします。

GenAI は実験的な機能です。GenAI が生成したクエリを任意のデータセットに対して実行する際は、十分注意して利用してください。

## 高度なクエリ機能 {#advanced-querying-features}

### クエリ結果の検索 {#searching-query-results}

クエリの実行後は、結果ペイン内の検索欄を使って、返された結果セットを素早く検索できます。この機能は、追加の `WHERE` 句の結果をプレビューしたり、特定のデータが結果セットに含まれているかを確認したりする際に役立ちます。検索欄に値を入力すると、結果ペインが更新され、その値にマッチするエントリを含むレコードが返されます。次の例では、`ClickHouse` を含むコメントに対して、`hackernews` テーブル内の `breakfast` のすべての出現箇所を検索します（大文字・小文字は区別されません）:

<Image img={search_hn} size="lg" border alt="Hacker News データの検索"/>

注意: 入力した値にマッチする任意のフィールドを含むレコードが返されます。たとえば、上のスクリーンショットの 3 番目のレコードは `by` フィールドでは `breakfast` にマッチしませんが、`text` フィールドはマッチします:

<Image img={match_in_body} size="lg" border alt="本文内のマッチ"/>

### ページネーション設定の調整 {#adjusting-pagination-settings}

デフォルトでは、クエリ結果ペインはすべての結果レコードを単一ページに表示します。結果セットが大きい場合は、見やすくするためにページネーションを有効にした方がよい場合があります。これは、結果ペイン右下にあるページネーションセレクターで設定できます。

<Image img={pagination} size="lg" border alt="ページネーションのオプション"/>

ページサイズを選択すると、結果セットにすぐにページネーションが適用され、結果ペインのフッター中央にナビゲーションオプションが表示されます。

<Image img={pagination_nav} size="lg" border alt="ページネーションのナビゲーション"/>

### クエリ結果データのエクスポート {#exporting-query-result-data}

クエリ結果セットは、SQL コンソールから直接 CSV 形式で簡単にエクスポートできます。エクスポートするには、結果ペインのツールバー右側にある `•••` メニューを開き、"Download as CSV" を選択します。

<Image img={download_as_csv} size="lg" border alt="Download as CSV"/>

## クエリデータの可視化 {#visualizing-query-data}

一部のデータは、チャート形式にするとより直感的に理解できます。SQL Console からクエリ結果データを元に、数回のクリックで素早く可視化を作成できます。例として、NYC タクシー乗車記録の週次統計を計算するクエリを使用します。

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

このままでは結果を理解しづらいので、グラフにしてみましょう。


### チャートの作成 {#creating-charts}

可視化の作成を開始するには、クエリ結果ペインのツールバーから「Chart」オプションを選択します。チャート設定ペインが表示されます。

<Image img={switch_from_query_to_chart} size="lg" border alt="クエリからチャートへの切り替え"/>

まず、`trip_total` を `week` ごとに追跡するシンプルな棒グラフを作成します。そのために、`week` フィールドを x 軸に、`trip_total` フィールドを y 軸にドラッグします。

<Image img={trip_total_by_week} size="lg" border alt="週ごとの trip_total"/>

多くのチャートタイプでは、数値軸に複数のフィールドを設定できます。例として、`fare_total` フィールドを y 軸にドラッグします。

<Image img={bar_chart} size="lg" border alt="棒グラフ"/>

### チャートのカスタマイズ {#customizing-charts}

SQL コンソールは 10 種類のチャートタイプをサポートしており、チャート設定ペイン内のチャートタイプセレクタから選択できます。例えば、先ほどのチャートタイプを Bar から Area に簡単に変更できます。

<Image img={change_from_bar_to_area} size="lg" border alt="Bar チャートから Area チャートへの変更"/>

チャートのタイトルは、データを提供するクエリの名前と一致します。クエリ名を変更すると、チャートタイトルも更新されます。

<Image img={update_query_name} size="lg" border alt="クエリ名を更新"/>

より高度なチャートの特性は、チャート設定ペインの「Advanced」セクションで調整できます。ここでは、次の設定を調整します。

- サブタイトル
- 軸タイトル
- x 軸のラベルの向き

チャートはそれに応じて更新されます。

<Image img={update_subtitle_etc} size="lg" border alt="サブタイトルなどを更新"/>

シナリオによっては、各フィールドごとに軸スケールを個別に調整する必要がある場合があります。これは、チャート設定ペインの「Advanced」セクションで、軸範囲の最小値と最大値を指定することで行えます。例えば、上記のチャートは見た目は良好ですが、`trip_total` フィールドと `fare_total` フィールドの相関関係を示すには、軸範囲を少し調整する必要があります。

<Image img={adjust_axis_scale} size="lg" border alt="軸スケールを調整"/>

## クエリの共有 {#sharing-queries}

SQL コンソールでは、クエリをチームと共有できます。クエリを共有すると、チームのすべてのメンバーがそのクエリを表示および編集できるようになります。共有クエリは、チームで共同作業するうえで有効な手段です。

クエリを共有するには、クエリツールバーの「Share」ボタンをクリックします。

<Image img={sql_console_share} size="lg" border alt="クエリツールバーにある「Share」ボタン"/>

ダイアログが開き、チームのすべてのメンバーとクエリを共有できるようになります。複数のチームがある場合は、どのチームとクエリを共有するかを選択できます。

<Image img={sql_console_edit_access} size="lg" border alt="共有クエリへのアクセス権を編集するためのダイアログ"/>

<Image img={sql_console_add_team} size="lg" border alt="共有クエリにチームを追加するためのインターフェース"/>

<Image img={sql_console_edit_member} size="lg" border alt="共有クエリへのメンバーアクセスを編集するためのインターフェース"/>

一部のシナリオでは、フィールドごとに軸スケールを個別に調整する必要がある場合があります。これは、チャート設定ペインの「Advanced」セクションで、軸範囲の最小値と最大値を指定することで行えます。たとえば上のチャートは見た目には問題ありませんが、`trip_total` フィールドと `fare_total` フィールドの相関を示すには、軸の範囲を少し調整する必要があります。

<Image img={sql_console_access_queries} size="lg" border alt="クエリ一覧の「Shared with me」セクション"/>