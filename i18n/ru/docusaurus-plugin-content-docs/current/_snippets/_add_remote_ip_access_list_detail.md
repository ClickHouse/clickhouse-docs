import Image from '@theme/IdealImage';
import ip_allow_list_check_list from '@site/static/images/_snippets/ip-allow-list-check-list.png';
import ip_allow_list_add_current_ip from '@site/static/images/_snippets/ip-allow-list-add-current-ip.png';

<details>
  <summary>Управление списком доступа по IP (IP Access List)</summary>

  В списке сервисов ClickHouse Cloud выберите сервис, с которым вы будете работать, и перейдите в **Settings**. Если в IP Access List отсутствует IP-адрес или диапазон адресов удалённой системы, которой нужно подключиться к вашему сервису ClickHouse Cloud, вы можете решить эту проблему с помощью **Add IPs**:

  <Image size="md" img={ip_allow_list_check_list} alt="Проверьте, разрешает ли сервис трафик с вашего IP-адреса в IP Access List" border />

  Добавьте отдельный IP-адрес или диапазон адресов, которым нужно подключаться к вашему сервису ClickHouse Cloud. При необходимости измените форму и затем нажмите **Save**.

  <Image size="md" img={ip_allow_list_add_current_ip} alt="Добавьте ваш текущий IP-адрес в IP Access List в ClickHouse Cloud" border />
</details>
