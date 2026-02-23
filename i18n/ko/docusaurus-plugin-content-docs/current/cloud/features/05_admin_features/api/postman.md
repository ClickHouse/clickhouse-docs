---
slug: /cloud/manage/postman
sidebar_label: 'Postman을 사용한 프로그래밍 방식 API 액세스'
title: 'Postman을 사용한 프로그래밍 방식 API 액세스'
description: '이 가이드는 Postman을 사용하여 ClickHouse Cloud API를 테스트하는 방법을 설명합니다'
doc_type: 'guide'
keywords: ['api', 'postman', 'rest api', 'cloud management', 'integration']
---

import Image from '@theme/IdealImage';
import postman1 from '@site/static/images/cloud/manage/postman/postman1.png';
import postman2 from '@site/static/images/cloud/manage/postman/postman2.png';
import postman3 from '@site/static/images/cloud/manage/postman/postman3.png';
import postman4 from '@site/static/images/cloud/manage/postman/postman4.png';
import postman6 from '@site/static/images/cloud/manage/postman/postman6.png';
import postman7 from '@site/static/images/cloud/manage/postman/postman7.png';
import postman8 from '@site/static/images/cloud/manage/postman/postman8.png';
import postman9 from '@site/static/images/cloud/manage/postman/postman9.png';
import postman10 from '@site/static/images/cloud/manage/postman/postman10.png';
import postman11 from '@site/static/images/cloud/manage/postman/postman11.png';
import postman12 from '@site/static/images/cloud/manage/postman/postman12.png';
import postman13 from '@site/static/images/cloud/manage/postman/postman13.png';
import postman14 from '@site/static/images/cloud/manage/postman/postman14.png';
import postman15 from '@site/static/images/cloud/manage/postman/postman15.png';
import postman16 from '@site/static/images/cloud/manage/postman/postman16.png';
import postman17 from '@site/static/images/cloud/manage/postman/postman17.png';

이 가이드는 [Postman](https://www.postman.com/product/what-is-postman/)을 사용하여 ClickHouse Cloud API를 테스트하는 방법을 설명합니다.
Postman 애플리케이션은 웹 브라우저에서 바로 사용하거나 데스크톱에 다운로드하여 사용할 수 있습니다.


### 계정 만들기 \{#create-an-account\}

* 무료 계정은 [https://www.postman.com](https://www.postman.com)에서 생성할 수 있습니다.

<Image img={postman1} size="md" alt="Postman 사이트" border/>

### 워크스페이스 생성 \{#create-a-workspace\}

* 워크스페이스 이름을 지정하고 공개 수준을 설정합니다. 

<Image img={postman2} size="md" alt="워크스페이스 생성" border/>

### 컬렉션 생성 \{#create-a-collection\}

* 왼쪽 상단 메뉴에서 "Explore" 아래에 있는 "Import"를 클릭합니다. 

<Image img={postman3} size="md" alt="Explore > Import" border/>

* 모달 창이 표시됩니다.

<Image img={postman4} size="md" alt="API URL 입력" border/>

* API 주소 "https://api.clickhouse.cloud/v1"를 입력하고 Enter 키를 누릅니다.

* "Import" 버튼을 클릭하여 "Postman Collection"을 선택합니다.

<Image img={postman6} size="md" alt="Collection > Import" border/>

### ClickHouse Cloud API 사양과 연동 \{#interface-with-the-clickhouse-cloud-api-spec\}

* 이제 왼쪽 내비게이션의 「Collections」 아래에 「API spec for ClickHouse Cloud」가 표시됩니다.

<Image img={postman7} size="md" alt="Import your API" border/>

* 「API spec for ClickHouse Cloud」를 클릭한 후, 가운데 패널에서 'Authorization' 탭을 선택합니다.

<Image img={postman8} size="md" alt="Import complete" border/>

### 인증 설정 \{#set-authorization\}

* 드롭다운 메뉴에서 "Basic Auth"를 선택합니다.

<Image img={postman9} size="md" alt="Basic auth" border/>

* ClickHouse Cloud API 키를 설정할 때 받은 Username과 Password를 입력합니다.

<Image img={postman10} size="md" alt="credentials" border/>

### 변수 활성화 \{#enable-variables\}

* [Variables](https://learning.postman.com/docs/sending-requests/variables/)을(를) 사용하면 Postman에서 값을 저장하고 재사용하여 API 테스트를 보다 쉽게 수행할 수 있습니다.

#### 조직 ID와 Service ID 설정 \{#set-the-organization-id-and-service-id\}

* 「Collection」 내에서 중앙 창의 「Variable」 탭을 클릭합니다(Base URL은 이전 단계에서 API를 가져올 때 이미 설정되어 있습니다).
* `baseURL` 아래의 입력 필드 「Add new value」를 클릭한 다음, 조직 ID와 Service ID로 값을 바꿉니다.

<Image img={postman11} size="md" alt="조직 ID와 Service ID" border/>

## ClickHouse Cloud API 기능 테스트 \{#test-the-clickhouse-cloud-api-functionalities\}

### "GET list of available organizations" 테스트 \{#test-get-list-of-available-organizations\}

* "OpenAPI spec for ClickHouse Cloud"에서 V1 > organizations 폴더를 펼칩니다.
* "GET list of available organizations"를 클릭한 다음, 오른쪽의 파란색 "Send" 버튼을 누릅니다:

<Image img={postman12} size="md" alt="조직 조회 테스트" border/>

* 응답 결과에 "status": 200과 함께 조직 상세 정보가 표시되어야 합니다. ("status"가 400이고 조직 정보가 없다면 설정이 올바르지 않은 것입니다.)

<Image img={postman13} size="md" alt="상태" border/>

### "GET organizational details" 테스트 \{#test-get-organizational-details\}

* `organizationid` 폴더에서 "GET organizational details"로 이동합니다.
* 가운데 프레임의 Params 메뉴에서 `organizationid` 값을 입력해야 합니다.

<Image img={postman14} size="md" alt="조직 상세 정보 조회 테스트" border/>

* 이 값을 중괄호 `{{orgid}}` 안의 `orgid`로 수정합니다(이 값을 앞에서 설정했다면 해당 값이 미리 채워진 메뉴가 나타납니다).

<Image img={postman15} size="md" alt="테스트 전송" border/>

* "Save" 버튼을 누른 후 화면 오른쪽 상단의 파란색 "Send" 버튼을 누릅니다.

<Image img={postman16} size="md" alt="반환값" border/>

* 반환 결과에는 "status": 200과 함께 조직 상세 정보가 포함되어야 합니다. ("status"가 400이고 조직 정보가 없다면 구성이 올바르게 설정되지 않은 것입니다).

### "GET service details" 테스트 \{#test-get-service-details\}

* "GET service details"를 클릭합니다.
* `organizationid`와 `serviceid`의 값을 각각 `{{orgid}}`와 `{{serviceid}}`로 수정합니다.
* "Save"를 누른 다음, 오른쪽에 있는 파란색 "Send" 버튼을 누릅니다.

<Image img={postman17} size="md" alt="서비스 목록" border/>

* 반환된 결과에는 "status": 200과 함께 서비스 목록과 각 서비스의 세부 정보가 표시되어야 합니다. ("status" 400이 반환되고 서비스 정보가 없다면 구성에 문제가 있는 것입니다.)