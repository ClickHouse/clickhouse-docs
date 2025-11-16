---
'sidebar_label': 'Databrain'
'sidebar_position': 131
'slug': '/integrations/databrain'
'keywords':
- 'clickhouse'
- 'Databrain'
- 'connect'
- 'integrate'
- 'ui'
- 'analytics'
- 'embedded'
- 'dashboard'
- 'visualization'
'description': 'Databrain은 고객 대시보드, 지표 및 데이터 시각화를 구축하기 위해 ClickHouse와 원활하게 통합되는 임베디드
  분석 플랫폼입니다.'
'title': 'Databrain을 ClickHouse에 연결하기'
'doc_type': 'guide'
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


# Databrain을 ClickHouse에 연결하기

<CommunityMaintainedBadge/>

[Databrain](https://usedatabrain.com)은 고객과 함께 대화형 대시보드, 메트릭 및 데이터 시각화를 구축하고 공유할 수 있도록 해주는 임베디드 분석 플랫폼입니다. Databrain은 HTTPS 인터페이스를 사용하여 ClickHouse에 연결하므로 현대적이고 사용자 친화적인 인터페이스를 통해 ClickHouse 데이터를 쉽게 시각화하고 분석할 수 있습니다.

<Image size="md" img={databrain_01} alt="Databrain 대시보드 인터페이스가 ClickHouse 데이터 시각화를 보여줌" border />

<br/>

이 가이드는 Databrain과 ClickHouse 인스턴스를 연결하는 단계에 대해 설명합니다.

## 전제 조건 {#pre-requisites}

- 자체 인프라에 호스팅되거나 [ClickHouse Cloud](https://clickhouse.com/)에 호스팅되는 ClickHouse 데이터베이스.
- [Databrain 계정](https://app.usedatabrain.com/users/sign-up).
- 데이터 소스를 연결할 Databrain 작업 공간.

## Databrain을 ClickHouse에 연결하는 단계 {#steps-to-connect-databrain-to-clickhouse}

### 1. 연결 세부정보 수집 {#1-gather-your-connection-details}

<ConnectionDetails />

### 2. Databrain IP 주소 허용 (필요한 경우) {#2-allow-databrain-ip-addresses}

ClickHouse 인스턴스에 IP 필터링이 활성화된 경우, Databrain의 IP 주소를 화이트리스트에 추가해야 합니다.

ClickHouse Cloud 사용자:
1. ClickHouse Cloud 콘솔에서 서비스로 이동합니다.
2. **설정** → **보안**으로 이동합니다.
3. Databrain의 IP 주소를 허용 목록에 추가합니다.

:::tip
현재 화이트리스트에 추가해야 하는 IP 주소 목록은 [Databrain의 IP 화이트리스트 문서](https://docs.usedatabrain.com/guides/datasources/allow-access-to-our-ip)를 참조하십시오.
:::

### 3. Databrain에서 ClickHouse를 데이터 소스로 추가 {#3-add-clickhouse-as-a-data-source}

1. Databrain 계정에 로그인하고 데이터 소스를 추가할 작업 공간으로 이동합니다.

2. 내비게이션 메뉴에서 **데이터 소스**를 클릭합니다.

<Image size="md" img={databrain_02} alt="Databrain 데이터 소스 메뉴" border />

3. **데이터 소스 추가** 또는 **데이터 소스 연결**을 클릭합니다.

4. 사용 가능한 커넥터 목록에서 **ClickHouse**를 선택합니다.

<Image size="md" img={databrain_03} alt="ClickHouse 옵션이 표시된 Databrain 커넥터 선택" border />

5. 연결 세부정보를 입력합니다:
   - **대상 이름**: 이 연결에 대한 설명 이름을 입력합니다 (예: "생산 ClickHouse" 또는 "분석 DB").
   - **호스트**: ClickHouse 호스트 URL을 입력합니다 (예: `https://your-instance.region.aws.clickhouse.cloud`).
   - **포트**: `8443`을 입력합니다 (ClickHouse의 기본 HTTPS 포트).
   - **사용자 이름**: ClickHouse 사용자 이름을 입력합니다.
   - **비밀번호**: ClickHouse 비밀번호를 입력합니다.

<Image size="md" img={databrain_04} alt="구성 필드가 있는 Databrain ClickHouse 연결 양식" border />

6. **연결 테스트**를 클릭하여 Databrain이 ClickHouse 인스턴스에 연결할 수 있는지 확인합니다.

7. 연결에 성공하면 **저장** 또는 **연결**을 클릭하여 데이터 소스를 추가합니다.

### 4. 사용자 권한 구성 {#4-configure-user-permissions}

연결하려는 ClickHouse 사용자가 필요한 권한을 갖고 있는지 확인합니다:

```sql
-- Grant permissions to read schema information
GRANT SELECT ON information_schema.* TO your_databrain_user;

-- Grant read access to your database and tables
GRANT SELECT ON your_database.* TO your_databrain_user;
```

`your_databrain_user` 및 `your_database`를 실제 사용자 이름 및 데이터베이스 이름으로 바꿉니다.

## ClickHouse와 함께 Databrain 사용하기 {#using-databrain-with-clickhouse}

### 데이터 탐색 {#explore-your-data}

1. 연결한 후, Databrain에서 작업 공간으로 이동합니다.

2. 데이터 탐색기에 ClickHouse 테이블이 나열되어 있습니다.

<Image size="md" img={databrain_05} alt="ClickHouse 테이블이 표시된 Databrain 데이터 탐색기" border />

3. 테이블을 클릭하여 스키마를 탐색하고 데이터를 미리 봅니다.

### 메트릭 및 시각화 만들기 {#create-metrics-and-visualizations}

1. **메트릭 생성**을 클릭하여 ClickHouse 데이터로 시각화를 구축합니다.

2. ClickHouse 데이터 소스를 선택하고 시각화할 테이블을 선택합니다.

3. Databrain의 직관적인 인터페이스를 사용하여:
   - 차원 및 측정 선택
   - 필터 및 집계 적용
   - 시각화 유형 선택 (막대 차트, 선형 차트, 파이 차트, 테이블 등)
   - 고급 분석을 위한 사용자 정의 SQL 쿼리 추가

4. 메트릭을 저장하여 대시보드에서 재사용합니다.

### 대시보드 만들기 {#build-dashboards}

1. **대시보드 생성**을 클릭하여 대시보드를 구축하기 시작합니다.

2. 저장된 메트릭을 드래그 앤 드롭하여 대시보드에 추가합니다.

3. 대시보드의 레이아웃과 모양을 사용자 정의합니다.

<Image size="md" img={databrain_06} alt="여러 ClickHouse 시각화가 있는 Databrain 대시보드" border />

4. 팀과 대시보드를 공유하거나 애플리케이션에 내장합니다.

### 고급 기능 {#advanced-features}

Databrain은 ClickHouse와 작업할 때 여러 고급 기능을 제공합니다:

- **사용자 정의 SQL 콘솔**: ClickHouse 데이터베이스에 직접 사용자 정의 SQL 쿼리를 작성하고 실행합니다.
- **다중 테넌시 및 단일 테넌시**: 단일 테넌트 및 다중 테넌트 아키텍처를 모두 사용하는 ClickHouse 데이터베이스 연결.
- **보고서 일정 수립**: 자동화된 보고서를 일정 수립하고 이해관계자에게 이메일로 전송합니다.
- **AI 기반 인사이트**: AI를 사용하여 데이터에서 요약 및 인사이트를 생성합니다.
- **임베디드 분석**: 대시보드 및 메트릭을 애플리케이션에 직접 내장합니다.
- **의미적 계층**: 재사용 가능한 데이터 모델 및 비즈니스 로직을 생성합니다.

## 문제 해결 {#troubleshooting}

### 연결 실패 {#connection-fails}

ClickHouse에 연결할 수 없는 경우:

1. **자격 증명 확인**: 사용자 이름, 비밀번호 및 호스트 URL을 다시 확인합니다.
2. **포트 확인**: HTTPS를 위해 포트 `8443`을 사용하고 있는지 확인합니다 (SSL을 사용하지 않는 경우 HTTP는 `8123`).
3. **IP 화이트리스트**: ClickHouse 방화벽/보안 설정에서 Databrain의 IP 주소가 화이트리스트에 추가되었는지 확인합니다.
4. **SSL/TLS**: HTTPS를 사용할 경우 SSL/TLS가 제대로 구성되었는지 확인합니다.
5. **사용자 권한**: 사용자가 `information_schema` 및 대상 데이터베이스에 대한 SELECT 권한을 갖고 있는지 확인합니다.

### 느린 쿼리 성능 {#slow-query-performance}

쿼리가 느리게 실행되는 경우:

1. **쿼리 최적화**: 필터 및 집계를 효율적으로 사용합니다.
2. **물리화된 뷰 만들기**: 자주 접근하는 집합의 경우 ClickHouse에서 물리화된 뷰 생성 고려.
3. **적절한 데이터 유형 사용**: ClickHouse 스키마가 최적의 데이터 유형을 사용하고 있는지 확인합니다.
4. **인덱스 최적화**: ClickHouse의 기본 키 및 스킵 인덱스를 활용합니다.

## 자세히 알아보기 {#learn-more}

Databrain 기능 및 강력한 분석 방법에 대한 추가 정보:

- [Databrain 문서](https://docs.usedatabrain.com/)
- [ClickHouse 통합 가이드](https://docs.usedatabrain.com/guides/datasources/connecting-data-sources-to-databrain/clickhouse)
- [대시보드 만들기](https://docs.usedatabrain.com/guides/dashboards/create-a-dashboard)
- [메트릭 만들기](https://docs.usedatabrain.com/guides/metrics/create-metrics)
