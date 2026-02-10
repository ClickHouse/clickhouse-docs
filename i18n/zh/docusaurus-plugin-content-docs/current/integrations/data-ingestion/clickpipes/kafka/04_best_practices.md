---
sidebar_label: '最佳实践'
description: '详细介绍在使用 Kafka ClickPipes 时应遵循的最佳实践'
slug: /integrations/clickpipes/kafka/best-practices
sidebar_position: 1
title: '最佳实践'
doc_type: 'guide'
keywords: ['kafka 最佳实践', 'clickpipes', '压缩', '认证', '扩展']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# 最佳实践 \{#best-practices\}

## 消息压缩 \{#compression\}

我们强烈建议对 Kafka 主题使用压缩。压缩几乎不会带来性能损耗，却可以大幅降低数据传输成本。
要进一步了解 Kafka 中的消息压缩，我们建议从这篇[指南](https://www.confluent.io/blog/apache-kafka-message-compression/)开始阅读。

## 限制 \{#limitations\}

- 不支持 [`DEFAULT`](/sql-reference/statements/create/table#default)。
- 在使用最小 (XS) 副本大小运行时，单条消息在默认情况下（未压缩）限制为 8MB，对于更大的副本则为 16MB（未压缩）。超出此限制的消息将被拒绝并返回错误。如需发送更大的消息，请联系支持团队。

## 传输语义 \{#delivery-semantics\}

用于 Kafka 的 ClickPipes 提供 `at-least-once` 传输语义（这是最常用的语义模式之一）。欢迎通过[联系表单](https://clickhouse.com/company/contact?loc=clickpipes)就传输语义向我们反馈意见。如果你需要 exactly-once 语义，我们推荐使用官方的 [`clickhouse-kafka-connect`](https://clickhouse.com/blog/real-time-event-streaming-with-kafka-connect-confluent-cloud-clickhouse) sink。

## 身份验证 \{#authentication\}

对于使用 Apache Kafka 协议的数据源，ClickPipes 支持结合 TLS 加密的 [SASL/PLAIN](https://docs.confluent.io/platform/current/kafka/authentication_sasl/authentication_sasl_plain.html) 身份验证，以及 `SASL/SCRAM-SHA-256` 和 `SASL/SCRAM-SHA-512`。具体启用全部还是部分这些身份验证机制，取决于流式数据源（如 Redpanda、MSK 等）的兼容性。如果您有不同的身份验证需求，请[向我们反馈](https://clickhouse.com/company/contact?loc=clickpipes)。

## Warpstream 拉取大小 \{#warpstream-settings\}

ClickPipes 依赖 Kafka 设置 `max.fetch_bytes` 来限制任意时刻单个 ClickPipes 节点可处理的数据量。在某些情况下，Warpstream 不会遵循此设置，这可能导致管道意外失败。我们强烈建议在配置 Warpstream 代理时，将 Warpstream 专用设置 `kafkaMaxFetchPartitionBytesUncompressedOverride` 设为 8MB（或更小），以防止 ClickPipes 故障。

### IAM \{#iam\}

:::info
用于 MSK ClickPipe 的 IAM 身份验证当前为测试版功能。
:::

ClickPipes 支持以下 AWS MSK 身份验证方式：

* [SASL/SCRAM-SHA-512](https://docs.aws.amazon.com/msk/latest/developerguide/msk-password.html) 身份验证
* [IAM 凭证或基于角色的访问](https://docs.aws.amazon.com/msk/latest/developerguide/how-to-use-iam-access-control.html) 身份验证

当使用 IAM 身份验证连接到 MSK broker 时，IAM 角色必须具备必要的权限。
下面是一个适用于 MSK 的 Apache Kafka API 所需 IAM 策略示例：

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


#### 配置信任关系 \{#configuring-a-trusted-relationship\}

如果您使用 IAM 角色 ARN 对 MSK 进行认证，则需要在您的 ClickHouse Cloud 实例与该角色之间配置信任关系，以便实例可以承担该角色。

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


### 自定义证书 \{#custom-certificates\}

用于 Kafka 的 ClickPipes 支持为使用非公开服务器证书的 Kafka broker 上传自定义证书。
还支持上传客户端证书和密钥，以用于基于双向 TLS（mTLS）的身份验证。

## 性能 \{#performance\}

### 批处理 \{#batching\}

ClickPipes 会以批处理的方式向 ClickHouse 插入数据。这样可以避免在数据库中创建过多的分区片段，从而防止在集群中引发性能问题。

在满足以下任一条件时，会插入当前批次的数据：

- 批次大小达到最大值（每 1GB pod（容器组）内存对应 100,000 行或 32MB）
- 批次已打开的时间达到最大时长（5 秒）

### 延迟 \{#latency\}

延迟（定义为从 Kafka 消息生成到该消息在 ClickHouse 中可用之间的时间）取决于多种因素（例如代理（broker）延迟、网络延迟、消息大小/格式）。上文中描述的[批处理](#batching)也会影响延迟。我们始终建议在典型负载下对您的具体用例进行测试，以确定预期的延迟水平。

ClickPipes 不对延迟提供任何保证。如果您有特定的低延迟需求，请[联系我们](https://clickhouse.com/company/contact?loc=clickpipes)。

### 扩展 \{#scaling\}

ClickPipes for Kafka 设计为既可以横向扩展也可以纵向扩展。默认情况下，会创建一个仅包含单个消费者的消费者组。可以在创建 ClickPipe 时进行配置，或者在之后通过 **Settings** -> **Advanced Settings** -> **Scaling** 进行配置。

ClickPipes 提供高可用性，并采用跨可用区的分布式架构。
为此，至少需要扩展到两个消费者。

无论当前运行的消费者数量多少，系统在设计上都具备容错能力。
如果某个消费者或其底层基础设施发生故障，
ClickPipe 会自动重新启动该消费者并继续处理消息。

### Benchmarks \{#benchmarks\}

下面是一些针对 ClickPipes for Kafka 的非正式基准测试结果，可用于大致了解基线性能。需要注意的是，许多因素都会影响性能，包括消息大小、数据类型和数据格式。实际表现可能有所不同，这里展示的内容并不构成对实际性能的保证。

基准测试详情：

- 我们使用了资源充足的生产环境 ClickHouse Cloud 服务，确保吞吐量不会因 ClickHouse 端的插入处理而出现瓶颈。
- ClickHouse Cloud 服务、Kafka 集群（Confluent Cloud）和 ClickPipe 均运行在同一地域（`us-east-2`）。
- ClickPipe 配置为单个 L 规格的副本（4 GiB 内存和 1 个 vCPU）。
- 示例数据包含嵌套数据，混合使用了 `UUID`、`String` 和 `Int` 数据类型。其他数据类型（例如 `Float`、`Decimal` 和 `DateTime`）的性能可能较低。
- 使用压缩与非压缩数据时，性能没有明显差异。

| Replica Size  | Message Size | Data Format | Throughput |
|---------------|--------------|-------------|------------|
| Large (L)     | 1.6kb        |   JSON      | 63mb/s     |
| Large (L)     | 1.6kb        |   Avro      | 99mb/s     |