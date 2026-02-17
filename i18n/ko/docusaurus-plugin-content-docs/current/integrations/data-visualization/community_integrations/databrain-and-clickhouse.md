---
sidebar_label: 'Databrain'
sidebar_position: 131
slug: /integrations/databrain
keywords: ['clickhouse', 'Databrain', 'connect', 'integrate', 'ui', 'analytics', 'embedded', 'dashboard', 'visualization']
description: 'Databrain은 고객 대상 대시보드, 메트릭 및 데이터 시각화를 구축하기 위해 ClickHouse와 원활하게 통합되는 임베디드 애널리틱스 플랫폼입니다.'
title: 'Databrain을 ClickHouse에 연결하기'
doc_type: 'guide'
---

import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import databrain_01 from '@site/static/images/integrations/data-visualization/databrain_01.png';
import databrain_02 from '@site/static/images/integrations/data-visualization/databrain_02.png';
import databrain_03 from '@site/static/images/integrations/data-visualization/databrain_03.png';
import databrain_04 from '@site/static/images/integrations/data-visualization/databrain_04.png';
import databrain_05 from '@site/static/images/integrations/data-visualization/databrain_05.png';
import databrain_06 from '@site/static/images/integrations/data-visualization/databrain_06.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Databrain을 ClickHouse에 연결하기 \{#connecting-databrain-to-clickhouse\}

<CommunityMaintainedBadge/>

[Databrain](https://usedatabrain.com)은 내장형 분석 플랫폼으로, 고객과 인터랙티브 대시보드, 메트릭 및 데이터 시각화를 생성하고 공유할 수 있도록 해줍니다. Databrain은 HTTPS 인터페이스를 통해 ClickHouse에 연결하므로, 모던하고 사용자 친화적인 인터페이스를 사용하여 ClickHouse 데이터를 쉽게 시각화하고 분석할 수 있습니다.

<Image size="md" img={databrain_01} alt="ClickHouse 데이터 시각화를 보여주는 Databrain 대시보드 인터페이스" border />

<br/>

이 가이드는 Databrain을 ClickHouse 인스턴스에 연결하는 방법을 단계별로 설명합니다.



## 사전 준비 사항 \{#pre-requisites\}

- 자체 인프라 또는 [ClickHouse Cloud](https://clickhouse.com/)에서 운영되는 ClickHouse 데이터베이스.
- [Databrain 계정](https://app.usedatabrain.com/users/sign-up).
- 데이터 소스를 연결할 Databrain 워크스페이스.



## Databrain을 ClickHouse에 연결하는 단계 \{#steps-to-connect-databrain-to-clickhouse\}

### 1. 연결 정보를 준비합니다 \{#1-gather-your-connection-details\}

<ConnectionDetails />

### 2. Databrain IP 주소를 허용합니다(필요한 경우) \{#2-allow-databrain-ip-addresses\}

ClickHouse 인스턴스에서 IP 필터링을 사용하는 경우 Databrain의 IP 주소를 허용 목록에 추가해야 합니다.

ClickHouse Cloud 사용자의 경우:

1. ClickHouse Cloud 콘솔에서 서비스로 이동합니다.
2. **Settings** → **Security**로 이동합니다.
3. 허용 목록(allow list)에 Databrain의 IP 주소를 추가합니다.

:::tip
허용 목록에 추가해야 하는 최신 IP 주소 목록은 [Databrain의 IP 허용(whitelisting) 문서](https://docs.usedatabrain.com/guides/datasources/allow-access-to-our-ip)를 참고하십시오.
:::

### 3. Databrain에서 ClickHouse를 데이터 소스로 추가합니다 \{#3-add-clickhouse-as-a-data-source\}

1. Databrain 계정에 로그인한 후, 데이터 소스를 추가하려는 워크스페이스로 이동합니다.

2. 내비게이션 메뉴에서 **Data Sources**를 클릭합니다.

<Image size="md" img={databrain_02} alt="Databrain 데이터 소스 메뉴" border />

3. **Add a Data Source** 또는 **Connect Data Source**를 클릭합니다.

4. 사용 가능한 커넥터 목록에서 **ClickHouse**를 선택합니다.

<Image size="md" img={databrain_03} alt="ClickHouse 옵션이 표시된 Databrain 커넥터 선택 화면" border />

5. 연결 정보를 입력합니다:
   * **Destination Name**: 이 연결을 식별하기 쉬운 이름으로 입력합니다(예: &quot;Production ClickHouse&quot; 또는 &quot;Analytics DB&quot;)
   * **Host**: ClickHouse 호스트 URL을 입력합니다(예: `https://your-instance.region.aws.clickhouse.cloud`)
   * **Port**: `8443`를 입력합니다(ClickHouse의 기본 HTTPS 포트)
   * **Username**: ClickHouse 사용자 이름을 입력합니다.
   * **Password**: ClickHouse 비밀번호를 입력합니다.

<Image size="md" img={databrain_04} alt="구성 필드가 있는 Databrain ClickHouse 연결 양식" border />

6. **Test Connection**을 클릭하여 Databrain이 ClickHouse 인스턴스에 연결할 수 있는지 확인합니다.

7. 연결이 성공하면 **Save** 또는 **Connect**를 클릭하여 데이터 소스를 추가합니다.

### 4. 사용자 권한을 구성합니다 \{#4-configure-user-permissions\}

연결에 사용하는 ClickHouse 사용자에게 필요한 권한이 있는지 확인합니다:

```sql
-- Grant permissions to read schema information
GRANT SELECT ON information_schema.* TO your_databrain_user;

-- Grant read access to your database and tables
GRANT SELECT ON your_database.* TO your_databrain_user;
```

`your_databrain_user`와 `your_database`를 실제 사용자 이름과 데이터베이스 이름으로 바꾸십시오.


## ClickHouse에서 Databrain 사용하기 \{#using-databrain-with-clickhouse\}

### 데이터 탐색하기 \{#explore-your-data\}

1. 연결이 완료되면 Databrain에서 워크스페이스로 이동합니다.

2. 데이터 탐색기에서 ClickHouse 테이블 목록이 표시됩니다.

<Image size="md" img={databrain_05} alt="ClickHouse 테이블을 보여주는 Databrain 데이터 탐색기" border />

3. 테이블을 클릭하여 스키마를 확인하고 데이터를 미리 봅니다.

### 메트릭과 시각화 생성하기 \{#create-metrics-and-visualizations\}

1. **Create Metric**을 클릭하여 ClickHouse 데이터로부터 시각화 생성을 시작합니다.

2. ClickHouse 데이터 소스를 선택하고 시각화하려는 테이블을 선택합니다.

3. Databrain의 직관적인 인터페이스를 사용하여 다음을 수행합니다.
   - 차원과 측정값을 선택합니다.
   - 필터와 집계를 적용합니다.
   - 시각화 유형을 선택합니다 (막대 차트, 선 차트, 파이 차트, 테이블 등).
   - 고급 분석을 위해 사용자 정의 SQL 쿼리를 추가합니다.

4. 메트릭을 저장하여 여러 대시보드에서 재사용합니다.

### 대시보드 구성하기 \{#build-dashboards\}

1. **Create Dashboard**를 클릭하여 대시보드 구성을 시작합니다.

2. 저장된 메트릭을 드래그 앤 드롭하여 대시보드에 추가합니다.

3. 대시보드의 레이아웃과 외형을 사용자 지정합니다.

<Image size="md" img={databrain_06} alt="여러 ClickHouse 시각화가 포함된 Databrain 대시보드" border />

4. 대시보드를 팀과 공유하거나 애플리케이션에 삽입합니다.

### 고급 기능 \{#advanced-features\}

Databrain은 ClickHouse와 함께 작업할 때 다양한 고급 기능을 제공합니다.

- **Custom SQL Console**: ClickHouse 데이터베이스에 대해 직접 사용자 정의 SQL 쿼리를 작성하고 실행합니다.
- **Multi-tenancy 및 single-tenancy**: single-tenant 및 multi-tenant 아키텍처 모두에서 ClickHouse 데이터베이스를 연결합니다.
- **Report Scheduling**: 자동 보고서를 예약하고 이해관계자에게 이메일로 전송합니다.
- **AI-powered Insights**: AI를 사용하여 데이터로부터 요약과 인사이트를 생성합니다.
- **Embedded Analytics**: 애플리케이션에 대시보드와 메트릭을 직접 삽입합니다.
- **Semantic Layer**: 재사용 가능한 데이터 모델과 비즈니스 로직을 생성합니다.



## 문제 해결 \{#troubleshooting\}

### 연결 실패 \{#connection-fails\}

ClickHouse에 연결할 수 없는 경우 다음 사항을 확인합니다.

1. **자격 증명 확인**: 사용자 이름, 비밀번호, 호스트 URL을 다시 한 번 확인합니다.
2. **포트 확인**: HTTPS를 사용하는 경우 포트 `8443`을, SSL을 사용하지 않는 HTTP를 사용하는 경우 포트 `8123`을 사용하고 있는지 확인합니다.
3. **IP 화이트리스트**: Databrain의 IP 주소가 ClickHouse 방화벽/보안 설정에서 화이트리스트에 등록되어 있는지 확인합니다.
4. **SSL/TLS**: HTTPS를 사용하는 경우 SSL/TLS가 올바르게 구성되어 있는지 확인합니다.
5. **사용자 권한**: 해당 사용자가 `information_schema` 및 대상 데이터베이스에 대해 SELECT 권한을 가지고 있는지 확인합니다.

### 느린 쿼리 성능 \{#slow-query-performance\}

쿼리 실행 속도가 느린 경우 다음을 수행합니다.

1. **쿼리 최적화**: 필터와 집계를 효율적으로 사용합니다.
2. **materialized view 생성**: 자주 사용되는 집계가 있다면 ClickHouse에 materialized view를 생성하는 것을 고려합니다.
3. **적절한 데이터 타입 사용**: ClickHouse 스키마에서 최적의 데이터 타입을 사용하고 있는지 확인합니다.
4. **인덱스 최적화**: ClickHouse의 기본 키와 skipping 인덱스를 활용합니다.



## 더 알아보기 \{#learn-more\}

Databrain 기능과 강력한 분석 환경을 구축하는 방법에 대한 자세한 내용은 다음을 참고하십시오:

- [Databrain 문서](https://docs.usedatabrain.com/)
- [ClickHouse 통합 가이드](https://docs.usedatabrain.com/guides/datasources/connecting-data-sources-to-databrain/clickhouse)
- [대시보드 만들기](https://docs.usedatabrain.com/guides/dashboards/create-a-dashboard)
- [메트릭 만들기](https://docs.usedatabrain.com/guides/metrics/create-metrics)
