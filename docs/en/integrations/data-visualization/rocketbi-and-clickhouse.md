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

<img width="800" alt="github_rocketbi2" src="https://user-images.githubusercontent.com/91059979/194797668-65eabfb2-9bfb-447f-be24-846b8c797829.gif"/>

You can checkout [the Dashboard via this link.](https://demo.rocket.bi/dashboard/sales-dashboard-7?token=7eecf750-cbde-4c53-8fa8-8b905fec667e)

## INSTALL

Before we go deeper in create an advance dashboard with Rocket.BI, making sure you have rocket.bi platform on your ClickHouse server and the data is connected & up-to-date. Here are the step by step guide on the configuration:

Follow the guide here: [Rocket.BI Readme](https://github.com/datainsider-co/rocket-bi/blob/main/README.md)


## LET'S BUILD THE DASHBOARD

In Dashboard, you will find your reportings, start visualization by clicking **+New**
You can build **unlimited dashboards** & draw **unlimited charts** in a dashboard.

<img width="800" alt="rocketbi_create_chart" src="https://user-images.githubusercontent.com/91059979/194799689-3ad88958-b7a8-4b3f-a98d-7af8b198d684.gif"/>
See hi-res tutorial on Youtube: https://www.youtube.com/watch?v=TMkdMHHfvqY

### Build the Chart Controls

#### Create a Metrics Control
In the Tab filter, select metric fields you want to use. Make sure to keep check on aggregation setting.
<img width="650" alt="rocketbi_chart_6" src="https://user-images.githubusercontent.com/91059979/194493404-dd6199bc-2faf-4a73-b72e-a6370dc490f8.png"/>

Rename filters & Save Control to Dashboard <img width="400" alt="Metrics Control" src="https://user-images.githubusercontent.com/91059979/194493738-c085fa53-173b-495a-b654-bffcd092b2e6.png"/>


#### Create a Date Type Control
Choose a Date field as Main Date column:

<img width="650" alt="rocketbi_chart_4" src="https://user-images.githubusercontent.com/91059979/194491853-dfde6481-3700-4636-9986-a35225b71bb0.png"/>

Add duplicate variants with different lookup ranges. For example, Year, Monthly, Daily date or Day of Week.

<img width="650" alt="rocketbi_chart_5" src="https://user-images.githubusercontent.com/91059979/194492541-f912b16a-9eb0-43fd-a905-2ce42d97e995.png"/>

Rename filters & Save Control to Dashboard

<img width="200" alt="Date Range Control" src="https://user-images.githubusercontent.com/91059979/194494006-2285e434-3e5b-4160-9886-bc1d1e9980a7.png"/>

### Now, let build the Charts

#### Pie Chart: Sales Metrics by Regions
Choose Adding new chart, then Select Pie Chart

<img width="650" alt="Add Pie Chart" src="https://user-images.githubusercontent.com/91059979/202346566-eb69720c-b710-4437-b8b3-89e14a5fbd9d.png"/>

First Drag & Drop the column "Region" from the Dataset to Lengend Field

<img width="650" alt="Drag-n-drop Column to Chart" src="https://user-images.githubusercontent.com/91059979/202346817-5f43db23-cd73-44e2-a2a4-af0e5e4cbf3d.png"/>

Then, change to Chart Control Tab

<img width="650" alt="Navigate to Chart Control in Visualization" src="https://user-images.githubusercontent.com/91059979/202347957-f47d80d5-db6a-4cd8-b514-60a393a5c731.png"/>

Drag & Drop the Metrics Control into Value Field

<img width="650" alt="Use Metrics Control in Chart" src="https://user-images.githubusercontent.com/91059979/202347973-b0101096-6b97-48cd-ab07-0f57ed2179d1.png"/>
(you can also use Metrics Control as Sorting)

Navigate to Chart Setting for further customization

<img width="650" alt="Custom the Chart with Setting" src="https://user-images.githubusercontent.com/91059979/202348309-48500bf3-f612-40a0-a0ca-7ba16aeac045.png"/>

For example, change Data label to Percentage

<img width="650" alt="Chart Customization Example" src="https://user-images.githubusercontent.com/91059979/202348469-2d29fe24-b5f7-4a92-9241-509d009fded7.png"/>

Save & Add the Chart to Dashboard

<img width="650" alt="Overview Dashboard with Pie Chart" src="https://user-images.githubusercontent.com/91059979/202348778-0b4b1341-d247-496f-a351-e947c819c660.png"/>

#### Use Date Control in a Time-series Chart
Let Use a Stacked Column Chart

<img width="650" alt="Create a Time-series chart with Tab Control" src="https://user-images.githubusercontent.com/91059979/202349323-dcbded82-7e11-46b5-a788-3861a0630cbd.png"/>

In Chart Control, use Metrics Control as Y-axis & Date Range as X-axis

<img width="650" alt="Use Date Range as Controller" src="https://user-images.githubusercontent.com/91059979/202349314-3d95a9e3-1a4e-4876-b6a4-49037a757fc8.png"/>

Add Region column in to Breakdown

<img width="650" alt="Add Region into Breakdown" src="https://user-images.githubusercontent.com/91059979/202349642-8ff91798-a738-491c-9af4-fb75d2df5a5f.png"/>

Adding Number Chart as KPIs & glare-up the Dashboard

<img width="800" alt="Screenshot 2022-11-17 at 10 43 29" src="https://user-images.githubusercontent.com/91059979/202349738-e6e94ce0-d1da-4a7b-8223-6c4e9ea6cf53.png" />

Now, you had successfully build your 1st dashboard with rocket.BI
