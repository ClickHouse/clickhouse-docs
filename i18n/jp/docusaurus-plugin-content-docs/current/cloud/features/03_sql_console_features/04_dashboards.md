---
sidebar_label: 'ダッシュボード'
slug: /cloud/manage/dashboards
title: 'ダッシュボード'
description: 'SQL コンソールのダッシュボード機能により、保存済みクエリに基づく可視化を収集および共有できます。'
doc_type: 'guide'
keywords: ['ClickHouse Cloud', 'ダッシュボード', 'データの可視化', 'SQL コンソール ダッシュボード', 'クラウド分析']
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

SQL Console のダッシュボード機能を使用すると、保存したクエリから作成した可視化を収集して共有できます。まずクエリを保存して可視化を作成し、それらをダッシュボードに追加して、クエリパラメータを使ってダッシュボードをインタラクティブにします。



## 基本概念 {#core-concepts}

### クエリの共有 {#query-sharing}

ダッシュボードを同僚と共有する場合は、必ず基となる保存済みクエリも共有してください。可視化を表示するには、ユーザーは最低限、基となる保存済みクエリへの読み取り専用アクセス権が必要です。

### インタラクティブ機能 {#interactivity}

[クエリパラメータ](/sql-reference/syntax#defining-and-using-query-parameters)を使用して、ダッシュボードをインタラクティブにできます。例えば、`WHERE`句にクエリパラメータを追加することで、フィルタとして機能させることができます。

可視化設定で「filter」タイプを選択することで、**Global**フィルタサイドペインからクエリパラメータ入力を切り替えることができます。また、ダッシュボード上の別のオブジェクト(テーブルなど)にリンクすることでも、クエリパラメータ入力を切り替えることができます。詳細については、以下のクイックスタートガイドの「[フィルタの設定](/cloud/manage/dashboards#configure-a-filter)」セクションを参照してください。


## クイックスタート {#quick-start}

[query_log](/operations/system-tables/query_log) システムテーブルを使用して、ClickHouseサービスを監視するダッシュボードを作成しましょう。


## クイックスタート {#quick-start-1}

### 保存済みクエリの作成 {#create-a-saved-query}

可視化する保存済みクエリが既にある場合は、この手順をスキップできます。

新しいクエリタブを開きます。ClickHouseシステムテーブルを使用して、サービス上の日別クエリ量をカウントするクエリを記述しましょう:

<Image img={dashboards_2} size='md' alt='保存済みクエリの作成' border />

クエリの結果はテーブル形式で表示するか、チャートビューから可視化の構築を開始できます。次の手順では、クエリを`queries over time`として保存します:

<Image img={dashboards_3} size='md' alt='クエリの保存' border />

保存済みクエリに関する詳細なドキュメントは、[クエリの保存セクション](/cloud/get-started/sql-console#saving-a-query)を参照してください。

別のクエリ`query count by query kind`を作成して保存し、クエリ種別ごとのクエリ数をカウントできます。以下は、SQLコンソールでのデータの棒グラフ可視化です。

<Image
  img={dashboards_4}
  size='md'
  alt="クエリ結果の棒グラフ可視化"
  border
/>

2つのクエリができたので、これらのクエリを可視化して集約するダッシュボードを作成しましょう。

### ダッシュボードの作成 {#create-a-dashboard}

ダッシュボードパネルに移動し、「New Dashboard」をクリックします。名前を割り当てると、最初のダッシュボードの作成が完了します。

<Image img={dashboards_5} size='md' alt='新しいダッシュボードの作成' border />

### 可視化の追加 {#add-a-visualization}

保存済みクエリが2つあります:`queries over time`と`query count by query kind`です。最初のクエリを折れ線グラフとして可視化しましょう。可視化にタイトルとサブタイトルを付け、可視化するクエリを選択します。次に、「Line」チャートタイプを選択し、x軸とy軸を割り当てます。

<Image img={dashboards_6} size='md' alt='可視化の追加' border />

ここでは、数値フォーマット、凡例レイアウト、軸ラベルなど、追加のスタイル変更も行えます。

次に、2番目のクエリをテーブルとして可視化し、折れ線グラフの下に配置しましょう。

<Image
  img={dashboards_7}
  size='md'
  alt='クエリ結果をテーブルとして可視化'
  border
/>

2つの保存済みクエリを可視化して、最初のダッシュボードを作成しました。

### フィルタの設定 {#configure-a-filter}

クエリ種別にフィルタを追加して、Insertクエリに関連するトレンドのみを表示できるようにし、このダッシュボードをインタラクティブにしましょう。この作業は[クエリパラメータ](/sql-reference/syntax#defining-and-using-query-parameters)を使用して実現します。

折れ線グラフの横にある3つの点をクリックし、クエリの横にある鉛筆ボタンをクリックして、インラインクエリエディタを開きます。ここでは、ダッシュボードから直接、基になる保存済みクエリを編集できます。

<Image img={dashboards_8} size='md' alt='基になるクエリの編集' border />

黄色のクエリ実行ボタンを押すと、先ほどと同じクエリがinsertクエリのみでフィルタリングされて表示されます。保存ボタンをクリックしてクエリを更新します。チャート設定に戻ると、折れ線グラフをフィルタリングできるようになります。

上部リボンのグローバルフィルタを使用して、入力を変更することでフィルタを切り替えることができます。

<Image img={dashboards_9} size='md' alt='グローバルフィルタの調整' border />

折れ線グラフのフィルタをテーブルにリンクしたい場合は、可視化設定に戻り、query_kindクエリパラメータの値ソースをテーブルに変更し、リンクするフィールドとしてquery_kind列を選択します。

<Image img={dashboards_10} size='md' alt='クエリパラメータの変更' border />

これで、種別別クエリテーブルから直接折れ線グラフのフィルタを制御して、ダッシュボードをインタラクティブにすることができます。

<Image
  img={dashboards_11}
  size='md'
  alt='折れ線グラフのフィルタを制御'
  border
/>
