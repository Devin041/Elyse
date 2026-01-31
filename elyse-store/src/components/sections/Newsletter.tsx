'use client';

import { Button } from '@/components/ui/Button';

export function Newsletter() {
    return (
        <section className="py-16 bg-neutral-900 text-white">
            <div className="container-custom">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-3xl font-serif font-bold mb-4">Exclusive offers straight to your inbox</h2>
                    <p className="text-neutral-300 mb-8">
                        Join to get special offers, free giveaways, and once-in-a-lifetime deals.
                    </p>

                    <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 bg-transparent border border-neutral-600 px-4 py-3 text-white placeholder:text-neutral-500 focus:outline-none focus:border-white"
                            required
                        />
                        <Button variant="secondary" className="bg-white text-neutral-900 hover:bg-neutral-100">
                            Subscribe
                        </Button>
                    </form>
                </div>
            </div>
        </section>
    );
}
