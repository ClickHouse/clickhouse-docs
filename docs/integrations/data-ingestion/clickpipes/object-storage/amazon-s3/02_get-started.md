---
sidebar_label: 'Get started'
description: 'Step-by-step guide to create your first Amazon S3 ClickPipe.'
slug: /integrations/clickpipes/object-storage/s3/get-started
title: 'Creating your first Amazon S3 ClickPipe'
doc_type: 'guide'
---

import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_step1 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step1.png';
import cp_step2 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step2.png';
import cp_step3 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step3.png';
import cp_step4a from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a.png';
import cp_step5 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step5.png';
import cp_overview from '@site/static/images/integrations/data-ingestion/clickpipes/cp_overview.png';
import cp_table_settings from '@site/static/images/integrations/data-ingestion/clickpipes/cp_table_settings.png';
import CreateClickPipe from '@site/docs/_snippets/clickpipes/object-storage/_create_clickpipe.md';
import Image from '@theme/IdealImage';

# Creating your first Amazon S3 ClickPipe {#creating-your-first-amazon-s3-clickpipe}

The S3 ClickPipe provides a fully-managed and resilient way to ingest data from Amazon S3 and S3-compatible object stores into ClickHouse Cloud. It supports both **one-time** and **continuous ingestion** with exactly-once semantics.

S3 ClickPipes can be deployed and managed manually using the ClickPipes UI, as well as programmatically using [OpenAPI](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickPipes/paths/~1v1~1organizations~1%7BorganizationId%7D~1services~1%7BserviceId%7D~1clickpipes/post) and [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.8.1-alpha1/docs/resources/clickpipe).

<CreateClickPipe provider="s3"/>
