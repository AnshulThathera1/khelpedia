import React from 'react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-black text-white p-8 md:p-24 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-black text-red-500 uppercase tracking-tighter">Terms of Service</h1>
        <p className="text-gray-400">Last Updated: May 17, 2026</p>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold border-b border-zinc-800 pb-2">1. Acceptance of Terms</h2>
          <p className="text-gray-300 leading-relaxed">
            By accessing or using KhelPediA, you agree to be bound by these Terms of Service and all applicable laws and regulations.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold border-b border-zinc-800 pb-2">2. Riot Games Compliance & Opt-in Policy</h2>
          <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-xl space-y-4">
            <p className="text-red-400 font-semibold">Important Notice for Valorant Players:</p>
            <p className="text-gray-300 leading-relaxed">
              KhelPediA uses the Riot Games API. In compliance with Riot Games' policies, we implement an <strong>"Opt-in"</strong> policy for player data.
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Detailed statistics and match history are only displayed for players who have explicitly opted-in by signing in via Riot Sign On (RSO).</li>
              <li>If you have not signed up for KhelPediA via RSO, your detailed information will not be made available to other players or users of this application.</li>
              <li>By signing in with your Riot Account, you authorize KhelPediA to store and display your gameplay data in accordance with these terms.</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold border-b border-zinc-800 pb-2">3. Use of Data</h2>
          <p className="text-gray-300 leading-relaxed">
            We use the data provided by the Riot Games API to provide you with insights, statistics, and match history analysis. We do not sell your personal gaming data to third parties.
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
