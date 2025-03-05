---
sidebar_label: ダッシュボード
slug: /cloud/manage/dashboards
title: ダッシュボード
---

import BetaBadge from '@theme/badges/BetaBadge';
import dashboards_2 from '@site/static/images/cloud/dashboards/2_dashboards.png';
import dashboards_3 from '@site/static/images/cloud/dashboards/3_dashboards.png';
import dashboards_4 from '@site/static/images/cloud/dashboards/4_dashboards.png';
import dashboards_5 from '@site/static/images/cloud/dashboards/5_dashboards.png';
import dashboards_6 from '@site/static/images/cloud/dashboards/6_dashboards.png';
import dashboards_7 from '@site/static/images/cloud/dashboards/7_dashboards.png';
import dashboards_8 from '@site/static/images/cloud/dashboards/8_dashboards.png';
import dashboards_9 from '@site/static/images/cloud/dashboards/9_dashboards.png';
import dashboards_10 from '@site/static/images/cloud/dashboards/10_dashboards.png';
import dashboards_11 from '@site/static/images/cloud/dashboards/11_dashboards.png';


# ダッシュボード

<BetaBadge />

SQLコンソールのダッシュボード機能を使うことで、保存したクエリからビジュアライゼーションを収集して共有できます。クエリを保存して可視化し、ダッシュボードにクエリのビジュアライゼーションを追加し、クエリパラメータを使ってダッシュボードをインタラクティブにすることから始めましょう。

## コア概念 {#core-concepts}

### クエリの共有 {#query-sharing}

同僚とダッシュボードを共有するには、基本となる保存したクエリも共有することを確認してください。ビジュアライゼーションを表示するには、ユーザーは基本となる保存したクエリに対して、最低限読み取り専用アクセスを持っている必要があります。

### インタラクティブ性 {#interactivity}

[クエリパラメータ](/sql-reference/syntax#defining-and-using-query-parameters)を使用してダッシュボードをインタラクティブにします。例えば、`WHERE`句にクエリパラメータを追加してフィルタとして機能させることができます。

ビジュアライゼーション設定で「フィルタ」タイプを選択することにより、**グローバル**フィルタのサイドペインを介してクエリパラメータ入力を切り替えることができます。また、ダッシュボード上の別のオブジェクト（例えばテーブル）にリンクすることによってクエリパラメータ入力を切り替えることも可能です。以下のクイックスタートガイドの「[フィルタの設定](/cloud/manage/dashboards#configure-a-filter)」セクションを参照してください。

## クイックスタート {#quick-start}

[query_log](/operations/system-tables/query_log)システムテーブルを使用して、ClickHouseサービスを監視するダッシュボードを作成してみましょう。

## クイックスタート {#quick-start-1}

### 保存されたクエリを作成 {#create-a-saved-query}

既に可視化するための保存されたクエリがある場合は、このステップをスキップできます。

新しいクエリタブを開きましょう。ClickHouseのシステムテーブルを使用して、日付ごとのクエリボリュームをカウントするクエリを書きます。

<img src={dashboards_2} alt="Create a saved query"/>

クエリの結果をテーブル形式で表示するか、チャートビューからビジュアライゼーションを開始できます。次のステップでは、クエリを`queries over time`として保存します。

<img src={dashboards_3} alt="Save query"/>

保存されたクエリに関するさらなるドキュメントは、[クエリの保存セクション](/cloud/get-started/sql-console#saving-a-query)で確認できます。

クエリの種類ごとにクエリの数をカウントするために、もう1つのクエリ`query count by query kind`を作成して保存します。以下は、SQLコンソールでのデータの棒グラフビジュアライゼーションです。

<img src={dashboards_4} alt="A bar chart visualization of a query's results"/>

2つのクエリがあるので、これらのクエリを可視化して集めるダッシュボードを作成しましょう。

### ダッシュボードを作成 {#create-a-dashboard}

ダッシュボードパネルに移動し、「新しいダッシュボード」をクリックします。名前を指定すると、初めてのダッシュボードが作成されます！

<img src={dashboards_5} alt="Create a new dashboard"/>

### ビジュアライゼーションを追加 {#add-a-visualization}

保存されたクエリは`queries over time`と`query count by query kind`の2つです。最初のクエリを折れ線グラフとして可視化しましょう。ビジュアライゼーションにタイトルとサブタイトルを付け、可視化するクエリを選択します。次に、「ライン」チャートタイプを選択し、x軸とy軸を指定します。

<img src={dashboards_6} alt="Add a visualization"/>

ここで、数値フォーマット、凡例のレイアウト、軸ラベルなどのスタイルの変更も行えます。

次に、2つ目のクエリをテーブルとして可視化し、折れ線グラフの下に配置しましょう。

<img src={dashboards_7} alt="Visualize query results as a table"/>

これで、2つの保存されたクエリを可視化して、初めてのダッシュボードを作成しました！

### フィルタを設定する {#configure-a-filter}

クエリの種類にフィルタを追加して、このダッシュボードをインタラクティブにしましょう。これにより、Insertクエリに関連するトレンドのみを表示できるようになります。このタスクは[クエリパラメータ](/sql-reference/syntax#defining-and-using-query-parameters)を使って達成します。

折れ線グラフの横にある3つのドットをクリックし、クエリの横にある鉛筆ボタンをクリックしてインラインクエリエディタを開きます。ここで、ダッシュボードから直接基になる保存クエリを編集できます。

<img src={dashboards_8} alt="Edit the underlying query"/>

今、黄色の実行クエリボタンを押すと、前と同じクエリがInsertクエリのみにフィルタされて表示されます。クエリを更新するために保存ボタンをクリックします。チャート設定に戻ると、折れ線グラフをフィルタできます。

次に、上部リボンのグローバルフィルタを使用して入力を変更することでフィルタを切り替えられるようになります。

<img src={dashboards_9} alt="Adjust global filters"/>

折れ線グラフのフィルタをテーブルにリンクさせたい場合には、ビジュアライゼーション設定に戻って、`query_kind`クエリパラメータの値ソースをテーブルに変更し、リンクするフィールドとして`query_kind`カラムを選択します。 

<img src={dashboards_10} alt="Changing query parameter"/>

これで、クエリの種類テーブルから折れ線グラフのフィルタを直接制御でき、ダッシュボードがインタラクティブになります。

<img src={dashboards_11} alt="Control the filter on the line chart"/>
