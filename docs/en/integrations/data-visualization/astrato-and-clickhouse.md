---
sidebar_label: Astrato
sidebar_position: 131
slug: /en/integrations/astrato
keywords: [ clickhouse, Power BI, connect, integrate, ui, data apps, data viz, embedded analytics, Astrato]
description: Astrato brings true Self-Service BI to Enterprises & Data Businesses by putting analytics in the hands of every user, enabling them to build their own dashboards, reports and data apps, enabling the answering of data questions without IT help. Astrato accelerates adoption, speeds up decision-making, and unifies analytics, embedded analytics, data input, and data apps in one platform. Astrato unites action and analytics in one,  introduce live write-back, interact with ML models, accelerate your analytics with AI – go beyond dashboarding, thanks to pushdown SQL support in Astrato.
---

import ConnectionDetails from '@site/docs/en/_snippets/_gather_your_details_http.mdx';

# Connecting Astrato to ClickHouse

Astrato uses Pushdown SQL to query ClickHouse Cloud or on-premise deployments directly. This means you can access all of the data you need, powered by the industry-leading performance of ClickHouse.

## Connection data required

When setting up your data connection, you'll need to know:

- Data connection: Hostname, Port

- Database Credentials: Username, Password

<ConnectionDetails />

## Creating the data connection to ClickHouse

- Select **Data** in the sidebar, and select the **Data Connection** tab 
(or, navigate to this link: https://app.astrato.io/data/sources)
​
- Click on the **New Data Connection** button in the top right side of the screen.

<img  src={require('./images/astrato_1_dataconnection.png').default}  class="image"  alt="Astrato Data Connection"  style={{width:'50%',  'background-color':  'transparent'}}/>

<br/>

- Select **ClickHouse**. 
<img  src={require('./images/astrato_2a_clickhouse_connection.png').default}  class="image"  alt="Astrato ClickHouse Data Connection"  style={{width:'50%',  'background-color':  'transparent'}}/>

- Complete the required fields in the connection dialogue box 

<img  src={require('./images/astrato_2b_clickhouse_connection.png').default}  class="image"  alt="Astrato connect to ClickHouse required fields"  style={{width:'50%',  'background-color':  'transparent'}}/>

- Click **Test Connection**. If the connection is successful, give the data connection a **name** and click **Next.**

- Set the **user access** to the data connection and click **connect.**  
​
<img  src={require('./images/astrato_3_user_access.png').default}  class="image"  alt="Astrato connect to ClickHouse User Access"  style={{width:'50%',  'background-color':  'transparent'}}/>

-   A connection is created and a dataview is created.

:::note
if a duplicate is created, a timestamp is added to the data source name.
:::

## Creating a semantic model / data view

In our Data View editor, you will see all of your Tables and Schemas in ClickHouse, select some to get started.

<img  src={require('./images/astrato_4a_clickhouse_data_view.png').default}  class="image"  alt="Astrato connect to ClickHouse User Access"  style={{width:'75%',  'background-color':  'transparent'}}/>
<br/>

Now that you have your data selected, go to define the **data view**. Click define on the top right of the webpage.

In here, you are able to join data, as well as, **create governed dimensions and measures** - ideal for driving consistency in business logic across various teams. 

<img  src={require('./images/astrato_4b_clickhouse_data_view_joins.png').default}  class="image"  alt="Astrato connect to ClickHouse User Access"  style={{width:'75%',  'background-color':  'transparent'}}/>
<br/>

**Astrato intelligently suggests joins** using your meta data, including leveraging the keys in ClickHouse. Our suggested joins make it easy for you to gets started, working from your well-governed ClickHouse data, without reinventing the wheel. We also show you **join quality** so that you have the option to review all suggestions, in detail, from Astrato.
<br/>
<img  src={require('./images/astrato_4c_clickhouse_completed_data_view.png').default}  class="image"  alt="Astrato connect to ClickHouse User Access"  style={{width:'75%',  'background-color':  'transparent'}}/><br/>

## Creating a dashboard

In just a few steps, you can build your first chart in Astrato.
1. Open visuals panel
2. Select a visual (lets start with Column Bar Chart)
3. Add dimension(s)
4. Add measure(s)

<img  src={require('./images/astrato_5a_clickhouse_build_chart.png').default}  class="image"  alt="Astrato connect to ClickHouse User Access"  style={{width:'75%',  'background-color':  'transparent'}}/><br/>


### View generated SQL supporting each visualization

Transparency and accuracy are at the heart of Astrato. We ensure that every query generated is visible, letting you keep full control. All compute happens directly in ClickHouse, taking advantage of its speed while maintaining robust security and governance.

<img  src={require('./images/astrato_5b_clickhouse_view_sql.png').default}  class="image"  alt="Astrato connect to ClickHouse User Access"  style={{width:'75%',  'background-color':  'transparent'}}/><br/>


### Example completed dashboard

A beautiful complete dashboard or data app isn't far away now. To see more of what we've built, head to our demo gallery on our website. https://astrato.io/gallery

<img  src={require('./images/astrato_5c_clickhouse_complete_dashboard.png').default}  class="image"  alt="Astrato connect to ClickHouse User Access"  style={{width:'75%',  'background-color':  'transparent'}}/>
