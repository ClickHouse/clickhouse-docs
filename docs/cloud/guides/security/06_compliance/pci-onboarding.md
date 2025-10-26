---
sidebar_label: 'PCI onboarding'
slug: /cloud/security/compliance/pci-onboarding
title: 'PCI onboarding'
description: 'Learn more about how to onboard to PCI compliant services'
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge';

import Image from '@theme/IdealImage';
import pci1 from '@site/static/images/cloud/security/compliance/pci_1.png';
import pci2 from '@site/static/images/cloud/security/compliance/pci_2.png';
import pci3 from '@site/static/images/cloud/security/compliance/pci_3.png';

<EnterprisePlanFeatureBadge feature="PCI compliance"/>

ClickHouse offers services that are compliant with the Payment Card Industry Data Security Standard (PCI-DSS) and is audited to Level 1 Service Provider requirements. Customers may process primary account numbers (PAN) within these services by enabling this feature and deploying services to a compliant region.

For more information about ClickHouse's compliance program and third party audit report availability, review our [compliance overview](/cloud/security/compliance-overview). For a copy of our PCI shared responsibility document, visit our [Trust Center](https://trust.clickhouse.com). Additionally, customers should review our [security features](/cloud/security) page to select and implement appropriate security controls for their workloads.

This page describes the process for enabling deployment of PCI compliant services in ClickHouse Cloud.

<VerticalStepper headerLevel="h3">

### Sign up for Enterprise services {#sign-up-for-enterprise}

1. Select your organization name in the lower left corner of the console.
2. Click **Billing**.
3. Review your **Plan** in the upper left corner.
4. If your **Plan** is **Enterprise**, then go to the next section. If not, click **Change plan**.
5. Select **Switch to Enterprise**.

### Enable PCI for your organization {#enable-hipaa}

1. Select your organization name in the lower left corner of the console.
2. Click **Organization details**.
3. Toggle **Enable PCI** on.

<br />

<Image img={pci1} size="md" alt="Enable PCI" background='black'/>

<br />

4. Once enabled, PCI services can be deployed within the organization.

<br />

<Image img={pci2} size="md" alt="PCI enabled" background='black'/>

<br />

### Deploy services to PCI compliant regions {#deploy-pci-regions}

1. Select **New service** in the upper left corner of the home screen in the console
2. Change the **Region type** to **HIPAA compliant**

<br />

<Image img={pci3} size="md" alt="Deploy to PCI region" background='black'/>

<br />

3. Enter a name for the service and enter the remaining information

For a complete listing of PCI compliant cloud providers and services, review our [Supported cloud regions](/cloud/reference/supported-regions) page.

</VerticalStepper>

## Migrate existing services {#migrate-to-hipaa}

Customers are strongly encouraged to deploy services to compliant environments where required. The process to migrate services from a standard region to a PCI compliant region involves restoring from a backup and may require some downtime.

If migration from standard to PCI compliant regions is required, follow these steps to perform self-service migrations:

1. Select the service to be migrated.
2. Click **Backups** on the left.
3. Select the three dots to the left of the backup to be restored.
4. Select the **Region type** to restore the backup to a PCI compliant region.
5. Once the restoration is complete, run a few queries to verify the schemas and record counts are as expected.
6. Delete the old service.

:::info Restrictions
Services must remain in the same cloud provider and geographic region. This process migrates the service to the compliant environment in the same cloud provider and region.
:::
