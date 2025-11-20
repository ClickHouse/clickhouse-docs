---
'sidebar_label': 'QuickSight'
'slug': '/integrations/quicksight'
'keywords':
- 'clickhouse'
- 'aws'
- 'amazon'
- 'QuickSight'
- 'mysql'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Amazon QuickSight는 통합 비즈니스 인텔리전스 (BI)를 통해 데이터 기반의 조직을 지원합니다.'
'title': 'QuickSight'
'doc_type': 'guide'
'integration':
- 'support_level': 'core'
- 'category': 'data_visualization'
---

import MySQLOnPremiseSetup from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_clickhouse_mysql_on_premise_setup.mdx';
import Image from '@theme/IdealImage';
import quicksight_01 from '@site/static/images/integrations/data-visualization/quicksight_01.png';
import quicksight_02 from '@site/static/images/integrations/data-visualization/quicksight_02.png';
import quicksight_03 from '@site/static/images/integrations/data-visualization/quicksight_03.png';
import quicksight_04 from '@site/static/images/integrations/data-visualization/quicksight_04.png';
import quicksight_05 from '@site/static/images/integrations/data-visualization/quicksight_05.png';
import quicksight_06 from '@site/static/images/integrations/data-visualization/quicksight_06.png';
import quicksight_07 from '@site/static/images/integrations/data-visualization/quicksight_07.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# QuickSight

<ClickHouseSupportedBadge/>

QuickSight는 공식 MySQL 데이터 소스와 Direct Query 모드를 사용하여 MySQL 인터페이스를 통해 온프레미스 ClickHouse 설정(23.11+)에 연결할 수 있습니다.

## 온프레미스 ClickHouse 서버 설정 {#on-premise-clickhouse-server-setup}

ClickHouse 서버를 MySQL 인터페이스로 설정하는 방법에 대해서는 [공식 문서](/interfaces/mysql)를 참조하십시오.

서버의 `config.xml`에 항목을 추가하는 것 외에도

```xml
<clickhouse>
    <mysql_port>9004</mysql_port>
</clickhouse>
```

MySQL 인터페이스를 사용할 사용자에 대해 [Double SHA1 비밀번호 암호화](/operations/settings/settings-users#user-namepassword)를 사용하는 것이 _필수_입니다.

셸에서 Double SHA1로 암호화된 랜덤 비밀번호를 생성하는 방법:

```shell
PASSWORD=$(base64 < /dev/urandom | head -c16); echo "$PASSWORD"; echo -n "$PASSWORD" | sha1sum | tr -d '-' | xxd -r -p | sha1sum | tr -d '-'
```

출력은 다음과 같아야 합니다:

```text
LZOQYnqQN4L/T6L0
fbc958cc745a82188a51f30de69eebfc67c40ee4
```

첫 번째 줄은 생성된 비밀번호이고, 두 번째 줄은 ClickHouse를 구성하는 데 사용할 수 있는 해시입니다.

다음은 생성된 해시를 사용하는 `mysql_user`에 대한 예제 구성입니다:

`/etc/clickhouse-server/users.d/mysql_user.xml`

```xml
<users>
    <mysql_user>
        <password_double_sha1_hex>fbc958cc745a82188a51f30de69eebfc67c40ee4</password_double_sha1_hex>
        <networks>
            <ip>::/0</ip>
        </networks>
        <profile>default</profile>
        <quota>default</quota>
    </mysql_user>
</users>
```

`password_double_sha1_hex` 항목을 생성된 Double SHA1 해시로 교체하십시오.

QuickSight는 MySQL 사용자 프로필에 몇 가지 추가 설정이 필요합니다.

`/etc/clickhouse-server/users.d/mysql_user.xml`

```xml
<profiles>
    <default>
        <prefer_column_name_to_alias>1</prefer_column_name_to_alias>
        <mysql_map_string_to_text_in_show_columns>1</mysql_map_string_to_text_in_show_columns>
        <mysql_map_fixed_string_to_text_in_show_columns>1</mysql_map_fixed_string_to_text_in_show_columns>
    </default>
</profiles>
```

그러나 기본 프로필 대신 MySQL 사용자가 사용할 수 있는 다른 프로필에 할당하는 것이 좋습니다.

마지막으로, Clickhouse 서버가 원하는 IP 주소에서 수신 대기하도록 구성하십시오. `config.xml`에서 다음을 주석 해제하여 모든 주소에서 수신 대기하도록 설정할 수 있습니다:

```bash
<listen_host>::</listen_host>
```

`mysql` 바이너리를 사용할 수 있는 경우, 명령줄에서 연결을 테스트할 수 있습니다. 위의 샘플 사용자 이름(`mysql_user`)과 비밀번호(`LZOQYnqQN4L/T6L0`)를 사용하여 명령줄은 다음과 같을 것입니다:

```bash
mysql --protocol tcp -h localhost -u mysql_user -P 9004 --password=LZOQYnqQN4L/T6L0
```

```response
mysql> show databases;
+--------------------+
| name               |
+--------------------+
| INFORMATION_SCHEMA |
| default            |
| information_schema |
| system             |
+--------------------+
4 rows in set (0.00 sec)
Read 4 rows, 603.00 B in 0.00156 sec., 2564 rows/sec., 377.48 KiB/sec.
```

## QuickSight를 ClickHouse에 연결하기 {#connecting-quicksight-to-clickhouse}

우선, [https://quicksight.aws.amazon.com](https://quicksight.aws.amazon.com)로 가서 데이터셋으로 이동한 다음 "새 데이터셋"을 클릭하십시오:

<Image size="md" img={quicksight_01} alt="Amazon QuickSight 대시보드에서 데이터셋 섹션의 새 데이터셋 버튼을 보여줌" border />
<br/>

QuickSight와 함께 번들된 공식 MySQL 커넥터를 검색하십시오(이름은 **MySQL**):

<Image size="md" img={quicksight_02} alt="QuickSight 데이터 소스 선택 화면에서 검색 결과에 강조된 MySQL" border />
<br/>

연결 세부정보를 지정하십시오. MySQL 인터페이스 포트가 기본값으로 9004임을 주의하십시오. 서버 구성에 따라 다를 수 있습니다.

<Image size="md" img={quicksight_03} alt="호스트명, 포트, 데이터베이스 및 자격 증명 필드가 있는 QuickSight MySQL 연결 구성 양식" border />
<br/>

이제 ClickHouse에서 데이터를 가져오는 방법에 대해 두 가지 옵션이 있습니다. 첫 번째는 목록에서 테이블을 선택하는 것입니다:

<Image size="md" img={quicksight_04} alt="ClickHouse에서 사용할 수 있는 데이터베이스 테이블을 보여주는 QuickSight 테이블 선택 인터페이스" border />
<br/>

또는 사용자 정의 SQL을 지정하여 데이터를 가져올 수도 있습니다:

<Image size="md" img={quicksight_05} alt="ClickHouse에서 데이터를 가져오기 위한 QuickSight 사용자 정의 SQL 쿼리 편집기" border />
<br/>

"편집/미리보기 데이터"를 클릭하면 탐색된 테이블 구조를 볼 수 있거나 데이터를 액세스하기로 선택한 경우 사용자 정의 SQL을 조정할 수 있습니다:

<Image size="md" img={quicksight_06} alt="컬럼과 샘플 데이터가 있는 테이블 구조를 보여주는 QuickSight 데이터 미리보기" border />
<br/>

UI의 왼쪽 하단 코너에서 "Direct Query" 모드가 선택되어 있는지 확인하십시오:

<Image size="md" img={quicksight_07} alt="왼쪽 하단의 Direct Query 모드 옵션이 강조된 QuickSight 인터페이스" border />
<br/>

그런 다음 데이터셋을 게시하고 새로운 시각화를 생성할 수 있습니다!

## 알려진 한계 {#known-limitations}

- SPICE 가져오기가 예상대로 작동하지 않습니다; 대신 Direct Query 모드를 사용하십시오. [#58553](https://github.com/ClickHouse/ClickHouse/issues/58553)를 참조하십시오.
