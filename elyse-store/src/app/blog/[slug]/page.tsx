import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { CalendarIcon, UserIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

async function getPostBySlug(slug: string) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const { data: sample } = await supabase.from('blog_posts').select('*').limit(1).maybeSingle();
        const availableColumns = sample ? Object.keys(sample) : [];

        let query = supabase.from('blog_posts').select('*').eq('slug', slug);

        // Resilience: Handle different publishing columns
        if (availableColumns.includes('is_published')) {
            query = query.eq('is_published', true);
        } else if (availableColumns.includes('status')) {
            query = query.eq('status', 'published');
        }

        const { data: post, error } = await query.single();

        if (error || !post) return null;

        return {
            id: post.id,
            slug: post.slug,
            title: post.title,
            content: post.content,
            image: post.featured_image || post.image_url || post.featured_image_url,
            date: new Date(post.published_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            publishedAt: post.published_at,
            metaTitle: post.meta_title,
            metaDescription: post.meta_description,
            author: post.author_name || 'Elyse Team'
        };
    } catch (error) {
        console.error('Failed to fetch blog post:', error);
        return null;
    }
}

export async function generateMetadata({ params: rawParams }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const params = await rawParams;
    const post = await getPostBySlug(params.slug);
    if (!post) return { title: 'Post Not Found' };

    const siteName = 'Elysè';
    const title = post.metaTitle || post.title;
    const description = post.metaDescription || post.content.substring(0, 160).replace(/[#*`]/g, '');

    return {
        title: `${title} | ${siteName}`,
        description: description,
        openGraph: {
            title: title,
            description: description,
            images: post.image ? [{ url: post.image, width: 1200, height: 630, alt: title }] : [],
            type: 'article',
            publishedTime: post.publishedAt,
            authors: [post.author],
            siteName: siteName,
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description,
            images: post.image ? [post.image] : [],
        },
        alternates: {
            canonical: `/blog/${post.slug}`,
        }
    };
}

export default async function BlogPostPage({ params: rawParams }: { params: Promise<{ slug: string }> }) {
    const params = await rawParams;
    const post = await getPostBySlug(params.slug);

    if (!post) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        image: post.image,
        datePublished: post.publishedAt,
        author: {
            '@type': 'Organization',
            name: post.author,
        },
        publisher: {
            '@type': 'Organization',
            name: 'Elysè',
            logo: {
                '@type': 'ImageObject',
                url: 'https://elyse.in/logo.png', // Replace with real logo URL
            },
        },
        description: post.metaDescription || post.content.substring(0, 160).replace(/[#*`]/g, ''),
    };

    return (
        <article className="bg-white min-h-screen">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Hero Section */}
            <div className="relative h-[50vh] min-h-[400px] w-full bg-neutral-900">
                {post.image ? (
                    <>
                        <img
                            src={post.image}
                            alt={post.title}
                            className="absolute inset-0 h-full w-full object-cover opacity-60"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent" />
                    </>
                ) : (
                    <div className="absolute inset-0 bg-neutral-100" />
                )}

                <div className="absolute inset-0 flex items-end pb-12 sm:pb-20">
                    <div className="container-premium mx-auto px-6 lg:px-8">
                        <Link
                            href="/blog"
                            className="inline-flex items-center text-sm font-medium text-white/80 hover:text-white transition-colors mb-8"
                        >
                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                            Back to Good Reads
                        </Link>
                        <div className="max-w-3xl">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white leading-[1.1]">
                                {post.title}
                            </h1>
                            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-white/70">
                                <div className="flex items-center">
                                    <CalendarIcon className="h-4 w-4 mr-2" />
                                    {post.date}
                                </div>
                                <div className="flex items-center">
                                    <UserIcon className="h-4 w-4 mr-2" />
                                    By {post.author}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-premium mx-auto px-6 lg:px-8 py-16 sm:py-24">
                <div className="max-w-3xl mx-auto">
                    <div className="prose prose-neutral lg:prose-xl prose-img:rounded-2xl prose-a:text-neutral-900 prose-headings:font-serif prose-headings:font-bold">
                        <ReactMarkdown>{post.content}</ReactMarkdown>
                    </div>

                    <div className="mt-20 pt-10 border-t border-neutral-100 flex items-center justify-between">
                        <div className="flex gap-4">
                            {/* Social Share Buttons Placeholder */}
                            <button className="text-xs uppercase tracking-widest font-bold text-neutral-400 hover:text-neutral-900 transition-colors">Share</button>
                            <button className="text-xs uppercase tracking-widest font-bold text-neutral-400 hover:text-neutral-900 transition-colors">Pinterest</button>
                        </div>
                        <Link href="/blog" className="text-sm font-bold text-neutral-900 hover:tracking-widest transition-all duration-300">
                            READ MORE →
                        </Link>
                    </div>
                </div>
            </div>
        </article>
    );
}
