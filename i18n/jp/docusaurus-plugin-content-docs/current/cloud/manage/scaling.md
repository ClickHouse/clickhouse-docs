---
sidebar_position: 1
sidebar_label: '自動スケーリング'
slug: /manage/scaling
description: 'ClickHouse Cloudにおける自動スケーリングの設定'
keywords: ['autoscaling', 'auto scaling', 'scaling', 'horizontal', 'vertical', 'bursts']
title: '自動スケーリング'
---

import Image from '@theme/IdealImage';
import auto_scaling from '@site/static/images/cloud/manage/AutoScaling.png';
import scaling_patch_request from '@site/static/images/cloud/manage/scaling-patch-request.png';
import scaling_patch_response from '@site/static/images/cloud/manage/scaling-patch-response.png';
import scaling_configure from '@site/static/images/cloud/manage/scaling-configure.png';
import scaling_memory_allocation from '@site/static/images/cloud/manage/scaling-memory-allocation.png';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'


# 自動スケーリング

スケーリングとは、クライアントの要求に応じて利用可能なリソースを調整する能力を指します。ScaleおよびEnterprise（標準1:4プロファイル）ティアのサービスは、APIをプログラムから呼び出すか、UIの設定を変更してシステムリソースを調整することで水平にスケールすることができます。あるいは、これらのサービスはアプリケーションの要求に応じて**自動スケール**することもできます。

<ScalePlanFeatureBadge feature="自動垂直スケーリング"/>

## ClickHouse Cloudにおけるスケーリングの仕組み {#how-scaling-works-in-clickhouse-cloud}

現在、ClickHouse CloudはScaleティアサービス向けに垂直自動スケーリングと手動水平スケーリングをサポートしています。

Enterpriseティアサービスのスケーリングは以下のように機能します：

- **水平スケーリング**：手動水平スケーリングは、企業ティアのすべての標準およびカスタムプロファイルで利用可能です。
- **垂直スケーリング**：
  - 標準プロファイル（1:4）は垂直自動スケーリングをサポートします。
  - カスタムプロファイルは、リリース時に垂直自動スケーリングまたは手動垂直スケーリングに対応しません。しかし、これらのサービスはサポートに連絡することで垂直にスケーリングすることができます。

:::note
計算レプリカのための新しい垂直スケーリングメカニズム「Make Before Break」（MBB）を導入します。このアプローチでは、古いレプリカを削除する前に、新しいサイズのレプリカを1つ以上追加し、スケーリング操作中の容量の損失を防ぎます。既存のレプリカを削除する際のギャップを排除することで、MBBはよりシームレスで破壊的でないスケーリングプロセスを作り出します。これは、リソース使用率が高く追加の容量が必要な場合に特に有益です。なぜなら、レプリカを早急に削除することはリソースの制約を悪化させるだけだからです。

この変更の一環として、スケーリングイベントの一部として、履歴管理システムテーブルデータは最大30日間保持されます。さらに、AWSまたはGCPのサービスでは2024年12月19日以前、Azureのサービスでは2025年1月14日以前のシステムテーブルデータは新しい組織ティアへの移行の一環として保持されません。
:::

### 垂直自動スケーリング {#vertical-auto-scaling}

<ScalePlanFeatureBadge feature="自動垂直スケーリング"/>

ScaleおよびEnterpriseサービスは、CPUおよびメモリ使用量に基づいて自動スケーリングをサポートしています。私たちは常に過去30時間のサービスの履歴使用状況を監視し、スケーリングの決定を行います。使用量が特定の閾値を超えたり下回ったりした場合、その需要に応じてサービスを適切にスケーリングします。

CPUベースの自動スケーリングは、CPU使用率が50-75%の上限閾値を超えたときに開始されます（実際の閾値はクラスターのサイズによります）。この時点で、クラスターのCPU割り当てが倍増します。CPU使用量が上限閾値の半分（例えば、50%の上限閾値の場合、25%まで）を下回ると、CPU割り当てが半減します。

メモリベースの自動スケーリングは、クラスターを最大メモリ使用量の125%まで、またはOOM（メモリ不足）エラーが発生した場合には150%までスケールします。

**CPUまたはメモリの推薦の大きい方**が選択され、サービスに割り当てられるCPUおよびメモリは、ロックステップで`1` CPUと`4 GiB`メモリの増分でスケールします。

### 垂直自動スケーリングの設定 {#configuring-vertical-auto-scaling}

ClickHouse CloudのScaleまたはEnterpriseサービスのスケーリングは、**Admin**ロールを持つ組織メンバーによって調整できます。垂直自動スケーリングを設定するには、サービスの**設定**タブに移動し、以下に示す最小および最大メモリとCPU設定を調整します。

:::note
単一レプリカサービスはすべてのティアでスケーリングできません。
:::

<Image img={auto_scaling} size="lg" alt="スケーリング設定ページ" border/>

レプリカの**最大メモリ**を**最小メモリ**より高い値に設定します。これにより、サービスはその範囲内で必要に応じてスケールします。これらの設定は、最初のサービス作成フロー中にも利用可能です。サービス内の各レプリカには、同じメモリおよびCPUリソースが割り当てられます。

これらの値を同じに設定することもできます。実質的には、特定の構成にサービスを「固定」することになります。これにより、選択したサイズに即座にスケーリングが強制されます。

これは、クラスターでの自動スケーリングを無効にし、これらの設定を超えるCPUまたはメモリ使用量の増加からサービスを保護できなくなることに注意が必要です。

:::note
Enterpriseティアサービスでは、標準1:4プロファイルが垂直自動スケーリングをサポートします。カスタムプロファイルは、リリース時に垂直自動スケーリングまたは手動垂直スケーリングをサポートしません。しかし、これらのサービスはサポートに連絡することで垂直にスケーリングできます。
:::

## 手動水平スケーリング {#manual-horizontal-scaling}

<ScalePlanFeatureBadge feature="手動水平スケーリング"/>

ClickHouse Cloudの[公開API](https://clickhouse.com/docs/cloud/manage/api/swagger#/paths/~1v1~1organizations~1:organizationId~1services~1:serviceId~1scaling/patch)を使用して、サービスのスケーリング設定を更新するか、クラウドコンソールからレプリカの数を調整してサービスをスケーリングできます。

**Scale**および**Enterprise**ティアは単一レプリカサービスをサポートしています。しかし、これらのティアのサービスで複数のレプリカから開始したり、複数のレプリカにスケールアウトした場合は、最小`2`レプリカに戻すことしかできません。

:::note
サービスは最大20レプリカまで水平にスケールできます。追加のレプリカが必要な場合は、サポートチームにご連絡ください。
:::

### APIを介した水平スケーリング {#horizontal-scaling-via-api}

クラスターを水平にスケールするには、API経由で`PATCH`リクエストを発行してレプリカの数を調整します。以下のスクリーンショットは、`3`レプリカのクラスターを`6`レプリカにスケールアウトするためのAPI呼び出しと、対応するレスポンスを示しています。

<Image img={scaling_patch_request} size="lg" alt="スケーリングPATCHリクエスト" border/>

*`numReplicas`を更新するための`PATCH`リクエスト*

<Image img={scaling_patch_response} size="md" alt="スケーリングPATCHレスポンス" border/>

*`PATCH`リクエストのレスポンス*

新しいスケーリングリクエストを発行したり、すでに進行中のものがある間に複数のリクエストを続けて発行すると、スケーリングサービスは中間状態を無視し、最終的なレプリカ数に収束します。

### UIを介した水平スケーリング {#horizontal-scaling-via-ui}

UIからサービスを水平にスケールするには、**設定**ページでサービスのレプリカ数を調整できます。

<Image img={scaling_configure} size="md" alt="スケーリング設定" border/>

*ClickHouse Cloudコンソールからのサービススケーリング設定*

サービスがスケーリングされると、クラウドコンソールのメトリクスダッシュボードには、サービスへの正しい割り当てが表示されるはずです。以下のスクリーンショットは、クラスターが合計メモリ`96 GiB`にスケールし、各`6`レプリカが`16 GiB`のメモリ割り当てを受けていることを示しています。

<Image img={scaling_memory_allocation} size="md" alt="スケーリングメモリ割り当て" border />

## 自動アイドル状態 {#automatic-idling}
**設定**ページでは、サービスが非アクティブであるときに自動アイドル状態を許可するかどうかを選択できます（つまり、サービスがユーザーが提出したクエリを実行していないとき）。自動アイドル状態を設定すると、サービスが一時停止している間は計算リソースに対して請求されないため、コストが削減されます。

:::note
特定の特別な場合（例えば、サービスに多数のパーツがある場合）では、サービスは自動的にはアイドル状態になりません。

サービスは、リフレッシュ可能な[マテリアライズドビュー](/materialized-view/refreshable-materialized-view)のリフレッシュ、[S3Queue](/engines/table-engines/integrations/s3queue)からの消費、および新しいマージのスケジューリングを停止するアイドル状態に入る可能性があります。既存のマージ操作は、サービスがアイドル状態に移行する前に完了します。リフレッシュ可能なマテリアライズドビューおよびS3Queueの消費の継続的な操作を確保するには、アイドル状態機能を無効にしてください。
:::

:::danger 自動アイドル状態を使用しないべき時
クエリへの応答に遅延が発生しても問題ない場合にのみ、自動アイドル状態を使用してください。サービスが一時停止している間に、サービスへの接続がタイムアウトします。自動アイドル状態は、使用頻度が低く、遅延を許容できるサービスに最適です。頻繁に使用される顧客向け機能を駆動するサービスには推奨しません。
:::

## バーストワークロードの処理 {#handling-bursty-workloads}
今後予想されるワークロードのピークがある場合、[ClickHouse Cloud API](/cloud/manage/api/api-overview)を使用してサービスを事前にスケールアップし、その需要が収束したらスケールダウンできます。

各レプリカが使用している現在のCPUコア数とメモリを理解するには、以下のクエリを実行できます：

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
