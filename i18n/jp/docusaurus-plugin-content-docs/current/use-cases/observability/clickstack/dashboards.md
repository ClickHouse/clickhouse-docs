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

ClickStack はイベントの可視化をサポートしており、HyperDX にはグラフ表示機能が標準で組み込まれています。これらのチャートはダッシュボードに追加して、他のユーザーと共有できます。

可視化はトレース、メトリクス、ログ、または任意のユーザー定義ワイドイベントスキーマから作成できます。


## 可視化の作成 {#creating-visualizations}

HyperDX の **Chart Explorer** インターフェイスを使用すると、メトリクス、トレース、ログを時間軸で可視化でき、データ分析のための簡単な可視化をすばやく作成できます。このインターフェイスはダッシュボード作成時にも再利用されます。以下のセクションでは、Chart Explorer を使って可視化を作成する手順を説明します。

各可視化は、最初に **データソース** を選択し、その後に **メトリック** を選択し、必要に応じて **フィルター式** や **Group By** フィールドを指定するところから始まります。概念的には、HyperDX における可視化は内部的には SQL の `GROUP BY` クエリに対応しており、ユーザーは選択したディメンションに対して集計するメトリックを定義します。

たとえば、サービス名ごとにグループ化したエラー数（`count()`）をグラフ化することができます。

以下の例では、ガイド「["Remote Demo Dataset"](/use-cases/observability/clickstack/getting-started/remote-demo-data)」で説明している [sql.clickhouse.com](https://sql.clickhouse.com) 上のリモートデータセットを使用します。**[play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) にアクセスすることで、これらの例を再現することもできます。**

<VerticalStepper headerLevel="h3">

### Chart Explorer に移動する {#navigate-chart-explorer}

左側のメニューから `Chart Explorer` を選択します。

<Image img={visualization_1} alt="Chart Explorer" size="lg"/>

### 可視化を作成する {#create-visualization}

次の例では、サービス名ごとに、時間経過に応じた平均リクエスト時間をグラフ化します。これには、メトリック、カラム（SQL 式も指定可能）、および集計フィールドを指定する必要があります。

上部メニューから `Line/Bar` の可視化タイプを選択し、その後に `Traces`（または [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) を使用している場合は `Demo Traces`）データセットを選択します。以下の値を設定します:

- Metric: `Average`  
- Column: `Duration/1000`  
- Where: `<empty>`  
- Group By: `ServiceName`  
- Alias: `Average Time`

<Image img={visualization_2} alt="シンプルな可視化" size="lg"/>

ユーザーは SQL の `WHERE` 句または Lucene 構文を使用してイベントをフィルタリングできるほか、イベントを可視化する時間範囲も設定できます。複数の系列もサポートされています。

たとえば、フィルター `ServiceName:"frontend"` を追加してサービス `frontend` によるフィルタリングを行います。さらに、`Add Series` をクリックし、エイリアスを `Count` として時間経過に応じたイベント数の 2 つ目の系列を追加します。

<Image img={visualization_3} alt="シンプルな可視化 2" size="lg"/>

:::note
可視化はメトリクス、トレース、ログなど、あらゆるデータソースから作成できます。ClickStack はこれらすべてをワイドイベントとして扱います。任意の **数値カラム** を時間軸でグラフ化でき、**文字列**、**日付**、**数値** カラムをグループ化に使用できます。

この統一されたアプローチにより、ユーザーは一貫性があり柔軟なモデルを使って、さまざまなテレメトリタイプにまたがるダッシュボードを構築できます。
:::

</VerticalStepper>



## ダッシュボードの作成 {#creating-dashboards}

ダッシュボードは、関連する可視化をグループ化し、ユーザーがメトリクスを比較したり、パターンを並べて確認したりして、システム内の潜在的な根本原因を特定できるようにするための機能です。これらのダッシュボードは、アドホックな調査だけでなく、継続的なモニタリングのために保存しておくこともできます。

グローバルフィルタはダッシュボードレベルで適用でき、そのダッシュボード内のすべての可視化に自動的に反映されます。これにより、チャート間で一貫したドリルダウンが可能になり、サービスやテレメトリタイプをまたいだイベントの相関付けが容易になります。

以下では、ログおよびトレースのデータソースを使用して、2 つの可視化を含むダッシュボードを作成します。これらの手順は、[play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) 上、またはガイド「[Remote Demo Dataset](/use-cases/observability/clickstack/getting-started/remote-demo-data)」で説明されているように [sql.clickhouse.com](https://sql.clickhouse.com) 上でホストされているデータセットにローカルから接続することで再現できます。

<VerticalStepper headerLevel="h3">

### ダッシュボードに移動する {#navigate-dashboards}

左側のメニューから `Dashboards` を選択します。

<Image img={dashboard_1} alt="ダッシュボードの作成" size="lg"/>

既定では、ダッシュボードはアドホックな調査をサポートするために一時的なものです。 

独自の HyperDX インスタンスを使用している場合は、`Create New Saved Dashboard` をクリックして、このダッシュボードを後で保存できるようにします。[play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) の読み取り専用環境を使用している場合、このオプションは利用できません。

### 可視化を作成する – サービス別平均リクエスト時間 {#create-a-tile}

`Add New Tile` を選択して、可視化作成パネルを開きます。

上部メニューから `Line/Bar` の可視化タイプを選択し、その後に `Traces`（または [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) を使用している場合は `Demo Traces`）データセットを選択します。サービス名ごとの時間経過に伴う平均リクエスト時間を表示するチャートを作成するため、次の値を入力します:

- Chart Name: `Average duration by service`  
- Metric: `Average`  
- Column: `Duration/1000`  
- Where: `<empty>`  
- Group By: `ServiceName`  
- Alias: `Average Time`

`Save` をクリックする前に **再生** ボタンをクリックします。

<Image img={dashboard_2} alt="ダッシュボード可視化の作成" size="lg"/>

可視化のサイズを変更し、ダッシュボードの幅いっぱいに表示されるようにします。

<Image img={dashboard_3} alt="可視化を含むダッシュボード" size="lg"/>

### 可視化を作成する – サービス別のイベント数の推移 {#create-a-tile-2}

`Add New Tile` を選択して、可視化作成パネルを開きます。

上部メニューから `Line/Bar` の可視化タイプを選択し、その後に `Logs`（または [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) を使用している場合は `Demo Logs`）データセットを選択します。サービス名ごとの時間経過に伴うイベント数を表示するチャートを作成するため、次の値を入力します:

- チャート名: `Event count by service`  
- Metric: `Count of Events`  
- Where: `<empty>`  
- Group By: `ServiceName`  
- Alias: `Count of events`

`Save` をクリックする前に **再生** ボタンをクリックします。

<Image img={dashboard_4} alt="ダッシュボード可視化 2" size="lg"/>

可視化のサイズを変更し、ダッシュボードの幅いっぱいに表示されるようにします。

<Image img={dashboard_5} alt="可視化を含むダッシュボード 2" size="lg"/>

### ダッシュボードをフィルタリングする {#filter-dashboards}

Lucene または SQL フィルタと時間範囲はダッシュボードレベルで適用でき、すべての可視化に自動的に反映されます。

<Image img={dashboard_filter} alt="フィルタリングされたダッシュボード" size="lg"/>

例として、ダッシュボードに Lucene フィルタ `ServiceName:"frontend"` を適用し、時間ウィンドウを直近 3 時間をカバーするように変更します。すると、可視化が `frontend` サービスからのデータのみを反映するようになることが分かります。

ダッシュボードは自動的に保存されます。ダッシュボード名を設定するには、タイトルをクリックして編集し、`Save Name` をクリックします。 

<Image img={dashboard_save} alt="ダッシュボードの保存" size="lg"/>

</VerticalStepper>



## ダッシュボード - ビジュアライゼーションの編集 {#dashboards-editing-visualizations}

ビジュアライゼーションを削除、編集、または複製するには、そのビジュアライゼーションにカーソルを合わせて、該当するアクションボタンを使用します。

<Image img={dashboard_edit} alt="Dashboard edit" size="lg"/>



## ダッシュボード - 一覧と検索 {#dashboard-listing-search}

ダッシュボードは左側のメニューからアクセスでき、特定のダッシュボードをすばやく見つけるための検索機能が組み込まれています。
<Image img={dashboard_search} alt="ダッシュボード検索" size="sm"/>



## ダッシュボード - タグ付け {#tagging}
<Tagging />



## プリセット {#presets}

HyperDX は、すぐに利用できるダッシュボード付きでデプロイされます。

### ClickHouse ダッシュボード {#clickhouse-dashboard}

このダッシュボードは、ClickHouse を監視するための可視化を提供します。このダッシュボードに移動するには、左側のメニューから選択します。

<Image img={dashboard_clickhouse} alt="ClickHouse ダッシュボード" size="lg"/>

このダッシュボードでは、**Selects**、**Inserts**、**ClickHouse Infrastructure** の監視内容をタブで分けて表示します。

:::note 必要な system テーブルへのアクセス
このダッシュボードは、主要なメトリクスを可視化するために ClickHouse の [system テーブル](/operations/system-tables) をクエリします。以下の権限が必要です:

`GRANT SHOW COLUMNS, SELECT(CurrentMetric_MemoryTracking, CurrentMetric_S3Requests, ProfileEvent_OSCPUVirtualTimeMicroseconds, ProfileEvent_OSReadChars, ProfileEvent_OSWriteChars, ProfileEvent_S3GetObject, ProfileEvent_S3ListObjects, ProfileEvent_S3PutObject, ProfileEvent_S3UploadPart, event_time) ON system.metric_log`

`GRANT SHOW COLUMNS, SELECT(active, database, partition, rows, table) ON system.parts`

`GRANT SHOW COLUMNS, SELECT(event_date, event_time, memory_usage, normalized_query_hash, query, query_duration_ms, query_kind, read_rows, tables, type, written_bytes, written_rows) ON system.query_log`

`GRANT SHOW COLUMNS, SELECT(event_date, event_time, hostname, metric, value) ON system.transposed_metric_log`
:::

### Services ダッシュボード {#services-dashboard}

Services ダッシュボードは、トレースデータに基づいて現在アクティブなサービスを表示します。そのためには、トレースを収集し、有効な Traces データソースを構成している必要があります。

サービス名はトレースデータから自動検出され、HTTP Services、Database、Errors の 3 つのタブに整理された、一連のあらかじめ用意された可視化が提供されます。

可視化は Lucene または SQL 構文を使用してフィルタリングでき、時間範囲を調整して集中的な分析を行うことができます。

<Image img={dashboard_services} alt="ClickHouse services" size="lg"/>

### Kubernetes ダッシュボード {#kubernetes-dashboard}

このダッシュボードでは、OpenTelemetry を通じて収集された Kubernetes イベントを探索できます。高度なフィルタリングオプションが用意されており、Kubernetes ポッド、デプロイメント、ノード名、ネームスペース、クラスターでフィルタリングしたり、フリーテキスト検索を実行したりできます。

Kubernetes データは、簡単に操作できるように 3 つのタブ (ポッド、ノード、ネームスペース) に整理されています。

<Image img={dashboard_kubernetes} alt="ClickHouse kubernetes" size="lg"/>
