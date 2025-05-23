---
'sidebar_position': 1
'sidebar_label': '自動スケーリング'
'slug': '/manage/scaling'
'description': 'ClickHouse Cloud での自動スケーリングの設定'
'keywords':
- 'autoscaling'
- 'auto scaling'
- 'scaling'
- 'horizontal'
- 'vertical'
- 'bursts'
'title': 'Automatic Scaling'
---

import Image from '@theme/IdealImage';
import auto_scaling from '@site/static/images/cloud/manage/AutoScaling.png';
import scaling_patch_request from '@site/static/images/cloud/manage/scaling-patch-request.png';
import scaling_patch_response from '@site/static/images/cloud/manage/scaling-patch-response.png';
import scaling_configure from '@site/static/images/cloud/manage/scaling-configure.png';
import scaling_memory_allocation from '@site/static/images/cloud/manage/scaling-memory-allocation.png';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'


# 自動スケーリング

スケーリングは、クライアントの需要に応じて利用可能なリソースを調整する能力です。Scale および Enterprise (標準 1:4 プロファイル) 階層のサービスは、APIをプログラム的に呼び出したり、UIで設定を変更することで水平にスケーリングできます。あるいは、これらのサービスはアプリケーションの需要に応じて **自動的に** 垂直スケーリングすることもできます。

<ScalePlanFeatureBadge feature="Automatic vertical scaling"/>

## ClickHouse Cloud におけるスケーリングの仕組み {#how-scaling-works-in-clickhouse-cloud}

現在、ClickHouse Cloud は、Scale 階層サービス向けに垂直自動スケーリングと手動の水平スケーリングをサポートしています。

Enterprise 階層サービスにおけるスケーリングの動作は以下の通りです：

- **水平スケーリング**: 手動の水平スケーリングは、エンタープライズ層の全ての標準およびカスタムプロファイルで利用可能です。
- **垂直スケーリング**:
  - 標準プロファイル (1:4) は垂直自動スケーリングをサポートします。
  - カスタムプロファイルは、立ち上げ時には垂直自動スケーリングや手動の垂直スケーリングをサポートしません。ただし、サポートに連絡することで垂直にスケーリングできます。

:::note
我々は、コンピュートレプリカ用の新しい垂直スケーリングメカニズムを導入しています。これを「Make Before Break」(MBB) と呼んでいます。このアプローチでは、古いレプリカを削除する前に新しいサイズのレプリカを1つ以上追加することで、スケーリング操作中のキャパシティの損失を防ぎます。既存のレプリカを削除することと新しいレプリカを追加することの間のギャップを排除することで、MBBはよりシームレスで中断の少ないスケーリングプロセスを実現します。これは特にスケールアップのシナリオで有益であり、高リソース利用率が追加キャパシティの必要性を引き起こす場合において、早すぎるレプリカの削除はリソース制約を悪化させるだけです。

この変更の一環として、スケーリングイベントの一部として、過去のシステムテーブルデータが最大30日間保持されることに注意してください。さらに、AWS または GCP 上のサービスでは2024年12月19日以前の、Azure 上のサービスでは2025年1月14日以前のシステムテーブルデータは新しい組織階層への移行の一部として保持されません。
:::

### 垂直自動スケーリング {#vertical-auto-scaling}

<ScalePlanFeatureBadge feature="Automatic vertical scaling"/>

Scale および Enterprise サービスは、CPU とメモリの使用状況に基づいた自動スケーリングをサポートします。我々は、サービスの過去30時間の使用状況を常に監視して、スケーリングの決定を行います。使用状況が特定の閾値を超えたり下回ったりした場合、需要に応じてサービスを適切にスケーリングします。

CPUベースの自動スケーリングは、CPU使用率が50-75%の範囲で上限閾値を超えると発動します（実際の閾値はクラスターのサイズに依存します）。この時点で、クラスターへのCPUの割り当ては倍増します。CPU使用率が上限閾値の半分（例えば、上限閾値が50%の場合、25%に）以下に下がると、CPUの割り当ては半減します。

メモリベースの自動スケーリングは、最大メモリ使用量の125%まで、または OOM (Out Of Memory) エラーが発生した場合には150%までスケールします。

**CPU** または **メモリ** の推奨のうち大きい方が選ばれ、サービスに割り当てられるCPU とメモリは `1` CPU と `4 GiB` メモリの単位で同時にスケールされます。

### 垂直自動スケーリングの設定 {#configuring-vertical-auto-scaling}

ClickHouse Cloud Scale または Enterprise サービスのスケーリングは、**Admin** ロールを持つ組織メンバーによって調整できます。垂直自動スケーリングを設定するには、サービスの **設定** タブに移動し、以下のように最小および最大メモリ、CPU 設定を調整します。

:::note
単一のレプリカサービスは、すべての階層でスケーリングできません。
:::

<Image img={auto_scaling} size="lg" alt="Scaling settings page" border/>

レプリカの **最大メモリ** を **最小メモリ** より高い値に設定してください。これにより、サービスはその範囲内で必要に応じてスケールします。これらの設定は、初期サービス作成フロー中にも利用可能です。サービス内の各レプリカには、同じメモリおよびCPUリソースが割り当てられます。

これらの値を同じに設定することもでき、実質的にサービスを特定の構成に「ピン留め」することが可能です。そうすることで、選択したサイズに即座にスケーリングを強制します。

これを行うと、クラスター内の自動スケーリングが無効になり、これらの設定を超えるCPU またはメモリ使用量の増加からサービスを保護することができなくなります。

:::note
Enterprise 階層サービスでは、標準 1:4 プロファイルが垂直自動スケーリングをサポートします。カスタムプロファイルは、立ち上げ時には垂直自動スケーリングや手動の垂直スケーリングをサポートしません。ただし、サポートに連絡することでこれらのサービスを垂直にスケーリングできます。
:::

## 手動水平スケーリング {#manual-horizontal-scaling}

<ScalePlanFeatureBadge feature="Manual horizontal scaling"/>

ClickHouse Cloud の [公開API](https://clickhouse.com/docs/cloud/manage/api/swagger#/paths/~1v1~1organizations~1:organizationId~1services~1:serviceId~1scaling/patch) を使用して、サービスのスケーリング設定を更新したり、クラウドコンソールからレプリカの数を調整したりできます。

**Scale** および **Enterprise** 階層は、単一レプリカサービスをサポートしています。ただし、これらの階層のサービスが複数のレプリカで開始する場合、または複数のレプリカにスケールアウトする場合、最小 `2` レプリカに戻すことしかできません。

:::note
サービスは最大20レプリカまで水平スケーリングできます。追加のレプリカが必要な場合は、サポートチームにご連絡ください。
:::

### API経由の水平スケーリング {#horizontal-scaling-via-api}

クラスターを水平にスケーリングするには、APIを介して `PATCH` リクエストを発行してレプリカの数を調整します。以下のスクリーンショットは、`3` レプリカクラスターを `6` レプリカにスケールアウトするためのAPI呼び出しを示し、対応するレスポンスを示しています。

<Image img={scaling_patch_request} size="lg" alt="Scaling PATCH request" border/>

*`numReplicas` を更新するための `PATCH` リクエスト*

<Image img={scaling_patch_response} size="md" alt="Scaling PATCH response" border/>

*`PATCH` リクエストのレスポンス*

新しいスケーリングリクエストを発行するか、1つのリクエストが進行中の状態で複数のリクエストを連続して発行した場合、スケーリングサービスは中間状態を無視し、最終的なレプリカ数に収束します。

### UIを介した水平スケーリング {#horizontal-scaling-via-ui}

UIからサービスを水平にスケーリングするには、サービスの **設定** ページでレプリカの数を調整することができます。

<Image img={scaling_configure} size="md" alt="Scaling configuration settings" border/>

*ClickHouse Cloudコンソールからのサービススケーリング設定*

サービスがスケールした後、クラウドコンソールのメトリクスダッシュボードにはサービスへの正しい割り当てが表示されるべきです。以下のスクリーンショットは、クラスターが合計メモリ `96 GiB`、すなわち `6` レプリカで、各レプリカに `16 GiB` のメモリ割り当てがあることを示しています。

<Image img={scaling_memory_allocation} size="md" alt="Scaling memory allocation" border />

## 自動アイドル状態 {#automatic-idling}
**設定** ページでは、サービスが非アクティブなときに自動アイドルを許可するかどうかを選択できます（すなわち、サービスがユーザーが送信したクエリを実行していないとき）。自動アイドルは、サービスが一時停止している間、コンピューティングリソースに対する料金が発生しないため、コストを削減します。

:::note
特定の特別なケース、たとえばサービスの部品が多数ある場合、自動アイドルにはならないことがあります。

サービスはアイドル状態に入ることがあり、その場合は [更新可能なマテリアライズドビュー](/materialized-view/refreshable-materialized-view) のリフレッシュ、[S3Queue](/engines/table-engines/integrations/s3queue) からの消費、そして新しいマージのスケジュールが一時停止されます。既存のマージ操作は、サービスがアイドル状態に移行する前に完了します。更新可能なマテリアライズドビューと S3Queue の消費が継続的に行われるようにするには、アイドル状態機能を無効にしてください。
:::

:::danger 自動アイドルを使用しないべき時
自動アイドルは、クエリに応答するのに遅延を処理できるユースケースの場合のみ使用してください。サービスが一時停止している間、サービスへの接続はタイムアウトします。自動アイドルは、あまり頻繁に使用されず、遅延に耐えられる場合のサービスに最適です。顧客向けの機能を提供するサービスには推奨されません。
:::

## 突発的なワークロードの処理 {#handling-bursty-workloads}
今後のワークロードの急増が予想される場合は、[ClickHouse Cloud API](/cloud/manage/api/api-overview) を使用して、急増を処理するためにサービスを事前にスケールアップし、需要が収まったらスケールダウンできます。

各レプリカで現在使用中の CPU コアとメモリを理解するには、以下のクエリを実行できます：

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
