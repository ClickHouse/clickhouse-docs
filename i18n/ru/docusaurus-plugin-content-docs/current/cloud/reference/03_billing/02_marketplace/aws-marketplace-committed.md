---
'slug': '/cloud/billing/marketplace/aws-marketplace-committed-contract'
'title': 'AWS Marketplace Коммитация Контракта'
'description': 'Подпишитесь на ClickHouse Cloud через AWS Marketplace (Коммитация
  Контракта)'
'keywords':
- 'aws'
- 'amazon'
- 'marketplace'
- 'billing'
- 'committed'
- 'committed contract'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import aws_marketplace_committed_1 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-committed-1.png';
import aws_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-6.png';
import aws_marketplace_payg_7 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-7.png';
import aws_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-8.png';
import aws_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-9.png';
import aws_marketplace_payg_10 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-10.png';
import aws_marketplace_payg_11 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-11.png';
import aws_marketplace_payg_12 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-12.png';

Начните работу с ClickHouse Cloud на [AWS Marketplace](https://aws.amazon.com/marketplace) через частный контракт. Частный контракт, также известный как Private Offer, позволяет клиентам обязаться тратить определенную сумму на ClickHouse Cloud в течение определенного времени.

## Предварительные требования {#prerequisites}

- Частное предложение от ClickHouse на основе конкретных условий контракта.
- Чтобы подключить организацию ClickHouse к вашему предложению о фиксированных расходах, вы должны быть администратором этой организации.

[Требуемые разрешения для просмотра и принятия вашего частного контракта в AWS](https://docs.aws.amazon.com/marketplace/latest/buyerguide/private-offers-page.html#private-offers-page-permissions):
- Если вы используете управляемые AWS политики, необходимо иметь следующие разрешения: `AWSMarketplaceRead-only`, `AWSMarketplaceManageSubscriptions` или `AWSMarketplaceFullAccess`.
- Если вы не используете управляемые AWS политики, необходимо иметь следующие разрешения: IAM действие `aws-marketplace:ListPrivateListings` и `aws-marketplace:ViewSubscriptions`.

## Шаги для регистрации {#steps-to-sign-up}

1. Вы должны были получить электронное письмо со ссылкой для просмотра и принятия вашего частного предложения.

<br />

<Image img={aws_marketplace_committed_1} size="md" alt="Электронное письмо о частном предложении AWS Marketplace" border/>

<br />

2. Нажмите на ссылку **Review Offer** в электронном письме. Это должно направить вас на страницу AWS Marketplace с подробностями частного предложения. При принятии частного предложения выберите значение 1 для количества единиц в списке параметров контракта.

3. Завершите шаги для подписки на портале AWS и нажмите **Set up your account**.
Критически важно в этот момент перенаправить вас на ClickHouse Cloud и либо зарегистрироваться для нового аккаунта, либо войти с существующим аккаунтом. Без завершения этого шага мы не сможем связать вашу подписку AWS Marketplace с ClickHouse Cloud.

4. После перенаправления на ClickHouse Cloud вы можете либо войти с существующим аккаунтом, либо зарегистрироваться с новым аккаунтом. Этот шаг очень важен, чтобы мы могли связать вашу организацию ClickHouse Cloud с выставлением счетов AWS Marketplace.

<br />

<Image img={aws_marketplace_payg_6} size="md" alt="Страница входа ClickHouse Cloud" border/>

<br />

Если вы новый пользователь ClickHouse Cloud, нажмите **Register** внизу страницы. Вам будет предложено создать нового пользователя и подтвердить электронную почту. После подтверждения вашей электронной почты вы можете покинуть страницу входа ClickHouse Cloud и войти, используя новое имя пользователя на [https://console.clickhouse.cloud](https://console.clickhouse.cloud).

<br />

<Image img={aws_marketplace_payg_7} size="md" alt="Страница регистрации ClickHouse Cloud" border/>

<br />

Обратите внимание, что если вы новый пользователь, вам также нужно будет предоставить некоторую основную информацию о вашем бизнесе. Смотрите скриншоты ниже.

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="Форма информации для регистрации ClickHouse Cloud" border/>

<br />

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="Форма информации для регистрации ClickHouse Cloud 2" border/>

<br />

Если вы существующий пользователь ClickHouse Cloud, просто войдите, используя свои учетные данные.

5. После успешного входа будет создана новая организация ClickHouse Cloud. Эта организация будет связана с вашим AWS счетом, и все использования будут выставляться через ваш AWS аккаунт.

6. После входа вы сможете подтвердить, что ваша выставление счетов действительно связано с AWS Marketplace, и начать настраивать свои ресурсы ClickHouse Cloud.

<br />

<Image img={aws_marketplace_payg_10} size="md" alt="ClickHouse Cloud просмотр выставления счетов AWS Marketplace" border/>

<br />

<Image img={aws_marketplace_payg_11} size="md" alt="Страница новых услуг ClickHouse Cloud" border/>

<br />

6. Вы должны получить электронное письмо с подтверждением регистрации:

<br />

<Image img={aws_marketplace_payg_12} size="md" alt="Электронное письмо о подтверждении AWS Marketplace" border/>

<br />

Если у вас возникнут какие-либо проблемы, не стесняйтесь обращаться к [нашей службе поддержки](https://clickhouse.com/support/program).
