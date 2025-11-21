import Image from '@theme/IdealImage';
import ip_allow_list_check_list from '@site/static/images/_snippets/ip-allow-list-check-list.png';
import ip_allow_list_add_current_ip from '@site/static/images/_snippets/ip-allow-list-add-current-ip.png';

<details>
  <summary>Управление списком доступа по IP-адресам</summary>

  В списке сервисов ClickHouse Cloud выберите сервис, с которым вы будете работать, и перейдите на вкладку **Settings**. Если в списке доступа по IP нет IP-адреса или диапазона IP-адресов удалённой системы, которой необходимо подключаться к вашему сервису ClickHouse Cloud, вы можете устранить проблему с помощью **Add IPs**:

  <Image size="md" img={ip_allow_list_check_list} alt="Проверьте, разрешает ли сервис трафик с вашего IP-адреса в списке доступа по IP-адресам" border />

  Добавьте отдельный IP-адрес или диапазон адресов, которым необходимо подключаться к вашему сервису ClickHouse Cloud. При необходимости измените параметры формы и затем нажмите **Save**.

  <Image size="md" img={ip_allow_list_add_current_ip} alt="Добавьте ваш текущий IP-адрес в список доступа по IP-адресам в ClickHouse Cloud" border />
</details>
