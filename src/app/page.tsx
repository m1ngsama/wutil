import Link from 'next/link';

interface Tool {
  name: string;
  description: string;
  href: string;
  icon: string;
  status: 'active' | 'coming-soon';
}

const tools: Tool[] = [
  {
    name: 'Word Counter',
    description: 'Count words, characters, and sentences in real-time.',
    href: '/tools/word-counter',
    icon: '📝',
    status: 'active',
  },
  {
    name: 'JSON Formatter',
    description: 'Format, validate, and minify JSON data.',
    href: '/tools/json-formatter',
    icon: '{}",',
    status: 'active',
  },
  {
    name: 'Base64 Converter',
    description: 'Encode and decode Base64 strings instantly.',
    href: '/tools/base64-converter',
    icon: '🔤',
    status: 'active',
  },
  {
    name: 'Unit Converter',
    description: 'Convert between common units of measurement.',
    href: '/tools/unit-converter',
    icon: '⚖️',
    status: 'active',
  },
];

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
          Lightweight Web Tools
        </h1>
        <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500 dark:text-gray-400">
          Fast, private, and free tools running entirely in your browser.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link
            key={tool.name}
            href={tool.status === 'active' ? tool.href : '#'}
            className={`block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow ${
              tool.status === 'coming-soon' ? 'opacity-60 cursor-not-allowed' : 'hover:border-blue-500 dark:hover:border-blue-400'
            }`}
          >
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-3">{tool.icon}</span>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{tool.name}</h3>
              {tool.status === 'coming-soon' && (
                <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  Soon
                </span>
              )}
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {tool.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}