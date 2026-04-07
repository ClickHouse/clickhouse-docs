---
sidebar_position: 3
sidebar_label: '水平スケーリング'
slug: /cloud/features/autoscaling/horizontal
description: 'ClickHouse Cloud における手動の水平スケーリング'
keywords: ['水平スケーリング', 'スケーリング', 'レプリカ', '手動スケーリング', 'スパイク', 'バースト']
title: '水平スケーリング'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import scaling_patch_request from '@site/static/images/cloud/manage/scaling-patch-request.png';
import scaling_patch_response from '@site/static/images/cloud/manage/scaling-patch-response.png';
import scaling_configure from '@site/static/images/cloud/manage/scaling-configure.png';
import scaling_memory_allocation from '@site/static/images/cloud/manage/scaling-memory-allocation.png';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'

## 手動による水平スケーリング \{#manual-horizontal-scaling\}

<ScalePlanFeatureBadge feature="手動による水平スケーリング" />

ClickHouse Cloud の[公開 API](https://clickhouse.com/docs/cloud/manage/api/swagger#/paths/~1v1~1organizations~1:organizationId~1services~1:serviceId~1scaling/patch)を使用してサービスの拡縮容設定を更新するか、Cloud コンソール でレプリカ数を調整することで、サービスをスケールできます。

**Scale** および **Enterprise** ティアでは、単一レプリカのサービスにも対応しています。一度スケールアウトしたサービスは、最小で単一レプリカまでスケールインできます。なお、単一レプリカのサービスは可用性が低くなるため、プロダクション環境での利用は推奨されません。

:::note
サービスは水平スケーリングで最大 20 レプリカまでスケールできます。さらにレプリカが必要な場合は、サポートチームまでお問い合わせください。
:::&quot;

### API による水平スケーリング \{#horizontal-scaling-via-api\}

クラスターを水平スケーリングするには、API 経由で `PATCH` リクエストを発行し、レプリカ数を調整します。以下のスクリーンショットは、`3` レプリカのクラスターを `6` レプリカにスケールアウトする API 呼び出しと、それに対応するレスポンスを示しています。

<Image img={scaling_patch_request} size="lg" alt="スケーリング PATCH リクエスト" border />

*`numReplicas` を更新する `PATCH` リクエスト*

<Image img={scaling_patch_response} size="md" alt="スケーリング PATCH レスポンス" border />

*`PATCH` リクエストのレスポンス*

すでにスケーリング処理が進行中の状態で、新たなスケーリング リクエスト、または複数のリクエストを連続して発行した場合、スケーリング サービスは中間状態を無視し、最終的なレプリカ数に収束します。

### UI による水平スケーリング \{#horizontal-scaling-via-ui\}

UI でサービスを水平スケーリングするには、**設定**ページでサービスのレプリカ数を調整します。

<Image img={scaling_configure} size="md" alt="スケーリング設定" border />

*ClickHouse Cloud コンソールでのサービスのスケーリング設定*

サービスのスケーリングが完了すると、Cloud コンソールのメトリクスダッシュボードに、そのサービスへの割り当てが正しく表示されます。以下のスクリーンショットは、クラスターが合計メモリ `96 GiB` までスケーリングされ、`16 GiB` のメモリが割り当てられたレプリカが `6` つある状態を示しています。

<Image img={scaling_memory_allocation} size="md" alt="スケーリングされたメモリ割り当て" border />