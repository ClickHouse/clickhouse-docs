---
sidebar_position: 7
sidebar_label: 'Scheduled Scaling'
slug: /cloud/features/autoscaling/scheduled-scaling
description: 'Article discussing the Scheduled Scaling feature in ClickHouse Cloud'
keywords: ['scheduled scaling']
title: 'Scheduled Scaling'
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import scheduled_scaling_1 from '@site/static/images/cloud/features/autoscaling/scheduled-scaling-1.png';
import scheduled_scaling_2 from '@site/static/images/cloud/features/autoscaling/scheduled-scaling-2.png';

<PrivatePreviewBadge/>

ClickHouse Cloud services automatically scale based on CPU and memory utilization, but many workloads follow predictable patterns — daily ingestion spikes, batch jobs that run overnight, or traffic that drops sharply on weekends. For these use cases, Scheduled Scaling lets you define exactly when your service should scale up or down, independent of real-time metrics.

With Scheduled Scaling, you configure a set of time-based rules directly in the ClickHouse Cloud console. Each rule specifies a time, a recurrence (daily, weekly, or custom), and the target size — either the number of replicas (horizontal) or the memory tier (vertical). At the scheduled time, ClickHouse Cloud automatically applies the change, so your service is sized appropriately before demand arrives rather than reacting after the fact.

This is distinct from metric-based autoscaling, which responds dynamically to CPU and memory pressure. Scheduled Scaling is deterministic: you know exactly when the scaling will happen and to what size. The two approaches are complementary — a service can have a baseline scaling schedule and still benefit from autoscaling within that window if workloads fluctuate unexpectedly.

Scheduled Scaling is currently available in **Private Preview**. To enable it for your organization, contact the ClickHouse support team.

## Setting up a scaling schedule {#setting-up-a-scaling-schedule}

To configure a schedule, navigate to your service in the ClickHouse Cloud console and go to settings. From there, select **Schedule Override** and add a new rule.

<Image img={scheduled_scaling_1} size="lg" alt="The Scaling Schedules interface in the ClickHouse Cloud console, showing time-based scaling rules" border/>

<Image img={scheduled_scaling_2} size="lg" alt="Configuring a scheduled scaling rule in the ClickHouse Cloud console" border/>

Each rule requires:

- **Time:** When the scaling action should occur (in your local timezone)
- **Recurrence:** How often the rule repeats (e.g. every weekday, every Sunday)
- **Target size:** The number of replicas or memory allocation to scale to

Multiple rules can be combined to form a full weekly schedule. For example, you might scale out to 5 replicas every weekday at 6 AM and scale back to 2 replicas at 8 PM.

## Use cases {#use-cases}

**Batch and ETL workloads:** Scale up before a nightly ingest job runs and scale back down once it completes, avoiding over-provisioning during idle daytime hours.

**Predictable traffic patterns:** Services with consistent peak hours (e.g. business-hours query traffic) can be pre-scaled to handle load before it arrives, rather than waiting for autoscaling to react.

**Weekend scale-down:** Reduce replica count or memory tier over weekends when demand is lower, then restore capacity before the Monday morning surge.

**Cost control:** For teams managing ClickHouse Cloud spend, scheduled scale-downs during known low-utilization periods can meaningfully reduce resource consumption without any manual intervention.

:::note
A scheduled scaling action and a concurrent autoscaling recommendation may interact — the schedule takes precedence at its trigger time.
:::