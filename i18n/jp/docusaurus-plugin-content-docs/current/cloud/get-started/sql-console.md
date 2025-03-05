---
sidebar_title: SQLコンソール
slug: /cloud/get-started/sql-console
description: SQLコンソールを使用してクエリを実行し、視覚化を作成します。
keywords: [sql console, sql client, cloud console, console]
---

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

SQLコンソールは、ClickHouse Cloud内のデータベースを探索し、クエリを実行するための最も迅速かつ簡単な方法です。SQLコンソールを使用すると、次のことができます。

- ClickHouse Cloud Servicesに接続する
- テーブルデータを表示、フィルタリング、ソートする
- クエリを実行し、結果データを数回のクリックで視覚化する
- クエリをチームメンバーと共有し、より効果的にコラボレーションする。

### テーブルの探索 {#exploring-tables}

### テーブルリストとスキーマ情報の表示 {#viewing-table-list-and-schema-info}

ClickHouseインスタンスに含まれるテーブルの概要は、左のサイドバーに表示されます。左のバーの上部にあるデータベースセレクターを使用して、特定のデータベース内のテーブルを表示できます。

<img src={table_list_and_schema} alt="テーブルリストとスキーマ"/>

リスト内のテーブルは展開してカラムとタイプを表示することもできます。

<img src={view_columns} alt="カラムの表示"/>

### テーブルデータの探索 {#exploring-table-data}

リスト内のテーブルをクリックすると、新しいタブで開きます。テーブルビューでは、データを簡単に表示、選択、コピーできます。Microsoft ExcelやGoogle Sheetsなどのスプレッドシートアプリケーションにコピー＆ペーストするときに、構造とフォーマッティングが保持されることに注意してください。フッターのナビゲーションを使用して、テーブルデータのページを切り替えることができます（30行単位でページネーションされています）。

<img src={abc} alt="abc"/>

### セルデータの検査 {#inspecting-cell-data}

Cell Inspectorツールを使用すると、単一のセル内に含まれる大量のデータを表示できます。それを開くには、セルを右クリックし、「セルを検査」を選択します。セルインスペクタの内容は、インスペクタの内容の右上隅にあるコピーアイコンをクリックすることでコピーできます。

<img src={inspecting_cell_content} alt="セル内容の検査"/>

## テーブルのフィルタリングとソート {#filtering-and-sorting-tables}

### テーブルのソート {#sorting-a-table}

SQLコンソールでテーブルをソートするには、テーブルを開いてツールバーの「ソート」ボタンを選択します。このボタンをクリックすると、ソートの設定を行うためのメニューが開きます。ソートしたいカラムを選択し、ソートの順序（昇順または降順）を設定できます。 「適用」を選択するか、Enterを押してテーブルをソートします。

<img src={sort_descending_on_column} alt="カラムで降順にソート"/>

SQLコンソールでは、テーブルに複数のソートを追加することもできます。もう一度「ソート」ボタンをクリックして別のソートを追加します。

:::note
ソートは、ソートペインに表示されている順序（上から下）で適用されます。ソートを削除するには、単にソートの隣にある「x」ボタンをクリックします。
:::

### テーブルのフィルタリング {#filtering-a-table}

SQLコンソールでテーブルをフィルタリングするには、テーブルを開いて「フィルタ」ボタンを選択します。ソートと同様に、このボタンをクリックするとフィルタ設定のためのメニューが開きます。フィルタリングするカラムを選択し、必要な基準を選びます。SQLコンソールは、カラムに含まれるデータタイプに対応するフィルタオプションをインテリジェントに表示します。

<img src={filter_on_radio_column_equal_gsm} alt="GSMに等しいラジオカラムでフィルタ"/>

フィルタが満足できるものであれば、「適用」を選択してデータをフィルタリングできます。以下に示すように、追加のフィルタを追加することもできます。

<img src={add_more_filters} alt="2000より大きい範囲でフィルタ追加"/>

ソート機能と同様に、フィルタの隣にある「x」ボタンをクリックして削除できます。

### フィルタリングとソートの併用 {#filtering-and-sorting-together}

SQLコンソールでは、テーブルを同時にフィルタリングおよびソートすることができます。これを行うには、上記で説明した手順を使用して希望するすべてのフィルタとソートを追加し、「適用」ボタンをクリックします。

<img src={filtering_and_sorting_together} alt="フィルタリングとソートの併用"/>

### フィルタとソートからクエリを作成 {#creating-a-query-from-filters-and-sorts}

SQLコンソールでは、フィルタとソートを1クリックでクエリに変換できます。「クエリを作成」ボタンをツールバーのフィルタとソートのパラメータで選択してください。 「クエリを作成」をクリックすると、新しいクエリタブが開き、テーブルビューに含まれるデータに対応するSQLコマンドで事前に設定されます。

<img src={create_a_query_from_sorts_and_filters} alt="フィルタとソートからクエリを作成"/>

:::note
「クエリを作成」機能を使用する際に、フィルタとソートは必須ではありません。
:::

SQLコンソールでのクエリ作成については、(link)クエリドキュメントを読んでさらに学ぶことができます。

## クエリの作成と実行 {#creating-and-running-a-query}

### クエリの作成 {#creating-a-query}

SQLコンソールで新しいクエリを作成する方法は2つあります。

- タブバーの「+」ボタンをクリックする
- 左のサイドバーのクエリリストから「新しいクエリ」ボタンを選択する

<img src={creating_a_query} alt="クエリの作成"/>

### クエリの実行 {#running-a-query}

クエリを実行するには、SQLエディタにSQLコマンドを入力し、「実行」ボタンをクリックするか、ショートカット `cmd / ctrl + enter` を使用します。複数のコマンドを順次書いて実行するには、各コマンドの後にセミコロンを追加してください。

クエリ実行オプション
デフォルトでは、実行ボタンをクリックすると、SQLエディタ内に含まれるすべてのコマンドが実行されます。SQLコンソールでは、他に2つのクエリ実行オプションがサポートされています：

- 選択したコマンドを実行
- カーソル位置のコマンドを実行

選択したコマンドを実行するには、希望するコマンドまたはコマンドのシーケンスを強調表示し、「実行」ボタンをクリックします（または `cmd / ctrl + enter` ショートカットを使用）。選択がある場合は、SQLエディタのコンテキストメニュー（エディタ内の任意の場所を右クリックして開く）から「選択したものを実行」を選択することもできます。

<img src={run_selected_query} alt="選択したクエリを実行"/>

現在のカーソル位置でコマンドを実行するには、次の2つの方法があります：

- 拡張実行オプションメニューから「カーソル位置で実行」を選択します（または対応する `cmd / ctrl + shift + enter` キーボードショートカットを使用）

<img src={run_at_cursor_2} alt="カーソル位置で実行"/>

  - SQLエディタのコンテキストメニューから「カーソル位置で実行」を選択する

<img src={run_at_cursor} alt="カーソル位置で実行"/>

:::note
カーソル位置にあるコマンドは、実行時に黄色に点滅します。
:::

### クエリのキャンセル {#canceling-a-query}

クエリが実行中の間、クエリエディタツールバーの「実行」ボタンは「キャンセル」ボタンに置き換わります。このボタンをクリックするか、`Esc` を押すことでクエリをキャンセルできます。注：すでに返された結果は、キャンセル後も残ります。

<img src={cancel_a_query} alt="クエリのキャンセル"/>

### クエリの保存 {#saving-a-query}

クエリを保存すると、後で簡単に見つけてチームメイトと共有できます。SQLコンソールでは、クエリをフォルダーに整理することもできます。

クエリを保存するには、ツールバーの「実行」ボタンのすぐ隣にある「保存」ボタンをクリックします。希望する名前を入力し、「クエリを保存」をクリックします。

:::note
ショートカット `cmd / ctrl + s` を使用すると、現在のクエリタブ内の作業も保存されます。
:::

<img src={sql_console_save_query} alt="クエリを保存"/>

また、ツールバーの「無題のクエリ」をクリックし、名前を調整してからEnterを押すことで、同時にクエリの名前を付けて保存できます：
<img src={sql_console_rename} alt="クエリをリネーム"/>

### クエリの共有 {#query-sharing}

SQLコンソールでは、クエリをチームメンバーと簡単に共有できます。SQLコンソールは、グローバルおよびユーザーごとに調整可能な4つのアクセスレベルをサポートしています：

- オーナー（共有オプションを調整できます）
- 書き込みアクセス
- 読み取り専用アクセス
- アクセスなし

クエリを保存した後、ツールバーの「共有」ボタンをクリックします。共有オプションを含むモーダルが表示されます：

<img src={sql_console_share} alt="クエリを共有"/>

共有サービスへのアクセス権を持つすべての組織メンバーのクエリアクセスを調整するには、上部のアクセシビリティレベルセレクターを調整します：

<img src={sql_console_edit_access} alt="アクセスを編集"/>

上記を適用すると、そのクエリはサービスのSQLコンソールにアクセスできるすべてのチームメンバーが表示（および実行）できるようになります。

特定のメンバーに対するクエリアクセスを調整するには、「チームメンバーを追加」セレクターから希望するチームメンバーを選択します：

<img src={sql_console_add_team} alt="チームメンバーを追加"/>

チームメンバーを選択すると、アクセスレベルセレクタを含む新しいアイテムが表示されるはずです：

<img src={sql_console_edit_member} alt="チームメンバーのアクセスを編集"/>

### 共有クエリへのアクセス {#accessing-shared-queries}

クエリが共有されている場合は、SQLコンソールの左サイドバーの「クエリ」タブに表示されます：

<img src={sql_console_access_queries} alt="クエリにアクセス"/>

### クエリへのリンク（パーマリンク） {#linking-to-a-query-permalinks}

保存されたクエリはパーマリンクされており、共有クエリにリンクを送受信し、直接オープンできます。

クエリ内に存在する可能性のあるパラメーターの値は、保存されたクエリのURLにクエリパラメーターとして自動的に追加されます。たとえば、クエリが `{start_date: Date}` および `{end_date: Date}` パラメーターを含む場合、パーマリンクは次のようになります：`https://console.clickhouse.cloud/services/:serviceId/console/query/:queryId?param_start_date=2015-01-01&param_end_date=2016-01-01`。

## 高度なクエリ機能 {#advanced-querying-features}

### クエリ結果の検索 {#searching-query-results}

クエリが実行された後、結果ペイン内の検索入力を使用して、返された結果セットを迅速に検索できます。この機能は、追加の `WHERE` 句の結果をプレビューしたり、特定のデータが結果セットに含まれていることを確認するのに役立ちます。検索入力に値を入力すると、結果ペインが更新され、入力された値と一致するエントリーを含むレコードが返されます。この例では、`hackernews` テーブル内の `ClickHouse` を含むコメントの `breakfast` のすべてのインスタンスを探します。

<img src={search_hn} alt="Hacker Newsデータを検索"/>

注：入力された値に一致するフィールドはすべて返されます。たとえば、上のスクリーンショットの3番目のレコードは`by`フィールドで `breakfast` に一致しませんが、`text` フィールドでは一致します：

<img src={match_in_body} alt="本文で一致"/>

### ページネーション設定の調整 {#adjusting-pagination-settings}

デフォルトでは、クエリ結果ペインはすべての結果レコードを1つのページに表示します。大きな結果セットの場合、結果をページネートすることで、より簡単に表示できることもあります。これは、結果ペインの右下隅にあるページネーションセレクターを使用して行うことができます：

<img src={pagination} alt="ページネーションオプション"/>

ページサイズを選択すると、すぐに結果セットにページネーションが適用され、結果ペインのフッターの中央にナビゲーションオプションが表示されます。

<img src={pagination_nav} alt="ページネーションナビゲーション"/>

### クエリ結果データのエクスポート {#exporting-query-result-data}

クエリ結果セットは、SQLコンソールから直接CSV形式に簡単にエクスポートできます。そのためには、結果ペインツールバーの右側にある `•••` メニューを開き、「CSVとしてダウンロード」を選択します。

<img src={download_as_csv} alt="CSVとしてダウンロード"/>

## クエリデータの視覚化 {#visualizing-query-data}

一部のデータは、グラフ形式でより簡単に解釈できます。SQLコンソールからクエリ結果データから視覚化をすばやく作成できます。たとえば、NYCタクシーの週間統計を計算するクエリを使用します。

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

<img src={tabular_query_results} alt="テーブル形式のクエリ結果"/>

視覚化なしでは、これらの結果は解釈が難しいです。これらをグラフに変換しましょう。

### グラフの作成 {#creating-charts}

視覚化を構築するには、クエリ結果ペインツールバーから「グラフ」オプションを選択します。グラフ設定ペインが表示されます：

<img src={switch_from_query_to_chart} alt="クエリからグラフに切り替え"/>

`trip_total` を `week` 別に追跡する単純な棒グラフを作成します。これを達成するために、`week` フィールドをx軸に、`trip_total` フィールドをy軸にドラッグします。

<img src={trip_total_by_week} alt="週別の総旅行数"/>

ほとんどのグラフタイプは数値軸に対して複数のフィールドをサポートしています。例として、`fare_total` フィールドをy軸にドラッグします。

<img src={bar_chart} alt="棒グラフ"/>

### グラフのカスタマイズ {#customizing-charts}

SQLコンソールでは、グラフタイプセレクターから選択できる10種類のグラフタイプがサポートされています。たとえば、前のグラフタイプを棒グラフからエリアに簡単に変更できます：

<img src={change_from_bar_to_area} alt="棒グラフからエリアに変更"/>

グラフのタイトルは、データを提供するクエリの名前と一致します。クエリの名前を更新すると、グラフタイトルも更新されます。

<img src={update_query_name} alt="クエリ名を更新"/>

多くのより高度なグラフ特性も、グラフ設定ペインの「高度な」セクションで調整できます。まず、次の設定を調整します：

- サブタイトル
- 軸タイトル
- x軸のラベルの向き

それに応じて、グラフが更新されます。

<img src={update_subtitle_etc} alt="サブタイトル等を更新"/>

状況によっては、各フィールドの軸スケールを独立して調整する必要がある場合があります。これは、軸の範囲に対して最小値と最大値を指定することで、「高度な」セクションで実現できます。例として、上のグラフは見た目が良いですが、`trip_total` と `fare_total` フィールド間の相関関係をデモするために、軸範囲を調整する必要があります：

<img src={adjust_axis_scale} alt="軸スケールを調整"/>
