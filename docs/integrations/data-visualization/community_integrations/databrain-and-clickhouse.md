---
sidebar_label: 'Databrain'
sidebar_position: 131
slug: /integrations/databrain
keywords: ['clickhouse', 'Databrain', 'connect', 'integrate', 'ui', 'analytics', 'embedded', 'dashboard', 'visualization']
description: 'Databrain is an embedded analytics platform that integrates seamlessly with ClickHouse for building customer facing dashboards, metrics, and data visualizations.'
title: 'Connecting Databrain to ClickHouse'
doc_type: 'guide'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import databrain_01 from '@site/static/images/integrations/data-visualization/databrain_01.png';
import databrain_02 from '@site/static/images/integrations/data-visualization/databrain_02.png';
import databrain_03 from '@site/static/images/integrations/data-visualization/databrain_03.png';
import databrain_04 from '@site/static/images/integrations/data-visualization/databrain_04.png';
import databrain_05 from '@site/static/images/integrations/data-visualization/databrain_05.png';
import databrain_06 from '@site/static/images/integrations/data-visualization/databrain_06.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# Connecting Databrain to ClickHouse

<CommunityMaintainedBadge/>

[Databrain](https://usedatabrain.com) is an embedded analytics platform that enables you to build and share interactive dashboards, metrics, and data visualizations with your customers. Databrain connects to ClickHouse using the HTTPS interface, making it easy to visualize and analyze your ClickHouse data with a modern, user-friendly interface.

<Image size="md" img={databrain_01} alt="Databrain dashboard interface showing ClickHouse data visualization" border />

<br/>

This guide will walk you through the steps to connect Databrain with your ClickHouse instance.

## Pre-requisites {#pre-requisites}

- A ClickHouse database either hosted on your own infrastructure or on [ClickHouse Cloud](https://clickhouse.com/).
- A [Databrain account](https://app.usedatabrain.com/users/sign-up).
- A Databrain workspace to connect your data source.

## Steps to connect Databrain to ClickHouse {#steps-to-connect-databrain-to-clickhouse}

### 1. Gather your connection details {#1-gather-your-connection-details}

<ConnectionDetails />

### 2. Allow Databrain IP addresses (if required) {#2-allow-databrain-ip-addresses}

If your ClickHouse instance has IP filtering enabled, you'll need to whitelist Databrain's IP addresses. 

For ClickHouse Cloud users:
1. Navigate to your service in the ClickHouse Cloud console
2. Go to **Settings** → **Security**
3. Add Databrain's IP addresses to the allow list

:::tip
Refer to [Databrain's IP whitelisting documentation](https://docs.usedatabrain.com/guides/datasources/allow-access-to-our-ip) for the current list of IP addresses to whitelist.
:::

### 3. Add ClickHouse as a data source in Databrain {#3-add-clickhouse-as-a-data-source}

1. Log in to your Databrain account and navigate to the workspace where you want to add the data source.

2. Click on **Data Sources** in the navigation menu.

<Image size="md" img={databrain_02} alt="Databrain data sources menu" border />

3. Click **Add a Data Source** or **Connect Data Source**.

4. Select **ClickHouse** from the list of available connectors.

<Image size="md" img={databrain_03} alt="Databrain connector selection showing ClickHouse option" border />

5. Fill in the connection details:
   - **Destination Name**: Enter a descriptive name for this connection (e.g., "Production ClickHouse" or "Analytics DB")
   - **Host**: Enter your ClickHouse host URL (e.g., `https://ru7b3vwqoe.eu-west-1.aws.clickhouse.cloud`)
   - **Port**: Enter `8443` (default HTTPS port for ClickHouse)
   - **Username**: Enter your ClickHouse username
   - **Password**: Enter your ClickHouse password

<Image size="md" img={databrain_04} alt="Databrain ClickHouse connection form with configuration fields" border />

6. Click **Test Connection** to verify that Databrain can connect to your ClickHouse instance.

7. Once the connection is successful, click **Save** or **Connect** to add the data source.

### 4. Configure user permissions {#4-configure-user-permissions}

Ensure the ClickHouse user you're connecting with has the necessary permissions:

```sql
-- Grant permissions to read schema information
GRANT SELECT ON information_schema.* TO your_databrain_user;

-- Grant read access to your database and tables
GRANT SELECT ON your_database.* TO your_databrain_user;
```

Replace `your_databrain_user` and `your_database` with your actual username and database name.

## Using Databrain with ClickHouse {#using-databrain-with-clickhouse}

### Explore your data {#explore-your-data}

1. After connecting, navigate to your workspace in Databrain.

2. You'll see your ClickHouse tables listed in the data explorer.

<Image size="md" img={databrain_05} alt="Databrain data explorer showing ClickHouse tables" border />

3. Click on a table to explore its schema and preview the data.

### Create metrics and visualizations {#create-metrics-and-visualizations}

1. Click **Create Metric** to start building visualizations from your ClickHouse data.

2. Select your ClickHouse data source and choose the table you want to visualize.

3. Use Databrain's intuitive interface to:
   - Select dimensions and measures
   - Apply filters and aggregations
   - Choose visualization types (bar charts, line charts, pie charts, tables, etc.)
   - Add custom SQL queries for advanced analysis

4. Save your metric to reuse it across dashboards.

### Build dashboards {#build-dashboards}

1. Click **Create Dashboard** to start building a dashboard.

2. Add metrics to your dashboard by dragging and dropping saved metrics.

3. Customize the layout and appearance of your dashboard.

<Image size="md" img={databrain_06} alt="Databrain dashboard with multiple ClickHouse visualizations" border />

4. Share your dashboard with your team or embed it in your application.

### Advanced features {#advanced-features}

Databrain offers several advanced features when working with ClickHouse:

- **Custom SQL Console**: Write and execute custom SQL queries directly against your ClickHouse database
- **Multi-tenancy and single-tenancy**: Connect your Clickhouse database, with both single-tenant and multi-tenant architectures
- **Report Scheduling**: Schedule automated reports and email them to stakeholders
- **AI-powered Insights**: Use AI to generate summaries and insights from your data
- **Embedded Analytics**: Embed dashboards and metrics directly into your applications
- **Semantic Layer**: Create reusable data models and business logic

## Troubleshooting {#troubleshooting}

### Connection fails {#connection-fails}

If you're unable to connect to ClickHouse:

1. **Verify credentials**: Double-check your username, password, and host URL
2. **Check port**: Ensure you're using port `8443` for HTTPS (or `8123` for HTTP if not using SSL)
3. **IP whitelisting**: Confirm that Databrain's IP addresses are whitelisted in your ClickHouse firewall/security settings
4. **SSL/TLS**: Ensure SSL/TLS is properly configured if you're using HTTPS
5. **User permissions**: Verify the user has SELECT permissions on `information_schema` and your target databases

### Slow query performance {#slow-query-performance}

If queries are running slowly:

1. **Optimize your queries**: Use filters and aggregations efficiently
2. **Create materialized views**: For frequently accessed aggregations, consider creating materialized views in ClickHouse
3. **Use appropriate data types**: Ensure your ClickHouse schema uses optimal data types
4. **Index optimization**: Leverage ClickHouse's primary keys and skipping indices

## Learn more {#learn-more}

For more information about Databrain features and how to build powerful analytics:

- [Databrain Documentation](https://docs.usedatabrain.com/)
- [ClickHouse Integration Guide](https://docs.usedatabrain.com/guides/datasources/connecting-data-sources-to-databrain/clickhouse)
- [Creating Dashboards](https://docs.usedatabrain.com/guides/dashboards/create-a-dashboard)
- [Building Metrics](https://docs.usedatabrain.com/guides/metrics/create-metrics)
