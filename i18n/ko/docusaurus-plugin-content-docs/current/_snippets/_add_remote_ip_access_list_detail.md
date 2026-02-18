import Image from '@theme/IdealImage';
import ip_allow_list_check_list from '@site/static/images/_snippets/ip-allow-list-check-list.png';
import ip_allow_list_add_current_ip from '@site/static/images/_snippets/ip-allow-list-add-current-ip.png';

<details>
  <summary>IP Access List 관리</summary>

  ClickHouse Cloud 서비스 목록에서 작업할 서비스를 선택한 후 **Settings**로 이동합니다. IP Access List에 ClickHouse Cloud 서비스에 연결해야 하는 원격 시스템의 IP 주소 또는 주소 범위가 없다면 **Add IPs**로 문제를 해결할 수 있습니다:

  <Image size="md" img={ip_allow_list_check_list} alt="서비스가 IP Access List에서 사용자의 IP 주소에서 발생하는 트래픽을 허용하는지 확인" border />

  ClickHouse Cloud 서비스에 연결해야 하는 개별 IP 주소 또는 주소 범위를 추가합니다. 필요에 따라 양식을 수정한 후 **Save**를 클릭합니다.

  <Image size="md" img={ip_allow_list_add_current_ip} alt="현재 IP 주소를 ClickHouse Cloud의 IP Access List에 추가" border />
</details>
