---
sidebar_title: 'Query API endpoints'
slug: /cloud/features/query-api-endpoints
description: 'Easily spin up REST API endpoints from your saved queries'
keywords: ['api', 'query api endpoints', 'query endpoints', 'query rest api']
title: 'Query API endpoints'
doc_type: 'guide'
---

import {CardSecondary} from '@clickhouse/click-ui/bundled';
import Link from '@docusaurus/Link'

# Query API endpoints {#query-api-endpoints}

Building interactive data-driven applications requires not only a fast database, well-structured data, and optimized queries.
Your front-end and microservices also need an easy way to consume the data returned by those queries, preferably via well-structured APIs.

The **Query API Endpoints** feature allows you to create an API endpoint directly from any saved SQL query in the ClickHouse Cloud console.
You'll be able to access API endpoints via HTTP to execute your saved queries without needing to connect to your ClickHouse Cloud service via a native driver.

## IP Access Control {#ip-access-control}

Query API endpoints respect API key-level IP whitelisting. Similar to the SQL Console, Query API endpoints proxy requests from within ClickHouse's infrastructure, so service-level IP whitelist settings do not apply.

To restrict which clients can call your Query API endpoints:

1. Configure IP allow list restrictions on the API key used to authenticate requests.
2. In the ClickHouse Cloud Console, edit the API key and set the allowed IP addresses or ranges.

Creating Query API endpoints requires an Admin Console Role and an API key with appropriate permissions.

:::tip Guide
See the [Query API endpoints guide](/cloud/get-started/query-endpoints) for instructions on how to set up
query API endpoints in a few easy steps
:::