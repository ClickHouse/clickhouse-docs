---
sidebar_position: 6
sidebar_label: 'Scaling recommendations'
slug: /cloud/features/autoscaling/scaling-recommendations
description: 'Understanding scaling recommendations from the 2-window recommender in ClickHouse Cloud'
keywords: ['scaling recommendations', 'recommender', '2-window', 'autoscaling', 'optimization']
title: 'Scaling Recommendations'
doc_type: 'guide'
---

## What is the 2-window recommender? {#2-window-recommender}

ClickHouse Cloud uses a **2-window recommender** system to provide intelligent scaling recommendations for your services.
This system analyzes your workload patterns across two distinct time windows to produce balanced recommendations that account for both recent spikes and longer-term usage trends.

The recommender evaluates:

- **Short window**: Captures recent workload spikes and bursts to ensure the service has enough resources to handle current demand.
- **Long window**: Analyzes sustained usage trends over a longer period to identify the baseline resource requirements for the service.

By combining insights from both windows, the recommender avoids overreacting to transient spikes while still ensuring services are appropriately scaled for their actual workload patterns.

## How users interact with it {#how-users-interact}

Scaling recommendations are surfaced in the ClickHouse Cloud console on the **Settings** page for your service. When the recommender identifies that your service could benefit from a configuration change, you'll see:

- **Recommended minimum and maximum memory settings** based on your observed workload patterns
- **Guidance on the number of replicas** if horizontal scaling adjustments are suggested

You can choose to:

1. **Accept the recommendation** - Apply the suggested settings directly from the console.
2. **Adjust manually** - Use the recommendation as a starting point and fine-tune the settings based on your own knowledge of upcoming workload changes.
3. **Dismiss** - If you're confident your current settings are appropriate, you can dismiss the recommendation.

Recommendations are refreshed periodically as new workload data becomes available, so they stay aligned with your evolving usage patterns.

## Benefits {#benefits}

- **Cost optimization**: Right-size your services to avoid paying for unused resources while maintaining performance.
- **Proactive scaling**: Get ahead of potential performance issues before they impact your workloads.
- **Data-driven decisions**: Rely on actual workload metrics rather than guesswork when configuring scaling parameters.
- **Balanced approach**: The 2-window design prevents over-provisioning from transient spikes while still ensuring adequate headroom for real demand.
