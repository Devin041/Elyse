'use client';

import { useState } from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import styles from './NewsletterSection.module.css';

/**
 * Newsletter signup section for collection pages
 * Appears before footer
 */
export function NewsletterSection() {
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement newsletter signup
        console.log('Newsletter signup:', email);
        setEmail('');
    };

    return (
        <section className={styles.newsletter}>
            <div className={styles.container}>
                <h2 className={styles.heading}>Exclusive offers straight to your inbox</h2>
                <p className={styles.subheading}>
                    Join to get special offers, free giveaways, and once-in-a-lifetime deals.
                </p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your-email@example.com"
                        className={styles.input}
                        required
                    />
                    <button type="submit" className={styles.button}>
                        <ArrowRightIcon className={styles.icon} />
                    </button>
                </form>
            </div>
        </section>
    );
}
