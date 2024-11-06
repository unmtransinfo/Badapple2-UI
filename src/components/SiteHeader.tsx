export default function SiteHeader() {
    return (
        <header className="text-center mt-0 mb-0">
            <h1>
                <img src="/badapple2/badapple_logo.svg" title="Badapple Logo" alt="Badapple Logo" className="inline-block w-36" />
            </h1>
            <button 
                onClick={() => window.open('/badapple2/about.html', '_blank')} 
                className="mt-2 mb-0 px-2 py-1 bg-gray-50 text-black rounded hover:bg-gray-500 text-sm"
            >
                About
            </button>
        </header>
    )
}
