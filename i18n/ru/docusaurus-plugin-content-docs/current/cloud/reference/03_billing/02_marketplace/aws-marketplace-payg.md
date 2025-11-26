---
slug: /cloud/billing/marketplace/aws-marketplace-payg
title: 'AWS Marketplace PAYG'
description: 'Оформите подписку на ClickHouse Cloud через AWS Marketplace (PAYG).'
keywords: ['aws', 'marketplace', 'billing', 'PAYG']
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

Начните работу с ClickHouse Cloud в [AWS Marketplace](https://aws.amazon.com/marketplace) через публичное предложение по модели PAYG (Pay-as-you-go, оплата по мере использования).


## Предварительные требования {#prerequisites}

- Учетная запись AWS с правами на совершение покупок, предоставленными вашим администратором по биллингу.
- Для совершения покупки вы должны войти в AWS Marketplace под этой учетной записью.
- Чтобы подключить организацию ClickHouse к вашей подписке, вы должны быть администратором этой организации.

:::note
Одна учетная запись AWS может оформить только одну подписку «ClickHouse Cloud - Pay As You Go», которую можно связать только с одной организацией ClickHouse.
:::



## Этапы регистрации {#steps-to-sign-up}

<VerticalStepper headerLevel="h3">

### Найдите ClickHouse Cloud - Pay As You Go {#search-payg}

Перейдите в [AWS Marketplace](https://aws.amazon.com/marketplace) и найдите «ClickHouse Cloud - Pay As You Go».

<Image img={aws_marketplace_payg_1} alt="Поиск ClickHouse в AWS Marketplace" border/>

### Просмотрите варианты покупки {#purchase-options}

Нажмите на [страницу продукта](https://aws.amazon.com/marketplace/pp/prodview-p4gwofrqpkltu), а затем на **View purchase options**.

<Image img={aws_marketplace_payg_2} alt="Варианты покупки в AWS Marketplace" border/>

### Оформите подписку {#subscribe}

На следующем экране нажмите **Subscribe**.

:::note
**Номер заказа на покупку (PO)** указывать необязательно, его можно не заполнять.
:::

<Image img={aws_marketplace_payg_3} alt="Оформление подписки в AWS Marketplace" border/>

### Настройте свою учетную запись {#set-up-your-account}

Обратите внимание, что на данном этапе настройка еще не завершена, и вашей организации ClickHouse Cloud пока не выставляются счета через Marketplace. Теперь вам нужно нажать **Set up your account** в вашей подписке Marketplace, чтобы перейти в ClickHouse Cloud и завершить настройку.

<Image img={aws_marketplace_payg_4} alt="Настройка учетной записи" border/>

После перенаправления в ClickHouse Cloud вы можете войти под существующей учетной записью или зарегистрировать новую. Этот шаг очень важен, поскольку он позволяет привязать вашу организацию ClickHouse Cloud к выставлению счетов через AWS Marketplace.

:::note[Новые пользователи ClickHouse Cloud]
Если вы новый пользователь ClickHouse Cloud, выполните действия, приведенные ниже.
:::

<details>
<summary><strong>Шаги для новых пользователей</strong></summary>

Если вы новый пользователь ClickHouse Cloud, нажмите **Register** в нижней части страницы. Вам будет предложено создать нового пользователя и подтвердить адрес электронной почты. После подтверждения электронной почты вы можете закрыть страницу входа в ClickHouse Cloud и войти, используя новое имя пользователя, на https://console.clickhouse.cloud.

<Image img={aws_marketplace_payg_5} size="md" alt="Регистрация в ClickHouse Cloud"/>

:::note[Новые пользователи]
Вам также потребуется предоставить некоторую основную информацию о вашей компании. См. скриншоты ниже.
:::

<Image img={aws_marketplace_payg_6} size="md" alt="Прежде чем начать"/>

<Image img={aws_marketplace_payg_7} size="md" alt="Прежде чем начать, продолжение"/>

</details>

Если вы уже являетесь пользователем ClickHouse Cloud, просто войдите, используя свои учетные данные.

### Добавьте подписку Marketplace к организации {#add-marketplace-subscription}

После успешного входа вы можете выбрать: создать новую организацию для выставления счетов по этой подписке Marketplace или использовать существующую организацию для выставления счетов по этой подписке. 

<Image img={aws_marketplace_payg_8} size="md" alt="Добавление подписки Marketplace" border/>

После завершения этого шага ваша организация будет подключена к этой подписке AWS, и все потребление будет выставляться на оплату через ваш аккаунт AWS.

На странице выставления счетов организации в интерфейсе ClickHouse вы можете убедиться, что биллинг теперь действительно связан с AWS Marketplace.

<Image img={aws_marketplace_payg_9} size="lg" alt="Подтверждение на странице выставления счетов" border/>

</VerticalStepper>



## Поддержка {#support}

Если у вас возникнут какие-либо проблемы, обращайтесь в [нашу службу поддержки](https://clickhouse.com/support/program).
