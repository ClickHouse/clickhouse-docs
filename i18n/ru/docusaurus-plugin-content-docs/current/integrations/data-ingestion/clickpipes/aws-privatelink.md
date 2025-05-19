---
sidebar_label: 'AWS PrivateLink для ClickPipes'
description: 'Установите безопасное соединение между ClickPipes и источником данных с помощью AWS PrivateLink.'
slug: /integrations/clickpipes/aws-privatelink
title: 'AWS PrivateLink для ClickPipes'
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
сервисами AWS, вашими локальными системами и ClickHouse Cloud без раскрытия трафика в публичный Интернет.

В этом документе описывается функциональность обратной частной конечной точки ClickPipes,
которая позволяет настраивать конечную точку VPC AWS PrivateLink.

## Поддерживаемые типы конечных точек AWS PrivateLink {#aws-privatelink-endpoint-types}

Обратная частная конечная точка ClickPipes может быть настроена с использованием одного из следующих подходов AWS PrivateLink:

- [Ресурс VPC](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html)
- [Подключение MSK с несколькими VPC для MSK ClickPipe](https://docs.aws.amazon.com/msk/latest/developerguide/aws-access-mult-vpc.html)
- [Сервис конечной точки VPC](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html)

Следуйте по вышеуказанным ссылкам для получения подробных инструкций по настройке соответствующих ресурсов AWS PrivateLink.

### Ресурс VPC {#vpc-resource}

Ваши ресурсы VPC можно использовать в ClickPipes с помощью PrivateLink.
Конфигурация ресурса может настраиваться с конкретным хостом или ARN кластера RDS.
Кросс-региональная поддержка не предоставляется.

Это предпочтительный выбор для Postgres CDC, который загружает данные из кластера RDS.

См. [руководство по началу работы](https://docs.aws.amazon.com/vpc/latest/privatelink/resource-configuration.html) для получения дополнительных деталей.

:::info
Ресурс VPC должен быть доступен для учетной записи ClickPipes. Добавьте `072088201116` в разрешенные принципы в конфигурации общего доступа к вашему ресурсу.
См. руководство AWS по [обмену ресурсами](https://docs.aws.amazon.com/ram/latest/userguide/working-with-sharing-create.html) для получения дополнительных деталей.
:::

### Подключение MSK с несколькими VPC {#msk-multi-vpc}

MSK с несколькими VPC - это встроенная функция AWS MSK, которая позволяет подключать несколько VPC к одному кластеру MSK.
Поддержка частного DNS предоставляется из коробки и не требует дополнительной настройки.
Кросс-региональная поддержка не предоставляется.

Это рекомендованный вариант для ClickPipes для MSK.
См. [руководство по началу работы](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-getting-started.html) для получения дополнительных деталей.

:::info
Обновите политику вашего кластера MSK и добавьте `072088201116` в разрешенные принципы вашего кластера MSK.
См. руководство AWS по [присоединению кластера политики](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-cluster-owner-action-policy.html) для получения дополнительных деталей.
:::

Следуйте нашему [руководству по настройке MSK для ClickPipes](/knowledgebase/aws-privatelink-setup-for-msk-clickpipes), чтобы узнать, как настроить соединение.

### Сервис конечной точки VPC {#vpc-endpoint-service}

Сервис VPC - это другой подход для обмена вашим источником данных с ClickPipes.
Он требует настройки NLB (Сетевого балансировщика нагрузки) перед вашим источником данных
и настройки сервиса конечной точки VPC для использования NLB.

Сервис конечной точки VPC можно [настроить с частным DNS](https://docs.aws.amazon.com/vpc/latest/privatelink/manage-dns-names.html),
который будет доступен в VPC ClickPipes.

Это предпочтительный выбор для:

- Любой локальной настройки Kafka, которая требует поддержки частного DNS
- [Кросс-регионального подключения для Postgres CDC](/knowledgebase/aws-privatelink-setup-for-clickpipes)
- Кросс-регионального подключения для кластера MSK. Пожалуйста, обратитесь в службу поддержки ClickHouse за помощью.

См. [руководство по началу работы](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html) для получения дополнительных деталей.

:::info
Добавьте идентификатор учетной записи ClickPipes `072088201116` в разрешенные принципы вашего сервиса конечной точки VPC.
См. руководство AWS по [управлению разрешениями](https://docs.aws.amazon.com/vpc/latest/privatelink/configure-endpoint-service.html#add-remove-permissions) для получения дополнительных деталей.
:::

:::info
[Кросс-региональный доступ](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html#endpoint-service-cross-region)
может быть настроен для ClickPipes. Добавьте [ваш регион ClickPipe](#aws-privatelink-regions) в разрешенные регионы в вашем сервисе конечной точки VPC.
:::

## Создание ClickPipe с обратной частной конечной точкой {#creating-clickpipe}

1. Получите доступ к SQL Консоли для вашего сервиса ClickHouse Cloud.

<Image img={cp_service} alt="Сервис ClickPipes" size="md" border/>

2. Выберите кнопку `Источники данных` в меню слева и нажмите на "Настроить ClickPipe".

<Image img={cp_step0} alt="Выберите импорты" size="lg" border/>

3. Выберите Kafka или Postgres в качестве источника данных.

<Image img={cp_rpe_select} alt="Выберите источник данных" size="lg" border/>

4. Выберите опцию `Обратная частная конечная точка`.

<Image img={cp_rpe_step0} alt="Выберите обратную частную конечную точку" size="lg" border/>

5. Выберите любую из существующих обратных частных конечных точек или создайте новую.

:::info
Если требуется кросс-региональный доступ для RDS, вам необходимо создать сервис конечной точки VPC, и 
[это руководство должно предоставить](/knowledgebase/aws-privatelink-setup-for-clickpipes) хорошую отправную точку для его настройки.

Для доступа в рамках одного региона рекомендуется создавать ресурс VPC.
:::

<Image img={cp_rpe_step1} alt="Выберите обратную частную конечную точку" size="lg" border/>

6. Укажите необходимые параметры для выбранного типа конечной точки.

<Image img={cp_rpe_step2} alt="Выберите обратную частную конечную точку" size="lg" border/>

    - Для ресурса VPC укажите ARN конфигурации общего доступа и идентификатор конфигурации.
    - Для MSK с несколькими VPC укажите ARN кластера и метод аутентификации, используемый с созданной конечной точкой.
    - Для сервиса конечной точки VPC укажите имя сервиса.

7. Нажмите `Создать` и подождите, пока обратная частная конечная точка не будет готова.

   Если вы создаете новую конечную точку, на ее настройку потребуется некоторое время.
   Страница обновится автоматически, как только конечная точка будет готова.
   Сервис конечной точки VPC может потребовать подтверждения запросов на подключение в вашей консоли AWS.

<Image img={cp_rpe_step3} alt="Выберите обратную частную конечную точку" size="lg" border/>

8. Как только конечная точка будет готова, вы сможете использовать имя DNS для подключения к источнику данных.

   В списке конечных точек вы можете увидеть имя DNS для доступной конечной точки.
   Это может быть либо внутреннее имя DNS, предоставленное ClickPipes, либо частное имя DNS, предоставленное сервисом PrivateLink.
   Имя DNS не является полным сетевым адресом.
   Добавьте порт в соответствии с источником данных.

   Строку подключения MSK можно получить в консоли AWS.

   Чтобы увидеть полный список имен DNS, получите доступ к нему в настройках облачного сервиса.

## Управление существующими обратными частными конечными точками {#managing-existing-endpoints}

Вы можете управлять существующими обратными частными конечными точками в настройках сервиса ClickHouse Cloud:

1. Найдите кнопку `Настройки` в боковой панели и нажмите на нее.

<Image img={cp_rpe_settings0} alt="Настройки ClickHouse Cloud" size="lg" border/>

2. Нажмите на `Обратные частные конечные точки` в разделе `Обратные частные конечные точки ClickPipe`.

<Image img={cp_rpe_settings1} alt="Настройки ClickHouse Cloud" size="md" border/>

    Расширенная информация о обратной частной конечной точке отображается в выпадающем меню.

    Конечная точка может быть удалена отсюда. Это повлияет на любые ClickPipes, использующие эту конечную точку.

## Поддерживаемые регионы AWS {#aws-privatelink-regions}

Следующие регионы AWS поддерживаются для AWS PrivateLink:

- `us-east-1` - для служб ClickHouse, работающих в регионе `us-east-1`
- `eu-central-1` для служб ClickHouse, работающих в регионах ЕС
- `us-east-2` - для служб ClickHouse, работающих везде остальном

Это ограничение не применяется к типу сервиса конечной точки VPC, так как он поддерживает кросс-региональное подключение.

## Ограничения {#limitations}

Конечные точки AWS PrivateLink для ClickPipes, созданные в ClickHouse Cloud, не гарантируется, что будут созданы
в том же регионе AWS, что и сервис ClickHouse Cloud.

В настоящее время только сервис конечной точки VPC поддерживает
кросс-региональное подключение.

Частные конечные точки связаны с определенным сервисом ClickHouse и не подлежат передаче между сервисами.
Несколько ClickPipes для одного сервиса ClickHouse могут повторно использовать одну и ту же конечную точку.
