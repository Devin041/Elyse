import Link from 'next/link';
import { Button } from '@/components/ui/Button';

const footerNavigation = {
    shop: [
        { name: 'Festive New In', href: '/collections/new-in' },
        { name: 'Shop by Style', href: '/collections/all' },
        { name: 'Bestsellers', href: '/collections/bestsellers' },
        { name: 'Gift Cards', href: '/products/gift-card' },
        { name: 'Blog', href: '/blog' },
        { name: 'Our Story', href: '/about' },
    ],
    legal: [
        { name: 'Terms & Conditions', href: '/pages/terms' },
        { name: 'Shipping Policy', href: '/pages/shipping' },
        { name: 'Return & Exchange Policy', href: '/pages/returns' },
        { name: 'Privacy Policy', href: '/pages/privacy' },
        { name: 'Grievance Redressal', href: '/pages/grievance' },
        { name: 'Legal Compliance', href: '/pages/legal' },
    ],
    help: [
        { name: 'Contact Us', href: '/contact' },
        { name: 'Made to Order', href: '/pages/made-to-order' },
        { name: 'Store Enquiry', href: '/pages/store-enquiry' },
    ],
    social: [
        {
            name: 'Facebook', href: '#', icon: (props: any) => (
                <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
            )
        },
        {
            name: 'Instagram', href: '#', icon: (props: any) => (
                <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465 1.067-.047 1.407-.06 4.123-.06h.08zm-1.634 5.337a5.338 5.338 0 110 10.676 5.338 5.338 0 010-10.676zm0 1.602a3.736 3.736 0 100 7.472 3.736 3.736 0 000-7.472zm5.338-3.205a1.067 1.067 0 110 2.134 1.067 1.067 0 010-2.134z" clipRule="evenodd" />
                </svg>
            )
        },
        {
            name: 'YouTube', href: '#', icon: (props: any) => (
                <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
                    <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 01-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 01-1.768-1.768C2 15.255 2 12 2 12s0-3.255.419-4.814a2.507 2.507 0 011.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418zM15.194 12 10 15V9l5.194 3z" clipRule="evenodd" />
                </svg>
            )
        },
    ],
};

export function Footer() {
    return (
        <footer className="bg-neutral-50" aria-labelledby="footer-heading">
            <h2 id="footer-heading" className="sr-only">Footer</h2>
            <div className="container-custom pb-8 pt-16 sm:pt-24 lg:pt-32">
                <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                    <div className="grid grid-cols-2 gap-8 xl:col-span-2">
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>
                                <h3 className="text-sm font-semibold leading-6 text-neutral-900">Shop Now</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    {footerNavigation.shop.map((item) => (
                                        <li key={item.name}>
                                            <Link href={item.href} className="text-sm leading-6 text-neutral-600 hover:text-neutral-900">
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mt-10 md:mt-0">
                                <h3 className="text-sm font-semibold leading-6 text-neutral-900">Legal</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    {footerNavigation.legal.map((item) => (
                                        <li key={item.name}>
                                            <Link href={item.href} className="text-sm leading-6 text-neutral-600 hover:text-neutral-900">
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>
                                <h3 className="text-sm font-semibold leading-6 text-neutral-900">Help</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    {footerNavigation.help.map((item) => (
                                        <li key={item.name}>
                                            <Link href={item.href} className="text-sm leading-6 text-neutral-600 hover:text-neutral-900">
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                    <li className="text-sm leading-6 text-neutral-600">
                                        <p>+91 8735017365</p>
                                        <p>Mon-Sat (10AM-7PM)</p>
                                        <p>Sun (11AM-5PM)</p>
                                        <p>info@elyse.com</p>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="mt-10 xl:mt-0">
                        <h3 className="text-sm font-semibold leading-6 text-neutral-900">Subscribe to our newsletter</h3>
                        <p className="mt-2 text-sm leading-6 text-neutral-600">
                            The latest news, articles, and resources, sent to your inbox weekly.
                        </p>
                        <form className="mt-6 sm:flex sm:max-w-md">
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <input
                                type="email"
                                name="email-address"
                                id="email-address"
                                autoComplete="email"
                                required
                                className="w-full min-w-0 appearance-none border-0 bg-white px-3 py-1.5 text-base text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-300 placeholder:text-neutral-400 focus:ring-2 focus:ring-inset focus:ring-neutral-600 sm:w-64 sm:text-sm sm:leading-6"
                                placeholder="Enter your email"
                            />
                            <div className="mt-4 sm:ml-4 sm:mt-0 sm:flex-shrink-0">
                                <Button type="submit" variant="primary">Subscribe</Button>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="mt-16 border-t border-neutral-900/10 pt-8 sm:mt-20 lg:mt-24 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-xs leading-5 text-neutral-500">&copy; 2025 Elysè. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        {footerNavigation.social.map((item) => (
                            <Link key={item.name} href={item.href} className="text-neutral-400 hover:text-neutral-500">
                                <span className="sr-only">{item.name}</span>
                                <item.icon className="h-6 w-6" aria-hidden="true" />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
