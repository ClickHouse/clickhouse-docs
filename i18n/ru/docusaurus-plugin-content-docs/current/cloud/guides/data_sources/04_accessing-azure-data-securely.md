---
slug: /cloud/data-sources/secure-azure
sidebar_label: 'Безопасный доступ к данным Azure'
title: 'Подключение ClickHouse Cloud к Azure Blob Storage'
description: 'В этой статье показано, как клиенты ClickHouse Cloud могут безопасно получать доступ к своим данным в Azure'
keywords: ['ABS', 'azure blob storage']
doc_type: 'guide'
---

Это руководство описывает, как безопасно подключить ClickHouse Cloud к Azure Blob Storage для выполнения ингестии данных, использования внешних таблиц и других сценариев интеграции.

## Обзор \{#overview\}

ClickHouse Cloud может подключаться к Azure Blob Storage с использованием нескольких методов аутентификации.
Это руководство поможет вам выбрать подходящий способ и безопасно настроить подключение.

Поддерживаемые сценарии:

- Чтение данных из Azure Blob Storage с помощью [функции таблицы azureBlobStorage](/sql-reference/table-functions/azureBlobStorage)
- Создание внешних таблиц с [движком таблиц AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage) 
- Приём данных через ClickPipes
- [Хранение резервных копий в Azure Blob Storage](/cloud/manage/backups/backup-restore-via-ui#azure)

:::warning Важное сетевое ограничение
Когда ваш сервис ClickHouse Cloud и контейнер Azure Blob Storage развернуты в одном и том же регионе Azure, белые списки IP-адресов не работают.

Это происходит потому, что Azure маршрутизирует трафик внутри одного региона через свою внутреннюю сеть (VNet + Service Endpoints), минуя публичный интернет и NAT-шлюзы.
В результате правила брандмауэра учётной записи хранилища Azure, основанные на публичных IP-адресах, не применяются.

Белые списки IP-адресов работают, когда:

- Ваш сервис ClickHouse Cloud находится в другом регионе Azure, чем учётная запись хранилища
- Ваш сервис ClickHouse Cloud запущен в AWS/GCP и подключается к хранилищу Azure

Белые списки IP-адресов не работают, когда:

- Ваш сервис ClickHouse Cloud и хранилище находятся в одном и том же регионе Azure. Используйте [Shared Access Signatures (SAS)](/integrations/clickpipes/object-storage/abs/overview#authentication) в строке подключения вместо белых списков IP-адресов или разверните ABS и ClickHouse в разных регионах.
:::

## Настройка сети (только для разных регионов) \{#network-config\}

:::warning Только для разных регионов
Этот раздел применим только в том случае, если ваш сервис ClickHouse Cloud и контейнер Azure Blob Storage находятся в разных регионах Azure или когда ClickHouse Cloud работает в AWS/GCP.
Для развертываний в одном регионе вместо этого используйте SAS-токены.
:::

<VerticalStepper headerLevel="h3">

### Найдите исходящие IP-адреса ClickHouse Cloud \{#find-egress-ips\}

Чтобы настроить правила брандмауэра на основе IP-адресов, необходимо добавить исходящие IP-адреса для вашего региона ClickHouse Cloud в список разрешенных.

Выполните следующую команду, чтобы получить список исходящих и входящих IP-адресов по регионам. 
Замените `eastus` ниже на ваш регион, чтобы отфильтровать другие регионы:

```bash
# Для регионов Azure
curl https://api.clickhouse.cloud/static-ips.json | jq '.azure[] | select(.region == "westus")'
```

Вы увидите что-то подобное:

```response
{
  "egress_ips": [
    "20.14.94.21",
    "20.150.217.205",
    "20.38.32.164"
  ],
  "ingress_ips": [
    "4.227.34.126"
  ],
  "region": "westus3"
}
```

:::tip
См. [регионы Azure](/cloud/reference/supported-regions#azure-regions) для списка поддерживаемых регионов Cloud
и столбец "Programmatic name" в [списке регионов Azure](https://learn.microsoft.com/en-us/azure/reliability/regions-list#azure-regions-list-1),
чтобы узнать, какое имя использовать.
:::

Подробнее см. ["Cloud IP addresses"](/manage/data-sources/cloud-endpoints-api).

### Настройка брандмауэра Azure Storage \{#configure-firewall\}

Перейдите к своей учетной записи Storage (Storage Account) в Azure Portal.

1. Перейдите в **Networking** → **Firewalls and virtual networks**
2. Выберите **Enabled from selected virtual networks and IP addresses**
3. Добавьте каждый исходящий IP-адрес ClickHouse Cloud, полученный на предыдущем шаге, в поле Address range

:::warning
Не добавляйте приватные IP-адреса ClickHouse Cloud (адреса вида 10.x.x.x)
:::

4. Нажмите **Save**

Дополнительные сведения см. в документации [Configure Azure Storage firewalls](https://learn.microsoft.com/en-us/azure/storage/common/storage-network-security?tabs=azure-portal).

</VerticalStepper>

## Конфигурация ClickPipes \{#clickpipes-config\}

При использовании [ClickPipes](/integrations/clickpipes) с Azure Blob Storage необходимо настроить аутентификацию через интерфейс ClickPipes.
См. раздел ["Создание вашего первого Azure ClickPipe"](/integrations/clickpipes/object-storage/azure-blob-storage/get-started) для получения дополнительной информации.

:::note
ClickPipes использует отдельные статические IP-адреса для исходящих подключений.
Эти IP-адреса должны быть внесены в белый список, если вы используете правила брандмауэра, основанные на IP-адресах.

См. раздел ["Список статических IP-адресов"](/integrations/clickpipes#list-of-static-ips)
:::

:::tip
Ограничение, связанное с добавлением в белый список IP-адресов только в пределах того же региона, упомянутое в начале этого документа, также относится к ClickPipes.
Если ваш сервис ClickPipes и Azure Blob Storage находятся в одном регионе, используйте аутентификацию с помощью SAS-токена вместо создания белого списка IP-адресов.
:::