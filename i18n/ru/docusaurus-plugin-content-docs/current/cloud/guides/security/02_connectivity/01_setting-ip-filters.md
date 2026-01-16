---
sidebar_label: 'Настройка IP-фильтров'
slug: /cloud/security/setting-ip-filters
title: 'Настройка IP-фильтров'
description: 'На этой странице описано, как настроить IP-фильтры в ClickHouse Cloud для контроля доступа к сервисам ClickHouse.'
doc_type: 'guide'
keywords: ['IP-фильтры', 'список доступа по IP']
---

import Image from '@theme/IdealImage';
import ip_filtering_after_provisioning from '@site/static/images/cloud/security/ip-filtering-after-provisioning.png';
import ip_filter_add_single_ip from '@site/static/images/cloud/security/ip-filter-add-single-ip.png';

## Настройка IP-фильтров \\{#setting-ip-filters\\}

Списки IP-доступа фильтруют трафик к сервисам ClickHouse или по API-ключам, указывая, с каких исходных адресов разрешено подключение. Эти списки настраиваются отдельно для каждого сервиса и для каждого API-ключа. Списки можно задать при создании сервиса или API-ключа, а также изменить позднее.

:::important
Если вы пропустите создание списка IP-доступа для сервиса ClickHouse Cloud, к этому сервису не будет разрешён никакой трафик. Если для списков IP-доступа сервисов ClickHouse установлено значение `Allow from anywhere`, ваш сервис может периодически переводиться из неактивного состояния в активное интернет-сканерами и краулерами, которые ищут публичные IP-адреса, что может привести к незначительным непредвиденным расходам.
:::

## Подготовка \\{#prepare\\}

Прежде чем начать, соберите IP-адреса или диапазоны, которые необходимо добавить в список доступа. Учтите удалённых сотрудников, места дежурств, VPN и т.п. Интерфейс управления списком доступа по IP принимает как отдельные адреса, так и записи в нотации CIDR.

Нотация Classless Inter-domain Routing (CIDR) позволяет указывать диапазоны IP-адресов, меньшие, чем традиционные размеры масок подсетей классов A, B или C (/8, /16 или /24). [ARIN](https://account.arin.net/public/cidrCalculator) и ряд других организаций предоставляют калькуляторы CIDR при необходимости. Если вы хотите получить дополнительную информацию о нотации CIDR, ознакомьтесь с RFC [Classless Inter-domain Routing (CIDR)](https://www.rfc-editor.org/rfc/rfc4632.html).

## Создание или изменение списка доступа по IP-адресам \\{#create-or-modify-an-ip-access-list\\}

:::note Применимо только к подключениям вне PrivateLink
Списки доступа по IP-адресам применяются только к подключениям из публичного интернета, вне [PrivateLink](/cloud/security/connectivity/private-networking).
Если вы хотите принимать трафик только из PrivateLink, установите значение `DenyAll` в списке разрешённых IP (IP Allow list).
:::

<details>
  <summary>Список доступа по IP-адресам для сервисов ClickHouse</summary>

  При создании сервиса ClickHouse значение по умолчанию для списка разрешённых IP — «Allow from nowhere» (запрещён доступ отовсюду). 
  
  В списке сервисов ClickHouse Cloud выберите нужный сервис, затем выберите **Settings**. В разделе **Security** вы найдёте список доступа по IP-адресам. Нажмите кнопку **Add IPs**.
  
  Откроется боковая панель с параметрами для настройки:
  
- Разрешить входящий трафик откуда угодно к сервису
- Разрешить доступ к сервису из определённых местоположений
- Запретить любой доступ к сервису
  
</details>
<details>
  <summary>Список доступа по IP-адресам для API-ключей</summary>

  При создании API-ключа значение по умолчанию для списка разрешённых IP — «Allow from anywhere» (разрешён доступ откуда угодно).
  
  В списке API-ключей нажмите на три точки рядом с API-ключом в столбце **Actions** и выберите **Edit**. В нижней части экрана вы найдёте список доступа по IP-адресам и параметры для настройки:

- Разрешить входящий трафик откуда угодно к сервису
- Разрешить доступ к сервису из определённых местоположений
- Запретить любой доступ к сервису
  
</details>

На этом скриншоте показан список доступа, который разрешает трафик из диапазона IP-адресов с описанием «NY Office range»:
  
<Image img={ip_filtering_after_provisioning} size="md" alt="Существующий список доступа в ClickHouse Cloud" border/>

### Возможные действия \\{#possible-actions\\}

1. Чтобы добавить дополнительную запись, используйте **+ Add new IP**

  В этом примере добавляется один IP-адрес с описанием `London server`:

<Image img={ip_filter_add_single_ip} size="md" alt="Добавление одного IP-адреса в список доступа в ClickHouse Cloud" border/>

2. Удалить существующую запись

  Нажмите на крестик (x), чтобы удалить запись

3. Изменить существующую запись

  Измените запись напрямую

4. Переключиться на разрешение доступа из **Anywhere**

  Это не рекомендуется, но возможно. Мы рекомендуем выставлять в публичный доступ приложение, построенное поверх ClickHouse, и ограничивать доступ к внутреннему сервису ClickHouse Cloud.

Чтобы применить внесённые изменения, нажмите **Save**.

## Проверка \\{#verification\\}

После создания фильтра убедитесь, что можно подключиться к сервису из разрешённого диапазона, и что подключения из‑вне этого диапазона блокируются. Для проверки можно использовать простую команду `curl`:

```bash title="Attempt rejected from outside the allow list"
curl https://<HOSTNAME>.clickhouse.cloud:8443
```

```response
curl: (35) error:02FFF036:system library:func(4095):Connection reset by peer
```

или

```response
curl: (35) LibreSSL SSL_connect: SSL_ERROR_SYSCALL in connection to HOSTNAME.clickhouse.cloud:8443
```

```bash title="Attempt permitted from inside the allow list"
curl https://<HOSTNAME>.clickhouse.cloud:8443
```

```response
Ok.
```

## Ограничения \\{#limitations\\}

- Списки доступа по IP-адресам на данный момент поддерживают только IPv4
