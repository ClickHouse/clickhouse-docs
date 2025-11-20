---
'sidebar_label': 'Splunk'
'sidebar_position': 198
'slug': '/integrations/splunk'
'keywords':
- 'Splunk'
- 'integration'
- 'data visualization'
'description': 'Splunk 대시보드를 ClickHouse에 연결합니다'
'title': 'Splunk을 ClickHouse에 연결하기'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import splunk_1 from '@site/static/images/integrations/splunk/splunk-1.png';
import splunk_2 from '@site/static/images/integrations/splunk/splunk-2.png';
import splunk_3 from '@site/static/images/integrations/splunk/splunk-3.png';
import splunk_4 from '@site/static/images/integrations/splunk/splunk-4.png';
import splunk_5 from '@site/static/images/integrations/splunk/splunk-5.png';
import splunk_6 from '@site/static/images/integrations/splunk/splunk-6.png';
import splunk_7 from '@site/static/images/integrations/splunk/splunk-7.png';
import splunk_8 from '@site/static/images/integrations/splunk/splunk-8.png';
import splunk_9 from '@site/static/images/integrations/splunk/splunk-9.png';
import splunk_10 from '@site/static/images/integrations/splunk/splunk-10.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Splunk을 ClickHouse에 연결하기

<ClickHouseSupportedBadge/>

:::tip
ClickHouse 감사 로그를 Splunk에 저장하려면 ["ClickHouse Cloud 감사 로그를 Splunk에 저장하기"](/integrations/audit-splunk) 가이드를 따르세요.
:::

Splunk은 보안 및 가시성에 대한 인기 있는 기술입니다. 또한 강력한 검색 및 대시보드 엔진이기도 합니다. 다양한 사용 사례를 해결하기 위해 수백 개의 Splunk 앱이 제공됩니다.

특히 ClickHouse와의 경우, ClickHouse JDBC 드라이버를 사용하여 ClickHouse의 테이블을 직접 쿼리할 수 있는 간단한 통합을 제공하는 [Splunk DB Connect App](https://splunkbase.splunk.com/app/2686)을 활용하고 있습니다.

이 통합의 이상적인 사용 사례는 ClickHouse를 NetFlow, Avro 또는 Protobuf 이진 데이터, DNS, VPC 흐름 로그 및 Splunk에서 팀과 공유하여 검색하고 대시보드를 생성할 수 있는 기타 OTEL 로그와 같은 대용량 데이터 소스로 사용하는 경우입니다. 이 접근 방식을 사용하면 데이터가 Splunk 인덱스 레이어에 수집되지 않고, 다른 시각화 통합인 [Metabase](https://www.metabase.com/) 또는 [Superset](https://superset.apache.org/)과 유사하게 ClickHouse에서 직접 쿼리됩니다.

## 목표​ {#goal}

이 가이드에서는 ClickHouse JDBC 드라이버를 사용하여 ClickHouse를 Splunk에 연결합니다. 우리는 로컬 버전의 Splunk Enterprise를 설치하겠지만 데이터는 인덱싱하지 않습니다. 대신, DB Connect 쿼리 엔진을 통해 검색 기능을 사용합니다.

이 가이드를 통해 ClickHouse에 연결된 대시보드를 다음과 같이 생성할 수 있습니다:

<Image img={splunk_1} size="lg" border alt="NYC 택시 데이터 시각화를 보여주는 Splunk 대시보드" />

:::note
이 가이드는 [뉴욕시 택시 데이터 세트](/getting-started/example-datasets/nyc-taxi)를 사용합니다. [우리 문서](http://localhost:3000/docs/getting-started/example-datasets)에 있는 다른 데이터 세트도 많이 사용할 수 있습니다.
:::

## 사전 요구 사항 {#prerequisites}

시작하기 전에 다음이 필요합니다:
- 검색 헤드 기능을 사용하기 위한 Splunk Enterprise
- 운영 체제 또는 컨테이너에 설치된 [Java Runtime Environment (JRE)](https://docs.splunk.com/Documentation/DBX/3.16.0/DeployDBX/Prerequisites) 요구 사항
- [Splunk DB Connect](https://splunkbase.splunk.com/app/2686)
- Splunk Enterprise OS 인스턴스에 대한 관리자 또는 SSH 액세스
- ClickHouse 연결 세부정보 (ClickHouse Cloud를 사용하는 경우 [여기](/integrations/metabase#1-gather-your-connection-details)를 참조)

## Splunk Enterprise에 DB Connect 설치 및 구성하기 {#install-and-configure-db-connect-on-splunk-enterprise}

먼저 Splunk Enterprise 인스턴스에 Java Runtime Environment를 설치해야 합니다. Docker를 사용하는 경우 `microdnf install java-11-openjdk` 명령을 사용할 수 있습니다.

`java_home` 경로를 기록해 두세요: `java -XshowSettings:properties -version`.

DB Connect App이 Splunk Enterprise에 설치되어 있는지 확인하세요. Splunk Web UI의 앱 섹션에서 찾을 수 있습니다:
- Splunk Web에 로그인하고 Apps > Find More Apps로 이동합니다
- 검색 상자를 사용하여 DB Connect를 찾습니다
- Splunk DB Connect 옆의 초록색 "Install" 버튼을 클릭합니다
- "Restart Splunk"를 클릭합니다

DB Connect App 설치에 문제가 있는 경우 [이 링크](https://splunkbase.splunk.com/app/2686)에서 추가 지침을 참고하세요.

DB Connect App이 설치된 것을 확인한 후, Configuration -> Settings에서 `java_home` 경로를 DB Connect App에 추가하고 저장한 다음 재설정을 클릭합니다.

<Image img={splunk_2} size="md" border alt="Java Home 구성 페이지를 보여주는 Splunk DB Connect 설정" />

## ClickHouse용 JDBC 구성하기 {#configure-jdbc-for-clickhouse}

[ClickHouse JDBC 드라이버](https://github.com/ClickHouse/clickhouse-java)를 DB Connect 드라이버 폴더에 다운로드합니다.

```bash
$SPLUNK_HOME/etc/apps/splunk_app_db_connect/drivers
```

그런 다음 `$SPLUNK_HOME/etc/apps/splunk_app_db_connect/default/db_connection_types.conf`에서 연결 유형 구성을 편집하여 ClickHouse JDBC 드라이버 클래스 세부정보를 추가합니다.

파일에 다음 구성을 추가합니다:

```text
[ClickHouse]
displayName = ClickHouse
serviceClass = com.splunk.dbx2.DefaultDBX2JDBC
jdbcUrlFormat = jdbc:ch://<host>:<port>/<database>
jdbcUrlSSLFormat = jdbc:ch://<host>:<port>/<database>?ssl=true
jdbcDriverClass = com.clickhouse.jdbc.ClickHouseDriver
ui_default_catalog = $database$
```

`$SPLUNK_HOME/bin/splunk restart`를 사용하여 Splunk을 재시작합니다.

DB Connect App으로 돌아가서 Configuration > Settings > Drivers로 이동합니다. ClickHouse 옆에 초록색 체크 표시가 표시되어야 합니다:

<Image img={splunk_3} size="lg" border alt="ClickHouse 드라이버가 성공적으로 설치된 Splunk DB Connect 드라이버 페이지" />

## Splunk 검색을 ClickHouse에 연결하기 {#connect-splunk-search-to-clickhouse}

DB Connect App Configuration -> Databases -> Identities로 이동하여 ClickHouse에 대한 Identity를 생성합니다.

Configuration -> Databases -> Connections에서 ClickHouse에 대한 새로운 연결을 생성하고 "New Connection"을 선택합니다.

<Image img={splunk_4} size="sm" border alt="Splunk DB Connect 새로운 연결 버튼" />

<br />

ClickHouse 호스트 세부정보를 추가하고 "Enable SSL"이 선택되어 있는지 확인합니다:

<Image img={splunk_5} size="md" border alt="ClickHouse에 대한 Splunk 연결 구성 페이지" />

연결을 저장한 후, 성공적으로 ClickHouse에 Splunk가 연결됩니다!

:::note
오류가 발생하면 ClickHouse Cloud IP 액세스 목록에 Splunk 인스턴스의 IP 주소가 추가되었는지 확인하세요. 자세한 내용은 [문서](/cloud/security/setting-ip-filters)를 참조하세요.
:::

## SQL 쿼리 실행하기 {#run-a-sql-query}

이제 모든 것이 잘 작동하는지 테스트하기 위해 SQL 쿼리를 실행하겠습니다.

DB Connect App의 DataLab 섹션에서 SQL Explorer에서 연결 세부정보를 선택합니다. 이 데모에서는 `trips` 테이블을 사용합니다:

<Image img={splunk_6} size="md" border alt="ClickHouse에 대한 연결을 선택하는 Splunk SQL Explorer" />

`trips` 테이블에서 모든 레코드의 수를 반환하는 SQL 쿼리를 실행합니다:

<Image img={splunk_7} size="md" border alt="trips 테이블의 레코드 수를 보여주는 Splunk SQL 쿼리 실행" />

쿼리가 성공적으로 실행되면 결과를 볼 수 있습니다.

## 대시보드 생성하기 {#create-a-dashboard}

이제 SQL과 강력한 Splunk 처리 언어(SPL)를 결합하여 대시보드를 생성합시다.

진행하기 전에 먼저 [DPL 보호기 비활성화](https://docs.splunk.com/Documentation/Splunk/9.2.1/Security/SPLsafeguards?ref=hk#Deactivate_SPL_safeguards)를 해야 합니다.

가장 빈번하게 픽업되는 상위 10개 지역을 보여주는 다음 쿼리를 실행합니다:

```sql
dbxquery query="SELECT pickup_ntaname, count(*) AS count
FROM default.trips GROUP BY pickup_ntaname
ORDER BY count DESC LIMIT 10;" connection="chc"
```

열 차트를 조회하기 위해 시각화 탭을 선택합니다:

<Image img={splunk_8} size="lg" border alt="상위 10개 픽업 지역을 보여주는 Splunk 열 차트 시각화" />

"Save As > Save to a Dashboard"를 클릭하여 대시보드를 생성합니다.

여행자 수를 기준으로 평균 요금을 보여주는 또 다른 쿼리를 추가해 보겠습니다.

```sql
dbxquery query="SELECT passenger_count,avg(total_amount)
FROM default.trips GROUP BY passenger_count;" connection="chc"
```

이번에는 막대 차트 시각화를 생성하고 이전 대시보드에 저장합니다.

<Image img={splunk_9} size="lg" border alt="탑승객 수에 따른 평균 요금을 보여주는 Splunk 막대 차트" />

마지막으로, 탑승객 수와 여행 거리 사이의 상관관계를 보여주는 쿼리를 하나 더 추가합니다:

```sql
dbxquery query="SELECT passenger_count, toYear(pickup_datetime) AS year,
round(trip_distance) AS distance, count(* FROM default.trips)
GROUP BY passenger_count, year, distance
ORDER BY year, count(*) DESC; " connection="chc"
```

최종 대시보드는 다음과 같아야 합니다:

<Image img={splunk_10} size="lg" border alt="여러 NYC 택시 데이터 시각화를 가진 최종 Splunk 대시보드" />

## 시계열 데이터 {#time-series-data}

Splunk에는 대시보드가 시계열 데이터를 시각화하고 프레젠테이션하는 데 사용할 수 있는 수백 개의 내장 기능이 있습니다. 이 예제는 SQL + SPL을 결합하여 Splunk에서 시계열 데이터와 함께 작동할 수 있는 쿼리를 생성합니다.

```sql
dbxquery query="SELECT time, orig_h, duration
FROM "demo"."conn" WHERE time >= now() - interval 1 HOURS" connection="chc"
| eval time = strptime(time, "%Y-%m-%d %H:%M:%S.%3Q")
| eval _time=time
| timechart avg(duration) as duration by orig_h
| eval duration=round(duration/60)
| sort - duration:
```

## 더 알아보기 {#learn-more}

Splunk DB Connect 및 대시보드 구축 방법에 대한 자세한 정보를 찾으려면 [Splunk 문서](https://docs.splunk.com/Documentation)를 방문하세요.
