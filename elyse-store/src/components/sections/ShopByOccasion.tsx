import Image from 'next/image';
import Link from 'next/link';

const occasions = [
    { name: 'MEHENDI', image: 'https://images.unsplash.com/photo-1610189012906-4783fdae2c26?q=80&w=1000&auto=format&fit=crop', link: '/collections/mehendi' },
    { name: 'COCKTAILS', image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1000&auto=format&fit=crop', link: '/collections/cocktails' },
    { name: 'SANGEET', image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1000&auto=format&fit=crop', link: '/collections/sangeet' },
    { name: 'WEDDING', image: 'https://images.unsplash.com/photo-1545959788-217725445215?q=80&w=1000&auto=format&fit=crop', link: '/collections/wedding' },
    { name: 'TROUSSEAU', image: 'https://images.unsplash.com/photo-1585988076790-442271884d4b?q=80&w=1000&auto=format&fit=crop', link: '/collections/trousseau' },
];

export function ShopByOccasion() {
    return (
        <section className="py-16 bg-white">
            <div className="container-custom">
                <h2 className="text-3xl font-serif font-bold text-center mb-10">Shop by Occasion</h2>
                <div className="flex overflow-x-auto gap-4 pb-4 sm:grid sm:grid-cols-5 sm:gap-4 sm:pb-0 no-scrollbar">
                    {occasions.map((occasion) => (
                        <Link
                            key={occasion.name}
                            href={occasion.link}
                            className="relative flex-shrink-0 w-60 sm:w-auto aspect-[3/4] group overflow-hidden"
                        >
                            <Image
                                src={occasion.image}
                                alt={occasion.name}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                sizes="(max-width: 768px) 240px, 20vw"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-white font-serif text-xl font-bold tracking-widest border-b-2 border-transparent group-hover:border-white transition-all pb-1">
                                    {occasion.name}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
