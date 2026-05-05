---
sidebar_label: '콘솔 감사 로그 이벤트'
slug: /cloud/security/audit-logging
title: '콘솔 감사 로그 이벤트'
description: '이 페이지에서는 콘솔 감사 로그에 기록되는 이벤트를 설명합니다.'
doc_type: 'reference'
keywords: ['감사 로깅', '보안', '컴플라이언스', '로그', '모니터링']
---



## 콘솔 감사 로그 이벤트 \{#console-audit-log-events\}

조직에 대해 수집되는 다양한 유형의 이벤트는 **조직(Organization)**, **서비스(Service)**, **사용자(User)**의 3가지 범주로 그룹화됩니다. 감사 로그와 이를 내보내는 방법 또는 API 연동을 추가하는 방법에 대해서는 위 가이드 섹션에 있는 [console audit log](/cloud/security/audit-logging/console-audit-log) 문서를 참조하십시오.

다음 이벤트가 감사 로그에 기록됩니다.

### Organization \{#organization\}

- 조직 생성
- 조직 삭제
- 조직 이름 변경

### Service \{#service\}

- 서비스 생성
- 서비스 삭제
- 서비스 중지
- 서비스 시작
- 서비스 이름 변경
- 서비스 IP 액세스 목록 변경
- 서비스 비밀번호 재설정

### User \{#user\}

- 사용자 역할 변경
- 조직에서 사용자 제거
- 조직에 사용자 초대
- 조직에 사용자 참여
- 사용자 초대 삭제
- 조직에서 사용자 탈퇴
