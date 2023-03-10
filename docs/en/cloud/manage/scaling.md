---
sidebar_position: 1
sidebar_label: Automatic Scaling
slug: /en/manage/scaling
---
import ActionsMenu from '@site/docs/en/_snippets/_service_actions_menu.md';

# Automatic Scaling

ClickHouse Cloud provides auto-scaling of your services, but there are some settings that can be adjusted based on your expected workload and your budget. Scaling can be adjusted from the service **Actions** menu.

## Adjust scaling

<ActionsMenu menu="Advanced scaling" />

In Advanced scaling you can set the minimum and maximum **Total memory** and choose whether or not to allow automatic pausing of your service when it is inactive.

:::tip Total Memory
The amount of **Total memory** needed by your service cannot generally be determined until after a few days of the service running with its normal use.  We recommend waiting a few days before setting the minimum and maximum memory settings.
:::

:::tip Automatic pausing
Use automatic pausing only if your use case can handle a delay before responding to queries, as when a service is paused connections to the service will time out.  Automatic pausing is ideal for services that are used infrequently and where a delay can be tolerated.
:::
