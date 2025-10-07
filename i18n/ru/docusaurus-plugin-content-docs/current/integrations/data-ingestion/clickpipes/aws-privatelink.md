---
'sidebar_label': 'AWS PrivateLink для ClickPipes'
'description': 'Установите безопасное соединение между ClickPipes и источником данных,
  используя AWS PrivateLink.'
'slug': '/integrations/clickpipes/aws-privatelink'
'title': 'AWS PrivateLink для ClickPipes'
'doc_type': 'guide'
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

Вы можете использовать [AWS PrivateLink](https://aws.amazon.com/privatelink/) для установления безопасного соединения между VPC, 
службами AWS, вашими локальными системами и ClickHouse Cloud без раскрытия трафика в публичный Интернет.

Этот документ описывает функциональность обратной частной конечной точки ClickPipes, 
которая позволяет настраивать конечную точку VPC AWS PrivateLink.

## Поддерживаемые источники данных ClickPipes {#supported-sources}

Функциональность обратной частной конечной точки ClickPipes ограничена следующими 
типами источников данных:
- Kafka
- Postgres
- MySQL

## Поддерживаемые типы конечных точек AWS PrivateLink {#aws-privatelink-endpoint-types}

Обратная частная конечная точка ClickPipes может быть настроена с помощью одного из следующих подходов AWS PrivateLink:

- [Ресурс VPC](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html)
- [Подключение MSK к нескольким VPC для MSK ClickPipe](https://docs.aws.amazon.com/msk/latest/developerguide/aws-access-mult-vpc.html)
- [Служба конечных точек VPC](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html)

### Ресурс VPC {#vpc-resource}

Ваши ресурсы VPC могут быть доступны в ClickPipes с помощью [PrivateLink](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html). Этот подход не требует настройки балансировщика нагрузки перед вашим источником данных.

Конфигурация ресурса может быть нацелена на конкретный хост или ARN кластера RDS. 
Кросс-региональная поддержка не обеспечивается.

Это предпочтительный выбор для Postgres CDC, загружающего данные из кластера RDS.

Для настройки PrivateLink с ресурсом VPC:
1. Создайте шлюз ресурса
2. Создайте конфигурацию ресурса
3. Создайте общий ресурс

<VerticalStepper headerLevel="h4">

#### Создание шлюза ресурса {#create-resource-gateway}

Шлюз ресурса — это точка, которая принимает трафик для указанных ресурсов в вашем VPC.

:::note
Рекомендуется, чтобы у подсетей, присоединенных к вашему шлюзу ресурса, было достаточно доступных IP-адресов. 
Рекомендуется иметь маску подсети не менее `/26` для каждой подсети.

Для каждой конечной точки VPC (каждой обратной частной конечной точки) AWS требует последовательный блок из 16 IP-адресов на подсеть. (маска подсети `/28`)
Если это требование не выполнено, обратная частная конечная точка перейдет в состояние ошибки.
:::

Вы можете создать шлюз ресурса из [консоли AWS](https://docs.aws.amazon.com/vpc/latest/privatelink/create-resource-gateway.html) или с помощью следующей команды:

```bash
aws vpc-lattice create-resource-gateway \
    --vpc-identifier <VPC_ID> \
    --subnet-ids <SUBNET_IDS> \
    --security-group-ids <SG_IDs> \
    --name <RESOURCE_GATEWAY_NAME>
```

Результат будет содержать идентификатор шлюза ресурса, который вам понадобится для следующего шага.

Перед тем как продолжить, вам нужно дождаться, пока шлюз ресурса не перейдет в состояние `Active`. Вы можете проверить состояние, выполнив следующую команду:

```bash
aws vpc-lattice get-resource-gateway \
    --resource-gateway-identifier <RESOURCE_GATEWAY_ID>
```

#### Создание конфигурации ресурса VPC {#create-resource-configuration}

Конфигурация ресурса связана с шлюзом ресурса, чтобы сделать ваш ресурс доступным.

Вы можете создать конфигурацию ресурса из [консоли AWS](https://docs.aws.amazon.com/vpc/latest/privatelink/create-resource-configuration.html) или с помощью следующей команды:

```bash
aws vpc-lattice create-resource-configuration \
    --resource-gateway-identifier <RESOURCE_GATEWAY_ID> \
    --type <RESOURCE_CONFIGURATION_TYPE> \
    --resource-configuration-definition <RESOURCE_CONFIGURATION_DEFINITION> \
    --name <RESOURCE_CONFIGURATION_NAME>
```

Самый простой тип [конфигурации ресурса](https://docs.aws.amazon.com/vpc-lattice/latest/ug/resource-configuration.html#resource-configuration-types) — это одна конфигурация ресурса. Вы можете настроить с ARN непосредственно или поделиться IP-адресом или доменным именем, которое общедоступно разрешается.

Например, для настройки с ARN кластера RDS:

```bash
aws vpc-lattice create-resource-configuration \
    --name my-rds-cluster-config \
    --type ARN \
    --resource-gateway-identifier rgw-0bba03f3d56060135 \
    --resource-configuration-definition 'arnResource={arn=arn:aws:rds:us-east-1:123456789012:cluster:my-rds-cluster}'
```

:::note
Вы не можете создать конфигурацию ресурса для общедоступного кластера. 
Если ваш кластер общедоступен, вы должны изменить кластер, 
чтобы сделать его частным перед созданием конфигурации ресурса 
или использовать [IP-список разрешенных](/integrations/clickpipes#list-of-static-ips) вместо этого. 
Для получения дополнительной информации смотрите [документацию AWS](https://docs.aws.amazon.com/vpc/latest/privatelink/resource-configuration.html#resource-definition).
:::

Результат будет содержать ARN конфигурации ресурса, который вам понадобится для следующего шага. Он также будет содержать идентификатор конфигурации ресурса, который вам понадобится для настройки соединения ClickPipe с ресурсом VPC.

#### Создание общего ресурса {#create-resource-share}

Для общего использования вашего ресурса требуется общий ресурс. Это осуществляется через Менеджер доступа к ресурсам (RAM).

Вы можете поместить конфигурацию ресурса в общий ресурс через [консоль AWS](https://docs.aws.amazon.com/ram/latest/userguide/working-with-sharing-create.html) или выполнив следующую команду с идентификатором учетной записи ClickPipes `072088201116` (arn:aws:iam::072088201116:root):

```bash
aws ram create-resource-share \
    --principals 072088201116 \
    --resource-arns <RESOURCE_CONFIGURATION_ARN> \
    --name <RESOURCE_SHARE_NAME>
```

Результат будет содержать ARN общего ресурса, который вам понадобится для настройки соединения ClickPipe с ресурсом VPC.

Вы готовы [создать ClickPipe с помощью обратной частной конечной точки](#creating-clickpipe), используя ресурс VPC. Вам нужно:
- Установить `Тип конечной точки VPC` на `Ресурс VPC`.
- Установить `идентификатор конфигурации ресурса` на идентификатор конфигурации ресурса, созданной на шаге 2.
- Установить `ARN общего ресурса` на ARN общего ресурса, созданного на шаге 3.

Для получения более подробной информации о PrivateLink с ресурсом VPC смотрите [документацию AWS](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html).

</VerticalStepper>

### Подключение MSK к нескольким VPC {#msk-multi-vpc}

[Подключение к нескольким VPC](https://docs.aws.amazon.com/msk/latest/developerguide/aws-access-mult-vpc.html) — это встроенная функция AWS MSK, которая позволяет подключать несколько VPC к одному кластеру MSK. 
Поддержка частного DNS представлена «из коробки» и не требует дополнительной настройки. 
Кросс-региональная поддержка не обеспечивается.

Это рекомендуемый вариант для ClickPipes для MSK. 
Смотрите [руководство по началу работы](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-getting-started.html) для получения дополнительной информации.

:::info
Обновите политику вашего кластера MSK и добавьте `072088201116` в разрешенные принципы вашего кластера MSK.
Смотрите руководство AWS по [присоединению политики кластера](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-cluster-owner-action-policy.html) для получения дополнительной информации.
:::

Следуйте нашему [руководству по настройке MSK для ClickPipes](/knowledgebase/aws-privatelink-setup-for-msk-clickpipes), чтобы узнать, как установить соединение.

### Служба конечной точки VPC {#vpc-endpoint-service}

[Служба конечной точки VPC](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html) — это еще один подход для совместного использования вашего источника данных с ClickPipes.
Для этого необходимо настроить NLB (Сетевой балансировщик нагрузки) перед вашим источником данных 
и настроить службу конечных точек VPC для использования NLB.

Служба конечных точек VPC может быть [настроена с частным DNS](https://docs.aws.amazon.com/vpc/latest/privatelink/manage-dns-names.html), 
которая будет доступна в VPC ClickPipes.

Это предпочтительный выбор для:

- Любой локальной настройки Kafka, которая требует поддержки частного DNS
- [Кросс-регионального подключения для Postgres CDC](/knowledgebase/aws-privatelink-setup-for-clickpipes)
- Кросс-регионального подключения для кластера MSK. Пожалуйста, свяжитесь с командой поддержки ClickHouse для получения помощи.

Смотрите [руководство по началу работы](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html) для получения дополнительной информации.

:::info
Добавьте идентификатор учетной записи ClickPipes `072088201116` в разрешенные принципы вашей службы конечных точек VPC.
Смотрите руководство AWS по [управлению правами доступа](https://docs.aws.amazon.com/vpc/latest/privatelink/configure-endpoint-service.html#add-remove-permissions) для получения дополнительной информации.
:::

:::info
[Кросс-региональный доступ](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html#endpoint-service-cross-region) может быть настроен для ClickPipes. Добавьте [ваш регион ClickPipe](#aws-privatelink-regions) в разрешенные регионы вашей службы конечных точек VPC.
:::

## Создание ClickPipe с обратной частной конечной точкой {#creating-clickpipe}

<VerticalStepper headerLevel="list">

1. Доступ к SQL Console вашего ClickHouse Cloud Service.

<Image img={cp_service} alt="Служба ClickPipes" size="md" border/>

2. Выберите кнопку `Источники данных` в меню слева и нажмите «Настроить ClickPipe»

<Image img={cp_step0} alt="Выбор импортов" size="lg" border/>

3. Выберите либо Kafka, либо Postgres в качестве источника данных.

<Image img={cp_rpe_select} alt="Выбор источника данных" size="lg" border/>

4. Выберите опцию `Обратная частная конечная точка`.

<Image img={cp_rpe_step0} alt="Выбор обратной частной конечной точки" size="lg" border/>

5. Выберите любую из существующих обратных частных конечных точек или создайте новую.

:::info
Если требуется кросс-региональный доступ для RDS, вам нужно создать службу конечных точек VPC, и 
[это руководство должно стать](/knowledgebase/aws-privatelink-setup-for-clickpipes) хорошей отправной точкой для ее настройки.

Для доступа в одном регионе создание ресурса VPC является рекомендуемым подходом.
:::

<Image img={cp_rpe_step1} alt="Выбор обратной частной конечной точки" size="lg" border/>

6. Укажите необходимые параметры для выбранного типа конечной точки.

<Image img={cp_rpe_step2} alt="Выбор обратной частной конечной точки" size="lg" border/>

    - Для ресурса VPC укажите ARN общего ресурса и идентификатор конфигурации.
    - Для MSK multi-VPC укажите ARN кластера и метод аутентификации, используемый с созданной конечной точкой.
    - Для службы конечных точек VPC укажите имя службы.

7. Нажмите `Создать` и дождитесь подготовки обратной частной конечной точки.

   Если вы создаете новую конечную точку, это займет некоторое время для ее настройки.
   Страница автоматически обновится, как только конечная точка будет готова.
   Служба конечных точек VPC может потребовать подтверждения запроса на подключение в вашей консоли AWS.

<Image img={cp_rpe_step3} alt="Выбор обратной частной конечной точки" size="lg" border/>

8. Как только конечная точка будет готова, вы можете использовать DNS-имя для подключения к источнику данных.

   В списке конечных точек вы можете увидеть DNS-имя для доступной конечной точки.
   Это может быть как внутреннее DNS-имя, предоставленное ClickPipes, так и частное DNS-имя, предоставленное службой PrivateLink. 
   DNS-имя не является полным сетевым адресом. 
   Добавьте порт в соответствии с источником данных.

   Строку подключения MSK можно получить в консоли AWS.

   Чтобы увидеть полный список DNS-имен, получите его в настройках облачной службы.

</VerticalStepper>

## Управление существующими обратными частными конечными точками {#managing-existing-endpoints}

Вы можете управлять существующими обратными частными конечными точками в настройках службы ClickHouse Cloud:

<VerticalStepper headerLevel="list">

1. В боковом меню найдите кнопку `Настройки` и нажмите на нее.

    <Image img={cp_rpe_settings0} alt="Настройки ClickHouse Cloud" size="lg" border/>

2. Нажмите на `Обратные частные конечные точки` в разделе `Обратные частные конечные точки ClickPipe`.

    <Image img={cp_rpe_settings1} alt="Настройки ClickHouse Cloud" size="md" border/>

    Расширенная информация о обратной частной конечной точке отображается во всплывающем окне.

    Конечную точку можно удалить отсюда. Это повлияет на любые ClickPipes, использующие эту конечную точку.

</VerticalStepper>

## Поддерживаемые регионы AWS {#aws-privatelink-regions}

Поддержка AWS PrivateLink ограничена определенными регионами AWS для ClickPipes. 
Пожалуйста, обратитесь к [списку регионов ClickPipes](/integrations/clickpipes#list-of-static-ips), чтобы увидеть доступные регионы.

Это ограничение не применяется к службе конечных точек VPC PrivateLink с активированным кросс-региональным подключением.

## Ограничения {#limitations}

Конечные точки AWS PrivateLink для ClickPipes, созданные в ClickHouse Cloud, не гарантируются, 
что будут созданы в том же регионе AWS, что и служба ClickHouse Cloud.

В настоящее время только служба конечных точек VPC поддерживает 
кросс-региональное подключение.

Частные конечные точки связаны с конкретным сервисом ClickHouse и не могут быть переданы между сервисами. 
Несколько ClickPipes для одного и того же сервиса ClickHouse могут повторно использовать одну и ту же конечную точку.
