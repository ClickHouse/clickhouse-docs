---
sidebar_label: 'AWS PrivateLink для ClickPipes'
description: 'Установите защищённое подключение между ClickPipes и источником данных с помощью AWS PrivateLink.'
slug: /integrations/clickpipes/aws-privatelink
title: 'AWS PrivateLink для ClickPipes'
doc_type: 'guide'
keywords: ['aws privatelink', 'безопасность ClickPipes', 'vpc endpoint', 'частное подключение', 'ресурс VPC']
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

Вы можете использовать [AWS PrivateLink](https://aws.amazon.com/privatelink/), чтобы обеспечить защищенное соединение между VPC,
сервисами AWS, вашими локальными системами и ClickHouse Cloud, не выводя трафик в общедоступный интернет.

В этом документе описывается функциональность обратной частной конечной точки ClickPipes,
которая позволяет настроить конечную точку VPC AWS PrivateLink.

## Поддерживаемые источники данных ClickPipes \{#supported-sources\}

Функциональность обратных приватных конечных точек (endpoint) ClickPipes ограничена следующими
типами источников данных:

- Kafka
- Postgres
- MySQL
- MongoDB

## Поддерживаемые типы конечных точек AWS PrivateLink \{#aws-privatelink-endpoint-types\}

Обратную приватную конечную точку для ClickPipes можно настроить с использованием одного из следующих вариантов AWS PrivateLink:

- [Ресурс VPC](#vpc-resource)
- [Multi‑VPC‑подключение MSK для MSK ClickPipe](#msk-multi-vpc)
- [Служба конечной точки VPC](#vpc-endpoint-service)

### Ресурс VPC \{#vpc-resource\}

:::info
Межрегиональные подключения не поддерживаются.
:::

К ресурсам вашей VPC можно получить доступ в ClickPipes с использованием [PrivateLink](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html). Этот подход не требует настройки балансировщика нагрузки перед источником данных.

Конфигурацию ресурса можно настроить для конкретного хоста или ARN кластера RDS.

Это предпочтительный вариант для CDC в Postgres при приёме данных из кластера RDS.

Чтобы настроить PrivateLink с ресурсом VPC:

1. Создайте шлюз ресурса
2. Создайте конфигурацию ресурса
3. Создайте общий доступ к ресурсу

<VerticalStepper headerLevel="h4">
  #### Создайте resource gateway

  Resource gateway — это точка, которая принимает трафик для указанных ресурсов в вашей VPC.

  :::note
  Рекомендуется, чтобы подсети, к которым подключён ваш resource gateway, имели достаточно доступных IP-адресов.
  Желательно использовать маску подсети не менее `/26` для каждой подсети.

  Для каждого VPC endpoint (каждого Reverse Private Endpoint) AWS требует последовательный блок из 16 IP-адресов на подсеть (маска подсети `/28`).
  Если это требование не выполняется, Reverse Private Endpoint перейдёт в состояние ошибки.
  :::

  Вы можете создать resource gateway из [консоли AWS](https://docs.aws.amazon.com/vpc/latest/privatelink/create-resource-gateway.html) или с помощью следующей команды:

  ```bash
  aws vpc-lattice create-resource-gateway \
      --vpc-identifier <VPC_ID> \
      --subnet-ids <SUBNET_IDS> \
      --security-group-ids <SG_IDs> \
      --name <RESOURCE_GATEWAY_NAME>
  ```

  Результат выполнения команды будет содержать идентификатор resource gateway, который понадобится вам на следующем шаге.

  Прежде чем продолжить, необходимо дождаться, пока resource gateway не перейдёт в состояние `Active`. Вы можете проверить состояние, выполнив следующую команду:

  ```bash
  aws vpc-lattice get-resource-gateway \
      --resource-gateway-identifier <RESOURCE_GATEWAY_ID>
  ```

  #### Создайте VPC Resource-Configuration

  Resource-Configuration ассоциируется с resource gateway, чтобы сделать ваш ресурс доступным.

  Вы можете создать Resource-Configuration из [консоли AWS](https://docs.aws.amazon.com/vpc/latest/privatelink/create-resource-configuration.html) или с помощью следующей команды:

  ```bash
  aws vpc-lattice create-resource-configuration \
      --resource-gateway-identifier <RESOURCE_GATEWAY_ID> \
      --type <RESOURCE_CONFIGURATION_TYPE> \
      --resource-configuration-definition <RESOURCE_CONFIGURATION_DEFINITION> \
      --name <RESOURCE_CONFIGURATION_NAME>
  ```

  Самый простой [тип конфигурации ресурса](https://docs.aws.amazon.com/vpc-lattice/latest/ug/resource-configuration.html#resource-configuration-types) — одиночная Resource-Configuration. Вы можете задать её напрямую через ARN или указать IP-адрес либо доменное имя, которое публично резолвится.

  Например, чтобы настроить конфигурацию по ARN кластера RDS:

  ```bash
  aws vpc-lattice create-resource-configuration \
      --name my-rds-cluster-config \
      --type ARN \
      --resource-gateway-identifier rgw-0bba03f3d56060135 \
      --resource-configuration-definition 'arnResource={arn=arn:aws:rds:us-east-1:123456789012:cluster:my-rds-cluster}'
  ```

  :::note
  Вы не можете создать конфигурацию ресурса для кластера с публичным доступом.
  Если ваш кластер доступен публично, вы должны изменить настройки кластера,
  чтобы сделать его приватным перед созданием конфигурации ресурса
  или вместо этого использовать [список разрешённых IP](/integrations/clickpipes#list-of-static-ips).
  Дополнительные сведения см. в [документации AWS](https://docs.aws.amazon.com/vpc/latest/privatelink/resource-configuration.html#resource-definition).
  :::

  Результат выполнения команды будет содержать ARN Resource-Configuration, который понадобится вам на следующем шаге. Он также будет содержать идентификатор Resource-Configuration, который потребуется для настройки подключения ClickPipe к ресурсу VPC.

  #### Создайте Resource-Share

  Для общего доступа к ресурсу требуется Resource-Share. Это реализуется через Resource Access Manager (RAM).

  :::note
  Resource-Share может использоваться только для одного Reverse Private Endpoint и не может быть использован повторно.
  Если вам необходимо использовать одну и ту же Resource-Configuration для нескольких Reverse Private Endpoints,
  вы должны создать отдельный Resource-Share для каждого endpoint.
  Resource-Share остаётся в вашем аккаунте AWS после удаления Reverse Private Endpoint
  и должен быть удалён вручную, если больше не требуется.
  :::

  Вы можете добавить Resource-Configuration в Resource-Share через [консоль AWS](https://docs.aws.amazon.com/ram/latest/userguide/working-with-sharing-create.html) или выполнив следующую команду с использованием идентификатора аккаунта ClickPipes `072088201116` (arn:aws:iam::072088201116:root):

  ```bash
  aws ram create-resource-share \
      --principals 072088201116 \
      --resource-arns <RESOURCE_CONFIGURATION_ARN> \
      --name <RESOURCE_SHARE_NAME>
  ```

  Результат выполнения команды будет содержать ARN Resource-Share, который потребуется для настройки подключения ClickPipe к ресурсу VPC.

  Теперь вы готовы [создать ClickPipe с Reverse private endpoint](#creating-clickpipe), используя ресурс VPC. Вам нужно:

  * Установите `VPC endpoint type` в значение `VPC Resource`.
  * Установить `Resource configuration ID` в идентификатор Resource-Configuration, созданной на шаге 2.
  * Установить `Resource share ARN` в ARN Resource-Share, созданного на шаге 3.

  Для получения дополнительной информации о PrivateLink с ресурсом VPC см. [документацию AWS](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html).
</VerticalStepper>

### Мульти-VPC-подключение MSK {#msk-multi-vpc}

[Мульти-VPC-подключение](https://docs.aws.amazon.com/msk/latest/developerguide/aws-access-mult-vpc.html) — это встроенная возможность AWS MSK, которая позволяет подключать несколько VPC к одному кластеру MSK.
Поддержка частного DNS доступна по умолчанию и не требует дополнительной конфигурации.
Подключение между регионами (cross-region) не поддерживается.

Это рекомендованный вариант для ClickPipes for MSK.
См. руководство по [началу работы](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-getting-started.html) для получения дополнительной информации.

:::info
Обновите политику вашего кластера MSK и добавьте `072088201116` в список разрешённых principals для вашего кластера MSK.
См. руководство AWS по [прикреплению политики кластера](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-cluster-owner-action-policy.html) для получения дополнительной информации.
:::

Следуйте нашему [руководству по настройке MSK для ClickPipes](/knowledgebase/aws-privatelink-setup-for-msk-clickpipes), чтобы узнать, как настроить подключение.

### Служба конечной точки VPC {#vpc-endpoint-service}

[Служба конечной точки VPC](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html) — это альтернативный способ предоставить доступ к вашему источнику данных для ClickPipes.
Для этого требуется настроить NLB (Network Load Balancer) перед вашим источником данных
и настроить службу конечной точки VPC на использование этого NLB.

Службу конечной точки VPC можно [настроить с использованием приватного DNS](https://docs.aws.amazon.com/vpc/latest/privatelink/manage-dns-names.html), который будет доступен в VPC ClickPipes.

Это предпочтительный вариант для:

- Любого on-premises-развертывания Kafka, которому требуется поддержка приватного DNS
- [Межрегионального подключения для Postgres CDC](/knowledgebase/aws-privatelink-setup-for-clickpipes)
- Межрегионального подключения для кластера MSK. Пожалуйста, свяжитесь с командой поддержки ClickHouse за помощью.

См. руководство по началу работы ([getting started](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html)) для получения дополнительной информации.

:::info
Добавьте идентификатор учетной записи ClickPipes `072088201116` в список разрешённых principals вашей службы конечной точки VPC.
См. руководство AWS по [управлению правами доступа](https://docs.aws.amazon.com/vpc/latest/privatelink/configure-endpoint-service.html#add-remove-permissions) для получения дополнительной информации.
:::

:::info
[Межрегиональный доступ](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html#endpoint-service-cross-region)
можно настроить для ClickPipes. Добавьте [ваш регион ClickPipe](#aws-privatelink-regions) в список разрешённых регионов в вашей службе конечной точки VPC.
:::

## Создание ClickPipe с reverse private endpoint {#creating-clickpipe}

<VerticalStepper headerLevel="list">

1. Откройте SQL Console для вашего ClickHouse Cloud Service.

<Image img={cp_service} alt="Сервис ClickPipes" size="md" border/>

2. В левом меню выберите кнопку `Data Sources` и нажмите `Set up a ClickPipe`.

<Image img={cp_step0} alt="Выбор импортов" size="lg" border/>

3. Выберите Kafka или Postgres в качестве источника данных.

<Image img={cp_rpe_select} alt="Выбор источника данных" size="lg" border/>

4. Выберите опцию `Reverse private endpoint`.

<Image img={cp_rpe_step0} alt="Выбор reverse private endpoint" size="lg" border/>

5. Выберите один из существующих reverse private endpoint или создайте новый.

:::info
Если для RDS требуется доступ между регионами (cross-region), вам нужно создать VPC endpoint service, и
[это руководство](/knowledgebase/aws-privatelink-setup-for-clickpipes) станет хорошей отправной точкой для его настройки.

Для доступа в пределах одного региона (same-region) рекомендуется создавать VPC Resource.
:::

<Image img={cp_rpe_step1} alt="Выбор reverse private endpoint" size="lg" border/>

6. Укажите необходимые параметры для выбранного типа endpoint.

<Image img={cp_rpe_step2} alt="Выбор reverse private endpoint" size="lg" border/>

    - Для VPC resource укажите configuration share ARN и configuration ID.
    - Для MSK multi-VPC укажите cluster ARN и метод аутентификации, используемый с созданным endpoint.
    - Для VPC endpoint service укажите service name.

7. Нажмите `Create` и дождитесь, пока reverse private endpoint будет готов.

   Если вы создаёте новый endpoint, его настройка займёт некоторое время.
   Страница обновится автоматически, как только endpoint будет готов.
   Для VPC endpoint service может потребоваться принять запрос на соединение в консоли AWS.

<Image img={cp_rpe_step3} alt="Выбор reverse private endpoint" size="lg" border/>

8. После того как endpoint будет готов, вы можете использовать DNS-имя для подключения к источнику данных.

   В списке endpoints вы можете увидеть DNS-имя доступного endpoint.
   Это может быть либо внутреннее DNS-имя, подготовленное ClickPipes, либо private DNS-имя, предоставленное PrivateLink-сервисом.
   DNS-имя не является полным сетевым адресом.
   Добавьте порт в соответствии с источником данных.

   Строку подключения MSK можно получить в консоли AWS.

   Чтобы увидеть полный список DNS-имён, откройте настройки облачного сервиса.

</VerticalStepper>

## Управление существующими обратными приватными конечными точками {#managing-existing-endpoints}

Вы можете управлять существующими обратными приватными конечными точками в настройках сервиса ClickHouse Cloud:

<VerticalStepper headerLevel="list">

1. В боковой панели найдите кнопку `Settings` и нажмите на нее.

    <Image img={cp_rpe_settings0} alt="Настройки ClickHouse Cloud" size="lg" border/>

2. Нажмите на `Reverse private endpoints` в разделе `ClickPipe reverse private endpoints`.

    <Image img={cp_rpe_settings1} alt="Настройки ClickHouse Cloud" size="md" border/>

   Расширенная информация об обратной приватной конечной точке отображается в выезжающей панели.

   Отсюда вы можете удалить конечную точку. Это повлияет на все ClickPipes, которые используют эту конечную точку.

</VerticalStepper>

## Поддерживаемые регионы AWS {#aws-privatelink-regions}

Поддержка AWS PrivateLink для ClickPipes ограничена отдельными регионами AWS.
См. [список регионов ClickPipes](/integrations/clickpipes#list-of-static-ips), чтобы узнать доступные регионы.

Это ограничение не применяется к службе конечной точки VPC PrivateLink с включённым подключением между регионами.

## Ограничения \{#limitations\}

Конечные точки AWS PrivateLink для ClickPipes, создаваемые в ClickHouse Cloud, не гарантируется создавать
в том же регионе AWS, что и сервис ClickHouse Cloud.

В настоящее время только служба конечных точек VPC поддерживает
межрегиональное подключение.

Частные конечные точки привязаны к конкретному сервису ClickHouse и не могут быть перенесены между сервисами.
Несколько ClickPipes для одного сервиса ClickHouse могут повторно использовать одну и ту же конечную точку.

AWS MSK поддерживает только один PrivateLink (конечную точку VPC) на кластер MSK для каждого типа аутентификации (SASL_IAM или SASL_SCRAM). В результате несколько сервисов или организаций ClickHouse Cloud не могут создавать отдельные подключения PrivateLink к одному и тому же кластеру MSK, используя один и тот же тип аутентификации.