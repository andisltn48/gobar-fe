import { useState } from 'react';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import Spinner from '../../components/common/Spinner';

const defaultMockEntries = [
  {
    id: 'mock-1',
    user: { name: 'VELO_GOD', city: 'Jakarta', is_verified: true },
    distance_km: 14892,
    elevation_m: 180000,
  },
  {
    id: 'mock-2',
    user: { name: 'CRANK_ADDICT', city: 'Surabaya', is_verified: true },
    distance_km: 12450,
    elevation_m: 154000,
  },
  {
    id: 'mock-3',
    user: { name: 'SPIN_QUEEN', city: 'Bandung', is_verified: false },
    distance_km: 11204,
    elevation_m: 148000,
  },
  {
    id: 'mock-4',
    user: { name: 'CHAIN_SNAPPER', city: 'Medan', is_verified: false },
    distance_km: 10840,
    elevation_m: 142500,
  },
  {
    id: 'mock-5',
    user: { name: 'NIGHT_RIDER_99', city: 'Bekasi', is_verified: true },
    distance_km: 9950,
    elevation_m: 138200,
  },
  {
    id: 'mock-6',
    user: { name: 'GRAVEL_KING', city: 'Jogja', is_verified: false },
    distance_km: 8720,
    elevation_m: 120100,
  },
];

const mockPodiumAvatars = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDIxAoshxeBU09QAhH_-ofuVRraw_R7iJYBiVQtfBcTy8rEDSTwo0OrFU87xcTJP5K0NnQtyEim2H9kYvaLWy30HxXysDE_fgAoFmvVemEDD7flWYiAtGvbOwV42Le4hJnOIwGRxKlWcwXMTcNK-Oda5cJnGb6N4txXaW2GTxdsg1wznAJwCes2UxEAvP7by0E_mrTpyIO-BMTBy7kYmh9MyCZz8DOIw7Tb0VfzdP-6S6wpJtOipb0iDqm81Cw1HIqAcXNk3VypeaE5', // Rank 1
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB-YRDL4v65bYdbp6jMLOpUU0ogw5nqAE8Gpmi4s5cMRf6oGpAas5w97CbbaPmIwRkzqtwRoA95lKw6rwNHauWdJyfwHVsNuXAIe2dg54AO9AGU0Y8D-VzbO9bVwo9lg_w-JJs7TM-ucknPYs4HvoWAB4MipSEc_5HXm1VUCFcJenhjXeVAH6NRLfJaavJazPikeKTvOx6xuMma0aBHFzV3KoSpu69EvfwALLNyXUjI1i5KzxA4xqFnkd-yvu5dfIaf0r6ZIbEifX07', // Rank 2
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAWy1CBdKT7VR7g4rQ5EnF3qSXxDmJQqhHlNbM9WsrtYa6q_ukj1STVwSrLeKEnFuk4HaEPemQC14BdTMOp3xbayg3PuC9NcshpacKK4BxzkC4wh_JNcE2o5KyZnrfr8-XJE4MBuV1AW8wZ-l90V_D8FeOKdXJsrTbNZa6YmgJlmus4nuGwcXOjNKQyHMOzgPucL86xsoRQhcYFS7VcByjJnvgLWwc_-moLeOxerWyGJllrsQUG0IhgbFzi5BWnvVSlgtBbRn_aRCkh', // Rank 3
];

const mockTableAvatars = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAtOkteS8m7nlOnmOMXYocM_Gy8ftndWq8T4u3ymAgGo337EzwqfPM7tZNv7J5nyPh9i-QX-uYB3KaP1f9-fcVtFdB__19N-xPIGAavDTtIsw5PpGdOYs1M0mE8dAtb_Fg-571alLuM6-8fUjDDTpTnJRdvTQfvAWVoMK2lf4raddsO9kvEpnHnsIrJiDEjeK6IVoPVhnDkDM87wAmZeAWQ1bXQVGR76VdWmxkl_skp56DM5uf7d-PmfUOeH6MWDf5I5dDxfcMeED7F',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCA2YscdFzeRqgmvVnMOUwpz-VcsGLFUZNoT8RRpy3HrJ06pvB9jFpQesHkI8s41C9sZxAY0h3d9e4RqbrrAF154Rjx9Q9vG3m3KGNiBtnjyZ-Ca_yJvd468yop-NXbvYdDwYeqU0IOqrxx9wfcr8eWAFU3udIwTDTfgl1NkCbsJyqVK9Dfc4VeUVAI5haQyPOiT7zU0nAMs7iJ9WmojdQ-oHitzZV19CAdxdK41qtVtRCbBh6uFP7JAtDz3Nrpin5DfsKb-MMnqkso',
];

export default function Leaderboard() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [sortKey, setSortKey] = useState('distance'); // 'distance' or 'elevation'
  const { entries, loading, error } = useLeaderboard(month, year);

  // Combine database entries with mock entries if there are duplicates or missing data
  const combinedEntries = Array.isArray(entries) ? [...entries] : [];
  defaultMockEntries.forEach((mock) => {
    const exists = combinedEntries.some(
      (e) => (e.user?.name || '').toUpperCase() === mock.user.name
    );
    if (!exists) {
      combinedEntries.push({
        id: mock.id,
        distance_km: mock.distance_km,
        elevation_m: mock.elevation_m,
        user: {
          name: mock.user.name,
          city: mock.user.city,
          is_verified: mock.user.is_verified,
        },
      });
    }
  });

  // Dynamically sort based on Distance or Elevation selection
  const sortedEntries = [...combinedEntries].sort((a, b) => {
    if (sortKey === 'distance') {
      return b.distance_km - a.distance_km;
    } else {
      return b.elevation_m - a.elevation_m;
    }
  });

  // Assign ranks
  const rankedEntries = sortedEntries.map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
  }));

  // Separate Top 3 Podium and Table list
  const podiumEntries = rankedEntries.slice(0, 3);
  const tableEntries = rankedEntries.slice(3);

  // Helper to retrieve podium entry by rank
  const getPodiumByRank = (rank) => podiumEntries.find((e) => e.rank === rank);

  const rank1 = getPodiumByRank(1);
  const rank2 = getPodiumByRank(2);
  const rank3 = getPodiumByRank(3);

  // Helper to format values
  const formatNumber = (num) => Number(num).toLocaleString('en-US');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl md:text-5xl font-black uppercase tracking-tighter text-[#1a1d10]">
            LEADERBOARD
          </h1>
        </div>

        {/* Filters and Month selectors */}
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          {/* Month/Year selector */}
          <div className="flex border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <select
              className="px-4 py-2 bg-white text-black font-mono text-[10px] sm:text-xs font-black uppercase border-r-4 border-black outline-none cursor-pointer"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString('id-ID', { month: 'long' })}
                </option>
              ))}
            </select>
            <input
              type="number"
              className="px-4 py-2 bg-white text-black font-mono text-[10px] sm:text-xs font-black outline-none w-20"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            />
          </div>

          {/* Distance vs Elevation Selector */}
          <div className="flex border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <button
              onClick={() => setSortKey('distance')}
              className={`px-4 py-2 border-r-4 border-black font-mono text-[10px] sm:text-xs font-black uppercase transition-colors ${
                sortKey === 'distance' ? 'bg-black text-white' : 'bg-white text-black hover:bg-[#e2e4cf]'
              }`}
            >
              DISTANCE
            </button>
            <button
              onClick={() => setSortKey('elevation')}
              className={`px-4 py-2 font-mono text-[10px] sm:text-xs font-black uppercase transition-colors ${
                sortKey === 'elevation' ? 'bg-black text-white' : 'bg-white text-black hover:bg-[#e2e4cf]'
              }`}
            >
              ELEVATION
            </button>
          </div>
        </div>
      </div>
      <div className="neo-divider" />

      {loading && <Spinner size="lg" />}

      {error && (
        <div className="bg-error-container border-4 border-black p-4 mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-shake">
          <p className="font-mono text-label-md text-on-error-container">{error}</p>
        </div>
      )}

      {/* Top 3 Podium Row */}
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-end justify-center mb-16 max-w-5xl mx-auto">
        {/* Rank 2 - Left */}
        {rank2 && (
          <div className="order-2 md:order-1 w-full md:w-1/3 bg-[#d73b00] border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative flex flex-col text-center">
            <div className="flex justify-between items-center pb-4 border-b-4 border-black">
              <span className="font-display text-3xl sm:text-5xl font-black italic text-black">#2</span>
              <i className="fa-solid fa-fire text-[28px] text-black" />
            </div>
            <div className="py-6">
              <div className="w-20 h-20 border-4 border-black bg-white mx-auto overflow-hidden relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <img src={mockPodiumAvatars[1]} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="mt-6">
                <span className="bg-white border-4 border-black px-3 py-1 font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider inline-block">
                  {(rank2.user?.name || 'RIDER_2').toUpperCase().replace(/\s+/g, '_')}
                </span>
                {rank2.user?.is_verified && (
                  <div className="text-[9px] sm:text-[10px] font-mono font-black mt-2 text-black flex items-center justify-center gap-1">
                    <i className="fa-solid fa-circle-check text-[10px]" />
                    VERIFIED
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left">
              <div className="font-mono text-[8px] sm:text-[9px] font-black text-gray-500 uppercase tracking-widest">
                TOTAL {sortKey === 'distance' ? 'DISTANCE' : 'ELEVATION'}
              </div>
              <div className="font-display text-lg sm:text-2xl font-black tracking-tight text-black mt-1">
                {sortKey === 'distance'
                  ? `${formatNumber(rank2.distance_km)}km`
                  : `${formatNumber(rank2.elevation_m)}m`}
              </div>
            </div>
          </div>
        )}

        {/* Rank 1 - Center Champion */}
        {rank1 && (
          <div className="order-1 md:order-2 w-full md:w-1/3 bg-[#caf300] border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative flex flex-col text-center md:scale-105 md:z-10">
            {/* Champion Badge */}
            <div className="absolute -top-5 -right-3 bg-black text-white border-2 border-black px-3 py-1 text-[8px] sm:text-[10px] font-mono font-black uppercase tracking-widest rotate-12 z-20">
              CHAMPION
            </div>
            <div className="flex justify-between items-center pb-4 border-b-4 border-black">
              <span className="font-display text-4xl sm:text-6xl font-black italic text-black">#1</span>
              <i className="fa-solid fa-trophy text-[32px] text-black" />
            </div>
            <div className="py-6">
              <div className="w-24 h-24 border-4 border-black bg-white mx-auto overflow-hidden relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <img src={mockPodiumAvatars[0]} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="mt-6">
                <span className="bg-white border-4 border-black px-4 py-1.5 font-mono text-xs sm:text-sm font-black uppercase tracking-wider inline-block">
                  {(rank1.user?.name || 'RIDER_1').toUpperCase().replace(/\s+/g, '_')}
                </span>
                <div className="text-[9px] sm:text-[10px] font-mono font-black mt-2 text-[#5f7400] flex items-center justify-center gap-1">
                  <i className="fa-solid fa-circle-check text-[10px]" />
                  PRO VERIFIED
                </div>
              </div>
            </div>
            <div className="bg-black border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left">
              <div className="font-mono text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-widest">
                TOTAL {sortKey === 'distance' ? 'DISTANCE' : 'ELEVATION'}
              </div>
              <div className="font-display text-xl sm:text-3xl font-black tracking-tight text-[#caf300] mt-1">
                {sortKey === 'distance'
                  ? `${formatNumber(rank1.distance_km)}km`
                  : `${formatNumber(rank1.elevation_m)}m`}
              </div>
            </div>
          </div>
        )}

        {/* Rank 3 - Right */}
        {rank3 && (
          <div className="order-3 md:order-3 w-full md:w-1/3 bg-[#7df4ff] border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative flex flex-col text-center">
            <div className="flex justify-between items-center pb-4 border-b-4 border-black">
              <span className="font-display text-3xl sm:text-5xl font-black italic text-black">#3</span>
              <i className="fa-solid fa-bolt text-[28px] text-black" />
            </div>
            <div className="py-6">
              <div className="w-16 h-16 border-4 border-black bg-white mx-auto overflow-hidden relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <img src={mockPodiumAvatars[2]} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="mt-6">
                <span className="bg-white border-4 border-black px-3 py-1 font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider inline-block">
                  {(rank3.user?.name || 'RIDER_3').toUpperCase().replace(/\s+/g, '_')}
                </span>
                {rank3.user?.is_verified && (
                  <div className="text-[9px] sm:text-[10px] font-mono font-black mt-2 text-black flex items-center justify-center gap-1">
                    <i className="fa-solid fa-circle-check text-[10px]" />
                    VERIFIED
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left">
              <div className="font-mono text-[8px] sm:text-[9px] font-black text-gray-500 uppercase tracking-widest">
                TOTAL {sortKey === 'distance' ? 'DISTANCE' : 'ELEVATION'}
              </div>
              <div className="font-display text-lg sm:text-2xl font-black tracking-tight text-black mt-1">
                {sortKey === 'distance'
                  ? `${formatNumber(rank3.distance_km)}km`
                  : `${formatNumber(rank3.elevation_m)}m`}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ranks 4+ Table Layout */}
      {tableEntries.length > 0 && (
        <div className="max-w-5xl mx-auto border-4 border-black overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          {/* Table Header */}
          <div className="flex bg-[#e2e4cf] border-b-4 border-black py-3 px-3 sm:py-4 sm:px-6 font-mono text-[8px] sm:text-[10px] font-black uppercase tracking-wider text-on-surface-variant">
            <div className="w-10 sm:w-16">RANK</div>
            <div className="flex-1">RIDER</div>
            <div className="w-20 sm:w-32 text-right">ELEVATION</div>
            <div className="w-20 sm:w-32 text-right">DISTANCE</div>
          </div>

          {/* Table Body */}
          <div className="bg-white divide-y-4 divide-black">
            {tableEntries.map((entry, idx) => {
              const rank = entry.rank;
              const avatar = mockTableAvatars[idx % mockTableAvatars.length];
              const username = (entry.user?.name || 'RIDER').toUpperCase().replace(/\s+/g, '_');

              return (
                <div key={entry.id || idx} className="flex items-center py-3 px-3 sm:py-4 sm:px-6 bg-white hover:bg-slate-50 transition-colors min-w-0">
                  {/* Rank */}
                  <div className="w-10 sm:w-16 font-display text-lg sm:text-2xl font-black text-black">
                    {rank}
                  </div>

                  {/* Rider info */}
                  <div className="flex-1 flex items-center gap-2 sm:gap-4 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-black bg-white overflow-hidden shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <img src={avatar} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="font-mono text-xs sm:text-sm font-black uppercase tracking-wider text-black truncate">
                      {username}
                    </span>
                  </div>

                  {/* Elevation */}
                  <div className="w-20 sm:w-32 text-right font-mono text-xs sm:text-sm font-black text-black truncate">
                    {formatNumber(entry.elevation_m)}M
                  </div>

                  {/* Distance */}
                  <div className="w-20 sm:w-32 text-right font-mono text-xs sm:text-sm font-black text-black truncate">
                    {formatNumber(entry.distance_km)}KM
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More Button */}
          <div className="bg-black border-t-4 border-black text-center">
            <button className="w-full py-4 text-white hover:text-[#caf300] font-mono text-xs font-black uppercase tracking-widest transition-colors">
              LOAD MORE RANKINGS
            </button>
          </div>
        </div>
      )}

      {!loading && combinedEntries.length === 0 && (
        <div className="text-center py-16 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-5xl mx-auto">
          <p className="text-stroke font-display text-5xl uppercase mb-4">KOSONG</p>
          <p className="font-body text-body-md text-on-surface-variant font-bold">
            Belum ada data submit bulan ini 📊
          </p>
        </div>
      )}
    </div>
  );
}

