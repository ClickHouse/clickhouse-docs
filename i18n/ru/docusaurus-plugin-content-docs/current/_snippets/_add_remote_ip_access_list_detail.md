title: 'Управление списком разрешенных IP'
sidebar_label: 'Управление списком разрешенных IP'
keywords: ['ClickHouse', 'IP Access List', 'cloud services']
description: 'Управление доступом к вашим ClickHouse Cloud сервисам через список разрешенных IP.'
```

import ip_allow_list_check_list from '@site/static/images/_snippets/ip-allow-list-check-list.png';
import ip_allow_list_add_current_ip from '@site/static/images/_snippets/ip-allow-list-add-current-ip.png';

<details>
    <summary>Управление вашим списком разрешенных IP</summary>

В списке сервисов ClickHouse Cloud выберите сервис, с которым вы будете работать, и перейдите в **Настройки**. Если список разрешенных IP не содержит IP-адреса или диапазона удаленной системы, которая должна подключиться к вашему сервису ClickHouse Cloud, вы можете решить эту проблему с помощью **Добавить IP-адреса**:

<img src={ip_allow_list_check_list} class="image" alt="Проверьте, позволяет ли сервис трафик" />

Добавьте отдельный IP-адрес или диапазон адресов, которые должны подключиться к вашему сервису ClickHouse Cloud. Измените форму по мере необходимости и затем **Сохранить**.

<img src={ip_allow_list_add_current_ip} class="image" alt="Добавьте ваш текущий IP-адрес" />

</details>
