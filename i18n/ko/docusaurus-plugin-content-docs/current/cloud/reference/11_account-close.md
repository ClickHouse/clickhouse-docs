---
sidebar_label: '계정 해지'
slug: /cloud/manage/close_account
title: '계정 해지 및 삭제'
description: '때때로 계정을 해지해야 하는 상황이 발생할 수 있습니다. 이 가이드는 해당 절차를 진행하는 데 도움이 됩니다.'
keywords: ['ClickHouse Cloud', '계정 해지', '계정 삭제', 'Cloud 계정 관리', '계정 제거']
doc_type: 'guide'
---

## 계정 종료 및 삭제 \{#account-close--deletion\}

프로젝트를 성공적으로 수행할 수 있도록 지원하는 것이 목표입니다. 이 페이지에서 답을 찾지 못한 질문이 있거나
특별한 사용 사례를 평가하는 데 도움이 필요한 경우 [support@clickhouse.com](mailto:support@clickhouse.com)으로 문의하십시오.

계정을 종료해야 하는 상황이 발생할 수 있다는 점을 이해합니다. 이 가이드는 이러한 계정 종료 절차를 진행하는 데 도움이 됩니다.

## 계정 닫기와 삭제의 차이 \{#close-vs-delete\}

고객은 닫은 계정에 다시 로그인하여 사용량, 결제 및 계정 수준 활동 로그를 조회할 수 있습니다. 이를 통해 사용 사례를 문서화하는 것부터 연말에 세금 목적으로 청구서를 다운로드하는 것까지, 다양한 목적에 유용한 세부 정보를 쉽게 확인할 수 있습니다.
또한 제품 업데이트를 계속 받아 기다리던 기능이 사용 가능해졌는지 알 수 있습니다. 추가로,
닫은 계정은 언제든지 다시 열어 새 서비스를 시작할 수 있습니다.

개인 데이터 삭제를 요청하는 고객은 이 절차가 되돌릴 수 없음을 인지해야 합니다. 계정 및 관련 정보는 더 이상
조회하거나 사용할 수 없습니다. 제품 업데이트를 더 이상 받지 않게 되며, 계정을 다시 열 수도 없습니다. 이는 뉴스레터 구독에는 영향을 미치지 않습니다.

뉴스레터 구독자는 계정을 닫거나 정보를 삭제하지 않고도 뉴스레터 이메일 하단에 있는 구독 취소 링크를 사용하여 언제든지 구독을 취소할 수 있습니다.

## 계정 종료 준비 \{#preparing-for-closure\}

계정 종료를 요청하기 전에, 계정을 정리하기 위해 다음 단계를 수행하십시오.

1. 유지해야 하는 데이터를 서비스에서 모두 내보냅니다.
2. 서비스를 중지하고 삭제합니다. 이렇게 하면 계정에 추가 요금이 발생하는 것을 방지할 수 있습니다.
3. 종료를 요청할 관리자 계정을 제외한 모든 사용자를 제거합니다. 이렇게 하면 절차가 완료되는 동안 새로운 서비스가 생성되지 않도록 하는 데 도움이 됩니다.
4. 컨트롤 패널의 「Usage」 및 「Billing」 탭을 검토하여 모든 요금이 지불되었는지 확인합니다. 미납 금액이 있는 계정은 종료할 수 없습니다.

## 계정 폐쇄 요청 \{#request-account-closure\}

폐쇄 및 삭제 요청 모두에 대해 본인 인증이 필요합니다. 요청이 신속하게 처리될 수 있도록 아래 단계를 수행하십시오.

1. clickhouse.cloud 계정에 로그인합니다.
2. 위의 *Preparing for Closure* 섹션에서 남아 있는 단계를 모두 완료합니다.
3. 도움말 버튼(화면 오른쪽 상단의 물음표)을 클릭합니다.
4. 「Support」에서 「Create case」를 클릭합니다.
5. 「Create new case」 화면에서 다음 내용을 입력합니다.

```text
Priority: Severity 3
Subject: Please close my ClickHouse account
Description: We would appreciate it if you would share a brief note about why you are cancelling.
```

5. &#39;Create new case&#39;를 클릭합니다.
6. 계정을 해지한 후, 처리 완료 시 이를 알려 드리는 확인 이메일을 발송합니다.


## 내 개인 데이터 삭제 요청 \{#request-personal-data-deletion\}

ClickHouse에 개인 데이터 삭제를 요청할 수 있는 사람은 계정 관리자뿐입니다. 계정 관리자가 아닌 경우, 계정에서 본인을 제거해 달라고 요청하기 위해 ClickHouse 계정 관리자에게 문의하십시오.

데이터 삭제를 요청하려면 위의 "Request Account Closure" 섹션에 나와 있는 단계를 따르십시오. 케이스 정보를 입력할 때 제목을 「Please close my ClickHouse account and delete my personal data.」로 변경하십시오.

개인 데이터 삭제 요청은 30일 이내에 완료됩니다.