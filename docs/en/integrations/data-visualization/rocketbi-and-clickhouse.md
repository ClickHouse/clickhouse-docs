---
sidebar_label: Rocket BI
sidebar_position: 131
slug: /en/integrations/rocketbi
keywords: [clickhouse, rocketbi, connect, integrate, ui]
description: RocketBI is a self-service business intelligence platform that helps you quickly analyze data, build drag-n-drop visualizations and collaborate with colleagues right on your web browser.
---
import ConnectionDetails from '@site/docs/en/_snippets/_gather_your_details_http.mdx';


# GOAL: BUILD YOUR 1ST DASHBOARD

In this guide, you will install and build a simple dashboard using Rocket.BI .
This is the dashboard:

<img width="800" alt="github_rocketbi2" src={require('./images/rocketbi_01.gif').default}/>
<br/>

You can checkout [the Dashboard via this link.](https://demo.rocket.bi/dashboard/sales-dashboard-7?token=7eecf750-cbde-4c53-8fa8-8b905fec667e)

## INSTALL

Start RocketBI with our pre-built docker images.

Get docker-compose.yml and configuration file:
```
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/docker-compose.yml
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/.clickhouse.env
```
Edit .clickhouse.env, add clickhouse server information.

Start RocketBI by run command: ``` docker-compose up -d . ```

Open browser, go to ```localhost:5050```, login with this account: ```hello@gmail.com/123456```

To build from source or advanced configuration you could check it here [Rocket.BI Readme](https://github.com/datainsider-co/rocket-bi/blob/main/README.md)

## LET'S BUILD THE DASHBOARD

In Dashboard, you will find your reportings, start visualization by clicking **+New**
You can build **unlimited dashboards** & draw **unlimited charts** in a dashboard.

<img width="800" alt="rocketbi_create_chart" src={require('./images/rocketbi_02.gif').default}/>
<br/>

See hi-res tutorial on Youtube: [https://www.youtube.com/watch?v=TMkdMHHfvqY](https://www.youtube.com/watch?v=TMkdMHHfvqY)

### Build the Chart Controls

#### Create a Metrics Control
In the Tab filter, select metric fields you want to use. Make sure to keep check on aggregation setting.

<img width="650" alt="rocketbi_chart_6" src={require('./images/rocketbi_03.png').default}/>
<br/>

Rename filters & Save Control to Dashboard

<img width="400" alt="Metrics Control" src={require('./images/rocketbi_04.png').default}/>


#### Create a Date Type Control
Choose a Date field as Main Date column:

<img width="650" alt="rocketbi_chart_4" src={require('./images/rocketbi_05.png').default}/>
<br/>

Add duplicate variants with different lookup ranges. For example, Year, Monthly, Daily date or Day of Week.

<img width="650" alt="rocketbi_chart_5" src={require('./images/rocketbi_06.png').default}/>
<br/>

Rename filters & Save Control to Dashboard

<img width="200" alt="Date Range Control" src={require('./images/rocketbi_07.png').default}/>

### Now, let build the Charts

#### Pie Chart: Sales Metrics by Regions
Choose Adding new chart, then Select Pie Chart

<img width="650" alt="Add Pie Chart" src={require('./images/rocketbi_08.png').default}/>
<br/>

First Drag & Drop the column "Region" from the Dataset to Lengend Field

<img width="650" alt="Drag-n-drop Column to Chart" src={require('./images/rocketbi_09.png').default}/>
<br/>

Then, change to Chart Control Tab

<img width="650" alt="Navigate to Chart Control in Visualization" src={require('./images/rocketbi_10.png').default}/>
<br/>

Drag & Drop the Metrics Control into Value Field

<img width="650" alt="Use Metrics Control in Chart" src={require('./images/rocketbi_11.png').default}/>
<br/>

(you can also use Metrics Control as Sorting)

Navigate to Chart Setting for further customization

<img width="650" alt="Custom the Chart with Setting" src={require('./images/rocketbi_12.png').default}/>
<br/>

For example, change Data label to Percentage

<img width="650" alt="Chart Customization Example" src={require('./images/rocketbi_13.png').default}/>
<br/>

Save & Add the Chart to Dashboard

<img width="650" alt="Overview Dashboard with Pie Chart" src={require('./images/rocketbi_14.png').default}/>

#### Use Date Control in a Time-series Chart
Let Use a Stacked Column Chart

<img width="650" alt="Create a Time-series chart with Tab Control" src={require('./images/rocketbi_15.png').default}/>
<br/>

In Chart Control, use Metrics Control as Y-axis & Date Range as X-axis

<img width="650" alt="Use Date Range as Controller" src={require('./images/rocketbi_16.png').default}/>
<br/>

Add Region column in to Breakdown

<img width="650" alt="Add Region into Breakdown" src={require('./images/rocketbi_17.png').default}/>
<br/>

Adding Number Chart as KPIs & glare-up the Dashboard

<img width="800" alt="Screenshot 2022-11-17 at 10 43 29" src={require('./images/rocketbi_18.png').default} />
<br/>

Now, you had successfully build your 1st dashboard with rocket.BI
