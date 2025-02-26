---
sidebar_title: SQLコンソール
slug: /cloud/get-started/sql-console
description: SQLコンソールを使用してクエリを実行し、視覚化を作成します。
keywords: [sqlコンソール, sqlクライアント, クラウドコンソール, コンソール]
---

# SQLコンソール

SQLコンソールは、ClickHouse Cloud内のデータベースを探索し、クエリを実行するための最も迅速で簡単な方法です。 SQLコンソールを使用すると、次のことができます。

- ClickHouse Cloudサービスに接続する
- テーブルデータを表示、フィルタリング、ソートする
- ほんの数回のクリックでクエリを実行し、結果データを視覚化する
- クエリをチームメンバーと共有し、より効果的に協力する

### テーブルの探索 {#exploring-tables}

### テーブルリストとスキーマ情報の表示 {#viewing-table-list-and-schema-info}

ClickHouseインスタンスに含まれるテーブルの概要は、左側のサイドバーエリアで確認できます。左側のバーの上部にあるデータベースセレクターを使用して、特定のデータベース内のテーブルを表示します。

![テーブルリストとスキーマ](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/table-list-and-schema.png)

リスト内のテーブルは展開して、カラムやタイプを表示することもできます。

![カラムの表示](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/view-columns.png)

### テーブルデータの探索 {#exploring-table-data}

リスト内のテーブルをクリックして、新しいタブで開きます。 テーブルビューでは、データを簡単に表示、選択、コピーできます。 Microsoft ExcelやGoogle Sheetsなどのスプレッドシートアプリケーションにコピー＆ペーストすると、構造とフォーマットが保持されることに注意してください。 フッターのナビゲーションを使用して、テーブルデータのページを切り替えることができます（30行ごとにページネーションされています）。

![abc](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/abc.png)

### セルデータの検査 {#inspecting-cell-data}

セルインスペクターツールを使用して、単一のセル内に含まれる大量のデータを表示できます。 開くには、セルを右クリックし、「セルを検査」を選択します。 セルインスペクターの内容は、インスペクターの内容の右上隅にあるコピーアイコンをクリックすることでコピーできます。

![セル内容の検査](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/inspecting-cell-content.png)

## テーブルのフィルタリングとソート {#filtering-and-sorting-tables}

### テーブルのソート {#sorting-a-table}

SQLコンソールでテーブルをソートするには、テーブルを開き、ツールバーの「ソート」ボタンを選択します。このボタンをクリックすると、ソートを構成するためのメニューが開きます。 ソートするカラムを選択し、ソートの順序（昇順または降順）を構成できます。「適用」を選択するか、Enterを押してテーブルをソートします。

![カラムでの降順ソート](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/sort-descending-on-column.png)

SQLコンソールでは、テーブルに対して複数のソートを追加することもできます。「ソート」ボタンを再度クリックして、別のソートを追加します。

:::note
ソートは、ソートパネルに表示される順序（上から下）で適用されます。 ソートを削除するには、単にそのソートの隣にある「x」ボタンをクリックします。
:::

### テーブルのフィルタリング {#filtering-a-table}

SQLコンソールでテーブルをフィルタリングするには、テーブルを開き、「フィルター」ボタンを選択します。 ソートと同様に、このボタンをクリックするとフィルターを構成するためのメニューが開きます。 フィルタリングするカラムを選択し、必要な条件を選択できます。 SQLコンソールは、カラムに含まれるデータのタイプに応じたフィルターオプションをインテリジェントに表示します。

![GSMと等しいラジオカラムのフィルタ](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/filter-on-radio-column-equal-gsm.png)

フィルターが満足できるものであれば、「適用」を選択してデータをフィルタリングします。また、以下のように追加のフィルターを追加することもできます。

![2000より大きい範囲のフィルターを追加](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/add-more-filters.png)

ソート機能と同様に、フィルターを削除するには、その隣にある「x」ボタンをクリックします。

### フィルタリングとソートを同時に {#filtering-and-sorting-together}

SQLコンソールでは、同時にテーブルをフィルタリングとソートできます。 これを行うには、上記の手順を使用してすべての希望するフィルターとソートを追加し、「適用」ボタンをクリックします。

![フィルタリングとソートを同時に](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/filtering-and-sorting-together.png)

### フィルターとソートからクエリを作成する {#creating-a-query-from-filters-and-sorts}

SQLコンソールでは、フィルターとソートをワンクリックで直接クエリに変換できます。 ツールバーからフィルターとソートのパラメーターを選択し、「クエリを作成」ボタンを選択します。「クエリを作成」をクリックすると、テーブルビューに含まれるデータに対応するSQLコマンドであらかじめ入力された新しいクエリタブが開きます。

![フィルターとソートからクエリを作成](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/create-a-query-from-sorts-and-filters.png)

:::note
「クエリを作成」機能を使用する際に、フィルターやソートは必須ではありません。
:::

SQLコンソールでのクエリに関する詳細は、(link) クエリドキュメントを読んで学ぶことができます。

## クエリの作成と実行 {#creating-and-running-a-query}

### クエリの作成 {#creating-a-query}

SQLコンソールで新しいクエリを作成する方法は2つあります。

- タブバーにある「+」ボタンをクリックする
- 左側のサイドバーのクエリリストから「新しいクエリ」ボタンを選択する

  ![クエリを作成](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/creating-a-query.png)

### クエリの実行 {#running-a-query}

クエリを実行するには、SQLエディタにSQLコマンドを入力し、「実行」ボタンをクリックするか、ショートカット `cmd / ctrl + enter` を使用します。 複数のコマンドを連続して記述して実行するには、各コマンドの後にセミコロンを追加することを忘れないでください。

クエリエクスキューションオプション
デフォルトでは、実行ボタンをクリックすると、SQLエディタに含まれるすべてのコマンドが実行されます。 SQLコンソールは、他の2つのクエリエクスキューションオプションもサポートしています：

- 選択したコマンドを実行
- カーソル位置のコマンドを実行

選択したコマンドを実行するには、目的のコマンドまたはコマンドのシーケンスを強調表示し、「実行」ボタンをクリックします（または `cmd / ctrl + enter` ショートカットを使用します）。 選択があるときに、SQLエディタのコンテキストメニュー（エディタ内を右クリックすることで開く）から「選択したものを実行」を選択することもできます。

![選択したクエリを実行](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/run-selected-query.png)

カーソル位置でコマンドを実行するには、次の2つのいずれかの方法で実行できます：

- 拡張実行オプションメニューから「カーソルで」を選択します（または対応する `cmd / ctrl + shift + enter` キーボードショートカットを使用します）

  ![カーソルで実行](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/run-at-cursor-2.png)

  - SQLエディタのコンテキストメニューから「カーソルで実行」を選択します

  ![カーソルで実行](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/run-at-cursor.png)

:::note
カーソル位置に存在するコマンドは、実行時に黄色く点滅します。
:::

### クエリのキャンセル {#canceling-a-query}

クエリが実行中の間、クエリエディタツールバーの「実行」ボタンは「キャンセル」ボタンに置き換えられます。このボタンをクリックするか、`Esc` を押すことでクエリをキャンセルできます。注意：キャンセル後も、すでに返された結果は保持されます。

![クエリをキャンセル](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/cancel-a-query.png)

### クエリの保存 {#saving-a-query}

クエリを保存することで、後で簡単に見つけてチームメンバーと共有できるようになります。 SQLコンソールでは、クエリをフォルダーに整理することもできます。

クエリを保存するには、ツールバーの「実行」ボタンのすぐ隣にある「保存」ボタンをクリックします。 desiredな名前を入力し、「クエリを保存」をクリックします。

:::note
ショートカット `cmd / ctrl + s` を使用すると、現在のクエリタブの作業も保存されます。
:::

![クエリを保存](@site/i18n/ja/docusaurus-plugin-content-docs/current/images/sql-console-save-query.png)

または、「無題のクエリ」をツールバーでクリックし、名前を調整してEnterを押すことで、同時にクエリの名前を付けて保存することもできます：

![クエリの名前を変更](../../images/sql-console-rename.png)

### クエリの共有 {#query-sharing}

SQLコンソールでは、クエリをチームメンバーと簡単に共有できます。 SQLコンソールは、グローバルおよびユーザー単位で調整可能な4つのアクセスレベルをサポートしています：

- 所有者（共有オプションを調整可能）
- 書き込みアクセス
- 読み取り専用アクセス
- アクセスなし

クエリを保存した後、「共有」ボタンをツールバーでクリックします。 共有オプションのモーダルが表示されます：

![クエリを共有](../../images/sql-console-share.png)

サービスにアクセスできるすべての組織メンバーのクエリアクセスを調整するには、上部の行のアクセスレベルセレクターを調整するだけです：

![アクセスを編集](../../images/sql-console-edit-access.png)

上記を適用すると、SQLコンソールにアクセスできるすべてのチームメンバーがクエリを表示（および実行）できるようになります。

特定のメンバーのクエリアクセスを調整するには、「チームメンバーを追加」セレクターから目的のチームメンバーを選択します：

![チームメンバーを追加](../../images/sql-console-add-team.png)

チームメンバーを選択すると、アクセスレベルセレクターとともに新しい行アイテムが表示されます：

![チームメンバーアクセスを編集](../../images/sql-console-edit-member.png)

### 共有クエリへのアクセス {#accessing-shared-queries}

クエリがあなたと共有されている場合、それはSQLコンソールの左側のサイドバーの「クエリ」タブに表示されます：

![クエリにアクセス](../../images/sql-console-access-queries.png)

### クエリへのリンク（パーマリンク） {#linking-to-a-query-permalinks}

保存されたクエリはパーマリンクされているため、共有されたクエリにリンクを送信し、受信し、直接開くことができます。

クエリ内に存在する可能性のあるパラメータの値は、自動的に保存されたクエリURLにクエリパラメータとして追加されます。 たとえば、クエリに `{start_date: Date}` と `{end_date: Date}` パラメータが含まれている場合、パーマリンクは次のようになります： `https://console.clickhouse.cloud/services/:serviceId/console/query/:queryId?param_start_date=2015-01-01&param_end_date=2016-01-01`。

## 高度なクエリ機能 {#advanced-querying-features}

### クエリ結果の検索 {#searching-query-results}

クエリが実行された後、結果ペインの検索入力を使用して返された結果セットを迅速に検索できます。この機能は、追加の `WHERE` 句の結果をプレビューしたり、特定のデータが結果セットに含まれていることを確認したりするのに役立ちます。 検索入力に値を入力すると、結果ペインが更新され、入力した値に一致するエントリを含むレコードが返されます。この例では、`ClickHouse` を含むコメントのために `hackernews` テーブル内の `breakfast` のすべてのインスタンスを探します（大文字と小文字を区別しない）：

![Hacker Newsデータの検索](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/search-hn.png)

注意：入力した値に一致する任意のフィールドが返されます。 たとえば、上記のスクリーンショットの3番目のレコードは `by` フィールド内で‘breakfast’と一致しませんが、`text` フィールドは一致します。

![本文での一致](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/match-in-body.png)

### ページネーション設定の調整 {#adjusting-pagination-settings}

デフォルトでは、クエリ結果ペインにすべての結果レコードが単一のページに表示されます。 より大きな結果セットの場合、結果を簡単に表示するためにページネーションを使用する方が望ましい場合があります。 ページネーションセレクターを使用して簡単にこれを実現できます。ペインの右下隅にあります：
![ページネーションオプション](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/pagination.png)

ページサイズを選択すると、結果セットに即座にページネーションが適用され、結果ペインのフッターの中央にナビゲーションオプションが表示されます。

![ページネーションナビゲーション](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/pagination-nav.png)

### クエリ結果データのエクスポート {#exporting-query-result-data}

クエリ結果セットは、SQLコンソールから直接CSV形式で簡単にエクスポートできます。 そのためには、結果ペインツールバーの右側にある `•••` メニューを開き、「CSVとしてダウンロード」を選択します。

![CSVとしてダウンロード](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/download-as-csv.png)

## クエリデータの視覚化 {#visualizing-query-data}

一部のデータは、チャート形式でより簡単に解釈できます。 SQLコンソールから直接、クエリ結果データから視覚化を迅速に作成できます。 例として、NYCタクシー旅行の週間統計を計算するクエリを使用します：

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

![タブularクエリ結果](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/tabular-query-results.png)

視覚化がないと、これらの結果は解釈が難しくなります。 では、これらをチャートに変えてみましょう。

### チャートの作成 {#creating-charts}

視覚化を構築するために、クエリ結果ペインのツールバーから「チャート」オプションを選択します。 チャート設定ペインが表示されます：

![クエリからチャートに切り替え](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/switch-from-query-to-chart.png)

`week` による `trip_total` を追跡する単純な棒グラフを作成します。これを達成するために、`week` フィールドをx軸に、`trip_total` フィールドをy軸にドラッグします。

![週ごとの旅行総数](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/trip-total-by-week.png)

ほとんどのチャートタイプは、数値軸に複数のフィールドをサポートしています。 これを示すために、fare_totalフィールドをy軸にもドラッグします：

![棒グラフ](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/bar-chart.png)

### チャートのカスタマイズ {#customizing-charts}

SQLコンソールは、チャート設定ペインのチャートタイプセレクターから選択できる10種類のチャートタイプをサポートしています。 たとえば、前のチャートタイプを棒グラフから面グラフに簡単に変更できます。

![棒グラフから面グラフに変更](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/change-from-bar-to-area.png)

チャートのタイトルは、データを提供するクエリの名前と一致します。クエリの名前を更新すると、チャートのタイトルも更新されます。

![クエリ名の更新](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/update-query-name.png)

チャート設定ペインの「詳細」セクションで、より高度なチャート特性も調整できます。これを始めるために、次の設定を調整します：

- サブタイトル
- 軸タイトル
- x軸のラベルの向き

私たちのチャートは次のように更新されます：

![サブタイトル等の更新](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/update-subtitle-etc.png)

いくつかのシナリオでは、各フィールドの軸スケールを独立して調整する必要があるかもしれません。 これは、軸範囲の最小値と最大値を指定することによって、チャート設定ペインの「詳細」セクションで簡単に実行できます。例として、上記のチャートはうまく見えますが、`trip_total` と `fare_total` フィールド間の相関関係を示すために軸範囲を調整する必要があります：

![軸スケールの調整](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/adjust-axis-scale.png)
