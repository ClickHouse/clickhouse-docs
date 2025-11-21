---
sidebar_label: 'AWS PrivateLink для ClickPipes'
description: 'Установите защищённое подключение между ClickPipes и источником данных с помощью AWS PrivateLink.'
slug: /integrations/clickpipes/aws-privatelink
title: 'AWS PrivateLink для ClickPipes'
doc_type: 'guide'
keywords: ['aws privatelink', 'безопасность ClickPipes', 'конечная точка VPC', 'частное подключение', 'ресурс VPC']
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


# AWS PrivateLink для ClickPipes

Вы можете использовать [AWS PrivateLink](https://aws.amazon.com/privatelink/) для установления защищённого соединения между VPC, сервисами AWS, вашими локальными системами и ClickHouse Cloud, не передавая трафик через публичный интернет.

В этом документе описана функциональность обратной частной конечной точки ClickPipes, позволяющая настроить конечную точку VPC AWS PrivateLink.



## Поддерживаемые источники данных ClickPipes {#supported-sources}

Функциональность обратной приватной конечной точки ClickPipes ограничена следующими
типами источников данных:

- Kafka
- Postgres
- MySQL
- MongoDB


## Поддерживаемые типы конечных точек AWS PrivateLink {#aws-privatelink-endpoint-types}

Обратную частную конечную точку ClickPipes можно настроить с использованием одного из следующих подходов AWS PrivateLink:

- [Ресурс VPC](#vpc-resource)
- [Многосетевое подключение MSK для MSK ClickPipe](#msk-multi-vpc)
- [Сервис конечных точек VPC](#vpc-endpoint-service)

### Ресурс VPC {#vpc-resource}

:::info
Межрегиональное подключение не поддерживается.
:::

Доступ к ресурсам VPC в ClickPipes можно получить с помощью [PrivateLink](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html). Этот подход не требует настройки балансировщика нагрузки перед источником данных.

Конфигурацию ресурса можно настроить для конкретного хоста или ARN кластера RDS.

Это предпочтительный вариант для Postgres CDC при приёме данных из кластера RDS.

Для настройки PrivateLink с ресурсом VPC:

1. Создайте шлюз ресурсов
2. Создайте конфигурацию ресурса
3. Создайте общий ресурс

<VerticalStepper headerLevel="h4">

#### Создание шлюза ресурсов {#create-resource-gateway}

Шлюз ресурсов — это точка, которая принимает трафик для указанных ресурсов в вашей VPC.

:::note
Рекомендуется, чтобы подсети, подключённые к шлюзу ресурсов, имели достаточное количество доступных IP-адресов.
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

Прежде чем продолжить, необходимо дождаться перехода шлюза ресурсов в состояние `Active`. Вы можете проверить состояние, выполнив следующую команду:

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

Самый простой [тип конфигурации ресурса](https://docs.aws.amazon.com/vpc-lattice/latest/ug/resource-configuration.html#resource-configuration-types) — это одиночная конфигурация ресурса. Вы можете настроить её напрямую с помощью ARN или указать IP-адрес или доменное имя, которое можно разрешить публично.

Например, для настройки с использованием ARN кластера RDS:

```bash
aws vpc-lattice create-resource-configuration \
    --name my-rds-cluster-config \
    --type ARN \
    --resource-gateway-identifier rgw-0bba03f3d56060135 \
    --resource-configuration-definition 'arnResource={arn=arn:aws:rds:us-east-1:123456789012:cluster:my-rds-cluster}'
```

:::note
Вы не можете создать конфигурацию ресурса для публично доступного кластера.
Если ваш кластер публично доступен, необходимо изменить кластер,
сделав его частным перед созданием конфигурации ресурса,
или использовать [список разрешённых IP-адресов](/integrations/clickpipes#list-of-static-ips).
Для получения дополнительной информации см. [документацию AWS](https://docs.aws.amazon.com/vpc/latest/privatelink/resource-configuration.html#resource-definition).
:::

Вывод будет содержать ARN конфигурации ресурса, который потребуется для следующего шага. Он также будет содержать идентификатор конфигурации ресурса, который потребуется для настройки подключения ClickPipe с ресурсом VPC.

#### Создание общего ресурса {#create-resource-share}

Для совместного использования ресурса требуется общий ресурс. Это осуществляется через Resource Access Manager (RAM).


Вы можете поместить Resource-Configuration в Resource-Share через [консоль AWS](https://docs.aws.amazon.com/ram/latest/userguide/working-with-sharing-create.html) или выполнив следующую команду с идентификатором учетной записи ClickPipes `072088201116` (arn:aws:iam::072088201116:root):

```bash
aws ram create-resource-share \
    --principals 072088201116 \
    --resource-arns <RESOURCE_CONFIGURATION_ARN> \
    --name <RESOURCE_SHARE_NAME>
```

В выводе команды будет содержаться ARN Resource-Share, который потребуется для настройки подключения ClickPipe с ресурсом VPC.

Теперь вы готовы к [созданию ClickPipe с обратной частной конечной точкой](#creating-clickpipe) с использованием ресурса VPC. Вам потребуется:

- Установить `VPC endpoint type` в значение `VPC Resource`.
- Установить `Resource configuration ID` в значение идентификатора Resource-Configuration, созданного на шаге 2.
- Установить `Resource share ARN` в значение ARN Resource-Share, созданного на шаге 3.

Дополнительную информацию о PrivateLink с ресурсом VPC см. в [документации AWS](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html).

</VerticalStepper>

### Многосетевое подключение MSK {#msk-multi-vpc}

[Многосетевое подключение](https://docs.aws.amazon.com/msk/latest/developerguide/aws-access-mult-vpc.html) — это встроенная функция AWS MSK, которая позволяет подключать несколько VPC к одному кластеру MSK.
Поддержка частного DNS доступна из коробки и не требует дополнительной настройки.
Межрегиональное подключение не поддерживается.

Это рекомендуемый вариант для ClickPipes с MSK.
Дополнительную информацию см. в руководстве [по началу работы](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-getting-started.html).

:::info
Обновите политику кластера MSK и добавьте `072088201116` в список разрешенных принципалов вашего кластера MSK.
Дополнительную информацию см. в руководстве AWS по [присоединению политики кластера](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-cluster-owner-action-policy.html).
:::

Следуйте нашему [руководству по настройке MSK для ClickPipes](/knowledgebase/aws-privatelink-setup-for-msk-clickpipes), чтобы узнать, как настроить подключение.

### Служба конечных точек VPC {#vpc-endpoint-service}

[Служба конечных точек VPC](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html) — это еще один способ предоставить ClickPipes доступ к вашему источнику данных.
Он требует настройки NLB (Network Load Balancer) перед вашим источником данных
и конфигурирования службы конечных точек VPC для использования NLB.

Служба конечных точек VPC может быть [настроена с частным DNS](https://docs.aws.amazon.com/vpc/latest/privatelink/manage-dns-names.html), который будет доступен в VPC ClickPipes.

Это предпочтительный вариант для:

- Любой локальной установки Kafka, требующей поддержки частного DNS
- [Межрегионального подключения для Postgres CDC](/knowledgebase/aws-privatelink-setup-for-clickpipes)
- Межрегионального подключения для кластера MSK. Обратитесь в службу поддержки ClickHouse за помощью.

Дополнительную информацию см. в руководстве [по началу работы](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html).

:::info
Добавьте идентификатор учетной записи ClickPipes `072088201116` в список разрешенных принципалов вашей службы конечных точек VPC.
Дополнительную информацию см. в руководстве AWS по [управлению разрешениями](https://docs.aws.amazon.com/vpc/latest/privatelink/configure-endpoint-service.html#add-remove-permissions).
:::

:::info
[Межрегиональный доступ](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html#endpoint-service-cross-region)
может быть настроен для ClickPipes. Добавьте [регион вашего ClickPipe](#aws-privatelink-regions) в список разрешенных регионов в вашей службе конечных точек VPC.
:::


## Создание ClickPipe с обратной приватной конечной точкой {#creating-clickpipe}

<VerticalStepper headerLevel="list">

1. Откройте SQL-консоль для вашего сервиса ClickHouse Cloud.

<Image img={cp_service} alt='Сервис ClickPipes' size='md' border />

2. Нажмите кнопку `Data Sources` в меню слева и выберите "Set up a ClickPipe"

<Image img={cp_step0} alt='Выбор импорта' size='lg' border />

3. Выберите Kafka или Postgres в качестве источника данных.

<Image img={cp_rpe_select} alt='Выбор источника данных' size='lg' border />

4. Выберите опцию `Reverse private endpoint`.

<Image
  img={cp_rpe_step0}
  alt='Выбор обратной приватной конечной точки'
  size='lg'
  border
/>

5. Выберите одну из существующих обратных приватных конечных точек или создайте новую.

:::info
Если для RDS требуется межрегиональный доступ, необходимо создать сервис конечной точки VPC, и
[данное руководство](/knowledgebase/aws-privatelink-setup-for-clickpipes) послужит хорошей отправной точкой для его настройки.

Для доступа в пределах одного региона рекомендуется создать ресурс VPC.
:::

<Image
  img={cp_rpe_step1}
  alt='Выбор обратной приватной конечной точки'
  size='lg'
  border
/>

6. Укажите необходимые параметры для выбранного типа конечной точки.

<Image
  img={cp_rpe_step2}
  alt='Выбор обратной приватной конечной точки'
  size='lg'
  border
/>

    - Для ресурса VPC укажите ARN общего доступа к конфигурации и идентификатор конфигурации.
    - Для MSK multi-VPC укажите ARN кластера и метод аутентификации, используемый с созданной конечной точкой.
    - Для сервиса конечной точки VPC укажите имя сервиса.

7. Нажмите `Create` и дождитесь готовности обратной приватной конечной точки.

   Если вы создаете новую конечную точку, настройка займет некоторое время.
   Страница автоматически обновится, когда конечная точка будет готова.
   Для сервиса конечной точки VPC может потребоваться принять запрос на подключение в консоли AWS.

<Image
  img={cp_rpe_step3}
  alt='Выбор обратной приватной конечной точки'
  size='lg'
  border
/>

8. После того как конечная точка будет готова, вы сможете использовать DNS-имя для подключения к источнику данных.

   В списке конечных точек вы можете увидеть DNS-имя для доступной конечной точки.
   Это может быть либо внутреннее DNS-имя, предоставленное ClickPipes, либо приватное DNS-имя, предоставленное сервисом PrivateLink.
   DNS-имя не является полным сетевым адресом.
   Добавьте порт в соответствии с источником данных.

   Строку подключения MSK можно получить в консоли AWS.

   Чтобы просмотреть полный список DNS-имен, откройте настройки облачного сервиса.

</VerticalStepper>


## Управление существующими обратными приватными эндпоинтами {#managing-existing-endpoints}

Управлять существующими обратными приватными эндпоинтами можно в настройках сервиса ClickHouse Cloud:

<VerticalStepper headerLevel="list">

1. На боковой панели найдите кнопку `Settings` и нажмите на неё.

   <Image
     img={cp_rpe_settings0}
     alt='Настройки ClickHouse Cloud'
     size='lg'
     border
   />

2. Нажмите на `Reverse private endpoints` в разделе `ClickPipe reverse private endpoints`.

   <Image
     img={cp_rpe_settings1}
     alt='Настройки ClickHouse Cloud'
     size='md'
     border
   />

   Расширенная информация об обратном приватном эндпоинте отображается во всплывающей панели.

   Эндпоинт можно удалить отсюда. Это повлияет на все ClickPipes, использующие этот эндпоинт.

</VerticalStepper>


## Поддерживаемые регионы AWS {#aws-privatelink-regions}

Поддержка AWS PrivateLink для ClickPipes ограничена определёнными регионами AWS.
Список доступных регионов см. в разделе [Регионы ClickPipes](/integrations/clickpipes#list-of-static-ips).

Это ограничение не распространяется на сервис VPC endpoint PrivateLink с включённой межрегиональной связностью.


## Ограничения {#limitations}

Конечные точки AWS PrivateLink для ClickPipes, создаваемые в ClickHouse Cloud, не обязательно создаются
в том же регионе AWS, что и сервис ClickHouse Cloud.

В настоящее время только сервис конечных точек VPC поддерживает
межрегиональное подключение.

Частные конечные точки привязаны к конкретному сервису ClickHouse и не переносятся между сервисами.
Несколько ClickPipes для одного сервиса ClickHouse могут повторно использовать одну и ту же конечную точку.
