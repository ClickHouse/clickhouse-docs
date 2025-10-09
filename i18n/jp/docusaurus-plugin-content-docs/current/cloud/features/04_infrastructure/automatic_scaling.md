---
'sidebar_position': 1
'sidebar_label': '自動スケーリング'
'slug': '/manage/scaling'
'description': 'ClickHouse Cloudでの自動スケーリングの設定'
'keywords':
- 'autoscaling'
- 'auto scaling'
- 'scaling'
- 'horizontal'
- 'vertical'
- 'bursts'
'title': '自動スケーリング'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import auto_scaling from '@site/static/images/cloud/manage/AutoScaling.png';
import scaling_patch_request from '@site/static/images/cloud/manage/scaling-patch-request.png';
import scaling_patch_response from '@site/static/images/cloud/manage/scaling-patch-response.png';
import scaling_configure from '@site/static/images/cloud/manage/scaling-configure.png';
import scaling_memory_allocation from '@site/static/images/cloud/manage/scaling-memory-allocation.png';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'


# 自動スケーリング

スケーリングとは、クライアントの要求に応じて利用可能なリソースを調整する能力を指します。ScaleおよびEnterprise（標準1:4プロファイル）階層のサービスは、APIをプログラム的に呼び出すか、UI上の設定を変更することで水平スケーリングを行うことができます。これらのサービスは、アプリケーションの要求に応じて**自動的に**垂直スケーリングすることもできます。

<ScalePlanFeatureBadge feature="自動垂直スケーリング"/>

:::note
ScaleおよびEnterprise階層は、単一および複数レプリカのサービスの両方をサポートしていますが、Basic階層は単一レプリカサービスのみをサポートしています。単一レプリカサービスは固定サイズのため、垂直または水平スケーリングを行うことはできません。ユーザーはサービスをスケールまたはEnterprise階層にアップグレードして、サービスをスケールできます。
:::

## ClickHouse Cloudにおけるスケーリングの仕組み {#how-scaling-works-in-clickhouse-cloud}

現在、ClickHouse Cloudは、Scale階層のサービスに対して垂直自動スケーリングおよび手動水平スケーリングをサポートしています。

Enterprise階層のサービスにおけるスケーリングは以下のように機能します：

- **水平スケーリング**：手動水平スケーリングは、Enterprise階層のすべての標準およびカスタムプロファイルで利用可能です。
- **垂直スケーリング**：
  - 標準プロファイル（1:4）は垂直自動スケーリングをサポートします。
  - カスタムプロファイル（`highMemory`および`highCPU`）は、垂直自動スケーリングまたは手動垂直スケーリングをサポートしていません。ただし、これらのサービスは、サポートに連絡することで垂直にスケールできます。

:::note
ClickHouse Cloudでのスケーリングは、「Make Before Break」（MBB）アプローチと呼ばれる方法で行われます。これにより、古いレプリカを削除する前に新しいサイズのレプリカを1つ以上追加し、スケーリング操作中の容量の損失を防ぎます。既存のレプリカを削除することと新しいレプリカを追加する間のギャップを排除することで、MBBはよりシームレスで中断の少ないスケーリングプロセスを実現します。特に、高リソース使用率で追加容量の必要性が生じるスケールアップシナリオでは、早期にレプリカを削除することがリソースの制約を悪化させるため、このアプローチは特に有益です。このアプローチの一環として、古いレプリカでの既存のクエリを完了させるために、最大1時間まで待ちます。これにより、既存のクエリを完了させる必要と、古いレプリカが長く残ることがないようにバランスを取ります。

この変更の一環として注意してください：
1. 歴史的システムテーブルデータは、スケーリングイベントの一環として最大で30日間保持されます。さらに、AWSまたはGCP上のサービスに関しては2024年12月19日より古いシステムテーブルのデータは保持されず、Azure上のサービスに関しては2025年1月14日より古いデータは保持されません。
2. TDE（透過的データ暗号化）を利用しているサービスに関しては、MBB操作後にシステムテーブルデータは現在保持されていません。この制限を取り除くための作業を進めています。
:::

### 垂直自動スケーリング {#vertical-auto-scaling}

<ScalePlanFeatureBadge feature="自動垂直スケーリング"/>

ScaleおよびEnterpriseサービスは、CPUおよびメモリ使用量に基づく自動スケーリングをサポートしています。私たちは、スケーリングの意思決定を下すために、サービスの歴史的使用状況を30時間のウィンドウで常に監視しています。使用量が特定の閾値を上回ったり下回ったりすると、需要に応じてサービスを適切にスケーリングします。

CPU使用量が50-75%の範囲の上限閾値を超えると、CPUベースの自動スケーリングが発動します（実際の閾値はクラスターのサイズによって異なります）。この時、クラスターに割り当てられているCPUは2倍になります。CPU使用量が上限閾値の半分を下回ると（例えば、50%の上限閾値の場合、25%に）、CPUの割り当ては半減します。

メモリベースの自動スケーリングは、クラスターを最大メモリ使用量の125%に、またはOOM（メモリ不足）エラーが発生した場合には150%までスケールします。

**CPU**または**メモリ**の推奨値のうち、より**大きい**方が選択され、サービスに割り当てられるCPUおよびメモリは、`1` CPUと`4 GiB`メモリの比率でスケーリングされます。

### 垂直自動スケーリングの設定 {#configuring-vertical-auto-scaling}

ClickHouse CloudのScaleまたはEnterpriseサービスのスケーリングは、**Admin**役割を持つ組織メンバーによって調整できます。垂直自動スケーリングを構成するには、サービスの**設定**タブに移動し、以下のように最小および最大メモリとCPU設定を調整します。

:::note
単一レプリカサービスは、すべての階層でスケーリングできません。
:::

<Image img={auto_scaling} size="lg" alt="スケーリング設定ページ" border/>

レプリカの**最大メモリ**を**最小メモリ**より高い値に設定します。これにより、サービスはその範囲内で必要に応じてスケールします。これらの設定は、最初のサービス作成フロー中にも利用可能です。サービス内の各レプリカには、同じメモリとCPUリソースが割り当てられます。

また、これらの値を同じに設定することもでき、実質的にサービスを特定の構成に「ピン留め」します。そうすると、選択したサイズに即座にスケーリングが強制されます。

この操作を行うと、クラスターの自動スケーリングが無効になり、これらの設定を超えるCPUまたはメモリ使用の増加からサービスが保護されなくなることに注意してください。

:::note
Enterprise階層サービスでは、標準1:4プロファイルが垂直自動スケーリングをサポートします。
カスタムプロファイルは、起動時に垂直自動スケーリングまたは手動垂直スケーリングをサポートしません。
ただし、これらのサービスはサポートに連絡することで垂直スケールできます。
:::

## 手動水平スケーリング {#manual-horizontal-scaling}

<ScalePlanFeatureBadge feature="手動水平スケーリング"/>

ClickHouse Cloudの[公開API](https://clickhouse.com/docs/cloud/manage/api/swagger#/paths/~1v1~1organizations~1:organizationId~1services~1:serviceId~1scaling/patch)を使用して、サービスのスケーリング設定を更新するか、クラウドコンソールからレプリカの数を調整することで、サービスをスケールできます。

**Scale**および**Enterprise**階層は、単一レプリカサービスもサポートしています。一度スケールアウトしたサービスは、最小1レプリカまでスケールバックできます。単一レプリカサービスは可用性が低下し、商業用途には推奨されません。

:::note
サービスは水平に最大20レプリカまでスケールできます。追加のレプリカが必要な場合は、サポートチームにお問い合わせください。
:::

### APIを使用した水平スケーリング {#horizontal-scaling-via-api}

クラスターの水平スケーリングを行うには、APIを介して`PATCH`リクエストを発行してレプリカの数を調整します。以下のスクリーンショットには、`3`レプリカのクラスターを`6`レプリカにスケールアウトするAPI呼び出しと、それに対するレスポンスが示されています。

<Image img={scaling_patch_request} size="lg" alt="スケーリングPATCHリクエスト" border/>

*`numReplicas`を更新するための`PATCH`リクエスト*

<Image img={scaling_patch_response} size="md" alt="スケーリングPATCHレスポンス" border/>

*`PATCH`リクエストからのレスポンス*

新しいスケーリングリクエストまたは複数のリクエストを連続して発行した場合、既に進行中の場合は、スケーリングサービスは中間状態を無視し、最終的なレプリカ数に収束します。

### UIを利用した水平スケーリング {#horizontal-scaling-via-ui}

UIからサービスを水平にスケールするには、サービスの**設定**ページでレプリカの数を調整します。

<Image img={scaling_configure} size="md" alt="スケーリング構成設定" border/>

*ClickHouse Cloudコンソールからのサービススケーリング設定*

サービスがスケールした後、クラウドコンソールのメトリクスダッシュボードにサービスへの正しい割り当てが表示されるはずです。以下のスクリーンショットは、クラスターが合計メモリ`96 GiB`にスケールされたもので、`6`レプリカがそれぞれ`16 GiB`のメモリ割り当てを持つことを示しています。

<Image img={scaling_memory_allocation} size="md" alt="スケーリングメモリ割り当て" border />

## 自動アイドル状態 {#automatic-idling}
「設定」ページでは、サービスが非アクティブなときに自動アイドル状態を許可するかどうかを選択できます（つまり、サービスがユーザーが送信したクエリを実行していないとき）。自動アイドル状態は、サービスが一時停止している間、計算リソースに対して請求されないため、サービスのコストを削減します。

:::note
特定の特別な場合、たとえばサービスが多数のパーツを持つ場合、サービスは自動的にアイドル状態になりません。

サービスはアイドル状態に入り、[更新可能なマテリアライズドビュー](/materialized-view/refreshable-materialized-view)、[S3Queue](/engines/table-engines/integrations/s3queue)からの消費、及び新しいマージのスケジューリングの更新を一時停止します。サービスがアイドル状態に移行する前に、既存のマージ操作は完了します。更新可能なマテリアライズドビューとS3Queueの消費の継続的な運用を保証するには、アイドル状態機能を無効にしてください。
:::

:::danger 自動アイドル状態を使用しない時
自動アイドル状態は、クエリに応答するまでに遅延を扱えるユースケースの場合にのみ使用してください。サービスが一時停止されている間、サービスへの接続はタイムアウトします。自動アイドル状態は、頻繁に使用される顧客向け機能を提供するサービスには推奨されません。
:::

## ワークロードのスパイクへの対応 {#handling-bursty-workloads}

今後のワークロードのスパイクが予測される場合、[ClickHouse Cloud API](/cloud/manage/api/api-overview)を使用して、スパイクを処理するためにサービスを事前にスケールアップし、需要が収まったらスケールダウンすることができます。

各レプリカで使用中の現在のCPUコアとメモリを理解するには、以下のクエリを実行できます：

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
