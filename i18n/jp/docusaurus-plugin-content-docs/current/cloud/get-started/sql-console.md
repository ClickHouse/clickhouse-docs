---
sidebar_title: 'SQL Console'
slug: '/cloud/get-started/sql-console'
description: 'SQLコンソールを使用してクエリを実行し、可視化を作成します。'
keywords:
- 'sql console'
- 'sql client'
- 'cloud console'
- 'console'
title: 'SQL Console'
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

SQLコンソールは、ClickHouse Cloudでデータベースを探索し、クエリを実行するための最も迅速かつ簡単な方法です。SQLコンソールを使用して、以下のことができます：

- ClickHouse Cloud Servicesに接続する
- テーブルデータを表示、フィルタリング、並べ替える
- クエリを実行し、結果データを数回のクリックで視覚化する
- チームメンバーとクエリを共有し、より効果的にコラボレーションする。

### テーブルの探索 {#exploring-tables}

### テーブルリストとスキーマ情報の表示 {#viewing-table-list-and-schema-info}

ClickHouseインスタンスに含まれるテーブルの概要は、左側のサイドバーエリアに表示されます。左バーの上部にあるデータベースセレクタを使用して、特定のデータベース内のテーブルを表示します。

<Image img={table_list_and_schema} size="md" alt='テーブルリストとスキーマ' />
リスト内のテーブルは展開して、カラムとタイプを表示することもできます。

<Image img={view_columns} size="md" alt='カラムを表示' />

### テーブルデータの探索 {#exploring-table-data}

リスト内のテーブルをクリックすると、新しいタブで開きます。テーブルビューでは、データを簡単に表示、選択、コピーできます。Microsoft ExcelやGoogle Sheetsなどのスプレッドシートアプリケーションにコピー＆ペーストする際に、構造とフォーマットは保持されることに注意してください。フッターのナビゲーションを使用して、テーブルデータのページを切り替えることができます（30行単位でページ付け）。

<Image img={abc} size="md" alt='abc' />

### セルデータの検査 {#inspecting-cell-data}

セルインスペクターツールを使用して、単一のセルに含まれる大量のデータを表示できます。開くにはセルを右クリックし、「セルを検査」を選択します。セルインスペクターの内容は、インスペクターコンテンツの右上隅にあるコピーアイコンをクリックすることでコピーできます。

<Image img={inspecting_cell_content} size="md" alt='セル内容を検査' />

## テーブルのフィルタリングと並べ替え {#filtering-and-sorting-tables}

### テーブルの並べ替え {#sorting-a-table}

SQLコンソールでテーブルを並べ替えるには、テーブルを開いてツールバーの「並べ替え」ボタンを選択します。このボタンをクリックすると、並べ替えを構成できるメニューが表示されます。並べ替えを希望するカラムと、並べ替えの順序（昇順または降順）を選択できます。「適用」を選択するか、Enterを押してテーブルを並べ替えます。

<Image img={sort_descending_on_column} size="md" alt='カラムで降順に並べ替え' />

SQLコンソールでは、テーブルに複数の並べ替えを追加することもできます。再度「並べ替え」ボタンをクリックして、別の並べ替えを追加します。

:::note
並べ替えは、並べ替えペインに表示される順序（上から下）で適用されます。並べ替えを削除するには、並べ替えの隣にある「x」ボタンをクリックしてください。
:::

### テーブルのフィルタリング {#filtering-a-table}

SQLコンソールでテーブルをフィルタリングするには、テーブルを開いて「フィルター」ボタンを選択します。並べ替えと同様に、このボタンをクリックすると、フィルタを構成できるメニューが表示されます。フィルタリングするカラムを選択し、必要な基準を選択できます。SQLコンソールは、カラムに含まれるデータのタイプに対応するフィルタオプションを賢く表示します。

<Image img={filter_on_radio_column_equal_gsm} size="md" alt='GSMに等しいラジオカラムのフィルタ' />

フィルタに満足したら、「適用」を選択してデータをフィルタリングできます。また、下記のように追加のフィルタを追加することもできます。

<Image img={add_more_filters} size="md" alt='2000より大きい範囲のフィルタを追加' />

並べ替え機能と同様に、フィルタの隣にある「x」ボタンをクリックして削除できます。

### フィルタリングと並べ替えを同時に行う {#filtering-and-sorting-together}

SQLコンソールでは、テーブルをフィルタリングして並べ替えを同時に行うことができます。これを行うには、上記の手順を使用してすべての希望するフィルタと並べ替えを追加し、「適用」ボタンをクリックします。

<Image img={filtering_and_sorting_together} size="md" alt='2000より大きい範囲のフィルタを追加' />

### フィルタと並べ替えからクエリを作成する {#creating-a-query-from-filters-and-sorts}

SQLコンソールでは、フィルタと並べ替えをワンクリックでクエリに変換できます。希望するフィルタと並べ替えのパラメータを選択したら、ツールバーの「クエリを作成」ボタンを選択します。「クエリを作成」をクリックすると、テーブルビューに含まれるデータに対応するSQLコマンドで事前に入力された新しいクエリタブが開きます。

<Image img={create_a_query_from_sorts_and_filters} size="md" alt='フィルタと並べ替えからクエリを作成' />

:::note
「クエリを作成」機能を使用する際、フィルタと並べ替えは必須ではありません。
:::

SQLコンソールでのクエリの詳細については、(link) クエリのドキュメントを読むことができます。

## クエリの作成と実行 {#creating-and-running-a-query}

### クエリの作成 {#creating-a-query}

SQLコンソールで新しいクエリを作成する方法は2つあります。

- タブバーの「+」ボタンをクリックする
- 左側のサイドバーのクエリリストから「新しいクエリ」ボタンを選択する

<Image img={creating_a_query} size="md" alt='クエリを作成' />

### クエリの実行 {#running-a-query}

クエリを実行するには、SQLエディタにSQLコマンドを入力し、「実行」ボタンをクリックするか、ショートカット`cmd / ctrl + enter`を使用します。複数のコマンドを連続して記述して実行する場合は、各コマンドの後にセミコロンを追加することを忘れないでください。

クエリ実行オプション
デフォルトでは、実行ボタンをクリックするとSQLエディタ内のすべてのコマンドが実行されます。SQLコンソールは、他の2つのクエリ実行オプションをサポートします：

- 選択したコマンドを実行
- カーソルの位置でコマンドを実行

選択したコマンドを実行するには、望ましいコマンドまたはコマンドのシーケンスをハイライトし、「実行」ボタンをクリックします（または`cmd / ctrl + enter`ショートカットを使用）。選択がある場合は、SQLエディタのコンテキストメニュー（エディタ内の任意の場所を右クリックして開く）から「選択した実行」を選択することもできます。

<Image img={run_selected_query} size="md" alt='選択したクエリを実行' />

現在のカーソル位置でコマンドを実行する方法は2つあります：

- 拡張実行オプションメニューから「カーソルで実行」を選択します（または対応するショートカット`cmd / ctrl + shift + enter`を使用）

<Image img={run_at_cursor_2} size="md" alt='カーソルで実行' />

- SQLエディタのコンテキストメニューから「カーソルで実行」を選択します。

<Image img={run_at_cursor} size="md" alt='カーソルで実行' />

:::note
カーソル位置にあるコマンドは実行時に黄色に点滅します。
:::

### クエリのキャンセル {#canceling-a-query}

クエリが実行中は、クエリエディタのツールバーにある「実行」ボタンが「キャンセル」ボタンに置き換わります。このボタンをクリックするか、`Esc`を押すとクエリがキャンセルされます。注：キャンセル後に既に返された結果はそのまま表示されます。

<Image img={cancel_a_query} size="md" alt='クエリをキャンセル' />

### クエリの保存 {#saving-a-query}

クエリを保存することで、後で簡単に見つけられるようになり、チームメンバーと共有することができます。SQLコンソールでは、クエリをフォルダに整理することもできます。

クエリを保存するには、ツールバーの「実行」ボタンのすぐ隣にある「保存」ボタンをクリックします。希望する名前を入力し、「クエリを保存」をクリックします。

:::note
ショートカット`cmd / ctrl + s`を使用すると、現在のクエリタブでの作業を保存することもできます。
:::

<Image img={sql_console_save_query} size="md" alt='クエリを保存' />

また、「無題のクエリ」をツールバーでクリックして名前を変更し、Enterキーを押すことで、同時にクエリの名前を付けて保存することもできます：

<Image img={sql_console_rename} size="md" alt='クエリの名前を変更' />

### クエリの共有 {#query-sharing}

SQLコンソールでは、クエリをチームメンバーと簡単に共有することができます。SQLコンソールは、全体およびユーザーごとに調整可能な4つのアクセスレベルをサポートしています：

- 所有者（共有オプションを調整可能）
- 書き込みアクセス
- 読み取り専用アクセス
- アクセスなし

クエリを保存した後、ツールバーの「共有」ボタンをクリックします。共有オプションが表示されるモーダルが表示されます：

<Image img={sql_console_share} size="md" alt='クエリを共有' />

サービスにアクセスできるすべての組織メンバーのクエリアクセスを調整するには、上部のアクセスレベルセレクタを調整します：

<Image img={sql_console_edit_access} size="md" alt='アクセスを編集' />

上記を適用した後、クエリはSQLコンソールにアクセスできるすべてのチームメンバーによって表示（および実行）できるようになります。

特定のメンバーのクエリアクセスを調整するには、「チームメンバーを追加」セレクタから希望するチームメンバーを選択します：

<Image img={sql_console_add_team} size="md" alt='チームメンバーを追加' />

チームメンバーを選択すると、アクセスレベルセレクタを持つ新しい行項目が表示されます：

<Image img={sql_console_edit_member} size="md" alt='チームメンバーアクセスを編集' />

### 共有クエリへのアクセス {#accessing-shared-queries}

クエリが共有されている場合、「クエリ」タブのSQLコンソール左サイドバーに表示されます：

<Image img={sql_console_access_queries} size="md" alt='クエリにアクセス' />

### クエリへのリンク（パーマリンク） {#linking-to-a-query-permalinks}

保存されたクエリはパーマリンクされており、共有クエリへのリンクを送受信し、直接開くことができます。

クエリに存在する可能性のあるパラメータの値は、保存されたクエリのURLに自動的にクエリパラメータとして追加されます。たとえば、クエリに`{start_date: Date}`および`{end_date: Date}`パラメータが含まれている場合、パーマリンクは次のようになります：`https://console.clickhouse.cloud/services/:serviceId/console/query/:queryId?param_start_date=2015-01-01&param_end_date=2016-01-01`。

## 高度なクエリ機能 {#advanced-querying-features}

### クエリ結果の検索 {#searching-query-results}

クエリが実行されると、結果ペイン内の検索入力を使用して取得された結果セットを迅速に検索できます。この機能は、追加の`WHERE`句の結果をプレビューしたり、特定のデータが結果セットに含まれていることを確認したりするのに役立ちます。検索入力に値を入力すると、結果ペインが更新され、入力した値と一致するレコードが返されます。この例では、`hackernews`テーブル内の`ClickHouse`を含むコメントのすべての`breakfast`のインスタンスを探します（大文字と小文字は区別しません）：

<Image img={search_hn} size="md" alt='Hacker Newsのデータを検索' />

注：入力した値と一致する任意のフィールドが返されます。たとえば、上のスクリーンショットの3番目のレコードは、`by`フィールドの'breakfast'には一致しませんが、`text`フィールドには一致しています：

<Image img={match_in_body} size="md" alt='本文に一致' />

### ページネーション設定の調整 {#adjusting-pagination-settings}

デフォルトでは、クエリ結果ペインはすべての結果レコードを1ページに表示します。大きな結果セットの場合、結果をページングして表示しやすくする方が好ましいことがあります。これは、結果ペインの右下隅にあるページネーションセレクタを使用して実行できます：

<Image img={pagination} size="md" alt='ページネーションオプション' />

ページサイズを選択すると、結果セットに直ちにページネーションが適用され、結果ペインのフッターの中央にナビゲーションオプションが表示されます。

<Image img={pagination_nav} size="md" alt='ページネーションナビゲーション' />

### クエリ結果データのエクスポート {#exporting-query-result-data}

クエリ結果セットは、SQLコンソールから直接CSV形式に簡単にエクスポートできます。そのためには、結果ペインツールバーの右側にある`•••`メニューを開き、「CSVとしてダウンロード」を選択します。

<Image img={download_as_csv} size="md" alt='CSVとしてダウンロード' />

## クエリデータの視覚化 {#visualizing-query-data}

一部のデータは、チャート形式でより容易に解釈できます。SQLコンソールからクエリ結果データから視覚化を数回のクリックで迅速に作成できます。例として、NYCタクシーの週次統計を計算するクエリを使います：

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

<Image img={tabular_query_results} size="md" alt='表形式のクエリ結果' />

視覚化なしでは、これらの結果は解釈するのが難しいです。これをチャートに変換しましょう。

### チャートの作成 {#creating-charts}

視覚化を構築するには、クエリ結果ペインツールバーから「チャート」オプションを選択します。チャート設定パネルが表示されます：

<Image img={switch_from_query_to_chart} size="md" alt='クエリからチャートへ切り替え' />

まずは、`week`ごとの`trip_total`を追跡するシンプルな棒グラフを作成します。これを実行するには、`week`フィールドをx軸に、`trip_total`フィールドをy軸にドラッグします：

<Image img={trip_total_by_week} size="md" alt='週ごとのトリップ合計' />

ほとんどのグラフタイプは数値軸上に複数のフィールドをサポートしています。デモンストレーションとして、fare_totalフィールドをy軸にドラッグします：

<Image img={bar_chart} size="md" alt='棒グラフ' />

### チャートのカスタマイズ {#customizing-charts}

SQLコンソールでは、チャートタイプセレクタグラフ設定パネルで選択できる10種類のチャートタイプをサポートしています。たとえば、前のチャートタイプを棒グラフからエリアに簡単に変更できます：

<Image img={change_from_bar_to_area} size="md" alt='棒グラフからエリアへの変更' />

チャートのタイトルは、データを供給するクエリの名前と一致します。クエリの名前を更新すると、チャートのタイトルも更新されます：

<Image img={update_query_name} size="md" alt='クエリ名を更新' />

多くの高度なチャートの特性も、チャート設定パネルの「高度な」セクションで調整できます。最初に以下の設定を調整します：

- サブタイトル
- 軸タイトル
- x軸のラベル方向

それに応じてチャートが更新されます：

<Image img={update_subtitle_etc} size="md" alt='サブタイトルなどを更新' />

特定のシナリオでは、各フィールドの軸スケールを独立して調整する必要があります。これも、軸範囲の最小値と最大値を指定することによって、チャート設定パネルの「高度な」セクションで実行できます。たとえば、上記のチャートは見た目が良いですが、`trip_total`と`fare_total`フィールド間の相関関係を示すためには、軸の範囲を調整する必要があります：

<Image img={adjust_axis_scale} size="md" alt='軸スケールを調整' />
