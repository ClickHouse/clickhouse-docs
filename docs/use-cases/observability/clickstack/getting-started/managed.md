---
slug: /use-cases/observability/clickstack/getting-started/managed
title: 'Getting Started with Managed ClickStack'
sidebar_label: 'Managed'
pagination_prev: null
pagination_next: use-cases/observability/clickstack/example-datasets/index
description: 'Getting started with Managed ClickStack'
doc_type: 'guide'
keywords: ['Managed ClickStack', 'getting started', 'ClickHouse Cloud']
---

import Image from '@theme/IdealImage';
import signup_page from '@site/static/images/clickstack/getting-started/signup_page.png';
import use_case_selector from '@site/static/images/clickstack/getting-started/use_case_selector.png';
import provider_selection from '@site/static/images/clickstack/getting-started/provider_selection.png';
import advanced_resources from '@site/static/images/clickstack/getting-started/advanced_resources.png';
import service_provisioned from '@site/static/images/clickstack/getting-started/service_provisioned.png';
import select_source from '@site/static/images/clickstack/getting-started/select_source.png';
import otel_collector_start from '@site/static/images/clickstack/getting-started/otel_collector_start.png';
import advanced_otel_collector from '@site/static/images/clickstack/getting-started/otel_collector_start.png';
import clickstack_managed_ui from '@site/static/images/clickstack/getting-started/clickstack_managed_ui.png';
import BetaBadge from '@theme/badges/BetaBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import SetupManagedIngestion from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_setup_managed_ingestion.md';
import StartManagedIngestion from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_start_managed_ingestion.md';
import NavigateClickStackUI from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_navigate_managed.md';

<BetaBadge/>

The easiest way to get started is by deploying **Managed ClickStack** on **ClickHouse Cloud**, which provides a fully managed, secure backend while retaining complete control over ingestion, schema, and observability workflows. This removes the need to operate ClickHouse yourself and delivers a range of benefits: 

  - Automatic scaling of compute independent of storage
  - Low-cost and effectively unlimited retention based on object storage
  - The ability to independently isolate read and write workloads with Warehouses.
  - Integrated authentication
  - Automated backups
  - Security and compliance features
  - Seamless upgrades

<VerticalStepper headerLevel="h2">

## Signup to ClickHouse Cloud service {#signup-to-clickhouse-cloud}

To create a Managed ClickStack service in [ClickHouse Cloud](https://console.clickhouse.cloud), you just need to sign up by completing the following steps:

- Create an account on the [sign-up page](https://console.clickhouse.cloud/signUp)
- You can choose to sign up using your email or via Google SSO, Microsoft SSO, AWS Marketplace, Google Cloud or Microsoft Azure
- If you sign up using an email and password, remember to verify your email address within the next 24h via the link you receive in your email
- Login using the username and password you just created

<Image img={signup_page} size="md" alt='Signup cloud' border/>

## Select your usecase {#select-your-use-case}

Select "Observability" when prompted to select your use case.

<Image img={use_case_selector} size="md" alt='Signup cloud' border/>

## Specify your provider, region and data size {#specify-your-data-size}

Select your cloud provider, the region in which you wish to deploy, and the volume of data that you have per month via the 'Memory and Scaling' drop-down.

This should be a rough estimate of the amount of data you have, either logs or traces, in an uncompressed form. 

<Image img={use_case_selector} size="md" alt='Resource selector' border/>

This estimate will be used to size the compute supporting your Managed ClickStack service. By default, new organizations are put on the [Scale tier](/cloud/manage/cloud-tiers). [Vertical autoscaling](/manage/scaling#vertical-auto-scaling) will be enabled by default in the Scale tier. You can change your organization tier later on the 'Plans' page.

Advanced users with an understanding of their requirements can alternatively specify the exact resources provisionned, as well as any enterprise features, by selecting 'Custom Configuration' from the 'Memory and Scaling' dropdown.

<Image img={advanced_resources} size="md" alt='Advanced resource selector' border/>

Once you have specified the requirements, your Managed ClickStack service will take several minutes to provision. The completion of provisionning is indicated on the subsequent 'ClickStack' page. Feel free to explore the rest of the [ClickHouse Cloud console](/cloud/overview) whilst waiting for provisioning.

<Image img={service_provisioned} size="md" alt='Service provisioned' border/>

Once provisioning is complete, users can select 'Start Ingestion'.

## Setup ingestion {#setup-ingestion}

<SetupManagedIngestion/>

## Start ingestion {#start-ingestion}

<StartManagedIngestion/>

## Navigate to the ClickStack UI {#navigate-to-clickstack-ui-cloud}

<NavigateClickStackUI/>

## Next Steps {#next-steps}

To perform tasks such as provisioning new users or adding further data sources, see the [deployment guide for Managed ClicKStack](/use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud#additional-tasks).

</VerticalStepper>
