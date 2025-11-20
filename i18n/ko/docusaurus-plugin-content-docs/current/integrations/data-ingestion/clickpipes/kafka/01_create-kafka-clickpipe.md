---
'sidebar_label': '당신의 첫 Kafka ClickPipe 만들기'
'description': '당신의 첫 Kafka ClickPipe를 만드는 단계별 가이드.'
'slug': '/integrations/clickpipes/kafka/create-your-first-kafka-clickpipe'
'sidebar_position': 1
'title': '당신의 첫 Kafka ClickPipe 만들기'
'doc_type': 'guide'
'keywords':
- 'create kafka clickpipe'
- 'kafka'
- 'clickpipes'
- 'data sources'
- 'setup guide'
---

import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_step1 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step1.png';
import cp_step2 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step2.png';
import cp_step3 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step3.png';
import cp_step4a from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a.png';
import cp_step5 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step5.png';
import cp_overview from '@site/static/images/integrations/data-ingestion/clickpipes/cp_overview.png';
import cp_table_settings from '@site/static/images/integrations/data-ingestion/clickpipes/cp_table_settings.png';
import Image from '@theme/IdealImage';


# 첫 번째 Kafka ClickPipe 만들기 {#creating-your-first-kafka-clickpipe}

> 이 가이드에서는 첫 번째 Kafka ClickPipe를 만드는 과정을 안내합니다.

<VerticalStepper type="numbered" headerLevel="h2">

## 데이터 소스 탐색 {#1-load-sql-console}
왼쪽 메뉴에서 `Data Sources` 버튼을 선택하고 "Set up a ClickPipe"를 클릭합니다.
<Image img={cp_step0} alt="임포트 선택" size="md"/>

## 데이터 소스 선택 {#2-select-data-source}
목록에서 Kafka 데이터 소스를 선택합니다.
<Image img={cp_step1} alt="데이터 소스 유형 선택" size="md"/>

## 데이터 소스 구성 {#3-configure-data-source}
ClickPipe의 이름, 설명(선택 사항), 인증 정보 및 기타 연결 세부 정보를 제공하여 양식을 작성합니다.
<Image img={cp_step2} alt="연결 세부 정보 작성" size="md"/>

## 스키마 레지스트리 구성 (선택 사항) {#4-configure-your-schema-registry}
Avro 스트림에 유효한 스키마가 필요합니다. 스키마 레지스트리 구성에 대한 자세한 내용은 [Schema registries](./02_schema-registries.md)를 참조하십시오.

## 리버스 프라이빗 엔드포인트 구성 (선택 사항) {#5-configure-reverse-private-endpoint}
ClickPipes가 AWS PrivateLink를 사용하여 Kafka 클러스터에 연결할 수 있도록 리버스 프라이빗 엔드포인트를 구성합니다.
자세한 내용은 [AWS PrivateLink 문서](../aws-privatelink.md)를 참조하십시오.

## 주제 선택 {#6-select-your-topic}
주제를 선택하면 UI에서 해당 주제의 샘플 문서를 표시합니다.
<Image img={cp_step3} alt="주제 설정" size="md"/>

## 대상 테이블 구성 {#7-configure-your-destination-table}

다음 단계에서는 새 ClickHouse 테이블에 데이터를 수집할지 기존의 테이블을 재사용할지를 선택할 수 있습니다. 화면의 지침에 따라 테이블 이름, 스키마 및 설정을 수정합니다. 샘플 테이블 상단에서 변경 사항의 실시간 미리보기를 볼 수 있습니다.

<Image img={cp_step4a} alt="테이블, 스키마 및 설정 설정" size="md"/>

제공된 컨트롤을 사용하여 고급 설정을 사용자 지정할 수도 있습니다.

<Image img={cp_table_settings} alt="고급 설정 설정" size="md"/>

## 권한 구성 {#8-configure-permissions}
ClickPipes는 대상 테이블에 데이터를 쓰기 위한 전용 사용자를 생성합니다. 이 내부 사용자에 대한 역할을 사용자 정의 역할 또는 사전 정의된 역할 중 하나로 선택할 수 있습니다:
- `Full access`: 클러스터에 대한 전체 접근 권한을 가집니다. 대상 테이블에 대해 물리화된 뷰 또는 딕셔너리를 사용하는 경우 유용할 수 있습니다.
- `Only destination table`: 대상 테이블에 대해서만 `INSERT` 권한을 가집니다.

<Image img={cp_step5} alt="권한" size="md"/>

## 설정 완료 {#9-complete-setup}
"Create ClickPipe"를 클릭하면 ClickPipe가 생성되고 실행됩니다. 이후 데이터 소스 섹션에 나열됩니다.

<Image img={cp_overview} alt="개요 보기" size="md"/>

</VerticalStepper>
