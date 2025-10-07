---
'sidebar_title': 'SQL Console'
'slug': '/cloud/get-started/sql-console'
'description': 'クエリを実行し、SQL コンソールを使用してビジュアライゼーションを作成します。'
'keywords':
- 'sql console'
- 'sql client'
- 'cloud console'
- 'console'
'title': 'SQL コンソール'
'doc_type': 'guide'
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

SQLコンソールは、ClickHouse Cloudでデータベースを探索し、クエリを実行する最も速く、簡単な方法です。SQLコンソールを使用して以下のことができます。

- ClickHouse Cloudサービスに接続する
- テーブルデータを表示、フィルタリング、ソートする
- クエリを実行し、結果データをわずか数クリックで視覚化する
- クエリをチームメンバーと共有し、より効果的にコラボレーションする

### テーブルの探索 {#exploring-tables}

### テーブルリストとスキーマ情報の表示 {#viewing-table-list-and-schema-info}

ClickHouseインスタンスに含まれるテーブルの概要は、左のサイドバーに表示されます。左バーの上部にあるデータベースセレクターを使用して、特定のデータベース内のテーブルを表示します。

<Image img={table_list_and_schema} size="md" alt='テーブルリストとスキーマ' />
リスト内のテーブルは、カラムやタイプを表示するために展開することもできます。

<Image img={view_columns} size="md" alt='カラムを見る' />

### テーブルデータの探索 {#exploring-table-data}

リスト内のテーブルをクリックすると、新しいタブで開きます。テーブルビューでは、データを簡単に表示、選択、およびコピーできます。Microsoft ExcelやGoogle Sheetsなどのスプレッドシートアプリケーションにコピー＆ペーストすると構造やフォーマットが保持されることに注意してください。フッターのナビゲーションを使用して、テーブルデータのページを切り替えられます（30行ごとにページ分け）。

<Image img={abc} size="md" alt='abc' />

### セルデータの検査 {#inspecting-cell-data}

セルインスペクターツールを使用して、単一のセルに含まれる大量のデータを表示できます。これを開くには、セルを右クリックして「セルを検査」を選択します。セルインスペクターの内容は、インスペクターの内容の右上隅にあるコピーアイコンをクリックすることでコピーできます。

<Image img={inspecting_cell_content} size="md" alt='セルの内容を検査' />

## テーブルのフィルタリングとソート {#filtering-and-sorting-tables}

### テーブルのソート {#sorting-a-table}

SQLコンソールでテーブルをソートするには、テーブルを開き、ツールバーにある「ソート」ボタンを選択します。このボタンをクリックすると、ソートを設定できるメニューが開きます。ソートの基準となるカラムを選択し、ソートの順序（昇順または降順）を設定できます。「適用」を選択するか、Enterを押してテーブルをソートします。

<Image img={sort_descending_on_column} size="md" alt='カラムの降順でソート' />

SQLコンソールでは、複数のソートをテーブルに追加することもできます。再度「ソート」ボタンをクリックして、別のソートを追加します。

:::note
ソートは、ソートペインに表示される順序（上から下）で適用されます。ソートを削除するには、単にソートの横にある「x」ボタンをクリックしてください。
:::

### テーブルのフィルタリング {#filtering-a-table}

SQLコンソールでテーブルをフィルタリングするには、テーブルを開き、「フィルター」ボタンを選択します。ソートと同様に、このボタンをクリックするとフィルターを設定できるメニューが開きます。フィルタリングするカラムを選択し、必要な基準を選択します。SQLコンソールは、カラムに含まれるデータのタイプに応じたフィルターオプションをインテリジェントに表示します。

<Image img={filter_on_radio_column_equal_gsm} size="md" alt='GSMに等しいラジオカラムでフィルター' />

フィルターに満足したら、「適用」を選択してデータをフィルタリングできます。以下のように追加のフィルターを加えることもできます。

<Image img={add_more_filters} size="md" alt='2000より大きい範囲でフィルターを追加' />

ソート機能と同様に、「x」ボタンをフィルターの横にクリックして削除できます。

### フィルタリングとソートを同時に行う {#filtering-and-sorting-together}

SQLコンソールでは、テーブルを同時にフィルタリングおよびソートすることができます。これを行うには、上記のステップを使用して、必要なフィルターとソートをすべて追加し、「適用」ボタンをクリックします。

<Image img={filtering_and_sorting_together} size="md" alt='2000より大きい範囲でフィルターを追加' />

### フィルターとソートからクエリを作成する {#creating-a-query-from-filters-and-sorts}

SQLコンソールは、フィルターとソートをワンクリックで直接クエリに変換できます。ツールバーから目的のソートおよびフィルター設定で「クエリを作成」ボタンを選択するだけです。「クエリを作成」をクリックすると、新しいクエリタブが開き、テーブルビューに含まれるデータに対応するSQLコマンドが事前に入力されます。

<Image img={create_a_query_from_sorts_and_filters} size="md" alt='フィルターとソートからクエリを作成' />

:::note
「クエリを作成」機能を使用する際、フィルターやソートは必須ではありません。
:::

SQLコンソールでのクエリ作成については、(link)クエリに関するドキュメントを読むことで詳しく学べます。

## クエリの作成と実行 {#creating-and-running-a-query}

### クエリの作成 {#creating-a-query}

SQLコンソールで新しいクエリを作成するには、2つの方法があります。

- タブバーの「+」ボタンをクリック
- 左側のサイドバーのクエリリストから「新しいクエリ」ボタンを選択

<Image img={creating_a_query} size="md" alt='クエリの作成' />

### クエリの実行 {#running-a-query}

クエリを実行するには、SQLエディターにSQLコマンドを入力し、「実行」ボタンをクリックするか、ショートカット `cmd / ctrl + enter` を使用します。複数のコマンドを連続して記述し実行するには、各コマンドの後にセミコロンを追加してください。

クエリ実行オプション
デフォルトでは、実行ボタンをクリックするとSQLエディターに含まれるすべてのコマンドが実行されます。SQLコンソールは、以下の2つのクエリ実行オプションもサポートしています。

- 選択したコマンドの実行
- カーソル位置のコマンドを実行

選択したコマンドを実行するには、希望するコマンドまたはコマンドのシーケンスを強調表示し、「実行」ボタンをクリックします（または `cmd / ctrl + enter` ショートカットを使用）。選択がある場合は、SQLエディターのコンテキストメニュー（エディター内で右クリックすると開きます）から「選択したものを実行」を選ぶこともできます。

<Image img={run_selected_query} size="md" alt='選択したクエリを実行' />

現在のカーソル位置でコマンドを実行するには、以下の2つの方法があります。

- 拡張実行オプションメニューから「カーソルで実行」を選択（または対応するショートカット `cmd / ctrl + shift + enter` を使用）

<Image img={run_at_cursor_2} size="md" alt='カーソルで実行' />

- SQLエディターのコンテキストメニューから「カーソルで実行」を選択

<Image img={run_at_cursor} size="md" alt='カーソルで実行' />

:::note
カーソル位置にあるコマンドは実行時に黄色に点滅します。
:::

### クエリのキャンセル {#canceling-a-query}

クエリが実行中の間、クエリエディターのツールバーの「実行」ボタンは「キャンセル」ボタンに置き換えられます。このボタンをクリックするか、`Esc`を押してクエリをキャンセルしてください。注意：すでに返された結果はキャンセル後も保持されます。

<Image img={cancel_a_query} size="md" alt='クエリのキャンセル' />

### クエリの保存 {#saving-a-query}

クエリを保存することで、後で簡単に見つけたり、チームメンバーと共有したりできます。SQLコンソールでは、クエリをフォルダーに整理することもできます。

クエリを保存するには、ツールバーの「実行」ボタンのすぐ隣にある「保存」ボタンをクリックします。 원하는名前を入力し、「クエリを保存」をクリックします。

:::note
ショートカット `cmd / ctrl + s` を使用すると、現在のクエリタブ内の作業も保存されます。
:::

<Image img={sql_console_save_query} size="md" alt='クエリを保存' />

また、ツールバーの「無題のクエリ」をクリックして名前を調整し、Enterを押すことで同時にクエリの名前を変更して保存できます：

<Image img={sql_console_rename} size="md" alt='クエリの名前を変更' />

### クエリの共有 {#query-sharing}

SQLコンソールでは、クエリをチームメンバーと簡単に共有できます。SQLコンソールは、グローバルおよびユーザー別に調整できる4つのアクセスレベルをサポートしています。

- オーナー（共有オプションを調整可能）
- 書き込みアクセス
- 読み取り専用アクセス
- アクセスなし

クエリを保存した後、ツールバーの「共有」ボタンをクリックします。共有オプションが表示されるモーダルが表示されます：

<Image img={sql_console_share} size="md" alt='クエリを共有' />

サービスへのアクセスを持つすべての組織メンバーのクエリアクセスを調整するには、上部のアクセスレベルセレクターを調整するだけです：

<Image img={sql_console_edit_access} size="md" alt='アクセスを編集' />

上記を適用した後、サービスのSQLコンソールにアクセスできるすべてのチームメンバーは、今後このクエリを表示（および実行）できるようになります。

特定のメンバーのクエリアクセスを調整するには、「チームメンバーを追加」セレクターから希望するチームメンバーを選択します：

<Image img={sql_console_add_team} size="md" alt='チームメンバーを追加' />

チームメンバーを選択すると、新たにアクセスレベルセレクターが表示されます：

<Image img={sql_console_edit_member} size="md" alt='チームメンバーのアクセスを編集' />

### 共有クエリへのアクセス {#accessing-shared-queries}

クエリがあなたに共有された場合、それはSQLコンソールの左サイドバーの「クエリ」タブに表示されます：

<Image img={sql_console_access_queries} size="md" alt='クエリにアクセス' />

### クエリへのリンク（パーマリンク） {#linking-to-a-query-permalinks}

保存されたクエリにはパーマリンクが付与されているため、共有クエリへのリンクを送信および受信し、直接開くことができます。

クエリ内に存在する可能性のあるパラメーターの値は、自動的に保存されたクエリURLにクエリパラメータとして追加されます。例えば、クエリが `{start_date: Date}` と `{end_date: Date}` パラメータを含む場合、パーマリンクは次のようになります: `https://console.clickhouse.cloud/services/:serviceId/console/query/:queryId?param_start_date=2015-01-01&param_end_date=2016-01-01`。

## 高度なクエリ機能 {#advanced-querying-features}

### クエリ結果の検索 {#searching-query-results}

クエリが実行された後、結果ペインの検索入力を使用して返された結果セットを迅速に検索できます。この機能は、追加の `WHERE` 句の結果をプレビューしたり、特定のデータが結果セットに含まれていることを確認したりするのに役立ちます。検索入力に値を入力すると、結果ペインが更新され、入力値に一致するレコードが返されます。この例では、「ClickHouse」を含むコメントの `hackernews` テーブル内の `breakfast` のすべてのインスタンスを探します（大文字と小文字を区別しない）：

<Image img={search_hn} size="md" alt='Hacker Newsデータを検索' />

注意：入力値に一致する任意のフィールドが返されます。例えば、上のスクリーンショットの3番目のレコードは`by`フィールドで「breakfast」に一致しませんが、`text`フィールドには一致します：

<Image img={match_in_body} size="md" alt='ボディに一致' />

### ページネーション設定の調整 {#adjusting-pagination-settings}

デフォルトでは、クエリ結果ペインはすべての結果レコード를単一のページに表示します。大きな結果セットの場合、結果をページングして簡単に表示できるようにする方が望ましいことがあります。これは、結果ペインの右下コーナーにあるページネーションセレクターを使用して実行できます：

<Image img={pagination} size="md" alt='ページネーションオプション' />

ページサイズを選択すると、すぐに結果セットにページネーションが適用され、結果ペインのフッターの中央にナビゲーションオプションが表示されます。

<Image img={pagination_nav} size="md" alt='ページネーションナビゲーション' />

### クエリ結果データのエクスポート {#exporting-query-result-data}

クエリ結果セットは、SQLコンソールから直接CSV形式で簡単にエクスポートできます。これを行うには、結果ペインツールバーの右側にある `•••` メニューを開き、「CSVとしてダウンロード」を選択します。

<Image img={download_as_csv} size="md" alt='CSVとしてダウンロード' />

## クエリデータの視覚化 {#visualizing-query-data}

一部のデータは、チャート形式でより簡単に解釈できます。SQLコンソールからクエリ結果データの視覚化を数回のクリックで迅速に作成できます。例えば、NYCタクシーの週ごとの統計を計算するクエリを使用します：

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

<Image img={tabular_query_results} size="md" alt='表形式のクエリ結果' />

視覚化なしでは、これらの結果は解釈が難しいです。これらをチャートに変えてみましょう。

### チャートの作成 {#creating-charts}

視覚化の構築を開始するには、結果ペインツールバーから「チャート」オプションを選択します。チャート設定ペインが表示されます：

<Image img={switch_from_query_to_chart} size="md" alt='クエリからチャートに切り替える' />

`週` ごとの `trip_total` を追跡するシンプルな棒グラフを作成します。これを実現するために、`week` フィールドを x 軸に、`trip_total` フィールドを y 軸にドラッグします：

<Image img={trip_total_by_week} size="md" alt='週ごとの合計金額' />

ほとんどのチャートタイプは、数値軸上に複数のフィールドをサポートしています。これを示すために、`fare_total` フィールドを y 軸にドラッグします：

<Image img={bar_chart} size="md" alt='棒グラフ' />

### チャートのカスタマイズ {#customizing-charts}

SQLコンソールは、チャート設定ペインのチャートタイプセレクターから選択できる10種類のチャートタイプをサポートしています。例えば、前のチャートタイプをバーからエリアに簡単に変更できます：

<Image img={change_from_bar_to_area} size="md" alt='バーからエリアチャートに変更' />

チャートタイトルは、データを提供するクエリの名前に一致します。クエリ名を更新するとチャートタイトルも更新されます：

<Image img={update_query_name} size="md" alt='クエリ名を更新' />

チャート設定ペインの「高度な」セクションでは、さらに多くの高度なチャート特性を調整できます。まずは、以下の設定を調整します：

- サブタイトル
- 軸タイトル
- x 軸のラベルの向き

私たちのチャートはそれに応じて更新されます：

<Image img={update_subtitle_etc} size="md" alt='サブタイトルなどを更新' />

特定のシナリオでは、各フィールドの軸スケールを独立して調整する必要があります。これは、「高度な」セクションで軸範囲の最小値と最大値を指定することによっても実行できます。例えば、上記のチャートは見栄えが良いですが、`trip_total` と `fare_total` フィールドの相関を示すには、軸範囲を調整する必要があります：

<Image img={adjust_axis_scale} size="md" alt='軸スケールを調整' />
