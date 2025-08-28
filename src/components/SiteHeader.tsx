import { Button } from "./common";

const SiteHeader = () => {
  return (
    <header className="text-center mt-0 mb-0">
      <h1>
        <img
          src="/badapple2/badapple_logo.svg"
          title="Badapple Logo"
          alt="Badapple Logo"
          className="inline-block w-36"
        />
      </h1>
      <div className="flex flex-col items-center mt-2 mb-2">
        <Button
          onClick={() => window.open("/badapple2/about.html", "_blank")}
          variant="secondary"
          size="sm"
        >
          About
        </Button>
      </div>
    </header>
  );
};

export default SiteHeader;
