---
'sidebar_label': '소개'
'description': '외부 데이터 소스를 ClickHouse Cloud에 원활하게 연결하세요.'
'slug': '/integrations/clickpipes'
'title': 'ClickHouse Cloud와 통합하기'
'doc_type': 'guide'
'keywords':
- 'ClickPipes'
- 'data ingestion platform'
- 'streaming data'
- 'integration platform'
- 'ClickHouse Cloud'
---

import Kafkasvg from '@site/static/images/integrations/logos/kafka.svg';
import Confluentsvg from '@site/static/images/integrations/logos/confluent.svg';
import Msksvg from '@site/static/images/integrations/logos/msk.svg';
import Azureeventhubssvg from '@site/static/images/integrations/logos/azure_event_hubs.svg';
import Warpstreamsvg from '@site/static/images/integrations/logos/warpstream.svg';
import S3svg from '@site/static/images/integrations/logos/amazon_s3_logo.svg';
import Amazonkinesis from '@site/static/images/integrations/logos/amazon_kinesis_logo.svg';
import Gcssvg from '@site/static/images/integrations/logos/gcs.svg';
import DOsvg from '@site/static/images/integrations/logos/digitalocean.svg';
import ABSsvg from '@site/static/images/integrations/logos/azureblobstorage.svg';
import Postgressvg from '@site/static/images/integrations/logos/postgresql.svg';
import Mysqlsvg from '@site/static/images/integrations/logos/mysql.svg';
import Mongodbsvg from '@site/static/images/integrations/logos/mongodb.svg';
import redpanda_logo from '@site/static/images/integrations/logos/logo_redpanda.png';
import clickpipes_stack from '@site/static/images/integrations/data-ingestion/clickpipes/clickpipes_stack.png';
import cp_custom_role from '@site/static/images/integrations/data-ingestion/clickpipes/cp_custom_role.png';
import cp_advanced_settings from '@site/static/images/integrations/data-ingestion/clickpipes/cp_advanced_settings.png';
import Image from '@theme/IdealImage';



# ClickHouse Cloud와 통합하기

## 소개 {#introduction}

[ClickPipes](/integrations/clickpipes)는 다양한 소스에서 데이터를 수집하는 과정을 클릭 몇 번으로 간단하게 만들어주는 관리형 통합 플랫폼입니다. 가장 복잡한 워크로드를 위해 설계된 ClickPipes의 강력하고 확장 가능한 아키텍처는 일관된 성능과 신뢰성을 보장합니다. ClickPipes는 장기 스트리밍 필요 또는 일회성 데이터 로딩 작업에 사용될 수 있습니다.

<Image img={clickpipes_stack} alt="ClickPipes 스택" size="lg" border/>

## 지원되는 데이터 소스 {#supported-data-sources}

| 이름                                               | 로고                                                                                             | 유형 | 상태            | 설명                                                                                              |
|-----------------------------------------------------|--------------------------------------------------------------------------------------------------|----|------------------|--------------------------------------------------------------------------------------------------|
| [Apache Kafka](/integrations/clickpipes/kafka)     | <Kafkasvg class="image" alt="Apache Kafka 로고" style={{width: '3rem', 'height': '3rem'}}/>      | 스트리밍 | 안정적           | ClickPipes를 구성하고 Apache Kafka에서 ClickHouse Cloud로 스트리밍 데이터를 수집합니다.     |
| Confluent Cloud                                    | <Confluentsvg class="image" alt="Confluent Cloud 로고" style={{width: '3rem'}}/>                 | 스트리밍 | 안정적           | 직접 통합을 통해 Confluent와 ClickHouse Cloud의 결합된 기능을 활용할 수 있습니다.          |
| Redpanda                                           | <Image img={redpanda_logo} size="logo" alt="Redpanda 로고"/>                                     | 스트리밍 | 안정적           | ClickPipes를 구성하고 Redpanda에서 ClickHouse Cloud로 스트리밍 데이터를 수집합니다.         |
| AWS MSK                                            | <Msksvg class="image" alt="AWS MSK 로고" style={{width: '3rem', 'height': '3rem'}}/>             | 스트리밍 | 안정적           | ClickPipes를 구성하고 AWS MSK에서 ClickHouse Cloud로 스트리밍 데이터를 수집합니다.          |
| Azure Event Hubs                                   | <Azureeventhubssvg class="image" alt="Azure Event Hubs 로고" style={{width: '3rem'}}/>           | 스트리밍 | 안정적           | ClickPipes를 구성하고 Azure Event Hubs에서 ClickHouse Cloud로 스트리밍 데이터를 수집합니다. [Azure Event Hubs FAQ](/integrations/clickpipes/kafka/faq/#azure-eventhubs)에서 안내를 참고하세요. |
| WarpStream                                         | <Warpstreamsvg class="image" alt="WarpStream 로고" style={{width: '3rem'}}/>                     | 스트리밍 | 안정적           | ClickPipes를 구성하고 WarpStream에서 ClickHouse Cloud로 스트리밍 데이터를 수집합니다.       |
| Amazon S3                                          | <S3svg class="image" alt="Amazon S3 로고" style={{width: '3rem', height: 'auto'}}/>              | 객체 저장소 | 안정적           | ClickPipes를 구성하여 객체 저장소에서 대량의 데이터를 수집합니다.                            |
| Google Cloud Storage                               | <Gcssvg class="image" alt="Google Cloud Storage 로고" style={{width: '3rem', height: 'auto'}}/>  | 객체 저장소 | 안정적           | ClickPipes를 구성하여 객체 저장소에서 대량의 데이터를 수집합니다.                            |
| DigitalOcean Spaces                                | <DOsvg class="image" alt="Digital Ocean 로고" style={{width: '3rem', height: 'auto'}}/> | 객체 저장소 | 안정적           | ClickPipes를 구성하여 객체 저장소에서 대량의 데이터를 수집합니다.                        |
| Azure Blob Storage                                 | <ABSsvg class="image" alt="Azure Blob Storage 로고" style={{width: '3rem', height: 'auto'}}/> | 객체 저장소 | 안정적           | ClickPipes를 구성하여 객체 저장소에서 대량의 데이터를 수집합니다.                        |
| [Amazon Kinesis](/integrations/clickpipes/kinesis) | <Amazonkinesis class="image" alt="Amazon Kinesis 로고" style={{width: '3rem', height: 'auto'}}/> | 스트리밍 | 안정적           | ClickPipes를 구성하고 Amazon Kinesis에서 ClickHouse Cloud로 스트리밍 데이터를 수집합니다.   |
| [Postgres](/integrations/clickpipes/postgres)      | <Postgressvg class="image" alt="Postgres 로고" style={{width: '3rem', height: 'auto'}}/>         | DBMS | 안정적      | ClickPipes를 구성하고 Postgres에서 ClickHouse Cloud로 데이터를 수집합니다.                   |
| [MySQL](/integrations/clickpipes/mysql)            | <Mysqlsvg class="image" alt="MySQL 로고" style={{width: '3rem', height: '3rem'}}/>               | DBMS | 공개 베타 | ClickPipes를 구성하고 MySQL에서 ClickHouse Cloud로 데이터를 수집합니다.                      |
| [MongoDB](/integrations/clickpipes/mongodb)        | <Mongodbsvg class="image" alt="MongoDB 로고" style={{width: '3rem', height: '3rem'}}/>           | DBMS | 비공식 미리 보기 | ClickPipes를 구성하고 MongoDB에서 ClickHouse Cloud로 데이터를 수집합니다.                   |

더 많은 커넥터가 ClickPipes에 추가될 예정이며, [저희에게 문의하여](https://clickhouse.com/company/contact?loc=clickpipes) 더 많은 정보를 얻을 수 있습니다.

## 정적 IP 목록 {#list-of-static-ips}

다음은 ClickPipes가 외부 서비스에 연결하기 위해 사용하는 정적 NAT IP이며, 지역별로 구분되어 있습니다. 트래픽을 허용하기 위해 관련 인스턴스 지역 IP를 IP 허용 목록에 추가하십시오.

모든 서비스에 대해 ClickPipes 트래픽은 서비스 위치에 따라 기본 지역에서 발생합니다:
- **eu-central-1**: EU 지역의 모든 서비스에 대해. (여기에는 GCP와 Azure EU 지역이 포함됩니다)
- **us-east-1**: AWS `us-east-1`의 모든 서비스에 대해.
- **ap-south-1**: 2025년 6월 25일 이후에 생성된 AWS `ap-south-1` 서비스에 대해 (이 날짜 이전에 생성된 서비스는 `us-east-2` IP를 사용합니다).
- **ap-southeast-2**: 2025년 6월 25일 이후에 생성된 AWS `ap-southeast-2` 서비스에 대해 (이 날짜 이전에 생성된 서비스는 `us-east-2` IP를 사용합니다).
- **us-west-2**: 2025년 6월 24일 이후에 생성된 AWS `us-west-2` 서비스에 대해 (이 날짜 이전에 생성된 서비스는 `us-east-2` IP를 사용합니다).
- **us-east-2**: 명시적으로 나열되지 않은 모든 지역에 대해. (여기에는 GCP와 Azure US 지역이 포함됩니다)

| AWS 지역                             | IP 주소                                                                                                                                      |
|---------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| **eu-central-1**                      | `18.195.233.217`, `3.127.86.90`, `35.157.23.2`, `18.197.167.47`, `3.122.25.29`, `52.28.148.40`                                              |
| **us-east-1**                         | `54.82.38.199`, `3.90.133.29`, `52.5.177.8`, `3.227.227.145`, `3.216.6.184`, `54.84.202.92`, `3.131.130.196`, `3.23.172.68`, `3.20.208.150`  |
| **us-east-2**                         | `3.131.130.196`, `3.23.172.68`, `3.20.208.150`, `3.132.20.192`, `18.119.76.110`, `3.134.185.180`                                              |
| **ap-south-1** (2025년 6월 25일부터)     | `13.203.140.189`, `13.232.213.12`, `13.235.145.208`, `35.154.167.40`, `65.0.39.245`, `65.1.225.89`                                          |
| **ap-southeast-2** (2025년 6월 25일부터) | `3.106.48.103`, `52.62.168.142`, `13.55.113.162`, `3.24.61.148`, `54.206.77.184`, `54.79.253.17`                                          |
| **us-west-2** (2025년 6월 24일부터)      | `52.42.100.5`, `44.242.47.162`, `52.40.44.52`, `44.227.206.163`, `44.246.241.23`, `35.83.230.19`                                          |

## ClickHouse 설정 조정하기 {#adjusting-clickhouse-settings}
ClickHouse Cloud는 대부분의 사용 사례에 대해 합리적인 기본값을 제공합니다. 그러나 ClickPipes 목적 테이블에 대해 ClickHouse 설정을 조정해야 하는 경우 ClickPipes 전용 역할이 가장 유연한 솔루션입니다.
단계:
1. 사용자 정의 역할 생성 `CREATE ROLE my_clickpipes_role SETTINGS ...`. 자세한 내용은 [CREATE ROLE](/sql-reference/statements/create/role.md) 구문을 참조하세요.
2. ClickPipes 생성 중 `세부정보 및 설정` 단계에서 사용자 정의 역할을 ClickPipes 사용자에게 추가합니다.

<Image img={cp_custom_role} alt="사용자 정의 역할 할당" size="lg" border/>

## ClickPipes 고급 설정 조정하기 {#clickpipes-advanced-settings}
ClickPipes는 대부분의 사용 사례의 요구 사항을 충족하는 합리적인 기본값을 제공합니다. 사용 사례에 추가적인 조정이 필요한 경우, 다음 설정을 조정할 수 있습니다:

### 객체 저장소 ClickPipes {#clickpipes-advanced-settings-object-storage}

| 설정                             | 기본값 | 설명                     |                    
|----------------------------------|---------|-----------------------------------------------------------------------------------|
| `Max insert bytes`               | 10GB    | 단일 삽입 배치에서 처리할 바이트 수.                                           |
| `Max file count`                 | 100     | 단일 삽입 배치에서 처리할 최대 파일 수.                                       |
| `Max threads`                    | auto(3) | [파일 처리의 동시 최대 스레드 수](/operations/settings/settings#max_threads). |
| `Max insert threads`             | 1       | [파일 처리의 동시 최대 삽입 스레드 수](/operations/settings/settings#max_insert_threads). |
| `Min insert block size bytes`    | 1GB     | 테이블에 삽입할 수 있는 블록의 [최소 바이트 크기](/operations/settings/settings#min_insert_block_size_bytes). |
| `Max download threads`           | 4       | [최대 동시 다운로드 스레드 수](/operations/settings/settings#max_download_threads). |
| `Object storage polling interval` | 30s     | ClickHouse 클러스터에 데이터를 삽입하기 전 최대 대기 시간을 구성합니다.        |
| `Parallel distributed insert select` | 2     | [병렬 분산 삽입 선택 설정](/operations/settings/settings#parallel_distributed_insert_select). |
| `Parallel view processing`        | false   | 첨부 뷰에 [순차적으로가 아닌 동시에 푸시할지 여부](/operations/settings/settings#parallel_view_processing). |
| `Use cluster function`            | true    | 여러 노드에서 파일을 병렬로 처리할지 여부.                                     |

<Image img={cp_advanced_settings} alt="ClickPipes의 고급 설정" size="lg" border/>

### 스트리밍 ClickPipes {#clickpipes-advanced-settings-streaming}

| 설정                             | 기본값 | 설명                     |                    
|----------------------------------|---------|-----------------------------------------------------------------------------------|
| `Streaming max insert wait time`  | 5s      | ClickHouse 클러스터에 데이터를 삽입하기 전 최대 대기 시간을 구성합니다.        |

## 오류 보고 {#error-reporting}
ClickPipes는 수집 과정에서 발생한 오류의 유형에 따라 두 개의 별개의 테이블에 오류를 저장합니다.
### 레코드 오류 {#record-errors}
ClickPipes는 `<destination_table_name>_clickpipes_error` 접미사가 붙은 테이블을 목적 테이블 옆에 생성합니다. 이 테이블은 형식이 잘못된 데이터 또는 스키마 불일치에서 발생한 오류를 포함하며 잘못된 메시지의 전체 내용을 포함합니다. 이 테이블의 [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)은 7일입니다.
### 시스템 오류 {#system-errors}
ClickPipe 작업과 관련된 오류는 `system.clickpipes_log` 테이블에 저장됩니다. 이 테이블은 ClickPipe의 운영과 관계된 모든 다른 오류(네트워크, 연결 등)를 저장합니다. 이 테이블의 [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)은 7일입니다.

ClickPipes가 15분 이내에 데이터 소스에 연결할 수 없거나 1시간 이내에 목적지에 연결할 수 없으면 ClickPipes 인스턴스는 중지되고 시스템 오류 테이블에 적절한 메시지가 저장됩니다(ClickHouse 인스턴스를 사용할 수 있는 경우).

## FAQ {#faq}
- **ClickPipes란 무엇인가요?**

  ClickPipes는 ClickHouse Cloud의 기능으로, 사용자가 ClickHouse 서비스를 외부 데이터 소스, 특히 Kafka에 쉽게 연결할 수 있도록 합니다. ClickPipes for Kafka를 사용하면 사용자가 데이터를 ClickHouse에 지속적으로 로드하여 실시간 분석을 위해 사용할 수 있습니다.

- **ClickPipes는 데이터 변환을 지원하나요?**

  예, ClickPipes는 DDL 생성을 노출하여 기본적인 데이터 변환을 지원합니다. 이후 ClickHouse Cloud 서비스의 목적 테이블에 우선 데이터가 로드되는 동안 더 고급 변환을 적용할 수 있습니다. ClickHouse의 [물리화된 뷰 기능](/guides/developer/cascading-materialized-views)을 활용할 수 있습니다.

- **ClickPipes를 사용하면 추가 비용이 발생하나요?**

  ClickPipes는 수집된 데이터와 컴퓨팅 두 개의 차원으로 요금이 부과됩니다. 요금의 전체 세부정보는 [이 페이지](/cloud/reference/billing/clickpipes)에서 확인할 수 있습니다. ClickPipes를 운영하면 ClickHouse Cloud 서비스의 목적지에서 수집 작업과 유사한 간접적인 컴퓨팅 및 저장 비용이 발생할 수 있습니다.

- **ClickPipes for Kafka를 사용할 때 오류나 실패를 처리할 수 있는 방법이 있나요?**

  예, ClickPipes for Kafka는 네트워크 문제, 연결 문제 등 운영 문제가 발생할 경우 Kafka에서 데이터를 소모할 때 자동으로 재시도합니다. 형식이 잘못된 데이터나 유효하지 않은 스키마의 경우, ClickPipes는 레코드를 레코드 오류 테이블에 저장하고 계속해서 처리를 진행합니다.
