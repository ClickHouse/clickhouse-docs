---
sidebar_position: 1
sidebar_label: '自動スケーリング'
slug: /manage/scaling
description: 'ClickHouse Cloud における自動スケーリングの構成'
keywords: ['autoscaling', 'auto scaling', 'scaling', 'horizontal', 'vertical', 'bursts']
title: '自動スケーリング'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import auto_scaling from '@site/static/images/cloud/manage/AutoScaling.png';
import scaling_patch_request from '@site/static/images/cloud/manage/scaling-patch-request.png';
import scaling_patch_response from '@site/static/images/cloud/manage/scaling-patch-response.png';
import scaling_configure from '@site/static/images/cloud/manage/scaling-configure.png';
import scaling_memory_allocation from '@site/static/images/cloud/manage/scaling-memory-allocation.png';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'


# 自動スケーリング

スケーリングとは、クライアントの需要を満たすために利用可能なリソースを調整することを指します。Scale および Enterprise（標準 1:4 プロファイル）ティアのサービスは、API をプログラムから呼び出すか、UI 上の設定を変更してシステムリソースを調整することで、水平方向にスケールできます。これらのサービスは、アプリケーションの需要に応じて垂直方向に**自動スケーリング**することもできます。

<ScalePlanFeatureBadge feature="Automatic vertical scaling"/>

:::note
Scale および Enterprise ティアはシングルレプリカおよびマルチレプリカの両方のサービスをサポートしますが、Basic ティアがサポートするのはシングルレプリカサービスのみです。シングルレプリカサービスはサイズが固定されており、垂直・水平方向のスケーリングはできません。ユーザーは、サービスをスケーリングするために Scale もしくは Enterprise ティアへアップグレードできます。
:::



## ClickHouse Cloudにおけるスケーリングの仕組み {#how-scaling-works-in-clickhouse-cloud}

現在、ClickHouse CloudはScaleティアサービスに対して垂直オートスケーリングと手動水平スケーリングをサポートしています。

Enterpriseティアサービスのスケーリングは以下のように動作します:

- **水平スケーリング**: Enterpriseティアのすべての標準プロファイルとカスタムプロファイルで手動水平スケーリングが利用可能です。
- **垂直スケーリング**:
  - 標準プロファイル(1:4)は垂直オートスケーリングをサポートします。
  - カスタムプロファイル(`highMemory`および`highCPU`)は垂直オートスケーリングまたは手動垂直スケーリングをサポートしていません。ただし、これらのサービスはサポートに連絡することで垂直スケーリングが可能です。

:::note
ClickHouse Cloudでのスケーリングは、["Make Before Break" (MBB)](/cloud/features/mbb)と呼ばれるアプローチで実行されます。
このアプローチでは、古いレプリカを削除する前に新しいサイズのレプリカを1つ以上追加することで、スケーリング操作中の容量損失を防ぎます。
既存のレプリカの削除と新しいレプリカの追加の間のギャップを排除することで、MBBはよりシームレスで中断の少ないスケーリングプロセスを実現します。
これは特にスケールアップシナリオで有益です。高いリソース使用率が追加容量の必要性を引き起こす場合、レプリカを早期に削除するとリソース制約がさらに悪化するためです。
このアプローチの一環として、古いレプリカを削除する前に、既存のクエリが完了するまで最大1時間待機します。
これにより、既存のクエリを完了させる必要性と、古いレプリカが長時間残存しないようにすることのバランスを取ります。

この変更の一環として、以下の点にご注意ください:

1. 履歴システムテーブルデータは、スケーリングイベントの一環として最大30日間保持されます。さらに、新しい組織ティアへの移行の一環として、AWSまたはGCP上のサービスについては2024年12月19日より前、Azure上のサービスについては2025年1月14日より前のシステムテーブルデータは保持されません。
2. TDE(透過的データ暗号化)を利用しているサービスでは、現在MBB操作後にシステムテーブルデータが維持されません。この制限の解消に取り組んでいます。
   :::

### 垂直オートスケーリング {#vertical-auto-scaling}

<ScalePlanFeatureBadge feature='Automatic vertical scaling' />

ScaleおよびEnterpriseサービスは、CPUとメモリ使用量に基づくオートスケーリングをサポートしています。スケーリングの判断を行うため、過去30時間にわたるルックバックウィンドウでサービスの履歴使用状況を常時監視しています。使用量が特定の閾値を上回るか下回ると、需要に合わせてサービスを適切にスケーリングします。

MBB非対応サービスの場合、CPU使用率が50〜75%の範囲の上限閾値を超えると、CPUベースのオートスケーリングが作動します(実際の閾値はクラスタのサイズに依存します)。この時点で、クラスタへのCPU割り当てが2倍になります。CPU使用率が上限閾値の半分を下回ると(例えば、上限閾値が50%の場合は25%に)、CPU割り当ては半分になります。

すでにMBBスケーリングアプローチを利用しているサービスの場合、スケールアップはCPU閾値75%で発生し、スケールダウンはその半分の閾値、つまり37.5%で発生します。

メモリベースのオートスケーリングは、最大メモリ使用量の125%にクラスタをスケーリングし、OOM(メモリ不足)エラーが発生した場合は最大150%までスケーリングします。

CPUまたはメモリの推奨値のうち**大きい方**が選択され、サービスに割り当てられるCPUとメモリは`1` CPUと`4 GiB`メモリの連動した増分でスケーリングされます。

### 垂直オートスケーリングの設定 {#configuring-vertical-auto-scaling}

ClickHouse CloudのScaleまたはEnterpriseサービスのスケーリングは、**Admin**ロールを持つ組織メンバーが調整できます。垂直オートスケーリングを設定するには、サービスの**Settings**タブに移動し、以下に示すように最小および最大メモリとCPU設定を調整します。

:::note
単一レプリカサービスは、すべてのティアでスケーリングできません。
:::

<Image img={auto_scaling} size='lg' alt='Scaling settings page' border />

レプリカの**Maximum memory**を**Minimum memory**よりも高い値に設定します。サービスはこれらの境界内で必要に応じてスケーリングされます。これらの設定は、初期サービス作成フロー中にも利用可能です。サービス内の各レプリカには、同じメモリとCPUリソースが割り当てられます。

これらの値を同じに設定することもでき、実質的にサービスを特定の構成に「固定」します。これを行うと、選択した希望のサイズへのスケーリングが即座に強制されます。

これにより、クラスタ上のすべてのオートスケーリングが無効になり、これらの設定を超えるCPUまたはメモリ使用量の増加に対してサービスが保護されなくなることに注意が必要です。

:::note
Enterpriseティアサービスの場合、標準1:4プロファイルは垂直オートスケーリングをサポートします。
カスタムプロファイルは、リリース時点では垂直オートスケーリングまたは手動垂直スケーリングをサポートしていません。
ただし、これらのサービスはサポートに連絡することで垂直スケーリングが可能です。
:::


## 手動水平スケーリング {#manual-horizontal-scaling}

<ScalePlanFeatureBadge feature='Manual horizontal scaling' />

ClickHouse Cloudの[パブリックAPI](https://clickhouse.com/docs/cloud/manage/api/swagger#/paths/~1v1~1organizations~1:organizationId~1services~1:serviceId~1scaling/patch)を使用してサービスのスケーリング設定を更新するか、クラウドコンソールからレプリカ数を調整することで、サービスをスケーリングできます。

**Scale**および**Enterprise**ティアでは、単一レプリカサービスもサポートされています。スケールアウトしたサービスは、最小で単一レプリカまでスケールインできます。なお、単一レプリカサービスは可用性が低下するため、本番環境での使用は推奨されません。

:::note
サービスは最大20レプリカまで水平スケーリング可能です。追加のレプリカが必要な場合は、サポートチームにお問い合わせください。
:::

### API経由の水平スケーリング {#horizontal-scaling-via-api}

クラスタを水平スケーリングするには、API経由で`PATCH`リクエストを発行してレプリカ数を調整します。以下のスクリーンショットは、`3`レプリカのクラスタを`6`レプリカにスケールアウトするAPIコールと、対応するレスポンスを示しています。

<Image
  img={scaling_patch_request}
  size='lg'
  alt='スケーリングPATCHリクエスト'
  border
/>

_`numReplicas`を更新する`PATCH`リクエスト_

<Image
  img={scaling_patch_response}
  size='md'
  alt='スケーリングPATCHレスポンス'
  border
/>

_`PATCH`リクエストからのレスポンス_

スケーリングリクエストが既に進行中の状態で、新しいスケーリングリクエストまたは複数のリクエストを連続して発行した場合、スケーリングサービスは中間状態を無視し、最終的なレプリカ数に収束します。

### UI経由の水平スケーリング {#horizontal-scaling-via-ui}

UIからサービスを水平スケーリングするには、**Settings**ページでサービスのレプリカ数を調整します。

<Image
  img={scaling_configure}
  size='md'
  alt='スケーリング設定'
  border
/>

_ClickHouse Cloudコンソールのサービススケーリング設定_

サービスがスケーリングされると、クラウドコンソールのメトリクスダッシュボードにサービスへの正しい割り当てが表示されます。以下のスクリーンショットは、クラスタが合計メモリ`96 GiB`にスケーリングされた状態を示しており、これは各`16 GiB`のメモリ割り当てを持つ`6`レプリカに相当します。

<Image
  img={scaling_memory_allocation}
  size='md'
  alt='スケーリングメモリ割り当て'
  border
/>


## 自動アイドリング {#automatic-idling}

**設定**ページでは、上記の画像に示されているように、サービスが非アクティブな場合（つまり、ユーザーが送信したクエリを実行していない場合）に自動アイドリングを許可するかどうかを選択できます。自動アイドリングを有効にすると、サービスが一時停止している間はコンピュートリソースに対して課金されないため、サービスのコストを削減できます。

:::note
特定のケースでは、例えばサービスが多数のパートを保持している場合、サービスは自動的にアイドル状態になりません。

サービスがアイドル状態に入ると、[リフレッシュ可能なマテリアライズドビュー](/materialized-view/refreshable-materialized-view)のリフレッシュ、[S3Queue](/engines/table-engines/integrations/s3queue)からの消費、および新しいマージのスケジューリングが一時停止されます。既存のマージ操作は、サービスがアイドル状態に移行する前に完了します。リフレッシュ可能なマテリアライズドビューとS3Queueの消費を継続的に動作させるには、アイドル状態機能を無効にしてください。
:::

:::danger 自動アイドリングを使用すべきでない場合
自動アイドリングは、クエリへの応答前に遅延が発生しても問題ないユースケースでのみ使用してください。サービスが一時停止されると、サービスへの接続がタイムアウトするためです。自動アイドリングは、使用頻度が低く遅延が許容できるサービスに適しています。頻繁に使用される顧客向け機能を提供するサービスには推奨されません。
:::


## ワークロードの急増への対処 {#handling-bursty-workloads}

ワークロードの急増が予想される場合、[ClickHouse Cloud API](/cloud/manage/api/api-overview)を使用して、事前にサービスをスケールアップし急増に対処した後、需要が落ち着いた時点でスケールダウンすることができます。

各レプリカで現在使用中のCPUコア数とメモリを確認するには、以下のクエリを実行してください:

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
