---
sidebar_label: 'JDBC'
sidebar_position: 2
keywords: ['clickhouse', 'jdbc', 'connect', 'integrate']
slug: /integrations/jdbc/jdbc-with-clickhouse
description: 'ClickHouse JDBC Bridge를 사용하면 JDBC 드라이버가 제공되는 모든 외부 데이터 소스의 데이터에 ClickHouse가 접근할 수 있습니다'
title: 'JDBC를 사용하여 ClickHouse를 외부 데이터 소스에 연결하기'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Jdbc01 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-01.png';
import Jdbc02 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-02.png';
import Jdbc03 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-03.png';


# JDBC를 사용하여 ClickHouse를 외부 데이터 소스에 연결하기 \{#connecting-clickhouse-to-external-data-sources-with-jdbc\}

:::warning
clickhouse-jdbc-bridge에는 실험적인 코드가 포함되어 있으며 더 이상 지원되지 않습니다. 신뢰성과 보안 측면에서 취약성이 존재할 수 있습니다. 사용 시 발생하는 모든 위험은 전적으로 사용자에게 있습니다.
:::

:::note
JDBC를 사용하려면 ClickHouse JDBC Bridge가 필요하므로, 데이터베이스에서 ClickHouse Cloud로 데이터를 스트리밍하기 위해 로컬 머신에서 `clickhouse-local`을 사용해야 합니다. 자세한 내용은 문서의 **Migrate** 섹션에 있는 [**Using clickhouse-local**](/cloud/migration/clickhouse-local#example-2-migrating-from-mysql-to-clickhouse-cloud-with-the-jdbc-bridge) 페이지를 참조하십시오.
:::

**개요:** <a href="https://github.com/ClickHouse/clickhouse-jdbc-bridge" target="_blank">ClickHouse JDBC Bridge</a>는 [jdbc table function](/sql-reference/table-functions/jdbc.md) 또는 [JDBC table engine](/engines/table-engines/integrations/jdbc.md)과 함께 사용하여, <a href="https://en.wikipedia.org/wiki/JDBC_driver" target="_blank">JDBC driver</a>가 제공되는 모든 외부 데이터 소스의 데이터에 ClickHouse가 접근할 수 있도록 합니다:

<Image img={Jdbc01} size="lg" alt="ClickHouse JDBC Bridge architecture diagram" background='white'/>

이는 사용하려는 외부 데이터 소스에 대해 기본 제공되는 [통합 엔진(integration engine)](/engines/table-engines/integrations), table function 또는 외부 딕셔너리(external dictionary)는 없지만, 해당 데이터 소스용 JDBC driver는 존재하는 경우에 유용합니다.

ClickHouse JDBC Bridge는 읽기와 쓰기 모두에 사용할 수 있습니다. 또한 여러 외부 데이터 소스를 병렬로 사용할 수 있으며, 예를 들어 여러 외부 및 내부 데이터 소스를 대상으로 ClickHouse에서 실시간으로 분산 쿼리를 실행할 수 있습니다.

이 튜토리얼에서는 ClickHouse를 외부 데이터 소스에 연결하기 위해 ClickHouse JDBC Bridge를 설치, 구성 및 실행하는 방법을 단계별로 쉽게 따라 할 수 있도록 설명합니다. 여기서는 MySQL을 외부 데이터 소스로 사용합니다.

시작해 보겠습니다!

:::note Prerequisites
다음이 갖추어진 머신에 대한 접근 권한이 있어야 합니다:

1. 유닉스 셸과 인터넷 접속
2. <a href="https://www.gnu.org/software/wget/" target="_blank">wget</a>이 설치되어 있음
3. 최신 버전의 **Java**(예: <a href="https://openjdk.java.net" target="_blank">OpenJDK</a> 버전 >= 17)가 설치되어 있음
4. 최신 버전의 **MySQL**(예: <a href="https://www.mysql.com" target="_blank">MySQL</a> 버전 >= 8)이 설치되어 있고 실행 중일 것
5. 최신 버전의 **ClickHouse**가 [설치](/getting-started/install/install.mdx)되어 있고 실행 중일 것
:::

## 로컬에서 ClickHouse JDBC Bridge 설치 \{#install-the-clickhouse-jdbc-bridge-locally\}

ClickHouse JDBC Bridge를 사용하는 가장 간단한 방법은 ClickHouse가 실행 중인 것과 동일한 호스트에 해당 브리지를 설치하고 실행하는 것입니다:<Image img={Jdbc02} size="lg" alt="ClickHouse JDBC Bridge 로컬 배포 다이어그램" background="white" />

먼저 ClickHouse가 실행 중인 머신에서 Unix 셸에 접속한 다음, 이후 ClickHouse JDBC Bridge를 설치할 로컬 폴더를 생성합니다(폴더 이름과 위치는 자유롭게 정할 수 있습니다):

```bash
mkdir ~/clickhouse-jdbc-bridge
```

이제 해당 폴더에 ClickHouse JDBC Bridge의 <a href="https://github.com/ClickHouse/clickhouse-jdbc-bridge/releases/" target="_blank">최신 버전</a>을 다운로드합니다:

```bash
cd ~/clickhouse-jdbc-bridge
wget https://github.com/ClickHouse/clickhouse-jdbc-bridge/releases/download/v2.0.7/clickhouse-jdbc-bridge-2.0.7-shaded.jar
```

MySQL에 연결할 수 있도록 이름이 있는 데이터 소스를 생성합니다:

```bash
 cd ~/clickhouse-jdbc-bridge
 mkdir -p config/datasources
 touch config/datasources/mysql8.json
```

이제 다음 구성을 복사하여 `~/clickhouse-jdbc-bridge/config/datasources/mysql8.json` 파일에 붙여넣으십시오:

```json
 {
   "mysql8": {
   "driverUrls": [
     "https://repo1.maven.org/maven2/mysql/mysql-connector-java/8.0.28/mysql-connector-java-8.0.28.jar"
   ],
   "jdbcUrl": "jdbc:mysql://<host>:<port>",
   "username": "<username>",
   "password": "<password>"
   }
 }
```

:::note
위 구성 파일에서

* 데이터 소스 이름은 자유롭게 지정할 수 있으며, 여기서는 `mysql8`을 사용했습니다.
* `jdbcUrl` 값에서는 실행 중인 MySQL 인스턴스에 맞게 `<host>`와 `<port>`를 알맞은 값으로 바꿔야 합니다. 예: `"jdbc:mysql://localhost:3306"`
* `<username>`과 `<password>`는 MySQL 자격 증명으로 바꿔야 합니다. 비밀번호를 사용하지 않는 경우, 위 구성 파일에서 `"password": "<password>"` 행을 삭제하면 됩니다.
* `driverUrls` 값에는 MySQL JDBC 드라이버의 <a href="https://repo1.maven.org/maven2/mysql/mysql-connector-java/" target="_blank">현재 버전</a>을 다운로드할 수 있는 URL만 지정했습니다. 이렇게만 설정하면 ClickHouse JDBC Bridge가 해당 JDBC 드라이버를 자동으로 다운로드합니다(운영 체제별 디렉터리로 다운로드됨).
  :::

<br />

이제 ClickHouse JDBC Bridge를 시작할 준비가 되었습니다:

```bash
 cd ~/clickhouse-jdbc-bridge
 java -jar clickhouse-jdbc-bridge-2.0.7-shaded.jar
```

:::note
ClickHouse JDBC Bridge를 포그라운드 모드로 시작했습니다. Bridge를 중지하려면 앞에서 실행한 Unix 셸 창을 포그라운드로 가져온 뒤 `CTRL+C`를 누르십시오.
:::


## ClickHouse 내부에서 JDBC 연결 사용하기 \{#use-the-jdbc-connection-from-within-clickhouse\}

ClickHouse는 이제 [jdbc table function](/sql-reference/table-functions/jdbc.md) 또는 [JDBC table engine](/engines/table-engines/integrations/jdbc.md)을 사용하여 MySQL 데이터에 액세스할 수 있습니다.

다음 예제를 실행하는 가장 쉬운 방법은 해당 내용을 [`clickhouse-client`](/interfaces/cli.md) 또는 [Play UI](/interfaces/http)에 복사하여 붙여 넣어 실행하는 것입니다.

* jdbc Table Function:

```sql
 SELECT * FROM jdbc('mysql8', 'mydatabase', 'mytable');
```

:::note
`jdbc` 테이블 함수의 첫 번째 매개변수로 위에서 설정한 이름이 지정된 데이터 소스의 이름을 사용합니다.
:::

* JDBC 테이블 엔진(JDBC Table Engine):

```sql
 CREATE TABLE mytable (
      <column> <column_type>,
      ...
 )
 ENGINE = JDBC('mysql8', 'mydatabase', 'mytable');

 SELECT * FROM mytable;
```

:::note
jdbc engine 절의 첫 번째 파라미터로는 위에서 설정한 명명된 데이터 소스의 이름을 사용합니다.

ClickHouse JDBC engine 테이블의 스키마와 연결된 MySQL 테이블의 스키마는 일치해야 합니다. 예를 들어, 컬럼 이름과 순서는 동일해야 하며, 컬럼 데이터 타입은 서로 호환 가능해야 합니다.
:::


## ClickHouse JDBC Bridge를 외부에 설치하기 \{#install-the-clickhouse-jdbc-bridge-externally\}

분산 ClickHouse 클러스터(둘 이상의 ClickHouse 호스트로 구성된 클러스터)의 경우, 전용 호스트에 ClickHouse JDBC Bridge를 별도로 설치하여 외부에서 실행하는 것이 합리적입니다.

<Image img={Jdbc03} size="lg" alt="ClickHouse JDBC Bridge 외부 배포 다이어그램" background='white'/>

이렇게 하면 각 ClickHouse 호스트에서 JDBC Bridge에 액세스할 수 있다는 장점이 있습니다. 그렇지 않으면, Bridge를 통해 외부 데이터 소스에 액세스해야 하는 각 ClickHouse 인스턴스마다 JDBC Bridge를 로컬에 설치해야 합니다.

ClickHouse JDBC Bridge를 외부에 설치하려면 다음 단계를 수행합니다.

1. 이 가이드의 1번 섹션에 설명된 단계를 따라, 전용 호스트에 ClickHouse JDBC Bridge를 설치, 구성하고 실행합니다.

2. 각 ClickHouse 호스트에서, 선택한 구성 형식에 따라 XML 또는 YAML 버전을 사용하여 다음 구성 블록을 <a href="https://clickhouse.com/docs/operations/configuration-files/#configuration_files" target="_blank">ClickHouse 서버 구성</a>에 추가합니다.

<Tabs>
<TabItem value="xml" label="XML">

```xml
<jdbc_bridge>
   <host>JDBC-Bridge-Host</host>
   <port>9019</port>
</jdbc_bridge>
```

</TabItem>
<TabItem value="yaml" label="YAML">

```yaml
jdbc_bridge:
    host: JDBC-Bridge-Host
    port: 9019
```

</TabItem>
</Tabs>

:::note

- `JDBC-Bridge-Host`를 전용 ClickHouse JDBC Bridge 호스트의 호스트 이름 또는 IP 주소로 바꿔야 합니다.
- 기본 ClickHouse JDBC Bridge 포트인 `9019`를 사용하도록 지정했습니다. JDBC Bridge에 다른 포트를 사용하는 경우 위 구성을 해당 포트에 맞게 수정해야 합니다.
:::

[//]: # (## 4. 추가 정보)

[//]: # ()

[//]: # (TODO: )

[//]: # (- `jdbc` 테이블 함수의 경우, 스키마를 파라미터로 함께 지정하면 매번 두 개의 쿼리가 실행되지 않아 성능이 더 좋다는 점을 언급)

[//]: # ()

[//]: # (- 애드 혹 쿼리 vs 테이블 쿼리, 저장된 쿼리, 명명된 쿼리를 언급)

[//]: # ()

[//]: # (- insert into 언급 )