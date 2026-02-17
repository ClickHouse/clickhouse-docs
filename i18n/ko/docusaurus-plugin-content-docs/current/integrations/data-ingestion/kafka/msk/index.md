---
sidebar_label: 'Amazon MSK용 Kafka 커넥터 싱크'
sidebar_position: 1
slug: /integrations/kafka/cloud/amazon-msk/
description: 'ClickHouse 공식 Kafka 커넥터를 사용한 Amazon MSK 연동'
keywords: ['integration', 'kafka', 'amazon msk', 'sink', 'connector']
title: 'Amazon MSK를 ClickHouse와 통합하기'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_ingestion'
---

import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# Amazon MSK를 ClickHouse와 통합하기 \{#integrating-amazon-msk-with-clickhouse\}

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

> 참고: 동영상에 표시된 정책은 빠른 시작만을 위한 허용 범위가 넓은(permissive) 정책입니다. 아래의 최소 권한 원칙 기반 IAM 가이드를 참고하십시오.

## 사전 준비 사항 \{#prerequisites\}

다음을 전제로 합니다:

* [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)에 대해 잘 알고 있습니다.
* Amazon MSK 및 MSK Connectors에 대해 잘 알고 있습니다. Amazon MSK [시작하기 가이드](https://docs.aws.amazon.com/msk/latest/developerguide/getting-started.html)와 [MSK Connect 가이드](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect.html)를 참고하시기를 권장합니다.

## Amazon MSK용 ClickHouse 공식 Kafka 커넥터 \{#the-official-kafka-connector-from-clickhouse-with-amazon-msk\}

### 연결 정보 확인하기 \{#gather-your-connection-details\}

<ConnectionDetails />

### 단계 \{#steps\}

1. [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)에 대해 숙지합니다.
2. [MSK 인스턴스를 생성](https://docs.aws.amazon.com/msk/latest/developerguide/create-cluster.html)합니다.
3. [IAM 역할을 생성하고 할당](https://docs.aws.amazon.com/msk/latest/developerguide/create-client-iam-role.html)합니다.
4. ClickHouse Connect Sink [릴리스 페이지](https://github.com/ClickHouse/clickhouse-kafka-connect/releases)에서 `jar` 파일을 다운로드합니다.
5. Amazon MSK 콘솔의 [Custom plugin 페이지](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-plugins.html)에 다운로드한 `jar` 파일을 설치합니다.
6. Connector가 공용(public) ClickHouse 인스턴스와 통신하는 경우 [인터넷 액세스를 활성화](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-internet-access.html)합니다.
7. 구성(config)에서 토픽 이름, ClickHouse 인스턴스 호스트 이름, 비밀번호를 설정합니다.

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


## 권장 IAM 권한(최소 권한 원칙) \{#iam-least-privilege\}

구성에 필요한 최소한의 권한만 사용하십시오. 아래의 기본 구성을 시작점으로 삼고, 실제로 사용하는 서비스가 있을 때에만 해당 서비스에 필요한 선택적 권한을 추가하십시오.

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
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": [
        "arn:aws:secretsmanager:<region>:<account-id>:secret:<your-secret-name>*"
      ]
    },
    {
      "Sid": "OptionalS3Read",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::<your-bucket>/<optional-prefix>/*"
    }
  ]
}
```

* AWS Glue Schema Registry를 사용하는 경우에만 Glue 블록을 사용하십시오.
* Secrets Manager에서 자격 증명/트러스트스토어를 가져오는 경우에만 Secrets Manager 블록을 사용하십시오. ARN의 범위를 명확히 제한하십시오.
* S3에서 아티팩트(예: 트러스트스토어)를 로드하는 경우에만 S3 블록을 사용하십시오. 버킷/프리픽스 수준으로 범위를 제한하십시오.

관련 내용: [Kafka 모범 사례 – IAM](../../clickpipes/kafka/04_best_practices.md#iam).


## 성능 튜닝 \{#performance-tuning\}

성능을 향상시키는 한 가지 방법은 **worker** 설정에 다음 구성을 추가하여 Kafka에서 가져오는 배치 크기와 레코드 수를 조정하는 것입니다:

```yml
consumer.max.poll.records=[NUMBER OF RECORDS]
consumer.max.partition.fetch.bytes=[NUMBER OF RECORDS * RECORD SIZE IN BYTES]
```

사용할 구체적인 값은 원하는 레코드 수와 레코드 크기에 따라 달라집니다. 예를 들어, 기본값은 다음과 같습니다.

```yml
consumer.max.poll.records=500
consumer.max.partition.fetch.bytes=1048576
```

구현 방법 및 기타 고려 사항을 포함한 자세한 내용은 공식 [Kafka](https://kafka.apache.org/documentation/#consumerconfigs) 및 [Amazon MSK](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-workers.html#msk-connect-create-custom-worker-config) 문서를 참조하십시오.


## MSK Connect를 위한 네트워킹 관련 참고 사항 \{#notes-on-networking-for-msk-connect\}

MSK Connect가 ClickHouse에 연결할 수 있도록, MSK 클러스터를 인터넷 액세스를 위해 Private NAT 게이트웨이가 연결된 프라이빗 서브넷에 두는 것을 권장합니다. 이를 설정하는 방법은 아래에 안내되어 있습니다. 퍼블릭 서브넷도 지원되지만, ENI에 Elastic IP 주소를 지속적으로 할당해야 하므로 권장되지 않습니다. [AWS 문서에서 더 자세한 내용을 확인할 수 있습니다](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-internet-access.html)

1. **프라이빗 서브넷 생성:** VPC 내에 새 서브넷을 생성하고, 이를 프라이빗 서브넷으로 지정합니다. 이 서브넷은 인터넷에 직접 액세스할 수 없어야 합니다.
1. **NAT Gateway 생성:** VPC의 퍼블릭 서브넷에 NAT Gateway를 생성합니다. NAT Gateway는 프라이빗 서브넷에 있는 인스턴스가 인터넷 또는 다른 AWS 서비스에 연결할 수 있게 하지만, 인터넷에서 해당 인스턴스로의 연결을 시작하지 못하도록 차단합니다.
1. **라우트 테이블 업데이트:** 인터넷으로 향하는 트래픽을 NAT Gateway로 전달하는 라우트를 추가합니다.
1. **Security Group 및 Network ACL 구성 확인:** 관련 트래픽이 허용되도록 [security group](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html)과 [network ACL(Access Control List)](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html)을 구성합니다.
   1. MSK Connect 워커 ENI에서 TLS 포트(일반적으로 9094)의 MSK 브로커로 가는 트래픽을 허용합니다.
   1. MSK Connect 워커 ENI에서 ClickHouse 엔드포인트로 가는 트래픽을 허용합니다: 9440(네이티브 TLS) 또는 8443(HTTPS).
   1. 브로커 SG에 대해 MSK Connect 워커 SG에서의 인바운드 트래픽을 허용합니다.
   1. 셀프 호스팅 ClickHouse의 경우, 서버에서 구성한 포트를 엽니다(HTTP 기본 포트는 8123).
1. **MSK에 Security Group 연결:** 이러한 security group이 MSK 클러스터 및 MSK Connect 워커에 연결되어 있는지 확인합니다.
1. **ClickHouse Cloud로의 연결성:**
   1. 퍼블릭 엔드포인트 + IP 허용 목록 방식: 프라이빗 서브넷에서 NAT를 통한 아웃바운드(egress) 트래픽이 필요합니다.
   1. 사용 가능한 경우 프라이빗 연결(예: VPC 피어링/PrivateLink/VPN)을 사용합니다. VPC DNS 호스트 이름/해결 기능이 활성화되어 있고, DNS가 프라이빗 엔드포인트를 해석할 수 있는지 확인합니다.
1. **연결성 검증(간단 체크리스트):**
   1. 커넥터 환경에서 MSK 부트스트랩 DNS를 해석한 후, TLS를 사용하여 브로커 포트로 연결합니다.
   1. 포트 9440에서 ClickHouse로 TLS 연결을 설정합니다(또는 HTTPS의 경우 8443).
   1. AWS 서비스(Glue/Secrets Manager)를 사용하는 경우, 해당 엔드포인트로의 아웃바운드(egress) 트래픽을 허용합니다.