---
slug: /cloud/managed-postgres/settings
sidebar_label: 'Settings'
title: 'Settings'
description: 'Configure PostgreSQL and PgBouncer parameters and manage instance settings for Managed Postgres'
keywords: ['postgres configuration', 'postgresql settings', 'pgbouncer', 'ip filters']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import postgresParameters from '@site/static/images/managed-postgres/postgres-parameters.png';
import serviceActions from '@site/static/images/managed-postgres/service-actions.png';
import ipFilters from '@site/static/images/managed-postgres/ip-filters.png';

<PrivatePreviewBadge/>

You can modify configuration parameters and manage instance settings for your Managed Postgres instance through the **Settings** tab in the sidebar.

## Changing configuration parameters {#changing-configuration}

<Image img={postgresParameters} alt="Postgres parameters configuration" size="md" border/>

To modify a parameter, select the **Edit parameters** button. Select the parameters you need to modify and change their values accordingly. Once you're satisfied with your changes, press the **Save Changes** button.

All changes made to the configuration parameters are typically persisted to the instance within one minute. Some parameters require a database restart to take effect. These changes will be applied after the next restart, which you can trigger manually from the **Service actions** toolbar.

## Service actions and scaling {#service-actions}

<Image img={serviceActions} alt="Service actions and scaling" size="md" border/>

The **Service actions** toolbar provides controls for managing your Managed Postgres instance:

- **Reset password**: Update the superuser password (only when the instance is `Running`)
- **Restart**: Restart the database instance (only when the instance is `Running`)
- **Delete**: Delete the instance

The **Scaling** section allows you to change the instance types of your primary and standbys to increase or decrease computing resources and storage capacity. Behind the scenes, new instances will be provisioned and then take over after they've caught up with the current primary. The failover process will interrupt all current connections and lead to brief downtime.

:::tip
For safety reasons, you may not be able to switch to instance types whose storage is close to your current used storage capacity. Always opt for instance types with headroom over your current used capacity to avoid any issues.
:::

## IP filters {#ip-filters}

IP filters control which source IP addresses are permitted to connect to your Managed Postgres instance.

<Image img={ipFilters} alt="IP Access List configuration" size="md" border/>

To configure IP filters:

1. Navigate to the **Settings** tab
2. Under **IP Filters**, click **Edit**
3. Add IP addresses or CIDR ranges that should be allowed to connect
4. Click **Save** to apply the changes

You can specify individual IP addresses or use CIDR notation for IP ranges (e.g., `192.168.1.0/24`). You can also select **Anywhere** or **Nowhere** as a shortcut for fully opening or closing the instance to the world.

:::note
If no IP filters are configured, connections from all IP addresses are permitted. For production workloads, we recommend restricting access to known IP addresses.
:::
