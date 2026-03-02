---
sidebar_label: '첫 번째 Kafka ClickPipe 생성하기'
description: '첫 번째 Kafka ClickPipe를 생성하는 단계별 가이드입니다.'
slug: /integrations/clickpipes/kafka/create-your-first-kafka-clickpipe
sidebar_position: 1
title: '첫 번째 Kafka ClickPipe 생성하기'
doc_type: 'guide'
keywords: ['kafka clickpipe 생성', 'kafka', 'clickpipes', '데이터 소스', '설정 가이드']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
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


# 처음으로 Kafka ClickPipe 생성하기 \{#creating-your-first-kafka-clickpipe\}

> 이 가이드에서는 첫 번째 Kafka ClickPipe를 생성하는 과정을 단계별로 안내합니다.

<VerticalStepper type="numbered" headerLevel="h2">

## 데이터 소스로 이동 \{#1-load-sql-console\}
왼쪽 메뉴에서 `Data Sources` 버튼을 선택한 다음 "Set up a ClickPipe"를 클릭합니다.
<Image img={cp_step0} alt="가져오기 항목 선택" size="md"/>

## 데이터 소스 선택 \{#2-select-data-source\}
목록에서 Kafka 데이터 소스를 선택합니다.
<Image img={cp_step1} alt="데이터 소스 유형 선택" size="md"/>

## 데이터 소스 구성 \{#3-configure-data-source\}
양식에 ClickPipe 이름, 설명(선택 사항), 자격 증명 및 기타 연결 설정 정보를 입력합니다.
<Image img={cp_step2} alt="연결 세부 정보 입력" size="md"/>

## 스키마 레지스트리 구성(선택 사항) \{#4-configure-your-schema-registry\}
Avro 스트림에는 유효한 스키마가 필요합니다. 스키마 레지스트리 구성 방법에 대한 자세한 내용은 [Schema registries](./02_schema-registries.md)를 참고하십시오.

## Reverse Private Endpoint 구성(선택 사항) \{#5-configure-reverse-private-endpoint\}
ClickPipes가 AWS PrivateLink를 사용해 Kafka 클러스터에 연결할 수 있도록 Reverse Private Endpoint를 구성합니다.
자세한 내용은 [AWS PrivateLink 문서](../aws-privatelink.md)를 참고하십시오.

## 토픽 선택 \{#6-select-your-topic\}
토픽을 선택하면 UI에 해당 토픽에서 가져온 샘플 문서가 표시됩니다.
<Image img={cp_step3} alt="토픽 설정" size="md"/>

## 대상 테이블 구성 \{#7-configure-your-destination-table\}

다음 단계에서 새 ClickHouse 테이블로 데이터를 수집할지, 기존 테이블을 재사용할지 선택할 수 있습니다. 화면의 안내에 따라 테이블 이름, 스키마 및 설정을 수정하십시오. 상단에 표시되는 샘플 테이블에서 변경 사항을 실시간으로 미리 볼 수 있습니다.

<Image img={cp_step4a} alt="테이블, 스키마 및 설정 구성" size="md"/>

제공된 컨트롤을 사용하여 고급 설정도 세부적으로 구성할 수 있습니다.

<Image img={cp_table_settings} alt="고급 컨트롤 설정" size="md"/>

## 권한 구성 \{#8-configure-permissions\}
ClickPipes는 대상 테이블에 데이터를 기록하기 위한 전용 사용자를 생성합니다. 이 내부 사용자에 대해 사용자 정의 역할 또는 미리 정의된 역할 중 하나를 선택할 수 있습니다:
- `Full access`: 클러스터에 대한 전체 액세스 권한을 부여합니다. 대상 테이블과 함께 materialized view나 딕셔너리(Dictionary)를 사용하는 경우에 유용할 수 있습니다.
- `Only destination table`: 대상 테이블에 대해서만 `INSERT` 권한을 부여합니다.

<Image img={cp_step5} alt="권한" size="md"/>

## 설정 완료 \{#9-complete-setup\}
"Create ClickPipe"를 클릭하면 ClickPipe가 생성되어 실행됩니다. 생성된 ClickPipe는 `Data Sources` 섹션에 표시됩니다.

<Image img={cp_overview} alt="개요 보기" size="md"/>

</VerticalStepper>