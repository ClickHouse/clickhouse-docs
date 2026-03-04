---
sidebar_position: 2
sidebar_label: 'Vertical Autoscaling'
slug: /cloud/features/autoscaling/vertical
description: 'Configuring vertical autoscaling in ClickHouse Cloud'
keywords: ['autoscaling', 'auto scaling', 'vertical', 'scaling', 'CPU', 'memory']
title: 'Vertical Autoscaling'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import auto_scaling from '@site/static/images/cloud/manage/AutoScaling.png';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'

## Vertical auto scaling {#vertical-auto-scaling}

<ScalePlanFeatureBadge feature="Automatic vertical scaling"/>

Scale and Enterprise services support autoscaling based on CPU and memory usage. We constantly monitor the historical usage of a service over a lookback window (spanning the past 30 hours) to make scaling decisions. If the usage rises above or falls below certain thresholds, we scale the service appropriately to match the demand.

For non-MBB services, CPU-based autoscaling kicks in when CPU usage crosses an upper threshold in the range of 50-75% (actual threshold depends on the size of the cluster). At this point, CPU allocation to the cluster is doubled. If CPU usage falls below half of the upper threshold (for instance, to 25% in case of a 50% upper threshold), CPU allocation is halved.

For services already utilizing the MBB scaling approach, scaling up happens at a CPU threshold of 75%, and scale down happens at half of that threshold, or 37.5%.

Memory-based auto-scaling scales the cluster to 125% of the maximum memory usage, or up to 150% if OOM (out of memory) errors are encountered.

The **larger** of the CPU or memory recommendation is picked, and CPU and memory allocated to the service are scaled in lockstep increments of `1` CPU and `4 GiB` memory.

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
For Enterprise tier services, standard 1:4 profiles will support vertical autoscaling.
Custom profiles won't support vertical autoscaling or manual vertical scaling at launch.
However, these services can be scaled vertically by contacting support.
:::
