---
'slug': '/integrations/dbeaver'
'sidebar_label': 'DBeaver'
'description': 'DBeaver는 다중 플랫폼 데이터베이스 도구입니다.'
'title': 'DBeaver를 ClickHouse에 연결하기'
'doc_type': 'guide'
'integration':
- 'support_level': 'partner'
- 'category': 'sql_client'
- 'website': 'https://github.com/dbeaver/dbeaver'
'keywords':
- 'DBeaver'
- 'database management'
- 'SQL client'
- 'JDBC connection'
- 'multi-platform'
---

import Image from '@theme/IdealImage';
import dbeaver_add_database from '@site/static/images/integrations/sql-clients/dbeaver-add-database.png';
import dbeaver_host_port from '@site/static/images/integrations/sql-clients/dbeaver-host-port.png';
import dbeaver_use_ssl from '@site/static/images/integrations/sql-clients/dbeaver-use-ssl.png';
import dbeaver_test_connection from '@site/static/images/integrations/sql-clients/dbeaver-test-connection.png';
import dbeaver_download_driver from '@site/static/images/integrations/sql-clients/dbeaver-download-driver.png';
import dbeaver_sql_editor from '@site/static/images/integrations/sql-clients/dbeaver-sql-editor.png';
import dbeaver_query_log_select from '@site/static/images/integrations/sql-clients/dbeaver-query-log-select.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# DBeaver를 ClickHouse에 연결하기

<ClickHouseSupportedBadge/>

DBeaver는 여러 가지 버전으로 제공됩니다. 이 가이드에서는 [DBeaver Community](https://dbeaver.io/)를 사용합니다. 다양한 버전과 기능은 [여기](https://dbeaver.com/edition/)에서 확인할 수 있습니다. DBeaver는 JDBC를 사용하여 ClickHouse에 연결합니다.

:::note
ClickHouse에서 `Nullable` 컬럼에 대한 개선된 지원을 위해 DBeaver 버전 23.1.0 이상을 사용하세요.
:::

## 1. ClickHouse 세부정보 수집하기 {#1-gather-your-clickhouse-details}

DBeaver는 HTTP(S)를 통해 JDBC를 사용하여 ClickHouse에 연결합니다. 다음 정보가 필요합니다:

- 엔드포인트
- 포트 번호
- 사용자 이름
- 비밀번호

## 2. DBeaver 다운로드 {#2-download-dbeaver}

DBeaver는 https://dbeaver.io/download/ 에서 다운로드할 수 있습니다.

## 3. 데이터베이스 추가하기 {#3-add-a-database}

- **Database > New Database Connection** 메뉴를 사용하거나 **Database Navigator**에서 **New Database Connection** 아이콘을 클릭하여 **데이터베이스에 연결** 대화상자를 열어주세요:

<Image img={dbeaver_add_database} size="md" border alt="새 데이터베이스 추가" />

- **Analytical**을 선택한 후 **ClickHouse**를 선택합니다:

- JDBC URL을 구성합니다. **Main** 탭에서 호스트, 포트, 사용자 이름, 비밀번호 및 데이터베이스를 설정합니다:

<Image img={dbeaver_host_port} size="md" border alt="호스트 이름, 포트, 사용자, 비밀번호 및 데이터베이스 이름 설정" />

- 기본적으로 **SSL > Use SSL** 속성이 설정되어 있지 않습니다. ClickHouse Cloud에 연결하거나 HTTP 포트에서 SSL이 필요한 서버에 연결하는 경우 **SSL > Use SSL**을 다음과 같이 설정합니다:

<Image img={dbeaver_use_ssl} size="md" border alt="필요한 경우 SSL 활성화" />

- 연결을 테스트합니다:

<Image img={dbeaver_test_connection} size="md" border alt="연결 테스트" />

DBeaver가 ClickHouse 드라이버가 설치되어 있지 않은 것을 감지하면 자동으로 다운로드하겠냐고 제안합니다:

<Image img={dbeaver_download_driver} size="md" border alt="ClickHouse 드라이버 다운로드" />

- 드라이버를 다운로드한 후 다시 **Test**를 클릭하여 연결을 테스트합니다:

<Image img={dbeaver_test_connection} size="md" border alt="연결 테스트" />

## 4. ClickHouse 쿼리 실행하기 {#4-query-clickhouse}

쿼리 편집기를 열고 쿼리를 실행합니다.

- 연결을 마우스 오른쪽 버튼으로 클릭하고 **SQL Editor > Open SQL Script**을 선택하여 쿼리 편집기를 엽니다:

<Image img={dbeaver_sql_editor} size="md" border alt="SQL 편집기 열기" />

- `system.query_log`에 대한 예제 쿼리:

<Image img={dbeaver_query_log_select} size="md" border alt="샘플 쿼리" />

## 다음 단계 {#next-steps}

DBeaver의 기능에 대해 알아보려면 [DBeaver 위키](https://github.com/dbeaver/dbeaver/wiki)를 참조하고, ClickHouse의 기능에 대해 알아보려면 [ClickHouse 문서](https://clickhouse.com/docs)를 확인하세요.
