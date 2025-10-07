---
'sidebar_label': 'SQL コンソール'
'sidebar_position': 1
'title': 'SQL コンソール'
'slug': '/integrations/sql-clients/sql-console'
'description': 'SQL コンソールについて学ぶ'
'doc_type': 'guide'
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



# SQLコンソール

SQLコンソールは、ClickHouse Cloudにおけるデータベースを探索し、クエリを実行するための最も迅速で簡単な方法です。SQLコンソールを使用して、以下のことができます。

- ClickHouse Cloudサービスに接続する
- テーブルデータを表示、フィルタリング、およびソートする
- クエリを実行し、結果データを数回のクリックで視覚化する
- チームメンバーとクエリを共有し、より効果的にコラボレーションすること。

## テーブルの探索 {#exploring-tables}

### テーブルリストとスキーマ情報の表示 {#viewing-table-list-and-schema-info}

ClickHouseインスタンスに含まれるテーブルの概要は、左側のサイドバーエリアに表示されます。左側のバーの上部にあるデータベースセレクターを使用して、特定のデータベース内のテーブルを表示します。

<Image img={table_list_and_schema} size="lg" border alt="左サイドバーに表示されたデータベーステーブルのテーブルリストとスキーマビュー"/>

リスト内のテーブルは展開して、カラムやデータ型を表示することもできます。

<Image img={view_columns} size="lg" border alt="カラム名とデータ型を表示している展開されたテーブルのビュー"/>

### テーブルデータの探索 {#exploring-table-data}

リスト内のテーブルをクリックして、新しいタブで開きます。テーブルビューでは、データを簡単に表示、選択、コピーできます。Microsoft ExcelやGoogle Sheetsなどのスプレッドシートアプリケーションにコピー＆ペーストする際には、構造とフォーマットが保持されることに注意してください。フッターのナビゲーションを使用して、テーブルデータのページを切り替えることができます（30行単位でページネーションされます）。

<Image img={abc} size="lg" border alt="選択およびコピーできるデータを表示しているテーブルビュー"/>

### セルデータの検査 {#inspecting-cell-data}

セルインスペクターツールを使用して、単一のセル内に含まれる大量のデータを表示できます。開くには、セルを右クリックして「セルを検査」を選択します。セルインスペクタの内容は、インスペクタの内容の右上隅にあるコピーアイコンをクリックすることでコピーできます。

<Image img={inspecting_cell_content} size="lg" border alt="選択したセルの内容を表示しているセルインスペクターダイアログ"/>

## テーブルのフィルタリングとソート {#filtering-and-sorting-tables}

### テーブルのソート {#sorting-a-table}

SQLコンソールでテーブルをソートするには、テーブルを開き、ツールバーの「ソート」ボタンを選択します。このボタンをクリックすると、ソートを設定するためのメニューが開きます。ソートの基準となるカラムを選択し、ソートの順序（昇順または降順）を設定できます。「適用」を選択するか、Enterを押してテーブルをソートします。

<Image img={sort_descending_on_column} size="lg" border alt="カラムに対する降順ソートの設定を示しているソートダイアログ"/>

SQLコンソールでは、テーブルに複数のソートを追加することも可能です。「ソート」ボタンを再度クリックして、別のソートを追加します。注：ソートは、ソートペインに表示される順序（上から下）で適用されます。ソートを削除するには、単にソートの横にある「x」ボタンをクリックします。

### テーブルのフィルタリング {#filtering-a-table}

SQLコンソールでテーブルをフィルタリングするには、テーブルを開き、「フィルター」ボタンを選択します。ソートと同様に、このボタンをクリックすると、フィルターを設定するためのメニューが開きます。フィルタリングの基準となるカラムを選択し、必要な条件を選択します。SQLコンソールは、カラムに含まれるデータの種類に応じたフィルターオプションをインテリジェントに表示します。

<Image img={filter_on_radio_column_equal_gsm} size="lg" border alt="GSMに等しいラジオカラムをフィルタリングするための設定を示しているフィルターダイアログ"/>

フィルターに満足したら、「適用」を選択してデータをフィルタリングできます。また、以下のように追加のフィルターを追加することもできます。

<Image img={add_more_filters} size="lg" border alt="2000より大きい範囲の追加フィルターを追加する方法を示しているダイアログ"/>

ソート機能と同様に、フィルターの横にある「x」ボタンをクリックして削除できます。

### フィルタリングとソートの同時実行 {#filtering-and-sorting-together}

SQLコンソールでは、テーブルを同時にフィルタリングおよびソートすることができます。これを行うには、上記の手順を使用して希望のすべてのフィルターとソートを追加し、「適用」ボタンをクリックします。

<Image img={filtering_and_sorting_together} size="lg" border alt="フィルタリングとソートが同時に適用されているインターフェース"/>

### フィルターとソートからクエリを作成 {#creating-a-query-from-filters-and-sorts}

SQLコンソールは、フィルターやソートをワンクリックで直接クエリに変換することができます。ソートとフィルターパラメータを選択した状態で、ツールバーから「クエリを作成」ボタンを選択するだけです。「クエリを作成」をクリックすると、テーブルビューに含まれるデータに対応するSQLコマンドであらかじめ入力された新しいクエリタブが開きます。

<Image img={create_a_query_from_sorts_and_filters} size="lg" border alt="フィルターとソートからSQLを生成するCreate Queryボタンを示しているインターフェース"/>

:::note
「クエリを作成」機能を使用する際に、フィルターとソートは必須ではありません。
:::

SQLコンソールでのクエリ作成の詳細については、(link)クエリドキュメントをお読みください。

## クエリの作成と実行 {#creating-and-running-a-query}

### クエリの作成 {#creating-a-query}

SQLコンソールで新しいクエリを作成する方法は2つあります。

- タブバーの「+」ボタンをクリックする
- 左側のサイドバーのクエリリストから「新規クエリ」ボタンを選択する

<Image img={creating_a_query} size="lg" border alt="新しいクエリを作成する方法を示しているインターフェース（+ボタンまたはNew Queryボタンを使用）"/>

### クエリの実行 {#running-a-query}

クエリを実行するには、SQLエディタにSQLコマンドを入力し、「実行」ボタンをクリックするか、ショートカットの `cmd / ctrl + enter` を使用します。複数のコマンドを順に書いて実行する場合は、各コマンドの後にセミコロンを追加する必要があります。

クエリ実行オプション
デフォルトでは、実行ボタンをクリックすると、SQLエディタに含まれるすべてのコマンドが実行されます。SQLコンソールは、他の2つのクエリ実行オプションをサポートしています。

- 選択したコマンドを実行
- カーソル位置のコマンドを実行

選択したコマンドを実行するには、希望するコマンドまたはコマンドのシーケンスを強調表示し、「実行」ボタンをクリックするか（または `cmd / ctrl + enter` ショートカットを使用します）。選択が存在する場合、SQLエディタのコンテキストメニュー（エディタ内の任意の場所を右クリックして開く）から「選択を実行」を選択することもできます。

<Image img={run_selected_query} size="lg" border alt="選択したSQLクエリの部分を実行する方法を示しているインターフェース"/>

現在のカーソル位置でコマンドを実行するには、次の2つの方法があります。

- 拡張実行オプションメニューから「カーソル位置で実行」を選択する（または対応する `cmd / ctrl + shift + enter` キーボードショートカットを使用します）

<Image img={run_at_cursor_2} size="lg" border alt="拡張実行オプションメニューのカーソル位置で実行オプション"/>

- SQLエディタのコンテキストメニューから「カーソル位置で実行」を選択します

<Image img={run_at_cursor} size="lg" border alt="SQLエディタコンテキストメニューのカーソル位置で実行オプション"/>

:::note
カーソル位置にあるコマンドは、実行時に黄色に点滅します。
:::

### クエリのキャンセル {#canceling-a-query}

クエリが実行中の場合、クエリエディタのツールバーにある「実行」ボタンは「キャンセル」ボタンに置き換えられます。このボタンをクリックするか、 `Esc` を押してクエリをキャンセルします。注意：既に返された結果はキャンセル後も保持されます。

<Image img={cancel_a_query} size="lg" border alt="クエリ実行中に表示されるキャンセルボタン"/>

### クエリの保存 {#saving-a-query}

以前に名前が付けられていない場合、クエリは「未設定のクエリ」と呼ばれます。クエリ名をクリックして変更します。クエリ名を変更すると、そのクエリは保存されます。

<Image img={give_a_query_a_name} size="lg" border alt="未設定のクエリからクエリ名を変更する方法を示しているインターフェース"/>

「保存」ボタンや `cmd / ctrl + s` キーボードショートカットを使用してクエリを保存することもできます。

<Image img={save_the_query} size="lg" border alt="クエリエディタツールバーの保存ボタン"/>

## GenAIを使用してクエリを管理する {#using-genai-to-manage-queries}

この機能により、ユーザーは自然言語の質問としてクエリを記述し、クエリコンソールが利用可能なテーブルのコンテキストに基づいてSQLクエリを生成できるようになります。GenAIは、ユーザーがクエリをデバッグするのにも役立ちます。

GenAIについての詳細は、[ClickHouse Cloudブログの「GenAIによるクエリ提案を発表」](https://clickhouse.com/blog/announcing-genai-powered-query-suggestions-clickhouse-cloud)を確認してください。

### テーブルの設定 {#table-setup}

英国の価格データセットをインポートし、それを使用していくつかのGenAIクエリを作成します。

1. ClickHouse Cloudサービスを開きます。
1. _+_アイコンをクリックして新しいクエリを作成します。
1. 次のコードを貼り付けて実行します：

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

   このクエリは約1秒で完了するはずです。完了すると、「uk_price_paid」という空のテーブルが作成されます。

1. 新しいクエリを作成し、次のクエリを貼り付けます：

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

このクエリは「gov.uk」ウェブサイトからデータセットを取得します。このファイルは約4GBのサイズであるため、このクエリは完了するまでに数分かかるでしょう。ClickHouseがクエリを処理すると、「uk_price_paid」テーブルに全データセットが含まれるはずです。

#### クエリの作成 {#query-creation}

自然言語を使用してクエリを作成します。

1. **uk_price_paid**テーブルを選択し、「クエリを作成」をクリックします。
1. **SQL生成**をクリックします。クエリがChat-GPTに送信されることを承諾するよう求められる場合があります。「同意する」を選択して続行します。
1. 今、自然な言語のクエリを入力してChatGPTにSQLクエリに変換させるためのプロンプトを使用できます。この例では、次のように入力します：

   > 年ごとの全てのuk_price_paid取引の合計金額と合計件数を表示してください。

1. コンソールは、求めているクエリを生成し、新しいタブに表示します。この例では、GenAIは次のクエリを作成しました：

```sql
-- Show me the total price and total number of all uk_price_paid transactions by year.
SELECT year(date), sum(price) as total_price, Count(*) as total_transactions
FROM uk_price_paid
GROUP BY year(date)
```

1. クエリが正しいことを確認したら、**実行**をクリックして実行します。

### デバッグ {#debugging}

さて、GenAIのクエリデバッグ機能をテストしましょう。

1. _+_アイコンをクリックして新しいクエリを作成し、次のコードを貼り付けます：

```sql
-- Show me the total price and total number of all uk_price_paid transactions by year.
SELECT year(date), sum(pricee) as total_price, Count(*) as total_transactions
FROM uk_price_paid
GROUP BY year(date)
```

1. **実行**をクリックします。`pricee`から値を取得しようとしているため、クエリは失敗します。正しいのは`price`です。
1. **クエリを修正**をクリックします。
1. GenAIはクエリの修正を試みます。この場合、`pricee`を`price`に変更しました。また、このシナリオでは`toYear`がより適切な関数であることを認識しました。
1. 提案された変更をクエリに追加するために**適用**を選択し、**実行**をクリックします。

GenAIは実験的な機能であることを忘れないでください。GenAIが生成したクエリを任意のデータセットに対して実行する際は注意が必要です。

## 高度なクエリ機能 {#advanced-querying-features}

### クエリ結果の検索 {#searching-query-results}

クエリが実行された後、結果ペインの検索入力を使用して返された結果セットを迅速に検索できます。この機能は、追加の`WHERE`句の結果をプレビューする場合や、特定のデータが結果セットに含まれていることを確認する場合に役立ちます。検索入力に値を入力すると、結果ペインが更新され、入力された値に一致するエントリを含むレコードが返されます。この例では、`hackernews`テーブルで、`ClickHouse`を含むコメントのすべての`breakfast`のインスタンスを探します（大文字と小文字を区別しない）：

<Image img={search_hn} size="lg" border alt="Hacker Newsデータの検索"/>

注意：入力された値に一致する任意のフィールドが返されます。たとえば、上記のスクリーンショットの3番目のレコードは`by`フィールドで「breakfast」と一致しませんが、`text`フィールドは一致しています：

<Image img={match_in_body} size="lg" border alt="本文での一致"/>

### ページネーション設定の調整 {#adjusting-pagination-settings}

デフォルトでは、クエリ結果ペインは単一のページにすべての結果レコードを表示します。より大きな結果セットでは、結果をページネーションして表示を簡単にする方が望ましい場合があります。これは、結果ペインの右下隅にあるページネーションセレクターを使用して実行できます：

<Image img={pagination} size="lg" border alt="ページネーションオプション"/>

ページサイズを選択すると、すぐに結果セットにページネーションが適用され、結果ペインのフッターの中央にナビゲーションオプションが表示されます。

<Image img={pagination_nav} size="lg" border alt="ページネーションナビゲーション"/>

### クエリ結果データのエクスポート {#exporting-query-result-data}

クエリ結果セットは、SQLコンソールから直接CSV形式で簡単にエクスポートできます。これを行うには、結果ペインツールバーの右側にある`•••`メニューを開き、「CSVとしてダウンロード」を選択します。

<Image img={download_as_csv} size="lg" border alt="CSVとしてダウンロード"/>

## クエリデータの視覚化 {#visualizing-query-data}

データはチャート形式でより簡単に解釈できる場合があります。クエリ結果データから数回のクリックで視覚化を簡単に作成できます。例として、NYCタクシーのトリップの週間統計を計算するクエリを使用します：

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

<Image img={tabular_query_results} size="lg" border alt="表形式のクエリ結果"/>

視覚化なしでは、これらの結果は解釈が難しいです。それらをチャートに変換しましょう。

### チャートの作成 {#creating-charts}

視覚化の構築を開始するには、クエリ結果ペインツールバーから「チャート」オプションを選択します。チャート設定ペインが表示されます：

<Image img={switch_from_query_to_chart} size="lg" border alt="クエリからチャートへ切り替え"/>

`trip_total`を`week`で追跡する簡単な棒グラフを作成することから始めます。このために、`week`フィールドをx軸に、`trip_total`フィールドをy軸にドラッグします：

<Image img={trip_total_by_week} size="lg" border alt="週ごとの合計トリップ"/>

ほとんどのチャートタイプは数値軸に複数のフィールドをサポートしています。これを示すために、fare_totalフィールドをy軸にドラッグします：

<Image img={bar_chart} size="lg" border alt="棒グラフ"/>

### チャートのカスタマイズ {#customizing-charts}

SQLコンソールは、チャート設定ペインのチャートタイプセレクターから選択できる10種類のチャートタイプをサポートしています。たとえば、前のチャートタイプを棒グラフからエリアグラフに簡単に変更できます：

<Image img={change_from_bar_to_area} size="lg" border alt="棒グラフからエリアグラフへの変更"/>

チャートタイトルは、データを提供するクエリの名前に一致します。クエリ名を更新すると、チャートタイトルも更新されます：

<Image img={update_query_name} size="lg" border alt="クエリ名を更新"/>

チャート設定ペインの「高度な」セクションで、より高度なチャートの特性も調整できます。まず、以下の設定を調整します：

- サブタイトル
- 軸タイトル
- x軸のラベルの向き

チャートはそれに応じて更新されます：

<Image img={update_subtitle_etc} size="lg" border alt="サブタイトルなどを更新"/>

いくつかのシナリオでは、各フィールドの軸スケールを独立して調整する必要があります。これは、軸範囲のminおよびmax値を指定することで「高度な」セクションで行うこともできます。たとえば、上記のチャートは良好に見えますが、`trip_total`と`fare_total`フィールドの相関関係を示すために、軸範囲を調整する必要があります：

<Image img={adjust_axis_scale} size="lg" border alt="軸スケールを調整"/>

## クエリの共有 {#sharing-queries}

SQLコンソールでは、クエリをチームと共有できます。クエリが共有されると、チームのすべてのメンバーがそのクエリを表示し、編集できます。共有クエリは、チームと協力するための素晴らしい方法です。

クエリを共有するには、クエリツールバーの「共有」ボタンをクリックします。

<Image img={sql_console_share} size="lg" border alt="クエリツールバーの共有ボタン"/>

ダイアログが表示され、チームのすべてのメンバーとクエリを共有できるようになります。複数のチームがある場合は、クエリを共有するチームを選択できます。

<Image img={sql_console_edit_access} size="lg" border alt="共有クエリへの編集アクセスのダイアログ"/>

<Image img={sql_console_add_team} size="lg" border alt="共有クエリにチームを追加するためのインターフェース"/>

<Image img={sql_console_edit_member} size="lg" border alt="共有クエリへのメンバーアクセスを編集するためのインターフェース"/>

いくつかのシナリオでは、各フィールドの軸スケールを独立して調整する必要があります。これは、軸範囲のminおよびmax値を指定することで「高度な」セクションで行うこともできます。たとえば、上記のチャートは良好に見えますが、`trip_total`と`fare_total`フィールドの相関関係を示すために、軸範囲を調整する必要があります：

<Image img={sql_console_access_queries} size="lg" border alt="クエリリストの共有されたセクション"/>
