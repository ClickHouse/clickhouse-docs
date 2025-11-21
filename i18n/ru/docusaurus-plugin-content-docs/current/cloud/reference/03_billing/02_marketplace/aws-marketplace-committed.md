---
slug: /cloud/billing/marketplace/aws-marketplace-committed-contract
title: 'Контракт с обязательствами в AWS Marketplace'
description: 'Оформление подписки на ClickHouse Cloud через AWS Marketplace (контракт с обязательствами)'
keywords: ['aws', 'amazon', 'marketplace', 'billing', 'committed', 'committed contract']
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

Начните работу с ClickHouse Cloud в [AWS Marketplace](https://aws.amazon.com/marketplace), оформив контракт с фиксированными обязательствами.
Такой контракт, также известный как Private Offer, позволяет клиентам взять на себя обязательство потратить определённую сумму на ClickHouse Cloud в течение определённого периода времени.


## Предварительные требования {#prerequisites}

- Индивидуальное предложение (Private Offer) от ClickHouse на основе конкретных условий контракта.
- Для подключения организации ClickHouse к вашему предложению с фиксированными обязательствами по расходам необходимо быть администратором этой организации.

:::note
Одна учетная запись AWS может быть подписана только на одно индивидуальное предложение «ClickHouse Cloud - Committed Contract», которое может быть связано только с одной организацией ClickHouse.
:::

Необходимые разрешения для просмотра и принятия контракта с фиксированными обязательствами в AWS:

- Если вы используете управляемые политики AWS, необходимо иметь следующие разрешения:
  - `AWSMarketplaceRead-only`, `AWSMarketplaceManageSubscriptions`
  - или `AWSMarketplaceFullAccess`
- Если вы не используете управляемые политики AWS, необходимо иметь следующие разрешения:
  - Действия IAM `aws-marketplace:ListPrivateListings` и `aws-marketplace:ViewSubscriptions`


## Шаги для регистрации {#steps-to-sign-up}

<VerticalStepper headerLevel="h3">

### Примите персональное предложение {#private-offer-accept}

Вы должны были получить письмо со ссылкой для просмотра и принятия персонального предложения.

<Image
  img={mp_committed_spend_1}
  size='md'
  alt='Письмо с персональным предложением AWS Marketplace'
/>

### Перейдите по ссылке предложения {#review-offer-link}

Нажмите на ссылку Review Offer в письме.
Вы будете перенаправлены на страницу AWS Marketplace с подробностями персонального предложения.

### Настройте учетную запись {#setup-your-account}

Выполните шаги для оформления подписки на портале AWS и нажмите **"Set up your account"**.
Критически важно на этом этапе перейти в ClickHouse Cloud и либо зарегистрировать новую учетную запись, либо войти в существующую.
Без выполнения этого шага мы не сможем связать ваш контракт AWS Marketplace с ClickHouse Cloud.

<Image
  img={mp_committed_spend_2}
  size='md'
  alt='Письмо с персональным предложением AWS Marketplace'
/>

### Войдите в Cloud {#login-cloud}

После перенаправления в ClickHouse Cloud вы можете войти в существующую учетную запись или зарегистрировать новую.
Этот шаг необходим для привязки вашей организации ClickHouse Cloud к биллингу AWS Marketplace.

<Image
  img={mp_committed_spend_3}
  size='md'
  alt='Письмо с персональным предложением AWS Marketplace'
/>

### Зарегистрируйтесь, если вы новый пользователь {#register}

Если вы новый пользователь ClickHouse Cloud, нажмите "Register" внизу страницы.
Вам будет предложено создать нового пользователя и подтвердить адрес электронной почты.
После подтверждения электронной почты вы можете закрыть страницу входа в ClickHouse Cloud и войти с новым именем пользователя на [https://console.clickhouse.cloud](https://console.clickhouse.cloud).

Обратите внимание, что новым пользователям также необходимо предоставить базовую информацию о компании.
См. скриншоты ниже.

<Image
  img={mp_committed_spend_4}
  size='md'
  alt='Предоставьте информацию о компании'
/>

<Image
  img={mp_committed_spend_5}
  size='md'
  alt='Предоставьте информацию о компании'
/>

Если вы уже являетесь пользователем ClickHouse Cloud, просто войдите, используя свои учетные данные.

### Создайте или выберите организацию для выставления счетов {#create-select-org-to-bill}

После успешного входа вы можете создать новую организацию для выставления счетов по этому контракту маркетплейса или выбрать существующую организацию.

<Image
  img={mp_committed_spend_6}
  size='md'
  alt='Создайте или выберите организацию для выставления счетов по этой подписке'
/>

После завершения этого шага ваша организация будет подключена к контракту AWS committed spend, и все использование будет оплачиваться через вашу учетную запись AWS.
Вы можете убедиться на странице биллинга организации в интерфейсе ClickHouse, что биллинг теперь связан с AWS Marketplace.

<Image img={mp_committed_spend_7} size='md' alt='Подтвердите завершение настройки' />

Если у вас возникнут какие-либо проблемы, обращайтесь в нашу [службу поддержки](https://clickhouse.com/support/program).

</VerticalStepper>
