---
sidebar_label: 'EMQX'
sidebar_position: 1
slug: /integrations/emqx
description: 'ClickHouse와의 통합을 위한 EMQX 소개'
title: 'EMQX와 ClickHouse 통합'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_ingestion'
keywords: ['EMQX ClickHouse 통합', 'MQTT ClickHouse 커넥터', 'EMQX Cloud ClickHouse', 'IoT 데이터 ClickHouse']
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


# EMQX를 ClickHouse와 연동하기 \{#integrating-emqx-with-clickhouse\}

## EMQX 연결 \{#connecting-emqx\}

[EMQX](https://www.emqx.com/en/try?product=enterprise)는 고성능 실시간 메시지 처리 엔진을 제공하는 오픈 소스 MQTT 브로커로, 대규모 IoT 디바이스의 이벤트 스트리밍을 처리합니다. 가장 확장성이 뛰어난 MQTT 브로커인 EMQX는 어떤 디바이스든, 어떤 규모로든 연결하는 데 도움을 줍니다. 어디서나 IoT 데이터를 전송하고 처리하십시오.

[EMQX Cloud](https://www.emqx.com/en/try?product=cloud)는 [EMQ](https://www.emqx.com/en)가 호스팅하는 IoT 분야용 MQTT 메시징 미들웨어 제품입니다. 세계 최초의 완전 관리형 MQTT 5.0 클라우드 메시징 서비스로서, EMQX Cloud는 원스톱 운영 및 관리(O&M)와 MQTT 메시징 서비스를 위한 고유한 격리 환경을 제공합니다. 만물인터넷 시대에 EMQX Cloud는 IoT 분야용 산업 애플리케이션을 빠르게 구축하고, IoT 데이터를 손쉽게 수집·전송·처리·영구 보관하도록 도와줍니다.

클라우드 사업자가 제공하는 인프라를 기반으로 EMQX Cloud는 전 세계 수십 개 국가와 지역에 서비스를 제공하며, 5G와 만물인터넷 애플리케이션을 위해 저렴하면서도 안전하고 신뢰할 수 있는 클라우드 서비스를 제공합니다.

<Image img={emqx_cloud_artitecture} size="lg" border alt="클라우드 인프라 구성 요소를 보여 주는 EMQX Cloud 아키텍처 다이어그램" />

### 가정 사항 \{#assumptions\}

* MQTT 프로토콜이 극도로 경량화된 게시/구독 메시징 전송 프로토콜이라는 점을 알고 있다고 가정합니다. 자세한 내용은 [MQTT protocol](https://mqtt.org/)을 참고하십시오.
* 대규모 IoT 디바이스의 이벤트 스트리밍을 처리하는 실시간 메시지 처리 엔진으로 EMQX 또는 EMQX Cloud를 사용하고 있습니다.
* 디바이스 데이터를 지속적으로 저장하기 위해 ClickHouse Cloud 인스턴스를 준비해 두었습니다.
* EMQX Cloud 배포에 연결하여 MQTT 데이터를 발행하기 위한 MQTT 클라이언트 테스트 도구로 [MQTT X](https://mqttx.app/)를 사용합니다. MQTT 브로커에 연결할 수 있는 다른 방법을 사용해도 무방합니다.

## ClickHouse Cloud 서비스 준비하기 \{#get-your-clickhouse-cloudservice\}

이 설정 과정에서 ClickHouse 인스턴스를 AWS N. Virginia(us-east-1) 리전에 배포하였으며, EMQX Cloud 인스턴스도 같은 리전에 배포하였습니다.

<Image img={clickhouse_cloud_1} size="sm" border alt="AWS 리전 선택을 보여 주는 ClickHouse Cloud 서비스 배포 인터페이스" />

설정 과정에서 연결 설정도 주의해서 확인해야 합니다. 이 튜토리얼에서는 &quot;Anywhere&quot;를 선택하지만, 특정 위치를 선택한 경우에는 EMQX Cloud 배포에서 확인한 [NAT gateway](https://docs.emqx.com/en/cloud/latest/vas/nat-gateway.html) IP 주소를 허용 목록에 추가해야 합니다.

<Image img={clickhouse_cloud_2} size="sm" border alt="IP 액세스 구성을 보여 주는 ClickHouse Cloud 연결 설정 화면" />

이후 나중에 사용하기 위해 사용자 이름과 비밀번호를 저장해 두어야 합니다.

<Image img={clickhouse_cloud_3} size="sm" border alt="사용자 이름과 비밀번호를 보여 주는 ClickHouse Cloud 자격 증명 화면" />

그다음 실행 중인 ClickHouse 인스턴스가 생성됩니다. ClickHouse Cloud 인스턴스의 연결 주소를 확인하려면 &quot;Connect&quot;를 클릭하십시오.

<Image img={clickhouse_cloud_4} size="lg" border alt="연결 옵션이 표시된 ClickHouse Cloud 실행 중 인스턴스 대시보드" />

EMQX Cloud와의 연동을 위한 데이터베이스와 테이블을 생성하려면 &quot;Connect to SQL Console&quot;을 클릭하십시오.

<Image img={clickhouse_cloud_5} size="lg" border alt="ClickHouse Cloud SQL 콘솔 인터페이스" />

다음 SQL 문을 참고하거나 실제 환경에 맞게 SQL을 수정하여 사용하면 됩니다.

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

<Image img={clickhouse_cloud_6} size="lg" border alt="ClickHouse Cloud에서 데이터베이스와 테이블을 생성하는 SQL 쿼리 실행" />


## EMQX Cloud에서 MQTT 서비스 생성하기 \{#create-an-mqtt-service-on-emqx-cloud\}

EMQX Cloud에서는 몇 번만 클릭하면 전용 MQTT 브로커를 만들 수 있습니다.

### 계정 만들기 \{#get-an-account\}

EMQX Cloud는 모든 계정에 대해 표준 배포와 프로페셔널 배포 모두에 14일간 무료 체험을 제공합니다.

EMQX Cloud를 처음 사용하는 경우 [EMQX Cloud 회원 가입](https://accounts.emqx.com/signup?continue=https%3A%2F%2Fwww.emqx.com%2Fen%2Fcloud) 페이지로 이동해 「Start free」를 클릭하여 계정을 등록합니다.

<Image img={emqx_cloud_sign_up} size="lg" border alt="등록 양식이 있는 EMQX Cloud 회원 가입 페이지" />

### MQTT 클러스터 생성 \{#create-an-mqtt-cluster\}

로그인한 후 계정 메뉴에서 「Cloud console」을 클릭하면 새 배포를 생성할 수 있는 녹색 버튼이 표시됩니다.

<Image img={emqx_cloud_create_1} size="lg" border alt="EMQX Cloud Create Deployment Step 1 showing deployment options" />

이 튜토리얼에서는 Professional 배포를 사용합니다. 데이터 통합 기능을 제공하는 버전은 Pro 버전뿐이며, 이를 통해 단 한 줄의 코드도 작성하지 않고 MQTT 데이터를 ClickHouse로 직접 전송할 수 있습니다.

Pro 버전을 선택하고 `N.Virginial` 리전을 선택한 다음 `Create Now`를 클릭하십시오. 몇 분만 기다리면 완전 관리형 MQTT 브로커를 사용할 수 있습니다.

<Image img={emqx_cloud_create_2} size="lg" border alt="EMQX Cloud Create Deployment Step 2 showing region selection" />

이제 해당 패널을 클릭하여 클러스터 뷰로 이동합니다. 이 대시보드에서 MQTT 브로커의 개요를 확인할 수 있습니다.

<Image img={emqx_cloud_overview} size="lg" border alt="EMQX Cloud Overview Dashboard showing broker metrics" />

### 클라이언트 자격 증명 추가 \{#add-client-credential\}

EMQX Cloud는 기본적으로 익명 연결을 허용하지 않으므로 MQTT 클라이언트 도구를 사용해 이 브로커로 데이터를 전송할 수 있도록 클라이언트 자격 증명을 추가해야 합니다.

왼쪽 메뉴에서 「Authentication & ACL」을 클릭한 다음 하위 메뉴에서 「Authentication」을 클릭하십시오. 오른쪽의 「Add」 버튼을 클릭하고, 이후 MQTT 연결에 사용할 사용자 이름과 비밀번호를 지정합니다. 여기서는 사용자 이름과 비밀번호로 각각 `emqx`와 `xxxxxx`를 사용합니다.

<Image img={emqx_cloud_auth} size="lg" border alt="자격 증명을 추가하기 위한 EMQX Cloud 인증 설정 인터페이스" />

「Confirm」을 클릭하면 완전 관리형 MQTT 브로커 인스턴스가 준비됩니다.

### NAT 게이트웨이 활성화 \{#enable-nat-gateway\}

ClickHouse 통합 구성을 시작하기 전에 먼저 NAT 게이트웨이를 활성화해야 합니다. 기본적으로 MQTT 브로커는 프라이빗 VPC에 배포되며, 퍼블릭 네트워크를 통해 타사 시스템으로 데이터를 전송할 수 없습니다.

Overview 페이지로 돌아가 페이지 하단까지 스크롤하면 NAT 게이트웨이 위젯이 표시됩니다. Subscribe 버튼을 클릭하고 안내에 따라 진행하십시오. NAT 게이트웨이는 부가 서비스이지만, 14일간 무료 체험도 제공합니다.

<Image img={emqx_cloud_nat_gateway} size="lg" border alt="EMQX Cloud NAT Gateway 구성 패널" />

생성이 완료되면 위젯에서 퍼블릭 IP 주소를 확인할 수 있습니다. ClickHouse Cloud 설정 중에 "Connect from a specific location"을 선택한 경우, 이 IP 주소를 허용 목록(whitelist)에 추가해야 합니다.

## EMQX Cloud와 ClickHouse Cloud 연동 \{#integration-emqx-cloud-with-clickhouse-cloud\}

[EMQX Cloud Data Integrations](https://docs.emqx.com/en/cloud/latest/rule_engine/introduction.html#general-flow)는 EMQX 메시지 흐름과 디바이스 이벤트를 처리하고 대응하기 위한 규칙을 설정하는 데 사용됩니다. Data Integrations는 명확하고 유연하며, 고도로 구성 가능한 아키텍처 솔루션을 제공할 뿐만 아니라 개발 프로세스를 단순화하고 사용성을 향상시키며, 비즈니스 시스템과 EMQX Cloud 간의 결합도를 낮춥니다. 또한 EMQX Cloud 고유 기능을 사용자 요구에 맞게 커스터마이징할 수 있는 우수한 인프라를 제공합니다.

<Image img={emqx_cloud_data_integration} size="lg" border alt="사용 가능한 커넥터를 보여주는 EMQX Cloud Data Integration 옵션" />

EMQX Cloud는 널리 사용되는 데이터 시스템과의 30개 이상의 네이티브 연동 기능을 제공합니다. ClickHouse도 그중 하나입니다.

<Image img={data_integration_clickhouse} size="lg" border alt="EMQX Cloud ClickHouse Data Integration 커넥터 상세 정보" />

### ClickHouse 리소스 생성 \{#create-clickhouse-resource\}

왼쪽 메뉴에서 "Data Integrations"를 클릭한 후 "View All Resources"를 클릭합니다. Data Persistence 섹션에서 ClickHouse를 찾거나 ClickHouse를 검색할 수 있습니다.

새 리소스를 생성하려면 ClickHouse 카드를 클릭합니다.

- Note: 이 리소스에 대한 메모를 추가합니다.
- Server address: ClickHouse Cloud 서비스의 주소로, 포트를 포함해야 합니다.
- Database name: 앞 단계에서 생성한 `emqx` 데이터베이스 이름입니다.
- User: ClickHouse Cloud 서비스에 연결할 때 사용할 사용자 이름입니다.
- Key: 연결에 사용할 비밀번호입니다.

<Image img={data_integration_resource} size="lg" border alt="EMQX Cloud ClickHouse 리소스 설정 양식과 연결 세부 정보" />

### 새 규칙 만들기 \{#create-a-new-rule\}

리소스를 생성하는 과정에서 팝업이 표시되며, &#39;New&#39;를 클릭하면 규칙 생성 페이지로 이동합니다.

EMQX는 강력한 [rule engine](https://docs.emqx.com/en/cloud/latest/rule_engine/rules.html)을 제공하여 타사 시스템으로 전송하기 전에 원시 MQTT 메시지를 변환하고 확장할 수 있습니다.

이 튜토리얼에서 사용하는 규칙은 다음과 같습니다:

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

이 작업은 `temp_hum/emqx` 토픽에서 메시지를 읽고, JSON 객체에 client&#95;id, topic, timestamp 정보를 추가하여 내용을 보강합니다.

따라서 토픽으로 전송하는 원본 JSON은 다음과 같습니다.

```bash
{"temp": 28.5, "hum": 0.68}
```

<Image img={data_integration_rule_1} size="md" border alt="SQL 쿼리를 보여주는 EMQX Cloud 데이터 통합 규칙 생성 1단계" />

SQL 테스트 기능을 사용해 쿼리를 실행하고 결과를 확인할 수 있습니다.

<Image img={data_integration_rule_2} size="md" border alt="테스트 결과를 보여주는 EMQX Cloud 데이터 통합 규칙 생성 2단계" />

이제 &quot;NEXT&quot; 버튼을 클릭하십시오. 이 단계에서는 정제된 데이터를 ClickHouse 데이터베이스에 어떤 방식으로 삽입할지 EMQX Cloud에 지정합니다.


### 응답 동작 추가 \{#add-a-response-action\}

리소스가 하나만 있는 경우 「Resource」와 「Action Type」은 수정할 필요가 없습니다.
SQL 템플릿만 설정하면 됩니다. 이 튜토리얼에서 사용하는 예시는 다음과 같습니다.

```bash
INSERT INTO temp_hum (client_id, timestamp, topic, temp, hum) VALUES ('${client_id}', ${timestamp}, '${topic}', ${temp}, ${hum})
```

<Image img={data_integration_rule_action} size="md" border alt="SQL 템플릿을 사용한 EMQX Cloud 데이터 통합 규칙 작업 설정" />

이는 ClickHouse에 데이터를 삽입하기 위한 템플릿으로, 여기에서 사용된 변수를 확인할 수 있습니다.


### 규칙 세부 정보 보기 \{#view-rules-details\}

"Confirm"과 "View Details"를 클릭합니다. 이제 모든 설정이 완료됩니다. 규칙 세부 정보 페이지에서 데이터 통합이 정상적으로 동작하는지 확인할 수 있습니다.

<Image img={data_integration_details} size="md" border alt="설정 요약을 보여주는 EMQX Cloud 데이터 통합 규칙 세부 정보" />

`temp_hum/emqx` 토픽으로 전송되는 모든 MQTT 메시지는 ClickHouse Cloud 데이터베이스에 저장됩니다.

## ClickHouse에 데이터 저장하기 \{#saving-data-into-clickhouse\}

온도와 습도 데이터를 시뮬레이션한 후 MQTT X를 통해 EMQX Cloud로 전송하고, EMQX Cloud Data Integrations를 사용하여 해당 데이터를 ClickHouse Cloud에 저장합니다.

<Image img={work_flow} size="lg" border alt="데이터 흐름을 보여 주는 EMQX Cloud와 ClickHouse 간 워크플로 다이어그램" />

### MQTT 메시지를 EMQX Cloud로 발행하기 \{#publish-mqtt-messages-to-emqx-cloud\}

어떤 MQTT 클라이언트나 SDK든 사용해 메시지를 발행할 수 있습니다. 이 튜토리얼에서는 EMQ에서 제공하는 사용자 친화적인 MQTT 클라이언트 애플리케이션인 [MQTT X](https://mqttx.app/)를 사용합니다.

<Image img={mqttx_overview} size="lg" border alt="클라이언트 인터페이스를 보여주는 MQTTX 개요 화면" />

MQTTX에서 &quot;New Connection&quot;을 클릭한 후 연결 양식을 작성합니다:

* Name: 연결 이름입니다. 원하는 이름을 사용하면 됩니다.
* Host: MQTT 브로커 연결 주소입니다. EMQX Cloud 개요 페이지에서 확인할 수 있습니다.
* Port: MQTT 브로커 연결 포트입니다. EMQX Cloud 개요 페이지에서 확인할 수 있습니다.
* Username/Password: 위에서 생성한 자격 증명을 사용합니다. 이 튜토리얼에서는 `emqx`와 `xxxxxx`입니다.

<Image img={mqttx_new} size="lg" border alt="연결 세부 정보를 포함한 MQTTX New Connection 설정 양식" />

오른쪽 상단의 &quot;Connect&quot; 버튼을 클릭하면 연결이 완료됩니다.

이제 이 도구를 사용해 MQTT 브로커로 메시지를 전송할 수 있습니다.
입력:

1. 페이로드 형식을 &quot;JSON&quot;으로 설정합니다.
2. 토픽을 `temp_hum/emqx`로 설정합니다(방금 규칙에서 설정한 토픽).
3. JSON 본문:

```bash
{"temp": 23.1, "hum": 0.68}
```

오른쪽에 있는 전송 버튼을 클릭하십시오. 온도 값을 변경하여 MQTT 브로커로 더 많은 데이터를 전송할 수 있습니다.

EMQX Cloud로 전송된 데이터는 룰 엔진에 의해 처리되어 자동으로 ClickHouse Cloud에 삽입됩니다.

<Image img={mqttx_publish} size="lg" border alt="메시지 작성 화면을 보여 주는 MQTTX Publish MQTT Messages 인터페이스" />


### 규칙 모니터링 보기 \{#view-rules-monitoring\}

규칙 모니터링 화면에서 성공 횟수가 1 증가했는지 확인합니다.

<Image img={rule_monitor} size="lg" border alt="메시지 처리 지표를 표시하는 EMQX Cloud Rule Monitoring 대시보드" />

### 저장된 데이터 확인 \{#check-the-data-persisted\}

이제 ClickHouse Cloud에 저장된 데이터를 확인할 차례입니다. MQTTX로 전송한 데이터는 EMQX Cloud로 전달되고, 네이티브 데이터 통합 기능을 통해 ClickHouse Cloud의 데이터베이스에 영구적으로 저장됩니다.

ClickHouse Cloud 패널의 SQL 콘솔에 접속하거나, 원하는 클라이언트 도구를 사용하여 ClickHouse에서 데이터를 조회할 수 있습니다. 이 튜토리얼에서는 SQL 콘솔을 사용했습니다.
다음 SQL을 실행합니다:

```bash
SELECT * FROM emqx.temp_hum;
```

<Image img={clickhouse_result} size="lg" border alt="ClickHouse 쿼리 결과에 영구 저장된 IoT 데이터가 표시된 화면" />


### 요약 \{#summary\}

단 한 줄의 코드도 작성하지 않고 MQTT 데이터가 EMQX Cloud에서 ClickHouse Cloud로 전송되도록 구성했습니다. EMQX Cloud와 ClickHouse Cloud를 사용하면 인프라를 직접 관리할 필요가 없으며, ClickHouse Cloud에 안전하게 저장된 데이터를 기반으로 IoT 애플리케이션 개발에만 집중할 수 있습니다.