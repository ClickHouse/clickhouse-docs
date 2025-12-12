---
slug: /cloud/billing/marketplace/aws-marketplace-committed-contract
title: 'Контракт с обязательствами в AWS Marketplace'
description: 'Оформление подписки на ClickHouse Cloud через AWS Marketplace (контракт с обязательствами)'
keywords: ['aws', 'amazon', 'marketplace', 'биллинг', 'обязательства', 'контракт с обязательствами']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import mp_committed_spend_1 from '@site/static/images/cloud/reference/mp_committed_spend_1.png'
import mp_committed_spend_2 from '@site/static/images/cloud/reference/mp_committed_spend_2.png'
import mp_committed_spend_3 from '@site/static/images/cloud/reference/mp_committed_spend_3.png'
import mp_committed_spend_4 from '@site/static/images/cloud/reference/mp_committed_spend_4.png'
import mp_committed_spend_5 from '@site/static/images/cloud/reference/mp_committed_spend_5.png'
import mp_committed_spend_6 from '@site/static/images/cloud/reference/mp_committed_spend_6.png'
import mp_committed_spend_7 from '@site/static/images/cloud/reference/mp_committed_spend_7.png'

Начните работу с ClickHouse Cloud в [AWS Marketplace](https://aws.amazon.com/marketplace) по контракту с фиксированным объёмом потребления.
Такой контракт, также известный как Private Offer, позволяет клиентам обязаться израсходовать определённую сумму на ClickHouse Cloud за установленный период времени.


## Предварительные требования {#prerequisites}

- Частное (Private Offer) предложение от ClickHouse на основе конкретных условий контракта.
- Чтобы подключить организацию ClickHouse к предложению с обязательством по расходам (committed spend offer), вы должны быть администратором этой организации.

:::note
Одна учетная запись AWS может подписаться только на одно частное предложение «ClickHouse Cloud - Committed Contract», которое может быть связано только с одной организацией ClickHouse.
:::

Необходимые права доступа для просмотра и принятия вашего контракта с обязательством по расходам в AWS:

- Если вы используете управляемые политики AWS, вам необходимы следующие разрешения:
  - `AWSMarketplaceRead-only`, `AWSMarketplaceManageSubscriptions`
  - или `AWSMarketplaceFullAccess`
- Если вы не используете управляемые политики AWS, вам необходимы следующие разрешения:
  - действие IAM `aws-marketplace:ListPrivateListings` и `aws-marketplace:ViewSubscriptions`



## Шаги для регистрации {#steps-to-sign-up}

<VerticalStepper headerLevel="h3">

### Примите персональное предложение {#private-offer-accept}

Вы должны были получить электронное письмо со ссылкой для просмотра и принятия вашего персонального предложения.

<Image img={mp_committed_spend_1} size="md" alt="Письмо с персональным предложением AWS Marketplace"/>

### Перейдите по ссылке предложения {#review-offer-link}

Нажмите на ссылку **Review Offer** в письме.
Вы будете перенаправлены на страницу AWS Marketplace с деталями персонального предложения.

### Настройте учетную запись {#setup-your-account}

Завершите шаги по оформлению подписки на портале AWS и нажмите **"Set up your account"**.
На этом этапе крайне важно перейти в ClickHouse Cloud и либо зарегистрировать новую учетную запись, либо войти в существующую.
Без выполнения этого шага мы не сможем привязать ваш контракт AWS Marketplace к ClickHouse Cloud.

<Image img={mp_committed_spend_2} size="md" alt="Письмо с персональным предложением AWS Marketplace"/>

### Войдите в Cloud {#login-cloud}

После перенаправления в ClickHouse Cloud вы можете войти в существующую учетную запись или зарегистрировать новую.
Этот шаг необходим, чтобы мы могли привязать вашу организацию ClickHouse Cloud к выставлению счетов в AWS Marketplace.

<Image img={mp_committed_spend_3} size="md" alt="Письмо с персональным предложением AWS Marketplace"/>

### Зарегистрируйтесь, если вы новый пользователь {#register}

Если вы новый пользователь ClickHouse Cloud, нажмите "Register" в нижней части страницы.
Вам будет предложено создать нового пользователя и подтвердить адрес электронной почты.
После подтверждения почты вы можете закрыть страницу входа ClickHouse Cloud и войти, используя новое имя пользователя, по адресу [https://console.clickhouse.cloud](https://console.clickhouse.cloud).

Обратите внимание, что если вы новый пользователь, вам также потребуется указать некоторую базовую информацию о вашей компании.
См. скриншоты ниже.

<Image img={mp_committed_spend_4} size="md" alt="Предоставление информации о компании"/>

<Image img={mp_committed_spend_5} size="md" alt="Предоставление информации о компании"/>

Если вы уже являетесь пользователем ClickHouse Cloud, просто войдите, используя свои учетные данные.

### Создайте или выберите организацию для выставления счетов {#create-select-org-to-bill}

После успешного входа вы можете решить, создать новую организацию для выставления счетов по этому контракту маркетплейса или выбрать существующую организацию для выставления счетов по этому контракту.

<Image img={mp_committed_spend_6} size="md" alt="Создание или выбор организации для выставления счетов по этой подписке"/>

После завершения этого шага ваша организация будет подключена к вашему контракту AWS с обязательствами по расходам, и все потребление будет тарифицироваться через ваш аккаунт AWS.
Вы можете убедиться на странице выставления счетов организации в интерфейсе ClickHouse, что биллинг теперь действительно привязан к AWS Marketplace.

<Image img={mp_committed_spend_7} size="md" alt="Подтверждение завершения настройки"/>

Если вы столкнетесь с какими-либо проблемами, пожалуйста, не стесняйтесь связаться с нашей [командой поддержки](https://clickhouse.com/support/program).

</VerticalStepper>
