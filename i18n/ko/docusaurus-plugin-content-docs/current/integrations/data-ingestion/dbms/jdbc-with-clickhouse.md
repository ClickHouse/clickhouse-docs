---
'sidebar_label': 'JDBC'
'sidebar_position': 2
'keywords':
- 'clickhouse'
- 'jdbc'
- 'connect'
- 'integrate'
'slug': '/integrations/jdbc/jdbc-with-clickhouse'
'description': 'ClickHouse JDBC 브리지는 ClickHouse가 JDBC 드라이버가 사용 가능한 모든 외부 데이터 소스의 데이터에
  접근할 수 있도록 합니다.'
'title': 'ClickHouse를 JDBC를 사용하여 외부 데이터 소스에 연결하기'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Jdbc01 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-01.png';
import Jdbc02 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-02.png';
import Jdbc03 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-03.png';


# ClickHouse를 외부 데이터 소스와 JDBC로 연결하기

:::note
JDBC를 사용하려면 ClickHouse JDBC 브릿지가 필요하므로, 데이터베이스에서 ClickHouse Cloud로 데이터를 스트리밍하려면 로컬 머신에서 `clickhouse-local`을 사용해야 합니다. 자세한 내용은 **Migrate** 섹션의 [**Using clickhouse-local**](/cloud/migration/clickhouse-local#example-2-migrating-from-mysql-to-clickhouse-cloud-with-the-jdbc-bridge) 페이지를 방문하세요.
:::

**개요:** <a href="https://github.com/ClickHouse/clickhouse-jdbc-bridge" target="_blank">ClickHouse JDBC Bridge</a>는 [jdbc 테이블 함수](/sql-reference/table-functions/jdbc.md) 또는 [JDBC 테이블 엔진](/engines/table-engines/integrations/jdbc.md)과 결합되어 ClickHouse가 사용할 수 있는 모든 외부 데이터 소스에 액세스할 수 있게 해줍니다. 이 데이터 소스는 <a href="https://en.wikipedia.org/wiki/JDBC_driver" target="_blank">JDBC 드라이버</a>가 제공됩니다:

<Image img={Jdbc01} size="lg" alt="ClickHouse JDBC Bridge architecture diagram" background='white'/>
여기서는 외부 데이터 소스에 대해 기본 내장된 [통합 엔진](/engines/table-engines/integrations), 테이블 함수 또는 외부 딕셔너리가 없을 경우와 해당 데이터 소스에 대한 JDBC 드라이버가 존재할 때 유용합니다.

ClickHouse JDBC Bridge를 통해 데이터의 읽기와 쓰기를 모두 수행할 수 있습니다. 그리고 여러 외부 데이터 소스를 동시에 사용하여, 예를 들어 여러 외부 및 내부 데이터 소스에 걸쳐 ClickHouse에서 분산 쿼리를 실시간으로 실행할 수 있습니다.

이번 강의에서는 ClickHouse와 외부 데이터 소스를 연결하기 위해 ClickHouse JDBC Bridge를 설치하고, 구성하고, 실행하는 방법을 쉽게 보여 드리겠습니다. 이번 강의에서는 MySQL을 외부 데이터 소스로 사용할 것입니다.

자, 시작해 보겠습니다!

:::note 전제 조건
다음이 갖춰진 머신에 접근할 수 있어야 합니다:
1. Unix 셸과 인터넷 접근
2. <a href="https://www.gnu.org/software/wget/" target="_blank">wget</a> 설치
3. 현재 버전의 **Java** (예: <a href="https://openjdk.java.net" target="_blank">OpenJDK</a> 버전 >= 17) 설치
4. 현재 버전의 **MySQL** (예: <a href="https://www.mysql.com" target="_blank">MySQL</a> 버전 >= 8) 설치 및 실행 중
5. 현재 버전의 **ClickHouse** [설치됨](/getting-started/install/install.mdx) 및 실행 중
:::

## ClickHouse JDBC Bridge를 로컬에 설치하기 {#install-the-clickhouse-jdbc-bridge-locally}

ClickHouse JDBC Bridge를 사용하는 가장 쉬운 방법은 ClickHouse가 실행 중인 동일 호스트에 설치하고 실행하는 것입니다:<Image img={Jdbc02} size="lg" alt="ClickHouse JDBC Bridge locally deployment diagram" background='white'/>

먼저 ClickHouse가 실행 중인 머신의 Unix 셸에 연결하고 ClickHouse JDBC Bridge를 설치할 로컬 폴더를 생성합니다 (폴더 이름과 위치는 자유롭게 지정하세요):
```bash
mkdir ~/clickhouse-jdbc-bridge
```

이제 해당 폴더에 <a href="https://github.com/ClickHouse/clickhouse-jdbc-bridge/releases/" target="_blank">현재 버전</a>의 ClickHouse JDBC Bridge를 다운로드합니다:

```bash
cd ~/clickhouse-jdbc-bridge
wget https://github.com/ClickHouse/clickhouse-jdbc-bridge/releases/download/v2.0.7/clickhouse-jdbc-bridge-2.0.7-shaded.jar
```

MySQL에 연결할 수 있도록 이름이 지정된 데이터 소스를 생성합니다:

```bash
cd ~/clickhouse-jdbc-bridge
mkdir -p config/datasources
touch config/datasources/mysql8.json
```

이제 다음 구성을 `~/clickhouse-jdbc-bridge/config/datasources/mysql8.json` 파일에 복사하고 붙여넣을 수 있습니다:

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
위의 구성 파일에서
- 데이터 소스 이름은 원하는 이름으로 자유롭게 사용할 수 있으며, 우리는 `mysql8`을 사용했습니다.
- `jdbcUrl` 값에서는 `<host>`와 `<port>`를 실행 중인 MySQL 인스턴스에 따라 적절한 값으로 교체해야 합니다. 예: `"jdbc:mysql://localhost:3306"`
- `<username>`과 `<password>`는 MySQL 자격 증명으로 교체해야 하며, 비밀번호를 사용하지 않는 경우 위의 구성 파일에서 `"password": "<password>"` 줄을 삭제할 수 있습니다.
- `driverUrls`의 값에서는 <a href="https://repo1.maven.org/maven2/mysql/mysql-connector-java/" target="_blank">현재 버전</a>의 MySQL JDBC 드라이버를 다운로드할 수 있는 URL을 지정했습니다. 이것으로 충분하고, ClickHouse JDBC Bridge는 자동으로 그 JDBC 드라이버를 다운로드합니다(운영 체제에 따라 특정 디렉토리에).
:::

<br/>

이제 ClickHouse JDBC Bridge를 시작할 준비가 되었습니다:
```bash
cd ~/clickhouse-jdbc-bridge
java -jar clickhouse-jdbc-bridge-2.0.7-shaded.jar
```
:::note
우리는 전경 모드에서 ClickHouse JDBC Bridge를 시작했습니다. 브릿지를 중지하려면 위의 Unix 셸 창을 전경으로 가져와서 `CTRL+C`를 누르세요.
:::

## ClickHouse 내에서 JDBC 연결 사용하기 {#use-the-jdbc-connection-from-within-clickhouse}

이제 ClickHouse는 [jdbc 테이블 함수](/sql-reference/table-functions/jdbc.md) 또는 [JDBC 테이블 엔진](/engines/table-engines/integrations/jdbc.md)을 사용하여 MySQL 데이터에 액세스할 수 있습니다.

다음 예제를 실행하는 가장 쉬운 방법은 이를 [`clickhouse-client`](/interfaces/cli.md) 또는 [Play UI](/interfaces/http.md)로 복사하고 붙여넣는 것입니다.

- jdbc 테이블 함수:

```sql
SELECT * FROM jdbc('mysql8', 'mydatabase', 'mytable');
```
:::note
jdbc 테이블 함수의 첫 번째 매개변수로 위에서 구성한 이름이 있는 데이터 소스의 이름을 사용하고 있습니다.
:::

- JDBC 테이블 엔진:
```sql
CREATE TABLE mytable (
     <column> <column_type>,
     ...
)
ENGINE = JDBC('mysql8', 'mydatabase', 'mytable');

SELECT * FROM mytable;
```
:::note
jdbc 엔진 절에서 첫 번째 매개변수로 위에서 구성한 이름이 있는 데이터 소스의 이름을 사용하고 있습니다.

ClickHouse JDBC 엔진 테이블의 스키마와 연결된 MySQL 테이블의 스키마는 일치해야 하며, 예를 들어, 컬럼 이름과 순서가 같아야 하고, 컬럼 데이터 유형이 호환되어야 합니다.
:::

## ClickHouse JDBC Bridge를 외부에 설치하기 {#install-the-clickhouse-jdbc-bridge-externally}

분산 ClickHouse 클러스터(하나 이상의 ClickHouse 호스트가 있는 클러스터)의 경우 ClickHouse JDBC Bridge를 별도 호스트에 외부로 설치하고 실행하는 것이 의미가 있습니다:
<Image img={Jdbc03} size="lg" alt="ClickHouse JDBC Bridge external deployment diagram" background='white'/>
이것은 각 ClickHouse 호스트가 JDBC 브릿지에 액세스할 수 있다는 장점이 있습니다. 그렇지 않으면 JDBC 브릿지는 외부 데이터 소스에 액세스해야 할 각 ClickHouse 인스턴스에 대해 로컬로 설치해야 합니다.

ClickHouse JDBC Bridge를 외부에 설치하기 위해 다음 단계를 수행합니다:

1. 이 가이드의 1단계에서 설명한 대로 전용 호스트에 ClickHouse JDBC Bridge를 설치, 구성 및 실행합니다.

2. 각 ClickHouse 호스트에 <a href="https://clickhouse.com/docs/operations/configuration-files/#configuration_files" target="_blank">ClickHouse 서버 구성</a>에 다음 구성 블록을 추가합니다 (선택한 구성 형식에 따라 XML 또는 YAML 버전을 사용합니다):

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
- `JDBC-Bridge-Host`는 전용 ClickHouse JDBC Bridge 호스트의 호스트 이름 또는 IP 주소로 대체해야 합니다.
- 기본 ClickHouse JDBC Bridge 포트 `9019`를 지정했습니다. JDBC Bridge에 대해 다른 포트를 사용하는 경우 위 구성을 적절히 조정해야 합니다.
:::

[//]: # (## 4. 추가 정보)

[//]: # ()
[//]: # (TODO: )

[//]: # (- jdbc 테이블 함수의 경우 성능이 더 좋음 &#40;각각 두 개의 쿼리가 필요하지 않음&#41;을 언급)

[//]: # ()
[//]: # (- ad hoc 쿼리와 테이블 쿼리, 저장된 쿼리, 이름이 지정된 쿼리 언급)

[//]: # ()
[//]: # (- insert into 언급)
