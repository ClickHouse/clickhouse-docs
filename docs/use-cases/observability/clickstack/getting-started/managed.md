---
slug: /use-cases/observability/clickstack/getting-started/managed
title: 'Getting started with managed ClickStack'
sidebar_label: 'Managed'
pagination_prev: null
pagination_next: use-cases/observability/clickstack/example-datasets/index
description: 'Getting started with Managed ClickStack'
doc_type: 'guide'
keywords: ['Managed ClickStack', 'getting started', 'ClickHouse Cloud']
toc_max_heading_level: 3
---

import ManagedGettingStartedIngestion from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_managed_getting_started_ingestion.md';
import PrepareOTelIngestionUser from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_prepare_otel_ingestion_user.md';
import SendManagedGettingStartedData from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_send_managed_getting_started_data.md';
import ConfirmManagedGettingStartedIngestion from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_confirm_managed_getting_started_ingestion.md';

Deploy Managed ClickStack on ClickHouse Cloud, send a test event through your ingestion pipeline, and confirm that the event is available in the ClickStack UI.

ClickHouse Cloud operates the ClickHouse backend while you retain control over the ingestion pipeline and schema. Managed ClickStack provides:

- Automatic scaling of compute, independent of storage
- Low-cost and effectively unlimited retention based on object storage
- Independent isolation of read and write workloads with [warehouses](/cloud/reference/warehouses)
- Integrated authentication
- Automated backups
- Security and compliance features
- Seamless upgrades

## Before you begin {#before-you-begin}

### Create a ClickHouse Cloud service {#create-a-managed-clickstack-service}

Complete [Create a ClickHouse service](/getting-started/quick-start/cloud#1-create-a-clickhouse-service) in the ClickHouse Cloud quickstart. Before continuing, confirm that the service is running and that you have permission to create database users.

### Prepare your ingestion environment {#prepare-your-ingestion-environment}

Your ingestion path determines the remaining prerequisites:

- To start a new [OpenTelemetry Collector](/use-cases/observability/clickstack/ingesting-data/otel-collector), install [Docker](https://docs.docker.com/get-docker/).
- To use an existing collector, configure it in the [gateway role](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) and ensure that you can update its configuration.
- To use Vector, start with an [existing Vector pipeline](/use-cases/observability/clickstack/ingesting-data/vector) that can send data to ClickHouse.

## Set up Managed ClickStack {#set-up-managed-clickstack}

<VerticalStepper headerLevel="h3">

### Create a dedicated ingestion user (optional) {#create-an-ingestion-user}

Open the [ClickHouse Cloud SQL console](/cloud/get-started/sql-console) and run:

<PrepareOTelIngestionUser />

### Start ingestion in ClickStack {#choose-an-ingestion-source}

<ManagedGettingStartedIngestion />

### Send test data {#send-test-data}

<SendManagedGettingStartedData />

### Open ClickStack and confirm ingestion {#open-clickstack-and-confirm-ingestion}

<ConfirmManagedGettingStartedIngestion />

</VerticalStepper>

You now have a Managed ClickStack service, a working ingestion path, and a test event that you can inspect in ClickStack.

## Next steps {#next-steps}

### Send application and infrastructure data {#send-application-and-infrastructure-data}

If you have applications or infrastructure to instrument with OpenTelemetry, follow the relevant guide linked from the ClickStack ingestion UI.

- Instrument applications with a [supported OpenTelemetry SDK](/use-cases/observability/clickstack/sdks). The SDK sends traces and logs to your OpenTelemetry Collector, which acts as a gateway to Managed ClickStack.
- Collect [host logs](/use-cases/observability/clickstack/integrations/host-logs) with OpenTelemetry Collectors running in the agent role and forward the data to your gateway collector.
- For Kubernetes monitoring, follow the [Kubernetes integration guide](/use-cases/observability/clickstack/integrations/kubernetes).
- For other telemetry sources, see the [ClickStack integration guides](/use-cases/observability/clickstack/integration-guides).

### Explore sample data {#explore-sample-data}

To explore ClickStack with a richer dataset:

- [Example dataset](/use-cases/observability/clickstack/getting-started/sample-data) - Load data from the public demo and diagnose an issue.
- [Local logs and metrics](/use-cases/observability/clickstack/getting-started/local-data) - Collect local files and system metrics on macOS or Linux with a local OpenTelemetry Collector.

### Prepare for production {#prepare-for-production}

If you created the `clickstack-ingest` user, store its password securely and use this account for collector ingestion instead of the `default` administrative account.

Before using ClickStack in production, review [Going to production](/use-cases/observability/clickstack/production) for security, retention, and operational guidance, and [Estimating resources](/use-cases/observability/clickstack/estimating-resources) to size compute for your expected ingest volume.

For Managed ClickStack deployment tasks, see the [Managed ClickStack deployment guide](/use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud#additional-tasks).
