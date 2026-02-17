---
sidebar_label: '소개'
description: '외부 데이터 소스를 ClickHouse Cloud에 원활하게 연결할 수 있습니다.'
slug: /integrations/clickpipes
title: 'ClickHouse Cloud와의 통합'
doc_type: 'guide'
keywords: ['ClickPipes', '데이터 수집 플랫폼', '스트리밍 데이터', '통합 플랫폼', 'ClickHouse Cloud']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
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


# ClickHouse Cloud 통합 \{#integrating-with-clickhouse-cloud\}

## 소개 \{#introduction\}

[ClickPipes](/integrations/clickpipes)는 다양한 소스에서 데이터를 수집하는 작업을 몇 번의 클릭만으로 수행할 수 있게 해 주는 관리형 통합 플랫폼입니다. 가장 높은 수준의 워크로드를 위해 설계된 ClickPipes의 안정적이고 확장 가능한 아키텍처는 일관된 성능과 신뢰성을 보장합니다. ClickPipes는 장기적인 스트리밍 용도는 물론, 일회성 데이터 적재 작업에도 사용할 수 있습니다.

<Image img={clickpipes_stack} alt="ClickPipes 스택" size="lg" border/>

## 지원되는 데이터 소스 \{#supported-data-sources\}

| 이름                                               | 로고                                                                                             |유형| 상태           | 설명                                                                                          |
|----------------------------------------------------|--------------------------------------------------------------------------------------------------|----|------------------|------------------------------------------------------------------------------------------------------|
| [Apache Kafka](/integrations/clickpipes/kafka)     | <Kafkasvg class="image" alt="Apache Kafka 로고" style={{width: '3rem', 'height': '3rem'}}/>      |스트리밍| 안정 버전           | ClickPipes를 구성하여 Apache Kafka에서 ClickHouse Cloud로 스트리밍 데이터를 수집하기 시작합니다.     |
| Confluent Cloud                                    | <Confluentsvg class="image" alt="Confluent Cloud 로고" style={{width: '3rem'}}/>                 |스트리밍| 안정 버전           | 직접 연동을 통해 Confluent와 ClickHouse Cloud의 결합된 기능을 활용하십시오.          |
| Redpanda                                           | <Image img={redpanda_logo} size="logo" alt="Redpanda 로고"/>                                     |스트리밍| 안정 버전           | ClickPipes를 구성하여 Redpanda에서 ClickHouse Cloud로 스트리밍 데이터를 수집하기 시작합니다.         |
| AWS MSK                                            | <Msksvg class="image" alt="AWS MSK 로고" style={{width: '3rem', 'height': '3rem'}}/>             |스트리밍| 안정 버전           | ClickPipes를 구성하여 AWS MSK에서 ClickHouse Cloud로 스트리밍 데이터를 수집하기 시작합니다.          |
| Azure Event Hubs                                   | <Azureeventhubssvg class="image" alt="Azure Event Hubs 로고" style={{width: '3rem'}}/>           |스트리밍| 안정 버전           | ClickPipes를 구성하여 Azure Event Hubs에서 ClickHouse Cloud로 스트리밍 데이터를 수집하기 시작합니다. 자세한 내용은 [Azure Event Hubs FAQ](/integrations/clickpipes/kafka/faq/#azure-eventhubs)를 참조하십시오. |
| WarpStream                                         | <Warpstreamsvg class="image" alt="WarpStream 로고" style={{width: '3rem'}}/>                     |스트리밍| 안정 버전           | ClickPipes를 구성하여 WarpStream에서 ClickHouse Cloud로 스트리밍 데이터를 수집하기 시작합니다.       |
| Amazon S3                                          | <S3svg class="image" alt="Amazon S3 로고" style={{width: '3rem', height: 'auto'}}/>              |객체 스토리지| 안정 버전           | 객체 스토리지에서 대용량 데이터를 수집하도록 ClickPipes를 구성합니다.                            |
| Google Cloud Storage                               | <Gcssvg class="image" alt="Google Cloud Storage 로고" style={{width: '3rem', height: 'auto'}}/>  |객체 스토리지| 안정 버전           | 객체 스토리지에서 대용량 데이터를 수집하도록 ClickPipes를 구성합니다.                            |
| DigitalOcean Spaces                                | <DOsvg class="image" alt="DigitalOcean 로고" style={{width: '3rem', height: 'auto'}}/> | 객체 스토리지 | 안정 버전 | 객체 스토리지에서 대용량 데이터를 수집하도록 ClickPipes를 구성합니다.
| Azure Blob Storage                                 | <ABSsvg class="image" alt="Azure Blob Storage 로고" style={{width: '3rem', height: 'auto'}}/> | 객체 스토리지 | 안정 버전 | 객체 스토리지에서 대용량 데이터를 수집하도록 ClickPipes를 구성합니다.
| [Amazon Kinesis](/integrations/clickpipes/kinesis) | <Amazonkinesis class="image" alt="Amazon Kinesis 로고" style={{width: '3rem', height: 'auto'}}/> |스트리밍| 안정 버전           | ClickPipes를 구성하여 Amazon Kinesis에서 ClickHouse Cloud로 스트리밍 데이터를 수집하기 시작합니다.   |
| [Postgres](/integrations/clickpipes/postgres)      | <Postgressvg class="image" alt="Postgres 로고" style={{width: '3rem', height: 'auto'}}/>         |DBMS| 안정 버전      | ClickPipes를 구성하여 Postgres에서 ClickHouse Cloud로 데이터를 수집하기 시작합니다.                   |
| [MySQL](/integrations/clickpipes/mysql)            | <Mysqlsvg class="image" alt="MySQL 로고" style={{width: '3rem', height: '3rem'}}/>               |DBMS| 퍼블릭 베타 | ClickPipes를 구성하여 MySQL에서 ClickHouse Cloud로 데이터를 수집하기 시작합니다.                      |
| [MongoDB](/integrations/clickpipes/mongodb)        | <Mongodbsvg class="image" alt="MongoDB 로고" style={{width: '3rem', height: '3rem'}}/>           |DBMS| 프라이빗 프리뷰 | ClickPipes를 구성하여 MongoDB에서 ClickHouse Cloud로 데이터를 수집하기 시작합니다.                   |

더 많은 커넥터가 ClickPipes에 추가될 예정입니다. 자세한 내용은 [문의](https://clickhouse.com/company/contact?loc=clickpipes) 페이지를 참조하시기 바랍니다.

## List of Static IPs \{#list-of-static-ips\}

다음은 ClickPipes가 외부 서비스에 연결할 때 사용하는 정적 NAT IP 주소(리전별 구분)입니다. 트래픽을 허용하려면 관련 인스턴스 리전의 IP를 IP 허용 목록에 추가하십시오. object storage 파이프의 경우 [ClickHouse 클러스터 IP](/manage/data-sources/cloud-endpoints-api)도 IP 허용 목록에 추가해야 합니다.

모든 서비스에 대해 ClickPipes 트래픽은 서비스 위치를 기준으로 기본 리전에서 발생합니다:

- **eu-central-1**: 별도로 명시되지 않은 모든 EU 리전(GCP 및 Azure EU 리전을 포함합니다).
- **eu-west-1**: 2026년 1월 20일 이후에 생성된 AWS `eu-west-1`의 모든 서비스(해당 날짜 이전에 생성된 서비스는 `eu-central-1` IP를 사용합니다).
- **us-east-1**: AWS `us-east-1`의 모든 서비스.
- **ap-south-1**: 2025년 6월 25일 이후에 생성된 AWS `ap-south-1`의 서비스(해당 날짜 이전에 생성된 서비스는 `us-east-2` IP를 사용합니다).
- **ap-northeast-2**: 2025년 11월 14일 이후에 생성된 AWS `ap-northeast-2`의 서비스(해당 날짜 이전에 생성된 서비스는 `us-east-2` IP를 사용합니다).
- **ap-southeast-2**: 2025년 6월 25일 이후에 생성된 AWS `ap-southeast-2`의 서비스(해당 날짜 이전에 생성된 서비스는 `us-east-2` IP를 사용합니다).
- **us-west-2**: 2025년 6월 24일 이후에 생성된 AWS `us-west-2`의 서비스(해당 날짜 이전에 생성된 서비스는 `us-east-2` IP를 사용합니다).
- **us-east-2**: 위에서 별도로 명시되지 않은 기타 모든 리전(GCP 및 Azure 리전을 포함합니다).

| AWS region                            | IP Addresses                                                                                                                                     |
|---------------------------------------| ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **eu-central-1**                      | `18.195.233.217`, `3.127.86.90`, `35.157.23.2`, `18.197.167.47`, `3.122.25.29`, `52.28.148.40`                                                       |
| **eu-west-1** (from 20 Jan 2026)      | `54.228.1.92` , `54.72.101.254`, `54.228.16.208`, `54.76.200.104`, `52.211.2.177`, `54.77.10.134`                                                      |
| **us-east-1**                         | `54.82.38.199`, `3.90.133.29`, `52.5.177.8`, `3.227.227.145`, `3.216.6.184`, `54.84.202.92`, `3.131.130.196`, `3.23.172.68`, `3.20.208.150`      |
| **us-east-2**                         | `3.131.130.196`, `3.23.172.68`, `3.20.208.150`, `3.132.20.192`, `18.119.76.110`, `3.134.185.180`                                                     |
| **ap-south-1** (from 25 Jun 2025)     | `13.203.140.189`, `13.232.213.12`, `13.235.145.208`, `35.154.167.40`, `65.0.39.245`, `65.1.225.89`                                                   |
| **ap-northeast-2** (from 14 Nov 2025) | `3.38.68.69`, `52.78.68.128`, `13.209.152.13`, `3.38.24.84`, `3.37.159.31`, `3.34.25.104` 
                    |
| **ap-southeast-2** (from 25 Jun 2025) | `3.106.48.103`, `52.62.168.142`, `13.55.113.162`, `3.24.61.148`, `54.206.77.184`, `54.79.253.17`                                                     |
| **us-west-2** (from 24 Jun 2025)      | `52.42.100.5`, `44.242.47.162`, `52.40.44.52`, `44.227.206.163`, `44.246.241.23`, `35.83.230.19`                                                     |

## ClickHouse 설정 조정 \{#adjusting-clickhouse-settings\}

ClickHouse Cloud는 대부분의 사용 사례에 대해 합리적인 기본값을 제공합니다. 그러나 ClickPipes 대상 테이블에 대해 일부 ClickHouse 설정을 조정해야 하는 경우, ClickPipes 전용 역할을 사용하는 것이 가장 유연한 방법입니다.
단계:

1. 커스텀 역할을 생성합니다: `CREATE ROLE my_clickpipes_role SETTINGS ...`. 자세한 문법은 [CREATE ROLE](/sql-reference/statements/create/role.md) 문서를 참고하십시오.
2. ClickPipes를 생성하는 과정에서 `Details and Settings` 단계에서 해당 커스텀 역할을 ClickPipes 사용자에 추가합니다.

<Image img={cp_custom_role} alt="커스텀 역할 할당" size="lg" border/>

## ClickPipes 고급 설정 조정 \{#clickpipes-advanced-settings\}

ClickPipes는 대부분의 사용 사례를 충족하는 합리적인 기본 설정을 제공합니다. 특정 사용 사례에서 추가적인 미세 조정이 필요한 경우, 다음 설정을 변경할 수 있습니다:

### 객체 스토리지 ClickPipes \{#clickpipes-advanced-settings-object-storage\}

| 설정                                | 기본값        |  설명                              |                    
|------------------------------------|---------------|---------------------------------------------------------------------------------------|
| `Max insert bytes`                 | 10GB          | 단일 insert 배치에서 처리하는 바이트 수입니다.                                  |
| `Max file count`                   | 100           | 단일 insert 배치에서 처리할 파일의 최대 개수입니다.                          |
| `Max threads`                      | auto(3)       | 파일 처리를 위한 [동시 실행 스레드의 최대 개수](/operations/settings/settings#max_threads)입니다. |
| `Max insert threads`               | 1             | 파일 처리를 위한 [동시 실행 insert 스레드의 최대 개수](/operations/settings/settings#max_insert_threads)입니다. |
| `Min insert block size bytes`      | 1GB           | 테이블에 insert할 수 있는 [블록의 최소 바이트 크기](/operations/settings/settings#min_insert_block_size_bytes)입니다. |
| `Max download threads`             | 4             | [동시 실행 다운로드 스레드의 최대 개수](/operations/settings/settings#max_download_threads)입니다. |
| `Object storage polling interval`  | 30s           | ClickHouse 클러스터로 데이터를 insert하기 전까지의 최대 대기 시간을 설정합니다. |
| `Parallel distributed insert select` | 2           | [Parallel distributed insert select 설정](/operations/settings/settings#parallel_distributed_insert_select)입니다. |
| `Parallel view processing`         | false         | [순차적으로가 아니라 동시에](/operations/settings/settings#parallel_view_processing) 연결된 뷰로 푸시할지 여부입니다. |
| `Use cluster function`             | true          | 여러 노드에 걸쳐 파일을 병렬로 처리할지 여부입니다. |

<Image img={cp_advanced_settings} alt="ClickPipes 고급 설정" size="lg" border/>

### 스트리밍 ClickPipes \{#clickpipes-advanced-settings-streaming\}

| 설정                                | 기본값        |  설명                             |                    
|------------------------------------|---------------|---------------------------------------------------------------------------------------|
| `Streaming max insert wait time`   | 5s            | ClickHouse 클러스터에 데이터를 삽입하기까지의 최대 대기 시간을 구성합니다. |

## 오류 보고 \{#error-reporting\}

ClickPipes는 수집 과정에서 발생한 오류 유형에 따라 오류를 두 개의 별도 테이블에 저장합니다.

### 레코드 오류 \{#record-errors\}

ClickPipes는 대상 테이블과 동일한 데이터베이스에 `<destination_table_name>_clickpipes_error` 접미사가 붙은 테이블을 생성합니다. 이 테이블에는 형식이 잘못된 데이터나 스키마 불일치로 인해 발생한 모든 오류가 저장되며, 잘못된 전체 메시지가 포함됩니다. 이 테이블의 [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)은 7일입니다.

### 시스템 오류 \{#system-errors\}

ClickPipe 동작과 관련된 오류는 `system.clickpipes_log` 테이블에 저장됩니다. 이 테이블은 ClickPipe 동작과 관련된 기타 모든 오류(네트워크, 연결 문제 등)를 모두 저장하며, [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)은 7일로 설정되어 있습니다.

ClickPipes가 데이터 소스에는 15분 동안, 대상에는 1시간 동안 연결하지 못하면, ClickHouse 인스턴스를 사용할 수 있는 경우에 한해 ClickPipes 인스턴스가 중지되고 시스템 오류 테이블에 적절한 메시지를 저장합니다.

## FAQ \{#faq\}

- **ClickPipes란 무엇입니까?**

  ClickPipes는 ClickHouse 서비스를 특히 Kafka와 같은 외부 데이터 소스에 쉽게 연결할 수 있게 해 주는 ClickHouse Cloud 기능입니다. ClickPipes for Kafka를 사용하면 데이터를 ClickHouse로 지속적으로 손쉽게 수집하여 ClickHouse에서 실시간 분석에 사용할 수 있도록 할 수 있습니다.

- **ClickPipes는 데이터 변환을 지원합니까?**

  예, ClickPipes는 DDL 생성 기능을 제공하여 기본적인 데이터 변환을 지원합니다. 그런 다음 ClickHouse의 [materialized views 기능](/guides/developer/cascading-materialized-views)을 활용하는 ClickHouse Cloud 서비스에서, 대상 테이블로 데이터가 로드될 때 더 고급 변환을 적용할 수 있습니다.

- **ClickPipes를 사용하면 추가 비용이 발생합니까?**

  ClickPipes는 수집된 데이터(Ingested Data)와 Compute, 이렇게 두 가지 기준에 따라 과금됩니다. 가격에 대한 전체 세부 정보는 [이 페이지](/cloud/reference/billing/clickpipes)에서 확인할 수 있습니다. ClickPipes를 실행하면 다른 수집 워크로드와 마찬가지로 대상 ClickHouse Cloud 서비스에서 간접적인 컴퓨팅 및 스토리지 비용이 발생할 수 있습니다.

- **Kafka용 ClickPipes를 사용할 때 오류나 실패를 처리할 수 있는 방법이 있습니까?**

  예, Kafka용 ClickPipes는 네트워크 문제, 연결 문제 등 운영상의 문제로 인해 Kafka에서 데이터를 가져오는 동안 장애가 발생하는 경우 자동으로 재시도합니다. 잘못된 형식의 데이터나 유효하지 않은 스키마가 있는 경우에는 ClickPipes가 해당 레코드를 `record_error` 테이블에 저장하고 처리를 계속합니다.