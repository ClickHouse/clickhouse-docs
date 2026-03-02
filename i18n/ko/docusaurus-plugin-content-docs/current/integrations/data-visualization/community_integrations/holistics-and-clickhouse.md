---
sidebar_label: 'Holistics'
slug: /integrations/holistics
keywords: ['clickhouse', 'Holistics', 'AI', 'integrate', 'bi', 'data visualization']
description: 'Holistics는 거버넌스가 적용된, 쉽게 접근 가능한 지표를 통해 모든 사람이 더 나은 의사 결정을 내릴 수 있도록 지원하는 셀프 서비스 BI 및 임베디드 애널리틱스를 위한 AI 기반 플랫폼입니다.'
title: 'ClickHouse를 Holistics에 연결하기'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import holistics_01 from '@site/static/images/integrations/data-visualization/holistics_01.png';
import holistics_02 from '@site/static/images/integrations/data-visualization/holistics_02.png';
import holistics_03 from '@site/static/images/integrations/data-visualization/holistics_03.png';
import holistics_04 from '@site/static/images/integrations/data-visualization/holistics_04.png';
import holistics_05 from '@site/static/images/integrations/data-visualization/holistics_05.png';
import holistics_06 from '@site/static/images/integrations/data-visualization/holistics_06.png';


# ClickHouse를 Holistics에 연결하기 \{#connecting-clickhouse-to-holistics\}

<CommunityMaintainedBadge/>

[Holistics](https://www.holistics.io/)는 일관되고 신뢰할 수 있는 지표를 위한 프로그래머블 시맨틱 레이어를 제공하는 AI 네이티브 셀프 서비스 BI 플랫폼입니다.

ClickHouse를 Holistics에 연결하면 팀은 코드 기반 시맨틱 레이어를 토대로 한 빠르고 신뢰할 수 있는 AI 기반 셀프 서비스 경험을 제공받을 수 있습니다. 비즈니스 사용자는 드래그 앤 드롭 기능과 AI를 통해 데이터를 자신 있게 탐색할 수 있으며, 메트릭 정의는 Git에서 재사용 가능하고 조합 가능하며 버전 관리된 상태로 유지됩니다.

## 사전 준비 사항 \{#prerequisites\}

연결하기 전에 다음 사항을 갖추었는지 확인하십시오.

- **권한:** 새 데이터 소스를 추가하려면 Holistics에서 관리자 권한이 있어야 합니다.
- **네트워크 액세스:** ClickHouse 서버는 [Holistics의 IP 주소](https://docs.holistics.io/docs/connect/ip-whitelisting)에서 접근 가능해야 합니다.
- **데이터베이스 사용자:** 관리자 계정을 사용하지 말고 Holistics 전용의 읽기 전용 데이터베이스 사용자 계정을 생성하십시오.

### 권장 권한 \{#recommended-privileges\}

전용 사용자에게는 쿼리하려는 테이블과 스키마 자동 감지를 위한 `system` 테이블에 대한 `SELECT` 권한이 있어야 합니다.

```sql
-- Example: Grant read access to a specific database
GRANT SELECT ON my_database.* TO holistics_user;

-- Grant access to system metadata
GRANT SELECT ON system.* TO holistics_user;
```

<VerticalStepper headerLevel="h2">
  ## 연결 정보 수집

  HTTP(S)로 ClickHouse에 연결하려면 다음 정보가 필요합니다:

  | **Parameter**     | **Description**                                                                |
  | ----------------- | ------------------------------------------------------------------------------ |
  | **Host**          | ClickHouse 서버의 호스트 이름 (예: `mz322.eu-central-1.aws.clickhouse.cloud`).          |
  | **Port**          | ClickHouse Cloud의 경우 **8443** (SSL/TLS), SSL 없이 자가 관리형 인스턴스를 사용하는 경우 **8123**. |
  | **Database Name** | 연결하려는 데이터베이스의 이름. 기본값은 일반적으로 `default`입니다.                                     |
  | **Username**      | 데이터베이스 사용자. 기본값은 `default`입니다.                                                 |
  | **Password**      | 데이터베이스 사용자의 비밀번호.                                                              |

  ClickHouse Cloud 콘솔에서 **Connect** 버튼을 클릭하고 **HTTPS**를 선택하면 이 정보를 확인할 수 있습니다.

  <Image size="md" img={holistics_01} alt="ClickHouse Cloud 콘솔에서 Connect 버튼의 위치" border />

  ## 네트워크 액세스 구성

  Holistics는 클라우드 기반 애플리케이션이므로 Holistics 서버가 데이터베이스에 접속할 수 있어야 합니다. 다음 두 가지 옵션이 있습니다:

  1. **직접 연결(권장):** 방화벽 또는 ClickHouse Cloud IP Access List에 Holistics의 IP 주소를 허용 목록(allowlist)에 추가하십시오. IP 목록은 [IP Whitelisting 가이드](https://docs.holistics.io/docs/connect/ip-whitelisting)에서 확인할 수 있습니다.

     <Image size="md" img={holistics_02} alt="ClickHouse Cloud에서 IP 허용 목록을 설정하는 예시" border />

  2. **Reverse SSH Tunnel:** 데이터베이스가 프라이빗 네트워크(VPC)에 있고 퍼블릭으로 노출할 수 없는 경우 [Reverse SSH Tunnel](https://docs.holistics.io/docs/connect/connect-tunnel)을 사용하십시오.

  ## Holistics에서 데이터 소스 추가

  1. Holistics에서 **Settings → Data Sources**로 이동합니다.

     <Image size="md" img={holistics_03} alt="Holistics 설정에서 Data Sources로 이동하는 화면" border />

  2. **New Data Source**를 클릭하고 **ClickHouse**를 선택합니다.

     <Image size="md" img={holistics_04} alt="새 데이터 소스 목록에서 ClickHouse를 선택하는 화면" border />

  3. 1단계에서 수집한 정보로 양식을 채웁니다.

     | **Field**         | **Setting**                                            |
     | ----------------- | ------------------------------------------------------ |
     | **Host**          | ClickHouse 호스트 이름                                      |
     | **Port**          | `8443` (또는 `8123`)                                     |
     | **Require SSL**   | 포트 8443을 사용하는 경우 **ON**으로 설정 (ClickHouse Cloud에서는 필수). |
     | **Database Name** | `default` (또는 사용하는 특정 DB)                              |

     <Image size="md" img={holistics_05} alt="Holistics에서 ClickHouse 연결 정보를 입력하는 화면" border />

  4. **Test Connection**을 클릭합니다.

     <Image size="md" img={holistics_06} alt="Holistics에서 ClickHouse 연결 테스트가 성공한 화면" border />

     * **성공:** **Save**를 클릭합니다.
     * **실패:** 사용자 이름/비밀번호를 확인하고 [Holistics IP가 허용 목록에 포함되어 있는지](https://docs.holistics.io/docs/connect/ip-whitelisting) 점검하십시오.
</VerticalStepper>


## 알려진 제한 사항 \{#known-limitations\}

Holistics는 ClickHouse에서 표준 SQL 기능 대부분을 지원하지만, 다음 기능은 예외입니다:

- **Running Total:** 이 분석 FUNCTION은 현재 ClickHouse에서 제한적으로만 지원됩니다.
- **중첩 데이터 타입:** 깊이 중첩된 JSON 또는 Array 구조는 시각화 전에 SQL 모델을 통해 평탄화 작업이 필요할 수 있습니다.

지원되는 기능의 전체 목록은 [데이터베이스별 제한 사항 페이지](https://docs.holistics.io/docs/connect/faqs/clickhouse-limitations)에서 확인하십시오.