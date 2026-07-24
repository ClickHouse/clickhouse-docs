---
sidebar_label: 'Cloud SQL over PSC'
description: 'Enable Private Service Connect on Cloud SQL for PostgreSQL and connect a Postgres CDC ClickPipe to it.'
slug: /integrations/clickpipes/postgres/source/cloud-sql-psc
title: 'Cloud SQL for PostgreSQL over Private Service Connect'
doc_type: 'guide'
keywords: ['cloud sql', 'postgres cdc', 'gcp psc', 'private service connect']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

This guide covers the **Cloud SQL–specific** steps for connecting a Postgres CDC ClickPipe over [GCP Private Service Connect](/integrations/clickpipes/gcp-psc). Cloud SQL is a **native PSC** source: it publishes the service attachment for you.

For the ClickPipes-side setup (creating the reverse private endpoint, Terraform/API, DNS mapping), see the [GCP Private Service Connect](/integrations/clickpipes/gcp-psc) hub.

## Step 1 — Enable PSC on the Cloud SQL instance {#enable-psc}

PSC requires the instance's public IP to be disabled (`ipv4_enabled = false`). Create a new instance with PSC enabled, or patch an existing one:

```bash
gcloud sql instances patch <INSTANCE_NAME> \
  --project=<YOUR_PROJECT_ID> \
  --enable-private-service-connect \
  --allowed-psc-projects=clickpipes-production
```

`--allowed-psc-projects` is the auto-accept list. With `clickpipes-production` on it, Cloud SQL accepts the endpoint automatically — no manual approval. See the [Cloud SQL PSC docs](https://cloud.google.com/sql/docs/postgres/configure-private-service-connect) for the authoritative steps and options.

## Step 2 — Read the service attachment and DNS name {#read-attachment}

```bash
gcloud sql instances describe <INSTANCE_NAME> \
  --project=<YOUR_PROJECT_ID> \
  --format='value(pscServiceAttachmentLink,dnsName)'
```

- `pscServiceAttachmentLink` → the **service attachment URI**.
- `dnsName` → the **private DNS name**. Drop the trailing dot (`...sql.goog.` → `...sql.goog`).

## Step 3 — Create the RPE {#create-rpe}

Hand those two values to ClickPipes following [Create the reverse private endpoint](/integrations/clickpipes/gcp-psc#create-rpe).

## Step 4 — Create the Postgres ClickPipe {#create-clickpipe}

In the ClickPipes UI, choose **Postgres CDC** → **Cloud SQL for PostgreSQL** (`cloudsqlpostgres`):

- **Host** — the Cloud SQL `dnsName` you mapped in the RPE.
- **Port** — `5432`.
- **Database / User / Password** — your instance credentials.
- **Reverse Private Endpoint** — the RPE you created in Step 3.
