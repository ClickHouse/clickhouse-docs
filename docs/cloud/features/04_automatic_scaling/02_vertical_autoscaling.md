---
sidebar_position: 2
sidebar_label: 'Vertical autoscaling'
slug: /cloud/features/autoscaling/vertical
description: 'Configuring vertical autoscaling in ClickHouse Cloud'
keywords: ['autoscaling', 'auto scaling', 'vertical', 'scaling', 'CPU', 'memory']
title: 'Vertical autoscaling'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import auto_scaling from '@site/static/images/cloud/manage/AutoScaling.png';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'

## Vertical auto scaling {#vertical-auto-scaling}

<ScalePlanFeatureBadge feature="Automatic vertical scaling"/>

Scale and Enterprise tier services support autoscaling based on CPU and memory usage. Service usage is constantly monitored over a lookback window to make scaling decisions. If the usage rises above or falls below certain thresholds, the service is scaled appropriately to match the demand.

## CPU-based Scaling {#cpu-based-scaling}

CPU Scaling is based on target tracking which calculates the exact CPU allocation needed to keep utilization at a target level. A scaling action is only triggered if current CPU utilization falls outside a defined band:

| Parameter | Value | Meaning |
|---|---|---|
| Target utilization | 53% | The utilization level ClickHouse aims to maintain |
| High watermark | 75% | Triggers scale-up when CPU exceeds this threshold |
| Low watermark | 37.5% | Triggers scale-down when CPU falls below this threshold |

The recommender evaluates CPU utilization based on historical usage, and determines a recommended CPU size using this formula:
```text
recommended_cpu = max_cpu_usage / target_utilization
```

If the CPU utilization is between 37.5%–75% of allocated capacity, no scaling action is taken. Outside that band, the recommender computes the exact size needed to land back at 53% utilization, and the service is scaled accordingly.

### Example {#cpu-scaling-example}

A service allocated 4 vCPU experiences a spike to 3.8 vCPU usage (~95% utilization), crossing the 75% high watermark. The recommender calculates: `3.8 / 0.53 ≈ 7.2 vCPU`, and rounds up to the next available size (8 vCPU). Once load subsides and usage drops below 37.5% (1.5 vCPU), the recommender scales back down proportionally.

## Memory-based Scaling {#memory-based-scaling}

Memory-based auto-scaling scales the cluster to 125% of the maximum memory usage, or up to 150% if OOM (out of memory) errors are encountered.

## Scaling Decision {#scaling-decision}

The larger of the CPU or memory recommendation is picked, and CPU and memory allocated to the service are scaled in lockstep increments of 1 CPU and 4 GiB memory.

## Configuring vertical auto scaling {#configuring-vertical-auto-scaling}

The scaling of ClickHouse Cloud Scale or Enterprise services can be adjusted by organization members with the **Admin** role.  To configure vertical autoscaling, go to the **Settings** tab for your service and adjust the minimum and maximum memory, along with CPU settings as shown below.

:::note
Single replica services can't be scaled for all tiers.
:::

<Image img={auto_scaling} size="lg" alt="Scaling settings page" border/>

Set the **Maximum memory** for your replicas at a higher value than the **Minimum memory**. The service will then scale as needed within those bounds. These settings are also available during the initial service creation flow. Each replica in your service will be allocated the same memory and CPU resources.

You can also choose to set these values the same, essentially "pinning" the service to a specific configuration. Doing so will immediately force scaling to the desired size you picked.

It's important to note that this will disable any auto scaling on the cluster, and your service won't be protected against increases in CPU or memory usage beyond these settings.

:::note
For Enterprise tier services, standard 1:4 profiles will support vertical autoscaling. Custom profiles don’t support vertical autoscaling or manual vertical scaling. However, these services can be scaled vertically by contacting support.
:::
