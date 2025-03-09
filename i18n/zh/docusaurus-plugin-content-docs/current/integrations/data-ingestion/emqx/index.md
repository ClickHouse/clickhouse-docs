---
sidebar_label: 'EMQX'
sidebar_position: 1
slug: '/integrations/emqx'
description: 'Introduction to EMQX with ClickHouse'

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


# 将 EMQX 与 ClickHouse 集成

## 连接 EMQX {#connecting-emqx}

[EMQX](https://www.emqx.com/en/try?product=enterprise) 是一个开源的 MQTT 代理，具有高性能的实时消息处理引擎，支持大规模 IoT 设备的事件流。如果您需要连接任何设备，且不论其规模，EMQX 都可以提供帮助。移动和处理您的 IoT 数据，随处可用。

[EMQX Cloud](https://www.emqx.com/en/try?product=cloud) 是一款由 [EMQ](https://www.emqx.com/en) 提供的面向物联网领域的 MQTT 消息中间件产品。作为全球首个完全托管的 MQTT 5.0 云消息服务，EMQX Cloud 提供一站式运维共址和独特的隔离环境用于 MQTT 消息服务。在万物互联的时代，EMQX Cloud 可以帮助您快速构建行业应用，轻松收集、传输、计算和持久化 IoT 数据。

借助云服务提供商提供的基础设施，EMQX Cloud 为全球数十个国家和地区提供低成本、安全且可靠的云服务，支持 5G 和万物互联应用。

<img src={emqx_cloud_artitecture} alt="EMQX Cloud Architecture" />

### 假设 {#assumptions}

* 您熟悉 [MQTT 协议](https://mqtt.org/)，该协议被设计为一种极轻量级的发布/订阅消息传输协议。
* 您正在使用 EMQX 或 EMQX Cloud 作为实时消息处理引擎，支持大规模 IoT 设备的事件流。
* 您已准备好一个 Clickhouse Cloud 实例以持久化设备数据。
* 我们将使用 [MQTT X](https://mqttx.app/) 作为 MQTT 客户端测试工具，将 EMQX Cloud 部署连接以发布 MQTT 数据。或者，其他连接到 MQTT 代理的方法也可以满足要求。

## 获取您的 ClickHouse Cloud 服务 {#get-your-clickhouse-cloudservice}

在此设置过程中，我们在美国弗吉尼亚州（us-east-1） AWS 上部署了 ClickHouse 实例，同时在同一区域也部署了 EMQX Cloud 实例。

<img src={clickhouse_cloud_1} alt="ClickHouse Cloud Service Deployment" />

在设置过程中，您还需要关注连接设置。在本教程中，我们选择了“任何地方”，但是如果您申请指定位置，则需要将从 EMQX Cloud 部署中获得的 [NAT 网关](https://docs.emqx.com/en/cloud/latest/vas/nat-gateway.html) 的 IP 地址添加到白名单中。

<img src={clickhouse_cloud_2} alt="ClickHouse Cloud Connection Settings" />

然后，您需要保存您的用户名和密码，以便将来使用。

<img src={clickhouse_cloud_3} alt="ClickHouse Cloud Credentials" />

之后，您将获得一个正在运行的 Clickhouse 实例。点击“连接”以获得 Clickhouse Cloud 的实例连接地址。

<img src={clickhouse_cloud_4} alt="ClickHouse Cloud Running Instance" />

点击“连接到 SQL 控制台”以创建数据库和表以与 EMQX Cloud 集成。

<img src={clickhouse_cloud_5} alt="ClickHouse Cloud SQL Console" />

您可以参考以下 SQL 语句，或根据实际情况修改 SQL。

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

<img src={clickhouse_cloud_6} alt="ClickHouse Cloud Create Database and Table" />

## 在 EMQX Cloud 上创建 MQTT 服务 {#create-an-mqtt-service-on-emqx-cloud}

在 EMQX Cloud 上创建专用的 MQTT 代理只需轻轻几次点击。

### 获取帐户 {#get-an-account}

EMQX Cloud 为每个帐户提供 14 天的免费试用，适用于标准部署和专业部署。

如果您是 EMQX Cloud 的新用户，请访问 [EMQX Cloud 注册](https://accounts.emqx.com/signup?continue=https%3A%2F%2Fwww.emqx.com%2Fen%2Fcloud) 页面并点击开始免费注册帐户。

<img src={emqx_cloud_sign_up} alt="EMQX Cloud Signup Page" />

### 创建 MQTT 集群 {#create-an-mqtt-cluster}

登录后，点击帐户菜单下的“Cloud Console”，您将看到绿色按钮来创建新的部署。

<img src={emqx_cloud_create_1} alt="EMQX Cloud Create Deployment Step 1" />

在本教程中，我们将使用专业部署，因为只有专业版本提供数据集成功能，可以直接将 MQTT 数据发送到 ClickHouse，无需编写任何代码。

选择专业版，选择 `N.Virginial` 区域，然后点击 `Create Now`。短短几分钟内，您将获得一个完全托管的 MQTT 代理：

<img src={emqx_cloud_create_2} alt="EMQX Cloud Create Deployment Step 2" />

现在点击面板转到集群视图。在此仪表板上，您将看到 MQTT 代理的概述。

<img src={emqx_cloud_overview} alt="EMQX Cloud Overview Dashboard" />

### 添加客户端凭据 {#add-client-credential}

EMQX Cloud 默认不允许匿名连接，因此您需要添加客户端凭据，以便可以使用 MQTT 客户端工具向此代理发送数据。

点击左侧菜单中的“身份验证和 ACL”，在子菜单中点击“身份验证”。点击右侧的“添加”按钮，为稍后 MQTT 连接提供用户名和密码。这里我们将使用 `emqx` 和 `xxxxxx` 作为用户名和密码。

<img src={emqx_cloud_auth} alt="EMQX Cloud Authentication Setup" />

点击“确认”，现在我们已经准备好一个完全托管的 MQTT 代理。

### 启用 NAT 网关 {#enable-nat-gateway}

在开始设置 ClickHouse 集成之前，我们需要首先启用 NAT 网关。默认情况下，MQTT 代理部署在私有 VPC 中，无法通过公共网络向第三方系统发送数据。

返回到概述页面，向下滚动到页面底部，您将看到 NAT 网关小部件。点击“订阅”按钮并按照说明进行操作。请注意，NAT 网关是增值服务，但也提供 14 天的免费试用。

<img src={emqx_cloud_nat_gateway} alt="EMQX Cloud NAT Gateway Configuration" />

创建后，您将在小部件中找到公共 IP 地址。如果您在 ClickHouse Cloud 设置期间选择了“从特定位置连接”，则需要将该 IP 地址添加到白名单中。

## 将 EMQX Cloud 与 ClickHouse Cloud 集成 {#integration-emqx-cloud-with-clickhouse-cloud}

[EMQX Cloud 数据集成](https://docs.emqx.com/en/cloud/latest/rule_engine/introduction.html#general-flow) 用于配置处理和响应 EMQX 消息流和设备事件的规则。数据集成不仅提供清晰灵活的“可配置”架构解决方案，还简化了开发过程，提升用户可用性，并降低业务系统与 EMQX Cloud 之间的耦合程度。它还提供了超越的基础设施，以实现对 EMQX Cloud 专有功能的定制。

<img src={emqx_cloud_data_integration} alt="EMQX Cloud Data Integration Options" />

EMQX Cloud 提供与流行数据系统的 30 多种原生集成。ClickHouse 就是其中之一。

<img src={data_integration_clickhouse} alt="EMQX Cloud ClickHouse Data Integration" />

### 创建 ClickHouse 资源 {#create-clickhouse-resource}

点击左侧菜单中的“数据集成”，然后点击“查看所有资源”。您将在数据持久性部分找到 ClickHouse，或者可以搜索 ClickHouse。

点击 ClickHouse 卡片以创建新资源。

- 注意：为该资源添加注释。
- 服务器地址：这是您的 ClickHouse Cloud 服务地址，请记得不要忘记端口。
- 数据库名称：在上述步骤中创建的 `emqx`。
- 用户：连接到 ClickHouse Cloud 服务的用户名。
- 密钥：连接的密码。

<img src={data_integration_resource} alt="EMQX Cloud ClickHouse Resource Setup" />

### 创建新规则 {#create-a-new-rule}

在创建资源期间，您将看到一个弹出窗口，点击“新建”将引导您到规则创建页面。

EMQX 提供强大的 [规则引擎](https://docs.emqx.com/en/cloud/latest/rule_engine/rules.html)，可以在将原始 MQTT 消息发送到第三方系统之前进行转换和丰富。

以下是本教程中使用的规则：

```sql
SELECT
   clientid as client_id,
   (timestamp div 1000) as timestamp,
   topic as topic,
   payload.temp as temp,
   payload.hum as hum
FROM
"temp_hum/emqx"
```

它将从 `temp_hum/emqx` 主题读取消息，并通过添加 client_id、topic 和 timestamp 信息来丰富 JSON 对象。

因此，您发送到主题的原始 JSON：

```bash
{"temp": 28.5, "hum": 0.68}
```

<img src={data_integration_rule_1} alt="EMQX Cloud Data Integration Rule Creation Step 1" />

您可以使用 SQL 测试来测试并查看结果。

<img src={data_integration_rule_2} alt="EMQX Cloud Data Integration Rule Creation Step 2" />

现在点击“下一步”按钮。这一步是告诉 EMQX Cloud 如何将精炼的数据插入到您的 ClickHouse 数据库中。

### 添加响应操作 {#add-a-response-action}

如果您只有一个资源，则无需修改“资源”和“操作类型”。
您只需设置 SQL 模板。以下是本教程中使用的示例：

```bash
INSERT INTO temp_hum (client_id, timestamp, topic, temp, hum) VALUES ('${client_id}', ${timestamp}, '${topic}', ${temp}, ${hum})
```

<img src={data_integration_rule_action} alt="EMQX Cloud Data Integration Rule Action Setup" />

这是一个插入数据到 Clickhouse 的模板，您可以看到这里使用的变量。

### 查看规则详细信息 {#view-rules-details}

点击“确认”和“查看详细信息”。现在，一切应该设置妥当。您可以从规则详细信息页面查看数据集成状况。

<img src={data_integration_details} alt="EMQX Cloud Data Integration Rule Details" />

所有发送到 `temp_hum/emqx` 主题的 MQTT 消息将被持久化到您的 ClickHouse Cloud 数据库中。

## 将数据保存到 ClickHouse {#saving-data-into-clickhouse}

我们将模拟温度和湿度数据，并通过 MQTT X 向 EMQX Cloud 报告这些数据，然后使用 EMQX Cloud 数据集成将数据保存到 ClickHouse Cloud。

<img src={work_flow} alt="EMQX Cloud to ClickHouse Workflow" />

### 发布 MQTT 消息到 EMQX Cloud {#publish-mqtt-messages-to-emqx-cloud}

您可以使用任何 MQTT 客户端或 SDK 来发布消息。在本教程中，我们将使用 [MQTT X](https://mqttx.app/)，这是 EMQ 提供的用户友好 MQTT 客户端应用程序。

<img src={mqttx_overview} alt="MQTTX Overview" />

在 MQTTX 中点击“新连接”，填写连接表单：

- 名称：连接名称。可以随意使用任何名称。
- 主机：MQTT 代理连接地址。您可以从 EMQX Cloud 概述页面获取。
- 端口：MQTT 代理连接端口。您可以从 EMQX Cloud 概述页面获取。
- 用户名/密码：使用上面创建的凭据，在本教程中应为 `emqx` 和 `xxxxxx`。

<img src={mqttx_new} alt="MQTTX New Connection Setup" />

点击右上角的“连接”按钮，连接应该建立。

现在您可以使用此工具向 MQTT 代理发送消息。
输入：
1. 将负载格式设置为“JSON”。
2. 设置主题为：`temp_hum/emqx`（我们在规则中刚设置的主题）
3. JSON 主体：

```bash
{"temp": 23.1, "hum": 0.68}
```

点击右边的发送按钮。您可以更改温度值并向 MQTT 代理发送更多数据。

发送到 EMQX Cloud 的数据应被规则引擎处理并自动插入到 ClickHouse Cloud。

<img src={mqttx_publish} alt="MQTTX Publish MQTT Messages" />

### 查看规则监控 {#view-rules-monitoring}

检查规则监控并增加成功的数量。

<img src={rule_monitor} alt="EMQX Cloud Rule Monitoring" />

### 检查数据持久化 {#check-the-data-persisted}

现在是查看 ClickHouse Cloud 上数据的时候了。理想情况下，您通过 MQTTX 发送的数据将通过 EMQX Cloud 并利用原生数据集成持久化到 ClickHouse Cloud 的数据库中。

您可以连接到 ClickHouse Cloud 面板上的 SQL 控制台，或使用任何客户端工具从 ClickHouse 中获取数据。在本教程中，我们使用了 SQL 控制台。
通过执行 SQL：

```bash
SELECT * FROM emqx.temp_hum;
```

<img src={clickhouse_result} alt="ClickHouse Query Results" />

### 总结 {#summary}

您没有编写任何代码，现在已经将 MQTT 数据从 EMQX Cloud 移动到 ClickHouse Cloud。通过 EMQX Cloud 和 ClickHouse Cloud，您无需管理基础设施，只需专注于编写 IoT 应用程序，并确保数据安全地存储在 ClickHouse Cloud 中。
