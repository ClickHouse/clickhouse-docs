import React from 'react'
import './styles.scss'
import { Link } from 'react-router-dom';

type ListProps = {
    items: [title: any, slug: string]
}

export function TableOfContents(props: ListProps) {
    return (
        <ul className="table_of_contents">
            {props.items.map((item, index) => (
                <li key={index}><Link to={`/docs${item.slug}`}>{item.title}</Link></li>
            ))}
        </ul>
    )
}
