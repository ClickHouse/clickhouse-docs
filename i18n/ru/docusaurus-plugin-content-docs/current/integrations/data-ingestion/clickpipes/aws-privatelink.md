---
sidebar_label: 'AWS PrivateLink для ClickPipes'
description: 'Настройте защищённое подключение между ClickPipes и источником данных с помощью AWS PrivateLink.'
slug: /integrations/clickpipes/aws-privatelink
title: 'AWS PrivateLink для ClickPipes'
doc_type: 'guide'
keywords: ['aws privatelink', 'ClickPipes security', 'vpc endpoint', 'private connectivity', 'vpc resource']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_rpe_select from '@site/static/images/integrations/data-ingestion/clickpipes/cp_rpe_select.png';
import cp_rpe_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_rpe_step0.png';
import cp_rpe_step1 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_rpe_step1.png';
import cp_rpe_step2 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_rpe_step2.png';
import cp_rpe_step3 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_rpe_step3.png';
import cp_rpe_settings0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_rpe_settings0.png';
import cp_rpe_settings1 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_rpe_settings1.png';
import Image from '@theme/IdealImage';

# AWS PrivateLink для ClickPipes \{#aws-privatelink-for-clickpipes\}

Вы можете использовать [AWS PrivateLink](https://aws.amazon.com/privatelink/) для организации защищённого соединения между VPC,
сервисами AWS, вашей локальной инфраструктурой и ClickHouse Cloud, не выводя трафик в общедоступный Интернет.

В этом документе описывается функциональность reverse private endpoint в ClickPipes,
которая позволяет настроить конечную точку VPC (VPC endpoint) AWS PrivateLink.

## Поддерживаемые источники данных ClickPipes \{#supported-sources\}

Функциональность reverse private endpoint в ClickPipes поддерживается только для следующих
типов источников данных:

- Kafka
- Postgres
- MySQL
- MongoDB

## Поддерживаемые типы конечных точек AWS PrivateLink \{#aws-privatelink-endpoint-types\}

Обратную приватную конечную точку ClickPipes можно настроить с использованием одного из следующих вариантов AWS PrivateLink:

- [Ресурс VPC](#vpc-resource)
- [Multi-VPC‑подключение MSK для MSK ClickPipe](#msk-multi-vpc)
- [Сервис конечной точки VPC](#vpc-endpoint-service)

### Ресурс VPC \{#vpc-resource\}

:::info
Кросс-региональные подключения не поддерживаются.
:::

Ресурсы вашей VPC могут использоваться в ClickPipes через [PrivateLink](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html). Такой подход не требует настройки балансировщика нагрузки перед источником данных.

Конфигурацию ресурса можно привязать к конкретному хосту или ARN кластера RDS.

Это предпочтительный вариант для CDC для Postgres при приёме данных из кластера RDS.

Чтобы настроить PrivateLink с ресурсом VPC:

1. Создайте шлюз ресурса
2. Создайте конфигурацию ресурса
3. Создайте ресурс общего доступа

<VerticalStepper headerLevel="h4">

#### Создайте шлюз ресурсов \{#create-resource-gateway\}

Шлюз ресурсов — это точка входа, принимающая трафик для указанных ресурсов в вашей VPC.

:::note
Рекомендуется, чтобы к вашему шлюзу ресурсов были присоединены подсети с достаточным количеством доступных IP-адресов.
Рекомендуется иметь маску подсети как минимум `/26` для каждой подсети.

Для каждой конечной точки VPC (каждого Reverse Private Endpoint) AWS требует последовательный блок из 16 IP-адресов на подсеть (`/28` маска подсети).
Если это требование не выполняется, Reverse Private Endpoint перейдёт в состояние ошибки.
:::

Вы можете создать шлюз ресурсов через [консоль AWS](https://docs.aws.amazon.com/vpc/latest/privatelink/create-resource-gateway.html) или с помощью следующей команды:

```bash
aws vpc-lattice create-resource-gateway \
    --vpc-identifier <VPC_ID> \
    --subnet-ids <SUBNET_IDS> \
    --security-group-ids <SG_IDs> \
    --name <RESOURCE_GATEWAY_NAME>
```

Вывод будет содержать идентификатор шлюза ресурса, который потребуется вам на следующем шаге.

Прежде чем продолжить, дождитесь, пока шлюз ресурса перейдёт в состояние `Active`. Текущее состояние можно проверить с помощью следующей команды:

```bash
aws vpc-lattice get-resource-gateway \
    --resource-gateway-identifier <RESOURCE_GATEWAY_ID>
```

#### Создайте Resource-Configuration \{#create-resource-configuration\}

Resource-Configuration ассоциируется со шлюзом ресурсов (resource gateway), чтобы обеспечить доступ к вашему ресурсу.

Вы можете создать Resource-Configuration через [консоль AWS](https://docs.aws.amazon.com/vpc/latest/privatelink/create-resource-configuration.html) или с помощью следующей команды:

```bash
aws vpc-lattice create-resource-configuration \
    --resource-gateway-identifier <RESOURCE_GATEWAY_ID> \
    --type <RESOURCE_CONFIGURATION_TYPE> \
    --resource-configuration-definition <RESOURCE_CONFIGURATION_DEFINITION> \
    --name <RESOURCE_CONFIGURATION_NAME>
```

Самый простой [тип конфигурации ресурса](https://docs.aws.amazon.com/vpc-lattice/latest/ug/resource-configuration.html#resource-configuration-types) — конфигурация одного ресурса (single Resource-Configuration). Вы можете указать ARN напрямую или использовать IP-адрес либо доменное имя, доступные для публичного DNS-разрешения.

Например, чтобы настроить ресурс по ARN кластера RDS:

```bash
aws vpc-lattice create-resource-configuration \
    --name my-rds-cluster-config \
    --type ARN \
    --resource-gateway-identifier rgw-0bba03f3d56060135 \
    --resource-configuration-definition 'arnResource={arn=arn:aws:rds:us-east-1:123456789012:cluster:my-rds-cluster}'
```

:::note
Вы не можете создать конфигурацию ресурса для кластера с публичным доступом.
Если ваш кластер имеет публичный доступ, необходимо изменить кластер,
сделав его приватным, перед созданием конфигурации ресурса
или вместо этого использовать [список разрешённых IP](/integrations/clickpipes#list-of-static-ips).
Дополнительные сведения см. в [документации AWS](https://docs.aws.amazon.com/vpc/latest/privatelink/resource-configuration.html#resource-definition).
:::

Вывод команды будет содержать Resource-Configuration ARN, который понадобится вам на следующем шаге. Он также будет содержать Resource-Configuration ID, который потребуется для настройки подключения ClickPipe к ресурсу VPC.

#### Создайте Resource-Share \{#create-resource-share\}

Чтобы предоставить общий доступ к ресурсу, требуется Resource-Share. Это осуществляется с помощью Resource Access Manager (RAM).

Вы можете добавить Resource-Configuration в Resource-Share в [консоли AWS](https://docs.aws.amazon.com/ram/latest/userguide/working-with-sharing-create.html) или выполнив следующую команду с ID аккаунта ClickPipes `072088201116` (arn:aws:iam::072088201116:root):

```bash
aws ram create-resource-share \
    --principals 072088201116 \
    --resource-arns <RESOURCE_CONFIGURATION_ARN> \
    --name <RESOURCE_SHARE_NAME>
```

Результат будет содержать Resource-Share ARN, который понадобится вам для настройки подключения ClickPipe с ресурсом VPC.

Теперь вы готовы [создать ClickPipe с Reverse private endpoint](#creating-clickpipe), используя ресурс VPC. Вам потребуется:

* Установить `VPC endpoint type` в значение `VPC Resource`.
* Установить `Resource configuration ID` в значение ID Resource-Configuration, созданной на шаге 2.
* Установить `Resource share ARN` в значение ARN Resource-Share, созданного на шаге 3.

Дополнительные сведения о PrivateLink с ресурсом VPC см. в [документации AWS](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html).

</VerticalStepper>


### Мульти-VPC-подключение MSK \{#msk-multi-vpc\}

[Мульти-VPC-подключение](https://docs.aws.amazon.com/msk/latest/developerguide/aws-access-mult-vpc.html) — это встроенная функция AWS MSK, которая позволяет подключать несколько VPC к одному кластеру MSK.
Поддержка частного DNS доступна «из коробки» и не требует дополнительной конфигурации.
Подключение между регионами (cross-region) не поддерживается.

Это рекомендуемый вариант для ClickPipes для MSK.
См. руководство [по началу работы](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-getting-started.html) для получения дополнительной информации.

:::info
Обновите политику вашего кластера MSK и добавьте `072088201116` в список разрешённых principals для вашего кластера MSK.
См. руководство AWS по [прикреплению политики кластера](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-cluster-owner-action-policy.html) для получения дополнительной информации.
:::

Следуйте нашему [руководству по настройке MSK для ClickPipes](/knowledgebase/aws-privatelink-setup-for-msk-clickpipes), чтобы узнать, как настроить подключение.

### Служба конечной точки VPC \{#vpc-endpoint-service\}

[Служба конечной точки VPC](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html) — это альтернативный способ предоставить доступ к вашему источнику данных для ClickPipes.
Для этого требуется развернуть NLB (Network Load Balancer) перед вашим источником данных
и настроить службу конечной точки VPC на использование этого NLB.

Службу конечной точки VPC можно [настроить с частным DNS](https://docs.aws.amazon.com/vpc/latest/privatelink/manage-dns-names.html), который будет доступен в VPC ClickPipes.

Это предпочтительный вариант для:

- Любого локального (on-premises) развертывания Kafka, которому требуется поддержка частного DNS
- [Межрегионального подключения для Postgres CDC](/knowledgebase/aws-privatelink-setup-for-clickpipes)
- Межрегионального подключения для кластера MSK. Пожалуйста, обратитесь в службу поддержки ClickHouse за помощью.

См. руководство [getting started](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html) для получения дополнительной информации.

:::info
Добавьте идентификатор аккаунта ClickPipes `072088201116` в список разрешённых principals для вашей службы конечной точки VPC.
См. руководство AWS по [управлению разрешениями](https://docs.aws.amazon.com/vpc/latest/privatelink/configure-endpoint-service.html#add-remove-permissions) для получения дополнительной информации.
:::

:::info
[Межрегиональный доступ](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html#endpoint-service-cross-region)
может быть настроен для ClickPipes. Добавьте [ваш регион ClickPipe](#aws-privatelink-regions) в список разрешённых регионов в вашей службе конечной точки VPC.
:::

## Создание ClickPipe с reverse private endpoint \{#creating-clickpipe\}

<VerticalStepper headerLevel="list">

1. Откройте SQL Console для своего сервиса ClickHouse Cloud.

<Image img={cp_service} alt="ClickPipes service" size="md" border/>

2. Выберите кнопку `Data Sources` в меню слева и нажмите «Set up a ClickPipe».

<Image img={cp_step0} alt="Select imports" size="lg" border/>

3. В качестве источника данных выберите Kafka или Postgres.

<Image img={cp_rpe_select} alt="Select data source" size="lg" border/>

4. Выберите опцию `Reverse private endpoint`.

<Image img={cp_rpe_step0} alt="Select reverse private endpoint" size="lg" border/>

5. Выберите один из существующих reverse private endpoint или создайте новый.

:::info
Если для RDS требуется кросс-региональный доступ, необходимо создать службу конечной точки VPC (VPC endpoint service), и
[это руководство](/knowledgebase/aws-privatelink-setup-for-clickpipes) может послужить хорошей отправной точкой для её настройки.

Для доступа в пределах одного региона рекомендуется создавать ресурс VPC.
:::

<Image img={cp_rpe_step1} alt="Select reverse private endpoint" size="lg" border/>

6. Укажите необходимые параметры для выбранного типа endpoint.

<Image img={cp_rpe_step2} alt="Select reverse private endpoint" size="lg" border/>

```
- For VPC resource, provide the configuration share ARN and configuration ID.
- For MSK multi-VPC, provide the cluster ARN and authentication method used with a created endpoint.
- For VPC endpoint service, provide the service name.
```

7. Нажмите `Create` и дождитесь, пока обратная приватная конечная точка станет готова.

Если вы создаёте новую конечную точку, на её настройку потребуется некоторое время.
Страница обновится автоматически, как только конечная точка будет готова.
Сервис конечных точек VPC может потребовать принять запрос на подключение в консоли AWS.

<Image img={cp_rpe_step3} alt="Выберите обратную приватную конечную точку" size="lg" border/>

8. После того как конечная точка будет готова, вы можете использовать DNS-имя для подключения к источнику данных.

   В списке конечных точек вы можете увидеть DNS-имя доступной конечной точки.
   Это может быть как внутреннее DNS-имя, созданное ClickPipes, так и приватное DNS-имя, предоставленное сервисом PrivateLink.
   DNS-имя не является полным сетевым адресом.
   Добавьте порт в соответствии с источником данных.

   Строку подключения MSK можно получить в консоли AWS.

   Чтобы увидеть полный список DNS-имён, откройте его в настройках облачного сервиса.

</VerticalStepper>


## Управление существующими обратными приватными endpoint-ами \{#managing-existing-endpoints\}

Вы можете управлять существующими обратными приватными endpoint-ами в настройках сервиса ClickHouse Cloud:

<VerticalStepper headerLevel="list">

1. На боковой панели найдите кнопку `Settings` и нажмите на нее.

    <Image img={cp_rpe_settings0} alt="Настройки ClickHouse Cloud" size="lg" border/>

2. Нажмите `Reverse private endpoints` в разделе `ClickPipe reverse private endpoints`.

    <Image img={cp_rpe_settings1} alt="Настройки ClickHouse Cloud" size="md" border/>

   Расширенная информация об обратном приватном endpoint-е отображается во всплывающем окне.

   Отсюда можно удалить endpoint. Это повлияет на все ClickPipes, использующие этот endpoint.

</VerticalStepper>

## Поддерживаемые регионы AWS \{#aws-privatelink-regions\}

Поддержка AWS PrivateLink для ClickPipes ограничена определёнными регионами AWS.
Список доступных регионов см. в [списке регионов ClickPipes](/integrations/clickpipes#list-of-static-ips).

Это ограничение не распространяется на службу конечных точек VPC PrivateLink с включённым межрегиональным подключением.

## Ограничения \{#limitations\}

Для конечных точек AWS PrivateLink для ClickPipes, создаваемых в ClickHouse Cloud, нет гарантии, что они будут находиться
в том же регионе AWS, что и сервис ClickHouse Cloud.

В настоящее время только сервис VPC endpoint поддерживает
межрегиональное подключение.

Частные конечные точки привязаны к конкретному сервису ClickHouse и не могут быть перенесены между сервисами.
Несколько ClickPipes для одного сервиса ClickHouse могут повторно использовать одну и ту же конечную точку.