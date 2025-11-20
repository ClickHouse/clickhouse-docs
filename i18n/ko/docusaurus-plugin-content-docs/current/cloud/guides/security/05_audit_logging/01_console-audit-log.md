---
'sidebar_label': '콘솔 감사 로그'
'slug': '/cloud/security/audit-logging/console-audit-log'
'title': '콘솔 감사 로그'
'description': '이 페이지는 사용자가 클라우드 감사 로그를 검토하는 방법을 설명합니다.'
'doc_type': 'guide'
'keywords':
- 'audit log'
---

import Image from '@theme/IdealImage';
import activity_log_1 from '@site/static/images/cloud/security/activity_log1.png';
import activity_log_2 from '@site/static/images/cloud/security/activity_log2.png';
import activity_log_3 from '@site/static/images/cloud/security/activity_log3.png';


# Console audit log {#console-audit-log}

사용자 콘솔 활동은 감사 로그에 기록되며, 이는 Admin 또는 Developer 조직 역할을 가진 사용자가 검토하고 로깅 시스템과 통합할 수 있습니다. 콘솔 감사 로그에 포함된 특정 이벤트는 다음에 표시됩니다.

## 사용자 인터페이스를 통한 콘솔 로그 접근 {#console-audit-log-ui}

<VerticalStepper>

## 조직 선택 {#select-org}

ClickHouse Cloud에서 조직 세부정보로 이동합니다.

<Image img={activity_log_1} size="md" alt="ClickHouse Cloud activity tab" border />

<br/>

## 감사 선택 {#select-audit}

왼쪽 메뉴에서 **Audit** 탭을 선택하여 귀하의 ClickHouse Cloud 조직에서 어떤 변경 사항이 있었는지 확인합니다 - 누가 변경했는지와 언제 발생했는지 포함하여.

**Activity** 페이지는 조직에 대해 기록된 이벤트 목록이 포함된 테이블을 표시합니다. 기본적으로 이 목록은 역순으로 정렬되어 있습니다 (가장 최근 이벤트가 맨 위에). 열 헤더를 클릭하여 테이블의 순서를 변경할 수 있습니다. 테이블의 각 항목은 다음 필드를 포함합니다:

- **Activity:** 이벤트를 설명하는 텍스트 조각
- **User:** 이벤트를 시작한 사용자
- **IP Address:** 해당되는 경우, 이 필드는 이벤트를 시작한 사용자의 IP 주소를 나열합니다
- **Time:** 이벤트의 타임스탬프

<Image img={activity_log_2} size="md" alt="ClickHouse Cloud Activity Table" border />

<br/>

## 검색 바 사용 {#use-search-bar}

검색 바를 사용하여 서비스 이름 또는 IP 주소와 같은 특정 기준에 따라 이벤트를 필터링할 수 있습니다. 또한 이 정보를 CSV 형식으로 내보내어 배포하거나 외부 도구에서 분석할 수 있습니다.

</VerticalStepper>

<div class="eighty-percent">
    <Image img={activity_log_3} size="lg" alt="ClickHouse Cloud Activity CSV export" border />
</div>

## API를 통한 콘솔 감사 로그 접근 {#console-audit-log-api}

사용자는 ClickHouse Cloud API `activity` 엔드포인트를 사용하여 감사 이벤트의 내보내기를 가져올 수 있습니다. 자세한 내용은 [API reference](https://clickhouse.com/docs/cloud/manage/api/swagger)에서 확인할 수 있습니다.

## 로그 통합 {#log-integrations}

사용자는 API를 사용하여 원하는 로깅 플랫폼과 통합할 수 있습니다. 다음은 기본 제공되는 커넥터입니다:
- [ClickHouse Cloud Audit add-on for Splunk](/integrations/audit-splunk)
