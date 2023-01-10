---
sidebar_label: Rocket BI
sidebar_position: 131
slug: /en/connect-a-ui/rocketbi-and-clickhouse
keywords: [clickhouse, rocketbi, connect, integrate, ui]
description: RocketBI is a self-service business intelligence platform that helps you quickly analyze data, build drag-n-drop visualizations and collaborate with colleagues right on your web browser.
---
import ConnectionDetails from '@site/docs/en/_snippets/_gather_your_details_http.mdx';


# GOAL: BUILD YOUR 1ST DASHBOARD

In this guide, you will install and build a simple dashboard using Rocket.BI .
This is the dashboard:

<img width="800" alt="github_rocketbi2" src={require('./images/rocketbi_01.gif').default}/>

You can checkout [the Dashboard via this link.](https://demo.rocket.bi/dashboard/sales-dashboard-7?token=7eecf750-cbde-4c53-8fa8-8b905fec667e)

## INSTALL

Before we go deeper in create an advance dashboard with Rocket.BI, making sure you have rocket.bi platform on your ClickHouse server and the data is connected & up-to-date. Here are the step by step guide on the configuration:

Follow the guide here: [Rocket.BI Readme](https://github.com/datainsider-co/rocket-bi/blob/main/README.md)


## LET'S BUILD THE DASHBOARD

In Dashboard, you will find your reportings, start visualization by clicking **+New**
You can build **unlimited dashboards** & draw **unlimited charts** in a dashboard.

<img width="800" alt="rocketbi_create_chart" src={require('./images/rocketbi_02.gif').default}/>

See hi-res tutorial on Youtube: [https://www.youtube.com/watch?v=TMkdMHHfvqY](https://www.youtube.com/watch?v=TMkdMHHfvqY)

### Build the Chart Controls

#### Create a Metrics Control
In the Tab filter, select metric fields you want to use. Make sure to keep check on aggregation setting.
<img width="650" alt="rocketbi_chart_6" src={require('./images/rocketbi_03.png').default}/>

Rename filters & Save Control to Dashboard <img width="400" alt="Metrics Control" src={require('./images/rocketbi_04.png').default}/>


#### Create a Date Type Control
Choose a Date field as Main Date column:

<img width="650" alt="rocketbi_chart_4" src={require('./images/rocketbi_05.png').default}/>

Add duplicate variants with different lookup ranges. For example, Year, Monthly, Daily date or Day of Week.

<img width="650" alt="rocketbi_chart_5" src={require('./images/rocketbi_06.png').default}/>

Rename filters & Save Control to Dashboard

<img width="200" alt="Date Range Control" src={require('./images/rocketbi_07.png').default}/>

### Now, let build the Charts

#### Pie Chart: Sales Metrics by Regions
Choose Adding new chart, then Select Pie Chart

<img width="650" alt="Add Pie Chart" src={require('./images/rocketbi_08.png').default}/>

First Drag & Drop the column "Region" from the Dataset to Lengend Field

<img width="650" alt="Drag-n-drop Column to Chart" src={require('./images/rocketbi_09.png').default}/>

Then, change to Chart Control Tab

<img width="650" alt="Navigate to Chart Control in Visualization" src={require('./images/rocketbi_10.png').default}/>

Drag & Drop the Metrics Control into Value Field

<img width="650" alt="Use Metrics Control in Chart" src={require('./images/rocketbi_11.png').default}/>
(you can also use Metrics Control as Sorting)

Navigate to Chart Setting for further customization

<img width="650" alt="Custom the Chart with Setting" src={require('./images/rocketbi_12.png').default}/>

For example, change Data label to Percentage

<img width="650" alt="Chart Customization Example" src={require('./images/rocketbi_13.png').default}/>

Save & Add the Chart to Dashboard

<img width="650" alt="Overview Dashboard with Pie Chart" src={require('./images/rocketbi_14.png').default}/>

#### Use Date Control in a Time-series Chart
Let Use a Stacked Column Chart

<img width="650" alt="Create a Time-series chart with Tab Control" src={require('./images/rocketbi_15.png').default}/>

In Chart Control, use Metrics Control as Y-axis & Date Range as X-axis

<img width="650" alt="Use Date Range as Controller" src={require('./images/rocketbi_16.png').default}/>

Add Region column in to Breakdown

<img width="650" alt="Add Region into Breakdown" src={require('./images/rocketbi_17.png').default}/>

Adding Number Chart as KPIs & glare-up the Dashboard

<img width="800" alt="Screenshot 2022-11-17 at 10 43 29" src={require('./images/rocketbi_18.png').default} />

Now, you had successfully build your 1st dashboard with rocket.BI
