---
sidebar_position: 1
sidebar_label: '概要'
slug: /manage/scaling
description: 'ClickHouse Cloud の自動スケーリングの概要'
keywords: ['オートスケーリング', 'オートスケーリング', 'スケーリング', '水平', '垂直', 'バースト']
title: '自動スケーリング'
doc_type: 'guide'
---

import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'

# 自動スケーリング \{#automatic-scaling\}

スケーリングとは、クライアントの需要に応じて利用可能なリソースを調整する機能です。Scale ティアおよび Enterprise ティア (標準の 1:4 プロファイル) のサービスでは、API をプログラムから呼び出すか、UI で設定を変更することでシステムリソースを調整し、水平スケーリングできます。これらのサービスは、アプリケーションの需要に応じて垂直方向に**自動スケーリング**することもできます。

<ScalePlanFeatureBadge feature="自動垂直スケーリング" />

:::note
Scale ティアと Enterprise ティアは、単一レプリカサービスと複数レプリカサービスの両方をサポートしています。一方、Basic ティアでサポートされるのは単一レプリカサービスのみです。単一レプリカサービスは固定サイズでの利用を前提としているため、垂直スケーリングにも水平スケーリングにも対応していません。サービスをスケーリングするには、Scale ティアまたは Enterprise ティアにアップグレードできます。
:::

## ClickHouse Cloud におけるスケーリングの仕組み \{#how-scaling-works-in-clickhouse-cloud\}

現在、ClickHouse Cloud では、Scale ティアのサービスで垂直オートスケーリングと手動の水平スケーリングをサポートしています。

Enterprise ティアのサービスでは、スケーリングは次のとおりです。

* **水平スケーリング**: Enterprise ティアでは、すべての標準プロファイルおよびカスタムプロファイルで手動の水平スケーリングを利用できます。
* **垂直スケーリング**:
  * 標準プロファイル (1:4) では、垂直オートスケーリングをサポートします。
  * カスタムプロファイル (`highMemory` および `highCPU`) では、垂直オートスケーリングおよび手動の垂直スケーリングをサポートしていません。ただし、サポートに連絡することで、これらのサービスを垂直方向にスケールできます。

:::note
ClickHouse Cloud のスケーリングは、[&quot;Make Before Break&quot; (MBB)](/cloud/features/mbb) と呼ばれる方式で実行されます。
この方式では、古いレプリカを削除する前に新しいサイズのレプリカを 1 つ以上追加するため、スケーリング処理中の容量低下を防げます。
既存のレプリカを削除してから新しいレプリカを追加するまでのギャップをなくすことで、MBB はよりシームレスで影響の少ないスケーリングプロセスを実現します。
これは特にスケールアップ時に効果的です。リソース使用率が高くなって追加の容量が必要な状況では、レプリカを早まって削除すると、リソース制約をさらに悪化させるためです。
この方式の一環として、古いレプリカを削除する前に、既存のクエリが古いレプリカ上で完了するのを待つため、最大 1 時間待機します。
これにより、既存のクエリの完了を待てるようにしつつ、古いレプリカが長時間残り続けるのを防ぎます。
:::

## 詳細情報 \{#learn-more\}

* [垂直オートスケーリング](/cloud/features/autoscaling/vertical) — 使用状況に応じて CPU とメモリを自動でスケーリング
* [水平スケーリング](/cloud/features/autoscaling/horizontal) — API または UI による手動のレプリカスケーリング
* [Make Before Break (MBB)](/cloud/features/mbb) — ClickHouse Cloud がシームレスにスケーリング操作を行う仕組み
* [自動アイドル移行](/cloud/features/autoscaling/idling) — サービスの自動停止によるコスト削減
* [スケーリング推奨事項](/cloud/features/autoscaling/scaling-recommendations) — スケーリング推奨事項の概要
* [スケジュールスケーリング](/cloud/features/autoscaling/scaling-recommendations) — スケジュールスケーリング機能の概要。リアルタイムメトリクスとは無関係に、サービスをいつスケールアップまたはスケールダウンするかを正確に定義できます