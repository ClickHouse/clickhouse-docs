---
sidebar_title: 'SQL コンソール'
slug: /cloud/get-started/sql-console
description: 'SQL コンソールでクエリを実行し、可視化を作成します。'
keywords: ['SQL コンソール', 'SQL クライアント', 'クラウドコンソール', 'コンソール']
title: 'SQL コンソール'
doc_type: 'guide'
---

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

# SQL コンソール \{#sql-console\}

SQL コンソールは、ClickHouse Cloud 上のデータベースを探索し、クエリを実行するための最速かつ最も簡単な方法です。SQL コンソールを使用すると、次のことができます。

- ClickHouse Cloud のサービスに接続する
- テーブルデータを表示、フィルタリング、およびソートする
- クエリを実行し、数回のクリックで結果データを可視化する
- クエリをチームメンバーと共有し、より効果的に共同作業を行う

### テーブルの探索 \{#exploring-tables\}

### テーブル一覧とスキーマ情報の表示 \{#viewing-table-list-and-schema-info\}

ClickHouse インスタンスに含まれるテーブルの概要は、左側のサイドバーで確認できます。左サイドバー上部のデータベースセレクタを使用して、特定のデータベース内のテーブルを表示します。

<Image img={table_list_and_schema} size="md" alt="テーブル一覧とスキーマ" />
リスト内のテーブルは展開して、カラムと型を表示することもできます。

<Image img={view_columns} size="md" alt="カラムの表示" />

### テーブルデータの探索 \{#exploring-table-data\}

リスト内のテーブルをクリックすると、新しいタブで開きます。Table View では、データを容易に表示、選択、およびコピーできます。Microsoft Excel や Google Sheets などのスプレッドシートアプリケーションにコピー＆ペーストする際、構造と書式は保持されます。フッターのナビゲーションを使用して、30 行単位でページ分割されているテーブルデータのページを切り替えることができます。

<Image img={abc} size="md" alt="abc" />

### セルデータの検査 \{#inspecting-cell-data\}

Cell Inspector（セルインスペクター）ツールを使用すると、単一のセルに含まれる大量のデータを表示できます。開くには、セルを右クリックし、「Inspect Cell」を選択します。セルインスペクターの内容は、インスペクターウィンドウ右上隅のコピーアイコンをクリックすることでコピーできます。

<Image img={inspecting_cell_content} size="md" alt="セル内容の検査" />

## テーブルのフィルタリングとソート \{#filtering-and-sorting-tables\}

### テーブルをソートする \{#sorting-a-table\}

SQL コンソールでテーブルをソートするには、テーブルを開き、ツールバーの 'Sort' ボタンを選択します。このボタンをクリックすると、ソートを設定できるメニューが開きます。ソートしたい列を選択し、ソート順序（昇順または降順）を設定できます。'Apply' を選択するか Enter キーを押すと、テーブルがソートされます。

<Image img={sort_descending_on_column} size="md" alt='列を降順でソートする' />

SQL コンソールでは、テーブルに複数のソート条件を追加することもできます。別のソート条件を追加するには、再度 'Sort' ボタンをクリックします。 

:::note
ソート条件は、ソートペインに表示される順序（上から下）で適用されます。ソート条件を削除するには、対象のソートの横にある 'x' ボタンをクリックするだけです。
:::

### テーブルをフィルタリングする \{#filtering-a-table\}

SQL コンソールでテーブルをフィルタリングするには、テーブルを開き、'Filter' ボタンを選択します。ソートと同様に、このボタンをクリックするとフィルタを設定できるメニューが開きます。フィルタを適用する列を選択し、必要な条件を指定します。SQL コンソールは、列に含まれるデータ型に対応したフィルタオプションを自動的に表示します。

<Image img={filter_on_radio_column_equal_gsm} size="md" alt='radio 列を値が GSM と等しい条件でフィルタする' />

フィルタ内容に満足したら、'Apply' を選択してデータをフィルタリングします。以下の例のように、追加のフィルタを設定することもできます。

<Image img={add_more_filters} size="md" alt='範囲が 2000 より大きい条件でフィルタを追加する' />

ソート機能と同様に、フィルタを削除するにはフィルタの横にある 'x' ボタンをクリックします。

### フィルタリングとソートを同時に行う \{#filtering-and-sorting-together\}

SQL コンソールでは、テーブルに対してフィルタリングとソートを同時に行うことができます。これを行うには、上記の手順で必要なフィルタとソートをすべて追加し、'Apply' ボタンをクリックします。

<Image img={filtering_and_sorting_together} size="md" alt='範囲が 2000 より大きい条件でフィルタを追加する' />

### フィルタとソートからクエリを作成する \{#creating-a-query-from-filters-and-sorts\}

SQL コンソールは、設定したソート条件とフィルタ条件をワンクリックでクエリに変換できます。ツールバーから 'Create Query' ボタンを選択し、任意のソートおよびフィルタパラメータを指定します。'Create query' をクリックすると、新しいクエリタブが開き、テーブルビューの内容に対応する SQL コマンドがあらかじめ入力されています。

<Image img={create_a_query_from_sorts_and_filters} size="md" alt='ソートとフィルタからクエリを作成する' />

:::note
'Create Query' 機能を使用する際、フィルタやソートを設定することは必須ではありません。
:::

SQL コンソールでのクエリの実行方法については、(link) クエリドキュメントを参照してください。

## クエリの作成と実行 \{#creating-and-running-a-query\}

### クエリの作成 \{#creating-a-query\}

SQL コンソールで新しいクエリを作成する方法は 2 つあります。

- タブバーの「+」ボタンをクリックする
- 左サイドバーのクエリ一覧から「New Query」ボタンを選択する

<Image img={creating_a_query} size="md" alt="クエリの作成" />

### クエリの実行 \{#running-a-query\}

クエリを実行するには、SQL Editor に SQL コマンドを入力し、「Run」ボタンをクリックするか、ショートカット `cmd / ctrl + enter` を使用します。複数のコマンドを順番に記述して実行する場合は、各コマンドの末尾にセミコロンを追加してください。

クエリ実行オプション  
デフォルトでは、「Run」ボタンをクリックすると SQL Editor 内に含まれるすべてのコマンドが実行されます。SQL コンソールでは、他に 2 つのクエリ実行オプションをサポートしています。

- 選択したコマンドを実行
- カーソル位置のコマンドを実行

選択したコマンドを実行するには、目的のコマンドまたはコマンド列を選択し、「Run」ボタンをクリックします（またはショートカット `cmd / ctrl + enter` を使用します）。選択範囲がある場合は、SQL Editor 内を右クリックして開くコンテキストメニューから「Run selected」を選択することもできます。

<Image img={run_selected_query} size="md" alt="選択したクエリを実行" />

現在のカーソル位置にあるコマンドを実行する方法は 2 つあります。

- 拡張実行オプションメニューから「At Cursor」を選択する（または対応するキーボードショートカット `cmd / ctrl + shift + enter` を使用する）

<Image img={run_at_cursor_2} size="md" alt="カーソル位置で実行" />

- SQL Editor のコンテキストメニューから「Run at cursor」を選択する

<Image img={run_at_cursor} size="md" alt="カーソル位置で実行" />

:::note
実行時には、カーソル位置にあるコマンドが黄色に点滅します。
:::

### クエリのキャンセル \{#canceling-a-query\}

クエリの実行中は、Query Editor ツールバーの「Run」ボタンが「Cancel」ボタンに置き換わります。このボタンをクリックするか、`Esc` キーを押すだけでクエリをキャンセルできます。注意：すでに返された結果は、キャンセル後も保持されます。

<Image img={cancel_a_query} size="md" alt="クエリをキャンセル" />

### クエリの保存 \{#saving-a-query\}

クエリを保存しておくと、後から簡単に見つけたり、チームメイトと共有したりできます。SQL コンソールでは、クエリをフォルダに整理することもできます。

クエリを保存するには、ツールバーで「Run」ボタンのすぐ横にある「Save」ボタンをクリックします。任意の名前を入力し、「Save Query」をクリックします。

:::note
ショートカット `cmd / ctrl` + s を使用して、現在のクエリタブの作業内容を保存することもできます。
:::

<Image img={sql_console_save_query} size="md" alt="クエリを保存" />

別の方法として、ツールバーの「Untitled Query」をクリックし、名前を変更して Enter を押すことで、クエリの命名と保存を同時に行うこともできます。

<Image img={sql_console_rename} size="md" alt="クエリ名を変更" />

### クエリの共有 \{#query-sharing\}

SQL コンソールでは、クエリをチームメンバーと簡単に共有できます。SQL コンソールは、グローバルおよびユーザー単位の両方で調整可能な 4 種類のアクセスレベルをサポートしています。

- Owner（共有オプションを変更可能）
- 書き込み権限
- 読み取り専用アクセス
- アクセスなし

クエリを保存したら、ツールバーの「Share」ボタンをクリックします。共有オプションを含むモーダルが表示されます。

<Image img={sql_console_share} size="md" alt="クエリを共有" />

サービスにアクセスできるすべての組織メンバーに対するクエリアクセスを調整するには、最上段のアクセスレベルセレクタを変更します。

<Image img={sql_console_edit_access} size="md" alt="アクセス権を編集" />

上記を適用すると、そのサービスの SQL コンソールにアクセスできるすべてのチームメンバーが、当該クエリを表示（および実行）できるようになります。

特定メンバーのクエリアクセスを調整するには、「Add a team member」セレクタから対象のチームメンバーを選択します。

<Image img={sql_console_add_team} size="md" alt="チームメンバーを追加" />

チームメンバーを選択すると、新しい行が追加され、アクセスレベルセレクタが表示されます。

<Image img={sql_console_edit_member} size="md" alt="チームメンバーのアクセスを編集" />

### 共有クエリへのアクセス \{#accessing-shared-queries\}

クエリがあなたと共有されている場合、SQL コンソール左サイドバーの「Queries」タブに表示されます。

<Image img={sql_console_access_queries} size="md" alt="クエリにアクセス" />

### クエリへのリンク（パーマリンク） \{#linking-to-a-query-permalinks\}

保存されたクエリにはパーマリンクも付与されるため、共有クエリへのリンクを送受信して、直接開くことができます。

クエリに含まれるパラメータの値は、自動的に保存されたクエリの URL にクエリパラメータとして追加されます。たとえば、クエリに `{start_date: Date}` と `{end_date: Date}` パラメータが含まれている場合、パーマリンクは次のようになります: `https://console.clickhouse.cloud/services/:serviceId/console/query/:queryId?param_start_date=2015-01-01&param_end_date=2016-01-01`。

## 高度なクエリ機能 \{#advanced-querying-features\}

### クエリ結果の検索 \{#searching-query-results\}

クエリの実行後、結果ペイン内の検索入力欄を使って、返された結果セットをすばやく検索できます。この機能は、追加の `WHERE` 句を指定した場合の結果をプレビューしたり、特定のデータが結果セットに含まれているかを確認したりするのに役立ちます。検索入力欄に値を入力すると、結果ペインが更新され、入力した値に一致するエントリを含むレコードが返されます。この例では、`ClickHouse` を含むコメントについて、`hackernews` テーブル内の `breakfast` のすべての出現箇所を検索します（大文字小文字は区別されません）:

<Image img={search_hn} size="md" alt="Hacker News データの検索" />

注: 入力した値に一致するフィールドであれば、どのフィールドでも結果として返されます。たとえば、上のスクリーンショットの 3 番目のレコードは、`by` フィールドでは「breakfast」に一致しませんが、`text` フィールドは一致しています:

<Image img={match_in_body} size="md" alt="本文内での一致" />

### ページネーション設定の調整 \{#adjusting-pagination-settings\}

デフォルトでは、クエリ結果ペインはすべての結果レコードを 1 ページに表示します。結果セットが大きい場合は、見やすくするために結果をページ分割する方が好ましい場合があります。これは、結果ペイン右下隅にあるページネーションセレクタを使用して行えます:

<Image img={pagination} size="md" alt="ページネーションオプション" />

ページサイズを選択すると、結果セットに対してすぐにページネーションが適用され、結果ペインフッター中央にナビゲーションオプションが表示されます。

<Image img={pagination_nav} size="md" alt="ページネーションナビゲーション" />

### クエリ結果データのエクスポート \{#exporting-query-result-data\}

クエリ結果セットは、SQL コンソールから直接 CSV 形式に簡単にエクスポートできます。実行するには、結果ペインツールバー右側にある `•••` メニューを開き、「Download as CSV」を選択します。

<Image img={download_as_csv} size="md" alt="CSV としてダウンロード" />

## クエリデータの可視化 \{#visualizing-query-data\}

一部のデータは、チャート形式にするとより理解しやすくなります。SQL コンソールからクエリ結果データを直接利用して、数回のクリックで素早く可視化を作成できます。例として、NYC タクシー乗車データの週次統計を計算するクエリを使用します。

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

<Image img={tabular_query_results} size="md" alt="表形式のクエリ結果" />

可視化がないと、これらの結果を解釈するのは困難です。チャートにしてみましょう。

### チャートの作成 \{#creating-charts\}

可視化の作成を始めるには、クエリ結果ペインのツールバーから「Chart」オプションを選択します。チャート設定ペインが表示されます。

<Image img={switch_from_query_to_chart} size="md" alt="クエリからチャートへの切り替え" />

まず、`week` ごとの `trip_total` を追跡するシンプルな棒グラフを作成します。そのために、`week` フィールドを x 軸に、`trip_total` フィールドを y 軸にドラッグします。

<Image img={trip_total_by_week} size="md" alt="週ごとの Trip total" />

ほとんどのチャートタイプは、数値軸に複数のフィールドを設定できます。これを示すために、`fare_total` フィールドを y 軸にドラッグします。

<Image img={bar_chart} size="md" alt="棒グラフ" />

### チャートのカスタマイズ \{#customizing-charts\}

SQL コンソールは 10 種類のチャートタイプをサポートしており、チャート設定ペインのチャートタイプセレクターから選択できます。たとえば、先ほどのチャートタイプを Bar から Area に簡単に変更できます。

<Image img={change_from_bar_to_area} size="md" alt="棒グラフからエリアチャートへの変更" />

チャートのタイトルは、データを提供するクエリの名前と一致します。クエリ名を更新すると、チャートタイトルも同様に更新されます。

<Image img={update_query_name} size="md" alt="クエリ名の更新" />

さらに高度なチャートの設定は、チャート設定ペインの「Advanced」セクションで調整できます。まず、次の設定を変更します。

* サブタイトル
* 軸タイトル
* x 軸のラベルの向き

チャートはこれらの変更に応じて更新されます。

<Image img={update_subtitle_etc} size="md" alt="サブタイトルなどの更新" />

ユースケースによっては、フィールドごとに軸スケールを個別に調整する必要がある場合があります。これは、チャート設定ペインの「Advanced」セクションで軸範囲の最小値と最大値を指定することで行えます。たとえば、上記のチャートは一見問題ありませんが、`trip_total` と `fare_total` フィールド間の相関関係を示すには、軸範囲を少し調整する必要があります。

<Image img={adjust_axis_scale} size="md" alt="軸スケールの調整" />
