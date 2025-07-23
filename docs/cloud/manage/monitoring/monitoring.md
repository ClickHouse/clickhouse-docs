---
description: 'You can monitor the utilization of hardware resources and also ClickHouse
  server metrics.'
keywords: ['monitoring', 'observability', 'advanced dashboard', 'dashboard', 'observability
    dashboard']
sidebar_label: 'Monitoring'
sidebar_position: 45
slug: /cloud/manage/monitor
title: 'Monitoring in Cloud'
---

import Image from '@theme/IdealImage';

# Monitoring

:::note
The monitoring data outlined in this guide is accessible in ClickHouse Cloud. In addition to being displayed through the built-in dashboard described below, both basic and advanced performance metrics can also be viewed directly in the main service console.
:::

You can monitor:

- Utilization of hardware resources.
- ClickHouse server metrics.

## Built-in advanced observability dashboard {#built-in-advanced-observability-dashboard}

<Image img="https://github.com/ClickHouse/ClickHouse/assets/3936029/2bd10011-4a47-4b94-b836-d44557c7fdc1" alt="Screenshot 2023-11-12 at 6 08 58 PM" size="md" />

ClickHouse comes with a built-in advanced observability dashboard feature which can be accessed by `$HOST:$PORT/dashboard` (requires user and password) that shows the following metrics:
- Queries/second
- CPU usage (cores)
- Queries running
- Merges running
- Selected bytes/second
- IO wait
- CPU wait
- OS CPU Usage (userspace)
- OS CPU Usage (kernel)
- Read from disk
- Read from filesystem
- Memory (tracked)
- Inserted rows/second
- Total MergeTree parts
- Max parts for partition

## Resource utilization {#resource-utilization}

ClickHouse also monitors the state of hardware resources by itself such as:

- Load and temperature on processors.
- Utilization of storage system, RAM and network.

This data is collected in the `system.asynchronous_metric_log` table.
