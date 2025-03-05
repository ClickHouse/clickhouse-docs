---
sidebar_label: SQLコンソール
sidebar_position: 1
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
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
import give_a_query_a_name from '@site/static/images/cloud/sqlconsole/give-a-query-a-name.png';
import save_the_query from '@site/static/images/cloud/sqlconsole/save-the-query.png';


# SQLコンソール

SQLコンソールは、ClickHouse Cloudのデータベースを探索し、クエリを実行する最速かつ最も簡単な方法です。SQLコンソールを使用して、以下の操作を行うことができます：

- ClickHouse Cloud Servicesに接続する
- テーブルデータを表示、フィルタリング、およびソートする
- クエリを実行し、結果データを数回のクリックで視覚化する
- チームメンバーとクエリを共有し、より効果的にコラボレーションする

## テーブルを探索する {#exploring-tables}

### テーブル一覧とスキーマ情報の表示 {#viewing-table-list-and-schema-info}

ClickHouseインスタンスに含まれるテーブルの概要は、左側のサイドバーエリアで確認できます。左側のバーの上部にあるデータベースセレクタを使用して、特定のデータベース内のテーブルを表示してください。

<img src={table_list_and_schema} alt="テーブル一覧とスキーマ"/>

リスト内のテーブルを展開して、カラムやタイプを表示することもできます。

<img src={view_columns} alt="カラムを表示"/>

### テーブルデータの探索 {#exploring-table-data}

リスト内のテーブルをクリックすると、新しいタブで開きます。テーブルビューでは、データを簡単に表示、選択、およびコピーできます。Microsoft ExcelやGoogle Sheetsなどのスプレッドシートアプリケーションにコピー＆ペーストする際には、構造とフォーマットが保持されることに注意してください。ページネーションを使用して、テーブルデータのページを移動できます（30行ずつの増分で表示）。

<img src={abc} alt="abc"/>

### セルデータの検査 {#inspecting-cell-data}

セルインスペクターツールを使って、単一のセル内にある大量のデータを表示できます。これを開くには、セルを右クリックし、「セルを検査」を選択します。セルインスペクターの内容は、インスペクターの右上隅にあるコピーアイコンをクリックすることでコピー可能です。

<img src={inspecting_cell_content} alt="セルの内容を検査"/>

## テーブルのフィルタリングとソート {#filtering-and-sorting-tables}

### テーブルのソート {#sorting-a-table}

SQLコンソールでテーブルをソートするには、テーブルを開き、ツールバーの「ソート」ボタンを選択します。このボタンをクリックすると、ソートを構成するためのメニューが開きます。ソートするカラムを選択し、ソートの順序（昇順または降順）を構成できます。「適用」を選択するか、Enterキーを押してテーブルをソートしてください。

<img src={sort_descending_on_column} alt="カラムで降順ソート"/>

SQLコンソールでは、テーブルに複数のソートを追加することも可能です。もう一度「ソート」ボタンをクリックして、別のソートを追加します。注意：ソートは、ソートペインに表示される順序（上から下）で適用されます。ソートを削除するには、単にソートの横にある「x」ボタンをクリックします。

### テーブルのフィルタリング {#filtering-a-table}

SQLコンソールでテーブルをフィルタリングするには、テーブルを開き、「フィルター」ボタンを選択します。ソートと同じように、このボタンをクリックすると、フィルターを構成するためのメニューが開きます。フィルタリングするカラムを選択し、必要な条件を選びます。SQLコンソールは、カラムに含まれるデータのタイプに応じて、インテリジェントにフィルターオプションを表示します。

<img src={filter_on_radio_column_equal_gsm} alt="GSMに等しいラジオ列でフィルタ"/>

フィルターが満足のいくものであれば、「適用」を選択してデータをフィルタリングできます。また、以下の方法で追加のフィルターを追加することもできます。

<img src={add_more_filters} alt="2000より大きい範囲のフィルタを追加"/>

ソート機能と同様に、フィルターの横にある「x」ボタンをクリックして削除できます。

### フィルタリングとソートの併用 {#filtering-and-sorting-together}

SQLコンソールでは、テーブルを同時にフィルタリングおよびソートすることができます。これを行うには、上記の手順を使用してすべての希望するフィルターとソートを追加し、「適用」ボタンをクリックします。

<img src={filtering_and_sorting_together} alt="フィルタリングとソートの併用"/>

### フィルターとソートからクエリを作成する {#creating-a-query-from-filters-and-sorts}

SQLコンソールでは、ソートとフィルターをクエリに直接変換できます。希望するソートおよびフィルターのパラメータを選択し、ツールバーから「クエリを作成」ボタンを選択してください。「クエリの作成」をクリックすると、テーブルビューに含まれるデータに対応したSQLコマンドが事前に入力された新しいクエリタブが開きます。

<img src={create_a_query_from_sorts_and_filters} alt="フィルタとソートからクエリを作成"/>

:::note
「クエリを作成」機能を使用する際にフィルターとソートは必須ではありません。
:::

SQLコンソールでのクエリ作成の詳細については、(link) クエリのドキュメンテーションをお読みください。

## クエリの作成と実行 {#creating-and-running-a-query}

### クエリの作成 {#creating-a-query}

SQLコンソールで新しいクエリを作成する方法は二つあります。

- タブバーの「＋」ボタンをクリックする
- 左側のサイドバーのクエリリストから「新しいクエリ」ボタンを選択する

<img src={creating_a_query} alt="クエリを作成中"/>

### クエリの実行 {#running-a-query}

クエリを実行するには、SQLエディタにSQLコマンドを入力し、「実行」ボタンをクリックするか、ショートカットの `cmd / ctrl + enter` を使用します。複数のコマンドを連続して書いて実行する場合は、それぞれのコマンドの後にセミコロンを追加してください。

クエリ実行オプション
デフォルトでは、実行ボタンをクリックすると、SQLエディタに含まれるすべてのコマンドが実行されます。SQLコンソールでは、他に二つのクエリ実行オプションがサポートされています：

- 選択したコマンドを実行
- カーソルでコマンドを実行

選択したコマンドを実行するには、希望するコマンドまたはコマンドのシーケンスをハイライトし、「実行」ボタンをクリックします（または `cmd / ctrl + enter` ショートカットを使用します）。選択が存在する場合、SQLエディタのコンテキストメニュー（エディタ内の任意の位置を右クリックして開く）から「選択したコマンドを実行」を選択することもできます。

<img src={run_selected_query} alt="選択したクエリを実行"/>

現在のカーソル位置でコマンドを実行するには、二つの方法があります：

- 拡張実行オプションメニューから「カーソルで実行」を選択する（または対応する `cmd / ctrl + shift + enter` キーボードショートカットを使用します）

<img src={run_at_cursor_2} alt="カーソルで実行"/>

- SQLエディタのコンテキストメニューから「カーソルで実行」を選択する

<img src={run_at_cursor} alt="カーソルで実行"/>

:::note
カーソル位置にあるコマンドは、実行時に黄色に点滅します。
:::

### クエリのキャンセル {#canceling-a-query}

クエリが実行中は、クエリエディタツールバーの「実行」ボタンが「キャンセル」ボタンに置き換えられます。このボタンをクリックするか `Esc` を押すことでクエリをキャンセルできます。注意：キャンセル後も、すでに返された結果は保持されます。

<img src={cancel_a_query} alt="クエリをキャンセル"/>

### クエリの保存 {#saving-a-query}

まだ名前が付けられていない場合、クエリは「タイトル未設定のクエリ」と呼ばれるべきです。クエリ名をクリックして変更します。クエリの名前を変更すると、そのクエリは保存されます。

<img src={give_a_query_a_name} alt="クエリに名前を付ける"/>

保存ボタンや `cmd / ctrl + s` ショートカットを使用してクエリを保存することもできます。

<img src={save_the_query} alt="クエリを保存"/>

## GenAIを使用したクエリの管理 {#using-genai-to-manage-queries}

この機能を使用すると、ユーザーは自然言語の質問としてクエリを書くことができ、クエリコンソールは利用可能なテーブルのコンテキストに基づいてSQLクエリを生成します。GenAIは、ユーザーがクエリをデバッグするのを助けることもできます。

GenAIについての詳細は、[ClickHouse CloudにおけるGenAIによるクエリの提案を発表します](https://clickhouse.com/blog/announcing-genai-powered-query-suggestions-clickhouse-cloud)をチェックしてください。

### テーブルの設定 {#table-setup}

UK Price Paidの例のデータセットをインポートし、そのデータを使用してGenAIクエリを作成します。

1. ClickHouse Cloudサービスを開きます。
1. _+_ アイコンをクリックして新しいクエリを作成します。
1. 以下のコードを貼り付けて実行します：

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

   このクエリの完了には約1秒かかります。完了すると、`uk_price_paid` という空のテーブルが作成されます。

1. 新しいクエリを作成し、以下のクエリを貼り付けます：

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

このクエリは、`gov.uk` ウェブサイトからデータセットを取得します。このファイルは約4GBのサイズなので、このクエリの完了には数分かかります。ClickHouseがクエリを処理すると、`uk_price_paid` テーブル内にデータセット全体が格納されます。

#### クエリの作成 {#query-creation}

自然言語を使用してクエリを作成してみましょう。

1. **uk_price_paid** テーブルを選択し、**クエリを作成**をクリックします。
1. **SQLを生成**をクリックします。する必要があるかもしれません、あなたのクエリがChat-GPTに送信されることを受け入れることを。続行するには**了承します**を選択する必要があります。
1. これで、自然言語のクエリを入力してChatGPTがそれをSQLクエリに変換するプロンプトが使用可能になります。この例では、次のように入力します：

   > 年ごとのすべてのuk_price_paidトランザクションの合計価格と合計数を示してください。

1. コンソールは、必要なクエリを生成し、新しいタブに表示します。私たちの例では、GenAIは以下のクエリを作成しました：

   ```sql
   -- 年ごとのすべてのuk_price_paidトランザクションの合計価格と合計数を示してください。
   SELECT year(date), sum(price) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
   ```

1. クエリが正しいことを確認したら、**実行**をクリックして実行します。

### デバッグ {#debugging}

次に、GenAIのクエリデバッグ機能をテストしてみましょう。

1. _+_ アイコンをクリックして新しいクエリを作成し、以下のコードを貼り付けます：

   ```sql
   -- 年ごとのすべてのuk_price_paidトランザクションの合計価格と合計数を示してください。
   SELECT year(date), sum(pricee) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
   ```

1. **実行**をクリックします。 `pricee` から値を取得しようとしているため、クエリは失敗します。
1. **クエリを修正**をクリックします。
1. GenAIはクエリを修正しようとします。この場合、`pricee` を `price` に変更しました。また、このシナリオでは`toYear`がより適切な関数であることに気付きました。
1. **適用**を選択して、提案された変更をクエリに追加し、**実行**をクリックします。

GenAIは実験的な機能であることに注意してください。GenAIによって生成されたクエリを任意のデータセットで実行する際は注意を払ってください。

## 高度なクエリ機能 {#advanced-querying-features}

### クエリ結果の検索 {#searching-query-results}

クエリが実行された後、結果ペインで検索入力を使用して返された結果セットを迅速に検索できます。この機能は、追加の `WHERE` 条項の結果をプレビューしたり、特定のデータが結果セットに含まれているかを確認したりするのに役立ちます。検索入力に値を入力すると、結果ペインが更新され、入力した値に一致するエントリを含むレコードが返されます。以下の例では、`hackernews` テーブルのコメントに `ClickHouse` を含むすべての `breakfast` のインスタンスを探します：

<img src={search_hn} alt="Hacker Newsデータを検索"/>

注：入力値に一致するフィールドはすべて返されます。たとえば、上のスクリーンショットの3番目のレコードは、`by` フィールドでは‘breakfast’に一致しませんが、`text` フィールドでは一致します：

<img src={match_in_body} alt="本体の一致"/>

### ページネーション設定の調整 {#adjusting-pagination-settings}

デフォルトでは、クエリ結果ペインは、すべての結果レコードを単一のページに表示します。大きな結果セットでは、視認性を向上させるために結果をページネートする方が好ましい場合があります。これには、結果ペインの右下隅にあるページネーションセレクタを使用します：

<img src={pagination} alt="ページネーションオプション"/>

ページサイズを選択すると、すぐに結果セットにページネーションが適用され、結果ペインのフッターの中央にナビゲーションオプションが表示されます。

<img src={pagination_nav} alt="ページネーションナビゲーション"/>

### クエリ結果データのエクスポート {#exporting-query-result-data}

クエリ結果セットは、SQLコンソールから直接CSV形式で簡単にエクスポートできます。そうするには、結果ペインツールバーの右側にある `•••` メニューを開き、「CSVとしてダウンロード」を選択します。

<img src={download_as_csv} alt="CSVとしてダウンロード"/>

## クエリデータの視覚化 {#visualizing-query-data}

一部のデータは、チャート形式の方が解釈しやすいです。SQLコンソールから数回のクリックでクエリ結果データから視覚化を簡単に作成できます。例として、NYCタクシーの週次統計を計算するクエリを使用します：

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

<img src={tabular_query_results} alt="表形式のクエリ結果"/>

視覚化がないと、これらの結果は解釈するのが難しいです。それでは、これらをチャートに変換しましょう。

### チャートの作成 {#creating-charts}

視覚化の構築を開始するには、結果ペインツールバーから「チャート」オプションを選択します。チャート構成ペインが表示されます：

<img src={switch_from_query_to_chart} alt="クエリからチャートに切り替え"/>

`trip_total` を `week` ごとに追跡するシンプルな棒グラフを作成することから始めます。これを達成するために、`week` フィールドをx軸に、`trip_total` フィールドをy軸にドラッグします：

<img src={trip_total_by_week} alt="週ごとのトリップ合計"/>

ほとんどのチャートタイプは、数値軸に複数のフィールドをサポートしています。証明するために、`fare_total` フィールドをy軸にドラッグします：

<img src={bar_chart} alt="棒グラフ"/>

### チャートのカスタマイズ {#customizing-charts}

SQLコンソールでは、チャートタイプセレクタから選択できる10種類のチャートタイプがサポートされています。たとえば、前のチャートタイプを棒グラフからエリアグラフに簡単に変更できます：

<img src={change_from_bar_to_area} alt="棒グラフからエリアグラフに変更"/>

チャートのタイトルは、データを供給するクエリの名前に一致します。クエリの名前を更新すると、チャートタイトルも更新されます：

<img src={update_query_name} alt="クエリ名の更新"/>

チャート構成ペインの「高度な」セクションでは、いくつかのより高度なチャートの特性も調整可能です。まず、次の設定を調整します：

- サブタイトル
- 軸タイトル
- x軸のラベルの向き

チャートはそれに応じて更新されます：

<img src={update_subtitle_etc} alt="サブタイトル等の更新"/>

いくつかのシナリオでは、各フィールドの軸スケールを独立して調整する必要がある場合があります。これもまた、チャート構成ペインの「高度な」セクションで軸範囲の最小値と最大値を指定することで達成できます。例えば、上のチャートは良好ですが、`trip_total` と `fare_total` フィールド間の相関関係を示すためには、軸範囲に調整が必要です：

<img src={adjust_axis_scale} alt="軸スケールの調整"/>
