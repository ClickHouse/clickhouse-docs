---
sidebar_label: 'Astrato'
sidebar_position: 131
slug: /integrations/astrato
keywords: ['clickhouse', 'Power BI', 'connect', 'integrate', 'ui', 'data apps', 'data viz', 'embedded analytics', 'Astrato']
description: 'Astrato brings true Self-Service BI to Enterprises & Data Businesses by putting analytics in the hands of every user, enabling them to build their own dashboards, reports and data apps, enabling the answering of data questions without IT help. Astrato accelerates adoption, speeds up decision-making, and unifies analytics, embedded analytics, data input, and data apps in one platform. Astrato unites action and analytics in one,  introduce live write-back, interact with ML models, accelerate your analytics with AI – go beyond dashboarding, thanks to pushdown SQL support in Astrato.'
title: 'Connecting Astrato to ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_visualization'
---

import astrato_1_dataconnection from '@site/static/images/integrations/data-visualization/astrato_1_dataconnection.png';
import astrato_2a_clickhouse_connection from '@site/static/images/integrations/data-visualization/astrato_2a_clickhouse_connection.png';
import astrato_2b_clickhouse_connection from '@site/static/images/integrations/data-visualization/astrato_2b_clickhouse_connection.png';
import astrato_3_user_access from '@site/static/images/integrations/data-visualization/astrato_3_user_access.png';
import astrato_4a_clickhouse_data_view from '@site/static/images/integrations/data-visualization/astrato_4a_clickhouse_data_view.png';
import astrato_4b_clickhouse_data_view_joins from '@site/static/images/integrations/data-visualization/astrato_4b_clickhouse_data_view_joins.png';
import astrato_4c_clickhouse_completed_data_view from '@site/static/images/integrations/data-visualization/astrato_4c_clickhouse_completed_data_view.png';
import astrato_5a_clickhouse_build_chart from '@site/static/images/integrations/data-visualization/astrato_5a_clickhouse_build_chart.png';
import astrato_5b_clickhouse_view_sql from '@site/static/images/integrations/data-visualization/astrato_5b_clickhouse_view_sql.png';
import astrato_5c_clickhouse_complete_dashboard from '@site/static/images/integrations/data-visualization/astrato_5c_clickhouse_complete_dashboard.png';
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# Connecting Astrato to ClickHouse

<CommunityMaintainedBadge/>

Astrato uses Pushdown SQL to query ClickHouse Cloud or on-premise deployments directly. This means you can access all of the data you need, powered by the industry-leading performance of ClickHouse.

## Connection data required {#connection-data-required}

When setting up your data connection, you'll need to know:

- Data connection: Hostname, Port

- Database Credentials: Username, Password

<ConnectionDetails />

## Creating the data connection to ClickHouse {#creating-the-data-connection-to-clickhouse}

- Select **Data** in the sidebar, and select the **Data Connection** tab
(or, navigate to this link: https://app.astrato.io/data/sources)
​
- Click on the **New Data Connection** button in the top right side of the screen.

<Image size="sm" img={astrato_1_dataconnection} alt="Astrato Data Connection" border />

- Select **ClickHouse**.

<Image size="sm" img={astrato_2a_clickhouse_connection} alt="Astrato ClickHouse Data Connection" border />

- Complete the required fields in the connection dialogue box

<Image size="sm" img={astrato_2b_clickhouse_connection} alt="Astrato connect to ClickHouse required fields" border />

- Click **Test Connection**. If the connection is successful, give the data connection a **name** and click **Next.**

- Set the **user access** to the data connection and click **connect.**

<Image size="md" img={astrato_3_user_access} alt="Astrato connect to ClickHouse User Access" border />

-   A connection is created and a dataview is created.

:::note
if a duplicate is created, a timestamp is added to the data source name.
:::

## Creating a semantic model / data view {#creating-a-semantic-model--data-view}

In our Data View editor, you will see all of your Tables and Schemas in ClickHouse, select some to get started.

<Image size="lg" img={astrato_4a_clickhouse_data_view} alt="Astrato connect to ClickHouse User Access" border />

Now that you have your data selected, go to define the **data view**. Click define on the top right of the webpage.

In here, you are able to join data, as well as, **create governed dimensions and measures** - ideal for driving consistency in business logic across various teams.

<Image size="lg" img={astrato_4b_clickhouse_data_view_joins} alt="Astrato connect to ClickHouse User Access" border />

**Astrato intelligently suggests joins** using your meta data, including leveraging the keys in ClickHouse. Our suggested joins make it easy for you to gets started, working from your well-governed ClickHouse data, without reinventing the wheel. We also show you **join quality** so that you have the option to review all suggestions, in detail, from Astrato.

<Image size="lg" img={astrato_4c_clickhouse_completed_data_view} alt="Astrato connect to ClickHouse User Access" border />

## Creating a dashboard {#creating-a-dashboard}

In just a few steps, you can build your first chart in Astrato.
1. Open visuals panel
2. Select a visual (lets start with Column Bar Chart)
3. Add dimension(s)
4. Add measure(s)

<Image size="lg" img={astrato_5a_clickhouse_build_chart} alt="Astrato connect to ClickHouse User Access" border />

### View generated SQL supporting each visualization {#view-generated-sql-supporting-each-visualization}

Transparency and accuracy are at the heart of Astrato. We ensure that every query generated is visible, letting you keep full control. All compute happens directly in ClickHouse, taking advantage of its speed while maintaining robust security and governance.

<Image size="lg" img={astrato_5b_clickhouse_view_sql} alt="Astrato connect to ClickHouse User Access" border />

### Example completed dashboard {#example-completed-dashboard}

A beautiful complete dashboard or data app isn't far away now. To see more of what we've built, head to our demo gallery on our website. https://astrato.io/gallery

<Image size="lg" img={astrato_5c_clickhouse_complete_dashboard} alt="Astrato connect to ClickHouse User Access" border />
