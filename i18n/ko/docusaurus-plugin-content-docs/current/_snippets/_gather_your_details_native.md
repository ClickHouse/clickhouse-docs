import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_native from '@site/static/images/_snippets/connection-details-native.png';
import Image from '@theme/IdealImage';

To connect to ClickHouse with native TCP you need this information:

| Parameter(s)              | Description                                                                                                   |
|---------------------------|---------------------------------------------------------------------------------------------------------------|
| `HOST` and `PORT`         | 일반적으로 TLS를 사용하는 경우 포트는 9440이며, TLS를 사용하지 않는 경우 9000입니다.                                   |
| `DATABASE NAME`           | 기본적으로 `default`라는 데이터베이스가 있습니다. 연결하려는 데이터베이스의 이름을 사용하십시오.                      |
| `USERNAME` and `PASSWORD` | 기본적으로 사용자 이름은 `default`입니다. 사용 사례에 적합한 사용자 이름을 사용하십시오.                                 |

귀하의 ClickHouse Cloud 서비스에 대한 세부정보는 ClickHouse Cloud 콘솔에서 확인할 수 있습니다. 연결할 서비스를 선택하고 **Connect**를 클릭하십시오:

<Image img={cloud_connect_button} size="md" alt="ClickHouse Cloud service connect button" border/>

**Native**를 선택하면, 예제 `clickhouse-client` 명령에 세부정보가 제공됩니다.

<Image img={connection_details_native} size="md" alt="ClickHouse Cloud Native TCP connection details" border/>

자체 관리 ClickHouse를 사용하는 경우 연결 세부정보는 ClickHouse 관리자에 의해 설정됩니다.
