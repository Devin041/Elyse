import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { BlogCard } from '@/components/cards/BlogCard';

async function getBlogPosts() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const { data: sample } = await supabase.from('blog_posts').select('*').limit(1).maybeSingle();
        const availableColumns = sample ? Object.keys(sample) : [];

        let query = supabase.from('blog_posts').select('*');

        if (availableColumns.includes('is_published')) {
            query = query.eq('is_published', true);
        } else if (availableColumns.includes('status')) {
            query = query.eq('status', 'published');
        }

        const { data, error } = await query
            .order('published_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((post: any) => ({
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt,
            author: post.author_name || 'Elyse Team',
            date: new Date(post.published_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }),
            image: post.featured_image || post.image_url || 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1000&auto=format&fit=crop',
        }));
    } catch (error) {
        console.error('Failed to fetch blog posts:', error);
        return [];
    }
}

export default async function BlogIndexPage() {
    const posts = await getBlogPosts();

    return (
        <div className="bg-white py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-serif font-bold tracking-tight text-neutral-900 sm:text-4xl">Good Reads</h2>
                    <p className="mt-2 text-lg leading-8 text-neutral-600">
                        Fashion tips, style guides, and behind the scenes at Elysè.
                    </p>
                </div>
                <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                    {posts.length === 0 ? (
                        <div className="lg:col-span-3 text-center py-12 border border-dashed rounded-2xl text-neutral-500 font-serif">
                            No blog stories to read yet. Explore our collections in the meantime.
                        </div>
                    ) : posts.map((post, index) => (
                        <BlogCard
                            key={post.slug}
                            id={post.slug}
                            slug={post.slug}
                            title={post.title}
                            image={post.image}
                            date={post.date}
                            author={post.author}
                            index={index}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
