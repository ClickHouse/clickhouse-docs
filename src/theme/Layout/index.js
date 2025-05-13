import React from 'react';
import Layout from '@theme-original/Layout';

export default function CustomLayout(props) {
    return (
        <>
            <Layout {...props} />
            <img
                referrerPolicy='no-referrer-when-downgrade'
                src="https://static.scarf.sh/a.png?x-pxid=e6377503-591b-4886-9398-e69c7fee0b91"
                alt=""
            />
        </>
    );
}
