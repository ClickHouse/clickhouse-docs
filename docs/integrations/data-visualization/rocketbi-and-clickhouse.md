---
sidebar_label: 'Rocket BI'
sidebar_position: 131
slug: /integrations/rocketbi
keywords: ['clickhouse', 'RocketBI', 'connect', 'integrate', 'ui']
description: 'RocketBI is a self-service business intelligence platform that helps you quickly analyze data, build drag-n-drop visualizations and collaborate with colleagues right on your web browser.'
title: 'GOAL: BUILD YOUR 1ST DASHBOARD'
doc_type: 'explanation'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
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
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# Goal: build your first dashboard

<CommunityMaintainedBadge/>

In this guide, you will install and build a simple dashboard using Rocket.BI .
This is the dashboard:

<Image size="md" img={rocketbi_01} alt="Rocket BI dashboard showing sales metrics with charts and KPIs" border />
<br/>

You can checkout [the Dashboard via this link.](https://demo.rocket.bi/dashboard/sales-dashboard-7?token=7eecf750-cbde-4c53-8fa8-8b905fec667e)

## Install {#install}

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

## Let's build the dashboard {#lets-build-the-dashboard}

In Dashboard, you will find your reportings, start visualization by clicking **+New**

You can build **unlimited dashboards** & draw **unlimited charts** in a dashboard.

<Image size="md" img={rocketbi_02} alt="Animation showing the process of creating a new chart in Rocket BI" border />
<br/>

See hi-res tutorial on Youtube: [https://www.youtube.com/watch?v=TMkdMHHfvqY](https://www.youtube.com/watch?v=TMkdMHHfvqY)

### Build the chart controls {#build-the-chart-controls}

#### Create a metrics control {#create-a-metrics-control}
In the Tab filter, select metric fields you want to use. Make sure to keep check on aggregation setting.

<Image size="md" img={rocketbi_03} alt="Rocket BI metrics control configuration panel showing selected fields and aggregation settings" border />
<br/>

Rename filters & Save Control to Dashboard

<Image size="md" img={rocketbi_04} alt="Metrics control with renamed filters ready to save to dashboard" border />

#### Create a date type control {#create-a-date-type-control}
Choose a Date field as Main Date column:

<Image size="md" img={rocketbi_05} alt="Date field selection interface in Rocket BI showing available date columns" border />
<br/>

Add duplicate variants with different lookup ranges. For example, Year, Monthly, Daily date or Day of Week.

<Image size="md" img={rocketbi_06} alt="Date range configuration showing different time period options like year, month, and day" border />
<br/>

Rename filters & Save Control to Dashboard

<Image size="md" img={rocketbi_07} alt="Date range control with renamed filters ready to save to dashboard" border />

### Now, let build the Charts {#now-let-build-the-charts}

#### Pie chart: sales metrics by regions {#pie-chart-sales-metrics-by-regions}
Choose Adding new chart, then Select Pie Chart

<Image size="md" img={rocketbi_08} alt="Chart type selection panel with pie chart option highlighted" border />
<br/>

First Drag & Drop the column "Region" from the Dataset to Legend Field

<Image size="md" img={rocketbi_09} alt="Drag and drop interface showing Region column being added to legend field" border />
<br/>

Then, change to Chart Control Tab

<Image size="md" img={rocketbi_10} alt="Chart control tab interface showing visualization configuration options" border />
<br/>

Drag & Drop the Metrics Control into Value Field

<Image size="md" img={rocketbi_11} alt="Metrics control being added to the value field of the pie chart" border />
<br/>

(you can also use Metrics Control as Sorting)

Navigate to Chart Setting for further customization

<Image size="md" img={rocketbi_12} alt="Chart settings panel showing customization options for the pie chart" border />
<br/>

For example, change Data label to Percentage

<Image size="md" img={rocketbi_13} alt="Data label settings being changed to show percentages on the pie chart" border />
<br/>

Save & Add the Chart to Dashboard

<Image size="md" img={rocketbi_14} alt="Dashboard view showing the newly added pie chart with other controls" border />

#### Use date control in a time-series chart {#use-date-control-in-a-time-series-chart}
Let Use a Stacked Column Chart

<Image size="md" img={rocketbi_15} alt="Stacked column chart creation interface with time-series data" border />
<br/>

In Chart Control, use Metrics Control as Y-axis & Date Range as X-axis

<Image size="md" img={rocketbi_16} alt="Chart control configuration showing metrics on Y-axis and date range on X-axis" border />
<br/>

Add Region column in to Breakdown

<Image size="md" img={rocketbi_17} alt="Region column being added as breakdown dimension in the stacked column chart" border />
<br/>

Adding Number Chart as KPIs & glare-up the Dashboard

<Image size="md" img={rocketbi_18} alt="Complete dashboard with KPI number charts, pie chart, and time-series visualization" border />
<br/>

Now, you had successfully build your 1st dashboard with rocket.BI
