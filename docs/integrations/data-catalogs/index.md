---
sidebar_label: 'Data catalogs'
description: 'How to connect a data catalog for Iceberg or Delta tables in ClickHouse Cloud via the Data sources UI.'
slug: /integrations/data-catalogs
title: 'Connect a data catalog in ClickHouse Cloud'
doc_type: 'guide'
keywords: ['data catalogs', 'data lake', 'iceberg', 'unity catalog', 'glue', 'delta lake', 'onelake', 'polaris', 'biglake', 'clickhouse cloud']
integration:
  - support_level: 'core'
  - category: 'data_lake'
---

import Image from '@theme/IdealImage';
import BetaBadge from '@theme/badges/BetaBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import catalog_flyout_select from '@site/static/images/integrations/data-catalogs/catalog-flyout-select.png';
import linked_catalogs_table from '@site/static/images/integrations/data-catalogs/linked-catalogs-table.png';
import catalog_tables_browser from '@site/static/images/integrations/data-catalogs/catalog-tables-browser.png';
import catalog_sql_query from '@site/static/images/integrations/data-catalogs/catalog-sql-query.png';
import data_catalogs_ui from '@site/static/images/cloud/features/data-catalogs-ui.png';

<BetaBadge/>

# Connect a data catalog in ClickHouse Cloud

Connect ClickHouse Cloud to your data catalogs to access your open table format tables. You can set up connections in the **Data sources** UI. For setup via SQL, use the [`DataLakeCatalog`](/engines/database-engines/datalakecatalog) database engine in your SQL editor of choice.

<Image img={data_catalogs_ui} size="md" alt="ClickHouse Cloud UI with data catalog integrations"/>

Once connected, catalog tables show up in the SQL console under the database name you choose. You can query them with standard ClickHouse SQL, join them with [MergeTree](/engines/table-engines/mergetree-family/mergetree) tables, and use them as sources for [materialized views](/materialized-views).

## Prerequisites {#prerequisites}

Before you connect a catalog, confirm the following:

- **Service permissions.** You need the `control-plane:service:manage` permission to access the **Data sources** page and add catalogs.
- **Running service.** If the service is idle, wake it from the **Data sources** or the service settings pages before connecting or viewing linked catalogs.
- **Catalog credentials.** Gather connection details for your catalog type before opening the flyout. Each catalog uses different fields and authentication — see [Add your catalog connection](#add-your-catalog-connection) below.

## Connect your catalog {#connect-your-catalog}

### Open the data catalog flyout {#open-flyout}

1. Select **Data sources** in the left navigation.
2. Click **+ Add catalog** if you haven't set up any data sources. Otherwise, click **Add data source** > **Add data lake catalog**.
3. In the **Connect your data catalog** flyout, select your catalog from the **Select catalog** dropdown. If the catalog supports multiple open table formats, choose the format in **Open table format**.

<Image img={catalog_flyout_select} alt="Connect your data catalog flyout with Select catalog dropdown showing AWS Glue, BigLake Metastore, Microsoft OneLake, Polaris, REST Catalog, and Unity Catalog" size="lg" border/>

### Add your catalog connection {#add-your-catalog-connection}

Select your catalog below for guidance and prerequisites. Then fill in the connection parameters, along with a **Database name** — the ClickHouse database that exposes your catalog tables in the SQL console.

<Tabs queryString="catalog">
<TabItem value="aws-glue" label="AWS Glue" default>

[AWS Glue Catalog](/use-cases/data-lake/glue-catalog) exposes [Iceberg](/engines/table-engines/integrations/iceberg) tables registered in the Glue Data Catalog.

Before you connect, confirm:

- ClickHouse version 25.12+.
- Iceberg tables are registered in AWS Glue Data Catalog in your target region.
- For access key authentication, you have an IAM user access key with permissions to read Glue metadata and the underlying S3 objects.
- For IAM role authentication (26.2+), you have an IAM role that trusts your ClickHouse service role. Include the service role ARN from **Settings → Network security information** in the role trust policy. See [Accessing Iceberg data securely](/cloud/data-sources/secure-iceberg) for IAM policy examples.

In the flyout, enter your AWS **Region** (e.g. `us-west-2`), then choose an authentication method:

**Access key authentication**

1. Select **AWS Access Key** as the **Authentication method**.
2. Enter your **Access Key ID** and **Secret Access Key**.
3. Enter a **Database name** for the ClickHouse database that exposes your Glue tables.

**IAM role authentication (26.2+)**

1. Select **AWS IAM Role** as the **Authentication method**.
2. Copy the **Service role ID (IAM)** from the flyout panel and add it to your IAM role trust policy.
3. Enter your **AWS Role ARN** and an optional **AWS Role Session Name**.
4. Enter a **Database name** for the ClickHouse database that exposes your Glue tables.

:::note
Glue supports multiple table formats, but ClickHouse only reads **Iceberg** tables from Glue.
:::

<br/>
</TabItem>
<TabItem value="unity-iceberg" label="Unity Catalog (Iceberg)">

Query Unity Catalog managed [Iceberg](/engines/table-engines/integrations/iceberg) tables using OAuth client credentials from a Databricks service principal. See the [Unity Catalog guide](/use-cases/data-lake/unity-catalog#read-iceberg) for full setup.

Before you connect, confirm:

- ClickHouse version 25.12+.
- [Unity Catalog is configured for external data access](https://docs.databricks.com/aws/en/external-access/admin).
- Databricks [service principal](https://docs.databricks.com/aws/en/dev-tools/auth/oauth-m2m) with OAuth client ID and secret. The service principal has `USE CATALOG`, `USE SCHEMA`, `USE EXTERNAL SCHEMA` and `SELECT` privileges on the tables you want to query.

In the flyout:

1. Enter your Databricks **Workspace URL** (e.g. `dbc-1234567a-cbde`).
2. Enter the **Databricks catalog name** to connect (e.g. `icebench`).
3. Enter the OAuth **Client ID** and **Client secret** for your service principal.
4. Enter a **Database name** for the ClickHouse database that exposes your Unity Catalog tables.
<br/>
</TabItem>
<TabItem value="unity-delta" label="Unity Catalog (Delta)">

Query Unity Catalog [Delta Lake](/engines/table-engines/integrations/deltalake) tables using a Databricks Personal Access Token (PAT). See the [Unity Catalog guide](/use-cases/data-lake/unity-catalog#read-delta) for full setup.

Before you connect, confirm:

- ClickHouse version 25.12+.
- [Unity Catalog is configured for external data access](https://docs.databricks.com/aws/en/external-access/admin).
- Databricks [Personal Access Token](https://docs.databricks.com/aws/en/dev-tools/auth/pat) with at least `EXTERNAL USE SCHEMA`, `USE CATALOG`, `USE SCHEMA`, and `SELECT` on the target tables.

In the flyout:

1. Enter your Databricks **Workspace URL** (e.g. `dbc-1234567a-cbde.azuredatabricks.net`).
2. Enter the **Databricks catalog name** to connect.
3. Enter your **Personal Access Token**.
4. Enter a **Database name** for the ClickHouse database that exposes your Delta tables.

:::note
Iceberg and Delta use different authentication in the UI. This will require two separate ClickHouse databases to access both types of tables.
:::
<br/>
</TabItem>
<TabItem value="rest" label="REST catalog">

Connect to any catalog that implements the [Iceberg REST Catalog](https://github.com/apache/iceberg/blob/main/open-api/rest-catalog-open-api.yaml) specification. See the [REST catalog guide](/use-cases/data-lake/rest-catalog) for full setup.

Before you connect, confirm:

- ClickHouse version 25.12+.
- Your REST catalog endpoint is reachable from ClickHouse Cloud.
- You have OAuth client credentials or a bearer token, depending on your catalog configuration.
- You have an S3 or compatible **Storage Endpoint** URI for table data (e.g. `s3://my-bucket/path`).

In the flyout:

1. Enter the **Catalog URL** (e.g. `https://catalog.example.com/v1`).
2. Enter the **Warehouse** or catalog namespace (e.g. `demo`).
3. Enter the **Storage Endpoint** URI prefix for table storage.
4. Select an **Authentication method**: **OAuth Client Credentials** or **Bearer Token**, then enter the matching credentials.
5. Enter a **Database name** for the ClickHouse database that exposes your REST catalog tables.
<br/>
</TabItem>
<TabItem value="onelake" label="Microsoft OneLake">

Query [Iceberg](/engines/table-engines/integrations/iceberg) tables in Microsoft Fabric OneLake using Azure AD application credentials. See the [Fabric OneLake guide](/use-cases/data-lake/onelake-catalog) for full setup.

Before you connect, confirm:

- ClickHouse version 25.12+.
- Iceberg tables exist in a Fabric workspace.
- You have an Entra ID (Azure AD) application with client ID and secret.
- You have your tenant ID, workspace ID, and a data item ID. Use your **Lakehouse ID** from the Lakehouse page URL. See [Microsoft OneLake prerequisites](https://learn.microsoft.com/en-us/fabric/onelake/table-apis/table-apis-overview#prerequisites) for help locating these values.

In the flyout:

1. Enter your Fabric **Workspace ID**.
2. Enter the **Data Item ID** — use your Lakehouse ID. Warehouse IDs aren't supported.
3. Enter your Entra ID **Tenant ID**, **Application (client) ID**, and **Client secret**.
4. Enter a **Database name** for the ClickHouse database that exposes your OneLake tables.
<br/>
</TabItem>
<TabItem value="polaris" label="Polaris">

Connect to a Snowflake Open Catalog (Polaris) deployment for [Iceberg](/engines/table-engines/integrations/iceberg) tables. See the [Polaris catalog guide](/use-cases/data-lake/polaris-catalog) for full setup.

Before you connect, confirm:

- ClickHouse version 26.2+.
- You have a Polaris catalog with OAuth client credentials.
- You have a storage endpoint URI for Iceberg table data (e.g. `s3://company-iceberg-prod/warehouse/`).

In the flyout:

1. Enter the **Catalog Account Identifier** (e.g. `ab12345.snowflakecomputing.com`).
2. Enter the **Catalog Name** (e.g. `snowflake_open_catalog`).
3. Enter the OAuth **Client ID** and **Client Secret**.
4. Enter the **Storage Endpoint** URI prefix for table storage.
5. Enter a **Database name** for the ClickHouse database that exposes your Polaris tables.
<br/>
</TabItem>
<TabItem value="biglake" label="BigLake Metastore">

Connect to Google Cloud BigLake Metastore (aka Lakehouse runtime catalog) for [Iceberg](/engines/table-engines/integrations/iceberg) tables in GCS. See the [BigLake Metastore guide](/use-cases/data-lake/biglake-catalog) for full setup.

Before you connect, confirm:

- ClickHouse version 26.2+.
- You have a BigLake Metastore instance with Iceberg tables in GCS.
- You have Google Application Default Credentials (ADC) with client ID, client secret, refresh token, and quota project ID.

In the flyout:

1. Enter your **Google ADC Client ID**, **Client Secret**, **Refresh Token**, and **Quota Project ID**.
2. Enter the **Cloud Storage Bucket** URI for table data (e.g. `gs://biglake-public-nyc-taxi-iceberg`).
3. Enter a **Database name** for the ClickHouse database that exposes your BigLake tables.
<br/>
</TabItem>

</Tabs>
<br/>

### Save the connection {#save-connection}

After filling in the fields:

1. Click **Add catalog**. ClickHouse validates the connection and credentials when saving.
2. On success, a confirmation toast appears with a **View in SQL console** link. Your catalog is listed in the **Linked catalogs** table with its connection status and table count.

From the **Actions** menu on a linked catalog row, you can drop the catalog connection. Dropping removes the catalog's database from ClickHouse — it doesn't delete any data in your external catalog.

</VerticalStepper>

## Query your data {#query-data}

<VerticalStepper headerLevel="h3">

### View your catalog tables {#view-tables}

On the **Data sources** page, find your catalog in the **Linked catalogs** table and click **View tables**.

<Image img={linked_catalogs_table} alt="Linked catalogs table with View tables action" size="lg" border/>

ClickHouse opens the SQL console with your catalog database selected and lists the available tables.

:::note
Tables may not appear immediately after you connect a catalog. Depending on the catalog, it can take up to 3 minutes for all tables to be listed.
:::

<Image img={catalog_tables_browser} alt="SQL console table browser showing catalog tables" size="lg" border/>

### Run a query {#run-a-query}

Write a query in the SQL editor and click **Run**. Wrap the full table name in backticks:

```sql
SELECT * FROM `identity_profiles.identity_profiles_iceberg`
```

<Image img={catalog_sql_query} alt="SQL query with results using backticks for dotted table name" size="lg" border/>

</VerticalStepper>

## Troubleshooting {#troubleshooting}

- If you don't see your tables in the SQL console: verify credentials, network access, and table types in the catalog. Make sure the tables you expect to see are in supported file and table formats.

## See also {#see-also}

- [Accelerating analytics on lakehouse data](/use-cases/data-lake/getting-started/accelerating-analytics) — load catalog tables into MergeTree for repeated queries
- [Accessing Iceberg data securely](/cloud/data-sources/secure-iceberg) — IAM role setup for AWS Iceberg and Glue access
