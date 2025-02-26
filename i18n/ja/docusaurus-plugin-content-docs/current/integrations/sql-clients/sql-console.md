---
sidebar_label: SQLコンソール
sidebar_position: 1
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

# SQLコンソール

SQLコンソールは、ClickHouse Cloud内のデータベースを探索し、クエリを実行するための最も迅速かつ簡単な方法です。SQLコンソールを使用して、以下のことができます：

- ClickHouse Cloud Servicesに接続する
- テーブルデータを表示、フィルタリング、並べ替えする
- クエリを実行し、結果データを数回のクリックで視覚化する
- チームメンバーとクエリを共有し、より効果的にコラボレーションする。

## テーブルの探索 {#exploring-tables}

### テーブルリストとスキーマ情報の表示 {#viewing-table-list-and-schema-info}

ClickHouseインスタンスに含まれているテーブルの概要は、左のサイドバーエリアにあります。左バーの上部にあるデータベースセレクタを使用して、特定のデータベース内のテーブルを表示できます。

![テーブルのリストとスキーマ](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/table-list-and-schema.png)

リスト内のテーブルは展開して、カラムやタイプを表示できます。

![カラムの表示](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/view-columns.png)

### テーブルデータの探索 {#exploring-table-data}

リスト内のテーブルをクリックすると、新しいタブで開きます。テーブルビューでは、データを簡単に表示、選択、およびコピーできます。Microsoft ExcelやGoogle Sheetsなどのスプレッドシートアプリケーションにコピー＆ペーストする際に、構造とフォーマットが保持されることに注意してください。フッターのナビゲーションを使用して、テーブルデータのページを切り替えることができます（30行ずつページネーション）。

![abc](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/abc.png)

### セルデータの検査 {#inspecting-cell-data}

セルインスペクターツールを使用して、単一のセルに含まれる大量のデータを表示できます。これを開くには、セルを右クリックして「セルを検査」を選択します。セルインスペクタの内容は、インスペクタの右上隅にあるコピーアイコンをクリックすることでコピーできます。

![セル内容の検査](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/inspecting-cell-content.png)

## テーブルのフィルタリングと並べ替え {#filtering-and-sorting-tables}

### テーブルの並べ替え {#sorting-a-table}

SQLコンソールでテーブルを並べ替えるには、テーブルを開き、ツールバーの「並べ替え」ボタンを選択します。このボタンをクリックすると、並べ替えを構成するためのメニューが表示されます。並べ替えの基準とするカラムを選択し、並べ替えの順序（昇順または降順）を設定できます。「適用」を選択するか、Enterを押してテーブルを並べ替えます。

![カラムで降順に並べ替え](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/sort-descending-on-column.png)

SQLコンソールでは、テーブルに複数の並べ替えを追加することもできます。「並べ替え」ボタンを再度クリックして、別の並べ替えを追加します。注意：並べ替えは、並べ替えペインに表示される順序（上から下）で適用されます。並べ替えを削除するには、単に並べ替えの隣にある「x」ボタンをクリックします。

### テーブルのフィルタリング {#filtering-a-table}

SQLコンソールでテーブルをフィルタリングするには、テーブルを開き、「フィルター」ボタンを選択します。並べ替えと同様に、このボタンをクリックするとフィルターを構成するためのメニューが表示されます。フィルタリングするカラムを選択し、必要な条件を選択できます。SQLコンソールは、カラムに含まれているデータのタイプに対応するフィルターオプションをインテリジェントに表示します。

![ラジオカラムがGSMに等しいフィルター](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/filter-on-radio-column-equal-gsm.png)

フィルターが満足いくものであれば、「適用」を選択してデータをフィルタリングできます。また、以下のように追加のフィルターを追加することもできます。

![2000より大きい範囲にフィルターを追加](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/add-more-filters.png)

並べ替えの機能と同様に、フィルターを削除するには、その隣にある「x」ボタンをクリックします。

### フィルタリングと並べ替えを一緒に {#filtering-and-sorting-together}

SQLコンソールでは、テーブルを同時にフィルタリングおよび並べ替えできます。これを行うには、前述の手順を使用して、すべての希望するフィルターと並べ替えを追加し、「適用」ボタンをクリックします。

![フィルタリングと並べ替えを一緒に](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/filtering-and-sorting-together.png)

### フィルターと並べ替えからクエリを作成 {#creating-a-query-from-filters-and-sorts}

SQLコンソールは、クリック一つでフィルターと並べ替えを直接クエリに変換できます。ツールバーから希望する並べ替えおよびフィルターのパラメータを選択した後、「クエリを作成」ボタンを選択します。「クエリを作成」をクリックすると、テーブルビューに含まれているデータに対応するSQLコマンドで事前に入力された新しいクエリタブが開きます。

![フィルターと並べ替えからクエリを作成](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/create-a-query-from-sorts-and-filters.png)

:::note
「クエリを作成」機能を使用する際、フィルターや並べ替えは必須ではありません。
:::

SQLコンソールでのクエリ作成については、（リンク）クエリのドキュメントを読むことで詳しく学ぶことができます。

## クエリの作成と実行 {#creating-and-running-a-query}

### クエリの作成 {#creating-a-query}

SQLコンソールで新しいクエリを作成する方法は二つあります。

- タブバーの「+」ボタンをクリックする
- 左サイドバーのクエリリストから「新しいクエリ」ボタンを選択する

  ![クエリの作成](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/creating-a-query.png)

### クエリの実行 {#running-a-query}

クエリを実行するには、SQLエディタにSQLコマンドを入力し、「実行」ボタンをクリックするか、ショートカット`cmd / ctrl + enter`を使用します。複数のコマンドを連続して記述し、実行する場合は、各コマンドの後にセミコロンを追加してください。

クエリ実行オプション
デフォルトでは、実行ボタンをクリックすると、SQLエディタに含まれるすべてのコマンドが実行されます。SQLコンソールは、以下の2つの別のクエリ実行オプションをサポートしています：

- 選択したコマンドを実行
- カーソル位置のコマンドを実行

選択したコマンドを実行するには、希望するコマンドまたはコマンドのシーケンスを強調表示し、「実行」ボタンをクリックします（または、ショートカット`cmd / ctrl + enter`を使用します）。選択がある状態でエディタ内の任意の場所を右クリックし、SQLエディタのコンテキストメニューから「選択した部分を実行」を選択することもできます。

![選択したクエリを実行](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/run-selected-query.png)

現在のカーソル位置でコマンドを実行するには、2つの方法があります：

- 拡張実行オプションメニューから「カーソルで実行」を選択する（または、対応する`cmd / ctrl + shift + enter`のキーボードショートカットを使用）

  ![カーソルで実行](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/run-at-cursor-2.png)

  - SQLエディタのコンテキストメニューから「カーソルで実行」を選択する

  ![カーソルで実行](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/run-at-cursor.png)

:::note
カーソル位置にあるコマンドが実行されると、黄色に点滅しします。
:::

### クエリのキャンセル {#canceling-a-query}

クエリが実行中は、クエリエディタツールバーの「実行」ボタンが「キャンセル」ボタンに置き換えられます。このボタンをクリックするか、`Esc`を押すと、クエリをキャンセルできます。注意：キャンセル後にすでに返された結果は残ります。

![クエリをキャンセル](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/cancel-a-query.png)

### クエリの保存 {#saving-a-query}

未命名の場合、クエリは「無題のクエリ」と呼ばれます。クエリ名を変更するには、その名前をクリックします。クエリの名前を変更すると、クエリが保存されます。

![クエリに名前を付ける](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/give-a-query-a-name.png)

クエリを保存するには、保存ボタンを使用するか、`cmd / ctrl + s`のキーボードショートカットを使用します。

![クエリを保存](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/save-the-query.png)

## GenAIを使用してクエリを管理する {#using-genai-to-manage-queries}

この機能により、ユーザーは自然言語の質問としてクエリを記述し、クエリコンソールが利用可能なテーブルのコンテキストに基づいてSQLクエリを作成することができます。GenAIは、ユーザーがクエリをデバッグするのを手助けすることもできます。

GenAIについての詳細は、[ClickHouse CloudのGenAI搭載クエリ提案を発表するブログ記事](https://clickhouse.com/blog/announcing-genai-powered-query-suggestions-clickhouse-cloud)をご覧ください。

### テーブルの設定 {#table-setup}

英国のPrice Paidの例データセットをインポートし、それを使用していくつかのGenAIクエリを作成しましょう。

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

   このクエリの完了には約1秒かかります。完了すると、`uk_price_paid`と呼ばれる空のテーブルが作成されます。

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

このクエリは、`gov.uk`ウェブサイトからデータセットを取得します。このファイルのサイズは約4GBであるため、このクエリの完了には数分かかるでしょう。ClickHouseがクエリを処理すると、`uk_price_paid`テーブルに全データセットが格納されます。

#### クエリの作成 {#query-creation}

自然言語を使用してクエリを作成してみましょう。

1. **uk_price_paid**テーブルを選択し、**クエリを作成**をクリックします。
1. **SQLを生成**をクリックします。クエリがChat-GPTに送信されることを受け入れるよう求められる場合があります。「同意します」を選択して続行します。
1. これで、このプロンプトを使用して自然言語クエリを入力し、ChatGPTがそれをSQLクエリに変換できます。この例では、次のように入力します：

   > 年ごとのuk_price_paid取引の合計価格と合計件数を表示してください。

1. コンソールは、私たちが探しているクエリを生成し、新しいタブに表示します。この例では、GenAIが次のクエリを作成しました：

   ```sql
   -- 年ごとのuk_price_paid取引の合計価格と合計件数を表示してください。
   SELECT year(date), sum(price) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
   ```

1. クエリが正しいことを確認したら、**実行**をクリックして実行します。

### デバッグ {#debugging}

次に、GenAIのクエリデバッグ機能をテストしてみましょう。

1. _+_アイコンをクリックして新しいクエリを作成し、次のコードを貼り付けます：

   ```sql
   -- 年ごとのuk_price_paid取引の合計価格と合計件数を表示してください。
   SELECT year(date), sum(pricee) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
   ```

1. **実行**をクリックします。このクエリは失敗します。なぜなら、`pricee`から値を取得しようとしているからです。
1. **クエリを修正**をクリックします。
1. GenAIはクエリを修正しようとします。この場合、`pricee`を`price`に変更しました。また、このシナリオでは`toYear`がより良い関数であることを認識しました。
1. 提案された変更をクエリに追加するには、**適用**を選択し、**実行**をクリックします。

GenAIは実験的な機能であることを注意してください。GenAIが生成したクエリを任意のデータセットに対して実行する際には注意が必要です。

## 高度なクエリ機能 {#advanced-querying-features}

### クエリ結果の検索 {#searching-query-results}

クエリが実行された後、結果ペインの検索入力を使用して戻された結果セットを迅速に検索できます。この機能は、追加の`WHERE`句の結果をプレビューしたり、特定のデータが結果セットに含まれているかどうかを確認したりするのに役立ちます。検索入力に値を入力すると、結果ペインが更新され、入力された値と一致するレコードが返されます。この例では、`hackernews`テーブルのコメントに`ClickHouse`が含まれるすべてのインスタンスを探します（大文字と小文字は区別されません）：

![Hacker Newsデータの検索](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/search-hn.png)

注意：入力された値に一致するすべてのフィールドが返されます。たとえば、上記のスクリーンショットの3番目のレコードは`by`フィールドで「breakfast」と一致しませんが、`text`フィールドでは一致します：

![本文での一致](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/match-in-body.png)

### ページネーション設定の調整 {#adjusting-pagination-settings}

デフォルトでは、クエリ結果ペインは単一のページにすべての結果レコードを表示します。より大きな結果セットでは、表示を容易にするために結果をページネーションする方が望ましい場合があります。これは、結果ペインの右下隅にあるページネーションセレクタを使用して実行できます：

![ページネーションオプション](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/pagination.png)

ページサイズを選択すると、結果セットにページネーションが直ちに適用され、結果ペインのフッターの中央にナビゲーションオプションが表示されます：

![ページネーションナビゲーション](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/pagination-nav.png)

### クエリ結果データのエクスポート {#exporting-query-result-data}

クエリ結果セットは、SQLコンソールから直接CSV形式に簡単にエクスポートできます。そのためには、結果ペインツールバーの右側にある`•••`メニューを開き、「CSVとしてダウンロード」を選択します。

![CSVとしてダウンロード](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/download-as-csv.png)

## クエリデータの視覚化 {#visualizing-query-data}

いくつかのデータは、チャート形式での解釈が容易です。SQLコンソールからクエリ結果データを使用して視覚化を数回のクリックで迅速に作成できます。例として、NYCタクシー旅行の週間統計を計算するクエリを使用します：

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

![表形式のクエリ結果](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/tabular-query-results.png)

視覚化なしでは、これらの結果は解釈が難しいです。これをチャートに変換しましょう。

### チャートの作成 {#creating-charts}

視覚化の構築を開始するには、クエリ結果ペインツールバーから「チャート」オプションを選択します。チャート設定ペインが表示されます：

![クエリからチャートへ切り替え](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/switch-from-query-to-chart.png)

`trip_total`を`week`ごとに追跡するシンプルな棒グラフを作成します。これを実現するために、`week`フィールドをx軸にドラッグし、`trip_total`フィールドをy軸にドラッグします：

![週ごとの旅行合計](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/trip-total-by-week.png)

ほとんどのチャートタイプは、数値軸に複数のフィールドをサポートしています。説明のために、fare_totalフィールドをy軸にドラッグします：

![棒グラフ](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/bar-chart.png)

### チャートのカスタマイズ {#customizing-charts}

SQLコンソールは、チャート設定ペインのチャートタイプセレクタから選択できる10種類のチャートタイプをサポートしています。たとえば、前のチャートタイプを棒グラフからエリアチャートに簡単に変更できます：

![棒グラフからエリアチャートに変更](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/change-from-bar-to-area.png)

チャートタイトルは、データを提供するクエリの名前と一致します。クエリの名前を更新すると、チャートタイトルも更新されます：

![クエリ名を更新](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/update-query-name.png)

さらに、チャート設定ペインの「高度な」セクションで、いくつかの高度なチャート特性を調整することもできます。まず、次の設定を調整します：

- サブタイトル
- 軸タイトル
- x軸のラベルの向き

チャートはそれに応じて更新されます：

![サブタイトルなどを更新](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/update-subtitle-etc.png)

状況によっては、各フィールドの軸スケールを独立して調整する必要がある場合があります。これは、「高度な」セクションで、軸範囲のminおよびmax値を指定することで実現できます。例として、上記のチャートは良好に見えますが、`trip_total`と`fare_total`フィールドの相関関係を示すために、軸範囲を調整する必要があります：

![軸スケールを調整](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/adjust-axis-scale.png)
