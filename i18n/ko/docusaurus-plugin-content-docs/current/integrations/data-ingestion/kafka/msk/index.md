---
'sidebar_label': 'Amazon MSK와 Kafka 커넥터 싱크'
'sidebar_position': 1
'slug': '/integrations/kafka/cloud/amazon-msk/'
'description': 'ClickHouse의 공식 Kafka 커넥터와 Amazon MSK'
'keywords':
- 'integration'
- 'kafka'
- 'amazon msk'
- 'sink'
- 'connector'
'title': 'Amazon MSK와 ClickHouse 통합'
'doc_type': 'guide'
'integration':
- 'support_level': 'community'
- 'category': 'data_ingestion'
---

import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# Amazon MSK와 ClickHouse 통합

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

> 참고: 비디오에 표시된 정책은 허용적이며 신속한 시작을 위한 것입니다. 아래의 최소 권한 IAM 가이드를 참조하십시오.

## 전제 조건 {#prerequisites}
다음 사항을 가정합니다:
* [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md), Amazon MSK 및 MSK 커넥터에 익숙합니다. Amazon MSK [시작하기 가이드](https://docs.aws.amazon.com/msk/latest/developerguide/getting-started.html) 및 [MSK Connect 가이드](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect.html)를 추천합니다.
* MSK 브로커가 공개적으로 접근 가능해야 합니다. 개발자 가이드의 [공용 액세스](https://docs.aws.amazon.com/msk/latest/developerguide/public-access.html) 섹션을 참조하십시오.

## Amazon MSK와 함께 ClickHouse의 공식 Kafka 커넥터 {#the-official-kafka-connector-from-clickhouse-with-amazon-msk}

### 연결 세부 정보 수집 {#gather-your-connection-details}

<ConnectionDetails />

### 단계 {#steps}
1. [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)에 익숙해지세요.
1. [MSK 인스턴스를 생성](https://docs.aws.amazon.com/msk/latest/developerguide/create-cluster.html)합니다.
1. [IAM 역할을 생성하고 할당](https://docs.aws.amazon.com/msk/latest/developerguide/create-client-iam-role.html)합니다.
1. ClickHouse Connect Sink의 [릴리스 페이지](https://github.com/ClickHouse/clickhouse-kafka-connect/releases)에서 `jar` 파일을 다운로드합니다.
1. Amazon MSK 콘솔의 [커스텀 플러그인 페이지](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-plugins.html)에 다운로드한 `jar` 파일을 설치합니다.
1. 커넥터가 공개 ClickHouse 인스턴스와 통신하는 경우, [인터넷 액세스 활성화](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-internet-access.html)합니다.
1. 구성 파일에 주제 이름, ClickHouse 인스턴스 호스트 이름 및 비밀번호를 제공합니다.
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

## 권장 IAM 권한 (최소 권한) {#iam-least-privilege}

설정에 필요한 최소 권한을 사용합니다. 아래 기본선에서 시작하고 필요한 서비스만 추가합니다.

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

- AWS Glue 스키마 레지스트리를 사용하는 경우에만 Glue 블록을 사용합니다.
- Secrets Manager에서 크리덴셜/신뢰 저장소를 가져오는 경우에만 Secrets Manager 블록을 사용합니다. ARN의 범위를 특정합니다.
- S3에서 아티팩트(예: 신뢰 저장소)를 로드하는 경우에만 S3 블록을 사용합니다. 버킷/접두사로 범위를 지정합니다.

추가로: [Kafka 모범 사례 – IAM](../../clickpipes/kafka/04_best_practices.md#iam)을 참조하십시오.

## 성능 조정 {#performance-tuning}
성능을 증가시키는 한 가지 방법은 배치 크기와 Kafka에서 가져오는 레코드 수를 조정하는 것입니다. 다음을 **작업자** 구성에 추가하십시오:
```yml
consumer.max.poll.records=[NUMBER OF RECORDS]
consumer.max.partition.fetch.bytes=[NUMBER OF RECORDS * RECORD SIZE IN BYTES]
```

사용하는 특정 값은 원하는 레코드 수와 레코드 크기에 따라 다를 것입니다. 예를 들어, 기본값은 다음과 같습니다:

```yml
consumer.max.poll.records=500
consumer.max.partition.fetch.bytes=1048576
```

자세한 내용은 공식 [Kafka](https://kafka.apache.org/documentation/#consumerconfigs) 및 
[Amazon MSK](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-workers.html#msk-connect-create-custom-worker-config) 문서에서 확인하실 수 있습니다.

## MSK Connect의 네트워킹에 대한 참고 사항 {#notes-on-networking-for-msk-connect}

MSK Connect가 ClickHouse에 연결되기 위해서는 MSK 클러스터가 인터넷 액세스를 위해 연결된 Private NAT를 갖춘 프라이빗 서브넷에 있어야 합니다. 이를 설정하는 방법은 아래에 제공됩니다. 공용 서브넷도 지원되지만, ENI에 Elastic IP 주소를 지속적으로 할당해야 하므로 권장되지 않습니다. [AWS가 이 질문에 대한 자세한 내용을 제공합니다](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-internet-access.html).

1. **프라이빗 서브넷 생성:** VPC 내에서 새로운 서브넷을 생성하여 프라이빗 서브넷으로 지정합니다. 이 서브넷은 인터넷에 직접 접근할 수 없어야 합니다.
1. **NAT 게이트웨이 생성:** VPC의 공용 서브넷에 NAT 게이트웨이를 생성합니다. NAT 게이트웨이를 통해 프라이빗 서브넷의 인스턴스가 인터넷이나 기타 AWS 서비스에 연결할 수 있도록 하지만, 인터넷이 이러한 인스턴스와의 연결을 시작할 수 없도록 방지합니다.
1. **라우트 테이블 업데이트:** 인터넷으로 향하는 트래픽을 NAT 게이트웨이로 안내하는 라우트를 추가합니다.
1. **보안 그룹 및 네트워크 ACL 구성 확인:** 관련 트래픽을 허용하도록 [보안 그룹](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html) 및 [네트워크 ACL(액세스 제어 목록)](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html)을 구성합니다.
   1. MSK Connect 작업자의 ENI에서 MSK 브로커로의 TLS 포트(일반적으로 9094)로의 연결.
   1. MSK Connect 작업자의 ENI에서 ClickHouse 엔드포인트: 9440(네이티브 TLS) 또는 8443(HTTPS)로의 연결.
   1. MSK Connect 작업자 SG에서 브로커 SG로의 인바운드 허용.
   1. 자체 호스팅 ClickHouse의 경우, 서버에 구성된 포트를 엽니다(HTTP의 경우 기본 8123).
1. **MSK에 보안 그룹 연결:** 이러한 보안 그룹이 MSK 클러스터 및 MSK Connect 작업자에 연결되어 있는지 확인합니다.
1. **ClickHouse Cloud에 대한 연결성:**
   1. 공용 엔드포인트 + IP 허용 목록: 프라이빗 서브넷에서 NAT egress가 필요합니다.
   1. 가능할 경우 프라이빗 연결(VPC 피어링/PrivateLink/VPN). VPC DNS 호스트 이름/해결이 활성화되어 있고 DNS가 프라이빗 엔드포인트를 해결할 수 있는지 확인합니다.
1. **연결성 검증(빠른 체크리스트):**
   1. 커넥터 환경에서 MSK 부트스트랩 DNS를 확인하고 TLS를 통해 브로커 포트에 연결합니다.
   1. ClickHouse에 있는 포트 9440(또는 HTTPS의 경우 8443)에서 TLS 연결을 설정합니다.
   1. AWS 서비스를 사용하는 경우(Glue/Secrets Manager), 해당 엔드포인트로의 egress를 허용합니다.
