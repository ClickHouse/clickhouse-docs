---
sidebar_position: 7
sidebar_label: 'スケジュールスケーリング'
slug: /cloud/features/autoscaling/scheduled-scaling
description: 'ClickHouse Cloud のスケジュールスケーリング機能を解説する記事'
keywords: ['スケジュールスケーリング']
title: 'スケジュールスケーリング'
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import scheduled_scaling_1 from '@site/static/images/cloud/features/autoscaling/scheduled-scaling-1.png';
import scheduled_scaling_2 from '@site/static/images/cloud/features/autoscaling/scheduled-scaling-2.png';

<PrivatePreviewBadge />

ClickHouse Cloud サービスは CPU とメモリの使用率に基づいて自動的にスケールしますが、多くのワークロードには予測しやすいパターンがあります。たとえば、毎日のインジェストの急増、夜間に実行されるバッチジョブ、週末の大幅なトラフィック減少などです。こうしたユースケースでは、スケジュールスケーリング を使用することで、リアルタイムのメトリクスとは関係なく、サービスをいつスケールアップまたはスケールダウンするかを正確に定義できます。

スケジュールスケーリング では、ClickHouse Cloud コンソールで時間ベースのルール一式を直接設定します。各ルールでは、時刻、繰り返し頻度 (毎日、毎週、またはカスタム) 、および目標サイズを指定します。目標サイズは、レプリカ数 (水平) またはメモリティア (垂直) のいずれかです。指定した時刻になると、ClickHouse Cloud が自動的に変更を適用するため、需要が発生してから対応するのではなく、需要が到来する前にサービスを適切なサイズにしておけます。

これは、CPU とメモリの負荷に応じて動的に反応するメトリクスベースのオートスケーリングとは異なります。スケジュールスケーリング は決定論的です。つまり、いつスケーリングが実行され、どのサイズになるかを正確に把握できます。この 2 つのアプローチは相互補完的です。サービスにベースラインとなるスケーリングスケジュールを設定しつつ、その時間帯の中でワークロードが予期せず変動した場合でも、オートスケーリングの恩恵を受けられます。

スケジュールスケーリング は現在 **プライベートプレビュー** で提供されています。組織でこれを有効にするには、ClickHouse Support にお問い合わせください.

## スケーリングスケジュールの設定 \{#setting-up-a-scaling-schedule\}

スケジュールを設定するには、ClickHouse Cloud コンソールで対象のサービスを開き、設定に移動します。そこで **Schedule Override** を選択し、新しいルールを追加します。

<Image img={scheduled_scaling_1} size="md" alt="時間ベースのスケーリングルールを表示している、ClickHouse Cloud コンソールのスケーリングスケジュール画面" border />

<Image img={scheduled_scaling_2} size="md" alt="ClickHouse Cloud コンソールでスケジュールされたスケーリングルールを設定する画面" border />

各ルールには、次の項目が必要です。

* **Time:** スケーリングアクションを実行する時刻 (ローカルタイムゾーン)
* **Recurrence:** ルールの繰り返し頻度 (例: 毎週平日、毎週日曜日)
* **Target size:** スケーリング先のレプリカ数またはメモリ割り当て量

複数のルールを組み合わせて、1週間全体のスケジュールを作成できます。たとえば、毎週平日の午前 6 時に 5 レプリカへスケールアウトし、午後 8 時に 2 レプリカへ戻す、といった設定が可能です。

## ユースケース \{#use-cases\}

**バッチ処理および ETL ワークロード:** 夜間の取り込みジョブの実行前にスケールアップし、完了後にスケールダウンすることで、日中のアイドル時間帯における過剰なプロビジョニングを回避できます。

**予測しやすいトラフィックパターン:** 一定のピーク時間帯 (例: 営業時間中のクエリトラフィック) があるサービスでは、オートスケーリングの反応を待つのではなく、負荷が到来する前にあらかじめスケールして対応できます。

**週末のスケールダウン:** 需要が低下する週末には、レプリカ数やメモリティアを減らし、月曜朝の急増前に容量を復元できます。

**コスト管理:** ClickHouse Cloud の支出を管理するチームでは、利用率が低いことが分かっている時間帯にスケールダウンをスケジュールしておくことで、手動介入なしにリソース消費を大幅に削減できます。

:::note
スケジュールされたスケーリング操作と同時にオートスケーリングの推奨が発生した場合、トリガー時点ではスケジュールされた操作が優先されます。
:::

## ワークロードの急増への対応 \{#handling-bursty-workloads\}

ワークロードの急増が予想される場合は、
[ClickHouse Cloud API](/cloud/manage/api/api-overview)を使用して、
急増に対応できるようサービスを事前にスケールアップし、需要が落ち着いたら
スケールダウンできます。

現在、各レプリカで使用中の CPU コア数とメモリを確認するには、
以下のクエリを実行できます。

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
