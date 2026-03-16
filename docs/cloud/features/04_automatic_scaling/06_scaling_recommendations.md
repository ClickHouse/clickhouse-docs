---
sidebar_position: 6
sidebar_label: 'Scaling recommendations'
slug: /cloud/features/autoscaling/scaling-recommendations
description: 'Understanding scaling recommendations in ClickHouse Cloud'
keywords: ['scaling recommendations', 'recommender', '2-window', 'autoscaling', 'optimization']
title: 'Scaling Recommendations'
doc_type: 'guide'
---

ClickHouse Cloud automatically adjusts CPU and memory resources for each service based on real-time usage — ensuring stable performance while minimizing resource wastage. To balance responsiveness with stability, we utilize a two-window recommender system that monitors utilization over both a short 3-hour window and a longer 30-hour window. This allows us to react quickly to changes and also make decisions based on longer-term trends.

When usage increases, the system references the long window so it can scale up in a single, decisive step to the highest observed load within the past 30 hours. This approach minimizes repeated scale events. Conversely, when traffic declines, the short window guides a quick scale-down within about three hours, conserving resources.

By integrating these two perspectives, the recommender intelligently balances responsiveness with stability.

## Benefits

- **Cost optimization:** Right-size your services to avoid paying for unused resources while maintaining performance.
- **Proactive scaling:** Get ahead of potential performance issues before they impact your workloads.
- **Balanced approach:** The 2-window design prevents over-provisioning from transient spikes while still ensuring adequate headroom for real demand.