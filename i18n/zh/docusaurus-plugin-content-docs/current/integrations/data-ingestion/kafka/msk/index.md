---
'sidebar_label': '使用 Kafka 连接器接收的 Amazon MSK'
'sidebar_position': 1
'slug': '/integrations/kafka/cloud/amazon-msk/'
'description': '来自 ClickHouse 的官方 Kafka 连接器与 Amazon MSK'
'keywords':
- 'integration'
- 'kafka'
- 'amazon msk'
- 'sink'
- 'connector'
'title': '将 Amazon MSK 与 ClickHouse 集成'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# 将 Amazon MSK 与 ClickHouse 集成

<div class='vimeo-container'>
  <iframe src="//www.youtube.com/embed/6lKI_WlQ3-s"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
    fullscreen;
    picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

## 先决条件 {#prerequisites}
我们假设：
* 您熟悉 [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)、Amazon MSK 和 MSK 连接器。我们推荐 Amazon MSK 的 [入门指南](https://docs.aws.amazon.com/msk/latest/developerguide/getting-started.html) 和 [MSK Connect 指南](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect.html)。
* MSK 代理是公开可访问的。请参阅开发者指南的 [公共访问](https://docs.aws.amazon.com/msk/latest/developerguide/public-access.html) 部分。

## ClickHouse 的官方 Kafka 连接器与 Amazon MSK {#the-official-kafka-connector-from-clickhouse-with-amazon-msk}

### 收集连接详细信息 {#gather-your-connection-details}

<ConnectionDetails />

### 步骤 {#steps}
1. 确保您熟悉 [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)
1. [创建一个 MSK 实例](https://docs.aws.amazon.com/msk/latest/developerguide/create-cluster.html)。
1. [创建并分配 IAM 角色](https://docs.aws.amazon.com/msk/latest/developerguide/create-client-iam-role.html)。
1. 从 ClickHouse Connect Sink 的 [发布页面](https://github.com/ClickHouse/clickhouse-kafka-connect/releases) 下载一个 `jar` 文件。
1. 在 Amazon MSK 控制台的 [自定义插件页面](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-plugins.html) 上安装下载的 `jar` 文件。
1. 如果连接器与公共 ClickHouse 实例通信，请 [启用互联网访问](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-internet-access.html)。
1. 在配置中提供主题名称、ClickHouse 实例主机名和密码。
```yml
connector.class=com.clickhouse.kafka.connect.ClickHouseSinkConnector
tasks.max=1
topics=<topic_name>
ssl=true
security.protocol=SSL
hostname=<hostname>
database=<database_name>
password=<password>
ssl.truststore.location=/tmp/kafka.client.truststore.jks
port=8443
value.converter.schemas.enable=false
value.converter=org.apache.kafka.connect.json.JsonConverter
exactlyOnce=true
username=default
schemas.enable=false
```

## 性能调优 {#performance-tuning}
提高性能的一种方法是通过在 **worker** 配置中添加以下内容来调整批处理大小和从 Kafka 获取的记录数量：
```yml
consumer.max.poll.records=[NUMBER OF RECORDS]
consumer.max.partition.fetch.bytes=[NUMBER OF RECORDS * RECORD SIZE IN BYTES]
```

您使用的具体值将根据所需的记录数量和记录大小而有所不同。例如，默认值为：

```yml
consumer.max.poll.records=500
consumer.max.partition.fetch.bytes=1048576
```

您可以在官方的 [Kafka](https://kafka.apache.org/documentation/#consumerconfigs) 和 [Amazon MSK](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-workers.html#msk-connect-create-custom-worker-config) 文档中找到更多细节（包括实施和其他考虑因素）。

## 有关 MSK Connect 的网络注意事项 {#notes-on-networking-for-msk-connect}

为了使 MSK Connect 能够连接到 ClickHouse，我们建议您的 MSK 集群位于一个具有连接互联网访问的私有子网中，并连接一个私有 NAT。以下是如何设置的说明。请注意，公共子网是支持的，但由于需要不断为您的 ENI 分配弹性 IP 地址，因此不建议使用，[AWS 在这里提供了更多详情](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-internet-access.html)

1. **创建一个私有子网：** 在您的 VPC 中创建一个新子网，并将其指定为私有子网。此子网不应具有直接访问互联网的权限。
1. **创建 NAT 网关：** 在您 VPC 的公共子网中创建一个 NAT 网关。NAT 网关使私有子网中的实例能够连接到互联网或其他 AWS 服务，但防止互联网与这些实例建立连接。
1. **更新路由表：** 添加一条将互联网流量定向到 NAT 网关的路由。
1. **确保安全组和网络 ACL 配置：** 配置您的 [安全组](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html) 和 [网络 ACL（访问控制列表）](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html)，以允许与 ClickHouse 实例之间的相关流量进出。
   1. 对于 ClickHouse Cloud，配置您的安全组以允许在端口 9440 和 8443 上的入站流量。
   1. 对于自托管 ClickHouse，配置您的安全组以允许在配置文件中的端口上进行入站流量（默认是 8123）。
1. **将安全组附加到 MSK：** 确保这些新的路由到 NAT 网关的安全组已附加到您的 MSK 集群。
