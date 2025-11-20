---
'slug': '/cloud/manage/postman'
'sidebar_label': 'Postman을 사용한 프로그래매틱 API 액세스'
'title': 'Postman을 사용한 프로그래매틱 API 액세스'
'description': '이 가이드는 Postman을 사용하여 ClickHouse Cloud API를 테스트하는 데 도움을 줄 것입니다.'
'doc_type': 'guide'
'keywords':
- 'api'
- 'postman'
- 'rest api'
- 'cloud management'
- 'integration'
---

import Image from '@theme/IdealImage';
import postman1 from '@site/static/images/cloud/manage/postman/postman1.png';
import postman2 from '@site/static/images/cloud/manage/postman/postman2.png';
import postman3 from '@site/static/images/cloud/manage/postman/postman3.png';
import postman4 from '@site/static/images/cloud/manage/postman/postman4.png';
import postman5 from '@site/static/images/cloud/manage/postman/postman5.png';
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

This guide will help you test the ClickHouse Cloud API using [Postman](https://www.postman.com/product/what-is-postman/). 
The Postman Application is available for use within a web browser or can be downloaded to a desktop.

### Create an account {#create-an-account}

* Free accounts are available at [https://www.postman.com](https://www.postman.com).

<Image img={postman1} size="md" alt="Postman site" border/>

### Create a workspace {#create-a-workspace}

* Name your workspace and set the visibility level. 

<Image img={postman2} size="md" alt="Create workspace" border/>

### Create a collection {#create-a-collection}

* Below "Explore" on the top left Menu click "Import": 

<Image img={postman3} size="md" alt="Explore > Import" border/>

* A modal will appear:

<Image img={postman4} size="md" alt="API URL entry" border/>

* Enter the API address: "https://api.clickhouse.cloud/v1" and press 'Enter':

<Image img={postman5} size="md" alt="Import" border/>

* Select "Postman Collection" by clicking on the "Import" button:

<Image img={postman6} size="md" alt="Collection > Import" border/>

### Interface with the ClickHouse Cloud API spec {#interface-with-the-clickhouse-cloud-api-spec}
* The "API spec for ClickHouse Cloud" will now appear within "Collections" (Left Navigation).

<Image img={postman7} size="md" alt="Import your API" border/>

* Click on "API spec for ClickHouse Cloud." From the middle pain select the 'Authorization' tab:

<Image img={postman8} size="md" alt="Import complete" border/>

### Set authorization {#set-authorization}
* Toggle the dropdown menu to select "Basic Auth":

<Image img={postman9} size="md" alt="Basic auth" border/>

* Enter the Username and Password received when you set up your ClickHouse Cloud API keys:

<Image img={postman10} size="md" alt="credentials" border/>

### Enable variables {#enable-variables}

* [Variables](https://learning.postman.com/docs/sending-requests/variables/) enable the storage and reuse of values in Postman allowing for easier API testing.

#### Set the organization ID and Service ID {#set-the-organization-id-and-service-id}

* Within the "Collection", click the "Variable" tab in the middle pane (The Base URL will have been set by the earlier API import):
* Below `baseURL` click the open field "Add new value", and Substitute your organization ID and service ID:

<Image img={postman11} size="md" alt="Organization ID and Service ID" border/>

## Test the ClickHouse Cloud API functionalities {#test-the-clickhouse-cloud-api-functionalities}

### Test "GET list of available organizations" {#test-get-list-of-available-organizations}

* Under the "OpenAPI spec for ClickHouse Cloud", expand the folder > V1 > organizations
* Click "GET list of available organizations" and press the blue "Send" button on the right:

<Image img={postman12} size="md" alt="Test retrieval of organizations" border/>

* The returned results should deliver your organization details with "status": 200. (If you receive a "status" 400 with no organization information your configuration is not correct).

<Image img={postman13} size="md" alt="Status" border/>

### Test "GET organizational details" {#test-get-organizational-details}

* Under the `organizationid` folder, navigate to "GET organizational details":
* In the middle frame menu under Params an `organizationid` is required.

<Image img={postman14} size="md" alt="Test retrieval of organization details" border/>

* Edit this value with `orgid` in curly braces `{{orgid}}` (From setting this value earlier a menu will appear with the value):

<Image img={postman15} size="md" alt="Submit test" border/>

* After pressing the "Save" button, press the blue "Send" button at the top right of the screen.

<Image img={postman16} size="md" alt="Return value" border/>

* The returned results should deliver your organization details with "status": 200. (If you receive a "status" 400 with no organization information your configuration is not correct).

### Test "GET service details" {#test-get-service-details}

* Click "GET service details"
* Edit the Values for `organizationid` and `serviceid` with `{{orgid}}` and `{{serviceid}}` respectively.
* Press "Save" and then the blue "Send" button on the right.

<Image img={postman17} size="md" alt="List of services" border/>

* The returned results should deliver a list of your services and their details with "status": 200. (If you receive a "status" 400 with no service(s) information your configuration is not correct).

---

This 가이드는 [Postman](https://www.postman.com/product/what-is-postman/)을 사용하여 ClickHouse Cloud API를 테스트하는 데 도움을 줄 것입니다.
Postman 애플리케이션은 웹 브라우저 내에서 사용 가능하거나 데스크톱에 다운로드할 수 있습니다.

### 계정 만들기 {#create-an-account}

* 무료 계정은 [https://www.postman.com](https://www.postman.com)에서 사용할 수 있습니다.

<Image img={postman1} size="md" alt="Postman 사이트" border/>

### 작업 공간 만들기 {#create-a-workspace}

* 작업 공간의 이름을 정하고 가시성 수준을 설정하세요.

<Image img={postman2} size="md" alt="작업 공간 만들기" border/>

### 컬렉션 만들기 {#create-a-collection}

* 왼쪽 상단 메뉴의 "Explore" 아래에서 "Import"를 클릭하세요:

<Image img={postman3} size="md" alt="Explore > Import" border/>

* 모달이 나타납니다:

<Image img={postman4} size="md" alt="API URL 입력" border/>

* API 주소를 입력하세요: "https://api.clickhouse.cloud/v1"와 'Enter'를 누르세요:

<Image img={postman5} size="md" alt="가져오기" border/>

* "Import" 버튼을 클릭하여 "Postman Collection"을 선택하세요:

<Image img={postman6} size="md" alt="Collection > Import" border/>

### ClickHouse Cloud API 사양과 인터페이스 {#interface-with-the-clickhouse-cloud-api-spec}
* "ClickHouse Cloud의 API 사양"이 이제 "컬렉션" 내에 나타납니다 (왼쪽 탐색).

<Image img={postman7} size="md" alt="API 가져오기" border/>

* "ClickHouse Cloud의 API 사양"을 클릭하세요. 중간 패널에서 'Authorization' 탭을 선택하세요:

<Image img={postman8} size="md" alt="가져오기 완료" border/>

### 인증 설정 {#set-authorization}
* 드롭다운 메뉴를 전환하여 "Basic Auth"를 선택하세요:

<Image img={postman9} size="md" alt="기본 인증" border/>

* ClickHouse Cloud API 키를 설정할 때 받은 사용자 이름과 비밀번호를 입력하세요:

<Image img={postman10} size="md" alt="자격 증명" border/>

### 변수를 활성화 {#enable-variables}

* [변수](https://learning.postman.com/docs/sending-requests/variables/)는 Postman에서 값의 저장 및 재사용을 가능하게 하여 API 테스트를 더 쉽게 만들어 줍니다.

#### 조직 ID와 서비스 ID 설정 {#set-the-organization-id-and-service-id}

* "컬렉션" 내에서 중간 패널의 "변수" 탭을 클릭하세요 (Base URL은 이전 API 가져오기로 설정되어 있을 것입니다):
* `baseURL` 아래의 열린 필드 "Add new value"를 클릭하고 조직 ID와 서비스 ID를 대체하십시오:

<Image img={postman11} size="md" alt="조직 ID와 서비스 ID" border/>

## ClickHouse Cloud API 기능 테스트 {#test-the-clickhouse-cloud-api-functionalities}

### "사용 가능한 조직 목록 가져오기" 테스트 {#test-get-list-of-available-organizations}

* "ClickHouse Cloud의 OpenAPI 사양"에서 폴더를 확장하세요 > V1 > organizations
* "사용 가능한 조직 목록 가져오기"를 클릭하고 오른쪽의 파란색 "보내기" 버튼을 누르세요:

<Image img={postman12} size="md" alt="조직 가져오기 테스트" border/>

* 반환된 결과는 "status": 200과 함께 조직 세부 정보를 제공해야 합니다. (조직 정보가 없는 "status" 400을 받으면 구성 설정이 올바르지 않습니다).

<Image img={postman13} size="md" alt="상태" border/>

### "조직 세부 정보 가져오기" 테스트 {#test-get-organizational-details}

* `organizationid` 폴더 아래에서 "조직 세부 정보 가져오기"로 이동하세요:
* 중간 프레임 메뉴의 Params에서 `organizationid`가 필요합니다.

<Image img={postman14} size="md" alt="조직 세부 정보 가져오기 테스트" border/>

* 이 값을 중괄호 `{{orgid}}`로 `orgid`로 수정하세요 (이 값을 설정하면 값이 있는 메뉴가 나타납니다):

<Image img={postman15} size="md" alt="테스트 제출" border/>

* "저장" 버튼을 누른 후 화면 오른쪽 상단에 있는 파란색 "보내기" 버튼을 누르세요.

<Image img={postman16} size="md" alt="반환 값" border/>

* 반환된 결과는 "status": 200과 함께 조직 세부 정보를 제공해야 합니다. (조직 정보가 없는 "status" 400을 받으면 구성 설정이 올바르지 않습니다).

### "서비스 세부 정보 가져오기" 테스트 {#test-get-service-details}

* "서비스 세부 정보 가져오기"를 클릭하세요.
* `organizationid`와 `serviceid`의 값을 각각 `{{orgid}}`와 `{{serviceid}}`로 수정하세요.
* "저장"을 누른 후 오른쪽의 파란색 "보내기" 버튼을 누르세요.

<Image img={postman17} size="md" alt="서비스 목록" border/>

* 반환된 결과는 "status": 200과 함께 서비스 목록과 그 세부 정보를 제공해야 합니다. (서비스 정보가 없는 "status" 400을 받으면 구성 설정이 올바르지 않습니다).
