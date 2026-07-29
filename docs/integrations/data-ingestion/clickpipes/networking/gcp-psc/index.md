---
sidebar_label: 'GCP Private Service Connect'
description: 'Connect ClickPipes to a private GCP data source using GCP Private Service Connect and reverse private endpoints.'
slug: /integrations/clickpipes/gcp-psc
title: 'GCP Private Service Connect for ClickPipes'
doc_type: 'guide'
keywords: ['gcp psc', 'private service connect', 'ClickPipes security', 'reverse private endpoint', 'private connectivity']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

You can use GCP [Private Service Connect (PSC)](https://cloud.google.com/vpc/docs/private-service-connect) to give a ClickPipe private, internal-only access to a data source running in your own GCP project — without exposing it to the public internet or peering VPCs.

This page documents the **ClickPipes side** of a PSC connection, which is the same for every source. For how to enable PSC and obtain a service attachment on a specific service, see the [supported sources](#supported-sources) below.

:::note
PSC connectivity is only available when your ClickPipe is hosted on GCP. Check the [supported regions](/integrations/clickpipes/networking#supported-regions) before you start.
:::

## How it works {#how-it-works}

ClickPipes uses **Reverse Private Endpoints (RPEs)** to reach private sources. For GCP, an RPE is a PSC **endpoint** that the ClickPipes data plane creates inside its own VPC and that consumes a PSC **service attachment** published in front of your source.

Each RPE provisions a single static internal IP in the ClickPipes VPC. GCP PSC does not propagate DNS, so you tell ClickPipes which private DNS name to map to that IP using a custom private DNS mapping.

Regardless of the source, you always hand ClickPipes the same two values:

- **Service attachment URI** — `projects/<PROJECT>/regions/<REGION>/serviceAttachments/<NAME>`
- **Private DNS name** — the hostname the pipe resolves through the RPE

Where those come from depends on the PSC pattern:

| Pattern | When it applies | Service attachment |
| --- | --- | --- |
| **Native PSC** *(recommended)* | Managed services that publish a PSC service attachment for you (Cloud SQL, AlloyDB, GCP Managed Kafka). | Created automatically when you enable PSC on the instance. |
| **Producer-owned PSC** | Self-managed sources (e.g. Postgres on Compute Engine), or managed services reached through your own internal TCP load balancer. | You create and manage the service attachment yourself. |

## Supported sources {#supported-sources}

Follow the source-specific guide to enable PSC and read the service attachment, then return here to create the RPE.

| Source | ClickPipe group | Pattern | Guide |
| --- | --- | --- | --- |
| Cloud SQL for PostgreSQL | Postgres CDC | Native | [Cloud SQL over PSC](/integrations/clickpipes/postgres/source/cloud-sql-psc) |
| AlloyDB for PostgreSQL | Postgres CDC | Native | _(planned)_ |
| Self-managed PostgreSQL on Compute Engine | Postgres CDC | Producer-owned | _(planned)_ |
| GCP Managed Service for Apache Kafka | Kafka | Native | _(planned)_ |

## Prerequisites {#prerequisites}

- A ClickHouse Cloud service hosted on GCP, in a [supported region](/integrations/clickpipes/networking#supported-regions).
- IAM rights to enable PSC on your source and manage PSC service attachments (`roles/compute.networkAdmin`).
- The **ClickPipes consumer project** allowed to connect to your service attachment. For ClickPipes production, this is `clickpipes-production`.
- The ClickHouse Cloud API key/secret for the organization that owns the service (only required if you provision through Terraform or the API).

:::note
A PSC service attachment can be claimed by only one ClickHouse Cloud service at a time — it cannot be reused across multiple services. To move a service attachment to a different service, contact ClickHouse support to release the existing claim.
:::

## Create the reverse private endpoint {#create-rpe}

Once you have the **service attachment URI** and **private DNS name** from your source's guide, create the RPE in one of three ways.

### Option 1: ClickPipes UI {#option-1-clickpipes-ui}

1. In ClickHouse Cloud, open your service and go to **Data Sources** > **ClickPipes**.
2. Select the data source you want to ingest from.
3. Under **Setup your ClickPipe connection**, toggle on **Use secure connection**, then click **+ Reverse private endpoint** and pick **GCP PSC service attachment**.
4. Fill in the **Service attachment URI**, the **Private DNS name**, and a **Description**.
5. Click **Create**. The endpoint moves through `Provisioning` → `Ready`. (Native PSC auto-accepts, so you will not see `PendingAcceptance`.)

### Option 2: Terraform {#option-2-terraform}

Custom private DNS mappings are not an attribute of `clickhouse_clickpipes_reverse_private_endpoint` — they are managed by the separate `clickhouse_clickpipes_reverse_private_endpoint_custom_private_dns` resource, which takes a full replacement list of mappings and references the endpoint by ID:

```hcl
resource "clickhouse_clickpipes_reverse_private_endpoint" "gcp_psc" {
  service_id             = var.clickhouse_service_id
  description            = "GCP PSC endpoint"
  type                   = "GCP_PSC_SERVICE_ATTACHMENT"
  gcp_service_attachment = "projects/<PROJECT>/regions/<REGION>/serviceAttachments/<NAME>"
}

resource "clickhouse_clickpipes_reverse_private_endpoint_custom_private_dns" "gcp_psc" {
  service_id                  = var.clickhouse_service_id
  reverse_private_endpoint_id = clickhouse_clickpipes_reverse_private_endpoint.gcp_psc.id

  mapping = [
    { private_dns_name = "<PRIVATE_DNS_NAME>" }
  ]
}
```

### Option 3: API {#option-3-api}

```bash
curl --silent --user $KEY_ID:$KEY_SECRET \
  -X POST -H "Content-Type: application/json" \
  https://api.clickhouse.cloud/v1/organizations/<ORG_ID>/services/<SERVICE_ID>/clickpipesReversePrivateEndpoints \
  -d '{
    "type": "GCP_PSC_SERVICE_ATTACHMENT",
    "description": "GCP PSC endpoint",
    "gcpServiceAttachment": "projects/<PROJECT>/regions/<REGION>/serviceAttachments/<NAME>",
    "customPrivateDnsMappings": [
      { "privateDnsName": "<PRIVATE_DNS_NAME>" }
    ]
  }'
```

### Custom private DNS names {#custom-private-dns-rules}

Because GCP PSC does not propagate DNS, a custom private DNS mapping is integral to every GCP PSC endpoint — you always supply the source's private DNS name this way, and ClickPipes resolves it to the endpoint's static internal IP.

The standard ClickPipes [custom private DNS naming rules](/integrations/clickpipes/aws-privatelink#custom-private-dns) apply — wildcard support, uniqueness across a service's reverse private endpoints, and reserved-suffix restrictions are enforced identically for every provider. Wildcards are especially useful on GCP: a single mapping such as `*.<cluster>.<region>.managedkafka.<project>.cloud.goog` fronts every broker of a Managed Kafka cluster.

For GCP PSC, only the mapping's `privateDnsName` is used. The `internalDNSName` field is not supported, because a PSC endpoint exposes a static IP with no DNS name to pin to — mappings always resolve to that IP.

## Approving producer-owned connections {#producer-owned}

For producer-owned PSC, put the ClickPipes consumer project on the service attachment's auto-accept list so the connection is accepted automatically. If you skip that, the RPE sits in `PendingAcceptance` until you approve it manually.

To accept the connection, the service attachment's consumer accept list needs the endpoint's numeric ID-based URI (`projects/<PROJECT>/regions/<REGION>/forwardingRules/<NUMERIC_ID>`). That value is the `endpointWithId` of the pending connection on the service attachment — describe it to find it:

```bash
gcloud beta compute service-attachments describe <SERVICE_ATTACHMENT_NAME> \
  --region=<REGION> --project=<YOUR_PROJECT_ID> \
  --format='json(connectedEndpoints)'
```

Take the `endpointWithId` of the entry whose `status` is `PENDING`, strip the `https://www.googleapis.com/compute/beta/` prefix, and pass the result to `--consumer-accept-list`:

```bash
gcloud beta compute service-attachments update <SERVICE_ATTACHMENT_NAME> \
  --region=<REGION> --project=<YOUR_PROJECT_ID> \
  --consumer-accept-list=projects/<PROJECT>/regions/<REGION>/forwardingRules/<NUMERIC_ID> \
  --reconcile-connections
```

:::warning
Do not use the `endpoint_id` from the ClickPipes API/Terraform response here — that value is the forwarding-rule *name*, not the numeric ID GCP requires, so the accept list will not match. Always take the numeric ID from the service attachment's pending `endpointWithId`.
:::

## Managing reverse private endpoints {#managing-rpes}

Go to **Data Sources** → **Reverse Private Endpoints** in your service to:

- See each RPE's status (`Provisioning`, `PendingAcceptance`, `Ready`, `Failed`).
- Reuse an existing RPE across multiple ClickPipes that target the same host.
- Delete RPEs that are no longer in use. Deleting an RPE tears down the consumer endpoint in the ClickPipes VPC; the service attachment on your side is untouched.

## Supported regions {#supported-regions}

The RPE must be created in the **same region** as both the service attachment and the ClickHouse Cloud service. For the list of GCP regions where ClickPipes is hosted, see [ClickPipes networking → Supported regions](/integrations/clickpipes/networking#supported-regions).

:::note Cross-region is not supported
GCP PSC does not support cross-region connectivity yet — the reverse private endpoint, the service attachment, and the ClickHouse Cloud service must all be in the same GCP region. If your source is in a different region from your ClickHouse Cloud service, use [SSH tunneling](/integrations/clickpipes/postgres#optional-setting-up-ssh-tunneling) instead.
:::

## Limitations {#limitations}

- The RPE endpoint and the service attachment must be in the **same GCP region**. Cross-region PSC is not supported yet — use [SSH tunneling](/integrations/clickpipes/postgres#optional-setting-up-ssh-tunneling) if your source is in another region.
- One RPE provisions **one static internal IP**. You must supply the source's private DNS name via a custom private DNS mapping.
- A service attachment is claimed by a single ClickHouse Cloud service and cannot be shared across services (releasable on request).
- Only `GCP_PSC_SERVICE_ATTACHMENT` is supported as a GCP RPE type. VPC peering is not supported.
