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
Такой контракт, также известный как Private Offer, позволяет клиентам заранее взять на себя обязательство потратить определённую сумму на ClickHouse Cloud за определённый период времени.


## Предварительные требования {#prerequisites}

- Индивидуальное предложение (Private Offer) от ClickHouse на основе конкретных условий контракта.
- Чтобы подключить организацию ClickHouse к вашему предложению с фиксированными расходами, вы должны быть администратором этой организации.

:::note
Один аккаунт AWS может быть подписан только на одно индивидуальное предложение «ClickHouse Cloud - Committed Contract», которое может быть связано только с одной организацией ClickHouse.
:::

Необходимые разрешения для просмотра и принятия контракта с фиксированными расходами в AWS:

- Если вы используете управляемые политики AWS, необходимы следующие разрешения:
  - `AWSMarketplaceRead-only`, `AWSMarketplaceManageSubscriptions`
  - или `AWSMarketplaceFullAccess`
- Если вы не используете управляемые политики AWS, необходимы следующие разрешения:
  - IAM-действия `aws-marketplace:ListPrivateListings` и `aws-marketplace:ViewSubscriptions`


## Шаги по регистрации {#steps-to-sign-up}

<VerticalStepper headerLevel="h3">

### Принять ваше персональное предложение {#private-offer-accept}

Вы должны были получить письмо со ссылкой для ознакомления и принятия вашего персонального предложения.

<Image
  img={mp_committed_spend_1}
  size='md'
  alt='Письмо с персональным предложением AWS Marketplace'
/>

### Перейти по ссылке для просмотра предложения {#review-offer-link}

Нажмите на ссылку «Просмотреть предложение» в письме.  
Это должно перенести вас на вашу страницу AWS Marketplace с деталями персонального предложения.

### Настройка учетной записи {#setup-your-account}

Завершите шаги подписки на портале AWS и нажмите **«Настроить учетную запись»**.  
На этом этапе крайне важно перейти в ClickHouse Cloud и либо зарегистрировать новый аккаунт, либо войти с существующим.  
Без выполнения этого шага мы не сможем связать ваш контракт AWS Marketplace с ClickHouse Cloud.

<Image
  img={mp_committed_spend_2}
  size='md'
  alt='Письмо с персональным предложением AWS Marketplace'
/>

### Вход в ClickHouse Cloud {#login-cloud}

После перехода в ClickHouse Cloud вы можете либо войти с существующим аккаунтом, либо зарегистрироваться с новым.  
Этот шаг необходим, чтобы мы могли привязать вашу организацию ClickHouse Cloud к биллингу AWS Marketplace.

<Image
  img={mp_committed_spend_3}
  size='md'
  alt='Письмо с персональным предложением AWS Marketplace'
/>

### Регистрация для новых пользователей {#register}

Если вы новый пользователь ClickHouse Cloud, нажмите «Зарегистрироваться» внизу страницы.  
Вас попросят создать нового пользователя и подтвердить электронную почту.  
После подтверждения электронной почты вы можете покинуть страницу входа в ClickHouse Cloud и войти, используя новое имя пользователя, на [https://console.clickhouse.cloud](https://console.clickhouse.cloud).

Обратите внимание, что если вы новый пользователь, вам также потребуется предоставить базовую информацию о вашем бизнесе.  
См. скриншоты ниже.

<Image
  img={mp_committed_spend_4}
  size='md'
  alt='Ввод информации о бизнесе'
/>

<Image
  img={mp_committed_spend_5}
  size='md'
  alt='Ввод информации о бизнесе'
/>

Если вы существующий пользователь ClickHouse Cloud, просто войдите, используя свои учетные данные.

### Создать или выбрать организацию для биллинга {#create-select-org-to-bill}

После успешного входа вы можете решить, создавать ли новую организацию для биллинга по этому контракту маркетплейса или выбрать существующую организацию для биллинга по этому контракту.

<Image
  img={mp_committed_spend_6}
  size='md'
  alt='Создать или выбрать организацию для биллинга по этой подписке'
/>

После выполнения этого шага ваша организация будет связана с вашим контрактом AWS на фиксированные расходы, и все использование будет оплачиваться через ваш аккаунт AWS.  
Вы можете проверить на странице биллинга организации в интерфейсе ClickHouse, что биллинг теперь действительно связан с маркетплейсом AWS.

<Image img={mp_committed_spend_7} size='md' alt='Подтвердить завершение настройки' />

Если возникнут проблемы, не стесняйтесь обращаться в нашу [службу поддержки](https://clickhouse.com/support/program).

</VerticalStepper>
