---
sidebar_label: 'SQL コンソール'
sidebar_position: 1
title: 'SQL コンソール'
slug: /integrations/sql-clients/sql-console
description: 'SQL コンソールについて学ぶ'
doc_type: 'guide'
keywords: ['SQL コンソール', 'クエリインターフェース', 'Web UI', 'SQL エディタ', 'Cloud コンソール']
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


# SQL コンソール \{#sql-console\}

SQL コンソールは、ClickHouse Cloud 上のデータベースを探索しクエリを実行するための、最速かつ最も手軽な方法です。SQL コンソールを使用すると、次のことができます：

- ClickHouse Cloud サービスに接続する
- テーブル データを表示、フィルタリング、ソートする
- クエリを実行し、数回のクリックで結果データを可視化する
- クエリをチームメンバーと共有し、より効果的に共同作業を行う

## テーブルの確認 \{#exploring-tables\}

### テーブル一覧とスキーマ情報の表示 \{#viewing-table-list-and-schema-info\}

ClickHouse インスタンスに含まれるテーブルの概要は、左サイドバーで確認できます。左サイドバー上部のデータベースセレクタを使用して、特定のデータベース内のテーブルを表示します。

<Image img={table_list_and_schema} size="lg" border alt="左サイドバーにデータベーステーブルが表示されたテーブル一覧とスキーマビュー"/>

一覧内のテーブルは展開して、カラムおよびデータ型を表示することもできます。

<Image img={view_columns} size="lg" border alt="展開されたテーブルビューにカラム名とデータ型が表示されている様子"/>

### テーブルデータの確認 \{#exploring-table-data\}

リスト内のテーブルをクリックすると、新しいタブで開きます。Table View では、データを簡単に表示・選択・コピーできます。Microsoft Excel や Google Sheets などのスプレッドシートアプリケーションへコピー＆ペーストしても、構造と書式が保持されます。フッターのナビゲーションを使用して、テーブルデータのページ（30 行単位でページ分割）を切り替えることができます。

<Image img={abc} size="lg" border alt="データを選択してコピーできるテーブルビュー"/>

### セルデータの検査 \{#inspecting-cell-data\}

Cell Inspector ツールを使用すると、1 つのセルに含まれる大量のデータを表示できます。起動するには、セルを右クリックして「Inspect Cell」を選択します。セルインスペクタ内の内容は、右上にあるコピーアイコンをクリックすることでコピーできます。

<Image img={inspecting_cell_content} size="lg" border alt="選択されたセルの内容を表示している Cell Inspector ダイアログ"/>

## テーブルのフィルタリングと並べ替え \{#filtering-and-sorting-tables\}

### テーブルをソートする \{#sorting-a-table\}

SQL コンソールでテーブルをソートするには、テーブルを開き、ツールバーの「Sort」ボタンを選択します。このボタンをクリックすると、ソートの設定を行えるメニューが開きます。ソートに使用するカラムを選択し、ソート順（昇順または降順）を設定できます。「Apply」を選択するか Enter キーを押してテーブルをソートします。

<Image img={sort_descending_on_column} size="lg" border alt="カラムに対して降順ソートを設定するための設定を示す Sort ダイアログ"/>

SQL コンソールでは、テーブルに複数のソート条件を追加することもできます。別のソート条件を追加するには、もう一度「Sort」ボタンをクリックします。注意：ソートはソートペインに表示される順番（上から下）で適用されます。ソート条件を削除するには、そのソートの横にある「x」ボタンをクリックします。

### テーブルのフィルタリング \{#filtering-a-table\}

SQL コンソールでテーブルをフィルタリングするには、テーブルを開き、「Filter」ボタンを選択します。ソートと同様に、このボタンを選択するとフィルタを設定できるメニューが開きます。フィルタに使用するカラムを選択し、必要な条件を設定できます。SQL コンソールは、カラム内に含まれるデータ型に対応したフィルタのオプションを自動的に表示します。

<Image img={filter_on_radio_column_equal_gsm} size="lg" border alt="ラジオカラムが GSM と等しい条件でフィルタを設定しているフィルタダイアログ"/>

フィルタの設定が完了したら、「Apply」を選択してデータをフィルタリングします。以下のように、追加のフィルタを加えることもできます。

<Image img={add_more_filters} size="lg" border alt="2000 より大きい範囲で追加のフィルタを設定する方法を示すダイアログ"/>

ソート機能と同様に、フィルタを削除するにはフィルタの横にある「x」ボタンをクリックします。

### フィルタとソートを同時に行う \{#filtering-and-sorting-together\}

SQL コンソールでは、テーブルに対してフィルタとソートを同時に適用できます。そのためには、上記の手順に従って必要なフィルタとソートをすべて追加し、`Apply` ボタンをクリックします。

<Image img={filtering_and_sorting_together} size="lg" border alt="フィルタとソートが同時に適用されたインターフェイスを示す画面"/>

### フィルターとソートからクエリを作成する \{#creating-a-query-from-filters-and-sorts\}

SQL コンソールでは、ソートとフィルターをワンクリックで直接クエリに変換できます。ツールバーで任意のソートおよびフィルターパラメーターを指定し、「Create Query」ボタンを選択します。「Create Query」をクリックすると、新しいクエリタブが開き、テーブルビュー内のデータに対応する SQL コマンドがあらかじめ入力されています。

<Image img={create_a_query_from_sorts_and_filters} size="lg" border alt="フィルターとソートから SQL を生成する Create Query ボタンを示すインターフェース"/>

:::note
「Create Query」機能を使用する際に、フィルターやソートは必須ではありません。
:::

SQL コンソールでのクエリ実行についての詳細は、(link) のクエリドキュメントを参照してください。

## クエリの作成と実行 \{#creating-and-running-a-query\}

### クエリを作成する \{#creating-a-query\}

SQL コンソールで新しいクエリを作成する方法は 2 つあります。

- タブバーの「+」ボタンをクリックします
- 左サイドバーのクエリリストで「New Query」ボタンをクリックします

<Image img={creating_a_query} size="lg" border alt="「+」ボタンまたは New Query ボタンを使って新しいクエリを作成する方法を示すインターフェース"/>

### クエリの実行 \{#running-a-query\}

クエリを実行するには、SQL Editor に SQL コマンドを入力して「Run」ボタンをクリックするか、ショートカット `cmd / ctrl + enter` を使用します。複数のコマンドを順に記述して実行する場合は、各コマンドの末尾にセミコロンを付けてください。

クエリの実行オプション
デフォルトでは、「Run」ボタンをクリックすると SQL Editor 内に含まれるすべてのコマンドが実行されます。SQL コンソールでは、他にも次の 2 つのクエリ実行オプションをサポートしています。

- 選択したコマンドを実行
- カーソル位置のコマンドを実行

選択したコマンドを実行するには、目的のコマンドまたは一連のコマンドを選択し、「Run」ボタンをクリックするか（またはショートカット `cmd / ctrl + enter` を使用します）。選択範囲がある状態で、SQL Editor のコンテキストメニュー（エディタ内の任意の場所を右クリック）から「Run selected」を選択することもできます。

<Image img={run_selected_query} size="lg" border alt="SQL クエリの選択部分を実行するインターフェイス"/>

現在のカーソル位置のコマンドを実行するには、次の 2 通りの方法があります。

- 拡張 Run オプションメニューから「At Cursor」を選択する（または対応するキーボードショートカット `cmd / ctrl + shift + enter` を使用する）

<Image img={run_at_cursor_2} size="lg" border alt="拡張 Run オプションメニュー内の「Run at cursor」オプション"/>

- SQL Editor のコンテキストメニューから「Run at cursor」を選択する

<Image img={run_at_cursor} size="lg" border alt="SQL Editor のコンテキストメニュー内の「Run at cursor」オプション"/>

:::note
カーソル位置にあるコマンドは、実行時に黄色く点滅します。
:::

### クエリのキャンセル \{#canceling-a-query\}

クエリの実行中は、Query Editor ツールバーの「Run」ボタンが「Cancel」ボタンに置き換えられます。クエリをキャンセルするには、このボタンをクリックするか、`Esc` を押します。注: すでに返されている結果は、キャンセル後もそのまま残ります。

<Image img={cancel_a_query} size="lg" border alt="クエリ実行中に表示される Cancel ボタン"/>

### クエリを保存する \{#saving-a-query\}

まだ名前を付けていない場合、クエリ名は「Untitled Query」として表示されます。クエリ名をクリックすると変更できます。クエリの名前を変更すると、そのクエリは保存されます。

<Image img={give_a_query_a_name} size="lg" border alt="Untitled Query からクエリ名を変更する方法を示すインターフェイス"/>

保存ボタン、または `cmd / ctrl + s` キーボードショートカットを使用してクエリを保存することもできます。

<Image img={save_the_query} size="lg" border alt="クエリエディターのツールバー内にある保存ボタン"/>

## GenAI を使用してクエリを管理する \{#using-genai-to-manage-queries\}

この機能を使用すると、クエリを自然言語の質問として入力し、利用可能なテーブルのコンテキストに基づいてクエリコンソールが SQL クエリを生成できるようになります。GenAI はクエリのデバッグにも役立ちます。

GenAI の詳細については、[Announcing GenAI powered query suggestions in ClickHouse Cloud blog post](https://clickhouse.com/blog/announcing-genai-powered-query-suggestions-clickhouse-cloud) を参照してください。

### Table setup \{#table-setup\}

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

   このクエリの実行には約 1 秒かかります。完了すると、`uk_price_paid` という空のテーブルが作成されているはずです。

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

このクエリは `gov.uk` のウェブサイトからデータセットを取得します。このファイルは約 4GB あるため、クエリの実行には数分かかります。ClickHouse がクエリを処理し終わると、`uk_price_paid` テーブル内にデータセット全体が格納されます。

#### クエリの作成 \{#query-creation\}

自然言語を使ってクエリを作成してみましょう。

1. **uk_price_paid** テーブルを選択し、**Create Query** をクリックします。
1. **Generate SQL** をクリックします。クエリが ChatGPT に送信されることへの同意を求められる場合があります。続行するには **I agree** を選択する必要があります。
1. プロンプト欄に自然言語でクエリ内容を入力すると、ChatGPT がそれを SQL クエリに変換してくれます。この例では次のように入力します：

   > uk_price_paid のすべてのトランザクションについて、年ごとの合計価格と件数を表示してください。

1. コンソールは目的のクエリを生成し、新しいタブに表示します。この例では、GenAI によって次のクエリが作成されました：

   ```sql
   -- uk_price_paid のすべてのトランザクションについて、年ごとの合計価格と件数を表示してください。
   SELECT year(date), sum(price) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
   ```

1. クエリの内容を確認して正しければ、**Run** をクリックして実行します。

### デバッグ \{#debugging\}

ここでは、GenAI のクエリデバッグ機能を試してみます。

1. _+_ アイコンをクリックして新しいクエリを作成し、次のコードを貼り付けます:

   ```sql
   -- 年ごとの uk_price_paid トランザクションの合計価格と合計件数を表示して。
   SELECT year(date), sum(pricee) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
   ```

1. **Run** をクリックします。`price` ではなく `pricee` から値を取得しようとしているため、クエリは失敗します。
1. **Fix Query** をクリックします。
1. GenAI がクエリの修正を試みます。この例では、`pricee` を `price` に変更しています。また、このシナリオでは `toYear` を使う方がより適切であることも認識しました。
1. **Apply** を選択して提案された変更をクエリに反映し、**Run** をクリックします。

GenAI は実験的な機能であることに留意してください。GenAI が生成したクエリを任意のデータセットに対して実行する際は、慎重に扱ってください。

## 高度なクエリ機能 \{#advanced-querying-features\}

### クエリ結果の検索 \{#searching-query-results\}

クエリの実行後、結果ペイン内の検索欄を使用して、返された結果セットをすばやく検索できます。この機能は、追加の `WHERE` 句を適用した場合の結果をプレビューしたり、特定のデータが結果セットに含まれているか確認したりする際に役立ちます。検索欄に値を入力すると、結果ペインが更新され、入力した値に一致するエントリを含むレコードのみが表示されます。次の例では、`ClickHouse` を含むコメントに対して、`hackernews` テーブル内で `breakfast` のすべての出現箇所を検索します（大文字小文字は区別されません）:

<Image img={search_hn} size="lg" border alt="Search Hacker News Data"/>

注意: 入力した値に一致する任意のフィールドが返されます。たとえば、上のスクリーンショットの 3 番目のレコードは `by` フィールドには `breakfast` が含まれていませんが、`text` フィールドには含まれています:

<Image img={match_in_body} size="lg" border alt="Match in body"/>

### ページネーション設定の調整 \{#adjusting-pagination-settings\}

デフォルトでは、クエリ結果ペインはすべての結果レコードを1ページにまとめて表示します。結果セットが大きい場合は、表示しやすくするために結果をページ分割した方が望ましい場合があります。これは、結果ペイン右下にあるページネーションセレクタを使用して行えます。

<Image img={pagination} size="lg" border alt="ページネーションのオプション"/>

ページサイズを選択すると、ページネーションが即座に結果セットに適用され、ナビゲーションオプションが結果ペインのフッター中央に表示されます。

<Image img={pagination_nav} size="lg" border alt="ページネーションのナビゲーション"/>

### クエリ結果データのエクスポート \{#exporting-query-result-data\}

クエリの結果セットは、SQL コンソールから直接 CSV 形式で簡単にエクスポートできます。そのためには、結果ペインのツールバー右側にある `•••` メニューを開き、「Download as CSV」を選択します。

<Image img={download_as_csv} size="lg" border alt="Download as CSV"/>

## クエリデータの可視化 \{#visualizing-query-data\}

一部のデータは、チャート形式にするとより直感的に理解できます。SQL コンソールからクエリ結果データを基に、数回のクリックで素早く可視化を作成できます。例として、NYC タクシー乗車データの週次統計を計算するクエリを使用します。

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

可視化されていないと、これらの結果を解釈するのは難しいです。グラフにしてみましょう。


### グラフの作成 \{#creating-charts\}

可視化の作成を始めるには、クエリ結果ペインのツールバーから「Chart」オプションを選択します。すると、グラフ設定ペインが表示されます:

<Image img={switch_from_query_to_chart} size="lg" border alt="Switch from query to chart"/>

まず、`week` ごとの `trip_total` を追跡するシンプルな棒グラフを作成します。そのために、`week` フィールドを x 軸に、`trip_total` フィールドを y 軸にドラッグします:

<Image img={trip_total_by_week} size="lg" border alt="Trip total by week"/>

ほとんどのグラフタイプでは、数値軸に複数のフィールドを設定できます。これを示すために、`fare_total` フィールドを y 軸にドラッグします:

<Image img={bar_chart} size="lg" border alt="Bar chart"/>

### チャートのカスタマイズ \{#customizing-charts\}

SQL コンソールは 10 種類のチャートタイプをサポートしており、チャート設定ペインのチャートタイプセレクタから選択できます。例えば、先ほどのチャートタイプを Bar から Area へ簡単に変更できます。

<Image img={change_from_bar_to_area} size="lg" border alt="Bar チャートから Area への変更"/>

チャートタイトルは、データを提供しているクエリ名と一致します。クエリ名を更新すると、チャートタイトルも同様に更新されます。

<Image img={update_query_name} size="lg" border alt="クエリ名の更新"/>

より高度なチャートの特性も、チャート設定ペインの「Advanced」セクションで調整できます。まず、次の設定を調整します。

- サブタイトル
- 軸タイトル
- x 軸のラベルの向き

チャートはそれに応じて更新されます。

<Image img={update_subtitle_etc} size="lg" border alt="サブタイトルなどの更新"/>

シナリオによっては、各フィールドごとに軸スケールを個別に調整する必要がある場合があります。これは、チャート設定ペインの「Advanced」セクションで、軸レンジの最小値と最大値を指定することで行えます。例として、上記のチャートは見た目は良好ですが、`trip_total` と `fare_total` フィールド間の相関関係を示すには、軸レンジを少し調整する必要があります。

<Image img={adjust_axis_scale} size="lg" border alt="軸スケールの調整"/>

## クエリの共有 \{#sharing-queries\}

SQL コンソールを使用すると、チームとクエリを共有できます。クエリを共有すると、チームの全メンバーがそのクエリを表示および編集できるようになります。共有クエリは、チームで共同作業を行うための優れた方法です。

クエリを共有するには、クエリツールバーの「Share」ボタンをクリックします。

<Image img={sql_console_share} size="lg" border alt="クエリツールバー内の Share ボタン"/>

ダイアログが開き、チームの全メンバーとクエリを共有できるようになります。複数のチームがある場合は、どのチームとクエリを共有するかを選択できます。

<Image img={sql_console_edit_access} size="lg" border alt="共有クエリへのアクセスを編集するためのダイアログ"/>

<Image img={sql_console_add_team} size="lg" border alt="共有クエリにチームを追加するためのインターフェイス"/>

<Image img={sql_console_edit_member} size="lg" border alt="共有クエリへのメンバーアクセスを編集するためのインターフェイス"/>

状況によっては、フィールドごとに軸スケールを個別に調整する必要がある場合があります。これは、チャート設定ペインの「Advanced」セクションで軸範囲の最小値と最大値を指定することで行うこともできます。たとえば、上記のチャートは見た目は良好ですが、`trip_total` フィールドと `fare_total` フィールドの相関関係を示すには、軸範囲を少し調整する必要があります。

<Image img={sql_console_access_queries} size="lg" border alt="クエリ一覧の Shared with me セクション"/>