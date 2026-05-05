---
slug: /use-cases/observability/clickstack/dashboards/dashboard-templates
title: 'Dashboard templates'
sidebar_label: 'Dashboard templates'
pagination_prev: null
pagination_next: null
description: 'Importing pre-built dashboard templates in ClickStack'
doc_type: 'guide'
keywords: ['clickstack', 'dashboards', 'templates', 'import', 'observability']
---

import Image from '@theme/IdealImage';
import browse_dashboard_template from '@site/static/images/use-cases/observability/browse-dashboard-template.png';
import dashboard_template_gallery from '@site/static/images/use-cases/observability/dashboard-template-gallery.png';
import import_dashboard_template from '@site/static/images/use-cases/observability/import-dashboard-template.png';

ClickStack includes a library of pre-built dashboard templates that give you instant visibility into common infrastructure and application metrics.

## Browsing available templates {#browsing-templates}

To browse the built-in template library, navigate to **Dashboards** and click **Browse dashboard templates**. 

<Image img={browse_dashboard_template} alt="Browse Dashboard Templates Button" size="lg"/>

This opens the template gallery, where templates are organized by category. Click **Import** to begin the import flow for that template.

<Image img={dashboard_template_gallery} alt="Dashboard Template Gallery" size="lg"/>

## Importing a template {#importing-a-template}

To import a template, a data source must be set for each dashboard visualization. Select a data source from the dropdown for each visualization, then click `Finish Import`.

<Image img={import_dashboard_template} alt="Dashboard Template Import" size="lg"/>

## Pre-built templates {#pre-built-templates}

### OTel runtime metrics {#otel-runtime-metrics}

The built-in OTel Runtime Metrics templates are designed for applications instrumented with [OpenTelemetry runtime metrics](https://opentelemetry.io/docs/specs/semconv/runtime/).

| Template                | Description                                                                                              |
|-------------------------|----------------------------------------------------------------------------------------------------------|
| **.NET Runtime Metrics** | GC collections, heap size, thread pool usage, and assembly counts for .NET applications                 |
| **Go Runtime Metrics**   | Goroutine counts, GC pause times, heap usage, and memory stats for Go applications                     |
| **JVM Runtime Metrics**  | Heap and non-heap memory, GC duration, thread counts, and class loading for JVM-based applications     |
| **Node.js Runtime Metrics** | Event loop delay, heap usage, CPU utilization, and V8 memory for Node.js applications               |

Notes:

- Each template is configured with a [custom filter](./#custom-filters) for services which have the [`telemetry.sdk.language`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/telemetry/#telemetry-sdk-language) resource attribute matching the dashboard's runtime.
  - Environments with custom ClickHouse metric table schemas may need to adjust this filter to query the correct Service Name and Resource Attributes columns.
  - For high-volume environments, filter load times can be reduced by [materializing](../managing/performance_tuning.md#materialize-frequently-queried-attributes) the `ResourceAttributes['telemetry.sdk.language']` column.
- Templates reference up-to-date OTel Semantic Conventions when published, and are updated periodically as the OTel Spec is updated. For services instrumented with older OTel SDKs, the visualizations may need to be [edited](./#dashboards-editing-visualizations) to reference older metric names.
