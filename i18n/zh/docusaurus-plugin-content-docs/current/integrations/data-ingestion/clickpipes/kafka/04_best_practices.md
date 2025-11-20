---
sidebar_label: '最佳实践'
description: '详细介绍在使用 Kafka ClickPipes 时应遵循的最佳实践'
slug: /integrations/clickpipes/kafka/best-practices
sidebar_position: 1
title: '最佳实践'
doc_type: 'guide'
keywords: ['kafka best practices', 'clickpipes', 'compression', 'authentication', 'scaling']
---



# 最佳实践 {#best-practices}


## 消息压缩 {#compression}

我们强烈建议为 Kafka 主题启用压缩。压缩可以显著降低数据传输成本,且几乎不会影响性能。

要深入了解 Kafka 中的消息压缩,建议从这份[指南](https://www.confluent.io/blog/apache-kafka-message-compression/)开始。


## 限制 {#limitations}

- 不支持 [`DEFAULT`](/sql-reference/statements/create/table#default)。


## 投递语义 {#delivery-semantics}

ClickPipes for Kafka 提供 `at-least-once`(至少一次)投递语义(作为最常用的方式之一)。我们非常希望听到您对投递语义的反馈,请通过[联系表单](https://clickhouse.com/company/contact?loc=clickpipes)与我们联系。如果您需要 exactly-once(恰好一次)语义,我们建议使用官方的 [`clickhouse-kafka-connect`](https://clickhouse.com/blog/real-time-event-streaming-with-kafka-connect-confluent-cloud-clickhouse) sink。


## 身份验证 {#authentication}

对于 Apache Kafka 协议数据源,ClickPipes 支持带 TLS 加密的 [SASL/PLAIN](https://docs.confluent.io/platform/current/kafka/authentication_sasl/authentication_sasl_plain.html) 身份验证,以及 `SASL/SCRAM-SHA-256` 和 `SASL/SCRAM-SHA-512`。根据流数据源(Redpanda、MSK 等)的不同,将基于兼容性启用全部或部分身份验证机制。如果您的身份验证需求有所不同,请[向我们反馈](https://clickhouse.com/company/contact?loc=clickpipes)。

### IAM {#iam}

:::info
MSK ClickPipe 的 IAM 身份验证是测试版功能。
:::

ClickPipes 支持以下 AWS MSK 身份验证方式:

- [SASL/SCRAM-SHA-512](https://docs.aws.amazon.com/msk/latest/developerguide/msk-password.html) 身份验证
- [IAM 凭证或基于角色的访问](https://docs.aws.amazon.com/msk/latest/developerguide/how-to-use-iam-access-control.html)身份验证

使用 IAM 身份验证连接到 MSK 代理时,IAM 角色必须具有必要的权限。
以下是 MSK Apache Kafka API 所需 IAM 策略的示例:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["kafka-cluster:Connect"],
      "Resource": [
        "arn:aws:kafka:us-west-2:12345678912:cluster/clickpipes-testing-brokers/b194d5ae-5013-4b5b-ad27-3ca9f56299c9-10"
      ]
    },
    {
      "Effect": "Allow",
      "Action": ["kafka-cluster:DescribeTopic", "kafka-cluster:ReadData"],
      "Resource": [
        "arn:aws:kafka:us-west-2:12345678912:topic/clickpipes-testing-brokers/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": ["kafka-cluster:AlterGroup", "kafka-cluster:DescribeGroup"],
      "Resource": [
        "arn:aws:kafka:us-east-1:12345678912:group/clickpipes-testing-brokers/*"
      ]
    }
  ]
}
```

#### 配置信任关系 {#configuring-a-trusted-relationship}

如果您使用 IAM 角色 ARN 对 MSK 进行身份验证,则需要在您的 ClickHouse Cloud 实例与该角色之间添加信任关系,以便该角色可以被代入。

:::note
基于角色的访问仅适用于部署在 AWS 上的 ClickHouse Cloud 实例。
:::

```json
{
    "Version": "2012-10-17",
    "Statement": [
        ...
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::12345678912:role/CH-S3-your-clickhouse-cloud-role"
            },
            "Action": "sts:AssumeRole"
        },
    ]
}
```

### 自定义证书 {#custom-certificates}

ClickPipes for Kafka 支持为使用非公开服务器证书的 Kafka 代理上传自定义证书。
还支持上传客户端证书和密钥以进行基于双向 TLS (mTLS) 的身份验证。


## 性能 {#performance}

### 批处理 {#batching}

ClickPipes 以批处理方式将数据插入 ClickHouse。这样做是为了避免在数据库中创建过多的数据部分,从而导致集群出现性能问题。

当满足以下任一条件时,批次将被插入:

- 批次大小已达到最大值(每 1GB pod 内存对应 100,000 行或 32MB)
- 批次已打开的时间达到最大值(5 秒)

### 延迟 {#latency}

延迟(定义为从 Kafka 消息生成到消息在 ClickHouse 中可用之间的时间)取决于多种因素(例如 broker 延迟、网络延迟、消息大小/格式)。上述章节中描述的[批处理](#batching)也会影响延迟。我们始终建议使用典型负载测试您的特定用例,以确定预期延迟。

ClickPipes 不提供任何关于延迟的保证。如果您有特定的低延迟要求,请[联系我们](https://clickhouse.com/company/contact?loc=clickpipes)。

### 扩展 {#scaling}

ClickPipes for Kafka 设计为可水平和垂直扩展。默认情况下,我们创建一个包含单个消费者的消费者组。这可以在创建 ClickPipe 期间配置,或在任何其他时间点通过 **设置** -> **高级设置** -> **扩展** 进行配置。

ClickPipes 通过可用区分布式架构提供高可用性。
这需要扩展到至少两个消费者。

无论运行的消费者数量如何,容错能力在设计上都是可用的。
如果消费者或其底层基础设施发生故障,
ClickPipe 将自动重启消费者并继续处理消息。

### 基准测试 {#benchmarks}

以下是 ClickPipes for Kafka 的一些非正式基准测试,可用于了解基线性能的大致情况。需要注意的是,许多因素都会影响性能,包括消息大小、数据类型和数据格式。您的实际情况可能有所不同,我们在此展示的内容并不保证实际性能。

基准测试详情:

- 我们使用了具有足够资源的生产环境 ClickHouse Cloud 服务,以确保吞吐量不会受到 ClickHouse 端插入处理的瓶颈限制。
- ClickHouse Cloud 服务、Kafka 集群(Confluent Cloud)和 ClickPipe 都在同一区域(`us-east-2`)中运行。
- ClickPipe 配置了单个 L 型副本(4 GiB RAM 和 1 vCPU)。
- 示例数据包含嵌套数据,混合了 `UUID`、`String` 和 `Int` 数据类型。其他数据类型,如 `Float`、`Decimal` 和 `DateTime`,性能可能较低。
- 使用压缩和未压缩数据在性能上没有明显差异。

| 副本大小 | 消息大小 | 数据格式 | 吞吐量 |
| ------------ | ------------ | ----------- | ---------- |
| Large (L)    | 1.6kb        | JSON        | 63mb/s     |
| Large (L)    | 1.6kb        | Avro        | 99mb/s     |
