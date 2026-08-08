export const DDRAGON_VERSION = '14.15.1';
export const DDRAGON_BASE = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}`;

export function getChampionIconUrl(championId, championsData) {
    const champion = Object.values(championsData).find(c => c.key == championId);
    if (!champion) return null;
    return `${DDRAGON_BASE}/img/champion/${champion.image.full}`;
}

export function getProfileIconUrl(iconId) {
    return `${DDRAGON_BASE}/img/profileicon/${iconId}.png`;
}
