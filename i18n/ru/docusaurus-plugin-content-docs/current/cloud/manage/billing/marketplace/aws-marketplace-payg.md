---
slug: /cloud/billing/marketplace/aws-marketplace-payg
title: 'AWS Marketplace PAYG'
description: 'Подпишитесь на ClickHouse Cloud через AWS Marketplace (PAYG).'
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

Начните работу с ClickHouse Cloud на [AWS Marketplace](https://aws.amazon.com/marketplace) через Публичное предложение PAYG (оплата по мере использования).

## Пр prerequisites {#prerequisites}

- У вас должен быть аккаунт AWS, который активирован и имеет права на покупку от вашего администратора по биллингу.
- Чтобы осуществить покупку, необходимо войти в AWS Marketplace с этим аккаунтом.

## Шаги для регистрации {#steps-to-sign-up}

1. Перейдите в [AWS Marketplace](https://aws.amazon.com/marketplace) и выполните поиск ClickHouse Cloud.

<br />

<Image img={aws_marketplace_payg_1} size="md" alt="Главная страница AWS Marketplace" border/>

<br />

2. Нажмите на [предложение](https://aws.amazon.com/marketplace/pp/prodview-jettukeanwrfc), а затем на **Просмотреть варианты покупки**.

<br />

<Image img={aws_marketplace_payg_2} size="md" alt="Поиск ClickHouse в AWS Marketplace" border/>

<br />

3. На следующем экране настройте контракт:
- **Длительность контракта** - контракты PAYG действуют от месяца к месяцу.
- **Настройки возобновления** - вы можете установить автоматическое продление или нет. 
Обратите внимание, что если вы не включите автоматическое продление, ваша организация автоматически перейдёт в льготный период в конце расчетного цикла, а затем будет отключена.

- **Опции контракта** - вы можете ввести любое число (или только 1) в это текстовое поле. Это не повлияет на цену, которую вы оплачиваете, так как цена за эти единицы по публичному предложению составляет 0 долларов. Эти единицы обычно используются при принятии частного предложения от ClickHouse Cloud.

- **Заказ на покупку** - это опционально, и вы можете проигнорировать это.

<br />

<Image img={aws_marketplace_payg_3} size="md" alt="Настройка контракта в AWS Marketplace" border/>

<br />

После заполнения вышеуказанной информации нажмите на **Создать контракт**. Вы можете подтвердить, что цена контракта составляет ноль долларов, что фактически означает, что у вас нет задолженности, и вы будете нести расходы на основании использования.

<br />

<Image img={aws_marketplace_payg_4} size="md" alt="Подтвердите контракт в AWS Marketplace" border/>

<br />

4. Когда вы нажмете **Создать контракт**, вы увидите модальное окно для подтверждения и оплаты (0 долларов).

5. Когда вы нажмете **Оплатить сейчас**, вы увидите подтверждение, что вы подписались на предложение AWS Marketplace для ClickHouse Cloud.

<br />

<Image img={aws_marketplace_payg_5} size="md" alt="Подтверждение оплаты в AWS Marketplace" border/>

<br />

6. Обратите внимание, что на этом этапе установка еще не завершена. Вам потребуется перейти на ClickHouse Cloud, нажав на **Настроить ваш аккаунт**, и зарегистрироваться в ClickHouse Cloud.

7. После перенаправления на ClickHouse Cloud вы можете войти с существующей учетной записью или зарегистрироваться с новой. Этот шаг очень важен, чтобы мы могли связать вашу организацию ClickHouse Cloud с биллингом AWS Marketplace.

<br />

<Image img={aws_marketplace_payg_6} size="md" alt="Страница входа в ClickHouse Cloud" border/>

<br />

Если вы новый пользователь ClickHouse Cloud, нажмите **Зарегистрироваться** внизу страницы. Вам будет предложено создать нового пользователя и подтвердить email. После подтверждения вашего email, вы можете покинуть страницу входа ClickHouse Cloud и войти с новым именем пользователя на [https://console.clickhouse.cloud](https://console.clickhouse.cloud).

<br />

<Image img={aws_marketplace_payg_7} size="md" alt="Страница регистрации в ClickHouse Cloud" border/>

<br />

Обратите внимание, что если вы новый пользователь, вам также нужно будет предоставить некоторая основная информация о вашем бизнесе. См. скриншоты ниже.

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="Форма регистрации в ClickHouse Cloud" border/>

<br />

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="Форма регистрации в ClickHouse Cloud 2" border/>

<br />

Если вы существующий пользователь ClickHouse Cloud, просто войдите, используя ваши учетные данные.

8. После успешного входа будет создана новая организация ClickHouse Cloud. Эта организация будет связана с вашим аккаунтом AWS для биллинга, и все расходы будут выставлены через ваш аккаунт AWS.

9. После входа вы можете подтвердить, что ваш биллинг действительно связан с AWS Marketplace, и начать настраивать свои ресурсы ClickHouse Cloud.

<br />

<Image img={aws_marketplace_payg_10} size="md" alt="Просмотр биллинга AWS Marketplace в ClickHouse Cloud" border/>

<br />

<Image img={aws_marketplace_payg_11} size="md" alt="Новая страница услуг ClickHouse Cloud" border/>

<br />

10. Вы должны получить электронное письмо, подтверждающее подписку:

<br />

<Image img={aws_marketplace_payg_12} size="md" alt="Подтверждение подписки по электронной почте от AWS Marketplace" border/>

<br />

Если у вас возникли какие-либо проблемы, не стесняйтесь обращаться в [нашу команду поддержки](https://clickhouse.com/support/program).
