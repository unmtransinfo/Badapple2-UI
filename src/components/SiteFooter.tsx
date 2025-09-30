export default function SiteFooter() {
  const assetRoot = import.meta.env.VITE_ASSET_ROOT;
  return (
    <footer className="text-center mt-4 mb-0">
      <h1>
        <a
          href="https://datascience.unm.edu/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src={`${assetRoot}/hsc_logo.png`}
            title="UNM School of Medicine, Dept. of Internal Medicine, Translational Informatics Division"
            className="inline-block h-20"
          />
        </a>
      </h1>
    </footer>
  );
}
