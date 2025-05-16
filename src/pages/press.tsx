import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Download } from 'lucide-react';

const PRESS_IMAGES = [
  {
    name: 'Logo Horizontal',
    url: `${process.env.PUBLIC_URL}/press/logo-horizontal.png`,
  },
  {
    name: 'Logo Vertical',
    url: `${process.env.PUBLIC_URL}/press/logo-vertical.png`,
  },
  {
    name: 'Event Banner',
    url: `${process.env.PUBLIC_URL}/press/event-banner.png`,
  },
];

const Press = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col">
      <main className="flex-grow px-4 py-24">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Press Kit
          </h1>
          <p className="mt-4 text-white/80 max-w-2xl mx-auto">
            Welcome to the AI Vision Contest press page. Here you'll find our official
            logos, banners, and other assets for your articles or features. Feel free
            to download and use these materials in accordance with our brand guidelines.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {PRESS_IMAGES.map((asset) => (
            <Card key={asset.name} className="bg-[#121212] border border-primary/20">
              <CardHeader>
                <CardTitle className="text-white text-xl">{asset.name}</CardTitle>
                <CardDescription className="text-white/60">
                  Click download to save the image.
                </CardDescription>
              </CardHeader>
              <div className="p-4 flex justify-center">
                <img
                  src={asset.url}
                  alt={asset.name}
                  className="max-h-40 object-contain rounded"
                />
              </div>
              <div className="px-4 pb-4 text-center">
                <a
                  href={asset.url}
                  download
                  className="inline-flex items-center px-4 py-2 bg-primary text-black rounded hover:opacity-90 transition"
                >
                  <Download className="w-5 h-5 mr-2" /> Download
                </a>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center text-white/60">
          <p>
            If you need additional assets or have any questions, please reach out to
            our media team at{' '}
            <a
              href="mailto:press@aivisioncontest.com"
              className="text-secondary hover:underline"
            >
              press@aivisioncontest.com
            </a>.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Press;
