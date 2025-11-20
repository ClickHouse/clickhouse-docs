---
sidebar_label: 'EMQX'
sidebar_position: 1
slug: /integrations/emqx
description: 'EMQX 与 ClickHouse 集成简介'
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

[EMQX](https://www.emqx.com/en/try?product=enterprise) 是一个开源 MQTT 代理,具备高性能实时消息处理引擎,为海量物联网设备提供事件流处理能力。作为可扩展性最强的 MQTT 代理,EMQX 可以帮助您连接任何设备,实现任意规模的连接,在任何地方移动和处理物联网数据。

[EMQX Cloud](https://www.emqx.com/en/try?product=cloud) 是由 [EMQ](https://www.emqx.com/en) 托管的面向物联网领域的 MQTT 消息中间件产品。作为全球首个全托管 MQTT 5.0 云消息服务,EMQX Cloud 为 MQTT 消息服务提供一站式运维托管和独立的隔离环境。在万物互联时代,EMQX Cloud 可以帮助您快速构建物联网领域的行业应用,轻松实现物联网数据的采集、传输、计算和持久化。

借助云服务提供商的基础设施,EMQX Cloud 服务于全球数十个国家和地区,为 5G 和万物互联应用提供低成本、安全可靠的云服务。

<Image
  img={emqx_cloud_artitecture}
  size='lg'
  border
  alt='EMQX Cloud 架构图,展示云基础设施组件'
/>

### 前提条件 {#assumptions}

- 您熟悉 [MQTT 协议](https://mqtt.org/),该协议是一种极其轻量级的发布/订阅消息传输协议。
- 您正在使用 EMQX 或 EMQX Cloud 作为实时消息处理引擎,为海量物联网设备提供事件流处理能力。
- 您已准备好 ClickHouse Cloud 实例用于持久化设备数据。
- 我们使用 [MQTT X](https://mqttx.app/) 作为 MQTT 客户端测试工具连接 EMQX Cloud 部署并发布 MQTT 数据。您也可以使用其他方法连接到 MQTT 代理。


## 获取您的 ClickHouse Cloud 服务 {#get-your-clickhouse-cloudservice}

在本次设置中,我们在 AWS 北弗吉尼亚(us-east-1)区域部署了 ClickHouse 实例,EMQX Cloud 实例也部署在同一区域。

<Image
  img={clickhouse_cloud_1}
  size='sm'
  border
  alt='ClickHouse Cloud 服务部署界面,显示 AWS 区域选择'
/>

在设置过程中,您还需要注意连接设置。在本教程中,我们选择"Anywhere",但如果您需要指定特定位置,则需要将从 EMQX Cloud 部署中获取的 [NAT 网关](https://docs.emqx.com/en/cloud/latest/vas/nat-gateway.html) IP 地址添加到白名单。

<Image
  img={clickhouse_cloud_2}
  size='sm'
  border
  alt='ClickHouse Cloud 连接设置,显示 IP 访问配置'
/>

然后您需要保存用户名和密码以备后用。

<Image
  img={clickhouse_cloud_3}
  size='sm'
  border
  alt='ClickHouse Cloud 凭据界面,显示用户名和密码'
/>

完成后,您将获得一个运行中的 ClickHouse 实例。点击"Connect"获取 ClickHouse Cloud 的实例连接地址。

<Image
  img={clickhouse_cloud_4}
  size='lg'
  border
  alt='ClickHouse Cloud 运行实例仪表板,包含连接选项'
/>

点击"Connect to SQL Console"创建数据库和表,以便与 EMQX Cloud 集成。

<Image
  img={clickhouse_cloud_5}
  size='lg'
  border
  alt='ClickHouse Cloud SQL 控制台界面'
/>

您可以参考以下 SQL 语句,或根据实际情况进行修改。

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

<Image
  img={clickhouse_cloud_6}
  size='lg'
  border
  alt='ClickHouse Cloud 创建数据库和表的 SQL 查询执行'
/>


## 在 EMQX Cloud 上创建 MQTT 服务 {#create-an-mqtt-service-on-emqx-cloud}

在 EMQX Cloud 上创建专用 MQTT 代理只需简单几步即可完成。

### 获取账户 {#get-an-account}

EMQX Cloud 为每个账户的标准部署和专业部署均提供 14 天免费试用。

如果您是 EMQX Cloud 新用户,请访问 [EMQX Cloud 注册](https://accounts.emqx.com/signup?continue=https%3A%2F%2Fwww.emqx.com%2Fen%2Fcloud) 页面,点击开始免费试用以注册账户。

<Image
  img={emqx_cloud_sign_up}
  size='lg'
  border
  alt='EMQX Cloud 注册页面及注册表单'
/>

### 创建 MQTT 集群 {#create-an-mqtt-cluster}

登录后,在账户菜单下点击 "Cloud console",您将看到用于创建新部署的绿色按钮。

<Image
  img={emqx_cloud_create_1}
  size='lg'
  border
  alt='EMQX Cloud 创建部署步骤 1,显示部署选项'
/>

在本教程中,我们将使用专业版部署,因为只有专业版提供数据集成功能,可以无需编写任何代码即可将 MQTT 数据直接发送到 ClickHouse。

选择专业版并选择 `N.Virginial` 区域,然后点击 `Create Now`。仅需几分钟,您就能获得一个完全托管的 MQTT 代理:

<Image
  img={emqx_cloud_create_2}
  size='lg'
  border
  alt='EMQX Cloud 创建部署步骤 2,显示区域选择'
/>

现在点击面板进入集群视图。在此仪表板上,您将看到 MQTT 代理的概览信息。

<Image
  img={emqx_cloud_overview}
  size='lg'
  border
  alt='EMQX Cloud 概览仪表板,显示代理指标'
/>

### 添加客户端凭证 {#add-client-credential}

EMQX Cloud 默认不允许匿名连接,因此您需要添加客户端凭证,以便使用 MQTT 客户端工具向此代理发送数据。

在左侧菜单中点击 "Authentication & ACL",然后在子菜单中点击 "Authentication"。点击右侧的 "Add" 按钮,为后续的 MQTT 连接设置用户名和密码。在此我们将使用 `emqx` 和 `xxxxxx` 作为用户名和密码。

<Image
  img={emqx_cloud_auth}
  size='lg'
  border
  alt='EMQX Cloud 认证设置界面,用于添加凭证'
/>

点击 "Confirm",现在我们已经准备好了一个完全托管的 MQTT 代理。

### 启用 NAT 网关 {#enable-nat-gateway}

在开始设置 ClickHouse 集成之前,我们需要先启用 NAT 网关。默认情况下,MQTT 代理部署在私有 VPC 中,无法通过公网向第三方系统发送数据。

返回概览页面并向下滚动到页面底部,您将看到 NAT 网关小部件。点击 Subscribe 按钮并按照说明操作。请注意,NAT Gateway 是一项增值服务,但同样提供 14 天免费试用。

<Image
  img={emqx_cloud_nat_gateway}
  size='lg'
  border
  alt='EMQX Cloud NAT 网关配置面板'
/>

创建完成后,您将在小部件中找到公网 IP 地址。请注意,如果您在 ClickHouse Cloud 设置期间选择了"从特定位置连接",则需要将此 IP 地址添加到白名单中。


## 将 EMQX Cloud 与 ClickHouse Cloud 集成 {#integration-emqx-cloud-with-clickhouse-cloud}

[EMQX Cloud 数据集成](https://docs.emqx.com/en/cloud/latest/rule_engine/introduction.html#general-flow)用于配置处理和响应 EMQX 消息流和设备事件的规则。数据集成不仅提供了清晰灵活的"可配置"架构解决方案,还简化了开发流程,提高了用户可用性,并降低了业务系统与 EMQX Cloud 之间的耦合度。它还为定制 EMQX Cloud 的专有功能提供了优越的基础设施。

<Image
  img={emqx_cloud_data_integration}
  size='lg'
  border
  alt='EMQX Cloud 数据集成选项显示可用连接器'
/>

EMQX Cloud 提供与主流数据系统的 30 多种原生集成。ClickHouse 是其中之一。

<Image
  img={data_integration_clickhouse}
  size='lg'
  border
  alt='EMQX Cloud ClickHouse 数据集成连接器详情'
/>

### 创建 ClickHouse 资源 {#create-clickhouse-resource}

在左侧菜单中点击"数据集成",然后点击"查看所有资源"。您可以在数据持久化部分找到 ClickHouse,或者直接搜索 ClickHouse。

点击 ClickHouse 卡片以创建新资源。

- 备注:为此资源添加备注。
- 服务器地址:这是您的 ClickHouse Cloud 服务地址,请记住包含端口号。
- 数据库名称:我们在上述步骤中创建的 `emqx`。
- 用户:用于连接 ClickHouse Cloud 服务的用户名。
- 密钥:连接密码。

<Image
  img={data_integration_resource}
  size='lg'
  border
  alt='EMQX Cloud ClickHouse 资源设置表单及连接详情'
/>

### 创建新规则 {#create-a-new-rule}

在创建资源期间,您会看到一个弹出窗口,点击"新建"将引导您进入规则创建页面。

EMQX 提供了强大的[规则引擎](https://docs.emqx.com/en/cloud/latest/rule_engine/rules.html),可以在将原始 MQTT 消息发送到第三方系统之前对其进行转换和增强。

以下是本教程中使用的规则:

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

它将从 `temp_hum/emqx` 主题读取消息,并通过添加 client_id、topic 和 timestamp 信息来增强 JSON 对象。

因此,您发送到该主题的原始 JSON:

```bash
{"temp": 28.5, "hum": 0.68}
```

<Image
  img={data_integration_rule_1}
  size='md'
  border
  alt='EMQX Cloud 数据集成规则创建步骤 1 显示 SQL 查询'
/>

您可以使用 SQL 测试来测试并查看结果。

<Image
  img={data_integration_rule_2}
  size='md'
  border
  alt='EMQX Cloud 数据集成规则创建步骤 2 显示测试结果'
/>

现在点击"下一步"按钮。此步骤用于告诉 EMQX Cloud 如何将处理后的数据插入到您的 ClickHouse 数据库中。

### 添加响应动作 {#add-a-response-action}

如果您只有一个资源,则无需修改"资源"和"动作类型"。
您只需设置 SQL 模板。以下是本教程使用的示例:

```bash
INSERT INTO temp_hum (client_id, timestamp, topic, temp, hum) VALUES ('${client_id}', ${timestamp}, '${topic}', ${temp}, ${hum})
```

<Image
  img={data_integration_rule_action}
  size='md'
  border
  alt='EMQX Cloud 数据集成规则动作设置及 SQL 模板'
/>

这是用于向 ClickHouse 插入数据的模板,您可以看到这里使用了变量。

### 查看规则详情 {#view-rules-details}

点击"确认"和"查看详情"。现在,一切都应该设置妥当。您可以从规则详情页面查看数据集成的工作情况。

<Image
  img={data_integration_details}
  size='md'
  border
  alt='EMQX Cloud 数据集成规则详情显示配置摘要'
/>

所有发送到 `temp_hum/emqx` 主题的 MQTT 消息都将持久化到您的 ClickHouse Cloud 数据库中。


## 将数据保存到 ClickHouse {#saving-data-into-clickhouse}

我们将模拟温度和湿度数据,并通过 MQTT X 将这些数据上报到 EMQX Cloud,然后使用 EMQX Cloud 数据集成功能将数据保存到 ClickHouse Cloud。

<Image
  img={work_flow}
  size='lg'
  border
  alt='EMQX Cloud 到 ClickHouse 工作流程图,展示数据流向'
/>

### 向 EMQX Cloud 发布 MQTT 消息 {#publish-mqtt-messages-to-emqx-cloud}

您可以使用任何 MQTT 客户端或 SDK 来发布消息。在本教程中,我们将使用 [MQTT X](https://mqttx.app/),这是由 EMQ 提供的一款用户友好的 MQTT 客户端应用程序。

<Image
  img={mqttx_overview}
  size='lg'
  border
  alt='MQTTX 概览,展示客户端界面'
/>

在 MQTTX 中点击"新建连接"并填写连接表单:

- Name:连接名称。可以使用任意名称。
- Host:MQTT 代理连接地址。您可以从 EMQX Cloud 概览页面获取。
- Port:MQTT 代理连接端口。您可以从 EMQX Cloud 概览页面获取。
- Username/Password:使用上面创建的凭证,在本教程中应为 `emqx` 和 `xxxxxx`。

<Image
  img={mqttx_new}
  size='lg'
  border
  alt='MQTTX 新建连接设置表单,包含连接详细信息'
/>

点击右上角的"连接"按钮,连接应该会建立成功。

现在您可以使用此工具向 MQTT 代理发送消息。
输入内容:

1. 将有效负载格式设置为"JSON"。
2. 设置主题为:`temp_hum/emqx`(我们刚才在规则中设置的主题)
3. JSON 正文:

```bash
{"temp": 23.1, "hum": 0.68}
```

点击右侧的发送按钮。您可以更改温度值并向 MQTT 代理发送更多数据。

发送到 EMQX Cloud 的数据将由规则引擎处理并自动插入到 ClickHouse Cloud。

<Image
  img={mqttx_publish}
  size='lg'
  border
  alt='MQTTX 发布 MQTT 消息界面,展示消息组成'
/>

### 查看规则监控 {#view-rules-monitoring}

检查规则监控,成功数量应增加一条。

<Image
  img={rule_monitor}
  size='lg'
  border
  alt='EMQX Cloud 规则监控仪表板,展示消息处理指标'
/>

### 检查持久化的数据 {#check-the-data-persisted}

现在可以查看 ClickHouse Cloud 上的数据了。理想情况下,您使用 MQTTX 发送的数据将通过原生数据集成功能传输到 EMQX Cloud 并持久化到 ClickHouse Cloud 的数据库中。

您可以连接到 ClickHouse Cloud 控制面板上的 SQL 控制台,或使用任何客户端工具从 ClickHouse 中获取数据。在本教程中,我们使用了 SQL 控制台。
执行以下 SQL:

```bash
SELECT * FROM emqx.temp_hum;
```

<Image
  img={clickhouse_result}
  size='lg'
  border
  alt='ClickHouse 查询结果,展示持久化的物联网数据'
/>

### 总结 {#summary}

您无需编写任何代码,现在就已经实现了 MQTT 数据从 EMQX Cloud 到 ClickHouse Cloud 的传输。借助 EMQX Cloud 和 ClickHouse Cloud,您无需管理基础设施,只需专注于编写物联网应用程序,数据将安全地存储在 ClickHouse Cloud 中。
