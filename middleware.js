import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl;
  const ua = request.headers.get('user-agent') || '';
  
  // Debug logging - se dessa i Vercel-loggarna
  console.log('Middleware User-Agent:', ua);
  console.log('Incoming path:', url.pathname);

  if (/\/artists\/[^\/]+$/.test(url.pathname) && 
      /facebookexternalhit|Twitterbot|Pinterest/i.test(ua)) {
    const artistId = url.pathname.split('/').pop();
    url.pathname = `/api/ssr/artists/${artistId}`;
    console.log('Rewriting to:', url.toString());
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}