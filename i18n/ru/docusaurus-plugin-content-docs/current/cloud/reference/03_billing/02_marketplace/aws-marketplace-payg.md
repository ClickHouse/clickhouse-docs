---
'slug': '/cloud/billing/marketplace/aws-marketplace-payg'
'title': 'AWS Marketplace PAYG'
'description': 'Подписывайтесь на ClickHouse Cloud через AWS Marketplace (PAYG).'
'keywords':
- 'aws'
- 'marketplace'
- 'billing'
- 'PAYG'
'doc_type': 'guide'
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

## Предварительные требования {#prerequisites}

- Учётная запись AWS, которую разрешил ваш администратор по платежам.
- Чтобы сделать покупку, вы должны войти в AWS Marketplace с этой учётной записью.

## Шаги для регистрации {#steps-to-sign-up}

1. Перейдите на [AWS Marketplace](https://aws.amazon.com/marketplace) и найдите ClickHouse Cloud.

<br />

<Image img={aws_marketplace_payg_1} size="md" alt="Главная страница AWS Marketplace" border/>

<br />

2. Нажмите на [листинг](https://aws.amazon.com/marketplace/pp/prodview-jettukeanwrfc), затем выберите **Просмотреть варианты покупки**.

<br />

<Image img={aws_marketplace_payg_2} size="md" alt="Поиск ClickHouse на AWS Marketplace" border/>

<br />

3. На следующем экране настройте контракт:
- **Срок контракта** - контракты PAYG действуют месячно.
- **Настройки продления** - вы можете установить автоматическое продление контракта или нет.
Обратите внимание, что мы настоятельно рекомендуем оставить подписку на автоматическое продление каждый месяц. Однако, если вы не включите автоматическое продление, ваша организация автоматически будет переведена в льготный период в конце расчетного цикла и затем будет деактивирована.

- **Опции контракта** - вы можете ввести любое число (или просто 1) в это текстовое поле. Это не повлияет на цену, которую вы заплатите, так как цена за эти единицы для публичного предложения составляет $0. Эти единицы обычно используются при акцепте частного предложения от ClickHouse Cloud.

- **Заказ на покупку** - это необязательно, и вы можете проигнорировать это.

<br />

<Image img={aws_marketplace_payg_3} size="md" alt="Настройка контракта на AWS Marketplace" border/>

<br />

После заполнения указанной информации нажмите **Создать контракт**. Вы можете подтвердить, что цена контракта отображается как ноль долларов, что по сути означает, что вы не должны ничего платить и будете нести расходы на основе использования.

<br />

<Image img={aws_marketplace_payg_4} size="md" alt="Подтверждение контракта на AWS Marketplace" border/>

<br />

4. Как только вы нажмете **Создать контракт**, на экране появится модальное окно для подтверждения и оплаты (платеж составляет $0).

5. После нажатия **Оплатить сейчас** вы увидите подтверждение о том, что вы теперь подписаны на предложение AWS Marketplace для ClickHouse Cloud.

<br />

<Image img={aws_marketplace_payg_5} size="md" alt="Подтверждение оплаты на AWS Marketplace" border/>

<br />

6. Обратите внимание, что на этом этапе настройка еще не завершена. Вам нужно будет перейти на ClickHouse Cloud, нажав на **Настроить вашу учетную запись** и зарегистрировавшись в ClickHouse Cloud.

7. Когда вы перейдете на ClickHouse Cloud, вы можете либо войти с существующей учетной записью, либо зарегистрироваться с новой учетной записью. Этот шаг очень важен, чтобы мы могли связать вашу организацию ClickHouse Cloud с оплатой AWS Marketplace.

<br />

<Image img={aws_marketplace_payg_6} size="md" alt="Страница входа в ClickHouse Cloud" border/>

<br />

Если вы новый пользователь ClickHouse Cloud, нажмите **Зарегистрироваться** внизу страницы. Вам будет предложено создать нового пользователя и подтвердить электронную почту. После подтверждения электронной почты вы можете покинуть страницу входа ClickHouse Cloud и войти, используя новое имя пользователя на [https://console.clickhouse.cloud](https://console.clickhouse.cloud).

<br />

<Image img={aws_marketplace_payg_7} size="md" alt="Страница регистрации ClickHouse Cloud" border/>

<br />

Обратите внимание, что если вы новый пользователь, вам также нужно будет предоставить некоторую основную информацию о вашем бизнесе. См. скриншоты ниже.

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="Форма информации о регистрации ClickHouse Cloud" border/>

<br />

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="Форма информации о регистрации ClickHouse Cloud 2" border/>

<br />

Если вы существующий пользователь ClickHouse Cloud, просто войдите, используя свои учетные данные.

8. После успешного входа будет создана новая организация ClickHouse Cloud. Эта организация будет связана с вашим счетом AWS, и все использование будет выставляться на ваш счет AWS.

9. После входа вы можете подтвердить, что ваша оплата действительно связана с AWS Marketplace, и начать настраивать свои ресурсы ClickHouse Cloud.

<br />

<Image img={aws_marketplace_payg_10} size="md" alt="Просмотр выставления счета AWS Marketplace в ClickHouse Cloud" border/>

<br />

<Image img={aws_marketplace_payg_11} size="md" alt="Новая страница сервисов ClickHouse Cloud" border/>

<br />

10. Вы должны получить электронное письмо, подтверждающее регистрацию:

<br />

<Image img={aws_marketplace_payg_12} size="md" alt="Письмо подтверждения AWS Marketplace" border/>

<br />

Если у вас возникли проблемы, пожалуйста, не стесняйтесь обращаться в [нашу службу поддержки](https://clickhouse.com/support/program).