---
sidebar_label: '모범 사례'
description: 'Kafka ClickPipes를 사용할 때 따를 모범 사례를 자세히 설명합니다'
slug: /integrations/clickpipes/kafka/best-practices
sidebar_position: 1
title: '모범 사례'
doc_type: '가이드'
keywords: ['Kafka 모범 사례', 'ClickPipes', '압축', '인증', '스케일링']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# 모범 사례 \{#best-practices\}

## 메시지 압축 \{#compression\}

Kafka 토픽에는 메시지 압축 사용을 강력히 권장합니다. 메시지 압축을 사용하면 거의 성능 저하 없이 데이터 전송 비용을 크게 절감할 수 있습니다.
Kafka에서 메시지 압축에 대해 더 알아보려면 이 [가이드](https://www.confluent.io/blog/apache-kafka-message-compression/)부터 확인하시기 바랍니다.

## 제한 사항 \{#limitations\}

- [`DEFAULT`](/sql-reference/statements/create/table#default)는 지원되지 않습니다.
- 개별 메시지는 기본적으로 가장 작은 XS 레플리카 크기로 실행할 때 8MB(비압축 기준), 더 큰 레플리카 크기에서는 16MB(비압축 기준)로 제한됩니다. 이 한도를 초과하는 메시지는 오류와 함께 거부됩니다. 더 큰 메시지 크기가 필요하면 지원팀으로 문의하십시오.

## 전달 시맨틱스 \{#delivery-semantics\}

Kafka용 ClickPipes는 가장 일반적으로 사용되는 접근 방식 중 하나인 `at-least-once` 전달 시맨틱스를 제공합니다. 전달 시맨틱스에 대해서는 [문의 양식](https://clickhouse.com/company/contact?loc=clickpipes)을 통해 의견을 보내주시기 바랍니다. `exactly-once` 시맨틱스가 필요한 경우 공식 [`clickhouse-kafka-connect`](https://clickhouse.com/blog/real-time-event-streaming-with-kafka-connect-confluent-cloud-clickhouse) 싱크 사용을 권장합니다.

## 인증 \{#authentication\}

Apache Kafka 프로토콜 데이터 소스의 경우 ClickPipes는 TLS 암호화를 사용하는 [SASL/PLAIN](https://docs.confluent.io/platform/current/kafka/authentication_sasl/authentication_sasl_plain.html) 인증과 `SASL/SCRAM-SHA-256`, `SASL/SCRAM-SHA-512`를 지원합니다. 사용 중인 스트리밍 소스(Redpanda, MSK 등)의 호환성에 따라 이러한 인증 방식 전체 또는 일부만 활성화됩니다. 인증 요구 사항이 위와 다를 경우 [피드백을 보내주시기 바랍니다](https://clickhouse.com/company/contact?loc=clickpipes).

## Warpstream Fetch Size \{#warpstream-settings\}

ClickPipes는 Kafka `max.fetch_bytes` 설정을 사용하여, 한 번에 단일 ClickPipes 노드에서 처리되는 데이터 크기를 제한합니다.  일부 상황에서는
Warpstream이 이 설정을 준수하지 않아 예기치 않은 파이프 장애가 발생할 수 있습니다.  ClickPipes 장애를 방지하기 위해 Warpstream 에이전트를 구성할 때 Warpstream 전용 설정인 `kafkaMaxFetchPartitionBytesUncompressedOverride` 값을 8MB(또는 그보다 작게)로 설정할 것을 강력히 권장합니다.

### IAM \{#iam\}

:::info
MSK ClickPipe에 대한 IAM 인증은 베타 기능입니다.
:::

ClickPipes는 다음과 같은 AWS MSK 인증 방식을 지원합니다.

* [SASL/SCRAM-SHA-512](https://docs.aws.amazon.com/msk/latest/developerguide/msk-password.html) 인증
* [IAM Credentials 또는 역할 기반 액세스](https://docs.aws.amazon.com/msk/latest/developerguide/how-to-use-iam-access-control.html) 인증

IAM 인증을 사용하여 MSK 브로커에 연결하는 경우 해당 IAM 역할에는 필요한 권한이 있어야 합니다.
아래는 MSK용 Apache Kafka API에 필요한 IAM 정책 예시입니다.

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


#### 신뢰할 수 있는 관계 구성 \{#configuring-a-trusted-relationship\}

IAM role ARN으로 MSK에 인증하는 경우, 해당 역할을 위임받을 수 있도록 ClickHouse Cloud 인스턴스와 신뢰 관계(trusted relationship)를 설정해야 합니다.

:::note
역할 기반(Role-based) 액세스는 AWS에 배포된 ClickHouse Cloud 인스턴스에서만 사용할 수 있습니다.
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


### 사용자 정의 인증서 \{#custom-certificates\}

ClickPipes for Kafka는 공개용이 아닌 서버 인증서를 사용하는 Kafka 브로커에 대해 사용자 정의 인증서 업로드를 지원합니다.
상호 TLS(mTLS) 기반 인증을 위해 클라이언트 인증서와 키 업로드도 지원합니다.

## 성능 \{#performance\}

### 배치 처리 \{#batching\}

ClickPipes는 데이터를 배치 단위로 ClickHouse에 삽입합니다. 이는 데이터베이스에 너무 많은 파트가 생성되어 클러스터 성능에 문제가 발생하는 것을 방지하기 위한 것입니다.

다음 기준 중 하나를 만족하면 배치를 삽입합니다:

- 배치 크기가 최대 한도에 도달했을 때(행 100,000개 또는 파드 메모리 1GB당 32MB)
- 배치가 열린 시간이 최대 한도(5초)에 도달했을 때

### 지연 시간 \{#latency\}

지연 시간(ClickHouse에서 메시지를 사용할 수 있게 되기까지, Kafka 메시지가 생성된 시점부터 걸리는 시간으로 정의됨)은 여러 요소(예: 브로커 지연 시간, 네트워크 지연 시간, 메시지 크기/포맷)에 따라 달라집니다. 위 섹션에서 설명한 [배칭](#batching)도 지연 시간에 영향을 줍니다. 예상 지연 시간을 파악하려면 일반적인 부하를 기준으로 특정 사용 사례를 테스트하는 것이 좋습니다.

ClickPipes는 지연 시간에 대해 어떠한 보장도 제공하지 않습니다. 특정 저지연 요구사항이 있는 경우, [문의 페이지](https://clickhouse.com/company/contact?loc=clickpipes)를 통해 연락해 주십시오.

### 확장 \{#scaling\}

ClickPipes for Kafka는 수평 및 수직 확장이 가능하도록 설계되었습니다. 기본적으로 하나의 컨슈머로 구성된 컨슈머 그룹을 생성합니다. 이는 ClickPipe 생성 시점이나 그 이후 어느 시점에도 **Settings** -> **Advanced Settings** -> **Scaling**에서 구성할 수 있습니다.

ClickPipes는 가용 영역에 분산된 아키텍처를 통해 고가용성을 제공합니다.
이를 위해서는 최소 2개의 컨슈머로 확장해야 합니다.

실행 중인 컨슈머 수와 관계없이 장애 허용은 설계 단계에서부터 제공됩니다.
컨슈머나 그 기반 인프라에 장애가 발생하더라도,
ClickPipe는 컨슈머를 자동으로 다시 시작하고 메시지 처리를 계속합니다.

### Benchmarks \{#benchmarks\}

아래는 ClickPipes for Kafka에 대한 비공식 벤치마크로, 기본 성능에 대한 대략적인 기준을 파악하는 데 사용할 수 있습니다. 성능에는 메시지 크기, 데이터 타입, 데이터 포맷 등 여러 요소가 영향을 미친다는 점을 이해하는 것이 중요합니다. 실제 환경에서는 결과가 달라질 수 있으며, 여기에서 보여 주는 수치는 실제 성능을 보장하지 않습니다.

벤치마크 세부 정보:

- ClickHouse 측의 INSERT 처리로 인해 처리량이 병목되지 않도록 충분한 리소스를 가진 프로덕션 ClickHouse Cloud 서비스를 사용했습니다.
- ClickHouse Cloud 서비스, Kafka 클러스터(Confluent Cloud), ClickPipe는 모두 동일한 리전(`us-east-2`)에서 실행되었습니다.
- ClickPipe는 단일 L 크기 레플리카(4 GiB RAM과 1 vCPU)로 구성했습니다.
- 샘플 데이터에는 `UUID`, `String`, `Int` 데이터 타입이 혼합된 중첩 데이터가 포함되어 있었습니다. `Float`, `Decimal`, `DateTime`과 같은 다른 데이터 타입은 성능이 더 낮을 수 있습니다.
- 압축 데이터와 비압축 데이터를 사용할 때 성능 차이는 유의미하지 않았습니다.

| 레플리카 크기 | 메시지 크기 | 데이터 형식 | 처리량  |
|---------------|-------------|-------------|---------|
| Large (L)     | 1.6kb       | JSON        | 63mb/s  |
| Large (L)     | 1.6kb       | Avro        | 99mb/s  |