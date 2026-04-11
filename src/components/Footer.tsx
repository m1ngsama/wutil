export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 mt-auto">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start space-x-6 md:order-2">
            <a href="https://github.com/m1ngsama/wutil" target="_blank" rel="noreferrer" className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              GitHub
            </a>
            <a href="https://github.com/m1ngsama/wutil#privacy" target="_blank" rel="noreferrer" className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              Privacy
            </a>
          </div>
          <div className="mt-6 md:mt-0 md:order-1">
            <p className="text-center text-sm text-gray-400">
              &copy; {new Date().getFullYear()} wutil &mdash; Fast, private web tools. Built with Next.js &amp; Tailwind.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
