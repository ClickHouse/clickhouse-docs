---
sidebar_position: 3
sidebar_label: 'Horizontal scaling'
slug: /cloud/features/autoscaling/horizontal
description: 'Manual horizontal scaling in ClickHouse Cloud'
keywords: ['horizontal scaling', 'scaling', 'replicas', 'manual scaling', 'spikes', 'bursts']
title: 'Horizontal scaling'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import scaling_patch_request from '@site/static/images/cloud/manage/scaling-patch-request.png';
import scaling_patch_response from '@site/static/images/cloud/manage/scaling-patch-response.png';
import scaling_configure from '@site/static/images/cloud/manage/scaling-configure.png';
import scaling_memory_allocation from '@site/static/images/cloud/manage/scaling-memory-allocation.png';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'

## Manual horizontal scaling {#manual-horizontal-scaling}

<ScalePlanFeatureBadge feature="Manual horizontal scaling"/>

You can use ClickHouse Cloud [public APIs](https://clickhouse.com/docs/cloud/manage/api/swagger#/paths/~1v1~1organizations~1:organizationId~1services~1:serviceId~1scaling/patch) to scale your service by updating the scaling settings for the service or adjust the number of replicas from the cloud console.

**Scale** and **Enterprise** tiers also support single-replica services. Services once scaled out, can be scaled back in to a minimum of a single replica. Note that single replica services have reduced availability and aren't recommended for production usage.

:::note
Services can scale horizontally to a maximum of 20 replicas. If you need additional replicas, please contact our support team.
:::

### Horizontal scaling via API {#horizontal-scaling-via-api}

To horizontally scale a cluster, issue a `PATCH` request via the API to adjust the number of replicas. The screenshots below show an API call to scale out a `3` replica cluster to `6` replicas, and the corresponding response.

<Image img={scaling_patch_request} size="lg" alt="Scaling PATCH request" border/>

*`PATCH` request to update `numReplicas`*

<Image img={scaling_patch_response} size="md" alt="Scaling PATCH response" border/>

*Response from `PATCH` request*

If you issue a new scaling request or multiple requests in succession, while one is already in progress, the scaling service will ignore the intermediate states and converge on the final replica count.

### Horizontal scaling via UI {#horizontal-scaling-via-ui}

To scale a service horizontally from the UI, you can adjust the number of replicas for the service on the **Settings** page.

<Image img={scaling_configure} size="md" alt="Scaling configuration settings" border/>

*Service scaling settings from the ClickHouse Cloud console*

Once the service has scaled, the metrics dashboard in the cloud console should show the correct allocation to the service. The screenshot below shows the cluster having scaled to total memory of `96 GiB`, which is `6` replicas, each with `16 GiB` memory allocation.

<Image img={scaling_memory_allocation} size="md" alt="Scaling memory allocation" border />
