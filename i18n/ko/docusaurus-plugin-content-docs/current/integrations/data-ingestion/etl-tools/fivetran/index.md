---
sidebar_label: 'Fivetran'
slug: /integrations/fivetran
sidebar_position: 2
description: 'Fivetran을 사용하여 자동 schema 생성, 중복 제거, History Mode(SCD Type 2)를 통해 모든 소스의 데이터를 ClickHouse Cloud로 이동합니다.'
title: 'Fivetran 및 ClickHouse Cloud'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
  - website: 'https://github.com/ClickHouse/clickhouse-fivetran-destination'
keywords: ['fivetran', '데이터 이동', 'etl', 'ClickHouse 대상', '자동화된 데이터 플랫폼', 'history mode', 'SCD Type 2']
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# Fivetran 및 ClickHouse Cloud \{#fivetran-and-clickhouse-cloud\}

<ClickHouseSupportedBadge />

## 개요 \{#overview\}

[Fivetran](https://www.fivetran.com)은 클라우드 데이터 플랫폼에서 데이터를 내보내고, 가져오고, 서로 간에 이동하는 작업을 자동화하는 데이터 이동 플랫폼입니다.

[ClickHouse Cloud](https://clickhouse.com/cloud)는 [Fivetran 대상](https://fivetran.com/docs/destinations/clickhouse)으로 지원되며, 여러 소스의 데이터를 ClickHouse로 로드할 수 있습니다. 오픈소스 ClickHouse 버전은 대상으로 지원되지 않습니다.

대상 커넥터는 ClickHouse와 Fivetran이 공동으로 개발하고 유지 관리합니다. 소스 코드는 [GitHub](https://github.com/ClickHouse/clickhouse-fivetran-destination)에서 확인할 수 있습니다.

:::note
[ClickHouse Cloud 대상](https://fivetran.com/docs/destinations/clickhouse)은 현재 **베타** 단계이지만, 곧 일반 제공 상태가 되도록 작업하고 있습니다.
:::

<div class="vimeo-container">
  <iframe
    src="//www.youtube.com/embed/sWe5JHW3lAs"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
fullscreen;
picture-in-picture"
    allowfullscreen
  />
</div>

## 주요 기능 \{#key-features\}

* **ClickHouse Cloud 호환**: ClickHouse Cloud 데이터베이스를 Fivetran 대상로 사용할 수 있습니다.
* **SaaS 배포 모델**: Fivetran에서 완전히 관리하므로 자체 인프라를 관리할 필요가 없습니다.
* **History Mode (SCD Type 2)**: 시점 분석과 감사 추적을 위해 모든 레코드 버전의 전체 이력을 보존합니다.
* **조정 가능한 배치 크기**: JSON 설정 파일을 통해 write, select, mutation, hard delete 배치 크기를 조정하여 Fivetran을 사용 사례에 맞게 최적화할 수 있습니다.

## 제한 사항 \{#limitations\}

* schema 마이그레이션은 아직 지원되지 않지만, 현재 지원을 위해 작업 중입니다.
* 기본 키(primary key) 컬럼을 추가, 제거 또는 수정하는 것은 지원되지 않습니다.
* `CREATE TABLE` 문에서 사용자 지정 ClickHouse 설정은 지원되지 않습니다.
* 역할 기반 권한 부여는 완전히 지원되지 않습니다. 커넥터의 권한 부여 검사는 사용자에게 직접 부여된 권한만 확인합니다. 대신 [직접 부여된 권한](/integrations/fivetran/troubleshooting#role-based-grants)을 사용하십시오.

## 관련 페이지 \{#related-pages\}

* [기술 참조](/integrations/fivetran/reference): 유형 대응, 테이블 엔진, 메타데이터 컬럼 및 고급 구성
* [문제 해결 및 모범 사례](/integrations/fivetran/troubleshooting): 일반적인 오류, 최적화 팁 및 디버깅 쿼리
* [GitHub의 ClickHouse Fivetran 대상](https://github.com/ClickHouse/clickhouse-fivetran-destination)

## 설정 가이드 \{#setup-guide\}

* 구성 및 일반적인 기술 세부 정보는 [기술 참조](/integrations/fivetran/reference)를 참조하십시오.
* 자세한 안내는 Fivetran 문서의 [설정 가이드](https://fivetran.com/docs/destinations/clickhouse/setup-guide)를 참조하십시오.

## 문의 및 지원 \{#contact-us\}

ClickHouse Fivetran 대상은 소유 주체가 분리된 운영 모델을 따릅니다:

* **ClickHouse**는 대상 커넥터 코드를 개발하고 유지 관리합니다.
* **Fivetran**은 커넥터를 호스팅하며 데이터 이동, 파이프라인 스케줄링, 소스 커넥터를 담당합니다.

Fivetran과 ClickHouse는 모두 Fivetran ClickHouse 대상에 대한 지원을 제공합니다. 일반적인 문의는 Fivetran 플랫폼에 가장 전문성이 있는 Fivetran에 문의하는 것이 좋습니다. ClickHouse 특유의 질문이나 문제가 있는 경우에는 ClickHouse 지원팀에서 도와드립니다. 질문하거나 문제를 보고하려면 [지원 티켓](/about-us/support)을 생성하십시오.