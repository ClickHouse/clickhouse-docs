---
sidebar_label: 'Querio'
sidebar_position: 145
slug: /integrations/querio
keywords: ['Querio', '연결', '통합', '애널리틱스', 'AI']
description: 'Querio는 AI 네이티브 애널리틱스와 비즈니스 인텔리전스를 위한 워크스페이스입니다. ClickHouse를 Querio에 연결하여 SQL, Python, AI를 사용해 실시간 데이터를 탐색, 시각화 및 분석할 수 있습니다.'
title: 'ClickHouse를 Querio에 연결하기'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_visualization'
---

import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

<CommunityMaintainedBadge />

Querio는 AI 기반 분석 및 비즈니스 인텔리전스 워크스페이스로, 팀이 SQL, Python, 자연어를 사용해 데이터를 쿼리·탐색·시각화하고 인사이트를 도출할 수 있게 합니다. Querio를 ClickHouse 데이터베이스 또는 데이터 웨어하우스에 연결하면 데이터를 이동하지 않고도 ClickHouse 데이터에 대해 대규모 실시간 분석을 수행하고, 보드와 노트북을 만들며, AI 지원 보고서를 생성할 수 있습니다.


## Querio용 ClickHouse 설정 \{#setup-clickhouse-for-querio\}

<VerticalStepper headerLevel="h3">

### 전용 사용자 생성 \{#create-dedicated-user\}

보안 모범 사례에 따라 Querio만을 위한 전용 사용자 계정을 생성한 후, 필요한 최소 권한만 부여하십시오:

```sql
CREATE USER querio_user IDENTIFIED BY 'STRONG_PASSWORD';
```

:::tip
비밀번호 관리자를 사용해 생성한, 길고 임의의 비밀번호(최소 16자 이상)를 사용하십시오.
:::

### 읽기 전용 데이터베이스 액세스 권한 부여 \{#grant-read-only-access\}

Querio가 쿼리해야 하는 데이터베이스와 테이블에만 권한이 부여되도록 Querio의 권한을 제한하십시오:

```sql
GRANT SELECT ON my_database.* TO querio_user;
```

특정 테이블에 대해서는 다음 명령을 사용하십시오:
```sql
GRANT SELECT ON database.table_name TO querio_user;
```

Querio가 액세스해야 하는 각 데이터베이스에 대해 이 과정을 반복하십시오.

### 연결 정보 수집 \{#gather-connection-details\}

Querio를 ClickHouse에 연결하려면 다음 연결 정보가 필요합니다:

| Parameter | Description |
|-----------|-------------|
| `HOST` | ClickHouse 서버 또는 클러스터의 주소 |
| `PORT` | 포트 9440(보안 네이티브 프로토콜의 기본 포트) 또는 구성한 포트 |
| `DATABASE` | Querio가 쿼리하도록 할 데이터베이스 |
| `USERNAME` | `querio_user`(또는 선택한 사용자 이름) |
| `PASSWORD` | 해당 사용자 계정의 비밀번호 |

:::note
- ClickHouse Cloud의 경우 연결 정보는 Cloud 콘솔에서 확인할 수 있습니다.
- 자가 관리형 인스턴스에서 ClickHouse가 다른 포트를 사용하는 경우 서버 구성을 확인하십시오.
- 포트 9440은 보안 네이티브 프로토콜 연결의 기본 포트입니다.
:::

</VerticalStepper>

## Querio 계정을 생성하고 ClickHouse를 연결합니다 \{#create-account-and-connect\}

[https://app.querio.ai/](https://app.querio.ai/)에서 Querio 워크스페이스에 로그인하거나 새로 생성합니다.

1. Querio에서 **Settings → Datasources**로 이동한 뒤 **Add Datasource**를 클릭합니다.

2. 데이터베이스 옵션 목록에서 **ClickHouse**를 선택합니다.

3. 위에서 설정한 연결 정보를 입력하고 구성을 저장합니다.

4. Querio가 연결을 검증합니다. 검증이 완료되면 워크스페이스 전체에서 ClickHouse를 데이터 소스로 사용할 수 있습니다.

## ClickHouse 쿼리 실행 \{#querying-clickhouse\}

Querio를 ClickHouse에 연결한 후에는 플랫폼 전반에서 데이터를 탐색하고 분석할 수 있습니다. Querio 노트북에서 SQL 블록 또는 Python 셀을 생성한 다음, 데이터 소스로 ClickHouse를 선택하고 ClickHouse 클러스터에 직접 쿼리를 실행하십시오. Querio의 시각화 및 AI 도구를 사용해 인사이트를 도출하고, 보드를 생성하며, 결과를 공유할 수 있습니다.

## 추가 자료 \{#additional-resources\}

- [Querio 문서](https://docs.querio.ai/integrations/clickhouse)
- [Querio 시작하기 가이드 및 튜토리얼](https://www.querio.ai)