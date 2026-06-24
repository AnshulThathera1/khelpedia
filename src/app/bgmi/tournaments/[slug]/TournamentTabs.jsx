"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function TournamentTabs({ tournament, teams, standings, schedule }) {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "teams", label: "Teams" },
    { id: "standings", label: "Standings" },
    { id: "schedule", label: "Schedule" }
  ];

  return (
    <div className="mt-8">
      {/* Tabs Navigation */}
      <div className="flex border-b border-[var(--border-color)] mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
              activeTab === tab.id 
                ? "text-[#F1B11D] border-b-2 border-[#F1B11D]" 
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tabs Content */}
      <div className="min-h-[400px]">
        {activeTab === "overview" && <OverviewTab tournament={tournament} />}
        {activeTab === "teams" && <TeamsTab teams={teams} />}
        {activeTab === "standings" && <StandingsTab standings={standings} />}
        {activeTab === "schedule" && <ScheduleTab schedule={schedule} />}
      </div>
    </div>
  );
}

function OverviewTab({ tournament }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-[var(--bg-card)] p-6 rounded-lg border border-[var(--border-color)]">
        <h3 className="text-[#F1B11D] font-bold text-xl mb-4">Tournament Info</h3>
        <ul className="space-y-3 text-[var(--text-secondary)]">
          <li><span className="font-semibold text-[var(--text-primary)]">Organizer:</span> {tournament.organizer || 'N/A'}</li>
          <li><span className="font-semibold text-[var(--text-primary)]">Sponsor:</span> {tournament.sponsor || 'N/A'}</li>
          <li><span className="font-semibold text-[var(--text-primary)]">Location:</span> {tournament.location || 'N/A'} {tournament.venue ? `(${tournament.venue})` : ''}</li>
          <li><span className="font-semibold text-[var(--text-primary)]">Prize Pool:</span> {tournament.prize_pool || 'N/A'}</li>
        </ul>
      </div>
      
      <div className="bg-[var(--bg-card)] p-6 rounded-lg border border-[var(--border-color)]">
        <h3 className="text-[#F1B11D] font-bold text-xl mb-4">Podium</h3>
        <ul className="space-y-3 text-[var(--text-secondary)]">
          <li className="flex items-center gap-2"><span className="text-yellow-400 font-bold text-xl">1st</span> <span className="text-[var(--text-primary)] font-semibold">{tournament.winner || 'TBD'}</span></li>
          <li className="flex items-center gap-2"><span className="text-[var(--text-secondary)] font-bold text-xl">2nd</span> <span className="text-[var(--text-primary)] font-semibold">{tournament.runner_up || 'TBD'}</span></li>
        </ul>
      </div>
    </div>
  );
}

function TeamsTab({ teams }) {
  if (!teams || teams.length === 0) return <p className="text-[var(--text-secondary)]">No teams data available.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {teams.map((team, idx) => (
        <div key={idx} className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--border-color)] hover:border-[#F1B11D] transition-colors">
          <div className="flex items-center gap-3 mb-3">
            {team.image ? (
              <img src={`https://esportsamaze.in/Special:FilePath/${team.image}`} alt={team.team} className="w-10 h-10 object-contain bg-[var(--bg-secondary)] rounded" />
            ) : (
              <div className="w-10 h-10 bg-[var(--bg-secondary)] rounded flex items-center justify-center text-xs font-bold text-[var(--text-muted)]">TBD</div>
            )}
            <h4 className="font-bold text-[var(--text-primary)] text-lg truncate" title={team.team}>{team.display_name || team.team}</h4>
          </div>
          <div className="text-sm text-[var(--text-secondary)]">
            {team.p1 && <div><span className="text-[var(--text-muted)]">P1:</span> {team.p1}</div>}
            {team.p2 && <div><span className="text-[var(--text-muted)]">P2:</span> {team.p2}</div>}
            {team.p3 && <div><span className="text-[var(--text-muted)]">P3:</span> {team.p3}</div>}
            {team.p4 && <div><span className="text-[var(--text-muted)]">P4:</span> {team.p4}</div>}
            {team.p5 && <div><span className="text-[var(--text-muted)]">P5:</span> {team.p5}</div>}
            {team.p6 && <div><span className="text-[var(--text-muted)]">P6:</span> {team.p6}</div>}
            {team.coach && <div className="mt-2 text-blue-400"><span className="text-[var(--text-muted)]">C:</span> {team.coach}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function StandingsTab({ standings }) {
  if (!standings || standings.length === 0) return <p className="text-[var(--text-secondary)]">No standings available yet.</p>;

  // Group by stage
  const stages = {};
  standings.forEach(row => {
    const stage = row.stage || "Main Event";
    if (!stages[stage]) stages[stage] = [];
    stages[stage].push(row);
  });

  return (
    <div className="space-y-8">
      {Object.keys(stages).map(stage => (
        <div key={stage} className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)] overflow-hidden">
          <div className="bg-[var(--bg-secondary)] p-4 border-b border-[var(--border-color)]">
            <h3 className="text-[#F1B11D] font-bold text-xl">{stage}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--bg-card)] text-[var(--text-secondary)] border-b border-[var(--border-color)]">
                <tr>
                  <th className="p-4 font-semibold w-12 text-center">#</th>
                  <th className="p-4 font-semibold">Team</th>
                  <th className="p-4 font-semibold text-center">Matches</th>
                  <th className="p-4 font-semibold text-center">WWCD</th>
                  <th className="p-4 font-semibold text-center">Place Pts</th>
                  <th className="p-4 font-semibold text-center">Elim Pts</th>
                  <th className="p-4 font-bold text-[#F1B11D] text-center">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {stages[stage].map((row, idx) => (
                  <tr key={idx} className="hover:bg-[var(--bg-secondary)] transition-colors">
                    <td className="p-4 font-semibold text-[var(--text-muted)] text-center">{idx + 1}</td>
                    <td className="p-4 font-bold text-[var(--text-primary)]">{row.team}</td>
                    <td className="p-4 text-center text-[var(--text-secondary)]">{row.matchesplayed || '-'}</td>
                    <td className="p-4 text-center text-yellow-500 font-semibold">{row.wwcd || '0'}</td>
                    <td className="p-4 text-center text-[var(--text-secondary)]">{row.placepts || '0'}</td>
                    <td className="p-4 text-center text-[var(--text-secondary)]">{row.elimpts || '0'}</td>
                    <td className="p-4 text-center font-bold text-[#F1B11D] text-lg">{row.totalpts || '0'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

function ScheduleTab({ schedule }) {
  if (!schedule || schedule.length === 0) return <p className="text-[var(--text-secondary)]">No schedule available.</p>;

  return (
    <div className="space-y-6">
      {schedule.map((day, idx) => {
        let matches = [];
        try {
          if (day.day_data) {
            matches = JSON.parse(day.day_data);
          }
        } catch(e) {}

        return (
          <div key={idx} className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)] overflow-hidden">
            <div className="bg-[var(--bg-secondary)] p-4 border-b border-[var(--border-color)] flex flex-col md:flex-row md:justify-between md:items-center gap-2">
              <div>
                <h4 className="font-bold text-xl text-[var(--text-primary)]">{day.stage}</h4>
                <div className="text-[#F1B11D] text-sm font-semibold">{day.match_type}</div>
              </div>
              <div className="text-[var(--text-secondary)] font-mono bg-[var(--bg-card)] px-3 py-1 rounded border border-[var(--border-color)] text-sm">
                {day.date || 'TBA'}
              </div>
            </div>
            
            <div className="p-4">
              {matches.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {matches.map((m, mIdx) => (
                    <div key={mIdx} className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--border-color)] hover:border-[#F1B11D] transition-colors group">
                      <div className="text-xs font-bold text-[var(--text-muted)] mb-2 uppercase tracking-wider group-hover:text-[var(--text-secondary)]">Match {mIdx + 1}</div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[var(--text-primary)] font-semibold text-lg">{m.map || 'TBA'}</span>
                        {m.group && <span className="text-sm text-[#F1B11D]">{m.group}</span>}
                        {m.time && <span className="text-xs text-[var(--text-muted)] mt-1">{new Date(m.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--text-muted)] italic">No match details available for this day.</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
