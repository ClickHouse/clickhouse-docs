---
sidebar_position: 1
sidebar_label: 'Make Before Break (MBB)'
slug: /cloud/features/mbb
description: 'Page describing Make Before Break (MBB) operations in ClickHouse Cloud'
keywords: ['Make Before Break', 'MBB', 'Scaling', 'ClickHouse Cloud']
title: 'Make Before Break (MBB) operations in ClickHouse Cloud'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import mbb_diagram from '@site/static/images/cloud/features/mbb/vertical_scaling.png';

ClickHouse Cloud performs cluster upgrades and cluster scaling utilizing a **Make Before Break** (MBB) approach.
In this approach, new replicas are added to the cluster before removing old replicas from it.
This is as opposed to the break-first approach, where old replicas would first be removed, before adding new ones.

The MBB approach has several benefits:
* Since capacity is added to the cluster before removal, the **overall cluster capacity does not go down** unlike with the break-first approach. Of course, unplanned events such as node or disk failures etc. can still happen in a cloud environment.
* This approach is especially useful in situations where the cluster is under heavy load as it **prevents existing replicas from being overloaded** as would happen with a break-first approach.
* Because replicas can be added quickly without having to wait to remove replicas first, this approach leads to a **faster, more responsive** scaling experience.

The image below shows how this might happen for a cluster with 3 replicas where the service is scaled vertically:

<Image img={mbb_diagram} size="lg" alt="Example diagram for a cluster with 3 replicas which gets vertically scaled" />

Overall, MBB leads to a seamless, less disruptive scaling and upgrade experience compared to the break-first approach previously utilized.

With MBB, there are some key behaviors that users need to be aware of:

1. MBB operations wait for existing workloads to finish on the current replicas before being terminated.
   This period is currently set to 1 hour, which means that scaling or upgrades can wait up to one hour for a long-running query on a replica before the replica is removed.
   Additionally, if a backup process is running on a replica, it is left to complete before the replica is terminated.
2. Due to the fact that there is a waiting time before a replica is terminated, there can be situations where a cluster might have more than the maximum number of replicas set for the cluster.
   For example, you might have a service with 6 total replicas, but with an MBB operation in progress, 3 additional replicas may get added to the cluster leading to a total of 9 replicas, while the older replicas are still serving queries. 
   This means that for a period of time, the cluster will have more than the desired number of replicas. 
   Additionally, multiple MBB operations themselves can overlap, leading to replica accumulation. This can happen, for instance, in scenarios where several vertical scaling requests are sent to the cluster via the API.
   ClickHouse Cloud has checks in place to restrict the number of replicas that a cluster might accumulate.
3. With MBB operations, system table data is kept for 30 days. This means every time an MBB operation happens on a cluster, 30 days worth of system table data is replicated from the old replicas to the new ones.

If you are interested in learning more about the mechanics of MBB operations, please look at this [blog post](https://clickhouse.com/blog/make-before-break-faster-scaling-mechanics-for-clickhouse-cloud) from the ClickHouse engineering team.
