<header className="bg-gray-900 shadow-md">
  <div className="max-w-6xl mx-auto flex justify-between items-center p-6">
    <h1 className="text-2xl font-extrabold text-yellow-400">
      Silver Spine Studio
    </h1>
    <nav className="flex space-x-6">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`transition ${
            router.asPath === href
              ? "text-red-500 font-semibold"
              : "text-gray-200 hover:text-yellow-400"
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  </div>
</header>
