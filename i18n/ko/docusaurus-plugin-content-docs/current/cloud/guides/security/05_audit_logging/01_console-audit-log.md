---
sidebar_label: 'Console 감사 로그'
slug: /cloud/security/audit-logging/console-audit-log
title: 'Console 감사 로그'
description: '이 페이지에서는 클라우드 감사 로그를 검토하는 방법을 설명합니다'
doc_type: 'guide'
keywords: ['감사 로그']
---

import Image from '@theme/IdealImage';
import activity_log_1 from '@site/static/images/cloud/security/activity_log1.png';
import activity_log_2 from '@site/static/images/cloud/security/activity_log2.png';
import activity_log_3 from '@site/static/images/cloud/security/activity_log3.png';


# 콘솔 감사 로그 \{#console-audit-log\}

콘솔에서 수행된 활동은 감사 로그에 기록됩니다. 조직에서 Admin 또는 Developer 역할을 가진 경우, 이 로그를 검토하고 로깅 시스템과 연동할 수 있습니다.

## 사용자 인터페이스를 통해 콘솔 감사 로그에 액세스하기 \{#console-audit-log-ui\}

<VerticalStepper>

## 조직 선택 \{#select-org\}

ClickHouse Cloud에서 조직 세부 정보 페이지로 이동합니다. 

<Image img={activity_log_1} size="md" alt="ClickHouse Cloud 활동 탭" border />

<br/>

## 감사(audit) 선택 \{#select-audit\}

왼쪽 메뉴에서 **Audit** 탭을 선택하여 ClickHouse Cloud 조직에 어떤 변경이 발생했는지, 누가 언제 변경했는지를 확인합니다.

**Activity** 페이지에는 조직과 관련하여 기록된 이벤트 목록이 테이블 형태로 표시됩니다. 기본적으로 이 목록은 최신 이벤트가 맨 위에 오도록 시간 기준 내림차순(최신 순)으로 정렬되어 있습니다. 컬럼 헤더를 클릭하여 테이블의 정렬 순서를 변경할 수 있습니다. 테이블의 각 항목에는 다음 필드가 포함됩니다:

- **Activity:** 이벤트를 설명하는 짧은 텍스트
- **User:** 이벤트를 발생시킨 사용자
- **IP Address:** 해당되는 경우, 이벤트를 발생시킨 사용자의 IP 주소
- **Time:** 이벤트가 발생한 타임스탬프

<Image img={activity_log_2} size="md" alt="ClickHouse Cloud 활동 테이블" border />

<br/>

## 검색 창 사용 \{#use-search-bar\}

검색 창을 사용하여 서비스 이름, IP 주소 등 특정 기준에 따라 이벤트를 필터링할 수 있습니다. 또한 이 정보를 CSV 형식으로 내보내 외부 도구에서 공유하거나 분석할 수 있습니다.

</VerticalStepper>

<div class="eighty-percent">
    <Image img={activity_log_3} size="lg" alt="ClickHouse Cloud 활동 CSV 내보내기" border />
</div>

## API를 통해 콘솔 감사 로그에 액세스하기 \{#console-audit-log-api\}

ClickHouse Cloud API의 `activity` 엔드포인트를 사용하여 감사 이벤트를 내보낼 수 있습니다. 자세한 내용은 [API 참조 문서](https://clickhouse.com/docs/cloud/manage/api/swagger)를 참고하십시오.

## 로그 통합 \{#log-integrations\}

API를 사용하여 원하는 로그 플랫폼과 연동할 수 있습니다. 다음과 같은 기본 제공 커넥터를 지원합니다:

- [Splunk용 ClickHouse Cloud 감사(Audit) 애드온](/integrations/audit-splunk)