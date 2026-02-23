import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_native from '@site/static/images/_snippets/connection-details-native.png';
import Image from '@theme/IdealImage';

네이티브 TCP를 사용해 ClickHouse에 연결하려면 다음 정보가 필요합니다:

| Parameter(s)              | Description                                               |
| ------------------------- | --------------------------------------------------------- |
| `HOST` and `PORT`         | 일반적으로 TLS를 사용하는 경우 포트는 9440, TLS를 사용하지 않는 경우 포트는 9000입니다. |
| `DATABASE NAME`           | 기본적으로 `default`라는 데이터베이스가 있습니다. 연결하려는 데이터베이스의 이름을 사용합니다.  |
| `USERNAME` and `PASSWORD` | 기본적으로 사용자 이름은 `default`입니다. 사용 사례에 적합한 사용자 이름을 사용합니다.     |

ClickHouse Cloud 서비스에 대한 세부 정보는 ClickHouse Cloud 콘솔에서 확인할 수 있습니다.
연결할 서비스를 선택한 후 **Connect**를 클릭합니다:

<Image img={cloud_connect_button} size="md" alt="ClickHouse Cloud 서비스 연결 버튼" border />

**Native**를 선택하면 예시 `clickhouse-client` 명령에서 세부 정보를 확인할 수 있습니다.

<Image img={connection_details_native} size="md" alt="ClickHouse Cloud 네이티브 TCP 연결 세부 정보" border />

자가 관리형 ClickHouse를 사용하는 경우 연결 세부 정보는 ClickHouse 관리자가 설정합니다.
