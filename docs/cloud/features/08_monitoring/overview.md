---
title: 'Monitoring your ClickHouse Cloud deployment'
slug: /cloud/monitoring
description: 'Overview of monitoring and observability capabilities for ClickHouse Cloud'
keywords: ['cloud', 'monitoring', 'observability', 'metrics']
sidebar_label: 'Overview'
sidebar_position: 1
doc_type: 'guide'
---

# Monitoring your ClickHouse Cloud deployment

## Overview {#overview}

This guide provides enterprise teams with information on monitoring and observability capabilities for production deployments of ClickHouse Cloud. Enterprise customers frequently ask about out-of-the-box monitoring features, integration with existing observability stacks including tools like Datadog and AWS CloudWatch, and how ClickHouse's monitoring compares to self-hosted deployments.

Users can use the following methods to monitor their ClickHouse deployment:

| Section | Description | Wakes idle services? | Setup required |
|---|---|---|---|
| [Cloud Console dashboards](/cloud/monitoring/cloud-console) | Day-to-day monitoring with built-in dashboards for service health, resource utilization, and query performance | No | None |
| [Notifications](/cloud/notifications) | Alerts for scaling events, errors, mutations, and billing | No | None (customizable) |
| [Prometheus endpoint](/integrations/prometheus) | Export metrics to Grafana, Datadog, or other Prometheus-compatible tools | No | API key + scraper config |
| [System table queries](/cloud/monitoring/system-tables) | Deep debugging and custom analysis via direct SQL queries against `system` tables | Yes | SQL queries |
| [Community and partner integrations](/cloud/monitoring/integrations) | Datadog agent integration, community monitoring tools, and the Billing & Usage API | Varies | Tool-specific |
| [Advanced dashboard reference](/cloud/manage/monitor/advanced-dashboard) | Detailed reference for each advanced dashboard visualization, including troubleshooting examples | No | None |

## Quick start {#quick-start}

Open the ClickHouse Cloud console to the **Monitoring** tab. This [blog](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse) captures common things to watch out for when getting started.

For most users, the [Cloud Console dashboards](/cloud/monitoring/cloud-console) provide everything needed to monitor service health, resource utilization, and query performance without any configuration. If you need to integrate with an external monitoring stack, start with the [Prometheus-compatible metrics endpoint](/integrations/prometheus).

## System impact considerations {#system-impact}

The above approaches use a mixture of either relying on Prometheus endpoints, being managed by ClickHouse Cloud, or [querying system tables](/cloud/monitoring/system-tables) directly. The latter of these options relies on querying the production ClickHouse service, which adds query load to the system under observation and prevents ClickHouse Cloud instances from [idling](/manage/scaling) which can impact costs. Additionally, if the production system fails, monitoring may also be affected, since the two are coupled.

Querying system tables directly works well for deep introspection and debugging but is less appropriate for real-time production monitoring. The [Cloud Console dashboards](/cloud/monitoring/cloud-console) and the [Prometheus endpoint](/integrations/prometheus) both use pre-scraped metrics that do not wake idle services, making them better suited for ongoing production monitoring. Consider these trade-offs between detailed system analysis capabilities and operational overhead.
