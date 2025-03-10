---
slug: /cloud/billing/marketplace/gcp-marketplace-payg
title: GCP Marketplace PAYG
description: Подпишитесь на ClickHouse Cloud через GCP Marketplace (PAYG).
keywords: [gcp, marketplace, billing, PAYG]
---

import gcp_marketplace_payg_1 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-1.png';
import gcp_marketplace_payg_2 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-2.png';
import gcp_marketplace_payg_3 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-3.png';
import gcp_marketplace_payg_4 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-4.png';
import aws_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-6.png';
import aws_marketplace_payg_7 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-7.png';
import aws_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-8.png';
import aws_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-9.png';
import gcp_marketplace_payg_5 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-5.png';
import aws_marketplace_payg_11 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-11.png';
import gcp_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-6.png';

Начните работу с ClickHouse Cloud на [GCP Marketplace](https://console.cloud.google.com/marketplace) через публичное предложение PAYG (оплата по мере использования).

## Предварительные требования {#prerequisites}

- Проект GCP, в котором включены права на покупку, предоставленные вашим администратором выставления счетов.
- Чтобы подписаться на ClickHouse Cloud в GCP Marketplace, вы должны войти в систему с учетной записью, имеющей права на покупку, и выбрать соответствующий проект.

## Шаги для подписки {#steps-to-sign-up}

1. Перейдите на [GCP Marketplace](https://cloud.google.com/marketplace) и найдите ClickHouse Cloud. Убедитесь, что выбран правильный проект.

<br />

<img src={gcp_marketplace_payg_1}
    alt='Главная страница GCP Marketplace'
    class='image'
    style={{width: '500px'}}
/>

<br />

2. Нажмите на [листинг](https://console.cloud.google.com/marketplace/product/clickhouse-public/clickhouse-cloud) и затем на **Подписаться**.

<br />

<img src={gcp_marketplace_payg_2}
    alt='ClickHouse Cloud в GCP Marketplace'
    class='image'
    style={{width: '500px'}}
/>

<br />

3. На следующем экране настройте подписку:

- План по умолчанию будет "ClickHouse Cloud"
- Период подписки "Ежемесячно"
- Выберите соответствующий счет для выставления счетов
- Примите условия и нажмите **Подписаться**

<br />

<img src={gcp_marketplace_payg_3}
    alt='Настройка подписки в GCP Marketplace'
    class='image'
    style={{width: '400px'}}
/>

<br />

4. После нажатия **Подписаться** вы увидите модальное окно **Зарегистрируйтесь в ClickHouse**.

<br />

<img src={gcp_marketplace_payg_4}
    alt='Модальное окно регистрации в GCP Marketplace'
    class='image'
    style={{width: '400px'}}
/>

<br />

5. Обратите внимание, что на этом этапе настройка еще не завершена. Вам нужно будет перейти в ClickHouse Cloud, нажав **Настроить вашу учетную запись**, и зарегистрироваться в ClickHouse Cloud.

6. Как только вы перейдете в ClickHouse Cloud, вы можете либо войти с существующей учетной записью, либо зарегистрироваться с новой учетной записью. Этот шаг очень важен, чтобы мы могли связать вашу организацию ClickHouse Cloud с выставлением счетов GCP Marketplace.

<br />

<img src={aws_marketplace_payg_6}
    alt='Страница входа в ClickHouse Cloud'
    class='image'
    style={{width: '300px'}}
/>

<br />

Если вы новый пользователь ClickHouse Cloud, нажмите **Зарегистрироваться** внизу страницы. Вам будет предложено создать нового пользователя и подтвердить электронную почту. После подтверждения вашей электронной почты вы можете покинуть страницу входа в ClickHouse Cloud и войти с новым именем пользователя на [https://console.clickhouse.cloud](https://console.clickhouse.cloud).

<br />

<img src={aws_marketplace_payg_7}
    alt='Страница регистрации ClickHouse Cloud'
    class='image'
    style={{width: '500px'}}
/>

<br />

Обратите внимание, что если вы новый пользователь, вам также потребуется предоставить некоторую основную информацию о вашем бизнесе. Посмотрите на скриншоты ниже.

<br />

<img src={aws_marketplace_payg_8}
    alt='Форма регистрации в ClickHouse Cloud'
    class='image'
    style={{width: '400px'}}
/>

<br />

<img src={aws_marketplace_payg_9}
    alt='Форма регистрации в ClickHouse Cloud 2'
    class='image'
    style={{width: '400px'}}
/>

<br />

Если вы существующий пользователь ClickHouse Cloud, просто войдите, используя ваши учетные данные.

7. После успешного входа будет создана новая организация ClickHouse Cloud. Эта организация будет связана с вашим счетом GCP, и все расходы будут выставляться через ваш счет GCP.

8. Как только вы войдете, вы сможете подтвердить, что ваше выставление счетов действительно связано с GCP Marketplace, и начать настройку ваших ресурсов ClickHouse Cloud.

<br />

<img src={gcp_marketplace_payg_5}
    alt='Страница входа в ClickHouse Cloud'
    class='image'
    style={{width: '300px'}}
/>

<br />

<img src={aws_marketplace_payg_11}
    alt='Новая страница сервисов ClickHouse Cloud'
    class='image'
    style={{width: '400px'}}
/>

<br />

9. Вы должны получить электронное письмо с подтверждением регистрации:

<br />
<br />

<img src={gcp_marketplace_payg_6}
    alt='Электронное письмо с подтверждением GCP Marketplace'
    class='image'
    style={{width: '300px'}}
/>

<br />

<br />

Если у вас возникли какие-либо проблемы, не стесняйтесь обращаться в [нашу службу поддержки](https://clickhouse.com/support/program).
