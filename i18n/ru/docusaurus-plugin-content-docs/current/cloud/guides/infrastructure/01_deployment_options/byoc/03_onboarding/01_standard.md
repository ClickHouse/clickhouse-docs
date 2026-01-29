---
title: 'Стандартный онбординг'
slug: /cloud/reference/byoc/onboarding/standard
sidebar_label: 'Стандартный процесс'
keywords: ['BYOC', 'облако', 'использование собственного облака', 'онбординг']
description: 'Разверните ClickHouse в собственной облачной инфраструктуре'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_onboarding_1 from '@site/static/images/cloud/reference/byoc-onboarding-1.png'
import byoc_onboarding_2 from '@site/static/images/cloud/reference/byoc-onboarding-2.png'
import byoc_onboarding_3 from '@site/static/images/cloud/reference/byoc-onboarding-3.png'
import byoc_new_service_1 from '@site/static/images/cloud/reference/byoc-new-service-1.png'


## Что такое Standard Onboarding? \{#what-is-standard-onboarding\}

**Standard onboarding** — это стандартный, пошаговый рабочий процесс для развертывания ClickHouse в вашей собственной облачной учетной записи с использованием BYOC. В этом подходе ClickHouse Cloud создает и настраивает все основные облачные ресурсы, необходимые для вашего развертывания — такие как VPC, подсети, группы безопасности, кластер Kubernetes (EKS/GKE) и связанные роли IAM/учетные записи сервисов — внутри вашего AWS-аккаунта или GCP-проекта. Это обеспечивает единообразную и безопасную конфигурацию и минимизирует количество ручных действий, требуемых от вашей команды.

При стандартном онбординге вам достаточно предоставить выделенный AWS-аккаунт или GCP-проект и запустить начальный стек (через CloudFormation или Terraform), чтобы создать минимально необходимые разрешения IAM и доверительные отношения, требуемые для того, чтобы ClickHouse Cloud мог оркестрировать дальнейшую настройку. Все последующие шаги — включая подготовку инфраструктуры и запуск сервисов — управляются через веб-консоль ClickHouse Cloud.

Клиентам настоятельно рекомендуется подготовить **выделенный** AWS-аккаунт или GCP-проект для размещения развертывания ClickHouse BYOC, чтобы обеспечить лучшую изоляцию с точки зрения прав доступа и ресурсов. ClickHouse развернет выделенный набор облачных ресурсов (VPC, кластер Kubernetes, роли IAM, бакеты S3 и т. д.) в вашей учетной записи.

Если вам требуется более гибкая, настраиваемая конфигурация (например, развертывание в существующую VPC), обратитесь к документации [Customized Onboarding](/cloud/reference/byoc/onboarding/customization).

## Запрос доступа \{#request-access\}

Чтобы начать процесс онбординга, [свяжитесь с нами](https://clickhouse.com/cloud/bring-your-own-cloud). Наша команда поможет вам разобраться с требованиями BYOC, подобрать наиболее подходящие варианты развертывания и внесёт вашу учётную запись в allowlist.

## Начало работы \{#onboarding-process\}

### Подготовьте аккаунт AWS/проект GCP \{#prepare-an-aws-account\}

Подготовьте новый аккаунт AWS или проект GCP в рамках вашей организации. Перейдите в нашу веб‑консоль: https://console.clickhouse.cloud/byocOnboarding, чтобы продолжить настройку. 

<VerticalStepper headerLevel="h3">

### Выберите облачного провайдера \{#choose-cloud-provider\}

<Image img={byoc_onboarding_1} size="lg" alt="BYOC выбор CSP" background='black'/>

### Настройка аккаунта/проекта \{#account-setup\}

Начальную настройку BYOC можно выполнить либо с помощью [шаблона CloudFormation (AWS)](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/byoc.yaml), либо с помощью [модуля Terraform (GCP)](https://github.com/ClickHouse/terraform-byoc-onboarding/tree/main/modules/gcp). В ходе этого шага создаётся роль IAM с высокими привилегиями, которая позволяет контроллерам BYOC из ClickHouse Cloud управлять вашей инфраструктурой. 

<Image img={byoc_onboarding_2} size="lg" alt="BYOC инициализация аккаунта" background='black'/>

:::note
Хранилища объектов (S3‑бакеты), VPC, кластер Kubernetes и вычислительные ресурсы, необходимые для работы ClickHouse, не включены в эту начальную настройку. Они будут подготовлены на следующем шаге.
:::
#### Альтернативный модуль Terraform для AWS \{#terraform-module-aws\}

Если вы предпочитаете использовать Terraform вместо CloudFormation для развертываний в AWS, мы также предоставляем [модуль Terraform для AWS](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/tf/byoc.tar.gz).

Использование:
```hcl
module "clickhouse_onboarding" {
  source   = "https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/tf/byoc.tar.gz"
  byoc_env = "production"
}
```

### Настройте инфраструктуру BYOC \{#setup-byoc-infrastructure\}

Вам будет предложено настроить инфраструктуру, включая S3‑бакеты, VPC и кластер Kubernetes, в консоли ClickHouse Cloud. Некоторые параметры необходимо определить на этом этапе, так как их нельзя будет изменить позже. В частности:

- **Регион**: Все **публичные регионы**, перечисленные в нашей документации по [поддерживаемым регионам](https://clickhouse.com/docs/cloud/reference/supported-regions), доступны для развертываний BYOC. Частные регионы в настоящее время не поддерживаются.

- **Диапазон VPC CIDR**: По умолчанию мы используем `10.0.0.0/16` для диапазона VPC CIDR BYOC. Если вы планируете использовать пиринг VPC с другим аккаунтом, убедитесь, что диапазоны CIDR не пересекаются. Выделите корректный диапазон CIDR для BYOC, минимального размера `/22`, чтобы разместить необходимые рабочие нагрузки.

- **Зоны доступности (Availability Zones)**: Если вы планируете использовать пиринг VPC, согласование зон доступности между исходным и BYOC‑аккаунтами может помочь снизить затраты на трафик между зонами (cross‑AZ). Например, в AWS суффиксы зон доступности (`a`, `b`, `c`) могут соответствовать разным физическим идентификаторам зон в разных аккаунтах. Подробности см. в [руководстве AWS](https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/use-consistent-availability-zones-in-vpcs-across-different-aws-accounts.html).

<Image img={byoc_onboarding_3} size="lg" alt="BYOC настройка инфраструктуры" background='black'/>

</VerticalStepper>

### Создайте свой первый сервис BYOC ClickHouse \{#create-clickhouse-service\}

После того как ваша инфраструктура BYOC была развернута, вы можете запустить первый сервис ClickHouse. Откройте консоль ClickHouse Cloud, выберите окружение BYOC и следуйте подсказкам для создания нового сервиса.

<Image img={byoc_new_service_1} size="md" alt="Создание нового сервиса BYOC"/>

Во время создания сервиса вы настроите следующие параметры:

- **Service name**: Введите понятное, информативное имя для вашего сервиса ClickHouse.
- **BYOC infrastructure**: Выберите окружение BYOC, включая облачный аккаунт и регион, в котором будет работать ваш сервис.
- **Resource configuration**: Укажите объём CPU и памяти, выделяемых репликам ClickHouse.
- **Replica count**: Задайте количество реплик для повышения отказоустойчивости.