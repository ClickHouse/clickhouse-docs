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


# 自動スケーリング \{#automatic-scaling\}

スケーリングとは、クライアントからの需要に応じて利用可能なリソースを調整することです。Scale ティアおよび Enterprise ティア（標準 1:4 プロファイル）のサービスは、API をプログラムから呼び出すか、UI 上の設定を変更してシステムリソースを調整することで、水平方向にスケールできます。これらのサービスは、アプリケーションの需要に応じて垂直方向に**自動スケール**させることもできます。

<ScalePlanFeatureBadge feature="Automatic vertical scaling"/>

:::note
Scale および Enterprise ティアは単一レプリカとマルチレプリカの両方のサービスをサポートしますが、Basic ティアは単一レプリカのサービスのみをサポートします。単一レプリカサービスはサイズ固定での利用を想定しており、垂直方向・水平方向のスケーリングはできません。サービスをスケールするには、Scale または Enterprise ティアへアップグレードしてください。
:::

## ClickHouse Cloud におけるスケーリングの仕組み \{#how-scaling-works-in-clickhouse-cloud\}

現在、ClickHouse Cloud は Scale ティアのサービスに対して、垂直方向のオートスケーリングと手動の水平方向スケーリングをサポートしています。

Enterprise ティアのサービスでは、スケーリングは次のように行われます。

- **水平スケーリング**: 手動による水平方向スケーリングは、Enterprise ティアのすべての標準プロファイルおよびカスタムプロファイルで利用可能です。
- **垂直スケーリング**:
  - 標準プロファイル (1:4) は垂直オートスケーリングをサポートします。
  - カスタムプロファイル（`highMemory` および `highCPU`）は、垂直オートスケーリングおよび手動の垂直スケーリングをサポートしません。ただし、サポートに連絡することで、これらのサービスを垂直方向にスケールできます。

:::note
ClickHouse Cloud におけるスケーリングは、["Make Before Break" (MBB)](/cloud/features/mbb) と呼ぶアプローチで実行されます。
これは、新しいサイズのレプリカを 1 つ以上追加してから古いレプリカを削除することで、スケーリング操作中に容量が失われないようにします。
既存のレプリカを削除してから新しいレプリカを追加するまでのギャップを排除することで、MBB はよりシームレスで影響の少ないスケーリングプロセスを実現します。
これは特にスケールアップのシナリオで有用であり、高いリソース使用率により追加容量が必要になったときに、レプリカを早まって削除するとリソース逼迫を悪化させてしまう状況を防ぎます。
このアプローチの一環として、古いレプリカを削除する前に、既存のクエリが完了するのを待つため最大 1 時間待機します。
これにより、既存クエリの完了を確保しつつ、古いレプリカが長時間残り続けないようにバランスを取ります。
:::

### 垂直方向の自動スケーリング \{#vertical-auto-scaling\}

<ScalePlanFeatureBadge feature="Automatic vertical scaling"/>

Scale プランおよび Enterprise プランのサービスは、CPU とメモリ使用量に基づく自動スケーリングをサポートしています。スケーリングの判断を行うために、直近 30 時間にわたるサービスの履歴使用状況を継続的に監視しています。使用量が特定のしきい値を上回ったり下回ったりした場合、需要に見合うようにサービスを適切にスケールさせます。

MBB を使用していないサービスでは、CPU 使用率が 50〜75% の範囲にある上限しきい値を超えたときに、CPU ベースの自動スケーリングが作動します（実際のしきい値はクラスターサイズによって異なります）。この時点で、クラスターへの CPU 割り当ては 2 倍になります。CPU 使用率が上限しきい値の半分を下回った場合（たとえば上限しきい値が 50% の場合は 25% まで下がったとき）、CPU 割り当ては半分になります。 

すでに MBB スケーリング手法を利用しているサービスでは、CPU 使用率が 75% のしきい値に達したときにスケールアップが行われ、その半分である 37.5% まで下がったときにスケールダウンが行われます。

メモリベースの自動スケーリングでは、クラスターは最大メモリ使用量の 125% までスケールされ、OOM（out of memory）エラーが発生した場合は最大 150% までスケールされます。

CPU またはメモリの推奨値のうち **大きい方** が採用され、サービスに割り当てられる CPU とメモリは、それぞれ `1` CPU と `4 GiB` メモリずつ連動して増減する形でスケールされます。

### 垂直オートスケーリングの構成 \{#configuring-vertical-auto-scaling\}

ClickHouse Cloud Scale または Enterprise のサービスのスケーリングは、**Admin** ロールを持つ組織メンバーが調整できます。垂直オートスケーリングを構成するには、対象サービスの **Settings** タブに移動し、以下のように最小および最大メモリと CPU 設定を調整します。

:::note
シングルレプリカのサービスは、すべてのティアでスケーリングできるわけではありません。
:::

<Image img={auto_scaling} size="lg" alt="スケーリング設定ページ" border/>

レプリカの **Maximum memory** を **Minimum memory** より高い値に設定します。サービスは、その範囲内で必要に応じてスケールします。これらの設定は、サービス作成の初期フロー中にも利用できます。サービス内の各レプリカには、同一のメモリおよび CPU リソースが割り当てられます。

また、これらの値を同じに設定し、実質的にサービスを特定の構成に「固定」することもできます。そうすると、選択したサイズに即座にスケールされます。

この設定を行うとクラスターでのオートスケーリングが無効になり、これらの設定を超える CPU またはメモリ使用量の増加からサービスが保護されなくなる点に注意してください。

:::note
Enterprise ティアのサービスでは、標準的な 1:4 プロファイルが垂直オートスケーリングをサポートします。
カスタムプロファイルは、提供開始時点では垂直オートスケーリングや手動の垂直スケーリングをサポートしません。
ただし、サポートに連絡することで、これらのサービスを垂直スケーリングできます。
:::

## 手動での水平スケーリング \{#manual-horizontal-scaling\}

<ScalePlanFeatureBadge feature="Manual horizontal scaling"/>

ClickHouse Cloud の [public APIs](https://clickhouse.com/docs/cloud/manage/api/swagger#/paths/~1v1~1organizations~1:organizationId~1services~1:serviceId~1scaling/patch) を使用してサービスのスケーリング設定を更新することでサービスをスケーリングしたり、Cloud コンソールからレプリカ数を調整したりできます。

**Scale** および **Enterprise** ティアは、単一レプリカのサービスもサポートしています。スケールアウトしたサービスは、最小でレプリカ 1 個までスケールインできます。単一レプリカのサービスは可用性が低下するため、本番環境での利用には推奨されない点に注意してください。

:::note
サービスは最大 20 個のレプリカまで水平スケーリングできます。これ以上のレプリカが必要な場合は、サポートチームまでお問い合わせください。
:::

### API による水平スケーリング \{#horizontal-scaling-via-api\}

クラスタを水平スケーリングするには、API 経由で `PATCH` リクエストを送信し、レプリカ数を調整します。以下のスクリーンショットは、`3` レプリカのクラスタを `6` レプリカにスケールアウトする API 呼び出しと、そのレスポンスの例です。

<Image img={scaling_patch_request} size="lg" alt="Scaling PATCH request" border/>

*`numReplicas` を更新するための `PATCH` リクエスト*

<Image img={scaling_patch_response} size="md" alt="Scaling PATCH response" border/>

*`PATCH` リクエストからのレスポンス*

スケーリング処理が進行中の間に、新しいスケーリングリクエストを発行したり、連続して複数のリクエストを発行したりした場合、スケーリングサービスは途中の状態を無視し、最終的なレプリカ数に収束します。

### UI 経由での水平方向スケーリング \{#horizontal-scaling-via-ui\}

UI からサービスを水平方向にスケールするには、**Settings** ページでサービスのレプリカ数を調整します。

<Image img={scaling_configure} size="md" alt="スケーリング構成設定" border/>

*ClickHouse Cloud コンソールでのサービススケーリング設定*

サービスのスケーリングが反映されると、Cloud コンソールのメトリクスダッシュボードに、そのサービスへの割り当てが正しく表示されます。以下のスクリーンショットでは、クラスターが合計メモリ `96 GiB`（`16 GiB` のメモリを割り当てたレプリカが `6` 個）にスケールしている状態を示しています。

<Image img={scaling_memory_allocation} size="md" alt="スケーリング時のメモリ割り当て" border />

## 自動アイドル化 \{#automatic-idling\}

**Settings** ページでは、サービスが一定時間非アクティブな状態（つまり、サービスがユーザーから送信されたクエリをまったく実行していない状態）のときに、自動的にアイドル化するかどうかも設定できます。自動アイドル化を有効にすると、サービスが一時停止している間はコンピュートリソースに対して課金されないため、サービスのコストを削減できます。

### アダプティブアイドリング \{#adaptive-idling\}

ClickHouse Cloud は、コスト削減を最適化しつつサービスの中断を防ぐため、アダプティブアイドリングを実装しています。システムはサービスをアイドル状態に移行する前に、複数の条件を評価します。以下のいずれかの条件に該当する場合、アダプティブアイドリングはアイドル時間の設定を上書きします。

- パーツ数がアイドル時のパーツ数の最大しきい値（デフォルト: 10,000）を超える場合、バックグラウンドメンテナンスを継続するため、サービスはアイドル状態になりません
- マージ処理が進行中の場合、それらのマージが完了し、重要なデータ統合が中断されないよう、サービスはアイドル状態になりません
- さらに、サービスはサーバー初期化時間に基づいてアイドルタイムアウトも調整します:
  - サーバー初期化時間が 15 分未満の場合、アダプティブタイムアウトは適用されず、ユーザーが設定したデフォルトのアイドルタイムアウトが使用されます
  - サーバー初期化時間が 15～30 分の場合、アイドルタイムアウトは 15 分に設定されます
  - サーバー初期化時間が 30～60 分の場合、アイドルタイムアウトは 30 分に設定されます
  - サーバー初期化時間が 60 分を超える場合、アイドルタイムアウトは 1 時間に設定されます

:::note
サービスはアイドル状態に入り、[リフレッシャブルmaterialized view](/materialized-view/refreshable-materialized-view) のリフレッシュ、[S3Queue](/engines/table-engines/integrations/s3queue) からのコンシューム、新規マージのスケジューリングを一時停止することがあります。既存のマージ処理は、サービスがアイドル状態に移行する前に完了します。リフレッシャブルmaterialized view の継続稼働と S3Queue のコンシュームを継続させるには、アイドル状態機能を無効にしてください。
:::

:::danger 自動アイドリングを使用すべきでない場合
自動アイドリングは、クエリ応答前の遅延を許容できるユースケースでのみ使用してください。サービスが一時停止されている間は、そのサービスへの接続はタイムアウトします。自動アイドリングは、利用頻度が低く、一定の遅延を許容できるサービスに最適です。利用頻度が高い顧客向け機能を支えるサービスには推奨されません。
:::

## ワークロードのスパイクへの対応 \{#handling-bursty-workloads\}

今後ワークロードでスパイクが予想される場合は、
[ClickHouse Cloud API](/cloud/manage/api/api-overview) を使用して、
スパイクに対応できるよう事前にサービスをスケールアップしておき、需要が落ち着いたら
スケールダウンできます。

各レプリカで現在使用されている CPU コア数とメモリを把握するには、
次のクエリを実行します:

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
