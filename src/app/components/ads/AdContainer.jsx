import AdsterraBanner from "./AdsterraBanner";
import AdsterraNative from "./AdsterraNative";
import AdsterraSocialBar from "./AdsterraSocialBar";

export default function AdContainer({ type = "banner", placement = "content" }) {
  const isAdsEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED === "true";
  const provider = process.env.NEXT_PUBLIC_AD_PROVIDER || "adsterra";

  if (!isAdsEnabled) {
    return null;
  }

  if (provider === "adsterra") {
    const key320 = process.env.NEXT_PUBLIC_ADSTERRA_BANNER_320X50_KEY || "4f4ab1bbe05068164ef41d1096876079";
    const key728 = process.env.NEXT_PUBLIC_ADSTERRA_BANNER_728X90_KEY || "5f86b8ba897a34d202901f2a1670db55";
    const key300 = process.env.NEXT_PUBLIC_ADSTERRA_BANNER_300X250_KEY || "cc7bdff7f055d2ba8a47a30cca4735e6";

    if (type === "banner") {
      // Responsive Leaderboard: 728x90 on desktop, 320x50 on mobile
      return (
        <div style={{ display: "flex", justifyContent: "center", width: "100%", overflow: "hidden" }}>
          <div className="hidden md:block">
            <AdsterraBanner zoneKey={key728} width={728} height={90} />
          </div>
          <div className="block md:hidden">
            <AdsterraBanner zoneKey={key320} width={320} height={50} />
          </div>
        </div>
      );
    }

    if (type === "banner_728x90") {
      return <AdsterraBanner zoneKey={key728} width={728} height={90} />;
    }

    if (type === "banner_320x50") {
      return <AdsterraBanner zoneKey={key320} width={320} height={50} />;
    }

    if (type === "banner_300x250") {
      return <AdsterraBanner zoneKey={key300} width={300} height={250} />;
    }

    if (type === "native") {
      const nativeSrc = process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_SRC || "https://pl31576901.profitablecreativeformat.com/f6a1d6b7a29abf9d3dc957e3de20a8da/invoke.js";
      const nativeContainer = process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_CONTAINER || "container-f6a1d6b7a29abf9d3dc957e3de20a8da";
      return <AdsterraNative scriptSrc={nativeSrc} containerId={nativeContainer} />;
    }

    if (type === "socialbar") {
      const socialSrc = process.env.NEXT_PUBLIC_ADSTERRA_SOCIALBAR_SRC || "https://pl31576900.profitableratecpmnetwork.com/fb/a6/fd/fba6fd5b304561dbcb1a5a3013ef09ea.js";
      return <AdsterraSocialBar scriptSrc={socialSrc} />;
    }
  }

  return null;
}
