import { Article, Event } from './types';
import matter from 'gray-matter';
import { Buffer } from 'buffer';

// Polyfill Buffer for gray-matter in the browser environment
if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = Buffer;
}

// Import all markdown files from the articles directory recursively
const articleFiles = (import.meta as any).glob('./articles/**/*.md', { query: '?raw', eager: true });
const eventFiles = (import.meta as any).glob('./evenements/**/*.md', { query: '?raw', eager: true });

export const MOCK_ARTICLES: Article[] = Object.entries(articleFiles).map(([path, content], index) => {
  try {
    const { data, content: body } = matter((content as any).default || content);
    const slug = path.split('/').pop()?.replace('.md', '') || `article-${index}`;
    
    return {
      id: String(index + 1),
      slug,
      title: data.title || 'Sans titre',
      date: data.date || new Date().toISOString(),
      category: data.category || 'Afrique',
      image: data.image || undefined,
      video: data.video || undefined,
      author: data.author || 'Rédaction',
      authorRole: data.authorRole || 'Journaliste',
      excerpt: data.excerpt || '',
      content: body || '',
      readingTime: data.readingTime || '2 min',
      views: data.views || 0,
      likes: data.likes || 0,
      commentsCount: data.commentsCount || 0,
      tags: Array.isArray(data.tags) ? data.tags : (data.tags ? String(data.tags).split(',').map(t => t.trim()) : []),
      status: data.status || 'published',
      scheduledAt: data.scheduledAt || '',
      audioUrl: data.audioUrl || '',
      gallery: data.gallery || [],
      source: data.source || '',
      imageCredit: data.imageCredit || '',
    } as Article;
  } catch (error) {
    console.error(`Error parsing article at ${path}:`, error);
    return null;
  }
}).filter((a): a is Article => a !== null).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export const MOCK_EVENTS: Event[] = Object.entries(eventFiles).map(([path, content], index) => {
  try {
    const { data, content: body } = matter((content as any).default || content);
    const slug = path.split('/').pop()?.replace('.md', '') || `event-${index}`;
    
    return {
      id: String(index + 1),
      slug,
      title: data.title || 'Sans titre',
      date: data.date || new Date().toISOString(),
      location: data.location || 'Lieu à préciser',
      category: data.category || 'Événement',
      image: data.image || undefined,
      video: data.video || undefined,
      excerpt: data.excerpt || '',
      content: body || '',
      status: data.status || 'published',
      scheduledAt: data.scheduledAt || '',
      gallery: data.gallery || [],
      imageCredit: data.imageCredit || '',
    } as Event;
  } catch (error) {
    console.error(`Error parsing event at ${path}:`, error);
    return null;
  }
}).filter((e): e is Event => e !== null).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
