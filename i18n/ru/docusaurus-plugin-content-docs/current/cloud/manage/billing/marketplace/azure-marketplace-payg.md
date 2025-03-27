---
slug: /cloud/billing/marketplace/azure-marketplace-payg
title: 'Azure Marketplace PAYG'
description: 'Подписка на ClickHouse Cloud через Azure Marketplace (PAYG).'
keywords: ['azure', 'marketplace', 'billing', 'PAYG']
---

import Image from '@theme/IdealImage';
import azure_marketplace_payg_1 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-1.png';
import azure_marketplace_payg_2 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-2.png';
import azure_marketplace_payg_3 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-3.png';
import azure_marketplace_payg_4 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-4.png';
import azure_marketplace_payg_5 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-5.png';
import azure_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-6.png';
import azure_marketplace_payg_7 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-7.png';
import azure_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-8.png';
import azure_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-9.png';
import azure_marketplace_payg_10 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-10.png';
import aws_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-8.png';
import aws_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-9.png';
import azure_marketplace_payg_11 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-11.png';
import azure_marketplace_payg_12 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-12.png';

Начните работу с ClickHouse Cloud на [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) через публичное предложение PAYG (оплата по мере использования).

## Предварительные требования {#prerequisites}

- Проект Azure, который включен с правами на покупку вашим администратором биллинга.
- Для подписки на ClickHouse Cloud в Azure Marketplace вы должны войти с учетной записью, имеющей права на покупку, и выбрать соответствующий проект.

1. Перейдите на [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) и найдите ClickHouse Cloud. Убедитесь, что вы вошли в систему, чтобы иметь возможность приобрести предложение на маркетплейсе.

<br />

<Image img={azure_marketplace_payg_1} size="md" alt="Форма информации о регистрации ClickHouse Cloud" border/>

<br />

2. На странице списка продуктов нажмите **Get It Now**.

<br />

<Image img={azure_marketplace_payg_2} size="md" alt="Форма информации о регистрации ClickHouse Cloud" border/>

<br />

3. Вам нужно будет указать имя, электронную почту и информацию о местоположении на следующем экране.

<br />

<Image img={azure_marketplace_payg_3} size="md" alt="Форма информации о регистрации ClickHouse Cloud" border/>

<br />

4. На следующем экране нажмите **Subscribe**.

<br />

<Image img={azure_marketplace_payg_4} size="md" alt="Форма информации о регистрации ClickHouse Cloud" border/>

<br />

5. На следующем экране выберите подписку, группу ресурсов и местоположение группы ресурсов. Местоположение группы ресурсов не обязательно должно совпадать с местоположением, где вы собираетесь запускать свои сервисы на ClickHouse Cloud.

<br />

<Image img={azure_marketplace_payg_5} size="md" alt="Форма информации о регистрации ClickHouse Cloud" border/>

<br />

6. Вам также нужно будет указать название подписки и выбрать срок оплату из доступных вариантов. Вы можете выбрать установить **Recurring billing** как включенное или отключенное. Если вы установите его на "off", ваш контракт закончится после окончания срока оплаты, и ваши ресурсы будут деактивированы.

<br />

<Image img={azure_marketplace_payg_6} size="md" alt="Форма информации о регистрации ClickHouse Cloud" border/>

<br />

7. Нажмите **"Review + subscribe"**.

8. На следующем экране убедитесь, что все выглядит правильно, и нажмите **Subscribe**.

<br />

<Image img={azure_marketplace_payg_7} size="md" alt="Форма информации о регистрации ClickHouse Cloud" border/>

<br />

9. Обратите внимание, что на этом этапе вы подписались на подписку Azure ClickHouse Cloud, но еще не настроили свою учетную запись в ClickHouse Cloud. Следующие шаги необходимы и критически важны для того, чтобы ClickHouse Cloud мог связаться с вашей подпиской Azure, обеспечивая правильный биллинг через Azure Marketplace.

<br />

<Image img={azure_marketplace_payg_8} size="md" alt="Форма информации о регистрации ClickHouse Cloud" border/>

<br />

10. После завершения настройки Azure кнопка **Configure account now** должна активироваться.

<br />

<Image img={azure_marketplace_payg_9} size="md" alt="Форма информации о регистрации ClickHouse Cloud" border/>

<br />

11. Нажмите на **Configure account now**.

<br />

Вы получите электронное письмо, подобное тому, что ниже, с деталями настройки вашей учетной записи:

<br />

<Image img={azure_marketplace_payg_10} size="md" alt="Форма информации о регистрации ClickHouse Cloud" border/>

<br />

12. Вы будете перенаправлены на страницу регистрации или входа в ClickHouse Cloud. Вы можете зарегистрироваться с помощью новой учетной записи или войти с помощью существующей учетной записи. Как только вы войдете, будет создана новая организация, готовая к использованию и биллингу через Azure Marketplace.

13. Вам нужно будет ответить на несколько вопросов - адрес и данные о компании - прежде чем вы сможете продолжить.

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="Форма информации о регистрации ClickHouse Cloud" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="Форма информации о регистрации ClickHouse Cloud 2" border/>

<br />

14. После нажатия **Complete sign up** вы будете перенаправлены в вашу организацию в ClickHouse Cloud, где вы сможете просмотреть экран биллинга, чтобы убедиться, что вас выставляют счета через Azure Marketplace, и сможете создавать сервисы.

<br />

<br />

<Image img={azure_marketplace_payg_11} size="md" alt="Форма информации о регистрации ClickHouse Cloud" border/>

<br />

<br />

<Image img={azure_marketplace_payg_12} size="md" alt="Форма информации о регистрации ClickHouse Cloud" border/>

<br />

15. Если у вас возникли какие-либо проблемы, пожалуйста, не стесняйтесь обращаться в [нашу службу поддержки](https://clickhouse.com/support/program).
