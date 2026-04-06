---
slug: /use-cases/observability/clickstack/service-maps
title: 'Service maps'
sidebar_label: 'Service maps'
pagination_prev: null
pagination_next: null
description: 'Visualize service dependencies and request flow with ClickStack service maps.'
doc_type: 'guide'
keywords: ['clickstack', 'service maps', 'topology', 'traces', 'dependencies', 'distributed tracing', 'observability', 'request graph']
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import service_map_overview from '@site/static/images/clickstack/service-maps/service-map-overview.png';
import service_map_demo from '@site/static/images/clickstack/service-maps/service-map-demo.mp4';
import source_selector from '@site/static/images/clickstack/service-maps/source-selector.png';
import sampling from '@site/static/images/clickstack/service-maps/sampling.png';
import date_selector from '@site/static/images/clickstack/service-maps/date-selector.png';

<BetaBadge/>

Service maps visualize how your services interact. ClickStack builds the graph by matching client spans (outgoing requests) with server spans (incoming requests) within the same trace, reconstructing the request path between services.

Click **Service Map** in the left navigation panel to open the full graph. Services appear once you're [ingesting trace data](/use-cases/observability/clickstack/ingesting-data) with OpenTelemetry.

<Image img={service_map_overview} alt="Service map showing service nodes and request flow between them" size="lg"/>

## Exploring the service map {#exploring-the-service-map}

Each node represents a service, identified by the `service.name` resource attribute. Edges (dashed lines) connect services where a client span in one matches a server span in another. Node size reflects relative traffic volume, and red nodes indicate services with errors in the selected time range.

The toolbar above the map lets you filter and adjust the view.

**Source selector** — filter the map to a specific trace source (e.g. "ClickPy Traces").

<Image img={source_selector} alt="Source selector highlighted in the service map toolbar" size="lg"/>

**Sampling slider** — adjust the sampling rate to balance performance and accuracy. Lower rates load faster on high-volume clusters.

<Image img={sampling} alt="Sampling slider highlighted in the service map toolbar" size="lg"/>

**Date range picker** — set the time window for the trace data used to build the map.

<Image img={date_selector} alt="Date range picker highlighted in the service map toolbar" size="lg"/>

Use the **+/-** buttons in the bottom-left corner of the map or scroll to zoom in and out.

## Trace-level service maps {#trace-level-service-maps}

When you inspect an individual trace, a focused service map shows how that specific request moved between services. This lets you see the topology for a single request without leaving the trace waterfall.

<video src={service_map_demo} autoPlay loop muted playsInline width="100%" />
