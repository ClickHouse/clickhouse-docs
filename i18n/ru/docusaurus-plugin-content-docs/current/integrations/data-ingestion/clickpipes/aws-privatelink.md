---
sidebar_label: 'AWS PrivateLink для ClickPipes'
description: 'Настройте защищённое подключение между ClickPipes и источником данных с использованием AWS PrivateLink.'
slug: /integrations/clickpipes/aws-privatelink
title: 'AWS PrivateLink для ClickPipes'
doc_type: 'guide'
keywords: ['aws privatelink', 'безопасность ClickPipes', 'vpc endpoint', 'приватное подключение', 'ресурс VPC']
integration:
   - support_level: 'основной'
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

# AWS PrivateLink для ClickPipes {#aws-privatelink-for-clickpipes}

Вы можете использовать [AWS PrivateLink](https://aws.amazon.com/privatelink/) чтобы установить защищённое соединение между VPC, сервисами AWS, вашими локальными системами и ClickHouse Cloud, не выводя трафик в общедоступный Интернет.

В этом документе описана функциональность обратных приватных конечных точек (endpoint) ClickPipes, которая позволяет настроить конечную точку VPC AWS PrivateLink.

## Поддерживаемые источники данных ClickPipes {#supported-sources}

Возможности функции reverse private endpoint в ClickPipes ограничены следующими
типами источников данных:

- Kafka
- Postgres
- MySQL
- MongoDB

## Поддерживаемые типы конечных точек AWS PrivateLink {#aws-privatelink-endpoint-types}

Обратную частную конечную точку ClickPipes можно настроить с использованием одного из следующих подходов AWS PrivateLink:

- [Ресурс VPC](#vpc-resource)
- [Многосетевое подключение MSK для MSK ClickPipe](#msk-multi-vpc)
- [Служба конечных точек VPC](#vpc-endpoint-service)

### Ресурс VPC {#vpc-resource}

:::info
Межрегиональное подключение не поддерживается.
:::

Доступ к ресурсам вашего VPC в ClickPipes можно получить с помощью [PrivateLink](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html). Этот подход не требует настройки балансировщика нагрузки перед источником данных.

Конфигурацию ресурса можно настроить на конкретный хост или ARN кластера RDS.

Это предпочтительный вариант для приёма данных Postgres CDC (фиксация изменений данных) из кластера RDS.

Для настройки PrivateLink с ресурсом VPC:

1. Создайте шлюз ресурсов
2. Создайте конфигурацию ресурса
3. Создайте общий ресурс

<VerticalStepper headerLevel="h4">

#### Создание шлюза ресурсов {#create-resource-gateway}

Шлюз ресурсов — это точка приёма трафика для указанных ресурсов в вашем VPC.

:::note
Рекомендуется, чтобы подсети, подключённые к вашему шлюзу ресурсов, имели достаточное количество доступных IP-адресов.
Рекомендуется использовать маску подсети не менее `/26` для каждой подсети.

Для каждой конечной точки VPC (каждой обратной частной конечной точки) AWS требует последовательный блок из 16 IP-адресов на подсеть (маска подсети `/28`).
Если это требование не выполнено, обратная частная конечная точка перейдёт в состояние сбоя.
:::

Вы можете создать шлюз ресурсов из [консоли AWS](https://docs.aws.amazon.com/vpc/latest/privatelink/create-resource-gateway.html) или с помощью следующей команды:

```bash
aws vpc-lattice create-resource-gateway \
    --vpc-identifier <VPC_ID> \
    --subnet-ids <SUBNET_IDS> \
    --security-group-ids <SG_IDs> \
    --name <RESOURCE_GATEWAY_NAME>
```

Вывод будет содержать идентификатор шлюза ресурсов, который потребуется для следующего шага.

Прежде чем продолжить, необходимо дождаться перехода шлюза ресурсов в состояние `Active`. Проверить состояние можно, выполнив следующую команду:

```bash
aws vpc-lattice get-resource-gateway \
    --resource-gateway-identifier <RESOURCE_GATEWAY_ID>
```

#### Создание конфигурации ресурса VPC {#create-resource-configuration}

Конфигурация ресурса связывается со шлюзом ресурсов, чтобы сделать ваш ресурс доступным.

Вы можете создать конфигурацию ресурса из [консоли AWS](https://docs.aws.amazon.com/vpc/latest/privatelink/create-resource-configuration.html) или с помощью следующей команды:

```bash
aws vpc-lattice create-resource-configuration \
    --resource-gateway-identifier <RESOURCE_GATEWAY_ID> \
    --type <RESOURCE_CONFIGURATION_TYPE> \
    --resource-configuration-definition <RESOURCE_CONFIGURATION_DEFINITION> \
    --name <RESOURCE_CONFIGURATION_NAME>
```

Простейший [тип конфигурации ресурса](https://docs.aws.amazon.com/vpc-lattice/latest/ug/resource-configuration.html#resource-configuration-types) — это конфигурация одного ресурса. Вы можете настроить её напрямую по ARN или указать IP-адрес либо доменное имя, доступное из публичной сети.

Например, для настройки с использованием ARN кластера RDS:

```bash
aws vpc-lattice create-resource-configuration \
    --name my-rds-cluster-config \
    --type ARN \
    --resource-gateway-identifier rgw-0bba03f3d56060135 \
    --resource-configuration-definition 'arnResource={arn=arn:aws:rds:us-east-1:123456789012:cluster:my-rds-cluster}'
```

:::note
Невозможно создать конфигурацию ресурса для публично доступного кластера.
Если ваш кластер публично доступен, необходимо изменить кластер,
сделав его частным перед созданием конфигурации ресурса,
или использовать [список разрешённых IP-адресов](/integrations/clickpipes#list-of-static-ips).
Дополнительную информацию см. в [документации AWS](https://docs.aws.amazon.com/vpc/latest/privatelink/resource-configuration.html#resource-definition).
:::

Вывод будет содержать ARN конфигурации ресурса, который потребуется для следующего шага. Он также будет содержать идентификатор конфигурации ресурса, который потребуется для настройки подключения ClickPipe с ресурсом VPC.

#### Создание общего ресурса {#create-resource-share}

Для совместного использования вашего ресурса требуется общий ресурс. Это осуществляется через Resource Access Manager (RAM).

Вы можете добавить конфигурацию ресурса в общий ресурс через [консоль AWS](https://docs.aws.amazon.com/ram/latest/userguide/working-with-sharing-create.html) или выполнив следующую команду с идентификатором учётной записи ClickPipes `072088201116` (arn:aws:iam::072088201116:root):

```bash
aws ram create-resource-share \
    --principals 072088201116 \
    --resource-arns <RESOURCE_CONFIGURATION_ARN> \
    --name <RESOURCE_SHARE_NAME>
```

Вывод будет содержать ARN общего ресурса, который потребуется для настройки подключения ClickPipe с ресурсом VPC.

Теперь вы готовы [создать ClickPipe с обратной частной конечной точкой](#creating-clickpipe) с использованием ресурса VPC. Для этого необходимо:

* Установить `VPC endpoint type` в значение `VPC Resource`.
* Установить `Resource configuration ID` в идентификатор конфигурации ресурса Resource-Configuration, созданной на шаге 2.
* Установить `Resource share ARN` в ARN общего ресурса Resource-Share, созданного на шаге 3.

Дополнительные сведения о PrivateLink с ресурсом VPC см. в [документации AWS](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html).

</VerticalStepper>


### Многосетевое подключение MSK {#msk-multi-vpc}

[Многосетевое подключение](https://docs.aws.amazon.com/msk/latest/developerguide/aws-access-mult-vpc.html) — это встроенная функция AWS MSK, которая позволяет подключать несколько VPC к одному кластеру MSK.
Поддержка частного DNS доступна по умолчанию и не требует дополнительной настройки.
Межрегиональное подключение не поддерживается.

Это рекомендуемый вариант для ClickPipes с MSK.
Подробнее см. в руководстве [по началу работе](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-getting-started.html).

:::info
Обновите политику кластера MSK и добавьте `072088201116` в список разрешенных участников вашего кластера MSK.
Подробнее см. в руководстве AWS по [присоединению политики кластера](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-cluster-owner-action-policy.html).
:::

Следуйте нашему [руководству по настройке MSK для ClickPipes](/knowledgebase/aws-privatelink-setup-for-msk-clickpipes), чтобы узнать, как настроить подключение.

### Служба конечных точек VPC {#vpc-endpoint-service}

[Служба конечных точек VPC](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html) — это альтернативный способ предоставления доступа к вашему источнику данных для ClickPipes.
Требуется настройка NLB (Network Load Balancer) перед вашим источником данных
и конфигурирование службы конечных точек VPC для использования NLB.

Служба конечных точек VPC может быть [настроена с частным DNS](https://docs.aws.amazon.com/vpc/latest/privatelink/manage-dns-names.html), который будет доступен в VPC ClickPipes.

Это предпочтительный выбор для:

- Любой локальной установки Kafka, требующей поддержки частного DNS
- [Межрегионального подключения для CDC Postgres](/knowledgebase/aws-privatelink-setup-for-clickpipes)
- Межрегионального подключения для кластера MSK. Обратитесь в службу поддержки ClickHouse за помощью.

Подробнее см. в руководстве [по началу работы](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html).

:::info
Добавьте идентификатор учетной записи ClickPipes `072088201116` в список разрешенных участников вашей службы конечных точек VPC.
Подробнее см. в руководстве AWS по [управлению разрешениями](https://docs.aws.amazon.com/vpc/latest/privatelink/configure-endpoint-service.html#add-remove-permissions).
:::

:::info
[Межрегиональный доступ](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html#endpoint-service-cross-region)
может быть настроен для ClickPipes. Добавьте [регион вашего ClickPipe](#aws-privatelink-regions) в список разрешенных регионов в вашей службе конечных точек VPC.
:::

## Создание ClickPipe с reverse private endpoint {#creating-clickpipe}

<VerticalStepper headerLevel="list">

1. Откройте SQL Console сервиса ClickHouse Cloud.

<Image img={cp_service} alt="Сервис ClickPipes" size="md" border/>

2. В левой панели выберите кнопку `Data Sources` и нажмите «Set up a ClickPipe».

<Image img={cp_step0} alt="Выбор импортов" size="lg" border/>

3. Выберите Kafka или Postgres в качестве источника данных.

<Image img={cp_rpe_select} alt="Выбор источника данных" size="lg" border/>

4. Выберите опцию `Reverse private endpoint`.

<Image img={cp_rpe_step0} alt="Выбор reverse private endpoint" size="lg" border/>

5. Выберите одну из существующих reverse private endpoint или создайте новую.

:::info
Если для RDS требуется кросс-регионный доступ, необходимо создать VPC endpoint service, и
[это руководство может служить хорошей отправной точкой](/knowledgebase/aws-privatelink-setup-for-clickpipes) для его настройки.

Для доступа в пределах одного региона рекомендуется создать ресурс VPC (VPC Resource).
:::

<Image img={cp_rpe_step1} alt="Выбор reverse private endpoint" size="lg" border/>

6. Укажите необходимые параметры для выбранного типа endpoint.

<Image img={cp_rpe_step2} alt="Выбор reverse private endpoint" size="lg" border/>
</VerticalStepper>

```
- For VPC resource, provide the configuration share ARN and configuration ID.
- For MSK multi-VPC, provide the cluster ARN and authentication method used with a created endpoint.
- For VPC endpoint service, provide the service name.
```

7. Нажмите `Create` и дождитесь готовности reverse private endpoint.

Если вы создаёте новый endpoint, его настройка займёт некоторое время.
Страница автоматически обновится, как только endpoint будет готов.
Для VPC endpoint service может потребоваться принять запрос на подключение в консоли AWS.

<Image img={cp_rpe_step3} alt="Выбор reverse private endpoint" size="lg" border/>

8. После того как endpoint будет готов, вы можете использовать DNS-имя для подключения к источнику данных.

   В списке endpoint вы можете увидеть DNS-имя доступного endpoint.
   Это может быть либо внутреннее DNS-имя, подготовленное ClickPipes, либо приватное DNS-имя, предоставленное сервисом PrivateLink.
   DNS-имя не является полным сетевым адресом.
   Добавьте порт в соответствии с источником данных.

   Строку подключения MSK можно получить в консоли AWS.

   Чтобы увидеть полный список DNS-имён, откройте его в настройках облачного сервиса.

</VerticalStepper>


## Управление существующими обратными приватными endpoint’ами {#managing-existing-endpoints}

Вы можете управлять существующими обратными приватными endpoint’ами в настройках сервиса ClickHouse Cloud:

<VerticalStepper headerLevel="list">

1. На боковой панели найдите кнопку `Settings` и нажмите её.

    <Image img={cp_rpe_settings0} alt="Настройки ClickHouse Cloud" size="lg" border/>

2. Нажмите `Reverse private endpoints` в разделе `ClickPipe reverse private endpoints`.

    <Image img={cp_rpe_settings1} alt="Настройки ClickHouse Cloud" size="md" border/>

   Расширенная информация об обратном приватном endpoint’е отображается во выдвижной панели.

   Отсюда можно удалить endpoint. Это повлияет на все ClickPipes, которые используют этот endpoint.

</VerticalStepper>

## Поддерживаемые регионы AWS {#aws-privatelink-regions}

Поддержка AWS PrivateLink для ClickPipes ограничена определёнными регионами AWS.
См. [список регионов ClickPipes](/integrations/clickpipes#list-of-static-ips), чтобы узнать доступные регионы.

Это ограничение не распространяется на службу конечной точки VPC PrivateLink с включённой межрегиональной связностью.

## Ограничения {#limitations}

Для конечных точек AWS PrivateLink для ClickPipes, созданных в ClickHouse Cloud, не гарантируется, что они будут созданы
в том же регионе AWS, что и сервис ClickHouse Cloud.

В настоящее время только служба конечных точек VPC поддерживает
межрегиональное подключение.

Приватные конечные точки привязаны к конкретному сервису ClickHouse и не могут быть перенесены между сервисами.
Несколько ClickPipes для одного сервиса ClickHouse могут использовать одну и ту же конечную точку.