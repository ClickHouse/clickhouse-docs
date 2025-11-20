---
sidebar_label: 'Amazon MSK 与 Kafka Connector Sink'
sidebar_position: 1
slug: /integrations/kafka/cloud/amazon-msk/
description: 'ClickHouse 面向 Amazon MSK 的官方 Kafka 连接器'
keywords: ['integration', 'kafka', 'amazon msk', 'sink', 'connector']
title: '将 Amazon MSK 与 ClickHouse 集成'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_ingestion'
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

> 注意：视频中展示的策略权限较为宽松，仅用于快速上手。有关最小权限配置，请参阅下文的 IAM 指南。



## 前置条件 {#prerequisites}

我们假设：

- 您已熟悉 [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)、Amazon MSK 和 MSK Connectors。我们建议您阅读 Amazon MSK [入门指南](https://docs.aws.amazon.com/msk/latest/developerguide/getting-started.html)和 [MSK Connect 指南](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect.html)。
- MSK broker 可公开访问。请参阅开发者指南的[公共访问](https://docs.aws.amazon.com/msk/latest/developerguide/public-access.html)部分。


## 使用 ClickHouse 官方 Kafka 连接器与 Amazon MSK 集成 {#the-official-kafka-connector-from-clickhouse-with-amazon-msk}

### 收集连接详细信息 {#gather-your-connection-details}

<ConnectionDetails />

### 步骤 {#steps}

1. 确保您已熟悉 [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)
1. [创建 MSK 实例](https://docs.aws.amazon.com/msk/latest/developerguide/create-cluster.html)。
1. [创建并分配 IAM 角色](https://docs.aws.amazon.com/msk/latest/developerguide/create-client-iam-role.html)。
1. 从 ClickHouse Connect Sink [发布页面](https://github.com/ClickHouse/clickhouse-kafka-connect/releases)下载 `jar` 文件。
1. 在 Amazon MSK 控制台的[自定义插件页面](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-plugins.html)安装已下载的 `jar` 文件。
1. 如果连接器需要与公网 ClickHouse 实例通信,请[启用互联网访问](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-internet-access.html)。
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


## 推荐的 IAM 权限(最小权限原则) {#iam-least-privilege}

使用满足您配置需求的最小权限集。从以下基准配置开始,仅在实际使用时添加可选服务的权限。

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "MSKClusterAccess",
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
      "Sid": "KafkaAuthorization",
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
      "Sid": "OptionalGlueSchemaRegistry",
      "Effect": "Allow",
      "Action": [
        "glue:GetSchema*",
        "glue:ListSchemas",
        "glue:ListSchemaVersions"
      ],
      "Resource": "*"
    },
    {
      "Sid": "OptionalSecretsManager",
      "Effect": "Allow",
      "Action": ["secretsmanager:GetSecretValue"],
      "Resource": [
        "arn:aws:secretsmanager:<region>:<account-id>:secret:<your-secret-name>*"
      ]
    },
    {
      "Sid": "OptionalS3Read",
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::<your-bucket>/<optional-prefix>/*"
    }
  ]
}
```

- 仅在使用 AWS Glue Schema Registry 时才需要 Glue 权限块。
- 仅在从 Secrets Manager 获取凭证或信任存储时才需要 Secrets Manager 权限块。请将 ARN 限定到具体资源范围。
- 仅在从 S3 加载工件(例如信任存储)时才需要 S3 权限块。请将权限范围限定到具体的存储桶和前缀。

另请参阅:[Kafka 最佳实践 – IAM](../../clickpipes/kafka/04_best_practices.md#iam)。


## 性能调优 {#performance-tuning}

提升性能的一种方法是调整批次大小和从 Kafka 获取的记录数量,可以通过在 **worker** 配置中添加以下内容来实现:

```yml
consumer.max.poll.records=[记录数量]
consumer.max.partition.fetch.bytes=[记录数量 * 每条记录字节大小]
```

具体使用的值会根据期望的记录数量和记录大小而有所不同。例如,默认值为:

```yml
consumer.max.poll.records=500
consumer.max.partition.fetch.bytes=1048576
```

您可以在官方 [Kafka](https://kafka.apache.org/documentation/#consumerconfigs) 和 [Amazon MSK](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-workers.html#msk-connect-create-custom-worker-config) 文档中找到更多详细信息(包括实现细节和其他注意事项)。


## MSK Connect 网络配置说明 {#notes-on-networking-for-msk-connect}

为了使 MSK Connect 能够连接到 ClickHouse,我们建议将 MSK 集群部署在私有子网中,并通过 NAT 网关连接互联网。下面提供了相关配置说明。请注意,虽然支持公有子网,但不推荐使用,因为需要持续为 ENI 分配弹性 IP 地址,[AWS 在此处提供了更多详细信息](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-internet-access.html)

1. **创建私有子网:** 在 VPC 中创建一个新子网,将其指定为私有子网。该子网不应具有直接访问互联网的能力。
1. **创建 NAT 网关:** 在 VPC 的公有子网中创建一个 NAT 网关。NAT 网关使私有子网中的实例能够连接到互联网或其他 AWS 服务,但阻止互联网主动发起与这些实例的连接。
1. **更新路由表:** 添加一条路由,将发往互联网的流量定向到 NAT 网关
1. **确保安全组和网络 ACL 配置:** 配置[安全组](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html)和[网络 ACL(访问控制列表)](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html)以允许相关流量。
   1. 从 MSK Connect 工作节点 ENI 到 MSK 代理的 TLS 端口(通常为 9094)。
   1. 从 MSK Connect 工作节点 ENI 到 ClickHouse 端点:9440(原生 TLS)或 8443(HTTPS)。
   1. 在代理安全组上允许来自 MSK Connect 工作节点安全组的入站流量。
   1. 对于自托管的 ClickHouse,开放服务器中配置的端口(HTTP 默认为 8123)。
1. **将安全组附加到 MSK:** 确保这些安全组已附加到 MSK 集群和 MSK Connect 工作节点。
1. **连接到 ClickHouse Cloud:**
   1. 公共端点 + IP 白名单:需要从私有子网通过 NAT 出站。
   1. 在可用的情况下使用私有连接(例如 VPC 对等连接/PrivateLink/VPN)。确保已启用 VPC DNS 主机名/解析,并且 DNS 能够解析私有端点。
1. **验证连接性(快速检查清单):**
   1. 从连接器环境中,解析 MSK 引导 DNS 并通过 TLS 连接到代理端口。
   1. 在端口 9440(或 HTTPS 的 8443)上建立到 ClickHouse 的 TLS 连接。
   1. 如果使用 AWS 服务(Glue/Secrets Manager),允许到这些端点的出站流量。
