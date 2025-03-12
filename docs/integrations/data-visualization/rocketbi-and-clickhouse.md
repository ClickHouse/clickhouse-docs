---
sidebar_label: 'Rocket BI'
sidebar_position: 131
slug: /integrations/rocketbi
keywords: ['clickhouse', 'RocketBI', 'connect', 'integrate', 'ui']
description: 'RocketBI is a self-service business intelligence platform that helps you quickly analyze data, build drag-n-drop visualizations and collaborate with colleagues right on your web browser.'
title: 'GOAL: BUILD YOUR 1ST DASHBOARD'
---
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import rocketbi_01 from '@site/static/images/integrations/data-visualization/rocketbi_01.gif';
import rocketbi_02 from '@site/static/images/integrations/data-visualization/rocketbi_02.gif';
import rocketbi_03 from '@site/static/images/integrations/data-visualization/rocketbi_03.png';
import rocketbi_04 from '@site/static/images/integrations/data-visualization/rocketbi_04.png';
import rocketbi_05 from '@site/static/images/integrations/data-visualization/rocketbi_05.png';
import rocketbi_06 from '@site/static/images/integrations/data-visualization/rocketbi_06.png';
import rocketbi_07 from '@site/static/images/integrations/data-visualization/rocketbi_07.png';
import rocketbi_08 from '@site/static/images/integrations/data-visualization/rocketbi_08.png';
import rocketbi_09 from '@site/static/images/integrations/data-visualization/rocketbi_09.png';
import rocketbi_10 from '@site/static/images/integrations/data-visualization/rocketbi_10.png';
import rocketbi_11 from '@site/static/images/integrations/data-visualization/rocketbi_11.png';
import rocketbi_12 from '@site/static/images/integrations/data-visualization/rocketbi_12.png';
import rocketbi_13 from '@site/static/images/integrations/data-visualization/rocketbi_13.png';
import rocketbi_14 from '@site/static/images/integrations/data-visualization/rocketbi_14.png';
import rocketbi_15 from '@site/static/images/integrations/data-visualization/rocketbi_15.png';
import rocketbi_16 from '@site/static/images/integrations/data-visualization/rocketbi_16.png';
import rocketbi_17 from '@site/static/images/integrations/data-visualization/rocketbi_17.png';
import rocketbi_18 from '@site/static/images/integrations/data-visualization/rocketbi_18.png';

# GOAL: BUILD YOUR 1ST DASHBOARD

In this guide, you will install and build a simple dashboard using Rocket.BI .
This is the dashboard:

<img width="800" alt="Github RocketBI" src={rocketbi_01}/>
<br/>

You can checkout [the Dashboard via this link.](https://demo.rocket.bi/dashboard/sales-dashboard-7?token=7eecf750-cbde-4c53-8fa8-8b905fec667e)

## INSTALL {#install}

Start RocketBI with our pre-built docker images.

Get docker-compose.yml and configuration file:

```bash
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/docker-compose.yml
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/.clickhouse.env
```
Edit .clickhouse.env, add clickhouse server information.

Start RocketBI by run command: ``` docker-compose up -d . ```

Open browser, go to ```localhost:5050```, login with this account: ```hello@gmail.com/123456```

To build from source or advanced configuration you could check it here [Rocket.BI Readme](https://github.com/datainsider-co/rocket-bi/blob/main/README.md)

## LET'S BUILD THE DASHBOARD {#lets-build-the-dashboard}

In Dashboard, you will find your reportings, start visualization by clicking **+New**

You can build **unlimited dashboards** & draw **unlimited charts** in a dashboard.

<img width="800" alt="RocketBI create chart" src={rocketbi_02}/>
<br/>

See hi-res tutorial on Youtube: [https://www.youtube.com/watch?v=TMkdMHHfvqY](https://www.youtube.com/watch?v=TMkdMHHfvqY)

### Build the Chart Controls {#build-the-chart-controls}

#### Create a Metrics Control {#create-a-metrics-control}
In the Tab filter, select metric fields you want to use. Make sure to keep check on aggregation setting.

<img width="650" alt="RocketBI chart 6" src={rocketbi_03}/>
<br/>

Rename filters & Save Control to Dashboard

<img width="400" alt="Metrics Control" src={rocketbi_04}/>


#### Create a Date Type Control {#create-a-date-type-control}
Choose a Date field as Main Date column:

<img width="650" alt="RocketBI chart 4" src={rocketbi_05}/>
<br/>

Add duplicate variants with different lookup ranges. For example, Year, Monthly, Daily date or Day of Week.

<img width="650" alt="RocketBI chart 5" src={rocketbi_06}/>
<br/>

Rename filters & Save Control to Dashboard

<img width="200" alt="Date Range Control" src={rocketbi_07}/>

### Now, let build the Charts {#now-let-build-the-charts}

#### Pie Chart: Sales Metrics by Regions {#pie-chart-sales-metrics-by-regions}
Choose Adding new chart, then Select Pie Chart

<img width="650" alt="Add Pie Chart" src={rocketbi_08}/>
<br/>

First Drag & Drop the column "Region" from the Dataset to Legend Field

<img width="650" alt="Drag-n-drop Column to Chart" src={rocketbi_09}/>
<br/>

Then, change to Chart Control Tab

<img width="650" alt="Navigate to Chart Control in Visualization" src={rocketbi_10}/>
<br/>

Drag & Drop the Metrics Control into Value Field

<img width="650" alt="Use Metrics Control in Chart" src={rocketbi_11}/>
<br/>

(you can also use Metrics Control as Sorting)

Navigate to Chart Setting for further customization

<img width="650" alt="Custom the Chart with Setting" src={rocketbi_12}/>
<br/>

For example, change Data label to Percentage

<img width="650" alt="Chart Customization Example" src={rocketbi_13}/>
<br/>

Save & Add the Chart to Dashboard

<img width="650" alt="Overview Dashboard with Pie Chart" src={rocketbi_14}/>

#### Use Date Control in a Time-series Chart {#use-date-control-in-a-time-series-chart}
Let Use a Stacked Column Chart

<img width="650" alt="Create a Time-series chart with Tab Control" src={rocketbi_15}/>
<br/>

In Chart Control, use Metrics Control as Y-axis & Date Range as X-axis

<img width="650" alt="Use Date Range as Controller" src={rocketbi_16}/>
<br/>

Add Region column in to Breakdown

<img width="650" alt="Add Region into Breakdown" src={rocketbi_17}/>
<br/>

Adding Number Chart as KPIs & glare-up the Dashboard

<img width="800" alt="Screenshot 2022-11-17 at 10 43 29" src={rocketbi_18} />
<br/>

Now, you had successfully build your 1st dashboard with rocket.BI
