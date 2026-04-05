---
sidebar_position: 2
sidebar_label: '垂直オートスケーリング'
slug: /cloud/features/autoscaling/vertical
description: 'ClickHouse Cloud における垂直オートスケーリングの設定'
keywords: ['autoscaling', 'auto scaling', 'vertical', 'scaling', 'CPU', 'memory']
title: '垂直オートスケーリング'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import auto_scaling from '@site/static/images/cloud/manage/AutoScaling.png';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'

<ScalePlanFeatureBadge feature="自動垂直スケーリング" />

Scale および Enterprise ティアのサービスは、CPU とメモリの使用量に基づく自動スケーリングをサポートしています。スケーリングの判断を行うため、一定のルックバックウィンドウにわたってサービスの使用状況が継続的に監視されます。使用量が特定のしきい値を上回る、または下回ると、需要に応じてサービスが適切にスケーリングされます。

## 垂直オートスケーリングの設定 \{#configuring-vertical-auto-scaling\}

ClickHouse Cloud の Scale または Enterprise サービスのスケーリングは、**Admin** ロールを持つ組織メンバーが調整できます。垂直オートスケーリングを設定するには、対象サービスの **設定** タブを開き、以下のように最小メモリと最大メモリ、および CPU の設定を調整します。

:::note
単一レプリカのサービスは、すべてのティアでスケールできるわけではありません。
:::

<Image img={auto_scaling} size="lg" alt="スケーリング設定ページ" border />

レプリカの **最大メモリ** は、**最小メモリ** より大きい値に設定してください。これにより、サービスは必要に応じてその範囲内でスケールします。これらの設定は、サービスの初回作成フローでも指定できます。サービス内の各レプリカには、同じメモリおよび CPU リソースが割り当てられます。

これらの値を同じに設定して、サービスを実質的に特定の構成に「固定」することもできます。その場合、選択したサイズへのスケーリングがただちに実行されます。

ただし、この設定を行うとクラスターの自動スケーリングは無効になり、CPU またはメモリ使用量がこれらの設定値を超えて増加しても、サービスは保護されなくなります。

:::note
Enterprise ティアのサービスでは、標準の 1:4 プロファイルで垂直オートスケーリングがサポートされます。カスタムプロファイルでは、垂直オートスケーリングおよび手動の垂直スケーリングはサポートされません。ただし、これらのサービスでもサポートに連絡することで垂直スケーリングを実行できます。
:::