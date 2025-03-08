---
sidebar_label: 使用 Kafka 连接器接收器与 Amazon MSK 集成
sidebar_position: 1
slug: /integrations/kafka/cloud/amazon-msk/
description: ClickHouse 与 Amazon MSK 的官方 Kafka 连接器
keywords: [integration, kafka, amazon msk, sink, connector]
---
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';


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
我们假定：
* 您对 [ClickHouse 连接器接收器](../kafka-clickhouse-connect-sink.md)、Amazon MSK 和 MSK 连接器有一定了解。我们推荐阅读 Amazon MSK 的 [入门指南](https://docs.aws.amazon.com/msk/latest/developerguide/getting-started.html) 和 [MSK 连接指南](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect.html)。
* MSK 代理是公开可访问的。请参见开发者指南的 [公共访问](https://docs.aws.amazon.com/msk/latest/developerguide/public-access.html) 部分。

## ClickHouse 与 Amazon MSK 的官方 Kafka 连接器 {#the-official-kafka-connector-from-clickhouse-with-amazon-msk}


### 收集您的连接详细信息 {#gather-your-connection-details}

<ConnectionDetails />

### 步骤 {#steps}
1. 确保您熟悉 [ClickHouse 连接器接收器](../kafka-clickhouse-connect-sink.md)
1. [创建一个 MSK 实例](https://docs.aws.amazon.com/msk/latest/developerguide/create-cluster.html)。
1. [创建并分配 IAM 角色](https://docs.aws.amazon.com/msk/latest/developerguide/create-client-iam-role.html)。
1. 从 ClickHouse Connect Sink [发布页面](https://github.com/ClickHouse/clickhouse-kafka-connect/releases) 下载 `jar` 文件。
1. 在 Amazon MSK 控制台的 [自定义插件页面](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-plugins.html) 上安装下载的 `jar` 文件。
1. 如果连接器与公共的 ClickHouse 实例通信，请 [启用互联网访问](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-internet-access.html)。
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
提高性能的一种方法是通过以下方式调整批处理大小和从 Kafka 获取的记录数量，向 **worker** 配置添加：
```yml
consumer.max.poll.records=[记录数量]
consumer.max.partition.fetch.bytes=[记录数量 * 记录大小（字节）]
```

您使用的具体值将根据所需的记录数量和记录大小而有所不同。例如，默认值为：

```yml
consumer.max.poll.records=500
consumer.max.partition.fetch.bytes=1048576
```

您可以在官方 [Kafka](https://kafka.apache.org/documentation/#consumerconfigs) 和 [Amazon MSK](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-workers.html#msk-connect-create-custom-worker-config) 文档中找到更多详细信息（包括实现和其他注意事项）。

## 关于 MSK Connect 的网络注释 {#notes-on-networking-for-msk-connect}

为了使 MSK Connect 连接到 ClickHouse，我们建议您的 MSK 集群位于私有子网中，并连接一个私有 NAT 以获得互联网访问。以下是设置的说明。请注意，公共子网是支持的，但由于需要不断将弹性 IP 地址分配给您的 ENI，因此不推荐使用，[AWS 在这里提供了更多详情](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-internet-access.html)。

1. **创建私有子网：** 在您的 VPC 内创建一个新子网，将其指定为私有子网。该子网应没有直接访问互联网的权限。
1. **创建 NAT 网关：** 在您的 VPC 的公共子网中创建一个 NAT 网关。NAT 网关使您私有子网中的实例能够连接到互联网或其他 AWS 服务，但防止互联网主动与这些实例建立连接。
1. **更新路由表：** 添加一条将互联网流量引导到 NAT 网关的路由。
1. **确保安全组和网络 ACL 配置：** 配置您的 [安全组](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html) 和 [网络 ACL（访问控制列表）](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html)，以允许从 ClickHouse 实例往返的相关流量。
   1. 对于 ClickHouse Cloud，配置您的安全组以允许在端口 9440 和 8443 上的传入流量。
   1. 对于自托管的 ClickHouse，配置您的安全组以允许在配置文件中的端口（默认是 8123）上的传入流量。
1. **将安全组附加到 MSK：** 确保这些新的安全组已经连接到了 NAT 网关，并附加到您的 MSK 集群。
