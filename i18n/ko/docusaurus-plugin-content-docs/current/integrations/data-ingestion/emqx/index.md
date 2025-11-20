---
'sidebar_label': 'EMQX'
'sidebar_position': 1
'slug': '/integrations/emqx'
'description': 'ClickHouse와 함께하는 EMQX 소개'
'title': 'EMQX와 ClickHouse 통합'
'doc_type': 'guide'
'integration':
- 'support_level': 'partner'
- 'category': 'data_ingestion'
'keywords':
- 'EMQX ClickHouse integration'
- 'MQTT ClickHouse connector'
- 'EMQX Cloud ClickHouse'
- 'IoT data ClickHouse'
- 'MQTT broker ClickHouse'
---

import emqx_cloud_artitecture from '@site/static/images/integrations/data-ingestion/emqx/emqx-cloud-artitecture.png';
import clickhouse_cloud_1 from '@site/static/images/integrations/data-ingestion/emqx/clickhouse_cloud_1.png';
import clickhouse_cloud_2 from '@site/static/images/integrations/data-ingestion/emqx/clickhouse_cloud_2.png';
import clickhouse_cloud_3 from '@site/static/images/integrations/data-ingestion/emqx/clickhouse_cloud_3.png';
import clickhouse_cloud_4 from '@site/static/images/integrations/data-ingestion/emqx/clickhouse_cloud_4.png';
import clickhouse_cloud_5 from '@site/static/images/integrations/data-ingestion/emqx/clickhouse_cloud_5.png';
import clickhouse_cloud_6 from '@site/static/images/integrations/data-ingestion/emqx/clickhouse_cloud_6.png';
import emqx_cloud_sign_up from '@site/static/images/integrations/data-ingestion/emqx/emqx_cloud_sign_up.png';
import emqx_cloud_create_1 from '@site/static/images/integrations/data-ingestion/emqx/emqx_cloud_create_1.png';
import emqx_cloud_create_2 from '@site/static/images/integrations/data-ingestion/emqx/emqx_cloud_create_2.png';
import emqx_cloud_overview from '@site/static/images/integrations/data-ingestion/emqx/emqx_cloud_overview.png';
import emqx_cloud_auth from '@site/static/images/integrations/data-ingestion/emqx/emqx_cloud_auth.png';
import emqx_cloud_nat_gateway from '@site/static/images/integrations/data-ingestion/emqx/emqx_cloud_nat_gateway.png';
import emqx_cloud_data_integration from '@site/static/images/integrations/data-ingestion/emqx/emqx_cloud_data_integration.png';
import data_integration_clickhouse from '@site/static/images/integrations/data-ingestion/emqx/data_integration_clickhouse.png';
import data_integration_resource from '@site/static/images/integrations/data-ingestion/emqx/data_integration_resource.png';
import data_integration_rule_1 from '@site/static/images/integrations/data-ingestion/emqx/data_integration_rule_1.png';
import data_integration_rule_2 from '@site/static/images/integrations/data-ingestion/emqx/data_integration_rule_2.png';
import data_integration_rule_action from '@site/static/images/integrations/data-ingestion/emqx/data_integration_rule_action.png';
import data_integration_details from '@site/static/images/integrations/data-ingestion/emqx/data_integration_details.png';
import work_flow from '@site/static/images/integrations/data-ingestion/emqx/work-flow.png';
import mqttx_overview from '@site/static/images/integrations/data-ingestion/emqx/mqttx-overview.png';
import mqttx_new from '@site/static/images/integrations/data-ingestion/emqx/mqttx-new.png';
import mqttx_publish from '@site/static/images/integrations/data-ingestion/emqx/mqttx-publish.png';
import rule_monitor from '@site/static/images/integrations/data-ingestion/emqx/rule_monitor.png';
import clickhouse_result from '@site/static/images/integrations/data-ingestion/emqx/clickhouse_result.png';
import Image from '@theme/IdealImage';


# EMQX와 ClickHouse 통합하기

## EMQX 연결하기 {#connecting-emqx}

[EMQX](https://www.emqx.com/en/try?product=enterprise)는 고성능 실시간 메시지 처리 엔진을 가진 오픈 소스 MQTT 브로커로, 대규모 IoT 디바이스를 위한 이벤트 스트리밍을 지원합니다. 가장 확장성이 뛰어난 MQTT 브로커인 EMQX는 어떤 디바이스든지, 어떤 규모에서도 연결할 수 있도록 도와줍니다. IoT 데이터를 어디에서나 이동하고 처리하세요.

[EMQX Cloud](https://www.emqx.com/en/try?product=cloud)는 [EMQ](https://www.emqx.com/en)가 호스팅하는 IoT 도메인을 위한 MQTT 메시징 미들웨어 제품입니다. 세계 최초의 완전 관리형 MQTT 5.0 클라우드 메시징 서비스인 EMQX Cloud는 MQTT 메시징 서비스에 대한 원스톱 O&M 콜로케이션 및 독립적인 환경을 제공합니다. 모든 것이 연결되는 시대에 EMQX Cloud는 IoT 도메인을 위한 산업 애플리케이션을 신속하게 구축하고 IoT 데이터를 쉽고 빠르게 수집, 전송, 계산 및 저장할 수 있도록 지원합니다.

클라우드 제공업체가 제공하는 인프라를 통해 EMQX Cloud는 전 세계 여러 국가와 지역에 저렴하고 안전하며 신뢰할 수 있는 클라우드 서비스를 제공하여 5G 및 모든 것의 인터넷 애플리케이션을 지원합니다.

<Image img={emqx_cloud_artitecture} size="lg" border alt="EMQX Cloud Architecture diagram showing cloud infrastructure components" />

### 가정사항 {#assumptions}

* 당신은 최대한 가벼운 게시/구독 메시지 전송 프로토콜로 설계된 [MQTT 프로토콜](https://mqtt.org/)에 익숙합니다.
* 당신은 대규모 IoT 디바이스를 위한 실시간 메시지 처리 엔진으로 EMQX 또는 EMQX Cloud를 사용하고 있습니다.
* 기기 데이터를 영구 저장하기 위해 Clickhouse Cloud 인스턴스를 준비했습니다.
* 우리는 [MQTT X](https://mqttx.app/)를 MQTT 데이터 발행을 위해 EMQX Cloud 배포와 연결하는 MQTT 클라이언트 테스트 도구로 사용하고 있습니다. 또는 MQTT 브로커에 연결하는 다른 방법도 가능합니다.

## ClickHouse Cloud 서비스 받기 {#get-your-clickhouse-cloudservice}

이 설정 중에, 우리는 AWS의 N. Virginia (us-east -1)에서 ClickHouse 인스턴스를 배포했으며, EMQX Cloud 인스턴스도 같은 지역에 배포했습니다.

<Image img={clickhouse_cloud_1} size="sm" border alt="ClickHouse Cloud Service Deployment interface showing AWS region selection" />

설정 프로세스 동안, 연결 설정에 주의해야 합니다. 이 튜토리얼에서는 "어디서나"를 선택하지만, 특정 위치를 신청하는 경우 EMQX Cloud 배포에서 얻은 [NAT gateway](https://docs.emqx.com/en/cloud/latest/vas/nat-gateway.html) IP 주소를 화이트리스트에 추가해야 합니다.

<Image img={clickhouse_cloud_2} size="sm" border alt="ClickHouse Cloud Connection Settings showing IP access configuration" />

그런 다음 나중에 사용할 수 있도록 사용자 이름과 비밀번호를 저장해야 합니다.

<Image img={clickhouse_cloud_3} size="sm" border alt="ClickHouse Cloud Credentials screen showing username and password" />

그 후에, 실행 중인 ClickHouse 인스턴스를 얻게 됩니다. "연결"을 클릭하여 ClickHouse Cloud의 인스턴스 연결 주소를 얻으세요.

<Image img={clickhouse_cloud_4} size="lg" border alt="ClickHouse Cloud Running Instance dashboard with connection options" />

EMQX Cloud와의 통합을 위해 데이터베이스와 테이블을 생성하려면 "SQL 콘솔에 연결"을 클릭하세요.

<Image img={clickhouse_cloud_5} size="lg" border alt="ClickHouse Cloud SQL Console interface" />

다음 SQL 문을 참조하거나 실제 상황에 맞게 SQL을 수정할 수 있습니다.

```sql
CREATE TABLE emqx.temp_hum
(
   client_id String,
   timestamp DateTime,
   topic String,
   temp Float32,
   hum Float32
)
ENGINE = MergeTree()
PRIMARY KEY (client_id, timestamp)
```

<Image img={clickhouse_cloud_6} size="lg" border alt="ClickHouse Cloud Create Database and Table SQL query execution" />

## EMQX Cloud에서 MQTT 서비스 생성하기 {#create-an-mqtt-service-on-emqx-cloud}

EMQX Cloud에서 전용 MQTT 브로커를 만드는 것은 몇 번의 클릭으로 가능합니다.

### 계정 얻기 {#get-an-account}

EMQX Cloud는 모든 계정에 대해 표준 배포 및 전문 배포 모두에 대한 14일 무료 평가판을 제공합니다.

[EMQX Cloud 가입](https://accounts.emqx.com/signup?continue=https%3A%2F%2Fwww.emqx.com%2Fen%2Fcloud) 페이지에서 시작하여, EMQX Cloud가 처음이라면 "무료 시작" 버튼을 클릭하여 계정을 등록하세요.

<Image img={emqx_cloud_sign_up} size="lg" border alt="EMQX Cloud Signup Page with registration form" />

### MQTT 클러스터 생성하기 {#create-an-mqtt-cluster}

로그인 후, 계정 메뉴 아래의 "Cloud console"을 클릭하면 새로운 배포를 생성할 수 있는 초록색 버튼이 보입니다.

<Image img={emqx_cloud_create_1} size="lg" border alt="EMQX Cloud Create Deployment Step 1 showing deployment options" />

이 튜토리얼에서는 Pro 버전만 데이터 통합 기능을 제공하므로 전문 배포를 사용할 것입니다. Pro 버전을 선택하고 `N.Virginial` 지역을 선택한 후 `지금 생성`을 클릭하세요. 단 몇 분 안에 완전 관리형 MQTT 브로커를 얻게 될 것입니다:

<Image img={emqx_cloud_create_2} size="lg" border alt="EMQX Cloud Create Deployment Step 2 showing region selection" />

이제 패널을 클릭하여 클러스터 뷰로 이동합니다. 이 대시보드에서 MQTT 브로커의 개요를 볼 수 있습니다.

<Image img={emqx_cloud_overview} size="lg" border alt="EMQX Cloud Overview Dashboard showing broker metrics" />

### 클라이언트 인증 정보 추가하기 {#add-client-credential}

EMQX Cloud는 기본적으로 익명 연결을 허용하지 않으므로, MQTT 클라이언트 도구에서 이 브로커에 데이터를 전송할 수 있도록 클라이언트 인증 정보를 추가해야 합니다.

왼쪽 메뉴에서 '인증 및 ACL'을 클릭하고 하위 메뉴에서 '인증'을 클릭합니다. 오른쪽에서 '추가' 버튼을 클릭하고 이후의 MQTT 연결을 위해 사용자 이름과 비밀번호를 지정합니다. 여기에서는 사용자 이름과 비밀번호로 `emqx`와 `xxxxxx`를 사용하겠습니다.

<Image img={emqx_cloud_auth} size="lg" border alt="EMQX Cloud Authentication Setup interface for adding credentials" />

'확인'을 클릭하면 이제 완전 관리형 MQTT 브로커가 준비되었습니다.

### NAT 게이트웨이 활성화 {#enable-nat-gateway}

ClickHouse 통합을 설정하기 전에 먼저 NAT 게이트웨이를 활성화해야 합니다. 기본적으로 MQTT 브로커는 공용 네트워크를 통해 제3자 시스템에 데이터를 전송할 수 없는 사설 VPC에 배포됩니다.

개요 페이지로 돌아가서 페이지 하단으로 스크롤하면 NAT 게이트웨이 위젯을 볼 수 있습니다. '구독' 버튼을 클릭하고 지침을 따르세요. NAT 게이트웨이는 부가 가치 서비스이지만 14일 무료 평가판도 제공합니다.

<Image img={emqx_cloud_nat_gateway} size="lg" border alt="EMQX Cloud NAT Gateway Configuration panel" />

생성된 후 위젯에서 공인 IP 주소를 찾을 수 있습니다. ClickHouse Cloud 설정 중에 "특정 위치에서 연결"을 선택한 경우 이 IP 주소를 화이트리스트에 추가해야 합니다.

## EMQX Cloud와 ClickHouse Cloud 통합하기 {#integration-emqx-cloud-with-clickhouse-cloud}

[EMQX Cloud 데이터 통합](https://docs.emqx.com/en/cloud/latest/rule_engine/introduction.html#general-flow)은 EMQX 메시지 흐름 및 장치 이벤트를 처리하고 응답하기 위한 규칙을 구성하는 데 사용됩니다. 데이터 통합은 명확하고 유연한 "구성 가능한" 아키텍처 솔루션을 제공할 뿐만 아니라 개발 프로세스를 단순화하고 사용자의 편의성을 향상시키며 비즈니스 시스템과 EMQX Cloud 간의 결합 정도를 줄여줍니다. 또한 EMQX Cloud의 독점 기능을 사용자화하기 위한 뛰어난 인프라를 제공합니다.

<Image img={emqx_cloud_data_integration} size="lg" border alt="EMQX Cloud Data Integration Options showing available connectors" />

EMQX Cloud는 인기 있는 데이터 시스템과 30개 이상의 네이티브 통합을 제공합니다. ClickHouse는 그 중 하나입니다.

<Image img={data_integration_clickhouse} size="lg" border alt="EMQX Cloud ClickHouse Data Integration connector details" />

### ClickHouse 리소스 생성하기 {#create-clickhouse-resource}

왼쪽 메뉴에서 "데이터 통합"을 클릭하고 "모든 리소스 보기"를 클릭하세요. 데이터 지속성 섹션에서 ClickHouse를 찾으거나 ClickHouse를 검색할 수 있습니다.

ClickHouse 카드를 클릭하여 새 리소스를 생성하세요.

- 참고: 이 리소스에 대한 메모를 추가하세요.
- 서버 주소: 이것은 ClickHouse Cloud 서비스의 주소입니다. 포트를 잊지 마세요.
- 데이터베이스 이름: 위 단계에서 생성한 `emqx`.
- 사용자: ClickHouse Cloud 서비스에 연결하기 위한 사용자 이름.
- 키: 연결을 위한 비밀번호.

<Image img={data_integration_resource} size="lg" border alt="EMQX Cloud ClickHouse Resource Setup form with connection details" />

### 새 규칙 생성하기 {#create-a-new-rule}

리소스를 생성하는 동안 팝업이 표시되고 '새로운'을 클릭하면 규칙 생성 페이지로 이동합니다.

EMQX는 원시 MQTT 메시지를 변환하고 풍부하게 만들어 제3자 시스템으로 전송하기 위한 강력한 [규칙 엔진](https://docs.emqx.com/en/cloud/latest/rule_engine/rules.html)을 제공합니다.

다음은 이 튜토리얼에 사용된 규칙입니다:

```sql
SELECT
   clientid AS client_id,
   (timestamp div 1000) AS timestamp,
   topic AS topic,
   payload.temp AS temp,
   payload.hum AS hum
FROM
"temp_hum/emqx"
```

이 규칙은 `temp_hum/emqx` 주제에서 메시지를 읽고 클라이언트 ID, 주제 및 타임스탬프 정보를 추가하여 JSON 객체를 풍부하게 만듭니다.

따라서 주제로 보낸 원시 JSON:

```bash
{"temp": 28.5, "hum": 0.68}
```

<Image img={data_integration_rule_1} size="md" border alt="EMQX Cloud Data Integration Rule Creation Step 1 showing SQL query" />

SQL 테스트를 사용하여 결과를 확인할 수 있습니다.

<Image img={data_integration_rule_2} size="md" border alt="EMQX Cloud Data Integration Rule Creation Step 2 showing test results" />

이제 "다음" 버튼을 클릭합니다. 이 단계는 EMQX Cloud에 정제된 데이터를 ClickHouse 데이터베이스에 삽입하는 방법을 알려주는 것입니다.

### 응답 작업 추가하기 {#add-a-response-action}

리소스가 하나만 있을 경우 '리소스'와 '작업 유형'을 수정할 필요가 없습니다. SQL 템플릿만 설정하면 됩니다. 이 튜토리얼에 사용된 예는 다음과 같습니다:

```bash
INSERT INTO temp_hum (client_id, timestamp, topic, temp, hum) VALUES ('${client_id}', ${timestamp}, '${topic}', ${temp}, ${hum})
```

<Image img={data_integration_rule_action} size="md" border alt="EMQX Cloud Data Integration Rule Action Setup with SQL template" />

これは Clickhouseにデータを挿入するためのテンプレートで、ここでは変数が使用されているのがわかります。

### 규칙 세부정보 보기 {#view-rules-details}

'확인'을 클릭하고 '세부 정보 보기'를 클릭합니다. 이제 모든 것이 잘 설정되었어야 합니다. 규칙 세부정보 페이지에서 데이터 통합이 작동하는 것을 볼 수 있습니다.

<Image img={data_integration_details} size="md" border alt="EMQX Cloud Data Integration Rule Details showing configuration summary" />

`temp_hum/emqx` 주제로 전송된 모든 MQTT 메시지는 ClickHouse Cloud 데이터베이스에 지속적으로 저장됩니다.

## ClickHouse에 데이터 저장하기 {#saving-data-into-clickhouse}

온도와 습도 데이터를 시뮬레이션하고 이 데이터를 MQTT X를 통해 EMQX Cloud에 보고한 후 EMQX Cloud 데이터 통합을 사용하여 ClickHouse Cloud에 데이터를 저장할 것입니다.

<Image img={work_flow} size="lg" border alt="EMQX Cloud to ClickHouse Workflow diagram showing data flow" />

### MQTT 메시지를 EMQX Cloud에 발행하기 {#publish-mqtt-messages-to-emqx-cloud}

임의의 MQTT 클라이언트 또는 SDK를 사용하여 메시지를 발행할 수 있습니다. 이 튜토리얼에서는 EMQ가 제공하는 사용자 친화적인 MQTT 클라이언트 응용 프로그램인 [MQTT X](https://mqttx.app/)를 사용합니다.

<Image img={mqttx_overview} size="lg" border alt="MQTTX Overview showing the client interface" />

MQTTX에서 "새 연결"을 클릭하고 연결 양식을 작성합니다:

- 이름: 연결 이름. 원하는 이름을 사용하세요.
- 호스트: MQTT 브로커 연결 주소. EMQX Cloud 개요 페이지에서 얻을 수 있습니다.
- 포트: MQTT 브로커 연결 포트. EMQX Cloud 개요 페이지에서 얻을 수 있습니다.
- 사용자 이름/비밀번호: 위에서 만든 인증 정보를 사용하세요. 이 튜토리얼에서는 `emqx`와 `xxxxxx`를 사용합니다.

<Image img={mqttx_new} size="lg" border alt="MQTTX New Connection Setup form with connection details" />

오른쪽 상단의 "연결" 버튼을 클릭하면 연결이 확립되어야 합니다.

이제 이 도구를 사용하여 MQTT 브로커로 메시지를 보낼 수 있습니다. 
입력사항:
1. 페이로드 형식을 "JSON"으로 설정합니다.
2. 주제를 `temp_hum/emqx`로 설정합니다 (규칙에서 방금 설정한 주제).
3. JSON 본문:

```bash
{"temp": 23.1, "hum": 0.68}
```

오른쪽의 전송 버튼을 클릭합니다. 온도 값을 변경하고 MQTT 브로커에 더 많은 데이터를 보낼 수 있습니다.

EMQX Cloud로 전송된 데이터는 규칙 엔진에 의해 처리되어 ClickHouse Cloud에 자동으로 삽입됩니다.

<Image img={mqttx_publish} size="lg" border alt="MQTTX Publish MQTT Messages interface showing message composition" />

### 규칙 모니터링 보기 {#view-rules-monitoring}

규칙 모니터링을 확인하고 성공 횟수에 1을 추가하세요.

<Image img={rule_monitor} size="lg" border alt="EMQX Cloud Rule Monitoring dashboard showing message processing metrics" />

### 지속된 데이터 확인하기 {#check-the-data-persisted}

이제 ClickHouse Cloud에서 데이터를 확인할 시간입니다. 이상적으로 MQTTX를 사용하여 전송한 데이터는 EMQX Cloud로 이동하여 네이티브 데이터 통합의 도움으로 ClickHouse Cloud 데이터베이스에 지속적으로 저장됩니다.

ClickHouse Cloud 패널의 SQL 콘솔에 연결하거나 ClickHouse에서 데이터를 가져오려면 어떤 클라이언트 도구를 사용할 수 있습니다. 이 튜토리얼에서는 SQL 콘솔을 사용했습니다.
SQL을 실행하여:

```bash
SELECT * FROM emqx.temp_hum;
```

<Image img={clickhouse_result} size="lg" border alt="ClickHouse Query Results showing persisted IoT data" />

### 요약 {#summary}

코드를 한 줄도 작성하지 않고 이제 EMQX 클라우드에서 ClickHouse Cloud로 MQTT 데이터가 이동했습니다. EMQX Cloud와 ClickHouse Cloud를 사용하면 인프라를 관리할 필요가 없으며, ClickHouse Cloud에 안전하게 저장된 데이터로 IoT 애플리케이션에 집중할 수 있습니다.
