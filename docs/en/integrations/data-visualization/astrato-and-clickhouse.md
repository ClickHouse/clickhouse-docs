---
sidebar_label: Astrato
slug: /en/integrations/astrato
keywords: [ clickhouse, powerbi, connect, integrate, ui, data apps, data viz, embedded analytics, astrato ]
description: Astrato brings true Self-Service BI to Enterprises & Data Businesses by putting analytics in the hands of every user, enabling them to build their own dashboards, reports and data apps, enabling the answering of data questions without IT help. Astrato accelerates adoption, speeds up decision-making, and unifies analytics, embedded analytics, data input, and data apps in one platform. Astrato unites action and analytics in one,  introduce live writeback, interact with ML models, accelerate your analytics with AI – go beyond dashboarding, thanks to Astrato’s pushdown SQL.
---

import ConnectionDetails from '@site/docs/en/_snippets/_gather_your_details_http.mdx';

# Astrato
Astrato uses Pushdown SQL to query ClickHouse Cloud or on-premise deployments directly. This means you can access all of the data you need, powered by the industry-leading performance of ClickHouse.
<br/>
<br/>
<br/>


#  ClickHouse Native Connector

  

##  Connection data required

  

When setting up your data connection, you'll need to know:

- Data connection: Hostname, Port

- Database Credentials: User name, Password

<ConnectionDetails />

## Creating the data connection to ClickHouse

- Select **Data** in the sidebar, and select the **Data Connection** tab 
(or, navigate to this link: https://app.astrato.io/data/sources)
​
- Click on the **New Data Connection** button in the top right side of the screen.
<img  src={require('./images/astrato_1_dataconnection.png').default}  class="image"  alt="Astrato Data Connection"  style={{max-width:'50%',  'background-color':  'transparent'}}/>

<br/>

- Select **ClickHouse**. 
<img  src={require('./images/astrato_2a_clickhouse_connection.png').default}  class="image"  alt="Astrato ClickHouse Data Connection"  style={{max-width:'50%',  'background-color':  'transparent'}}/>
- Complete the required fields in the connection dialogue box 

<img  src={require('./images/astrato_2b_clickhouse_connection.png').default}  class="image"  alt="Astrato connect to ClickHouse required fields"  style={{width:'50%',  'background-color':  'transparent'}}/>

- Click **Test Connection**.
    
- If the connection is successful, give the data connection a **name** and click **Next.**

- Set the **user access** to the data connection and click **connect.**  
​
<img  src={require('./images/astrato_2b_clickhouse_connection.png').default}  class="image"  alt="Astrato connect to ClickHouse User Access"  style={{width:'50%',  'background-color':  'transparent'}}/>

-   A connection is created and a dataview is created.
    

ℹ️  **Please note**: if a duplicate is created, a timestamp is added to the data source name.