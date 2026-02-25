-- Update broken game icons
UPDATE games SET icon_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Valorant_logo_-_pink_color_version.svg/1024px-Valorant_logo_-_pink_color_version.svg.png' WHERE slug = 'valorant';
UPDATE games SET icon_url = 'https://static.wikia.nocookie.net/bgmi/images/3/36/BGMI_Logo.png' WHERE slug = 'bgmi';
UPDATE games SET icon_url = 'https://upload.wikimedia.org/wikipedia/en/thumb/3/30/Free_Fire_logo.svg/1200px-Free_Fire_logo.svg.png' WHERE slug = 'free-fire';
UPDATE games SET icon_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Dota_2_icon.svg/1200px-Dota_2_icon.svg.png' WHERE slug = 'dota-2';
UPDATE games SET icon_url = 'https://upload.wikimedia.org/wikipedia/en/thumb/2/27/PUBG_Mobile_logo.svg/1200px-PUBG_Mobile_logo.svg.png' WHERE slug = 'pubg-mobile';

-- Update some known broken team logos (Wikimedia hotlinking sometimes fails, so using alternative CDNs or reliable Wiki URLs)
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/thumb/f/fd/Team_Liquid_logo.svg/1200px-Team_Liquid_logo.svg.png' WHERE slug = 'team-liquid';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/thumb/4/43/Fnatic_Logo.svg/1200px-Fnatic_Logo.svg.png' WHERE slug = 'fnatic';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6c/Sentinels_logo.svg/1200px-Sentinels_logo.svg.png' WHERE slug = 'sentinels';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/LOUD_logo.svg/1200px-LOUD_logo.svg.png' WHERE slug = 'loud';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/thumb/a/ac/NaVi_logo.svg/1200px-NaVi_logo.svg.png' WHERE slug = 'navi';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/thumb/8/88/Cloud9_logo.svg/1200px-Cloud9_logo.svg.png' WHERE slug = 'cloud9';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5b/FaZe_Clan_logo.svg/1200px-FaZe_Clan_logo.svg.png' WHERE slug = 'faze-clan';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a0/Paper_Rex_logo.svg/1200px-Paper_Rex_logo.svg.png' WHERE slug = 'paper-rex';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7e/Team_Spirit_logo.svg/1200px-Team_Spirit_logo.svg.png' WHERE slug = 'team-spirit';
UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e8/OG_logo.svg/1200px-OG_logo.svg.png' WHERE slug = 'og';
