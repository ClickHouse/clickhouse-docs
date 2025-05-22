---
'sidebar_label': 'SQLコンソール'
'sidebar_position': 1
'title': 'SQLコンソール'
'slug': '/integrations/sql-clients/sql-console'
'description': 'SQLコンソールについて学ぶ'
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

SQLコンソールは、ClickHouse Cloudでデータベースを探索し、クエリを実行する最も迅速で簡単な方法です。SQLコンソールを使用して、以下のことができます。

- ClickHouse Cloud Servicesに接続する
- テーブルデータを表示、フィルタリング、並べ替える
- クエリを実行し、結果データを数回のクリックで視覚化する
- チームメンバーとクエリを共有し、より効果的にコラボレーションする

## テーブルの探索 {#exploring-tables}

### テーブルリストとスキーマ情報の表示 {#viewing-table-list-and-schema-info}

ClickHouseインスタンスに含まれるテーブルの概要は、左側のサイドバーエリアにあります。左側のバーの上部にあるデータベースセレクターを使用して、特定のデータベース内のテーブルを表示します。

<Image img={table_list_and_schema} size="lg" border alt="左側のサイドバーにデータベーステーブルが表示されているテーブルリストとスキーマビュー"/>

リスト内のテーブルは、カラムやタイプを表示するために展開することもできます。

<Image img={view_columns} size="lg" border alt="カラム名とデータ型を表示する拡張テーブルのビュー"/>

### テーブルデータの探索 {#exploring-table-data}

リスト内のテーブルをクリックすると、新しいタブで開きます。テーブルビューでは、データを簡単に表示、選択、コピーできます。Microsoft ExcelやGoogle Sheetsなどのスプレッドシートアプリケーションにコピー＆ペーストするときに構造とフォーマットが保持されることに注意してください。フッターのナビゲーションを使用して、テーブルデータのページ間を切り替えられます（30行ずつページネーションされています）。

<Image img={abc} size="lg" border alt="選択してコピーできるデータを表示するテーブルビュー"/>

### セルデータの検査 {#inspecting-cell-data}

セルインスペクターツールを使用して、単一のセルに含まれる大量のデータを表示できます。これを開くには、セルを右クリックして「セルを検査」を選択します。セルインスペクタの内容は、インスペクタの内容の右上隅にあるコピーアイコンをクリックすることでコピーできます。

<Image img={inspecting_cell_content} size="lg" border alt="選択されたセルの内容を表示するセルインスペクターダイアログ"/>

## テーブルのフィルタリングとソート {#filtering-and-sorting-tables}

### テーブルのソート {#sorting-a-table}

SQLコンソールでテーブルをソートするには、テーブルを開き、ツールバーの「ソート」ボタンを選択します。このボタンをクリックすると、ソートを設定するためのメニューが開きます。ソートするカラムと、ソートの順序（昇順または降順）を設定できます。「適用」を選択するか、Enterを押してテーブルをソートします。

<Image img={sort_descending_on_column} size="lg" border alt="カラムの降順ソート設定を示すソートダイアログ"/>

SQLコンソールでは、テーブルに複数のソートを追加することもできます。もう一度「ソート」ボタンをクリックして、別のソートを追加します。注意：ソートは、ソートペインに表示される順序（上から下）で適用されます。ソートを削除するには、単にそのソートの横にある「x」ボタンをクリックします。

### テーブルのフィルタリング {#filtering-a-table}

SQLコンソールでテーブルをフィルタリングするには、テーブルを開き、「フィルター」ボタンを選択します。ソートと同様に、このボタンをクリックすると、フィルタを設定するためのメニューが開きます。フィルタに使用するカラムを選択し、必要な基準を選択できます。SQLコンソールは、カラムに含まれるデータのタイプに応じたフィルタオプションを賢く表示します。

<Image img={filter_on_radio_column_equal_gsm} size="lg" border alt="GSMに等しいラジオカラムをフィルタリングする設定を示すフィルタダイアログ"/>

フィルタが満足いくものであれば、「適用」を選択してデータをフィルタリングできます。また、以下に示すように追加のフィルタを追加することもできます。

<Image img={add_more_filters} size="lg" border alt="2000より大きい範囲で追加のフィルタを追加する方法を示すダイアログ"/>

ソート機能と同様に、フィルタを削除するにはフィルタの横にある「x」ボタンをクリックします。

### フィルタリングとソートの同時適用 {#filtering-and-sorting-together}

SQLコンソールでは、テーブルを同時にフィルタリングおよびソートすることができます。これを行うには、上記の手順で必要なすべてのフィルタとソートを追加し、「適用」ボタンをクリックします。

<Image img={filtering_and_sorting_together} size="lg" border alt="同時にフィルタリングとソートが適用されているインターフェース"/>

### フィルタおよびソートからクエリを作成 {#creating-a-query-from-filters-and-sorts}

SQLコンソールでは、フィルタとソートを1クリックでクエリに変換できます。「クエリを作成」ボタンをツールバーから選択し、選択したソートおよびフィルタのパラメータを使用するだけです。「クエリを作成」をクリックすると、新しいクエリタブが開き、テーブルビューに含まれるデータに対応するSQLコマンドが事前に入力されます。

<Image img={create_a_query_from_sorts_and_filters} size="lg" border alt="フィルタとソートからSQLを生成するCreate Queryボタンを示すインターフェース"/>

:::note
「クエリを作成」機能を使用する際にフィルタやソートは必須ではありません。
:::

SQLコンソールでのクエリについて詳しく学ぶには、(link) クエリ文書をお読みください。

## クエリの作成と実行 {#creating-and-running-a-query}

### クエリの作成 {#creating-a-query}

SQLコンソールで新しいクエリを作成する方法は2つあります。

- タブバーの「+」ボタンをクリックする
- 左側のサイドバーのクエリリストから「新しいクエリ」ボタンを選択する

<Image img={creating_a_query} size="lg" border alt="+ボタンまたは新しいクエリボタンを使用して新しいクエリを作成する方法を示すインターフェース"/>

### クエリの実行 {#running-a-query}

クエリを実行するには、SQLエディタにSQLコマンドをタイプし、「実行」ボタンをクリックするか、ショートカット `cmd / ctrl + enter` を使用します。複数のコマンドを順次書き込み、実行するには、それぞれのコマンドの後にセミコロンを追加してください。

クエリ実行オプション
デフォルトでは、実行ボタンをクリックするとSQLエディタに含まれるすべてのコマンドが実行されます。SQLコンソールは、他の2つのクエリ実行オプションをサポートしています。

- 選択したコマンドを実行
- カーソル位置のコマンドを実行

選択したコマンドを実行するには、希望のコマンドまたはコマンドのシーケンスを強調表示して「実行」ボタンをクリックします（または `cmd / ctrl + enter` ショートカットを使用）。選択がある場合、SQLエディタのコンテキストメニュー（エディタ内の任意の位置を右クリックすることで開く）から「選択したコマンドを実行」を選択することもできます。

<Image img={run_selected_query} size="lg" border alt="選択したSQLクエリの一部を実行する方法を示すインターフェース"/>

現在のカーソル位置でコマンドを実行するには、次の2つの方法が利用できます。

- 拡張実行オプションメニューから「カーソル位置で実行」を選択する（または対応する `cmd / ctrl + shift + enter` キーボードショートカットを使用）

<Image img={run_at_cursor_2} size="lg" border alt="拡張実行オプションメニュー内のカーソル位置での実行オプション"/>

  - SQLエディタのコンテキストメニューから「カーソル位置で実行」を選択する

<Image img={run_at_cursor} size="lg" border alt="SQLエディタのコンテキストメニュー内のカーソル位置での実行オプション"/>

:::note
カーソル位置にあるコマンドは、実行時に黄色に点滅します。
:::

### クエリのキャンセル {#canceling-a-query}

クエリが実行中の場合、クエリエディタツールバーの「実行」ボタンが「キャンセル」ボタンに置き換えられます。このボタンをクリックするか、 `Esc` キーを押すだけでクエリをキャンセルできます。注意：キャンセルされた後でも、すでに返された結果は維持されます。

<Image img={cancel_a_query} size="lg" border alt="クエリ実行中に表示されるキャンセルボタン"/>

### クエリの保存 {#saving-a-query}

以前に名前が付けられていない場合、クエリの名前は「無題のクエリ」となります。クエリ名をクリックして変更します。クエリの名前を変更すると、そのクエリが保存されます。

<Image img={give_a_query_a_name} size="lg" border alt="無題のクエリからクエリ名を変更する方法を示すインターフェース"/>

クエリを保存するには、保存ボタンまたは `cmd / ctrl + s` キーボードショートカットを使用することもできます。

<Image img={save_the_query} size="lg" border alt="クエリエディタツールバー内の保存ボタン"/>

## GenAIを使用してクエリを管理する {#using-genai-to-manage-queries}

この機能により、ユーザーは自然言語の質問としてクエリを書くことができ、クエリコンソールは利用可能なテーブルのコンテキストに基づいてSQLクエリを作成します。GenAIは、ユーザーがクエリをデバッグするのにも役立ちます。

GenAIの詳細については、[ClickHouse CloudにおけるGenAIによるクエリ提案の発表ブログ投稿](https://clickhouse.com/blog/announcing-genai-powered-query-suggestions-clickhouse-cloud)をご覧ください。

### テーブルセットアップ {#table-setup}

UK Price Paidのサンプルデータセットをインポートし、それを使用していくつかのGenAIクエリを作成しましょう。

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

   このクエリが完了するのに約1秒かかります。完了すると、`uk_price_paid`という名前の空のテーブルが作成されます。

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

このクエリは、`gov.uk` ウェブサイトからデータセットを取得します。このファイルは約4GBであるため、処理には数分かかります。ClickHouseがクエリを処理した後、`uk_price_paid` テーブル内に全データセットが格納されるでしょう。

#### クエリ作成 {#query-creation}

自然言語を使用してクエリを作成してみましょう。

1. **uk_price_paid** テーブルを選択し、次に **クエリを作成** をクリックします。
1. **SQLを生成** をクリックします。クエリがChat-GPTに送信されることを受け入れるよう求められることがあります。続行するには、**同意します** を選択する必要があります。
1. 自然言語クエリを入力し、ChatGPTがそれをSQLクエリに変換するようにプロンプトを使用できます。この例では、次のように入力します：

   > 年別のすべてのuk_price_paid取引の合計価格と総数を示してください。

1. コンソールは、私たちが探しているクエリを生成し、新しいタブに表示します。この例では、GenAIは次のクエリを作成しました：

   ```sql
   -- 年別のすべてのuk_price_paid取引の合計価格と総数を示してください。
   SELECT year(date), sum(price) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
   ```

1. クエリが正しいことを確認したら、**実行** をクリックして実行します。

### デバッグ {#debugging}

次に、GenAIのクエリデバッグ機能をテストしてみましょう。

1. _+_ アイコンをクリックし、新しいクエリを作成して次のコードを貼り付けます：

   ```sql
   -- 年別のすべてのuk_price_paid取引の合計価格と総数を示してください。
   SELECT year(date), sum(pricee) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
   ```

1. **実行** をクリックします。このクエリは失敗します。なぜなら `pricee` から値を取得しようとしているからです。
1. **クエリを修正** をクリックします。
1. GenAIはクエリを修正しようとします。この場合、`pricee`を`price`に変更しました。また、`toYear`がこのシナリオで使用するのに適した関数であることに気付きました。
1. 推奨された変更をクエリに追加するために **適用** を選択し、**実行** をクリックします。

GenAIは実験的な機能であるため、生成されたクエリを任意のデータセットに対して実行する際には注意してください。

## 高度なクエリ機能 {#advanced-querying-features}

### クエリ結果の検索 {#searching-query-results}

クエリを実行した後、結果ペインの検索入力を使用して返された結果セットを迅速に検索できます。この機能は、追加の `WHERE` 句の結果をプレビューしたり、特定のデータが結果セットに含まれていることを確認したりするのに役立ちます。検索入力に値を入力すると、結果ペインが更新され、入力した値に一致するレコードが返されます。この例では、`hackernews` テーブル内で `ClickHouse` を含むコメントのすべての `breakfast` インスタンスを探してみましょう。

<Image img={search_hn} size="lg" border alt="Hacker Newsデータの検索"/>

注意：入力した値に一致する任意のフィールドが返されます。たとえば、上記のスクリーンショットにおける3番目のレコードは `by` フィールドで 'breakfast' と一致しませんが、`text` フィールドは一致します：

<Image img={match_in_body} size="lg" border alt="本文中の一致"/>

### ページネーション設定の調整 {#adjusting-pagination-settings}

デフォルトでは、クエリの結果ペインは、単一のページにすべての結果レコードを表示します。大きな結果セットの場合、簡単に表示できるようにページネーションを使用することが望ましい場合があります。これを行うには、結果ペインの右下隅にあるページネーションセレクターを使用します：

<Image img={pagination} size="lg" border alt="ページネーションオプション"/>

ページサイズを選択すると、結果セットに即座にページネーションが適用され、結果ペインのフッターの中央にナビゲーションオプションが表示されます。

<Image img={pagination_nav} size="lg" border alt="ページネーションナビゲーション"/>

### クエリ結果データのエクスポート {#exporting-query-result-data}

クエリ結果セットは、SQLコンソールから直接CSV形式に簡単にエクスポートできます。これを行うには、結果ペインツールバーの右側にある `•••` メニューを開き、「CSVとしてダウンロード」を選択します。

<Image img={download_as_csv} size="lg" border alt="CSVとしてダウンロード"/>

## クエリデータの視覚化 {#visualizing-query-data}

いくつかのデータは、チャート形式でより簡単に解釈できます。クエリ結果データから数回のクリックで視覚化を迅速に作成できます。例として、NYCタクシーの週間統計を計算するクエリを使用してみましょう：

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

<Image img={tabular_query_results} size="lg" border alt="表形式のクエリ結果"/>

視覚化なしでは、これらの結果は解釈するのが難しいです。これらをチャートに変換しましょう。

### チャートの作成 {#creating-charts}

視覚化を構築するには、クエリ結果ペインツールバーから「チャート」オプションを選択します。チャート配置ペインが表示されます：

<Image img={switch_from_query_to_chart} size="lg" border alt="クエリからチャートに切り替え"/>

`trip_total`を`week`別に追跡するシンプルな棒グラフを作成することから始めましょう。これを達成するために、`week`フィールドをx軸に、`trip_total`フィールドをy軸にドラッグします：

<Image img={trip_total_by_week} size="lg" border alt="週別のトリップトータル"/>

ほとんどのチャートタイプは数値軸に複数のフィールドをサポートしています。示すために、`fare_total`フィールドをy軸にドラッグします：

<Image img={bar_chart} size="lg" border alt="棒グラフ"/>

### チャートのカスタマイズ {#customizing-charts}

SQLコンソールは、チャート設定ペインのチャートタイプセレクターから選択できる10種類のチャートタイプをサポートしています。たとえば、以前のチャートタイプを棒グラフから面グラフに簡単に変更できます：

<Image img={change_from_bar_to_area} size="lg" border alt="棒グラフから面グラフに変更"/>

チャートタイトルは、データを提供するクエリの名前と一致します。クエリの名前を更新すると、チャートのタイトルも更新されます：

<Image img={update_query_name} size="lg" border alt="クエリ名の更新"/>

さらに多くの高度なチャート特性は、チャート配置ペインの「高度な」セクションで調整できます。まず、以下の設定を調整します：

- サブタイトル
- 軸タイトル
- x軸のラベルの向き

チャートはそれに応じて更新されます：

<Image img={update_subtitle_etc} size="lg" border alt="サブタイトルなどの更新"/>

いくつかのシナリオでは、各フィールドの軸スケールを独自に調整する必要がある場合があります。これもまた、チャート配置ペインの「高度な」セクションで、軸範囲の最小値と最大値を指定することで実現できます。たとえば、上記のチャートは良好に見えますが、`trip_total`と`fare_total`フィールドの相関関係を示すためには、軸範囲を調整する必要があります：

<Image img={adjust_axis_scale} size="lg" border alt="軸スケールの調整"/>

## クエリの共有 {#sharing-queries}

SQLコンソールを使用すると、チームとクエリを共有できます。クエリが共有されると、チームの全員がそのクエリを確認、編集できるようになります。共有クエリは、チームとのコラボレーションに激しく役立ちます。

クエリを共有するには、クエリツールバーの「共有」ボタンをクリックします。

<Image img={sql_console_share} size="lg" border alt="クエリツールバー内の共有ボタン"/>

ダイアログが開き、チームのすべてのメンバーとクエリを共有できるようになります。複数のチームがある場合、どのチームとクエリを共有するかを選択できます。

<Image img={sql_console_edit_access} size="lg" border alt="共有クエリへのアクセスを編集するためのダイアログ"/>

<Image img={sql_console_add_team} size="lg" border alt="共有クエリにチームを追加するためのインターフェース"/>

<Image img={sql_console_edit_member} size="lg" border alt="共有クエリへのメンバーアクセスを編集するためのインターフェース"/>

いくつかのシナリオでは、各フィールドの軸スケールを独自に調整する必要がある場合があります。これもまた、チャート配置ペインの「高度な」セクションで、軸範囲の最小値と最大値を指定することで実現できます。たとえば、上記のチャートは良好に見えますが、`trip_total`と`fare_total`フィールドの相関関係を示すためには、軸範囲を調整する必要があります：

<Image img={sql_console_access_queries} size="lg" border alt="クエリリスト内の私と共有されたセクション"/>
