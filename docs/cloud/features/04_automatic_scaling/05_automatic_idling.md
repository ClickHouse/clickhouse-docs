---
sidebar_position: 5
sidebar_label: 'Automatic idling'
slug: /cloud/features/autoscaling/idling
description: 'Automatic idling and adaptive idling in ClickHouse Cloud'
keywords: ['idling', 'automatic idling', 'adaptive idling', 'cost savings', 'pause']
title: 'Automatic idling'
doc_type: 'guide'
---

## Automatic idling {#automatic-idling}
In the **Settings** page, you can also choose whether or not to allow automatic idling of your service when it is inactive for a certain duration (i.e. when the service isn't executing any user-submitted queries).  Automatic idling reduces the cost of your service, as you're not billed for compute resources when the service is paused.

### Adaptive Idling {#adaptive-idling}
 ClickHouse Cloud implements adaptive idling to prevent disruptions while optimizing cost savings. The system evaluates several conditions before transitioning a service to idle. Adaptive idling overrides the idling duration setting when any of the below listed conditions are met:
- When the number of parts exceeds the maximum idle parts threshold (default: 10,000), the service isn't idled so that background maintenance can continue
- When there are ongoing merge operations, the service isn't idled until those merges complete to avoid interrupting critical data consolidation
- Additionally, the service also adapts idle timeouts based on server initialization time:
  - If server initialization time is less than 15 minutes, no adaptive timeout is applied and the customer-configured default idle timeout is used
  - If server initialization time is between 15 and 30 minutes, the idle timeout is set to 15 minutes
  - If server initialization time is between 30 and 60 minutes, the idle timeout is set to 30 minutes.
  - If server initialization time is more than 60 minutes, the idle timeout is set to 1 hour

:::note
The service may enter an idle state where it suspends refreshes of [refreshable materialized views](/materialized-view/refreshable-materialized-view), consumption from [S3Queue](/engines/table-engines/integrations/s3queue), and scheduling of new merges. Existing merge operations will complete before the service transitions to the idle state. To ensure continuous operation of refreshable materialized views and S3Queue consumption, disable the idle state functionality.
:::

:::danger When not to use automatic idling
Use automatic idling only if your use case can handle a delay before responding to queries, because when a service is paused, connections to the service will time out. Automatic idling is ideal for services that are used infrequently and where a delay can be tolerated. It isn't recommended for services that power customer-facing features that are used frequently.
:::
