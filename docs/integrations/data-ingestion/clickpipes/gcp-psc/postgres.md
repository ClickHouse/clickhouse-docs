---
sidebar_label: 'GCP Private Service Connect for Postgres CDC'
description: 'Connect a Postgres CDC ClickPipe to a private Cloud SQL for PostgreSQL instance using GCP Private Service Connect.'
slug: /integrations/clickpipes/gcp-psc/postgres
title: 'GCP Private Service Connect for Postgres CDC'
doc_type: 'guide'
keywords: ['gcp psc', 'private service connect', 'ClickPipes security', 'reverse private endpoint', 'cloud sql', 'postgres cdc', 'private connectivity']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

# GCP Private Service Connect for Postgres CDC ClickPipes

You can use GCP [Private Service Connect (PSC)](https://cloud.google.com/vpc/docs/private-service-connect) to give a ClickPipe private, internal-only access to a Postgres source running in your own GCP project — without exposing the database to the public internet or peering VPCs.

This guide covers the **Postgres CDC** ClickPipe group. Cloud SQL for PostgreSQL is the primary, recommended source. Streaming sources (Kafka, Confluent Cloud) and other source groups have their own guides.

:::note
PSC connectivity is only available when your ClickPipe is hosted on GCP. Check the [region matrix](#supported-gcp-regions) before you start.
:::

## How it works

ClickPipes uses **Reverse Private Endpoints (RPEs)** to reach private sources. For GCP, an RPE is a PSC **endpoint** that the ClickPipes data plane creates inside its own VPC and that consumes a PSC **service attachment** you publish in front of your Postgres instance.

Two patterns are supported, both using the same RPE endpoint type (`GCP_PSC_SERVICE_ATTACHMENT`):

| Pattern | When to use | Service attachment |
| --- | --- | --- |
| **Cloud SQL native PSC** *(recommended)* | You run Cloud SQL for PostgreSQL and want the simplest setup. | Created automatically by Cloud SQL when you enable PSC on the instance. |
| **Producer-owned PSC** | Cloud SQL on a private VPC reached through your own internal TCP load balancer, or a self-managed Postgres on Compute Engine. | You create and manage the service attachment yourself. |

Each RPE provisions a single static internal IP in the ClickPipes VPC. Unlike AWS VPC endpoints, GCP PSC does not propagate DNS, so you tell ClickPipes which private DNS name to map to that IP using `custom_private_dns_mappings`.

## Supported Postgres sources

- Cloud SQL for PostgreSQL (native PSC)
- Cloud SQL for PostgreSQL on a private VPC, fronted by a producer-owned PSC service attachment
- Self-managed PostgreSQL on Compute Engine, fronted by a producer-owned PSC service attachment

## Prerequisites

- A ClickHouse Cloud service hosted on GCP, in a [supported region](#supported-gcp-regions).
- A GCP project where Cloud SQL (or your Postgres host) lives. You need IAM rights to:
  - Manage Cloud SQL (`roles/cloudsql.admin`) or your equivalent Postgres infrastructure.
  - Manage PSC service attachments (`roles/compute.networkAdmin`).
- The ClickHouse Cloud API key/secret for the organization that owns the service (only required if you provision through Terraform or the API).
- The **ClickPipes consumer project** that you will allow to connect to your service attachment. For ClickPipes production, this is `clickpipes-production`.

---

## Path A: Cloud SQL native PSC (recommended)

### Step 1 — Enable PSC on the Cloud SQL instance

Either create a new instance with PSC enabled or update an existing one. PSC requires the instance's public IP to be disabled (`ipv4_enabled = false`).

```bash
gcloud sql instances create <INSTANCE_NAME> \
  --project=<YOUR_PROJECT_ID> \
  --region=<REGION> \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --no-assign-ip \
  --enable-private-service-connect \
  --allowed-psc-projects=clickpipes-production
```

Updating an existing instance:

```bash
gcloud sql instances patch <INSTANCE_NAME> \
  --project=<YOUR_PROJECT_ID> \
  --enable-private-service-connect \
  --allowed-psc-projects=clickpipes-production
```

The `--allowed-psc-projects` (`psc_config.allowed_consumer_projects` in the API and Terraform) is the auto-accept list. As long as the ClickPipes consumer project is on it, Cloud SQL accepts the endpoint automatically — no manual approval step.

### Step 2 — Read the service attachment URI and DNS name

These two values are what you hand to ClickPipes.

```bash
gcloud sql instances describe <INSTANCE_NAME> \
  --project=<YOUR_PROJECT_ID> \
  --format='value(pscServiceAttachmentLink,dnsName)'
```

You should get:

- `pscServiceAttachmentLink` — the service attachment URI in the form
  `projects/<YOUR_PROJECT_ID>/regions/<REGION>/serviceAttachments/<NAME>`.
- `dnsName` — the synthetic private DNS hostname Cloud SQL assigns to the instance, e.g.
  `<INSTANCE_UID>.<REGION>.sql.goog.`.

Keep both. ClickPipes needs the service attachment URI to provision the endpoint and the DNS name so the pipe can resolve the host through the RPE.

Cloud SQL's DNS names end with . (FQDN notation) but the ClickHouse form expects a hostname without it. Drop the trailing dot:
3d2deea033cc.swpbkd47gmtq.us-central1.sql.goog

### Step 3 — Create the Reverse Private Endpoint in ClickPipes

#### Option 1: ClickPipes UI

1. In ClickHouse Cloud, open your service and go to **Data Sources** > **ClickPipes**.
2. Select the data source you want to ingest data from.
2. Under **Setup your ClickPipe connection**, toggle on **Use secure connection**, then click **+ Reverse private endpoint**. Click **Create reverse private endpoint** and pick **GCP PSC service attachment**.
3. Fill in:
   - **Service attachment URI** — paste the `pscServiceAttachmentLink` from Step 2.
   - **Private DNS name** — paste the `dnsName` from Step 2 (without the trailing dot).
   - **Description** — any human-readable label.
4. Click **Create** and wait. The endpoint moves through `Provisioning` → `Ready`. (You will not see `PendingAcceptance` for the native PSC path, because Cloud SQL auto-accepts.)

#### Option 2: Terraform

Use the [`gcp-cloud-sql-native-psc`](https://github.com/ClickHouse/clickpipes-terraform-modules/tree/main/modules/gcp-cloud-sql-native-psc) module from the public [`clickpipes-terraform-modules`](https://github.com/ClickHouse/clickpipes-terraform-modules) repository. It provisions the Cloud SQL instance, enables native PSC, creates the RPE, and optionally creates the ClickPipe.

```hcl
terraform {
  required_providers {
    clickhouse = { source = "ClickHouse/clickhouse", version = ">= 3.14.0" }
    google     = { source = "hashicorp/google",      version = "~> 6.0" }
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.region
}

provider "clickhouse" {
  organization_id = var.clickhouse_organization_id
  token_key       = var.clickhouse_cloud_api_key
  token_secret    = var.clickhouse_cloud_api_secret
}

module "cloud_sql_native_psc" {
  source = "github.com/ClickHouse/clickpipes-terraform-modules//modules/gcp-cloud-sql-native-psc?ref=main"

  project_id                    = var.gcp_project_id
  region                        = var.region
  clickhouse_service_id         = var.clickhouse_service_id
  psc_allowed_consumer_projects = ["clickpipes-production"]

  # Leave create_clickpipe = false until your source table exists and has data.
  create_clickpipe = false
}
```

If you already have a Cloud SQL instance and only want to create the RPE, use the `clickhouse_clickpipes_reverse_private_endpoint` resource directly:

```hcl
resource "clickhouse_clickpipes_reverse_private_endpoint" "cloud_sql" {
  service_id             = var.clickhouse_service_id
  description            = "Cloud SQL native PSC endpoint"
  type                   = "GCP_PSC_SERVICE_ATTACHMENT"
  gcp_service_attachment = "projects/<YOUR_PROJECT_ID>/regions/<REGION>/serviceAttachments/<NAME>"

  custom_private_dns_mappings = [
    { private_dns_name = "<INSTANCE_UID>.<REGION>.sql.goog" }
  ]
}
```

#### Option 3: API

```bash
curl -X POST \
  -H "Authorization: Bearer <CLICKHOUSE_CLOUD_API_TOKEN>" \
  -H "Content-Type: application/json" \
  https://api.clickhouse.cloud/v1/organizations/<ORG_ID>/services/<SERVICE_ID>/clickPipeReversePrivateEndpoints \
  -d '{
    "type": "GCP_PSC_SERVICE_ATTACHMENT",
    "description": "Cloud SQL native PSC endpoint",
    "gcp_service_attachment": "projects/<YOUR_PROJECT_ID>/regions/<REGION>/serviceAttachments/<NAME>",
    "custom_private_dns_mappings": [
      { "private_dns_name": "<INSTANCE_UID>.<REGION>.sql.goog" }
    ]
  }'
```

### Step 4 — Create the Postgres ClickPipe

In the ClickPipes UI, choose **Postgres CDC** → **Cloud SQL for PostgreSQL** (`cloudsqlpostgres`) and:

- **Host** — the Cloud SQL `dnsName` you mapped in the RPE.
- **Port** — `5432`.
- **Database / User / Password** — the credentials you set on the instance.
- **Reverse Private Endpoint** — pick the RPE you created in Step 3.

The pipe routes Postgres traffic through the RPE's internal IP, with DNS resolution coming from the `custom_private_dns_mappings` entry.

---

## Path B: Producer-owned PSC (private network Cloud SQL or self-managed Postgres)

Use this path when:

- Your Cloud SQL instance is on a private VPC reached through an internal TCP load balancer, and not via Cloud SQL's native PSC.
- You run Postgres on Compute Engine and want to keep it off the public internet.

The shape is identical to Path A — you publish a PSC service attachment and ClickPipes creates an endpoint for it. The difference is that you own the producer-side stack: internal TCP load balancer, NAT subnet, proxy-only subnet, and the service attachment itself.

The [`gcp-cloud-sql-private-network-psc`](https://github.com/ClickHouse/clickpipes-terraform-modules/tree/main/modules/gcp-cloud-sql-private-network-psc) module bundles the full producer-side setup. The `psc_consumer_accept_projects` input maps to the service attachment's auto-accept list:

```hcl
module "cloud_sql_private_psc" {
  source = "github.com/ClickHouse/clickpipes-terraform-modules//modules/gcp-cloud-sql-private-network-psc?ref=main"

  project_id            = var.gcp_project_id
  region                = var.region
  clickhouse_service_id = var.clickhouse_service_id

  psc_consumer_accept_projects = [
    { project_id = "clickpipes-production", connection_limit = 10 }
  ]

  create_clickpipe = false
}
```

If you skip the auto-accept list, the RPE will sit in `PendingAcceptance` until you manually approve the connection on the service attachment:

```bash
gcloud beta compute service-attachments update <SERVICE_ATTACHMENT_NAME> \
  --region=<REGION> --project=<YOUR_PROJECT_ID> \
  --consumer-accept-list=projects/clickpipes-production/regions/<REGION>/forwardingRules/<FORWARDING_RULE_ID> \
  --reconcile-connections
```

You can find the consumer forwarding rule ID on the RPE detail page in the ClickPipes UI, or as `endpoint_id` in the API/Terraform response.

---

## Managing existing reverse private endpoints

Go to **Data Sources** → **Reverse Private Endpoints** in your service to:

- See each RPE's status (`Provisioning`, `PendingAcceptance`, `Ready`, `Failed`).
- Reuse an existing RPE across multiple ClickPipes that target the same Postgres host.
- Delete RPEs that are no longer in use. Deleting an RPE also tears down the consumer endpoint in the ClickPipes VPC; the service attachment on your side is untouched.

## Supported GCP regions

GCP PSC RPE is available in every region where ClickPipes is hosted on GCP. The PSC endpoint must be created in the **same region** as the service attachment — pick a Cloud SQL region that matches a ClickPipes-on-GCP region.

> _TODO: paste the current region list before publishing._

## Limitations

- The RPE endpoint and the service attachment must be in the **same GCP region**.
- One RPE provisions **one static internal IP**. GCP PSC does not propagate DNS, so you must supply the source's private DNS name via `custom_private_dns_mappings`.
- Cloud SQL native PSC requires the instance's **public IP to be disabled** (`ipv4_enabled = false`).
- The Cloud SQL instance and the ClickPipes service must be in projects where the consumer project (`clickpipes-production`) is on the allow list.
- Only `GCP_PSC_SERVICE_ATTACHMENT` is supported as a GCP RPE type. VPC peering is not supported.
