---
'sidebar_label': 'EMQX'
'sidebar_position': 1
'slug': '/integrations/emqx'
'description': '将 EMQX 与 ClickHouse 的介绍'
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

[EMQX](https://www.emqx.com/en/try?product=enterprise) 是一个开源的 MQTT 代理，具有高性能的实时消息处理引擎，支持大规模物联网设备的事件流转。作为最具可扩展性的 MQTT 代理，EMQX 可以帮助您以任何规模连接任何设备。随时随地移动和处理您的物联网数据。

[EMQX Cloud](https://www.emqx.com/en/try?product=cloud) 是一个托管于 [EMQ](https://www.emqx.com/en) 的物联网领域的 MQTT 消息中间件产品。作为全球首个完全托管的 MQTT 5.0 云消息服务，EMQX Cloud 提供了一站式运维共址和独特的隔离环境以支持 MQTT 消息服务。在万物互联的时代，EMQX Cloud 可以帮助您快速构建物联网领域的行业应用，轻松收集、传输、计算和持久化 IoT 数据。

凭借云服务提供商提供的基础设施，EMQX Cloud 服务于世界各地数十个国家和地区，为 5G 和互联网应用提供低成本、安全且可靠的云服务。

<Image img={emqx_cloud_artitecture} size="lg" border alt="EMQX Cloud 架构图，展示云基础设施组件" />

### 假设 {#assumptions}

* 您熟悉 [MQTT 协议](https://mqtt.org/)，该协议被设计为一个极其轻量级的发布/订阅消息传输协议。
* 您正在使用 EMQX 或 EMQX Cloud 作为实时消息处理引擎，支持大规模物联网设备的事件流转。
* 您已经准备好了一个 Clickhouse Cloud 实例来持久化设备数据。
* 我们使用 [MQTT X](https://mqttx.app/) 作为 MQTT 客户端测试工具来连接 EMQX Cloud 的部署并发布 MQTT 数据。或者其他连接到 MQTT 代理的方法也可以完成这一工作。

## 获取您的 ClickHouse Cloud 服务 {#get-your-clickhouse-cloudservice}

在此设置过程中，我们在 AWS 的 N. Virginia (us-east-1) 部署了 ClickHouse 实例，同时也在同一地区部署了 EMQX Cloud 实例。

<Image img={clickhouse_cloud_1} size="sm" border alt="ClickHouse Cloud 服务部署界面，展示 AWS 区域选择" />

在设置过程中，您还需要注意连接设置。在本教程中，我们选择了“任何地方”，但是如果您申请特定位置，您需要将从 EMQX Cloud 部署获取的 [NAT gateway](https://docs.emqx.com/en/cloud/latest/vas/nat-gateway.html) IP 地址添加到白名单中。

<Image img={clickhouse_cloud_2} size="sm" border alt="ClickHouse Cloud 连接设置，展示 IP 访问配置" />

然后，您需要保存您的用户名和密码以备将来使用。

<Image img={clickhouse_cloud_3} size="sm" border alt="ClickHouse Cloud 凭据界面，展示用户名和密码" />

之后，您将获得一个正在运行的 Clickhouse 实例。点击“连接”以获取 Clickhouse Cloud 的实例连接地址。

<Image img={clickhouse_cloud_4} size="lg" border alt="ClickHouse Cloud 正在运行的实例仪表板，展示连接选项" />

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

<Image img={clickhouse_cloud_6} size="lg" border alt="ClickHouse Cloud 创建数据库和表的 SQL 查询执行" />

## 在 EMQX Cloud 上创建 MQTT 服务 {#create-an-mqtt-service-on-emqx-cloud}

在 EMQX Cloud 上创建一个专用的 MQTT 代理只需几个点击。

### 获取账户 {#get-an-account}

EMQX Cloud 为每个账户提供 14 天的免费试用，包括标准部署和专业部署。

如果您是 EMQX Cloud 新用户，请访问 [EMQX Cloud 注册](https://accounts.emqx.com/signup?continue=https%3A%2F%2Fwww.emqx.com%2Fen%2Fcloud) 页面，并点击开始免费注册一个账户。

<Image img={emqx_cloud_sign_up} size="lg" border alt="EMQX Cloud 注册页面，展示注册表单" />

### 创建 MQTT 集群 {#create-an-mqtt-cluster}

登录后，点击账户菜单下的“云控制台”，您将能看到创建新部署的绿色按钮。

<Image img={emqx_cloud_create_1} size="lg" border alt="EMQX Cloud 创建部署步骤 1，展示部署选项" />

在本教程中，我们将使用专业部署，因为只有 Pro 版本提供数据集成功能，可以直接将 MQTT 数据发送到 ClickHouse 而无需编写一行代码。

选择 Pro 版本，选择 `N.Virginia` 区域，然后点击 `立即创建`。几分钟后，您将获得一个完全托管的 MQTT 代理：

<Image img={emqx_cloud_create_2} size="lg" border alt="EMQX Cloud 创建部署步骤 2，展示区域选择" />

现在点击面板以进入集群视图。在该仪表板上，您将看到 MQTT 代理的概览。

<Image img={emqx_cloud_overview} size="lg" border alt="EMQX Cloud 概览仪表板，展示代理指标" />

### 添加客户端凭据 {#add-client-credential}

EMQX Cloud 默认不允许匿名连接，因此您需要添加客户端凭据，以便使用 MQTT 客户端工具向此代理发送数据。

点击左侧菜单中的“身份验证与 ACL”，然后在子菜单中点击“身份验证”。点击右侧的“添加”按钮并为稍后 MQTT 连接提供用户名和密码。我们将使用 `emqx` 和 `xxxxxx` 作为用户名和密码。

<Image img={emqx_cloud_auth} size="lg" border alt="EMQX Cloud 身份验证设置界面，用于添加凭据" />

点击“确认”，现在我们有一个完全托管的 MQTT 代理准备就绪。

### 启用 NAT 网关 {#enable-nat-gateway}

在我们开始设置 ClickHouse 集成之前，我们需要先启用 NAT 网关。默认情况下，MQTT 代理部署在私有 VPC 中，无法通过公共网络发送数据到第三方系统。

返回概览页面，向下滚动到页面底部，您将看到 NAT 网关小部件。点击订阅按钮并按照说明进行操作。请注意，NAT 网关是一个增值服务，但它也提供 14 天的免费试用。

<Image img={emqx_cloud_nat_gateway} size="lg" border alt="EMQX Cloud NAT 网关配置面板" />

创建完成后，您将在小部件中找到公共 IP 地址。请注意，如果您在 ClickHouse Cloud 设置过程中选择了“从特定位置连接”，您需要将此 IP 地址添加到白名单中。

## 将 EMQX Cloud 与 ClickHouse Cloud 集成 {#integration-emqx-cloud-with-clickhouse-cloud}

[EMQX Cloud 数据集成](https://docs.emqx.com/en/cloud/latest/rule_engine/introduction.html#general-flow) 用于配置处理和响应 EMQX 消息流和设备事件的规则。数据集成不仅提供了清晰且灵活的“可配置”架构解决方案，还简化了开发过程，提高了用户可用性，并降低了业务系统与 EMQX Cloud 之间的耦合度。它还为自定义 EMQX Cloud 专有功能提供了出色的基础设施。

<Image img={emqx_cloud_data_integration} size="lg" border alt="EMQX Cloud 数据集成选项，展示可用连接器" />

EMQX Cloud 提供 30 多个与流行数据系统的原生集成。ClickHouse 是其中之一。

<Image img={data_integration_clickhouse} size="lg" border alt="EMQX Cloud ClickHouse 数据集成连接器详情" />

### 创建 ClickHouse 资源 {#create-clickhouse-resource}

点击左侧菜单中的“数据集成”，然后点击“查看所有资源”。您将在数据持久性部分找到 ClickHouse，或者可以搜索 ClickHouse。

点击 ClickHouse 卡片以创建新资源。

- 注意：为该资源添加注释。
- 服务器地址：这是您的 ClickHouse Cloud 服务的地址，请务必不要忘记端口。
- 数据库名称：`emqx`，我们在之前的步骤中创建的。
- 用户：连接到您的 ClickHouse Cloud 服务的用户名。
- 密钥：连接的密码。

<Image img={data_integration_resource} size="lg" border alt="EMQX Cloud ClickHouse 资源设置表单，展示连接详情" />

### 创建新规则 {#create-a-new-rule}

在创建资源时，您会看到一个弹出窗口，点击“新建”将引导您进入规则创建页面。

EMQX 提供了强大的 [规则引擎](https://docs.emqx.com/en/cloud/latest/rule_engine/rules.html)，可以在将原始 MQTT 消息发送到第三方系统之前进行转换和丰富。

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

它将从 `temp_hum/emqx` 主题中读取消息，并通过添加 client_id、主题和时间戳信息来丰富 JSON 对象。

因此，您发送到主题的原始 JSON：

```bash
{"temp": 28.5, "hum": 0.68}
```

<Image img={data_integration_rule_1} size="md" border alt="EMQX Cloud 数据集成规则创建步骤 1，展示 SQL 查询" />

您可以使用 SQL 测试来测试并查看结果。

<Image img={data_integration_rule_2} size="md" border alt="EMQX Cloud 数据集成规则创建步骤 2，展示测试结果" />

现在点击“下一步”按钮。这一步是告诉 EMQX Cloud 如何将经过处理的数据插入到您的 ClickHouse 数据库中。

### 添加响应行动 {#add-a-response-action}

如果您只有一个资源，您不需要修改“资源”和“行动类型”。
您只需设置 SQL 模板。以下是本教程使用的示例：

```bash
INSERT INTO temp_hum (client_id, timestamp, topic, temp, hum) VALUES ('${client_id}', ${timestamp}, '${topic}', ${temp}, ${hum})
```

<Image img={data_integration_rule_action} size="md" border alt="EMQX Cloud 数据集成规则行动设置，展示 SQL 模板" />

这是一个插入数据到 Clickhouse 的模板，您可以看到这里使用了变量。

### 查看规则详情 {#view-rules-details}

点击“确认”和“查看详情”。现在，一切应该都设置好了。您可以在规则详情页面看到数据集成的工作情况。

<Image img={data_integration_details} size="md" border alt="EMQX Cloud 数据集成规则详情，展示配置摘要" />

所有发送到 `temp_hum/emqx` 主题的 MQTT 消息将持久化到您的 ClickHouse Cloud 数据库中。

## 将数据保存到 ClickHouse {#saving-data-into-clickhouse}

我们将模拟温度和湿度数据，并通过 MQTT X 将这些数据报告到 EMQX Cloud，然后使用 EMQX Cloud 数据集成将数据保存到 ClickHouse Cloud。

<Image img={work_flow} size="lg" border alt="EMQX Cloud 到 ClickHouse 的工作流程图，展示数据流" />

### 发布 MQTT 消息到 EMQX Cloud {#publish-mqtt-messages-to-emqx-cloud}

您可以使用任何 MQTT 客户端或 SDK 发布消息。在本教程中，我们将使用 [MQTT X](https://mqttx.app/)，这是 EMQ 提供的用户友好的 MQTT 客户端应用程序。

<Image img={mqttx_overview} size="lg" border alt="MQTTX 概述，展示客户端界面" />

在 MQTTX 上点击“新连接”并填写连接表单：

- 名称：连接名称。可以使用您想要的任何名称。
- 主机：MQTT 代理的连接地址。您可以在 EMQX Cloud 概览页面获取它。
- 端口：MQTT 代理连接端口。您可以在 EMQX Cloud 概览页面获取它。
- 用户名/密码：使用上面创建的凭据，本教程中应为 `emqx` 和 `xxxxxx`。

<Image img={mqttx_new} size="lg" border alt="MQTTX 新连接设置表单，展示连接详情" />

点击右上角的“连接”按钮，连接应该建立。

现在您可以使用该工具向 MQTT 代理发送消息。
输入：
1. 将有效负载格式设置为“JSON”。
2. 设置主题：`temp_hum/emqx`（我们刚在规则中设置的主题）
3. JSON 主体：

```bash
{"temp": 23.1, "hum": 0.68}
```

点击右侧的发送按钮。您可以更改温度值并向 MQTT 代理发送更多数据。

发送到 EMQX Cloud 的数据应由规则引擎处理并自动插入到 ClickHouse Cloud 中。

<Image img={mqttx_publish} size="lg" border alt="MQTTX 发布 MQTT 消息界面，展示消息构建" />

### 查看规则监控 {#view-rules-monitoring}

检查规则监控并在成功数量上加一。

<Image img={rule_monitor} size="lg" border alt="EMQX Cloud 规则监控仪表板，展示消息处理指标" />

### 检查已持久化的数据 {#check-the-data-persisted}

现在是查看 ClickHouse Cloud 中数据的时候了。理想情况下，您使用 MQTTX 发送的数据将通过 EMQX Cloud 传输，并凭借原生数据集成功能持久化到 ClickHouse Cloud 的数据库中。

您可以连接到 ClickHouse Cloud 面板上的 SQL 控制台，或使用任何客户端工具从 ClickHouse 中获取数据。在本教程中，我们使用了 SQL 控制台。
通过执行 SQL：

```bash
SELECT * FROM emqx.temp_hum;
```

<Image img={clickhouse_result} size="lg" border alt="ClickHouse 查询结果，展示已持久化的物联网数据" />

### 总结 {#summary}

您没有编写任何代码，现在 MQTT 数据从 EMQX Cloud 移动到 ClickHouse Cloud。有了 EMQX Cloud 和 ClickHouse Cloud，您无需管理基础设施，专注于编写物联网应用程序，数据安全地存储在 ClickHouse Cloud 中。
