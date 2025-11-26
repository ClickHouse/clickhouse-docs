---
sidebar_label: 'EMQX'
sidebar_position: 1
slug: /integrations/emqx
description: 'EMQX 与 ClickHouse 简介'
title: 'EMQX 与 ClickHouse 的集成'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_ingestion'
keywords: ['EMQX ClickHouse 集成', 'MQTT ClickHouse 连接器', 'EMQX Cloud ClickHouse', '物联网数据 ClickHouse', 'MQTT broker ClickHouse']
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


# 将 EMQX 与 ClickHouse 集成



## 连接 EMQX {#connecting-emqx}

[EMQX](https://www.emqx.com/en/try?product=enterprise) 是一个开源 MQTT 代理，具备高性能的实时消息处理引擎，可为大规模物联网设备提供事件流处理能力。作为可扩展性最强的 MQTT 代理，EMQX 能帮助你在任何规模下连接任何设备，让你可以在任何地方传输和处理物联网数据。

[EMQX Cloud](https://www.emqx.com/en/try?product=cloud) 是由 [EMQ](https://www.emqx.com/en) 托管、面向物联网领域的 MQTT 消息中间件产品。作为全球首个完全托管的 MQTT 5.0 云消息服务，EMQX Cloud 为 MQTT 消息服务提供一站式运维托管以及独立隔离的运行环境。在万物互联时代，EMQX Cloud 可以帮助你快速构建物联网行业应用，并轻松实现物联网数据的采集、传输、计算与持久化。

借助云服务商提供的基础设施，EMQX Cloud 服务覆盖全球数十个国家和地区，为 5G 与万物互联应用提供低成本、安全、可靠的云服务。

<Image img={emqx_cloud_artitecture} size="lg" border alt="EMQX Cloud 架构图，展示云基础设施组件" />

### 前提条件 {#assumptions}

* 你已熟悉 [MQTT 协议](https://mqtt.org/)，它被设计为一种极其轻量级的发布/订阅消息传输协议。
* 你正在使用 EMQX 或 EMQX Cloud 作为实时消息处理引擎，为大规模物联网设备提供事件流服务。
* 你已经准备好了一个 ClickHouse Cloud 实例用于持久化设备数据。
* 我们使用 [MQTT X](https://mqttx.app/) 作为 MQTT 客户端测试工具，连接到 EMQX Cloud 的部署并发布 MQTT 数据。你也可以使用其他任意方式连接到 MQTT 代理来完成相同工作。



## 获取 ClickHouse Cloud 服务

在本次部署过程中，我们在 AWS 美国北弗吉尼亚（us-east-1）区域部署了一个 ClickHouse 实例，并在同一地区部署了一个 EMQX Cloud 实例。

<Image img={clickhouse_cloud_1} size="sm" border alt="ClickHouse Cloud 服务部署界面，展示 AWS 区域选择" />

在配置过程中，您还需要留意连接设置。本教程中我们选择了 “Anywhere”，但如果您申请的是特定位置，则需要将从 EMQX Cloud 部署中获得的 [NAT gateway](https://docs.emqx.com/en/cloud/latest/vas/nat-gateway.html) IP 地址加入白名单。

<Image img={clickhouse_cloud_2} size="sm" border alt="ClickHouse Cloud 连接设置界面，展示 IP 访问配置" />

然后您需要保存用户名和密码，以便后续使用。

<Image img={clickhouse_cloud_3} size="sm" border alt="ClickHouse Cloud 凭证界面，展示用户名和密码" />

之后，您将获得一个正在运行的 ClickHouse 实例。单击 “Connect” 获取 ClickHouse Cloud 实例的连接地址。

<Image img={clickhouse_cloud_4} size="lg" border alt="ClickHouse Cloud 运行中实例控制台，带有连接选项" />

单击 “Connect to SQL Console” 创建用于与 EMQX Cloud 集成的数据库和数据表。

<Image img={clickhouse_cloud_5} size="lg" border alt="ClickHouse Cloud SQL 控制台界面" />

您可以参考以下 SQL 语句，或根据实际情况进行修改。

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

<Image img={clickhouse_cloud_6} size="lg" border alt="在 ClickHouse Cloud 中执行创建数据库和数据表的 SQL 查询" />


## 在 EMQX Cloud 上创建 MQTT 服务 {#create-an-mqtt-service-on-emqx-cloud}

在 EMQX Cloud 上创建一个专用 MQTT broker 只需点击几下即可完成。

### 获取账号 {#get-an-account}

EMQX Cloud 为每个账号提供标准部署和专业部署的 14 天免费试用。

前往 [EMQX Cloud 注册](https://accounts.emqx.com/signup?continue=https%3A%2F%2Fwww.emqx.com%2Fen%2Fcloud) 页面，如果你是第一次使用 EMQX Cloud，点击 “start free” 注册账号。

<Image img={emqx_cloud_sign_up} size="lg" border alt="带有注册表单的 EMQX Cloud 注册页面" />

### 创建 MQTT 集群 {#create-an-mqtt-cluster}

登录后，点击账号菜单下的 “Cloud console”，你将看到用于创建新部署的绿色按钮。

<Image img={emqx_cloud_create_1} size="lg" border alt="EMQX Cloud 创建部署步骤 1，展示部署选项" />

在本教程中，我们将使用专业部署，因为只有专业版提供数据集成功能，可以在无需编写任何代码的情况下，将 MQTT 数据直接发送到 ClickHouse。

选择 Pro 版本，并选择 `N.Virginia` 区域，然后点击 `Create Now`。几分钟内，你就会获得一个完全托管的 MQTT broker：

<Image img={emqx_cloud_create_2} size="lg" border alt="EMQX Cloud 创建部署步骤 2，展示区域选择" />

现在点击该面板进入集群视图。在这个仪表板上，你可以看到 MQTT broker 的概览信息。

<Image img={emqx_cloud_overview} size="lg" border alt="EMQX Cloud 概览仪表板，展示 broker 指标" />

### 添加客户端凭证 {#add-client-credential}

EMQX Cloud 默认不允许匿名连接，所以你需要添加一个客户端凭证，以便使用 MQTT 客户端工具向该 broker 发送数据。

点击左侧菜单中的 “Authentication & ACL”，然后在子菜单中点击 “Authentication”。点击右侧的 “Add” 按钮，为之后的 MQTT 连接设置一个用户名和密码。这里我们将使用 `emqx` 和 `xxxxxx` 作为用户名和密码。

<Image img={emqx_cloud_auth} size="lg" border alt="用于添加凭证的 EMQX Cloud 认证设置界面" />

点击 “Confirm”，现在我们已经拥有了一个可用的完全托管 MQTT broker。

### 启用 NAT 网关 {#enable-nat-gateway}

在开始配置 ClickHouse 集成之前，我们需要先启用 NAT 网关。默认情况下，MQTT broker 部署在私有 VPC 中，无法通过公网向第三方系统发送数据。

回到 Overview 页面，滚动到页面底部，你会看到 NAT 网关组件。点击 “Subscribe” 按钮并按照指引操作。请注意，NAT Gateway 是一项增值服务，但同样提供 14 天免费试用。

<Image img={emqx_cloud_nat_gateway} size="lg" border alt="EMQX Cloud NAT 网关配置面板" />

创建完成后，你会在该组件中看到公网 IP 地址。请注意，如果你在 ClickHouse Cloud 设置过程中选择了 “Connect from a specific location”，则需要将此 IP 地址添加到白名单中。



## 将 EMQX Cloud 与 ClickHouse Cloud 集成

[EMQX Cloud Data Integrations](https://docs.emqx.com/en/cloud/latest/rule_engine/introduction.html#general-flow) 用于配置处理和响应 EMQX 消息流与设备事件的规则。Data Integrations 不仅提供了清晰且灵活的可配置架构方案，还简化了开发流程、提升了用户体验，并降低了业务系统与 EMQX Cloud 之间的耦合度。同时，它还为 EMQX Cloud 专有能力的定制化提供了完善的基础设施。

<Image img={emqx_cloud_data_integration} size="lg" border alt="EMQX Cloud 数据集成选项，展示可用的连接器" />

EMQX Cloud 为常见数据系统提供了 30 多种原生集成方案，ClickHouse 就是其中之一。

<Image img={data_integration_clickhouse} size="lg" border alt="EMQX Cloud ClickHouse 数据集成连接器详情" />

### 创建 ClickHouse 资源

点击左侧菜单中的 “Data Integrations”，然后点击 “View All Resources”。您可以在 Data Persistence 部分找到 ClickHouse，或者直接搜索 ClickHouse。

点击 ClickHouse 卡片以创建一个新资源。

* Note: 为该资源添加备注。
* Server address: 您的 ClickHouse Cloud 服务地址，请务必包含端口号。
* Database name: 上面步骤中我们创建的 `emqx`。
* User: 用于连接 ClickHouse Cloud 服务的用户名。
* Key: 连接所使用的密码。

<Image img={data_integration_resource} size="lg" border alt="EMQX Cloud ClickHouse 资源设置表单及连接详情" />

### 创建新规则

在创建资源的过程中，您会看到一个弹窗，点击 “New” 会跳转到规则创建页面。

EMQX 提供了强大的[规则引擎](https://docs.emqx.com/en/cloud/latest/rule_engine/rules.html)，可在将原始 MQTT 消息发送到第三方系统之前对其进行转换和丰富。

以下是本教程中使用的规则：

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

它会从 `temp_hum/emqx` 主题中读取消息，并在该 JSON 对象中添加 client&#95;id、topic 和 timestamp 信息进行丰富。

因此，你发送到该主题的原始 JSON 如下：

```bash
{"temp": 28.5, "hum": 0.68}
```

<Image img={data_integration_rule_1} size="md" border alt="EMQX Cloud 数据集成规则创建步骤 1，展示 SQL 查询" />

你可以使用 SQL 测试功能查看结果。

<Image img={data_integration_rule_2} size="md" border alt="EMQX Cloud 数据集成规则创建步骤 2，展示测试结果" />

现在点击 &quot;NEXT&quot; 按钮。此步骤是告诉 EMQX Cloud 如何将处理后的数据写入你的 ClickHouse 数据库。

### 添加响应操作

如果你只有一个资源，则无需修改 &#39;Resource&#39; 和 &#39;Action Type&#39;。
你只需要设置 SQL 模板。以下是本教程中使用的示例：

```bash
INSERT INTO temp_hum (client_id, timestamp, topic, temp, hum) VALUES ('${client_id}', ${timestamp}, '${topic}', ${temp}, ${hum})
```

<Image img={data_integration_rule_action} size="md" border alt="使用 SQL 模板配置 EMQX Cloud 数据集成规则动作" />

这是一个用于向 ClickHouse 写入数据的模板，可以看到这里使用了变量。

### 查看规则详情

点击 “Confirm” 和 “View Details”。现在一切都已配置就绪。你可以在规则详情页面看到数据集成的运行情况。

<Image img={data_integration_details} size="md" border alt="EMQX Cloud 数据集成规则详情，显示配置摘要" />

发送到 `temp_hum/emqx` 主题的所有 MQTT 消息都会被持久化到你的 ClickHouse Cloud 数据库中。


## 将数据保存到 ClickHouse

我们将模拟温度和湿度数据，通过 MQTT X 将这些数据上报到 EMQX Cloud，然后使用 EMQX Cloud 的数据集成功能将数据保存到 ClickHouse Cloud 中。

<Image img={work_flow} size="lg" border alt="展示数据流向的 EMQX Cloud 到 ClickHouse 工作流图" />

### 向 EMQX Cloud 发布 MQTT 消息

你可以使用任意 MQTT 客户端或 SDK 发布消息。在本教程中，我们将使用 [MQTT X](https://mqttx.app/)，这是由 EMQ 提供的一款用户友好的 MQTT 客户端应用程序。

<Image img={mqttx_overview} size="lg" border alt="展示客户端界面的 MQTT X 概览" />

在 MQTT X 中点击 &quot;New Connection&quot;，然后填写连接表单：

* Name：连接名称。可以使用任意你想要的名称。
* Host：MQTT broker 连接地址。你可以在 EMQX Cloud 概览页面中获取。
* Port：MQTT broker 连接端口。你可以在 EMQX Cloud 概览页面中获取。
* Username/Password：使用前面创建的凭证，在本教程中应为 `emqx` 和 `xxxxxx`。

<Image img={mqttx_new} size="lg" border alt="带有连接详情的 MQTT X 新建连接设置表单" />

点击右上角的 &quot;Connect&quot; 按钮，即可建立连接。

现在你可以使用此工具向 MQTT broker 发送消息。
输入：

1. 将 payload 格式设置为 &quot;JSON&quot;。
2. 将 topic 设置为：`temp_hum/emqx`（我们刚刚在规则中设置的 topic）。
3. JSON body：

```bash
{"temp": 23.1, "hum": 0.68}
```

点击右侧的发送按钮。你可以更改温度值，并向 MQTT 代理发送更多数据。

发送到 EMQX Cloud 的数据将由规则引擎处理，并自动插入到 ClickHouse Cloud 中。

<Image img={mqttx_publish} size="lg" border alt="MQTTX 发布 MQTT 消息界面，展示消息编辑" />

### 查看规则监控

检查规则监控，确认成功次数已增加 1。

<Image img={rule_monitor} size="lg" border alt="EMQX Cloud 规则监控看板，展示消息处理指标" />

### 检查持久化数据

现在是时候查看 ClickHouse Cloud 上的数据了。理想情况下，你使用 MQTTX 发送的数据会进入 EMQX Cloud，并在原生数据集成的帮助下持久化到 ClickHouse Cloud 的数据库中。

你可以在 ClickHouse Cloud 面板中连接到 SQL 控制台，或使用任意客户端工具从 ClickHouse 中获取数据。在本教程中，我们使用的是 SQL 控制台。
通过执行以下 SQL：

```bash
SELECT * FROM emqx.temp_hum;
```

<Image img={clickhouse_result} size="lg" border alt="ClickHouse 查询结果，显示已持久化的物联网 (IoT) 数据" />

### 总结

你无需编写任何代码，就已经让 MQTT 数据从 EMQX Cloud 流转到了 ClickHouse Cloud。借助 EMQX Cloud 和 ClickHouse Cloud，你无需自行管理基础设施，只需专注于编写物联网 (IoT) 应用，而数据会安全地存储在 ClickHouse Cloud 中。
