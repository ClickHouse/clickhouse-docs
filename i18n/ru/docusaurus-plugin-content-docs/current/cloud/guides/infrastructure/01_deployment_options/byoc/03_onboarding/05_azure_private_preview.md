---
title: 'Закрытая предварительная версия Azure'
slug: /cloud/reference/byoc/onboarding/azure-private-preview
sidebar_label: 'Azure (Private Preview)'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'azure']
description: 'Подключение ClickHouse BYOC в Azure с помощью модуля Terraform и межарендной аутентификации'
doc_type: 'reference'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

<PrivatePreviewBadge />

:::note
BYOC в Azure находится в **закрытой предварительной версии**. Чтобы принять участие, [свяжитесь с командой ClickHouse](https://clickhouse.com/cloud/bring-your-own-cloud).
:::


## Обзор \{#overview\}

BYOC в Azure позволяет запускать ClickHouse в вашей собственной подписке Azure. Процесс онбординга использует модуль Terraform, который настраивает кросс‑тенантную аутентификацию, необходимую провижионеру ClickHouse Cloud для создания и управления ресурсами Azure в вашем тенанте и подписке.

Другие аспекты развертывания — такие как [архитектура](/cloud/reference/byoc/architecture), [сетевые меры безопасности](/cloud/reference/byoc/reference/network_security), [функциональные возможности](/cloud/reference/byoc/overview#features) и [подключение](/cloud/reference/byoc/connect) — в целом аналогичны предложениям BYOC в AWS и GCP; за дополнительными сведениями обратитесь к этим страницам.

## Предварительные требования \{#prerequisites\}

- Подписка Azure (**subscription**) и клиент (**tenant**), в которых вы хотите разместить развертывание BYOC
- **ID подписки** и **ID клиента (tenant)**, которые необходимо предоставить команде ClickHouse

## Онбординг \{#onboarding\}

<VerticalStepper headerLevel="h3">

### 1. Примените модуль Terraform \{#apply-terraform-module\}

Чтобы начать онбординг BYOC Azure, примените [Terraform-модуль для Azure](https://github.com/ClickHouse/terraform-byoc-onboarding/tree/main/modules/azure), предоставленный ClickHouse, в вашем **целевом клиенте (tenant) и подписке**.

Используйте документацию модуля для списка обязательных переменных и шагов применения. После применения модуль создаст необходимые identity и разрешения в вашей среде Azure.

### 2. Передайте идентификаторы команде ClickHouse \{#provide-ids\}

Передайте команде ClickHouse следующую информацию:

- **Target subscription ID** — идентификатор целевой подписки Azure, в которой будут созданы ресурсы BYOC
- **Target tenant ID** — идентификатор клиента (tenant) Azure AD (Entra), которому принадлежит эта подписка
- **Region** — регион(ы) Azure, в которых вы хотите развернуть сервисы ClickHouse
- **VNet CIDR range** — диапазон IP-адресов, который вы хотите использовать для BYOC VNet

Команда ClickHouse использует эту информацию, чтобы создать инфраструктуру BYOC и завершить онбординг.

</VerticalStepper>

### Как работает межтенантная аутентификация \{#cross-tenant-auth\}

Следуя [рекомендациям Azure по межтенантной аутентификации](https://learn.microsoft.com/en-us/entra/identity-platform/single-and-multi-tenant-apps), модуль Terraform:

1. **Создаёт многотенантное приложение** как **Enterprise Application** (service principal) в целевом тенанте
2. **Назначает необходимые разрешения** этому приложению с областью действия, ограниченной вашей целевой подпиской

Это позволяет ClickHouse Cloud Control Plane создавать и управлять ресурсами Azure (такими как группы ресурсов, AKS, хранилище и сеть) в пределах вашей подписки без необходимости хранения ваших учетных данных Azure в ClickHouse.

Для получения дополнительной информации о многотенантных приложениях и межтенантных сценариях в Azure см.:

- [Одно- и многотенантные приложения в Microsoft Entra ID](https://learn.microsoft.com/en-us/entra/identity-platform/single-and-multi-tenant-apps)
- [Авторизация межтенантного доступа (пример Azure SignalR)](https://learn.microsoft.com/en-us/azure/azure-signalr/signalr-howto-authorize-cross-tenant)