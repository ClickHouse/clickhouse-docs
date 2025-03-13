---
slug: /cloud/billing/marketplace/aws-marketplace-payg
title: AWS Marketplace PAYG
description: Подпишитесь на ClickHouse Cloud через AWS Marketplace (PAYG).
keywords: [aws, marketplace, billing, PAYG]
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
import aws_marketplace_payg_10 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-10.png';
import aws_marketplace_payg_11 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-11.png';
import aws_marketplace_payg_12 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-12.png';

Начните работу с ClickHouse Cloud на [AWS Marketplace](https://aws.amazon.com/marketplace) через публичное предложение PAYG (оплата по мере использования).

## Предварительные требования {#prerequisites}

- У вас должен быть доступ к учетной записи AWS, включенной администратором выставления счетов.
- Для покупки вы должны войти в AWS Marketplace с этой учетной записью.

## Шаги для подписки {#steps-to-sign-up}

1. Перейдите на [AWS Marketplace](https://aws.amazon.com/marketplace) и выполните поиск ClickHouse Cloud.

<br />

<img src={aws_marketplace_payg_1}
    alt='Главная страница AWS Marketplace'
    class='image'
    style={{width: '500px'}}
/>

<br />

2. Нажмите на [листинг](https://aws.amazon.com/marketplace/pp/prodview-jettukeanwrfc), а затем на **Посмотреть варианты покупки**.

<br />

<img src={aws_marketplace_payg_2}
    alt='Поиск ClickHouse в AWS Marketplace'
    class='image'
    style={{width: '500px'}}
/>

<br />

3. На следующем экране настройте контракт:
- **Срок контракта** - Контракты PAYG действуют с месяца на месяц.
- **Настройки автоматического продления** - Вы можете установить автоматическое продление контракта или нет. 
Обратите внимание, что если вы не включите автоматическое продление, ваша организация автоматически попадает в льготный период в конце расчетного цикла и затем будет расформирована.

- **Варианты контракта** - Вы можете ввести любое число (или просто 1) в это текстовое поле. Это не повлияет на цену, которую вы платите, поскольку цена за эти единицы для публичного предложения составляет 0 долларов. Эти единицы обычно используются при принятии частного предложения от ClickHouse Cloud.

- **Заказ на покупку** - Это опционально, и вы можете это игнорировать.

<br />

<img src={aws_marketplace_payg_3}
    alt='Настройка контракта в AWS Marketplace'
    class='image'
    style={{width: '500px'}}
/>

<br />

После заполнения вышеуказанной информации нажмите **Создать контракт**. Вы можете подтвердить, что цена контракта отображается как ноль долларов, что в основном означает, что у вас нет задолженности и вы будете нести расходы на основе использования.

<br />

<img src={aws_marketplace_payg_4}
    alt='Подтверждение контракта в AWS Marketplace'
    class='image'
    style={{width: '500px'}}
/>

<br />

4. После нажатия **Создать контракт** вы увидите модальное окно для подтверждения и оплаты (0 долларов задолженности).

5. После нажатия **Оплатить сейчас** вы увидите подтверждение того, что вы теперь подписаны на предложение AWS Marketplace для ClickHouse Cloud.

<br />

<img src={aws_marketplace_payg_5}
    alt='Подтверждение платежа в AWS Marketplace'
    class='image'
    style={{width: '500px'}}
/>

<br />

6. Обратите внимание, что на этом этапе настройка еще не завершена. Вам нужно будет перенаправиться в ClickHouse Cloud, нажав на **Настроить вашу учетную запись**, и зарегистрироваться в ClickHouse Cloud.

7. После перенаправления в ClickHouse Cloud вы можете либо войти в свою учетную запись, либо зарегистрироваться новую. Этот шаг очень важен, чтобы мы могли связать вашу организацию ClickHouse Cloud с выставлением счетов AWS Marketplace.

<br />

<img src={aws_marketplace_payg_6}
    alt='Страница входа ClickHouse Cloud'
    class='image'
    style={{width: '300px'}}
/>

<br />

Если вы новый пользователь ClickHouse Cloud, нажмите **Зарегистрироваться** внизу страницы. Вам будет предложено создать нового пользователя и подтвердить электронную почту. После подтверждения вашей электронной почты вы можете покинуть страницу входа ClickHouse Cloud и войти с новым именем пользователя на [https://console.clickhouse.cloud](https://console.clickhouse.cloud).

<br />

<img src={aws_marketplace_payg_7}
    alt='Страница регистрации ClickHouse Cloud'
    class='image'
    style={{width: '500px'}}
/>

<br />

Обратите внимание, что если вы новый пользователь, вам также нужно будет предоставить основную информацию о вашем бизнесе. См. скриншоты ниже.

<br />

<img src={aws_marketplace_payg_8}
    alt='Форма информации для регистрации ClickHouse Cloud'
    class='image'
    style={{width: '400px'}}
/>

<br />

<br />

<img src={aws_marketplace_payg_9}
    alt='Форма информации для регистрации ClickHouse Cloud 2'
    class='image'
    style={{width: '400px'}}
/>

<br />

Если вы существующий пользователь ClickHouse Cloud, просто войдите, используя свои учетные данные.

8. После успешного входа будет создана новая организация ClickHouse Cloud. Эта организация будет связана с вашей учетной записью выставления счетов AWS, и все использование будет выставляться через вашу учетную запись AWS.

9. После входа вы можете подтвердить, что ваша выставление счетов действительно связано с AWS Marketplace, и начать настройку ваших ресурсов ClickHouse Cloud.

<br />

<img src={aws_marketplace_payg_10}
    alt='Просмотр выставления счетов AWS Marketplace в ClickHouse Cloud'
    class='image'
    style={{width: '300px'}}
/>

<br />

<img src={aws_marketplace_payg_11}
    alt='Страница новых услуг ClickHouse Cloud'
    class='image'
    style={{width: '400px'}}
/>

<br />

10. Вы должны получить электронное письмо с подтверждением подписки:

<br />

<img src={aws_marketplace_payg_12}
    alt='Электронное письмо подтверждения AWS Marketplace'
    class='image'
    style={{width: '500px'}}
/>

<br />

Если у вас возникли какие-либо проблемы, пожалуйста, не стесняйтесь обращаться в [нашу службу поддержки](https://clickhouse.com/support/program).
