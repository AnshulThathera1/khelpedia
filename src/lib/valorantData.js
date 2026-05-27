// ============================================================
// KhelPediA — Static Valorant Game Data
// Agents, Maps, Transfers (rarely changes, no DB needed)
// ============================================================

const CDN = "https://media.valorant-api.com";

export const AGENT_ROLES = ["Controller", "Duelist", "Initiator", "Sentinel"];

export const AGENTS = [
  // Controllers
  { name: "Astra", slug: "astra", role: "Controller", origin: "Ghana", icon: `${CDN}/agents/41fb69c1-4189-7b37-f117-bcaf1e96f1bf/displayicon.png`, portrait: `${CDN}/agents/41fb69c1-4189-7b37-f117-bcaf1e96f1bf/fullportrait.png`, abilities: ["Gravity Well","Nova Pulse","Nebula","Astral Form / Cosmic Divide"] },
  { name: "Brimstone", slug: "brimstone", role: "Controller", origin: "USA", icon: `${CDN}/agents/9f0d8ba9-4140-b941-57d3-a7ad57c6b417/displayicon.png`, portrait: `${CDN}/agents/9f0d8ba9-4140-b941-57d3-a7ad57c6b417/fullportrait.png`, abilities: ["Stim Beacon","Incendiary","Sky Smoke","Orbital Strike"] },
  { name: "Clove", slug: "clove", role: "Controller", origin: "Scotland", icon: `${CDN}/agents/1dbf2edd-4729-0984-3115-daa5eed44993/displayicon.png`, portrait: `${CDN}/agents/1dbf2edd-4729-0984-3115-daa5eed44993/fullportrait.png`, abilities: ["Pick-Me-Up","Meddle","Ruse","Not Dead Yet"] },
  { name: "Harbor", slug: "harbor", role: "Controller", origin: "India", icon: `${CDN}/agents/95b78ed7-4637-86d9-7e41-71ba8c293152/displayicon.png`, portrait: `${CDN}/agents/95b78ed7-4637-86d9-7e41-71ba8c293152/fullportrait.png`, abilities: ["Cascade","Cove","High Tide","Reckoning"] },
  { name: "Omen", slug: "omen", role: "Controller", origin: "Unknown", icon: `${CDN}/agents/8e253930-4c05-31dd-1b6c-968525494517/displayicon.png`, portrait: `${CDN}/agents/8e253930-4c05-31dd-1b6c-968525494517/fullportrait.png`, abilities: ["Shrouded Step","Paranoia","Dark Cover","From the Shadows"] },
  { name: "Viper", slug: "viper", role: "Controller", origin: "USA", icon: `${CDN}/agents/707eab51-4836-f488-046a-cda6bf494859/displayicon.png`, portrait: `${CDN}/agents/707eab51-4836-f488-046a-cda6bf494859/fullportrait.png`, abilities: ["Snake Bite","Poison Cloud","Toxic Screen","Viper's Pit"] },
  // Duelists
  { name: "Iso", slug: "iso", role: "Duelist", origin: "China", icon: `${CDN}/agents/0e38b510-41a8-5780-5e8f-568b2a4f2d6c/displayicon.png`, portrait: `${CDN}/agents/0e38b510-41a8-5780-5e8f-568b2a4f2d6c/fullportrait.png`, abilities: ["Undercut","Double Tap","Contingency","Kill Contract"] },
  { name: "Jett", slug: "jett", role: "Duelist", origin: "South Korea", icon: `${CDN}/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/displayicon.png`, portrait: `${CDN}/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/fullportrait.png`, abilities: ["Cloudburst","Updraft","Tailwind","Blade Storm"] },
  { name: "Neon", slug: "neon", role: "Duelist", origin: "Philippines", icon: `${CDN}/agents/bb2a4828-46eb-8cd1-e765-15848195d751/displayicon.png`, portrait: `${CDN}/agents/bb2a4828-46eb-8cd1-e765-15848195d751/fullportrait.png`, abilities: ["Fast Lane","Relay Bolt","High Gear","Overdrive"] },
  { name: "Phoenix", slug: "phoenix", role: "Duelist", origin: "UK", icon: `${CDN}/agents/eb93336a-449b-9c1b-0a54-a891f7921d69/displayicon.png`, portrait: `${CDN}/agents/eb93336a-449b-9c1b-0a54-a891f7921d69/fullportrait.png`, abilities: ["Blaze","Curveball","Hot Hands","Run it Back"] },
  { name: "Raze", slug: "raze", role: "Duelist", origin: "Brazil", icon: `${CDN}/agents/f94c3b30-42be-e959-889c-5aa313dba261/displayicon.png`, portrait: `${CDN}/agents/f94c3b30-42be-e959-889c-5aa313dba261/fullportrait.png`, abilities: ["Boom Bot","Blast Pack","Paint Shells","Showstopper"] },
  { name: "Reyna", slug: "reyna", role: "Duelist", origin: "Mexico", icon: `${CDN}/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc/displayicon.png`, portrait: `${CDN}/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc/fullportrait.png`, abilities: ["Leer","Devour","Dismiss","Empress"] },
  { name: "Yoru", slug: "yoru", role: "Duelist", origin: "Japan", icon: `${CDN}/agents/7f94d92c-4234-0a36-9646-3a87eb8b5c89/displayicon.png`, portrait: `${CDN}/agents/7f94d92c-4234-0a36-9646-3a87eb8b5c89/fullportrait.png`, abilities: ["Fakeout","Blindside","Gatecrash","Dimensional Drift"] },
  // Initiators
  { name: "Breach", slug: "breach", role: "Initiator", origin: "Sweden", icon: `${CDN}/agents/5f8d3a7f-467b-97f3-062c-13acf203c006/displayicon.png`, portrait: `${CDN}/agents/5f8d3a7f-467b-97f3-062c-13acf203c006/fullportrait.png`, abilities: ["Aftershock","Flashpoint","Fault Line","Rolling Thunder"] },
  { name: "Fade", slug: "fade", role: "Initiator", origin: "Turkey", icon: `${CDN}/agents/dade69b4-4f5a-8528-247b-219e5a1facd6/displayicon.png`, portrait: `${CDN}/agents/dade69b4-4f5a-8528-247b-219e5a1facd6/fullportrait.png`, abilities: ["Prowler","Seize","Haunt","Nightfall"] },
  { name: "Gekko", slug: "gekko", role: "Initiator", origin: "USA", icon: `${CDN}/agents/e370fa57-4757-3604-3648-499e1f642d3f/displayicon.png`, portrait: `${CDN}/agents/e370fa57-4757-3604-3648-499e1f642d3f/fullportrait.png`, abilities: ["Mosh Pit","Wingman","Dizzy","Thrash"] },
  { name: "KAY/O", slug: "kayo", role: "Initiator", origin: "Unknown", icon: `${CDN}/agents/601dbbe7-43ce-be57-2a40-4abd24953621/displayicon.png`, portrait: `${CDN}/agents/601dbbe7-43ce-be57-2a40-4abd24953621/fullportrait.png`, abilities: ["FRAG/ment","FLASH/drive","ZERO/point","NULL/cmd"] },
  { name: "Skye", slug: "skye", role: "Initiator", origin: "Australia", icon: `${CDN}/agents/6f2a04ca-43e0-be17-7f36-b3908627744d/displayicon.png`, portrait: `${CDN}/agents/6f2a04ca-43e0-be17-7f36-b3908627744d/fullportrait.png`, abilities: ["Regrowth","Trailblazer","Guiding Light","Seekers"] },
  { name: "Sova", slug: "sova", role: "Initiator", origin: "Russia", icon: `${CDN}/agents/320b2a48-4d9b-a075-30f1-1f93a9b638fa/displayicon.png`, portrait: `${CDN}/agents/320b2a48-4d9b-a075-30f1-1f93a9b638fa/fullportrait.png`, abilities: ["Owl Drone","Shock Bolt","Recon Bolt","Hunter's Fury"] },
  { name: "Tejo", slug: "tejo", role: "Initiator", origin: "Colombia", icon: `${CDN}/agents/41fb69c1-4189-7b37-f117-bcaf1e96f1bf/displayicon.png`, portrait: `${CDN}/agents/41fb69c1-4189-7b37-f117-bcaf1e96f1bf/fullportrait.png`, abilities: ["Stealth Drone","Guided Salvo","Special Delivery","Armageddon"] },
  // Sentinels
  { name: "Chamber", slug: "chamber", role: "Sentinel", origin: "France", icon: `${CDN}/agents/22697a3d-45bf-8dd7-4fec-84a9e28c69d7/displayicon.png`, portrait: `${CDN}/agents/22697a3d-45bf-8dd7-4fec-84a9e28c69d7/fullportrait.png`, abilities: ["Trademark","Headhunter","Rendezvous","Tour De Force"] },
  { name: "Cypher", slug: "cypher", role: "Sentinel", origin: "Morocco", icon: `${CDN}/agents/117ed9e3-49f3-6571-9f3-31b08b9d5917/displayicon.png`, portrait: `${CDN}/agents/117ed9e3-49f3-6571-9f3-31b08b9d5917/fullportrait.png`, abilities: ["Trapwire","Cyber Cage","Spycam","Neural Theft"] },
  { name: "Deadlock", slug: "deadlock", role: "Sentinel", origin: "Norway", icon: `${CDN}/agents/cc8b64c8-4b25-4ff9-6e7f-37b4da43d235/displayicon.png`, portrait: `${CDN}/agents/cc8b64c8-4b25-4ff9-6e7f-37b4da43d235/fullportrait.png`, abilities: ["GravNet","Sonic Sensor","Barrier Mesh","Annihilation"] },
  { name: "Killjoy", slug: "killjoy", role: "Sentinel", origin: "Germany", icon: `${CDN}/agents/1e58de9c-4950-5125-93e9-a0aee9f98746/displayicon.png`, portrait: `${CDN}/agents/1e58de9c-4950-5125-93e9-a0aee9f98746/fullportrait.png`, abilities: ["Nanoswarm","Alarmbot","Turret","Lockdown"] },
  { name: "Sage", slug: "sage", role: "Sentinel", origin: "China", icon: `${CDN}/agents/569fdd95-4d10-43ab-ca70-79becc718b46/displayicon.png`, portrait: `${CDN}/agents/569fdd95-4d10-43ab-ca70-79becc718b46/fullportrait.png`, abilities: ["Barrier Orb","Slow Orb","Healing Orb","Resurrection"] },
  { name: "Vyse", slug: "vyse", role: "Sentinel", origin: "Unknown", icon: `${CDN}/agents/569fdd95-4d10-43ab-ca70-79becc718b46/displayicon.png`, portrait: `${CDN}/agents/569fdd95-4d10-43ab-ca70-79becc718b46/fullportrait.png`, abilities: ["Shear","Arc Rose","Razorvine","Steel Garden"] },
];

export const MAPS = [
  { name: "Abyss", slug: "abyss", type: "Standard", sites: 2, active: true, image: `${CDN}/maps/ee613ee9-28b7-4beb-9666-08db13bb2244/splash.png`, coords: "Unknown" },
  { name: "Ascent", slug: "ascent", type: "Standard", sites: 2, active: true, image: `${CDN}/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/splash.png`, coords: "45°26'BF'N, 12°20'Q'E" },
  { name: "Bind", slug: "bind", type: "Standard", sites: 2, active: true, image: `${CDN}/maps/2c9d57ec-4431-9c5e-2571-c3b4cfbe209d/splash.png`, coords: "34°02'A'N, 6°51'Z'W" },
  { name: "Breeze", slug: "breeze", type: "Standard", sites: 2, active: false, image: `${CDN}/maps/2fb9a4fd-47b8-4e7d-a969-74b4046ebd53/splash.png`, coords: "Bermuda Triangle" },
  { name: "Fracture", slug: "fracture", type: "Standard", sites: 2, active: true, image: `${CDN}/maps/b529448b-4d60-346e-e89e-00a4c527a405/splash.png`, coords: "35°47'A'N, 106°N'W" },
  { name: "Haven", slug: "haven", type: "Standard", sites: 3, active: true, image: `${CDN}/maps/2bee0dc9-4ffe-519b-1cbd-7fbe763a6047/splash.png`, coords: "27°28'A'N, 89°38'WZ'E" },
  { name: "Icebox", slug: "icebox", type: "Standard", sites: 2, active: false, image: `${CDN}/maps/e2ad5c54-4114-a870-9b1a-5c87c8933d3f/splash.png`, coords: "76°44'A''N, 149°30'Z'E" },
  { name: "Lotus", slug: "lotus", type: "Standard", sites: 3, active: true, image: `${CDN}/maps/2fe4ed3a-450a-948b-6d6b-e89a78e68878/splash.png`, coords: "W. India" },
  { name: "Pearl", slug: "pearl", type: "Standard", sites: 2, active: false, image: `${CDN}/maps/fd267378-4d1d-484f-ff52-77821ed10dc2/splash.png`, coords: "Lisbon, Portugal" },
  { name: "Split", slug: "split", type: "Standard", sites: 2, active: true, image: `${CDN}/maps/d960549e-485c-e861-8d71-aa9d1aed12a2/splash.png`, coords: "35°41'CD'N, 139°41'WX'E" },
  { name: "Sunset", slug: "sunset", type: "Standard", sites: 2, active: false, image: `${CDN}/maps/92584fbe-486a-b1b2-9faa-39b0f486b498/splash.png`, coords: "Los Angeles, USA" },
  { name: "Corrode", slug: "corrode", type: "Standard", sites: 2, active: true, image: `${CDN}/maps/2bee0dc9-4ffe-519b-1cbd-7fbe763a6047/splash.png`, coords: "Unknown" },
  { name: "District", slug: "district", type: "TDM", sites: 0, active: false, image: `${CDN}/maps/2bee0dc9-4ffe-519b-1cbd-7fbe763a6047/splash.png`, coords: "Unknown" },
  { name: "Drift", slug: "drift", type: "TDM", sites: 0, active: false, image: `${CDN}/maps/2bee0dc9-4ffe-519b-1cbd-7fbe763a6047/splash.png`, coords: "Unknown" },
  { name: "Kasbah", slug: "kasbah", type: "TDM", sites: 0, active: false, image: `${CDN}/maps/2bee0dc9-4ffe-519b-1cbd-7fbe763a6047/splash.png`, coords: "Unknown" },
  { name: "Piazza", slug: "piazza", type: "TDM", sites: 0, active: false, image: `${CDN}/maps/2bee0dc9-4ffe-519b-1cbd-7fbe763a6047/splash.png`, coords: "Unknown" },
  { name: "Glitch", slug: "glitch", type: "TDM", sites: 0, active: false, image: `${CDN}/maps/2bee0dc9-4ffe-519b-1cbd-7fbe763a6047/splash.png`, coords: "Unknown" },
];

export const TRANSFERS = [
  { date: "2026-05-15", player: "TenZ", from: "Sentinels", to: null, type: "Benched", region: "NA" },
  { date: "2026-05-14", player: "aspas", from: "LOUD", to: "LOUD", type: "Extended", region: "SA" },
  { date: "2026-05-12", player: "Jinggg", from: "Paper Rex", to: "Paper Rex", type: "Extended", region: "APAC" },
  { date: "2026-05-10", player: "Demon1", from: null, to: "ENVY", type: "Joined", region: "NA" },
  { date: "2026-05-08", player: "ScreaM", from: null, to: "Team Heretics", type: "Joined", region: "EU" },
  { date: "2026-05-05", player: "yay", from: "Cloud9", to: null, type: "Released", region: "NA" },
  { date: "2026-05-03", player: "Chronicle", from: "Fnatic", to: "Team Vitality", type: "Transferred", region: "EU" },
  { date: "2026-04-28", player: "Suygetsu", from: "NAVI", to: "BBL Esports", type: "Transferred", region: "EU" },
  { date: "2026-04-25", player: "Less", from: "LOUD", to: null, type: "Benched", region: "SA" },
  { date: "2026-04-22", player: "BuZz", from: "DRX", to: "DRX", type: "Extended", region: "APAC" },
  { date: "2026-04-20", player: "SkRossi", from: "Global Esports", to: null, type: "Free Agent", region: "SA" },
  { date: "2026-04-18", player: "f0rsakeN", from: "Paper Rex", to: "Paper Rex", type: "Extended", region: "APAC" },
  { date: "2026-04-15", player: "Boaster", from: "Fnatic", to: null, type: "Retired", region: "EU" },
  { date: "2026-04-12", player: "crashies", from: null, to: "100 Thieves", type: "Joined", region: "NA" },
  { date: "2026-04-10", player: "Alfajer", from: "Fnatic", to: "Fnatic", type: "Extended", region: "EU" },
  { date: "2026-04-08", player: "s0m", from: "Sentinels", to: null, type: "Released", region: "NA" },
  { date: "2026-04-05", player: "Zekken", from: "Sentinels", to: "Cloud9", type: "Transferred", region: "NA" },
  { date: "2026-03-30", player: "Sacy", from: "Sentinels", to: null, type: "Retired", region: "SA" },
  { date: "2026-03-28", player: "MaKo", from: "DRX", to: "DRX", type: "Extended", region: "APAC" },
  { date: "2026-03-25", player: "d4v41", from: "Paper Rex", to: "Paper Rex", type: "Extended", region: "APAC" },
];

export const ROLE_COLORS = {
  Controller: { bg: "rgba(59, 130, 246, 0.15)", text: "#60a5fa", border: "rgba(59, 130, 246, 0.3)" },
  Duelist: { bg: "rgba(239, 68, 68, 0.15)", text: "#f87171", border: "rgba(239, 68, 68, 0.3)" },
  Initiator: { bg: "rgba(234, 179, 8, 0.15)", text: "#facc15", border: "rgba(234, 179, 8, 0.3)" },
  Sentinel: { bg: "rgba(34, 197, 94, 0.15)", text: "#4ade80", border: "rgba(34, 197, 94, 0.3)" },
};

export const TRANSFER_COLORS = {
  Joined: { bg: "rgba(34, 197, 94, 0.15)", text: "#4ade80" },
  Transferred: { bg: "rgba(59, 130, 246, 0.15)", text: "#60a5fa" },
  Extended: { bg: "rgba(168, 85, 247, 0.15)", text: "#c084fc" },
  Benched: { bg: "rgba(234, 179, 8, 0.15)", text: "#facc15" },
  Released: { bg: "rgba(239, 68, 68, 0.15)", text: "#f87171" },
  Retired: { bg: "rgba(107, 114, 128, 0.15)", text: "#9ca3af" },
  "Free Agent": { bg: "rgba(249, 115, 22, 0.15)", text: "#fb923c" },
};
