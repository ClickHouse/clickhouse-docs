---
sidebar_title: 'SQL コンソール'
slug: /cloud/get-started/sql-console
description: 'SQL コンソールを使用してクエリを実行し、ビジュアライゼーションを作成できます。'
keywords: ['SQL コンソール', 'SQL クライアント', 'クラウド コンソール', 'コンソール']
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


# SQLコンソール

SQLコンソールは、ClickHouse Cloudでデータベースを探索およびクエリする最も迅速かつ簡単な方法です。SQLコンソールを使用すると、以下のことができます:

- ClickHouse Cloudサービスへの接続
- テーブルデータの表示、フィルタリング、並べ替え
- わずか数クリックでクエリを実行し、結果データを可視化
- チームメンバーとクエリを共有し、より効果的にコラボレーション

### テーブルの探索 {#exploring-tables}

### テーブルリストとスキーマ情報の表示 {#viewing-table-list-and-schema-info}

ClickHouseインスタンスに含まれるテーブルの概要は、左サイドバーで確認できます。左バー上部のデータベースセレクターを使用して、特定のデータベース内のテーブルを表示できます

<Image img={table_list_and_schema} size='md' alt='テーブルリストとスキーマ' />
リスト内のテーブルを展開して、カラムと型を表示することもできます

<Image img={view_columns} size='md' alt='カラムの表示' />

### テーブルデータの探索 {#exploring-table-data}

リスト内のテーブルをクリックすると、新しいタブで開きます。テーブルビューでは、データを簡単に表示、選択、コピーできます。Microsoft ExcelやGoogle Sheetsなどのスプレッドシートアプリケーションにコピー&ペーストする際、構造と書式が保持されます。フッターのナビゲーションを使用して、テーブルデータのページ(30行単位でページネーション)を切り替えることができます。

<Image img={abc} size='md' alt='テーブルデータの表示' />

### セルデータの検査 {#inspecting-cell-data}

セルインスペクターツールを使用すると、単一のセルに含まれる大量のデータを表示できます。開くには、セルを右クリックして「セルを検査」を選択します。セルインスペクターの内容は、インスペクター右上隅のコピーアイコンをクリックしてコピーできます。

<Image img={inspecting_cell_content} size='md' alt='セル内容の検査' />


## テーブルのフィルタリングとソート {#filtering-and-sorting-tables}

### テーブルのソート {#sorting-a-table}

SQLコンソールでテーブルをソートするには、テーブルを開き、ツールバーの「Sort」ボタンを選択します。このボタンをクリックすると、ソート設定を行うメニューが開きます。ソートに使用する列を選択し、ソート順序(昇順または降順)を設定できます。「Apply」を選択するか、Enterキーを押すとテーブルがソートされます

<Image
  img={sort_descending_on_column}
  size='md'
  alt='列を降順でソート'
/>

SQLコンソールでは、テーブルに複数のソートを追加することもできます。「Sort」ボタンを再度クリックすると、別のソートを追加できます。

:::note
ソートは、ソートペインに表示される順序(上から下)で適用されます。ソートを削除するには、ソートの横にある「x」ボタンをクリックしてください。
:::

### テーブルのフィルタリング {#filtering-a-table}

SQLコンソールでテーブルをフィルタリングするには、テーブルを開き、「Filter」ボタンを選択します。ソートと同様に、このボタンをクリックすると、フィルタ設定を行うメニューが開きます。フィルタリングに使用する列を選択し、必要な条件を指定できます。SQLコンソールは、列に含まれるデータ型に応じたフィルタオプションをインテリジェントに表示します。

<Image
  img={filter_on_radio_column_equal_gsm}
  size='md'
  alt='radio列でGSMに等しいフィルタ'
/>

フィルタの設定が完了したら、「Apply」を選択してデータをフィルタリングできます。以下に示すように、追加のフィルタを設定することもできます。

<Image
  img={add_more_filters}
  size='md'
  alt='rangeが2000より大きいフィルタを追加'
/>

ソート機能と同様に、フィルタを削除するには、フィルタの横にある「x」ボタンをクリックしてください。

### フィルタリングとソートの併用 {#filtering-and-sorting-together}

SQLコンソールでは、テーブルのフィルタリングとソートを同時に実行できます。これを行うには、上記の手順に従って必要なフィルタとソートをすべて追加し、「Apply」ボタンをクリックします。

<Image
  img={filtering_and_sorting_together}
  size='md'
  alt='rangeが2000より大きいフィルタを追加'
/>

### フィルタとソートからクエリを作成 {#creating-a-query-from-filters-and-sorts}

SQLコンソールは、ソートとフィルタをワンクリックでクエリに直接変換できます。任意のソートとフィルタのパラメータを設定した状態で、ツールバーから「Create Query」ボタンを選択するだけです。「Create query」をクリックすると、テーブルビューに含まれるデータに対応するSQLコマンドが事前に入力された新しいクエリタブが開きます。

<Image
  img={create_a_query_from_sorts_and_filters}
  size='md'
  alt='ソートとフィルタからクエリを作成'
/>

:::note
「Create Query」機能を使用する際、フィルタとソートは必須ではありません。
:::

SQLコンソールでのクエリの詳細については、(link)クエリドキュメントをご参照ください。


## クエリの作成と実行 {#creating-and-running-a-query}

### クエリの作成 {#creating-a-query}

SQLコンソールで新しいクエリを作成する方法は2つあります。

- タブバーの「+」ボタンをクリックする
- 左サイドバーのクエリリストから「New Query」ボタンを選択する

<Image img={creating_a_query} size='md' alt='クエリの作成' />

### クエリの実行 {#running-a-query}

クエリを実行するには、SQLエディタにSQLコマンドを入力し、「Run」ボタンをクリックするか、ショートカット`cmd / ctrl + enter`を使用します。複数のコマンドを順次記述して実行する場合は、各コマンドの後にセミコロンを追加してください。

クエリ実行オプション
デフォルトでは、実行ボタンをクリックするとSQLエディタに含まれるすべてのコマンドが実行されます。SQLコンソールは、他に2つのクエリ実行オプションをサポートしています:

- 選択したコマンドを実行
- カーソル位置のコマンドを実行

選択したコマンドを実行するには、目的のコマンドまたは一連のコマンドをハイライト表示し、「Run」ボタンをクリックします（または`cmd / ctrl + enter`ショートカットを使用します）。選択範囲が存在する場合、SQLエディタのコンテキストメニュー（エディタ内の任意の場所を右クリックして開く）から「Run selected」を選択することもできます。

<Image img={run_selected_query} size='md' alt='選択したクエリの実行' />

現在のカーソル位置にあるコマンドを実行するには、2つの方法があります:

- 拡張実行オプションメニューから「At Cursor」を選択する（または対応する`cmd / ctrl + shift + enter`キーボードショートカットを使用する）

<Image img={run_at_cursor_2} size='md' alt='カーソル位置で実行' />

- SQLエディタのコンテキストメニューから「Run at cursor」を選択する

<Image img={run_at_cursor} size='md' alt='カーソル位置で実行' />

:::note
カーソル位置にあるコマンドは、実行時に黄色く点滅します。
:::

### クエリのキャンセル {#canceling-a-query}

クエリの実行中は、クエリエディタツールバーの「Run」ボタンが「Cancel」ボタンに置き換わります。このボタンをクリックするか、`Esc`キーを押すだけでクエリをキャンセルできます。注意: 既に返された結果は、キャンセル後も保持されます。

<Image img={cancel_a_query} size='md' alt='クエリのキャンセル' />

### クエリの保存 {#saving-a-query}

クエリを保存することで、後で簡単に見つけることができ、チームメンバーと共有することができます。SQLコンソールでは、クエリをフォルダに整理することもできます。

クエリを保存するには、ツールバーの「Run」ボタンのすぐ隣にある「Save」ボタンをクリックします。希望する名前を入力し、「Save Query」をクリックします。

:::note
ショートカット`cmd / ctrl` + sを使用すると、現在のクエリタブの作業内容も保存されます。
:::

<Image img={sql_console_save_query} size='md' alt='クエリの保存' />

または、ツールバーの「Untitled Query」をクリックし、名前を調整してEnterキーを押すことで、クエリの命名と保存を同時に行うこともできます:

<Image img={sql_console_rename} size='md' alt='クエリの名前変更' />

### クエリの共有 {#query-sharing}

SQLコンソールでは、チームメンバーとクエリを簡単に共有できます。SQLコンソールは、グローバルおよびユーザー単位で調整可能な4つのアクセスレベルをサポートしています:

- オーナー（共有オプションを調整可能）
- 書き込みアクセス
- 読み取り専用アクセス
- アクセス不可

クエリを保存した後、ツールバーの「Share」ボタンをクリックします。共有オプションを含むモーダルが表示されます:

<Image img={sql_console_share} size='md' alt='クエリの共有' />

サービスへのアクセス権を持つすべての組織メンバーのクエリアクセスを調整するには、最上部のアクセスレベルセレクタを調整します:

<Image img={sql_console_edit_access} size='md' alt='アクセスの編集' />

上記を適用すると、サービスのSQLコンソールへのアクセス権を持つすべてのチームメンバーがクエリを表示（および実行）できるようになります。

特定のメンバーのクエリアクセスを調整するには、「Add a team member」セレクタから目的のチームメンバーを選択します:

<Image img={sql_console_add_team} size='md' alt='チームメンバーの追加' />

チームメンバーを選択すると、アクセスレベルセレクタを含む新しい行項目が表示されます:

<Image img={sql_console_edit_member} size='md' alt='チームメンバーアクセスの編集' />

### 共有クエリへのアクセス {#accessing-shared-queries}

クエリが共有されている場合、SQLコンソールの左サイドバーの「Queries」タブに表示されます:

<Image img={sql_console_access_queries} size='md' alt='クエリへのアクセス' />

### クエリへのリンク（パーマリンク） {#linking-to-a-query-permalinks}


保存されたクエリにはパーマリンクも付与されるため、共有クエリへのリンクを送受信し、それらを直接開くことができます。

クエリ内に存在する任意のパラメータの値は、URL のクエリパラメータとして自動的に保存済みクエリの URL に追加されます。たとえば、クエリに `{start_date: Date}` および `{end_date: Date}` パラメータが含まれている場合、パーマリンクは次のようになります: `https://console.clickhouse.cloud/services/:serviceId/console/query/:queryId?param_start_date=2015-01-01&param_end_date=2016-01-01`。



## 高度なクエリ機能 {#advanced-querying-features}

### クエリ結果の検索 {#searching-query-results}

クエリ実行後、結果ペインの検索入力を使用して、返された結果セットを素早く検索できます。この機能は、追加の`WHERE`句の結果をプレビューしたり、特定のデータが結果セットに含まれていることを確認したりする際に役立ちます。検索入力に値を入力すると、結果ペインが更新され、入力値に一致するエントリを含むレコードが返されます。この例では、`ClickHouse`を含むコメントについて、`hackernews`テーブル内の`breakfast`のすべてのインスタンスを検索します(大文字小文字を区別しない):

<Image img={search_hn} size='md' alt='Hacker Newsデータの検索' />

注意: 入力値に一致するすべてのフィールドが返されます。例えば、上記のスクリーンショットの3番目のレコードは、`by`フィールドでは'breakfast'に一致しませんが、`text`フィールドでは一致しています:

<Image img={match_in_body} size='md' alt='本文内の一致' />

### ページネーション設定の調整 {#adjusting-pagination-settings}

デフォルトでは、クエリ結果ペインはすべての結果レコードを1ページに表示します。大きな結果セットの場合、閲覧を容易にするために結果をページ分割することが望ましい場合があります。これは、結果ペインの右下隅にあるページネーションセレクタを使用して実現できます:

<Image img={pagination} size='md' alt='ページネーションオプション' />

ページサイズを選択すると、結果セットに即座にページネーションが適用され、結果ペインのフッター中央にナビゲーションオプションが表示されます

<Image img={pagination_nav} size='md' alt='ページネーションナビゲーション' />

### クエリ結果データのエクスポート {#exporting-query-result-data}

クエリ結果セットは、SQLコンソールから直接CSV形式に簡単にエクスポートできます。エクスポートするには、結果ペインツールバーの右側にある`•••`メニューを開き、「CSVとしてダウンロード」を選択します。

<Image img={download_as_csv} size='md' alt='CSVとしてダウンロード' />


## クエリデータの可視化 {#visualizing-query-data}

データによっては、グラフ形式で表示することでより容易に解釈できる場合があります。SQLコンソールから直接、わずか数クリックでクエリ結果データの可視化を迅速に作成できます。例として、NYCタクシー乗車の週次統計を計算するクエリを使用します:

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

<Image img={tabular_query_results} size='md' alt='表形式のクエリ結果' />

可視化しない場合、これらの結果は解釈が困難です。これらをグラフに変換しましょう。

### グラフの作成 {#creating-charts}

可視化の構築を開始するには、クエリ結果ペインのツールバーから「Chart」オプションを選択します。グラフ設定ペインが表示されます:

<Image
  img={switch_from_query_to_chart}
  size='md'
  alt='クエリからグラフへの切り替え'
/>

まず、`week`ごとの`trip_total`を追跡するシンプルな棒グラフを作成します。これを実現するには、`week`フィールドをx軸に、`trip_total`フィールドをy軸にドラッグします:

<Image img={trip_total_by_week} size='md' alt='週ごとの乗車総数' />

ほとんどのグラフタイプは、数値軸上の複数のフィールドをサポートしています。これを実証するために、`fare_total`フィールドをy軸にドラッグします:

<Image img={bar_chart} size='md' alt='棒グラフ' />

### グラフのカスタマイズ {#customizing-charts}

SQLコンソールは、グラフ設定ペインのグラフタイプセレクターから選択できる10種類のグラフタイプをサポートしています。例えば、前のグラフタイプを棒グラフからエリアグラフに簡単に変更できます:

<Image
  img={change_from_bar_to_area}
  size='md'
  alt='棒グラフからエリアグラフへの変更'
/>

グラフのタイトルは、データを提供するクエリの名前と一致します。クエリの名前を更新すると、グラフのタイトルも更新されます:

<Image img={update_query_name} size='md' alt='クエリ名の更新' />

より高度なグラフの特性も、グラフ設定ペインの「Advanced」セクションで調整できます。まず、以下の設定を調整します:

- サブタイトル
- 軸のタイトル
- x軸のラベルの向き

グラフはそれに応じて更新されます:

<Image img={update_subtitle_etc} size='md' alt='サブタイトルなどの更新' />

シナリオによっては、各フィールドの軸スケールを個別に調整する必要がある場合があります。これは、グラフ設定ペインの「Advanced」セクションで軸範囲の最小値と最大値を指定することで実現できます。例として、上記のグラフは良好に見えますが、`trip_total`と`fare_total`フィールド間の相関を示すためには、軸範囲にいくつかの調整が必要です:

<Image img={adjust_axis_scale} size='md' alt='軸スケールの調整' />
