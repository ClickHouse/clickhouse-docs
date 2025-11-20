---
slug: /use-cases/observability/clickstack/dashboards
title: 'ClickStack による可視化とダッシュボード'
sidebar_label: 'ダッシュボード'
pagination_prev: null
pagination_next: null
description: 'ClickStack による可視化とダッシュボード'
doc_type: 'guide'
keywords: ['clickstack', 'dashboards', 'visualization', 'monitoring', 'observability']
---

import Image from '@theme/IdealImage';
import visualization_1 from '@site/static/images/use-cases/observability/hyperdx-visualization-1.png';
import visualization_2 from '@site/static/images/use-cases/observability/hyperdx-visualization-2.png';
import visualization_3 from '@site/static/images/use-cases/observability/hyperdx-visualization-3.png';
import dashboard_1 from '@site/static/images/use-cases/observability/hyperdx-dashboard-1.png';
import dashboard_2 from '@site/static/images/use-cases/observability/hyperdx-dashboard-2.png';
import dashboard_3 from '@site/static/images/use-cases/observability/hyperdx-dashboard-3.png';
import dashboard_4 from '@site/static/images/use-cases/observability/hyperdx-dashboard-4.png';
import dashboard_5 from '@site/static/images/use-cases/observability/hyperdx-dashboard-5.png';
import dashboard_filter from '@site/static/images/use-cases/observability/hyperdx-dashboard-filter.png';
import dashboard_save from '@site/static/images/use-cases/observability/hyperdx-dashboard-save.png';
import dashboard_search from '@site/static/images/use-cases/observability/hyperdx-dashboard-search.png';
import dashboard_edit from '@site/static/images/use-cases/observability/hyperdx-dashboard-edit.png';
import dashboard_clickhouse from '@site/static/images/use-cases/observability/hyperdx-dashboard-clickhouse.png';
import dashboard_services from '@site/static/images/use-cases/observability/hyperdx-dashboard-services.png';
import dashboard_kubernetes from '@site/static/images/use-cases/observability/hyperdx-dashboard-kubernetes.png';
import Tagging from '@site/docs/_snippets/_clickstack_tagging.mdx';

ClickStack は、HyperDX におけるチャート表示をネイティブサポートしており、イベントを可視化できます。これらのチャートはダッシュボードに追加して、他のユーザーと共有できます。

可視化は、トレース、メトリクス、ログ、または任意のユーザー定義のワイドイベントスキーマから作成できます。


## ビジュアライゼーションの作成 {#creating-visualizations}

HyperDXの**Chart Explorer**インターフェースを使用すると、メトリクス、トレース、ログを時系列で可視化でき、データ分析用のビジュアライゼーションを素早く作成できます。このインターフェースは、ダッシュボード作成時にも再利用されます。以下のセクションでは、Chart Explorerを使用したビジュアライゼーション作成のプロセスを説明します。

各ビジュアライゼーションは、**データソース**の選択から始まり、次に**メトリクス**を選択し、オプションで**フィルタ式**と**group by**フィールドを指定します。概念的には、HyperDXのビジュアライゼーションは内部的にSQL `GROUP BY`クエリにマッピングされます。ユーザーは選択したディメンション全体で集計するメトリクスを定義します。

例えば、サービス名でグループ化されたエラー数（`count()`）をチャート化できます。

以下の例では、[sql.clickhouse.com](https://sql.clickhouse.com)で利用可能なリモートデータセットを使用します。これは["Remote Demo Dataset"](/use-cases/observability/clickstack/getting-started/remote-demo-data)ガイドで説明されています。**ユーザーは[play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)にアクセスすることで、これらの例を再現することもできます。**

<VerticalStepper headerLevel="h3">

### Chart Explorerへの移動 {#navigate-chart-explorer}

左側のメニューから`Chart Explorer`を選択します。

<Image img={visualization_1} alt='Chart Explorer' size='lg' />

### ビジュアライゼーションの作成 {#create-visualization}

以下の例では、サービス名ごとの平均リクエスト期間を時系列でチャート化します。これには、メトリクス、カラム（SQL式も可）、および集計フィールドの指定が必要です。

上部メニューから`Line/Bar`ビジュアライゼーションタイプを選択し、次に`Traces`（[play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)を使用している場合は`Demo Traces`）データセットを選択します。以下の値を入力します：

- Metric: `Average`
- Column: `Duration/1000`
- Where: `<empty>`
- Group By: `ServiceName`
- Alias: `Average Time`

<Image img={visualization_2} alt='シンプルなビジュアライゼーション' size='lg' />

ユーザーは、SQL `WHERE`句またはLucene構文を使用してイベントをフィルタリングし、イベントを可視化する時間枠を設定できます。複数の系列もサポートされています。

例えば、フィルタ`ServiceName:"frontend"`を追加して、サービス`frontend`でフィルタリングします。`Add Series`をクリックして、エイリアス`Count`で時系列のイベント数の2番目の系列を追加します。

<Image img={visualization_3} alt='シンプルなビジュアライゼーション 2' size='lg' />

:::note
ビジュアライゼーションは、メトリクス、トレース、ログなど、あらゆるデータソースから作成できます。ClickStackはこれらすべてをワイドイベントとして扱います。任意の**数値カラム**を時系列でチャート化でき、**文字列**、**日付**、または**数値**カラムをグループ化に使用できます。

この統一されたアプローチにより、ユーザーは一貫性のある柔軟なモデルを使用して、テレメトリタイプ全体にわたるダッシュボードを構築できます。
:::

</VerticalStepper>


## ダッシュボードの作成 {#creating-dashboards}

ダッシュボードは関連する可視化をグループ化する機能を提供し、ユーザーがメトリクスを比較したり、パターンを並べて探索したりすることで、システム内の潜在的な根本原因を特定できるようにします。これらのダッシュボードは、アドホック調査に使用したり、継続的な監視のために保存したりできます。

グローバルフィルターはダッシュボードレベルで適用でき、そのダッシュボード内のすべての可視化に自動的に反映されます。これにより、チャート全体で一貫したドリルダウンが可能になり、サービスやテレメトリータイプ間でのイベントの相関分析が簡素化されます。

以下では、ログとトレースのデータソースを使用して、2つの可視化を含むダッシュボードを作成します。これらの手順は、[play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)上で、または["Remote Demo Dataset"](/use-cases/observability/clickstack/getting-started/remote-demo-data)ガイドに記載されているように[sql.clickhouse.com](https://sql.clickhouse.com)でホストされているデータセットに接続することで、ローカル環境で再現できます。

<VerticalStepper headerLevel="h3">

### ダッシュボードへの移動 {#navigate-dashboards}

左側のメニューから`Dashboards`を選択します。

<Image img={dashboard_1} alt='Create Dashboard' size='lg' />

デフォルトでは、ダッシュボードはアドホック調査をサポートするために一時的なものとなっています。

独自のHyperDXインスタンスを使用している場合は、`Create New Saved Dashboard`をクリックすることで、このダッシュボードを後で保存できるようにすることができます。このオプションは、読み取り専用環境[play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)を使用している場合は利用できません。

### 可視化の作成 – サービス別の平均リクエスト時間 {#create-a-tile}

`Add New Tile`を選択して、可視化作成パネルを開きます。

上部メニューから`Line/Bar`可視化タイプを選択し、続いて`Traces`（[play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)を使用している場合は`Demo Traces`）データセットを選択します。サービス名ごとの平均リクエスト期間を時系列で示すチャートを作成するために、以下の値を設定します：

- Chart Name: `Average duration by service`
- Metric: `Average`
- Column: `Duration/1000`
- Where: `<empty>`
- Group By: `ServiceName`
- Alias: `Average Time`

`Save`をクリックする前に**play**ボタンをクリックします。

<Image img={dashboard_2} alt='Create Dashboard Visualization' size='lg' />

可視化のサイズを変更して、ダッシュボードの全幅を占めるようにします。

<Image img={dashboard_3} alt='Dashboard with visuals' size='lg' />

### 可視化の作成 – サービス別の時系列イベント {#create-a-tile-2}

`Add New Tile`を選択して、可視化作成パネルを開きます。

上部メニューから`Line/Bar`可視化タイプを選択し、続いて`Logs`（[play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)を使用している場合は`Demo Logs`）データセットを選択します。サービス名ごとのイベント数を時系列で示すチャートを作成するために、以下の値を設定します：

- Chart Name: `Event count by service`
- Metric: `Count of Events`
- Where: `<empty>`
- Group By: `ServiceName`
- Alias: `Count of events`

`Save`をクリックする前に**play**ボタンをクリックします。

<Image img={dashboard_4} alt='Dashboard Visualization 2' size='lg' />

可視化のサイズを変更して、ダッシュボードの全幅を占めるようにします。

<Image img={dashboard_5} alt='Dashboard with visuals 2' size='lg' />

### ダッシュボードのフィルタリング {#filter-dashboards}

LuceneまたはSQLフィルターは、時間範囲とともにダッシュボードレベルで適用でき、すべての可視化に自動的に反映されます。

<Image img={dashboard_filter} alt='Dashboard with filtering' size='lg' />

デモンストレーションとして、ダッシュボードにLuceneフィルター`ServiceName:"frontend"`を適用し、時間ウィンドウを過去3時間をカバーするように変更します。可視化が`frontend`サービスからのデータのみを反映するようになったことを確認してください。

ダッシュボードは自動保存されます。ダッシュボード名を設定するには、タイトルを選択して変更してから`Save Name`をクリックします。

<Image img={dashboard_save} alt='Dashboard save' size='lg' />

</VerticalStepper>


## ダッシュボード - ビジュアライゼーションの編集 {#dashboards-editing-visualizations}

ビジュアライゼーションを削除、編集、または複製するには、その上にマウスカーソルを合わせて、表示されるアクションボタンを使用します。

<Image img={dashboard_edit} alt='ダッシュボードの編集' size='lg' />


## ダッシュボード - 一覧と検索 {#dashboard-listing-search}

ダッシュボードは左側のメニューからアクセスでき、組み込みの検索機能で特定のダッシュボードを素早く見つけることができます。

<Image img={dashboard_search} alt='ダッシュボード検索' size='sm' />


## ダッシュボード - タグ付け {#tagging}

<Tagging />


## プリセット {#presets}

HyperDXには、すぐに使用できるダッシュボードが標準で用意されています。

### ClickHouseダッシュボード {#clickhouse-dashboard}

このダッシュボードは、ClickHouseの監視用の可視化機能を提供します。このダッシュボードにアクセスするには、左側のメニューから選択してください。

<Image img={dashboard_clickhouse} alt='ClickHouse dashboard' size='lg' />

このダッシュボードでは、タブを使用して**Selects**、**Inserts**、**ClickHouse Infrastructure**の監視を分けて表示します。

:::note 必要なシステムテーブルへのアクセス権限
このダッシュボードは、主要なメトリクスを表示するためにClickHouseの[システムテーブル](/operations/system-tables)にクエリを実行します。以下の権限が必要です:

`GRANT SHOW COLUMNS, SELECT(CurrentMetric_MemoryTracking, CurrentMetric_S3Requests, ProfileEvent_OSCPUVirtualTimeMicroseconds, ProfileEvent_OSReadChars, ProfileEvent_OSWriteChars, ProfileEvent_S3GetObject, ProfileEvent_S3ListObjects, ProfileEvent_S3PutObject, ProfileEvent_S3UploadPart, event_time) ON system.metric_log`

`GRANT SHOW COLUMNS, SELECT(active, database, partition, rows, table) ON system.parts`

`GRANT SHOW COLUMNS, SELECT(event_date, event_time, memory_usage, normalized_query_hash, query, query_duration_ms, query_kind, read_rows, tables, type, written_bytes, written_rows) ON system.query_log`

`GRANT SHOW COLUMNS, SELECT(event_date, event_time, hostname, metric, value) ON system.transposed_metric_log`
:::

### サービスダッシュボード {#services-dashboard}

サービスダッシュボードは、トレースデータに基づいて現在アクティブなサービスを表示します。これを使用するには、トレースを収集し、有効なトレースデータソースを設定しておく必要があります。

サービス名はトレースデータから自動検出され、事前構築された一連の可視化機能が3つのタブに整理されています:HTTP Services、Database、Errors。

可視化機能は、LuceneまたはSQL構文を使用してフィルタリングでき、時間ウィンドウを調整して詳細な分析を行うことができます。

<Image img={dashboard_services} alt='ClickHouse services' size='lg' />

### Kubernetesダッシュボード {#kubernetes-dashboard}

このダッシュボードでは、OpenTelemetry経由で収集されたKubernetesイベントを探索できます。高度なフィルタリングオプションが含まれており、Kubernetes Pod、Deployment、Node名、Namespace、Clusterでフィルタリングしたり、フリーテキスト検索を実行したりできます。

Kubernetesデータは、簡単にナビゲートできるように3つのタブに整理されています:Pods、Nodes、Namespaces。

<Image img={dashboard_kubernetes} alt='ClickHouse kubernetes' size='lg' />
