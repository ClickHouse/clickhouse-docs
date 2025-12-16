---
sidebar_position: 1
sidebar_label: '自動スケーリング'
slug: /manage/scaling
description: 'ClickHouse Cloud における自動スケーリングの構成'
keywords: ['自動スケーリング', 'オートスケーリング', 'スケーリング', '水平スケーリング', '垂直スケーリング', 'バースト']
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

# 自動スケーリング {#automatic-scaling}

スケーリングとは、クライアントからの需要に応じて利用可能なリソースを調整する機能を指します。Scale および Enterprise（標準 1:4 プロファイル）ティアのサービスは、API をプログラム経由で呼び出すか、UI 上の設定を変更してシステムリソースを調整することで、水平スケーリングが可能です。これらのサービスは、アプリケーションの需要に合わせて**垂直方向に自動スケーリング**することもできます。

<ScalePlanFeatureBadge feature="Automatic vertical scaling"/>

:::note
Scale および Enterprise ティアは単一レプリカとマルチレプリカの両方のサービスをサポートしますが、Basic ティアは単一レプリカのサービスのみをサポートします。単一レプリカのサービスはサイズが固定されており、垂直・水平どちらのスケーリングもできません。ユーザーは、サービスをスケーリングするために Scale または Enterprise ティアへアップグレードできます。
:::

## ClickHouse Cloud におけるスケーリングの仕組み {#how-scaling-works-in-clickhouse-cloud}

現在、ClickHouse Cloud は Scale ティアのサービスに対して、垂直オートスケーリングと手動による水平スケーリングをサポートしています。

Enterprise ティアのサービスでは、スケーリングは次のように動作します:

- **水平スケーリング**: Enterprise ティアでは、すべての標準およびカスタムプロファイルで手動の水平スケーリングが利用可能になります。
- **垂直スケーリング**:
  - 標準プロファイル (1:4) は垂直オートスケーリングをサポートします。
  - カスタムプロファイル（`highMemory` および `highCPU`）は、垂直オートスケーリングや手動の垂直スケーリングをサポートしません。ただし、サポートに連絡することで、これらのサービスも垂直方向にスケーリングできます。

:::note
ClickHouse Cloud におけるスケーリングは、["Make Before Break" (MBB)](/cloud/features/mbb) アプローチと呼んでいる方式で行われます。
これは、新しいサイズのレプリカを 1 つ以上追加してから古いレプリカを削除することで、スケーリング処理中にキャパシティを失わないようにします。
既存のレプリカを削除してから新しいレプリカを追加するまでのギャップを排除することで、MBB はよりシームレスで影響の少ないスケーリングプロセスを実現します。
特にスケールアップのシナリオにおいて、リソース利用率の上昇によって追加キャパシティが必要になる場合に有益です。このような状況でレプリカを早まって削除すると、リソース逼迫を悪化させるだけだからです。
このアプローチの一環として、古いレプリカを削除する前に、既存のクエリが完了するのを待つため、最大 1 時間待機します。
これにより、既存のクエリ完了の必要性と、古いレプリカを長時間残さないようにする必要性とのバランスを取ります。

この変更の一部として、次の点に注意してください:
1. スケーリングイベントの一部として、`system` テーブルの履歴データは最大 30 日間保持されます。加えて、AWS または GCP 上のサービスに対しては 2024 年 12 月 19 日より前、Azure 上のサービスに対しては 2025 年 1 月 14 日より前の `system` テーブルデータは、新しい組織ティアへの移行の一環として保持されません。
2. TDE (Transparent Data Encryption) を利用しているサービスでは、現在 MBB の実行後に `system` テーブルデータは保持されません。この制限を取り除くべく対応中です。
:::

### 垂直オートスケーリング {#vertical-auto-scaling}

<ScalePlanFeatureBadge feature="自動垂直スケーリング"/>

Scale および Enterprise サービスは、CPU とメモリ使用量に基づくオートスケーリングをサポートしています。スケーリングの判断を行うために、過去 30 時間にわたるサービスの履歴使用状況を常に監視しています。使用率が特定のしきい値を上回る、または下回ると、その需要に合わせてサービスを適切にスケーリングします。

MBB を利用していないサービスでは、CPU ベースのオートスケーリングは、CPU 使用率が 50〜75% の範囲に設定された上限しきい値（実際のしきい値はクラスタサイズによって異なる）を超えたときに動作を開始します。この時点で、クラスタに割り当てられた CPU は 2 倍になります。CPU 使用率が上限しきい値の半分（たとえば上限しきい値が 50% の場合は 25%）を下回ると、CPU 割り当ては半減します。 

すでに MBB スケーリングアプローチを利用しているサービスでは、CPU 使用率が 75% に達するとスケールアップが行われ、その半分である 37.5% まで低下するとスケールダウンが行われます。

メモリベースのオートスケーリングでは、クラスタはこれまでの最大メモリ使用量の 125% まで、あるいは OOM (out of memory) エラーが発生している場合は最大 150% までスケールされます。

CPU とメモリの推奨値のうち**大きい方**が採用され、サービスに割り当てられる CPU とメモリは、`1` CPU と `4 GiB` メモリずつロックステップで増減する単位でスケーリングされます。

### 垂直オートスケーリングの設定 {#configuring-vertical-auto-scaling}

ClickHouse Cloud の Scale または Enterprise サービスのスケーリングは、**Admin** ロールを持つ組織メンバーが調整できます。垂直オートスケーリングを設定するには、対象サービスの **Settings** タブに移動し、以下のように最小および最大メモリと CPU 設定を調整します。

:::note
単一レプリカのサービスは、すべてのティアでスケーリングできるわけではありません。
:::

<Image img={auto_scaling} size="lg" alt="スケーリング設定ページ" border/>

レプリカの **Maximum memory** を **Minimum memory** よりも大きい値に設定します。その範囲内で必要に応じてサービスがスケールします。これらの設定は、初回のサービス作成フロー中にも利用できます。サービス内の各レプリカには、同じメモリと CPU リソースが割り当てられます。

これらの値を同じに設定することもでき、その場合はサービスを特定の構成に「固定」することになります。そうすると、選択したサイズへのスケーリングが即座に行われます。

この設定を行うとクラスタのオートスケーリングは無効になり、CPU やメモリ使用量がこれらの設定を超えて増加した場合でも、サービスはスケーリングによる保護を受けられない点に注意が必要です。

:::note
Enterprise ティアのサービスでは、標準の 1:4 プロファイルが垂直オートスケーリングをサポートします。
カスタムプロファイルは、リリース時点では垂直オートスケーリングや手動の垂直スケーリングをサポートしません。
ただし、サポートに連絡することで、これらのサービスも垂直方向にスケーリングできます。
:::

## 手動による水平スケーリング {#manual-horizontal-scaling}

<ScalePlanFeatureBadge feature="Manual horizontal scaling"/>

ClickHouse Cloud の[パブリック API](https://clickhouse.com/docs/cloud/manage/api/swagger#/paths/~1v1~1organizations~1:organizationId~1services~1:serviceId~1scaling/patch)を使用してサービスのスケーリング設定を更新するか、クラウドコンソールからレプリカ数を調整してサービスをスケールできます。

**Scale** および **Enterprise** ティアでは、単一レプリカのサービスもサポートされています。一度スケールアウトしたサービスは、最小で 1 レプリカまでスケールインできます。ただし、単一レプリカのサービスは可用性が低下するため、本番環境での利用は推奨されません。

:::note
サービスは最大 20 レプリカまで水平スケーリングできます。さらに多くのレプリカが必要な場合は、サポートチームまでお問い合わせください。
:::

### API による水平スケーリング {#horizontal-scaling-via-api}

クラスターを水平スケーリングするには、API 経由で `PATCH` リクエストを送信し、レプリカ数を調整します。以下のスクリーンショットは、`3` レプリカのクラスターを `6` レプリカにスケールアウトする API 呼び出しと、その応答を示しています。

<Image img={scaling_patch_request} size="lg" alt="スケーリングの PATCH リクエスト" border/>

*`numReplicas` を更新するための `PATCH` リクエスト*

<Image img={scaling_patch_response} size="md" alt="スケーリングの PATCH レスポンス" border/>

*`PATCH` リクエストからのレスポンス*

スケーリングがすでに進行中の間に、新しいスケーリング要求や複数の要求を連続して発行した場合、スケーリングサービスは途中の状態を無視し、最終的なレプリカ数に収束します。

### UI による水平スケーリング {#horizontal-scaling-via-ui}

UI からサービスを水平スケーリングするには、**Settings** ページでそのサービスのレプリカ数を調整します。

<Image img={scaling_configure} size="md" alt="スケーリング設定の構成" border/>

*ClickHouse Cloud コンソールからのサービススケーリング設定*

サービスがスケールされたら、クラウドコンソールのメトリクスダッシュボードに、そのサービスへの正しいリソース割り当てが表示されます。以下のスクリーンショットは、クラスターが合計メモリ `96 GiB`（`16 GiB` のメモリ割り当てを持つレプリカが `6` 個）にスケールされた状態を示しています。

<Image img={scaling_memory_allocation} size="md" alt="スケーリング後のメモリ割り当て" border />

## 自動アイドル化 {#automatic-idling}
**Settings** ページでは、上の画像に示されているように、サービスが非アクティブなとき（つまり、サービスがユーザーが送信したクエリを一切実行していないとき）に自動的にアイドル状態にするかどうかも選択できます。自動アイドル化を有効にすると、サービスが一時停止している間はコンピュートリソースに対して課金されないため、コストを削減できます。

:::note
特定のケース、たとえばサービスが非常に多くのパーツを持っている場合などには、そのサービスは自動的にはアイドル状態になりません。

サービスはアイドル状態に入り、その間は [refreshable materialized views](/materialized-view/refreshable-materialized-view) のリフレッシュ、[S3Queue](/engines/table-engines/integrations/s3queue) からの取り込み、および新しいマージのスケジューリングを一時停止します。すでに進行中のマージ処理は、サービスがアイドル状態へ移行する前に完了します。refreshable materialized views と S3Queue の取り込みを継続的に動作させたい場合は、自動アイドル化機能を無効にしてください。
:::

:::danger 自動アイドル化を使用すべきでない場合
クエリに応答するまでの遅延を許容できるユースケースにのみ自動アイドル化を使用してください。サービスが一時停止している間は、そのサービスへの接続はタイムアウトするためです。自動アイドル化は、利用頻度が低く、ある程度の遅延を許容できるサービスに最適です。頻繁に利用される顧客向け機能を支えるサービスには推奨されません。
:::

## ワークロードのスパイクへの対応 {#handling-bursty-workloads}

近いうちにワークロードのスパイクが予想される場合は、
[ClickHouse Cloud API](/cloud/manage/api/api-overview) を使用して、
あらかじめサービスをスケールアップしてスパイクに備え、需要が落ち着いたら
スケールダウンすることができます。

各レプリカで現在使用されている CPU コア数とメモリを把握するには、
以下のクエリを実行します。

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
