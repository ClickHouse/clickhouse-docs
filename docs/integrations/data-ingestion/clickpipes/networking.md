---
sidebar_label: 'Networking'
description: 'Private networking for ClickPipes: AWS PrivateLink and GCP Private Service Connect, and the regions where they are available.'
slug: /integrations/clickpipes/networking
title: 'ClickPipes networking'
doc_type: 'guide'
keywords: ['clickpipes networking', 'private networking', 'reverse private endpoint', 'aws privatelink', 'gcp private service connect', 'private connectivity']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

ClickPipes can reach a data source over private networking, so ingestion traffic never crosses the public internet. Private connectivity uses a **reverse private endpoint (RPE)**: an endpoint the ClickPipes data plane creates inside its own VPC and points at a private endpoint service you publish in front of your source.

## Supported regions {#supported-regions}

A reverse private endpoint must be created in the **same region** as both the ClickHouse Cloud service and the data source. Cross-region private connectivity is not supported, with the exception of an AWS PrivateLink VPC endpoint service configured for [cross-region access](/integrations/clickpipes/aws-privatelink#aws-privatelink-regions).

Private networking is available in every region where ClickPipes is hosted.

### AWS {#aws-regions}

AWS PrivateLink is available in the following AWS regions:

`af-south-1`, `ap-east-1`, `ap-northeast-1`, `ap-northeast-2`, `ap-south-1`, `ap-southeast-1`, `ap-southeast-2`, `ap-southeast-3`, `ca-central-1`, `eu-central-1`, `eu-north-1`, `eu-west-1`, `eu-west-2`, `il-central-1`, `mx-central-1`, `sa-east-1`, `us-east-1`, `us-east-2`, `us-west-2`

### Google Cloud {#gcp-regions}

GCP Private Service Connect is available in the following Google Cloud regions:

`asia-northeast1`, `asia-southeast1`, `australia-southeast1`, `europe-west2`, `europe-west4`, `us-central1`, `us-east1`, `us-west1`

The static egress IPs that ClickPipes uses in each region are listed under [List of static IPs](/integrations/clickpipes/networking/static-ips).

## Providers {#providers}

| Provider | Use with | Guide |
| --- | --- | --- |
| **AWS PrivateLink** | Kafka, Postgres, MySQL, and MongoDB sources on AWS | [AWS PrivateLink for ClickPipes](/integrations/clickpipes/aws-privatelink) |
| **GCP Private Service Connect** | Postgres CDC sources on GCP (Cloud SQL or self-managed) | [GCP Private Service Connect for Postgres CDC](/integrations/clickpipes/gcp-psc/postgres) |
