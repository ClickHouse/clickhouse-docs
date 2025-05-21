---
'sidebar_label': 'EMQX'
'sidebar_position': 1
'slug': '/integrations/emqx'
'description': '将 EMQX 与 ClickHouse 集成'
'title': '将 EMQX 与 ClickHouse 集成'
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

[EMQX](https://www.emqx.com/en/try?product=enterprise) 是一个开源 MQTT 代理，具有高性能的实时消息处理引擎，支持大规模 IoT 设备的事件流处理。作为最具可扩展性的 MQTT 代理，EMQX 可以帮助您以任何规模连接任何设备。随时随地移动和处理您的 IoT 数据。

[EMQX Cloud](https://www.emqx.com/en/try?product=cloud) 是一个由 [EMQ](https://www.emqx.com/en) 托管的 IoT 领域的 MQTT 消息中间件产品。作为全球首个完全托管的 MQTT 5.0 云消息服务，EMQX Cloud 提供了一站式运维共址和 MQTT 消息服务的独特隔离环境。在万物互联的时代，EMQX Cloud 可以帮助您快速为 IoT 领域构建行业应用，并轻松收集、传输、计算和持久化 IoT 数据。

借助云服务提供商提供的基础设施，EMQX Cloud 为全球多个国家和地区提供低成本、安全且可靠的云服务，支持 5G 和万物互联应用。

<Image img={emqx_cloud_artitecture} size="lg" border alt="EMQX Cloud 架构图，展示云基础设施组件" />

### 假设 {#assumptions}

* 您熟悉 [MQTT 协议](https://mqtt.org/)，它被设计为一种极其轻量级的发布/订阅消息传输协议。
* 您正在使用 EMQX 或 EMQX Cloud 进行实时消息处理引擎，支持大规模 IoT 设备的事件流处理。
* 您已经准备了一个 Clickhouse Cloud 实例来持久化设备数据。
* 我们使用 [MQTT X](https://mqttx.app/) 作为 MQTT 客户端测试工具，以连接 EMQX Cloud 的部署以发布 MQTT 数据。或者，其他连接到 MQTT 代理的方法也可以完成任务。


## 获取您的 ClickHouse Cloud 服务 {#get-your-clickhouse-cloudservice}

在此设置过程中，我们在 AWS 的北弗吉尼亚 (us-east-1) 部署了 ClickHouse 实例，同时在同一区域也部署了 EMQX Cloud 实例。

<Image img={clickhouse_cloud_1} size="sm" border alt="ClickHouse Cloud 服务部署界面，显示 AWS 区域选择" />

在设置过程中，您还需要注意连接设置。在本教程中，我们选择“任何地方”，但如果您申请特定位置，您需要将从 EMQX Cloud 部署中获得的 [NAT 网关](https://docs.emqx.com/en/cloud/latest/vas/nat-gateway.html) IP 地址添加到白名单中。

<Image img={clickhouse_cloud_2} size="sm" border alt="ClickHouse Cloud 连接设置，显示 IP 访问配置" />

然后您需要保存用户名和密码以备将来使用。

<Image img={clickhouse_cloud_3} size="sm" border alt="ClickHouse Cloud 凭据屏幕，显示用户名和密码" />

之后，您将获得一个运行中的 ClickHouse 实例。点击“连接”以获取 ClickHouse Cloud 的实例连接地址。

<Image img={clickhouse_cloud_4} size="lg" border alt="ClickHouse Cloud 运行实例仪表板，具有连接选项" />

点击“连接到 SQL 控制台”以创建与 EMQX Cloud 集成的数据库和表。

<Image img={clickhouse_cloud_5} size="lg" border alt="ClickHouse Cloud SQL 控制台界面" />

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

<Image img={clickhouse_cloud_6} size="lg" border alt="ClickHouse Cloud 创建数据库和表 SQL 查询执行" />

## 在 EMQX Cloud 上创建 MQTT 服务 {#create-an-mqtt-service-on-emqx-cloud}

在 EMQX Cloud 上创建专用的 MQTT 代理只需几次点击。

### 获取账户 {#get-an-account}

EMQX Cloud 为每个账户提供标准部署和专业部署的 14 天免费试用。

如果您是 EMQX Cloud 的新用户，请首先访问 [EMQX Cloud 注册](https://accounts.emqx.com/signup?continue=https%3A%2F%2Fwww.emqx.com%2Fen%2Fcloud) 页面并点击“免费注册”以注册账户。

<Image img={emqx_cloud_sign_up} size="lg" border alt="EMQX Cloud 注册页面，带有注册表单" />

### 创建 MQTT 集群 {#create-an-mqtt-cluster}

登录后，点击账户菜单下的“云控制台”，您将看到创建新部署的绿色按钮。

<Image img={emqx_cloud_create_1} size="lg" border alt="EMQX Cloud 创建部署第 1 步，显示部署选项" />

在本教程中，我们将使用专业部署，因为只有专业版提供数据集成功能，可以无需编写任何代码即可将 MQTT 数据直接发送到 ClickHouse。

选择专业版并选择 `N.Virginia` 区域，然后点击 `立即创建`。几分钟后，您将获得一个完全托管的 MQTT 代理：

<Image img={emqx_cloud_create_2} size="lg" border alt="EMQX Cloud 创建部署第 2 步，显示区域选择" />

现在点击面板以进入集群视图。在此仪表板上，您将看到您的 MQTT 代理的概述。

<Image img={emqx_cloud_overview} size="lg" border alt="EMQX Cloud 概述仪表板，显示代理指标" />

### 添加客户端凭证 {#add-client-credential}

EMQX Cloud 默认不允许匿名连接，因此您需要添加客户端凭证，以便使用 MQTT 客户端工具向此代理发送数据。

点击左侧菜单中的“认证与 ACL”，然后在子菜单中点击“认证”。点击右侧的“添加”按钮，给将来的 MQTT 连接提供用户名和密码。在这里，我们将使用 `emqx` 和 `xxxxxx` 作为用户名和密码。

<Image img={emqx_cloud_auth} size="lg" border alt="EMQX Cloud 认证设置界面，用于添加凭证" />

点击“确认”，现在我们有一个准备好的完全托管的 MQTT 代理。

### 启用 NAT 网关 {#enable-nat-gateway}

在开始设置 ClickHouse 集成之前，我们需要先启用 NAT 网关。默认情况下，MQTT 代理部署在私有 VPC 中，无法通过公有网络向第三方系统发送数据。

返回到概述页面，向下滚动到页面底部，您将看到 NAT 网关小部件。点击订阅按钮并按照指示操作。请注意，NAT 网关是增值服务，但它也提供 14 天的免费试用。

<Image img={emqx_cloud_nat_gateway} size="lg" border alt="EMQX Cloud NAT 网关配置面板" />

创建后，您将在小部件中找到公共 IP 地址。请注意，如果您在 ClickHouse Cloud 设置期间选择“从特定位置连接”，则需要将此 IP 地址添加到白名单中。

## 将 EMQX Cloud 与 ClickHouse Cloud 集成 {#integration-emqx-cloud-with-clickhouse-cloud}

[EMQX Cloud 数据集成](https://docs.emqx.com/en/cloud/latest/rule_engine/introduction.html#general-flow) 用于配置处理和响应 EMQX 消息流和设备事件的规则。数据集成不仅提供了清晰灵活的“可配置”架构解决方案，还简化了开发过程，提高了用户可用性，减少了业务系统与 EMQX Cloud 之间的耦合程度。它还为自定义 EMQX Cloud 的专有功能提供了卓越的基础设施。

<Image img={emqx_cloud_data_integration} size="lg" border alt="EMQX Cloud 数据集成选项，显示可用连接器" />

EMQX Cloud 提供了超过 30 种与流行数据系统的原生集成。ClickHouse 是其中之一。

<Image img={data_integration_clickhouse} size="lg" border alt="EMQX Cloud ClickHouse 数据集成连接器详细信息" />

### 创建 ClickHouse 资源 {#create-clickhouse-resource}

点击左侧菜单中的“数据集成”，然后点击“查看所有资源”。您将在数据持久化部分找到 ClickHouse，或者您可以搜索 ClickHouse。

点击 ClickHouse 卡片以创建新资源。

- 注意：为此资源添加备注。
- 服务器地址：这是您 ClickHouse Cloud 服务的地址，记得不要忘记端口。
- 数据库名称：上面步骤中创建的 `emqx`。
- 用户：连接到 ClickHouse Cloud 服务的用户名。
- 密钥：用于连接的密码。

<Image img={data_integration_resource} size="lg" border alt="EMQX Cloud ClickHouse 资源设置表单，带有连接详细信息" />

### 创建新规则 {#create-a-new-rule}

在创建资源时，您将看到一个弹出窗口，点击“新建”将引导您进入规则创建页面。

EMQX 提供了一个强大的 [规则引擎](https://docs.emqx.com/en/cloud/latest/rule_engine/rules.html)，可以在将原始 MQTT 消息发送到第三方系统之前进行转换和丰富。

这是本教程中使用的规则：

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

它将从 `temp_hum/emqx` 主题读取消息，并通过添加 client_id、topic 和时间戳信息来丰富 JSON 对象。

因此，您发送到主题的原始 JSON 为：

```bash
{"temp": 28.5, "hum": 0.68}
```

<Image img={data_integration_rule_1} size="md" border alt="EMQX Cloud 数据集成规则创建第 1 步，显示 SQL 查询" />

您可以使用 SQL 测试来测试并查看结果。

<Image img={data_integration_rule_2} size="md" border alt="EMQX Cloud 数据集成规则创建第 2 步，显示测试结果" />

现在点击“下一步”按钮。此步骤是告诉 EMQX Cloud 如何将经过过滤的数据插入到您的 ClickHouse 数据库中。

### 添加响应操作 {#add-a-response-action}

如果您只有一个资源，则无需修改“资源”和“操作类型”。
您只需设置 SQL 模板。以下是本教程中使用的示例：

```bash
INSERT INTO temp_hum (client_id, timestamp, topic, temp, hum) VALUES ('${client_id}', ${timestamp}, '${topic}', ${temp}, ${hum})
```

<Image img={data_integration_rule_action} size="md" border alt="EMQX Cloud 数据集成规则操作设置，带有 SQL 模板" />

这是一个用于将数据插入 ClickHouse 的模板，您可以看到此处使用的变量。

### 查看规则详细信息 {#view-rules-details}

点击“确认”和“查看详细信息”。现在，所有内容都应该设置正确。您可以在规则详细页面查看数据集成是否正常工作。

<Image img={data_integration_details} size="md" border alt="EMQX Cloud 数据集成规则详细信息，显示配置摘要" />

所有发送到 `temp_hum/emqx` 主题的 MQTT 消息将被持久化到您的 ClickHouse Cloud 数据库中。

## 将数据保存到 ClickHouse {#saving-data-into-clickhouse}

我们将模拟温度和湿度数据，并通过 MQTT X 将这些数据上报给 EMQX Cloud，然后使用 EMQX Cloud 数据集成将数据保存到 ClickHouse Cloud。

<Image img={work_flow} size="lg" border alt="EMQX Cloud 到 ClickHouse 工作流图，显示数据流" />

### 将 MQTT 消息发布到 EMQX Cloud {#publish-mqtt-messages-to-emqx-cloud}

您可以使用任何 MQTT 客户端或 SDK 发布消息。在本教程中，我们将使用 [MQTT X](https://mqttx.app/)，这是 EMQ 提供的用户友好的 MQTT 客户端应用程序。

<Image img={mqttx_overview} size="lg" border alt="MQTTX 概述，显示客户端界面" />

在 MQTTX 中点击“新建连接”，填写连接表单：

- 名称：连接名称。使用您喜欢的任何名称。
- 主机：MQTT 代理连接地址。您可以从 EMQX Cloud 概述页面获取。
- 端口：MQTT 代理连接端口。您可以从 EMQX Cloud 概述页面获取。
- 用户名/密码：使用上面创建的凭证，在本教程中应该是 `emqx` 和 `xxxxxx`。

<Image img={mqttx_new} size="lg" border alt="MQTTX 新建连接设置表单，带有连接详细信息" />

点击右上角的“连接”按钮，连接应成功建立。

现在，您可以使用此工具向 MQTT 代理发送消息。
输入：
1. 设置有效载荷格式为“JSON”。
2. 设置主题为：`temp_hum/emqx`（我们在规则中刚设置的主题）
3. JSON 主体：

```bash
{"temp": 23.1, "hum": 0.68}
```

点击右侧的发送按钮。您可以更改温度值并向 MQTT 代理发送更多数据。

发送到 EMQX Cloud 的数据应通过规则引擎处理，并自动插入到 ClickHouse Cloud 中。

<Image img={mqttx_publish} size="lg" border alt="MQTTX 发布 MQTT 消息界面，显示消息构成" />

### 查看规则监控 {#view-rules-monitoring}

检查规则监控并将成功数量加一。

<Image img={rule_monitor} size="lg" border alt="EMQX Cloud 规则监控仪表板，显示消息处理指标" />

### 检查持久化的数据 {#check-the-data-persisted}

现在是时候查看 ClickHouse Cloud 中的数据了。理想情况下，您使用 MQTTX 发送的数据将通过 EMQX Cloud 持久化到 ClickHouse Cloud 的数据库中。

您可以连接到 ClickHouse Cloud 面板中的 SQL 控制台，或使用任何客户端工具从 ClickHouse 中获取数据。在本教程中，我们使用了 SQL 控制台。
通过执行 SQL：

```bash
SELECT * FROM emqx.temp_hum;
```

<Image img={clickhouse_result} size="lg" border alt="ClickHouse 查询结果，显示已持久化的 IoT 数据" />

### 总结 {#summary}

您没有编写任何代码，现在 MQTT 数据已经从 EMQX Cloud 移动到了 ClickHouse Cloud。通过 EMQX Cloud 和 ClickHouse Cloud，您不需要管理基础设施，只需专注于编写 IoT 应用程序，数据安全地存储在 ClickHouse Cloud 中。
