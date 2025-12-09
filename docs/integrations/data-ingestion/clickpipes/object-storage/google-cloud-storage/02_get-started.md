---
sidebar_label: 'Get started'
description: 'Step-by-step guide to create your first Google Cloud Storage ClickPipe.'
slug: /integrations/clickpipes/object-storage/s3/get-started
title: 'Creating your first Google Cloud Storage ClickPipe'
doc_type: 'guide'
---

import CreateClickPipe from '@site/docs/_snippets/clickpipes/object-storage/_create_clickpipe.md';

# Creating your first GCS ClickPipe {#creating-your-first-gcs-clickpipe}

The GCS ClickPipe provides a fully-managed and resilient way to ingest data from Google Cloud Storage (GCS). It supports both **one-time** and **continuous ingestion** with exactly-once semantics.

GCS ClickPipes can be deployed and managed manually using the ClickPipes UI, as well as programmatically using [OpenAPI](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickPipes/paths/~1v1~1organizations~1%7BorganizationId%7D~1services~1%7BserviceId%7D~1clickpipes/post) and [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.8.1-alpha1/docs/resources/clickpipe).

<CreateClickPipe provider="gcs"/>
