---
slug: /en/faq/operations/deploy-separate-storage-and-compute
title: Is it possible to deploy ClickHouse with separate storage and compute?
sidebar_label: Is it possible to deploy ClickHouse with separate storage and compute?
toc_hidden: true
toc_priority: 20
---

The short answer is “yes”.

Object storage (S3, GCS) can be used as the elastic primary storage backend for data in ClickHouse tables. [S3-backed MergeTree](/docs/en/integrations/data-ingestion/s3/index.md) and [GCS-backed MergeTree](/docs/en/integrations/data-ingestion/gcs/index.md) guides are published. Only metadata is stored locally on compute nodes in this configuration. You can easily upscale and downscale compute resources in this setup as additional nodes only need to replicate metadata.

