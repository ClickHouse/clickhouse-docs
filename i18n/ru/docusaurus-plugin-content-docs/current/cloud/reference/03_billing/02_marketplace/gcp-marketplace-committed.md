---
'slug': '/cloud/billing/marketplace/gcp-marketplace-committed-contract'
'title': 'GCP Marketplace Комммитарированный контракт'
'description': 'Подпишитесь на ClickHouse Cloud через GCP Marketplace (Комммитарированный
  контракт)'
'keywords':
- 'gcp'
- 'google'
- 'marketplace'
- 'billing'
- 'committed'
- 'committed contract'
'doc_type': 'guide'
---
import Image from '@theme/IdealImage';
import gcp_marketplace_committed_1 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-committed-1.png';
import gcp_marketplace_committed_2 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-committed-2.png';
import gcp_marketplace_committed_3 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-committed-3.png';
import gcp_marketplace_committed_4 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-committed-4.png';
import gcp_marketplace_committed_5 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-committed-5.png';
import gcp_marketplace_committed_6 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-committed-6.png';
import gcp_marketplace_committed_7 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-committed-7.png';
import aws_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-6.png';
import aws_marketplace_payg_7 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-7.png';
import aws_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-8.png';
import aws_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-9.png';
import gcp_marketplace_payg_5 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-5.png';
import aws_marketplace_payg_11 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-11.png';
import gcp_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-6.png';

Начните работу с ClickHouse Cloud на [GCP Marketplace](https://console.cloud.google.com/marketplace) через согласованный контракт. Согласованный контракт, также известный как Частное предложение, позволяет клиентам обязаться потратить определенную сумму на ClickHouse Cloud в течение определенного периода времени.

## Предварительные требования {#prerequisites}

- Частное предложение от ClickHouse на основе конкретных условий контракта.

## Шаги для регистрации {#steps-to-sign-up}

1. Вам должно было прийти письмо с ссылкой для просмотра и принятия вашего частного предложения.

<br />

<Image img={gcp_marketplace_committed_1} size="md" alt="Письмо о частном предложении GCP Marketplace" border />

<br />

2. Нажмите на ссылку **Review Offer** в письме. Это должно перенаправить вас на вашу страницу GCP Marketplace с деталями частного предложения.

<br />

<Image img={gcp_marketplace_committed_2} size="md" alt="Сводка предложения GCP Marketplace" border/>

<br />

<Image img={gcp_marketplace_committed_3} size="md" alt="Сводка цен GCP Marketplace" border/>

<br />

3. Ознакомьтесь с деталями частного предложения и, если всё верно, нажмите **Accept**.

<br />

<Image img={gcp_marketplace_committed_4} size="md" alt="Страница подтверждения GCP Marketplace" border/>

<br />

4. Нажмите на **Go to product page**.

<br />

<Image img={gcp_marketplace_committed_5} size="md" alt="Подтверждение принятия GCP Marketplace" border/>

<br />

5. Нажмите на **Manage on provider**.

<br />

<Image img={gcp_marketplace_committed_6} size="md" alt="Страница ClickHouse Cloud на GCP Marketplace" border/>

<br />

На этом этапе критически важно перейти на ClickHouse Cloud и зарегистрироваться или войти в систему. Без завершения этого шага мы не сможем связать вашу подписку GCP Marketplace с ClickHouse Cloud.

<br />

<Image img={gcp_marketplace_committed_7} size="md" alt="Подтверждение выхода с сайта GCP Marketplace" border/>

<br />

6. После перехода на ClickHouse Cloud вы можете либо войти с помощью существующей учетной записи, либо зарегистрироваться с новой учетной записью.

<br />

<Image img={aws_marketplace_payg_6} size="md" alt="Страница входа в ClickHouse Cloud" border/>

<br />

Если вы новый пользователь ClickHouse Cloud, нажмите **Register** внизу страницы. Вам будет предложено создать нового пользователя и подтвердить электронную почту. После подтверждения вашей электронной почты вы можете покинуть страницу входа в ClickHouse Cloud и войти, используя новое имя пользователя на [https://console.clickhouse.cloud](https://console.clickhouse.cloud).

<br />

<Image img={aws_marketplace_payg_7} size="md" alt="Страница регистрации ClickHouse Cloud" border/>

<br />

Обратите внимание, что если вы новый пользователь, вам также нужно будет предоставить некоторую основную информацию о вашем бизнесе. См. скриншоты ниже.

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="Форма информации для регистрации ClickHouse Cloud" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="Форма информации для регистрации ClickHouse Cloud 2" border/>

<br />

Если вы существующий пользователь ClickHouse Cloud, просто выполните вход, используя свои учетные данные.

7. После успешного входа будет создана новая организация ClickHouse Cloud. Эта организация будет связана с вашим биллинговым аккаунтом GCP, и все затраты будут списываться через ваш аккаунт GCP.

8. После входа вы можете подтвердить, что ваш биллинг действительно связан с GCP Marketplace, и начать настройку ресурсов ClickHouse Cloud.

<br />

<Image img={gcp_marketplace_payg_5} size="md" alt="Страница входа в ClickHouse Cloud" border/>

<br />

<Image img={aws_marketplace_payg_11} size="md" alt="Страница новых услуг ClickHouse Cloud" border/>

<br />

9. Вы должны получить электронное письмо с подтверждением регистрации:

<br />
<br />

<Image img={gcp_marketplace_payg_6} size="md" alt="Подтверждение по электронной почте GCP Marketplace" border/>

<br />

<br />

Если у вас возникли проблемы, не стесняйтесь связаться с [нашей командой поддержки](https://clickhouse.com/support/program).