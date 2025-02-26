---
sidebar_label: ダッシュボード
slug: /cloud/manage/dashboards
title: ダッシュボード
---

import BetaBadge from '@theme/badges/BetaBadge';

# ダッシュボード

<BetaBadge />

SQLコンソールのダッシュボード機能を使用すると、保存されたクエリから視覚化を収集し、共有できます。クエリを保存して視覚化を行い、ダッシュボードにクエリの視覚化を追加し、クエリパラメータを使用してダッシュボードをインタラクティブにすることで、開始できます。

## コアコンセプト {#core-concepts}

### クエリの共有 {#query-sharing}

同僚とダッシュボードを共有するには、基本となる保存されたクエリも共有する必要があります。視覚化を表示するには、ユーザーは基本となる保存されたクエリに対して少なくとも読み取り専用のアクセス権を持っている必要があります。

### インタラクティビティ {#interactivity}

ダッシュボードをインタラクティブにするには、[クエリパラメータ](/sql-reference/syntax#defining-and-using-query-parameters)を使用します。たとえば、`WHERE`句にクエリパラメータを追加してフィルタとして機能させることができます。

グローバルフィルタのサイドパネルを介して、視覚化設定で「フィルタ」タイプを選択することにより、クエリパラメータ入力をトグルできます。また、ダッシュボード上の別のオブジェクト（テーブルなど）にリンクすることでもクエリパラメータ入力をトグルできます。以下のクイックスタートガイドの「"[フィルタを設定する](/cloud/manage/dashboards#configure-a-filter)"」セクションを参照してください。

## クイックスタート {#quick-start}

[query_log](/operations/system-tables/query_log)システムテーブルを使用して、ClickHouseサービスを監視するダッシュボードを作成しましょう。

## クイックスタート {#quick-start-1}

### 保存されたクエリの作成 {#create-a-saved-query}

視覚化するための保存されたクエリがすでにある場合は、このステップをスキップできます。

新しいクエリタブを開きます。ClickHouseのシステムテーブルを使用して、日ごとのクエリボリュームをカウントするクエリを書きましょう：

![保存されたクエリを作成](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/dashboards/2_dashboards.png)

クエリの結果はテーブル形式で表示するか、チャートビューから視覚化を構築を開始することができます。次のステップでは、クエリを`時間別クエリ`として保存します：

![クエリを保存](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/dashboards/3_dashboards.png)

保存されたクエリに関する詳細なドキュメントは、[クエリの保存セクション](/cloud/get-started/sql-console#saving-a-query)で確認できます。

さらに、`クエリの種類別のクエリカウント`という別のクエリを作成して、クエリの種類ごとのクエリ数をカウントすることができます。ここにSQLコンソールのデータの棒グラフ視覚化があります。

![クエリの結果の棒グラフ視覚化](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/dashboards/4_dashboards.png)

クエリが2つできたので、これらのクエリを視覚化して収集するダッシュボードを作成しましょう。

### ダッシュボードの作成 {#create-a-dashboard}

ダッシュボードパネルに移動し、「新しいダッシュボード」をクリックします。名前を付けると、最初のダッシュボードが成功裏に作成されます！

![新しいダッシュボードを作成](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/dashboards/5_dashboards.png)

### 視覚化の追加 {#add-a-visualization}

2つの保存されたクエリ、`時間別クエリ`と`クエリの種類別のクエリカウント`があります。最初のクエリを折れ線グラフとして視覚化しましょう。視覚化にタイトルとサブタイトルを付け、視覚化するクエリを選択します。次に、「折れ線」チャートタイプを選択し、x軸とy軸を割り当てます。

![視覚化を追加](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/dashboards/6_dashboards.png)

ここで、数値のフォーマット、凡例のレイアウト、軸のラベルなど、追加のスタイル変更を行うこともできます。

次に、2つ目のクエリをテーブルとして視覚化し、折れ線グラフの下に配置します。

![クエリ結果をテーブルとして視覚化](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/dashboards/7_dashboards.png)

2つの保存されたクエリを視覚化することで、最初のダッシュボードを作成しました！

### フィルタの設定 {#configure-a-filter}

クエリの種類に基づいてトレンドを表示できるように、ダッシュボードをインタラクティブにするためにフィルタを追加しましょう。この作業は、[クエリパラメータ](/sql-reference/syntax#defining-and-using-query-parameters)を使用して行います。

折れ線グラフの隣にある三点リーダーをクリックし、クエリの隣にある鉛筆ボタンをクリックしてインラインクエリエディタを開きます。ここで、ダッシュボードから直接基本となる保存されたクエリを編集できます。

![基本クエリを編集](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/dashboards/8_dashboards.png)

今、黄色のクエリを実行ボタンを押すと、前回のクエリがただの挿入クエリにフィルタリングされて表示されます。保存ボタンをクリックしてクエリを更新します。チャート設定に戻ると、折れ線グラフをフィルタリングできるようになります。

今、トップリボンのグローバルフィルタを使用して、入力を変更することによりフィルタをトグルできます。

![グローバルフィルタを調整](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/dashboards/9_dashboards.png)

折れ線グラフのフィルタをテーブルにリンクさせたい場合は、視覚化設定に戻り、query_kindクエリパラメータの値ソースをテーブルに変更し、query_kindカラムをリンクするフィールドとして選択します。

![クエリパラメータを変更](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/dashboards/10_dashboards.png)

これで、クエリの種類テーブルから直接折れ線グラフのフィルタを制御できるようになり、ダッシュボードをインタラクティブにすることができます。

![折れ線グラフのフィルタを制御](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/dashboards/11_dashboards.png)
