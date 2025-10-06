---
'sidebar_label': 'ダッシュボード'
'slug': '/cloud/manage/dashboards'
'title': 'ダッシュボード'
'description': 'SQL コンソールのダッシュボード機能は、保存されたクエリからビジュアライゼーションを収集して共有することを可能にします。'
'doc_type': 'guide'
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

SQLコンソールのダッシュボード機能では、保存されたクエリから視覚化を収集し、共有することができます。まずは、クエリを保存して視覚化し、視覚化をダッシュボードに追加し、クエリパラメータを使ってダッシュボードをインタラクティブにしましょう。

## コア概念 {#core-concepts}

### クエリ共有 {#query-sharing}

同僚とダッシュボードを共有するには、基礎となる保存されたクエリも共有する必要があります。視覚化を表示するためには、ユーザーは基礎となる保存されたクエリに対して、少なくとも読み取り専用のアクセス権を持っている必要があります。

### インタラクティビティ {#interactivity}

[クエリパラメータ](/sql-reference/syntax#defining-and-using-query-parameters)を使用して、ダッシュボードをインタラクティブにします。例えば、`WHERE`句にクエリパラメータを追加してフィルターとして機能させることができます。

**Global**フィルターのサイドペインを通じて、視覚化設定において「フィルター」タイプを選択することで、クエリパラメータ入力を切り替えることができます。また、ダッシュボード上の別のオブジェクト（テーブルなど）にリンクすることでクエリパラメータの入力を切り替えることもできます。以下のクイックスタートガイドの「[フィルターの設定](/cloud/manage/dashboards#configure-a-filter)」セクションをご覧ください。

## クイックスタート {#quick-start}

[query_log](/operations/system-tables/query_log)システムテーブルを使用して、ClickHouseサービスを監視するダッシュボードを作成しましょう。

## クイックスタート {#quick-start-1}

### 保存クエリを作成する {#create-a-saved-query}

視覚化するための保存クエリが既にある場合は、このステップをスキップできます。

新しいクエリタブを開きましょう。ClickHouseシステムテーブルを使用して、サービスごとのクエリ量を日別にカウントするクエリを書きます：

<Image img={dashboards_2} size="md" alt="保存クエリの作成" border/>

クエリの結果をテーブル形式で表示したり、チャートビューから視覚化の構築を開始したりできます。次のステップとして、クエリを`queries over time`として保存しましょう：

<Image img={dashboards_3} size="md" alt="クエリを保存" border/>

保存クエリに関する詳しいドキュメントは、[クエリの保存セクション](/cloud/get-started/sql-console#saving-a-query)でご覧になれます。

`query count by query kind`という別のクエリを作成し、クエリ種別ごとのクエリ数をカウントします。以下はSQLコンソールでのデータの棒グラフ視覚化です。

<Image img={dashboards_4} size="md" alt="クエリの結果の棒グラフ視覚化" border/>

2つのクエリが存在するので、これらのクエリを視覚化し、収集するダッシュボードを作成しましょう。

### ダッシュボードを作成する {#create-a-dashboard}

ダッシュボードパネルに移動し、「新しいダッシュボード」をクリックします。名前を割り当てれば、初めてのダッシュボードが成功裏に作成されます！

<Image img={dashboards_5} size="md" alt="新しいダッシュボードを作成" border/>

### 視覚化を追加する {#add-a-visualization}

2つの保存クエリ、`queries over time`と`query count by query kind`があります。最初のクエリを折れ線グラフとして視覚化してみましょう。視覚化にタイトルとサブタイトルを付け、視覚化するクエリを選択します。次に、「ライン」チャートタイプを選択し、x軸とy軸を設定します。

<Image img={dashboards_6} size="md" alt="視覚化を追加" border/>

ここで、数値のフォーマット、凡例の配置、軸ラベルなどの追加的なスタイル変更も行えます。

次に、2つ目のクエリをテーブルとして視覚化し、折れ線グラフの下に配置します。

<Image img={dashboards_7} size="md" alt="クエリ結果をテーブルとして視覚化" border/>

2つの保存クエリを視覚化することで、最初のダッシュボードを作成しました！

### フィルターを設定する {#configure-a-filter}

クエリ種別に関するトレンドだけを表示できるように、クエリ種別のフィルターを追加して、このダッシュボードをインタラクティブにしましょう。このタスクは、[クエリパラメータ](/sql-reference/syntax#defining-and-using-query-parameters)を使用して実行します。

折れ線グラフの横にある3つのドットをクリックし、クエリの横にある鉛筆ボタンをクリックしてインラインクエリエディタを開きます。ここで、ダッシュボードから直接基礎となる保存クエリを編集できます。

<Image img={dashboards_8} size="md" alt="基礎となるクエリの編集" border/>

これで、黄色の実行クエリボタンを押すと、以前と同じクエリが挿入クエリに絞り込まれた結果が表示されます。クエリを更新するために保存ボタンをクリックしてください。チャート設定に戻ると、折れ線グラフをフィルタリングできるようになります。

次に、上部リボンのGlobal Filtersを使用して、入力を変更することでフィルターを切り替えできます。

<Image img={dashboards_9} size="md" alt="グローバルフィルターを調整" border/>

折れ線グラフのフィルターをテーブルにリンクしたい場合は、視覚化設定に戻り、`query_kind`クエリパラメータの値ソースをテーブルに変更し、リンクするフィールドとして`query_kind`カラムを選択します。

<Image img={dashboards_10} size="md" alt="クエリパラメータの変更" border/>

これで、種別によるクエリから直接折れ線グラフのフィルターを制御し、ダッシュボードをインタラクティブにすることができます。

<Image img={dashboards_11} size="md" alt="折れ線グラフのフィルターを制御" border/>
