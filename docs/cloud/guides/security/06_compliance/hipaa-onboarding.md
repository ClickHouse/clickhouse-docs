---
sidebar_label: 'HIPAA onboarding'
slug: /cloud/security/compliance/hipaa-onboarding
title: 'HIPAA onboarding'
description: 'Learn more about how to onboard to HIPAA compliant services'
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge';

import Image from '@theme/IdealImage';
import hipaa1 from '@site/static/images/cloud/security/compliance/hipaa_1.png';
import hipaa2 from '@site/static/images/cloud/security/compliance/hipaa_2.png';
import hipaa3 from '@site/static/images/cloud/security/compliance/hipaa_3.png';
import hipaa4 from '@site/static/images/cloud/security/compliance/hipaa_4.png';

<EnterprisePlanFeatureBadge feature="HIPAA"/>

ClickHouse offers services that are compliant with the Health Information Portability and Accountability Act (HIPAA) of 1996's Security Rule. Customers may process protected health information (PHI) within these services after signing a Business Associate Agreement (BAA) and deploying services to a compliant region.

For more information about ClickHouse's compliance program and third party audit report availability, review our [compliance overview](/cloud/security/compliance-overview) and [Trust Center](https://trust.clickhouse.com). Additionally, customers should review our [security features](/cloud/security) page to select and implement appropriate security controls for their workloads.

This page describes the process for enabling deployment of HIPAA compliant services in ClickHouse Cloud.

## Enable and deploy HIPAA compliant services {#enable-hipaa-compliant-services}

<VerticalStepper headerLevel="h3">

### Sign up for Enterprise services {#sign-up-for-enterprise}

1. Select your organization name in the lower left corner of the console.
2. Click **Billing**.
3. Review your **Plan** in the upper left corner.
4. If your **Plan** is **Enterprise**, then go to the next section. If not, click **Change plan**.
5. Select **Switch to Enterprise**.

### Enable HIPAA for your organization {#enable-hipaa}

1. Select your organization name in the lower left corner of the console.
2. Click **Organization details**.
3. Toggle **Enable HIPAA** on.

<br />

<Image img={hipaa1} size="md" alt="Request HIPAA enablement" background='black'/>

<br />

4. Follow the instructions on the screen to submit a request to complete a BAA.

<br />

<Image img={hipaa2} size="md" alt="Submit a BAA request" background='black'/>

<br />

5. Once the BAA is completed, HIPAA will be enabled for the organization.

<br />

<Image img={hipaa3} size="md" alt="HIPAA enabled" background='black'/>

<br />

### Deploy services to HIPAA compliant regions {#deploy-hippa-services}

1. Select **New service** in the upper left corner of the home screen in the console
2. Change the **Region type** to **HIPAA compliant**

<br />

<Image img={hipaa4} size="md" alt="Deploy to HIPAA region" background='black'/>

<br />

3. Enter a name for the service and enter the remaining information

For a complete listing of HIPAA compliant cloud providers and services, review our [Supported cloud regions](/cloud/reference/supported-regions) page.

</VerticalStepper>

## Migrate existing services {#migrate-to-hipaa}

Customers are strongly encouraged to deploy services to compliant environments where required. The process to migrate services from a standard region to a HIPAA compliant region involves restoring from a backup and may require some downtime.

If migration from standard to HIPAA compliant regions is required, follow these steps to perform self-service migrations:

1. Select the service to be migrated.
2. Click **Backups** on the left.
3. Select the three dots to the left of the backup to be restored.
4. Select the **Region type** to restore the backup to a HIPAA compliant region.
5. Once the restoration is complete, run a few queries to verify the schemas and record counts are as expected.
6. Delete the old service.

:::info Restrictions
Services must remain in the same cloud provider and geographic region. This process migrates the service to the compliant environment in the same cloud provider and region.
:::
