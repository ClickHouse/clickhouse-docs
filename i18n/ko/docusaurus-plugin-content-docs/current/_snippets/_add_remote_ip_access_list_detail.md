import Image from '@theme/IdealImage';
import ip_allow_list_check_list from '@site/static/images/_snippets/ip-allow-list-check-list.png';
import ip_allow_list_add_current_ip from '@site/static/images/_snippets/ip-allow-list-add-current-ip.png';

<details>
    <summary>IP 액세스 목록 관리</summary>

ClickHouse Cloud 서비스 목록에서 작업할 서비스를 선택하고 **설정**으로 전환합니다. IP 액세스 목록에 ClickHouse Cloud 서비스에 연결해야 하는 원격 시스템의 IP 주소 또는 범위가 포함되어 있지 않으면 **IP 추가**를 통해 문제를 해결할 수 있습니다:

<Image size="md" img={ip_allow_list_check_list} alt="IP 액세스 목록에서 서비스가 귀하의 IP 주소에서의 트래픽을 허용하는지 확인" border />

ClickHouse Cloud 서비스에 연결해야 하는 개별 IP 주소 또는 주소 범위를 추가합니다. 적절하게 폼을 수정한 후 **저장**합니다.

<Image size="md" img={ip_allow_list_add_current_ip} alt="현재 IP 주소를 ClickHouse Cloud의 IP 액세스 목록에 추가" border />

</details>
