---
sidebar_label: '最佳实践'
description: '介绍在使用 Kafka ClickPipes 时应遵循的最佳实践'
slug: /integrations/clickpipes/kafka/best-practices
sidebar_position: 1
title: '最佳实践'
doc_type: 'guide'
keywords: ['kafka 最佳实践', 'clickpipes', '压缩', '身份验证', '扩展性']
---



# 最佳实践 {#best-practices}



## 消息压缩 {#compression}

我们强烈建议为 Kafka 主题启用压缩。压缩几乎不会带来性能开销，却可以在数据传输成本上带来显著节省。
要进一步了解 Kafka 中的消息压缩，我们建议从这篇[指南](https://www.confluent.io/blog/apache-kafka-message-compression/)开始阅读。



## 限制 {#limitations}

- 不支持使用 [`DEFAULT`](/sql-reference/statements/create/table#default)。



## 投递语义 {#delivery-semantics}
用于 Kafka 的 ClickPipes 提供 `at-least-once` 投递语义（这是最常用的方法之一）。欢迎您通过[联系表单](https://clickhouse.com/company/contact?loc=clickpipes)就投递语义向我们反馈意见。如果您需要 `exactly-once` 语义，建议使用我们的官方 [`clickhouse-kafka-connect`](https://clickhouse.com/blog/real-time-event-streaming-with-kafka-connect-confluent-cloud-clickhouse) sink 连接器。



## 身份验证

对于 Apache Kafka 协议数据源，ClickPipes 支持使用 TLS 加密的 [SASL/PLAIN](https://docs.confluent.io/platform/current/kafka/authentication_sasl/authentication_sasl_plain.html) 身份验证，以及 `SASL/SCRAM-SHA-256` 和 `SASL/SCRAM-SHA-512`。具体会根据流式数据源（Redpanda、MSK 等）的不同，在兼容性范围内启用全部或部分这些身份验证机制。如有不同的身份验证需求，请[向我们反馈](https://clickhouse.com/company/contact?loc=clickpipes)。

### IAM

:::info
用于 MSK ClickPipe 的 IAM 身份验证目前为测试版功能。
:::

ClickPipes 支持以下 AWS MSK 身份验证方式：

* [SASL/SCRAM-SHA-512](https://docs.aws.amazon.com/msk/latest/developerguide/msk-password.html) 身份验证
* [IAM 凭证或基于角色的访问](https://docs.aws.amazon.com/msk/latest/developerguide/how-to-use-iam-access-control.html) 身份验证

在使用 IAM 身份验证连接到 MSK broker 时，IAM 角色必须具备必要的权限。
下面是用于 MSK 的 Apache Kafka API 所需 IAM 策略示例：

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "kafka-cluster:Connect"
            ],
            "Resource": [
                "arn:aws:kafka:us-west-2:12345678912:cluster/clickpipes-testing-brokers/b194d5ae-5013-4b5b-ad27-3ca9f56299c9-10"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "kafka-cluster:DescribeTopic",
                "kafka-cluster:ReadData"
            ],
            "Resource": [
                "arn:aws:kafka:us-west-2:12345678912:topic/clickpipes-testing-brokers/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "kafka-cluster:AlterGroup",
                "kafka-cluster:DescribeGroup"
            ],
            "Resource": [
                "arn:aws:kafka:us-east-1:12345678912:group/clickpipes-testing-brokers/*"
            ]
        }
    ]
}
```

#### 配置信任关系

如果您使用 IAM 角色 ARN 对 MSK 进行身份验证，则需要为您的 ClickHouse Cloud 实例配置一条信任关系，以便该角色可以被该实例扮演（assume）。

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

### 自定义证书

用于 Kafka 的 ClickPipes 支持为使用非公开服务器证书的 Kafka broker 上传自定义证书。
同样也支持上传客户端证书和密钥，以用于基于双向 TLS（mTLS）的身份验证。


## 性能 {#performance}

### 批处理 {#batching}
ClickPipes 以批处理的方式向 ClickHouse 插入数据。这样可以避免在数据库中创建过多的数据片段（parts），从而防止导致集群性能问题。

在满足以下任一条件时会插入一个批次：
- 批大小达到最大值（每 1GB pod（容器组）内存对应 100,000 行或 32MB）
- 批已打开达到最大时长（5 秒）

### 延迟 {#latency}

延迟（定义为从 Kafka 消息被生产到该消息在 ClickHouse 中可用之间的时间）取决于多种因素（如 broker 延迟、网络延迟、消息大小/格式）。上文所述的[批处理](#batching)也会影响延迟。我们始终建议使用典型负载对您的特定用例进行测试，以确定预期延迟。

ClickPipes 不对延迟提供任何保证。如果您有特定的低延迟需求，请[联系我们](https://clickhouse.com/company/contact?loc=clickpipes)。

### 扩展性 {#scaling}

面向 Kafka 的 ClickPipes 被设计为既可水平扩展也可垂直扩展。默认情况下，我们会创建一个包含单个消费者的 consumer group。此设置可以在创建 ClickPipe 时进行配置，或在之后任何时间通过 **Settings** -> **Advanced Settings** -> **Scaling** 进行调整。

ClickPipes 提供高可用的跨可用区分布式架构，
这要求至少扩展到两个消费者。

无论运行的消费者数量多少，系统在设计上都具备容错能力。
如果某个消费者或其底层基础设施发生故障，
ClickPipe 会自动重启该消费者并继续处理消息。

### 基准测试 {#benchmarks}

以下是面向 Kafka 的 ClickPipes 的一些非正式基准测试，可用于大致了解基线性能。需要注意的是，许多因素都会影响性能，包括消息大小、数据类型和数据格式。您的实际结果可能有所不同，这里展示的内容并不构成对实际性能的保证。

基准测试细节：

- 我们使用了具备充足资源的生产级 ClickHouse Cloud 服务，以确保吞吐量不会被 ClickHouse 端的插入处理所限制。
- ClickHouse Cloud 服务、Kafka 集群（Confluent Cloud）和 ClickPipe 都运行在同一地区（`us-east-2`）。
- ClickPipe 配置为使用单个 L 规格副本（4 GiB 内存和 1 个 vCPU）。
- 示例数据包含嵌套数据，混合使用了 `UUID`、`String` 和 `Int` 数据类型。其他数据类型（如 `Float`、`Decimal` 和 `DateTime`）的性能可能会较低。
- 使用压缩和未压缩数据时，在性能上没有明显差异。

| 副本规格       | 消息大小 | 数据格式 | 吞吐量  |
|---------------|----------|----------|---------|
| Large (L)     | 1.6kb    |   JSON   | 63mb/s  |
| Large (L)     | 1.6kb    |   Avro   | 99mb/s  |
