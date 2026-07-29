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

ClickPipes can reach a data source over private networking, so ingestion traffic never crosses the public internet. There are two ways to connect privately:

- **Managed private endpoints** — a **reverse private endpoint (RPE)** that the ClickPipes data plane creates inside its own VPC and points at a private endpoint service you publish in front of your source, using [AWS PrivateLink](/integrations/clickpipes/aws-privatelink) or [GCP Private Service Connect](/integrations/clickpipes/gcp-psc).
- **[SSH tunneling](#ssh-tunneling)** — for sources that can't use PrivateLink or PSC, including private Azure sources.

## Supported regions {#supported-regions}

A reverse private endpoint must be created in the **same region** as both the ClickHouse Cloud service and the data source. Cross-region private connectivity is not supported, with the exception of an AWS PrivateLink VPC endpoint service configured for [cross-region access](/integrations/clickpipes/aws-privatelink#aws-privatelink-regions).

Private networking is available in every region where ClickPipes is hosted.

### AWS {#aws-regions}

AWS PrivateLink is available in the following AWS regions:

`af-south-1`, `ap-east-1`, `ap-northeast-1`, `ap-northeast-2`, `ap-south-1`, `ap-southeast-1`, `ap-southeast-2`, `ap-southeast-3`, `ca-central-1`, `eu-central-1`, `eu-north-1`, `eu-west-1`, `eu-west-2`, `il-central-1`, `mx-central-1`, `sa-east-1`, `us-east-1`, `us-east-2`, `us-west-2`

### Google Cloud {#gcp-regions}

GCP Private Service Connect is available in the following Google Cloud regions:

`asia-northeast1`, `asia-southeast1`, `australia-southeast1`, `europe-west2`, `europe-west3`, `europe-west4`, `europe-west6`, `northamerica-northeast1`, `us-central1`, `us-east1`, `us-west1`

The static egress IPs that ClickPipes uses in each region are listed under [List of static IPs](/integrations/clickpipes/networking/static-ips).

## Providers {#providers}

| Provider | Use with | Guide |
| --- | --- | --- |
| **AWS PrivateLink** | Sources hosted on AWS | [AWS PrivateLink for ClickPipes](/integrations/clickpipes/aws-privatelink) |
| **GCP Private Service Connect** | Sources hosted on GCP | [GCP Private Service Connect](/integrations/clickpipes/gcp-psc) |
| **Azure Private Link** *(planned)* | Sources hosted on Azure | [Azure private connectivity](/integrations/clickpipes/networking/azure) |

## SSH tunneling {#ssh-tunneling}

When a source can't use AWS PrivateLink or GCP Private Service Connect, ClickPipes can connect through an SSH tunnel via a bastion (jump) host, so traffic still avoids the public internet. Use it for:

- **Azure sources** — ClickPipes does not support Azure Private Link yet, so an SSH tunnel is the way to reach a private Azure source over secure connectivity. Native Azure Private Link support is planned.
- Sources in regions where PrivateLink or PSC isn't available, or where the source and your ClickHouse Cloud service are in different regions.
- On-premises or self-managed sources reachable through a bastion host.

SSH tunneling is configured per ClickPipe during creation. See the steps for your source: [Postgres](/integrations/clickpipes/postgres#optional-setting-up-ssh-tunneling), [MySQL](/integrations/clickpipes/mysql#optional-set-up-ssh-tunneling), [MongoDB](/integrations/clickpipes/mongodb#optional-set-up-ssh-tunneling), or [Kafka](/integrations/clickpipes/kafka/create-your-first-kafka-clickpipe#6-configure-ssh-tunneling).

Add the [ClickPipes static IPs](/integrations/clickpipes/networking/static-ips) to your bastion host's firewall rules so ClickPipes can establish the tunnel.
