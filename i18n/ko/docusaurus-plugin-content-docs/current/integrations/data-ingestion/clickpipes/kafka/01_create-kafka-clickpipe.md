---
sidebar_label: '처음 만드는 Kafka ClickPipe'
description: 'Kafka ClickPipe를 처음 만드는 방법을 단계별로 안내합니다.'
slug: /integrations/clickpipes/kafka/create-your-first-kafka-clickpipe
sidebar_position: 1
title: '처음 만드는 Kafka ClickPipe'
doc_type: 'guide'
keywords: ['Kafka ClickPipe 만들기', 'Kafka', 'ClickPipes', '데이터 소스', '설정 가이드']
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
import cp_ssh_tunnel from '@site/static/images/integrations/data-ingestion/clickpipes/cp_ssh_tunnel.png';
import Image from '@theme/IdealImage';

# 처음 만드는 Kafka ClickPipe \{#creating-your-first-kafka-clickpipe\}

> 이 가이드에서는 처음 만드는 Kafka ClickPipe를 만드는 과정을 단계별로 안내합니다.

<VerticalStepper type="numbered" headerLevel="h2">
  ## 데이터 소스로 이동 \{#1-load-sql-console\}

  왼쪽 메뉴에서 `Data Sources` 버튼을 선택한 다음 &quot;Set up a ClickPipe&quot;를 클릭하십시오.

  <Image img={cp_step0} alt="가져오기 선택" size="md" />

  ## 데이터 소스 선택 \{#2-select-data-source\}

  목록에서 Kafka 데이터 소스를 선택하십시오.

  <Image img={cp_step1} alt="데이터 소스 유형 선택" size="md" />

  ## 데이터 소스 구성 \{#3-configure-data-source\}

  ClickPipe 이름, 설명(선택 사항), 자격 증명, 기타 연결 정보를 입력하여 양식을 작성하십시오.

  <Image img={cp_step2} alt="연결 정보 입력" size="md" />

  ## 스키마 레지스트리 구성(선택 사항) \{#4-configure-your-schema-registry\}

  Avro 스트림에는 유효한 스키마가 필요합니다. 스키마 레지스트리 구성 방법에 대한 자세한 내용은 [Schema registries](./02_schema-registries.md)를 참조하십시오.

  ## Reverse Private Endpoint 구성(선택 사항) \{#5-configure-reverse-private-endpoint\}

  AWS PrivateLink를 사용해 ClickPipes가 Kafka 클러스터에 연결할 수 있도록 Reverse Private Endpoint를 구성하십시오.
  자세한 내용은 [AWS PrivateLink documentation](../aws-privatelink.md)을 참조하십시오.

  ## SSH 터널링 구성(선택 사항) \{#6-configure-ssh-tunneling\}

  Kafka 브로커에 공개적으로 접근할 수 없는 경우 SSH 터널링을 사용할 수 있습니다. 직접 연결하는 대신 ClickPipes는 배스천 호스트(네트워크 내에 있으면서 공개적으로 접근 가능한 서버)에 SSH 연결을 설정한 다음, 이를 통해 프라이빗 네트워크의 Kafka 브로커로 트래픽을 전달합니다.

  1. &quot;SSH Tunnel&quot; 토글을 활성화하십시오.
  2. SSH 연결 정보를 입력하십시오:
     * **SSH Host**: 배스천 호스트의 호스트명 또는 IP 주소입니다. 프라이빗 네트워크로 들어가는 게이트웨이 역할을 하는 공개 접근 가능 서버입니다.
     * **SSH Port**: 배스천 호스트의 SSH 포트입니다(기본값 `22`).
     * **SSH User**: 배스천 호스트에서 인증에 사용할 사용자 이름입니다.

  <Image img={cp_ssh_tunnel} alt="SSH 터널 구성" size="md" />

  3. 키 기반 인증을 사용하려면 &quot;Revoke and regenerate key pair&quot;를 클릭하여 새 키 쌍을 생성한 다음, 생성된 공개 키를 SSH 서버의 `~/.ssh/authorized_keys`에 복사하십시오.
  4. &quot;Verify Connection&quot;을 클릭하여 연결을 확인하십시오.

  :::note
  ClickPipes가 SSH 터널을 설정할 수 있도록 SSH 배스천 호스트의 방화벽 규칙에서 [ClickPipes IP addresses](../index.md#list-of-static-ips)를 허용 목록에 추가하십시오.
  :::

  ## topic 선택 \{#7-select-your-topic\}

  topic을 선택하면 UI에 해당 topic의 샘플 문서가 표시됩니다.

  <Image img={cp_step3} alt="topic 설정" size="md" />

  ## 대상 테이블 구성 \{#8-configure-your-destination-table\}

  다음 단계에서는 데이터를 새 ClickHouse 테이블로 수집할지, 기존 테이블을 재사용할지 선택할 수 있습니다. 화면의 안내에 따라 테이블 이름, 스키마, 설정을 수정하십시오. 상단의 샘플 테이블에서 변경 사항의 실시간 미리보기를 확인할 수 있습니다.

  <Image img={cp_step4a} alt="테이블, 스키마, 설정 지정" size="md" />

  제공된 컨트롤을 사용해 고급 설정을 사용자 지정할 수도 있습니다.

  <Image img={cp_table_settings} alt="고급 컨트롤 설정" size="md" />

  ## 권한 구성 \{#9-configure-permissions\}

  ClickPipes는 대상 테이블에 데이터를 쓰기 위한 전용 사용자를 생성합니다. 이 내부 사용자에 대해 사용자 지정 역할 또는 사전 정의된 역할 중 하나를 선택할 수 있습니다:

  * `Full access`: 클러스터에 대한 전체 접근 권한입니다. 대상 테이블과 함께 materialized view 또는 딕셔너리(Dictionary)를 사용하는 경우 유용할 수 있습니다.
  * `Only destination table`: 대상 테이블에 대한 `INSERT` 권한만 부여합니다.

  <Image img={cp_step5} alt="권한" size="md" />

  ## 설정 완료 \{#10-complete-setup\}

  &quot;Create ClickPipe&quot;를 클릭하면 ClickPipe가 생성되어 실행됩니다. 이후 Data Sources 섹션에 표시됩니다.

  <Image img={cp_overview} alt="개요 보기" size="md" />
</VerticalStepper>