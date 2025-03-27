---
slug: /cloud/billing/marketplace/aws-marketplace-payg
title: 'AWS Marketplace PAYG'
description: 'Подписаться на ClickHouse Cloud через AWS Marketplace (PAYG).'
keywords: ['aws', 'marketplace', 'billing', 'PAYG']
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
import Image from '@theme/IdealImage';

Начните работу с ClickHouse Cloud на [AWS Marketplace](https://aws.amazon.com/marketplace) через PAYG (оплата по мере использования) публичное предложение.

## Пр prerequisites {#prerequisites}

- У вас должен быть аккаунт AWS с правами на покупку, предоставленными вашим администратором биллинга.
- Чтобы совершить покупку, вы должны войти в AWS Marketplace с этим аккаунтом.

## Шаги для регистрации {#steps-to-sign-up}

1. Перейдите на [AWS Marketplace](https://aws.amazon.com/marketplace) и поищите ClickHouse Cloud.

<br />

<Image img={aws_marketplace_payg_1} size="md" alt="Главная страница AWS Marketplace" border/>

<br />

2. Нажмите на [листинг](https://aws.amazon.com/marketplace/pp/prodview-jettukeanwrfc), затем на **Просмотреть варианты покупки**.

<br />

<Image img={aws_marketplace_payg_2} size="md" alt="Поиск ClickHouse на AWS Marketplace" border/>

<br />

3. На следующем экране настройте контракт:
- **Срок контракта** - контракты PAYG действуют с месяца на месяц.
- **Настройки продления** - вы можете установить автоматическое продление контракта или нет. 
Обратите внимание, что если вы не включите автоматическое продление, ваша организация автоматически перейдет в льготный период в конце расчетного цикла и затем будет деактивирована.

- **Опции контракта** - вы можете ввести любое число (или всего 1) в это текстовое поле. Это не повлияет на цену, которую вы заплатите, поскольку цена на эти единицы по публичному предложению составляет 0 долларов. Эти единицы обычно используются при принятии частного предложения от ClickHouse Cloud.

- **Номер закупки** - это необязательно, и вы можете проигнорировать это.

<br />

<Image img={aws_marketplace_payg_3} size="md" alt="Настройка контракта на AWS Marketplace" border/>

<br />

После заполнения вышеуказанной информации нажмите на **Создать контракт**. Вы можете подтвердить, что цена контракта составляет ноль долларов, что на самом деле означает, что у вас нет задолженности и вы понесете расходы в зависимости от использования.

<br />

<Image img={aws_marketplace_payg_4} size="md" alt="Подтверждение контракта на AWS Marketplace" border/>

<br />

4. После нажатия на **Создать контракт** вы увидите модальное окно для подтверждения и оплаты (0 долларов).

5. После нажатия на **Оплатить сейчас** вы увидите подтверждение, что теперь вы подписаны на предложение AWS Marketplace для ClickHouse Cloud.

<br />

<Image img={aws_marketplace_payg_5} size="md" alt="Подтверждение платежа на AWS Marketplace" border/>

<br />

6. Обратите внимание, что на этом этапе настройка еще не завершена. Вам нужно будет перенаправиться в ClickHouse Cloud, нажав на **Настройте свой аккаунт** и зарегистрировавшись в ClickHouse Cloud.

7. Как только вы перейдете в ClickHouse Cloud, вы можете либо войти с существующим аккаунтом, либо зарегистрироваться с новым. Этот шаг очень важен, чтобы мы могли связать вашу организацию ClickHouse Cloud с выставлением счетов AWS Marketplace.

<br />

<Image img={aws_marketplace_payg_6} size="md" alt="Страница входа в ClickHouse Cloud" border/>

<br />

Если вы новый пользователь ClickHouse Cloud, нажмите **Зарегистрироваться** внизу страницы. Вам будет предложено создать нового пользователя и подтвердить адрес электронной почты. После подтверждения вашего адреса электронной почты вы можете выйти со страницы входа в ClickHouse Cloud и войти, используя новое имя пользователя на [https://console.clickhouse.cloud](https://console.clickhouse.cloud).

<br />

<Image img={aws_marketplace_payg_7} size="md" alt="Страница регистрации ClickHouse Cloud" border/>

<br />

Обратите внимание, что если вы новый пользователь, вам также необходимо предоставить некоторую основную информацию о вашем бизнесе. Смотрите скриншоты ниже.

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="Форма информации для регистрации ClickHouse Cloud" border/>

<br />

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="Форма информации для регистрации ClickHouse Cloud 2" border/>

<br />

Если вы существующий пользователь ClickHouse Cloud, просто войдите, используя свои учетные данные.

8. После успешного входа будет создана новая организация ClickHouse Cloud. Эта организация будет связана с вашим аккаунтом AWS для выставления счетов, и все использование будет выставляться через ваш аккаунт AWS.

9. Как только вы войдете, вы можете подтвердить, что ваше выставление счетов действительно связано с AWS Marketplace и начать настраивать ваши ресурсы ClickHouse Cloud.

<br />

<Image img={aws_marketplace_payg_10} size="md" alt="Просмотр выставления счетов AWS Marketplace в ClickHouse Cloud" border/>

<br />

<Image img={aws_marketplace_payg_11} size="md" alt="Страница новых сервисов ClickHouse Cloud" border/>

<br />

10. Вы должны получить электронное письмо с подтверждением регистрации:

<br />

<Image img={aws_marketplace_payg_12} size="md" alt="Электронное письмо с подтверждением AWS Marketplace" border/>

<br />

Если у вас возникли какие-либо проблемы, пожалуйста, не стесняйтесь обращаться в [нашу службу поддержки](https://clickhouse.com/support/program).
