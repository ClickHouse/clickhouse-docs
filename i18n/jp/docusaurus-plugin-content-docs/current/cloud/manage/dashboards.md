---
sidebar_label: 'ダッシュボード'
slug: /cloud/manage/dashboards
title: 'ダッシュボード'
description: 'SQLコンソールのダッシュボード機能により、保存されたクエリからの視覚化を収集して共有できます。'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
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

SQLコンソールのダッシュボード機能により、保存されたクエリからの視覚化を収集して共有できます。まずは、クエリを保存して視覚化し、ダッシュボードにクエリの視覚化を追加し、クエリパラメータを使用してダッシュボードをインタラクティブにしましょう。

## コア概念 {#core-concepts}

### クエリの共有 {#query-sharing}

ダッシュボードを同僚と共有するためには、基となる保存されたクエリも共有してください。視覚化を表示するには、ユーザーは最低限、基となる保存されたクエリに対する読み取り専用アクセス権を持っている必要があります。

### インタラクティブ性 {#interactivity}

[クエリパラメータ](/sql-reference/syntax#defining-and-using-query-parameters)を使用してダッシュボードをインタラクティブにします。たとえば、フィルターとして機能するために `WHERE`句にクエリパラメータを追加できます。

ビジュアライゼーション設定で「フィルター」タイプを選択することで、**グローバル**フィルターのサイドペインを介してクエリパラメータの入力を切り替えることができます。また、ダッシュボード上の別のオブジェクト（テーブルなど）にリンクすることで、クエリパラメータの入力を切り替えることもできます。以下のクイックスタートガイドの「[フィルターを設定する](/cloud/manage/dashboards#configure-a-filter)」セクションをご覧ください。

## クイックスタート {#quick-start}

[query_log](/operations/system-tables/query_log)システムテーブルを使用して、ClickHouseサービスを監視するためのダッシュボードを作成しましょう。

## クイックスタート {#quick-start-1}

### 保存されたクエリを作成する {#create-a-saved-query}

視覚化するためにすでに保存されたクエリがある場合、このステップをスキップできます。

新しいクエリタブを開きます。ClickHouseシステムテーブルを使用して、サービスごとのクエリ量を日単位でカウントするクエリを書きましょう：

<Image img={dashboards_2} size="md" alt="保存されたクエリの作成" border/>

クエリの結果をテーブル形式で表示するか、チャートビューから視覚化を構築し始めます。次のステップでは、クエリを `時間ごとのクエリ`として保存します：

<Image img={dashboards_3} size="md" alt="クエリの保存" border/>

保存されたクエリに関する詳細な文書は、[クエリの保存セクション](/cloud/get-started/sql-console#saving-a-query)で見つけることができます。

もう一つのクエリ、`クエリの種類ごとのクエリ数`を作成して、クエリの種類ごとのクエリ数をカウントしましょう。SQLコンソールのデータのバー チャート視覚化は以下の通りです。

<Image img={dashboards_4} size="md" alt="クエリ結果のバー チャート視覚化" border/>

2つのクエリがあるので、これらのクエリを視覚化して収集するためのダッシュボードを作成しましょう。

### ダッシュボードを作成する {#create-a-dashboard}

ダッシュボードパネルに移動し、「新しいダッシュボード」をクリックします。名前を割り当てたら、初めてのダッシュボードを作成できたことになります！

<Image img={dashboards_5} size="md" alt="新しいダッシュボードの作成" border/>

### 視覚化を追加する {#add-a-visualization}

保存されたクエリが2つあります、`時間ごとのクエリ`と`クエリの種類ごとのクエリ数`。最初のものを折れ線グラフとして視覚化しましょう。視覚化にタイトルとサブタイトルを付け、視覚化するクエリを選択します。次に、「ライン」チャートタイプを選択し、X軸とY軸を割り当てます。

<Image img={dashboards_6} size="md" alt="視覚化の追加" border/>

ここで、数値形式、凡例のレイアウト、軸ラベルなど、追加のスタイル変更を行うこともできます。

次に、2つ目のクエリをテーブルとして視覚化し、折れ線グラフの下に配置します。

<Image img={dashboards_7} size="md" alt="クエリ結果をテーブルとして視覚化" border/>

これで、2つの保存されたクエリを視覚化して、初めてのダッシュボードを作成しました！

### フィルタを設定する {#configure-a-filter}

クエリの種類にフィルタを追加して、Insertクエリに関連するトレンドのみを表示できるように、このダッシュボードをインタラクティブにしましょう。このタスクは、[クエリパラメータ](/sql-reference/syntax#defining-and-using-query-parameters)を使用して行います。

折れ線グラフの横にある3つの点をクリックし、クエリの横の鉛筆ボタンをクリックしてインラインクエリエディタを開きます。ここで、ダッシュボードから直接基となる保存されたクエリを編集できます。

<Image img={dashboards_8} size="md" alt="基となるクエリの編集" border/>

黄色のクエリ実行ボタンが押されると、以前と同じクエリがInsertクエリだけでフィルタされています。クエリを更新するために保存ボタンをクリックします。チャート設定に戻ると、折れ線グラフをフィルタリングできるようになります。

次に、上部リボンのグローバルフィルタを使用して、入力を変更することでフィルタを切り替えることができます。

<Image img={dashboards_9} size="md" alt="グローバルフィルタを調整" border/>

折れ線グラフのフィルタをテーブルにリンクしたいとしましょう。これを行うには、視覚化設定に戻り、query_kindクエリパラメータの値ソースをテーブルに変更し、リンクするフィールドとしてquery_kindカラムを選択します。

<Image img={dashboards_10} size="md" alt="クエリパラメータの変更" border/>

これで、クエリの種類ごとのテーブルから折れ線グラフのフィルタを直接制御できるようになり、ダッシュボードをインタラクティブにできます。

<Image img={dashboards_11} size="md" alt="折れ線グラフのフィルタを制御" border/>
