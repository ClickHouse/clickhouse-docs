---
slug: /whats-new/cloud
sidebar_label: 'Cloud 변경 로그'
title: 'Cloud 변경 로그'
description: '각 ClickHouse Cloud 릴리스의 새로운 내용을 정리한 ClickHouse Cloud 변경 로그입니다'
doc_type: '변경 로그'
keywords: ['변경 로그', '릴리스 노트', '업데이트', '새 기능', 'Cloud 변경 사항']
---

import Image from '@theme/IdealImage';
import add_marketplace from '@site/static/images/cloud/reference/add_marketplace.png';
import beta_dashboards from '@site/static/images/cloud/reference/beta_dashboards.png';
import api_endpoints from '@site/static/images/cloud/reference/api_endpoints.png';
import cross_vpc from '@site/static/images/cloud/reference/cross-vpc-clickpipes.png';
import nov_22 from '@site/static/images/cloud/reference/nov-22-dashboard.png';
import private_endpoint from '@site/static/images/cloud/reference/may-30-private-endpoints.png';
import notifications from '@site/static/images/cloud/reference/nov-8-notifications.png';
import kenesis from '@site/static/images/cloud/reference/may-17-kinesis.png';
import s3_gcs from '@site/static/images/cloud/reference/clickpipes-s3-gcs.png';
import tokyo from '@site/static/images/cloud/reference/create-tokyo-service.png';
import cloud_console from '@site/static/images/cloud/reference/new-cloud-console.gif';
import copilot from '@site/static/images/cloud/reference/nov-22-copilot.gif';
import latency_insights from '@site/static/images/cloud/reference/oct-4-latency-insights.png';
import cloud_console_2 from '@site/static/images/cloud/reference/aug-15-compute-compute.png';
import compute_compute from '@site/static/images/cloud/reference/july-18-table-inspector.png';
import query_insights from '@site/static/images/cloud/reference/june-28-query-insights.png';
import prometheus from '@site/static/images/cloud/reference/june-28-prometheus.png';
import kafka_config from '@site/static/images/cloud/reference/june-13-kafka-config.png';
import fast_releases from '@site/static/images/cloud/reference/june-13-fast-releases.png';
import share_queries from '@site/static/images/cloud/reference/may-30-share-queries.png';
import query_endpoints from '@site/static/images/cloud/reference/may-17-query-endpoints.png';
import dashboards from '@site/static/images/cloud/reference/may-30-dashboards.png';
import crash_reports_collection from '@site/static/images/cloud/reference/crash-reports-collection.png';

이 ClickHouse Cloud 변경 로그 외에도 [Cloud Compatibility](/whats-new/cloud-compatibility) 페이지를 참고하십시오.

:::tip[자동으로 최신 상태를 유지하세요!]

<a href="/docs/cloud/changelog-rss.xml">
  RSS로 Cloud 변경 로그를 구독하십시오
</a>

:::


## 2026년 2월 20일 \{#february-20-2026\}

- **ClickPipes:** 비활성 상태인 Reverse private endpoint는 설정된 유예 기간이 지나면 이제 자동으로 제거됩니다. 이를 통해 사용되지 않거나 잘못 구성된 엔드포인트가 백엔드에 무기한 남지 않도록 합니다. 자세한 내용은 자동 정리 [문서](/integrations/clickpipes/aws-privatelink#automatic-cleanup)를 참조하십시오.

## 2026년 2월 13일 \{#february-13-2026\}

- [BigQuery Connector](/integrations/clickpipes/bigquery/overview)가 이제 Private Preview 단계입니다. 자세한 내용은 이 [블로그 글](https://clickhouse.com/blog/bigquery-clickpipe-private-preview)에서 확인하고, 액세스 권한을 받기 위해 [대기자 명단](https://clickhouse.com/cloud/clickpipes/bigquery-connector)에 등록하십시오.
- Google Cloud에 대한 PCI 배포 지원을 발표합니다. 지원 리전:
  - GCP europe-west4 (네덜란드)
  - GCP us-central1 (아이오와)
  - GCP us-east1 (사우스캐롤라이나)
- 크래시 보고서 수집 기본 설정을 이제 조직 수준에서 구성할 수 있습니다. 이 설정은 이전에는 서비스 수준에서만 사용할 수 있었습니다. 조직 수준에서 비활성화하면, 기존 및 향후 생성될 모든 서비스에서 자동으로 수집이 해제됩니다.

<Image img={crash_reports_collection} size="md" alt="크래시 보고서 수집" />

## 2026년 1월 23일 \{#january-23-2026\}

- ClickPipes가 이제 AWS `eu-west-1`에서 사용할 수 있습니다. 해당 리전에서 1월 20일 이후에 생성된 새 ClickHouse Cloud 서비스에는 ClickPipes도 동일한 리전을 사용합니다. 더 오래된 서비스의 경우 ClickPipes는 기본적으로 `eu-central-1`을 사용합니다. 자세한 내용은 [문서](/integrations/clickpipes#list-of-static-ips)를 참조하십시오.

## 2026년 1월 16일 \{#january-16-2026\}

- **API를 통한 서비스 수준 사용 비용 필터링:** 이제 API에서 조직의 사용 비용을 특정 서비스 태그별로 필터링할 수 있어, 더 세밀한 수준에서 비용을 분석하기가 쉬워졌습니다.
- **Data Catalog 통합:** 이제 외부 데이터 카탈로그를 데이터 소스로 연결할 수 있습니다. ClickHouse Cloud는 AWS Glue 및 Unity Catalog를 지원하며(추가 지원 예정), 연결이 완료되면 카탈로그가 하나의 데이터베이스로 표시되어 데이터를 복제하지 않고도 Iceberg 테이블을 직접 조회할 수 있습니다. 액세스 권한이 필요한 경우 지원팀에 문의하여 요청하십시오.
- **ClickPipes:**
  - MongoDB 커넥터가 Public Beta로 승격되었으며, 이제 모든 서비스 티어에서 신규 및 기존 ClickHouse Cloud 고객이 사용할 수 있습니다. 새로운 기능 개요는 [블로그 게시물](https://clickhouse.com/blog/mongodb-cdc-connector-clickpipes-beta)을 참고하고, 시작하려면 [문서](/integrations/clickpipes/mongodb)를 확인하십시오.
  - [S3 ClickPipe](/integrations/clickpipes/object-storage/s3/overview)는 이제 OVHcloud의 S3 API 호환 객체 스토리지 서비스인 OVH Object Storage와 호환됩니다.

## 2025년 12월 19일 \{#december-19-2025\}

- AWS ap-south-1 리전에서 이제 PCI 규격을 준수하는 서비스를 배포할 수 있습니다.
- **통합 사용자 아이덴티티 프라이빗 프리뷰**
  콘솔에서 데이터베이스 사용자를 관리하려는 고객은 SQL 콘솔용 새로운 인증 방법을 활성화할 수 있습니다.
  이를 통해 데이터베이스 사용자 관리를 콘솔에 도입하는 작업을 계속 진행하는 동안, 고객이 새로운 인증 방법을 미리 사용해 볼 수 있습니다.
- **S3 ClickPipes에서 무순서(Unordered) 모드 사용 가능**:
  이제 고객은 Amazon S3에서 ClickHouse Cloud로 데이터를 임의 순서로 수집하여 이벤트 기반 분석을 수행할 수 있습니다.
  파일은 더 이상 처리 목적으로 사전식(lexicographical) 순서로 정렬될 필요가 없습니다. 자세한 내용은 안내 [블로그](https://clickhouse.com/blog/clickpipes-s3-unordered-mode)에서 확인할 수 있습니다.
- Fivetran 커넥터가 최근 베타 단계로 전환되었습니다. Fivetran을 사용 중이며 ClickHouse를 대상(destination)으로 설정하려는 경우, 이 [문서](https://fivetran.com/docs/destinations/clickhouse/setup-guide)를 참고하십시오.

## 2025년 12월 12일 \{#december-12-2025\}

- **SAML SSO 셀프 서비스 설정**

  Enterprise 고객은 이제 콘솔에서 지원 티켓 없이 SAML 설정을 완료할 수 있습니다.
  추가로, SAML 고객은 ID 공급자를 통해 추가되는 신규 사용자에게 할당될 기본 역할을 설정하고, 사용자 지정 세션 타임아웃 설정을 구성할 수 있습니다.
  자세한 내용은 [문서](/cloud/security/saml-setup)를 참고하십시오.
- **Azure의 최대 레플리카 크기 및 스케일링 한도**  

  이제 고객은 모든 Azure 리전에서 최대 레플리카 크기를 356 GiB로 설정할 수 있으며, `eastus2`에서는 사용 가능한 최대 레플리카 크기가 120 GiB입니다.

## 2025년 11월 21일 \{#november-21-2025\}

- ClickHouse Cloud가 이제 **AWS Israel (Tel Aviv) — il-central-1** 리전에서 사용 가능합니다.
- ClickHouse 조직을 마켓플레이스 종량제 구독 또는 프라이빗 오퍼로 과금하도록 설정하는 마켓플레이스 온보딩 환경을 개선했습니다.

## 2025년 11월 14일 \{#november-14-2025\}

- 이제 **ClickHouse Cloud**를 **추가된 2개의 퍼블릭 리전**에서 사용할 수 있습니다.
  - **GCP Japan (asia-northeast1)**
  - **AWS Seoul (Asia Pacific, ap-northeast-2)** — 이제 **ClickPipes**에서도 지원됩니다.

  이 리전들은 이전에는 **프라이빗 리전**으로만 제공되었으나, 이제 **모든 사용자에게 개방**되었습니다.
- Terraform 및 API에서 이제 서비스에 태그를 추가하고, 태그를 기준으로 서비스를 필터링하는 기능을 지원합니다.

## 2025년 11월 7일 \{#november-7-2025\}

- ClickHouse Cloud 콘솔에서 이제 레플리카 크기를 1 vCPU, 4 GiB 단위로 설정할 수 있습니다.
  이러한 옵션은 신규 서비스를 설정할 때뿐만 아니라 설정 페이지에서 최소 및 최대 레플리카 크기를 지정할 때도 사용할 수 있습니다.
- 맞춤형 하드웨어 프로필(Enterprise 티어에서 사용 가능)에서 이제 유휴 모드(idling)를 지원합니다.
- ClickHouse Cloud에서 이제 AWS Marketplace를 통한 단순화된 구매 환경을 제공합니다. [종량제(pay-as-you-go)](https://aws.amazon.com/marketplace/pp/prodview-p4gwofrqpkltu?sr=0-2&ref_=beagle&applicationId=AWSMPContessa)와 [약정 사용량 계약(committed spend contracts)](https://aws.amazon.com/marketplace/pp/prodview-4qyeihstyym2s?sr=0-3&ref_=beagle&applicationId=AWSMPContessa) 옵션이 별도로 제공됩니다.
- 이제 ClickHouse Cloud에서 ClickStack 사용자에게 알림(Alerting) 기능이 제공됩니다.
  HyperDX UI에서 로그, 메트릭, 트레이스를 대상으로 별도의 추가 설정이나 인프라/서비스, 구성 없이 직접 알림을 생성하고 관리할 수 있습니다. 알림은 Slack, PagerDuty 등과 연동됩니다.
  자세한 내용은 [알림 문서](/use-cases/observability/clickstack/alerts)를 참조하십시오.

## 2025년 10월 17일 \{#october-17-2025\}

- **Service Monitoring - Resource Utilization Dashboard**  
  CPU 사용률 및 메모리 사용률 메트릭 표시 방식이 기존 평균값 기준에서 특정 기간 동안의 최대 사용률 메트릭을 보여 주는 방식으로 변경되어, 리소스 과소 할당 상태를 더 잘 파악할 수 있습니다.
  추가로, CPU 사용률 메트릭에 ClickHouse Cloud의 autoscaler가 사용하는 메트릭과 더 유사한 Kubernetes 수준의 CPU 사용률 메트릭이 표시됩니다. 
- **External Buckets**  
  ClickHouse Cloud에서 이제 백업을 사용 중인 클라우드 서비스 제공자 계정으로 직접 내보낼 수 있습니다.
  AWS S3, Google Cloud Storage, Azure Blob Storage와 같은 외부 스토리지 버킷을 연결하여 백업 관리를 직접 제어하십시오.

## 2025년 8월 29일 \{#august-29-2025\}

- [ClickHouse Cloud Azure Private Link](/cloud/security/azure-privatelink)이 리소스 식별을 위해 사용하던 Resource GUID 대신 Resource ID 필터를 사용하도록 변경되었습니다. 하위 호환이 가능한 기존 Resource GUID도 계속 사용할 수 있지만, Resource ID 필터로 전환할 것을 권장합니다. 마이그레이션에 대한 자세한 내용은 Azure Private Link [문서](/cloud/security/azure-privatelink#obtaining-private-endpoint-resourceid)를 참조하십시오.

## 2025년 8월 22일 \{#august-22-2025\}

- **ClickHouse Connector for AWS Glue**  
  이제 [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-eqvmuopqzdg7s)에서 제공되는 공식 [ClickHouse Connector for AWS Glue](/integrations/glue)를 사용할 수 있습니다. AWS Glue의 Apache
  Spark 기반 서버리스 엔진을 활용하여 ClickHouse와 기타 데이터 소스 간의 데이터 추출, 변환, 로드(ETL) 통합을 수행할 수 있습니다. ClickHouse와 Spark 간에 테이블을 생성하고 데이터를 읽고 쓰는 방법은 관련 [블로그 글](http://clickhouse.com/blog/clickhouse-connector-aws-glue)을 참고하여 시작하십시오.
- **서비스에서 최소 레플리카 수 변경**  
  확장된 서비스는 이제 [축소](/manage/scaling)하여 단일 레플리카(이전에는 최소 2개의 레플리카)를 사용할 수 있습니다. 참고: 단일 레플리카 서비스는 가용성이 낮아지므로 프로덕션 환경에서의 사용은 권장되지 않습니다.
- ClickHouse Cloud는 기본적으로 관리자 역할에 대해 서비스 스케일링 및 서비스 버전 업그레이드와 관련된 알림을 전송하기 시작합니다. 알림 설정에서 알림 수신 옵션을 조정할 수 있습니다.

## 2025년 8월 13일 \{#august-13-2025\}

- **MongoDB CDC용 ClickPipes, 이제 Private Preview로 제공**
  이제 ClickPipes를 사용하여 MongoDB에서 ClickHouse Cloud로 몇 번의 클릭만으로 데이터를 복제해
  외부 ETL 도구 없이도 실시간 분석을 수행할 수 있습니다. 이 커넥터는 지속적인
  복제는 물론 일회성 마이그레이션도 지원하며, MongoDB Atlas 및 셀프 호스팅 MongoDB
  배포 환경과도 호환됩니다. MongoDB CDC 커넥터 개요는 [블로그 글](https://clickhouse.com/blog/mongodb-cdc-clickhouse-preview)에서 확인하고, [여기에서 얼리 액세스를 신청](https://clickhouse.com/cloud/clickpipes/mongodb-cdc-connector)하십시오! 

## 2025년 8월 8일 \{#august-08-2025\}

- **알림(Notifications)**: 서비스가 새 ClickHouse 버전으로 업그레이드를 시작할 때 UI 알림이 표시됩니다. 추가 이메일 및 Slack 알림은 알림 센터에서 설정할 수 있습니다. 
- **ClickPipes**: Azure Blob Storage(ABS) ClickPipes 지원이 ClickHouse Terraform 프로바이더에 추가되었습니다. ABS ClickPipe를 프로그램으로 CREATE하는 방법에 대한 예시는 프로바이더 문서를 참고하십시오.
  - [버그 수정] Null 엔진을 사용하는 대상 테이블에 쓰는 객체 스토리지(object storage) ClickPipes가 이제 UI에서 「Total records」와 「Data ingested」 지표를 표시합니다.
  - [버그 수정] UI 메트릭의 「Time period」 선택기가 선택한 기간과 관계없이 기본값인 「24 hours」로 표시되는 문제가 있었습니다. 이제 이 문제가 수정되어, 선택한 기간에 맞게 UI 차트가 올바르게 업데이트됩니다.
- **Cross-region private link (AWS)**가 이제 일반 제공(GA) 상태입니다. 지원되는 리전 목록은 [문서](/manage/security/aws-privatelink)를 참고하십시오.

## 2025년 7월 31일 \{#july-31-2025\}

**ClickPipes 수직 확장 기능 출시**

[스트리밍 ClickPipes에 수직 확장 기능이 추가되었습니다](https://clickhouse.com/blog/clickpipes-flexible-scaling-monitoring). 
이제 레플리카 수(수평 확장)뿐만 아니라 각 레플리카의 크기까지 제어할 수 있습니다. 각 ClickPipe의 세부 정보 페이지에는
레플리카별 CPU 및 메모리 사용량이 표시되어, 워크로드를 더 잘 이해하고 크기 조정 작업을 보다 자신 있게 계획하는 데 도움이 됩니다.

## 2025년 7월 24일 \{#july-24-2025\}

**MySQL CDC용 ClickPipes, 이제 퍼블릭 베타로 공개**

ClickPipes의 MySQL CDC 커넥터가 이제 퍼블릭 베타로 널리 사용하실 수 있게 되었습니다. 몇 번의 클릭만으로 
외부 종속성 없이 MySQL(또는 MariaDB) 데이터를 실시간으로 ClickHouse Cloud에
직접 복제할 수 있습니다. 커넥터 개요는 [블로그 글](https://clickhouse.com/blog/mysql-cdc-connector-clickpipes-beta)을,
빠르게 시작하려면 [quickstart](https://clickhouse.com/docs/integrations/clickpipes/mysql)를
참고하십시오.

## 2025년 7월 11일 \{#june-11-2025\}

- 새로운 서비스가 이제 데이터베이스 및 테이블 메타데이터를 중앙의 **SharedCatalog**에 저장합니다.
  이는 조율 및 객체 수명 주기를 위한 새로운 모델로, 다음을 가능하게 합니다.
  - 높은 동시성 환경에서도 가능한 **Cloud 규모 DDL**
  - **내결함성이 높은 삭제 및 새로운 DDL 작업**
  - 무상태 노드가 디스크 종속성 없이 기동하므로 **빠른 기동 및 웨이크업**
  - Iceberg 및 Delta Lake를 포함한 **네이티브 및 오픈 포맷 전반에서의 무상태 컴퓨팅(stateless compute)**
  
  SharedCatalog에 대한 더 자세한 내용은 [블로그](https://clickhouse.com/blog/clickhouse-cloud-stateless-compute)를 참고하십시오.

- 이제 GCP `europe-west4` 리전에서 HIPAA 규정을 준수하는 서비스를 실행할 수 있습니다.

## 2025년 6월 27일 \{#june-27-2025\}

- 이제 데이터베이스 권한 관리용 Terraform provider를 공식적으로 지원하며,
  자가 관리형 배포와도 호환됩니다. 자세한 내용은
  [블로그](https://clickhouse.com/blog/new-terraform-provider-manage-clickhouse-database-users-roles-and-privileges-with-code)와
  [문서](https://registry.terraform.io/providers/ClickHouse/clickhousedbops/latest/docs)를
  참조하십시오.
- 엔터프라이즈 티어 서비스는 이제 업그레이드 테스트에 추가 시간을 확보하기 위해,
  정규 릴리스 이후 2주 뒤로 업그레이드를 연기하도록 [slow release channel](/manage/updates/#slow-release-channel-deferred-upgrades)에
  등록할 수 있습니다.

## 2025년 6월 13일 \{#june-13-2025\}

- ClickHouse Cloud Dashboards의 정식 출시를 알립니다. Dashboards를 사용하면 대시보드에서 쿼리를 시각화하고, 필터와 쿼리 매개변수를 통해 데이터와 상호작용하며, 공유를 관리할 수 있습니다.
- API 키 IP 필터: ClickHouse Cloud와의 상호작용을 위한 추가 보호 계층을 도입했습니다. API 키를 생성할 때, API 키를 사용할 수 있는 위치를 제한하기 위해 IP 허용 목록(allowlist)을 설정할 수 있습니다. 자세한 내용은 [문서](https://clickhouse.com/docs/cloud/security/setting-ip-filters)를 참조하십시오. 

## May 30, 2025 \{#may-30-2025\}

- 이제 ClickHouse Cloud에서 **ClickPipes for Postgres CDC**를 일반 제공으로 출시했습니다.  
  몇 번의 클릭만으로 Postgres 데이터베이스를 복제하고 매우 빠른 실시간 분석을 수행할 수 있습니다.  
  이 커넥터는 더 빠른 데이터 동기화, 수 초 수준의 낮은 지연 시간, 자동 스키마 변경 처리,  
  완전한 보안 연결 등 다양한 기능을 제공합니다. 자세한 내용은  
  [블로그](https://clickhouse.com/blog/postgres-cdc-connector-clickpipes-ga)를 참고하십시오.  
  시작하려면 [여기](https://clickhouse.com/docs/integrations/clickpipes/postgres)의 안내를 참고하십시오.

- SQL 콘솔 대시보드에 다음과 같은 개선 사항이 도입되었습니다.
  - 공유: 대시보드를 팀 구성원과 공유할 수 있습니다. 전역 수준과 사용자별 수준에서 조정 가능한 네 가지 액세스 수준을 지원합니다.
    - _Write access_: 시각화 추가/수정, 새로 고침 설정, 필터를 통한 대시보드 상호작용
    - _Owner_: 대시보드 공유, 대시보드 삭제, 그리고 "write access" 권한이 있는 사용자의 모든 권한 포함
    - _Read-only access_: 필터를 통해 대시보드를 조회하고 상호작용
    - _No access_: 대시보드를 조회할 수 없음
  - 이미 생성된 기존 대시보드의 경우, 조직 관리자(Organization Administrator)가 해당 대시보드를 자신을 소유자로 지정할 수 있습니다.
  - 이제 SQL 콘솔의 쿼리 보기에서 테이블이나 차트를 대시보드에 직접 추가할 수 있습니다.

<Image img={dashboards} size="md" alt="대시보드 개선 사항" border />

- AWS 및 GCP용 [Distributed cache](https://clickhouse.com/cloud/distributed-cache-waitlist) 프리뷰 참여자를 모집하고 있습니다.  
  자세한 내용은 [블로그](https://clickhouse.com/blog/building-a-distributed-cache-for-s3)를 참고하십시오.

## 2025년 5월 16일 \{#may-16-2025\}

- ClickHouse Cloud에서 서비스가 사용 중인 리소스를 보여주는 리소스 사용량 대시보드(Resource Utilization Dashboard)를 도입했습니다. 
  이 대시보드에는 다음과 같은 메트릭이 system 테이블에서 수집되어 표시됩니다:
  * Memory & CPU: `CGroupMemoryTotal`(할당된 메모리), `CGroupMaxCPU`(할당된 CPU),
    `MemoryResident`(사용된 메모리), `ProfileEvent_OSCPUVirtualTimeMicroseconds`(사용된 CPU)에 대한 그래프
  * Data Transfer: ClickHouse Cloud로의 인그레스 및 이그레스 데이터 전송을 보여주는 그래프. 자세한 내용은 [여기](/cloud/manage/network-data-transfer)를 참고하십시오.
- ClickHouse Cloud 서비스에 대한 모니터링을 단순화하기 위해 새롭게 출시된 ClickHouse Cloud Prometheus/Grafana 믹스인을 발표합니다.
  이 믹스인은 Prometheus 호환 API 엔드포인트를 사용하여 기존 Prometheus 및 Grafana 환경에
  ClickHouse 메트릭을 원활하게 통합합니다. 또한 서비스의 상태와 성능을 실시간으로 확인할 수 있는
  사전 구성된 대시보드를 제공합니다. 자세한 내용은 출시 [블로그](https://clickhouse.com/blog/monitor-with-new-prometheus-grafana-mix-in)를 참고하십시오.

## 2025년 4월 18일 \{#april-18-2025\}

- 새로운 조직 수준 역할인 **Member**와 두 개의 서비스 수준 역할(**Service Admin**, **Service Read Only**)을 도입했습니다.  
  **Member**는 SAML SSO 사용자에게 기본으로 할당되는 조직 수준 역할로, 로그인 및 프로필 업데이트 기능만 제공합니다. 하나 이상의 서비스에 대한 **Service Admin** 및 **Service Read Only** 역할은 **Member**, **Developer**, 또는 **Billing Admin** 역할을 가진 사용자에게 할당할 수 있습니다. 자세한 내용은 「[ClickHouse Cloud의 액세스 제어](https://clickhouse.com/docs/cloud/security/cloud-access-management/overview)」를 참조하십시오.
- 이제 ClickHouse Cloud는 다음 리전에서 **Enterprise** 고객을 대상으로 **HIPAA** 및 **PCI** 서비스를 제공합니다: AWS eu-central-1, AWS eu-west-2, AWS us-east-2.
- **ClickPipes에 대한 사용자 대상 알림 기능**을 도입했습니다. 이 기능은 ClickPipes 장애에 대해 이메일, ClickHouse Cloud UI, Slack을 통해 자동 알림을 전송합니다. 이메일 및 UI 알림은 기본적으로 활성화되어 있으며 파이프별로 구성할 수 있습니다. **Postgres CDC ClickPipes**의 경우, 알림에는 복제 슬롯 임계값(**Settings** 탭에서 설정 가능), 특정 오류 유형, 장애를 해결하기 위한 셀프 서비스용 단계도 포함됩니다.
- **MySQL CDC 비공개 프리뷰** 신청이 이제 가능합니다. 이를 통해 고객은 몇 번의 클릭만으로 MySQL 데이터베이스를 ClickHouse Cloud로 복제하여 빠른 분석을 수행하고 외부 ETL 도구의 필요성을 제거할 수 있습니다. 이 커넥터는 클라우드(RDS, Aurora, Cloud SQL, Azure 등) 또는 온프레미스 어디에서 실행되는 MySQL이든, 지속적인 복제와 일회성 마이그레이션을 모두 지원합니다. 비공개 프리뷰에는 [이 링크를 따라](https://clickhouse.com/cloud/clickpipes/mysql-cdc-connector) 신청할 수 있습니다.
- **ClickPipes용 AWS PrivateLink**를 도입했습니다. AWS PrivateLink를 사용하여 VPC, AWS 서비스, 온프레미스 시스템과 ClickHouse Cloud 간에 보안 연결을 설정할 수 있습니다. 이를 통해 Postgres, MySQL, AWS의 MSK와 같은 소스에서 데이터를 전송할 때 트래픽을 공용 인터넷에 노출하지 않고 이동시킬 수 있습니다. 또한 VPC 서비스 엔드포인트를 통한 리전 간 액세스도 지원합니다. PrivateLink 연결 설정은 이제 ClickPipes를 통해 [완전히 self-serve 방식으로](https://clickhouse.com/docs/integrations/clickpipes/aws-privatelink) 수행할 수 있습니다.

## 2025년 4월 4일 \{#april-4-2025\}

- ClickHouse Cloud용 Slack 알림: ClickHouse Cloud는 이제 콘솔 내 알림 및 이메일 알림에 더해 결제, 스케일링, ClickPipes 이벤트에 대한 Slack 알림을 지원합니다. 이러한 알림은 ClickHouse Cloud Slack 애플리케이션을 통해 전송됩니다. 조직 관리자는 알림 센터에서 알림을 전송할 Slack 채널을 지정하여 이 알림을 설정할 수 있습니다.
- Production 및 Development 서비스를 사용하는 경우 청구서에 ClickPipes 및 데이터 전송 사용량 요금이 표시됩니다.

## 2025년 3월 21일 \{#march-21-2025\}

- AWS에서 리전 간 PrivateLink 연결이 이제 Beta 단계로 제공됩니다. 설정 방법과 지원 리전 목록에 대한 자세한 내용은
  ClickHouse Cloud PrivateLink [문서](/manage/security/aws-privatelink)를 참고하십시오.
- AWS에서 서비스에 사용할 수 있는 최대 레플리카 RAM 용량은 이제 236 GiB로 설정되었습니다.
  이는 백그라운드 프로세스에 필요한 리소스를 확보하면서도 효율적인 활용이 가능하도록 합니다.

## 2025년 3월 7일 \{#march-7-2025\}

- 새로운 `UsageCost` API 엔드포인트: API 사양이 이제 사용량 정보를 조회할 수 있는
  새로운 엔드포인트를 지원합니다. 이는 조직 단위 엔드포인트이며, 사용량
  비용은 최대 31일 범위까지 조회할 수 있습니다. 조회 가능한 메트릭에는
  Storage, Compute, Data Transfer, ClickPipes가 포함됩니다. 자세한 내용은
  [문서](https://clickhouse.com/docs/cloud/manage/api/usageCost-api-reference)를 참고하십시오.
- Terraform 프로바이더 [v2.1.0](https://registry.terraform.io/providers/ClickHouse/clickhouse/2.1.0/docs/resources/service#nestedatt--endpoints_configuration) 릴리스에서는 MySQL 엔드포인트 활성화를 지원합니다.

## 2025년 2월 21일 \{#february-21-2025\}

### ClickHouse Bring Your Own Cloud (BYOC) for AWS가 이제 정식 출시되었습니다 \{#clickhouse-byoc-for-aws-ga\}

이 배포 모델에서는 데이터 플레인 구성 요소(컴퓨트, 스토리지, 백업, 로그, 메트릭)가
고객 VPC에서 실행되고, 컨트롤 플레인(웹 액세스, API, 청구)은
ClickHouse VPC 내에 유지됩니다. 이 구성은 모든 데이터가
안전한 고객 환경 안에 머물도록 보장하여, 엄격한 데이터 지역성(data residency) 요구 사항을
충족해야 하는 대규모 워크로드에 적합합니다.

- 자세한 내용은 BYOC에 대한 [문서](/cloud/reference/byoc/overview)를 참고하거나
  [발표 블로그 게시글](https://clickhouse.com/blog/announcing-general-availability-of-clickhouse-bring-your-own-cloud-on-aws)을 읽어보십시오.
- 액세스 요청을 위해서는 [문의](https://clickhouse.com/cloud/bring-your-own-cloud)해 주십시오.

### ClickPipes용 Postgres CDC 커넥터 \{#postgres-cdc-connector-for-clickpipes\}

ClickPipes용 Postgres CDC 커넥터를 사용하면 Postgres 데이터베이스를 ClickHouse Cloud로 원활하게 복제할 수 있습니다.

- 시작하려면 ClickPipes Postgres CDC 커넥터에 대한 [문서](https://clickhouse.com/docs/integrations/clickpipes/postgres)를 참조하십시오.
- 고객 사용 사례와 기능에 대한 자세한 내용은 [랜딩 페이지](https://clickhouse.com/cloud/clickpipes/postgres-cdc-connector)와 [출시 블로그](https://clickhouse.com/blog/postgres-cdc-connector-clickpipes-public-beta)를 참조하십시오.

### AWS에서 ClickHouse Cloud의 PCI 규정 준수 \{#pci-compliance-for-clickhouse-cloud-on-aws\}

ClickHouse Cloud는 이제 **Enterprise 계층** 고객을 위해 **us-east-1** 및 **us-west-2** 리전에서 **PCI 규정을 준수하는 서비스**를 지원합니다. PCI 규정 준수 환경에서 서비스를 생성하기를 원하는 사용자는 [support](https://clickhouse.com/support/program)에 문의하여 지원을 받으십시오.

### Google Cloud Platform에서 Transparent Data Encryption 및 Customer Managed Encryption Keys \{#tde-and-cmek-on-gcp\}

**Transparent Data Encryption (TDE)** 및 **Customer Managed
Encryption Keys (CMEK)**에 대한 지원이 이제 **Google Cloud Platform (GCP)**의 ClickHouse Cloud에서 가능합니다.

- 자세한 내용은 해당 기능의 [문서](https://clickhouse.com/docs/cloud/security/cmek#transparent-data-encryption-tde)를 참조하십시오.

### AWS Middle East (UAE) 가용성 \{#aws-middle-east-uae-availability\}

ClickHouse Cloud에 새 리전에 대한 지원이 추가되어 이제
**AWS Middle East (UAE) me-central-1** 리전에서 사용할 수 있습니다.

### ClickHouse Cloud 가드레일 \{#clickhouse-cloud-guardrails\}

ClickHouse Cloud를 안정적으로 사용하고 모범 사례를 장려하기 위해,
사용 중인 테이블, 데이터베이스, 파티션 및 파트 수에 대한 가드레일을
도입했습니다.

- 자세한 내용은 문서의 [사용 한도(usage limits)](https://clickhouse.com/docs/cloud/bestpractices/usage-limits)
  항목을 참고하십시오.
- 이미 서비스가 이 한도를 초과한 상태라면, 현 상태에서 10%까지 추가 증가를 허용합니다.
  문의 사항이 있으면 [지원팀](https://clickhouse.com/support/program)으로 연락하십시오.

## 2025년 1월 27일 \{#january-27-2025\}

### ClickHouse Cloud 티어 변경 사항 \{#changes-to-clickhouse-cloud-tiers\}

당사는 고객의 끊임없이 변화하는 요구 사항을 충족할 수 있도록 제품을 지속적으로 개선하고 있습니다. 지난 2년간 GA로 제공된 이후 ClickHouse Cloud는 크게 발전했으며, 고객이 Cloud 제공 서비스를 어떻게 활용하는지에 대해 매우 중요한 인사이트를 얻게 되었습니다.

ClickHouse Cloud 서비스를 워크로드에 맞는 크기와 비용 효율성으로 최적화할 수 있도록 새로운 기능을 도입합니다. 여기에는 **compute-compute separation**, 고성능 머신 타입, 그리고 **단일 레플리카(single-replica) 서비스**가 포함됩니다. 또한 자동 스케일링과 관리형 업그레이드를 더욱 원활하고, 상황에 더 신속하게 대응할 수 있는 방식으로 발전시키고 있습니다.

가장 까다로운 고객과 워크로드 요구를 충족하기 위해 **새로운 Enterprise 티어**를 추가합니다. 이 티어는 산업별 보안 및 컴플라이언스 기능, 기반 하드웨어와 업그레이드에 대한 한층 강화된 제어, 고급 재해 복구 기능에 중점을 둡니다.

이러한 변경 사항을 지원하기 위해 현재의 **Development** 및 **Production** 티어를 재구성하여, 변화하는 고객 기반이 실제로 Cloud 제공 서비스를 사용하는 방식에 더 가깝게 맞추고자 합니다. 새로운 아이디어와 프로젝트를 시험해 보는 사용자에 초점을 둔 **Basic** 티어와, 대규모 프로덕션 워크로드와 데이터를 다루는 사용자에 적합한 **Scale** 티어를 도입합니다.

이와 기타 기능적 변경 사항에 대해서는 이 [블로그](https://clickhouse.com/blog/evolution-of-clickhouse-cloud-new-features-superior-performance-tailored-offerings)에서 확인할 수 있습니다. 기존 고객은 [새 요금제](https://clickhouse.com/pricing)를 선택하기 위한 조치가 필요합니다. 조직 관리자에게는 이메일을 통해 고객 대상 안내가 발송되었습니다.

### Warehouses: Compute-compute separation (GA) \{#warehouses-compute-compute-separation-ga\}

Compute-compute separation(「Warehouses」라고도 함)는 일반 공급(Generally Available) 상태입니다. 자세한 내용은 [블로그](https://clickhouse.com/blog/introducing-warehouses-compute-compute-separation-in-clickhouse-cloud)와 [문서](/cloud/reference/warehouses)를 참고하십시오.

### Single-replica services \{#single-replica-services\}

단일 레플리카 서비스(single-replica service)라는 개념을 독립형 서비스와 웨어하우스 내 구성 요소의 두 가지 형태로 도입합니다. 독립형 서비스로 제공되는 단일 레플리카 서비스는 규모에 제한이 있으며, 소규모 테스트 워크로드에 사용하도록 설계되었습니다. 웨어하우스 내에서는 단일 레플리카 서비스를 더 큰 규모로 배포할 수 있으며, 재시작 가능한 ETL 작업과 같이 대규모 고가용성이 필요하지 않은 워크로드에 활용할 수 있습니다.

### 수직 오토스케일링 개선 \{#vertical-auto-scaling-improvements\}

「Make Before Break」(MBB)라고 부르는 새로운 컴퓨트 레플리카 수직 스케일링 메커니즘을 도입합니다. 이 방식은 기존 레플리카를 제거하기 전에 새 크기의 레플리카를 하나 이상 먼저 추가하여, 스케일링 작업 중 용량 손실이 발생하지 않도록 합니다. 기존 레플리카를 제거하는 과정과 새 레플리카를 추가하는 과정 사이의 공백을 제거함으로써, MBB는 더 원활하고 방해가 적은 스케일링 프로세스를 제공합니다. 특히 리소스 사용률이 높아져 추가 용량이 필요한 스케일 업 상황에서 유용하며, 레플리카를 너무 일찍 제거하면 리소스 제약이 오히려 악화될 수 있기 때문에 더욱 중요합니다.

### 수평 확장(정식 제공) \{#horizontal-scaling-ga\}

수평 확장이 이제 정식으로 제공됩니다(Generally Available). API와 Cloud 콘솔을 통해 레플리카를 추가하여 서비스를 수평으로 확장할 수 있습니다. 자세한 내용은 [문서](/manage/scaling#manual-horizontal-scaling)를 참고하십시오.

### 구성 가능한 백업 \{#configurable-backups\}

이제 고객이 자신의 Cloud 계정으로 백업을 내보낼 수 있습니다. 자세한 내용은 [문서](/cloud/manage/backups/configurable-backups)를 참조하십시오.

### 관리형 업그레이드 개선 사항 \{#managed-upgrade-improvements\}

안전한 관리형 업그레이드는 데이터베이스가 발전하며 새로운 기능이 추가될 때에도 워크로드를 최신 상태로 유지할 수 있게 해 주어, 큰 가치를 제공합니다. 이번 롤아웃에서는 업그레이드에 「make before break(MBB)」 접근 방식을 적용하여, 실행 중인 워크로드에 미치는 영향을 한층 더 줄였습니다.

### HIPAA 지원 \{#hipaa-support\}

이제 AWS `us-east-1`, `us-west-2` 및 GCP `us-central1`, `us-east1`를 포함한 규정 준수 리전에서 HIPAA를 지원합니다. 도입을 원하는 고객은 Business Associate Agreement(BAA)에 서명하고, 해당 리전의 규정 준수 환경에 배포해야 합니다. HIPAA에 대한 자세한 내용은 [문서](/cloud/security/compliance-overview)를 참고하십시오.

### 예약 업그레이드 \{#scheduled-upgrades\}

서비스 업그레이드를 예약할 수 있습니다. 이 기능은 Enterprise 티어의 서비스에서만 지원됩니다. 예약 업그레이드에 대한 자세한 내용은 [문서](/manage/updates)를 참조하십시오.

### 복합 타입에 대한 언어 클라이언트 지원 \{#language-client-support-for-complex-types\}

[Golang](https://github.com/ClickHouse/clickhouse-go/releases/tag/v2.30.1), [Python](https://github.com/ClickHouse/clickhouse-connect/releases/tag/v0.8.11), 그리고 [NodeJS](https://github.com/ClickHouse/clickhouse-js/releases/tag/1.10.1) 클라이언트에 Dynamic, Variant, JSON 타입 지원이 추가되었습니다.

### 갱신 가능 구체화 뷰(refreshable materialized view)에 대한 DBT 지원 \{#dbt-support-for-refreshable-materialized-views\}

DBT는 이제 `1.8.7` 릴리스에서 [갱신 가능 구체화 뷰(Refreshable Materialized Views)](https://github.com/ClickHouse/dbt-clickhouse/releases/tag/v1.8.7)를 지원합니다.

### JWT 토큰 지원 \{#jwt-token-support\}

JDBC 드라이버 v2, clickhouse-java, [Python](https://github.com/ClickHouse/clickhouse-connect/releases/tag/v0.8.12), 그리고 [NodeJS](https://github.com/ClickHouse/clickhouse-js/releases/tag/1.10.0) 클라이언트에서 JWT 기반 인증 지원이 추가되었습니다.

JDBC / Java 지원은 [0.8.0](https://github.com/ClickHouse/clickhouse-java/releases/tag/v0.8.0) 릴리스에 포함될 예정이며, 출시 예정일은 아직 확정되지 않았습니다.

### Prometheus 통합 기능 개선 \{#prometheus-integration-improvements\}

Prometheus 통합에 여러 가지 개선 사항이 추가되었습니다:

- **조직 수준 엔드포인트**. ClickHouse Cloud용 Prometheus 통합에 개선 사항을 도입했습니다. 서비스 수준 메트릭에 더해, 이제 API에 **조직 수준 메트릭**을 위한 엔드포인트가 포함됩니다. 이 새로운 엔드포인트는 조직 내 모든 서비스의 메트릭을 자동으로 수집하여 Prometheus 수집기로 메트릭을 내보내는 과정을 단순화합니다. 이러한 메트릭은 Grafana, Datadog과 같은 시각화 도구와 통합하여 조직 전체 성능을 보다 종합적으로 파악하는 데 활용할 수 있습니다.

  이 기능은 현재 모든 사용자에게 제공됩니다. 자세한 내용은 [여기](/integrations/prometheus)를 참조하십시오.

- **필터링된 메트릭**. ClickHouse Cloud용 Prometheus 통합에서 필터링된 메트릭 목록을 반환하는 기능을 추가했습니다. 이 기능은 서비스 상태 모니터링에 중요한 메트릭에만 집중할 수 있도록 하여 응답 페이로드 크기를 줄이는 데 도움이 됩니다.

  이 기능은 API의 선택적 쿼리 파라미터를 통해 사용할 수 있으며, 데이터 수집을 최적화하고 Grafana 및 Datadog과 같은 도구와의 통합을 간소화하는 데 도움이 됩니다.

  필터링된 메트릭 기능은 현재 모든 사용자에게 제공됩니다. 자세한 내용은 [여기](/integrations/prometheus)를 참조하십시오.

## 2024년 12월 20일 \{#december-20-2024\}

### 마켓플레이스 구독 조직 연결 \{#marketplace-subscription-organization-attachment\}

이제 새 마켓플레이스 구독을 기존 ClickHouse Cloud 조직에 연결할 수 있습니다. 마켓플레이스 구독 절차를 완료하고 ClickHouse Cloud로 리디렉션되면, 과거에 생성한 기존 조직을 새 마켓플레이스 구독에 연결할 수 있습니다. 이 시점부터 조직 내 리소스 사용량은 마켓플레이스를 통해 청구됩니다. 

<Image img={add_marketplace} size="md" alt="기존 조직에 마켓플레이스 구독을 연결하는 방법을 보여 주는 ClickHouse Cloud 인터페이스" border />

### OpenAPI 키 만료 강제 적용 \{#force-openapi-key-expiration\}

이제 API 키의 만료 옵션을 제한하여 만료되지 않는 OpenAPI 키가 생성되는 것을 방지할 수 있습니다. 조직에 이러한 제한을 적용하려면 ClickHouse Cloud 지원 팀에 문의하십시오.

### 알림용 사용자 지정 이메일 \{#custom-emails-for-notifications\}

Org Admin은 이제 특정 알림에 추가 수신인으로 추가 이메일 주소를 지정할 수 있습니다. 이는 알림을 메일링 리스트(별칭)나 ClickHouse Cloud 사용자 계정은 없지만 조직 내에서 알림을 받아야 하는 다른 사용자에게 보내고자 할 때 유용합니다. 이를 설정하려면 Cloud 콘솔에서 Notification Settings로 이동한 다음, 이메일 알림을 받을 이메일 주소를 편집하십시오. 

## 2024년 12월 6일 \{#december-6-2024\}

### BYOC (베타) \{#byoc-beta\}

AWS용 Bring Your Own Cloud가 이제 베타로 제공됩니다. 이 배포 모델을 사용하면 자체 AWS 계정에서 ClickHouse Cloud를 배포하고 실행할 수 있습니다. 현재 11개 이상의 AWS 리전에서 배포를 지원하며, 앞으로 더 많은 리전이 추가될 예정입니다. 이 기능에 대한 액세스를 위해서는 [지원팀에 문의](https://clickhouse.com/support/program)하십시오. 이 배포 방식은 대규모 배포에 한해 제공된다는 점에 유의하십시오.

### ClickPipes의 Postgres Change Data Capture (CDC) 커넥터 \{#postgres-change-data-capture-cdc-connector-in-clickpipes\}

이 턴키 통합 기능을 사용하면 몇 번의 클릭만으로 Postgres 데이터베이스를 ClickHouse Cloud로 복제하여 초고속 분석을 위해 ClickHouse를 활용할 수 있습니다. 이 커넥터는 Postgres에서 ClickHouse Cloud로의 지속적인 복제뿐 아니라 1회성 마이그레이션에도 사용할 수 있습니다.

### 대시보드(Beta) \{#dashboards-beta\}

이번 주에는 ClickHouse Cloud에서 대시보드 Beta를 출시합니다. 대시보드를 사용하면 저장된 쿼리를 시각화로 만들고, 이러한 시각화를 대시보드로 구성하며, 쿼리 매개변수를 사용해 대시보드와 상호 작용할 수 있습니다. 시작하려면 [대시보드 문서](/cloud/manage/dashboards)를 참조하십시오.

<Image img={beta_dashboards} size="lg" alt="새로운 Dashboards Beta 기능과 시각화를 보여주는 ClickHouse Cloud 인터페이스" border />

### Query API endpoints (GA) \{#query-api-endpoints-ga\}

ClickHouse Cloud에서 Query API Endpoints의 GA(General Availability) 버전을 출시했습니다. Query API Endpoints를 사용하면 저장된 쿼리에 대해 몇 번의 클릭만으로 RESTful API 엔드포인트를 생성하여, 언어별 클라이언트나 복잡한 인증 과정을 처리하지 않고도 애플리케이션에서 데이터를 바로 활용할 수 있습니다. 초기 출시 이후 다음과 같은 여러 가지 개선 사항이 추가되었습니다:

* 특히 콜드 스타트(cold start) 시 엔드포인트 지연 시간 단축
* 엔드포인트 RBAC 제어 강화
* 구성 가능한 CORS 허용 도메인
* 결과 스트리밍
* 모든 ClickHouse 호환 출력 포맷 지원

이러한 개선 사항에 더해, 기존 프레임워크를 활용하여 ClickHouse Cloud 서비스에 대해 임의의 SQL 쿼리를 실행할 수 있는 범용 쿼리 API 엔드포인트도 제공하게 되었습니다. 범용 엔드포인트는 서비스 설정 페이지에서 활성화하고 구성할 수 있습니다.

시작하려면 [Query API Endpoints 문서](/cloud/get-started/query-endpoints)를 참조하십시오.

<Image img={api_endpoints} size="lg" alt="다양한 설정과 함께 API Endpoints 구성을 보여주는 ClickHouse Cloud 인터페이스" border />

### 네이티브 JSON 지원(Beta) \{#native-json-support-beta\}

ClickHouse Cloud에서 네이티브 JSON 지원 Beta를 제공합니다. 시작하려면 지원 팀에 문의하여 [Cloud 서비스 활성화를 요청하십시오](/cloud/support).

### 벡터 유사도 인덱스를 사용한 벡터 검색(얼리 액세스) \{#vector-search-using-vector-similarity-indexes-early-access\}

얼리 액세스 단계에서 근사 벡터 검색을 위한 벡터 유사도 인덱스를 제공합니다.

ClickHouse는 이미 다양한 [거리 함수(distance functions)](https://clickhouse.com/blog/reinvent-2024-product-announcements#vector-search-using-vector-similarity-indexes-early-access)와 선형 스캔 수행 기능을 통해 벡터 기반 활용 사례를 강력하게 지원합니다. 여기에 더해, 최근에는 [usearch](https://github.com/unum-cloud/usearch) 라이브러리와 Hierarchical Navigable Small Worlds (HNSW) 근사 최근접 이웃 검색 알고리즘을 기반으로 하는 실험적 [근사 벡터 검색(approximate vector search)](/engines/table-engines/mergetree-family/annindexes) 기능을 추가했습니다.

시작하려면 [얼리 액세스 대기자 명단에 등록하십시오](https://clickhouse.com/cloud/vector-search-index-waitlist).

### ClickHouse-connect (Python) 및 ClickHouse Kafka Connect 사용자 \{#clickhouse-connect-python-and-clickhouse-kafka-connect-users\}

클라이언트에서 `MEMORY_LIMIT_EXCEEDED` 예외가 발생할 수 있는 문제를 겪은 고객에게 안내 이메일이 발송되었습니다.

다음 버전 이상으로 업그레이드하십시오:

- Kafka-Connect: > 1.2.5
- ClickHouse-Connect (Java): > 0.8.6

### ClickPipes가 이제 AWS에서 VPC 간 리소스 액세스(Cross-VPC)를 지원합니다 \{#clickpipes-now-supports-cross-vpc-resource-access-on-aws\}

이제 AWS MSK와 같은 특정 데이터 소스에 단방향 액세스 권한을 부여할 수 있습니다. AWS PrivateLink와 VPC Lattice를 통한 Cross-VPC 리소스 액세스를 사용하면, 퍼블릭 네트워크를 경유하더라도 프라이버시와 보안을 저해하지 않고 VPC 및 계정 경계를 넘어, 심지어 온프레미스 네트워크에서도 개별 리소스를 공유할 수 있습니다. 리소스 공유를 시작하고 설정하는 방법은 [공지 게시물](https://clickhouse.com/blog/clickpipes-crossvpc-resource-endpoints?utm_medium=web&utm_source=changelog)을 참조하십시오.

<Image img={cross_vpc} size="lg" alt="ClickPipes가 AWS MSK에 연결할 때 Cross-VPC 리소스 액세스 아키텍처를 보여 주는 다이어그램" border />

### ClickPipes가 이제 AWS MSK용 IAM을 지원합니다 \{#clickpipes-now-supports-iam-for-aws-msk\}

이제 AWS MSK용 ClickPipes에서 IAM 인증을 사용하여 MSK 브로커에 연결할 수 있습니다. 시작하려면 [문서](/integrations/clickpipes/kafka/best-practices/#iam)를 참고하십시오.

### AWS에서 새로 생성되는 서비스의 최대 레플리카 크기 \{#maximum-replica-size-for-new-services-on-aws\}

앞으로 AWS에서 생성되는 모든 신규 서비스의 최대 레플리카 크기는 236 GiB입니다.

## 2024년 11월 22일 \{#november-22-2024\}

### ClickHouse Cloud용 기본 제공 고급 관측성 대시보드 \{#built-in-advanced-observability-dashboard-for-clickhouse-cloud\}

이전에 ClickHouse 서버 메트릭과 하드웨어 리소스 사용량을 모니터링할 수 있는 고급 관측성 대시보드는 오픈 소스 ClickHouse에서만 제공되었습니다. 이제 이 기능이 ClickHouse Cloud 콘솔에서도 제공됨을 알려 드립니다.

이 대시보드를 사용하면 [system.dashboards](/operations/system-tables/dashboards) 테이블을 기반으로 하는 쿼리를 통합 UI에서 조회할 수 있습니다. **Monitoring > Service Health** 페이지로 이동하여 지금 바로 고급 관측성 대시보드를 사용해 보십시오.

<Image img={nov_22} size="lg" alt="서버 메트릭과 리소스 사용량을 보여주는 ClickHouse Cloud 고급 관측성 대시보드" border />

### AI 기반 SQL 자동 완성 \{#ai-powered-sql-autocomplete\}

새로운 AI Copilot으로 쿼리를 작성하는 동안 인라인 SQL 자동 완성 제안을 받을 수 있도록 자동 완성 기능이 크게 향상되었습니다. 이 기능은 원하는 ClickHouse Cloud 서비스에서 **"Enable Inline Code Completion"** 설정을 활성화하여 사용할 수 있습니다.

<Image img={copilot} size="lg" alt="사용자가 타이핑할 때 AI Copilot이 SQL 자동 완성 제안을 제공하는 애니메이션" border />

### 새로운 "billing" 역할 \{#new-billing-role\}

조직의 사용자에게 새로운 **Billing** 역할을 부여하면, 서비스 구성이나 관리 권한을 부여하지 않고도 결제 정보를 조회하고 관리할 수 있습니다. 새 사용자를 초대하거나 기존 사용자의 역할을 편집하여 **Billing** 역할을 할당하십시오.

## 2024년 11월 8일 \{#november-8-2024\}

### ClickHouse Cloud의 고객 알림 \{#customer-notifications-in-clickhouse-cloud\}

ClickHouse Cloud에서는 이제 여러 결제 및 스케일링 이벤트에 대해 콘솔 내 알림과 이메일 알림을 제공합니다. 사용자는 Cloud 콘솔의 알림 센터에서 알림을 구성하여 UI에서만 표시되도록 하거나, 이메일로 수신하거나, 둘 다 받도록 설정할 수 있습니다. 서비스 수준에서 수신할 알림의 카테고리와 심각도 수준을 구성할 수 있습니다.

향후에는 다른 이벤트에 대한 알림과 알림을 수신하는 추가 방법도 제공할 예정입니다.

서비스에 대한 알림을 활성화하는 방법을 자세히 알아보려면 [ClickHouse 문서](/cloud/notifications)를 참조하십시오.

<Image img={notifications} size="lg" alt="여러 알림 유형에 대한 구성 옵션을 보여주는 ClickHouse Cloud 알림 센터 인터페이스" border />

<br />

## 2024년 10월 4일 \{#october-4-2024\}

### ClickHouse Cloud가 이제 GCP에서 HIPAA 요건을 충족하는 서비스를 베타로 제공합니다 \{#clickhouse-cloud-now-offers-hipaa-ready-services-in-beta-for-gcp\}

보호 대상 건강 정보(PHI)의 보안을 강화하려는 고객은 이제 [Google Cloud Platform (GCP)](https://cloud.google.com/)에서 ClickHouse Cloud 사용을 시작할 수 있습니다. ClickHouse는 [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)에서 규정한 관리적, 물리적, 기술적 보호 조치를 구현했으며, 이제 각 사용 사례와 워크로드에 따라 적용할 수 있는 보안 설정을 구성할 수 있습니다. 사용 가능한 보안 설정에 대한 자세한 내용은 [보안 기능 페이지](/cloud/security)를 참고하십시오.

서비스는 GCP `us-central-1` 리전에서 **Dedicated** 서비스 유형을 사용하는 고객에게 제공되며, Business Associate Agreement(BAA)가 필요합니다. 이 기능에 대한 사용 권한을 요청하거나 추가 GCP, AWS, Azure 리전에 대한 대기 목록에 등록하려면 [sales](mailto:sales@clickhouse.com) 또는 [support](https://clickhouse.com/support/program)로 문의하십시오.

### GCP와 Azure에서 컴퓨트-컴퓨트 분리가 이제 프라이빗 프리뷰로 제공됩니다 \{#compute-compute-separation-is-now-in-private-preview-for-gcp-and-azure\}

최근 AWS용 Compute-Compute Separation 프라이빗 프리뷰를 발표했습니다. 이제 GCP와 Azure에서도 이용할 수 있게 되었음을 알려드립니다.

컴퓨트-컴퓨트 분리를 사용하면 특정 서비스를 읽기-쓰기 서비스 또는 읽기 전용 서비스로 지정하여, 애플리케이션에 최적화된 컴퓨트 구성을 설계하고 비용과 성능을 모두 최적화할 수 있습니다. 자세한 내용은 [문서](/cloud/reference/warehouses)를 참조하십시오.

### 셀프 서비스 MFA 복구 코드 \{#self-service-mfa-recovery-codes\}

다중 요소 인증(MFA)을 사용하는 고객은 이제 휴대전화를 분실했거나 토큰을 실수로 삭제한 경우 사용할 수 있는 복구 코드를 받을 수 있습니다. 처음 MFA를 설정하는 고객에게는 설정 시 복구 코드가 제공됩니다. 이미 MFA를 사용 중인 고객은 기존 MFA 토큰을 삭제한 후 새 토큰을 추가하여 복구 코드를 받을 수 있습니다.

### ClickPipes 업데이트: 커스텀 인증서, 레이턴시 인사이트 등 \{#clickpipes-update-custom-certificates-latency-insights-and-more\}

ClickHouse 서비스로 데이터를 수집하는 가장 쉬운 방법인 ClickPipes의 최신 업데이트를 소개합니다. 이번 새 기능들은 데이터 수집에 대한 제어력을 강화하고, 성능 메트릭에 대한 가시성을 높이도록 설계되었습니다.

*Kafka용 커스텀 인증서(Custom Authentication Certificates)*

Kafka용 ClickPipes는 이제 SASL 및 공용 SSL/TLS를 사용하는 Kafka 브로커에 대해 커스텀 인증서를 지원합니다. ClickPipe 설정 과정의 SSL Certificate 섹션에서 직접 인증서를 업로드하여 Kafka에 더 안전하게 연결할 수 있습니다.

*Kafka 및 Kinesis용 레이턴시 메트릭 도입*

성능 가시성은 매우 중요합니다. ClickPipes에 레이턴시 그래프가 추가되어, 메시지가 생성되는 시점(Kafka Topic 또는 Kinesis Stream에서)부터 ClickHouse Cloud로 수집되기까지 걸리는 시간에 대한 인사이트를 제공합니다. 이 새로운 메트릭을 통해 데이터 파이프라인 성능을 더 면밀히 모니터링하고, 필요에 따라 최적화할 수 있습니다.

<Image img={latency_insights} size="lg" alt="데이터 수집 성능에 대한 레이턴시 메트릭 그래프를 보여주는 ClickPipes 인터페이스" border />

<br />

*Kafka 및 Kinesis용 스케일링 컨트롤(프라이빗 베타)*

높은 처리량은 데이터 볼륨과 레이턴시 요구 사항을 충족하기 위해 추가 리소스를 요구할 수 있습니다. ClickPipes에 대한 수평 확장을 도입했으며, 이를 Cloud 콘솔에서 직접 설정할 수 있습니다. 이 기능은 현재 프라이빗 베타 단계이며, 요구 사항에 따라 리소스를 더 효과적으로 확장할 수 있습니다. 베타 프로그램 참여를 원하면 [support](https://clickhouse.com/support/program)로 문의하십시오.

*Kafka 및 Kinesis용 Raw Message 수집*

이제 Kafka 또는 Kinesis 메시지 전체를 파싱 없이 그대로 수집할 수 있습니다. ClickPipes는 `_raw_message` [virtual column](/integrations/clickpipes/kafka/reference/#kafka-virtual-columns)을 지원하여, 전체 메시지를 하나의 String 컬럼으로 매핑할 수 있습니다. 이를 통해 필요한 경우 Raw 데이터로 유연하게 작업할 수 있습니다.

## 2024년 8월 29일 \{#august-29-2024\}

### 새로운 Terraform provider 버전 - v1.0.0 \{#new-terraform-provider-version---v100\}

Terraform을 사용하면 ClickHouse Cloud 서비스를 프로그래밍 방식으로 제어하고 구성을 코드로 저장할 수 있습니다. 당사의 Terraform provider는 지금까지 거의 200,000회 다운로드되었으며, 이제 공식적으로 v1.0.0 버전으로 릴리스되었습니다. 이번 새로운 버전에는 향상된 재시도 로직과 ClickHouse Cloud 서비스에 프라이빗 엔드포인트를 연결하기 위한 새로운 리소스 등 여러 개선 사항이 포함되어 있습니다. [Terraform provider는 여기](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest)에서 다운로드할 수 있으며, [전체 변경 로그는 여기](https://github.com/ClickHouse/terraform-provider-clickhouse/releases/tag/v1.0.0)에서 확인할 수 있습니다.

### 2024년 SOC 2 Type II 보고서 및 업데이트된 ISO 27001 인증서 \{#2024-soc-2-type-ii-report-and-updated-iso-27001-certificate\}

2024년 SOC 2 Type II 보고서와 업데이트된 ISO 27001 인증서의 제공을 시작했음을 알리게 되어 기쁘게 생각합니다. 이들 문서에는 새롭게 출시한 Azure 기반 서비스뿐만 아니라 기존 AWS 및 GCP에서 제공되는 서비스에 대한 지속적인 적용 범위가 모두 포함됩니다.

SOC 2 Type II는 ClickHouse 사용자에게 제공하는 서비스의 보안, 가용성, 처리 무결성 및 기밀성을 보장하기 위한 지속적인 노력을 입증합니다. 자세한 내용은 미국 공인회계사협회(American Institute of Certified Public Accountants, AICPA)에서 발행한 [SOC 2 - SOC for Service Organizations: Trust Services Criteria](https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services)와 국제표준화기구(International Organization for Standardization, ISO)의 [What is ISO/IEC 27001](https://www.iso.org/standard/27001)을 참고하십시오.

또한 보안 및 컴플라이언스 관련 문서와 보고서는 [Trust Center](https://trust.clickhouse.com/)에서도 확인할 수 있습니다.

## 2024년 8월 15일 \{#august-15-2024\}

### AWS용 Compute-compute separation이 이제 Private Preview로 제공됩니다 \{#compute-compute-separation-is-now-in-private-preview-for-aws\}

기존 ClickHouse Cloud 서비스에서는 레플리카가 읽기와 쓰기 작업을 모두 처리하며, 특정 레플리카가 한 가지 유형의 작업만 처리하도록 설정할 수 있는 방법이 없습니다. 곧 제공될 새로운 기능인 Compute-compute separation을 사용하면 특정 서비스를 읽기-쓰기 서비스 또는 읽기 전용 서비스로 지정할 수 있어, 애플리케이션에 가장 적합한 컴퓨트 구성을 설계하여 비용과 성능을 최적화할 수 있습니다.

새로운 Compute-compute separation 기능을 사용하면 동일한 객체 스토리지 폴더(따라서 동일한 테이블, 뷰 등)를 사용하면서, 각기 고유한 엔드포인트를 가진 여러 컴퓨트 노드 그룹을 생성할 수 있습니다. 자세한 내용은 [Compute-compute separation 문서](/cloud/reference/warehouses)를 참조하십시오. 이 기능을 Private Preview로 사용하고자 하는 경우 [지원팀에 문의](https://clickhouse.com/support/program)하십시오.

<Image img={cloud_console_2} size="lg" alt="읽기-쓰기 및 읽기 전용 서비스 그룹을 사용하는 Compute-compute separation 예시 아키텍처를 보여 주는 다이어그램" border />

### S3 및 GCS용 ClickPipes GA, 연속 모드 지원 \{#clickpipes-for-s3-and-gcs-now-in-ga-continuous-mode-support\}

ClickPipes는 데이터를 ClickHouse Cloud로 수집하는 가장 쉬운 방법입니다. S3 및 GCS용 [ClickPipes](https://clickhouse.com/cloud/clickpipes)가 이제 **정식 출시(GA, Generally Available)** 되었음을 안내합니다. ClickPipes는 일회성 배치 수집과 「continuous mode」를 모두 지원합니다. 수집 작업은 특정 원격 버킷에서 패턴과 일치하는 모든 파일을 ClickHouse 대상 테이블로 적재합니다. 「continuous mode」에서는 ClickPipes 작업이 지속적으로 실행되며, 원격 객체 스토리지 버킷에 새로 추가되는 일치하는 파일을 도착하는 대로 수집합니다. 이를 통해 어떤 객체 스토리지 버킷이든 ClickHouse Cloud로 데이터를 수집하기 위한 완전한 스테이징 영역으로 사용할 수 있습니다. ClickPipes에 대한 자세한 내용은 [문서](/integrations/clickpipes)를 참조하십시오.

## 2024년 7월 18일 \{#july-18-2024\}

### 메트릭용 Prometheus 엔드포인트가 이제 일반 제공됩니다 \{#prometheus-endpoint-for-metrics-is-now-generally-available\}

이전 Cloud 변경 로그에서 ClickHouse Cloud에서 [Prometheus](https://prometheus.io/) 메트릭을 내보내기 위한 Private Preview를 발표했습니다. 이 기능을 사용하면 [ClickHouse Cloud API](/cloud/manage/api/api-overview)를 통해 메트릭을 [Grafana](https://grafana.com/) 및 [Datadog](https://www.datadoghq.com/)과 같은 도구로 전송하여 시각화할 수 있습니다. 이제 이 기능이 **일반 제공(Generally Available)** 단계에 들어갔음을 알립니다. 이 기능에 대한 자세한 내용은 [문서](/integrations/prometheus)를 참고하십시오.

### Cloud 콘솔의 테이블 인스펙터 \{#table-inspector-in-cloud-console\}

ClickHouse에는 스키마를 확인하기 위해 테이블을 살펴볼 수 있게 해주는 [`DESCRIBE`](/sql-reference/statements/describe-table)와 같은 명령이 있습니다. 이러한 명령은 콘솔에 출력되지만, 테이블과 컬럼에 대한 모든 관련 데이터를 가져오려면 여러 개의 쿼리를 조합해야 하므로 사용하기 불편한 경우가 많습니다.

최근 Cloud 콘솔에 **Table Inspector(테이블 인스펙터)** 기능을 추가하여, SQL을 작성하지 않고도 UI에서 중요한 테이블 및 컬럼 정보를 조회할 수 있도록 했습니다. Cloud 콘솔에서 Table Inspector를 사용해 서비스의 테이블을 직접 살펴볼 수 있습니다. 이 기능은 하나의 통합된 인터페이스에서 스키마, 스토리지, 압축 등의 정보를 제공합니다.

<Image img={compute_compute} size="lg" alt="ClickHouse Cloud Table Inspector 인터페이스에서 상세한 스키마 및 스토리지 정보를 보여주는 화면" border />

### 새로운 Java Client API \{#new-java-client-api\}

[Java Client](https://github.com/ClickHouse/clickhouse-java)는 사용자가 ClickHouse에 연결할 때 가장 많이 사용되는 클라이언트 중 하나입니다. 재설계된 API와 다양한 성능 최적화를 통해 더 쉽고 직관적으로 사용할 수 있도록 개선했습니다. 이러한 변경 사항으로 Java 애플리케이션에서 ClickHouse에 훨씬 더 쉽게 연결할 수 있습니다. 업데이트된 Java Client 사용 방법은 이 [블로그 게시물](https://clickhouse.com/blog/java-client-sequel)에서 자세히 확인할 수 있습니다.

### 새로운 Analyzer 기본 활성화 \{#new-analyzer-is-enabled-by-default\}

지난 몇 년 동안 ClickHouse는 쿼리 분석과 최적화를 위한 새로운 analyzer를 개발해 왔습니다. 이 analyzer는 쿼리 성능을 향상시키며, 더 빠르고 효율적인 `JOIN`을 포함한 추가 최적화를 가능하게 합니다. 이전에는 신규 사용자가 `allow_experimental_analyzer` SETTING을 사용해 이 기능을 직접 활성화해야 했습니다. 이제 이 개선된 analyzer는 새로 생성되는 ClickHouse Cloud 서비스에서 기본적으로 활성화되어 있습니다.

앞으로도 analyzer에 대한 다양한 최적화가 계속해서 제공될 예정입니다.

## 2024년 6월 28일 \{#june-28-2024\}

### Microsoft Azure용 ClickHouse Cloud 일반 제공 시작 \{#clickhouse-cloud-for-microsoft-azure-is-now-generally-available\}

지난 5월 [Beta 단계](https://clickhouse.com/blog/clickhouse-cloud-is-now-on-azure-in-public-beta)에서 Microsoft Azure 지원을 처음 발표했습니다. 최신 Cloud 릴리스에서는 Azure 지원이 Beta에서 일반 제공(Generally Available)으로 전환되었음을 알립니다. 이제 ClickHouse Cloud는 AWS, Google Cloud Platform, Microsoft Azure를 포함한 3대 주요 Cloud 플랫폼 모두에서 사용할 수 있습니다.

이번 릴리스에는 [Microsoft Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/clickhouse.clickhouse_cloud)를 통한 구독 지원도 포함됩니다. 서비스는 우선 다음 지역에서 지원됩니다.

- 미국: West US 3 (Arizona)
- 미국: East US 2 (Virginia)
- 유럽: Germany West Central (Frankfurt)

특정 지역에 대한 지원을 원하는 경우 [문의](https://clickhouse.com/support/program)해 주십시오.

### 쿼리 로그 인사이트 \{#query-log-insights\}

Cloud 콘솔의 새로운 Query Insights UI를 사용하면 ClickHouse의 내장 쿼리 로그를 훨씬 더 쉽게 활용할 수 있습니다. ClickHouse의 `system.query_log` 테이블은 쿼리 최적화, 디버깅, 전체 클러스터 상태 및 성능 모니터링을 위한 핵심 정보 출처입니다. 단, 한 가지 주의할 점이 있습니다. 70개가 넘는 필드와 쿼리당 여러 레코드가 존재하기 때문에, 쿼리 로그를 해석하려면 상당한 학습이 필요합니다. 이 초기 버전의 쿼리 인사이트는 향후 쿼리 디버깅 및 최적화 패턴을 단순화하기 위한 작업에 대한 청사진 역할을 합니다. 이 기능을 계속 개선해 나가고 있으므로, 언제든지 의견을 보내 주시면 감사하겠습니다. 사용자의 피드백은 기능 발전에 큰 도움이 됩니다.

<Image img={query_insights} size="lg" alt="쿼리 성능 메트릭과 분석을 보여주는 ClickHouse Cloud Query Insights UI" border />

### 메트릭용 Prometheus 엔드포인트(프라이빗 프리뷰) \{#prometheus-endpoint-for-metrics-private-preview\}

가장 요청이 많았던 기능 중 하나로, 이제 ClickHouse Cloud에서 [Prometheus](https://prometheus.io/) 메트릭을 내보내 [Grafana](https://grafana.com/) 및 [Datadog](https://www.datadoghq.com/)에서 시각화할 수 있습니다. Prometheus는 ClickHouse를 모니터링하고 사용자 정의 알림을 설정할 수 있는 오픈 소스 솔루션을 제공합니다. ClickHouse Cloud 서비스의 Prometheus 메트릭에는 [ClickHouse Cloud API](/integrations/prometheus)를 통해 액세스할 수 있습니다. 이 기능은 현재 프라이빗 프리뷰 단계입니다. 이 기능을 조직에서 사용할 수 있도록 활성화하려면 [지원팀](https://clickhouse.com/support/program)에 문의하십시오.

<Image img={prometheus} size="lg" alt="ClickHouse Cloud의 Prometheus 메트릭을 보여 주는 Grafana 대시보드" border />

### 기타 기능 \{#other-features\}

- 빈도, 보존 기간, 일정 등 사용자 정의 백업 정책을 구성할 수 있는 [Configurable backups](/cloud/manage/backups/configurable-backups)가 이제 일반 제공(General Availability, GA) 단계입니다.

## 2024년 6월 13일 \{#june-13-2024\}

### Kafka ClickPipes Connector에 대한 구성 가능한 오프셋(Beta) \{#configurable-offsets-for-kafka-clickpipes-connector-beta\}

최근까지는 새로운 [Kafka Connector for ClickPipes](/integrations/clickpipes/kafka)를 설정할 때마다 항상 Kafka 토픽의 시작(offset 0)부터 데이터를 소비했습니다. 이러한 방식은 과거 데이터를 재처리하거나, 새로 유입되는 데이터만 모니터링하거나, 특정 지점에서 정확히 다시 시작해야 하는 등 일부 사용 사례에는 충분히 유연하지 않을 수 있습니다.

ClickPipes for Kafka에 Kafka 토픽으로부터의 데이터 소비를 더 유연하고 정밀하게 제어할 수 있는 새로운 기능이 추가되었습니다. 이제 데이터를 소비하기 시작할 오프셋을 직접 구성할 수 있습니다.

다음과 같은 옵션을 사용할 수 있습니다.

- From the beginning: Kafka 토픽의 가장 처음부터 데이터를 소비하기 시작합니다. 모든 과거 데이터를 재처리해야 하는 경우에 적합합니다.
- From latest: 가장 최신 오프셋부터 데이터를 소비하기 시작합니다. 새로 들어오는 메시지에만 관심이 있을 때 유용합니다.
- From a timestamp: 특정 타임스탬프와 같거나 이후에 생성된 메시지부터 데이터를 소비하기 시작합니다. 이 기능을 사용하면 더 정밀하게 제어할 수 있어, 특정 시점부터 처리를 재개할 수 있습니다.

<Image img={kafka_config} size="lg" alt="오프셋 선택 옵션을 보여주는 ClickPipes Kafka 커넥터 구성 인터페이스" border />

### 서비스에 Fast 릴리스 채널 등록 \{#enroll-services-to-the-fast-release-channel\}

Fast 릴리스 채널을 사용하면 서비스가 정식 릴리스 일정보다 앞서 업데이트를 받을 수 있습니다. 이전에는 이 기능을 활성화하려면 지원팀의 도움이 필요했습니다. 이제 ClickHouse Cloud 콘솔에서 서비스에 대해 이 기능을 직접 활성화할 수 있습니다. **Settings**로 이동한 후 **Enroll in fast releases**를 클릭하십시오. 그러면 해당 서비스는 업데이트가 제공되는 즉시 이를 받게 됩니다.

<Image img={fast_releases} size="lg" alt="Fast 릴리스에 등록하는 옵션이 표시된 ClickHouse Cloud 설정 페이지" border />

### Terraform을 통한 수평 확장 지원 \{#terraform-support-for-horizontal-scaling\}

ClickHouse Cloud는 서비스에 동일한 크기의 추가 레플리카를 추가하는 기능인 [수평 확장](/manage/scaling#how-scaling-works-in-clickhouse-cloud)을 지원합니다. 수평 확장은 성능과 병렬 처리 능력을 향상하여 동시 쿼리를 지원합니다. 이전에는 더 많은 레플리카를 추가하려면 ClickHouse Cloud 콘솔이나 API를 사용해야 했습니다. 이제 Terraform을 사용하여 서비스에서 레플리카를 추가하거나 제거할 수 있어, 필요에 따라 ClickHouse 서비스를 프로그래밍 방식으로 확장할 수 있습니다.

자세한 내용은 [ClickHouse Terraform provider](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs) 문서를 참조하십시오.

## 2024년 5월 30일 \{#may-30-2024\}

### 팀원과 쿼리 공유하기 \{#share-queries-with-your-teammates\}

SQL 쿼리를 작성할 때, 팀의 다른 사람들도 해당 쿼리를 유용하게 사용할 가능성이 높습니다. 이전에는 Slack이나 이메일로 쿼리를 보내야 했고, 쿼리를 수정하더라도 팀원이 해당 쿼리의 업데이트를 자동으로 받을 수 있는 방법이 없었습니다.

이제 ClickHouse Cloud 콘솔에서 쿼리를 손쉽게 공유할 수 있습니다. 쿼리 편집기(query editor)에서 전체 팀 또는 특정 팀원과 쿼리를 바로 공유할 수 있습니다. 또한 상대에게 읽기 전용 권한만 부여할지, 쓰기 권한까지 부여할지도 지정할 수 있습니다. 새로 추가된 쿼리 공유 기능을 사용해 보려면 쿼리 편집기에서 **Share** 버튼을 클릭하십시오.

<Image img={share_queries} size="lg" alt="권한 옵션이 있는 공유 기능을 보여주는 ClickHouse Cloud 쿼리 편집기" border />

### Microsoft Azure용 ClickHouse Cloud가 이제 베타로 제공됩니다 \{#clickhouse-cloud-for-microsoft-azure-is-now-in-beta\}

이제 Microsoft Azure에서 ClickHouse Cloud 서비스를 생성할 수 있습니다. 이미 많은 고객이 Private Preview 프로그램의 일환으로 Azure에서 ClickHouse Cloud를 프로덕션 환경에 사용하고 있습니다. 이제 누구나 Azure에서 자체 서비스를 생성할 수 있습니다. AWS와 GCP에서 지원되는 즐겨 사용하는 모든 ClickHouse 기능은 Azure에서도 동일하게 동작합니다.

향후 몇 주 내에 Azure용 ClickHouse Cloud를 일반 제공(General Availability)으로 전환할 예정입니다. 자세한 내용은 [이 블로그 게시물](https://clickhouse.com/blog/clickhouse-cloud-is-now-on-azure-in-public-beta)을 참고하거나 ClickHouse Cloud 콘솔에서 Azure를 사용해 새 서비스를 생성하십시오.

참고: 현재 Azure에서는 **Development** 서비스가 지원되지 않습니다.

### Cloud 콘솔을 통해 Private Link 설정 \{#set-up-private-link-via-the-cloud-console\}

Private Link 기능을 사용하면 공용 인터넷으로 트래픽을 전달할 필요 없이 클라우드 제공자 계정 내의 내부 서비스와 ClickHouse Cloud 서비스 간에 연결할 수 있습니다. 이를 통해 비용을 절감하고 보안을 강화할 수 있습니다. 이전에는 이러한 구성을 진행하기가 어려웠으며 ClickHouse Cloud API를 사용해야 했습니다.

이제 ClickHouse Cloud 콘솔에서 몇 번의 클릭만으로 프라이빗 엔드포인트를 직접 구성할 수 있습니다. 서비스의 **Settings**에서 **Security** 섹션으로 이동한 뒤 **Set up private endpoint**를 클릭하십시오.

<Image img={private_endpoint} size="lg" alt="보안 설정에서 프라이빗 엔드포인트 설정 인터페이스를 표시하는 ClickHouse Cloud 콘솔" border />

## 2024년 5월 17일 \{#may-17-2024\}

### ClickPipes(베타)를 사용하여 Amazon Kinesis에서 데이터 수집 \{#ingest-data-from-amazon-kinesis-using-clickpipes-beta\}

ClickPipes는 코드 작성 없이 데이터를 수집할 수 있도록 ClickHouse Cloud에서 제공하는 전용 서비스입니다. Amazon Kinesis는 데이터 스트림을 수집하고 저장하여 처리할 수 있는 AWS의 완전 관리형 스트리밍 서비스입니다. 가장 많은 요청을 받은 통합 중 하나인 Amazon Kinesis용 ClickPipes 베타를 출시하게 되어 기쁘게 생각합니다. 앞으로도 ClickPipes에 더 많은 통합을 계속 추가할 계획이므로, 어떤 데이터 소스에 대한 지원이 필요한지 알려 주십시오. 이 기능에 대한 자세한 내용은 [여기](https://clickhouse.com/blog/clickpipes-amazon-kinesis)를 참고하십시오.

Cloud 콘솔에서 ClickPipes용 새로운 Amazon Kinesis 통합을 사용해 볼 수 있습니다.

<Image img={kenesis} size="lg" alt="Amazon Kinesis 통합 구성 옵션이 표시된 ClickPipes 인터페이스" border />

### 구성 가능한 백업(비공개 프리뷰) \{#configurable-backups-private-preview\}

백업은 어떤 데이터베이스(아무리 신뢰성이 높더라도)에도 중요하며, ClickHouse Cloud 출시 첫날부터 백업을 매우 중요하게 다루어 왔습니다. 이번 주에는 서비스 백업을 훨씬 더 유연하게 구성할 수 있는 Configurable Backups 기능을 출시했습니다. 이제 시작 시간, 보존 기간, 빈도를 직접 제어할 수 있습니다. 이 기능은 **Production** 및 **Dedicated** 서비스에서 사용할 수 있으며, **Development** 서비스에서는 사용할 수 없습니다. 이 기능은 현재 비공개 프리뷰 단계이므로, 서비스에서 사용하려면 support@clickhouse.com으로 문의하십시오. 구성 가능한 백업에 대한 자세한 내용은 [여기](https://clickhouse.com/blog/configurable-backups-in-clickhouse-cloud)를 참고하십시오.

### SQL 쿼리로 API 생성하기(Beta) \{#create-apis-from-your-sql-queries-beta\}

ClickHouse용 SQL 쿼리를 작성한 후에는, 애플리케이션에서 해당 쿼리를 사용하기 위해 여전히 드라이버를 통해 ClickHouse에 연결해야 합니다. 이제 새로운 **Query Endpoints** 기능을 사용하면, 별도 구성 없이 API에서 직접 SQL 쿼리를 실행할 수 있습니다. Query Endpoints가 JSON, CSV 또는 TSV 형식으로 결과를 반환하도록 지정할 수 있습니다. Cloud 콘솔에서 "Share" 버튼을 클릭하여 사용하는 쿼리에 이 새로운 기능을 적용해 보십시오. Query Endpoints에 대한 자세한 내용은 [여기](https://clickhouse.com/blog/automatic-query-endpoints)를 참조하십시오.

<Image img={query_endpoints} size="lg" alt="Query Endpoints 구성과 출력 형식 옵션을 보여주는 ClickHouse Cloud 인터페이스" border />

### 공식 ClickHouse 인증을 이제 이용할 수 있습니다 \{#official-clickhouse-certification-is-now-available\}

ClickHouse Develop 교육 과정에는 12개의 무료 교육 모듈이 있습니다. 이번 주 이전까지는 ClickHouse 숙련도를 공식적으로 증명할 방법이 없었습니다. 최근 **ClickHouse Certified Developer**가 되기 위한 공식 시험을 공개했습니다. 이 시험에 합격하면 데이터 수집, 모델링, 분석, 성능 최적화 등 다양한 주제에서의 ClickHouse 활용 능력을 현재 및 잠재적인 고용주와 공유할 수 있습니다. 시험은 [여기](https://clickhouse.com/learn/certification)에서 응시할 수 있으며, ClickHouse 인증에 대한 자세한 내용은 이 [블로그 게시물](https://clickhouse.com/blog/first-official-clickhouse-certification)에서 확인할 수 있습니다.

## 2024년 4월 25일 \{#april-25-2024\}

### ClickPipes를 사용해 S3 및 GCS에서 데이터 로드하기 \{#load-data-from-s3-and-gcs-using-clickpipes\}

최근에 새로 출시된 ClickHouse Cloud 콘솔에서 「Data sources」라는 새 섹션이 추가된 것을 보았을 것입니다. 「Data sources」 페이지는 ClickPipes로 구동되며, 이는 다양한 소스에서 ClickHouse Cloud로 데이터를 손쉽게 적재할 수 있도록 해 주는 ClickHouse Cloud의 기본 기능입니다.

최근 ClickPipes 업데이트에는 Amazon S3와 Google Cloud Storage에서 데이터를 직접 업로드하는 기능이 추가되었습니다. 여전히 내장 테이블 함수(table function)를 사용할 수 있지만, ClickPipes는 UI를 통해 제공되는 완전 관리형 서비스로, 몇 번의 클릭만으로 S3와 GCS에서 데이터를 수집하도록 설정할 수 있습니다. 이 기능은 아직 Private Preview 단계이지만, 오늘 바로 ClickHouse Cloud 콘솔을 통해 사용해 볼 수 있습니다.

<Image img={s3_gcs} size="lg" alt="S3 및 GCS 버킷에서 데이터를 로드하기 위한 구성 옵션을 보여 주는 ClickPipes 인터페이스" border />

### Fivetran을 사용해 500개 이상 소스의 데이터를 ClickHouse Cloud로 적재하기 \{#use-fivetran-to-load-data-from-500-sources-into-clickhouse-cloud\}

ClickHouse는 매우 큰 데이터셋도 빠르게 쿼리할 수 있지만, 우선 데이터가 ClickHouse에 적재되어 있어야 합니다. Fivetran이 제공하는 광범위한 커넥터 덕분에 이제 500개가 넘는 다양한 소스에서 데이터를 빠르게 적재할 수 있습니다. Zendesk, Slack 또는 자주 사용하는 애플리케이션에서 데이터를 적재해야 하는 경우, Fivetran용 새로운 ClickHouse destination을 사용하면 애플리케이션 데이터의 대상 데이터베이스로 ClickHouse를 사용할 수 있습니다.

이는 Integrations 팀이 수개월에 걸쳐 구축한 오픈 소스 통합입니다. [릴리스 블로그 게시물](https://clickhouse.com/blog/fivetran-destination-clickhouse-cloud)과 [GitHub 저장소](https://github.com/ClickHouse/clickhouse-fivetran-destination)를 참고하십시오.

### 기타 변경 사항 \{#other-changes\}

**콘솔 변경 사항**

- SQL 콘솔에서 출력 포맷을 지원합니다.

**통합(Integrations) 변경 사항**

- ClickPipes Kafka 커넥터가 다중 브로커 구성을 지원합니다.
- PowerBI 커넥터에서 ODBC 드라이버 구성 옵션 지정을 지원합니다.

## 2024년 4월 18일 \{#april-18-2024\}

### AWS Tokyo 리전이 ClickHouse Cloud에서 사용 가능해졌습니다 \{#aws-tokyo-region-is-now-available-for-clickhouse-cloud\}

이번 릴리스에서는 ClickHouse Cloud용 신규 AWS Tokyo 리전(`ap-northeast-1`)을 도입합니다. ClickHouse를 가장 빠른 데이터베이스로 제공하기 위해 모든 Cloud에서 가능한 한 지연 시간을 줄일 수 있도록 지속적으로 리전을 추가하고 있습니다. 업데이트된 Cloud 콘솔에서 Tokyo 리전에 새 서비스를 생성할 수 있습니다.

<Image img={tokyo} size="lg" alt="Tokyo 리전 선택이 표시된 ClickHouse Cloud 서비스 생성 인터페이스" border />

기타 변경 사항:

### 콘솔 변경 사항 \{#console-changes\}

- Kafka용 ClickPipes에 대한 Avro 형식 지원이 이제 정식으로 제공됩니다
- Terraform 프로바이더에서 리소스(서비스 및 프라이빗 엔드포인트) 가져오기에 대한 완전한 지원을 구현했습니다

### 통합 변경 사항 \{#integrations-changes\}

- NodeJS 클라이언트 주요 안정 버전 릴리스: 쿼리 + ResultSet에 대한 고급 TypeScript 지원, URL 구성
- Kafka Connector: DLQ에 기록할 때 예외를 무시하던 버그 수정, Avro Enum 타입 지원 추가, [MSK](https://www.youtube.com/watch?v=6lKI_WlQ3-s) 및 [Confluent Cloud](https://www.youtube.com/watch?v=SQAiPVbd3gg)에서 커넥터를 사용하는 가이드 게시
- Grafana: UI에서 널 허용(Nullable) 타입 지원 문제 수정, 동적 OTel 추적 테이블 이름 지원 문제 수정
- DBT: 사용자 정의 구체화(materialization)를 위한 모델 설정 수정
- Java 클라이언트: 잘못된 오류 코드 파싱 버그 수정
- Python 클라이언트: 숫자 타입에 대한 매개변수 바인딩 수정, 쿼리 바인딩에서 숫자 목록 처리 버그 수정, SQLAlchemy Point 지원 추가

## 2024년 4월 4일 \{#april-4-2024\}

### 새로운 ClickHouse Cloud 콘솔 소개 \{#introducing-the-new-clickhouse-cloud-console\}

이번 릴리스에서는 새로운 Cloud 콘솔의 프라이빗 프리뷰가 도입됩니다.

ClickHouse에서는 개발자 경험을 향상시키는 방법을 지속적으로 고민하고 있습니다. 가장 빠른 실시간 데이터 웨어하우스를 제공하는 것만으로는 충분하지 않으며, 사용과 관리 또한 쉬워야 한다고 인식하고 있습니다.

매월 수천 명의 ClickHouse Cloud 사용자가 SQL 콘솔에서 수십억 건의 쿼리를 실행하고 있으며, 이러한 이유로 ClickHouse Cloud 서비스를 그 어느 때보다 쉽게 활용할 수 있도록 세계적 수준의 콘솔에 더 많은 투자를 하기로 했습니다. 새로운 Cloud 콘솔 경험은 독립형 SQL 편집기와 관리 콘솔을 하나의 직관적인 UI로 통합합니다.

선정된 일부 고객에게는 새로운 Cloud 콘솔 경험에 대한 프리뷰를 제공합니다. 이는 ClickHouse에서 데이터를 탐색하고 관리할 수 있는 통합적이고 몰입감 있는 방식입니다. 우선적으로 액세스하고자 한다면 support@clickhouse.com으로 문의하시기 바랍니다.

<Image img={cloud_console} size="lg" alt="통합 SQL 편집기와 관리 기능이 포함된 새로운 ClickHouse Cloud 콘솔 인터페이스를 보여주는 애니메이션" border />

## 2024년 3월 28일 \{#march-28-2024\}

이 릴리스에서는 Microsoft Azure 지원, API를 통한 수평 확장(Horizontal Scaling), 프라이빗 프리뷰에서의 릴리스 채널(Release Channels)을 도입합니다.

### 일반 업데이트 \{#general-updates\}

- Private Preview 단계에서 Microsoft Azure 지원이 추가되었습니다. 액세스하려면 계정 관리 팀 또는 지원 팀에 문의하거나 [대기자 목록](https://clickhouse.com/cloud/azure-waitlist)에 등록하십시오.
- 환경 유형에 따라 업그레이드 시점을 지정할 수 있는 Release Channels가 도입되었습니다. 이번 릴리스에서는 비프로덕션 환경을 프로덕션보다 먼저 업그레이드할 수 있도록 하는 「fast」 릴리스 채널이 추가되었습니다(활성화를 위해 지원 팀에 문의하십시오).

### 관리 기능 변경 사항 \{#administration-changes\}

- API를 통해 수평 확장을 구성할 수 있도록 지원을 추가했습니다(비공개 프리뷰로, 활성화를 위해 지원팀에 문의하십시오)
- 시작 시 메모리 부족 오류가 발생하는 서비스가 자동으로 확장되도록 오토스케일링을 개선했습니다
- Terraform 프로바이더를 통한 AWS용 CMEK 지원을 추가했습니다

### Console 변경 사항 \{#console-changes-1\}

- Microsoft 소셜 로그인 지원을 추가했습니다
- SQL 콘솔에서 매개변수화된 쿼리 공유 기능을 추가했습니다
- 일부 EU 리전에서 레이턴시가 5초에서 1.5초로 감소하는 등 쿼리 편집기 성능을 크게 개선했습니다

### 통합 변경 사항 \{#integrations-changes-1\}

- ClickHouse OpenTelemetry exporter: ClickHouse 복제 테이블 엔진에 대한 [지원이 추가되었으며](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/31920) [통합 테스트가 추가되었습니다](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/31896).
- ClickHouse DBT adapter: [딕셔너리를 위한 materialization 매크로](https://github.com/ClickHouse/dbt-clickhouse/pull/255) 지원이 추가되었고, [TTL 표현식 지원에 대한 테스트](https://github.com/ClickHouse/dbt-clickhouse/pull/254)가 추가되었습니다.
- ClickHouse Kafka Connect Sink: Kafka 플러그인 검색과의 [호환성이 추가되었습니다](https://github.com/ClickHouse/clickhouse-kafka-connect/issues/350) (커뮤니티 기여).
- ClickHouse Java Client: 새로운 client API용 [새 패키지가 도입되었으며](https://github.com/ClickHouse/clickhouse-java/pull/1574), Cloud 테스트를 위한 [테스트 커버리지가 추가되었습니다](https://github.com/ClickHouse/clickhouse-java/pull/1575).
- ClickHouse NodeJS Client: 새로운 HTTP keep-alive 동작에 대한 테스트와 문서가 확장되었습니다. v0.3.0 릴리스부터 사용 가능합니다.
- ClickHouse Golang Client: 맵에서 키로 사용되는 Enum에 대한 [버그를 수정했고](https://github.com/ClickHouse/clickhouse-go/pull/1236), 오류가 발생한 연결이 커넥션 풀에 남아 있는 문제를 [수정했습니다](https://github.com/ClickHouse/clickhouse-go/pull/1237) (커뮤니티 기여).
- ClickHouse Python Client: PyArrow를 통한 쿼리 스트리밍에 대한 [지원이 추가되었습니다](https://github.com/ClickHouse/clickhouse-connect/issues/155) (커뮤니티 기여).

### 보안 업데이트 \{#security-updates\}

- ClickHouse Cloud를 업데이트하여 [「쿼리 캐싱이 활성화된 경우 역할 기반 접근 제어(Role-Based Access Control)가 우회됨」](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-45h5-f7g3-gr8r) 취약성을 방지했습니다. (CVE-2024-22412)

## 2024년 3월 14일 \{#march-14-2024\}

이번 릴리스에서는 새로운 Cloud 콘솔 경험, S3 및 GCS에서의 대량 적재를 위한 ClickPipes, 그리고 Kafka용 ClickPipes에서 Avro 형식 지원이 얼리 액세스로 제공됩니다. 또한 ClickHouse 데이터베이스 버전을 24.1로 업그레이드하여 새로운 함수는 물론 성능 및 리소스 사용 최적화를 제공합니다.

### Console 변경 사항 \{#console-changes-2\}

- 새로운 Cloud 콘솔 환경이 얼리 액세스로 제공됩니다(참여를 원하시는 경우 지원팀에 문의하십시오).
- S3 및 GCS에서 대량 적재를 위한 ClickPipes가 얼리 액세스로 제공됩니다(참여를 원하시는 경우 지원팀에 문의하십시오).
- Kafka용 ClickPipes에서 Avro 형식 지원이 얼리 액세스로 제공됩니다(참여를 원하시는 경우 지원팀에 문의하십시오).

### ClickHouse 버전 업그레이드 \{#clickhouse-version-upgrade\}

- FINAL 최적화, 벡터화 성능 개선, 더 빠른 집계를 지원합니다. 자세한 내용은 [23.12 릴리스 블로그](https://clickhouse.com/blog/clickhouse-release-23-12#optimizations-for-final)를 참조하십시오.
- 퓨니코드 처리, 문자열 유사도 계산, 이상치 감지를 위한 신규 함수와 함께 머지(merge) 및 Keeper에 대한 메모리 최적화가 추가되었습니다. 자세한 내용은 [24.1 릴리스 블로그](https://clickhouse.com/blog/clickhouse-release-24-01)와 [발표 자료](https://presentations.clickhouse.com/release_24.1/)를 참조하십시오.
- 이 ClickHouse Cloud 버전은 24.1을 기반으로 하며, 수십 가지 신규 기능, 성능 개선 및 버그 수정이 포함됩니다. 자세한 내용은 코어 데이터베이스 [변경 로그](/whats-new/changelog/2023#2312)를 참조하십시오.

### 통합 변경 사항 \{#integrations-changes-2\}

- Grafana: v4 대시보드 마이그레이션 및 애드혹(ad-hoc) 필터링 로직 수정
- Tableau Connector: DATENAME FUNCTION 및 "real" 인자의 반올림 처리 수정
- Kafka Connector: 연결 초기화 시 발생하던 NPE 수정, JDBC 드라이버 옵션을 지정할 수 있는 기능 추가
- Golang client: 응답 처리 시 메모리 사용량 감소, Date32 극값 처리 문제 수정, 압축이 활성화된 경우 오류 보고 문제 수정
- Python client: datetime 매개변수의 시간대(timezone) 지원 개선, Pandas DataFrame 성능 개선

## 2024년 2월 29일 \{#february-29-2024\}

이번 릴리스에서는 SQL 콘솔 애플리케이션의 로딩 시간을 개선하고, ClickPipes에서 SCRAM-SHA-256 인증을 지원하며, Kafka Connect에서 중첩 구조 지원을 확장합니다.

### 콘솔 변경 사항 \{#console-changes-3\}

- SQL 콘솔 애플리케이션의 초기 로드 시간을 최적화했습니다
- "authentication failed" 오류를 유발하던 SQL 콘솔의 경쟁 상태(race condition)를 수정했습니다
- 모니터링 페이지에서 가장 최근 메모리 할당 값이 간헐적으로 잘못 표시되던 동작을 수정했습니다
- SQL 콘솔이 간혹 중복된 KILL QUERY 명령을 실행하던 동작을 수정했습니다
- ClickPipes에서 Kafka 기반 데이터 소스에 대한 SCRAM-SHA-256 인증 방식 지원을 추가했습니다

### 통합 변경 사항 \{#integrations-changes-3\}

- Kafka 커넥터: 복잡한 중첩 구조(Array, 맵)에 대한 지원을 확대하고 FixedString 타입 지원을 추가했으며, 데이터를 여러 데이터베이스로 수집하는 기능을 추가했습니다
- Metabase: 23.8 미만 버전의 ClickHouse와의 비호환성 문제를 수정했습니다
- DBT: 모델 생성 시 설정을 전달할 수 있는 기능을 추가했습니다
- Node.js client: 1시간을 초과해 실행되는 장시간 쿼리와 빈 값을 원활하게 처리하는 기능을 추가했습니다

## 2024년 2월 15일 \{#february-15-2024\}

이 릴리스에서는 코어 데이터베이스 버전을 업그레이드하고, Terraform을 통해 프라이빗 링크를 설정할 수 있는 기능을 추가했으며, Kafka Connect를 사용하는 비동기 insert 작업에 대해 exactly once semantics를 지원합니다.

### ClickHouse 버전 업그레이드 \{#clickhouse-version-upgrade-1\}

- S3에서 지속적이고 예약된 방식으로 데이터를 로드하기 위한 S3Queue 테이블 엔진이 프로덕션 환경에서 사용할 수 있는 수준이 되었습니다. 자세한 내용은 [23.11 릴리스 블로그](https://clickhouse.com/blog/clickhouse-release-23-11)를 참조하십시오.
- FINAL에 대한 성능이 크게 향상되었고, SIMD 명령어에 대한 벡터화가 개선되어 쿼리 속도가 빨라졌습니다. 자세한 내용은 [23.12 릴리스 블로그](https://clickhouse.com/blog/clickhouse-release-23-12#optimizations-for-final)를 참조하십시오.
- 이 ClickHouse Cloud 버전은 23.12를 기반으로 하며, 수십 개의 신규 기능, 성능 향상 및 버그 수정이 포함되어 있습니다. 자세한 내용은 [코어 데이터베이스 변경 로그](/whats-new/changelog/2023#2312)를 참조하십시오.

### 콘솔 변경 사항 \{#console-changes-4\}

- Terraform provider를 통해 AWS Private Link 및 GCP Private Service Connect를 설정할 수 있는 기능을 추가했습니다
- 원격 파일 데이터 가져오기 작업의 안정성을 개선했습니다
- 모든 데이터 가져오기 작업에 가져오기 상태 세부 정보를 표시하는 플라이아웃을 추가했습니다
- S3 데이터 가져오기에서 액세스 키/시크릿 키 자격 증명 방식을 지원하도록 했습니다

### 통합 변경 사항 \{#integrations-changes-4\}

* Kafka Connect
  * exactly once 보장을 위한 async_insert 지원 (기본적으로 비활성화됨)
* Golang 클라이언트
  * DateTime 바인딩 수정
  * 배치 삽입 성능 개선
* Java 클라이언트
  * 요청 압축 문제 수정

### 설정 변경 \{#settings-changes\}

* `use_mysql_types_in_show_columns` 설정은 더 이상 필요하지 않습니다. MySQL 인터페이스를 통해 연결하면 자동으로 활성화됩니다.
* `async_insert_max_data_size`의 기본값은 이제 `10 MiB`입니다.

## 2024년 2월 2일 \{#february-2-2024\}

이번 릴리스에서는 Azure Event Hub용 ClickPipes를 제공하며, v4 ClickHouse Grafana 커넥터를 통해 로그 및 트레이스 탐색 워크플로우를 크게 개선하고, Flyway 및 Atlas 데이터베이스 스키마 관리 도구를 새로 지원합니다.

### Console 변경 사항 \{#console-changes-5\}

* Azure Event Hub에 대한 ClickPipes 지원이 추가되었습니다.
* 신규 서비스는 기본 유휴 시간이 15분으로 시작됩니다.

### 통합 변경 사항 \{#integrations-changes-5\}

* [Grafana용 ClickHouse 데이터 소스](https://grafana.com/grafana/plugins/grafana-clickhouse-datasource/) v4 릴리스
  * Table, Logs, Time Series, Traces용 특화된 편집기를 제공하도록 쿼리 빌더를 전면 재구현했습니다.
  * 더 복잡하고 동적인 쿼리를 지원하도록 SQL 생성기를 전면 재구현했습니다.
  * Log 및 Trace 보기에서 OpenTelemetry에 대한 일급 지원을 추가했습니다.
  * Logs 및 Traces에 대해 기본 테이블과 컬럼을 지정할 수 있도록 구성 옵션을 확장했습니다.
  * 커스텀 HTTP 헤더를 지정하는 기능을 추가했습니다.
  * 그 외에도 많은 개선 사항이 있습니다. 전체 [변경 로그](https://github.com/grafana/clickhouse-datasource/blob/main/CHANGELOG.md#400)를 확인하십시오.
* 데이터베이스 스키마 관리 도구
  * [Flyway에 ClickHouse 지원 추가](https://github.com/flyway/flyway-community-db-support/packages/2037428)
  * [Ariga Atlas에 ClickHouse 지원 추가](https://atlasgo.io/blog/2023/12/19/atlas-v-0-16#clickhouse-beta-program)
* Kafka Connector Sink
  * 기본값이 있는 테이블로의 수집을 최적화했습니다.
  * DateTime64에 문자열 기반 날짜 지원을 추가했습니다.
* Metabase
  * 여러 데이터베이스에 대한 연결을 지원하도록 했습니다.

## 2024년 1월 18일 \{#january-18-2024\}

이번 릴리스에서는 AWS에 새로운 리전(London / eu-west-2)이 추가되고, Redpanda, Upstash 및 Warpstream에 대한 ClickPipes 지원이 추가되며, [is_deleted](/engines/table-engines/mergetree-family/replacingmergetree#is_deleted) 핵심 데이터베이스 기능의 신뢰성이 개선됩니다.

### 일반 변경 사항 \{#general-changes\}

- 새 AWS 리전: 런던 (eu-west-2)

### 콘솔 변경 사항 \{#console-changes-6\}

- Redpanda, Upstash, Warpstream에 대한 ClickPipes 지원을 추가했습니다.
- UI에서 ClickPipes 인증 메커니즘을 구성할 수 있도록 했습니다.

### 통합 기능 변경 사항 \{#integrations-changes-6\}

- Java 클라이언트:
  - 하위 호환이 되지 않는 변경 사항: 호출에서 임의의 URL 핸들을 지정하는 기능을 제거했습니다. 이 기능은 ClickHouse 전반에서 제거되었습니다.
  - 사용 중단 예정: Java CLI 클라이언트 및 GRPC 패키지
  - 배치 크기와 ClickHouse 인스턴스의 워크로드를 줄이기 위해 RowBinaryWithDefaults 포맷 지원을 추가했습니다(Exabeam 요청).
  - Date32 및 DateTime64 범위 경계를 ClickHouse와 호환되도록 조정하고, Spark Array 문자열 타입과의 호환성 및 노드 선택 메커니즘을 개선했습니다.
- Kafka Connector: Grafana용 JMX 모니터링 대시보드를 추가했습니다.
- PowerBI: UI에서 ODBC 드라이버 설정을 구성할 수 있도록 했습니다.
- JavaScript 클라이언트: 쿼리 요약 정보를 제공하고, 삽입 시 특정 컬럼의 부분 집합만 지정할 수 있도록 했으며, 웹 클라이언트에서 keep_alive를 설정 가능하게 했습니다.
- Python 클라이언트: SQLAlchemy용 Nothing 타입 지원을 추가했습니다.

### 안정성 변경 사항 \{#reliability-changes\}

- 사용자에게 노출되는 역호환 불가 변경 사항: 이전에는 특정 조건에서 두 기능([is_deleted](/engines/table-engines/mergetree-family/replacingmergetree#is_deleted) 및 ``OPTIMIZE CLEANUP``)이 ClickHouse 데이터 손상을 초래할 수 있었습니다. 기능의 핵심은 유지하면서 사용자 데이터의 무결성을 보호하기 위해 이 기능의 동작 방식을 조정했습니다. 구체적으로, MergeTree 설정인 ``clean_deleted_rows``는 이제 사용 중단(deprecated)되었으며 더 이상 효과가 없습니다. 기본적으로 ``CLEANUP`` 키워드는 허용되지 않습니다(이를 사용하려면 ``allow_experimental_replacing_merge_with_cleanup``를 활성화해야 합니다). ``CLEANUP``을 사용하기로 한 경우 항상 ``FINAL``과 함께 사용해야 하며, ``OPTIMIZE FINAL CLEANUP``을 실행한 이후에는 더 오래된 버전을 가진 행이 삽입되지 않도록 보장해야 합니다.

## 2023년 12월 18일 \{#december-18-2023\}

이번 릴리스에는 새로운 GCP 리전(us-east1), 셀프서비스 방식으로 보안 엔드포인트 연결을 구성할 수 있는 기능, DBT 1.7을 포함한 추가 통합 기능 지원, 그리고 다양한 버그 수정 및 보안 강화가 포함됩니다.

### 일반 변경 사항 \{#general-changes-1\}

- ClickHouse Cloud가 이제 GCP us-east1 (South Carolina) 리전에서 사용 가능해졌습니다
- OpenAPI를 통해 AWS Private Link 및 GCP Private Service Connect를 설정할 수 있게 되었습니다

### Console changes \{#console-changes-7\}

- Developer 역할 보유 사용자가 별도 로그인 과정 없이 SQL 콘솔에 자동으로 로그인할 수 있도록 했습니다
- 온보딩 과정에서 유휴 시간 제어 설정 워크플로우를 간소화했습니다

### 통합 변경 사항 \{#integrations-changes-7\}

- DBT connector: DBT v1.7까지 지원 추가
- Metabase: Metabase v0.48 지원 추가
- PowerBI Connector: PowerBI Cloud에서 실행 지원 추가
- ClickPipes 내부 USER 권한을 설정할 수 있도록 변경
- Kafka Connect
  - 중복 제거 로직과 널 허용(Nullable) 타입 데이터 수집 개선
  - 텍스트 기반 형식(CSV, TSV)에 대한 지원 추가
- Apache Beam: Boolean 및 LowCardinality 타입에 대한 지원 추가
- Node.js client: Parquet 형식 지원 추가

### 보안 공지 \{#security-announcements\}

- 보안 취약점 3건을 패치했습니다. 자세한 내용은 [security changelog](/whats-new/security-changelog)를 참조하십시오.
  - CVE 2023-47118 (CVSS 7.0) - 기본적으로 9000/tcp 포트에서 동작하는 native interface에 영향을 미치는 힙 버퍼 오버플로우 취약점
  - CVE-2023-48704 (CVSS 7.0) - 기본적으로 9000/tcp 포트에서 동작하는 native interface에 영향을 미치는 힙 버퍼 오버플로우 취약점
  - CVE 2023-48298 (CVSS 5.9) - FPC 압축 코덱에서 발생하는 정수 언더플로 취약점

## 2023년 11월 22일 \{#november-22-2023\}

이번 릴리스에서는 핵심 데이터베이스 버전을 업그레이드하고, 로그인 및 인증 흐름을 개선했으며, Kafka Connect Sink에 대한 프록시 지원을 추가했습니다.

### ClickHouse 버전 업그레이드 \{#clickhouse-version-upgrade-2\}

- Parquet 파일 읽기 성능이 대폭 향상되었습니다. 자세한 내용은 [23.8 릴리스 블로그](https://clickhouse.com/blog/clickhouse-release-23-08)를 참조하십시오.
- JSON에 대한 타입 추론(type inference) 지원이 추가되었습니다. 자세한 내용은 [23.9 릴리스 블로그](https://clickhouse.com/blog/clickhouse-release-23-09)를 참조하십시오.
- `ArrayFold`와 같은 강력한 분석가용 함수가 도입되었습니다. 자세한 내용은 [23.10 릴리스 블로그](https://clickhouse.com/blog/clickhouse-release-23-10)를 참조하십시오.
- **사용자에게 영향을 미치는 하위 호환성 없는 변경 사항**: JSON 형식에서 문자열로부터 숫자를 추론하지 않도록 기본값으로 `input_format_json_try_infer_numbers_from_strings` 설정을 비활성화했습니다. 이 설정을 활성화하면 샘플 데이터에 숫자와 유사한 문자열이 포함된 경우 파싱 오류가 발생할 수 있습니다.
- 수십 가지의 새로운 기능, 성능 개선 및 버그 수정이 포함되어 있습니다. 자세한 내용은 [코어 데이터베이스 변경 로그](/whats-new/changelog)를 참조하십시오.

### Console 변경 사항 \{#console-changes-8\}

- 로그인 및 인증 흐름이 개선되었습니다.
- 대규모 스키마를 더 잘 지원하도록 AI 기반 쿼리 제안 기능이 개선되었습니다.

### 통합 변경 사항 \{#integrations-changes-8\}

- Kafka Connect Sink: 프록시 지원, `topic-tablename` 매핑, Keeper의 _exactly-once_ 전달 속성 구성 기능을 추가했습니다.
- Node.js 클라이언트: Parquet 형식 지원을 추가했습니다.
- Metabase: `datetimeDiff` 함수 지원을 추가했습니다.
- Python 클라이언트: 컬럼 이름에 특수 문자를 사용할 수 있도록 지원을 추가했습니다. timezone 매개변수 바인딩을 수정했습니다.

## 2023년 11월 2일 \{#november-2-2023\}

이번 릴리스에서는 아시아 지역 개발 서비스에 대한 지원을 확대하고, 고객 관리 암호화 키에 대한 키 로테이션 기능을 도입하며, 청구 콘솔에서 세금 설정의 세부 조정 기능을 개선하고, 지원되는 언어 클라이언트 전반에 걸쳐 다양한 버그를 수정합니다.

### 일반 업데이트 \{#general-updates-1\}

- 이제 AWS의 `ap-south-1`(뭄바이) 및 `ap-southeast-1`(싱가포르) 리전에서 개발 서비스가 제공됩니다
- 고객 관리 암호화 키(CMEK)에 대한 키 로테이션 지원이 추가되었습니다

### 콘솔 변경 사항 \{#console-changes-9\}

- 신용카드를 추가할 때 세금을 세밀하게 설정할 수 있는 기능이 추가되었습니다

### 통합 변경 사항 \{#integrations-changes-9\}

- MySQL
  - MySQL을 통한 Tableau Online 및 QuickSight 지원이 개선되었습니다.
- Kafka Connector
  - 텍스트 기반 포맷(CSV, TSV)을 지원하기 위한 새로운 StringConverter가 도입되었습니다.
  - Bytes 및 Decimal 데이터 타입 지원이 추가되었습니다.
  - Retryable Exceptions이 이제 항상 재시도되도록 조정되었습니다(`errors.tolerance=all`인 경우에도 재시도됨).
- Node.js client
  - 스트리밍되는 대용량 데이터셋에서 손상된 결과가 반환되던 문제가 수정되었습니다.
- Python client
  - 대용량 insert 시 발생하던 timeout 문제가 수정되었습니다.
  - NumPy/Pandas Date32 관련 문제가 수정되었습니다.
- Golang client
  - 비어 있는 맵(map)을 JSON 컬럼에 insert하는 경우, 압축 버퍼 정리, 쿼리 이스케이프 처리, IPv4 및 IPv6의 0/nil 값에서 발생하던 panic 문제가 수정되었습니다.
  - 취소된 insert에 대한 watchdog이 추가되었습니다.
- DBT
  - 테스트와 함께 분산 테이블 지원이 개선되었습니다.

## 2023년 10월 19일 \{#october-19-2023\}

이번 릴리스에서는 SQL 콘솔의 사용성 및 성능 개선, Metabase 커넥터에서의 IP 데이터 타입 처리 향상, Java 및 Node.js 클라이언트의 새로운 기능 추가가 이루어졌습니다.

### Console 변경 사항 \{#console-changes-10\}

- SQL 콘솔의 사용성을 개선했습니다 (예: 쿼리를 여러 번 실행해도 컬럼 너비가 유지되도록 함).
- SQL 콘솔의 성능을 개선했습니다.

### 통합 변경 사항 \{#integrations-changes-10\}

- Java 클라이언트:
  - 성능 향상과 기존 연결 재사용을 위해 기본 네트워크 라이브러리를 변경했습니다.
  - 프록시 지원을 추가했습니다.
  - Trust Store를 사용한 보안 연결 지원을 추가했습니다.
- Node.js 클라이언트: INSERT 쿼리에 대한 keep-alive 동작 방식을 수정했습니다.
- Metabase: IPv4/IPv6 컬럼 직렬화 방식을 수정했습니다.

## 2023년 9월 28일 \{#september-28-2023\}

이번 릴리스에서는 Kafka, Confluent Cloud 및 Amazon MSK용 ClickPipes와 Kafka Connect ClickHouse Sink가 정식 출시되며, IAM 역할을 통해 Amazon S3에 대한 액세스를 보호하기 위한 셀프 서비스 방식의 워크플로와 AI 기반 쿼리 추천 기능(프라이빗 프리뷰)이 추가되었습니다.

### Console 변경 사항 \{#console-changes-11\}

- IAM 역할을 사용해 [Amazon S3 액세스를 보호](/cloud/data-sources/secure-s3)할 수 있는 셀프서비스 워크플로우를 추가했습니다.
- 비공개 프리뷰에서 AI 기반 쿼리 제안 기능을 도입했습니다 (체험하려면 [ClickHouse Cloud 지원팀에 문의](https://console.clickhouse.cloud/support)하십시오).

### 통합 변경 사항 \{#integrations-changes-11\}

- Kafka, Confluent Cloud, Amazon MSK용 턴키 데이터 수집 서비스인 ClickPipes의 정식 출시에 대해 발표했습니다([릴리스 블로그](https://clickhouse.com/blog/clickpipes-is-generally-available) 참조).
- Kafka Connect ClickHouse Sink가 정식으로 사용 가능해졌습니다.
  - `clickhouse.settings` 속성을 사용한 사용자 정의 ClickHouse 설정 지원을 확장했습니다.
  - 동적 필드를 고려하도록 중복 제거 동작을 개선했습니다.
  - ClickHouse에서 테이블 변경 사항을 다시 가져오기 위한 `tableRefreshInterval` 지원을 추가했습니다.
- [PowerBI](/integrations/powerbi)와 ClickHouse 데이터 타입 간의 SSL 연결 문제와 타입 매핑 문제를 수정했습니다.

## 2023년 9월 7일 \{#september-7-2023\}

이번 릴리스에는 PowerBI Desktop 공식 커넥터의 베타 버전 출시, 인도 지역의 신용카드 결제 처리 방식 개선, 그리고 지원되는 각 언어 클라이언트 전반에 걸친 여러 가지 개선 사항이 포함됩니다.

### Console 변경 사항 \{#console-changes-12\}

- 인도의 결제 처리를 지원하기 위해 잔여 크레딧 표시 및 결제 재시도 기능을 추가했습니다

### 통합 변경 사항 \{#integrations-changes-12\}

- Kafka Connector: ClickHouse 설정 구성 지원 추가, `error.tolerance` 구성 옵션 추가
- Power BI Desktop: 공식 커넡터 베타 버전 출시
- Grafana: Point geo 타입 지원 추가, Data Analyst 대시보드의 패널 문제 수정, `timeInterval` 매크로 수정
- Python client: Pandas 2.1.0과 호환, Python 3.7 지원 중단, 널 허용(Nullable) JSON 타입 지원 추가
- Node.js client: `default_format` 설정 지원 추가
- Golang client: `bool` 타입 처리 수정, 문자열 제한 제거

## Aug 24, 2023 \{#aug-24-2023\}

이번 릴리스에서는 ClickHouse 데이터베이스에 MySQL 인터페이스 지원을 추가하고, 새로운 공식 PowerBI 커넥터를 도입하며, Cloud 콘솔에 새로운 「Running Queries」 뷰를 추가하고, ClickHouse 버전을 23.7로 업데이트합니다.

### 일반 업데이트 \{#general-updates-2\}

- [MySQL wire protocol](/interfaces/mysql)에 대한 지원이 추가되어, (다른 활용 사례 외에도) 많은 기존 BI 도구와의 호환성을 제공합니다. 이 기능을 조직에서 사용하려면 지원 팀에 문의하십시오.
- 새로운 공식 Power BI 커넥터를 추가했습니다.

### Console 변경 사항 \{#console-changes-13\}

- SQL Console에 「Running Queries」 VIEW 지원을 추가했습니다.

### ClickHouse 23.7 버전 업그레이드 \{#clickhouse-237-version-upgrade\}

- Azure Table 함수 지원을 추가하고, geo 데이터 타입을 프로덕션 환경에서 사용 가능한 수준으로 승격했으며, 조인 성능을 개선했습니다. 자세한 내용은 23.5 릴리스 [블로그](https://clickhouse.com/blog/clickhouse-release-23-05)를 참고하십시오.
- MongoDB 통합 지원을 6.0 버전까지 확장했습니다. 자세한 내용은 23.6 릴리스 [블로그](https://clickhouse.com/blog/clickhouse-release-23-06)를 참고하십시오.
- Parquet 형식으로의 쓰기 성능을 6배 향상하고, PRQL 쿼리 언어 지원을 추가했으며, SQL 호환성을 개선했습니다. 자세한 내용은 23.7 릴리스 [발표 자료](https://presentations.clickhouse.com/release_23.7/)를 참고하십시오.
- 수십 가지의 새로운 기능, 성능 개선, 버그 수정이 포함되었습니다. 23.5, 23.6, 23.7에 대한 자세한 내용은 [변경 로그](/whats-new/changelog)를 참고하십시오.

### 통합 기능 변경 사항 \{#integrations-changes-13\}

- Kafka Connector: Avro Date 및 Time 타입 지원 추가
- JavaScript 클라이언트: 웹 기반 환경용 안정 버전 릴리스
- Grafana: 필터 로직과 데이터베이스 이름 처리 개선, 초 단위 미만 정밀도의 TimeInteval 지원 추가
- Golang 클라이언트: 배치 및 비동기 데이터 로딩 관련 여러 문제 수정
- Metabase: v0.47 지원, 연결 가장(impersonation) 기능 추가, 데이터 타입 매핑 문제 수정

## 2023년 7월 27일 \{#july-27-2023\}

이번 릴리스에서는 Kafka용 ClickPipes의 비공개 프리뷰, 새로운 데이터 로딩 방식, 그리고 Cloud 콘솔을 사용하여 URL을 통해 파일을 로드하는 기능을 제공합니다.

### 통합 기능 변경 사항 \{#integrations-changes-14\}

- Kafka용 [ClickPipes](https://clickhouse.com/cloud/clickpipes) 비공개 프리뷰를 도입했습니다. 이는 Kafka 및 Confluent Cloud에서 방대한 양의 데이터를 수집하는 작업을 몇 번의 클릭만으로 수행할 수 있게 해 주는 클라우드 네이티브 통합 엔진입니다. 대기 목록은 [여기](https://clickhouse.com/cloud/clickpipes#joinwaitlist)에서 신청할 수 있습니다.
- JavaScript 클라이언트: 웹 환경(브라우저, Cloudflare Workers) 지원을 추가했습니다. 커뮤니티가 커스텀 환경용 커넥터를 생성할 수 있도록 코드를 리팩터링했습니다.
- Kafka Connector: Kafka의 Timestamp 및 Time 타입에 대한 인라인 스키마 지원을 추가했습니다.
- Python 클라이언트: insert 압축 및 LowCardinality 읽기 관련 문제를 수정했습니다.

### 콘솔 변경 사항 \{#console-changes-14\}

- 더 많은 테이블 생성 설정 옵션을 제공하는 새로운 데이터 로드 환경을 추가했습니다.
- Cloud 콘솔에서 URL을 통해 파일을 로드할 수 있도록 했습니다.
- 다른 조직에 가입하고 대기 중인 모든 초대를 확인할 수 있는 추가 옵션을 제공하여 초대 프로세스를 개선했습니다.

## 2023년 7월 14일 \{#july-14-2023\}

이번 릴리스에서는 Dedicated Services를 프로비저닝할 수 있는 기능, 호주에 새 AWS 리전, 디스크에 저장된 데이터를 암호화하기 위한 사용자 소유 키 사용 기능이 제공됩니다.

### 일반 업데이트 \{#general-updates-3\}

- 새로운 AWS 오스트레일리아 리전: 시드니 (ap-southeast-2)
- 지연 시간에 민감한 고부하 워크로드를 위한 전용 티어 서비스(설정을 위해 [support](https://console.clickhouse.cloud/support)에 문의하십시오)
- 디스크에 저장된 데이터 암호화를 위한 BYOK(Bring Your Own Key) 지원(설정을 위해 [support](https://console.clickhouse.cloud/support)에 문의하십시오)

### Console 변경 사항 \{#console-changes-15\}

- 비동기 insert 작업을 위한 관측성 메트릭 대시보드를 개선했습니다
- 지원 시스템 연동을 위한 챗봇 동작을 개선했습니다

### 통합 관련 변경 사항 \{#integrations-changes-15\}

- NodeJS 클라이언트: 소켓 타임아웃으로 인한 연결 실패 버그를 수정했습니다.
- Python 클라이언트: 삽입 쿼리에 QuerySummary를 추가하고, 데이터베이스 이름에 특수 문자를 지원하도록 했습니다.
- Metabase: JDBC 드라이버 버전을 업데이트하고 DateTime64 지원을 추가했으며 성능을 개선했습니다.

### 핵심 데이터베이스 변경 사항 \{#core-database-changes\}

- [Query cache](/operations/query-cache)는 ClickHouse Cloud에서 활성화할 수 있습니다. 활성화되면 성공적으로 실행된 쿼리는 기본적으로 1분 동안 캐시되며 이후 동일한 쿼리는 캐시된 결과를 사용합니다.

## 2023년 6월 20일 \{#june-20-2023\}

이번 릴리스에서는 GCP에서 ClickHouse Cloud가 정식으로 제공되었으며, Cloud API를 위한 Terraform Provider가 추가되었고, ClickHouse 버전이 23.4로 업데이트되었습니다.

### 일반 업데이트 \{#general-updates-4\}

- GCP에서 ClickHouse Cloud가 이제 정식 출시(GA)되었으며, GCP Marketplace 연동, Private Service Connect 지원, 자동 백업 기능을 제공합니다(자세한 내용은 [블로그](https://clickhouse.com/blog/clickhouse-cloud-on-google-cloud-platform-gcp-is-generally-available) 및 [보도 자료](https://clickhouse.com/blog/clickhouse-cloud-expands-choice-with-launch-on-google-cloud-platform)를 참고하십시오)
- Cloud API용 [Terraform provider](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)가 이제 제공됩니다

### Console 변경 사항 \{#console-changes-16\}

- 서비스용 통합 설정 페이지를 새로 추가했습니다
- 스토리지와 컴퓨트 리소스의 계량 정확도를 조정했습니다

### 통합 변경 사항 \{#integrations-changes-16\}

- Python 클라이언트: INSERT 성능이 향상되었으며, 멀티프로세싱을 지원하기 위해 내부 종속성이 리팩터링되었습니다.
- Kafka Connector: Confluent Cloud에 업로드하여 설치할 수 있으며, 일시적인 연결 문제에 대한 재시도 기능이 추가되었고 잘못된 커넥터 상태가 자동으로 초기화되도록 개선되었습니다.

### ClickHouse 23.4 버전 업그레이드 \{#clickhouse-234-version-upgrade\}

- 병렬 레플리카에서 JOIN을 지원하도록 추가되었습니다 (설정을 위해 [support](https://console.clickhouse.cloud/support)에 문의하십시오)
- 경량한 삭제(lightweight delete) 성능이 개선되었습니다
- 대량 INSERT 처리 시 캐싱이 개선되었습니다

### 관리 변경 사항 \{#administration-changes-1\}

- 로컬 딕셔너리 생성 기능을 "default"가 아닌 사용자에게도 확장했습니다

## 2023년 5월 30일 \{#may-30-2023\}

이번 릴리스에는 Control Plane 작업을 위한 ClickHouse Cloud Programmatic API의 공개 릴리스(자세한 내용은 [블로그](https://clickhouse.com/blog/using-the-new-clickhouse-cloud-api-to-automate-deployments)를 참조), IAM 역할을 사용한 S3 액세스, 추가적인 확장 옵션이 포함됩니다.

### 일반 변경 사항 \{#general-changes-2\}

- ClickHouse Cloud에 대한 API 지원. 새로운 Cloud API를 사용하면 기존 CI/CD 파이프라인에 서비스 관리를 원활하게 통합하여 서비스를 프로그래밍 방식으로 관리할 수 있습니다.
- IAM 역할을 사용한 S3 액세스. 이제 IAM 역할을 활용하여 프라이빗 Amazon Simple Storage Service(S3) 버킷에 안전하게 액세스할 수 있습니다(설정을 위해 지원팀에 문의하십시오).

### 스케일링 변경 사항 \{#scaling-changes\}

- [수평 스케일링](/manage/scaling#manual-horizontal-scaling). 더 많은 병렬 처리가 필요한 워크로드를 이제 최대 10개의 레플리카로 구성할 수 있습니다(구성을 위해 지원팀에 문의하십시오)
- [CPU 기반 오토스케일링](/manage/scaling). CPU 바운드 워크로드는 이제 오토스케일링 정책을 위한 추가 트리거를 사용할 수 있습니다

### 콘솔 변경 사항 \{#console-changes-17\}

- Dev 서비스를 Production 서비스로 마이그레이션(이 기능 활성화를 위해 지원팀에 문의하십시오)
- 인스턴스 생성 과정에서 스케일링 구성 제어 기능 추가
- 기본 비밀번호가 메모리에 없을 때 연결 문자열이 올바르게 설정되도록 수정

### 통합 변경 사항 \{#integrations-changes-17\}

- Golang 클라이언트: 네이티브 프로토콜에서 연결이 불균형하게 생성되던 문제를 수정하고, 네이티브 프로토콜에서 사용자 지정 설정 지원을 추가했습니다.
- Node.js 클라이언트: Node.js v14 지원을 중단하고 v20 지원을 추가했습니다.
- Kafka 커넥터: LowCardinality 타입 지원을 추가했습니다.
- Metabase: 시간 범위 기준 그룹화 문제를 수정하고, 기본 제공 Metabase 질문에서 정수 지원 문제를 수정했습니다.

### 성능 및 안정성 \{#performance-and-reliability\}

- 쓰기 집약적 워크로드의 효율성과 성능 향상
- 백업 속도와 효율성을 높이기 위한 증분 백업 전략 도입

## 2023년 5월 11일 \{#may-11-2023\}

이번 릴리스에서는 GCP에서 ClickHouse Cloud의 퍼블릭 베타를 제공하고
(자세한 내용은 [블로그](https://clickhouse.com/blog/clickhouse-cloud-on-gcp-available-in-public-beta)를 참조하십시오), 
관리자 권한을 확장하여 쿼리 종료 권한을 부여할 수 있게 하며,
Cloud 콘솔에서 MFA 사용자 상태에 대한 가시성을 강화합니다.

:::note 업데이트
GCP에서 ClickHouse Cloud가 이제 GA로 제공됩니다. 위의 6월 20일 항목을 참조하십시오. 
:::

### GCP에서 ClickHouse Cloud를 이제 퍼블릭 베타로 사용할 수 있습니다 \{#clickhouse-cloud-on-gcp-is-now-available-in-public-beta-now-ga-see-june-20th-entry-above\}

:::note
GCP의 ClickHouse Cloud는 이제 GA입니다. 위의 [6월 20일](#june-20-2023) 항목을 참고하십시오.
:::

- Google Compute와 Google Cloud Storage 위에서 실행되는, 스토리지와 컴퓨트가 분리된 완전 관리형 ClickHouse 서비스를 출시합니다.
- Iowa (us-central1), Netherlands (europe-west4), Singapore (asia-southeast1) 리전에서 사용할 수 있습니다.
- 초기 3개 리전 모두에서 Development 및 Production 서비스를 지원합니다.
- 기본적으로 강력한 보안을 제공합니다: 전 구간 암호화, 저장 데이터 암호화, IP 허용 목록(IP Allow Lists)

### 통합 변경 사항 \{#integrations-changes-18\}

- Golang 클라이언트: 프록시 환경 변수 지원 추가
- Grafana: Grafana 데이터 소스 설정에서 ClickHouse 사용자 지정 설정과 프록시 환경 변수를 지정할 수 있도록 기능 추가
- Kafka 커넥터: 비어 있는 레코드 처리 방식 개선

### 콘솔 변경 사항 \{#console-changes-18\}

- 사용자 목록에 다중 요소 인증(MFA) 사용 여부를 나타내는 표시를 추가했습니다

### 성능과 안정성 \{#performance-and-reliability-1\}

- 관리자가 쿼리 종료 권한을 보다 세밀하게 제어할 수 있도록 했습니다

## 2023년 5월 4일 \{#may-4-2023\}

이번 릴리스에서는 새로운 히트맵 차트 유형이 추가되고, 청구 사용량 페이지가 개선되었으며, 서비스 시작 시간이 단축되었습니다.

### 콘솔 변경사항 \{#console-changes-19\}

- SQL 콘솔에 히트맵 차트 유형을 추가했습니다
- 각 과금 기준별로 소비된 크레딧을 표시하도록 과금 사용량 페이지를 개선했습니다

### 통합 변경 사항 \{#integrations-changes-19\}

- Kafka 커넥터: 일시적인 연결 오류에 대한 재시도 메커니즘을 도입했습니다
- Python 클라이언트: HTTP 연결이 무기한 재사용되지 않도록 `max_connection_age` 설정을 추가했습니다. 이는 특정 로드 밸런싱 문제를 완화하는 데 도움이 됩니다
- Node.js 클라이언트: Node.js v20 지원을 추가했습니다
- Java 클라이언트: 클라이언트 인증서 인증 지원을 개선하고, 중첩된 Tuple/Map/Nested 타입에 대한 지원을 추가했습니다

### 성능 및 안정성 \{#performance-and-reliability-2\}

- 많은 수의 파트가 존재하는 환경에서 서비스 시작 시간을 개선했습니다
- SQL 콘솔에서 장시간 실행되는 쿼리의 취소 로직을 최적화했습니다

### 버그 수정 \{#bug-fixes\}

- 'Cell Towers' 샘플 데이터셋 가져오기가 실패하던 버그를 수정했습니다

## 2023년 4월 20일 \{#april-20-2023\}

이번 릴리스에서는 ClickHouse 버전을 23.3으로 업데이트하고, 콜드 읽기(cold reads) 성능을 크게 향상했으며, 지원팀과의 실시간 채팅 기능을 도입했습니다.

### 콘솔 변경 사항 \{#console-changes-20\}

- 지원팀과 실시간 채팅을 할 수 있는 옵션을 추가했습니다

### 통합 변경 사항 \{#integrations-changes-20\}

- Kafka 커넥터: 널 허용(Nullable) 타입 지원을 추가했습니다
- Golang 클라이언트: 외부 테이블(external table) 및 boolean·pointer 타입 파라미터 바인딩 지원을 추가했습니다

### 구성 변경 사항 \{#configuration-changes\}

- `max_table_size_to_drop` 및 `max_partition_size_to_drop` 설정을 재정의하여 대용량 테이블을 삭제할 수 있도록 합니다

### 성능 및 안정성 \{#performance-and-reliability-3\}

- `allow_prefetched_read_pool_for_remote_filesystem` 설정으로 S3 프리패칭을 사용해 콜드 읽기 속도를 향상합니다

### ClickHouse 23.3 버전 업그레이드 \{#clickhouse-233-version-upgrade\}

- 경량한 삭제가 프로덕션 환경에서 사용 가능한 상태입니다. 자세한 내용은 23.3 릴리스 [블로그](https://clickhouse.com/blog/clickhouse-release-23-03)를 참조하십시오.
- 다단계 PREWHERE 지원이 추가되었습니다. 자세한 내용은 23.2 릴리스 [블로그](https://clickhouse.com/blog/clickhouse-release-23-03)를 참조하십시오.
- 수십 개의 신규 기능, 성능 개선 및 버그 수정이 포함되었습니다. 23.3 및 23.2에 대한 자세한 변경 사항은 [변경 로그](/whats-new/changelog/index.md)를 참조하십시오.

## 2023년 4월 6일 \{#april-6-2023\}

이번 릴리스에는 Cloud 엔드포인트를 조회하기 위한 API, 최소 유휴 시간 제한(minimum idle timeout)을 제어하기 위한 고급 스케일링 기능, 그리고 Python 클라이언트 쿼리 메서드에서 외부 데이터(external data)를 지원하는 기능이 포함됩니다.

### API 변경 사항 \{#api-changes\}

* [Cloud Endpoints API](//cloud/get-started/query-endpoints.md)를 통해 ClickHouse Cloud 엔드포인트를 프로그램으로 쿼리할 수 있도록 기능이 추가되었습니다.

### Console 변경 사항 \{#console-changes-21\}

- 고급 스케일링 설정에 「minimum idle timeout」 설정을 추가했습니다
- 데이터 로딩 모달의 스키마 추론(schema inference)에 best-effort 방식의 datetime 감지 기능을 추가했습니다

### 통합 변경 사항 \{#integrations-changes-21\}

- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md): 여러 스키마 지원 추가
- [Go client](/integrations/language-clients/go/index.md): TLS 연결에 대한 유휴 연결 liveness 검사 수정
- [Python client](/integrations/language-clients/python/index.md)
  - 쿼리 메서드의 외부 데이터 지원 추가
  - 쿼리 결과에 대한 시간대(timezone) 지원 추가
  - `no_proxy`/`NO_PROXY` 환경 변수 지원 추가
  - `Nullable` 타입에 대한 `NULL` 값 서버 측 파라미터 바인딩 문제 수정

### 버그 수정 \{#bug-fixes-1\}

* SQL 콘솔에서 `INSERT INTO ... SELECT ...`를 실행할 때 SELECT 쿼리와 동일한 행 제한이 잘못 적용되던 문제를 수정했습니다

## 2023년 3월 23일 \{#march-23-2023\}

이번 릴리스에서는 데이터베이스 비밀번호 복잡도 규칙, 대용량 백업 복원 속도의 대폭 향상, 그리고 Grafana Trace View에서 트레이스를 표시할 수 있는 지원을 제공합니다.

### 보안 및 안정성 \{#security-and-reliability\}

- 핵심 데이터베이스 엔드포인트에서 이제 비밀번호 복잡성 규칙이 강제 적용됩니다
- 대규모 백업의 복구 시간이 단축되었습니다

### Console changes \{#console-changes-22\}

- 온보딩 워크플로를 간소화하여 새로운 기본 설정과 더 간결한 화면을 도입했습니다
- 회원 가입 및 로그인 처리 지연 시간을 줄였습니다

### 통합 변경 사항 \{#integrations-changes-22\}

- Grafana:
  - Trace View에서 ClickHouse에 저장된 트레이스 데이터를 표시하는 기능이 추가되었습니다.
  - 시간 범위 필터가 개선되었고, 테이블 이름에서 특수 문자 지원이 추가되었습니다.
- Superset: 네이티브 ClickHouse 지원이 추가되었습니다.
- Kafka Connect Sink: 자동 날짜 변환 및 Null 컬럼 처리 기능이 추가되었습니다.
- Metabase: v0.46과의 호환성이 구현되었습니다.
- Python client: 임시 테이블에 대한 insert 작업이 수정되었고 Pandas Null 지원이 추가되었습니다.
- Golang client: 타임존이 포함된 Date 타입이 정규화되었습니다.
- Java client
  - SQL parser에 compression, infile, outfile 키워드 지원이 추가되었습니다.
  - 자격 증명 오버로드가 추가되었습니다.
  - `ON CLUSTER`를 사용하는 배치 지원이 수정되었습니다.
- Node.js client
  - JSONStrings, JSONCompact, JSONCompactStrings, JSONColumnsWithMetadata 형식 지원이 추가되었습니다.
  - 이제 모든 주요 클라이언트 메서드에 `query_id`를 제공할 수 있습니다.

### 버그 수정 \{#bug-fixes-2\}

- 신규 서비스의 초기 프로비저닝 및 시작이 지연되던 버그를 수정했습니다
- 잘못된 캐시 구성으로 인해 쿼리 성능이 저하되던 버그를 수정했습니다

## 2023년 3월 9일 \{#march-9-2023\}

이번 릴리스에서는 관측성 대시보드를 개선하고, 대용량 백업 생성에 소요되는 시간을 최적화했으며, 대용량 테이블과 파티션을 삭제하는 데 필요한 구성을 추가했습니다.

### 콘솔 변경 사항 \{#console-changes-23\}

- 고급 관측성 대시보드(미리보기) 추가
- 관측성 대시보드에 메모리 할당 차트 추가
- SQL Console 스프레드시트 뷰의 간격 및 줄바꿈 처리 개선

### 안정성 및 성능 \{#reliability-and-performance\}

- 데이터가 변경된 경우에만 백업이 실행되도록 백업 일정 최적화
- 대용량 백업 완료에 걸리는 시간 단축

### 구성 변경 사항 \{#configuration-changes-1\}

- 쿼리 또는 연결 수준에서 `max_table_size_to_drop` 및 `max_partition_size_to_drop` 설정을 재정의하여 테이블 및 파티션 삭제 제한을 늘릴 수 있는 기능이 추가되었습니다.
- 소스 IP를 기준으로 QUOTA 및 액세스 제어를 적용할 수 있도록 쿼리 로그에 소스 IP가 추가되었습니다.

### Integrations \{#integrations\}

- [Python client](/integrations/language-clients/python/index.md): Pandas 지원이 개선되고 시간대 관련 문제가 수정되었습니다
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md): Metabase 0.46.x와의 호환성과 SimpleAggregateFunction 지원이 추가되었습니다
- [Kafka-Connect](/integrations/data-ingestion/kafka/index.md): 암시적 날짜 변환과 null 컬럼 처리 방식이 개선되었습니다
- [Java Client](https://github.com/ClickHouse/clickhouse-java): 중첩 구조를 Java 맵으로 변환할 수 있습니다

##  February 23, 2023 \{#february-23-2023\}

이번 릴리스에서는 ClickHouse 23.1 코어 릴리스의 일부 기능을 활성화하고, Amazon Managed Streaming for Apache Kafka (MSK)와의 상호 운용성을 제공하며, 활동 로그에서 고급 확장 및 유휴 상태 조정 기능을 제공합니다.

### ClickHouse 23.1 버전 업그레이드 \{#clickhouse-231-version-upgrade\}

ClickHouse 23.1의 일부 기능이 추가로 지원됩니다. 예를 들면 다음과 같습니다:

- Map(맵) 타입과 함께 사용하는 ARRAY JOIN
- SQL 표준 16진수 및 2진 리터럴
- `age()`, `quantileInterpolatedWeighted()`, `quantilesInterpolatedWeighted()`를 포함한 새로운 함수
- 인수를 지정하지 않은 `generateRandom`에서 삽입 테이블의 구조를 사용할 수 있는 기능
- 이전 이름을 재사용할 수 있도록 개선된 데이터베이스 생성 및 이름 변경 로직
- 더 자세한 내용은 23.1 릴리스 [웨비나 슬라이드](https://presentations.clickhouse.com/release_23.1/#cover)와 [23.1 릴리스 변경 로그](/whats-new/cloud#clickhouse-231-version-upgrade)를 참고하십시오

### 통합 기능 변경 사항 \{#integrations-changes-23\}

- [Kafka-Connect](/integrations/data-ingestion/kafka/index.md): Amazon MSK 지원 추가
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md): 첫 안정 릴리스 1.0.0
  - 커넥터가 [Metabase Cloud](https://www.metabase.com/start/)에서 사용 가능함
  - 사용 가능한 모든 데이터베이스를 탐색할 수 있는 기능 추가
  - AggregationFunction 타입 데이터베이스 동기화 문제 수정
- [DBT-clickhouse](/integrations/data-ingestion/etl-tools/dbt/index.md): 최신 DBT 버전 v1.4.1 지원 추가
- [Python client](/integrations/language-clients/python/index.md): 프록시 및 SSH 터널링 지원 개선, Pandas DataFrame을 위한 여러 수정 및 성능 최적화 추가
- [Nodejs client](/integrations/language-clients/js.md): `system.query_log`에서 쿼리 메트릭을 조회하는 데 사용할 수 있도록 쿼리 결과에 `query_id`를 첨부하는 기능 릴리스
- [Golang client](/integrations/language-clients/go/index.md): ClickHouse Cloud와의 네트워크 연결 최적화

### 콘솔 변경 사항 \{#console-changes-24\}

- 활동 로그에 고급 스케일링 및 유휴 상태 설정 조정 내역을 추가했습니다
- 비밀번호 재설정 이메일에 User-Agent 및 IP 정보를 추가했습니다
- Google OAuth 회원가입 흐름을 개선했습니다

### 안정성과 성능 \{#reliability-and-performance-1\}

- 대규모 서비스의 유휴 상태 재개 시간을 단축했습니다
- 테이블과 파티션 수가 많은 서비스의 읽기 지연 시간을 개선했습니다

### 버그 수정 \{#bug-fixes-3\}

- 서비스 비밀번호를 재설정할 때 비밀번호 정책을 준수하지 않던 문제를 수정했습니다
- 조직 초대 이메일 검증에서 대소문자를 구분하지 않도록 수정했습니다

## 2023년 2월 2일 \{#february-2-2023\}

이번 릴리스에는 Metabase 정식 지원 통합, Java 클라이언트 및 JDBC 드라이버의 주요 릴리스, 그리고 SQL 콘솔에서의 뷰와 materialized view 지원이 포함됩니다.

### 통합 변경 사항 \{#integrations-changes-24\}

- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md) 플러그인: ClickHouse에서 공식적으로 유지 관리하는 솔루션이 되었습니다
- [dbt](/integrations/data-ingestion/etl-tools/dbt/index.md) 플러그인: [여러 스레드](https://github.com/ClickHouse/dbt-clickhouse/blob/main/CHANGELOG.md) 지원이 추가되었습니다
- [Grafana](/integrations/data-visualization/grafana/index.md) 플러그인: 연결 오류 처리가 개선되었습니다
- [Python](/integrations/language-clients/python/index.md) 클라이언트: insert 연산에 대한 [스트리밍 지원](/integrations/language-clients/python/advanced-querying.md#streaming-queries)이 추가되었습니다
- [Go](/integrations/language-clients/go/index.md) 클라이언트: [버그 수정](https://github.com/ClickHouse/clickhouse-go/blob/main/CHANGELOG.md) – 취소된 연결을 종료하고, 연결 오류 처리가 개선되었습니다
- [JS](/integrations/language-clients/js.md) 클라이언트: [exec/insert의 비호환적인 변경 사항](https://github.com/ClickHouse/clickhouse-js/releases/tag/0.0.12); 반환 타입에 query_id를 노출합니다
- [Java](https://github.com/ClickHouse/clickhouse-java#readme) 클라이언트 / JDBC 드라이버 메이저 릴리스
  - [비호환적인 변경 사항](https://github.com/ClickHouse/clickhouse-java/releases): 사용 중단(deprecated)된 메서드, 클래스, 패키지가 제거되었습니다
  - R2DBC 드라이버와 파일 insert 지원이 추가되었습니다

### 콘솔 변경 사항 \{#console-changes-25\}

- SQL 콘솔에서 뷰와 materialized view 지원을 추가했습니다

### 성능 및 안정성 \{#performance-and-reliability-4\}

- 중지되었거나 유휴 상태인 인스턴스의 비밀번호 재설정 속도 향상
- 더 정확한 활동 추적을 통해 인스턴스 축소(Scale-down) 동작 개선
- SQL 콘솔 CSV 내보내기가 잘리던 문제 수정
- 샘플 데이터 업로드가 간헐적으로 실패하던 문제 수정

## 2023년 1월 12일 \{#january-12-2023\}

이번 릴리스에서는 ClickHouse 버전을 22.12로 업데이트하고, 여러 새로운 소스에 대해 dictionaries 기능을 활성화하며, 쿼리 성능을 개선합니다.

### 일반 변경 사항 \{#general-changes-3\}

- 외부 ClickHouse, Cassandra, MongoDB, MySQL, PostgreSQL, Redis 등을 포함한 추가 데이터 소스에 대해 사전(Dictionary) 기능을 활성화했습니다.

### ClickHouse 22.12 버전 업그레이드 \{#clickhouse-2212-version-upgrade\}

- Grace Hash Join을 포함하도록 JOIN 지원이 확장되었습니다
- 파일 읽기를 위한 Binary JSON(BSON) 지원이 추가되었습니다
- GROUP BY ALL 표준 SQL 구문에 대한 지원이 추가되었습니다
- 고정 소수점 정밀도의 10진수 연산을 위한 새로운 수학 함수가 추가되었습니다
- 전체 변경 사항 목록은 [22.12 릴리스 블로그](https://clickhouse.com/blog/clickhouse-release-22-12)와 [상세 22.12 변경 로그](/whats-new/cloud#clickhouse-2212-version-upgrade)에서 확인하십시오

### Console 변경 사항 \{#console-changes-26\}

- SQL Console의 자동 완성 기능을 향상했습니다.
- 기본 리전이 이제 대륙 단위의 근접성을 고려합니다.
- 결제 사용량 페이지를 개선하여 결제 단위와 웹사이트 단위를 모두 표시합니다.

### 통합 변경 사항 \{#integrations-changes-25\}

- DBT 릴리스 [v1.3.2](https://github.com/ClickHouse/dbt-clickhouse/blob/main/CHANGELOG.md#release-132-2022-12-23)
  - delete+insert 증분 전략에 대한 실험적 지원 추가
  - 새로운 s3source 매크로 추가
- Python 클라이언트 [v0.4.8](https://github.com/ClickHouse/clickhouse-connect/blob/main/CHANGELOG.md#048-2023-01-02)
  - 파일 insert 기능 지원
  - 서버 측 쿼리 [파라미터 바인딩](/interfaces/cli.md/#cli-queries-with-parameters)
- Go 클라이언트 [v2.5.0](https://github.com/ClickHouse/clickhouse-go/releases/tag/v2.5.0)
  - 압축 시 메모리 사용량 감소
  - 서버 측 쿼리 [파라미터 바인딩](/interfaces/cli.md/#cli-queries-with-parameters)

### 안정성과 성능 \{#reliability-and-performance-2\}

- 오브젝트 스토리지에서 다수의 작은 파일을 가져오는 쿼리의 읽기 성능을 개선했습니다
- 새로 시작되는 서비스의 경우, 서비스가 처음 기동될 당시의 버전으로 [compatibility](/operations/settings/settings#compatibility) 설정을 지정하도록 했습니다

### 버그 수정 \{#bug-fixes-4\}

리소스 예약을 위해 Advanced Scaling 슬라이더를 사용하면 이제 즉시 반영됩니다.

## 2022년 12월 20일 \{#december-20-2022\}

이 릴리스에서는 관리자를 위한 SQL 콘솔 원활 로그인 기능, 콜드 읽기(cold read)에 대한 읽기 성능 개선, 그리고 ClickHouse Cloud용 Metabase 커넥터 개선을 제공합니다.

### Console changes \{#console-changes-27\}

- 관리자 사용자가 별도 과정 없이 SQL 콘솔에 접근할 수 있도록 했습니다
- 새로 초대한 사용자의 기본 역할을 "Administrator"로 변경했습니다
- 온보딩 설문조사를 추가했습니다

### 안정성과 성능 \{#reliability-and-performance-3\}

- 네트워크 장애 발생 시 복구할 수 있도록 실행 시간이 긴 insert 쿼리에 대한 재시도 로직을 추가했습니다
- 콜드 읽기(cold reads)의 성능을 개선했습니다

### 통합 변경 사항 \{#integrations-changes-26\}

- [Metabase plugin](/integrations/data-visualization/metabase-and-clickhouse.md)에 오랫동안 기다리던 v0.9.1 대규모 업데이트가 적용되었습니다. 이제 최신 Metabase 버전과 호환되며, ClickHouse Cloud 환경에서 철저하게 테스트되었습니다.

## December 6, 2022 - 일반 공급 \{#december-6-2022---general-availability\}

ClickHouse Cloud는 이제 프로덕션 환경에서 사용할 수 있도록 준비되었으며, SOC2 Type II 규정 준수, 프로덕션 워크로드를 위한 가용성 SLA, 공개 상태 페이지를 제공합니다. 이번 릴리스에는 AWS Marketplace 연동, ClickHouse 사용자용 데이터 탐색 워크벤치인 SQL console, ClickHouse Cloud에서 자기 주도 학습을 제공하는 ClickHouse Academy와 같은 주요 신규 기능이 포함됩니다. 자세한 내용은 이 [블로그](https://clickhouse.com/blog/clickhouse-cloud-generally-available)를 참조하십시오.

### 프로덕션 환경에 즉시 사용 가능 \{#production-ready\}

- SOC2 Type II 규정 준수(자세한 내용은 [블로그](https://clickhouse.com/blog/clickhouse-cloud-is-now-soc-2-type-ii-compliant) 및 [Trust Center](https://trust.clickhouse.com/)에서 확인할 수 있습니다)
- ClickHouse Cloud용 공개 [Status Page](https://status.clickhouse.com/)
- 프로덕션 워크로드를 위한 가동 시간 SLA 제공
- [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-jettukeanwrfc)에서 이용 가능

### 주요 신규 기능 \{#major-new-capabilities\}

- ClickHouse 사용자를 위한 데이터 탐색 워크벤치인 SQL 콘솔을 도입했습니다
- ClickHouse Cloud에서 자기 주도 학습을 제공하는 [ClickHouse Academy](https://learn.clickhouse.com/visitor_class_catalog)를 출시했습니다

### 요금 및 계량 변경 사항 \{#pricing-and-metering-changes\}

- 체험 기간을 30일로 연장했습니다.
- 초기 프로젝트 및 개발/스테이징 환경에 적합한, 고정 용량에 월 비용이 낮은 Development Services를 도입했습니다.
- ClickHouse Cloud의 운영 및 확장 방식이 지속적으로 개선됨에 따라, Production Services에 대한 새로운 인하 요금을 도입했습니다.
- 컴퓨트 계량 시 세분성과 정밀도를 개선했습니다.

### 통합 기능 변경 사항 \{#integrations-changes-27\}

- ClickHouse Postgres / MySQL 통합 엔진 지원을 추가했습니다
- SQL 사용자 정의 함수(UDF) 지원을 추가했습니다
- Kafka Connect 싱크를 베타(Beta) 단계로 승격했습니다
- 버전, 업데이트 상태 등 다양한 메타데이터를 제공하도록 하여 Integrations UI를 개선했습니다

### 콘솔 변경 사항 \{#console-changes-28\}

- Cloud 콘솔에서 다중 요소 인증(MFA) 지원
- 모바일 기기에서의 Cloud 콘솔 탐색 기능 개선

### 문서 변경 사항 \{#documentation-changes\}

- ClickHouse Cloud 전용 [문서](/cloud/overview) 섹션을 추가했습니다

### 버그 수정 \{#bug-fixes-5\}

- 종속성 처리 과정에서 백업에서의 복원이 항상 성공하지 않던 알려진 문제를 해결했습니다

## 2022년 11월 29일 \{#november-29-2022\}

이번 릴리스에서는 SOC2 Type II 규정 준수를 달성하고 ClickHouse 버전을 22.11로 업데이트하며, 다양한 ClickHouse 클라이언트와 통합을 개선합니다.

### 일반 변경 사항 \{#general-changes-4\}

- SOC2 Type II 규정 준수를 달성했습니다(자세한 내용은 [블로그](https://clickhouse.com/blog/clickhouse-cloud-is-now-soc-2-type-ii-compliant) 및 [Trust Center](https://trust.clickhouse.com)에서 확인할 수 있습니다)

### 콘솔 변경 사항 \{#console-changes-29\}

- 서비스가 자동으로 일시 중지된 상태임을 나타내는 「Idle」 상태 표시기를 추가했습니다

### ClickHouse 22.11 버전 업그레이드 \{#clickhouse-2211-version-upgrade\}

- Hudi 및 DeltaLake 테이블 엔진과 테이블 함수 지원을 추가했습니다
- S3에 대한 재귀 디렉터리 탐색을 개선했습니다
- 복합 시간 간격 구문 지원을 추가했습니다
- INSERT 시 재시도 기능을 통해 삽입 작업의 안정성을 향상했습니다
- 전체 변경 사항 목록은 [자세한 22.11 변경 로그](/whats-new/cloud#clickhouse-2211-version-upgrade)를 참고하십시오

### 통합 \{#integrations-1\}

- Python 클라이언트: v3.11 지원, INSERT 성능 향상
- Go 클라이언트: DateTime 및 Int64 지원 문제 수정
- JS 클라이언트: 양방향 SSL 인증 지원
- dbt-clickhouse: DBT v1.3 지원

### 버그 수정 \{#bug-fixes-6\}

- 업그레이드 후에도 오래된 ClickHouse 버전이 표시되던 버그를 수정했습니다
- "default" 계정의 권한을 변경해도 세션이 더 이상 끊기지 않습니다
- 새로 생성된 비관리자 계정은 기본적으로 system 테이블에 접근할 수 없게 되었습니다

### 이 릴리스의 알려진 문제 \{#known-issues-in-this-release\}

- 의존성 해결 문제로 인해 백업에서 복원이 실패할 수 있습니다

## 2022년 11월 17일 \{#november-17-2022\}

이번 릴리스에서는 로컬 ClickHouse 테이블과 HTTP 소스를 기반으로 한 사전을 지원하고, Mumbai 리전에 대한 지원을 추가하며, Cloud 콘솔의 사용자 경험을 개선합니다.

### 일반 변경 사항 \{#general-changes-5\}

- 로컬 ClickHouse 테이블 및 HTTP 소스를 사용하는 [dictionaries](/sql-reference/statements/create/dictionary)에 대한 지원이 추가되었습니다
- 뭄바이 [리전](/cloud/reference/supported-regions)에 대한 지원이 추가되었습니다

### Console 변경 사항 \{#console-changes-30\}

- 청구서 서식을 개선했습니다
- 결제 수단 등록을 위한 사용자 인터페이스를 간소화했습니다
- 백업에 대해 더 세분화된 활동 로깅을 추가했습니다
- 파일 업로드 중 오류 처리를 개선했습니다

### 버그 수정 \{#bug-fixes-7\}

- 일부 파트에 단일 큰 파일이 포함된 경우 백업이 실패할 수 있던 버그를 수정했습니다
- 액세스 목록 변경이 동시에 적용될 때 백업에서 복원이 실패하던 버그를 수정했습니다

### 알려진 문제 \{#known-issues\}

- 종속성 해결 문제로 인해 백업에서 복원이 작동하지 않을 수 있습니다

## 2022년 11월 3일 \{#november-3-2022\}

이번 릴리스에서는 요금에서 읽기 및 쓰기 단위를 제거하고(자세한 내용은 [가격 페이지](https://clickhouse.com/pricing)를 참고하십시오), ClickHouse 버전을 22.10으로 업데이트하며, self-service 고객을 위한 더 높은 수준의 수직 확장을 지원하고, 더 나은 기본 설정을 통해 안정성을 향상합니다.

### 일반 변경 사항 \{#general-changes-6\}

- 가격 책정 모델에서 읽기/쓰기 단위를 제거했습니다

### 구성 변경 사항 \{#configuration-changes-2\}

- 안정성을 위해 `allow_suspicious_low_cardinality_types`, `allow_suspicious_fixed_string_types`, `allow_suspicious_codecs` 설정(기본값 false)은 더 이상 사용자가 변경할 수 없습니다.

### 콘솔 변경 사항 \{#console-changes-31\}

- 유료 고객이 콘솔에서 수직 확장을 셀프 서비스 방식으로 최대 720GB 메모리까지 수행할 수 있도록 상한을 높였습니다
- 백업 복원 워크플로를 개선하여 IP Access List 규칙과 비밀번호를 설정할 수 있도록 했습니다
- 서비스 생성 대화 상자에 GCP 및 Azure용 대기 목록을 도입했습니다
- 파일 업로드 중 오류 처리를 개선했습니다
- 청구 관리 워크플로를 개선했습니다

### ClickHouse 22.10 버전 업그레이드 \{#clickhouse-2210-version-upgrade\}

- 많은 대용량 파트(최소 10 GiB)가 존재하는 경우 "too many parts" 임계값을 완화하여 오브젝트 스토어에서의 머지 작업을 개선했습니다. 이를 통해 단일 테이블의 단일 파티션에 페타바이트 단위의 데이터를 저장할 수 있습니다.
- 특정 시간 임계값 이후 머지를 수행하도록 하는 `min_age_to_force_merge_seconds` 설정을 통해 머지에 대한 제어 기능을 개선했습니다.
- 설정을 초기화하기 위한 MySQL 호환 구문 `SET setting_name = DEFAULT`를 추가했습니다.
- Morton curve 인코딩, Java 정수 해싱, 난수 생성용 함수를 추가했습니다.
- 전체 변경 사항 목록은 [자세한 22.10 변경 로그](/whats-new/cloud#clickhouse-2210-version-upgrade)를 참고하십시오.

## 2022년 10월 25일 \{#october-25-2022\}

이번 릴리스에서는 소규모 워크로드의 컴퓨트 사용량을 크게 줄이고, 컴퓨트 가격을 인하하며(자세한 내용은 [pricing](https://clickhouse.com/pricing) 페이지 참조), 더 나은 기본값으로 안정성을 개선하고, ClickHouse Cloud 콘솔의 Billing 및 Usage 뷰를 개선했습니다.

### 일반 변경 사항 \{#general-changes-7\}

- 최소 서비스 메모리 할당량을 24G로 줄였습니다
- 서비스 유휴 상태 타임아웃을 30분에서 5분으로 줄였습니다

### Configuration changes \{#configuration-changes-3\}

- `max_parts_in_total`을 100k에서 10k로 줄였습니다. MergeTree 테이블에 대한 `max_parts_in_total` 설정의 기본값이 100,000에서 10,000으로 낮아졌습니다. 이 변경의 이유는 데이터 파트 수가 많을수록 클라우드 환경에서 서비스의 시작 속도가 느려질 가능성이 높다는 점이 관찰되었기 때문입니다. 파트 수가 많은 경우는 보통 파티션 키를 지나치게 세밀하게 선택한 경우를 의미하는데, 이는 흔히 실수로 발생하며 피해야 합니다. 기본값 변경을 통해 이러한 사례를 더 일찍 감지할 수 있게 됩니다.

### Console changes \{#console-changes-32\}

- 체험 사용자를 위해 Billing 뷰에서 크레딧 사용량 세부 정보를 더 자세히 확인할 수 있도록 개선했습니다
- Usage 뷰에서 툴팁과 도움말 텍스트를 개선하고, 요금제 페이지로 연결되는 링크를 추가했습니다
- IP 필터링 옵션을 전환할 때의 작업 흐름을 개선했습니다
- Cloud 콘솔에 이메일 확인 메일 재전송 버튼을 추가했습니다

## 2022년 10월 4일 - Beta \{#october-4-2022---beta\}

ClickHouse Cloud는 2022년 10월 4일 퍼블릭 Beta를 시작했습니다. 자세한 내용은 이 [블로그](https://clickhouse.com/blog/clickhouse-cloud-public-beta)를 참고하십시오.

ClickHouse Cloud 버전은 ClickHouse core v22.10을 기반으로 합니다. 호환되는 기능 목록은 [Cloud Compatibility](/whats-new/cloud-compatibility) 가이드를 참고하십시오.