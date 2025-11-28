---
sidebar_label: 'ダッシュボード'
slug: /cloud/manage/dashboards
title: 'ダッシュボード'
description: 'SQL Console のダッシュボード機能を使用すると、保存済みクエリから作成した可視化結果をまとめて共有できます。'
doc_type: 'guide'
keywords: ['ClickHouse Cloud', 'ダッシュボード', 'データ可視化', 'SQL コンソールのダッシュボード', 'クラウド分析']
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

SQL Console のダッシュボード機能を使用すると、保存したクエリから得られた可視化をまとめて共有できます。まずはクエリを保存して可視化し、その可視化結果をダッシュボードに追加し、クエリパラメータを使ってダッシュボードをインタラクティブにしてみてください。



## コアコンセプト {#core-concepts}

### クエリの共有 {#query-sharing}

ダッシュボードを同僚と共有するには、必ず背後にある保存済みクエリも共有してください。可視化を表示するには、ユーザーは少なくとも、その保存済みクエリへの読み取り専用アクセス権を持っている必要があります。 

### インタラクティビティ {#interactivity}

[クエリパラメータ](/sql-reference/syntax#defining-and-using-query-parameters)を使用して、ダッシュボードをインタラクティブにできます。たとえば、`WHERE` 句にクエリパラメータを追加して、フィルタとして機能させることができます。 

可視化の設定で「filter」タイプを選択すると、**Global** フィルタのサイドペインからクエリパラメータの入力欄を表示・非表示に切り替えられます。ダッシュボード上の別のオブジェクト（テーブルなど）にリンクすることで、クエリパラメータの入力欄を切り替えることもできます。詳しくは、以下のクイックスタートガイドの「[フィルタを構成する](/cloud/manage/dashboards#configure-a-filter)」セクションを参照してください。 



## クイックスタート {#quick-start}

[query\_log](/operations/system-tables/query_log) システムテーブルを使用して、ClickHouse サービスを監視するためのダッシュボードを作成します。 



## クイックスタート {#quick-start-1}

### 保存済みクエリを作成する {#create-a-saved-query}

すでに可視化用の保存済みクエリがある場合は、この手順はスキップできます。 

新しいクエリタブを開きます。ClickHouse のシステムテーブルを使用して、あるサービスに対する 1 日あたりのクエリボリュームをカウントするクエリを書いてみます:

<Image img={dashboards_2} size="md" alt="保存済みクエリを作成する" border/>

クエリの結果はテーブル形式で表示することも、チャートビューから可視化の作成を開始することもできます。次のステップに進むため、このクエリを `queries over time` という名前で保存しておきます:

<Image img={dashboards_3} size="md" alt="クエリを保存する" border/>

保存済みクエリに関する詳細なドキュメントは、[Saving a Query セクション](/cloud/get-started/sql-console#saving-a-query)にあります。

続けて、クエリ種別ごとのクエリ数をカウントする `query count by query kind` という別のクエリも作成・保存します。以下は SQL コンソール内でのデータの棒グラフでの可視化です。 

<Image img={dashboards_4} size="md" alt="クエリ結果の棒グラフ可視化" border/>

これで 2 つのクエリができたので、それらを収集して可視化するためのダッシュボードを作成しましょう。 

### ダッシュボードを作成する {#create-a-dashboard}

Dashboards パネルに移動し、「New Dashboard」をクリックします。名前を付けると、最初のダッシュボードが作成されます。

<Image img={dashboards_5} size="md" alt="新しいダッシュボードを作成する" border/>

### 可視化を追加する {#add-a-visualization}

現在、`queries over time` と `query count by query kind` の 2 つの保存済みクエリがあります。まず最初のクエリを折れ線グラフとして可視化してみましょう。可視化にタイトルとサブタイトルを付け、可視化するクエリを選択します。次にチャートタイプで「Line」を選択し、x 軸と y 軸を設定します。

<Image img={dashboards_6} size="md" alt="可視化を追加する" border/>

ここでは、数値フォーマット、凡例レイアウト、軸ラベルなど、追加のスタイル設定も行うことができます。 

次に、2 番目のクエリをテーブルとして可視化し、折れ線グラフの下に配置します。 

<Image img={dashboards_7} size="md" alt="クエリ結果をテーブルとして可視化する" border/>

これで 2 つの保存済みクエリを可視化した、最初のダッシュボードが完成しました。

### フィルターを設定する {#configure-a-filter}

クエリ種別に対するフィルターを追加して、このダッシュボードをインタラクティブにし、Insert クエリに関連するトレンドだけを表示できるようにしましょう。これは [query parameters](/sql-reference/syntax#defining-and-using-query-parameters) を使って実現します。 

折れ線グラフの横にある 3 つの点をクリックし、クエリ横の鉛筆ボタンをクリックしてインラインクエリエディターを開きます。ここで、ダッシュボード上から直接、基盤となる保存済みクエリを編集できます。 

<Image img={dashboards_8} size="md" alt="基盤となるクエリを編集する" border/>

ここで黄色の「run query」ボタンを押すと、先ほどのクエリが Insert クエリだけに絞り込まれた状態で実行されるのが分かります。保存ボタンをクリックしてクエリを更新してください。チャート設定に戻ると、折れ線グラフにフィルターを適用できるようになります。 

次に、上部リボンの「Global Filters」を使って、入力値を変更することでフィルターを切り替えられます。 

<Image img={dashboards_9} size="md" alt="グローバルフィルターを調整する" border/>

折れ線グラフのフィルターをテーブルと連動させたいとします。その場合は、再度可視化設定に戻り、`query_kind` クエリパラメーターの値のソースをテーブルに変更し、リンク元フィールドとして `query_kind` カラムを選択します。 

<Image img={dashboards_10} size="md" alt="クエリパラメーターを変更する" border/>

これで、「query kind 別」テーブルから直接折れ線グラフ上のフィルターを制御できるようになり、ダッシュボードをインタラクティブにできます。 

<Image img={dashboards_11} size="md" alt="折れ線グラフ上のフィルターを制御する" border/>
