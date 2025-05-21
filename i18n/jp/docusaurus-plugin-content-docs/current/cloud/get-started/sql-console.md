---
sidebar_title: 'SQLコンソール'
slug: /cloud/get-started/sql-console
description: 'SQLコンソールを使ってクエリを実行し、視覚化を作成します。'
keywords: ['sql console', 'sql client', 'cloud console', 'console']
title: 'SQLコンソール'
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

SQLコンソールは、ClickHouse Cloud内のデータベースを探索し、クエリを実行するための最も速く簡単な方法です。SQLコンソールを使用して以下のことができます：

- ClickHouse Cloud Servicesに接続する
- テーブルデータを表示、フィルタリング、およびソートする
- クエリを実行し、結果データをわずか数クリックで視覚化する
- チームメンバーとクエリを共有し、より効果的に協力する。

### テーブルの探索 {#exploring-tables}

### テーブルリストとスキーマ情報の表示 {#viewing-table-list-and-schema-info}

ClickHouseインスタンスに含まれるテーブルの概要は、左側のサイドバー領域にあります。左側バーの上部にあるデータベースセレクターを使用して、特定のデータベース内のテーブルを表示します。

<Image img={table_list_and_schema} size="md" alt='テーブルリストとスキーマ' />
リスト内のテーブルはカラムとタイプを表示するために展開することもできます。

<Image img={view_columns} size="md" alt='カラムを表示' />

### テーブルデータの探索 {#exploring-table-data}

リスト内のテーブルをクリックすると新しいタブで開きます。テーブルビューでは、データを簡単に表示、選択、コピーすることができます。Microsoft ExcelやGoogle Sheetsなどのスプレッドシートアプリケーションにコピー＆ペーストする際には、構造とフォーマットが保持されます。フッターのナビゲーションを使用して、30行ごとにページのテーブルデータを切り替えることができます。

<Image img={abc} size="md" alt='abc' />

### セルデータの検査 {#inspecting-cell-data}

セルインスペクターツールを使用すると、単一のセル内に格納されている大量のデータを表示できます。それを開くには、セルを右クリックし、「セルを検査」を選択します。セルインスペクタの内容は、インスペクタ内容の右上隅にあるコピーアイコンをクリックすることでコピーできます。

<Image img={inspecting_cell_content} size="md" alt='セル内容を検査' />

## テーブルのフィルタリングとソート {#filtering-and-sorting-tables}

### テーブルのソート {#sorting-a-table}

SQLコンソールでテーブルをソートするには、テーブルを開いてツールバーの「ソート」ボタンを選択します。このボタンをクリックすると、ソートを設定するためのメニューが開きます。ソートするカラムを選択し、ソートの順序（昇順または降順）を設定できます。「適用」を選択するか、Enterを押してテーブルをソートします。

<Image img={sort_descending_on_column} size="md" alt='カラムで降順ソート' />

SQLコンソールでは、テーブルに複数のソートを追加することもできます。ソートをもう一度追加するには、「ソート」ボタンをクリックします。

:::note
ソートは、ソートペインに表示される順序（上から下）で適用されます。ソートを削除するには、単にソートの隣にある「x」ボタンをクリックします。
:::

### テーブルのフィルタリング {#filtering-a-table}

SQLコンソールでテーブルをフィルタリングするには、テーブルを開いて「フィルタ」ボタンを選択します。ソートと同様に、このボタンをクリックするとフィルタを設定するためのメニューが開きます。フィルタリングに使用する列を選択し、必要な条件を選択できます。SQLコンソールは、自動的に列に格納されているデータのタイプに対応するフィルタオプションを表示します。

<Image img={filter_on_radio_column_equal_gsm} size="md" alt='GSMに等しいラジオカラムでフィルタ' />

フィルタに満足したら、「適用」を選択してデータをフィルタリングできます。以下のように追加のフィルタを追加することもできます。

<Image img={add_more_filters} size="md" alt='2000より大きい範囲でフィルタ追加' />

ソート機能と同様に、フィルタの隣にある「x」ボタンをクリックして削除できます。

### 同時にフィルタリングとソート {#filtering-and-sorting-together}

SQLコンソールでは、同時にテーブルをフィルタリングおよびソートできます。これを行うには、上記で説明した手順を使用して必要なフィルタとソートをすべて追加し、「適用」ボタンをクリックします。

<Image img={filtering_and_sorting_together} size="md" alt='2000より大きい範囲でフィルタ追加' />

### フィルタとソートからクエリを作成 {#creating-a-query-from-filters-and-sorts}

SQLコンソールは、フィルタとソートを直接クエリに変換できます。ツールバーから希望するフィルタとソートのパラメータを持つ「クエリを作成」ボタンを選択してください。「クエリを作成」をクリックすると、テーブルビューに含まれるデータに対応するSQLコマンドで事前に入力された新しいクエリタブが開きます。

<Image img={create_a_query_from_sorts_and_filters} size="md" alt='ソートとフィルタからクエリを作成' />

:::note
「クエリを作成」機能を使用する際、フィルタやソートは必須ではありません。
:::

SQLコンソールでのクエリの作成方法については、(link) クエリのドキュメントをお読みください。

## クエリの作成と実行 {#creating-and-running-a-query}

### クエリの作成 {#creating-a-query}

SQLコンソールで新しいクエリを作成する方法は2つあります。

- タブバーの「+」ボタンをクリックする
- 左側のサイドバーのクエリリストから「新しいクエリ」ボタンを選択する

<Image img={creating_a_query} size="md" alt='クエリを作成' />

### クエリの実行 {#running-a-query}

クエリを実行するには、SQLエディタにSQLコマンドを入力し、「実行」ボタンをクリックするか、ショートカット `cmd / ctrl + enter` を使用します。複数のコマンドを順番に記述・実行する場合は、各コマンドの後にセミコロンを追加してください。

クエリ実行オプション
デフォルトでは、実行ボタンをクリックすると、SQLエディタに含まれるすべてのコマンドが実行されます。SQLコンソールは他の2つのクエリ実行オプションもサポートしています：

- 選択したコマンドを実行
- カーソル位置でコマンドを実行

選択したコマンドを実行するには、希望のコマンドまたはコマンドのシーケンスをハイライトし、「実行」ボタンをクリックします（または `cmd / ctrl + enter` ショートカットを使用）。選択がある場合、SQLエディタのコンテキストメニュー（エディタ内の任意の場所を右クリックして開く）から「選択を実行」も選択できます。

<Image img={run_selected_query} size="md" alt='選択したクエリを実行' />

現在のカーソル位置でコマンドを実行するには、次の2つの方法があります：

- 拡張実行オプションメニューから「カーソルで」を選択します（または対応するショートカット `cmd / ctrl + shift + enter` を使用）

<Image img={run_at_cursor_2} size="md" alt='カーソルで実行' />

  - SQLエディタのコンテキストメニューから「カーソルで実行」を選択します。

<Image img={run_at_cursor} size="md" alt='カーソルで実行' />

:::note
カーソル位置にあるコマンドは実行時に黄色く点滅します。
:::

### クエリのキャンセル {#canceling-a-query}

クエリが実行中に、クエリエディタのツールバーにある「実行」ボタンは「キャンセル」ボタンに置き換えられます。このボタンをクリックするか、`Esc` を押すことでクエリをキャンセルできます。注意：キャンセル後にすでに返された結果は保持されます。

<Image img={cancel_a_query} size="md" alt='クエリをキャンセル' />

### クエリの保存 {#saving-a-query}

クエリを保存すると、後で簡単に見つけたり、チームメンバーと共有したりすることができます。SQLコンソールでは、クエリをフォルダに整理することもできます。

クエリを保存するには、ツールバーの「実行」ボタンのすぐ隣にある「保存」ボタンをクリックします。希望の名前を入力して「クエリを保存」をクリックします。

:::note
ショートカット `cmd / ctrl` + s を使用すると、現在のクエリタブ内の作業も保存できます。
:::

<Image img={sql_console_save_query} size="md" alt='クエリを保存' />

また、「無題のクエリ」のボタンをクリックして名前を調整し、Enterを押すことで、同時にクエリの名前を付けて保存することもできます。

<Image img={sql_console_rename} size="md" alt='クエリの名前を変更' />

### クエリの共有 {#query-sharing}

SQLコンソールでは、クエリをチームメンバーと簡単に共有できます。SQLコンソールは、グローバルにおよびユーザーごとに調整可能な4つのアクセスレベルをサポートします：

- オーナー（共有オプションを調整できる）
- 書き込みアクセス
- 読み取り専用アクセス
- アクセスなし

クエリを保存した後、ツールバーの「共有」ボタンをクリックします。共有オプションに関するモーダルが表示されます：

<Image img={sql_console_share} size="md" alt='クエリを共有' />

サービスへのアクセス権を持つすべての組織メンバーのクエリアクセスを調整するには、上部のアクセスレベルセレクターを調整します。

<Image img={sql_console_edit_access} size="md" alt='アクセスを編集' />

これを適用すると、クエリはそのサービスのSQLコンソールにアクセスできるすべてのチームメンバーによって表示（および実行）されるようになります。

特定のメンバーに対するクエリアクセスを調整するには、「チームメンバーを追加」セレクターから希望のチームメンバーを選択します：

<Image img={sql_console_add_team} size="md" alt='チームメンバーを追加' />

チームメンバーを選択すると、アクセスレベルセレクターを含む新しいアイテムが表示されます：

<Image img={sql_console_edit_member} size="md" alt='チームメンバーのアクセスを編集' />

### 共有クエリへのアクセス {#accessing-shared-queries}

クエリが共有されている場合、それはSQLコンソールの左側サイドバーの「クエリ」タブに表示されます：

<Image img={sql_console_access_queries} size="md" alt='クエリにアクセス' />

### クエリへのリンク（パーマリンク） {#linking-to-a-query-permalinks}

保存されたクエリはパーマリンクされており、共有クエリへのリンクを送受信し、直接開くことができます。

クエリに存在する可能性のあるパラメータの値は、自動的に保存されたクエリURLにクエリパラメータとして追加されます。たとえば、クエリに `{start_date: Date}` と `{end_date: Date}` パラメータが含まれている場合、パーマリンクは次のようになります：`https://console.clickhouse.cloud/services/:serviceId/console/query/:queryId?param_start_date=2015-01-01&param_end_date=2016-01-01`。

## 高度なクエリ機能 {#advanced-querying-features}

### クエリ結果の検索 {#searching-query-results}

クエリが実行された後、結果ペイン内の検索入力を使用して、返された結果セットを迅速に検索できます。この機能は、追加の `WHERE` 句の結果をプレビューしたり、特定のデータが結果セットに含まれているか確認するのに役立ちます。検索入力に値を入力すると、結果ペインが更新され、入力した値に一致するエントリを含むレコードが返されます。この例では、`hackernews` テーブルの `ClickHouse` を含むコメントのすべての `breakfast` インスタンスを探します。

<Image img={search_hn} size="md" alt='Hacker News データを検索' />

注意：入力した値に一致するフィールドはすべて返されます。たとえば、上のスクリーンショットの3番目のレコードは、`by` フィールドで「breakfast」と一致しませんが、`text` フィールドでは一致しています：

<Image img={match_in_body} size="md" alt='本文で一致' />

### ページネーション設定の調整 {#adjusting-pagination-settings}

デフォルトでは、クエリ結果ペインは単一ページにすべての結果レコードを表示します。大規模な結果セットでは、結果をページネートして視覚的にわかりやすくする方が好ましい場合があります。これは、結果ペインの右下隅にあるページネーションセレクターを使用して達成できます：

<Image img={pagination} size="md" alt='ページネーションオプション' />

ページサイズを選択すると、直ちに結果セットにページネーションが適用され、結果ペインのフッターの中央にナビゲーションオプションが表示されます。

<Image img={pagination_nav} size="md" alt='ページネーションナビゲーション' />

### クエリ結果データのエクスポート {#exporting-query-result-data}

クエリ結果セットは、SQLコンソールから直接CSV形式に簡単にエクスポートできます。それを行うには、結果ペインツールバーの右側にある `•••` メニューを開き、「CSVとしてダウンロード」を選択します。

<Image img={download_as_csv} size="md" alt='CSVとしてダウンロード' />

## クエリデータの視覚化 {#visualizing-query-data}

一部のデータは、チャート形式でより簡単に解釈できます。SQLコンソールからわずか数クリックでクエリ結果データから視覚化を作成できます。例として、NYCタクシーの週間統計を計算するクエリを使用します：

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

<Image img={tabular_query_results} size="md" alt='タブ形式のクエリ結果' />

視覚化なしでは、これらの結果を解釈するのは難しいです。チャートに変換してみましょう。

### チャートの作成 {#creating-charts}

視覚化を構築するには、クエリ結果ペインのツールバーから「チャート」オプションを選択します。チャート設定ペインが表示されます：

<Image img={switch_from_query_to_chart} size="md" alt='クエリからチャートへ切り替え' />

`trip_total` を `week` ごとに追跡するシンプルな棒グラフを作成します。これを実現するために、`week` フィールドをx軸に、`trip_total` フィールドをy軸にドラッグします：

<Image img={trip_total_by_week} size="md" alt='週ごとのトリップ合計' />

ほとんどのチャートタイプは、数値軸上に複数のフィールドをサポートしています。これを示すために、`fare_total` フィールドをy軸にドラッグします：

<Image img={bar_chart} size="md" alt='棒グラフ' />

### チャートのカスタマイズ {#customizing-charts}

SQLコンソールは、チャート設定ペイン内のチャートタイプセレクターから選択できる10種類のチャートタイプをサポートしています。たとえば、前のチャートタイプを棒グラフからエリアに簡単に変更できます：

<Image img={change_from_bar_to_area} size="md" alt='棒グラフからエリアへ変更' />

チャートのタイトルは、データを提供するクエリの名前と一致します。クエリの名前を更新すると、チャートのタイトルも更新されます：

<Image img={update_query_name} size="md" alt='クエリ名を更新' />

「詳細」セクションでは、より多くの高度なチャート特性も調整できます。最初に、以下の設定を調整します：

- サブタイトル
- 軸タイトル
- x軸のラベルの向き

チャートはそれに応じて更新されます：

<Image img={update_subtitle_etc} size="md" alt='サブタイトルなどを更新' />

場合によっては、各フィールドの軸スケールを独立して調整する必要があることもあります。これは、「詳細」セクションで、軸範囲の最小値と最大値を指定することによっても達成できます。たとえば、上のチャートは良いですが、`trip_total` と `fare_total` フィールド間の相関関係を示すために軸範囲を調整する必要があります：

<Image img={adjust_axis_scale} size="md" alt='軸スケールを調整' />
