---
sidebar_label: 'ダッシュボード'
slug: '/cloud/manage/dashboards'
title: 'ダッシュボード'
description: 'SQLコンソールのダッシュボード機能を使用すると、保存されたクエリからの可視化情報を収集および共有できます。'
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

SQLコンソールのダッシュボード機能を使うと、保存されたクエリから視覚化を収集して共有できます。まずはクエリを保存して視覚化し、ダッシュボードにクエリの視覚化を追加し、クエリパラメータを使ってダッシュボードをインタラクティブにするところから始めましょう。

## 基本概念 {#core-concepts}

### クエリの共有 {#query-sharing}

ダッシュボードを同僚と共有するには、基盤となる保存されたクエリも共有してください。視覚化を表示するには、ユーザーは少なくとも基盤となる保存されたクエリに対して読み取り専用アクセス権を持っている必要があります。

### インタラクティビティ {#interactivity}

[クエリパラメータ](/sql-reference/syntax#defining-and-using-query-parameters) を使用してダッシュボードをインタラクティブにします。たとえば、`WHERE`句にクエリパラメータを追加してフィルターとして機能させることができます。

視覚化設定で「フィルター」タイプを選択することで、**Global**フィルターサイドペインからクエリパラメータ入力を切り替えることができます。また、ダッシュボード上の別のオブジェクト（テーブルなど）とリンクすることでクエリパラメータ入力を切り替えることもできます。以下のクイックスタートガイドの「[フィルターを設定する](/cloud/manage/dashboards#configure-a-filter)」セクションもご覧ください。

## クイックスタート {#quick-start}

[query_log](/operations/system-tables/query_log) システムテーブルを使用して、ClickHouseサービスを監視するダッシュボードを作成しましょう。

## クイックスタート {#quick-start-1}

### 保存されたクエリを作成する {#create-a-saved-query}

視覚化するための保存されたクエリがすでにある場合は、このステップをスキップできます。

新しいクエリタブを開いて、ClickHouseのシステムテーブルを使用してサービスごとの日毎にクエリボリュームをカウントするクエリを記述しましょう：

<Image img={dashboards_2} size="md" alt="保存されたクエリを作成する" border/>

クエリの結果はテーブル形式で表示することもでき、チャートビューから視覚化を構築し始めることもできます。次のステップでは、クエリを `queries over time` として保存します：

<Image img={dashboards_3} size="md" alt="クエリを保存" border/>

保存されたクエリに関する詳細なドキュメントは、[クエリを保存するセクション](/cloud/get-started/sql-console#saving-a-query)を参照してください。

別のクエリ `query count by query kind` を作成して、クエリの種類ごとのクエリ数をカウントすることもできます。以下は、SQLコンソールにおけるデータのバーグラフ視覚化です。

<Image img={dashboards_4} size="md" alt="クエリ結果のバーグラフ視覚化" border/>

2つのクエリができたので、これらのクエリを視覚化し収集するダッシュボードを作成しましょう。

### ダッシュボードを作成する {#create-a-dashboard}

ダッシュボードパネルに移動し、「新しいダッシュボード」をクリックします。名前を付けたら、最初のダッシュボードを正常に作成できました！

<Image img={dashboards_5} size="md" alt="新しいダッシュボードを作成" border/>

### 視覚化を追加する {#add-a-visualization}

保存された2つのクエリ、`queries over time` と `query count by query kind` があります。最初のクエリを折れ線グラフとして視覚化してみましょう。視覚化にタイトルとサブタイトルを付け、視覚化するクエリを選択します。次に、「ライン」チャートタイプを選択し、x軸とy軸を割り当てます。

<Image img={dashboards_6} size="md" alt="視覚化を追加" border/>

ここでは、数値フォーマット、凡例のレイアウト、および軸ラベルなど、さらにスタイルの変更を行うことができます。

次に、2つ目のクエリをテーブルとして視覚化し、折れ線グラフの下に配置しましょう。

<Image img={dashboards_7} size="md" alt="クエリ結果をテーブルとして視覚化" border/>

2つの保存されたクエリを視覚化することにより、最初のダッシュボードを作成しました！

### フィルターを設定する {#configure-a-filter}

クエリの種類に基づくフィルターを追加して、Insertクエリに関連するトレンドのみを表示できるように、このダッシュボードをインタラクティブにしましょう。この作業は、[クエリパラメータ](/sql-reference/syntax#defining-and-using-query-parameters)を使用して実現します。

折れ線グラフの隣にある3つのドットをクリックし、クエリの横にあるペンのボタンをクリックしてインラインクエリエディタを開きます。ここで、ダッシュボードから直接基盤となる保存されたクエリを編集できます。

<Image img={dashboards_8} size="md" alt="基盤となるクエリを編集" border/>

今、黄色の実行クエリボタンを押すと、先ほどのクエリがInsertクエリのみにフィルタリングされて表示されます。クエリを更新するために保存ボタンをクリックしてください。チャート設定に戻ると、折れ線グラフをフィルタリングできるようになります。

今、上部のリボンにあるGlobal Filtersを使用して、入力を変更することでフィルターを切り替えることができます。

<Image img={dashboards_9} size="md" alt="グローバルフィルターを調整" border/>

折れ線グラフのフィルターをテーブルにリンクしたい場合は、視覚化設定に戻り、`query_kind`クエリパラメータの値ソースをテーブルに変更し、リンクするフィールドとして`query_kind`カラムを選択します。

<Image img={dashboards_10} size="md" alt="クエリパラメータを変更" border/>

これで、クエリの種類テーブルから折れ線グラフのフィルターを直接制御できるようになり、ダッシュボードをインタラクティブにできます。

<Image img={dashboards_11} size="md" alt="折れ線グラフのフィルターを制御" border/>
