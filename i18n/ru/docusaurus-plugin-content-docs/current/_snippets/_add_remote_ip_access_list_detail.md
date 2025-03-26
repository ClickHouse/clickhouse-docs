
import Image from '@theme/IdealImage';
import ip_allow_list_check_list from '@site/static/images/_snippets/ip-allow-list-check-list.png';
import ip_allow_list_add_current_ip from '@site/static/images/_snippets/ip-allow-list-add-current-ip.png';

<details>
    <summary>Управление списком доступа по IP</summary>

Из списка ваших услуг ClickHouse Cloud выберите ту, с которой вы будете работать, и перейдите в **Настройки**. Если список доступа по IP не содержит IP-адрес или диапазон удаленной системы, который должен подключиться к вашему сервису ClickHouse Cloud, вы можете решить эту проблему с помощью **Добавить IP**:

<Image size="md" img={ip_allow_list_check_list} alt="Проверьте, разрешает ли сервис трафик с вашего IP-адреса в списке доступа по IP" border />

Добавьте отдельный IP-адрес или диапазон адресов, которые должны подключиться к вашему сервису ClickHouse Cloud. Измените форму по своему усмотрению, а затем нажмите **Сохранить**.

<Image size="md" img={ip_allow_list_add_current_ip} alt="Добавьте свой текущий IP-адрес в список доступа по IP в ClickHouse Cloud" border />

</details>
```
