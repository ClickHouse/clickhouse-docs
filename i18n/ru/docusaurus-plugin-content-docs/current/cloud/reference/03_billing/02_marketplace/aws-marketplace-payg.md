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

Начните работу с ClickHouse Cloud на [AWS Marketplace](https://aws.amazon.com/marketplace), воспользовавшись публичным предложением по модели PAYG (Pay-as-you-go).


## Предварительные требования \{#prerequisites\}

- Учетная запись AWS с правами на совершение покупок, предоставленными администратором биллинга.
- Для совершения покупки вы должны быть авторизованы в AWS Marketplace под этой учетной записью.
- Чтобы подключить организацию ClickHouse к вашей подписке, вы должны быть администратором этой организации.

:::note
Одна учетная запись AWS может оформить только одну подписку «ClickHouse Cloud - Pay As You Go», которая может быть связана только с одной организацией ClickHouse.
:::

## Этапы регистрации \{#steps-to-sign-up\}

<VerticalStepper headerLevel="h3">

### Найдите ClickHouse Cloud - Pay As You Go \{#search-payg\}

Перейдите в [AWS Marketplace](https://aws.amazon.com/marketplace) и найдите «ClickHouse Cloud - Pay As You Go».

<Image img={aws_marketplace_payg_1} alt="Поиск ClickHouse в AWS Marketplace" border/>

### Просмотрите варианты покупки \{#purchase-options\}

Нажмите на [листинг](https://aws.amazon.com/marketplace/pp/prodview-p4gwofrqpkltu), а затем на **View purchase options**.

<Image img={aws_marketplace_payg_2} alt="AWS Marketplace — просмотр вариантов покупки" border/>

### Оформите подписку \{#subscribe\}

На следующем экране нажмите **Subscribe**.

:::note
**Номер заказа на покупку (Purchase order, PO)** необязателен, им можно пренебречь.  
**В этом листинге доступны два предложения.** Если вы выберете вариант «ClickHouse Cloud - Pay As You Go Free Trial», вы подпишетесь на управляемую AWS 30‑дневную бесплатную пробную версию. Однако по истечении 30 дней подписка на листинг завершится, и вам потребуется повторно оформить подписку уже на другое предложение «ClickHouse Cloud - Pay As You Go» в этом листинге, чтобы продолжить использовать ClickHouse Pay As You Go.
:::

<Image img={aws_marketplace_payg_3} alt="Оформление подписки в AWS Marketplace" border/>

### Настройте учетную запись \{#set-up-your-account\}

Обратите внимание, что на этом этапе настройка еще не завершена, и ваша организация ClickHouse Cloud пока не тарифицируется через AWS Marketplace. Теперь вам нужно нажать **Set up your account** в подписке AWS Marketplace, чтобы перейти в ClickHouse Cloud и завершить настройку.

<Image img={aws_marketplace_payg_4} alt="Настройка учетной записи" border/>

После перехода в ClickHouse Cloud вы можете либо войти с существующей учетной записью, либо зарегистрировать новую. Этот шаг очень важен, поскольку он позволяет привязать вашу организацию ClickHouse Cloud к биллингу AWS Marketplace.

:::note[Новые пользователи ClickHouse Cloud]
Если вы новый пользователь ClickHouse Cloud, выполните шаги ниже.
:::

<details>
<summary><strong>Шаги для новых пользователей</strong></summary>

Если вы новый пользователь ClickHouse Cloud, нажмите **Register** внизу страницы. Вам будет предложено создать нового пользователя и подтвердить адрес электронной почты. После подтверждения email вы можете закрыть страницу входа ClickHouse Cloud и войти, используя новое имя пользователя, на https://console.clickhouse.cloud.

<Image img={aws_marketplace_payg_5} size="md" alt="Регистрация в ClickHouse Cloud"/>

:::note[Новые пользователи]
Вам также потребуется предоставить некоторую основную информацию о вашем бизнесе. См. скриншоты ниже.
:::

<Image img={aws_marketplace_payg_6} size="md" alt="Перед началом работы"/>

<Image img={aws_marketplace_payg_7} size="md" alt="Перед началом работы — продолжение"/>

</details>

Если вы уже являетесь пользователем ClickHouse Cloud, просто войдите, используя свои учетные данные.

### Добавьте подписку Marketplace к организации \{#add-marketplace-subscription\}

После успешного входа вы можете выбрать, создать ли новую организацию для выставления счетов по этой подписке AWS Marketplace или использовать существующую организацию для выставления счетов по данной подписке. 

<Image img={aws_marketplace_payg_8} size="md" alt="Добавление подписки Marketplace" border/>

После завершения этого шага ваша организация будет подключена к этой подписке AWS, и все использование будет тарифицироваться через ваш AWS‑аккаунт.

Вы можете убедиться на странице биллинга организации в интерфейсе ClickHouse, что биллинг теперь действительно связан с AWS Marketplace.

<Image img={aws_marketplace_payg_9} size="lg" alt="Подтверждение на странице биллинга" border/>

</VerticalStepper>

## Поддержка \{#support\}

Если у вас возникнут проблемы, обращайтесь в [нашу службу поддержки](https://clickhouse.com/support/program).