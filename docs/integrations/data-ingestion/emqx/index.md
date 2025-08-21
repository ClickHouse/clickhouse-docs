---
sidebar_label: 'EMQX'
sidebar_position: 1
slug: /integrations/emqx
description: 'Introduction to EMQX with ClickHouse'
title: 'Integrating EMQX with ClickHouse'
doc_type: overview
---

import emqx_cloud_artitecture from '@site/static/images/integrations/data-ingestion/emqx/emqx-cloud-artitecture.png';
import clickhouse_cloud_1 from '@site/static/images/integrations/data-ingestion/emqx/clickhouse_cloud_1.png';
import clickhouse_cloud_2 from '@site/static/images/integrations/data-ingestion/emqx/clickhouse_cloud_2.png';
import clickhouse_cloud_3 from '@site/static/images/integrations/data-ingestion/emqx/clickhouse_cloud_3.png';
import clickhouse_cloud_4 from '@site/static/images/integrations/data-ingestion/emqx/clickhouse_cloud_4.png';
import clickhouse_cloud_5 from '@site/static/images/integrations/data-ingestion/emqx/clickhouse_cloud_5.png';
import clickhouse_cloud_6 from '@site/static/images/integrations/data-ingestion/emqx/clickhouse_cloud_6.png';
import emqx_cloud_sign_up from '@site/static/images/integrations/data-ingestion/emqx/emqx_cloud_sign_up.png';
import emqx_cloud_create_1 from '@site/static/images/integrations/data-ingestion/emqx/emqx_cloud_create_1.png';
import emqx_cloud_create_2 from '@site/static/images/integrations/data-ingestion/emqx/emqx_cloud_create_2.png';
import emqx_cloud_overview from '@site/static/images/integrations/data-ingestion/emqx/emqx_cloud_overview.png';
import emqx_cloud_auth from '@site/static/images/integrations/data-ingestion/emqx/emqx_cloud_auth.png';
import emqx_cloud_nat_gateway from '@site/static/images/integrations/data-ingestion/emqx/emqx_cloud_nat_gateway.png';
import emqx_cloud_data_integration from '@site/static/images/integrations/data-ingestion/emqx/emqx_cloud_data_integration.png';
import data_integration_clickhouse from '@site/static/images/integrations/data-ingestion/emqx/data_integration_clickhouse.png';
import data_integration_resource from '@site/static/images/integrations/data-ingestion/emqx/data_integration_resource.png';
import data_integration_rule_1 from '@site/static/images/integrations/data-ingestion/emqx/data_integration_rule_1.png';
import data_integration_rule_2 from '@site/static/images/integrations/data-ingestion/emqx/data_integration_rule_2.png';
import data_integration_rule_action from '@site/static/images/integrations/data-ingestion/emqx/data_integration_rule_action.png';
import data_integration_details from '@site/static/images/integrations/data-ingestion/emqx/data_integration_details.png';
import work_flow from '@site/static/images/integrations/data-ingestion/emqx/work-flow.png';
import mqttx_overview from '@site/static/images/integrations/data-ingestion/emqx/mqttx-overview.png';
import mqttx_new from '@site/static/images/integrations/data-ingestion/emqx/mqttx-new.png';
import mqttx_publish from '@site/static/images/integrations/data-ingestion/emqx/mqttx-publish.png';
import rule_monitor from '@site/static/images/integrations/data-ingestion/emqx/rule_monitor.png';
import clickhouse_result from '@site/static/images/integrations/data-ingestion/emqx/clickhouse_result.png';
import Image from '@theme/IdealImage';

# Integrating EMQX with ClickHouse

## Connecting EMQX {#connecting-emqx}

[EMQX](https://www.emqx.com/en/try?product=enterprise) is an open source MQTT broker with a high-performance real-time message processing engine, powering event streaming for IoT devices at massive scale. As the most scalable MQTT broker, EMQX can help you connect any device, at any scale. Move and process your IoT data anywhere.

[EMQX Cloud](https://www.emqx.com/en/try?product=cloud) is an MQTT messaging middleware product for the IoT domain hosted by [EMQ](https://www.emqx.com/en). As the world's first fully managed MQTT 5.0 cloud messaging service, EMQX Cloud provides a one-stop O&M colocation and a unique isolated environment for MQTT messaging services. In the era of the Internet of Everything, EMQX Cloud can help you quickly build industry applications for the IoT domain and easily collect, transmit, compute, and persist IoT data.

With the infrastructure provided by cloud providers, EMQX Cloud serves dozens of countries and regions around the world, providing low-cost, secure, and reliable cloud services for 5G and Internet of Everything applications.

<Image img={emqx_cloud_artitecture} size="lg" border alt="EMQX Cloud Architecture diagram showing cloud infrastructure components" />

### Assumptions {#assumptions}

* You are familiar with the [MQTT protocol](https://mqtt.org/), which is designed as an extremely lightweight publish/subscribe messaging transport protocol.
* You are using EMQX or EMQX Cloud for real-time message processing engine, powering event streaming for IoT devices at massive scale.
* You have prepared a Clickhouse Cloud instance to persist device data.
* We are using [MQTT X](https://mqttx.app/)  as an MQTT client testing tool to connect the deployment of EMQX Cloud to publish MQTT data. Or other methods connecting to the MQTT broker will do the job as well.

## Get your ClickHouse Cloud service {#get-your-clickhouse-cloudservice}

During this setup, we deployed the ClickHouse instance on AWS in N. Virginia (us-east -1), while an EMQX Cloud instance was also deployed in the same region.

<Image img={clickhouse_cloud_1} size="sm" border alt="ClickHouse Cloud Service Deployment interface showing AWS region selection" />

During the setup process, you will also need to pay attention to the connection settings. In this tutorial, we choose "Anywhere", but if you apply for a specific location, you will need to add the [NAT gateway](https://docs.emqx.com/en/cloud/latest/vas/nat-gateway.html) IP address you got from your EMQX Cloud deployment to the whitelist.

<Image img={clickhouse_cloud_2} size="sm" border alt="ClickHouse Cloud Connection Settings showing IP access configuration" />

Then you need to save your username and password for future use.

<Image img={clickhouse_cloud_3} size="sm" border alt="ClickHouse Cloud Credentials screen showing username and password" />

After that, you will get a running Click house instance. Click "Connect" to get the instance connection address of Clickhouse Cloud.

<Image img={clickhouse_cloud_4} size="lg" border alt="ClickHouse Cloud Running Instance dashboard with connection options" />

Click "Connect to SQL Console" to create database and table for integration with EMQX Cloud.

<Image img={clickhouse_cloud_5} size="lg" border alt="ClickHouse Cloud SQL Console interface" />

You can refer to the following SQL statement, or modify the SQL according to the actual situation.

```sql
CREATE TABLE emqx.temp_hum
(
   client_id String,
   timestamp DateTime,
   topic String,
   temp Float32,
   hum Float32
)
ENGINE = MergeTree()
PRIMARY KEY (client_id, timestamp)
```

<Image img={clickhouse_cloud_6} size="lg" border alt="ClickHouse Cloud Create Database and Table SQL query execution" />

## Create an MQTT service on EMQX Cloud {#create-an-mqtt-service-on-emqx-cloud}

Creating a dedicated MQTT broker on EMQX Cloud is as easy as a few clicks.

### Get an account {#get-an-account}

EMQX Cloud provides a 14-day free trial for both standard deployment and professional deployment for every account.

Start at the [EMQX Cloud sign up](https://accounts.emqx.com/signup?continue=https%3A%2F%2Fwww.emqx.com%2Fen%2Fcloud) page and click start free to register an account if you are new to EMQX Cloud.

<Image img={emqx_cloud_sign_up} size="lg" border alt="EMQX Cloud Signup Page with registration form" />

### Create an MQTT cluster {#create-an-mqtt-cluster}

Once logged in, click on "Cloud console" under the account menu and you will be able to see the green button to create a new deployment.

<Image img={emqx_cloud_create_1} size="lg" border alt="EMQX Cloud Create Deployment Step 1 showing deployment options" />

In this tutorial, we will use the Professional deployment because only Pro version provides the data integration functionality, which can send MQTT data directly to ClickHouse without a single line of code.

Select Pro version and choose `N.Virginial` region and click `Create Now`. In just a few minutes, you will get a fully managed MQTT broker:

<Image img={emqx_cloud_create_2} size="lg" border alt="EMQX Cloud Create Deployment Step 2 showing region selection" />

Now click the panel to go to the cluster view. On this dashboard, you will see the overview of your MQTT broker.

<Image img={emqx_cloud_overview} size="lg" border alt="EMQX Cloud Overview Dashboard showing broker metrics" />

### Add client credential {#add-client-credential}

EMQX Cloud does not allow anonymous connections by default，so you need add a client credential so you can use the MQTT client tool to send data to this broker.

Click 'Authentication & ACL' on the left menu and click 'Authentication' in the submenu. Click the 'Add' button on the right and give a username and password for the MQTT connection later. Here we will use `emqx` and `xxxxxx` for the username and password.

<Image img={emqx_cloud_auth} size="lg" border alt="EMQX Cloud Authentication Setup interface for adding credentials" />

Click 'Confirm' and now we have a fully managed MQTT broker ready.

### Enable NAT gateway {#enable-nat-gateway}

Before we can start setting up the ClickHouse integration, we need to enable the NAT gateway first. By default, the MQTT broker is deployed in a private VPC, which can not send data to third-party systems over the public network.

Go back to the Overview page and scroll down to the bottom of the page where you will see the NAT gateway widget. Click the Subscribe button and follow the instructions. Note that NAT Gateway is a value-added service, but it also offers a 14-day free trial.

<Image img={emqx_cloud_nat_gateway} size="lg" border alt="EMQX Cloud NAT Gateway Configuration panel" />

Once it has been created, you will find the public IP address in the widget. Please note that if you select "Connect from a specific location" during ClickHouse Cloud setup, you will need to add this IP address to the whitelist.

## Integration EMQX Cloud with ClickHouse Cloud {#integration-emqx-cloud-with-clickhouse-cloud}

The [EMQX Cloud Data Integrations](https://docs.emqx.com/en/cloud/latest/rule_engine/introduction.html#general-flow) is used to configure the rules for handling and responding to EMQX message flows and device events. The Data Integrations not only provides a clear and flexible "configurable" architecture solution, but also simplifies the development process, improves user usability, and reduces the coupling degree between the business system and EMQX Cloud. It also provides a superior infrastructure for customization of EMQX Cloud's proprietary capabilities.

<Image img={emqx_cloud_data_integration} size="lg" border alt="EMQX Cloud Data Integration Options showing available connectors" />

EMQX Cloud offers more than 30 native integrations with popular data systems. ClickHouse is one of them.

<Image img={data_integration_clickhouse} size="lg" border alt="EMQX Cloud ClickHouse Data Integration connector details" />

### Create ClickHouse resource {#create-clickhouse-resource}

Click "Data Integrations" on the left menu and click "View All Resources". You will find the ClickHouse in the Data Persistence section or you can search for ClickHouse.

Click the ClickHouse card to create a new resource.

- Note: add a note for this resource.
- Server address: this is the address of your ClickHouse Cloud service, remember don't forget the port.
- Database name: `emqx` we created in the above steps.
- User: the username for connecting to your ClickHouse Cloud service.
- Key: the password for the connection.

<Image img={data_integration_resource} size="lg" border alt="EMQX Cloud ClickHouse Resource Setup form with connection details" />

### Create a new rule {#create-a-new-rule}

During the creation of the resource, you will see a popup, and clicking 'New' will leads you to the rule creation page.

EMQX provides a powerful [rule engine](https://docs.emqx.com/en/cloud/latest/rule_engine/rules.html) that can transform, and enrich the raw MQTT message before sending it to third-party systems.

Here's the rule used in this tutorial:

```sql
SELECT
   clientid AS client_id,
   (timestamp div 1000) AS timestamp,
   topic AS topic,
   payload.temp AS temp,
   payload.hum AS hum
FROM
"temp_hum/emqx"
```

It will read the messages from the `temp_hum/emqx` topic and enrich the JSON object by adding client_id, topic, and timestamp info.

So, the raw JSON you send to the topic:

```bash
{"temp": 28.5, "hum": 0.68}
```

<Image img={data_integration_rule_1} size="md" border alt="EMQX Cloud Data Integration Rule Creation Step 1 showing SQL query" />

You can use the SQL test to test and see the results.

<Image img={data_integration_rule_2} size="md" border alt="EMQX Cloud Data Integration Rule Creation Step 2 showing test results" />

Now click on the "NEXT" button. This step is to tell EMQX Cloud how to insert refined data into your ClickHouse database.

### Add a response action {#add-a-response-action}

If you have only one resource, you don't need to modify the 'Resource' and 'Action Type'.
You only need to set the SQL template. Here's the example used for this tutorial:

```bash
INSERT INTO temp_hum (client_id, timestamp, topic, temp, hum) VALUES ('${client_id}', ${timestamp}, '${topic}', ${temp}, ${hum})
```

<Image img={data_integration_rule_action} size="md" border alt="EMQX Cloud Data Integration Rule Action Setup with SQL template" />

This is a template for inserting data into Clickhouse, you can see the variables are used here.

### View rules details {#view-rules-details}

Click "Confirm" and "View Details". Now, everything should be well set. You can see the data integration works from rule details page.

<Image img={data_integration_details} size="md" border alt="EMQX Cloud Data Integration Rule Details showing configuration summary" />

All the MQTT messages sent to the `temp_hum/emqx` topic will be persisted into your ClickHouse Cloud database.

## Saving Data into ClickHouse {#saving-data-into-clickhouse}

We will simulate temperature and humidity data and report these data to EMQX Cloud via the MQTT X and then use the EMQX Cloud Data Integrations to save the data into ClickHouse Cloud.

<Image img={work_flow} size="lg" border alt="EMQX Cloud to ClickHouse Workflow diagram showing data flow" />

### Publish MQTT messages to EMQX Cloud {#publish-mqtt-messages-to-emqx-cloud}

You can use any MQTT client or SDK to publish the message. In this tutorial, we will use [MQTT X](https://mqttx.app/), a user friendly MQTT client application provided by EMQ.

<Image img={mqttx_overview} size="lg" border alt="MQTTX Overview showing the client interface" />

Click "New Connection" on MQTTX and fill the connection form:

- Name: Connection name. Use whatever name you want.
- Host: the MQTT broker connection address. You can get it from the EMQX Cloud overview page.
- Port: MQTT broker connection port. You can get it from the EMQX Cloud overview page.
- Username/Password: Use the credential created above, which should be `emqx` and `xxxxxx` in this tutorial.

<Image img={mqttx_new} size="lg" border alt="MQTTX New Connection Setup form with connection details" />

Click the "Connect" button on top right and the connection should be established.

Now you can send messages to the MQTT broker using this tool.
Inputs:
1. Set payload format to "JSON".
2. Set to topic: `temp_hum/emqx` (the topic we just set in the rule)
3. JSON body:

```bash
{"temp": 23.1, "hum": 0.68}
```

Click the send button on the right. You can change the temperature value and send more data to MQTT broker.

The data sent to EMQX Cloud should be processed by the rule engine and inserted into ClickHouse Cloud automatically.

<Image img={mqttx_publish} size="lg" border alt="MQTTX Publish MQTT Messages interface showing message composition" />

### View rules monitoring {#view-rules-monitoring}

Check the rule monitoring and add one to the number of success.

<Image img={rule_monitor} size="lg" border alt="EMQX Cloud Rule Monitoring dashboard showing message processing metrics" />

### Check the data persisted {#check-the-data-persisted}

Now it's time to take a look at the data on the ClickHouse Cloud. Ideally, the data you send using MQTTX will go to the EMQX Cloud and persist to the ClickHouse Cloud's database with the help of native data integration.

You can connect to the SQL console on ClickHouse Cloud panel or use any client tool to fetch data from your ClickHouse. In this tutorial, we used the SQL console.
By executing the SQL:

```bash
SELECT * FROM emqx.temp_hum;
```

<Image img={clickhouse_result} size="lg" border alt="ClickHouse Query Results showing persisted IoT data" />

### Summary {#summary}

You didn't write any piece of code, and now have the MQTT data move from EMQX cloud to ClickHouse Cloud. With EMQX Cloud and ClickHouse Cloud, you don't need to manage the infra and just focus on writing you IoT applications with data storied securely in ClickHouse Cloud.
