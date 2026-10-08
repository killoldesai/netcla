/** A conceptual product interface; contains no client metrics or project claims. */
export function ServiceHeroArtwork({
  title,
  mobile,
}: {
  title: string;
  mobile: boolean;
}) {
  return (
    <figure
      className="service-art"
      aria-label={`Conceptual ${title} interface`}
    >
      <div className="service-art-orbit" aria-hidden="true" />
      <div className="service-art-board">
        <div className="service-art-bar">
          <span className="service-art-mark">N</span>
          <span>Product workspace</span>
          <span className="service-art-status">Concept</span>
        </div>
        <div className="service-art-body">
          <div className="service-art-rail" aria-hidden="true">
            <span>⌘</span>
            <span>▦</span>
            <span>◷</span>
            <span>↗</span>
          </div>
          <div className="service-art-content">
            <small>DESIGN · BUILD · RELEASE</small>
            <h3>
              Your product.
              <br />
              Connected.
            </h3>
            <div className="service-art-modules">
              <span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="m8 6-6 6 6 6m8-12 6 6-6 6M14 3l-4 18" />
                </svg>
                Application
              </span>
              <span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M8 3v6m8-6v6M5 9h14v4a7 7 0 0 1-14 0V9Zm7 11v3" />
                </svg>
                Integrations
              </span>
            </div>
            <div className="service-art-flow">
              <span>Interface</span>
              <b aria-hidden="true">→</b>
              <span>API</span>
              <b aria-hidden="true">→</b>
              <span>Cloud</span>
            </div>
          </div>
        </div>
      </div>
      <div className="service-art-device">
        <div className="service-art-camera" />
        <small>{mobile ? "MOBILE EXPERIENCE" : "PRODUCT PREVIEW"}</small>
        <div className="service-art-app-icon">
          <svg
            viewBox="0 0 40 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="m7 13 13-7 13 7-13 7-13-7Zm0 8 13 7 13-7M7 29l13 7 13-7" />
          </svg>
        </div>
        <strong>
          Built around
          <br />
          your users.
        </strong>
        <div className="service-art-mini">
          <i />
          <div>
            <span />
            <span />
          </div>
        </div>
        <div className="service-art-mini">
          <i />
          <div>
            <span />
            <span />
          </div>
        </div>
        <div className="service-art-app-button">
          Explore <span>↗</span>
        </div>
      </div>
    </figure>
  );
}
