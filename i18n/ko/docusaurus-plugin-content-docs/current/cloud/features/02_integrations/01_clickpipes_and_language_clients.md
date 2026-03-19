---
sidebar_label: 'ClickPipes 및 언어 클라이언트'
slug: /manage/integrations
title: 'ClickPipes 및 언어 클라이언트'
description: 'ClickHouse Cloud를 위한 ClickPipes 및 언어 클라이언트 통합'
doc_type: 'landing-page'
keywords: ['통합', 'Cloud 기능', 'clickpipes', 'language clients', 'connectors']
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

ClickHouse Cloud를 사용하면 즐겨 사용하는 도구와 서비스를 연결할 수 있습니다.


## ClickHouse Cloud용 관리형 통합 파이프라인 \{#clickpipes\}

ClickPipes는 다양한 소스에서 데이터를 수집하는 작업을 몇 번의 클릭만으로 수행할 수 있게 해 주는 관리형 통합 플랫폼입니다.
가장 까다로운 워크로드에서도 안정적으로 동작하도록 설계된 ClickPipes의 견고하고 확장 가능한 아키텍처는 일관된 성능과 안정성을 보장합니다.
ClickPipes는 장기적인 스트리밍 요구 사항뿐만 아니라 일회성 데이터 적재 작업에도 사용할 수 있습니다.

| Name                                               | Logo                                                                                             |Type| Status           | Description                                                                                          |
|----------------------------------------------------|--------------------------------------------------------------------------------------------------|----|------------------|------------------------------------------------------------------------------------------------------|
| [Apache Kafka](/integrations/clickpipes/kafka)     | <Kafkasvg class="image" alt="Apache Kafka 로고" style={{width: '3rem', 'height': '3rem'}}/>      |Streaming| Stable           | ClickPipes를 구성하여 Apache Kafka에서 ClickHouse Cloud로 스트리밍 데이터를 수집하기 시작하십시오.     |
| Confluent Cloud                                    | <Confluentsvg class="image" alt="Confluent Cloud 로고" style={{width: '3rem'}}/>                 |Streaming| Stable           | 직접 통합을 통해 Confluent와 ClickHouse Cloud의 결합된 기능을 활용하십시오.          |
| Redpanda                                           | <Image img={redpanda_logo} size="logo" alt="Redpanda 로고"/>                                     |Streaming| Stable           | ClickPipes를 구성하여 Redpanda에서 ClickHouse Cloud로 스트리밍 데이터를 수집하기 시작하십시오.         |
| AWS MSK                                            | <Msksvg class="image" alt="AWS MSK 로고" style={{width: '3rem', 'height': '3rem'}}/>             |Streaming| Stable           | ClickPipes를 구성하여 AWS MSK에서 ClickHouse Cloud로 스트리밍 데이터를 수집하기 시작하십시오.          |
| Azure Event Hubs                                   | <Azureeventhubssvg class="image" alt="Azure Event Hubs 로고" style={{width: '3rem'}}/>           |Streaming| Stable           | ClickPipes를 구성하여 Azure Event Hubs에서 ClickHouse Cloud로 스트리밍 데이터를 수집하기 시작하십시오. |
| WarpStream                                         | <Warpstreamsvg class="image" alt="WarpStream 로고" style={{width: '3rem'}}/>                     |Streaming| Stable           | ClickPipes를 구성하여 WarpStream에서 ClickHouse Cloud로 스트리밍 데이터를 수집하기 시작하십시오.       |
| Amazon S3                                          | <S3svg class="image" alt="Amazon S3 로고" style={{width: '3rem', height: 'auto'}}/>              |Object Storage| Stable           | ClickPipes를 구성하여 객체 스토리지에서 대용량 데이터를 수집하도록 하십시오.                            |
| Google Cloud Storage                               | <Gcssvg class="image" alt="Google Cloud Storage 로고" style={{width: '3rem', height: 'auto'}}/>  |Object Storage| Stable           | ClickPipes를 구성하여 객체 스토리지에서 대용량 데이터를 수집하도록 하십시오.                            |
| DigitalOcean Spaces                                | <DOsvg class="image" alt="Digital Ocean 로고" style={{width: '3rem', height: 'auto'}}/>          | Object Storage | Stable | ClickPipes를 구성하여 객체 스토리지에서 대용량 데이터를 수집하도록 하십시오.
| Azure Blob Storage                                 | <ABSsvg class="image" alt="Azure Blob Storage 로고" style={{width: '3rem', height: 'auto'}}/>    | Object Storage | Private Beta | ClickPipes를 구성하여 객체 스토리지에서 대용량 데이터를 수집하도록 하십시오.
| [Amazon Kinesis](/integrations/clickpipes/kinesis) | <AmazonKinesis class="image" alt="Amazon Kinesis 로고" style={{width: '3rem', height: 'auto'}}/> |Streaming| Stable           | ClickPipes를 구성하여 Amazon Kinesis에서 ClickHouse Cloud로 스트리밍 데이터를 수집하기 시작하십시오.   |
| [Postgres](/integrations/clickpipes/postgres)      | <Postgressvg class="image" alt="Postgres 로고" style={{width: '3rem', height: 'auto'}}/>         |DBMS| Stable      | ClickPipes를 구성하여 Postgres에서 ClickHouse Cloud로 데이터를 수집하기 시작하십시오.                   |
| [MySQL](/integrations/clickpipes/mysql)            | <Mysqlsvg class="image" alt="MySQL 로고" style={{width: '3rem', height: 'auto'}}/>               |DBMS| Private Beta | ClickPipes를 구성하여 MySQL에서 ClickHouse Cloud로 데이터를 수집하기 시작하십시오.                      |
| [MongoDB](/integrations/clickpipes/mongodb)        | <Mongodbsvg class="image" alt="MongoDB 로고" style={{width: '3rem', height: 'auto'}}/>           |DBMS| Private Preview | ClickPipes를 구성하여 MongoDB에서 ClickHouse Cloud로 데이터를 수집하기 시작하십시오.                   |

## 언어 클라이언트 통합 \{#language-client-integrations\}

ClickHouse는 여러 언어 클라이언트 통합 기능을 제공하며, 각 통합에 대한 문서는 아래 링크에서 확인할 수 있습니다.

| Page                                                                    | Description                                                                      |
|-------------------------------------------------------------------------|----------------------------------------------------------------------------------|
| [C++](/interfaces/cpp)                                          | C++ Client Library 및 userver 비동기 프레임워크                            |
| [C#](/integrations/csharp)                                  | C# 프로젝트를 ClickHouse에 연결하는 방법을 알아봅니다.                         |
| [Go](/integrations/go)                                          | Go 프로젝트를 ClickHouse에 연결하는 방법을 알아봅니다.                             |
| [JavaScript](/integrations/javascript)                          | 공식 JS 클라이언트를 사용하여 JS 프로젝트를 ClickHouse에 연결하는 방법을 알아봅니다. |
| [Java](/integrations/java)                                      | Java와 ClickHouse를 위한 여러 통합 방법에 대해 자세히 알아봅니다.                   |
| [Python](/integrations/python)                                  | Python 프로젝트를 ClickHouse에 연결하는 방법을 알아봅니다.                         |
| [Rust](/integrations/rust)                                      | Rust 프로젝트를 ClickHouse에 연결하는 방법을 알아봅니다.                           |
| [Third-party clients](/interfaces/third-party/client-libraries) | 타사 개발자가 제공하는 클라이언트 라이브러리에 대해 자세히 알아봅니다.                   |

ClickPipes와 언어 클라이언트 외에도 ClickHouse는 핵심 통합, 파트너 통합, 커뮤니티 통합 등 다양한 통합 기능을 지원합니다.
전체 목록은 문서의 「[Integrations](/integrations)」 섹션을 참조하십시오.