import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black text-white p-8 md:p-24 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-black text-blue-500 uppercase tracking-tighter">Privacy Policy</h1>
        <p className="text-gray-400">Last Updated: May 17, 2026</p>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold border-b border-zinc-800 pb-2">1. Data Collection</h2>
          <p className="text-gray-300 leading-relaxed">
            When you use KhelPediA, specifically our Valorant Tracker, we collect certain information provided by the Riot Games API, including your PUUID, Game Name, Tagline, and gameplay statistics.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold border-b border-zinc-800 pb-2">2. Riot Sign On (RSO) & Opt-in</h2>
          <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-4">
            <p className="text-blue-400 font-semibold">Player Privacy & Consent:</p>
            <p className="text-gray-300 leading-relaxed">
              We respect your privacy and Riot's "Opt-in" requirements. We only store and display detailed statistics for players who have:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Logged in via the official Riot Sign On (RSO) portal.</li>
              <li>Explicitly consented to their stats being trackable on KhelPediA.</li>
            </ul>
            <p className="text-gray-300">
              You can revoke this consent at any time by contacting us or disconnecting your Riot account.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold border-b border-zinc-800 pb-2">3. Data Retention</h2>
          <p className="text-gray-300 leading-relaxed">
            We cache match history and account data to improve performance and reduce API load. This data is updated periodically and can be removed upon request.
          </p>
        </section>

        <section className="space-y-4 border-t border-zinc-800 pt-8 mt-12">
          <p className="text-sm text-gray-500 italic">
            KhelPediA isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.
          </p>
        </section>
      </div>
    </div>
  );
}
