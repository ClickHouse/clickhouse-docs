---
sidebar_label: 'Amazon MSK 与 Kafka Connector Sink'
sidebar_position: 1
slug: /integrations/kafka/cloud/amazon-msk/
description: 'ClickHouse 官方推出的、适用于 Amazon MSK 的 Kafka 连接器'
keywords: ['integration', 'kafka', 'amazon msk', 'sink', 'connector']
title: '将 Amazon MSK 与 ClickHouse 集成'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_ingestion'
---

import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# 将 Amazon MSK 与 ClickHouse 集成 {#integrating-amazon-msk-with-clickhouse}

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

> 注意：视频中展示的策略较为宽松，仅用于快速上手。请参阅下文基于最小权限原则的 IAM 指南。

## 前提条件 {#prerequisites}
我们假定：
* 你已经熟悉 [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)、Amazon MSK 和 MSK Connectors。我们推荐阅读 Amazon MSK 的[入门指南](https://docs.aws.amazon.com/msk/latest/developerguide/getting-started.html)和 [MSK Connect 指南](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect.html)。
* MSK broker 已配置为可通过公网访问。请参阅《开发者指南》中 [Public Access](https://docs.aws.amazon.com/msk/latest/developerguide/public-access.html) 章节。

## ClickHouse 官方 Kafka 连接器（适用于 Amazon MSK） {#the-official-kafka-connector-from-clickhouse-with-amazon-msk}

### 收集连接详细信息 {#gather-your-connection-details}

<ConnectionDetails />

### 步骤 {#steps}

1. 请确保已熟悉 [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)。
2. [创建一个 MSK 实例](https://docs.aws.amazon.com/msk/latest/developerguide/create-cluster.html)。
3. [创建并分配 IAM 角色](https://docs.aws.amazon.com/msk/latest/developerguide/create-client-iam-role.html)。
4. 从 ClickHouse Connect Sink 的 [发布页面](https://github.com/ClickHouse/clickhouse-kafka-connect/releases)下载 `jar` 文件。
5. 在 Amazon MSK 控制台的 [自定义插件页面](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-plugins.html)中安装下载的 `jar` 文件。
6. 如果 Connector 需要与公网 ClickHouse 实例通信，请[启用互联网访问](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-internet-access.html)。
7. 在配置中提供主题（topic）名称、ClickHouse 实例主机名和密码。

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

## 推荐的 IAM 权限（最小权限原则） {#iam-least-privilege}

仅使用部署所需的最小权限集。先从下面的基线配置开始，只有在实际使用相关服务时才添加对应的可选服务权限。

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "MSK集群访问",
      "Effect": "Allow",
      "Action": [
        "kafka:DescribeCluster",
        "kafka:GetBootstrapBrokers",
        "kafka:DescribeClusterV2",
        "kafka:ListClusters",
        "kafka:ListClustersV2"
      ],
      "Resource": "*"
    },
    {
      "Sid": "Kafka授权",
      "Effect": "Allow",
      "Action": [
        "kafka-cluster:Connect",
        "kafka-cluster:DescribeCluster",
        "kafka-cluster:DescribeGroup",
        "kafka-cluster:DescribeTopic",
        "kafka-cluster:ReadData"
      ],
      "Resource": "*"
    },
    {
      "Sid": "可选Glue模式注册表",
      "Effect": "Allow",
      "Action": [
        "glue:GetSchema*",
        "glue:ListSchemas",
        "glue:ListSchemaVersions"
      ],
      "Resource": "*"
    },
    {
      "Sid": "可选Secrets Manager",
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": [
        "arn:aws:secretsmanager:<region>:<account-id>:secret:<your-secret-name>*"
      ]
    },
    {
      "Sid": "可选S3读取",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::<your-bucket>/<optional-prefix>/*"
    }
  ]
}
```

* 仅在使用 AWS Glue Schema Registry 时使用 Glue 块。
* 仅在从 Secrets Manager 获取凭证/信任库时使用 Secrets Manager 块。限定 ARN 的作用域。
* 仅在从 S3 加载工件（例如 truststore）时使用 S3 块。将权限限定到指定 bucket/前缀。

另请参阅：[Kafka 最佳实践 – IAM](../../clickpipes/kafka/04_best_practices.md#iam)。

## 性能调优 {#performance-tuning}

提高性能的一种方法是在 **worker** 配置中添加以下内容，以调整从 Kafka 拉取的批量大小和记录数量：

```yml
consumer.max.poll.records=[记录数]
consumer.max.partition.fetch.bytes=[记录数 * 单条记录字节数]
```

您使用的具体数值会因期望的记录数量和记录大小而有所不同。例如，默认值为：

```yml
consumer.max.poll.records=500
consumer.max.partition.fetch.bytes=1048576
```

你可以在官方的 [Kafka](https://kafka.apache.org/documentation/#consumerconfigs) 文档和
[Amazon MSK](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-workers.html#msk-connect-create-custom-worker-config) 文档中查阅更多信息（包括实现细节和其他方面的考量）。

## 关于 MSK Connect 的网络注意事项 {#notes-on-networking-for-msk-connect}

为了使 MSK Connect 能够连接到 ClickHouse，我们建议将 MSK 集群部署在带有 Private NAT、可访问互联网的私有子网中。下面提供了相关设置步骤。请注意，虽然也支持使用公共子网，但并不推荐，因为需要持续为 ENI 分配 Elastic IP 地址，[AWS 在此提供了更多详细信息](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-internet-access.html)

1. **创建私有子网：** 在 VPC 中创建一个新的子网，并将其指定为私有子网。该子网不应具有直接访问互联网的能力。
1. **创建 NAT Gateway：** 在 VPC 的公共子网中创建一个 NAT Gateway。NAT Gateway 允许私有子网中的实例连接到互联网或其他 AWS 服务，但阻止互联网主动与这些实例建立连接。
1. **更新路由表：** 添加一条路由，将发往互联网的流量指向 NAT Gateway。
1. **确保安全组和网络 ACL 配置：** 配置 [security groups（安全组）](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html) 和 [network ACLs（网络访问控制列表）](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html)，以允许相关流量。
   1. 从 MSK Connect worker ENI 到 MSK broker 的 TLS 端口（通常为 9094）。
   1. 从 MSK Connect worker ENI 到 ClickHouse 端点：9440（原生 TLS）或 8443（HTTPS）。
   1. 在 broker 的安全组上允许来自 MSK Connect worker 安全组的入站流量。
   1. 对于自托管的 ClickHouse，开放服务器中配置的端口（HTTP 默认为 8123）。
1. **将安全组附加到 MSK：** 确保这些安全组已附加到 MSK 集群和 MSK Connect workers。
1. **与 ClickHouse Cloud 的连通性：**
   1. 公共端点 + IP 允许名单：需要从私有子网经由 NAT 出口访问。
   1. 在可用地区使用私有连通性（例如 VPC peering/PrivateLink/VPN）。确保已启用 VPC DNS hostnames/resolution，并且 DNS 能解析私有端点。
1. **验证连通性（快速检查清单）：**
   1. 在 connector 运行环境中，解析 MSK bootstrap DNS，并通过 TLS 连接到 broker 端口。
   1. 在端口 9440 与 ClickHouse 建立 TLS 连接（或使用 8443 进行 HTTPS）。
   1. 如果使用 AWS 服务（Glue/Secrets Manager），允许对这些端点的出口访问。
