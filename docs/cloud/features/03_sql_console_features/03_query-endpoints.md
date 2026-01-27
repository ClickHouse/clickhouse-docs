---
sidebar_title: 'Query API endpoints'
slug: /cloud/features/query-api-endpoints
description: 'Easily spin up REST API endpoints from your saved queries'
keywords: ['api', 'query api endpoints', 'query endpoints', 'query rest api']
title: 'Query API endpoints'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import {CardSecondary} from '@clickhouse/click-ui/bundled';
import console_api_keys from '@site/static/images/cloud/guides/query-endpoints/console-api-keys.png';
import edit_api_key from '@site/static/images/cloud/guides/query-endpoints/api-key-edit.png';
import specific_locations from '@site/static/images/cloud/guides/query-endpoints/specific-locations.png';
import Link from '@docusaurus/Link'

# Query API endpoints {#query-api-endpoints}

Building interactive data-driven applications requires not only a fast database, well-structured data, and optimized queries.
Your front-end and microservices also need an easy way to consume the data returned by those queries, preferably via well-structured APIs.

The **Query API Endpoints** feature allows you to create an API endpoint directly from any saved SQL query in the ClickHouse Cloud console.
You'll be able to access API endpoints via HTTP to execute your saved queries without needing to connect to your ClickHouse Cloud service via a native driver.

## IP Access Control {#ip-access-control}

Query API endpoints respect API key-level IP whitelisting. Similar to the SQL Console, Query API endpoints proxy requests from within ClickHouse's infrastructure, so service-level IP whitelist settings do not apply.

To restrict which clients can call your Query API endpoints:

<VerticalStepper headerLevel="h4">

#### Open API key settings {#open-settings}

1. Go to ClickHouse Cloud Console → **Organization** → **API Keys**

<Image img={console_api_keys} alt="API Keys"/>

2. Click **Edit** next to the API key used for Query API endpoints

<Image img={edit_api_key} alt="Edit"/>

#### Add allowed IP addresses {#add-ips}

1. In the **Alow access to this API Key** section, select **Specific locations**
2. Enter IP addresses or CIDR ranges (e.g., `203.0.113.1` or `203.0.113.0/24`)
3. Add multiple entries as needed

<Image img={specific_locations} alt="Specific locations"/>

Creating Query API endpoints requires an Admin Console Role and an API key with appropriate permissions.

</VerticalStepper>

:::tip Guide
See the [Query API endpoints guide](/cloud/get-started/query-endpoints) for instructions on how to set up
query API endpoints in a few easy steps
:::