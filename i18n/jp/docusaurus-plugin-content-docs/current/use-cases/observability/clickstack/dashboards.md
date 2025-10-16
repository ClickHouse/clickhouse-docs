---
'slug': '/use-cases/observability/clickstack/dashboards'
'title': 'ClickStackによるビジュアライゼーションとダッシュボード'
'sidebar_label': 'ダッシュボード'
'pagination_prev': null
'pagination_next': null
'description': 'ClickStackによるビジュアライゼーションとダッシュボード'
'doc_type': 'guide'
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

ClickStackは、HyperDXでのチャート作成をサポートするイベントの視覚化機能を提供しています。これらのチャートは、他のユーザーと共有するためにダッシュボードに追加できます。

視覚化は、トレース、メトリクス、ログ、またはユーザー定義の広範なイベントスキーマから作成できます。

## 視覚化の作成 {#creating-visualizations}

HyperDXの**Chart Explorer**インターフェースを使用すると、ユーザーはメトリクス、トレース、およびログを時間軸で視覚化でき、データ分析のための迅速な視覚化を容易に作成できます。このインターフェースはダッシュボード作成時にも再利用されます。以下のセクションでは、Chart Explorerを使用して視覚化を作成するプロセスを説明します。

各視覚化は、**データソース**を選択し、その後**メトリクス**を選択し、オプションの**フィルター式**と**グループ化**フィールドを追加することから始まります。概念的に、HyperDXの視覚化は、内部的にはSQLの`GROUP BY`クエリにマッピングされます— ユーザーは選択した次元にまたがる集計を定義します。

たとえば、サービス名でグループ化されたエラーの数（`count()`）をチャート化することがあります。

以下の例では、リモートデータセットを使用します。このデータセットは、ガイド["Remote Demo Dataset"](/use-cases/observability/clickstack/getting-started/remote-demo-data)で説明されている[sql.clickhouse.com](https://sql.clickhouse.com)で利用可能です。 **ユーザーは[play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)を訪れることで、これらの例を再現することもできます。**

<VerticalStepper headerLevel="h3">

### Chart Explorerに移動 {#navigate-chart-explorer}

左側のメニューから`Chart Explorer`を選択します。

<Image img={visualization_1} alt="Chart Explorer" size="lg"/>

### 視覚化の作成 {#create-visualization}

以下の例では、サービス名ごとの平均リクエスト時間を時間経過に沿ってチャート化します。これには、ユーザーがメトリック、カラム（SQL表現が可能）、および集計フィールドを指定する必要があります。

上部メニューから`Line/Bar`視覚化タイプを選択し、次に`Traces`（または[play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)を使用している場合は`Demo Traces`）データセットを選択します。以下の値を入力して、サービス名ごとの平均リクエスト時間を表示するチャートを作成します。

- メトリック: `Average`  
- カラム: `Duration/1000`  
- 条件: `<空>`  
- グループ化: `ServiceName`  
- エイリアス: `Average Time`

<Image img={visualization_2} alt="Simple visualization" size="lg"/>

ユーザーは、SQLの`WHERE`句またはLucene構文を使用してイベントをフィルタリングし、イベントが視覚化される時間枠を設定できることに注意してください。また、複数のシリーズもサポートされています。

たとえば、フィルタ`ServiceName:"frontend"`を追加してサービス`frontend`でフィルタリングします。`Add Series`をクリックして、エイリアス`Count`で時間経過に伴うイベント数の第2シリーズを追加します。

<Image img={visualization_3} alt="Simple visualization 2" size="lg"/>

:::note
視覚化は、すべてのデータソースから作成できます — メトリクス、トレース、またはログ。ClickStackは、これらすべてを広範なイベントとして扱います。任意の**数値カラム**を時間軸でチャート化でき、**文字列**、**日付**、または**数値**カラムはグループ化に利用できます。

この統一アプローチにより、ユーザーは一貫した柔軟なモデルを使用して、異なるテレメトリタイプ間でダッシュボードを構築できるようになります。
:::

</VerticalStepper>

## ダッシュボードの作成 {#creating-dashboards}

ダッシュボードは、関連する視覚化をグループ化する方法を提供し、ユーザーがメトリクスを比較し、パターンを並べて探索することで、システム内の潜在的な根本原因を特定するのに役立ちます。これらのダッシュボードは、アドホック調査に使用することも、継続的なモニタリングのために保存することもできます。

ダッシュボードレベルでグローバルフィルターを適用でき、これによりそのダッシュボード内のすべての視覚化に自動的に伝播されます。これにより、チャート全体の一貫したドリルダウンが可能になり、サービスやテレメトリタイプにわたるイベントの相関関係を簡素化します。

以下では、ログとトレースデータソースを使用して2つの視覚化を作成するダッシュボードを作成します。これらの手順は、["Remote Demo Dataset"](/use-cases/observability/clickstack/getting-started/remote-demo-data)に説明されている、[sql.clickhouse.com](https://sql.clickhouse.com)でホストされているデータセットに接続して、[play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)上でも再現可能です。

<VerticalStepper headerLevel="h3">

### ダッシュボードに移動 {#navigate-dashboards}

左側のメニューから`Dashboards`を選択します。

<Image img={dashboard_1} alt="Create Dashboard" size="lg"/>

デフォルトでは、ダッシュボードはアドホック調査をサポートするために一時的なものです。

独自のHyperDXインスタンスを使用している場合、このダッシュボードが後で保存できるようにするには、`Create New Saved Dashboard`をクリックします。このオプションは、読み取り専用環境[play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)を使用している場合は利用できません。

### 視覚化の作成 – サービスごとの平均リクエスト時間 {#create-a-tile}

`Add New Tile`を選択して視覚化作成パネルを開きます。

上部メニューから`Line/Bar`視覚化タイプを選択し、次に`Traces`（または[play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)を使用している場合は`Demo Traces`）データセットを選択します。サービス名ごとの平均リクエスト時間を時間経過に沿って表示するチャートを作成するために、以下の値を入力します。

- チャート名: `Average duration by service`  
- メトリック: `Average`  
- カラム: `Duration/1000`  
- 条件: `<空>`  
- グループ化: `ServiceName`  
- エイリアス: `Average Time`

`Save`をクリックする前に、**プレイ**ボタンをクリックします。

<Image img={dashboard_2} alt="Create Dashboard Visualization" size="lg"/>

視覚化をダッシュボードの全幅を占めるようにサイズ変更します。

<Image img={dashboard_3} alt="Dashboard with visuals" size="lg"/>

### 視覚化の作成 – サービスごとのイベント数の時間経過 {#create-a-tile-2}

`Add New Tile`を選択して視覚化作成パネルを開きます。

上部メニューから`Line/Bar`視覚化タイプを選択し、次に`Logs`（または[play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)を使用している場合は`Demo Logs`）データセットを選択します。サービス名ごとの時間経過に伴うイベント数を表示するチャートを作成するために、以下の値を入力します。

- チャート名: `Event count by service`  
- メトリック: `Count of Events`  
- 条件: `<空>`  
- グループ化: `ServiceName`  
- エイリアス: `Count of events`

`Save`をクリックする前に、**プレイ**ボタンをクリックします。

<Image img={dashboard_4} alt="Dashboard Visualization 2" size="lg"/>

視覚化をダッシュボードの全幅を占めるようにサイズ変更します。

<Image img={dashboard_5} alt="Dashboard with visuals 2" size="lg"/>

### ダッシュボードをフィルタリング {#filter-dashboards}

LuceneまたはSQLフィルターとともに時間範囲を、ダッシュボードレベルで適用でき、自動的にすべての視覚化に伝播されます。

<Image img={dashboard_filter} alt="Dashboard with filtering" size="lg"/>

例を示すために、ダッシュボードにLuceneフィルタ`ServiceName:"frontend"`を適用し、時間ウィンドウを過去3時間に設定します。視覚化が`frontend`サービスからのデータのみを反映することに注意してください。

ダッシュボードは自動的に保存されます。ダッシュボード名を設定するには、タイトルを選択し、`Save Name`をクリックする前に修正します。

<Image img={dashboard_save} alt="Dashboard save" size="lg"/>

</VerticalStepper>

## ダッシュボード - 視覚化の編集 {#dashboards-editing-visualizations}

視覚化を削除、編集、または複製するには、その上にカーソルを合わせて、対応するアクションボタンを使用します。

<Image img={dashboard_edit} alt="Dashboard edit" size="lg"/>

## ダッシュボードの一覧表示と検索 {#dashboard-listing-search}

ダッシュボードは左側のメニューからアクセス可能で、特定のダッシュボードを迅速に見つけるためのビルトイン検索があります。

<Image img={dashboard_search} alt="Dashboard search" size="sm"/>

## プリセット {#presets}

HyperDXは、即座に使用可能なダッシュボードと共に展開されます。

### ClickHouseダッシュボード {#clickhouse-dashboard}

このダッシュボードはClickHouseの監視用の視覚化を提供します。このダッシュボードに移動するには、左側のメニューから選択します。

<Image img={dashboard_clickhouse} alt="ClickHouse dashboard" size="lg"/>

このダッシュボードは、**Selects**、**Inserts**、および**ClickHouse Infrastructure**の監視を分離するためにタブを使用しています。

:::note システムテーブルアクセスが必要
このダッシュボードは、ClickHouseの[system tables](/operations/system-tables)をクエリし、重要なメトリックを公開します。以下の権限が必要です：

`GRANT SHOW COLUMNS, SELECT(CurrentMetric_MemoryTracking, CurrentMetric_S3Requests, ProfileEvent_OSCPUVirtualTimeMicroseconds, ProfileEvent_OSReadChars, ProfileEvent_OSWriteChars, ProfileEvent_S3GetObject, ProfileEvent_S3ListObjects, ProfileEvent_S3PutObject, ProfileEvent_S3UploadPart, event_time) ON system.metric_log`

`GRANT SHOW COLUMNS, SELECT(active, database, partition, rows, table) ON system.parts`

`GRANT SHOW COLUMNS, SELECT(event_date, event_time, memory_usage, normalized_query_hash, query, query_duration_ms, query_kind, read_rows, tables, type, written_bytes, written_rows) ON system.query_log`

`GRANT SHOW COLUMNS, SELECT(event_date, event_time, hostname, metric, value) ON system.transposed_metric_log`
:::

### サービスダッシュボード {#services-dashboard}

サービスダッシュボードは、トレースデータに基づいて現在アクティブなサービスを表示します。これには、ユーザーがトレースを収集し、有効なトレースデータソースを構成していることが必要です。

サービス名はトレースデータから自動的に検出され、HTTPサービス、データベース、エラーの3つのタブに整理された一連の組み込み視覚化が表示されます。

観測をLuceneまたはSQL構文を使用してフィルタリングし、時間ウィンドウを調整して分析を集中させることができます。

<Image img={dashboard_services} alt="ClickHouse services" size="lg"/>

### Kubernetesダッシュボード {#kubernetes-dashboard}

このダッシュボードは、ユーザーがOpenTelemetryを通じて収集されたKubernetesイベントを探索できるようにします。Kubernetes Pod、Deployment、Node名、Namespace、およびClusterによるフィルタリングが可能で、自由形式のテキスト検索も行えます。

Kubernetesデータは簡単にナビゲーションできるように、Pods、Nodes、およびNamespacesの3つのタブに整理されています。

<Image img={dashboard_kubernetes} alt="ClickHouse kubernetes" size="lg"/>
