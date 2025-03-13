---
sidebar_position: 1
sidebar_label: 自動スケーリング
slug: /manage/scaling
description: ClickHouse Cloudにおける自動スケーリングの構成
keywords: [autoscaling, auto scaling, scaling, horizontal, vertical, bursts]
---

import auto_scaling from '@site/static/images/cloud/manage/AutoScaling.png';
import scaling_patch_request from '@site/static/images/cloud/manage/scaling-patch-request.png';
import scaling_patch_response from '@site/static/images/cloud/manage/scaling-patch-response.png';
import scaling_configure from '@site/static/images/cloud/manage/scaling-configure.png';
import scaling_memory_allocation from '@site/static/images/cloud/manage/scaling-memory-allocation.png';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'


# 自動スケーリング

スケーリングは、クライアントの要求に応じて利用可能なリソースを調整する能力です。Scale および Enterprise（標準 1:4 プロファイル）のティアサービスは、APIをプログラムで呼び出すか、UI上で設定を変更することにより、水平スケーリングが可能です。あるいは、これらのサービスは、アプリケーションの要求に応じて**自動垂直スケーリング**されることもあります。

<ScalePlanFeatureBadge feature="自動垂直スケーリング"/>

## ClickHouse Cloudにおけるスケーリングの仕組み {#how-scaling-works-in-clickhouse-cloud}

現在、ClickHouse Cloudは、Scaleティアサービスに対して垂直自動スケーリングと手動水平スケーリングをサポートしています。

Enterpriseティアサービスのスケーリングは次のように機能します。

- **水平スケーリング**:手動水平スケーリングは、Enterpriseティアのすべての標準およびカスタムプロファイルで利用可能です。
- **垂直スケーリング**:
  - 標準プロファイル（1:4）は、垂直自動スケーリングをサポートします。
  - カスタムプロファイルは、発売時に垂直自動スケーリングまたは手動垂直スケーリングをサポートしません。ただし、これらのサービスはサポートに連絡することで垂直にスケールできます。

:::note
我々は、「Make Before Break」（MBB）と呼ばれる計算レプリカ用の新しい垂直スケーリングメカニズムを導入しています。このアプローチでは、古いレプリカを削除する前に、新しいサイズの1つまたは複数のレプリカを追加し、スケーリング操作中に容量が失われないようにします。既存のレプリカを削除し新しいレプリカを追加するギャップを排除することで、MBBはよりシームレスで中断の少ないスケーリングプロセスを実現します。これは、リソースの高い使用率が追加容量の必要性を引き起こすスケールアップシナリオに特に有益です。レプリカを早急に削除すると、リソース制約がさらに悪化するだけです。

この変更の一環として、スケーリングイベントの一部として過去30日間のシステムテーブルデータが保持されることに注意してください。また、AWSまたはGCPのサービスにおいては2024年12月19日以前の、Azureのサービスにおいては2025年1月14日以前のシステムテーブルデータは新しい組織ティアへの移行に伴い保持されません。
:::

### 垂直自動スケーリング {#vertical-auto-scaling}

<ScalePlanFeatureBadge feature="自動垂直スケーリング"/>

ScaleおよびEnterpriseサービスは、CPUおよびメモリ使用量に基づいて自動スケーリングをサポートしています。過去30時間にわたるサービスの履歴使用量を常に監視し、スケーリングの決定を行います。使用量が特定の閾値を超えたり下回ったりした場合、需要に応じてサービスを適切にスケールします。

CPUベースの自動スケーリングは、CPU使用率が50-75%の範囲で上限を超えたときに開始されます（実際の閾値はクラスタのサイズに依存します）。この時点で、クラスタへのCPU割り当ては倍増します。CPU使用率が上限閾値の半分（例えば、50%の上限閾値の場合、25%）を下回ると、CPU割り当ては半分に減少します。

メモリベースの自動スケーリングは、最大メモリ使用量の125%まで、またはOOM（メモリ不足）エラーが発生した場合は150%までクラスタをスケールします。

**CPUまたはメモリの推奨の大きい方**が選択され、サービスに割り当てられたCPUとメモリは、`1` CPUsおよび`4 GiB`のメモリのインクリメントで同時にスケーリングされます。

### 垂直自動スケーリングの構成 {#configuring-vertical-auto-scaling}

ClickHouse CloudのScaleまたはEnterpriseサービスのスケーリングは、**Admin**ロールを持つ組織メンバーが調整できます。垂直自動スケーリングを構成するには、サービスの**設定**タブに移動し、以下のように最小および最大メモリおよびCPU設定を調整します。

:::note
シングルレプリカサービスは、すべてのティアでスケーリングできません。
:::

<div class="eighty-percent">
<img src={auto_scaling}
    alt="スケーリング設定ページ"
    class="image"
/>
</div>

レプリカの**最大メモリ**を**最小メモリ**よりも高い値に設定します。その後、サービスはその範囲内で必要に応じてスケールします。これらの設定は、初期サービス作成フロー中にも利用可能です。サービス内の各レプリカには、同じメモリとCPUリソースが割り当てられます。

これらの値を同じに設定することも選択でき、実質的にサービスを特定の構成に「ピン留め」します。これを行うと、すぐに選択したサイズにスケーリングが強制されます。

このことは、クラスタの自動スケーリングを無効にし、これらの設定を超えたCPUまたはメモリ使用の増加に対してサービスが保護されなくなることに注意してください。

:::note
Enterpriseティアサービスでは、標準1:4プロファイルが垂直自動スケーリングをサポートします。
カスタムプロファイルは、発売時に垂直自動スケーリングまたは手動垂直スケーリングをサポートしません。
ただし、これらのサービスはサポートに連絡することで垂直にスケールできます。
:::

## 手動水平スケーリング {#manual-horizontal-scaling}

<ScalePlanFeatureBadge feature="手動水平スケーリング"/>

ClickHouse Cloudの[パブリックAPI](https://clickhouse.com/docs/cloud/manage/api/swagger#/paths/~1v1~1organizations~1:organizationId~1services~1:serviceId~1scaling/patch)を使用して、サービスのスケーリング設定を更新したり、クラウドコンソールからレプリカの数を調整したりできます。

**Scale**および**Enterprise**ティアは、シングルレプリカサービスをサポートしています。ただし、これらのティア内のサービスが複数のレプリカで開始された場合や、複数のレプリカにスケールアウトした場合は、最小の`2`レプリカに戻すことしかできません。

:::note
サービスは最大20レプリカまで水平にスケールできます。追加のレプリカが必要な場合は、サポートチームにお問い合わせください。
:::

### API経由での水平スケーリング {#horizontal-scaling-via-api}

クラスタを水平にスケールするには、`PATCH`リクエストをAPIを介して発行して、レプリカの数を調整します。以下のスクリーンショットは、`3`レプリカのクラスタを`6`レプリカにスケールアウトするためのAPI呼び出しを示しています。

<img alt="スケーリングPATCHリクエスト"
    style={{width: '500px', marginLeft: 0}}
    src={scaling_patch_request} />

*`numReplicas`を更新するための`PATCH`リクエスト*

<img alt="スケーリングPATCHレスポンス"
    style={{width: '450px', marginLeft: 0}}
    src={scaling_patch_response} />

*`PATCH`リクエストからのレスポンス*

スケーリングリクエストを新たに発行するか、1つのリクエストが進行中である間に複数のリクエストを連続して発行した場合でも、スケーリングサービスは中間状態を無視し、最終的なレプリカ数に収束します。

### UI経由での水平スケーリング {#horizontal-scaling-via-ui}

UIからサービスを水平にスケールするには、サービスの**設定**ページでレプリカの数を調整できます。

<img alt="スケーリング設定"
    style={{width: '500px', marginLeft: 0}}
    src={scaling_configure} />

*ClickHouse Cloudコンソールからのサービススケーリング設定*

サービスがスケールされた後、クラウドコンソールのメトリクスダッシュボードにサービスへの正しい割り当てが表示されるはずです。以下のスクリーンショットは、クラスタが合計メモリ`96 GiB`にスケールされたことを示しており、これは`6`レプリカそれぞれに`16 GiB`のメモリ割り当てがあります。

<img alt="スケーリングメモリ割り当て"
    style={{width: '500px', marginLeft: 0}}
    src={scaling_memory_allocation} />

## 自動アイドル {#automatic-idling}
**設定**ページでは、サービスがアイドル状態のときに自動アイドルを許可するかどうかを選択できます（つまり、サービスがユーザーが提出したクエリを実行していないとき）。自動アイドルはサービスのコストを削減します。サービスが一時停止している間は計算リソースに対して請求されません。

:::note
特定の特別なケース（例えば、サービスに多数のパーツがある場合）では、サービスが自動的にアイドル状態にならないことがあります。

サービスはアイドル状態になり、[リフレッシュ可能なマテリアライズドビュー](/materialized-view/refreshable-materialized-view)、[S3Queue](/engines/table-engines/integrations/s3queue)からの消費、そして新しいマージのスケジューリングを一時停止します。既存のマージ操作は、サービスがアイドル状態に移行する前に完了します。リフレッシュ可能なマテリアライズドビューおよびS3Queue消費の継続的な運用を確保するために、アイドル状態機能を無効にしてください。
:::

:::danger 自動アイドルを使用すべきでない場合
自動アイドルは、クエリへの応答に遅延が発生しても問題ないユースケースのみで使用してください。サービスが一時停止していると、接続がタイムアウトするからです。自動アイドルは、使用頻度が低く、遅延を許容できるサービスに理想的です。頻繁に使用される顧客向け機能を提供するサービスにはお勧めできません。
:::

## 突発的なワークロードの処理 {#handling-bursty-workloads}
今後のワークロードの急増が予想される場合は、[ClickHouse Cloud API](/cloud/manage/api/services-api-reference.md)を使用して、急増に対応するためにサービスを事前にスケールアップし、需要が収まったらスケールダウンできます。各レプリカで使用中の現在のCPUコアとメモリを理解するには、以下のクエリを実行できます。

```sql
SELECT *
FROM clusterAllReplicas('default', view(
    SELECT
        hostname() AS server,
        anyIf(value, metric = 'CGroupMaxCPU') AS cpu_cores,
        formatReadableSize(anyIf(value, metric = 'CGroupMemoryTotal')) AS memory
    FROM system.asynchronous_metrics
))
ORDER BY server ASC
SETTINGS skip_unavailable_shards = 1
```
