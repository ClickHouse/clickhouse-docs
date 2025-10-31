---
'slug': '/cloud/billing/marketplace/gcp-marketplace-payg'
'title': 'GCP Marketplace PAYG'
'description': 'Подпишитесь на ClickHouse Cloud через GCP Marketplace (PAYG).'
'keywords':
- 'gcp'
- 'marketplace'
- 'billing'
- 'PAYG'
'doc_type': 'guide'
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
import Image from '@theme/IdealImage';

Начните работу с ClickHouse Cloud на [GCP Marketplace](https://console.cloud.google.com/marketplace) через публичное предложение PAYG (оплата по мере использования).

## Предварительные требования {#prerequisites}

- Проект GCP, который имеет права на покупку, предоставленные вашим администратором по выставлению счетов.
- Чтобы подписаться на ClickHouse Cloud в GCP Marketplace, вам необходимо войти с учетной записью, имеющей права на покупку, и выбрать соответствующий проект.

## Шаги для регистрации {#steps-to-sign-up}

1. Перейдите на [GCP Marketplace](https://cloud.google.com/marketplace) и найдите ClickHouse Cloud. Убедитесь, что выбран правильный проект.

<Image img={gcp_marketplace_payg_1} size="md" alt="Главная страница GCP Marketplace" border/>

2. Нажмите на [листинг](https://console.cloud.google.com/marketplace/product/clickhouse-public/clickhouse-cloud), а затем на **Подписаться**.

<Image img={gcp_marketplace_payg_2} size="md" alt="ClickHouse Cloud в GCP Marketplace" border/>

3. На следующем экране настройте подписку:

- План по умолчанию будет "ClickHouse Cloud"
- Период подписки - "Ежемесячный"
- Выберите подходящую учетную запись для выставления счетов
- Примите условия и нажмите **Подписаться**

<br />

<Image img={gcp_marketplace_payg_3} size="sm" alt="Настройка подписки в GCP Marketplace" border/>

<br />

4. После нажатия на **Подписаться** появится модальное окно **Регистрация в ClickHouse**.

<br />

<Image img={gcp_marketplace_payg_4} size="md" alt="Модальное окно регистрации в GCP Marketplace" border/>

<br />

5. Обратите внимание, что на этом этапе настройка еще не завершена. Вам нужно перейти к ClickHouse Cloud, нажав на **Настроить свою учетную запись**, и зарегистрироваться в ClickHouse Cloud.

6. После перехода в ClickHouse Cloud вы можете либо войти с существующей учетной записью, либо зарегистрироваться с новой. Этот шаг очень важен, чтобы мы могли связать вашу организацию ClickHouse Cloud с выставлением счетов GCP Marketplace.

<br />

<Image img={aws_marketplace_payg_6} size="md" alt="Страница входа в ClickHouse Cloud" border/>

<br />

Если вы новый пользователь ClickHouse Cloud, нажмите **Зарегистрироваться** внизу страницы. Вам будет предложено создать нового пользователя и подтвердить электронную почту. После подтверждения вашей электронной почты вы можете покинуть страницу входа в ClickHouse Cloud и войти, используя новое имя пользователя на [https://console.clickhouse.cloud](https://console.clickhouse.cloud).

<br />

<Image img={aws_marketplace_payg_7} size="md" alt="Страница регистрации в ClickHouse Cloud" border/>

<br />

Обратите внимание, что если вы новый пользователь, вам также нужно будет предоставить некоторую основную информацию о вашем бизнесе. См. скриншоты ниже.

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="Форма информации для регистрации в ClickHouse Cloud" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="Форма информации для регистрации в ClickHouse Cloud 2" border/>

<br />

Если вы существующий пользователь ClickHouse Cloud, просто войдите, используя свои учетные данные.

7. После успешного входа будет создана новая организация ClickHouse Cloud. Эта организация будет связана с вашей учетной записью выставления счетов GCP, и все расходы будут выставлены через вашу учетную запись GCP.

8. После входа в систему вы можете подтвердить, что ваше выставление счетов действительно связано с GCP Marketplace, и начать настройку ресурсов ClickHouse Cloud.

<br />

<Image img={gcp_marketplace_payg_5} size="md" alt="Страница входа в ClickHouse Cloud" border/>

<br />

<Image img={aws_marketplace_payg_11} size="md" alt="Страница новых услуг ClickHouse Cloud" border/>

<br />

9. Вы должны получить электронное письмо с подтверждением регистрации:

<br />
<br />

<Image img={gcp_marketplace_payg_6} size="md" alt="Электронное письмо с подтверждением GCP Marketplace" border/>

<br />

<br />

Если у вас возникли какие-либо проблемы, пожалуйста, не стесняйтесь обращаться в [нашу службу поддержки](https://clickhouse.com/support/program).