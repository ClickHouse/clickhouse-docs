---
'sidebar_label': '모범 사례'
'description': 'Kafka ClickPipes와 작업할 때 따라야 할 모범 사례에 대한 세부정보'
'slug': '/integrations/clickpipes/kafka/best-practices'
'sidebar_position': 1
'title': '모범 사례'
'doc_type': 'guide'
'keywords':
- 'kafka best practices'
- 'clickpipes'
- 'compression'
- 'authentication'
- 'scaling'
---


# 모범 사례 {#best-practices}

## 메시지 압축 {#compression}

Kafka 주제에 대해 압축을 사용하는 것을 강력히 권장합니다. 압축은 성능 저하 없이 데이터 전송 비용에서 상당한 절감을 가져올 수 있습니다. Kafka에서 메시지 압축에 대해 더 알고 싶다면 이 [가이드](https://www.confluent.io/blog/apache-kafka-message-compression/)에서 시작하는 것을 권장합니다.

## 제한 사항 {#limitations}

- [`DEFAULT`](/sql-reference/statements/create/table#default)는 지원되지 않습니다.

## 전송 의미론 {#delivery-semantics}
Kafka를 위한 ClickPipes는 `at-least-once` 전송 의미론을 제공합니다 (가장 일반적으로 사용되는 접근 방식 중 하나입니다). 전송 의미론에 대한 피드백은 [연락 양식](https://clickhouse.com/company/contact?loc=clickpipes)으로 듣고 싶습니다. 정확히 한 번의 의미론이 필요한 경우, 공식 [`clickhouse-kafka-connect`](https://clickhouse.com/blog/real-time-event-streaming-with-kafka-connect-confluent-cloud-clickhouse) 싱크를 사용하는 것을 권장합니다.

## 인증 {#authentication}
Apache Kafka 프로토콜 데이터 소스에 대해 ClickPipes는 TLS 암호화와 함께 [SASL/PLAIN](https://docs.confluent.io/platform/current/kafka/authentication_sasl/authentication_sasl_plain.html) 인증, 그리고 `SASL/SCRAM-SHA-256` 및 `SASL/SCRAM-SHA-512`를 지원합니다. 스트리밍 소스에 따라 (Redpanda, MSK 등) 호환성에 따라 이러한 인증 메커니즘의 전체 또는 일부가 활성화됩니다. 필요로 하는 인증 방식이 다르다면 [피드백을 주세요](https://clickhouse.com/company/contact?loc=clickpipes).

### IAM {#iam}

:::info
MSK ClickPipe에 대한 IAM 인증은 베타 기능입니다.
:::

ClickPipes는 다음 AWS MSK 인증을 지원합니다

- [SASL/SCRAM-SHA-512](https://docs.aws.amazon.com/msk/latest/developerguide/msk-password.html) 인증
- [IAM 자격 증명 또는 역할 기반 액세스](https://docs.aws.amazon.com/msk/latest/developerguide/how-to-use-iam-access-control.html) 인증

MSK 브로커에 연결하기 위해 IAM 인증을 사용할 때 IAM 역할은 필요한 권한을 가져야 합니다. 아래는 MSK의 Apache Kafka API에 대한 필요한 IAM 정책의 예입니다.

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

#### 신뢰 관계 구성 {#configuring-a-trusted-relationship}

IAM 역할 ARN으로 MSK에 인증하는 경우, ClickHouse Cloud 인스턴스와의 신뢰 관계를 추가해야 역할을 사용하도록 설정할 수 있습니다.

:::note
역할 기반 액세스는 AWS에 배포된 ClickHouse Cloud 인스턴스에서만 작동합니다.
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

### 맞춤형 인증서 {#custom-certificates}
Kafka를 위한 ClickPipes는 비공식 서버 인증서를 사용하는 Kafka 브로커에 대한 맞춤형 인증서 업로드를 지원합니다. 상호 TLS (mTLS) 기반 인증을 위한 클라이언트 인증서와 키의 업로드도 지원됩니다.

## 성능 {#performance}

### 배치 처리 {#batching}
ClickPipes는 데이터를 ClickHouse에 배치로 삽입합니다. 이는 데이터베이스에서 너무 많은 파트를 생성하는 것을 피하기 위한 것이며, 이는 클러스터에서 성능 문제로 이어질 수 있습니다. 

다음 기준 중 하나가 충족될 때 배치가 삽입됩니다:
- 배치 크기가 최대 크기에 도달했을 때 (100,000행 또는 1GB의 포드 메모리당 32MB)
- 배치가 최대 시간(5초) 동안 열려있을 때

### 지연 시간 {#latency}

지연 시간(효과적으로 Kafka 메시지가 생성된 시점과 ClickHouse에서 메시지를 사용할 수 있는 시점 사이의 시간으로 정의됨)은 여러 요인(예: 브로커 지연, 네트워크 지연, 메시지 크기/형식)에 따라 달라집니다. 위 섹션에서 설명한 [배치 처리](#batching)도 지연 시간에 영향을 미칠 것입니다. 특정 사용 사례를 일반적인 부하로 테스트하여 예상되는 지연 시간을 결정하는 것을 항상 권장합니다.

ClickPipes는 지연 시간에 대해 아무런 보장을 제공하지 않습니다. 특정 저지연 요구 사항이 있는 경우 [연락해 주세요](https://clickhouse.com/company/contact?loc=clickpipes).

### 확장성 {#scaling}

Kafka를 위한 ClickPipes는 수평 및 수직 확장을 위해 설계되었습니다. 기본적으로 하나의 소비자로 구성된 소비자 그룹을 생성합니다. 이는 ClickPipe 생성 중에 설정하거나 **설정** -> **고급 설정** -> **확장성**에서 언제든지 구성할 수 있습니다.

ClickPipes는 가용성 존 분산 아키텍처로 높은 가용성을 제공합니다. 이 경우 최소 두 개의 소비자로 확장이 필요합니다.

실행 중인 소비자의 수에 관계없이 장애 허용은 설계상 가능합니다. 소비자나 그 기본 인프라에 장애가 발생하면 ClickPipe는 소비자를 자동으로 재시작하고 메시지 처리를 계속합니다.

### 벤치마크 {#benchmarks}

아래는 ClickPipes for Kafka의 일부 비공식 벤치마크로, 일반적인 성능 기준을 이해하는 데 사용할 수 있습니다. 메시지 크기, 데이터 유형 및 데이터 형식 등 많은 요인이 성능에 영향을 미칠 수 있음을 아는 것이 중요합니다. 귀하의 경우는 다를 수 있으며, 여기에서 보여주는 내용은 실제 성능에 대한 보장이 아닙니다.

벤치마크 세부 사항:

- 우리는 ClickHouse Cloud 서비스의 프로덕션을 사용했으며, ClickHouse 측의 삽입 처리로 인한 병목 현상이 발생하지 않도록 충분한 리소스를 확보했습니다.
- ClickHouse Cloud 서비스, Kafka 클러스터 (Confluent Cloud) 및 ClickPipe는 모두 같은 지역(`us-east-2`)에서 실행 중이었습니다.
- ClickPipe는 단일 L 크기 복제본(4 GiB RAM 및 1 vCPU)으로 구성되었습니다.
- 샘플 데이터에는 `UUID`, `String` 및 `Int` 데이터 유형이 혼합된 중첩 데이터가 포함되었습니다. `Float`, `Decimal`, `DateTime`과 같은 다른 데이터 유형은 성능이 낮을 수 있습니다.
- 압축된 데이터와 압축되지 않은 데이터를 사용할 경우 성능에는 눈에 띄는 차이가 없었습니다.

| 복제본 크기  | 메시지 크기 | 데이터 형식 | 처리량 |
|---------------|--------------|-------------|------------|
| 대형 (L)     | 1.6kb        |   JSON      | 63mb/s     |
| 대형 (L)     | 1.6kb        |   Avro      | 99mb/s     |
