---
slug: /cloud/billing/marketplace/aws-marketplace-payg
title: 'AWS Marketplace PAYG'
description: 'Оформите подписку на ClickHouse Cloud через AWS Marketplace (PAYG).'
keywords: ['aws', 'marketplace', 'биллинг', 'PAYG']
doc_type: 'guide'
---

import aws_marketplace_payg_1 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-1.png';
import aws_marketplace_payg_2 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-2.png';
import aws_marketplace_payg_3 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-3.png';
import aws_marketplace_payg_4 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-4.png';
import aws_marketplace_payg_5 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-5.png';
import aws_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-6.png';
import aws_marketplace_payg_7 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-7.png';
import aws_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-8.png';
import aws_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-9.png';
import Image from '@theme/IdealImage';

Начните работу с ClickHouse Cloud на [AWS Marketplace](https://aws.amazon.com/marketplace) с помощью публичного предложения PAYG (Pay-as-you-go, оплата по мере использования).


## Предварительные требования {#prerequisites}

- Учетная запись AWS с правами на совершение покупок, предоставленными администратором биллинга.
- Для совершения покупки необходимо войти в AWS Marketplace под этой учетной записью.
- Для подключения организации ClickHouse к подписке необходимо обладать правами администратора этой организации.

:::note
Одна учетная запись AWS может иметь только одну подписку «ClickHouse Cloud - Pay As You Go», которая может быть привязана только к одной организации ClickHouse.
:::


## Шаги для регистрации {#steps-to-sign-up}

<VerticalStepper headerLevel="h3">

### Поиск ClickHouse Cloud - Pay As You Go {#search-payg}

Перейдите на [AWS Marketplace](https://aws.amazon.com/marketplace) и найдите "ClickHouse Cloud - Pay As You Go".

<Image
  img={aws_marketplace_payg_1}
  alt='Поиск ClickHouse на AWS Marketplace'
  border
/>

### Просмотр вариантов покупки {#purchase-options}

Нажмите на [листинг](https://aws.amazon.com/marketplace/pp/prodview-p4gwofrqpkltu), а затем на **View purchase options**.

<Image
  img={aws_marketplace_payg_2}
  alt='Просмотр вариантов покупки на AWS Marketplace'
  border
/>

### Оформление подписки {#subscribe}

На следующем экране нажмите subscribe.

:::note
**Номер заказа на покупку (PO)** является необязательным и может быть пропущен.
:::

<Image img={aws_marketplace_payg_3} alt='Оформление подписки на AWS Marketplace' border />

### Настройка учетной записи {#set-up-your-account}

Обратите внимание, что на данном этапе настройка не завершена, и выставление счетов для вашей организации ClickHouse Cloud через маркетплейс еще не активировано. Теперь необходимо нажать на Set up your account в вашей подписке на маркетплейсе, чтобы перейти в ClickHouse Cloud и завершить настройку.

<Image img={aws_marketplace_payg_4} alt='Настройка учетной записи' border />

После перенаправления в ClickHouse Cloud вы можете либо войти с существующей учетной записью, либо зарегистрировать новую. Этот шаг очень важен для связывания вашей организации ClickHouse Cloud с выставлением счетов через AWS Marketplace.

:::note[Новые пользователи ClickHouse Cloud]
Если вы новый пользователь ClickHouse Cloud, следуйте приведенным ниже шагам.
:::

<details>
<summary><strong>Шаги для новых пользователей</strong></summary>

Если вы новый пользователь ClickHouse Cloud, нажмите Register внизу страницы. Вам будет предложено создать нового пользователя и подтвердить адрес электронной почты. После подтверждения электронной почты вы можете покинуть страницу входа в ClickHouse Cloud и войти, используя новое имя пользователя, на https://console.clickhouse.cloud.

<Image img={aws_marketplace_payg_5} size='md' alt='Регистрация в ClickHouse Cloud' />

:::note[Новые пользователи]
Вам также потребуется предоставить базовую информацию о вашей компании. См. скриншоты ниже.
:::

<Image img={aws_marketplace_payg_6} size='md' alt='Прежде чем начать' />

<Image img={aws_marketplace_payg_7} size='md' alt='Прежде чем начать (продолжение)' />

</details>

Если вы уже являетесь пользователем ClickHouse Cloud, просто войдите, используя свои учетные данные.

### Добавление подписки Marketplace к организации {#add-marketplace-subscription}

После успешного входа вы можете решить, создать ли новую организацию для выставления счетов по этой подписке на маркетплейсе или выбрать существующую организацию для выставления счетов по этой подписке.

<Image
  img={aws_marketplace_payg_8}
  size='md'
  alt='Добавление подписки маркетплейса'
  border
/>

После завершения этого шага ваша организация будет подключена к этой подписке AWS, и все использование будет оплачиваться через вашу учетную запись AWS.

Вы можете подтвердить на странице выставления счетов организации в интерфейсе ClickHouse, что выставление счетов действительно теперь связано с AWS Marketplace.

<Image
  img={aws_marketplace_payg_9}
  size='lg'
  alt='Подтверждение страницы выставления счетов'
  border
/>

</VerticalStepper>


## Поддержка {#support}

При возникновении каких-либо проблем обращайтесь в [службу поддержки](https://clickhouse.com/support/program).
