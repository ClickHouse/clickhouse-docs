---
title: 'Пользовательская настройка AWS'
slug: /cloud/reference/byoc/onboarding/customization-aws
sidebar_label: 'Пользовательская настройка AWS'
keywords: ['BYOC', 'облако', 'ваше собственное облако', 'онбординг', 'AWS', 'VPC']
description: 'Развертывание ClickHouse BYOC в существующем AWS VPC'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_subnet_1 from '@site/static/images/cloud/reference/byoc-subnet-1.png';
import byoc_subnet_2 from '@site/static/images/cloud/reference/byoc-subnet-2.png';
import byoc_s3_endpoint from '@site/static/images/cloud/reference/byoc-s3-endpoint.png';
import byoc_aws_existing_vpc_ui from '@site/static/images/cloud/reference/byoc-aws-existing-vpc-ui.png';

## VPC, управляемая клиентом (BYO-VPC), для AWS \{#customer-managed-vpc-aws\}

Если вы предпочитаете использовать существующую VPC для развертывания ClickHouse BYOC вместо того, чтобы ClickHouse Cloud развернул новую VPC, выполните следующие действия. Такой подход обеспечивает больший контроль над конфигурацией сети и позволяет интегрировать ClickHouse BYOC в существующую сетевую инфраструктуру.

<VerticalStepper headerLevel="h3">
  ### Настройте существующий VPC \{#configure-existing-vpc\}

  1. Пометьте VPC тегом `clickhouse-byoc="true"`.
  2. Выделите как минимум 3 частные подсети в 3 разных зонах доступности для использования ClickHouse Cloud.
  3. Убедитесь, что каждая подсеть имеет минимальный диапазон CIDR `/23` (например, 10.0.0.0/23), чтобы обеспечить достаточное количество IP-адресов для развертывания ClickHouse.
  4. Добавьте к каждой подсети теги `kubernetes.io/role/internal-elb=1` и `clickhouse-byoc="true"`, чтобы обеспечить корректную настройку балансировщика нагрузки.

  <Image img={byoc_subnet_1} size="lg" alt="Подсеть VPC BYOC" />

  <Image img={byoc_subnet_2} size="lg" alt="Теги подсети VPC BYOC" />

  ### Настройте шлюзовую конечную точку S3 \{#configure-s3-endpoint\}

  Если в вашем VPC еще не настроена шлюзовая конечная точка S3, ее нужно создать, чтобы обеспечить безопасное частное взаимодействие между вашим VPC и Amazon S3. Эта конечная точка позволяет сервисам ClickHouse обращаться к S3 без выхода в публичный интернет. Пример настройки см. на снимке экрана ниже.

  <Image img={byoc_s3_endpoint} size="lg" alt="Конечная точка S3 BYOC" />

  ### Обеспечьте сетевую связность \{#ensure-network-connectivity\}

  **Исходящий доступ в интернет**
  Ваш VPC должен как минимум разрешать исходящий доступ в интернет, чтобы компоненты ClickHouse BYOC могли взаимодействовать с контрольной плоскостью Tailscale. Tailscale используется для обеспечения безопасного сетевого взаимодействия по модели нулевого доверия при выполнении операций внутреннего администрирования. Первичная регистрация и настройка в Tailscale требуют подключения к общедоступному интернету, которое может быть обеспечено либо напрямую, либо через шлюз NAT. Это подключение необходимо для сохранения как конфиденциальности, так и безопасности вашего развертывания BYOC.

  **Разрешение DNS**
  Убедитесь, что в вашем VPC корректно работает разрешение DNS и что он не блокирует, не нарушает работу и не переопределяет стандартные DNS-имена. ClickHouse BYOC использует DNS для разрешения имен серверов управления Tailscale и конечных точек сервисов ClickHouse. Если DNS недоступен или настроен неправильно, службы BYOC могут не подключаться или работать некорректно.

  ### Настройте учетную запись AWS \{#configure-aws-account\}

  Начальная настройка BYOC создает привилегированную роль IAM (`ClickHouseManagementRole`), которая позволяет контроллерам BYOC из ClickHouse Cloud управлять вашей инфраструктурой. Это можно выполнить с помощью [шаблона CloudFormation](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/byoc.yaml) или [модуля Terraform](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/tf/byoc.tar.gz).

  При развертывании конфигурации `BYO-VPC` установите параметр `IncludeVPCWritePermissions` в значение `false`, чтобы ClickHouse Cloud не получил разрешения на изменение вашего VPC, управляемого клиентом.

  :::note
  Бакеты хранилища, кластер Kubernetes и вычислительные ресурсы, необходимые для запуска ClickHouse, не входят в эту начальную настройку. Они будут созданы на более позднем этапе. Хотя вы управляете своим VPC, ClickHouse Cloud по-прежнему требуются разрешения IAM для создания и управления кластером Kubernetes, ролями IAM для сервисных аккаунтов, S3 бакетами и другими необходимыми ресурсами в вашей учетной записи AWS.
  :::

  #### Альтернативный модуль Terraform \{#terraform-module-aws\}

  Если вы предпочитаете использовать Terraform вместо CloudFormation, используйте следующий модуль:

  ```hcl
  module "clickhouse_onboarding" {
    source                     = "https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/tf/byoc.tar.gz"
    byoc_env                   = "production"
    include_vpc_write_permissions = false
  }
  ```

  ### Настройте инфраструктуру BYOC \{#set-up-byoc-infrastructure\}

  В консоли ClickHouse Cloud перейдите на [страницу настройки BYOC](https://console.clickhouse.cloud/byocOnboarding) и укажите следующее:

  1. В разделе **Конфигурация VPC** выберите **Use existing VPC**.
  2. Введите свой **VPC ID** (например, `vpc-0bb751a5b888ad123`).
  3. Введите **ID частных подсетей** для 3 подсетей, которые вы настроили ранее.
  4. При необходимости укажите **ID публичных подсетей**, если ваша конфигурация требует общедоступных балансировщиков нагрузки.
  5. Нажмите **Setup Infrastructure**, чтобы начать подготовку инфраструктуры.

  <Image img={byoc_aws_existing_vpc_ui} size="lg" alt="Интерфейс настройки BYOC в ClickHouse Cloud с выбранным пунктом Use existing VPC" />

  :::note
  Настройка нового региона может занять до 40 минут.
  :::
</VerticalStepper>

## IAM-роли, управляемые клиентом \{#customer-managed-iam-roles\}

Для организаций с повышенными требованиями к безопасности или строгими политиками соответствия нормативным требованиям вы можете предоставить собственные IAM-роли вместо того, чтобы ClickHouse Cloud создавал их. Такой подход дает вам полный контроль над правами доступа IAM и позволяет применять политики безопасности вашей организации.

:::info
IAM-роли, управляемые клиентом, доступны в рамках закрытого предварительного доступа. Если вам нужна эта возможность, обратитесь в службу поддержки ClickHouse, чтобы обсудить ваши конкретные требования и сроки.

Когда эта функция станет доступна, она позволит вам:

* Предоставлять предварительно настроенные IAM-роли, которые будет использовать ClickHouse Cloud
* Удалять права на запись из прав доступа IAM, связанных с IAM, для `ClickHouseManagementRole`, используемой для межаккаунтного доступа
* Сохранять полный контроль над разрешениями ролей и отношениями доверия
  :::

Сведения об IAM-ролях, которые ClickHouse Cloud создает по умолчанию, см. в разделе [BYOC Privilege Reference](/cloud/reference/byoc/reference/privilege).