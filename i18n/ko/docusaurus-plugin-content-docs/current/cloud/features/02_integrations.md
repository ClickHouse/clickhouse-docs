---
'sidebar_label': '통합'
'slug': '/manage/integrations'
'title': '통합'
'description': 'ClickHouse에 대한 통합'
'doc_type': 'landing-page'
'keywords':
- 'integrations'
- 'cloud features'
- 'third-party tools'
- 'data sources'
- 'connectors'
---

import Kafkasvg from '@site/static/images/integrations/logos/kafka.svg';
import Confluentsvg from '@site/static/images/integrations/logos/confluent.svg';
import Msksvg from '@site/static/images/integrations/logos/msk.svg';
import Azureeventhubssvg from '@site/static/images/integrations/logos/azure_event_hubs.svg';
import Warpstreamsvg from '@site/static/images/integrations/logos/warpstream.svg';
import S3svg from '@site/static/images/integrations/logos/amazon_s3_logo.svg';
import AmazonKinesis from '@site/static/images/integrations/logos/amazon_kinesis_logo.svg';
import Gcssvg from '@site/static/images/integrations/logos/gcs.svg';
import DOsvg from '@site/static/images/integrations/logos/digitalocean.svg';
import ABSsvg from '@site/static/images/integrations/logos/azureblobstorage.svg';
import Postgressvg from '@site/static/images/integrations/logos/postgresql.svg';
import Mysqlsvg from '@site/static/images/integrations/logos/mysql.svg';
import Mongodbsvg from '@site/static/images/integrations/logos/mongodb.svg';
import redpanda_logo from '@site/static/images/integrations/logos/logo_redpanda.png';
import clickpipes_stack from '@site/static/images/integrations/data-ingestion/clickpipes/clickpipes_stack.png';
import cp_custom_role from '@site/static/images/integrations/data-ingestion/clickpipes/cp_custom_role.png';
import Image from '@theme/IdealImage';

ClickHouse Cloud는 사용자가 선호하는 도구와 서비스를 연결할 수 있게 해줍니다.

## ClickHouse Cloud를 위한 관리형 통합 파이프라인 {#clickpipes}

ClickPipes는 다양한 출처에서 데이터를 수집하는 과정을 버튼 클릭 몇 번으로 간단하게 만들어주는 관리형 통합 플랫폼입니다. 가장 수요가 많은 작업 부하를 위해 설계된 ClickPipes의 강력하고 확장 가능한 아키텍처는 일관된 성능과 신뢰성을 보장합니다. ClickPipes는 장기 스트리밍 요구 사항이나 일회성 데이터 로딩 작업에 사용할 수 있습니다.

| 이름                                                 | 로고                                                                                               | 타입       | 상태    | 설명                                                                                                  |
|----------------------------------------------------|---------------------------------------------------------------------------------------------------|----------|--------|------------------------------------------------------------------------------------------------------|
| [Apache Kafka](/integrations/clickpipes/kafka)     | <Kafkasvg class="image" alt="Apache Kafka 로고" style={{width: '3rem', 'height': '3rem'}}/>      | 스트리밍   | 안정적   | ClickPipes를 구성하고 Apache Kafka로부터 ClickHouse Cloud로 스트리밍 데이터를 수집하기 시작하세요.     |
| Confluent Cloud                                    | <Confluentsvg class="image" alt="Confluent Cloud 로고" style={{width: '3rem'}}/>                 | 스트리밍   | 안정적   | 직접 통합을 통해 Confluent와 ClickHouse Cloud의 결합된 힘을 활용하세요.                            |
| Redpanda                                           | <Image img={redpanda_logo} size="logo" alt="Redpanda 로고"/>                                     | 스트리밍   | 안정적   | ClickPipes를 구성하고 Redpanda로부터 ClickHouse Cloud로 스트리밍 데이터를 수집하기 시작하세요.         |
| AWS MSK                                            | <Msksvg class="image" alt="AWS MSK 로고" style={{width: '3rem', 'height': '3rem'}}/>             | 스트리밍   | 안정적   | ClickPipes를 구성하고 AWS MSK로부터 ClickHouse Cloud로 스트리밍 데이터를 수집하기 시작하세요.          |
| Azure Event Hubs                                   | <Azureeventhubssvg class="image" alt="Azure Event Hubs 로고" style={{width: '3rem'}}/>           | 스트리밍   | 안정적   | ClickPipes를 구성하고 Azure Event Hubs로부터 ClickHouse Cloud로 스트리밍 데이터를 수집하기 시작하세요. |
| WarpStream                                         | <Warpstreamsvg class="image" alt="WarpStream 로고" style={{width: '3rem'}}/>                     | 스트리밍   | 안정적   | ClickPipes를 구성하고 WarpStream으로부터 ClickHouse Cloud로 스트리밍 데이터를 수집하기 시작하세요.       |
| Amazon S3                                          | <S3svg class="image" alt="Amazon S3 로고" style={{width: '3rem', height: 'auto'}}/>              | 객체 저장소  | 안정적   | ClickPipes를 구성하여 객체 저장소로부터 대량의 데이터를 수집하세요.                               |
| Google Cloud Storage                               | <Gcssvg class="image" alt="Google Cloud Storage 로고" style={{width: '3rem', height: 'auto'}}/>  | 객체 저장소  | 안정적   | ClickPipes를 구성하여 객체 저장소로부터 대량의 데이터를 수집하세요.                               |
| DigitalOcean Spaces                                | <DOsvg class="image" alt="Digital Ocean 로고" style={{width: '3rem', height: 'auto'}}/>          | 객체 저장소  | 안정적   | ClickPipes를 구성하여 객체 저장소로부터 대량의 데이터를 수집하세요.                               |
| Azure Blob Storage                                 | <ABSsvg class="image" alt="Azure Blob Storage 로고" style={{width: '3rem', height: 'auto'}}/>    | 객체 저장소  | 비공식 베타 | ClickPipes를 구성하여 객체 저장소로부터 대량의 데이터를 수집하세요.                               |
| [Amazon Kinesis](/integrations/clickpipes/kinesis) | <AmazonKinesis class="image" alt="Amazon Kinesis 로고" style={{width: '3rem', height: 'auto'}}/> | 스트리밍   | 안정적   | ClickPipes를 구성하고 Amazon Kinesis로부터 ClickHouse Cloud로 스트리밍 데이터를 수집하기 시작하세요.   |
| [Postgres](/integrations/clickpipes/postgres)      | <Postgressvg class="image" alt="Postgres 로고" style={{width: '3rem', height: 'auto'}}/>         | DBMS      | 안정적   | ClickPipes를 구성하고 Postgres로부터 ClickHouse Cloud로 데이터를 수집하기 시작하세요.                   |
| [MySQL](/integrations/clickpipes/mysql)            | <Mysqlsvg class="image" alt="MySQL 로고" style={{width: '3rem', height: 'auto'}}/>               | DBMS      | 비공식 베타 | ClickPipes를 구성하고 MySQL로부터 ClickHouse Cloud로 데이터를 수집하기 시작하세요.                      |
| [MongoDB](/integrations/clickpipes/mongodb)        | <Mongodbsvg class="image" alt="MongoDB 로고" style={{width: '3rem', height: 'auto'}}/>           | DBMS      | 비공식 프리뷰 | ClickPipes를 구성하고 MongoDB로부터 ClickHouse Cloud로 데이터를 수집하기 시작하세요.                   |

## 언어 클라이언트 통합 {#language-client-integrations}

ClickHouse는 여러 언어 클라이언트 통합을 제공하며, 각 문서는 아래에 링크되어 있습니다.

| 페이지                                                                   | 설명                                                               |
|-------------------------------------------------------------------------|--------------------------------------------------------------------|
| [C++](/interfaces/cpp)                                          | C++ 클라이언트 라이브러리 및 userver 비동기 프레임워크                      |
| [C#](/integrations/csharp)                                  | C# 프로젝트를 ClickHouse에 연결하는 방법을 배우세요.                  |
| [Go](/integrations/go)                                          | Go 프로젝트를 ClickHouse에 연결하는 방법을 배우세요.                   |
| [JavaScript](/integrations/javascript)                          | 공식 JS 클라이언트를 통해 JS 프로젝트를 ClickHouse에 연결하는 방법을 배우세요. |
| [Java](/integrations/java)                                      | Java와 ClickHouse의 여러 통합에 대해 더 알아보세요.                     |
| [Python](/integrations/python)                                  | Python 프로젝트를 ClickHouse에 연결하는 방법을 배우세요.                |
| [Rust](/integrations/rust)                                      | Rust 프로젝트를 ClickHouse에 연결하는 방법을 배우세요.                 |
| [타사 클라이언트](/interfaces/third-party/client-libraries) | 타사 개발자의 클라이언트 라이브러리에 대해 더 알아보세요.                  |

ClickPipes, 언어 클라이언트 외에도, ClickHouse는 핵심 통합, 파트너 통합 및 커뮤니티 통합을 포함한 다양한 다른 통합을 지원합니다. 전체 목록은 문서의 ["Integrations"](/integrations) 섹션을 참조하세요.
